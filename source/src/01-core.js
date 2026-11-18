"use strict";
/* ===================== DATA ===================== */
const DATA=JSON.parse(document.getElementById("curriculum").textContent);
const W=DATA.W, LESSONS=DATA.lessons, BOSSES=DATA.bosses, STAGES=DATA.stages, KANA=DATA.kana, SIGNS=DATA.signs;
const LMAP={},PMAP={},HMAP={},FMAP={};
LESSONS.forEach((l,i)=>{l.i=i;LMAP[l.id]=l;l.phrases.forEach(p=>{p.L=l.id;PMAP[p.id]=p;});l.hear.forEach(h=>{h.L=l.id;HMAP[h.id]=h;});l.frames.forEach(f=>{f.L=l.id;FMAP[f.id]=f;});});
KANA.lessons.forEach(k=>{LMAP[k.id]=k;k.kana=true;});
// the order of the whole path: two kana refreshers, then lessons 1-34
const PATH=KANA.lessons.map(k=>k.id).concat(LESSONS.map(l=>l.id));
const NO_SRS_SETS={num:1,time:1,minutes:1};

/* ===================== STATE ===================== */
const LS_KEY="tabi.v3";
function blank(){return {v:3,char:null,name:"",group:6,food:"",tripDate:"",key:"",model:"claude-sonnet-5-5",romaji:true,rate:0.85,level:"known",
  dir:"ja",signs:false,done:{},boss:{},cards:{},custom:[],log:{},best:{},seenTip:{},updatedAt:0};}
function normalize(s){const b=blank();if(!s||typeof s!=="object")return b;
  Object.keys(b).forEach(k=>{if(s[k]===undefined||s[k]===null&&b[k]!==null)return;if(typeof b[k]==="object"&&b[k]!==null&&!Array.isArray(b[k])){if(s[k]&&typeof s[k]==="object")b[k]=s[k];}
    else if(Array.isArray(b[k])){if(Array.isArray(s[k]))b[k]=s[k];}else b[k]=s[k];});return b;}
let S=(function(){try{const r=localStorage.getItem(LS_KEY);return r?normalize(JSON.parse(r)):blank();}catch(e){return blank();}})();
let saveTimer=null,storageOK=true;
function save(){S.updatedAt=Date.now();clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(LS_KEY,JSON.stringify(S));storageOK=true;}catch(e){storageOK=false;}},150);}
window.addEventListener("pagehide",()=>{try{localStorage.setItem(LS_KEY,JSON.stringify(S));}catch(e){}});

/* ===================== HELPERS ===================== */
const $=id=>document.getElementById(id);
function el(tag,cls,text,attrs){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);return e;}
function btn(cls,text,fn,id){const b=el("button",cls,text);b.type="button";if(id)b.id=id;if(fn)b.addEventListener("click",fn);return b;}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a,n){return shuffle(a).slice(0,n);}
function uniq(a){return [...new Set(a)];}
const DAY=864e5;
function dstr(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function today(){return dstr();}
let toastTimer=null;
function toast(msg){const t=$("toast");t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true;},2600);}
function logAct(kind,n){const d=today();S.log[d]=S.log[d]||{};S.log[d][kind]=(S.log[d][kind]||0)+(n||1);save();}
function didToday(kind){const l=S.log[today()];return !!(l&&l[kind]);}
function streak(){let n=0;const d=new Date();if(!S.log[dstr(d)])d.setDate(d.getDate()-1);
  while(S.log[dstr(d)]){n++;d.setDate(d.getDate()-1);}return n;}
function fmtDur(days){if(days<1/24)return Math.max(1,Math.round(days*1440))+" min";if(days<1)return Math.round(days*24)+" h";if(days<14)return Math.round(days)+" d";if(days<30)return Math.round(days/7)+" wk";return Math.round(days/30)+" mo";}

