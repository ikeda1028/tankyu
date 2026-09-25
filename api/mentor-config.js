import '../mentor-behavior.js';
function decode(v){if(v?.stringValue!==undefined)return v.stringValue;if(v?.booleanValue!==undefined)return v.booleanValue;if(v?.integerValue!==undefined)return Number(v.integerValue);if(v?.doubleValue!==undefined)return v.doubleValue;if(v?.arrayValue)return (v.arrayValue.values||[]).map(decode);if(v?.mapValue)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));return null;}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='GET')return res.status(405).json({error:'GET only'});
 try{
  const project=process.env.FIREBASE_PROJECT_ID||'tankyu-723fc';
  const r=await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents/publicExplorers/ikeda@manabinomichi_com/worlds/mentor-registry-v1`,{signal:AbortSignal.timeout(6000)});
  if(r.status===404)return res.status(200).json({mentors:[MentorBehavior.sageProfile]});if(!r.ok)throw Error();
  const data=await r.json(),profiles=decode({mapValue:{fields:data.fields}})?.mentors||[];
  const mentors=profiles.filter(p=>p.mentorEnabled!==false&&p.mentorBehavior?.enabled&&p.mentorBehavior?.castleEnabled).slice(0,30).map(p=>({id:String(p.id||'').slice(0,100),name:String(p.name||'メンター').slice(0,40),role:String(p.role||'').slice(0,80),mentorBehavior:MentorBehavior.normalize(p.mentorBehavior)}));
  return res.status(200).json({mentors});
 }catch{return res.status(503).json({error:'メンター設定を読み込めませんでした。'});}
}
