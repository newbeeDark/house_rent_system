<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>
    Contract Viewer &amp; Upload — UKM Students off School Rented System
  </title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.94);\n    --accent:#1e88ff; --accent-2:#0b3d91;\n    --ink:#071028; --muted:#6a7480;\n    --radius:14px; --shadow:0 18px 40px rgba(7,12,25,0.12);\n    --ease:cubic-bezier(.2,.9,.2,1);\n    --danger:#ff6257; --success:#17c964;\n  }\n  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,Arial;background:linear-gradient(180deg,#eef3fb,#fff);color:var(--ink);-webkit-font-smoothing:antialiased}\n  .page{min-height:100vh;padding:18px;box-sizing:border-box;opacity:0;transform:translateY(8px);animation:pageIn 420ms var(--ease) forwards}\n  @keyframes pageIn{to{opacity:1;transform:none}}\n\n  header.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:calc(var(--radius)+6px);background:linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,255,255,0.6));box-shadow:var(--shadow);backdrop-filter:blur(8px)}\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{width:52px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:white;font-weight:700}\n  nav.actions{display:flex;gap:8px;align-items:center}\n  .btn{padding:8px 12px;border-radius:10px;border:0;cursor:pointer;font-size:14px}\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff}\n  .btn-ghost{background:transparent;border:1px solid rgba(10,16,28,0.06);color:var(--accent-2)}\n  .tiny{font-size:13px;color:var(--muted)}\n\n  main.layout{display:grid;grid-template-columns:1fr 380px;gap:18px;margin-top:14px}\n  @media(max-width:1000px){ main.layout{grid-template-columns:1fr} }\n\n  .card{background:var(--card-bg);border-radius:12px;padding:14px;box-shadow:0 8px 26px rgba(8,12,24,0.06);backdrop-filter:blur(6px)}\n  h2{margin:0 0 8px 0}\n\n  .controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}\n  input[type=file]{display:none}\n\n  .viewer{height:72vh;border-radius:12px;overflow:hidden;border:1px solid rgba(10,16,28,0.04);background:#fff}\n  .viewer iframe{width:100%;height:100%;border:0}\n\n  .versions{display:flex;flex-direction:column;gap:10px;max-height:48vh;overflow:auto;padding-right:6px}\n  .version-item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:linear-gradient(180deg,#fff,#fbfdff);border:1px solid rgba(10,16,28,0.02)}\n  .version-item .meta{flex:1;display:flex;flex-direction:column}\n  .label{font-weight:700}\n  .muted{font-size:13px;color:var(--muted)}\n\n  .sig-canvas{border-radius:8px;border:1px solid rgba(10,16,28,0.06);background:#fff}\n  .sig-actions{display:flex;gap:8px;margin-top:8px}\n\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:90}\n  .modal{width:min(720px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n\n  .__toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100;padding:8px 14px;border-radius:10px;color:#fff;box-shadow:0 10px 30px rgba(14,54,120,0.12)}\n'
    }}
  />
  <div className="page" role="document">
    <header className="appbar">
      <div className="brand">
        <div className="logo">UKM</div>
        <div>
          <div style={{ fontWeight: 700 }}>
            UKM Students off School Rented System
          </div>
          <div className="tiny">Contract Viewer &amp; Upload</div>
        </div>
      </div>
      <nav className="actions">
        <a href="index.html" className="btn btn-ghost">
          Home
        </a>
        <a href="host-dashboard.html" className="btn btn-ghost">
          Dashboard
        </a>
        <a href="applications.html" className="btn btn-ghost">
          Applications
        </a>
        <a href="login.html" className="btn btn-ghost">
          Log in
        </a>
      </nav>
    </header>
    <main className="layout">
      {/* left: main viewer */}
      <section className="card" aria-labelledby="viewerTitle">
        <h2 id="viewerTitle">Contract preview</h2>
        <p className="tiny">
          Preview the uploaded contract here. You can upload a PDF, request
          signature, or upload a signed contract.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12
          }}
        >
          <div className="controls">
            <label className="btn btn-ghost" title="Upload contract (PDF)">
              <input id="uploadContract" type="file" accept="application/pdf" />
              Upload contract (PDF)
            </label>
            <label
              className="btn btn-ghost"
              title="Upload signed contract (PDF)"
            >
              <input id="uploadSigned" type="file" accept="application/pdf" />
              Upload signed contract
            </label>
            <button id="requestSigBtn" className="btn btn-primary">
              Request signature
            </button>
            <button id="downloadContract" className="btn btn-ghost">
              Download
            </button>
          </div>
          <div className="tiny">
            System: demo-only — files stored in browser memory
          </div>
        </div>
        <div style={{ height: 12 }} />
        <div className="viewer" id="viewer">
          <iframe
            id="pdfFrame"
            srcDoc="<p style='padding:18px'>No contract uploaded</p>"
          />
        </div>
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 8,
            alignItems: "center"
          }}
        >
          <div className="muted">Current contract:</div>
          <div id="currentLabel" style={{ fontWeight: 700 }}>
            None
          </div>
        </div>
      </section>
      {/* right: sidebar (versions + signature) */}
      <aside className="card">
        <h3 style={{ margin: 0 }}>Contract versions</h3>
        <div className="muted" style={{ marginTop: 6 }}>
          Uploaded files and signed versions
        </div>
        <div style={{ height: 12 }} />
        <div className="versions" id="versionsList">
          {/* filled by JS */}
        </div>
        <div style={{ height: 14 }} />
        <h3 style={{ margin: 0 }}>On-screen signature</h3>
        <div className="muted" style={{ marginTop: 6 }}>
          Draw a signature, download as PNG, or attach to messages.
        </div>
        <canvas
          id="sigCanvas"
          className="sig-canvas"
          width={320}
          height={140}
          style={{ display: "block", marginTop: 10 }}
        />
        <div className="sig-actions">
          <button id="sigClear" className="btn btn-ghost">
            Clear
          </button>
          <button id="sigDownload" className="btn btn-primary">
            Download signature
          </button>
          <button id="attachSig" className="btn btn-ghost">
            Attach to message
          </button>
        </div>
        <div style={{ height: 18 }} />
        <h3 style={{ margin: 0 }}>Actions / Notes</h3>
        <div className="muted" style={{ marginTop: 8 }}>
          Notes:
        </div>
        <ul style={{ marginTop: 8 }}>
          <li>
            To embed a signature into the PDF you will need server-side merging
            or a client PDF library (e.g., pdf-lib). This UI only collects the
            signature image and contract files.
          </li>
          <li>
            In production, upload files to backend storage (S3) and return
            secure URLs. Enforce access control and audit trail.
          </li>
        </ul>
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
  {/* login modal */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal">
      <h3>Sign in required</h3>
      <p>
        Uploading or requesting signatures requires signing in. Please sign in
        or register.
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
