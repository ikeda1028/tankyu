(() => {
 let dialog,history=[],character,recognition,audio,url,controller,session=0,busy=false,lastReply='',audioGeneration=0;
 const el=id=>dialog.querySelector('#'+id);
 function stopAudio(){audioGeneration++;if(audio){audio.pause();audio=null;}if(url){URL.revokeObjectURL(url);url=null;}}
 function endMic(){if(recognition){recognition.onend=null;recognition.abort();recognition=null;}}
 function close(){session++;controller?.abort();endMic();stopAudio();busy=false;}
 function line(role,text){const p=document.createElement('p');p.className='mentor-chat-line '+role;const label=document.createElement('strong');label.textContent=role==='user'?'あなた':character.name;p.append(label,document.createTextNode(text));el('mentor-chat-log').append(p);p.scrollIntoView({block:'nearest'});}
 async function speak(text,token){
  if(!character.mentorBehavior.voiceOutput)return;stopAudio();const generation=audioGeneration;
  try{const r=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice:character.mentorBehavior.voice}),signal:controller?.signal});if(!r.ok)throw Error();const blob=await r.blob();if(token!==session||generation!==audioGeneration)return;url=URL.createObjectURL(blob);audio=new Audio(url);await audio.play();}
  catch{if(token===session&&generation===audioGeneration)el('mentor-chat-status').textContent='音声を再生できませんでした。返事は文字で読めます。';}
 }
 async function send(){
  const input=el('mentor-chat-input'),text=input.value.trim();if(!text||busy)return;
  endMic();stopAudio();const token=session;busy=true;el('mentor-chat-send').disabled=true;el('mentor-chat-mic').disabled=true;input.value='';line('user',text);history.push({role:'user',content:text});controller=new AbortController();el('mentor-chat-status').textContent='考えています…';
  try{const r=await fetch('/api/mentor-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({character,messages:history.slice(-16)}),signal:controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'返事を作れませんでした');if(token!==session)return;history.push({role:'assistant',content:data.text});lastReply=data.text;line('assistant',data.text);el('mentor-chat-status').textContent='';await speak(data.text,token);}
  catch(e){if(token===session){history.pop();input.value=text;el('mentor-chat-status').textContent=e.name==='AbortError'?'会話を停止しました':e.message;}}
  finally{if(token===session){busy=false;el('mentor-chat-send').disabled=false;el('mentor-chat-mic').disabled=!character.mentorBehavior.voiceInput||!(window.SpeechRecognition||window.webkitSpeechRecognition);input.focus();}}
 }
 function mic(){
  if(recognition){recognition.stop();return;}const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)return;
  stopAudio();const token=session;let transcript='';const rec=new Recognition();recognition=rec;rec.lang='ja-JP';rec.continuous=false;rec.interimResults=true;
  rec.onresult=e=>{if(token!==session)return;transcript=Array.from(e.results).map(r=>r[0].transcript).join('');el('mentor-chat-input').value=transcript;};
  rec.onerror=e=>{transcript='';if(token===session)el('mentor-chat-status').textContent=e.error==='not-allowed'?'マイクの許可が必要です。文字でも会話できます。':'音声を聞き取れませんでした。もう一度お試しください。';};
  rec.onend=()=>{recognition=null;if(token!==session)return;el('mentor-chat-mic').textContent='マイクで話す';if(transcript.trim())send();};
  try{rec.start();el('mentor-chat-mic').textContent='聞き取りを終了';el('mentor-chat-status').textContent='お話しください。話し終えると送信します。';}catch{recognition=null;el('mentor-chat-status').textContent='マイクを開始できませんでした。文字でも会話できます。';}
 }
 function open(value,{preview=false}={}){
  if(!dialog){dialog=document.createElement('dialog');dialog.className='mentor-chat-dialog';dialog.innerHTML='<form method="dialog"><button class="secondary-button" aria-label="会話を閉じる">閉じる</button></form><h2 id="mentor-chat-title"></h2><p class="mentor-chat-note">AIとの会話です。内容はこの画面を閉じると消えます。音声入力・返答の生成には外部サービスを利用します。</p><div id="mentor-chat-log" role="log" aria-live="polite"></div><label for="mentor-chat-input">気になっていること</label><textarea id="mentor-chat-input" maxlength="1800" rows="3"></textarea><div class="mentor-settings-actions"><button id="mentor-chat-mic" type="button">マイクで話す</button><button id="mentor-chat-send" type="button">送信</button><button id="mentor-chat-replay" type="button">返事を聞く</button><button id="mentor-chat-stop" type="button">音声を止める</button></div><p id="mentor-chat-status" role="status"></p>';document.body.append(dialog);dialog.addEventListener('close',close);el('mentor-chat-send').onclick=send;el('mentor-chat-mic').onclick=mic;el('mentor-chat-stop').onclick=()=>{endMic();stopAudio();el('mentor-chat-mic').textContent='マイクで話す';};el('mentor-chat-replay').onclick=()=>speak(lastReply,session);}
  close();character={name:value.name||'メンター',role:value.role||'',mentorBehavior:MentorBehavior.normalize(value.mentorBehavior)};history=[];lastReply=character.mentorBehavior.opening;el('mentor-chat-log').replaceChildren();el('mentor-chat-input').value='';el('mentor-chat-title').textContent=character.name+(preview?' — 応対を試す':'と話す');line('assistant',lastReply);history.push({role:'assistant',content:lastReply});el('mentor-chat-send').disabled=false;el('mentor-chat-mic').textContent='マイクで話す';const canMic=!!(window.SpeechRecognition||window.webkitSpeechRecognition);el('mentor-chat-mic').disabled=!character.mentorBehavior.voiceInput||!canMic;el('mentor-chat-replay').hidden=el('mentor-chat-stop').hidden=!character.mentorBehavior.voiceOutput;el('mentor-chat-status').textContent=!canMic&&character.mentorBehavior.voiceInput?'このブラウザーでは音声入力に対応していません。文字で会話できます。':'';dialog.showModal();controller=new AbortController();speak(lastReply,session);
 }
 window.MentorChat={open};
})();