/* ===================== KANA ===================== */
const HIRA="あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
const HROM="a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa o n ga gi gu ge go za ji zu ze zo da ji zu de do ba bi bu be bo pa pi pu pe po".split(" ");
const KMAP={};for(let i=0;i<HIRA.length;i++){KMAP[HIRA[i]]=HROM[i];KMAP[String.fromCharCode(HIRA.charCodeAt(i)+96)]=HROM[i];}KMAP["ヴ"]="vu";
const SMALL_Y={"ゃ":"a","ゅ":"u","ょ":"o","ャ":"a","ュ":"u","ョ":"o"};
const SMALL_V={"ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o","ァ":"a","ィ":"i","ゥ":"u","ェ":"e","ォ":"o"};
function morae(s){const out=[];
  for(const ch of s){if(ch===" ")continue;const prev=out[out.length-1];
    if(SMALL_Y[ch]&&prev){const b=prev.r,v=SMALL_Y[ch];prev.r=/^(shi|chi|ji)$/.test(b)?b.slice(0,-1)+v:b.slice(0,-1)+"y"+v;prev.k+=ch;continue;}
    if(SMALL_V[ch]&&prev){const b=prev.r,v=SMALL_V[ch];prev.r=(b==="u"?"w":b==="te"?"t":b==="de"?"d":b==="fu"?"f":b.replace(/[aiueo]+$/,""))+v;prev.k+=ch;continue;}
    if(ch==="ー"){out.push({k:ch,r:"long"});continue;}
    if(ch==="っ"||ch==="ッ"){out.push({k:ch,r:"pause"});continue;}
    out.push({k:ch,r:KMAP[ch]||ch});}
  return out;}
