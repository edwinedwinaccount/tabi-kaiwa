/* ===================== KANA ===================== */
const KROWS=["あいうえお","かきくけこ","さしすせそ","たちつてと","なにぬねの","はひふへほ","まみむめも","や　ゆ　よ","らりるれろ","わ　　　を","ん"];
const KMARK=["がぎぐげご","ざじずぜぞ","だぢづでど","ばびぶべぼ","ぱぴぷぺぽ"];
const KYOON=["きゃ","きゅ","きょ","しゃ","しゅ","しょ","ちゃ","ちゅ","ちょ","にゃ","にゅ","にょ","ひゃ","ひゅ","ひょ","みゃ","みゅ","みょ","りゃ","りゅ","りょ","ぎゃ","ぎゅ","ぎょ","じゃ","じゅ","じょ","びゃ","びゅ","びょ","ぴゃ","ぴゅ","ぴょ"];
function toKata(s){return s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));}
function kanaRom(k){return morae(k).map(x=>x.r).join("");}
function kanaTable(rows,kata,note){const g=el("div","kana-table");rows.forEach(row=>{[...row].forEach(ch=>{if(ch==="　"){const b=el("button","blank");b.disabled=true;g.append(b);return;}
    const k=kata?toKata(ch):ch;const b=btn(null,null,()=>{speak(k);if(note)note.textContent=k+" = "+kanaRom(k);});b.append(el("span","k",k),el("span","rr",kanaRom(k)));g.append(b);});
    for(let i=[...row].length;i<5;i++){const b=el("button","blank");b.disabled=true;g.append(b);}});return g;}
function kanaPool(kata,withYoon){let a=[];KROWS.concat(KMARK).forEach(r=>[...r].forEach(c=>{if(c!=="　")a.push(c);}));if(withYoon)a=a.concat(KYOON);return kata?a.map(toKata):a;}
function kanaOptions(k,pool){const r=kanaRom(k);const others=uniq(pool.map(kanaRom)).filter(x=>x!==r);
  // prefer look-alikes and sound-alikes as distractors
  const conf=[];KANA.confusable.forEach(g=>{if(g.indexOf(k)>=0)g.forEach(x=>{if(x!==k)conf.push(kanaRom(x));});});
  const near=others.filter(x=>x.slice(-1)===r.slice(-1)||x[0]===r[0]);
  return shuffle(uniq([r].concat(conf,pick(near,3),pick(others,3))).slice(0,4));}
function stepKanaQ(k,pool){return {label:"Check: read it",render(api,st){const r=kanaRom(k);if(!st.opts)st.opts=kanaOptions(k,pool);
  api.body.append(el("div","game-q",k));const box=el("div","game-opts");
  st.opts.forEach((o,i)=>{const b=btn("opt",o,()=>{if(st.ans)return;st.ans=o;api.score(o===r);speak(k);api.rerender();},"opt-"+i);if(st.ans){b.disabled=true;if(o===r)b.classList.add("right");else if(o===st.ans)b.classList.add("wrong");}box.append(b);});
  api.body.append(box);api.ready(!!st.ans);}};}
function startKanaLesson(id){const K=LMAP[id],kata=id==="K2";const pool=kanaPool(kata,true);
  const steps=[{label:"Warm-up",render(api){api.body.append(el("div","big-kana",K.k),el("div","meaning",K.en),el("div","label","After this you can"),el("p","why",K.can),el("div","label","The idea"),el("p","why",K.point));api.footer(isDone(id)?"Practise again":"Start");}},
    {label:"The basic sounds",render(api){api.body.append(el("p","note","Tap any you've forgotten to hear it. The romaji under each can be hidden in Settings later."));const note=el("p","why","");api.body.append(kanaTable(KROWS,kata,note),note);}},
    {label:"Marks and blends",render(api){api.body.append(el("p","note","Two marks change the consonant: k to g, s to z, t to d, h to b, and the small circle makes p."));const note=el("p","why","");api.body.append(kanaTable(KMARK,kata,note));
      api.body.append(el("p","note","A small "+(kata?"ャ, ュ or ョ":"ゃ, ゅ or ょ")+" blends with the kana before it."));const g=el("div","kana-table");g.style.gridTemplateColumns="repeat(3,1fr)";
      KYOON.slice(0,21).forEach(y=>{const k=kata?toKata(y):y;const b=btn(null,null,()=>{speak(k);note.textContent=k+" = "+kanaRom(k);});b.append(el("span","k",k),el("span","rr",kanaRom(k)));g.append(b);});api.body.append(g,note);}},
    {label:"Read real words",render(api,st){st.open=st.open||{};api.body.append(el("p","note","Sound each one out, then tap to check."));
      K.practice.forEach((p,i)=>{const b=btn("opt jp",null,()=>{st.open[i]=1;speak(p[0]);api.rerender();},"read-"+i);b.append(p[0]);if(st.open[i]){b.append(el("span","note","  "+p[2]+" · "+p[1]));}api.body.append(b);});}}];
  const weak=uniq([].concat.apply([],KANA.confusable)).filter(k=>pool.indexOf(k)>=0);
  pick(weak,5).concat(pick(pool.filter(k=>weak.indexOf(k)<0),9)).forEach(k=>steps.push(stepKanaQ(k,pool)));
  steps.push({label:"Result",render(api,st){const P=api.P;if(P.score/P.asked>=0.8){stepLessonDone(K).render(api,st);return;}
    api.body.append(el("div","meaning",P.score+" of "+P.asked+" right"),el("p","why","Close. You need 12 of 14 for the stamp. The speed round under More is a quick way to sharpen up, then try again."));
    api.footer("Try again",()=>startKanaLesson(id));api.also("Back",closePlayer);}});
  openPlayer({title:K.en,steps:steps});}

