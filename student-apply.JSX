<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Apply — UKM Students off School Rented System</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.94);\n    --accent:#1e88ff; --accent-2:#0b3d91;\n    --ink:#071028; --muted:#6a7480;\n    --radius:14px; --shadow:0 18px 40px rgba(7,12,25,0.12);\n    --ease:cubic-bezier(.2,.9,.2,1);\n    --danger:#ff6257;\n    --success:#17c964;\n  }\n\n  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,Arial;background:linear-gradient(180deg,#eef3fb,#fff);color:var(--ink);-webkit-font-smoothing:antialiased}\n  .page{min-height:100vh;padding:20px;box-sizing:border-box;opacity:0;transform:translateY(8px);animation:pageIn 420ms var(--ease) forwards}\n  @keyframes pageIn{to{opacity:1;transform:none}}\n\n  header.appbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;border-radius:calc(var(--radius)+6px);background:linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,255,255,0.6));box-shadow:var(--shadow);backdrop-filter:blur(8px)}\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{width:52px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:white;font-weight:700}\n  nav.actions{display:flex;gap:8px;align-items:center}\n  .btn{padding:8px 12px;border-radius:10px;border:0;cursor:pointer;font-size:14px}\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff}\n  .btn-ghost{background:transparent;border:1px solid rgba(10,16,28,0.06);color:var(--accent-2)}\n  .tiny{font-size:13px;color:var(--muted)}\n\n  main.layout{display:grid;grid-template-columns:1fr 360px;gap:18px;margin-top:14px}\n  @media(max-width:1000px){ main.layout{grid-template-columns:1fr} }\n\n  .card{background:var(--card-bg);border-radius:12px;padding:16px;box-shadow:0 8px 26px rgba(8,12,24,0.06);backdrop-filter:blur(6px)}\n  h1{margin:0 0 6px 0}\n\n  form{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n  .full{grid-column:1/-1}\n  label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}\n  input[type="text"],input[type="email"],input[type="tel"],input[type="number"],select,textarea,input[type="datetime-local"]{\n    width:100%;padding:10px;border-radius:10px;border:1px solid rgba(10,16,28,0.06);background:white;box-sizing:border-box;font-size:14px\n  }\n  textarea{min-height:120px;resize:vertical}\n\n  .field{background:linear-gradient(180deg,rgba(255,255,255,0.98),#fff);padding:10px;border-radius:10px}\n  .muted{color:var(--muted);font-size:13px}\n\n  /* uploads */\n  .uploads{display:flex;gap:12px;flex-wrap:wrap}\n  .u-preview{width:120px;height:88px;border-radius:8px;background:#f6f8fb;border:1px dashed rgba(10,16,28,0.06);display:grid;place-items:center;font-size:12px;color:var(--muted);position:relative;overflow:hidden}\n  .u-preview img{width:100%;height:100%;object-fit:cover}\n  .u-remove{position:absolute;right:6px;top:6px;background:rgba(255,255,255,0.9);border-radius:8px;padding:4px;font-size:12px;cursor:pointer}\n\n  .file-list{display:flex;flex-direction:column;gap:6px}\n  .file-item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:#fff;border:1px solid rgba(10,16,28,0.04);font-size:13px}\n\n  .note{font-size:13px;color:var(--muted)}\n  .error{color:var(--danger);font-size:13px}\n  .success{color:var(--success);font-size:13px}\n\n  .actions{display:flex;gap:10px;align-items:center;margin-top:8px}\n\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:80}\n  .modal{width:min(520px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n\n  .__toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:90;padding:8px 14px;border-radius:10px;color:#fff;box-shadow:0 10px 30px rgba(14,54,120,0.12)}\n  .fade-in{animation:fadeIn 360ms var(--ease) forwards}\n  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n'
    }}
  />
  <div className="page" role="document">
    <header className="appbar" role="banner">
      <div className="brand">
        <div className="logo">UKM</div>
        <div>
          <div style={{ fontWeight: 700 }}>
            UKM Students off School Rented System
          </div>
          <div className="tiny">Student Application Submission</div>
        </div>
      </div>
      <nav className="actions">
        <a href="index.html" className="btn btn-ghost">
          Home
        </a>
        <a href="property.html" className="btn btn-ghost">
          Properties
        </a>
        <a href="login.html" className="btn btn-ghost">
          Log in
        </a>
        <a href="register.html" className="btn btn-ghost">
          Register
        </a>
      </nav>
    </header>
    <main className="layout">
      {/* left: form */}
      <section className="card fade-in" aria-labelledby="applyTitle">
        <h1 id="applyTitle">Apply for this property</h1>
        <p className="muted">
          Please complete the form below to apply. You may upload supporting
          documents (student ID, transcripts, guarantor information).
        </p>
        <form id="applyForm" className="fade-in" noValidate="">
          <div className="field full">
            <label htmlFor="propRef">Property reference (optional)</label>
            <input
              id="propRef"
              name="propRef"
              type="text"
              placeholder="e.g. property id or title (property.html?id=...)"
            />
          </div>
          <div className="field">
            <label htmlFor="name">Full name *</label>
            <input
              id="name"
              name="name"
              type="text"
              required=""
              placeholder="Your full name"
            />
          </div>
          <div className="field">
            <label htmlFor="studentId">Student ID *</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              required=""
              placeholder="e.g. A199958"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required=""
              placeholder="you@example.edu"
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+60 12 345 6789"
            />
          </div>
          <div className="field full">
            <label htmlFor="message">Message to host *</label>
            <textarea
              id="message"
              name="message"
              required=""
              placeholder="Tell the host about your intended stay, roommates, guarantor, etc."
              defaultValue={""}
            />
          </div>
          <div className="field">
            <label htmlFor="moveIn">Desired move-in date</label>
            <input id="moveIn" name="moveIn" type="date" />
          </div>
          <div className="field">
            <label htmlFor="duration">Duration (months)</label>
            <input
              id="duration"
              name="duration"
              type="number"
              min={1}
              max={60}
            />
          </div>
          <div className="field full">
            <label>
              Upload supporting documents (images or PDF, max 3MB each)
            </label>
            <div className="uploads" id="uploadsArea">
              <div
                className="u-preview"
                id="addFileBtn"
                title="Add files"
                style={{ cursor: "pointer" }}
              >
                ＋ Add
              </div>
            </div>
            <div className="note" style={{ marginTop: 8 }}>
              Accepted types: images (JPG/PNG) and PDF. Max 3 MB per file.
            </div>
            <div
              id="uploadError"
              className="error"
              style={{ display: "none", marginTop: 6 }}
            />
          </div>
          <div className="field full">
            <label>Current address (optional)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="address"
                type="text"
                placeholder="Detected or manual address"
              />
              <button type="button" id="locBtn" className="btn btn-ghost">
                Use my location
              </button>
            </div>
            <div className="muted" id="addrHint" style={{ marginTop: 6 }}>
              Allowing location will reverse-resolve a readable address (text
              only).
            </div>
          </div>
          <div className="field full">
            <label>
              <input id="agree" type="checkbox" />
              <span style={{ marginLeft: 8 }}>
                I agree to the{" "}
                <a href="terms.html" target="_blank">
                  Terms
                </a>{" "}
                and{" "}
                <a href="privacy.html" target="_blank">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            <div
              id="agreeError"
              className="error"
              style={{ display: "none", marginTop: 6 }}
            />
          </div>
          <div
            className="full"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <button id="submitBtn" type="submit" className="btn btn-primary">
              Submit application
            </button>
            <button id="saveDraft" type="button" className="btn btn-ghost">
              Save draft
            </button>
            <div id="formMsg" className="muted" style={{ marginLeft: 8 }} />
          </div>
        </form>
      </section>
      {/* right: sidebar */}
      <aside className="card fade-in">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 700 }}>Application info</div>
          <div className="tiny">What happens next</div>
        </div>
        <div style={{ marginTop: 10 }}>
          <ul style={{ color: "#24303b" }}>
            <li>Host will review your application and files.</li>
            <li>
              Accepted applicants will be contacted for viewing and contract
              steps.
            </li>
            <li>Do not upload sensitive documents unless requested by host.</li>
          </ul>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700 }}>Your current address</div>
          <div
            id="addrText"
            className="tiny"
            style={{ marginTop: 8, color: "var(--muted)" }}
          >
            Detecting address…
          </div>
          <div style={{ marginTop: 8 }}>
            <button id="refreshLoc" className="btn btn-ghost">
              Refresh location
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700 }}>Tips</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Use clear photos for IDs and transcripts. Include expected move-in
            date and any guarantor details in the message.
          </div>
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
  {/* sign-in modal for guest / not-logged */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" role="document">
      <h3>Sign in required</h3>
      <p>
        You must sign in to submit an application. Please sign in or register.
      </p>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          marginTop: 12
        }}
      >
        <a href="login.html" className="btn btn-ghost">
          Sign in
        </a>
        <a href="register.html" className="btn btn-primary">
          Register
        </a>
      </div>
    </div>
  </div>
</>
