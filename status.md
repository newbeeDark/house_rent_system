# 项目开发状态报告（截至：2025-12-20）
本文档从页面、数据架构、接口方法、核心代码与项目状态五个方面，系统性汇总当前实现与待办事项。代码段均已去除敏感信息，并标注来源路径与行号，便于快速定位与复核。已在项目中新增文档 frontend/DEVELOPMENT_STATUS.md 。

## 1. 页面清单与功能说明
### 已完成（或基本可用）
- Home（ / ）
  - 核心功能：房源列表展示、简单/高级搜索、价格区间筛选；支持定位后按与用户距离排序
  - 交互流程：进入页面 → 搜索/筛选 → 列表排序 → 点击卡片进入详情
  - UI/UX：完成度高（含动画与响应式布局）
  - 参考代码： frontend/src/pages/HomePage.tsx:36-101 （筛选与排序逻辑）
- Property Details（ /property/:id ）
  - 核心功能：房源详情、图片轮播、收藏按钮（当前为本地状态）、投诉弹窗与提交提示
  - 交互流程：从列表或收藏进入 → 浏览图集与概览 → 可提交投诉（本地反馈）
  - UI/UX：完成度高（含轮播、标签、弹窗）
- Login（ /login ）
  - 核心功能：邮箱+密码登录，细腻动画与错误提示
  - 交互流程：输入凭据 → 登录 → 成功后重定向首页
  - UI/UX：完成度高
- Register（ /register ）
  - 核心功能：三角色（学生/房东/中介）注册表单，动态字段与上传提示，密码强度提示
  - 交互流程：选择角色 → 填写信息 → 注册 → 2秒后跳转登录
  - UI/UX：完成度高
- Favorites（ /favorites ）
  - 核心功能：我的收藏列表；未登录提示登录
  - 交互流程：登录后拉取收藏 → 跳转房源详情或草拟合同
  - UI/UX：完成度高
- Create Listing（ /create-listing ）
  - 核心功能：房源发布（表单、图片上传与批量插入），失败自动回滚已上传图片
  - 交互流程：房东/中介登录 → 填写表单 → 上传图片 → 发布 → 跳转首页
  - UI/UX：完成度高
- Diagnostics（ /diagnostics ）
  - 核心功能：Supabase 连接与表访问诊断、延迟统计、当前会话信息展示
  - UI/UX：完成度高
- Terms（ /terms ）、Privacy（ /privacy ）
  - 核心功能：静态条款与隐私说明
  - UI/UX：完成度高
- Profile（ /profile ）
  - 核心功能：从 users 表加载档案、头像上传到存储桶、偏好设置与导出（部分为演示）
  - 交互流程：登录 → 自动加载档案 → 编辑并保存（演示）/上传头像
  - UI/UX：完成度较高
### 开发中/占位
- Host Dashboard（ /host-dashboard ）
  - 核心功能：占位页面（标题为“Landlord Dashboard”）
  - UI/UX：未完成（占位）
- Agent Dashboard（ /agent-dashboard ）
  - 核心功能：占位页面（标题为“Agent Dashboard”）
  - UI/UX：未完成（占位）
- Applications（ /applications ）
  - 核心功能：申请列表与详情为本地 Mock；接受/拒绝为前端状态
  - 后续：接入真实数据模型与接口，完善状态流转与通知
  - UI/UX：完成度较高（数据源待接入）
- Messages（ /messages ）
  - 核心功能：系统通知与更新为本地 Mock
  - 后续：接入消息中心数据源、已读状态与分类过滤
  - UI/UX：完成度较高（数据源待接入）
