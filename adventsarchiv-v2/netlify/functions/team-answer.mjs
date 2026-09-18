import {json,bad,cleanCode,loadSession,loadTeam,saveTeam,publicTeam} from './_utils.mjs';
import {accepts,SEALS,TOTAL_STAGES} from './_game-data.mjs';
export default async req=>{
  if(req.method!=='POST') return bad('Method not allowed',405);
  let body; try{body=await req.json()}catch{return bad('Ungültige Anfrage')}
  const session=cleanCode(body.session), id=String(body.team||''), stage=Number(body.stage), answer=body.answer;
  const s=await loadSession(session); if(!s) return bad('Session nicht gefunden',404);
  const t=await loadTeam(session,id); if(!t) return bad('Team nicht gefunden',404);
  if(t.moderationStatus!=='approved') return bad('Euer Teamname muss zuerst von einem Moderator freigegeben werden',409);
  if(t.finishedAt) return json({ok:true,correct:true,finished:true,team:publicTeam(t)});
  if(t.pendingCheckpoint) return bad('Ihr müsst zuerst das QR-Fragment am angegebenen Ort finden und den Checkpoint scannen',409);
  if(stage!==t.stage) return bad('Diese Akte ist für euer Team noch nicht freigeschaltet',409);
  if(stage===TOTAL_STAGES) return bad('Das Finale wird nur über den zusammengesetzten QR-Code geöffnet',409);
  t.attempts[String(stage)]=(t.attempts[String(stage)]||0)+1;
  if(!accepts(stage,answer)){t.wrong=(t.wrong||0)+1;await saveTeam(t);return json({ok:true,correct:false,wrong:t.wrong,attempts:t.attempts[String(stage)]});}
  t.correct=(t.correct||0)+1;
  const seal=SEALS.get(stage)||null;
  t.stage=stage+1;
  let checkpoint=null;
  if(seal){
    const piece=seal.piece||[...SEALS.keys()].indexOf(stage)+1;
    const cp=(s.checkpoints||[]).find(x=>x.piece===piece);
    t.pendingCheckpoint=piece;
    checkpoint=cp?{piece:cp.piece,roman:cp.roman,stage:cp.stage,place:cp.place}:null;
  }
  await saveTeam(t);
  return json({ok:true,correct:true,nextStage:t.stage,seal,checkpoint,team:publicTeam(t)});
}
