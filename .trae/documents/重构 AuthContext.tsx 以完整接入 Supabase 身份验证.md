## 目标与范围
- 以 Supabase 会话为单一事实源，替换本地 Mock 实现。
- 支持登录、注册、登出、会话监听与用户资料加载，具备错误与加载态管理。

## 状态模型与类型设计
- AuthUser: `{ id: string; email: string; full_name: string; role: 'student'|'landlord'|'agent'|'admin'|'tenant'|'guest'; avatar_url?: string|null }`
- AuthState: `{ session: Session|null; user: AuthUser|null; isAuthenticated: boolean; loading: boolean; error?: string|null }`
- AuthContextType:
  - `state: AuthState`
  - `login(params: { email: string; password: string }): Promise<void>`
  - `register(params: { email: string; password: string; full_name: string; role: AuthUser['role'] }): Promise<void>`
  - `logout(): Promise<void>`
  - `refreshProfile(): Promise<void>`

## 初始化与监听
- 初始化：`useEffect` 内调用 `supabase.auth.getSession()` 取得当前会话；根据 `session?.user?.id` 触发 `refreshProfile()`；设置 `state`。
- 监听：`const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {...})`
  - 处理 `SIGNED_IN`：设置 `session` 与 `isAuthenticated`，拉取 `user` 资料
  - 处理 `SIGNED_OUT`：清空 `session/user`，`isAuthenticated=false`
  - 处理 `USER_UPDATED`：重新拉取 `user` 资料
- 清理：`return () => sub.subscription.unsubscribe()`

## 用户资料拉取策略（public.users）
- `refreshProfile()`：
  1. 读取 `supabase.auth.getUser()` 取 `uid/email`
  2. 查询 `public.users`：`select('role,full_name,avatar_url').eq('id', uid).maybeSingle()`
  3. 若为空或报错，回退 `public.profiles` 同字段映射
  4. 若触发器延迟：指数退避重试（如 3 次，间隔 300ms/600ms/1200ms）
  5. 成功后合成 `AuthUser` 并更新 `state.user`

## 导出方法实现
- `login({ email, password })`：
  - 调用 `supabase.auth.signInWithPassword({ email, password })`
  - 成功：`state.session` 由监听器更新；本方法设置 `loading=false`
  - 失败：填充 `state.error`
- `register({ email, password, full_name, role })`：
  - 调用 `supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })`
  - 成功：若 `data.session` 存在，监听器会更新；若需邮箱确认，设置提示信息
  - 失败：根据错误内容映射（重复邮箱/弱密码/未确认邮箱）并填入 `state.error`
- `logout()`：`await supabase.auth.signOut()`；监听器将清空状态
- `refreshProfile()`：如上策略并维护 `loading`

## 错误处理与加载态
- `state.loading`：在每次 API 调用与初始化/监听回调内准确维护
- `state.error`：统一错误文案映射：
  - 重复邮箱：`Email already registered.`
  - 弱密码：`Password is too weak.`
  - 未确认邮箱：`Please confirm your email before signing in.`
  - 其他返回 `error.message`
- 保证不在加载态时重复刷新，避免闪烁

## 性能与清理
- 仅在 `uid` 变化或 `event` 为 `SIGNED_IN|USER_UPDATED` 时刷新资料
- 监听器在组件卸载时注销
- 使用浅比较避免不必要的 `setState`

## 单元测试计划（Vitest/RTL）
- `AuthContext.test.tsx`：
  - 模拟 `getSession` 返回值：无会话/有效会话，验证初始 `state`
  - 模拟 `onAuthStateChange` 三种事件，验证 `state` 更新
  - `login/register/logout`：mock Supabase 客户端响应，验证错误/成功路径与 `state` 变更
  - `refreshProfile`：测试 `public.users` 命中、`public.profiles` 回退与重试逻辑

## 兼容性与替换说明
- 保持 Context Provider 外部接口兼容：`useAuth()` 使用不需要改动
- 现有页面（Login/Register/Profile）依赖的 `AuthProvider` 不会破坏；登录/注册行为通过监听器驱动全局 `user` 更新

## 交付物
- 更新 `src/context/AuthContext.tsx`（类型、状态、方法与监听）
- 新增测试文件 `src/context/__tests__/AuthContext.test.tsx`
- 文档：错误码映射与事件处理说明