// Compiles stage files into out/curriculum.json and out/curriculum-outline.md, validating as it goes.
const fs=require('fs'),path=require('path');
const dir=__dirname, out=path.join(dir,'..','out');
const stages=['s1','s2','s3','s4','s5'].filter(f=>fs.existsSync(path.join(dir,f+'.js'))).map(f=>require('./'+f));
const kana=fs.existsSync(path.join(dir,'kana.js'))?require('./kana'):null;
const errs=[],warns=[];
// ---- romaji ----
const H="あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
const HR="a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa o n ga gi gu ge go za ji zu ze zo da ji zu de do ba bi bu be bo pa pi pu pe po".split(" ");
const M={};for(let i=0;i<H.length;i++){M[H[i]]=HR[i];M[String.fromCharCode(H.charCodeAt(i)+96)]=HR[i];}M["ヴ"]="vu";
const SY={"ゃ":"a","ゅ":"u","ょ":"o","ャ":"a","ュ":"u","ョ":"o"},SV={"ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o","ァ":"a","ィ":"i","ゥ":"u","ェ":"e","ォ":"o"};
function romaji(s){let o=[],gem=false;for(const ch of s){
  if(SY[ch]&&o.length){const b=o[o.length-1];o[o.length-1]=/(sh|ch|j)i$/.test(b)?b.slice(0,-1)+SY[ch]:b.slice(0,-1)+"y"+SY[ch];continue;}
  if(SV[ch]&&o.length){const b=o[o.length-1];o[o.length-1]=(b==="u"?"w":b==="te"?"t":b==="de"?"d":b==="fu"?"f":b==="shi"?"sh":b==="chi"?"ch":b==="ji"?"j":b.replace(/[aiueo]$/,""))+SV[ch];continue;}
  if(ch==="ー"){const b=o[o.length-1]||"";o.push(b.slice(-1));continue;}
  if(ch==="っ"||ch==="ッ"){gem=true;continue;}
  let r=M[ch]; if(r==null){errs.push("romaji: unknown char "+ch+" in "+s);r=ch;}
  if(gem){r=(r.startsWith("ch")?"t":r[0])+r;gem=false;}
  o.push(r);}
  return o.join("");}
