import '../mentor-behavior.js';
const {normalize,instructions}=globalThis.MentorBehavior;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'POST only'});}
 const body=req.body||{};
 if(JSON.stringify(body).length>32000)return res.status(413).json({error:'会話が長すぎます。新しい会話を始めてください。'});
 const behavior=normalize(body.character?.mentorBehavior);
 if(!behavior.enabled)return res.status(400).json({error:'このメンターのAI会話は無効です。'});
 const messages=(Array.isArray(body.messages)?body.messages:[]).slice(-16).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.trim().slice(0,1800)})).filter(m=>m.content);
 if(!messages.length||messages.at(-1).role!=='user')return res.status(400).json({error:'話したいことを入力してください。'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI会話はまだ接続されていません。管理者にお問い合わせください。'});
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},signal:AbortSignal.timeout(25000),body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',instructions:instructions({...body.character,mentorBehavior:behavior}),input:messages,max_output_tokens:700,store:false})});
  const data=await response.json();if(!response.ok)throw new Error('upstream');
  const text=data.output_text||data.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
  if(!text)throw new Error('empty');return res.status(200).json({text:text.slice(0,1600)});
 }catch{return res.status(502).json({error:'今は返事を作れませんでした。少し待って、もう一度お試しください。'});}
}