/* ===================== GAMES ===================== */
const ONES=["","いち","に","さん","よん","ご","ろく","なな","はち","きゅう"];
function numToKana(n){let s="";const man=Math.floor(n/10000);n%=10000;if(man)s+=numToKana(man)+"まん";
  const sen=Math.floor(n/1000);n%=1000;if(sen)s+=sen===1?"せん":sen===3?"さんぜん":sen===8?"はっせん":ONES[sen]+"せん";
  const h=Math.floor(n/100);n%=100;if(h)s+=h===1?"ひゃく":h===3?"さんびゃく":h===6?"ろっぴゃく":h===8?"はっぴゃく":ONES[h]+"ひゃく";
  const j=Math.floor(n/10);n%=10;if(j)s+=(j===1?"":ONES[j])+"じゅう";if(n)s+=ONES[n];return s;}
const HOURS=["","いちじ","にじ","さんじ","よじ","ごじ","ろくじ","しちじ","はちじ","くじ","じゅうじ","じゅういちじ","じゅうにじ"];
const MINS={0:"",5:"ごふん",10:"じゅっぷん",15:"じゅうごふん",20:"にじゅっぷん",25:"にじゅうごふん",30:"はん",35:"さんじゅうごふん",40:"よんじゅっぷん",45:"よんじゅうごふん",50:"ごじゅっぷん",55:"ごじゅうごふん"};
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
const GAMES={
 kana:{k:"かな",name:"Kana speed round",sub:"60 seconds. How many can you read?",timed:60,
   make(){const kata=Math.random()<0.5;const pool=kanaPool(kata,true);const weak=uniq([].concat.apply([],KANA.confusable)).filter(x=>pool.indexOf(x)>=0);
     const k=Math.random()<0.35?pick(weak,1)[0]:pick(pool,1)[0];return {show:k,opts:kanaOptions(k,pool),ans:kanaRom(k),say:k};}},
 price:{k:"ねだん",name:"Prices by ear",sub:"Hear a price, pick the number.",n:10,
   make(){const tiers=[()=>rnd(1,9)*100,()=>rnd(11,99)*10,()=>rnd(1,9)*1000+rnd(0,9)*100,()=>rnd(1,3)*10000+rnd(0,9)*1000,()=>rnd(10,99)*100+rnd(0,1)*50];
     const n=pick(tiers,1)[0]();const alts=uniq([n,n*10,Math.round(n/10)||n+100,n+100,n+1000,Math.max(100,n-100),n+300,n+500,n+6000]).filter(x=>x!==n&&x>0);
     const kana=numToKana(n)+"えん";return {listen:kana,opts:shuffle([n].concat(pick(alts,3))).map(x=>"¥"+x.toLocaleString("en-US")),ans:"¥"+n.toLocaleString("en-US"),after:kana};}},
 time:{k:"じかん",name:"Times by ear",sub:"Hear a time, pick the clock.",n:10,
   make(){const h=rnd(1,12),m=pick([0,0,30,30,5,10,15,20,40,45,50],1)[0];const f=(a,b)=>a+":"+String(b).padStart(2,"0");
     const alts=uniq([f(h%12+1,m),f(h,(m+30)%60),f(h===4?7:h===7?1:h===9?5:(h+5)%12+1,m),f(h,m===0?15:0),f((h+1)%12+1,(m+15)%60)]).filter(x=>x!==f(h,m));
     const kana=HOURS[h]+MINS[m]+"です";return {listen:kana,opts:shuffle([f(h,m)].concat(pick(alts,3))),ans:f(h,m),after:HOURS[h]+" "+MINS[m]};}},
 count:{k:"かぞえる",name:"Counting",sub:"People, things, tickets, nights and days.",n:10,
   make(){const sets=[["person","people",["hitori","futari","sannin","yonin","gonin","rokunin"]],["of something","of something",["hitotsu","futatsu","mittsu","yottsu","itsutsu","muttsu"]],
       ["ticket","tickets",["ichimai","nimai","sanmai","yonmai","gomai","rokumai"]],["night","nights",["ippaku","nihaku","sanpaku"]],["day","days",["ichinichi","futsuka","mikka","yokka","itsuka"]]];
     const s=pick(sets,1)[0];const i=rnd(0,s[2].length-1);const others=pick(s[2].filter((x,j)=>j!==i),Math.min(2,s[2].length-1)).concat(pick(pick(sets.filter(x=>x!==s),1)[0][2],1));
     const lab=(i+1)+" "+(i===0?s[0]:s[1]);
     return {showText:lab,opts:shuffle([s[2][i]].concat(others)).map(id=>W[id].k),ans:W[s[2][i]].k,jp:true,say:W[s[2][i]].k};}}
};
let GAME=null;
function startGame(id){const g=GAMES[id];GAME={id:id,g:g,score:0,asked:0,q:null,ans:null,over:false,left:g.timed||0,timer:null};nextQ();
  openOverlay({render:renderGame,onClose(){if(GAME&&GAME.timer)clearInterval(GAME.timer);GAME=null;}});
  if(g.timed){GAME.timer=setInterval(()=>{if(!GAME)return;GAME.left--;const t=$("gameTimer");if(t)t.style.width=(GAME.left/g.timed*100)+"%";if(GAME.left<=0)endGame();},1000);}}
