<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Favourites — UKM Students off School Rented System</title>

<style>
  :root{
    --bg:#f6f8fb;
    --card-bg: rgba(255,255,255,0.9);
    --accent: #1e88ff;
    --accent-2: #0b3d91;
    --ink: #071028;
    --muted: #6a7480;
    --radius:14px;
    --shadow-lg: 0 18px 40px rgba(7,12,25,0.12);
    --ease: cubic-bezier(.2,.9,.2,1);
    --danger:#ff6257;
  }

  html,body{height:100%;margin:0;font-family:-apple-system,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial;color:var(--ink);background:linear-gradient(180deg,#eef3fb,#fff);-webkit-font-smoothing:antialiased}
  .page{min-height:100vh;display:flex;flex-direction:column;gap:18px;padding:20px;box-sizing:border-box;opacity:0;transform:translateY(8px);animation:pageIn 420ms var(--ease) forwards}
  @keyframes pageIn{to{opacity:1;transform:none}}

  header.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(180deg,rgba(255,255,255,0.75), rgba(255,255,255,0.6));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:calc(var(--radius)+6px);padding:12px 16px;box-shadow:var(--shadow-lg)}
  .brand{display:flex;gap:12px;align-items:center}
  .logo{width:52px;height:44px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:white;font-weight:700;box-shadow:0 8px 22px rgba(14,54,120,0.12)}
  .title{font-weight:700;font-size:15px}
  .subtitle{font-size:12px;color:var(--muted);margin-top:2px}
  nav.actions{display:flex;gap:8px;align-items:center}
  nav.actions a, .btn {font-size:14px;padding:8px 12px;border-radius:10px;border:0;text-decoration:none;cursor:pointer;transition:transform 160ms var(--ease), box-shadow 160ms var(--ease)}
  .btn:hover{transform:translateY(-2px)}
  .btn-primary{background:linear-gradient(90deg,var(--accent),var(--accent-2));color:white;box-shadow:0 10px 28px rgba(14,54,120,0.12)}
  .btn-ghost{background:transparent;border:1px solid rgba(12,20,40,0.06);color:var(--accent-2)}
  .hint { font-size:13px;color:var(--muted) }

  main.content{display:flex;gap:18px;align-items:flex-start}
  @media (max-width:1000px){ main.content{flex-direction:column} }

  .panel{flex:1;background:var(--card-bg);border-radius:14px;padding:16px;box-shadow:0 8px 26px rgba(8,12,24,0.06);backdrop-filter:blur(6px)}
  h2{margin:0 0 10px 0}

  .locked{
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:22px;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,252,255,0.98));text-align:center}
  .locked p{color:var(--muted);margin:0}

  .fav-list{display:flex;flex-direction:column;gap:12px}
  .fav-card{
    display:flex;gap:12px;align-items:center;padding:12px;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,0.99),#fff);
    border:1px solid rgba(10,16,28,0.02);box-shadow:0 6px 20px rgba(8,12,24,0.04);transition:transform 260ms var(--ease),opacity 260ms var(--ease);
    opacity:0; transform:translateY(8px);
  }
  .fav-card.show{opacity:1;transform:none}
  .thumb{width:120px;height:80px;border-radius:8px;background-size:cover;background-position:center;flex-shrink:0}
  .meta{flex:1;display:flex;flex-direction:column;gap:6px}
  .meta .title{font-weight:700}
  .meta .sub{color:var(--muted);font-size:13px}

  .fav-actions{display:flex;gap:8px;align-items:center}
  .remove-btn{padding:8px;border-radius:8px;border:1px solid rgba(10,16,28,0.04);background:transparent;cursor:pointer}
  .export-btn{margin-left:auto;padding:8px 12px;border-radius:8px;background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#fff;border:0}

  /* sidebar */
  .sidebar{width:320px}
  .sidebar .panel{padding:12px}
  .empty-note{color:var(--muted);font-size:14px;text-align:center;padding:12px}

  /* animations for remove */
  @keyframes removeOut { to { transform:translateX(40px) scale(.98); opacity:0 } }

  /* modal */
  .modal-backdrop{position:fixed;inset:0;background:rgba(6,10,20,0.36);display:none;align-items:center;justify-content:center;z-index:60}
  .modal{width:min(520px,94vw);background:white;border-radius:12px;padding:16px;box-shadow:0 30px 80px rgba(2,6,23,0.28)}
  .modal h3{margin:0 0 8px}

  footer.site-footer{text-align:center;color:var(--muted);font-size:13px;padding:10px 0;margin-top:10px}
</style>
</head>
<body>
  <div class="page" role="document">
    <header class="appbar" role="banner" aria-label="Top navigation">
      <div class="brand">
        <div class="logo" aria-hidden="true">UKM</div>
        <div>
          <div class="title">UKM Students off School Rented System</div>
          <div class="subtitle">Your favourites</div>
        </div>
      </div>

      <nav class="actions" role="navigation" aria-label="Main actions">
        <a href="index.html" class="link-muted">Home</a>
        <a href="terms.html" class="link-muted">Terms</a>
        <a href="privacy.html" class="link-muted">Privacy</a>
        <a href="register.html" class="link-muted">Register</a>
        <a href="login.html" class="btn btn-ghost">Log in</a>
      </nav>
    </header>

    <main class="content" role="main">
      <section class="panel" aria-labelledby="favTitle">
        <h2 id="favTitle">Favourites</h2>
        <p class="hint">Items you saved for quick access. Login required to use this feature.</p>

        <!-- Locked view (shown when not logged in or guest) -->
        <div id="lockedView" class="locked" style="display:none">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><path d="M12 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" stroke="#0b3d91" stroke-width="1.2"/><path d="M17 8V7a5 5 0 1 0-10 0v1" stroke="#0b3d91" stroke-width="1.2"/><rect x="4" y="8.5" width="16" height="11" rx="2" stroke="#0b3d91" stroke-width="1.2"/></svg>
          <h3 style="margin:0">Sign in to view favourites</h3>
          <p>To protect your saved items and booking flow, favourites are only available for registered users.</p>
          <div style="display:flex;gap:10px;margin-top:8px">
            <a href="login.html" class="btn btn-ghost">Sign in</a>
            <a href="register.html" class="btn btn-primary">Register</a>
          </div>
        </div>

        <!-- Actual favourites list -->
        <div id="favListWrapper" style="display:none;margin-top:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <div style="font-weight:700">Saved properties</div>
            <button id="exportBtn" class="export-btn" title="Export favourites">Export</button>
          </div>
          <div id="favList" class="fav-list" aria-live="polite">
            <!-- fav cards injected here -->
          </div>
        </div>
      </section>

      <aside class="sidebar">
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">Quick actions</div>
            <div style="font-size:13px;color:var(--muted)">Account</div>
          </div>

          <div style="margin-top:10px">
            <div style="display:flex;gap:8px">
              <a href="index.html" class="btn btn-ghost">Browse</a>
              <a href="login.html" class="btn btn-primary">Sign in</a>
            </div>
          </div>

          <div class="empty-note" style="margin-top:14px">
            Saved items are private to your account. If you clear browser data, local-only saved items will be lost.
          </div>
        </div>
      </aside>
    </main>

    <footer class="site-footer">© 2025 UKM Students off School Rented System</footer>
  </div>

  <!-- modal for confirmation / sign-in -->
  <div class="modal-backdrop" id="modalBackdrop" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="modal" role="document">
      <h3 id="modalTitle">Confirm</h3>
      <p id="modalText">Are you sure?</p>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
        <button id="modalCancel" class="btn btn-ghost">Cancel</button>
        <button id="modalOk" class="btn btn-primary">OK</button>
      </div>
    </div>
  </div>

<script>
/* ========== Demo property dataset (same as index/property) ========== */
const properties = [
  { id:1, title:"Studio near UKM - 5 min", area:"Bangi", price:450, beds:1, img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=60", rating:4.6 },
  { id:2, title:"Cozy 1BR, close to bus stop", area:"Taman UKM", price:600, beds:1, img:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=60", rating:4.4 },
  { id:3, title:"Shared room (female-friendly)", area:"Bangi Baru", price:350, beds:1, img:"https://images.unsplash.com/photo-1598928506311-87e0ffb13243?auto=format&fit=crop&w=1200&q=60", rating:4.1 },
  { id:4, title:"2BR apartment — quiet neighbourhood", area:"Seksyen 3", price:1200, beds:2, img:"https://images.unsplash.com/photo-1600585153762-2a4f0f7e5931?auto=format&fit=crop&w=1200&q=60", rating:4.8 },
  { id:5, title:"Budget room with study desk", area:"Near UKM Gate", price:400, beds:1, img:"https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=60", rating:4.0 },
  { id:6, title:"Luxury condo 10min drive", area:"Kajang", price:2200, beds:3, img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=60", rating:4.9 }
];

/* ========== State checks ========== */
function isUserLoggedIn(){
  // Demo: real app should use a server-side session or JWT
  try{
    const logged = JSON.parse(localStorage.getItem('ukm_logged_in'));
    return !!logged;
  }catch(e){ return false; }
}
function isGuestMode(){
  try{ return !!JSON.parse(localStorage.getItem('ukm_is_guest')); }catch(e){ return false; }
}

/* ========== DOM refs ========== */
const lockedView = document.getElementById('lockedView');
const favListWrapper = document.getElementById('favListWrapper');
const favListEl = document.getElementById('favList');
const exportBtn = document.getElementById('exportBtn');

const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalOK = document.getElementById('modalOk');
const modalCancel = document.getElementById('modalCancel');

let pendingRemoveId = null;

/* ========== Helpers ========== */
function loadFavoritesFromStorage(){
  try{
    const arr = JSON.parse(localStorage.getItem('ukm_favorites') || '[]');
    if(Array.isArray(arr)) return arr;
    return [];
  }catch(e){ return []; }
}
function saveFavoritesToStorage(arr){
  try{ localStorage.setItem('ukm_favorites', JSON.stringify(arr)); }catch(e){}
}
function findPropertyById(id){ return properties.find(p => Number(p.id) === Number(id)); }

/* ========== Render logic ========== */
function renderLocked(){
  lockedView.style.display = 'flex';
  favListWrapper.style.display = 'none';
}

function renderFavList(){
  lockedView.style.display = 'none';
  favListWrapper.style.display = 'block';
  const favs = loadFavoritesFromStorage();
  favListEl.innerHTML = '';

  if(favs.length === 0){
    favListEl.innerHTML = `<div class="empty-note">No favourites yet. Browse listings and click the heart to save properties.</div>`;
    return;
  }

  // render each fav with slight staggered animation
  favs.forEach((id, idx) => {
    const p = findPropertyById(id);
    if(!p) return;
    const card = document.createElement('div');
    card.className = 'fav-card';
    // stagger
    setTimeout(()=> card.classList.add('show'), idx*80);

    card.innerHTML = `
      <div class="thumb" style="background-image:url('${p.img}')"></div>
      <div class="meta">
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="sub">${p.area} · ${p.beds} bed · Rating ${p.rating}</div>
      </div>
      <div class="fav-actions">
        <a class="btn btn-ghost" href="property.html?id=${p.id}">View</a>
        <button class="remove-btn" data-id="${p.id}" title="Remove">Remove</button>
      </div>
    `;
    favListEl.appendChild(card);

    // attach remove handler
    card.querySelector('.remove-btn').addEventListener('click', (e)=>{
      const removeId = e.currentTarget.getAttribute('data-id');
      // show confirm modal
      pendingRemoveId = Number(removeId);
      modalTitle.textContent = 'Remove favourite';
      modalText.textContent = 'Are you sure you want to remove this property from your favourites?';
      modalBackdrop.style.display = 'flex';
      modalBackdrop.setAttribute('aria-hidden','false');
    });
  });
}

/* simple escape helper */
function escapeHtml(s){ return String(s).replaceAll('<','&lt;').replaceAll('>','&gt;'); }

/* ========== Modal actions ========== */
modalOK.addEventListener('click', ()=>{
  if(pendingRemoveId !== null){
    // animate removal on matching card
    const btn = document.querySelector(`.remove-btn[data-id="${pendingRemoveId}"]`);
    if(btn){
      const card = btn.closest('.fav-card');
      card.style.animation = 'removeOut 280ms ease forwards';
      setTimeout(()=> {
        // remove from storage
        const favs = loadFavoritesFromStorage().filter(x => Number(x) !== Number(pendingRemoveId));
        saveFavoritesToStorage(favs);
        // re-render
        renderFavList();
      }, 300);
    } else {
      // fallback
      const favs = loadFavoritesFromStorage().filter(x => Number(x) !== Number(pendingRemoveId));
      saveFavoritesToStorage(favs);
      renderFavList();
    }
  }
  // close modal
  pendingRemoveId = null;
  modalBackdrop.style.display = 'none';
  modalBackdrop.setAttribute('aria-hidden','true');
});
modalCancel.addEventListener('click', ()=>{
  pendingRemoveId = null;
  modalBackdrop.style.display = 'none';
  modalBackdrop.setAttribute('aria-hidden','true');
});
modalBackdrop.addEventListener('click', (e)=>{ if(e.target === modalBackdrop){ pendingRemoveId = null; modalBackdrop.style.display = 'none'; modalBackdrop.setAttribute('aria-hidden','true'); } });

/* ========== Export favorites ========== */
exportBtn.addEventListener('click', ()=>{
  const favs = loadFavoritesFromStorage();
  const data = JSON.stringify(favs, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ukm_favourites.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ========== Init page state ========== */
(function init(){
  const logged = isUserLoggedIn();
  const guest = isGuestMode();

  if(!logged || guest){
    // show locked view — guests and anonymous users cannot access favourites
    renderLocked();
    return;
  }

  // logged in — show favourites
  renderFavList();
})();

/* ========== If you want to simulate login for testing: uncomment below ========
localStorage.setItem('ukm_logged_in', JSON.stringify(true));
localStorage.setItem('ukm_favorites', JSON.stringify([1,2,5])); 
Then reload the page.
============================================================================= */

</script>
</body>
</html>
