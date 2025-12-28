# UKM 租房系统测试方案 (Test Plan)

## 1. 测试概述
本方案旨在验证 UKM 租房系统的前后端集成情况，重点关注 Supabase 数据库连接性能、RLS (行级安全) 权限控制、前端页面路由逻辑以及核心业务流程（发布房源）的可用性。

---

## 2. 数据库层测试 (Database Layer)

### 2.1 连通性与延迟测试
*   **测试目标**: 验证前端能否成功连接 Supabase，并评估请求响应速度。
*   **测试方法**: 使用项目内置的 `/diagnostics` 页面。
*   **合格标准**:
    *   Status 显示 "Connected"。
    *   Latency (延迟) < 500ms (优) / < 1000ms (良)。

### 2.2 表访问权限 (Table Access)
*   **测试目标**: 验证关键数据表是否可读。
*   **测试范围**:
    *   `properties`: 房源主表。
    *   `users` / `profiles`: 用户信息表。
    *   `property_images`: 图片关联表。
*   **验证方式**: 通过诊断页面自动查询各表 1 条数据，无报错即为通过。

### 2.3 用户权限测试 (RLS - Row Level Security)
*   **测试场景**:
    1.  **未登录用户**: 只能读取 `status = 'active'` 的房源，**不可**写入任何数据。
    2.  **登录用户 (任意角色)**: 可以读取所有公开数据。
    3.  **数据写入**: 只有通过认证的用户才能插入数据到 `properties` 表（需后端 Policy 支持）。

---

## 3. 前端页面与功能测试 (Frontend & Functional)

### 3.1 页面导航 (Navigation)
*   **测试用例**:
    *   [ ] Home -> Property Details: 点击房源卡片，URL 变为 `/property/:id`，页面不白屏。
    *   [ ] Login -> Register: 登录页点击 "Sign up" 能跳转。
    *   [ ] Navbar -> Profile: 登录后点击头像能进入个人中心。

### 3.2 角色访问控制 (RBAC - Create Listing)
*   **测试目标**: 验证只有 Landlord/Agent 可以访问发布页面。
*   **测试步骤**:
    1.  **作为 Student 登录**:
        *   访问 `http://localhost:5173/create-listing`。
        *   **预期结果**: 弹出警告 "Only landlords... can publish" 或自动跳转回首页。
    2.  **作为 Landlord 登录**:
        *   访问 `http://localhost:5173/create-listing`。
        *   **预期结果**: 正常显示表单页面。

### 3.3 状态保持测试
*   **测试场景**: 刷新页面。
*   **预期结果**: 登录状态不丢失（依赖 `sessionStorage`，当前标签页刷新应保持登录）。

---

## 4. 端到端流程验证 (E2E) - 添加测试数据

### 4.1 测试数据准备 (Test Data)
请使用以下数据进行“新建房源”测试，以证明前端可用性：

*   **Title**: `[TEST] Luxury Condo near UKM`
*   **Price**: `1200`
*   **Address**: `Jalan Reko, Kajang`
*   **Beds**: `3`
*   **Bathrooms**: `2`
*   **Description**: `This is a test listing to verify database insertion.`
*   **Images**: 上传任意一张本地图片。

### 4.2 执行步骤
1.  登录一个 **Landlord** 账号（如没有，先注册一个）。
2.  进入 `/create-listing` 页面。
3.  填入上述测试数据。
4.  点击 **"Publish Listing"**。
5.  **验证**:
    *   页面应跳转回首页 (`/?new=true`)。
    *   首页列表中应出现标题为 `[TEST] Luxury Condo near UKM` 的房源。
    *   点击该房源，能进入详情页看到刚才填写的详细信息。

---

## 5. 异常处理测试
*   **数据库断连**: 暂时断开网络，刷新页面，应显示友好的 Error 提示或 Loading 状态，而不是页面崩溃。![image-20251217054953066](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20251217054953066.png)