function nextQ(){GAME.q=GAME.g.make();GAME.ans=null;GAME.spoke=false;}
function endGame(){if(GAME.timer)clearInterval(GAME.timer);GAME.over=true;const b=S.best[GAME.id]||0;GAME.newBest=GAME.score>b;if(GAME.newBest)S.best[GAME.id]=GAME.score;logAct("game");save();render();}
function renderGame(m){const G=GAME,g=G.g;overlayTop(m,g.name,el("span","count",g.timed?G.score+" right":(Math.min(G.asked+1,g.n))+"/"+g.n));
  if(g.timed){const t=el("div","timer"),s=el("span");s.id="gameTimer";s.style.width=(G.left/g.timed*100)+"%";t.append(s);m.append(t);}
  const t=el("div","ticket"),b=el("div","body");t.append(b);
  if(G.over){const c=el("div","celebrate");c.append(charNode({happy:true}),el("div","big-kana",String(G.score)),el("div","meaning",g.timed?"read in "+g.timed+" seconds":"out of "+g.n));
    c.append(el("p","why",G.newBest?"A new best.":"Your best is "+(S.best[G.id]||0)+"."));b.append(c);
    const f=el("div","foot");f.append(btn("btn primary wide","Again",()=>{const id=G.id;closeOverlay();startGame(id);},"gameAgain"),btn("btn wide","Done",closeOverlay));t.append(f);m.append(t);return;}
  const q=G.q;
  if(q.show)b.append(el("div","game-q",q.show));
  if(q.showText)b.append(el("div","meaning",q.showText),el("p","note","How do you say it?"));
  if(q.listen){if(canSpeak){const r=el("div","row");r.style.justifyContent="center";r.append(listenBtn(q.listen,"▶ PLAY AGAIN"),btn("listen","🐢 SLOW",()=>speak(q.listen,0.6)));b.append(el("p","note","Listen, then pick what you heard."),r);if(!G.spoke){G.spoke=true;speak(q.listen);}}
    else b.append(el("div","big-kana",q.after));}
  const box=el("div","game-opts");q.opts.forEach((o,i)=>{const x=btn("opt"+(q.jp?" jp":""),o,()=>{if(G.ans)return;G.ans=o;G.asked++;const ok=o===q.ans;if(ok)G.score++;if(q.say)speak(q.say);
      if(g.timed){render();setTimeout(()=>{if(GAME===G&&!G.over){nextQ();render();}},ok?250:900);}else render();},"opt-"+i);
    if(G.ans){x.disabled=true;if(o===q.ans)x.classList.add("right");else if(o===G.ans)x.classList.add("wrong");}box.append(x);});
  b.append(box);
  if(G.ans&&!g.timed){if(q.after)b.append(el("div","heard",q.after));
    const f=el("div","foot");f.append(btn("btn primary wide",G.asked>=g.n?"Finish":"Next",()=>{if(G.asked>=g.n)endGame();else{nextQ();render();}},"nextBtn"));t.append(f);}
  m.append(t);}

