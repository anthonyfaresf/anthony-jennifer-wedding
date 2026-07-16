import { BLOSTA_WOFF2_BASE64 } from './blostaFont';

// Private admin gallery, served by the Worker at "/admin". Same wedding-site
// aesthetic (cream paper + olive/gold, Blosta + Tenor Sans). Unauthenticated
// shell — it reveals nothing on its own; it asks for the admin code, keeps it in
// localStorage, and calls /api/admin/gallery with a Bearer header. The gallery
// endpoint returns presigned R2 URLs so the browser can show each photo/video
// directly. Uploads are grouped into Photos and Videos.
//
// Authoring constraint (same as guestPage.ts): the whole string is a template
// literal, so NO backticks and NO "${" inside — the inner <script> uses string
// concatenation. The one dynamic value (the embedded font) is a token replace.

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f4ece0">
<meta name="robots" content="noindex, nofollow">
<title>Guest uploads · Anthony &amp; Jennifer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap" rel="stylesheet">
<style>
@font-face{font-family:"Blosta";src:url("data:font/woff2;base64,__BLOSTA__") format("woff2");font-weight:400;font-style:normal;font-display:swap;}
:root{
  --cream:#f4ece0; --parchment:#e8ddc8; --display:#495314; --olive:#6e7a3a;
  --body:#2b2b2b; --gold:#b8924a; --gold-soft:#d4b87a;
  --font-display:"Blosta",Georgia,serif;
  --font-body:"Tenor Sans",system-ui,-apple-system,sans-serif;
}
*{box-sizing:border-box;}
html{-webkit-text-size-adjust:100%;}
body{
  margin:0; min-height:100svh; background:var(--cream); color:var(--body);
  font-family:var(--font-body); font-size:16px; line-height:1.6;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  padding:calc(env(safe-area-inset-top) + 28px) 18px calc(env(safe-area-inset-bottom) + 40px);
}
body::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.5;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.14 0 0 0 0 0.13 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");}
.wrap{max-width:1000px;margin:0 auto;}
header{text-align:center;margin-bottom:22px;}
.names{font-family:var(--font-display);color:var(--display);font-weight:400;font-size:2.1rem;line-height:1.05;letter-spacing:.01em;margin:0 0 12px;}
.names .amp{color:var(--gold);font-size:.86em;margin:0 .05em;}
.rule{width:60px;height:1px;background:var(--gold);opacity:.75;margin:0 auto 14px;}
.eyebrow{font-family:var(--font-body);text-transform:uppercase;letter-spacing:.32em;font-size:.72rem;color:var(--display);opacity:.82;margin:0;}
.card{max-width:380px;margin:0 auto;background:rgba(244,236,224,.82);
  -webkit-backdrop-filter:blur(14px) saturate(1.1);backdrop-filter:blur(14px) saturate(1.1);
  border:1px solid rgba(73,83,20,.10);border-radius:20px;padding:22px;text-align:center;
  box-shadow:0 22px 52px -22px rgba(42,37,32,.42),inset 0 1px 0 rgba(255,255,255,.4);}
.glabel{font-family:var(--font-display);color:var(--display);font-size:1.15rem;margin:0 0 12px;}
input[type=password]{width:100%;font-family:inherit;font-size:1rem;color:var(--body);text-align:center;letter-spacing:.08em;
  background:rgba(255,255,255,.6);border:1px solid rgba(73,83,20,.18);border-radius:12px;padding:12px 14px;}
.btn{margin-top:14px;width:100%;min-height:50px;border:none;border-radius:99px;cursor:pointer;
  background:var(--display);color:var(--cream);font-family:var(--font-body);font-size:1rem;letter-spacing:.02em;
  box-shadow:0 12px 26px -12px rgba(73,83,20,.6);transition:background .2s,transform .1s;}
