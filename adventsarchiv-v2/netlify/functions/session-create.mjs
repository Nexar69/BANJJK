import {json,bad,sessions,randomCode,token,cleanTeamName} from './_utils.mjs';
const CHECKPOINTS=[['I',6],['II',12],['III',18],['IV',23]];
export default async req=>{
  if(req.method!=='POST') return bad('Method not allowed',405);
  let body; try{body=await req.json()}catch{return bad('Ungültige Anfrage')}
  const className=cleanTeamName(body.className||'Klasse');
  if(Array.from(className).length<1) return bad('Klassenname ist zu kurz');
  const store=sessions(); let code='';
  for(let i=0;i<8;i++){code=randomCode(); if(!await store.get(`session/${code}`,{type:'json',consistency:'strong'})) break}
  const hostToken=token(), moderatorToken=token(), finalGateToken=randomCode(16), now=Date.now();
  const checkpoints=CHECKPOINTS.map(([roman,stage],i)=>({piece:i+1,roman,stage,place:'',verifyCode:`A24-${code}-${randomCode(10)}`}));
  await store.setJSON(`session/${code}`,{code,className,hostToken,moderatorToken,finalGateToken,checkpoints,checkpointsConfigured:false,fragmentCopies:8,createdAt:now,status:'open'});
  const origin=new URL(req.url).origin;
  return json({ok:true,code,className,hostToken,moderatorToken,checkpointsConfigured:false,joinUrl:`${origin}/?session=${code}`,moderatorUrl:`${origin}/moderate/?session=${code}&token=${moderatorToken}`});
}
