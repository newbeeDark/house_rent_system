<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>USSR — Register</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n    /* 完全沿用第一个页面的主题变量 */\n    :root{\n      --bg:#f6f8fb;\n      --card-bg: rgba(255,255,255,0.88);\n      --accent: #1e88ff;\n      --accent-2: #0b3d91;\n      --ink: #071028;\n      --muted: #6a7480;\n      --danger:#ff6b6b;\n      --success:#20c997;\n      --radius:14px;\n      --shadow-lg: 0 18px 40px rgba(7,12,25,0.12);\n      --ease: cubic-bezier(.2,.9,.2,1);\n      --max-file-size: 3MB;\n    }\n\n    /* ========= 全局背景：图片 + 可调遮罩 =========\n       使用两层背景：第一层是半透明白色遮罩（保证可读性），第二层是图片（cover）\n       若要更暗或更淡，修改 rgba() 中的 alpha 值（0.72）即可 */\n    html,body{\n      height:100%;\n      margin:0;\n      font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial;\n      color:var(--ink);\n      /* 1) 半透明白色遮罩 -> 2) 背景图片 */\n      background:\n        linear-gradient( rgba(255,255,255,0.72), rgba(255,255,255,0.72) ),\n        url("real-estate-9539531_1920.jpg") center/cover no-repeat fixed;\n      display:flex;\n      align-items:center;\n      justify-content:center;\n      padding:26px;\n      -webkit-font-smoothing:antialiased;\n      -moz-osx-font-smoothing:grayscale;\n    }\n\n    /* 简化背景装饰，保持风格统一 */\n    .bg-blob{\n      position:fixed;\n      width:38vmax;\n      height:38vmax;\n      filter:blur(60px);\n      border-radius:50%;\n      z-index:0;\n      mix-blend-mode:screen;\n      animation:blob-anim 14s infinite alternate\n    }\n    .blob-a{\n      left:-10%;\n      top:-6%;\n      background:radial-gradient(circle at 25% 25%,var(--accent),transparent 40%);\n      opacity:.9\n    }\n    .blob-b{\n      right:-12%;\n      bottom:-12%;\n      background:radial-gradient(circle at 75% 75%,var(--accent-2),transparent 40%);\n      animation-duration:18s;\n      opacity:.85\n    }\n    @keyframes blob-anim{\n      to{transform:translate(6%,8%) rotate(12deg) scale(1.06)}\n    }\n\n    /* 卡片样式完全对齐第一个页面 */\n    .card{\n      position:relative;\n      z-index:2;\n      width:640px;\n      max-width:96vw;\n      border-radius:calc(var(--radius)+6px);\n      background:linear-gradient(180deg,rgba(255,255,255,0.75), rgba(255,255,255,0.6)); /* 玻璃态渐变 */\n      backdrop-filter:blur(8px);\n      -webkit-backdrop-filter:blur(8px);\n      box-shadow:var(--shadow-lg);\n      padding:22px 28px;\n      transform:translateY(6px);\n      transition:transform 480ms var(--ease),box-shadow 320ms var(--ease);\n      opacity:0;\n      animation:pageIn 420ms var(--ease) forwards;\n    }\n    \n    @keyframes pageIn { \n      to { opacity:1; transform:none } \n    }\n\n    .card:hover{\n      transform:translateY(0);\n      box-shadow:0 26px 68px rgba(7,12,25,0.15);\n    }\n\n    .header{\n      display:flex;\n      gap:14px;\n      align-items:center;\n      margin-bottom:12px\n    }\n    \n    /* Logo样式对齐第一个页面 */\n    .logo { \n      width:52px;\n      height:44px;\n      border-radius:10px;\n      background:linear-gradient(135deg,var(--accent),var(--accent-2)); /* 主色渐变 */\n      display:grid;\n      place-items:center;\n      color:white;\n      font-weight:700;\n      font-size:18px;\n      box-shadow:0 8px 22px rgba(14,54,120,0.12);\n      animation:float 5.5s ease-in-out infinite \n    }\n    \n    @keyframes float{\n      0%{transform:translateY(0)}\n      50%{transform:translateY(-6px)}\n      100%{transform:translateY(0)}\n    }\n    \n    .title h1{\n      margin:0;\n      font-size:20px;\n      color:var(--ink);\n    } \n    \n    .title p{\n      margin:0;\n      color:var(--muted);\n      font-size:13px\n    }\n\n    form{\n      display:grid;\n      grid-template-columns:1fr 1fr;\n      gap:12px 14px\n    }\n    \n    .full{\n      grid-column:1/-1\n    }\n    \n    /* 输入框样式对齐 */\n    .field{\n      background:white;\n      padding:10px;\n      border-radius:10px;\n      box-shadow:0 6px 18px rgba(8,12,24,0.06);\n      border:1px solid rgba(10,18,30,0.06);\n      transition:transform 220ms var(--ease),box-shadow 220ms var(--ease)\n    }\n    \n    .field:focus-within{\n      transform:translateY(-4px);\n      box-shadow:0 12px 32px rgba(8,12,24,0.08);\n      border:1px solid rgba(30,136,255,0.24)\n    }\n    \n    label{\n      display:flex;\n      justify-content:space-between;\n      align-items:center;\n      font-size:12px;\n      color:var(--muted);\n      margin-bottom:6px\n    }\n    \n    input[type="text"],\n    input[type="email"],\n    input[type="password"],\n    select{\n      border:0;\n      background:transparent;\n      outline:0;\n      font-size:15px;\n      color:var(--ink);\n      padding:6px 2px;\n      width:100%\n    }\n    \n    input::placeholder{\n      color:var(--muted);\n      opacity:0.7;\n    }\n\n    /* 角色选择样式调整 */\n    .role-group{\n      display:flex;\n      gap:8px;\n      align-items:center\n    }\n    \n    .pill{\n      padding:8px 12px;\n      border-radius:999px;\n      background:rgba(7,16,38,0.04);\n      cursor:pointer;\n      font-weight:600;\n      color:var(--muted);\n      transition:all 200ms var(--ease)\n    }\n    \n    .pill.active{\n      background:linear-gradient(90deg,var(--accent),var(--accent-2)); /* 主色渐变 */\n      color:#fff;\n      box-shadow:0 10px 28px rgba(14,54,120,0.12)\n    }\n\n    /* 文件上传区域样式调整 */\n    .file-row{\n      display:flex;\n      align-items:center;\n      gap:12px;\n      flex-wrap:wrap\n    }\n    \n    .avatar-preview{\n      width:96px;\n      height:68px;\n      border-radius:10px; /* 统一圆角 */\n      background:linear-gradient(180deg,#eef3fb,#fff); /* 沿用背景渐变 */\n      display:grid;\n      place-items:center;\n      border:1px dashed rgba(10,18,30,0.06);\n      overflow:hidden;\n      font-size:12px;\n      color:var(--muted);\n      padding:6px\n    }\n    \n    .file-btn{\n      padding:8px 12px;\n      border-radius:10px; /* 统一圆角 */\n      border:0;\n      background:transparent;\n      border:1px solid rgba(12,20,40,0.06);\n      color:var(--accent-2);\n      cursor:pointer;\n      transition:transform 160ms var(--ease), box-shadow 160ms var(--ease)\n    }\n    \n    .file-btn:hover{\n      transform:translateY(-2px);\n      box-shadow:0 8px 20px rgba(8,12,24,0.06);\n    }\n    \n    .file-name{\n      font-size:13px;\n      color:var(--muted)\n    }\n\n    /* 密码强度条样式调整 */\n    .pw-meter{\n      height:8px;\n      border-radius:8px;\n      background:rgba(7,16,38,0.05);\n      overflow:hidden;\n      margin-top:6px\n    }\n    \n    .pw-meter > i{\n      display:block;\n      height:100%;\n      width:0%;\n      background:linear-gradient(90deg,var(--accent),var(--accent-2)); /* 主色渐变 */\n      transition:width 320ms var(--ease)\n    }\n\n    /* 提交按钮样式对齐 */\n    .actions{\n      grid-column:1/-1;\n      display:flex;\n      flex-direction:column;\n      gap:10px;\n      margin-top:8px\n    }\n    \n    .btn{\n      padding:12px 14px;\n      border-radius:10px; /* 统一圆角 */\n      border:0;\n      background:linear-gradient(90deg,var(--accent),var(--accent-2)); /* 主色渐变 */\n      color:white;\n      font-weight:700;\n      font-size:16px;\n      cursor:pointer;\n      box-shadow:0 10px 28px rgba(14,54,120,0.12);\n      transition:transform 160ms var(--ease)\n    }\n    \n    .btn:hover{\n      transform:translateY(-2px)\n    }\n    \n    .btn:active{\n      transform:translateY(2px)\n    }\n    \n    .alt{\n      font-size:13px;\n      color:var(--muted);\n      text-align:center\n    }\n\n    .note{\n      font-size:13px;\n      color:var(--muted);\n      margin-top:6px;\n      text-align:center\n    }\n    \n    .msg{\n      display:none;\n      padding:10px;\n      border-radius:10px; /* 统一圆角 */\n      font-size:13px\n    }\n    \n    .msg.show{\n      display:block\n    }\n\n    /* 模态框样式对齐 */\n    .modal-backdrop{\n      position:fixed;\n      inset:0;\n      background:rgba(6,10,20,0.36);\n      display:none;\n      align-items:center;\n      justify-content:center;\n      z-index:40\n    }\n    \n    .modal{\n      width:min(720px,92vw);\n      background:white;\n      border-radius:var(--radius); /* 统一圆角 */\n      padding:18px;\n      box-shadow:0 30px 80px rgba(2,6,23,0.28);\n      backdrop-filter:blur(8px);\n      -webkit-backdrop-filter:blur(8px);\n    }\n    \n    .modal h3{\n      margin-top:0;\n      color:var(--ink);\n    }\n    \n    .modal .modal-body{\n      max-height:60vh;\n      overflow:auto;\n      color:var(--ink);\n    }\n    \n    .modal .modal-actions{\n      display:flex;\n      justify-content:flex-end;\n      gap:10px;\n      margin-top:12px\n    }\n\n    /* 辅助样式 */\n    .hint{\n      font-size:13px;\n      color:var(--muted)\n    }\n    \n    .hidden{\n      display:none\n    }\n\n    /* 响应式样式保持 */\n    @media (max-width:720px){ \n      form{grid-template-columns:1fr} \n      .card{padding:18px} \n      .logo{width:48px;height:40px} \n      .avatar-preview{width:80px;height:56px} \n    }\n  '
    }}
  />
  <div className="bg-blob blob-a" aria-hidden="true" />
  <div className="bg-blob blob-b" aria-hidden="true" />
  <main className="card" role="main" aria-labelledby="register-title">
    <div className="header">
      <div className="logo">US</div>
      <div className="title">
        <h1 id="register-title">Create account</h1>
        <p>Register as Student, Landlord or Agent to start using USSR</p>
      </div>
    </div>
    <form id="regForm" noValidate="">
      {/* 基本信息 */}
      <div className="field full">
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="e.g. Ahmad bin Ali"
          required=""
        />
      </div>
      {/* 角色选择 */}
      <div
        className="field full"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <label>Account role</label>
        <div className="role-group" role="tablist" aria-label="Account role">
          <div
            className="pill active"
            data-role="student"
            role="tab"
            tabIndex={0}
          >
            Student
          </div>
          <div className="pill" data-role="landlord" role="tab" tabIndex={0}>
            Landlord
          </div>
          <div className="pill" data-role="agent" role="tab" tabIndex={0}>
            Agent (中介)
          </div>
        </div>
        <div className="hint">选择后表单会显示该角色特有的字段与上传项</div>
      </div>
      {/* 学号（学生） */}
      <div className="field" id="field-matric">
        <label htmlFor="matric">Matric No. (Student ID)</label>
        <input
          id="matric"
          name="matric"
          type="text"
          placeholder="学号（学生填写）"
        />
      </div>
      {/* agency name（中介） */}
      <div className="field hidden" id="field-agency-name">
        <label htmlFor="agencyName">Agency Name</label>
        <input
          id="agencyName"
          name="agencyName"
          type="text"
          placeholder="中介/Agency 名称"
        />
      </div>
      {/* agency license number（中介） */}
      <div className="field hidden" id="field-agency-license-no">
        <label htmlFor="agencyLicense">Agency License No.</label>
        <input
          id="agencyLicense"
          name="agencyLicense"
          type="text"
          placeholder="执照编号"
        />
      </div>
      {/* business reg（房东） */}
      <div className="field hidden" id="field-business-reg">
        <label htmlFor="businessReg">
          Business / Registration No. (Landlord)
        </label>
        <input
          id="businessReg"
          name="businessReg"
          type="text"
          placeholder="公司注册号或房东身份证明编号"
        />
      </div>
      {/* email（不做域限制） */}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required=""
        />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone (optional)</label>
        <input
          id="phone"
          name="phone"
          type="text"
          placeholder="+60 12 345 6789"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="至少 6 个字符"
          required=""
        />
        <div className="pw-meter" aria-hidden="true">
          <i id="pwBar" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirm password</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          placeholder="重复输入密码"
          required=""
        />
      </div>
      {/* 文件上传区域（按角色显示不同上传控件） */}
      <div className="field full" id="uploads-area">
        <label>Uploads (per role)</label>
        {/* Student uploads */}
        <div id="uploads-student" className="file-row">
          <div className="avatar-preview" id="preview-student">
            Student ID
            <br />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>No file</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              id="file-student"
              type="file"
              accept="image/*,application/pdf"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="file-btn"
              data-target="file-student"
              id="btn-student"
            >
              Upload Student ID
            </button>
            <div className="hint">JPG/PNG/PDF, max 3MB</div>
          </div>
        </div>
        {/* Landlord uploads */}
        <div id="uploads-landlord" className="file-row hidden">
          <div className="avatar-preview" id="preview-landlord">
            Property Doc
            <br />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>No file</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              id="file-landlord"
              type="file"
              accept="image/*,application/pdf"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="file-btn"
              data-target="file-landlord"
              id="btn-landlord"
            >
              Upload Property Proof
            </button>
            <div className="hint">房产证 / 授权书 / PDF, max 3MB</div>
          </div>
        </div>
        {/* Agent uploads */}
        <div
          id="uploads-agent"
          className="file-row hidden"
          style={{ marginTop: 12 }}
        >
          <div className="avatar-preview" id="preview-agent-license">
            Agency License
            <br />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>No file</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              id="file-agent-license"
              type="file"
              accept="image/*,application/pdf"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="file-btn"
              data-target="file-agent-license"
              id="btn-agent-license"
            >
              Upload License
            </button>
            <div className="hint">执照扫描/合同，PDF 或 图片, max 3MB</div>
          </div>
          <div
            className="avatar-preview"
            id="preview-agent-agreement"
            style={{ marginLeft: 8 }}
          >
            Agreement
            <br />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>No file</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              id="file-agent-agreement"
              type="file"
              accept="application/pdf,image/*"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="file-btn"
              data-target="file-agent-agreement"
              id="btn-agent-agreement"
            >
              Upload Agreement
            </button>
            <div className="hint">Agency Agreement, max 3MB</div>
          </div>
        </div>
      </div>
      {/* terms checkbox + modal trigger */}
      <div
        className="field full"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap"
        }}
      >
        <input
          id="tos"
          type="checkbox"
          style={{ width: 18, height: 18, borderRadius: 6 }}
        />
        <label
          htmlFor="tos"
          style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}
        >
          I agree to the
          <a
            href="terms.html"
            target="_blank"
            style={{
              color: "var(--accent)",
              fontWeight: 600,
              textDecoration: "none",
              margin: "0 6px"
            }}
          >
            Terms
          </a>
          and
          <a
            href="privacy.html"
            target="_blank"
            style={{
              color: "var(--accent-2)",
              fontWeight: 600,
              textDecoration: "none",
              margin: "0 6px"
            }}
          >
            Privacy
          </a>
          .
        </label>
        <button
          type="button"
          id="view-short"
          className="file-btn"
          style={{ marginLeft: "auto" }}
        >
          View summary
        </button>
      </div>
      {/* submit */}
      <div className="actions full">
        <button type="submit" className="btn" id="regBtn">
          Create account
        </button>
        <div className="alt">
          Already have an account?{" "}
          <a
            href="login.html"
            style={{
              color: "var(--accent)",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Sign in
          </a>
        </div>
        <div id="message" className="msg" role="alert" aria-live="polite" />
      </div>
    </form>
  </main>
  {/* Terms modal (summary) */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" role="document" aria-labelledby="modalTitle">
      <h3 id="modalTitle">Terms &amp; Privacy — Summary</h3>
      <div className="modal-body">
        <p>
          <strong>Quick summary</strong>
        </p>
        <ul>
          <li>
            We collect contact info and role-specific documents to verify users
            and prevent fraud.
          </li>
          <li>
            Student data is used to confirm enrollment status; landlords/agents
            are required to provide ownership or license documents.
          </li>
          <li>
            Uploaded files are stored securely and used only for verification
            and contract processing.
          </li>
          <li>
            Full details on data retention, sharing and user rights are
            available on the full{" "}
            <a href="privacy.html" target="_blank">
              Privacy page
            </a>
            .
          </li>
        </ul>
        <p>
          For the complete legal terms, please open the full{" "}
          <a href="terms.html" target="_blank">
            Terms
          </a>{" "}
          and{" "}
          <a href="privacy.html" target="_blank">
            Privacy
          </a>{" "}
          pages.
        </p>
      </div>
      <div className="modal-actions">
        <button id="modalClose" className="file-btn">
          Close
        </button>
        <a href="terms.html" target="_blank">
          <button className="btn">Open full Terms</button>
        </a>
      </div>
    </div>
  </div>
</>
