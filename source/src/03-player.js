/* ===================== STEP PLAYER ===================== */
// A full-screen sequence of steps. Each step is {label, render(api, state)}.
let PLAYER=null;
function openPlayer(cfg){PLAYER={cfg:cfg,i:0,score:0,asked:0,states:cfg.steps.map(()=>({}))};document.body.classList.add("in-player");renderPlayer();window.scrollTo(0,0);}
function closePlayer(){if(PLAYER&&PLAYER.cfg.onClose)PLAYER.cfg.onClose();PLAYER=null;try{speechSynthesis.cancel();}catch(e){}document.body.classList.remove("in-player");render();window.scrollTo(0,0);}
function renderPlayer(){
  const P=PLAYER;if(!P)return;const m=$("main");m.innerHTML="";
  const step=P.cfg.steps[P.i],st=P.states[P.i];
  const top=el("div","player-top");
  top.append(btn("btn small","✕",closePlayer,"playerClose"));top.firstChild.setAttribute("aria-label","Close");
  const pr=el("div","progress"),bar=el("span");bar.style.width=(P.cfg.steps.length>1?P.i/(P.cfg.steps.length-1)*100:100)+"%";pr.append(bar);
  top.append(pr,el("span","count",(P.i+1)+"/"+P.cfg.steps.length));m.append(top);
  const t=el("div","ticket flipin"),head=el("div","head");
  head.append(el("span",null,step.label||""),el("span",null,P.cfg.title||""));t.append(head);
  const body=el("div","body");t.append(body);
  const api={P:P,body:body,ticket:t,_label:"Next",_fn:null,_ready:true,_extra:[],
    next(){P.i=Math.min(P.i+1,P.cfg.steps.length-1);renderPlayer();window.scrollTo(0,0);},
    ready(v){api._ready=v;},
    footer(label,fn){api._label=label;api._fn=fn||null;},
    also(label,fn,cls){api._extra.push([label,fn,cls]);},
    rerender(){renderPlayer();},
    score(ok){P.asked++;if(ok)P.score++;},
    second(){t.append(el("div","perf"));const b=el("div","body");t.append(b);return b;}};
  step.render(api,st);
  m.append(t);
  if(api._label!==null){const f=el("div","foot");
    const b=btn("btn primary wide",api._label,api._fn||api.next,"nextBtn");b.disabled=!api._ready;f.append(b);
    api._extra.forEach(x=>f.append(btn("btn "+(x[2]||"wide"),x[0],x[1])));t.append(f);}
}
function glossPlain(g){return g.replace(/\s*\(.*?\)/g,"").replace(/[\[\]]/g,"").split(" / ")[0];}
function fillFrame(f,wid){return f.t.map(t=>t.slot?{w:wid}:t);}
function frameEn(f,wid){const t=f.en.replace("___",glossPlain(W[wid].g));return t.charAt(0).toUpperCase()+t.slice(1);}

/* ---------- shared step kinds ---------- */
function stepWord(wid,isNew){return {label:isNew===false?"Word":"New word",render(api,st){const w=res({w:wid});
  api.body.append(el("div","big-kana",w.k),el("div","big-r r",w.r));
  if([...w.k].length>1)api.body.append(moraeRow(w.k));
  const r=el("div","row");r.append(listenBtn(w.k));api.body.append(r);
  const b2=api.second();b2.append(el("div","meaning",w.g));if(w.why)b2.append(el("p","why",w.why));
  api.footer("Got it");if(!st.spoke){st.spoke=true;speak(w.k);}}};}
const SET_TITLES={num:"Numbers 1 to 10",people:"Counting people",thing:"Counting things",time:"The hours",flat:"Counting flat things",nights:"Counting nights",minutes:"Minutes",days:"Counting days"};
function stepSet(name,ids){return {label:"New set",render(api){
  api.body.append(el("div","meaning",SET_TITLES[name]||"A set"),el("p","note","Tap each one to hear it. The ones with a note are the irregular ones to watch."));
  const g=el("div","grid-set");ids.forEach(id=>{const w=W[id];const b=btn(null,null,()=>{speak(w.k);note.textContent=w.k+" = "+w.g+(w.why?". "+w.why:"");});
    b.append(el("span","k",w.k),el("span","r",w.r),el("span","g",w.g));if(w.why)b.style.borderColor="var(--hard)";g.append(b);});
  api.body.append(g);const note=el("p","why","");api.body.append(note);api.footer("Got it");}};}
