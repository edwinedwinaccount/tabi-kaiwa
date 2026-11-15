/* ===================== LESSONS ===================== */
function lessonPool(L){return uniq(L.words.concat(L.forms).concat(knownWordIds()));}
function hearPool(L){const out=[];LESSONS.forEach(x=>{if(x.i<=L.i)x.hear.forEach(h=>out.push(h));});L.phrases.forEach(p=>out.push(p));return out;}
function groupWords(L){ // singles in order, sets collapsed where they first appear
  const out=[],seen={};L.words.forEach(id=>{const s=W[id].set;if(!s)out.push({id:id});else if(!seen[s]){seen[s]=1;out.push({set:s,ids:L.words.filter(x=>W[x].set===s)});}});return out;}
function checkQuestions(L,nMean,nOrder){
  const pool=lessonPool(L),steps=[];
  const cand=shuffle(L.words.concat(L.forms));
  cand.slice(0,nMean).forEach(id=>steps.push(stepMeaning(id,pool)));
  const qs=[];
  shuffle(L.phrases.filter(p=>toks(p).length>=2&&toks(p).length<=8&&!toks(p).some(t=>t.name))).slice(0,nOrder).forEach(p=>qs.push({tokens:toks(p),en:p.en}));
  // one fresh sentence built from a pattern, so it can't be answered from memory
  shuffle(L.frames).slice(0,1).forEach(f=>{const wid=pick(f.slot,1)[0];qs.push({tokens:fillFrame(f,wid),en:frameEn(f,wid)});});
  qs.forEach(q=>steps.push(stepOrder(q,pool)));
  return steps;}
function startLesson(id){
  const L=LMAP[id];if(L.kana)return startKanaLesson(id);
  const steps=[];
  steps.push({label:"Lesson "+(L.i+1),render(api){
    api.body.append(el("div","big-kana",L.k));api.body.append(el("div","meaning",L.en));
    api.body.append(el("div","label","After this you can"),el("p","why",L.can));
    api.body.append(el("div","label","The idea"),el("p","why",L.point));
    api.footer(isDone(L.id)?"Practise again":"Start");
    if(!isDone(L.id))api.also("I know this: test me",()=>startTestOut(id),"");}});
  groupWords(L).forEach(g=>steps.push(g.set?stepSet(g.set,g.ids):stepWord(g.id)));
  L.forms.forEach(id=>steps.push(stepWord(id)));
  L.frames.forEach(f=>steps.push(stepFrame(f)));
  L.phrases.slice(0,4).forEach(p=>steps.push(stepBuild(p)));
  if(L.phrases.length>4)steps.push(stepMore(L.phrases.slice(4)));
  const hp=hearPool(L);L.hear.forEach(h=>steps.push(stepHear(h,hp)));
  checkQuestions(L,6,3).forEach(s=>steps.push(s));
  if(canListen)pick(L.phrases.filter(p=>!toks(p).some(t=>t.name)),2).forEach(p=>steps.push(stepSay(p)));
  steps.push(stepLessonDone(L));
  openPlayer({title:L.en,steps:steps});}
function stepLessonDone(L,passedTest){return {label:"Finished",render(api,st){
  if(!st.done){st.done=true;st.first=completeLesson(L.id);}
  const P=api.P;const c=el("div","celebrate");const ch=el("div");ch.innerHTML=charSVG(S.char||"tabinuki",{level:streak(),happy:true});c.append(ch.firstChild);
  const hk=el("div","hanko big"+(st.first?" fresh":""),L.kana?L.k.slice(0,2):String(L.i+1));c.append(hk);
  c.append(el("div","big-kana","おつかれさま"));api.body.append(c);
  const n=L.kana?0:L.words.length+L.forms.length;
  api.body.append(el("p","why",(P.asked?"Checks: "+P.score+" of "+P.asked+" right. ":"")+(L.kana?"Stamp collected.":(st.first?"Stamp collected. ":"")+n+" words and "+L.phrases.length+" phrases are in your review deck. They come back in ten minutes, then spread out as you get them right.")));
  const nx=nextId();
  if(nx){api.footer("Next: "+LMAP[nx].k,()=>{startLesson(nx);});api.also("Done for now",closePlayer);}
  else api.footer("Done",closePlayer);}};}
function startTestOut(id){const L=LMAP[id];const steps=checkQuestions(L,4,3);
  steps.push({label:"Result",render(api,st){const P=api.P;const pass=P.asked-P.score<=1;
    if(pass){stepLessonDone(L).render(api,st);return;}
    api.body.append(el("div","meaning",P.score+" of "+P.asked+" right"),el("p","why","Not quite enough to skip this one. The lesson takes about ten minutes and covers exactly what you missed."));
    api.footer("Do the lesson",()=>startLesson(id));api.also("Back",closePlayer);}});
  openPlayer({title:"Test: "+L.en,steps:steps});}

/* ===================== PATH (the trip route) ===================== */
function renderLearn(m){
  const head=el("div","pagehead");const h=el("h1",null,"みち");h.append(el("small",null,"Your route"));head.append(h,el("span","label",stampCount()+" / "+stampTotal()+" stamps"));m.append(head);
  const pr=el("div","progress"),bar=el("span");bar.style.width=(stampCount()/stampTotal()*100)+"%";pr.append(bar);m.append(pr);
  const nx=nextId();
  const stop=(id)=>{const L=LMAP[id];const b=btn("stop"+(isDone(id)?" done":"")+(id===nx?" next":""),null,()=>startLesson(id),"stop-"+id);
    const mid=el("div");mid.append(el("div","t",L.k),el("div","s",L.en));b.append(mid);
    b.append(isDone(id)?el("div","hanko",L.kana?L.k.slice(0,1):String(L.i+1)):el("span","chip"+(id===nx?" next":""),id===nx?"Up next":L.kana?"Warm-up":"Lesson "+(L.i+1)));return b;};
  // departure: kana
  const st0=el("div","station");st0.append(el("div","plate","しゅっぱつ"),el("div","sub","Departure · kana warm-up"));m.append(st0);
  const r0=el("div","route");KANA.lessons.forEach(k=>r0.append(stop(k.id)));m.append(r0);
  STAGES.forEach(sg=>{
    const st=el("div","station");st.append(el("div","plate",sg.k),el("div","sub",sg.place+" · "+sg.en));m.append(st);
    const r=el("div","route");stageLessons(sg.n).forEach(L=>r.append(stop(L.id)));
    const B=BOSSES.find(b=>b.stage===sg.n);
    if(B){const b=btn("stop boss"+(S.boss[B.id]?" done":""),null,()=>{TALK.scene=B.id;setTab("talk");},"stop-"+B.id);
      const mid=el("div");mid.append(el("div","t",B.k),el("div","s","Voice scene: "+B.en));b.append(mid);
      b.append(S.boss[B.id]?el("div","hanko","★"):el("span","chip","Scene"));r.append(b);}
    m.append(r);});
}