function toHira(s){return s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));}
function romajiOf(k){let o=[],gem=false;for(const m of morae(k)){if(m.r==="pause"){gem=true;continue;}if(m.r==="long"){const b=o[o.length-1]||"";o.push(b.slice(-1));continue;}let r=m.r;if(gem){r=(r.startsWith("ch")?"t":r[0])+r;gem=false;}o.push(r);}return o.join("");}
// romaji typed the Japanese way -> katakana, for names
function romajiToKata(s){s=s.toLowerCase().replace(/[^a-z\-']/g,"");const T={};
  for(let i=0;i<HIRA.length;i++){const r=HROM[i];if(!(r in T))T[r]=String.fromCharCode(HIRA.charCodeAt(i)+96);}
  Object.assign(T,{si:"シ",ti:"ティ",tu:"ツ",di:"ディ",du:"ドゥ",hu:"フ",zi:"ジ",wi:"ウィ",we:"ウェ",wo:"ウォ",fa:"ファ",fi:"フィ",fe:"フェ",fo:"フォ",va:"ヴァ",vi:"ヴィ",ve:"ヴェ",vo:"ヴォ",vu:"ヴ",she:"シェ",che:"チェ",je:"ジェ",
    kya:"キャ",kyu:"キュ",kyo:"キョ",sha:"シャ",shu:"シュ",sho:"ショ",cha:"チャ",chu:"チュ",cho:"チョ",nya:"ニャ",nyu:"ニュ",nyo:"ニョ",hya:"ヒャ",hyu:"ヒュ",hyo:"ヒョ",mya:"ミャ",myu:"ミュ",myo:"ミョ",rya:"リャ",ryu:"リュ",ryo:"リョ",gya:"ギャ",gyu:"ギュ",gyo:"ギョ",ja:"ジャ",ju:"ジュ",jo:"ジョ",bya:"ビャ",byu:"ビュ",byo:"ビョ",pya:"ピャ",pyu:"ピュ",pyo:"ピョ",
    la:"ラ",li:"リ",lu:"ル",le:"レ",lo:"ロ",ca:"カ",cu:"ク",co:"コ",ci:"シ",ce:"セ",qu:"ク",xa:"ザ",ye:"イェ"});
  let out="",i=0;while(i<s.length){const c=s[i];
    if(c==="-"){out+="ー";i++;continue;}if(c==="'"){i++;continue;}
    if(i+1<s.length&&c===s[i+1]&&!/[aiueon]/.test(c)){out+="ッ";i++;continue;}
    let hit=false;for(const n of [3,2,1]){const seg=s.substr(i,n);if(T[seg]&&seg.length===n){out+=T[seg];i+=n;hit=true;break;}}
    if(hit)continue;
    if(c==="n"){out+="ン";i++;continue;}
    // a consonant with no vowel after it: add the usual helper vowel
    const helper=(c==="t"||c==="d")?"o":"u";const seg=c+helper;out+=T[seg]||"";i++;}
  return out;}

/* ===================== TOKENS ===================== */
// a token is {w:id} | {k,g,r} | {p:punct} | {slot:1} | {name:1}
function res(t){
  if(t.w){const w=W[t.w];return {id:t.w,k:w.k,r:w.r,g:w.g,why:w.why,part:w.g.charAt(0)==="["||w.g==="?"};}
  if(t.name){const n=S.name||"〇〇";return {k:n,r:S.name?romajiOf(S.name):"",g:"your name"};}
  if(t.slot)return {k:"＿",r:"",g:"",slot:true};
  if(t.p)return {p:t.p};
  return {k:t.k,r:t.r||romajiOf(t.k),g:t.g||"",part:(t.g||"").charAt(0)==="["||t.g==="?"};}
function resolve(ts){if(ts._res)return ts;const out=[];ts.forEach(t=>{const r=res(t);if(r.p){if(out.length)out[out.length-1].tail=(out[out.length-1].tail||"")+r.p;}else out.push(r);});out._res=true;return out;}
function toks(p){return p.t||p.line||[];}
function lineText(ts){return resolve(ts).map(x=>x.k+(x.tail||"")).join("");}
function lineSpaced(ts){return resolve(ts).map(x=>x.k+(x.tail||"")).join(" ");}
function parseLine(str){return str.split(/\s+/).filter(Boolean).map(x=>x===","?{p:"、"}:x==="."?{p:"。"}:{w:x});}
// word-by-word row. Tap a word to hear it.
function interlinear(ts,o){o=o||{};const parts=resolve(ts);
  const box=el("div","il"+(o.size?" "+o.size:""));
  parts.forEach((p,i)=>{const b=el("button","w");b.type="button";
    if(o.shown!=null&&i>=o.shown)b.classList.add("ghost");
    if(o.pop===i)b.classList.add("pop");if(o.hi===i)b.classList.add("new");if(p.slot)b.classList.add("slot");
    b.append(el("span","k",p.k+(p.tail||"")));if(p.r)b.append(el("span","r",p.r));
    if(o.gloss!==false)b.append(el("span","g"+(p.part?" part":""),(o.shown!=null&&i>=o.shown)?"·":p.g));
    b.setAttribute("aria-label",p.k+(o.gloss!==false&&p.g?", "+p.g:""));
    if(!p.slot)b.addEventListener("click",e=>{e.stopPropagation();speak(p.k);});
    box.append(b);});
  return box;}
function moraeRow(k){const row=el("div","morae");morae(k).forEach(m=>{const d=el("div","mora");d.append(el("span","k",m.k),el("span","rr r",m.r));row.append(d);});return row;}

/* ===================== SPEECH OUT ===================== */
const canSpeak=!!(window.speechSynthesis&&window.SpeechSynthesisUtterance);
let jaVoice=null;
function loadVoices(){try{const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().replace("_","-").indexOf("ja")===0);
  jaVoice=vs.find(v=>/kyoko|o-ren|otoya|hattori/i.test(v.name)&&/enhanced|premium/i.test(v.name))||vs.find(v=>v.localService)||vs[0]||null;}catch(e){}}
if(canSpeak){loadVoices();try{speechSynthesis.addEventListener("voiceschanged",loadVoices);}catch(e){}}
// iPhone Safari's speech engine can get stuck: after the mic has been used, after the tab sleeps,
// or when a speak() lands straight after cancel(). So: wait a beat, check it actually started, retry once
// with the plain system voice, and tell the user if it still won't play.
let speakTimer=null,speakWatch=null,lastMicEnd=0,stuckWarned=false;
function soundStuck(){if(stuckWarned)return;stuckWarned=true;toast("Sound isn't playing. Check the volume and the silent switch, then close and reopen this tab.");}
function speak(text,rate,retry){if(!canSpeak)return;const s=speechSynthesis;clearTimeout(speakTimer);clearTimeout(speakWatch);
  const say=()=>{try{s.resume();
    const u=new SpeechSynthesisUtterance(String(text).replace(/\s+/g,"").replace(/〇〇/g,"なになに").replace(/＿/g,""));
    u.lang="ja-JP";u.rate=rate||S.rate||0.85;if(!retry){if(!jaVoice)loadVoices();if(jaVoice)u.voice=jaVoice;}
    let started=false;u.onstart=()=>{started=true;stuckWarned=false;clearTimeout(speakWatch);};
    s.speak(u);
    speakWatch=setTimeout(()=>{if(started)return;try{s.cancel();}catch(e){}if(!retry)speakTimer=setTimeout(()=>speak(text,rate,true),150);else soundStuck();},2000);
  }catch(e){}};
  let wait=0;try{if(s.speaking||s.pending){s.cancel();wait=150;}}catch(e){}
  const sinceMic=Date.now()-lastMicEnd;if(sinceMic<700)wait=Math.max(wait,700-sinceMic);
  if(wait)speakTimer=setTimeout(say,wait);else say();}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&canSpeak){try{speechSynthesis.cancel();}catch(e){}loadVoices();}});
