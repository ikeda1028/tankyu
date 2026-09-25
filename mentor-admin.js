(() => {
 let editingId='';
 const fieldLabels={personality:'性格・人物像',tone:'話し方・口調',opening:'最初の問いかけ',audience:'対象年齢・言葉の難しさ',questioning:'気になることを聞き出す進め方',hints:'解決に向けたヒントの出し方',projectGuidance:'プロジェクトに育てる手順',boundaries:'避ける応対・守ること',knowledge:'専門知識・参考情報（会話に使う公開可能な内容）'};
 const $=id=>document.getElementById(id);
 function profiles(){return Array.isArray(state.mentorProfiles)&&state.mentorProfiles.length?state.mentorProfiles:[MentorBehavior.sageProfile];}
 function setup(){
  const host=$('mentor-behavior-fields');if(host.dataset.ready)return;host.dataset.ready='1';
  for(const [key,label] of Object.entries(fieldLabels)){
   const l=document.createElement('label');l.htmlFor='mentor-ai-'+key;l.textContent=label;const input=document.createElement('textarea');input.id=l.htmlFor;input.rows=key==='knowledge'?4:2;input.maxLength=key==='knowledge'?3000:['personality','tone'].includes(key)?600:key==='opening'?300:key==='audience'?200:1200;host.append(l,input);
  }
  $('mentor-profile-choice').onchange=e=>load(e.target.value);
  $('mentor-new').onclick=()=>newProfile(false);$('mentor-sage').onclick=()=>newProfile(true);
  $('mentor-duplicate').onclick=()=>{if(!isAdminUser())return;editingId='';els.mentorPoint.value='';els.mentorName.value=(els.mentorName.value+'（コピー）').slice(0,40);$('mentor-profile-choice').value='';els.mentorSave.textContent='新しいメンターとして保存';};
  $('mentor-test').onclick=()=>{if(!isAdminUser())return;const value=read();if(!value.mentorBehavior.enabled){els.mentorSettingsStatus.textContent='AI会話を有効にしてからお試しください。';return;}MentorChat.open(value,{preview:true});};
 }
 function options(){setup();const select=$('mentor-profile-choice');select.replaceChildren(new Option('新しいメンター／ポイント専用',''));for(const p of profiles())select.add(new Option(p.name,p.id));select.value=editingId;renderEditorList();}
 function fill(character){setup();editingId=character?.mentorProfileId||character?.id||'';options();const b=MentorBehavior.normalize(character?.mentorBehavior);for(const key of Object.keys(fieldLabels))$('mentor-ai-'+key).value=b[key];for(const key of ['enabled','castleEnabled','voiceInput','voiceOutput'])$('mentor-ai-'+key).checked=b[key];for(const key of ['projectMode','voice','maxLength'])$('mentor-ai-'+key).value=b[key];els.mentorSave.disabled=false;els.mentorSave.textContent='メンター設定を保存';}
 function load(id){if(!isAdminUser())return;const p=profiles().find(x=>x.id===id);if(!p){newProfile(false);return;}els.mentorPoint.value='';els.mentorName.value=p.name;els.mentorRole.value=p.role||'';els.mentorRank.value=p.mentorLevel||1;els.mentorEnabled.checked=p.mentorEnabled!==false;els.mentorMessage.value=p.message||'';els.mentorModelUrl.value=p.model3d?.modelUrl||'';fill(p);previewMentorModel();els.mentorSettingsStatus.textContent='保存すると、このメンターを配置した探究ポイントにも応対設定を反映します。';}
 function newProfile(sage){if(!isAdminUser())return;els.mentorPoint.value='';els.mentorName.value=sage?'探究の仙人':'';els.mentorRole.value=sage?'気になることを問いと小さなプロジェクトに育てる伴走者':'';els.mentorRank.value='1';els.mentorEnabled.checked=true;els.mentorMessage.value=sage?MentorBehavior.sage.opening:'';els.mentorModelUrl.value='';fill({mentorBehavior:sage?MentorBehavior.sage:MentorBehavior.defaults});previewMentorModel();els.mentorSettingsStatus.textContent='配置先は後から選べます。仙人以外のメンターも個別に登録できます。';}
 function read(){const b={};for(const key of Object.keys(fieldLabels))b[key]=$('mentor-ai-'+key).value;for(const key of ['enabled','castleEnabled','voiceInput','voiceOutput'])b[key]=$('mentor-ai-'+key).checked;for(const key of ['projectMode','voice','maxLength'])b[key]=$('mentor-ai-'+key).value;return {name:els.mentorName.value.trim(),role:els.mentorRole.value.trim(),mentorBehavior:MentorBehavior.normalize(b)};}
 function save(event){
  event?.preventDefault();if(!isAdminUser())return;
  const point=getEncounters().find(x=>x.id===els.mentorPoint.value);if(point?.publicReadOnly){els.mentorSettingsStatus.textContent='この探究ポイントは編集できません。';return;}
  const value=read();if(!value.name){els.mentorSettingsStatus.textContent='メンター名を入力してください。';return;}
  const raw=els.mentorModelUrl.value.trim(),model3d=MentorModels.normalize({modelUrl:raw,title:value.name},PUBLIC_API_BASE);
  if(raw&&(!model3d||verifiedMentorModelUrl!==model3d.modelUrl)){els.mentorSettingsStatus.textContent='「3Dを確認」でモデルが表示されてから保存してください。';return;}
  const id=editingId||`mentor-${crypto.randomUUID()}`,existing=profiles().find(p=>p.id===id);
  const character=normalizeCharacter({...getEventCharacter(point),...existing,...value,mentorProfileId:id,mentorEnabled:els.mentorEnabled.checked,mentorLevel:els.mentorRank.value,message:els.mentorMessage.value.trim(),model3d});
  // Portrait images remain on the point; registry entries hold compact reusable settings.
  const profile={id,name:character.name,role:character.role,mentorProfileId:id,mentorBehavior:character.mentorBehavior,mentorEnabled:character.mentorEnabled,mentorLevel:character.mentorLevel,message:character.message,model3d,updatedAt:new Date().toISOString()};
  const previousProfiles=state.mentorProfiles,previousEvents=state.customEvents;
  state.mentorProfiles=[...profiles().filter(p=>p.id!==id),profile];state.customEvents=state.customEvents.map(p=>p.character?.mentorProfileId===id?{...p,character:{...p.character,...profile},updatedAt:profile.updatedAt}:p);
  let selectedId='';
  if(point){const original=state.customEvents.find(p=>p.id===point.id);const saved={...(original||point),id:original?.id||createEventId(point.title),character,userCreated:true,updatedAt:profile.updatedAt,...(!original?{sourceEventId:point.id}:{})};if(original)state.customEvents=state.customEvents.map(p=>p.id===saved.id?saved:p);else state.customEvents.unshift(saved);selectedId=saved.id;}
  if(!saveState()){state.mentorProfiles=previousProfiles;state.customEvents=previousEvents;els.mentorSettingsStatus.textContent='保存できませんでした。入力内容は残しています。';return;}
  editingId=id;render();populateMentorSettings(selectedId);if(!selectedId)load(id);els.mentorSettingsStatus.textContent='メンター設定を保存しました。クラウド同期状況は設定画面で確認できます。';queueFirebaseSync('メンター応対設定');
 }
 function renderEditorList(){
  const host=$('mentor-editor-list');if(!host)return;host.replaceChildren();if(!isAdminUser())return;
  const registry=profiles(),known=new Set(registry.map(p=>p.id));
  const rows=registry.map(p=>({profile:p}));
  for(const point of getEncounters()){
   const p=getEventCharacter(point);
   if(point.publicReadOnly||!p?.mentorEnabled||known.has(p.mentorProfileId))continue;
   rows.push({profile:p,point});
  }
  const count=$('mentor-registry-count');if(count)count.textContent=rows.length+'人';
  for(const {profile:p,point} of rows){
   const row=document.createElement('article');row.className='mentor-registry-card';
   const selected=point?els.mentorPoint.value===point.id:editingId===p.id;
   row.dataset.selected=String(selected);
   const name=document.createElement('h4');name.textContent=p.name||'名前未設定';
   const role=document.createElement('p');role.className='mentor-registry-role';role.textContent=p.role||'役割・専門分野を設定できます';
   const b=MentorBehavior.normalize(p.mentorBehavior),info=document.createElement('p');info.className='mentor-registry-meta';
   info.textContent=(p.mentorEnabled===false?'休止中':'有効')+' · AI会話 '+(b.enabled?'ON':'OFF')+' · '+(b.voiceOutput?'音声あり':'文字のみ');
   const place=document.createElement('p');place.className='mentor-registry-meta';
   const assigned=getEncounters().filter(x=>x.character?.mentorProfileId===p.id).length;
   place.textContent=point?'配置：'+point.title:[b.castleEnabled?'勝連城の登場候補':'',assigned?'探究ポイント '+assigned+'か所':''].filter(Boolean).join(' / ')||'配置先は未設定';
   const button=document.createElement('button');button.type='button';button.className='secondary-button';button.textContent=selected?'編集中':'設定を開く';
   button.onclick=()=>{if(!isAdminUser())return;if(point)openMentorSettings(point.id);else load(p.id);$('mentor-settings-form').scrollIntoView?.({behavior:'smooth',block:'start'});els.mentorName.focus?.({preventScroll:true});};
   row.append(name,role,info,place,button);host.append(row);
  }
 }
 function renderRegistry(){
  const host=$('admin-mentor-profiles');host.replaceChildren();if(!isAdminUser())return;
  for(const profile of profiles()){
   const row=document.createElement('div');row.className='admin-mentor-row';const text=document.createElement('div');const name=document.createElement('strong');name.textContent=profile.name;const note=document.createElement('p');note.textContent=(profile.role||'役割未設定')+' / AI会話 '+(profile.mentorBehavior?.enabled?'ON':'OFF');text.append(name,note);const button=document.createElement('button');button.type='button';button.className='secondary-button';button.textContent='応対を設定';button.onclick=()=>{openMentorSettings();load(profile.id);};row.append(text,button);host.append(row);
  }
  if(!profiles().length)host.textContent='登録済みのメンターはありません。「メンターを追加」から登録できます。';
 }
 window.MentorAdmin={fill,options,save,renderRegistry,renderEditorList,newProfile,load};
})();
