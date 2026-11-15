/* ===================== CLAUDE API ===================== */
const CHEAP_MODEL="claude-haiku-5-5";
async function callClaude(prompt,o){o=o||{};if(!S.key)throw {code:"nokey"};
  let resp;
  try{resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
    headers:{"content-type":"application/json","x-api-key":S.key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:o.model||S.model,max_tokens:o.max||1500,messages:[{role:"user",content:prompt}]})});}
  catch(e){throw {code:"network"};}
  if(!resp.ok){let msg="";try{const j=await resp.json();msg=(j.error&&j.error.message)||"";}catch(e){}
    throw {code:resp.status===401||resp.status===403?"badkey":resp.status===429?"rate":resp.status===404?"model":resp.status>=500?"server":"http",status:resp.status,msg:msg};}
  const j=await resp.json();return (j.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("");}
function parseJSON(text){const a=text.indexOf("{"),b=text.lastIndexOf("}");if(a<0||b<=a)throw {code:"parse"};try{return JSON.parse(text.slice(a,b+1));}catch(e){throw {code:"parse"};}}
function apiError(e){const c=e&&e.code;
  if(c==="nokey")return "Add your Anthropic API key in Settings to use this.";
  if(c==="badkey")return "The API key was rejected. Check it in Settings.";
  if(c==="rate")return "Too many requests, or the account is out of credit. Wait a minute and try again.";
  if(c==="network")return "Couldn't reach Claude. Check your connection and try again.";
  if(c==="model")return "That model isn't available on your API account. Pick the other one in Settings.";
  if(c==="server")return "Claude is having trouble right now. Try again in a moment.";
  if(c==="parse")return "The reply came back garbled. Send it again.";
  return "Something went wrong"+(e&&e.msg?": "+e.msg:"")+". Try again.";}
function cleanLine(a){if(!Array.isArray(a))return null;const out=a.filter(x=>x&&x.k).map(x=>{const k=String(x.k).trim();
  const r=k==="は"?"wa":k==="を"?"o":k==="へ"?"e":/(にちは|ばんは)$/.test(k)?romajiOf(k).replace(/ha$/,"wa"):romajiOf(k);return {k:k,g:String(x.g||""),r:r};});return out.length?out:null;}
function profileText(){const bits=["The learner is travelling in Japan in a group of "+(S.group||1)+"."];
  if(S.name)bits.push("Their name is "+S.name+".");if(S.food)bits.push("Food needs in the group: "+S.food+".");return bits.join(" ");}
function knownKana(){const ids=knownWordIds();const base=ids.length?ids:LESSONS[0].words.concat(LESSONS[1].words);return uniq(base.map(id=>W[id].k)).join(" ");}
const SCRIPT_RULES="SCRIPT RULE: write Japanese ONLY in hiragana and katakana, never kanji. Use katakana only for borrowed words. Split every Japanese line into words the way a beginner textbook does, with particles (は, を, が, の, で, と, に, も, か, ね, から, まで) as separate words. Keep polite set phrases such as おねがいします, ありがとう, ございます, すみません as single words. For each word give a short English gloss of 1 to 4 words, with grammar markers in square brackets like [topic], [thing], [subject], and ? for か.";

/* ===================== SAY-IT CHECK ===================== */
const KNUM={"〇":"0","零":"0","一":"1","二":"2","三":"3","四":"4","五":"5","六":"6","七":"7","八":"8","九":"9"};
function normJP(s){return toHira(String(s).replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/[〇零一二三四五六七八九]/g,c=>KNUM[c]).replace(/[\s。、．，.,!！?？「」・〜~ー\-]/g,"").toLowerCase());}
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let prev=[];for(let j=0;j<=n;j++)prev[j]=j;
  for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur;}return prev[n];}
async function sayCheck(target,transcript,alts){
  const goals=[target.kj,target.kana].filter(Boolean).map(normJP);const cands=uniq([transcript].concat(alts||[])).map(normJP);
  if(cands.some(c=>goals.indexOf(c)>=0))return {verdict:"right"};
  let best=0;cands.forEach(c=>goals.forEach(g=>{const s=1-lev(c,g)/Math.max(c.length,g.length,1);if(s>best)best=s;}));
  if(S.key){
    try{const txt=await callClaude(["A learner of Japanese tried to say a target phrase aloud. A speech recogniser wrote down what it heard.",
      "Target: "+(target.kj||target.kana)+" (reading: "+target.kana+")","Recogniser heard: "+transcript,
      "Decide whether the learner said the target. Ignore differences of script (kanji, kana, digits), punctuation and spacing, and treat homophones as the same.",
      'Answer "match" if it is the same words, "close" if there is one small slip (a particle, or one sound), otherwise "different".',
      'Return only JSON: {"verdict":"match|close|different","kana":"what the recogniser heard, written in hiragana and katakana only"}'].join("\n"),{model:CHEAP_MODEL,max:200});
      const j=parseJSON(txt);return {verdict:j.verdict==="match"?"right":j.verdict==="close"?"close":"wrong",kana:String(j.kana||"")};}
    catch(e){}}
  return {verdict:best>=0.75?"close":"unsure"};}

