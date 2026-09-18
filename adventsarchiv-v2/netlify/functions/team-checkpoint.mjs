import {json,bad,cleanCode,loadSession,loadTeam,saveTeam,publicTeam} from './_utils.mjs';
export default async req=>{
  if(req.method!=='POST') return bad('Method not allowed',405);
  let body; try{body=await req.json()}catch{return bad('Ungültige Anfrage')}
  const session=cleanCode(body.session), id=String(body.team||''), code=String(body.code||'').trim().toUpperCase();
  const s=await loadSession(session); if(!s) return bad('Session nicht gefunden',404);
  const t=await loadTeam(session,id); if(!t) return bad('Team nicht gefunden',404);
  if(t.moderationStatus!=='approved') return bad('Team nicht freigegeben',409);
  const pending=Number(t.pendingCheckpoint||0); if(!pending) return bad('Für euer Team ist gerade kein Orts-Checkpoint offen',409);
  const cp=(s.checkpoints||[]).find(x=>x.piece===pending); if(!cp) return bad('Checkpoint-Konfiguration fehlt',500);
  if(code!==String(cp.verifyCode||'').toUpperCase()) return bad('Das ist nicht der QR-Code dieses Ortes',409);
  const pieces=new Set((t.piecesCollected||[]).map(Number)); pieces.add(pending); t.piecesCollected=[...pieces].sort((a,b)=>a-b); t.pendingCheckpoint=null;
  await saveTeam(t); return json({ok:true,piece:pending,roman:cp.roman,place:cp.place,team:publicTeam(t)});
}