function listenBtn(text,label){const b=btn("listen",label||"▶ LISTEN",e=>{e.stopPropagation();speak(typeof text==="function"?text():text);});b.hidden=!canSpeak;return b;}

/* ===================== SPEECH IN ===================== */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const canListen=!!SR;
function srError(code){
  if(code==="not-allowed"||code==="service-not-allowed")return "The microphone or speech recognition is blocked. On iPhone, allow the microphone for this site in Safari, and check that Dictation is on (Settings, General, Keyboard, Enable Dictation).";
  if(code==="unsupported")return "This browser can't do speech recognition. Open the app in Safari, or type instead.";
  if(code==="network")return "Speech recognition needs an internet connection.";
  if(code==="empty")return "I didn't catch anything. Tap the mic and try again, a little louder.";
  return "Speech recognition stopped unexpectedly. Try again, or type instead.";}
function listen(cb){
  if(!SR){cb.error("unsupported");return null;}
  try{speechSynthesis.cancel();}catch(e){}
  let r;try{r=new SR();}catch(e){cb.error("unsupported");return null;}
  r.lang="ja-JP";r.interimResults=true;r.maxAlternatives=3;r.continuous=false;
  let last="",alts=[],done=false;
  r.onresult=e=>{let t="";alts=[];for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;
    if(e.results.length===1){const r0=e.results[0];for(let j=0;j<r0.length;j++)alts.push(r0[j].transcript);}
    last=t;if(cb.interim)cb.interim(t);};
  r.onerror=e=>{lastMicEnd=Date.now();if(done)return;if(e.error==="no-speech"||e.error==="aborted")return;done=true;cb.error(e.error||"unknown");};
  r.onend=()=>{lastMicEnd=Date.now();if(done)return;done=true;const t=last.trim();if(t)cb.final(t,alts.length?alts:[t]);else cb.error("empty");};
  try{r.start();}catch(e){cb.error("start-failed");return null;}
  return {stop(){try{r.stop();}catch(e){}},abort(){done=true;try{r.abort();}catch(e){}}};}