/* ===================== TALK ===================== */
const EXTRA_SCENES=[
 {id:"x-konbini",k:"コンビニ",en:"Konbini",after:"L10",role:"a convenience store clerk",setting:"Ring up a few items. Ask about a bag, heating the food and how they will pay."},
 {id:"x-taxi",k:"タクシー",en:"Taxi",after:"L12",role:"a taxi driver",setting:"Ask where to, make a little small talk on the way, then take payment."},
 {id:"x-free",k:"おしゃべり",en:"Free chat",after:"L16",role:"a friendly Japanese person the learner has just met",setting:"Easy small talk. Follow the learner's lead and ask simple questions."},
 {id:"x-petrol",k:"ガソリンスタンド",en:"Petrol station",after:"L21",role:"an attendant at a staffed petrol station in the countryside",setting:"Ask which fuel and how much, then take payment."},
 {id:"x-lost",k:"おとしもの",en:"Lost property",after:"L28",role:"a police officer at a neighbourhood police box",setting:"The learner has lost something. Ask what it is and where, and help them."},
 {id:"x-train",k:"えき",en:"Station help",after:"L30",role:"a station attendant at a big Tokyo station",setting:"Help the learner find the right line, platform and exit."}];
function allScenes(){return BOSSES.map(b=>Object.assign({boss:true,after:stageLessons(b.stage).slice(-1)[0].id},b)).concat(EXTRA_SCENES);}
let TALK={scene:"B1",turns:[],busy:false,err:"",goals:[],won:false};
function sceneById(id){return allScenes().find(s=>s.id===id)||allScenes()[0];}
function primeSpeech(){if(!canSpeak)return;try{const u=new SpeechSynthesisUtterance(" ");u.volume=0;u.lang="ja-JP";speechSynthesis.speak(u);}catch(e){}}
function renderTalk(m){
  const head=el("div","pagehead");const h=el("h1",null,"はなす");h.append(el("small",null,"Talk"));head.append(h);m.append(head);
  if(!S.key){const b=el("div","banner warn");b.append("Conversations run on Claude through your own API key. ",btn("linkish","Add it in Settings",()=>{MORE.page="settings";setTab("more");}));m.append(b);}
  if(!canListen)m.append(el("div","banner","This browser can't do speech recognition, so you'll type your replies here. On your iPhone, open the app in Safari to talk."));
  const sc=sceneById(TALK.scene);
  const grid=el("div","scenes");
  allScenes().forEach(s=>{const b=btn(null,null,()=>{TALK.scene=s.id;render();},"scene-"+s.id);b.setAttribute("aria-pressed",String(s.id===sc.id));
    b.append(el("b",null,(s.boss&&S.boss[s.id]?"★ ":"")+s.k),el("span",null,s.en+(isDone(s.after)?"":" · after lesson "+(LMAP[s.after].i+1))));grid.append(b);});
  m.append(grid);
  const t=el("div","ticket"),hd=el("div","head");hd.append(el("span",null,sc.boss?"Stage scene":"Practice scene"),el("span",null,sc.en));t.append(hd);
  const b=el("div","body");b.append(el("div","meaning",sc.k),el("p","why","Claude plays "+sc.role+". "+sc.setting));
  if(sc.boss){b.append(el("div","label","Your goals"));const g=el("div","goals");sc.goals.forEach(x=>{const d=el("div");d.append("○",el("span",null,x));g.append(d);});b.append(g);
    b.append(el("p","note",S.boss[sc.id]?"Stamp collected. Play it again any time.":"Tick off every goal to collect this stage's stamp."));}
  const row=el("div","row between");row.append(el("span","note","They speak with"));
  const seg=el("div","seg");[["known","Only words I know"],["more","A bit more"]].forEach(([v,l])=>{const x=btn(null,l,()=>{S.level=v;save();render();});x.setAttribute("aria-pressed",String(S.level===v));seg.append(x);});row.append(seg);b.append(row);
  t.append(b);const f=el("div","foot");const go=btn("btn primary wide","Start scene",()=>{primeSpeech();startScene(sc.id);},"startScene");go.disabled=!S.key;f.append(go);t.append(f);m.append(t);
}
function startScene(id){const sc=sceneById(id);TALK={scene:id,turns:[],busy:false,err:"",goals:sc.boss?sc.goals.map(()=>false):[],won:false};
  openOverlay({render:renderScene,onClose(){if(TALK.mic)TALK.mic.stopListening();}});askPartner(true);}
