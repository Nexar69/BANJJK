import {json,bad,cleanCode,loadSession,loadTeam,saveTeam,publicTeam} from './_utils.mjs';
export default async req=>{
  if(req.method!=='POST') return bad('Method not allowed',405);
  let body; try{body=await req.json()}catch{return bad('Ungültige Anfrage')}
  const session=cleanCode(body.session), modToken=String(body.moderatorToken||''), id=String(body.team||''), decision=String(body.decision||'');
  const s=await loadSession(session); if(!s)return bad('Session nicht gefunden',404); if(modToken!==s.moderatorToken&&modToken!==s.hostToken)return bad('Moderator-Token ungültig',403);
  const t=await loadTeam(session,id); if(!t)return bad('Team nicht gefunden',404); if(t.moderationStatus!=='pending')return bad('Dieses Team wurde bereits moderiert',409);
  const now=Date.now();
  if(decision==='approve'){t.moderationStatus='approved';t.approvedAt=now;t.startedAt=now;}
  else if(decision==='reject'){t.moderationStatus='rejected';t.rejectedAt=now;}
  else return bad('Ungültige Entscheidung');
  await saveTeam(t); return json({ok:true,team:publicTeam(t)});
}
