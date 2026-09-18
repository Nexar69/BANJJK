import {json,bad,cleanCode,loadSession,sessions} from './_utils.mjs';
export default async req=>{
  if(req.method!=='POST') return bad('Method not allowed',405); let body;try{body=await req.json()}catch{return bad('Ungültige Anfrage')}
  const code=cleanCode(body.session), s=await loadSession(code); if(!s) return bad('Session nicht gefunden',404); if(body.hostToken!==s.hostToken) return bad('Host-Token ungültig',403);
  s.status=body.closed===false?'open':'closed'; await sessions().setJSON(`session/${code}`,s); return json({ok:true,status:s.status});
}