// A mic button: tap to start, tap again to finish.
function micButton(o){const b=btn("mic"+(o.small?" small":""),"はなす");let h=null;
  b.setAttribute("aria-label","Speak");
  b.addEventListener("click",()=>{
    if(h){h.stop();return;}
    b.classList.add("live");b.textContent="きく…";if(o.onStart)o.onStart();
    h=listen({interim:t=>{if(o.onInterim)o.onInterim(t);},
      final:(t,a)=>{h=null;b.classList.remove("live");b.textContent="はなす";o.onText(t,a);},
      error:c=>{h=null;b.classList.remove("live");b.textContent="はなす";if(o.onError)o.onError(c);else toast(srError(c));}});
    if(!h){b.classList.remove("live");b.textContent="はなす";}});
  b.stopListening=()=>{if(h){h.abort();h=null;b.classList.remove("live");b.textContent="はなす";}};
  return b;}

/* ===================== PROGRESS ===================== */
function isDone(id){return !!S.done[id];}
function nextId(){return PATH.find(id=>!S.done[id])||null;}
function lessonsDone(){return LESSONS.filter(l=>S.done[l.id]).length;}
function knownWordIds(){const ids=[];LESSONS.forEach(l=>{if(S.done[l.id])l.words.concat(l.forms).forEach(w=>ids.push(w));});return ids;}
function stageLessons(n){return LESSONS.filter(l=>l.stage===n);}
function stageDone(n){return stageLessons(n).every(l=>S.done[l.id]);}
function stampTotal(){return PATH.length+BOSSES.length;}
function stampCount(){return PATH.filter(id=>S.done[id]).length+BOSSES.filter(b=>S.boss[b.id]).length;}

/* ===================== SPACED REPETITION ===================== */
const INTERVALS=[0,10/1440,1,3,7,14,30,60];
function srsNext(s,g){let box=s?s.box:0;
  if(g==="again")box=1;else if(g==="hard")box=Math.max(1,box);else if(g==="good")box=Math.min(7,Math.max(2,box+1));else box=Math.min(7,Math.max(3,box+2));
  return {box:box,due:Date.now()+INTERVALS[box]*DAY};}
function addCard(key,delayDays){if(!S.cards[key])S.cards[key]={box:1,due:Date.now()+(delayDays==null?INTERVALS[1]:delayDays)*DAY};}
function cardInfo(key){const [t,id]=[key.slice(0,1),key.slice(2)];
  if(t==="w"&&W[id])return {key,type:"word",word:res({w:id}),src:LMAP[W[id].L]};
  if(t==="p"&&PMAP[id])return {key,type:"phrase",phrase:PMAP[id],src:LMAP[PMAP[id].L]};
  if(t==="h"&&HMAP[id])return {key,type:"hear",phrase:HMAP[id],src:LMAP[HMAP[id].L]};
  if(t==="c"){const c=S.custom.find(x=>x.id===id);if(c)return {key,type:"phrase",phrase:c,custom:true};}
  if(t==="s"&&SIGNS[+id])return {key,type:"sign",sign:SIGNS[+id]};
  return null;}
function dueKeys(){const now=Date.now();return Object.keys(S.cards).filter(k=>S.cards[k].due<=now&&cardInfo(k)).sort((a,b)=>S.cards[a].due-S.cards[b].due);}
function enrolLesson(L){
  L.words.concat(L.forms).forEach(w=>{if(!NO_SRS_SETS[W[w].set])addCard("w:"+w);});
  L.phrases.forEach(p=>addCard("p:"+p.id));
  L.hear.forEach(h=>addCard("h:"+h.id,1));}
function completeLesson(id){const first=!S.done[id];if(first)S.done[id]=Date.now();const L=LMAP[id];if(L&&!L.kana)enrolLesson(L);logAct("lesson");save();return first;}
