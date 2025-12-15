**目标文件**：`e:\3404_Front_End_First_Ver\Project Code\frontend\src\pages\Profile.tsx` **关联表**：`public.users` (替换原 public.profiles) **文件内字段定位**：

* `fullName` -> `Profile.tsx:17`
* `displayName` -> `Profile.tsx:18`
* `email` -> `Profile.tsx:19`
* `phone` -> `Profile.tsx:20`
* `role` -> `Profile.tsx:21`
* `prefs` -> `Profile.tsx:24` (待移除/本地化)
* `privacy` -> `Profile.tsx:25` (待移除/本地化)
* `address` -> `Profile.tsx:28` (待移除 -> 移至房源)
* `docs` -> `Profile.tsx:32` (逻辑变更 -> 独立组件/表)
* `avatar` -> `Profile.tsx:35`
* `pwd` -> `Profile.tsx:38` (待移除 -> Auth 管理)

***

### **差异报告 (更新版)**

#### **1. 文件存在但数据库不存在（多余/需移除字段）**

* **`displayName`**：DB 无此列。
  * *决策*：**移除**。业务统一使用 `full_name`。
* **`prefs`** **/** **`privacy`**：DB 无此列。
  * *决策*：**仅前端保留**或暂存 localStorage，不写入 `users` 表。
* **`address`**：`users` 表无此列。
  * *决策*：**移除**。地址是房源 (`properties`) 的属性，不属于个人资料。
* **`docs`**：`users` 表无直接列。
  * *决策*：**逻辑重构**。改为上传至 Storage 并记录到 `public.uploaded_files` 表，UI 上改为独立的“文件列表”区域，而非表单字段。
* **`pwd`** **(密码)**：`users` 表无此列，严禁存储明文。
  * *决策*：**彻底移除**。修改密码需调用 `supabase.auth.resetPasswordForEmail()` 独立流程。
* **`avatar`** **(base64)**：DB 期望 `avatar_url` (text)。
  * *决策*：**类型变更**。前端改为上传文件 -> 获取 URL -> 存入 `avatar_url`。

#### **2. 数据库存在但文件未定义（缺失/需映射字段）**

* **`email`**：`public.users` 现已包含此列 (同步自 Auth)。
  * *决策*：**只读展示**。前端应显示该字段，但禁止编辑 (disable)。
* **`student_id`**：`users` 表新增。
  * *决策*：**条件渲染**。当 `role === 'student'` 时显示并必填。
* **`agency_name`** **/** **`agency_license`**：`users` 表新增。
  * *决策*：**条件渲染**。当 `role` 为 `agent` 或 `landlord` 时显示并必填。
* **`is_verified`**：`users` 表新增。
  * *决策*：**只读展示**。显示用户认证状态徽章。
* **`uploadfile_id`**：`users` 表新增。
  * *决策*：**后台关联**。用于关联主要的认证文件（如身份证/执照）。

#### **3. 属性不一致（类型/约束）**

* **`fullName`** ↔ **`full_name`**：
  * DB 约束 `not null`。前端需添加 `required` 校验。
* **`role`**：
  * UI 范围：`student` | `landlord` | `agent`。
  * DB 范围：`admin` | `landlord` | `agent` | `tenant` | `student` | `guest`。
  * *决策*：前端 Dropdown 保持现有选项，但在 Service 层提交时需确保值在 DB 允许范围内。

***

### **修改建议与实施步骤**

#### **Step 1: 更新服务层 (`src/services/profile.service.ts`)**

* **目标表变更**：从 `profiles` 改为查询/更新 `public.users`。
* **读取逻辑**：
  * 读取 `public.users`，字段映射：`full_name` -> `fullName`，`avatar_url` -> `avatar`。
  * 读取 `role` 对应的特定字段 (`student_id` 等)。
* **保存逻辑**：
  * 构造 Payload：

    TypeScript
    ```
    {
      full_name: formData.fullName,
      phone: formData.phone,
      // 根据角色动态写入额外字段
      student_id: formData.role === 'student' ? formData.studentId : null,
      agency_name: isAgent ? formData.agencyName : null,
      agency_license: isAgent ? formData.agencyLicense : null
    }

    ```
  * **禁止提交**：`email` (只读), `pwd` (非法), `address` (非法)。

#### **Step 2: 重构 UI (`Profile.tsx`)**

1. **清理表单**：
   * 删除 `Password` 输入框及相关 State。
   * 删除 `Address` 输入框。
   * 删除 `Privacy/Prefs` 设置区（或隐藏）。
2. **增强表单**：
   * 将 `Email` 设为 `disabled` (数据源自 Auth)。
   * **动态表单项**：
     * IF `role == 'student'`: 显示 `Student ID` 输入框。
     * IF `role == 'agent'/'landlord'`: 显示 `Agency Name`, `License No` 输入框。
3. **头像处理**：
   * 修改 `<input type="file">` 逻辑：选择图片 -> 上传 Storage -> 拿到 URL -> 更新 State -> 提交 URL 到 DB。

#### **Step 3: 验证**

* **查看**：新用户注册后，`public.users` 是否自动生成了记录（通过 Trigger）？
* **更新**：在前端修改 `Full Name` 和 `Phone`，DB 是否更新成功？
* **角色测试**：切换角色为 `Student` 并填写 ID，DB 的 `student_id` 列是否有值？

***

### **待确认项（已由专家决策）**

* \[x] **displayName 入库？** -> **否**，使用 `full_name`。
* \[x] **密码框保留？** -> **否**，彻底删除。
* \[x] **地址信息保留？** -> **否**，移至房源发布页。
* \[x] **学生/中介信息必填？** -> **前端校验必填**，DB允许为空。