function talkPrompt(opening){const sc=sceneById(TALK.scene);
  const lvl=S.level==="known"?"Use ONLY words from the learner's list, plus at most one new word per line. One short sentence per turn."
    :"Mostly use words from the learner's list. You may add up to three new simple words per line. At most two short sentences per turn.";
  const tr=TALK.turns.map(t=>t.who==="them"?"PARTNER: "+t.line.map(x=>x.k).join(" "):"LEARNER: "+t.raw).join("\n")||"(none yet)";
  const mine=S.custom.slice(-12).map(c=>c.line.map(x=>x.k).join(" ")).join(" / ");
  const p=["You are a patient Japanese conversation partner for a beginner. Stay in character as "+sc.role+". Scene: "+sc.setting,
    profileText(),SCRIPT_RULES,
    "Words the learner knows: "+knownKana(),lvl,
    mine?"Phrases the learner has prepared and may try to use: "+mine:"",
    "The learner's lines come from a speech recogniser or from typing, so they may arrive in kanji, kana, romaji or English. Never penalise spelling or script. Answer in character, in Japanese only, and keep the scene moving with something easy to answer.",
    sc.boss?"The learner is trying to do these things during the scene:\n"+sc.goals.map((g,i)=>(i+1)+". "+g).join("\n")+"\nSteer the scene so each one becomes possible, in a natural order.":"",
    "Transcript so far:\n"+tr,
    opening?"Begin the scene with your first line.":"Reply to the learner's last line.",
    "Return only a JSON object with these keys:",
    '"you": the learner\'s last line rewritten in kana and split into words as [{"k":kana,"g":gloss}], or null if there is no learner line yet or it was not Japanese;',
    '"fix": null if the learner\'s last line was natural and correct. Otherwise {"line":[{"k","g"}] a natural way to say what they meant, "en": its English, "why": one short plain-English sentence on the main change};',
    '"line": your next line as [{"k":kana,"g":gloss}];',
    '"en": natural English for your line;',
    '"hint": {"line":[{"k","g"}],"en":""} one short thing the learner could say next, using words from their list;',
    sc.boss?'"goals": an array of '+sc.goals.length+' booleans, true for each goal the learner has achieved so far across the whole transcript;':"",
    '"end": true if the scene has reached its natural end, otherwise false.'];
  return p.filter(Boolean).join("\n");}
async function askPartner(opening){
  TALK.busy=true;TALK.err="";render();
  try{const j=parseJSON(await callClaude(talkPrompt(opening)));
    const line=cleanLine(j.line);if(!line)throw {code:"parse"};
    const me=[...TALK.turns].reverse().find(t=>t.who==="me");
    if(me&&!opening){me.kana=cleanLine(j.you);const fl=j.fix&&cleanLine(j.fix.line);if(fl)me.fix={line:fl,en:String(j.fix.en||""),why:String(j.fix.why||"")};else me.ok=true;}
    TALK.turns.forEach(t=>{t.showHint=false;});
    const hl=j.hint&&cleanLine(j.hint.line);
    TALK.turns.push({who:"them",line:line,en:String(j.en||""),hint:hl?{line:hl,en:String(j.hint.en||"")}:null,gloss:true,showEn:false});
    const sc=sceneById(TALK.scene);
    if(sc.boss&&Array.isArray(j.goals)){TALK.goals=sc.goals.map((g,i)=>!!j.goals[i]||!!TALK.goals[i]);
      if(TALK.goals.every(Boolean)&&!TALK.won){TALK.won=true;if(!S.boss[sc.id]){S.boss[sc.id]=Date.now();TALK.fresh=true;}}}
    TALK.ended=!!j.end;logAct("talk");save();
    TALK.busy=false;render();speak(line.map(x=>x.k).join(""));
  }catch(e){TALK.busy=false;TALK.err=apiError(e);render();}
  const c=$("chatEnd");if(c)c.scrollIntoView({block:"end",behavior:"smooth"});}
