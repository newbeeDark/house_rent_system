## 数据映射层设计

* 前端 → 数据库列映射（properties）

  * `title` → `title`

  * `desc`/`description`（前端字段名为 `description`）→ `description`

  * `price` → `price`

  * `deposit`（前端无：可置 `price` 或 `null`）→ `deposit`

  * `address` → `address`

  * `area` → `area`

  * `propertyType` → `category`（限制：Studio/Apartment/Condo/Terrace/Bungalow/Room）

  * `beds` → `beds`（> 0）

  * `bathroom` → `bathrooms`（≥ 0）

  * `propertySize` → `size_sqm`（> 0）

  * `kitchen` → `kitchen`

  * `furnished` → `furnished`（`full`/`half`/`none`）

  * `availableFrom` → `available_from`

  * `amenities[]` → `amenities[]`

  * `rules[]`（前端暂无）→ `rules[]`（可空）

  * `latitude`/`longitude`（前端暂无）→ `latitude`/`longitude`（可空）

  * 固定/默认：`status='active'`，`views_count=0`，`applications_count=0`

  * 关联：`owner_id = auth.uid()`（由会话确定）

* 图片元数据映射（property\_images）

  * `id`：数据库默认 `gen_random_uuid()`，不在前端提供

  * `property_id`：来自新增 `properties.id`

  * `image_url`：来自 Storage 上传后的公开 URL

  * `is_cover`：首图 `true`，其余 `false`

  * `order_index`：按前端顺序 0..N-1

  * `created_at`：数据库默认 `now()`

* 实现建议

  * 新建 `services/listing.service.ts`：

    * `mapCreateFormToDb(form, userId)` 返回 `properties` 载荷

    * `insertProperty(payload)` 返回 `{ id }`

    * `uploadBase64Images(images, propertyId)` 返回 `[{ url, is_cover, order_index }]`

    * `insertPropertyImages(records)` 批量插入 `property_images`

## 图片处理流程规范

* 接入形式：支持 `<input type="file">` 与 Base64

* Base64流水线

  1. 解析 `data:image/<ext>;base64,<data>` 为 `Uint8Array`
  2. 路径：`property-images/{propertyId}/{uuid}.{ext}`（`crypto.randomUUID()`）
  3. `supabase.storage.from('property-images').upload(path, file)`
  4. `getPublicUrl(path)` 获取永久 URL
  5. 组装 `property_images` 记录：`{ property_id, image_url, is_cover, order_index }`

* 并发处理

  * `Promise.all` 批量上传；若图片数较多，使用简单并发限流（如自实现队列或分批 `chunk`）

  * 首图标记 `is_cover=true`；其余 `false`

## 严格写入流程控制

* Step 1：权限验证

  * 前端：`user?.role ∈ { 'landlord', 'agent' }` 方可提交

  * 后端/RLS：策略校验用户角色与归属；推荐策略：

    * `properties` 插入：`WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('landlord','agent')))`

    * `properties` 更新：同上 `USING/WITH CHECK`

* Step 2：写入主表

  * `supabase.from('properties').insert(payload).select('id').single()`

  * 载荷由映射层生成，包含 `owner_id`

* Step 3：获取房源标识

  * 取返回 `id`（UUID），校验非空

* Step 4：并行图片处理

  * 依据 Base64/文件源上传到 `photos`桶，每个图片不大于6mb

  * 返回 URL 数组与顺序索引

* Step 5：图片元数据记录

  * 批量 `insert` 至 `public.property_images`：`[{ property_id, image_url, is_cover, order_index }]`

  * 本地实际上传项：仅图片文件/数据；`id`/`created_at` 由数据库生成

## 错误处理机制

* 事务与回滚

  * 数据库层：建议使用 Postgres RPC（`rpc.create_listing_with_images`）在单事务中完成 `properties` 与 `property_images` 插入

  * Storage 非事务：采用补偿策略

    * 若数据库写入失败：删除已上传的存储文件（`storage.remove([...paths])`）

    * 若图片记录插入失败：同样回滚删除对应存储文件

* 错误分层

  * 前端校验错误（必填、范围、类型）→ 直接提示

  * 身份/权限错误（RLS/策略）→ 统一文案：未授权发布

  * 网络/存储错误（上传/URL）→ 重试与失败提示

  * 数据库约束错误（CHECK/NOT NULL）→ 字段级提示与日志

* 日志

  * 前端：结构化日志对象 `{ step, ok, detail }`（参考 `Diagnostics` 页日志风格）

  * 可选：将错误快照写入 `errors` 表，便于审计

## 验证标准

* 单元测试

  * 映射函数针对边界值与合法枚举全面覆盖

* 集成测试

  * 模拟 `landlord/agent` 会话：完整发布流程，断言 `properties` 与 `property_images` 均成功

  * 模拟 `student/guest`：应拒绝写入（RLS 生效）

* 安全测试

  * 尝试伪造 `owner_id`、越权插入；验证策略阻断

## 落地改动点（不立即执行，确认后实施）

* 新增 `services/listing.service.ts`，实现映射、插入与图片上传/记录

* 在 `pages/CreateListing.tsx` 接入服务：

  * 提交时组装载荷 → 写入 `properties` → 上传图片 → 写入 `property_images` → 成功跳转

  * 权限拦截与错误提示

* 配置 Storage 桶 `photos `为公开读（或通过签名 URL），写入需认证

* 数据库策略

  * 启用 RLS：`ALTER TABLE properties ENABLE ROW LEVEL SECURITY;`

  * 插入/更新策略如上；如使用 RPC，则在函数内二次校验角色并在事务中落表

## 时间与交付

* 开发：映射与服务层，图片管道与并发，RLS/策略与联调

* 测试：单元+集成+压力+安全

* 交付：支持 Base64/文件两种上传，具备补偿回滚与完整日志