### 路由入口
```
// frontend/src/App.tsx:24-42
<Routes>
  <Route path="/" element=
  {<HomePage />} />
  <Route path="/property/:id" 
  element={<PropertyDetails />} />
  <Route path="/login" element=
  {<Login />} />
  <Route path="/register" element=
  {<Register />} />
  <Route path="/terms" element=
  {<Terms />} />
  <Route path="/privacy" element=
  {<Privacy />} />

  <Route path="/profile" element=
  {<Profile />} />
  <Route path="/applications" 
  element={<Applications />} />
  <Route path="/create-listing" 
  element={<CreateListing />} />

  <Route path="/favorites" element=
  {<Favorites />} />
  <Route path="/contract/:id" 
  element={<ContractReport />} />
  <Route path="/host-dashboard" 
  element={<PlaceholderPage 
  title="Landlord Dashboard" />} />
  <Route path="/agent-dashboard" 
  element={<PlaceholderPage 
  title="Agent Dashboard" />} />
  <Route path="/messages" element=
  {<Messages />} />
  <Route path="/diagnostics" 
  element={<Diagnostics />} />

  <Route path="*" element=
  {<Navigate to="/" />} />
</Routes>
```
## 2. 数据库架构
项目未检测到本地 ORM 迁移（Prisma/TypeORM/Sequelize），当前数据库托管在 Supabase，结构由控制台/SQL 管理；以下根据代码使用与 schema 检查推断。

### 表结构清单与字段定义（基于使用面的结构）
```
-- users（用户档案）
-- 主键：id
-- 约束建议：role 枚举('student',
'landlord','agent'), email 唯一（在 
auth 内部管理）
id                uuid        
primary key
role              text        not 
null
full_name         text        not 
null
avatar_url        text        null
phone             text        null
student_id        text        null
agency_name       text        null
agency_license    text        null
is_verified       boolean     
default false
created_at        timestamptz 
default now()
updated_at        timestamptz 
default now()

-- properties（房源主表）
id                uuid        
primary key
owner_id          uuid        not 
null references users(id)
title             text        not 
null
description       text        null
price             numeric     not 
null
deposit           numeric     null
address           text        null
area              text        null
category          text        null
beds              int         not 
null
bathrooms         int         null
size_sqm          int         null
kitchen           boolean     null
furnished         text        null 
check (furnished in ('full','half',
'none'))
latitude          numeric     null
longitude         numeric     null
amenities         text[]      null
rules             text[]      null
available_from    date        null
rating            numeric     null
views_count       int         
default 0
applications_count int        
default 0
status            text        not 
null default 'active' check (status 
in ('active','rented','delisted'))
created_at        timestamptz 
default now()
updated_at        timestamptz 
default now()

-- property_images（房源图片）
id                uuid        
primary key
property_id       uuid        not 
null references properties(id)
image_url         text        not 
null
is_cover          boolean     
default false
order_index       int         not 
null default 0
created_at        timestamptz 
default now()

-- favorites（收藏）
user_id           uuid        not 
null references users(id)
property_id       uuid        not 
null references properties(id)
created_at        timestamptz 
default now()
-- 复合唯一约束建议：unique(user_id, 
property_id)

-- applications（申请）
id                uuid        
primary key
property_id       uuid        not 
null references properties(id)
applicant_id      uuid        not 
null references users(id)
property_owner_id uuid        not 
null references users(id)
message           text        null
documents         jsonb       null
status            text        not 
null default 'pending' check 
(status in ('pending','accepted',
'rejected'))
created_at        timestamptz 
default now()
updated_at        timestamptz 
default now()

-- complaints（投诉/举报）
id                uuid        
primary key
reporter_id       uuid        not 
null references users(id)
target_type       text        not 
null check (target_type in 
('student','landlord','agent'))
target_id         uuid        not 
null
category          text        not 
null
description       text        not 
null
status            text        not 
null default 'pending'
created_at        timestamptz 
default now()
```
### 表间关系图
![image-20251220122836994](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20251220122836994.png)

### 索引与关键查询优化点
- properties
  - 索引： status （过滤 active）、 created_at （倒序展示）、 owner_id （联查档案）
  - 地理：如需距离排序，建议存储 geography(Point) 并建立 GiST 索引
- property_images
  - 复合索引： (property_id, order_index) （排序与封面查找）
- favorites
  - 唯一： unique(user_id, property_id) ；单列索引： user_id 、 property_id
- users
  - 主键： id ；必要业务字段索引： role （后台列表）
- amenities
  - 若频繁包含/包含所有检索，考虑将数组转规范化关联表或使用 GIN 索引（ text[] →GIN）
- 关键查询
  - 列表： properties 过滤 active 且按 created_at desc ；尽量避免跨表 n+1，当前实现为前端批量拉取 users 后手动合并
## 3. 接口方法清单（按模块）
项目未自建 REST 控制器，数据交互通过 Supabase 客户端完成。下方“HTTP Method”以语义映射（Select/Insert/Delete/Update）标注。