const KANA=/^[ぁ-ゖァ-ヺー]+$/;
// ---- merge words ----
const W={};
stages.forEach(s=>Object.entries(s.W).forEach(([id,a])=>{
  if(W[id])errs.push("duplicate word id "+id);
  const [k,kj,g,why,o]=a; if(!KANA.test(k))errs.push("non-kana in word "+id+": "+k);
  if(!kj)errs.push("missing kj for "+id);
  W[id]={k,kj,r:(o&&o.r)||romaji(k),g,why:why||"",set:(o&&o.set)||undefined,stage:s.stage.n};
}));
// split a token string; glosses of inline tokens may contain spaces (or ~ for an explicit space)
function split(str){const raw=str.split(/\s+/).filter(Boolean),out=[];let open=false;
  for(const p of raw){const special=p==="."||p===","||p==="_"||p==="NAME";
    if(open&&/^[^|]*\|[a-z']+$/.test(p)&&!/^[\u3041-\u30FA]/.test(p)){out[out.length-1]+=" "+p;open=false;continue;}
    if(p.includes("|")){out.push(p);open=(p.split("|").length===2);continue;}
    if(open&&!special&&!W[p]){out[out.length-1]+=" "+p;continue;}
    open=false;out.push(p);}
  return out.map(x=>x.replace(/~/g," "));}
function tok(t,ctx){
  if(t===".")return {p:"。"}; if(t===",")return {p:"、"}; if(t==="_")return {slot:1}; if(t==="NAME")return {name:1};
  if(t.includes("|")){const [k,g,r]=t.split("|"); if(!KANA.test(k))errs.push("non-kana inline token '"+k+"' in "+ctx); return {k,g,r:r||romaji(k)};}
  if(!W[t]){errs.push("unknown word '"+t+"' in "+ctx);return {k:"?",g:"?"};}
  return {w:t};
}
const seen=new Set(); const lessons=[],bosses=[]; let md="# Tabi Kaiwa curriculum outline\n";
function kanaOf(ts){return ts.map(t=>t.p?t.p:t.slot?"＿":t.name?"〇〇":t.w?W[t.w].k:t.k).join(" ").replace(/ ([。、])/g,"$1");}
stages.forEach(s=>{
  md+="\n## Stage "+s.stage.n+" · "+s.stage.k+" · "+s.stage.en+"\n";
  s.lessons.forEach(L=>{
    const ws=(L.words||"").split(/\s+/).filter(Boolean), fs_=(L.forms||"").split(/\s+/).filter(Boolean);
    ws.concat(fs_).forEach(id=>{if(!W[id])errs.push(L.id+": unknown word in words/forms: "+id);else{if(W[id].L)errs.push(id+" introduced twice ("+W[id].L+", "+L.id+")");W[id].L=L.id;if(fs_.includes(id))W[id].form=true;seen.add(id);}});
    const chk=(ts,ctx)=>ts.forEach(t=>{if(t.w&&!seen.has(t.w))errs.push(ctx+": uses '"+t.w+"' before it is taught");});
    const P=(L.phrases||[]).map((p,i)=>{const id=L.id+"p"+(i+1);const t=split(p[0]).map(x=>tok(x,id));chk(t,id);if(!p[1])errs.push(id+" missing kj");return {id,t,kj:p[1],en:p[2],note:p[3]||undefined};});
    const F=(L.frames||[]).map((f,i)=>{const id=L.id+"f"+(i+1);const t=split(f[0]).map(x=>tok(x,id));chk(t,id);if(t.filter(x=>x.slot).length!==1)errs.push(id+" needs exactly one slot");
      const slot=f[2].split(/\s+/);slot.forEach(x=>{if(!W[x])errs.push(id+" unknown slot word "+x);else if(!seen.has(x))errs.push(id+" slot word '"+x+"' not yet taught");});return {id,t,en:f[1],slot};});
    const Hh=(L.hear||[]).map((h,i)=>{const id=L.id+"h"+(i+1);const t=split(h[0]).map(x=>tok(x,id));chk(t,id);if(!h[1])errs.push(id+" missing kj");return {id,t,kj:h[1],en:h[2],tip:h[3]||undefined};});
    lessons.push({id:L.id,stage:s.stage.n,k:L.k,en:L.en,can:L.can,point:L.point,words:ws,forms:fs_,frames:F,phrases:P,hear:Hh,kanaLesson:L.kanaLesson});
    md+="\n### "+L.id+" · "+L.k+" · "+L.en+"\n*You can:* "+L.can+"\n\n*Idea:* "+L.point+"\n\n";
    if(ws.length)md+="**Words:** "+ws.map(id=>W[id].k+" ("+W[id].g+")").join(", ")+"\n\n";
    if(fs_.length)md+="**Forms:** "+fs_.map(id=>W[id].k+" ("+W[id].g+")").join(", ")+"\n\n";
    F.forEach(f=>md+="- Swap: "+kanaOf(f.t)+" → "+f.en+" ["+f.slot.map(x=>W[x].k).join(" / ")+"]\n");
    P.forEach(p=>md+="- "+kanaOf(p.t)+" 〔"+p.kj+"〕 "+p.en+(p.note?" ("+p.note+")":"")+"\n");
    Hh.forEach(h=>md+="- 👂 "+kanaOf(h.t)+" 〔"+h.kj+"〕 "+h.en+(h.tip?" → "+h.tip:"")+"\n");
  });
  if(s.boss){bosses.push(Object.assign({stage:s.stage.n},s.boss));md+="\n**Boss scene: "+s.boss.en+"** "+s.boss.setting+"\n";}
});
Object.keys(W).forEach(id=>{if(!W[id].L)warns.push("word never introduced: "+id);});
const used=new Set();lessons.forEach(L=>[...L.phrases,...L.frames,...L.hear].forEach(x=>x.t.forEach(t=>t.w&&used.add(t.w))));lessons.forEach(L=>L.frames.forEach(f=>f.slot.forEach(x=>used.add(x))));
Object.keys(W).forEach(id=>{if(!used.has(id)&&!W[id].set)warns.push("word taught but never used in a phrase: "+id+" ("+W[id].k+")");});
const signs=fs.existsSync(path.join(dir,'signs.js'))?require('./signs').map(([s,k,g,where])=>{if(!KANA.test(k))errs.push('non-kana sign reading '+k);return {s,k,r:romaji(k),g,where};}):[];
if(kana)kana.lessons.forEach(L=>L.practice.forEach(p=>{if(!KANA.test(p[0]))errs.push('non-kana practice '+p[0]);p[2]=romaji(p[0]);}));
md+="\n## Optional signs deck\n"+signs.map(x=>"- "+x.s+" ("+x.k+"): "+x.g).join("\n")+"\n";
const data={version:1,stages:stages.map(s=>s.stage),W,lessons,bosses,kana,signs};
fs.writeFileSync(path.join(out,'curriculum.json'),JSON.stringify(data));
fs.writeFileSync(path.join(out,'curriculum-outline.md'),md);
const nP=lessons.reduce((a,L)=>a+L.phrases.length,0),nH=lessons.reduce((a,L)=>a+L.hear.length,0),nF=lessons.reduce((a,L)=>a+L.frames.length,0);
console.log("lessons",lessons.length,"words",Object.keys(W).length,"phrases",nP,"frames",nF,"hear",nH);
console.log("ERRORS",errs.length);errs.forEach(e=>console.log("  E",e));
console.log("WARNINGS",warns.length);warns.forEach(e=>console.log("  W",e));