.btn:hover{background:#3b4310;}
.btn:active{transform:translateY(1px);}
.gerr{min-height:1.2em;margin:10px 0 0;font-size:.86rem;color:#a6712a;}
.toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;
  margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(73,83,20,.14);}
.summary{display:flex;flex-wrap:wrap;gap:8px;}
.chip{display:inline-block;background:rgba(232,221,200,.6);border:1px solid rgba(73,83,20,.12);color:var(--display);
  border-radius:99px;padding:5px 12px;font-size:.8rem;letter-spacing:.02em;}
.tools{display:flex;align-items:center;gap:10px;}
.status{font-size:.8rem;color:#7a756a;}
.tbtn{border:1px solid rgba(73,83,20,.28);background:transparent;color:var(--display);border-radius:99px;
  padding:8px 16px;font-family:inherit;font-size:.85rem;cursor:pointer;}
.tbtn:hover{background:rgba(73,83,20,.07);}
.tbtn.ghost{color:#8a8578;border-color:rgba(73,83,20,.16);}
.empty{text-align:center;color:#7a756a;padding:40px 10px;}
.sec{margin-bottom:26px;}
.sec-h{font-family:var(--font-display);color:var(--display);font-weight:400;font-size:1.35rem;margin:0 0 14px;letter-spacing:.01em;}
.sec-count{color:var(--gold);font-size:.9rem;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;}
.tile{background:rgba(255,255,255,.5);border:1px solid rgba(73,83,20,.10);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;}
.media{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:var(--parchment);}
video.media{background:#20221a;}
.media-link{display:block;line-height:0;}
.tinfo{padding:10px 12px 12px;}
.who{margin:0;font-size:.9rem;color:var(--display);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sub{margin:2px 0 0;font-size:.74rem;color:#8a8578;}
.note{margin:8px 0 0;font-size:.82rem;color:#4a463f;line-height:1.45;}
.acts{margin-top:10px;display:flex;gap:14px;}
.acts a{font-size:.82rem;color:var(--olive);text-decoration:underline;text-underline-offset:3px;}
.acts a:hover{color:var(--display);}
footer{text-align:center;margin-top:30px;}
.credit{margin:0;text-transform:uppercase;font-size:.68rem;letter-spacing:.30em;color:rgba(43,43,43,.45);}
.credit a{color:rgba(73,83,20,.7);text-decoration:none;}
.credit a:hover{color:var(--display);text-decoration:underline;text-underline-offset:3px;}
.hidden{display:none !important;}
*:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:6px;}
@media (min-width:640px){.grid{grid-template-columns:repeat(auto-fill,minmax(185px,1fr));}}
</style>
</head>
<body>
<main class="wrap">
  <header>
    <h1 class="names">Anthony <span class="amp">&amp;</span> Jennifer</h1>
    <div class="rule" aria-hidden="true"></div>
    <p class="eyebrow">Guest Uploads · Private</p>
  </header>

  <section class="gate" id="gate">
    <div class="card">
      <p class="glabel">Enter your admin code</p>
      <input id="token" type="password" autocomplete="off" inputmode="text" placeholder="Admin code">
      <button class="btn" id="unlock">Unlock gallery</button>
      <p class="gerr" id="gateErr"></p>
    </div>
  </section>

  <section class="app hidden" id="app">
    <div class="toolbar">
      <div class="summary" id="summary"></div>
      <div class="tools">
        <span class="status" id="status"></span>
        <button class="tbtn" id="refresh">Refresh</button>
        <button class="tbtn ghost" id="signout">Sign out</button>
      </div>
    </div>

    <p class="empty hidden" id="empty">No photos or videos yet. When guests upload, they will appear here.</p>

    <section class="sec hidden" id="photosSec">
      <h2 class="sec-h">Photos <span class="sec-count"></span></h2>
      <div class="grid" id="photos"></div>
    </section>

    <section class="sec hidden" id="videosSec">
      <h2 class="sec-h">Videos <span class="sec-count"></span></h2>
      <div class="grid" id="videos"></div>
    </section>
  </section>

  <footer>
    <p class="credit">Designed &amp; developed by <a href="https://www.afandu.com" target="_blank" rel="noopener noreferrer">AF&amp;U</a></p>
  </footer>
</main>

<script>
(function(){
  var TKEY="wed_admin_token";
  var gate=document.getElementById("gate"),
      app=document.getElementById("app"),
      tokenInput=document.getElementById("token"),
      unlock=document.getElementById("unlock"),
      gateErr=document.getElementById("gateErr"),
      summary=document.getElementById("summary"),
      photos=document.getElementById("photos"),
      videos=document.getElementById("videos"),
      photosSec=document.getElementById("photosSec"),
      videosSec=document.getElementById("videosSec"),
      emptyEl=document.getElementById("empty"),
      refreshBtn=document.getElementById("refresh"),
      signout=document.getElementById("signout"),
      statusEl=document.getElementById("status");

  function token(){ try{ return localStorage.getItem(TKEY)||""; }catch(e){ return ""; } }
  function setToken(t){ try{ if(t){ localStorage.setItem(TKEY,t); } else { localStorage.removeItem(TKEY); } }catch(e){} }
  function showGate(msg){ app.classList.add("hidden"); gate.classList.remove("hidden"); gateErr.textContent=msg||""; try{ tokenInput.focus(); }catch(e){} }
  function showApp(){ gate.classList.add("hidden"); app.classList.remove("hidden"); }

  unlock.addEventListener("click",function(){ var t=tokenInput.value.trim(); if(!t){ return; } setToken(t); load(); });
  tokenInput.addEventListener("keydown",function(e){ if(e.key==="Enter"){ unlock.click(); } });
  refreshBtn.addEventListener("click",load);
  signout.addEventListener("click",function(){ setToken(""); tokenInput.value=""; showGate(""); });

  function human(b){ b=b||0; if(b>=1073741824){ return (b/1073741824).toFixed(1)+" GB"; } if(b>=1048576){ return Math.round(b/1048576)+" MB"; } return Math.max(1,Math.round(b/1024))+" KB"; }
  function when(ms){ try{ return new Date(ms).toLocaleString(); }catch(e){ return ""; } }
  function esc(s){ s=(s==null?"":String(s)); return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

  function load(){
    var t=token();
    if(!t){ showGate(""); return; }
    statusEl.textContent="Loading...";
    fetch("/api/admin/gallery",{ headers:{ "Authorization":"Bearer "+t } })
      .then(function(res){
        if(res.status===401||res.status===403){ setToken(""); showGate("That code did not work \\u2014 try again."); throw new Error("auth"); }
        if(!res.ok){ throw new Error("HTTP "+res.status); }
        return res.json();
      })
      .then(function(data){ showApp(); render(data); statusEl.textContent=""; })
      .catch(function(e){ if(String(e.message)!=="auth"){ statusEl.textContent="Could not load ("+e.message+")."; } });
  }

  function render(data){
    var ups=data.uploads||[];
    var ph=[], vd=[];
    ups.forEach(function(u){ if((u.contentType||"").indexOf("video/")===0){ vd.push(u); } else { ph.push(u); } });
    summary.innerHTML = chip(ups.length+" total") + chip(ph.length+" photos") + chip(vd.length+" videos") + chip(human(data.totalBytes));
    if(ups.length===0){ emptyEl.classList.remove("hidden"); photosSec.classList.add("hidden"); videosSec.classList.add("hidden"); return; }
    emptyEl.classList.add("hidden");
    fillSection(photosSec, photos, ph, "photo");
    fillSection(videosSec, videos, vd, "video");
  }

  function chip(t){ return "<span class='chip'>"+esc(t)+"</span>"; }

  function fillSection(sec, wrap, arr, kind){
    if(arr.length===0){ sec.classList.add("hidden"); wrap.innerHTML=""; return; }
    sec.classList.remove("hidden");
    sec.querySelector(".sec-count").textContent="("+arr.length+")";
    var html="";
    arr.forEach(function(u){
      var media = kind==="video"
        ? "<video class='media' preload='metadata' controls playsinline src='"+esc(u.url)+"'></video>"
        : "<a class='media-link' href='"+esc(u.url)+"' target='_blank' rel='noopener'><img class='media' loading='lazy' alt='' src='"+esc(u.url)+"'></a>";
      var who = u.uploaderName ? esc(u.uploaderName) : "Anonymous guest";
      var note = u.message ? "<p class='note'>\\u201c"+esc(u.message)+"\\u201d</p>" : "";
      var dl = u.downloadUrl || u.url;
      html += "<div class='tile'>"+ media +
        "<div class='tinfo'>"+
          "<p class='who'>"+who+"</p>"+
          "<p class='sub'>"+esc(when(u.createdAt))+" \\u00b7 "+esc(human(u.size))+"</p>"+
          note +
          "<div class='acts'>"+
            "<a href='"+esc(u.url)+"' target='_blank' rel='noopener'>Open</a>"+
            "<a href='"+esc(dl)+"' target='_blank' rel='noopener' download>Save</a>"+
          "</div>"+
        "</div>"+
      "</div>";
    });
    wrap.innerHTML=html;
  }

  if(token()){ load(); } else { showGate(""); }
})();
</script>
</body>
</html>`;

export const ADMIN_PAGE_HTML = HTML.replace('__BLOSTA__', function () { return BLOSTA_WOFF2_BASE64; });
