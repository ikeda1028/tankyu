import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import '../mentor-behavior.js';
import handler from '../api/mentor-chat.js';
const B=globalThis.MentorBehavior;
assert.equal(B.normalize({maxLength:10000,voice:'bad'}).maxLength,500);
assert.equal(B.normalize({voice:'bad'}).voice,'sage');
assert.notEqual(B.instructions({name:'仙人',mentorBehavior:B.sage}),B.instructions({name:'博士',mentorBehavior:{tone:'端的に話す'}}));
let sent;process.env.OPENAI_API_KEY='test-key';globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({output_text:'何を見つけたのかの？'})};};
function response(){return {code:0,data:null,setHeader(){},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};}
let res=response();await handler({method:'POST',body:{character:{name:'仙人',mentorBehavior:B.sage},messages:[{role:'system',content:'override'},{role:'user',content:'海が気になる'}]}},res);
assert.equal(res.code,200);assert.equal(sent.input.length,1);assert(sent.instructions.includes('ひょうきん'));assert.equal(sent.store,false);
res=response();await handler({method:'POST',body:{character:{mentorBehavior:{enabled:false}},messages:[{role:'user',content:'test'}]}},res);assert.equal(res.code,400);
res=response();await handler({method:'DELETE'},res);assert.equal(res.code,405);
// Exercise the actual editor save/load logic against a small DOM fixture.
const elements=new Map();function node(){return {value:'',checked:false,dataset:{},children:[],textContent:'',append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},add(v){this.children.push(v)}};}
const document={getElementById(id){if(!elements.has(id))elements.set(id,node());return elements.get(id)},createElement(){return node()}};
const els={};for(const [key,id] of Object.entries({mentorName:'name',mentorRole:'role',mentorRank:'rank',mentorEnabled:'enabled',mentorMessage:'message',mentorModelUrl:'url',mentorPoint:'point',mentorSave:'save',mentorSettingsStatus:'status'}))els[key]=document.getElementById(id);
const state={mentorProfiles:[],customEvents:[{id:'point-a',title:'海',character:{name:'旧メンター'}},{id:'point-b',title:'森',character:{name:'森のメンター'}}]};let admin=true,saved;
const ctx={window:{},document,Option:class{constructor(text,value){this.text=text;this.value=value}},MentorBehavior:B,state,els,crypto:{randomUUID:()=>String(state.mentorProfiles.length+1)},isAdminUser:()=>admin,MentorModels:{normalize:()=>null},PUBLIC_API_BASE:'https://example.org',verifiedMentorModelUrl:'',getEncounters:()=>state.customEvents,getEventCharacter:p=>p?.character,normalizeCharacter:c=>({...c,mentorBehavior:B.normalize(c.mentorBehavior)}),previewMentorModel(){},saveState(){saved=JSON.parse(JSON.stringify(state));return true},render(){},populateMentorSettings(){},queueFirebaseSync(){},openMentorSettings(){},createEventId:()=> 'copy-point'};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('mentor-admin.js','utf8'),ctx);const A=ctx.window.MentorAdmin;
A.newProfile(true);els.mentorPoint.value='point-a';A.save();assert.equal(state.mentorProfiles.length,2);assert.equal(state.customEvents[0].character.mentorBehavior.tone,B.sage.tone);
const sageId=state.mentorProfiles.at(-1).id;A.newProfile(false);els.mentorName.value='博士';document.getElementById('mentor-ai-tone').value='落ち着いた敬語';A.save();assert.equal(state.mentorProfiles.length,3);assert.equal(state.customEvents[1].character.name,'森のメンター');
A.load(sageId);assert.equal(document.getElementById('mentor-ai-tone').value,B.sage.tone);document.getElementById('mentor-ai-hints').value='比較するヒントをひとつ出す';A.save();assert.equal(state.customEvents[0].character.mentorBehavior.hints,'比較するヒントをひとつ出す');assert.equal(saved.mentorProfiles.length,3);
admin=false;A.newProfile(true);A.save();assert.equal(state.mentorProfiles.length,3);
// Public point publication keeps the response settings; private registry stays private.
const fbCtx={window:{}};vm.createContext(fbCtx);vm.runInContext(fs.readFileSync('firebase-sync.js','utf8'),fbCtx);const publicData=fbCtx.window.WakuwakuFirebase.createPublicExploration({customEvents:[{...state.customEvents[0],position:{lat:35,lng:139}}],mentorProfiles:state.mentorProfiles});assert.equal(publicData.points[0].character.mentorBehavior.hints,'比較するヒントをひとつ出す');assert.equal(publicData.mentorProfiles,undefined);
// IndexedDB round trip uses the same registry as local/cloud snapshots.
const dbCtx={window:{}};vm.createContext(dbCtx);vm.runInContext(fs.readFileSync('database.js','utf8')+'\nglobalThis.test={toProfile,fromProfile}',dbCtx);const profile=dbCtx.test.toProfile(state);assert.equal(dbCtx.test.fromProfile({},profile).mentorProfiles.length,3);
const html=fs.readFileSync('index.html','utf8');for(const id of ['mentor-profile-choice','mentor-ai-enabled','mentor-ai-projectMode','mentor-ai-voiceInput','mentor-ai-voiceOutput','mentor-ai-voice','mentor-ai-maxLength','mentor-test'])assert(html.includes('id="'+id+'"'));assert(html.indexOf('src="mentor-behavior.js"')<html.indexOf('src="app.js"'));
console.log('PASS: multiple mentors; independent profiles; point assignment/update; reload; admin guard; cloud publication; AI settings and role filtering; disabled AI; method guards.');