/* ===================== MORE: play, stamps, signs ===================== */
let MORE={page:"menu"};
function renderMore(m){
  if(MORE.page==="settings")return renderSettings(m);
  if(MORE.page==="stamps")return renderStamps(m);
  if(MORE.page==="signs")return renderSigns(m);
  if(MORE.page==="kana")return renderKanaPage(m);
  const head=el("div","pagehead");const h=el("h1",null,"もっと");h.append(el("small",null,"More"));head.append(h);m.append(head);
  m.append(el("div","label","Play"));
  const menu=el("div","menu");Object.keys(GAMES).forEach(id=>{const g=GAMES[id];const b=btn(null,null,()=>startGame(id),"game-"+id);const d=el("div");d.append(el("div","t",g.k+" · "+g.name),el("div","s",g.sub+(S.best[id]?" Best: "+S.best[id]+".":"")));b.append(d,el("span","chev","→"));menu.append(b);});
  m.append(menu);
  m.append(el("div","label","Your trip"));
  const m2=el("div","menu");[["stamps","スタンプ · Stamp book",stampCount()+" of "+stampTotal()+" collected"],["kana","かな · Kana charts","Every hiragana and katakana, with sound"],["signs","かんばん · Signs deck","Optional: "+SIGNS.length+" signs worth recognising, including road signs"],["settings","せってい · Settings","Companion, your details, API key, voice check, backup"]]
    .forEach(([p,t,s])=>{const b=btn(null,null,()=>{MORE.page=p;render();window.scrollTo(0,0);},"more-"+p);const d=el("div");d.append(el("div","t",t),el("div","s",s));b.append(d,el("span","chev","→"));m2.append(b);});
  m.append(m2);}
function backHead(m,jp,en){const head=el("div","pagehead");const h=el("h1",null,jp);h.append(el("small",null,en));head.append(h,btn("btn small","← Back",()=>{MORE.page="menu";render();window.scrollTo(0,0);},"moreBack"));m.append(head);}
function renderStamps(m){backHead(m,"スタンプ","Stamp book");
  m.append(el("p","note","One stamp for each lesson, and a starred one for each stage scene. Japanese stations and temples keep real stamps like these for visitors to collect."));
  const t=el("div","ticket"),b=el("div","body");const g=el("div","stampbook");
  PATH.forEach(id=>{const L=LMAP[id];const c=el("div","cell");c.append(el("div","hanko"+(isDone(id)?"":" empty"),L.kana?L.k.slice(0,1):String(L.i+1)),el("span",null,L.kana?L.k:"L"+(L.i+1)));g.append(c);});
  BOSSES.forEach(B=>{const c=el("div","cell");c.append(el("div","hanko"+(S.boss[B.id]?"":" empty"),"★"),el("span",null,B.k));g.append(c);});
  b.append(g);t.append(b);m.append(t);}
function renderKanaPage(m){backHead(m,"かな","Kana charts");
  const kata=MORE.kata;const seg=el("div","seg");[[false,"ひらがな"],[true,"カタカナ"]].forEach(([v,l])=>{const b=btn(null,l,()=>{MORE.kata=v;render();});b.setAttribute("aria-pressed",String(!!kata===v));seg.append(b);});m.append(seg);
  const note=el("p","why","Tap any kana to hear it.");m.append(note,kanaTable(KROWS,kata,note),el("div","label","With marks"),kanaTable(KMARK,kata,note));
  m.append(btn("btn primary","Play the speed round",()=>startGame("kana")));}
function renderSigns(m){backHead(m,"かんばん","Signs deck");
  m.append(el("p","note","The one place this app uses kanji. You don't need to read these, only recognise them, the way you know a stop sign by its shape."));
  const on=Object.keys(S.cards).some(k=>k.slice(0,2)==="s:");
  const row=el("div","row");row.append(btn("btn "+(on?"":"primary"),on?"Remove signs from my reviews":"Add signs to my reviews",()=>{if(on)Object.keys(S.cards).forEach(k=>{if(k.slice(0,2)==="s:")delete S.cards[k];});else SIGNS.forEach((s,i)=>addCard("s:"+i,i<8?0:Math.floor(i/8)));save();render();toast(on?"Signs removed from reviews":"Signs added. Eight are due now.");},"signsToggle"));m.append(row);
  const pl=el("div","plist");SIGNS.forEach(s=>{const it=el("div","pitem");const mid=el("div");const big=el("div",null,s.s);big.style.cssText="font-size:26px;font-weight:700";
    mid.append(big,el("div","note",s.k+" · "+s.r),el("div","en",s.g),el("div","note",s.where));it.append(mid,listenBtn(s.k,"▶"));pl.append(it);});m.append(pl);}
