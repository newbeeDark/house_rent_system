<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Home — UKM Students off School Rented System</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  /* Theme variables */\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.88);\n    --accent: #1e88ff;\n    --accent-2: #0b3d91;\n    --ink: #071028;\n    --muted: #6a7480;\n    --danger: #ff6b6b;\n    --radius:14px;\n    --shadow-lg: 0 18px 40px rgba(7,12,25,0.12);\n    --ease: cubic-bezier(.2,.9,.2,1);\n    --fast: 220ms;\n    --mid: 420ms;\n    --slow: 780ms;\n  }\n\n  /* Base */\n  html,body{\n    height:100%;\n    margin:0;\n    font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial;\n    color:var(--ink);\n    background:linear-gradient(180deg,#eef3fb,#fff);\n    -webkit-font-smoothing:antialiased;\n    -moz-osx-font-smoothing:grayscale;\n  }\n\n  .page{\n    min-height:100vh;\n    display:flex;\n    flex-direction:column;\n    gap:18px;\n    padding:20px;\n    box-sizing:border-box;\n    opacity:0;\n    transform:translateY(10px);\n    animation:pageIn var(--mid) var(--ease) forwards;\n  }\n  @keyframes pageIn { to { opacity:1; transform:none } }\n\n  /* Appbar */\n  header.appbar{\n    display:flex;\n    align-items:center;\n    justify-content:space-between;\n    gap:12px;\n    background:linear-gradient(180deg,rgba(255,255,255,0.8), rgba(255,255,255,0.65));\n    backdrop-filter: blur(6px);\n    -webkit-backdrop-filter: blur(6px);\n    border-radius:calc(var(--radius) + 6px);\n    padding:12px 16px;\n    box-shadow:var(--shadow-lg);\n    opacity:0; transform:translateY(-8px);\n    animation:fadeDown var(--mid) var(--ease) 120ms forwards;\n  }\n  @keyframes fadeDown { to { opacity:1; transform:none } }\n\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{\n    width:52px;height:44px;border-radius:10px;\n    display:grid;place-items:center;\n    background:linear-gradient(135deg,var(--accent),var(--accent-2));\n    color:white;font-weight:700;\n    box-shadow:0 8px 26px rgba(14,54,120,0.12);\n    transform:translateY(0);\n    animation:logoFloat 4200ms ease-in-out infinite;\n  }\n  @keyframes logoFloat { 0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)} }\n\n  .title{font-weight:700;font-size:15px}\n  .subtitle{font-size:12px;color:var(--muted);margin-top:2px}\n\n  nav.actions{display:flex;gap:8px;align-items:center}\n  nav.actions a, .btn {\n    font-size:14px;padding:8px 12px;border-radius:10px;border:0;text-decoration:none;cursor:pointer;\n    transition:transform 200ms var(--ease), box-shadow 200ms var(--ease), opacity 160ms;\n    background:transparent;color:var(--accent-2);\n  }\n  .btn:hover{ transform:translateY(-3px) }\n  .btn-primary{ background:linear-gradient(90deg,var(--accent),var(--accent-2)); color:#fff; box-shadow:0 10px 28px rgba(14,54,120,0.12) }\n  .btn-ghost{ background:transparent; border:1px solid rgba(12,20,40,0.06); color:var(--accent-2) }\n  .guest-pill{ background:linear-gradient(90deg, rgba(11,61,145,0.08), rgba(30,136,255,0.06)); color:var(--accent-2); font-weight:600 }\n\n  /* layout */\n  .hero { display:flex; gap:18px; align-items:center; }\n  .hero-left { flex:1; display:flex; flex-direction:column; gap:12px; }\n  .main{display:grid;grid-template-columns:1fr 360px;gap:18px;align-items:start;margin-top:6px}\n  @media(max-width:1000px){ .main{grid-template-columns:1fr} }\n\n  /* search panel */\n  .search-panel{\n    background:var(--card-bg); border-radius:14px; padding:14px;\n    box-shadow:0 8px 26px rgba(8,12,24,0.06); backdrop-filter:blur(6px);\n    transform:translateY(10px); opacity:0;\n  }\n  .search-panel.in-view{ animation:fadeUp var(--mid) var(--ease) forwards; }\n  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }\n\n  .search-row{display:flex;gap:8px;align-items:center}\n  .search-row input, .search-row select{\n    flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(10,18,30,0.06);font-size:14px;background:white;\n    transition: box-shadow 160ms var(--ease), transform 120ms var(--ease);\n  }\n  .search-row input:focus{ box-shadow:0 8px 20px rgba(14,54,120,0.06); transform: translateY(-2px); outline:none }\n\n  .small-hint{font-size:13px;color:var(--muted);margin-top:8px}\n\n  /* location display */\n  .location-bar{margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}\n  .loc-chip{padding:8px 10px;border-radius:10px;background:linear-gradient(90deg,rgba(30,136,255,0.06),rgba(30,136,255,0.02));color:var(--accent-2);font-weight:600;display:flex;gap:8px;align-items:center}\n  .addr{font-size:13px;color:var(--muted);max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n\n  /* list + cards */\n  .listings{display:flex;flex-direction:column;gap:12px;margin-top:12px}\n  .listing-card{\n    display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:12px;\n    background:linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,252,255,0.96));\n    border:1px solid rgba(10,16,28,0.02);box-shadow:0 6px 20px rgba(8,12,24,0.04);\n    opacity:0; transform:translateY(14px) scale(0.995) rotateX(0deg);\n    transform-origin: left top;\n    transition: transform 420ms cubic-bezier(.2,.9,.2,1), box-shadow 420ms cubic-bezier(.2,.9,.2,1);\n    will-change: transform, opacity, filter;\n  }\n\n  /* reveal animation (we add .in-view when visible) */\n  @keyframes cardIn {\n    from { opacity:0; transform:translateY(18px) scale(0.994); filter: blur(2px); }\n    to { opacity:1; transform:none; filter:none; }\n  }\n  .listing-card.in-view{ animation: cardIn var(--mid) var(--ease) both; }\n\n  .listing-card:hover{ transform:translateY(-8px) scale(1.01); box-shadow:0 34px 70px rgba(8,12,24,0.12) }\n\n  .thumb{width:140px;height:96px;border-radius:10px;background-size:cover;background-position:center;flex-shrink:0;box-shadow:0 10px 30px rgba(10,20,40,0.06)}\n  .info{flex:1;display:flex;flex-direction:column;gap:6px}\n  .title-row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}\n  .title{font-weight:700}\n  .meta{font-size:13px;color:var(--muted)}\n  .tags{display:flex;gap:8px;flex-wrap:wrap}\n  .tag{padding:6px 8px;border-radius:999px;font-size:12px;background:rgba(11,61,145,0.06);color:var(--accent-2);font-weight:600}\n  .nearby{background:linear-gradient(90deg,#e6f2ff,#eef7ff);color:var(--accent-2);border:1px solid rgba(30,136,255,0.08);animation:nearbyPulse 2.6s infinite ease-in-out}\n  @keyframes nearbyPulse { 0%{box-shadow:0 0 0 rgba(30,136,255,0.04)}50%{box-shadow:0 10px 30px rgba(30,136,255,0.04)}100%{box-shadow:0 0 0 rgba(30,136,255,0.04)} }\n\n  .actions-row{display:flex;align-items:center;gap:8px;margin-top:6px}\n  .price{font-weight:800;color:var(--accent-2);font-size:16px}\n  .distance{font-size:13px;color:var(--muted);margin-left:8px}\n  .heart{margin-left:auto;padding:8px;border-radius:10px;cursor:pointer;border:1px solid rgba(10,16,28,0.04);background:transparent;transition:transform 180ms var(--ease)}\n  .heart:hover{transform:scale(1.06)}\n  .heart.fav{color:var(--danger);transform:scale(1.06)}\n\n  /* sidebar */\n  .sidebar{background:var(--card-bg);border-radius:12px;padding:14px;box-shadow:0 8px 26px rgba(8,12,24,0.05);height:fit-content;transform:translateY(10px);opacity:0}\n  .sidebar.in-view{ animation:fadeUp var(--mid) var(--ease) forwards; }\n\n  .map-placeholder{height:200px;border-radius:10px;overflow:hidden;box-shadow:0 6px 18px rgba(8,12,24,0.06);background:#e9f2ff}\n  .map-placeholder iframe{width:100%;height:100%;border:0}\n\n  .nearby-list{display:flex;flex-direction:column;gap:8px;margin-top:10px}\n  .mini{display:flex;gap:10px;align-items:center;padding:8px;border-radius:10px;background:rgba(255,255,255,0.6);transition:transform 160ms var(--ease)}\n  .mini:hover{transform:translateX(6px)}\n\n  /* hero visual */\n  .hero-visual{width:320px;height:200px;border-radius:12px;overflow:hidden;box-shadow:0 18px 46px rgba(10,16,30,0.06);transform:translateZ(0);will-change:transform}\n  .hero-visual img{width:100%;height:100%;object-fit:cover;display:block;transform:translateY(0) scale(1.03);transition:transform 900ms var(--ease);}\n\n  /* small utilities */\n  .muted{ color:var(--muted); font-size:13px }\n\n  /* modal */\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:60}\n  .modal{width:min(520px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n\n  /* toast */\n  .__toast{transition:opacity 240ms var(--ease); opacity:0}\n\n  /* responsive */\n  @media (max-width:720px){\n    .logo{display:none}\n    .addr{max-width:60%}\n    .hero { flex-direction:column }\n    .hero-visual{width:100%;height:160px}\n    .main{grid-template-columns:1fr}\n    .listing-card{flex-direction:row}\n    .thumb{width:120px;height:86px}\n  }\n\n'
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
          <div className="subtitle">
            Find trusted off-campus housing near you
          </div>
        </div>
      </div>
      <nav className="actions" role="navigation" aria-label="Main actions">
        <a href="terms.html" className="link-muted" title="Terms">
          Terms
        </a>
        <a href="privacy.html" className="link-muted" title="Privacy">
          Privacy
        </a>
        <a href="register.html" className="link-muted" title="Register">
          Register
        </a>
        <a href="login.html" className="btn btn-ghost" title="Sign in">
          Log in
        </a>
        <button
          id="guestBtn"
          className="btn btn-primary guest-pill"
          title="Continue as guest"
        >
          Continue as Guest
        </button>
        <a
          id="favLink"
          href="favorites.html"
          className="btn btn-ghost"
          title="Favourites"
        >
          Favourites
        </a>
      </nav>
    </header>
    {/* hero (search + visual) */}
    <section className="hero" style={{ marginTop: 8 }}>
      <div className="hero-left">
        <div className="search-panel" role="search" aria-label="Search rentals">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              id="q"
              type="text"
              placeholder="Search by area, landmark, or keyword"
              aria-label="Search"
            />
            <select id="filter" aria-label="Price filter">
              <option value="all">All prices</option>
              <option value="low">Under RM 500</option>
              <option value="mid">RM 500 - RM 1000</option>
              <option value="high">Over RM 1000</option>
            </select>
            <button
              id="locBtn"
              className="btn btn-ghost"
              title="Use my location"
            >
              Use my location
            </button>
          </div>
          <div
            className="location-bar"
            id="locationBar"
            style={{ display: "none" }}
          >
            <div className="loc-chip" id="locChip">
              📍 Nearby
            </div>
            <div className="addr" id="addrText">
              Detecting your address…
            </div>
            <button
              id="refreshAddr"
              className="btn btn-ghost"
              title="Refresh address"
              style={{ marginLeft: "auto" }}
            >
              Refresh
            </button>
          </div>
          <div className="small-hint">
            System will prioritize nearby listings if you allow location access.
          </div>
        </div>
        {/* listings live below in main area (kept here for semantic grouping) */}
      </div>
      <div className="hero-visual" aria-hidden="true" id="heroVisual">
        <img
          id="heroImg"
          src="real-estate-9539531_1920.jpg"
          alt="Apartment interior"
        />
      </div>
    </section>
    <main className="main" role="main">
      <section>
        <div
          id="listings"
          className="listings"
          aria-live="polite"
          style={{ marginTop: 12 }}
        >
          {/* JS injects listing cards */}
        </div>
      </section>
      <aside className="sidebar" aria-label="Sidebar">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 700 }}>Nearby highlights</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Auto-prioritize
          </div>
        </div>
        <div className="map-placeholder" style={{ marginTop: 12 }}>
          <iframe
            id="mapFrame"
            src="https://maps.google.com/maps?width=100%&height=300&hl=en&q=Universiti%20Kebangsaan%20Malaysia%20Bangi%20Malaysia&ie=UTF8&t=&z=15&iwloc=B&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div
          id="mapArea"
          style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}
        >
          Address unavailable — showing area names only
        </div>
        <div style={{ marginTop: 12, fontWeight: 700 }}>Closest listings</div>
        <div id="nearbyList" className="nearby-list" aria-live="polite" />
      </aside>
    </main>
    <footer
      className="site-footer"
      style={{
        textAlign: "center",
        color: "var(--muted)",
        fontSize: 13,
        padding: "10px 0"
      }}
    >
      © 2025 UKM Students off School Rented System — demo UI. Links:{" "}
      <a href="login.html">Login</a> · <a href="register.html">Register</a>
    </footer>
  </div>
  {/* modal */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" role="document" aria-labelledby="modalTitle">
      <h3 id="modalTitle">Sign in required</h3>
      <p id="modalText">
        This feature requires an account. Please sign in or register to use it.
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
        <button id="modalClose" className="btn btn-primary">
          Continue as Guest
        </button>
      </div>
    </div>
  </div>
</>
