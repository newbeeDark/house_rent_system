# 开发团队任务分配与技术指南 (Development Team Guide)

本文档旨在为前端开发人员和后端/数据开发人员分配具体的开发任务、介绍核心页面功能，并详细解析 `AuthContext.tsx` 如何作为前后端权限控制的桥梁。

---

### 文档亮点：
1. 前端开发 A ：专注于业务逻辑（首页、详情、发布房源），明确了页面文件和关键方法。
2. 前端开发 B ：负责用户系统和技术讲解，特别是 深入浅出地解释了 AuthContext 如何通过 fetchProfile 将数据库角色注入到前端状态中 。
3. 后端/数据开发 ：聚焦于 Service 层封装和 RLS 策略，强调了“接口层规范”，即 UI 不直接操作数据库。

## 1. 前端开发 A (Frontend Developer A) - 核心业务与房源管理

### **负责模块**
*   **房源展示 (Listing Display)**
*   **房源发布 (Create Listing)**
*   **详情交互 (Property Details)**

### **页面与功能清单**

| 页面文件 (Page) | 功能描述 (Functionality) | 关键方法 (Key Methods) | 注意事项 (Notes) |
| :--- | :--- | :--- | :--- |
| `src/pages/HomePage.tsx` | 首页房源列表、搜索过滤、排序。 | `useProperties()` (Hook)<br>`haversineKm()` (Geo Utils) | 确保搜索过滤逻辑不仅依赖前端 `filter`，未来大数据量需对接后端 RPC 搜索。 |
| `src/pages/CreateListing.tsx` | 房东/中介发布新房源，上传图片。 | `ListingService.publishFromFiles()`<br>`supabase.storage.upload()` | 只有 `role='landlord' \| 'agent'` 可见。提交前必须校验必填项。 |
| `src/pages/PropertyDetails.tsx` | 单个房源详情、轮播图、举报、收藏。 | `PropertyService.getById(id)`<br>`useProperty(id)` | 需处理 `loading` 和 `error` 状态（如房源不存在）。 |
| `src/components/Property/PropertyCard.tsx` | 复用组件，展示房源卡片。 | `props.property`<br>`props.delay` (Animation) | 组件内部使用了 `useAuth` 来判断是否显示 "Apply" 或 "Edit" 按钮。 |

---

## 2. 前端开发 B (Frontend Developer B) - 用户系统与鉴权讲解

### **负责模块**
*   **用户认证 (Auth & Profile)**
*   **申请管理 (Applications)**
*   **系统诊断 (Diagnostics)**
*   **技术讲解 (Tech Lead Role)**: 负责向团队讲解 `AuthContext` 鉴权机制。

### **页面与功能清单**

| 页面文件 (Page) | 功能描述 (Functionality) | 关键方法 (Key Methods) | 注意事项 (Notes) |
| :--- | :--- | :--- | :--- |
| `src/pages/Login.tsx` | 用户登录，处理错误提示。 | `useAuth().login()` | 登录成功后需根据 Role 重定向到不同 Dashboard（目前统一跳首页）。 |
| `src/pages/Register.tsx` | 用户注册，选择角色 (Student/Landlord)。 | `useAuth().register()` | 注册时需写入 metadata 到 `auth.users`，并确保 Trigger 自动创建 `public.users` 记录。 |
| `src/pages/Profile.tsx` | 查看/编辑个人资料，上传头像。 | `getUserProfile(uid)`<br>`uploadAvatar(file)` | 需确保只能编辑自己的资料 (RLS 限制)。 |
| `src/pages/Diagnostics.tsx` | 系统健康检查，测试数据库连通性。 | `checkSystem()` | 用于排查 Supabase 连接、RLS 权限和延迟问题。 |

### **核心技术讲解: `AuthContext.tsx` 鉴权机制**

> **讲解对象**: 全体开发成员
> **核心文件**: `src/context/AuthContext.tsx`

该文件是前端与 Supabase 后端权限衔接的**心脏**，主要实现了以下逻辑：

1.  **状态同步 (State Sync)**:
    *   **机制**: 使用 `supabase.auth.onAuthStateChange` 监听器。
    *   **作用**: 当用户在 Supabase 端登录/登出/Token过期时，实时更新 React 的 `user` 状态。
    *   **代码位置**: `useEffect` 钩子中 (Line 50-71)。

2.  **角色注入 (Role Injection)**:
    *   **问题**: Supabase 默认的 `auth.user` 对象只有 email 和 id，没有自定义角色信息。
    *   **解决**: `fetchProfile(uid)` 函数 (Line 33) 会在用户登录后，自动去数据库的 `users` (或 `profiles`) 表查询 `role` 字段，并将其合并到前端的 `user` 对象中。
    *   **意义**: 使得前端可以用 `user.role === 'landlord'` 这种简单的方式做权限控制。

3.  **持久化与清理 (Persistence & Cleanup)**:
    *   **登录**: 调用 `supabase.auth.signInWithPassword`，Supabase 客户端自动将 Session 存入 `sessionStorage`。
    *   **登出 (`logout`)**: 不仅调用 `supabase.auth.signOut()` 通知后端，还**强制执行** `localStorage.clear()` 和 `sessionStorage.clear()`，并重定向到登录页，防止缓存导致的权限泄漏 (Line 146-166)。

---

## 3. 后端/数据开发 (Data/Backend Developer) - 接口层与 RLS

### **负责模块**
*   **Supabase 数据库架构**
*   **RLS (Row Level Security) 策略**
*   **API 接口层封装 (Service Layer)**

### **任务与功能清单**

| 文件/模块 (File/Module) | 功能描述 (Functionality) | 关键实现 (Implementation) | RLS 策略重点 (RLS Policies) |
| :--- | :--- | :--- | :--- |
| `src/services/property.service.ts` | 房源数据的 CRUD 接口封装。 | `getAll()`: 关联查询 properties + images + users。<br>`transformRowToProperty()`: 数据清洗与格式化。 | **Read**: `public` (所有人可见)。<br>**Insert/Update**: `auth.uid() = owner_id` (仅房东可操作自己的房源)。 |
| `src/services/listing.service.ts` | 专门处理房源发布逻辑。 | `publishFromFiles()`: 事务性操作（先传图，再插表）。 | **Bucket Policy**: `storage.objects` 需允许认证用户 Upload 图片。 |
| `src/services/profile.service.ts` | 用户档案数据接口。 | `getUserProfile(id)`: 获取任意用户信息。<br>`uploadAvatar()`: 头像上传。 | **Update**: `auth.uid() = id` (仅自己可改自己资料)。 |
| `Database Schema` | 数据库表结构设计与维护。 | `properties`, `users`, `property_images` 等表定义。 | 确保 `owner_id` 外键正确关联到 `auth.users.id`。 |

### **开发建议**
*   **接口层规范**: 所有对 `supabase.from()` 的直接调用都应封装在 `src/services/*.service.ts` 中，前端 UI 组件**不应**直接调用 Supabase SDK（Diagnostics 页面除外）。
*   **RLS 验证**: 每次修改 Policy 后，请务必通知前端开发 B 使用 `Diagnostics` 页面或 `Profile` 页面验证权限是否生效（例如：未登录是否真的无法修改数据）。
