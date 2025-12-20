## 推荐结论

* 如果目标是“快速上线用于测试”，优先选 Vercel：上手更快、预览域名生成顺畅、环境变量管理简单。

* 如果更偏好文件化配置与长期静态站点托管，Netlify 也非常合适，功能相当并且对 SPA 的重定向支持优秀。

## 关键差异

* 部署体验：Vercel 的 Git 集成与 Preview 更流畅；Netlify 也有 Preview，但表单、重定向等静态站点特性更强。

* 配置方式：Vercel 常用 `vercel.json`；Netlify 常用 `netlify.toml`，对 SPA 重定向内置语法更直观。

* 函数/边缘：两者均支持无服务器函数与边缘网络；本项目为 Vite SPA + Supabase，不依赖特定平台特性。

* 免费额度：两者免费层均足够测试使用；若需大量构建/带宽，后续再考虑升级方案。

## 部署前置：修复构建错误

* 修复 TypeScript 构建错误，确保 `npm run build` 通过：

  * `src/pages/Applications.tsx`：`propertyId` 改为 `string` 类型，消除类型不匹配。

  * `src/components/layout/Navbar.tsx:108-111`：当前调用 `login('guest')` 与签名不符（需要 `{ email, password }`）。测试阶段建议移除“Guest”按钮或改为正确登录表单调用。

  * `src/pages/Profile.tsx`：移除或注释未使用的状态（`prefs`、`privacy`、`address`、`docs`、`avatarUrl`、`toast`、`showDeleteModal` 等），同步清理引用处，保证编译通过。

* 校验 `.env`：确保 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY` 已在平台环境变量中配置；代码里通过 `import.meta.env` 读取。

## 方案 A：部署到 Vercel（推荐用于快速测试）

1. 配置 SPA 重写：在项目根添加 `vercel.json`，内容为将所有路径重写到 `index.html`。
2. 构建与输出：构建命令 `npm run build`，输出目录 `dist`（Vite 默认）。
3. 连接 Git 仓库到 Vercel，设置环境变量：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`。
4. 首次部署：触发构建后自动生成 Preview URL；验证页面路由与 Supabase 读写。
5. 如需生产域名：点击 Promote 或设置域名别名即可。

## 方案 B：部署到 Netlify（同样适合测试）

1. 配置 `netlify.toml`：

   * `build.command = "npm run build"`，`build.publish = "dist"`

   * `[[redirects]] from = "/*" to = "/index.html" status = 200`（SPA 重定向）
2. 连接 Git 仓库到 Netlify，设置环境变量：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`。
3. 首次部署：构建完成后获得 Preview/生产站点 URL；验证路由与 Supabase。

## 验证要点

* 路由：直接访问深链（如 `/applications`、`/profile`）是否正常渲染（SPA 重定向生效）。

* 登录：使用真实邮箱密码登录；确认 AuthContext 正常处理会话。

* 数据：Home/Favorites/Applications 与 Profile 页面能读取 Supabase 数据；网络失败提示是否友好。

## 我将为你执行的具体步骤

1. 修复并通过构建（按以上错误点逐一改动并验证）。
2. 添加对应平台的配置文件（Vercel 或 Netlify）并设置环境变量读取。
3. 触发构建并提供可访问的预览链接，用于测试验证。
4. 完成基础验证清单，反馈测试结果与后续优化建议。

## 确认

* 请选择目标平台：Vercel

  <br />

