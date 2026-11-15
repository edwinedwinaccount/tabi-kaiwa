/* ===================== SETTINGS ===================== */
let SET={keyMsg:"",micMsg:"",resetArm:false,importMsg:""};
function field(label,node,hint){const l=el("label",null,label);l.append(node);if(hint)l.append(el("span","note",hint));return l;}
function renderSettings(m){backHead(m,"せってい","Settings");
  // companion
  let t=el("div","ticket"),hd=el("div","head");hd.append(el("span",null,"Companion"));t.append(hd);let b=el("div","body");
  const pk=el("div","pick");Object.keys(CHARS).forEach(id=>{const c=CHARS[id];const x=btn(null,null,()=>{S.char=id;save();render();},"set-"+id);x.setAttribute("aria-pressed",String(S.char===id));const d=el("div");d.innerHTML=charSVG(id,{level:streak()});x.append(d.firstChild,el("b",null,c.k),el("span",null,c.pun));pk.append(x);});
  b.append(pk);t.append(b);m.append(t);
  // about you
  t=el("div","ticket");hd=el("div","head");hd.append(el("span",null,"Your trip"),el("span",null,"Stays on this device"));t.append(hd);b=el("div","body");
  const name=el("input",null,null,{id:"setName",type:"text",autocapitalize:"off",autocomplete:"off",placeholder:"e.g. sa-ra, or サラ"});name.value=S.name;
  const nprev=el("span","note",S.name?"Used as: "+S.name:"");name.addEventListener("change",()=>{S.name=nameKana(name.value);name.value=S.name;nprev.textContent=S.name?"Used as: "+S.name:"";save();});
  const nl=field("Your first name, for introductions",name);nl.append(nprev);b.append(nl);
  const grp=el("input",null,null,{id:"setGroup",type:"number",min:"1",max:"20",inputmode:"numeric"});grp.value=S.group;grp.addEventListener("change",()=>{S.group=Math.max(1,Math.min(20,parseInt(grp.value,10)||1));save();});
  b.append(field("How many in your group",grp,"Conversations will seat and serve this many."));
  const food=el("textarea",null,null,{id:"setFood",placeholder:"e.g. one vegetarian; one person can't have garlic or onion"});food.value=S.food;food.addEventListener("change",()=>{S.food=food.value.trim();save();});
  b.append(field("Food needs in the group",food,"Sent to Claude only when you start a conversation or build a phrase."));
  const date=el("input",null,null,{id:"setDate",type:"date"});date.value=S.tripDate;date.addEventListener("change",()=>{S.tripDate=date.value;save();});
  b.append(field("First day in Japan",date,"For the countdown on the Today screen."));
  t.append(b);m.append(t);
  // display + sound
  t=el("div","ticket");hd=el("div","head");hd.append(el("span",null,"Reading and sound"));t.append(hd);b=el("div","body");
  let row=el("div","row between");row.append(el("span",null,"Romaji under the kana"));let seg=el("div","seg");[[true,"Show"],[false,"Hide"]].forEach(([v,l])=>{const x=btn(null,l,()=>{S.romaji=v;save();applyDisplay();render();},"romaji-"+v);x.setAttribute("aria-pressed",String(S.romaji===v));seg.append(x);});row.append(seg);b.append(row);
  row=el("div","row between");row.append(el("span",null,"Speaking speed"));seg=el("div","seg");[[0.7,"Slow"],[0.85,"Steady"],[1,"Natural"]].forEach(([v,l])=>{const x=btn(null,l,()=>{S.rate=v;save();render();speak("こんにちは");});x.setAttribute("aria-pressed",String(S.rate===v));seg.append(x);});row.append(seg);b.append(row);
  row=el("div","row");row.append(btn("btn small","Test the speaker",()=>{speak("こんにちは。きょう は いい てんき です ね。");toast(jaVoice?"Voice: "+jaVoice.name:"No Japanese voice found on this device");},"testSpeak"));
  if(canListen){const out=el("div","heard grow",SET.micMsg);row.append(micButton({small:true,onInterim(x){out.textContent=x;},onText(x){SET.micMsg="Heard: "+x;out.textContent=SET.micMsg;},onError(c){SET.micMsg=srError(c);out.textContent=SET.micMsg;}}),out);}
  b.append(row);
  b.append(el("p","note",canListen?"Tap the round button, say こんにちは, then tap it again. If it writes down what you said, voice features will work on this device.":"This browser has no speech recognition. Voice features need Safari on iPhone, or Chrome on a computer. Everything else works by typing."));
  t.append(b);m.append(t);
  // API key
  t=el("div","ticket");hd=el("div","head");hd.append(el("span",null,"Claude API key"),el("span",null,S.key?"Saved":"Not set"));t.append(hd);b=el("div","body");
  b.append(el("p","note","Conversations, My phrases and the smarter speech check call Claude with your own key. It is stored only in this browser and sent only to Anthropic. Lessons, review and the phrasebook work without it."));
  const key=el("input",null,null,{id:"setKey",type:"password",placeholder:"sk-ant-…",autocomplete:"off",autocapitalize:"off",spellcheck:"false"});key.value=S.key;key.addEventListener("change",()=>{S.key=key.value.trim();SET.keyMsg="";save();render();});b.append(field("API key",key));
  const model=el("select",null,null,{id:"setModel"});[["claude-sonnet-5-5","Sonnet 5.5 (better conversation)"],["claude-haiku-5-5","Haiku 5.5 (cheaper and faster)"]].forEach(([v,l])=>{const o=el("option",null,l);o.value=v;model.append(o);});model.value=S.model;model.addEventListener("change",()=>{S.model=model.value;save();});b.append(field("Model for conversations",model));
  row=el("div","row");const tk=btn("btn small","Test the key",async()=>{SET.keyMsg="Testing…";render();try{await callClaude("Reply with the single word OK.",{max:20});SET.keyMsg="The key works.";}catch(e){SET.keyMsg=apiError(e);}render();},"testKey");tk.disabled=!S.key;row.append(tk,el("span","note",SET.keyMsg));b.append(row);
  t.append(b);m.append(t);
  // backup
  t=el("div","ticket");hd=el("div","head");hd.append(el("span",null,"Backup"));t.append(hd);b=el("div","body");
  b.append(el("p","note","Your progress lives in this browser. Save a backup file now and then, and before switching phones. The backup leaves out your API key."));
  row=el("div","row");row.append(btn("btn small","Save a backup file",exportData,"exportBtn"));
  const file=el("input",null,null,{id:"importFile",type:"file",accept:".json,application/json"});file.hidden=true;file.addEventListener("change",()=>importData(file.files[0]));
  row.append(btn("btn small","Restore from a file",()=>file.click(),"importBtn"),file);b.append(row);if(SET.importMsg)b.append(el("div","note",SET.importMsg));
  row=el("div","row");if(!SET.resetArm)row.append(btn("linkish","Reset all progress",()=>{SET.resetArm=true;render();},"resetBtn"));
  else row.append(el("span","note","This wipes lessons, stamps and reviews on this device."),btn("btn small","Yes, reset",()=>{const keep={key:S.key,model:S.model};S=Object.assign(blank(),keep);SET.resetArm=false;save();MORE.page="menu";setTab("home");},"resetYes"),btn("btn small","Cancel",()=>{SET.resetArm=false;render();}));
  b.append(row);t.append(b);m.append(t);
}
function exportData(){const copy=JSON.parse(JSON.stringify(S));delete copy.key;const blob=new Blob([JSON.stringify(copy)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tabi-kaiwa-backup-"+today()+".json";document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);toast("Backup saved to your downloads");}
function importData(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result);if(!j||typeof j!=="object"||!j.done||!j.cards)throw 0;const key=S.key;S=normalize(j);S.key=key||S.key||"";save();applyDisplay();SET.importMsg="Restored: "+stampCount()+" stamps, "+Object.keys(S.cards).length+" cards.";}catch(e){SET.importMsg="That file isn't a Tabi Kaiwa backup.";}render();};r.readAsText(f);}
function applyDisplay(){document.body.classList.toggle("no-romaji",!S.romaji);}
