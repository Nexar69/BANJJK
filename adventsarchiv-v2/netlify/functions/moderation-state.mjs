import {json,bad,cleanCode,loadSession,listTeams,publicTeam} from './_utils.mjs';
export default async req=>{
  const u=new URL(req.url), session=cleanCode(u.searchParams.get('session')), modToken=u.searchParams.get('token')||'';
  const s=await loadSession(session); if(!s) return bad('Session nicht gefunden',404); if(modToken!==s.moderatorToken&&modToken!==s.hostToken) return bad('Moderator-Token ungültig',403);
  const all=(await listTeams(session)).map(publicTeam).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  return json({ok:true,session:{code:s.code,className:s.className,status:s.status},pending:all.filter(t=>t.moderationStatus==='pending'),approved:all.filter(t=>t.moderationStatus==='approved'),rejected:all.filter(t=>t.moderationStatus==='rejected')});
}
