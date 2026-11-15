/* ===================== HOME ===================== */
function renderOnboard(m){
  const head=el("div","pagehead");const h=el("h1",null,"たびかいわ");h.append(el("small",null,"Tabi Kaiwa"));head.append(h);m.append(head);
  const t=el("div","ticket"),hd=el("div","head");hd.append(el("span",null,"Before you set off"),el("span",null,"1 of 1"));t.append(hd);
  const b=el("div","body");b.append(el("div","meaning","Pick a travel companion"),el("p","note","They follow your progress and say one line a day, using only words you've learned. You can change later in Settings."));
  const pk=el("div","pick");Object.keys(CHARS).forEach(id=>{const c=CHARS[id];const x=btn(null,null,()=>{ONB.char=id;render();},"pick-"+id);x.setAttribute("aria-pressed",String(ONB.char===id));
    const d=el("div");d.innerHTML=charSVG(id,{level:3});x.append(d.firstChild,el("b",null,c.k),el("span",null,c.name),el("span",null,c.blurb));pk.append(x);});
  b.append(pk);
  const lab=el("label",null,"Your first name, for introductions (optional)");const inp=el("input",null,null,{id:"onbName",type:"text",placeholder:"Type it as it sounds, e.g. e-do-wi-n",autocapitalize:"off",autocomplete:"off"});inp.value=ONB.name;
  const prev=el("div","note",ONB.name?"In katakana: "+nameKana(ONB.name):"");inp.addEventListener("input",()=>{ONB.name=inp.value;prev.textContent=inp.value?"In katakana: "+nameKana(inp.value):"";});lab.append(inp);b.append(lab,prev);
  t.append(b);const f=el("div","foot");const go=btn("btn primary wide","Start",()=>{S.char=ONB.char;S.name=nameKana(ONB.name);save();render();},"onbStart");go.disabled=!ONB.char;f.append(go);t.append(f);m.append(t);
  m.append(el("p","note","Everything you do here is saved on this device only. Nothing is uploaded."));}
let ONB={char:null,name:""};
function nameKana(s){s=(s||"").trim();if(!s)return "";return /[぀-ヿ]/.test(s)?toKata(s.replace(/\s+/g,"")):romajiToKata(s);}
function daysToTrip(){if(!S.tripDate)return null;const d=new Date(S.tripDate+"T00:00:00");if(isNaN(d))return null;const t=new Date();t.setHours(0,0,0,0);return Math.round((d-t)/DAY);}
function suggestScene(){const open=allScenes().filter(s=>isDone(s.after));const b=open.filter(s=>s.boss&&!S.boss[s.id]);return (b[b.length-1]||open[open.length-1]||null);}
function renderHome(m){
  if(!S.char)return renderOnboard(m);
  const head=el("div","pagehead");const h=el("h1",null,"たびかいわ");h.append(el("small",null,"Tabi Kaiwa"));head.append(h);
  const dt=daysToTrip();if(dt!==null)head.append(el("span","label",dt>0?dt+" days to go":dt===0?"Today's the day":"いってらっしゃい"));m.append(head);
  const hero=el("div","hero");hero.append(charNode());const bub=el("div","bubble-say");bub.append(el("div","who",CHARS[S.char].k),interlinear(dailySaying(),{size:"sm"}));hero.append(bub);m.append(hero);
  const due=dueKeys().length,sk=streak();
  const stats=el("div","stats");[["Day streak",sk],["Stamps",stampCount()+"/"+stampTotal()],["Due",due]].forEach(([k,v])=>{const d=el("div","stat");d.append(el("b",null,String(v)),k);stats.append(d);});m.append(stats);
  if(!storageOK)m.append(el("div","banner warn","This browser isn't saving your progress (private browsing?). Open the app in a normal Safari tab."));
  // today's three things
  const nx=nextId(),sc=suggestScene();
  const t=el("div","ticket"),hd=el("div","head");hd.append(el("span",null,"きょう · Today"),el("span",null,new Date().toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})));t.append(hd);
  const b=el("div","body");b.style.gap="0";
  const todos=[];
  const hasCards=Object.keys(S.cards).length>0;
  if(hasCards)todos.push({id:"todo-review",done:due===0,t:due?"Review "+Math.min(due,25)+" card"+(due===1?"":"s"):"Reviews done",s:due?"Words and phrases that are about to fade":"Nothing is due right now",go:due?startReview:null});
  if(nx){const L=LMAP[nx];todos.push({id:"todo-lesson",done:didToday("lesson"),t:(didToday("lesson")?"Another lesson: ":"Lesson: ")+L.k,s:L.en+" · about 10 minutes",go:()=>startLesson(nx)});}
  else todos.push({id:"todo-lesson",done:true,t:"All lessons finished",s:"Keep the reviews and conversations going",go:null});
  if(sc)todos.push({id:"todo-talk",done:didToday("talk"),t:"Talk: "+sc.k,s:S.key?sc.en+" · a short voice scene":"Add your API key in Settings to unlock",go:()=>{if(!S.key){MORE.page="settings";setTab("more");}else{TALK.scene=sc.id;setTab("talk");}}});
  todos.forEach(x=>{const r=btn("todo"+(x.done?" done":""),null,x.go,x.id);if(!x.go)r.disabled=true;r.append(el("span","tick",x.done?"✓":""));const d=el("div");d.append(el("div","t",x.t),el("div","s",x.s));r.append(d,el("span","chev",x.go?"→":""));b.append(r);});
  t.append(b);
  const first=todos.find(x=>!x.done&&x.go)||todos.find(x=>x.go);
  if(first){const f=el("div","foot");f.append(btn("btn primary wide",todos.every(x=>x.done)?"Keep going":"Start",first.go,"todayStart"));t.append(f);}
  m.append(t);
  if(!lessonsDone()&&!isDone("K1"))m.append(el("p","note","Start with the two kana warm-ups, then the lessons run in the order of your trip: Osaka, Kyoto, the drive, Niseko, Tokyo."));
}
