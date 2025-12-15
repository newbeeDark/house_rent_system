#### 第一步：重构 AuthContext (核心逻辑)

这个 Prompt 重点在于实现 `useRef` 防抖和返回值化，同时加上**并发锁**。

**复制给 AI：**

> **角色：** React 架构师 **任务：** 重构 `src/context/AuthContext.tsx`，解决重复渲染和并发问题。
>
> **核心修改逻辑：**
>
> 1. **引入 Refs 解决双重触发：**
>    * 使用 `lastUidRef` (useRef) 记录上一次处理的 User ID。
>    * 在 `useEffect` 初始化 `getSession` 和 `onAuthStateChange` 中，只有当 `currentSession.user.id !== lastUidRef.current` 时，才执行 `fetchProfile` 并更新状态。
>    * 对于 `TOKEN_REFRESHED` 事件，直接忽略数据拉取。
> 2. **改造 Login 方法签名：**
>    * 将 `login` 改为返回 `Promise<{ success: boolean; error?: string }>`。
>    * **内部不再 throw error**，而是捕获错误并返回 `{ success: false, error: msg }`。
>    * **并发保护：** 如果 `loading` 已经是 true，直接返回 `{ success: false, error: 'Already processing' }`。
> 3. **Loading 策略：**
>    * `onAuthStateChange` 触发的后台更新**不应该**设置全局 `loading` 为 true（避免页面闪烁）。
>    * 只有 `login`, `register`, 和 `初始化时的第一次 fetch` 会设置 `loading`。
> 4. **fetchProfile 优化：**
>    * 如果当前 Context 的 `user` 数据已经和要拉取的数据 ID 一致，跳过 `setUser` 操作（React 浅比较优化）。
>
> **输出要求：** 请给出完整的 `AuthContext.tsx` 代码，确保类型定义匹配。

#### 第二步：适配 Login 页面 (适配返回值)

这个 Prompt 重点在于移除 `try/catch`，改用 `if (res.success)` 判断，修复“无法使用”的报错。

**复制给 AI：**

> **角色：** React 前端专家 **任务：** 修改 `src/pages/Login.tsx` 以适配新的 AuthContext。
>
> **上下文：** `login` 方法不再抛出异常，而是返回对象 `{ success: boolean; error?: string }`。
>
> **修改** **`handleSubmit`** **逻辑：**
>
> 1. **移除 try/catch 块：** 因为 `login` 不再 throw，不需要 catch。
> 2. **调用逻辑：**
>
>    TypeScript
>    ```
>    // 伪代码参考
>    setLoading(true);
>    const res = await login({ email: email.trim(), password });
>    if (res.success) {
>        setMsg({ text: 'Signed in successfully...', error: false });
>        // 保留原本的 3D 动画和 setTimeout(700ms) 跳转逻辑
>        // 700ms 的延迟正好等待 Context 里的 User 数据同步完毕
>    } else {
>        setMsg({ text: res.error || 'Login failed', error: true });
>    }
>    setLoading(false); // 确保最后复位
>
>    ```
> 3. **UI 保持：** 绝对不要改动 CSS、动画代码和 JSX 结构。
>
> **输出要求：** 只输出修改后的 `handleSubmit` 函数。

