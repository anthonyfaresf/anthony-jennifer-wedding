// ⚠ THROWAWAY TEST HARNESS — NOT the final guest page.
// This exists only to exercise the presign -> PUT -> verify pipeline on real
// devices during Phase 1/4 testing. The real, designed guest page is built in
// Phase 2 through the anti-slop design stack. Do not ship this to guests.
export const TEST_HARNESS_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Photo Upload — TEST HARNESS</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 34rem; margin: 0 auto; padding: 1.25rem; color: #1a1a1a; }
  .banner { background: #fff3cd; border: 1px solid #e6c200; border-radius: 8px; padding: .6rem .8rem; font-size: .85rem; margin-bottom: 1rem; }
  h1 { font-size: 1.2rem; }
  label { display: block; margin: .75rem 0 .25rem; font-size: .9rem; }
  input[type=text], textarea { width: 100%; padding: .55rem; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
  input[type=file] { width: 100%; margin-top: .25rem; }
  button { margin-top: 1rem; width: 100%; padding: .8rem; font-size: 1rem; border: 0; border-radius: 10px; background: #1a1a1a; color: #fff; }
  button:disabled { opacity: .5; }
  ul { list-style: none; padding: 0; margin-top: 1rem; }
  li { display: flex; justify-content: space-between; gap: .75rem; padding: .5rem .1rem; border-bottom: 1px solid #eee; font-size: .9rem; }
  .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .status { flex: 0 0 auto; font-variant-numeric: tabular-nums; }
  .ok { color: #148f2b; } .err { color: #c0392b; } .busy { color: #666; }
</style>
</head>
<body>
  <div class="banner">⚠ TEST HARNESS — not the final design. Phase 2 builds the real guest page. Upload junk photos only; they get deleted before the wedding.</div>
  <h1>Share your photos 📸</h1>
  <label for="name">Your name (optional)</label>
  <input type="text" id="name" maxlength="120" placeholder="e.g. Aunt Marie">
  <label for="msg">A note (optional)</label>
  <textarea id="msg" rows="2" maxlength="500" placeholder="Best wishes!"></textarea>
  <label for="files">Photos / videos</label>
  <input type="file" id="files" accept="image/*,video/*" multiple>
  <button id="go">Upload</button>
  <ul id="list"></ul>

<script>
const $ = (id) => document.getElementById(id);

async function uploadOne(file, name, message, li) {
  const st = li.querySelector('.status');
  const setStatus = (cls, txt) => { st.className = 'status ' + cls; st.textContent = txt; };

  const contentType = file.type || '';
  let pres;
  try {
    pres = await fetch('/api/presign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType, sizeBytes: file.size, uploaderName: name, message })
    });
  } catch { return setStatus('err', '✗ no connection'); }
  if (!pres.ok) { const e = await pres.json().catch(() => ({})); return setStatus('err', '✗ ' + (e.detail || e.error || pres.status)); }
  const { uploadId, uploadUrl } = await pres.json();

  // PUT the bytes straight to R2, with retries for flaky mobile connections.
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    setStatus('busy', 'uploading… (' + attempt + '/3)');
    try {
      const put = await fetch(uploadUrl, { method: 'PUT', body: file, headers: contentType ? { 'Content-Type': contentType } : {} });
      ok = put.ok;
    } catch { /* network — retry */ }
    if (!ok) await new Promise((r) => setTimeout(r, attempt * 1000));
  }
  if (!ok) return setStatus('err', '✗ upload failed');

  // Only NOW confirm — success is shown solely after the server verifies R2.
  setStatus('busy', 'confirming…');
  try {
    const comp = await fetch('/api/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uploadId })
    });
    const cj = await comp.json().catch(() => ({}));
    setStatus(cj.ok ? 'ok' : 'err', cj.ok ? '✓ uploaded' : '✗ not confirmed');
  } catch { setStatus('err', '✗ not confirmed'); }
}

$('go').addEventListener('click', async () => {
  const files = Array.from($('files').files || []);
  if (!files.length) return;
  const name = $('name').value.trim();
  const message = $('msg').value.trim();
  const list = $('list');
  list.innerHTML = '';
  $('go').disabled = true;
  for (const file of files) {
    const li = document.createElement('li');
    li.innerHTML = '<span class="name"></span><span class="status busy">queued…</span>';
    li.querySelector('.name').textContent = file.name;
    list.appendChild(li);
  }
  await Promise.all(files.map((file, i) => uploadOne(file, name, message, list.children[i])));
  $('go').disabled = false;
});
</script>
</body>
</html>`;
