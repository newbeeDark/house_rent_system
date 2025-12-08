<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Property — UKM Students off School Rented System</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.9);\n    --accent: #1e88ff;\n    --accent-2: #0b3d91;\n    --ink: #071028;\n    --muted: #6a7480;\n    --radius:14px;\n    --shadow-lg: 0 18px 40px rgba(7,12,25,0.12);\n    --ease: cubic-bezier(.2,.9,.2,1);\n    --danger: #ff6257;\n  }\n  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial;color:var(--ink);background:linear-gradient(180deg,#eef3fb,#fff);-webkit-font-smoothing:antialiased}\n  .page{min-height:100vh;display:flex;flex-direction:column;gap:18px;padding:20px;box-sizing:border-box;opacity:0;transform:translateY(8px);animation:pageIn 420ms var(--ease) forwards}\n  @keyframes pageIn{to{opacity:1;transform:none}}\n\n  header.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(180deg,rgba(255,255,255,0.75), rgba(255,255,255,0.6));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:calc(var(--radius)+6px);padding:12px 16px;box-shadow:var(--shadow-lg)}\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{width:52px;height:44px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:white;font-weight:700;box-shadow:0 8px 22px rgba(14,54,120,0.12)}\n  .title{font-weight:700;font-size:15px}\n  .subtitle{font-size:12px;color:var(--muted);margin-top:2px}\n  nav.actions{display:flex;gap:8px;align-items:center}\n  nav.actions a, .btn {font-size:14px;padding:8px 12px;border-radius:10px;border:0;text-decoration:none;cursor:pointer;transition:transform 160ms var(--ease), box-shadow 160ms var(--ease)}\n  .btn:hover{transform:translateY(-2px)}\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:white;box-shadow:0 10px 28px rgba(14,54,120,0.12)}\n  .btn-ghost{background:transparent;border:1px solid rgba(12,20,40,0.06);color:var(--accent-2)}\n  .guest-pill{background:linear-gradient(90deg, rgba(11,61,145,0.08), rgba(30,136,255,0.06));color:var(--accent-2);font-weight:600}\n\n  main.content{display:grid;grid-template-columns:1fr 360px;gap:18px;align-items:start}\n  @media (max-width:1000px){ main.content{grid-template-columns:1fr} }\n\n  /* left column: images + details */\n  .card{background:var(--card-bg);border-radius:14px;padding:12px;box-shadow:0 8px 26px rgba(8,12,24,0.06);backdrop-filter:blur(6px)}\n  .gallery{display:flex;gap:10px;align-items:center}\n  .main-img{width:100%;height:320px;border-radius:12px;background-size:cover;background-position:center;box-shadow:0 12px 36px rgba(10,20,40,0.06);transition:transform 300ms var(--ease)}\n  .thumbs{display:flex;gap:8px;margin-top:10px}\n  .thumb{width:80px;height:56px;border-radius:8px;background-size:cover;background-position:center;border:2px solid transparent;cursor:pointer;transition:all 180ms var(--ease)}\n  .thumb.active{border-color:var(--accent)}\n  .info{margin-top:12px}\n  .title-row{display:flex;gap:10px;align-items:center}\n  .title{font-weight:800;font-size:20px}\n  .meta{color:var(--muted);font-size:14px}\n  .specs{display:flex;gap:10px;margin-top:8px;flex-wrap:wrap}\n  .chip{padding:6px 10px;border-radius:999px;background:rgba(11,61,145,0.06);color:var(--accent-2);font-weight:700;font-size:13px}\n\n  .section{margin-top:12px}\n  .desc{line-height:1.6;color:#24303b}\n\n  .cta-row{display:flex;gap:10px;align-items:center;margin-top:12px}\n  .apply-btn{padding:12px 16px;border-radius:12px;border:0;background:linear-gradient(90deg,var(--accent),var(--accent-2));color:white;font-weight:700;cursor:pointer}\n  .fav-btn{padding:10px;border-radius:10px;border:1px solid rgba(10,16,28,0.04);background:transparent;cursor:pointer}\n\n  /* right column */\n  .sidebar{background:var(--card-bg);border-radius:12px;padding:14px;box-shadow:0 8px 26px rgba(8,12,24,0.05)}\n  .location{font-size:13px;color:var(--muted);display:flex;gap:6px;align-items:center}\n  .host{display:flex;gap:10px;align-items:center;margin-top:12px}\n  .host .avatar{width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:white;font-weight:700}\n  .nearby-list{margin-top:10px;display:flex;flex-direction:column;gap:8px}\n\n  /* modal */\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:60}\n  .modal{width:min(520px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n  .modal h3{margin:0 0 8px}\n\n  /* small responsive */\n  @media (max-width:720px){\n    .main-img{height:220px}\n    .thumb{width:64px;height:48px}\n  }\n'
    }}
  />
  <div className="page" role="document">
    <header className="appbar" role="banner" aria-label="Top navigation">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          UKM
        </div>
        <div>
          <div className="title">UKM Students off School Rented System</div>
          <div className="subtitle">Property details</div>
        </div>
      </div>
      <nav className="actions" role="navigation" aria-label="Main actions">
        <a href="index.html" className="link-muted">
          Home
        </a>
        <a href="terms.html" className="link-muted">
          Terms
        </a>
        <a href="privacy.html" className="link-muted">
          Privacy
        </a>
        <a href="register.html" className="link-muted">
          Register
        </a>
        <a href="login.html" className="btn btn-ghost">
          Log in
        </a>
      </nav>
    </header>
    <main className="content" role="main" aria-live="polite">
      <section>
        <div className="card" id="leftCard">
          <div id="gallery" className="gallery">
            <div
              id="mainImg"
              className="main-img"
              role="img"
              aria-label="Property main image"
            />
          </div>
          <div className="thumbs" id="thumbs" />
          <div className="info" id="infoArea">
            <div className="title-row">
              <div>
                <div className="title" id="propTitle">
                  Loading…
                </div>
                <div className="meta" id="propArea">
                  Area · Beds · Rating
                </div>
              </div>
            </div>
            <div className="specs" id="specs">
              {/* price / beds / distance chips */}
            </div>
            <div className="section">
              <h3 style={{ margin: "0 0 6px" }}>Description</h3>
              <div className="desc" id="propDesc">
                Loading description…
              </div>
            </div>
            <div className="section">
              <h3 style={{ margin: "0 0 6px" }}>Facilities</h3>
              <div
                id="facilities"
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                {/* chips */}
              </div>
            </div>
            <div className="cta-row">
              <button id="applyBtn" className="apply-btn">
                Request to Apply
              </button>
              <button id="favBtn" className="fav-btn" title="Add to favourites">
                ♡ Add to favourites
              </button>
              <a
                id="contractLink"
                className="btn btn-ghost"
                href="#"
                style={{ marginLeft: "auto" }}
              >
                View Contract
              </a>
            </div>
          </div>
        </div>
      </section>
      <aside className="sidebar">
        <div className="location" id="locationBar">
          <div>📍</div>
          <div>
            <div style={{ fontWeight: 700 }} id="addressTitle">
              Detecting address…
            </div>
            <div
              style={{ fontSize: 13, color: "var(--muted)" }}
              id="addressText"
            >
              Allow location for more accurate nearby suggestions.
            </div>
          </div>
        </div>
        <div className="host">
          <div className="avatar" id="hostAvatar">
            LH
          </div>
          <div>
            <div style={{ fontWeight: 700 }} id="hostName">
              Host Name
            </div>
            <div
              style={{ fontSize: 13, color: "var(--muted)" }}
              id="hostContact"
            >
              Contact: -
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontWeight: 700 }}>Nearby suggestions</div>
        <div id="nearbyList" className="nearby-list">
          {/* injected */}
        </div>
      </aside>
    </main>
    <footer
      style={{
        textAlign: "center",
        color: "var(--muted)",
        fontSize: 13,
        padding: "12px 0"
      }}
    >
      © 2025 UKM Students off School Rented System — demo UI
    </footer>
  </div>
  {/* Sign-in required modal */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" role="document">
      <h3 id="modalTitle">Sign in required</h3>
      <p id="modalText">You need to sign in to perform this action.</p>
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
        <button id="modalClose" className="btn btn-primary">
          Continue as Guest
        </button>
      </div>
    </div>
  </div>
</>