function stepFrame(f){return {label:"Swap drill",render(api,st){
  if(st.sel==null){st.sel=0;st.tried={0:1};}
  const wid=f.slot[st.sel];const parts=resolve(fillFrame(f,wid));const si=f.t.findIndex(t=>t.slot);
  api.body.append(el("div","label","One pattern, many sentences"));
  api.body.append(interlinear(parts,{size:"lg",hi:si}));
  api.body.append(el("div","meaning",frameEn(f,wid)));
  api.body.append(el("p","note","Tap a word to swap it into the gap."));
  const chips=el("div","chips");f.slot.forEach((id,i)=>{const b=btn("chipbtn",W[id].k,()=>{st.sel=i;st.tried[i]=1;api.rerender();speak(lineText(fillFrame(f,id)));});b.setAttribute("aria-pressed",String(i===st.sel));b.id="slot-"+i;chips.append(b);});
  api.body.append(chips);
  const r=el("div","row");r.append(listenBtn(lineText(parts),"▶ HEAR IT"));api.body.append(r);
  api.ready(f.slot.length<2||Object.keys(st.tried).length>=2);}};}
function stepBuild(p){return {label:"Build it",render(api,st){
  const parts=resolve(toks(p)),n=parts.length;if(!st.shown)st.shown=1;
  api.body.append(el("div","label","One word at a time"));
  api.body.append(interlinear(parts,{size:"lg",shown:st.shown,pop:st.shown-1,hi:st.shown-1}));
  const last=parts[st.shown-1];
  api.body.append(el("p","why",last.k+" = "+last.g+(st.shown>1?". So far: “"+parts.slice(0,st.shown).map(x=>x.g.replace(/[\[\]]/g,"")).join(" ")+"”":"")));
  if(st.shown>=n){const b2=api.second();b2.append(el("div","meaning",p.en));if(p.note)b2.append(el("p","why",p.note));
    const r=el("div","row");r.append(listenBtn(lineText(parts),"▶ HEAR IT"));b2.append(r);
    if(!st.spoke){st.spoke=true;speak(lineText(parts));}}
  else api.footer("Add next word →",()=>{st.shown++;api.rerender();speak(parts[st.shown-1].k);});}};}
function stepMore(list){return {label:"More you can say",render(api){
  api.body.append(el("p","note","Same words, more uses. Tap any word to hear it."));
  list.forEach(p=>{const d=el("div","col");d.style.gap="4px";d.append(interlinear(toks(p),{size:"sm"}));
    const r=el("div","row between");r.append(el("div","en",p.en),listenBtn(lineText(toks(p)),"▶"));d.append(r);
    if(p.note)d.append(el("div","note",p.note));api.body.append(d);});}};}
function stepHear(h,pool){return {label:"What you'll hear",render(api,st){
  const text=lineText(toks(h));
  if(!st.opts){const others=pick(pool.filter(x=>x.en!==h.en),2).map(x=>x.en);st.opts=shuffle([h.en].concat(others));}
  api.body.append(el("div","label","Someone says this to you"));
  if(st.ans||st.peek||!canSpeak)api.body.append(interlinear(toks(h),{gloss:!!st.ans,size:st.ans?"":"lg"}));
  const r=el("div","row");r.append(listenBtn(text,"▶ PLAY"));
  const slow=btn("listen","🐢 SLOW",()=>speak(text,0.6));slow.hidden=!canSpeak;r.append(slow);
  if(!st.ans&&!st.peek&&canSpeak)r.append(btn("linkish","Show the words",()=>{st.peek=true;api.rerender();}));
  api.body.append(r);
  if(!st.played){st.played=true;speak(text);}
  api.body.append(el("div","label","What does it mean?"));
  const box=el("div","opts");st.opts.forEach((o,i)=>{const b=btn("opt",o,()=>{if(st.ans)return;st.ans=o;api.score(o===h.en);api.rerender();},"opt-"+i);
    if(st.ans){b.disabled=true;if(o===h.en)b.classList.add("right");else if(o===st.ans)b.classList.add("wrong");}box.append(b);});
  api.body.append(box);
  if(st.ans){const b2=api.second();b2.append(el("div","meaning",h.en));if(h.tip)b2.append(el("p","why",h.tip));}
  api.ready(!!st.ans);}};}
function stepMeaning(wid,poolIds){return {label:"Check: meaning",render(api,st){const w=res({w:wid});
  if(!st.opts){const pool=uniq(poolIds.filter(x=>x!==wid).map(x=>W[x].g)).filter(g=>g!==w.g);st.opts=shuffle([w.g].concat(pick(pool,3)));}
  api.body.append(el("div","big-kana",w.k),el("div","big-r r",w.r));
  const r=el("div","row");r.append(listenBtn(w.k));api.body.append(r);
  api.body.append(el("div","label","What does it mean?"));
  const box=el("div","opts");st.opts.forEach((o,i)=>{const b=btn("opt",o,()=>{if(st.ans)return;st.ans=o;api.score(o===w.g);api.rerender();},"opt-"+i);
    if(st.ans){b.disabled=true;if(o===w.g)b.classList.add("right");else if(o===st.ans)b.classList.add("wrong");}box.append(b);});
  api.body.append(box);
  if(st.ans){const ok=st.ans===w.g;api.body.append(el("div","verdict "+(ok?"right":"wrong"),ok?"そう! That's it.":"Not quite. It means “"+w.g+"”."));if(!ok&&w.why)api.body.append(el("p","note",w.why));}
  api.ready(!!st.ans);}};}
