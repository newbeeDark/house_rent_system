<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Apply — UKM Students off School Rented System</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.92);\n    --accent:#1e88ff; --accent-2:#0b3d91;\n    --ink:#071028; --muted:#6a7480;\n    --radius:14px; --shadow:0 18px 40px rgba(7,12,25,0.12);\n    --ease:cubic-bezier(.2,.9,.2,1);\n    --success:#17c964; --danger:#ff6257;\n  }\n\n  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,Arial;background:linear-gradient(180deg,#eef3fb,#fff);color:var(--ink);-webkit-font-smoothing:antialiased}\n  .page{min-height:100vh;padding:18px;box-sizing:border-box;opacity:0;transform:translateY(8px);animation:pageIn 360ms var(--ease) forwards}\n  @keyframes pageIn{to{opacity:1;transform:none}}\n\n  header.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(180deg,rgba(255,255,255,0.75), rgba(255,255,255,0.6));backdrop-filter:blur(8px);border-radius:calc(var(--radius)+6px);padding:12px 16px;box-shadow:var(--shadow)}\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{width:52px;height:44px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:white;font-weight:700}\n  .title{font-weight:700}\n  nav.actions{display:flex;gap:8px;align-items:center}\n  .btn{padding:8px 12px;border-radius:10px;border:0;cursor:pointer}\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff}\n  .btn-ghost{background:transparent;border:1px solid rgba(10,16,28,0.06);color:var(--accent-2)}\n  .tiny{font-size:13px;color:var(--muted)}\n\n  main.layout{display:grid;grid-template-columns:1fr 360px;gap:18px;margin-top:14px}\n  @media (max-width:1000px){ main.layout{grid-template-columns:1fr} }\n\n  .card{background:var(--card-bg);border-radius:14px;padding:16px;box-shadow:0 8px 26px rgba(8,12,24,0.06);backdrop-filter:blur(6px)}\n  h2{margin:0 0 8px 0}\n\n  form{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n  .full{grid-column:1/-1}\n  label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}\n  input[type="text"],input[type="email"],input[type="tel"],input[type="number"],select,textarea,input[type="datetime-local"]{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(10,16,28,0.06);font-size:14px;background:white;box-sizing:border-box}\n  textarea{min-height:110px;resize:vertical}\n\n  .field{background:linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.96));padding:10px;border-radius:12px}\n  .small{font-size:13px;color:var(--muted)}\n\n  .uploads{display:flex;gap:12px;flex-wrap:wrap}\n  .u-preview{width:120px;height:88px;border-radius:8px;background:#f6f8fb;border:1px dashed rgba(10,16,28,0.06);display:grid;place-items:center;font-size:12px;color:var(--muted);position:relative;overflow:hidden}\n  .u-preview img{width:100%;height:100%;object-fit:cover}\n  .u-remove{position:absolute;right:6px;top:6px;background:rgba(255,255,255,0.9);border-radius:8px;padding:4px;font-size:12px;cursor:pointer}\n\n  .actions{display:flex;gap:10px;align-items:center;margin-top:10px}\n  .msg{padding:10px;border-radius:10px;font-size:13px;display:none}\n\n  /* modal */\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:80}\n  .modal{width:min(520px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n\n  /* toast */\n  .__toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:90;padding:8px 14px;border-radius:10px;color:#fff;box-shadow:0 10px 30px rgba(14,54,120,0.12)}\n\n  .disabled{opacity:0.6;pointer-events:none}\n  .fade-in{animation:fadeIn 360ms var(--ease) forwards}\n  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n'
    }}
  />
  <div className="page" role="document">
    <header className="appbar" role="banner">
      <div className="brand">
        <div className="logo">UKM</div>
        <div>
          <div className="title">UKM Students off School Rented System</div>
          <div className="tiny">Student Application</div>
        </div>
      </div>
      <nav className="actions">
        <a href="index.html" className="btn btn-ghost">
          Home
        </a>
        <a href="property.html" className="btn btn-ghost">
          Properties
        </a>
        <a href="host-dashboard.html" className="btn btn-ghost">
          Host Dashboard
        </a>
        <a href="login.html" className="btn btn-ghost">
          Log in
        </a>
      </nav>
    </header>
    <main className="layout">
      {/* left: application form */}
      <section className="card fade-in" aria-labelledby="formTitle">
        <h2 id="formTitle">Submit Application</h2>
        <p className="small">
          Fill the form below to apply for the listing. 上传的文件最大 3MB，支持
          JPG/PNG/PDF。若为游客，你会被提示登录。
        </p>
        <form id="applyForm" noValidate="" className="fade-in">
          <div className="field full">
            <label htmlFor="propertyRef">Property (ID / Title) *</label>
            <input
              id="propertyRef"
              name="propertyRef"
              type="text"
              placeholder="e.g. 101 or Studio near UKM - 5 min"
              required=""
            />
          </div>
          <div className="field">
            <label htmlFor="fullname">Full name *</label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              placeholder="Your full name"
              required=""
            />
          </div>
          <div className="field">
            <label htmlFor="matric">Matric number *</label>
            <input
              id="matric"
              name="matric"
              type="text"
              placeholder="e.g. A199958"
              required=""
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@uni.edu.my"
              required=""
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Contact phone *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+60 12 345 6789"
              required=""
            />
          </div>
          <div className="field">
            <label htmlFor="moveIn">Desired move-in date *</label>
            <input id="moveIn" name="moveIn" type="date" required="" />
          </div>
          <div className="field full">
            <label htmlFor="message">Message to landlord</label>
            <textarea
              id="message"
              name="message"
              placeholder="Introduce yourself, explain duration, guarantor, etc."
              defaultValue={""}
            />
          </div>
          <div className="field full">
            <label>
              Upload documents (Student ID / Guarantor ID / Additional)
            </label>
            <div className="uploads" id="uploadsArea">
              <div
                className="u-preview"
                id="addFileBtn"
                title="Add files"
                style={{ cursor: "pointer" }}
              >
                ＋ Add files
              </div>
            </div>
            <div className="small" style={{ marginTop: 8 }}>
              Allowed types: JPG / PNG / PDF. Max 3MB each. You can upload
              multiple files.
            </div>
          </div>
          <div className="field full">
            <label htmlFor="agree">Terms</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input id="agree" name="agree" type="checkbox" />
              <label htmlFor="agree">
                I agree to the{" "}
                <a href="terms.html" target="_blank">
                  Terms
                </a>{" "}
                &amp;{" "}
                <a href="privacy.html" target="_blank">
                  Privacy
                </a>
                .
              </label>
            </div>
          </div>
          <div
            className="full"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <button id="submitBtn" className="btn btn-primary" type="submit">
              Submit application
            </button>
            <button id="saveDraft" type="button" className="btn btn-ghost">
              Save draft
            </button>
            <div
              id="formMsg"
              className="msg"
              role="status"
              aria-live="polite"
            />
          </div>
        </form>
      </section>
      {/* right: side info */}
      <aside className="card fade-in">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 700 }}>Your current address</div>
          <div className="tiny">Optional</div>
        </div>
        <div style={{ marginTop: 8 }}>
          <div id="addrText" className="tiny" style={{ color: "var(--muted)" }}>
            Detecting address…
          </div>
          <div style={{ marginTop: 8 }}>
            <button id="locBtn" className="btn btn-ghost">
              Use my location
            </button>
          </div>
        </div>
        <div style={{ height: 12 }} />
        <div style={{ fontWeight: 700 }}>Tips for stronger application</div>
        <ul style={{ marginTop: 8, color: "#24303b" }}>
          <li>Attach a clear copy of your student ID.</li>
          <li>Provide short guarantor contact if required by landlord.</li>
          <li>Keep message polite and specific about move-in date.</li>
        </ul>
        <div style={{ height: 12 }} />
        <div style={{ fontWeight: 700 }}>Help</div>
        <div className="tiny" style={{ marginTop: 8, color: "var(--muted)" }}>
          If you have problems uploading, email support or contact the host via
          property page.
        </div>
      </aside>
    </main>
    <footer
      style={{
        textAlign: "center",
        color: "var(--muted)",
        fontSize: 13,
        padding: "12px 0",
        marginTop: 12
      }}
    >
      © 2025 UKM Students off School Rented System
    </footer>
  </div>
  {/* modal for sign-in / preview */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" id="modal" role="document">
      <div id="modalContent" />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 12
        }}
      >
        <button id="modalClose" className="btn btn-ghost">
          Close
        </button>
        <button
          id="modalPrimary"
          className="btn btn-primary"
          style={{ display: "none" }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
</>
