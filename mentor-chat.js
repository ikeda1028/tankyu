(() => {
 let dialog,history=[],character,recognition,audio,url,controller,session=0,busy=false,lastReply='',audioGeneration=0;
 let voiceActive=false,restartTimer=null,finishAudio=null;
 const el=id=>dialog.querySelector('#'+id);
 const supported=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
 function status(text){el('mentor-chat-status').textContent=text;}
 function voiceButton(){el('mentor-chat-mic').textContent=voiceActive?'音声会話を終了':'音声会話を開始';el('mentor-chat-mic').setAttribute('aria-pressed',String(voiceActive));}
 function endMic(){clearTimeout(restartTimer);restartTimer=null;if(recognition){const r=recognition;recognition=null;r.onend=r.onresult=r.onerror=null;r.abort();}}
 function stopAudio(){audioGeneration++;if(audio){audio.onended=audio.onerror=null;audio.pause();audio=null;}finishAudio?.();finishAudio=null;if(url){URL.revokeObjectURL(url);url=null;}}
 function stopVoice(message='音声会話を終了しました。'){voiceActive=false;endMic();stopAudio();voiceButton();status(message);}
 function close(){session++;controller?.abort();voiceActive=false;endMic();stopAudio();busy=false;}
 function line(role,text){const p=document.createElement('p');p.className='mentor-chat-line '+role;const label=document.createElement('strong');label.textContent=role==='user'?'あなた':character.name;p.append(label,document.createTextNode(text));el('mentor-chat-log').append(p);p.scrollIntoView({block:'nearest'});}
 function listenLater(token){clearTimeout(restartTimer);if(voiceActive&&token===session&&!busy)restartTimer=setTimeout(()=>listen(token),450);}
 async function speak(text,token){
  if(!character.mentorBehavior.voiceOutput)return;endMic();stopAudio();const generation=audioGeneration;
  try{
   status('声を準備しています…');
   const elder=character.mentorBehavior.voice==='elder'||((character.id==='wise-elder'||character.mentorProfileId==='wise-elder')&&character.mentorBehavior.voice==='sage');
   const r=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice:elder?'onyx':character.mentorBehavior.voice,voiceStyle:elder?'elder':undefined}),signal:controller?.signal});
   if(!r.ok)throw Error();const blob=await r.blob();if(token!==session||generation!==audioGeneration)return;
   url=URL.createObjectURL(blob);audio=new Audio(url);const playing=audio;
   const ended=new Promise((resolve,reject)=>{finishAudio=resolve;playing.onended=resolve;playing.onerror=()=>reject(Error('playback'));});
   status('話しています…');await playing.play();await ended;
   if(token===session&&generation===audioGeneration){stopAudio();status('');}
  }catch{if(token===session&&generation===audioGeneration)stopVoice('音声を再生できませんでした。「返事を聞く」で再試行できます。');}
 }
 async function send(){
  const input=el('mentor-chat-input'),text=input.value.trim();if(!text||busy)return;
  endMic();stopAudio();const token=session,generation=audioGeneration;busy=true;el('mentor-chat-send').disabled=true;input.value='';line('user',text);history.push({role:'user',content:text});controller=new AbortController();status('考えています…');
  try{const r=await fetch('/api/mentor-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({character,messages:history.slice(-16)}),signal:controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error||'返事を作れませんでした');if(token!==session)return;history.push({role:'assistant',content:data.text});lastReply=data.text;line('assistant',data.text);status('');if(generation===audioGeneration)await speak(data.text,token);}
  catch(e){if(token===session){history.pop();input.value=text;stopVoice(e.name==='AbortError'?'会話を停止しました':e.message);}}
  finally{if(token===session){busy=false;el('mentor-chat-send').disabled=false;if(voiceActive)listenLater(token);else input.focus();}}
 }
 function listen(token){
  if(!voiceActive||token!==session||busy||recognition||document.hidden)return;
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)return;
  let transcript='';const rec=new Recognition();recognition=rec;rec.lang='ja-JP';rec.continuous=false;rec.interimResults=true;
  rec.onresult=e=>{if(token!==session||recognition!==rec)return;transcript=Array.from(e.results).map(r=>r[0].transcript).join('');el('mentor-chat-input').value=transcript;};
  rec.onerror=e=>{if(token!==session||recognition!==rec)return;transcript='';if(e.error==='no-speech')return;stopVoice(e.error==='not-allowed'||e.error==='service-not-allowed'?'マイクの許可が必要です。許可後、音声会話を開始してください。':'音声入力が途切れました。「音声会話を開始」で再開できます。');};
  rec.onend=()=>{if(recognition!==rec)return;recognition=null;if(token!==session||!voiceActive)return;if(transcript.trim())send();else listenLater(token);};
  try{rec.start();status('聞いています。話し終えると自動で返事をします。');}catch{recognition=null;stopVoice('音声入力を開始できませんでした。文字でも会話できます。');}
 }
 function mic(){
  if(voiceActive){stopVoice();return;}if(!supported())return;
  voiceActive=true;voiceButton();stopAudio();if(!busy)listen(session);
 }
 async function replay(){if(busy)return;endMic();const token=session;busy=true;await speak(lastReply,token);if(token===session){busy=false;listenLater(token);}}
 function open(value,{preview=false}={}){
  if(!dialog){dialog=document.createElement('dialog');dialog.className='mentor-chat-dialog';dialog.innerHTML='<form method="dialog"><button class="secondary-button" aria-label="会話を閉じる">閉じる</button></form><h2 id="mentor-chat-title"></h2><p class="mentor-chat-note">AIとの会話です。声もAIが生成します。内容は画面を閉じると消えます。音声入力・返答の生成には外部サービスを利用します。</p><div id="mentor-chat-log" role="log" aria-live="polite"></div><label for="mentor-chat-input">気になっていること</label><textarea id="mentor-chat-input" maxlength="1800" rows="3"></textarea><div class="mentor-settings-actions"><button id="mentor-chat-mic" type="button">音声会話を開始</button><button id="mentor-chat-send" type="button">送信</button><button id="mentor-chat-replay" type="button">返事を聞く</button><button id="mentor-chat-stop" type="button">音声を止める</button></div><p class="mentor-chat-note">一度開始すると、返事の後に自動で聞き取りを再開します。終了ボタンで止められます。</p><p id="mentor-chat-status" role="status"></p>';document.body.append(dialog);dialog.addEventListener('close',close);dialog.addEventListener('cancel',close);el('mentor-chat-send').onclick=send;el('mentor-chat-mic').onclick=mic;el('mentor-chat-stop').onclick=()=>stopVoice();el('mentor-chat-replay').onclick=replay;document.addEventListener('visibilitychange',()=>{if(document.hidden&&voiceActive)stopVoice('音声会話を一時停止しました。開始ボタンで再開できます。');});}
  close();character={id:value.id,mentorProfileId:value.mentorProfileId,name:value.name||'メンター',role:value.role||'',mentorBehavior:MentorBehavior.normalize(value.mentorBehavior)};
  history=[];lastReply=character.mentorBehavior.opening;el('mentor-chat-log').replaceChildren();el('mentor-chat-input').value='';el('mentor-chat-title').textContent=character.name+(preview?' — 応対を試す':'と話す');line('assistant',lastReply);history.push({role:'assistant',content:lastReply});el('mentor-chat-send').disabled=false;voiceButton();el('mentor-chat-mic').disabled=!character.mentorBehavior.voiceInput||!supported();el('mentor-chat-replay').hidden=el('mentor-chat-stop').hidden=!character.mentorBehavior.voiceOutput;status(!supported()&&character.mentorBehavior.voiceInput?'このブラウザーでは音声入力に対応していません。文字で会話できます。':'「音声会話を開始」を押すと、続けてお話しできます。');dialog.showModal();controller=new AbortController();
 }
 window.MentorChat={open};
})();