### PropertyService（frontend/src/services/property.service.ts）
- getAll
  - HTTP Method：Select（ properties + 子查询 property_images ；批量 Select users ）
  - 参数：无
  - 返回： Property[] （已合并房东档案与图片）
  - 状态：错误抛出，成功返回数组
- getById(id: string)
  - HTTP Method：Select（按 id 单条；联查 users ）
  - 参数： id （房源 ID）
  - 返回： Property | undefined
- getFavorites(userId: string)
  - HTTP Method：Select（ favorites → 投影 property:properties + property_images ）
  - 参数： userId
  - 返回： Property[]
- addToFavorites(userId: string, propertyId: string)
  - HTTP Method：Insert（ favorites ）
  - 参数： userId , propertyId
  - 返回：无（错误抛出）
- removeFromFavorites(userId: string, propertyId: string)
  - HTTP Method：Delete（ favorites ）
  - 参数： userId , propertyId
  - 返回：无（错误抛出）
- isFavorite(userId: string, propertyId: string)
  - HTTP Method：Select（ favorites 单条）
  - 参数： userId , propertyId
  - 返回： boolean （0 行时以 PGRST116 视为非收藏）
### ListingService（frontend/src/services/listing.service.ts）
- publishFromFiles(form, files, userId)
  - HTTP Method：Mixed（前端转换文件 → 调用 publish ）
  - 参数：房源草稿、文件数组、用户 ID
  - 返回： propertyId: string
- publish(form, photos, userId)
  - HTTP Method：Insert（ properties ）、Upload（ storage.photos ）、Insert（ property_images ）
  - 参数：房源草稿、Base64 图片数组、用户 ID
  - 返回： propertyId: string
  - 失败补偿：若任一上传/插入失败，自动删除已上传的存储路径（“伪事务”）
### AuthContext（frontend/src/context/AuthContext.tsx）
- login({ email, password })
  - HTTP Method：Auth（ signInWithPassword ）
  - 参数：邮箱、密码
  - 返回：无（错误统一处理与提示）
- register(payload)
  - HTTP Method：Auth（ signUp + options.data 写入元数据）
  - 参数：邮箱、密码、角色与扩展字段
  - 返回：无（若无 session 则需邮箱确认）
- logout()
  - HTTP Method：Auth（ signOut ）
  - 行为：清理 React 状态与本地缓存，强制跳转到 /login
### Profile Service（frontend/src/services/profile.service.ts）
- getUserProfile(userId)
  - HTTP Method：Select（ users 单条）
  - 参数：用户 ID
  - 返回： DbUser | null
- uploadAvatar(file)
  - HTTP Method：Upload（ storage.avatars ）并返回 publicUrl
  - 参数：图片文件
  - 返回：头像 URL 或 null
### Diagnostics（frontend/src/pages/Diagnostics.tsx）
- checkSystem()
  - 行为：检测 session、 properties/users/property_images 可访问性、统计延迟并输出状态
