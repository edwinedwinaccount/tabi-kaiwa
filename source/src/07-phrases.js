/* ===================== PHRASES: phrasebook + my phrases ===================== */
let BOOK={tab:"book",q:"",draft:"",busy:false,err:"",result:null};
function phraseRow(p,heard){const it=el("div","pitem"+(heard?" heard":""));const mid=el("div");
  if(heard)mid.append(el("div","who","👂 you'll hear"));
  mid.append(interlinear(toks(p),{size:"sm"}),el("div","en",p.en));
  if(p.note||p.tip)mid.append(el("div","note",p.note||p.tip));
  const right=el("div","col");right.style.alignItems="flex-end";right.append(listenBtn(()=>lineText(toks(p)),"▶"));
  it.append(mid,right);return it;}
function renderBook(m){
  const head=el("div","pagehead");const h=el("h1",null,"ことば");h.append(el("small",null,"Phrases"));head.append(h);
  const seg=el("div","seg");[["book","Phrasebook"],["mine","My phrases"]].forEach(([v,l])=>{const b=btn(null,l,()=>{BOOK.tab=v;render();},"book-"+v);b.setAttribute("aria-pressed",String(BOOK.tab===v));seg.append(b);});
  head.append(seg);m.append(head);
  if(BOOK.tab==="mine")return renderMine(m);
  m.append(el("p","note","Everything in the course, sorted by situation. It works with no signal, so it's your pocket phrasebook on the trip."));
  const input=el("input",null,null,{id:"bookSearch",type:"search",placeholder:"Search in English or かな","aria-label":"Search phrases"});input.value=BOOK.q;m.append(input);
  const list=el("div","col");m.append(list);
  const draw=()=>{list.innerHTML="";const q=BOOK.q.trim().toLowerCase();
    if(q){const hits=[];const test=(p,L,heard)=>{const hay=(p.en+" "+lineSpaced(toks(p))+" "+resolve(toks(p)).map(x=>x.r).join(" ")).toLowerCase();if(hay.indexOf(q)>=0)hits.push([p,heard]);};
      S.custom.forEach(c=>test(c,null,false));LESSONS.forEach(L=>{L.phrases.forEach(p=>test(p,L,false));L.hear.forEach(p=>test(p,L,true));});
      if(!hits.length){list.append(el("div","banner","Nothing matches. Try another word, or build the phrase in My phrases."));return;}
      const pl=el("div","plist");hits.slice(0,40).forEach(([p,heard])=>pl.append(phraseRow(p,heard)));list.append(pl);return;}
    if(S.custom.length){const d=el("details","sect");const s=el("summary");s.append(el("span","jpl","わたしの"),el("span",null,"My phrases"),el("small",null,String(S.custom.length)));d.append(s);
      d.addEventListener("toggle",()=>{if(d.open&&!d.dataset.f){d.dataset.f=1;const pl=el("div","plist");S.custom.slice().reverse().forEach(c=>pl.append(phraseRow(c)));d.append(pl);}});list.append(d);}
    STAGES.forEach(sg=>{list.append(el("div","label",sg.place));
      stageLessons(sg.n).forEach(L=>{const d=el("details","sect");d.id="sect-"+L.id;const s=el("summary");s.append(el("span","jpl",L.k),el("small",null,L.can));d.append(s);
        d.addEventListener("toggle",()=>{if(d.open&&!d.dataset.f){d.dataset.f=1;const pl=el("div","plist");L.phrases.forEach(p=>pl.append(phraseRow(p)));L.hear.forEach(p=>pl.append(phraseRow(p,true)));d.append(pl);}});
        list.append(d);});});};
  let deb=null;input.addEventListener("input",()=>{BOOK.q=input.value;clearTimeout(deb);deb=setTimeout(draw,180);});draw();
}
function minePrompt(text){return ["You help a beginner prepare Japanese phrases for a trip to Japan. "+profileText(),
  'The learner wants to be able to say or handle this: "'+text.replace(/"/g,"'")+'"',
  "Give 1 to 3 short, natural, polite Japanese phrases that do the job, simplest first. Build them from words the learner already knows wherever that still sounds natural.",
  "Words the learner knows: "+knownKana(),SCRIPT_RULES,
  "Return only a JSON object: {\"items\":[{",
  '"line": the phrase as [{"k":kana,"g":gloss}],',
  '"kj": the same phrase in standard Japanese spelling (kanji allowed here; it is only used to match speech recognition),',
  '"en": natural English,',
  '"note": one short sentence on when or how to use it,',
  '"new": [{"k":kana,"g":gloss,"why":"one short sentence on what it means or how it is built"}] for each word in the phrase that is NOT in the learner\'s list (empty array if none),',
  '"hear": [{"line":[{"k","g"}],"kj":"","en":"","tip":"how to reply, using words from the list"}] one or two things a Japanese person is likely to say back',
  "}]}"].join("\n");}
async function buildMine(){const text=BOOK.draft.trim();if(!text||BOOK.busy)return;BOOK.busy=true;BOOK.err="";BOOK.result=null;render();
  try{const j=parseJSON(await callClaude(minePrompt(text),{max:2500}));
    const items=(j.items||[]).map(x=>{const line=cleanLine(x.line);if(!line)return null;
      return {line:line,kj:String(x.kj||""),en:String(x.en||""),note:String(x.note||""),
        new:(Array.isArray(x.new)?x.new:[]).filter(n=>n&&n.k).map(n=>({k:String(n.k),g:String(n.g||""),why:String(n.why||"")})),
        hear:(Array.isArray(x.hear)?x.hear:[]).map(h=>{const hl=cleanLine(h.line);return hl?{line:hl,kj:String(h.kj||""),en:String(h.en||""),tip:String(h.tip||"")}:null;}).filter(Boolean)};}).filter(Boolean);
    if(!items.length)throw {code:"parse"};BOOK.result={ask:text,items:items};
  }catch(e){BOOK.err=apiError(e);}
  BOOK.busy=false;render();}
function renderMine(m){
  m.append(el("p","note","Type what you want to say, in English, or describe the situation. You get it built from words you know, with anything new explained first and what you're likely to hear back."));
  const ta=el("textarea",null,null,{id:"mineInput",placeholder:"e.g. We're six but happy to sit at two tables","aria-label":"What do you want to say?"});ta.value=BOOK.draft;ta.addEventListener("input",()=>{BOOK.draft=ta.value;});m.append(ta);
  const row=el("div","row");const go=btn("btn primary",BOOK.busy?"Building…":"Build it",buildMine,"mineBuild");go.disabled=BOOK.busy||!S.key;row.append(go);m.append(row);
  if(!S.key){const b=el("div","banner warn");b.append("This uses Claude through your own API key. ",btn("linkish","Add it in Settings",()=>{MORE.page="settings";setTab("more");}));m.append(b);}
  if(BOOK.err)m.append(el("div","banner warn",BOOK.err));
  if(BOOK.result){BOOK.result.items.forEach((it,i)=>{const t=el("div","ticket"),hd=el("div","head");hd.append(el("span",null,"Option "+(i+1)),el("span",null,it.saved?"Saved":""));t.append(hd);
      const b=el("div","body");
      if(it.new.length){b.append(el("div","label","New words first"));it.new.forEach(n=>{const d=el("p","why");const kk=btn("linkish",n.k,()=>speak(n.k));kk.style.cssText="font-family:var(--f-jp);font-weight:700;font-size:18px;text-decoration:none;color:var(--ink)";d.append(kk,el("span","r note"," "+romajiOf(n.k))," = "+n.g+(n.why?". "+n.why:""));b.append(d);});}
      b.append(interlinear(it.line,{size:"lg"}),el("div","meaning",it.en));if(it.note)b.append(el("p","why",it.note));
      const r=el("div","row");r.append(listenBtn(it.line.map(x=>x.k).join(""),"▶ HEAR IT"));b.append(r);
      if(it.hear.length){b.append(el("div","label","You'll probably hear"));it.hear.forEach(hh=>{const d=el("div","col");d.style.gap="4px";d.append(interlinear(hh.line,{size:"sm"}));const rr=el("div","row between");rr.append(el("div","en",hh.en),listenBtn(hh.line.map(x=>x.k).join(""),"▶"));d.append(rr);if(hh.tip)d.append(el("div","note",hh.tip));b.append(d);});}
      t.append(b);const f=el("div","foot");const sv=btn("btn primary wide",it.saved?"Saved to my deck":"Save to my deck",()=>{addCustom({line:it.line,kj:it.kj,en:it.en,note:it.note,new:it.new,hear:it.hear,src:"mine",ask:BOOK.result.ask});it.saved=true;render();toast("Saved. It will come up in review and conversations.");},"mineSave-"+i);sv.disabled=!!it.saved;f.append(sv);t.append(f);m.append(t);});}
  if(S.custom.length){const g=el("div","group");const h3=el("h3");h3.append(el("span","jpl","わたしの ことば"),el("small",null,S.custom.length+" saved"));g.append(h3);
    const pl=el("div","plist");S.custom.slice().reverse().forEach(c=>{const it=phraseRow(c);const right=it.lastChild;
      right.append(btn("linkish","Remove",()=>{S.custom=S.custom.filter(x=>x.id!==c.id);delete S.cards["c:"+c.id];save();render();}));
      if(c.hear&&c.hear.length){const mid=it.firstChild;c.hear.forEach(hh=>{mid.append(el("div","who","👂 you'll hear"),interlinear(hh.line,{size:"sm"}),el("div","note",hh.en+(hh.tip?" · "+hh.tip:"")));});}
      pl.append(it);});g.append(pl);m.append(g);}
}
