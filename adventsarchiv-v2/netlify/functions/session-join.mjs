import {json,bad,cleanCode,cleanTeamName,loadSession,listTeams,saveTeam,token} from './_utils.mjs';
export default async req=>{
  if(req.method!=='POST') return bad('Method not allowed',405);
  let body; try{body=await req.json()}catch{return bad('Ungültige Anfrage')}
  const session=cleanCode(body.session); const s=await loadSession(session);
  if(!s) return bad('Session nicht gefunden',404); if(s.status!=='open') return bad('Diese Session ist geschlossen',409);
  if(!s.checkpointsConfigured) return bad('Der Host muss zuerst die vier QR-Fragment-Orte konfigurieren',409);
  const name=cleanTeamName(body.teamName); if(Array.from(name).length<1) return bad('Gebt eurem Team einen Namen');
  const existing=await listTeams(session); if(existing.some(t=>t.moderationStatus!=='rejected'&&t.name.localeCompare(name,'de',{sensitivity:'base'})===0)) return bad('Dieser Teamname ist schon vergeben',409);
  const id=token().slice(0,24); const now=Date.now();
  const team={id,session,name,startedAt:null,approvedAt:null,rejectedAt:null,finishedAt:null,stage:1,correct:0,wrong:0,attempts:{},piecesCollected:[],pendingCheckpoint:null,createdAt:now,moderationStatus:'pending'};
  await saveTeam(team); return json({ok:true,team:{id,name,session,stage:1,startedAt:null,moderationStatus:'pending'}});
}
