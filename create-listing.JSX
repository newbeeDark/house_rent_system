<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Create Listing — UKM Students off School Rented System</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.92);\n    --accent:#1e88ff; --accent-2:#0b3d91;\n    --ink:#071028; --muted:#6a7480;\n    --radius:14px; --shadow:0 18px 40px rgba(7,12,25,0.12);\n    --ease:cubic-bezier(.2,.9,.2,1); --danger:#ff6257;\n  }\n  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,Arial;background:linear-gradient(180deg,#eef3fb,#fff);color:var(--ink);-webkit-font-smoothing:antialiased}\n  .page{min-height:100vh;padding:18px;box-sizing:border-box;opacity:0;transform:translateY(6px);animation:pageIn 420ms var(--ease) forwards}\n  @keyframes pageIn{to{opacity:1;transform:none}}\n\n  header.appbar{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-radius:calc(var(--radius)+6px);background:linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,255,255,0.6));box-shadow:var(--shadow);backdrop-filter:blur(8px)}\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{width:52px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:#fff;font-weight:700}\n  nav.actions{display:flex;gap:8px;align-items:center}\n  .btn{padding:8px 12px;border-radius:10px;border:0;cursor:pointer}\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff}\n  .btn-ghost{background:transparent;border:1px solid rgba(10,16,28,0.06);color:var(--accent-2)}\n\n  main.container{display:grid;grid-template-columns:1fr 360px;gap:18px;margin-top:14px}\n  @media(max-width:1000px){ main.container{grid-template-columns:1fr} }\n\n  .card{background:var(--card-bg);border-radius:14px;padding:16px;box-shadow:0 8px 26px rgba(8,12,24,0.06);backdrop-filter:blur(6px)}\n  h2{margin:0 0 8px 0}\n\n  form{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n  .full{grid-column:1/-1}\n  label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}\n  input[type="text"],input[type="number"],select,textarea{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(10,16,28,0.06);font-size:14px;background:white;box-sizing:border-box}\n  textarea{min-height:110px;resize:vertical}\n\n  .field{background:linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.96));padding:10px;border-radius:12px}\n  .role-pills{display:flex;gap:8px}\n  .pill{padding:8px 12px;border-radius:999px;background:rgba(7,16,38,0.04);cursor:pointer;font-weight:700;color:var(--muted)}\n  .pill.active{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff}\n\n  .uploads{display:flex;gap:12px;flex-wrap:wrap}\n  .u-preview{width:120px;height:88px;border-radius:8px;background:#f6f8fb;border:1px dashed rgba(10,16,28,0.06);display:grid;place-items:center;font-size:12px;color:var(--muted);position:relative;overflow:hidden}\n  .u-preview img{width:100%;height:100%;object-fit:cover;display:block}\n  .u-remove{position:absolute;right:6px;top:6px;background:rgba(255,255,255,0.8);border-radius:8px;padding:4px;font-size:12px;cursor:pointer}\n\n  .small{font-size:13px;color:var(--muted)}\n\n  .actions{display:flex;gap:10px;align-items:center;margin-top:10px}\n  .note{font-size:13px;color:var(--muted);margin-top:8px}\n  .msg{padding:10px;border-radius:10px;font-size:13px;display:none}\n\n  /* modal */\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:80}\n  .modal{width:min(520px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n\n  /* subtle animations */\n  .fade-in{animation:fadeIn 360ms var(--ease) forwards}\n  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n\n  .disabled{opacity:0.6;pointer-events:none}\n'
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
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Create or edit a listing
          </div>
        </div>
      </div>
      <nav className="actions">
        <a href="index.html" className="btn btn-ghost">
          Home
        </a>
        <a href="favorites.html" className="btn btn-ghost">
          Favourites
        </a>
        <a href="login.html" className="btn btn-ghost">
          Log in
        </a>
        <a href="register.html" className="btn btn-ghost">
          Register
        </a>
      </nav>
    </header>
    <main className="container">
      <section className="card fade-in" aria-labelledby="formTitle">
        <h2 id="formTitle">Create new listing</h2>
        <p className="small">
          Fill in details. Landlord and Agent accounts can publish listings.
          Student accounts cannot.
        </p>
        <form id="listingForm" className="fade-in" noValidate="">
          <div className="field full">
            <label>Account role</label>
            <div
              className="role-pills"
              id="rolePills"
              role="tablist"
              aria-label="Account role"
            >
              <div className="pill" data-role="student" tabIndex={0}>
                Student
              </div>
              <div className="pill" data-role="landlord" tabIndex={0}>
                Landlord
              </div>
              <div className="pill" data-role="agent" tabIndex={0}>
                Agent
              </div>
            </div>
            <div className="small" style={{ marginTop: 8 }}>
              Only Landlord or Agent can publish. If you are a Student, switch
              account first.
            </div>
          </div>
          <div className="field full">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Cozy single room near UKM"
              required=""
            />
          </div>
          <div className="field">
            <label htmlFor="price">Price (RM) *</label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              placeholder="e.g. 450"
              required=""
            />
          </div>
          <div className="field">
            <label htmlFor="beds">Beds</label>
            <select id="beds" name="beds">
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3+</option>
            </select>
          </div>
          <div className="field full">
            <label htmlFor="area">Area / Location name *</label>
            <input
              id="area"
              name="area"
              type="text"
              placeholder="e.g. Taman UKM"
              required=""
            />
          </div>
          <div className="field full">
            <label>Address (detected or manual)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Full address or description"
              />
              <button type="button" id="locBtn" className="btn btn-ghost">
                Use my location
              </button>
            </div>
            <div
              id="addrHint"
              className="small"
              style={{ marginTop: 6, color: "var(--muted)" }}
            >
              If you use location, the system will reverse-resolve a readable
              address (no map shown).
            </div>
          </div>
          <div className="field full">
            <label htmlFor="desc">Description *</label>
            <textarea
              id="desc"
              name="desc"
              placeholder="Describe the property, rules, nearby transport..."
              defaultValue={""}
            />
          </div>
          {/* role-specific uploads */}
          <div id="roleUploads" className="full">
            {/* injected by JS */}
          </div>
          <div className="field full">
            <label>Photos (at least 1) *</label>
            <div className="uploads" id="photosArea">
              <div
                className="u-preview"
                id="addPhotoBtn"
                title="Add photos"
                style={{ cursor: "pointer" }}
              >
                ＋ Add
              </div>
            </div>
            <div className="small" style={{ marginTop: 8 }}>
              JPG/PNG — max 3MB per file. Drag &amp; drop supported.
            </div>
          </div>
          <div className="field full">
            <label>Terms &amp; Privacy</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input id="agree" type="checkbox" />
              <label htmlFor="agree" style={{ margin: 0 }}>
                I agree to the{" "}
                <a href="terms.html" target="_blank">
                  Terms
                </a>{" "}
                and{" "}
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
              Publish listing
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
      <aside className="card fade-in" aria-label="Sidebar">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 700 }}>Publishing tips</div>
          <div className="small" style={{ color: "var(--muted)" }}>
            Guidelines
          </div>
        </div>
        <ul style={{ marginTop: 10, color: "#24303b" }}>
          <li>Provide clear photos and accurate price.</li>
          <li>Upload ownership or agency license if asked.</li>
          <li>Fill address to improve nearby matching to students.</li>
          <li>Terms acceptance is required to publish.</li>
        </ul>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700 }}>Upload checklist</div>
          <div className="small" style={{ marginTop: 6 }}>
            Photos, Property proof (for landlord), Agency license (for agents).
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
  {/* modal for sign-in requirement */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" role="document">
      <h3 id="modalTitle">Sign in required</h3>
      <p id="modalText">
        You must sign in as a Landlord or Agent to publish a listing. Please
        sign in or register.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
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
