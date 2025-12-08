<>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Profile — UKM Students off School Rented System</title>
  <style
    dangerouslySetInnerHTML={{
      __html:
        '\n  :root{\n    --bg:#f6f8fb;\n    --card-bg: rgba(255,255,255,0.94);\n    --accent:#1e88ff; --accent-2:#0b3d91;\n    --ink:#071028; --muted:#6a7480;\n    --radius:14px; --shadow:0 18px 40px rgba(7,12,25,0.12);\n    --ease:cubic-bezier(.2,.9,.2,1);\n    --danger:#ff6257; --success:#17c964;\n  }\n  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,Arial;background:linear-gradient(180deg,#eef3fb,#fff);color:var(--ink);-webkit-font-smoothing:antialiased}\n  .page{min-height:100vh;padding:18px;box-sizing:border-box;opacity:0;transform:translateY(8px);animation:pageIn 420ms var(--ease) forwards}\n  @keyframes pageIn{to{opacity:1;transform:none}}\n\n  header.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:calc(var(--radius)+6px);background:linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,255,255,0.6));box-shadow:var(--shadow);backdrop-filter:blur(8px)}\n  .brand{display:flex;gap:12px;align-items:center}\n  .logo{width:52px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:white;font-weight:700}\n  nav.actions{display:flex;gap:8px;align-items:center}\n  .btn{padding:8px 12px;border-radius:10px;border:0;cursor:pointer;font-size:14px}\n  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff}\n  .btn-ghost{background:transparent;border:1px solid rgba(10,16,28,0.06);color:var(--accent-2)}\n  .tiny{font-size:13px;color:var(--muted)}\n\n  main.layout{display:grid;grid-template-columns:1fr 360px;gap:18px;margin-top:14px}\n  @media(max-width:980px){ main.layout{grid-template-columns:1fr} }\n\n  .card{background:var(--card-bg);border-radius:12px;padding:16px;box-shadow:0 8px 26px rgba(8,12,24,0.06);backdrop-filter:blur(6px)}\n  h2{margin:0 0 8px 0}\n\n  form.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n  .full{grid-column:1/-1}\n  label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}\n  input[type="text"],input[type="email"],input[type="tel"],input[type="password"],select,textarea{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(10,16,28,0.06);background:white;box-sizing:border-box;font-size:14px}\n  textarea{min-height:100px;resize:vertical}\n  .field{background:linear-gradient(180deg,rgba(255,255,255,0.98),#fff);padding:10px;border-radius:10px}\n\n  .avatar-area{display:flex;gap:12px;align-items:center}\n  .avatar-preview{width:88px;height:88px;border-radius:18px;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:white;font-weight:800;font-size:20px;overflow:hidden}\n  .avatar-preview img{width:100%;height:100%;object-fit:cover;display:block}\n  .small{font-size:13px;color:var(--muted)}\n\n  .uploads{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}\n  .u-box{padding:8px;border-radius:8px;background:#fff;border:1px solid rgba(10,16,28,0.04);display:flex;gap:8px;align-items:center}\n  .file-name{font-size:13px;color:var(--muted)}\n\n  .prefs{display:flex;flex-direction:column;gap:8px}\n\n  .actions{display:flex;gap:10px;align-items:center;margin-top:12px}\n  .danger{background:linear-gradient(90deg,var(--danger),#ff8b8b);color:white}\n\n  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:90}\n  .modal{width:min(520px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}\n\n  .__toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100;padding:8px 14px;border-radius:10px;color:#fff;box-shadow:0 10px 30px rgba(14,54,120,0.12)}\n  .note{font-size:13px;color:var(--muted)}\n'
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
          <div className="tiny">Profile &amp; Account Settings</div>
        </div>
      </div>
      <nav className="actions" role="navigation">
        <a href="index.html" className="btn btn-ghost">
          Home
        </a>
        <a href="host-dashboard.html" className="btn btn-ghost">
          Dashboard
        </a>
        <a href="create-listing.html" className="btn btn-ghost">
          Create Listing
        </a>
        <a href="favorites.html" className="btn btn-ghost">
          Favourites
        </a>
        <a href="login.html" className="btn btn-ghost">
          Log in
        </a>
      </nav>
    </header>
    <main className="layout" role="main">
      <section className="card" aria-labelledby="profileTitle">
        <h2 id="profileTitle">My profile</h2>
        <p className="note">
          Edit your personal details. Changes are saved locally in this demo —
          replace with API calls for production.
        </p>
        <form id="profileForm" className="grid" noValidate="">
          <div className="field full">
            <label>Avatar</label>
            <div className="avatar-area">
              <div className="avatar-preview" id="avatarPreview">
                UK
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    id="btnUploadAvatar"
                    className="btn btn-ghost"
                  >
                    Upload avatar
                  </button>
                  <button
                    type="button"
                    id="btnRemoveAvatar"
                    className="btn btn-ghost"
                  >
                    Remove
                  </button>
                  <div
                    style={{ marginLeft: "auto" }}
                    className="small"
                    id="avatarInfo"
                  >
                    Max 3 MB
                  </div>
                </div>
                <div className="small" style={{ marginTop: 8 }}>
                  Avatar will be used on messages and listings.
                </div>
              </div>
            </div>
          </div>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" placeholder="e.g. Ahmad bin Ali" />
          </div>
          <div className="field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              type="text"
              placeholder="Public display name"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" placeholder="+60 12 345 6789" />
          </div>
          <div className="field full">
            <label htmlFor="roleSelect">Account role</label>
            <select id="roleSelect">
              <option value="student">Student</option>
              <option value="landlord">Landlord</option>
              <option value="agent">Agent</option>
            </select>
            <div className="note" style={{ marginTop: 8 }}>
              Switching to Landlord/Agent typically requires verification
              (upload documents) — this page only simulates that flow.
            </div>
          </div>
          <div className="field full" id="docUploadArea">
            <label>Identity / Verification documents</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="idInput"
                type="file"
                accept="image/*,application/pdf"
                style={{ display: "none" }}
              />
              <button type="button" id="btnUploadID" className="btn btn-ghost">
                Upload document
              </button>
              <div id="idFiles" className="uploads" style={{ marginLeft: 8 }} />
            </div>
            <div className="note" style={{ marginTop: 8 }}>
              For landlords/agents, upload property proof or agency license as
              required (max 3 MB each).
            </div>
          </div>
          <div className="field full">
            <label>Change password</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8
              }}
            >
              <input
                id="currentPwd"
                type="password"
                placeholder="Current password"
              />
              <input id="newPwd" type="password" placeholder="New password" />
              <input
                id="confirmPwd"
                type="password"
                placeholder="Confirm new password"
                className="full"
              />
            </div>
            <div
              id="pwdMsg"
              className="small"
              style={{ marginTop: 8, color: "var(--muted)" }}
            />
          </div>
          <div className="field full">
            <label>Notifications</label>
            <div className="prefs">
              <label>
                <input id="prefEmail" type="checkbox" /> Email notifications
              </label>
              <label>
                <input id="prefSMS" type="checkbox" /> SMS notifications
              </label>
              <label>
                <input id="prefPush" type="checkbox" /> Push notifications
                (demo)
              </label>
            </div>
          </div>
          <div className="field full">
            <label>Privacy</label>
            <div className="prefs">
              <label>
                <input id="profileVisibility" type="checkbox" /> Make profile
                visible to hosts
              </label>
              <label>
                <input id="showContact" type="checkbox" /> Show my contact on
                listings I post
              </label>
            </div>
          </div>
          <div className="field full">
            <label>Current detected address</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="address"
                type="text"
                placeholder="Allow location to detect"
              />
              <button id="locBtn" type="button" className="btn btn-ghost">
                Detect
              </button>
            </div>
            <div className="note" id="addrHint" style={{ marginTop: 8 }}>
              No map shown — only textual address for matching nearby listings.
            </div>
          </div>
          <div
            className="full"
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <button id="saveBtn" type="button" className="btn btn-primary">
              Save changes
            </button>
            <button id="exportBtn" type="button" className="btn btn-ghost">
              Export profile
            </button>
            <button id="signoutBtn" type="button" className="btn btn-ghost">
              Sign out
            </button>
            <button
              id="deleteBtn"
              type="button"
              className="btn danger"
              style={{ marginLeft: "auto" }}
            >
              Delete account
            </button>
          </div>
        </form>
      </section>
      <aside className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 700 }}>Account summary</div>
          <div className="tiny">Profile</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="small">
            <strong>Role:</strong> <span id="summaryRole">—</span>
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            <strong>Email:</strong> <span id="summaryEmail">—</span>
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            <strong>Phone:</strong> <span id="summaryPhone">—</span>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700 }}>Address</div>
          <div id="addrText" className="note" style={{ marginTop: 8 }}>
            Detecting address…
          </div>
          <div style={{ marginTop: 8 }}>
            <button id="refreshLoc" className="btn btn-ghost">
              Refresh location
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700 }}>Help</div>
          <ul style={{ marginTop: 8 }}>
            <li>
              <a href="terms.html">Terms &amp; Conditions</a>
            </li>
            <li>
              <a href="privacy.html">Privacy Policy</a>
            </li>
            <li>
              <a href="help.html">Account guide (placeholder)</a>
            </li>
          </ul>
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
  {/* Delete confirmation modal */}
  <div
    className="modal-backdrop"
    id="modalBackdrop"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
  >
    <div className="modal" id="modal">
      <h3 id="modalTitle">Confirm account deletion</h3>
      <p id="modalBody">
        Are you sure you want to permanently delete your account? This action
        cannot be undone.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 12
        }}
      >
        <button id="modalCancel" className="btn btn-ghost">
          Cancel
        </button>
        <button id="modalConfirm" className="btn danger">
          Delete
        </button>
      </div>
    </div>
  </div>
</>