## 4. 核心代码段展示（带注释）
### 路由总览
```
// frontend/src/App.tsx:24-42
// 路由集中定义，兜底重定向到首页
<Routes>
  <Route path="/" element=
  {<HomePage />} />
  <Route path="/property/:id" 
  element={<PropertyDetails />} />
  /* ... 省略若干 ... */
  <Route path="/diagnostics" 
  element={<Diagnostics />} />
  <Route path="*" element=
  {<Navigate to="/" />} />
</Routes>
```
### 房源数据合并与字段映射
```
// frontend/src/services/property.
service.ts:87-122,184-244
// getAll：先查 properties+images，再
批量查 users，最后合并到前端 Property 类
型
return props.map((row: any) => {
  const profile = profilesMap[row.
  owner_id];
  return transformRowToProperty
  ({ ...row, profiles: profile });
});

function transformRowToProperty
(row: any): Property {
  // 处理图片（排序、封面选择与回退）
  // 处理房东档案（角色/显示名/联系方式/
  入驻年）
  // 映射核心字段与统计
  return { /* ... 前端展示所需结
  构 ... */ };
}
```
### 房源发布与失败补偿
```
// frontend/src/services/listing.
service.ts:108-129
// 发布流程：插入主记录 → 逐张上传图片并生
成公网地址 → 批量插入图片表
// 若中途失败，移除已上传的存储路径，抛出
统一错误
try {
  for (let i = 0; i < photos.
  length; i++) { /* upload */ }
  await insertPropertyImages
  (records);
  return propertyId;
} catch (err) {
  const paths = uploaded.map(u => u.
  path);
  await removeStoragePaths(paths);
  throw err instanceof Error ? err 
  : new Error('Publish failed');
}
```
### 认证与强制退出
```
// frontend/src/context/AuthContext.
tsx:146-166
// 无论 signOut 成功或失败，均清理状态与
存储，并强制跳转登录
const logout = async () => {
  try { await supabase.auth.signOut
  (); } catch (e) { console.error
  ('Logout warning:', e); }
  setUser(null); localStorage.clear
  (); sessionStorage.clear();
  window.location.href = '/login';
};
```
### 地理距离计算（哈弗辛公式）
```
// frontend/src/utils/geo.ts:1-9
// 根据经纬度计算球面两点距离（km），用于 
HomePage 距离排序
export function haversineKm(lat1: 
number, lon1: number, lat2: number, 
lon2: number): number {
  const toRad = (v: number) => v * 
  Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1), 
  dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + 
  Math.cos(toRad(lat1))*Math.cos
  (toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt
  (a), Math.sqrt(1 - a));
  return R * c;
}
```
### 诊断与表访问检查
```
// frontend/src/pages/Diagnostics.
tsx:29-55
// 逐表尝试 select count 单条，记录可访
问性与错误消息
const { error: propError } = await 
supabase.from('properties').select
('count').limit(1).single();
/* users / property_images 同理，统
计 latency 并输出状态 */
```
### 注意事项（代码段）
- frontend/src/lib/supabase.ts:8-13 当前包含对 URL/Key 的 console.log 与 warn ，请在生产环境禁用日志，避免泄露敏感信息
- PropertyDetails 收藏按钮为本地 UI 状态，未与 favorites 表交互；可接入 PropertyService.add/remove/isFavorite
- Profile 页的多处保存动作为演示行为（未持久化），后续需接口化
## 5. 项目状态总结
### 完成度（粗略估算）
- 功能完成比例：约 75%（核心浏览、详情、发布、收藏与诊断已就绪；消息/申请/仪表盘待接入真实数据）
### 当前阻塞与待解决
- 数据源接入
  - Applications 与 Messages 仍为前端 Mock，需设计并接入真实表结构与查询
- 存储桶一致性
  - 头像上传使用 avatars 桶，需保证已创建并为公共可读；或统一改为既有的 photos 桶
- RLS（行级安全）策略
  - Supabase 需针对 favorites/properties/property_images/users 配置合理的 RLS，确保只读/只写权限与越权防护
- 统一档案来源
  - 代码中存在对 profiles 表的兜底查询与 users 表的主查询，需统一数据来源与迁移策略
### 下一步开发计划
- 接口层
  - 补充 Applications/Complaints/Messages 的读写接口与状态流转；为收藏按钮接入真实 CRUD
- 数据库与性能
  - 建立建议索引与约束（见第 2 节），优化热门列表查询；如需强化距离排序，考虑地理专用类型与索引
- UI/UX
  - 完成 Host/Agent Dashboard 的真实卡片、统计与操作；增强 PropertyDetails 的分享、联系与申请入口
- 安全与合规
  - 清理调试日志、校验上传类型与大小、补充敏感字段的脱敏与后端校验
### 已知待优化项与技术债务
- 日志与配置
  - 禁用 supabase.ts 中的密钥输出
- 数据一致性
  - 统一 users/profiles 的使用面，并清除冗余代码路径
- 事务与回滚
  - ListingService 的存储回滚已实现，但主记录与图片插入之间仍非强事务；后端可用 RPC/Edge Functions 提升一致性
- 类型与校验
  - 前端 types 与数据库字段存在枚举/可空的差异，建议以 Zod/TypeScript 强化边界校验与转换
  —

如需将本报告集成到站点或持续更新，可在 CI/CD 流程中自动生成“接口快照”与“Schema 检查报告”，并结合 Diagnostics 页面进行时序对比与告警。