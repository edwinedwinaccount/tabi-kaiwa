/* ===================== MAIN ===================== */
let TAB="home";
const TABS={home:renderHome,learn:renderLearn,talk:renderTalk,book:renderBook,more:renderMore};
function setTab(t){TAB=t;if(t!=="more")MORE.page=MORE.page==="settings"&&t==="more"?"settings":"menu";render();window.scrollTo(0,0);}
function render(){
  if(PLAYER){renderPlayer();return;}
  const m=$("main");m.innerHTML="";
  if(OVERLAY){OVERLAY.render(m);return;}
  const onboarding=!S.char;
  $("nav").hidden=onboarding;
  document.querySelectorAll("#nav button").forEach(b=>b.setAttribute("aria-current",String(b.dataset.tab===TAB)));
  (onboarding?renderHome:TABS[TAB])(m);}
$("nav").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.tab==="more"&&TAB==="more")MORE.page="menu";TAB=b.dataset.tab;if(TAB!=="more")MORE.page="menu";render();window.scrollTo(0,0);});
window.__tabi={get S(){return S;},set S(v){S=v;},save,render,startLesson,startReview,startGame,LESSONS,W,numToKana,romajiToKata,normJP};
applyDisplay();render();
if("serviceWorker" in navigator&&location.protocol==="https:"){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{});});}
