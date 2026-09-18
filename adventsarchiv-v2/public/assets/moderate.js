const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(url,opt={}){const r=await fetch(url,{headers:{'Content-Type':'application/json',...(opt.headers||{})},...opt});const d=await r.json().catch(()=>({error:'Serverantwort ungültig'}));if(!r.ok)throw new Error(d.error||'Serverfehler');return d}
const q=new URLSearchParams(location.search),session=(q.get('session')||'').toUpperCase(),token=q.get('token')||'';
function mini(t,status){return `<div class="mod-mini"><strong>${esc(t.name)}</strong><span>${status}</span></div>`}
function render(data){
 $('#className').textContent=`${data.session.className} · ${data.session.code}`;$('#pendingCount').textContent=`${data.pending.length} offen`;
 $('#pendingTeams').innerHTML=data.pending.length?data.pending.map(t=>`<article class="card mod-card" data-id="${t.id}"><div><div class="micro">Neuer Teamname</div><h2>${esc(t.name)}</h2><p>Dieses Team wartet. Der Timer läuft noch nicht.</p></div><div class="actions"><button class="secondary approve">✓ Freigeben</button><button class="red reject">✕ Ablehnen</button></div></article>`).join(''):'<div class="card"><h2>Alles sauber 🎄</h2><p>Gerade wartet kein Teamname auf eine Entscheidung.</p></div>';
 $('#approvedTeams').innerHTML=data.approved.length?data.approved.map(t=>mini(t,'✓ freigegeben')).join(''):'<p>Noch keine.</p>';$('#rejectedTeams').innerHTML=data.rejected.length?data.rejected.map(t=>mini(t,'✕ abgelehnt')).join(''):'<p>Noch keine.</p>';
 document.querySelectorAll('.mod-card').forEach(card=>{const id=card.dataset.id;card.querySelector('.approve').onclick=()=>decide(id,'approve');card.querySelector('.reject').onclick=()=>decide(id,'reject')});
}
async function decide(team,decision){try{await api('/api/moderation/action',{method:'POST',body:JSON.stringify({session,moderatorToken:token,team,decision})});await poll()}catch(e){$('#moderatorMsg').className='feedback bad';$('#moderatorMsg').textContent=e.message}}
async function poll(){if(!session||!token){$('#moderatorMsg').className='feedback bad';$('#moderatorMsg').textContent='Moderator-Link unvollständig. Öffnet den Link aus dem Host-Bereich.';return}try{const d=await api(`/api/moderation/state?session=${encodeURIComponent(session)}&token=${encodeURIComponent(token)}`);render(d);$('#moderatorMsg').textContent=''}catch(e){$('#moderatorMsg').className='feedback bad';$('#moderatorMsg').textContent=e.message}}
poll();setInterval(poll,2000);
