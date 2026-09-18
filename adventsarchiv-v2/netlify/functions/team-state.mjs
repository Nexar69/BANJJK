import {json,bad,cleanCode,loadSession,loadTeam,publicTeam} from './_utils.mjs';
export default async req=>{
  const u=new URL(req.url); const session=cleanCode(u.searchParams.get('session')); const id=u.searchParams.get('team')||'';
  const s=await loadSession(session); if(!s) return bad('Session nicht gefunden',404);
  const t=await loadTeam(session,id); if(!t) return bad('Team nicht gefunden',404);
  let checkpoint=null;
  if(t.pendingCheckpoint){const cp=(s.checkpoints||[]).find(x=>x.piece===Number(t.pendingCheckpoint)); if(cp) checkpoint={piece:cp.piece,roman:cp.roman,stage:cp.stage,place:cp.place};}
  return json({ok:true,session:{code:s.code,className:s.className,status:s.status},team:publicTeam(t),checkpoint});
}