function sendLine(text){text=(text||"").trim();if(!text||TALK.busy)return;TALK.turns.push({who:"me",raw:text});askPartner(false);}
function renderScene(m){const sc=sceneById(TALK.scene);
  overlayTop(m,sc.k+" · "+sc.en);
  if(sc.boss){const g=el("div","goals");sc.goals.forEach((x,i)=>{const d=el("div",TALK.goals[i]?"ok":"");d.append(TALK.goals[i]?"✓":"○",el("span",null,x));g.append(d);});
    const t=el("div","banner");t.append(g);m.append(t);}
  const chat=el("div","chat");
  TALK.turns.forEach((tn,i)=>{const last=i===TALK.turns.length-1;
    if(tn.who==="them"){const mm=el("div","msg them");mm.append(el("div","who","あいて · them"));const bub=el("div","bubble");
      bub.append(interlinear(tn.line,{gloss:tn.gloss}));if(tn.showEn)bub.append(el("div","en",tn.en));
      const r=el("div","row");r.append(listenBtn(tn.line.map(x=>x.k).join("")));
      r.append(btn("linkish",tn.gloss?"Hide meanings":"Word meanings",()=>{tn.gloss=!tn.gloss;render();}),btn("linkish",tn.showEn?"Hide English":"English",()=>{tn.showEn=!tn.showEn;render();}));
      if(tn.hint&&last)r.append(btn("linkish",tn.showHint?"Hide idea":"What could I say?",()=>{tn.showHint=!tn.showHint;render();}));
      bub.append(r);
      if(tn.showHint&&tn.hint&&last){const hb=el("div","fix");hb.append(el("div","who","You could say"),interlinear(tn.hint.line,{size:"sm"}),el("div","note",tn.hint.en));bub.append(hb);}
      mm.append(bub);chat.append(mm);}
    else{const mm=el("div","msg me");mm.append(el("div","who","あなた · you"));const bub=el("div","bubble");
      if(tn.kana)bub.append(interlinear(tn.kana,{gloss:false,size:"sm"}));else bub.append(el("div","raw",tn.raw));mm.append(bub);
      if(tn.fix){const f=el("div","fix");f.append(el("div","who","Try it like this"),interlinear(tn.fix.line,{size:"sm"}));
        if(tn.fix.en)f.append(el("div","en",tn.fix.en));if(tn.fix.why)f.append(el("p","note",tn.fix.why));
        const r=el("div","row");r.append(listenBtn(tn.fix.line.map(x=>x.k).join("")));
        const sv=btn("btn small",tn.saved?"Saved to review":"Save to review",()=>{addCustom({line:tn.fix.line,en:tn.fix.en||tn.raw,note:tn.fix.why,src:"talk"});tn.saved=true;render();toast("Saved to your review deck");});sv.disabled=!!tn.saved;r.append(sv);f.append(r);mm.append(f);}
      else if(tn.ok)mm.append(el("div","ok","✓ natural"));
      chat.append(mm);}});
  m.append(chat);
  if(TALK.busy)m.append(el("div","typing","かんがえちゅう…"));
  if(TALK.err){const b=el("div","banner warn");b.append(TALK.err+" ");b.append(btn("linkish","Try again",()=>askPartner(!TALK.turns.some(t=>t.who==="me"))));m.append(b);}
  if(TALK.won){const t=el("div","ticket"),b=el("div","body");const c=el("div","celebrate");c.append(charNode({happy:true}));c.append(el("div","hanko big"+(TALK.fresh?" fresh":""),"★"));
    c.append(el("div","meaning","Every goal done"),el("p","why",TALK.fresh?"Stage stamp collected. Keep chatting, or head back.":"Nicely done. Keep chatting, or head back."));b.append(c);t.append(b);m.append(t);}
  else if(TALK.ended)m.append(el("div","banner","The scene has wrapped up. You can keep talking or close it."));
  m.append(el("div",null,null,{id:"chatEnd"}));
  const bar=el("div","talkbar");bar.style.bottom="calc(12px + env(safe-area-inset-bottom,0px))";
  const input=el("input",null,null,{id:"talkInput",type:"text",placeholder:canListen?"…or type here":"Type in kana, romaji or English",autocomplete:"off",autocapitalize:"off","aria-label":"Your reply"});
  if(canListen){const mic=micButton({small:true,onInterim(t){input.value=t;},onText(t){input.value="";sendLine(t);}});TALK.mic=mic;bar.append(mic);}
  const send=btn("btn primary","Send",()=>{const v=input.value;input.value="";sendLine(v);},"talkSend");
  input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();send.click();}});
  bar.append(input,send);m.append(bar);
}
function addCustom(c){const id="c"+Date.now().toString(36)+Math.floor(Math.random()*1e3);const item=Object.assign({id:id,at:Date.now()},c);S.custom.push(item);addCard("c:"+id);save();return item;}