// q: {tokens, en}
function stepOrder(q,poolIds){return {label:"Check: put it together",render(api,st){
  const parts=resolve(q.tokens);
  if(!st.tiles){const have=parts.map(p=>p.k);const extras=pick(uniq(poolIds).filter(id=>have.indexOf(W[id].k)<0),2).map(id=>res({w:id}));
    st.tiles=shuffle(parts.map(p=>({k:p.k,r:p.r})).concat(extras.map(p=>({k:p.k,r:p.r}))).map((p,i)=>({p:p,i:i})));st.picked=[];}
  api.body.append(el("div","label","Say it in Japanese"),el("div","meaning",q.en),el("p","note","Tap the words in order. Two of them don't belong."));
  const tray=el("div","tray"+(st.result?" "+st.result:""));tray.id="tray";
  st.picked.forEach(ti=>{const tl=st.tiles.find(x=>x.i===ti);const b=btn("tile",null,()=>{if(st.result)return;st.picked=st.picked.filter(x=>x!==ti);api.rerender();});b.append(el("span","k",tl.p.k),el("span","r",tl.p.r));tray.append(b);});
  api.body.append(tray);
  const tiles=el("div","tiles");
  st.tiles.forEach(tl=>{const b=btn("tile",null,()=>{st.picked.push(tl.i);speak(tl.p.k);
      if(st.picked.length===parts.length){const got=st.picked.map(i=>st.tiles.find(x=>x.i===i).p.k).join(" ");st.result=got===parts.map(p=>p.k).join(" ")?"right":"wrong";api.score(st.result==="right");}
      api.rerender();},"tile-"+tl.i);
    b.append(el("span","k",tl.p.k),el("span","r",tl.p.r));b.disabled=st.picked.indexOf(tl.i)>=0||!!st.result;tiles.append(b);});
  api.body.append(tiles);
  if(st.result){const b2=api.second();b2.append(el("div","verdict "+st.result,st.result==="right"?"ばっちり! Perfect.":"Close. Here's the order:"));
    b2.append(interlinear(parts));const r=el("div","row");r.append(listenBtn(lineText(parts),"▶ HEAR IT"));b2.append(r);
    if(st.result==="right"&&!st.spoke){st.spoke=true;speak(lineText(parts));}}
  else if(st.picked.length){const r=el("div","row");r.append(btn("linkish","Clear",()=>{st.picked=[];api.rerender();}));api.body.append(r);}
  api.ready(!!st.result);}};}
// say-it: speak a phrase, the recogniser checks it
function sayPanel(p,st,rerender,onResult){const wrap=el("div","col");const text=lineText(toks(p));
  const row=el("div","row");const heard=el("div","heard grow",st.heard||"");
  const mic=micButton({onStart(){st.verdict=null;heard.textContent="…";},onInterim(t){heard.textContent=t;},
    onText(t,a){st.heard=t;st.busy=true;rerender();
      sayCheck({kj:p.kj,kana:text},t,a).then(v=>{st.busy=false;st.verdict=v.verdict;st.heardKana=v.kana||"";if(onResult)onResult(v.verdict);rerender();});},
    onError(c){st.verdict="error";st.err=srError(c);rerender();}});
  row.append(mic,heard);wrap.append(row);
  if(st.busy)wrap.append(el("div","typing","Checking…"));
  if(st.verdict==="right")wrap.append(el("div","verdict right","ばっちり! It understood you."));
  else if(st.verdict==="close")wrap.append(el("div","verdict close","Close. It heard something slightly different. Listen again and have another go."));
  else if(st.verdict==="wrong")wrap.append(el("div","verdict wrong","It heard something different. Listen once more, then try again."));
  else if(st.verdict==="unsure"){wrap.append(el("div","verdict close","I can't check this one automatically. Listen again and compare it with what you said."));wrap.append(btn("btn small","I said it right",()=>{st.verdict="right";if(onResult)onResult("right");rerender();}));}
  else if(st.verdict==="error")wrap.append(el("div","banner warn",st.err));
  if(st.heardKana&&st.verdict!=="right")wrap.append(el("div","note","Heard: "+st.heardKana));
  return wrap;}
function stepSay(p){return {label:"Say it",render(api,st){
  api.body.append(el("div","label","Out loud"),el("div","meaning",p.en));
  api.body.append(interlinear(toks(p),{size:"lg"}));
  const r=el("div","row");r.append(listenBtn(lineText(toks(p)),"▶ LISTEN FIRST"));api.body.append(r);
  api.body.append(sayPanel(p,st,api.rerender,v=>{if(!st.scored&&(v==="right"||v==="wrong")){st.scored=true;api.score(v==="right");}}));
  api.footer(st.verdict==="right"?"Next":"Skip");}};}
