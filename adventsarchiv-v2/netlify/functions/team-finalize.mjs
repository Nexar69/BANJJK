import {json,bad,cleanCode,loadSession,loadTeam,saveTeam,publicTeam} from './_utils.mjs';
import {accepts,TOTAL_STAGES} from './_game-data.mjs';
export default async req=>{
  if(req.method!=='POST') return bad('Method not allowed',405);
  let body; try{body=await req.json()}catch{return bad('Ungültige Anfrage')}
  const session=cleanCode(body.session), id=String(body.team||''), gate=String(body.gate||''), answer=body.answer;
  const s=await loadSession(session); if(!s) return bad('Session nicht gefunden',404);
  if(gate!==s.finalGateToken) return bad('Dieser finale QR gehört nicht zu dieser Session',403);
  const t=await loadTeam(session,id); if(!t) return bad('Team nicht gefunden',404);
  if(t.moderationStatus!=='approved') return bad('Team nicht freigegeben',409);
  if(t.finishedAt) return json({ok:true,correct:true,finished:true,team:publicTeam(t)});
  if(t.stage!==TOTAL_STAGES) return bad('Das Finale ist für euch noch nicht freigeschaltet',409);
  if(t.pendingCheckpoint) return bad('Ihr habt noch einen Orts-Checkpoint offen',409);
  const pieces=new Set((t.piecesCollected||[]).map(Number)); if([1,2,3,4].some(n=>!pieces.has(n))) return bad('Euch fehlt noch mindestens ein QR-Fragment',409);
  t.attempts[String(TOTAL_STAGES)]=(t.attempts[String(TOTAL_STAGES)]||0)+1;
  if(!accepts(TOTAL_STAGES,answer)){t.wrong=(t.wrong||0)+1;await saveTeam(t);return json({ok:true,correct:false,wrong:t.wrong,attempts:t.attempts[String(TOTAL_STAGES)]});}
  t.correct=(t.correct||0)+1; t.finishedAt=Date.now(); t.stage=TOTAL_STAGES; await saveTeam(t);
  return json({ok:true,correct:true,finished:true,team:publicTeam(t)});
}
