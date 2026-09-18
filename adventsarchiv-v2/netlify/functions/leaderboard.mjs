import {json,bad,cleanCode,loadSession,listTeams,publicTeam} from './_utils.mjs';
export default async req=>{
  const u=new URL(req.url), session=cleanCode(u.searchParams.get('session')); const s=await loadSession(session); if(!s) return bad('Session nicht gefunden',404);
  const teams=(await listTeams(session)).filter(t=>t.moderationStatus==='approved'&&t.finishedAt).map(publicTeam);
  const fastest=[...teams].sort((a,b)=>a.durationMs-b.durationMs).slice(0,20);
  const precise=[...teams].sort((a,b)=>b.accuracy-a.accuracy||a.durationMs-b.durationMs).slice(0,20);
  return json({ok:true,session:{code:s.code,className:s.className},fastest,precise});
}
