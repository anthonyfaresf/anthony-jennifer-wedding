import { BLOSTA_WOFF2_BASE64 } from './blostaFont';

// The guest-facing upload page. Self-contained HTML (inline CSS + JS) served by
// the Worker at "/". Matches the wedding site: cream paper + olive/gold, Blosta
// (display) + Tenor Sans (body). Best-practice UX: no login,
// multi-file, optional name/note (never gates the upload), real per-file progress,
// and success shown ONLY after the server verifies the object is in storage.
//
// Authoring constraint: this whole string is a template literal, so it must contain
// NO backticks and NO "${" — the inner <script> uses string concatenation on
// purpose. The one dynamic value (the embedded font) is injected via a token
// replace below, so it never needs interpolation syntax here.

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f4ece0">
<meta name="robots" content="noindex">
<title>Share your photos · Anthony &amp; Jennifer</title>
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
  font-family:var(--font-body); font-size:17px; line-height:1.62;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  padding:calc(env(safe-area-inset-top) + 30px) 20px calc(env(safe-area-inset-bottom) + 40px);
}
body::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.5;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.14 0 0 0 0 0.13 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");}
.wrap{max-width:600px;margin:0 auto;}
header{text-align:center;margin-bottom:26px;animation:rise .6s ease-out both;}
.names{font-family:var(--font-display);color:var(--display);font-weight:400;font-size:2.5rem;line-height:1.05;letter-spacing:.01em;margin:0 0 14px;}
.names .amp{color:var(--gold);font-size:.86em;margin:0 .05em;}
.rule{width:64px;height:1px;background:var(--gold);opacity:.75;margin:0 auto 16px;}
.eyebrow{font-family:var(--font-body);text-transform:uppercase;letter-spacing:.34em;font-size:.76rem;color:var(--display);opacity:.82;margin:0 0 14px;}
.lede{margin:0 auto;max-width:44ch;color:#4a463f;font-size:1.02rem;}
.card{
  position:relative;background:rgba(244,236,224,.82);
  -webkit-backdrop-filter:blur(14px) saturate(1.1);backdrop-filter:blur(14px) saturate(1.1);
  border:1px solid rgba(73,83,20,.10);border-radius:20px;padding:22px;
  box-shadow:0 22px 52px -22px rgba(42,37,32,.42),0 5px 16px -6px rgba(42,37,32,.16),inset 0 1px 0 rgba(255,255,255,.4);
  animation:rise .6s ease-out .06s both;
}
.drop{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  width:100%;min-height:150px;padding:26px 18px;text-align:center;cursor:pointer;
  border:1.5px dashed rgba(73,83,20,.35);border-radius:16px;background:rgba(232,221,200,.35);
  color:var(--display);transition:border-color .2s,background .2s,transform .1s;
}
.drop:hover,.drop.over,.drop:focus-visible{border-color:var(--gold);background:rgba(212,184,122,.18);outline:none;}
.drop:active{transform:scale(.995);}
.drop svg{width:38px;height:38px;stroke:var(--olive);fill:none;stroke-width:1.4;}
.drop-title{font-family:var(--font-display);font-size:1.25rem;color:var(--display);}
.drop-hint{font-size:.9rem;color:#6b665c;max-width:32ch;}
.list{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:10px;}
.item{display:flex;align-items:center;gap:12px;padding:10px;border-radius:14px;background:rgba(255,255,255,.42);border:1px solid rgba(73,83,20,.07);}
.item.ok{background:rgba(110,122,58,.10);border-color:rgba(110,122,58,.25);}
.item.failed{background:rgba(184,146,74,.10);border-color:rgba(184,146,74,.30);}
.thumb{flex:0 0 auto;width:54px;height:54px;border-radius:10px;overflow:hidden;background:var(--parchment);display:flex;align-items:center;justify-content:center;}
.thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.thumb svg{width:24px;height:24px;stroke:var(--olive);fill:none;stroke-width:1.4;}
.meta{flex:1 1 auto;min-width:0;}
.fname{font-size:.92rem;color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fsize{font-size:.78rem;color:#8a8578;margin-top:1px;}
.barwrap{height:5px;border-radius:99px;background:rgba(73,83,20,.12);margin-top:7px;overflow:hidden;}
.bar{height:100%;width:0;background:linear-gradient(90deg,var(--gold-soft),var(--gold));border-radius:99px;transition:width .25s ease;}
.stat{font-size:.8rem;color:#6b665c;margin-top:5px;}
.stat.ok{color:var(--olive);}
.stat.err{color:#a6712a;}
.rm{flex:0 0 auto;width:30px;height:30px;border:none;border-radius:99px;background:transparent;color:#8a8578;font-size:1.35rem;line-height:1;cursor:pointer;}
.rm:hover{background:rgba(73,83,20,.08);color:var(--display);}
.fields{margin-top:18px;display:flex;flex-direction:column;gap:12px;}
.field{display:flex;flex-direction:column;gap:6px;}
.field>span{font-size:.86rem;color:var(--display);}
.field em{font-style:normal;color:#8a8578;}
.field input,.field textarea{
  width:100%;font-family:inherit;font-size:1rem;color:var(--body);
  background:rgba(255,255,255,.6);border:1px solid rgba(73,83,20,.18);border-radius:12px;padding:12px 14px;
}
.field textarea{resize:vertical;min-height:56px;}
.field input::placeholder,.field textarea::placeholder{color:#a09a8c;}
.link{background:none;border:none;color:var(--olive);font-family:inherit;font-size:.92rem;cursor:pointer;padding:2px 0;align-self:flex-start;text-decoration:underline;text-underline-offset:3px;}
.btn{
  margin-top:18px;width:100%;min-height:54px;border:none;border-radius:99px;cursor:pointer;
  background:var(--display);color:var(--cream);font-family:var(--font-body);font-size:1.02rem;letter-spacing:.02em;
  box-shadow:0 12px 26px -12px rgba(73,83,20,.6);transition:background .2s,transform .1s,opacity .2s;
}
.btn:hover{background:#3c451040;background:#3b4310;}
.btn:active{transform:translateY(1px);}
.btn:disabled{opacity:.4;cursor:default;box-shadow:none;}
.reassure{margin:14px 2px 0;font-size:.82rem;line-height:1.5;color:#7a756a;text-align:center;}
.done{text-align:center;padding:26px 18px;animation:rise .5s ease-out both;}
.done .ring{width:74px;height:74px;margin:0 auto 14px;border-radius:99px;background:rgba(110,122,58,.14);display:flex;align-items:center;justify-content:center;}
.done .ring svg{width:38px;height:38px;stroke:var(--olive);fill:none;stroke-width:1.6;}
.done h2{font-family:var(--font-display);color:var(--display);font-weight:400;font-size:1.7rem;margin:0 0 6px;}
.done p{margin:0 auto 18px;max-width:34ch;color:#4a463f;}
.done .again{display:inline-block;min-height:48px;padding:12px 26px;border-radius:99px;border:1px solid rgba(73,83,20,.3);background:transparent;color:var(--display);font-family:inherit;font-size:1rem;cursor:pointer;}
.done .again:hover{background:rgba(73,83,20,.06);}
footer{text-align:center;margin-top:30px;}
.foot-line{margin:0 0 12px;font-size:.8rem;color:#948e80;letter-spacing:.02em;}
.credit{margin:0;text-transform:uppercase;font-size:.68rem;letter-spacing:.30em;color:rgba(43,43,43,.45);}
.credit a{color:rgba(73,83,20,.7);text-decoration:none;text-underline-offset:3px;}
.credit a:hover{color:var(--display);text-decoration:underline;}
.hidden{display:none !important;}
*:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:6px;}
@keyframes rise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
@media (max-width:400px){.names{font-size:2.05rem;}.card{padding:18px;}}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms !important;transition-duration:.01ms !important;}}
</style>
</head>
<body>
<main class="wrap">
  <header>
    <h1 class="names">Anthony <span class="amp">&amp;</span> Jennifer</h1>
    <div class="rule" aria-hidden="true"></div>
    <p class="eyebrow">Share your photos &amp; videos</p>
    <p class="lede">Help us relive the day through your eyes — add the photos and videos you took, and they land straight in our private album.</p>
  </header>

  <section class="card" id="card">
    <label class="drop" id="drop" for="fileInput" tabindex="0" role="button" aria-label="Add photos and videos">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.2"/></svg>
      <span class="drop-title">Add photos &amp; videos</span>
      <span class="drop-hint">Tap to choose from your phone — pick as many as you like</span>
    </label>
    <input id="fileInput" type="file" accept="image/*,video/*" multiple hidden>

    <ul class="list" id="list" aria-live="polite"></ul>

    <div class="fields">
      <label class="field"><span>Your name <em>(optional)</em></span>
        <input id="name" type="text" autocomplete="name" enterkeyhint="done" placeholder="So we know who to thank">
      </label>
      <button type="button" class="link" id="noteToggle">＋ Add a note</button>
      <label class="field hidden" id="noteWrap"><span>A note for us <em>(optional)</em></span>
        <textarea id="note" rows="2" maxlength="500" placeholder="Say hello 👋"></textarea>
      </label>
    </div>

    <button class="btn" id="send" disabled>Send to Anthony &amp; Jennifer</button>
    <p class="reassure">Big videos are welcome — they can take a moment on venue Wi-Fi. Keep this page open until each one shows a check.</p>
  </section>

  <div class="done hidden" id="done">
    <div class="ring"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></div>
    <h2 class="done-count">Your photos are with us</h2>
    <p>Thank you for sharing your view of our day. It means so much to have it.</p>
    <button class="again" id="addMore">Add more</button>
  </div>

  <footer>
    <p class="foot-line">Anthony &amp; Jennifer · 18 July 2026 · Couvent Saint Jean, Okaibe</p>
    <p class="credit">Designed &amp; developed by <a href="https://afandu.com" target="_blank" rel="noopener noreferrer">AF&amp;U</a></p>
  </footer>
</main>

<script>
(function(){
  var MAXP=95*1024*1024, MAXV=2048*1024*1024;
  var input=document.getElementById("fileInput"),
      drop=document.getElementById("drop"),
      list=document.getElementById("list"),
      sendBtn=document.getElementById("send"),
      nameInput=document.getElementById("name"),
      noteToggle=document.getElementById("noteToggle"),
      noteWrap=document.getElementById("noteWrap"),
      note=document.getElementById("note"),
      card=document.getElementById("card"),
      doneEl=document.getElementById("done");
  var items=[], uid=0, sending=false;

  try{ var sn=localStorage.getItem("wed_name"); if(sn){ nameInput.value=sn; } }catch(e){}

  noteToggle.addEventListener("click",function(){ noteWrap.classList.remove("hidden"); noteToggle.classList.add("hidden"); note.focus(); });
  input.addEventListener("change",function(){ addFiles(input.files); input.value=""; });
  drop.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); input.click(); } });
  ["dragover","dragenter"].forEach(function(ev){ drop.addEventListener(ev,function(e){ e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave"].forEach(function(ev){ drop.addEventListener(ev,function(e){ e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop",function(e){ e.preventDefault(); drop.classList.remove("over"); if(e.dataTransfer&&e.dataTransfer.files){ addFiles(e.dataTransfer.files); } });

  function human(b){ if(b>=1073741824){return (b/1073741824).toFixed(1)+" GB";} if(b>=1048576){return Math.round(b/1048576)+" MB";} return Math.max(1,Math.round(b/1024))+" KB"; }
  function isImg(f){ return (f.type||"").indexOf("image/")===0 || /\\.(jpe?g|png|gif|webp|heic|heif)$/i.test(f.name); }
  function isVid(f){ return (f.type||"").indexOf("video/")===0 || /\\.(mp4|mov|m4v|webm)$/i.test(f.name); }
  function icon(kind){ if(kind==="vid"){ return "<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='M10 9l5 3-5 3z'/></svg>"; } return "<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='4' width='18' height='16' rx='2'/><circle cx='9' cy='10' r='2'/><path d='M4 17l5-4 4 3 3-2 4 3'/></svg>"; }

  function addFiles(files){
    for(var i=0;i<files.length;i++){
      var f=files[i];
      if(!isImg(f)&&!isVid(f)){ continue; }
      var cap=isVid(f)?MAXV:MAXP;
      var it={ file:f, id:++uid, status:(f.size>cap?"toobig":"queued"), el:null, bar:null, statEl:null };
      items.push(it);
      renderItem(it);
    }
    updateSend();
  }

  function renderItem(it){
    var li=document.createElement("li"); li.className="item";
    var thumb=document.createElement("div"); thumb.className="thumb";
    if(isImg(it.file)&&(it.file.type||"").indexOf("image/")===0){
      var img=document.createElement("img"); img.alt="";
      try{ img.src=URL.createObjectURL(it.file); }catch(e){}
      img.onload=function(){ try{URL.revokeObjectURL(img.src);}catch(e){} };
      img.onerror=function(){ thumb.innerHTML=icon("img"); };
      thumb.appendChild(img);
    } else { thumb.innerHTML=icon(isVid(it.file)?"vid":"img"); }
    var meta=document.createElement("div"); meta.className="meta";
    var nm=document.createElement("div"); nm.className="fname"; nm.textContent=it.file.name;
    var sz=document.createElement("div"); sz.className="fsize"; sz.textContent=human(it.file.size);
    var barWrap=document.createElement("div"); barWrap.className="barwrap"; var bar=document.createElement("div"); bar.className="bar"; barWrap.appendChild(bar);
    var st=document.createElement("div"); st.className="stat";
    meta.appendChild(nm); meta.appendChild(sz); meta.appendChild(barWrap); meta.appendChild(st);
    var rm=document.createElement("button"); rm.className="rm"; rm.type="button"; rm.setAttribute("aria-label","Remove "+it.file.name); rm.innerHTML="&times;";
    rm.addEventListener("click",function(){ it.status="removed"; li.remove(); updateSend(); });
    li.appendChild(thumb); li.appendChild(meta); li.appendChild(rm);
    it.el=li; it.bar=bar; it.statEl=st;
    if(it.status==="toobig"){
      barWrap.style.display="none"; rm.style.display="";
      setStat(it,(isVid(it.file)?"Too large — videos up to 2 GB":"Too large — photos up to 95 MB"),"err");
    } else { setStat(it,"Ready",""); }
    list.appendChild(li);
  }

  function setStat(it,txt,cls){ it.statEl.textContent=txt; it.statEl.className="stat"+(cls?(" "+cls):""); }

  function updateSend(){
    var ready=items.filter(function(it){ return it.status==="queued"; }).length;
    sendBtn.disabled=(ready===0||sending);
    sendBtn.textContent=ready>0?("Send "+ready+(ready===1?" photo":" items")+" to Anthony & Jennifer"):"Send to Anthony & Jennifer";
  }

  sendBtn.addEventListener("click",function(){ if(!sending){ startSend(); } });

  function startSend(){
    var queue=items.filter(function(it){ return it.status==="queued"; });
    if(!queue.length){ return; }
    sending=true; sendBtn.disabled=true;
    try{ var nm=nameInput.value.trim(); if(nm){ localStorage.setItem("wed_name",nm); } }catch(e){}
    queue.forEach(function(it){ it.status="pending"; });
    var idx=0, active=0, CONC=2, done=0, fail=0, total=queue.length;
    function pump(){
      while(active<CONC && idx<queue.length){
        (function(it){
          active++;
          uploadOne(it).then(function(){ done++; },function(){ fail++; }).then(function(){
            active--;
            if(done+fail===total){ finish(done,fail); } else { pump(); }
          });
        })(queue[idx++]);
      }
    }
    pump();
  }

  function uploadOne(it){
    var ct=it.file.type||"";
    it.bar.style.width="0%"; setStat(it,"Preparing…","");
    return api("/api/presign","POST",{ filename:it.file.name, sizeBytes:it.file.size, contentType:ct, uploaderName:(nameInput.value.trim()||undefined), message:(note.value.trim()||undefined) })
      .then(function(r){
        if(!r.ok||!r.body||!r.body.uploadUrl){ throw new Error(r.body&&r.body.error||"presign"); }
        it._id=r.body.uploadId; setStat(it,"Uploading…","");
        var onp=function(p){ it.bar.style.width=Math.round(p*100)+"%"; };
        if(r.body.multipart){ return mpUpload(it,r.body.uploadUrl,ct,r.body.partSize||33554432,onp); }
        return putRetry(r.body.uploadUrl,it.file,ct,onp);
      })
      .then(function(){ it.bar.style.width="100%"; setStat(it,"Finishing…",""); return api("/api/complete","POST",{ uploadId:it._id }); })
      .then(function(r){
        if(r.body&&r.body.ok){ it.status="done"; it.el.classList.add("ok"); setStat(it,"Shared \\u2713","ok"); }
        else { throw new Error("verify"); }
      })
      .catch(function(e){
        it.status="queued"; it.el.classList.add("failed"); it.bar.style.width="0%";
        setStat(it,"Didn\\u2019t send — tap Send to try again","err");
        throw e;
      });
  }

  // Big videos: sliced into ~32MB chunks, each sent (and retried) on its own —
  // one bad moment on venue wifi costs a chunk, not the whole video.
  function mpUpload(it,baseUrl,ct,partSize,onp){
    var file=it.file, total=file.size, parts=[];
    return api(baseUrl+"/start","POST",{}).then(function(r){
      if(!r.ok||!r.body||!r.body.ok){ throw new Error(r.body&&r.body.error||"mp-start"); }
      function sendPart(n,offset){
        if(offset>=total){ return api(baseUrl+"/finish","POST",{ parts:parts }).then(function(fr){
          if(!fr.ok||!fr.body||!fr.body.ok){ throw new Error(fr.body&&fr.body.error||"mp-finish"); }
        }); }
        var chunk=file.slice(offset,Math.min(offset+partSize,total));
        return putPartRetry(baseUrl+"/part/"+n,chunk,ct,function(loaded){
          if(onp){ onp((offset+loaded)/total); }
        }).then(function(etag){
          parts.push({ partNumber:n, etag:etag });
          return sendPart(n+1,offset+partSize);
        });
      }
      return sendPart(1,0);
    });
  }

  function putPartOnce(url,chunk,ct,onbytes){
    return new Promise(function(resolve,reject){
      var xhr=new XMLHttpRequest(); xhr.open("PUT",url,true);
      if(ct){ xhr.setRequestHeader("Content-Type",ct); }
      xhr.upload.onprogress=function(e){ if(e.lengthComputable&&onbytes){ onbytes(e.loaded); } };
      xhr.onload=function(){
        if(xhr.status>=200&&xhr.status<300){
          var etag=""; try{ etag=(JSON.parse(xhr.responseText)||{}).etag||""; }catch(e){}
          if(etag){ resolve(etag); } else { reject(new Error("no-etag")); }
        } else { reject(new Error("PART "+xhr.status)); }
      };
      xhr.onerror=function(){ reject(new Error("network")); };
      xhr.ontimeout=function(){ reject(new Error("timeout")); };
      xhr.send(chunk);
    });
  }
  function putPartRetry(url,chunk,ct,onbytes){
    var tries=3;
    function attempt(i){ return putPartOnce(url,chunk,ct,onbytes).catch(function(e){ if(i>=tries-1){ throw e; } return sleep(900*(i+1)).then(function(){ return attempt(i+1); }); }); }
    return attempt(0);
  }

  function putOnce(url,file,ct,onp){
    return new Promise(function(resolve,reject){
      var xhr=new XMLHttpRequest(); xhr.open("PUT",url,true);
      if(ct){ xhr.setRequestHeader("Content-Type",ct); }
      xhr.upload.onprogress=function(e){ if(e.lengthComputable&&onp){ onp(e.loaded/e.total); } };
      xhr.onload=function(){ (xhr.status>=200&&xhr.status<300)?resolve():reject(new Error("PUT "+xhr.status)); };
      xhr.onerror=function(){ reject(new Error("network")); };
      xhr.ontimeout=function(){ reject(new Error("timeout")); };
      xhr.send(file);
    });
  }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
  function putRetry(url,file,ct,onp){
    var tries=3;
    function attempt(i){ return putOnce(url,file,ct,onp).catch(function(e){ if(i>=tries-1){ throw e; } return sleep(900*(i+1)).then(function(){ return attempt(i+1); }); }); }
    return attempt(0);
  }
  function api(path,method,body){
    return fetch(path,{ method:method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      .then(function(res){ return res.json().catch(function(){ return {}; }).then(function(j){ return { ok:res.ok, status:res.status, body:j }; }); });
  }

  function finish(done,fail){
    sending=false;
    if(fail===0&&done>0){
      card.classList.add("hidden");
      doneEl.querySelector(".done-count").textContent = (done===1?"Your photo is with us":(done+" memories are with us"));
      doneEl.classList.remove("hidden");
      try{ doneEl.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){}
    } else {
      updateSend();
      if(fail>0){ sendBtn.disabled=false; }
    }
  }

  document.getElementById("addMore").addEventListener("click",function(){
    items=[]; list.innerHTML=""; doneEl.classList.add("hidden"); card.classList.remove("hidden"); updateSend();
    try{ window.scrollTo({top:0,behavior:"smooth"}); }catch(e){}
  });
})();
</script>
</body>
</html>`;

export const GUEST_PAGE_HTML = HTML.replace('__BLOSTA__', function () { return BLOSTA_WOFF2_BASE64; });
