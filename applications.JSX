<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Applications — UKM Students off School Rented System</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.9);\n    --accent:#1e88ff; --accent-2:#0b3d91;\n    --ink:#071028; --muted:#6a7480;\n    --radius:14px; --shadow:0 18px 40px rgba(7,12,25,0.12);\n    --ease:cubic-bezier(.2,.9,.2,1);\n    --success:#17c964; --danger:#ff6257;\n  }\n  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,Arial;background:linear-gradient(180deg,#eef3fb,#fff);color:var(--ink);-webkit-font-smoothing:antialiased}\n  .page{min-height:100vh;padding:18px;box-sizing:border-box;opacity:0;transform:translateY(8px);animation:pageIn 420ms var(--ease) forwards}\n  @keyframes pageIn{to{opacity:1;transform:none}}\n\n  header.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(180deg,rgba(255,255,255,0.75), rgba(255,255,255,0.6));backdrop-filter:blur(8px);border-radius:calc(var(--radius)+6px);padding:12px 16px;box-shadow:var(--shadow)}\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{width:52px;height:44px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:white;font-weight:700}\n  nav.actions{display:flex;gap:8px;align-items:center}\n  .btn{padding:8px 12px;border-radius:10px;border:0;cursor:pointer}\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff}\n  .btn-ghost{background:transparent;border:1px solid rgba(10,16,28,0.06);color:var(--accent-2)}\n  .tiny{font-size:13px;color:var(--muted)}\n\n  .layout{display:grid;grid-template-columns:1fr 360px;gap:18px;margin-top:14px}\n  @media(max-width:1000px){ .layout{grid-template-columns:1fr} }\n\n  .panel{background:var(--card-bg);border-radius:12px;padding:14px;box-shadow:0 8px 26px rgba(8,12,24,0.06)}\n  .panel h2{margin:0 0 10px 0}\n\n  .apps-list{display:flex;flex-direction:column;gap:12px}\n  .app-card{display:flex;gap:12px;padding:12px;border-radius:12px;background:linear-gradient(180deg,#fff,#fbfdff);border:1px solid rgba(10,16,28,0.02);align-items:center;cursor:pointer;transition:transform 220ms var(--ease);opacity:0;transform:translateY(8px)}\n  .app-card.show{opacity:1;transform:none}\n  .avatar{width:56px;height:56px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:#fff;font-weight:700}\n  .app-info{flex:1}\n  .app-meta{color:var(--muted);font-size:13px}\n  .status{padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px;background:rgba(11,61,145,0.06);color:var(--accent-2)}\n  .status.pending{background:linear-gradient(90deg,#fff7e6,#fff1da);color:#a36b00}\n  .status.accepted{background:linear-gradient(90deg,#e6ffef,#f0fff7);color:var(--success)}\n  .status.rejected{background:linear-gradient(90deg,#ffecec,#fff2f2);color:var(--danger)}\n\n  .actions{display:flex;gap:8px;align-items:center}\n\n  /* details side */\n  .detail { display:flex;flex-direction:column;gap:10px }\n  .detail .row{display:flex;justify-content:space-between;align-items:center;gap:8px}\n  .files{display:flex;gap:8px;flex-wrap:wrap}\n  .file-item{padding:8px;border-radius:8px;background:#fbfdff;border:1px solid rgba(10,16,28,0.03);font-size:13px}\n\n  /* inline uploader */\n  .uploader{display:flex;gap:8px;align-items:center}\n  .uploader input[type=file]{display:none}\n  .u-btn{padding:8px;border-radius:8px;border:1px dashed rgba(10,16,28,0.06);cursor:pointer;background:transparent}\n\n  /* modal */\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:80}\n  .modal{width:min(720px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n\n  /* toast */\n  .__toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:90;padding:8px 14px;border-radius:10px;color:#fff;box-shadow:0 10px 30px rgba(14,54,120,0.12)}\n\n  /* small transitions */\n  .fade-in{animation:fadeIn 360ms var(--ease) forwards}\n  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n'
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
          <div className="tiny">Applications &amp; Booking Flow</div>
        </div>
      </div>
      <nav className="actions">
        <a href="host-dashboard.html" className="btn btn-ghost">
          Dashboard
        </a>
        <a href="create-listing.html" className="btn btn-ghost">
          Create
        </a>
        <a href="favorites.html" className="btn btn-ghost">
          Favourites
        </a>
        <a href="login.html" className="btn btn-ghost">
          Log in
        </a>
      </nav>
    </header>
    <main className="layout">
      {/* left: applications list */}
      <section className="panel" aria-labelledby="appsTitle">
        <h2 id="appsTitle">Applications</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6
          }}
        >
          <div className="tiny">Manage incoming rental applications</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              id="searchInput"
              type="search"
              placeholder="Search by applicant, property"
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid rgba(10,16,28,0.06)"
              }}
            />
            <select
              id="filterStatus"
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid rgba(10,16,28,0.06)"
              }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div style={{ height: 12 }} />
        <div id="appsList" className="apps-list" aria-live="polite">
          {/* JS inject */}
        </div>
      </section>
      {/* right: detail & actions */}
      <aside className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 700 }}>Application detail</div>
          <div className="tiny">Processing tools</div>
        </div>
        <div
          id="detailEmpty"
          className="tiny"
          style={{ marginTop: 12, color: "var(--muted)" }}
        >
          Select an application on the left to view details.
        </div>
        <div
          id="detailCard"
          className="detail"
          style={{ display: "none", marginTop: 12 }}
        >
          <div className="row">
            <div>
              <div style={{ fontWeight: 800 }} id="dApplicant">
                Applicant Name
              </div>
              <div className="app-meta" id="dMeta">
                Student ID · Submitted
              </div>
            </div>
            <div id="dStatus" className="status pending">
              pending
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Message</div>
            <div className="tiny" id="dMessage">
              —
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Uploaded documents</div>
            <div id="dFiles" className="files" style={{ marginTop: 6 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Actions</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button id="acceptBtn" className="btn btn-primary">
                Accept
              </button>
              <button id="rejectBtn" className="btn btn-ghost">
                Reject
              </button>
              <button id="requestDocsBtn" className="btn btn-ghost">
                Request more docs
              </button>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700 }}>Schedule viewing</div>
            <div className="tiny" style={{ marginTop: 6 }}>
              Send a suggested time to applicant (demo)
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                id="viewingTime"
                type="datetime-local"
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid rgba(10,16,28,0.06)"
                }}
              />
              <button id="scheduleBtn" className="btn btn-primary">
                Send
              </button>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700 }}>
              Upload additional file (for applicant)
            </div>
            <div className="uploader" style={{ marginTop: 8 }}>
              <label className="u-btn" htmlFor="extraFile">
                ＋ Upload file
              </label>
              <input
                id="extraFile"
                type="file"
                accept="application/pdf,image/*"
              />
              <div
                id="extraFileName"
                className="tiny"
                style={{ marginLeft: "auto", color: "var(--muted)" }}
              >
                No file
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <button id="sendExtraBtn" className="btn btn-ghost">
                Send to applicant
              </button>
            </div>
          </div>
        </div>
        <div style={{ height: 12 }} />
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700 }}>Your current address</div>
          <div
            id="addrText"
            className="tiny"
            style={{ marginTop: 6, color: "var(--muted)" }}
          >
            Detecting address…
          </div>
          <div style={{ marginTop: 8 }}>
            <button id="locBtn" className="btn btn-ghost">
              Refresh location
            </button>
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
  {/* modal for confirm / messages */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" id="modal" role="document">
      <div id="modalInner" />
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
