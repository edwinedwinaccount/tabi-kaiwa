/* ===================== OVERLAYS + REVIEW ===================== */
let OVERLAY=null; // {render(m), onClose}
function openOverlay(o){OVERLAY=o;document.body.classList.add("in-player");render();window.scrollTo(0,0);}
function closeOverlay(){if(OVERLAY&&OVERLAY.onClose)OVERLAY.onClose();OVERLAY=null;try{speechSynthesis.cancel();}catch(e){}document.body.classList.remove("in-player");render();window.scrollTo(0,0);}
function overlayTop(m,title,right){const top=el("div","player-top");const x=btn("btn small","✕",closeOverlay,"overlayClose");x.setAttribute("aria-label","Close");
  const t=el("div","grow");t.append(el("span","label",title));top.append(x,t);if(right)top.append(right);m.append(top);return top;}

let REV=null;
function startReview(){
  const q=dueKeys().slice(0,25);
  REV={queue:q,total:q.length,cur:q.shift()||null,revealed:false,n:0,st:{}};
  openOverlay({render:renderReview});}
function renderReview(m){
  const seg=el("div","seg");[["ja","にほんご first"],["en","English first"]].forEach(([d,l])=>{const b=btn(null,l,()=>{S.dir=d;save();REV.revealed=false;REV.st={};render();});b.setAttribute("aria-pressed",String(S.dir===d));seg.append(b);});
  overlayTop(m,"Review · "+REV.n+" done"+(REV.queue.length+(REV.cur?1:0)?" · "+(REV.queue.length+(REV.cur?1:0))+" left":""),seg);
  if(!REV.cur){
    const t=el("div","ticket"),b=el("div","body");const c=el("div","celebrate");c.append(charNode({happy:REV.n>0}));c.append(el("div","big-kana","おわり"));b.append(c);
    const up=Object.keys(S.cards).map(k=>S.cards[k].due).filter(d=>d>Date.now()).sort((a,b)=>a-b)[0];
    const more=dueKeys().length;
    b.append(el("p","why",(REV.n?"Reviewed "+REV.n+". ":"")+(more?more+" more are due.":"Nothing else is due right now."+(up?" Next card in "+fmtDur((up-Date.now())/DAY)+".":""))));
    t.append(b);const f=el("div","foot");if(more)f.append(btn("btn primary wide","Keep going",startReview));f.append(btn("btn wide","Done",closeOverlay,"reviewDone"));t.append(f);m.append(t);return;}
  const it=cardInfo(REV.cur);if(!it){REV.cur=REV.queue.shift()||null;return renderReview(m);}
  const cs=S.cards[it.key],ja=S.dir==="ja",st=REV.st;
  const t=el("div","ticket flipin"),head=el("div","head");
  head.append(el("span",null,{word:"Word",phrase:"Phrase",hear:"Listening",sign:"Sign"}[it.type]),el("span",null,it.custom?"My phrases":it.src?it.src.en:""));t.append(head);
  const front=el("div","body");t.append(front);
  const text=it.type==="word"?it.word.k:it.type==="sign"?it.sign.k:lineText(toks(it.phrase));
  if(it.type==="word"){
    if(ja){front.append(el("div","big-kana",it.word.k),el("div","big-r r",it.word.r));const r=el("div","row");r.append(listenBtn(text));front.append(r);front.append(el("p","note","What does it mean?"));}
    else{front.append(el("div","prompt",glossPlainKeep(it.word)));front.append(el("p","note","Say it in Japanese before you flip."));}
  } else if(it.type==="phrase"){
    if(ja){front.append(interlinear(toks(it.phrase),{gloss:false,size:"lg"}));const r=el("div","row");r.append(listenBtn(text));front.append(r);front.append(el("p","note","What does it mean?"));}
    else{front.append(el("div","prompt",it.phrase.en));
      if(canListen&&!REV.revealed)front.append(sayPanel(it.phrase,st,render,null));
      else if(!REV.revealed)front.append(el("p","note","Say it out loud before you flip."));}
  } else if(it.type==="hear"){
    front.append(el("div","label","Someone says this to you"));
    if(REV.revealed||st.peek||!canSpeak)front.append(interlinear(toks(it.phrase),{gloss:REV.revealed,size:"lg"}));
    const r=el("div","row");r.append(listenBtn(text,"▶ PLAY"));const slow=btn("listen","🐢 SLOW",()=>speak(text,0.6));slow.hidden=!canSpeak;r.append(slow);
    if(!REV.revealed&&!st.peek&&canSpeak)r.append(btn("linkish","Show the words",()=>{st.peek=true;render();}));front.append(r);
    if(!st.played){st.played=true;speak(text);}
  } else {front.append(el("div","signcard",it.sign.s),el("p","note","What does this sign mean?"));}
  if(!REV.revealed){const f=el("div","foot");f.append(btn("btn primary wide","Show answer",()=>{REV.revealed=true;render();if(!ja&&it.type!=="sign"&&it.type!=="hear")speak(text);},"revealBtn"));t.append(f);}
  else{t.append(el("div","perf"));const back=el("div","body");
    if(it.type==="word"){if(!ja){back.append(el("div","big-kana",it.word.k),el("div","big-r r",it.word.r));const r=el("div","row");r.append(listenBtn(text));back.append(r);}
      back.append(el("div","meaning",it.word.g));if(it.word.why)back.append(el("p","why",it.word.why));}
    else if(it.type==="phrase"){back.append(interlinear(toks(it.phrase)));back.append(el("div","meaning",it.phrase.en));if(it.phrase.note)back.append(el("p","note",it.phrase.note));
      if(!ja){const r=el("div","row");r.append(listenBtn(text));back.append(r);}}
    else if(it.type==="hear"){back.append(el("div","meaning",it.phrase.en));if(it.phrase.tip)back.append(el("p","why",it.phrase.tip));}
    else{back.append(el("div","big-kana",it.sign.k),el("div","big-r r",it.sign.r),el("div","meaning",it.sign.g),el("p","note",it.sign.where));const r=el("div","row");r.append(listenBtn(it.sign.k));back.append(r);}
    t.append(back);
    const g=el("div","grades");[["again","Again"],["hard","Hard"],["good","Good"],["easy","Easy"]].forEach(([k,l])=>{const n=srsNext(cs,k);const b=btn(k,null,()=>gradeCard(k),"grade-"+k);b.append(l,el("span",null,fmtDur(INTERVALS[n.box])));g.append(b);});
    t.append(g);}
  m.append(t);
}
function glossPlainKeep(w){return w.g.replace(/[\[\]]/g,"")+(w.part?" (grammar marker)":"");}
function gradeCard(k){S.cards[REV.cur]=srsNext(S.cards[REV.cur],k);if(k==="again")REV.queue.splice(Math.min(3,REV.queue.length),0,REV.cur);
  REV.n++;logAct("rev");REV.cur=REV.queue.shift()||null;REV.revealed=false;REV.st={};save();render();window.scrollTo(0,0);}
