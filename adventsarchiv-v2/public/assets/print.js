const rb=Array.from({length:40},(_,i)=>['◆','●','▲','■'][i%4]);
const windows=new Set([2,9,18,27,33,34,37,39]);const word='SCHLEIFE';[...windows].forEach((idx,i)=>rb[idx]=word[i]);document.querySelector('#ribbonBase').innerHTML=rb.map(x=>`<span>${x}</span>`).join('');document.querySelector('#ribbonMask').innerHTML=rb.map((_,i)=>`<span class="${windows.has(i)?'window':''}">${windows.has(i)?'AUSSCHNEIDEN':'■'}</span>`).join('');
const snow=Array.from({length:36},(_,i)=>['❄','✦','·','◇'][i%4]);const letters={1:'F',8:'L',14:'O',21:'C',27:'K',34:'E'};Object.entries(letters).forEach(([i,l])=>snow[+i]=l);document.querySelector('#snowBase').innerHTML=snow.map(x=>`<span>${x}</span>`).join('');const targets=[1,8,14,21,27,34].map(i=>[Math.floor(i/6),i%6]);const oldWins=new Set(targets.map(([r,c])=>(5-c)*6+r));document.querySelector('#snowMask').innerHTML=snow.map((_,i)=>`<span class="${oldWins.has(i)?'window':''}">${oldWins.has(i)?'FENSTER':'❄'}</span>`).join('');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function waitQr(){for(let i=0;i<60&&!window.QRCode;i++)await new Promise(r=>setTimeout(r,100));return !!window.QRCode}
async function simpleQr(el,text,width=120){const c=document.createElement('canvas');el.append(c);await QRCode.toCanvas(c,text,{width,margin:2,errorCorrectionLevel:'M'});return c}
async function staticQrs(){if(!await waitQr())return;for(const el of document.querySelectorAll('.qr-print'))await simpleQr(el,el.dataset.code,120)}
function cropQuarter(full,piece,target){const half=full.width/2,sx=(piece===2||piece===4)?half:0,sy=piece>=3?half:0;target.width=half;target.height=half;target.getContext('2d').drawImage(full,sx,sy,half,half,0,0,half,half)}
async function checkpointPack(){
 const box=document.querySelector('#checkpointPack'),q=new URLSearchParams(location.search),session=(q.get('session')||'').toUpperCase(),token=q.get('token')||'';
 if(!session||!token){box.innerHTML='<section class="physical-sheet"><div class="config-warning"><strong>Keine Session ausgewählt.</strong><br>Öffnet dieses Druckpack über den Host-Bereich, damit die vier Ortsnamen und der finale QR korrekt erzeugt werden.</div></section>';return}
 try{
  const r=await fetch(`/api/host/state?session=${encodeURIComponent(session)}&token=${encodeURIComponent(token)}`);const d=await r.json();if(!r.ok)throw new Error(d.error||'Hostdaten konnten nicht geladen werden');
  if(!d.session.checkpointsConfigured)throw new Error('Speichert im Host-Bereich zuerst alle vier Checkpoint-Orte.');
  if(!await waitQr())throw new Error('QR-Bibliothek konnte nicht geladen werden.');
  const full=document.createElement('canvas');await QRCode.toCanvas(full,d.session.finalGateUrl,{width:640,margin:4,errorCorrectionLevel:'H'});
  const copies=Math.max(1,Math.min(20,d.session.fragmentCopies||8));
  box.innerHTML=d.session.checkpoints.map(cp=>`<section class="physical-sheet checkpoint-station" id="checkpoint-${cp.piece}"><div class="checkpoint-head"><div><div class="micro">ORTSCHECKPOINT ${cp.roman} · NACH AKTE ${String(cp.stage).padStart(2,'0')}</div><h1>QR-Fragment ${cp.roman}</h1><div class="checkpoint-place">📍 ${esc(cp.place)}</div></div><div class="checkpoint-verify"><div class="verify-qr" data-code="${esc(cp.verifyCode)}"></div><small>CHECKPOINT SCANNEN</small></div></div><p>Teams kommen erst hierher, wenn die Website diesen Ort nennt. Jedes Team nimmt <strong>ein</strong> Fragment unten mit und scannt vor dem Weitergehen den kleinen Checkpoint-QR oben.</p><div class="fragment-copy-grid">${Array.from({length:copies},(_,i)=>`<div class="fragment-cut"><span>✂ TEAM-FRAGMENT ${cp.roman} · ${i+1}</span><canvas data-piece="${cp.piece}"></canvas></div>`).join('')}</div><p class="print-note"><strong>Host:</strong> Wenn die Fragmente ausgehen, druckt diese einzelne Seite erneut. Alle Teams derselben Session sammeln denselben finalen QR.</p></section>`).join('');
  for(const el of box.querySelectorAll('.verify-qr'))await simpleQr(el,el.dataset.code,170);
  for(const c of box.querySelectorAll('canvas[data-piece]'))cropQuarter(full,Number(c.dataset.piece),c);
 }catch(err){box.innerHTML=`<section class="physical-sheet"><div class="config-warning"><strong>Checkpoint-Pack nicht bereit.</strong><br>${esc(err.message)}</div></section>`}
}
await checkpointPack();await staticQrs();
