/* ===================== COMPANIONS ===================== */
const CHARS={
 tabinuki:{k:"たびぬき",name:"Tabinuki",pun:"tabi (travel) + tanuki",blurb:"Collects a stamp for every lesson you finish."},
 mochi:{k:"もちベーション",name:"Mochivation",pun:"mochi + motivation",blurb:"Puffs up bigger the longer your streak."},
 onsaru:{k:"おんさる",name:"Onsaru",pun:"onsen + saru (monkey)",blurb:"Sinks deeper into the hot spring as your streak grows."}
};
function charSVG(id,o){o=o||{};const lvl=Math.max(0,Math.min(10,o.level||0));let inner="";
  if(id==="tabinuki"){
    inner=`<g class="bob">
      <ellipse cx="93" cy="94" rx="13" ry="8" fill="#8A5A3B" transform="rotate(-28 93 94)"/><path d="M88 88l8 9M95 85l7 8" stroke="#4B3426" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="60" cy="84" rx="30" ry="27" fill="#A9744F"/><ellipse cx="60" cy="89" rx="19" ry="18" fill="#EBD9BF"/>
      <path d="M42 66q-6 16 0 34M78 66q6 16 0 34" stroke="#3E6B5C" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="47" cy="109" rx="9" ry="5" fill="#4B3426"/><ellipse cx="73" cy="109" rx="9" ry="5" fill="#4B3426"/>
      <circle cx="41" cy="33" r="8" fill="#A9744F"/><circle cx="79" cy="33" r="8" fill="#A9744F"/><circle cx="41" cy="33" r="4" fill="#4B3426"/><circle cx="79" cy="33" r="4" fill="#4B3426"/>
      <circle cx="60" cy="50" r="25" fill="#A9744F"/><ellipse cx="60" cy="58" rx="15" ry="11" fill="#EBD9BF"/>
      <ellipse cx="49" cy="48" rx="9" ry="7" fill="#4B3426" transform="rotate(-18 49 48)"/><ellipse cx="71" cy="48" rx="9" ry="7" fill="#4B3426" transform="rotate(18 71 48)"/>
      <g class="blink"><circle cx="50" cy="48" r="3.2" fill="#fff"/><circle cx="70" cy="48" r="3.2" fill="#fff"/><circle cx="50.6" cy="48.4" r="1.6" fill="#1E2944"/><circle cx="70.6" cy="48.4" r="1.6" fill="#1E2944"/></g>
      <ellipse cx="60" cy="56" rx="3.4" ry="2.4" fill="#4B3426"/><path d="M54 61q6 5 12 0" stroke="#4B3426" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M26 34L60 8l34 26q-34 9-68 0z" fill="#E0C273" stroke="#B4944A" stroke-width="2" stroke-linejoin="round"/><path d="M43 21l34 0M36 27l48 0" stroke="#B4944A" stroke-width="1.5"/>
      <g transform="rotate(-10 30 86)"><rect x="22" y="76" width="16" height="20" rx="2" fill="#F9FBF9" stroke="#5A6873" stroke-width="1.5"/><circle cx="30" cy="86" r="5" fill="none" stroke="#C8452F" stroke-width="2"/></g>
    </g>`;
  } else if(id==="mochi"){
    const rx=27+lvl*1.3, ry=23+lvl*0.9, cy=84-lvl*0.4;
    inner=`<g class="bob">
      ${lvl>0?`<g class="steam" stroke="#94A3AF" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M46 ${cy-ry-8}q-4-5 0-10t0-10"/><path d="M60 ${cy-ry-10}q-4-5 0-10t0-10"/><path d="M74 ${cy-ry-8}q-4-5 0-10t0-10"/></g>`:""}
      <ellipse cx="60" cy="108" rx="${rx+4}" ry="5" fill="#000" opacity=".10"/>
      <path d="M${60-rx} ${cy+ry*0.55}q-2-${ry*1.5} ${rx}-${ry*1.55}q${rx+2} 0 ${rx} ${ry*1.55}q-${rx} ${ry*0.9}-${rx*2} 0z" fill="#FBF7EE" stroke="#D5C9B6" stroke-width="2"/>
      <path d="M${60-rx*0.5} ${cy-ry*0.82}q${rx*0.5}-${ry*0.32} ${rx} 0q-${rx*0.5} ${ry*0.3}-${rx} 0z" fill="#D9A765" opacity="${0.35+lvl*0.05}"/>
      <path d="M${60-rx+3} ${cy}q-12-8-10-18M${60+rx-3} ${cy}q12-8 10-18" stroke="#D5C9B6" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g class="blink"><circle cx="50" cy="${cy}" r="3" fill="#1E2944"/><circle cx="70" cy="${cy}" r="3" fill="#1E2944"/></g>
      <circle cx="43" cy="${cy+7}" r="4.5" fill="#F3A9A0" opacity=".8"/><circle cx="77" cy="${cy+7}" r="4.5" fill="#F3A9A0" opacity=".8"/>
      <path d="M54 ${cy+7}q6 7 12 0z" fill="#C8452F"/>
    </g>`;
  } else {
    const wy=96-lvl*1.6;
    inner=`<g>
      <circle cx="18" cy="20" r="2" fill="#B9C6CF"/><circle cx="98" cy="14" r="2.4" fill="#B9C6CF"/><circle cx="106" cy="44" r="1.8" fill="#B9C6CF"/><circle cx="10" cy="52" r="1.8" fill="#B9C6CF"/>
      <g class="steam" stroke="#94A3AF" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M24 70q-4-5 0-10t0-10"/><path d="M96 72q-4-5 0-10t0-10"/></g>
      <ellipse cx="60" cy="100" rx="54" ry="17" fill="#7C8590"/>
      <g class="bob">
        <ellipse cx="60" cy="90" rx="23" ry="20" fill="#B7A48C"/>
        <circle cx="35" cy="54" r="7" fill="#EFB5A2"/><circle cx="85" cy="54" r="7" fill="#EFB5A2"/>
        <circle cx="60" cy="54" r="25" fill="#B7A48C"/>
        <path d="M44 56q0-17 16-17t16 17q0 16-16 16t-16-16z" fill="#EFB5A2"/>
        <path d="M48 54q4-4 8 0M64 54q4-4 8 0" stroke="#5B3A32" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="58" cy="61" r="1" fill="#5B3A32"/><circle cx="62" cy="61" r="1" fill="#5B3A32"/>
        <path d="M55 65q5 4 10 0" stroke="#5B3A32" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="47" cy="62" r="3.5" fill="#E58E84" opacity=".6"/><circle cx="73" cy="62" r="3.5" fill="#E58E84" opacity=".6"/>
        <rect x="47" y="25" width="26" height="9" rx="3" fill="#F9FBF9" stroke="#C9D5D0" stroke-width="1.5"/><path d="M53 25v9M67 25v9" stroke="#8CC9D8" stroke-width="2"/>
      </g>
      <path d="M12 ${wy+2}q48-14 96 0v8q-48 18-96 0z" fill="#8CC9D8" opacity=".92"/><path d="M26 ${wy+3}q8-3 16 0M70 ${wy+1}q10-3 20 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M6 100q0 17 54 17t54-17" fill="none" stroke="#7C8590" stroke-width="7" stroke-linecap="round"/>
    </g>`;
  }
  return `<svg class="char${o.happy?" happy":""}" viewBox="0 0 120 120" role="img" aria-label="${CHARS[id].name}">${inner}</svg>`;}
function charNode(o){const d=el("div");d.innerHTML=charSVG(S.char||"tabinuki",Object.assign({level:streak()},o||{}));return d.firstChild;}

// What the companion says: [line, lesson that unlocks it]. Only uses words from that lesson or earlier.
const SAYINGS=[
 ["konnichiwa","L01"],["arigatou gozaimasu","L01"],["kore wa nan desu ka","L02"],["hai , sou desu","L02"],
 ["mou ichido onegaishimasu","L06"],["yukkuri onegaishimasu","L06"],["madamada desu","L06"],
 ["kyou doko ni ikimasu ka","L11"],["ima nanji desu ka","L12"],["nani o tabemasu ka","L13"],["itadakimasu","L13"],
 ["mou2 tabemashita ka","L14"],["kyou wa samui desu","L15"],["yokatta desu","L15"],
 ["nihon no tabemono ga suki desu ka","L16"],["kirei desu ne","L16"],["doko ni ikitai desu ka","L17"],["raamen o tabetai desu","L17"],
 ["isshoni ikimashou","L18"],["biiru o nomimasen ka","L18"],["chotto matte kudasai","L19"],["onsen ni ikitai desu","L24"],
 ["yuki ga futteimasu","L27"],["kyou no tenki wa dou desu ka","L27"],["sugoi desu ne","L33"],["totemo tanoshii desu","L33"],
 ["nihongo o benkyou shiteimasu","L33"],["kotoshi mo yoroshiku onegaishimasu","L34"],["otsukaresama","L34"]];
function dailySaying(){
  const h=new Date().getHours();
  const open=SAYINGS.filter(s=>S.done[s[1]]);
  if(!open.length)return parseLine(h<11?"ohayou gozaimasu":h<18?"konnichiwa":"konbanwa");
  const recent=open.slice(-8);const d=new Date();const n=d.getFullYear()*372+d.getMonth()*31+d.getDate();
  return parseLine(recent[n%recent.length][0]);}
