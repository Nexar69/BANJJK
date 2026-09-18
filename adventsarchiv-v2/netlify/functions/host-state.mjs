import {json,bad,cleanCode,loadSession,listTeams,publicTeam} from './_utils.mjs';
export default async req=>{
  const u=new URL(req.url), session=cleanCode(u.searchParams.get('session')), hostToken=u.searchParams.get('token')||''; const s=await loadSession(session); if(!s) return bad('Session nicht gefunden',404); if(hostToken!==s.hostToken) return bad('Host-Token ungültig',403);
  const all=(await listTeams(session)).map(publicTeam).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  const finished=all.filter(t=>t.moderationStatus==='approved'&&t.finishedAt); const fastest=[...finished].sort((a,b)=>a.durationMs-b.durationMs); const precise=[...finished].sort((a,b)=>b.accuracy-a.accuracy||a.durationMs-b.durationMs);
  const origin=new URL(req.url).origin;
  const checkpoints=(s.checkpoints||[]).map(c=>({...c}));
  return json({ok:true,session:{code:s.code,className:s.className,status:s.status,createdAt:s.createdAt,checkpointsConfigured:!!s.checkpointsConfigured,fragmentCopies:s.fragmentCopies||8,checkpoints,finalGateUrl:`${origin}/x/${s.code}/${encodeURIComponent(s.finalGateToken)}`,moderatorUrl:`${origin}/moderate/?session=${s.code}&token=${s.moderatorToken}`},teams:all,fastest,precise});
}
