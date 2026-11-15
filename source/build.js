const fs=require('fs'),p=require('path');const src=p.join(__dirname,'src'),dist=p.join(__dirname,'..');
const css=fs.readFileSync(p.join(src,'app.css'),'utf8');
const js=fs.readdirSync(src).filter(f=>/^\d\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(p.join(src,f),'utf8')).join("\n");
const data=fs.readFileSync(p.join(__dirname,'..','out','curriculum.json'),'utf8').replace(/</g,"\\u003c");
let html=fs.readFileSync(p.join(src,'shell.html'),'utf8');
html=html.replace("/*CSS*/",()=>css).replace("/*DATA*/",()=>data).replace("/*JS*/",()=>"(function(){\n"+js+"\n})();");
fs.writeFileSync(p.join(dist,'index.html'),html);fs.copyFileSync(p.join(src,'sw.js'),p.join(dist,'sw.js'));
try{new Function(js);console.log("JS OK",Math.round(html.length/1024)+"KB");}catch(e){console.log("JS ERROR",e.message);}
