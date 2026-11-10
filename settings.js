/* Steuerungs-Einstellungen für alle Spiele. Einbinden: <script src="../settings.js" data-game="waldmeister"></script>
   Die Spiele lesen window.GSET (sens, invX, invY). Größe, Seite und Höhe der Touch-Bedienung setzt dieses Skript selbst. */
(function(){
'use strict';
var scr=document.currentScript,GID=(scr&&scr.dataset.game)||'x',KEY='gset.v1';
var DEF={sens:1,invX:false,invY:false,ui:1,swap:false,lift:0};
var S=Object.assign({},DEF);
try{var r=JSON.parse(localStorage.getItem(KEY)||'null');if(r)Object.keys(DEF).forEach(function(k){if(r[k]!==undefined&&typeof r[k]===typeof DEF[k])S[k]=r[k]})}catch(e){}
window.GSET=S;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
var acc={waldmeister:'#f2b13a',goldwaescher:'#ffc83d',tiefenrausch:'#5fe0c0',minenschicht:'#ffb02e',steinbruch:'#ffa530'}[GID]||'#f2b13a';
var CFG={
 waldmeister:{mv:['#joy'],ac:['#bAct','#bUse'],lk:['#look']},
 goldwaescher:{mv:['#joy'],ac:['#bAct','#bUse'],lk:['#look']},
 steinbruch:{mv:['#joy'],ac:['#bAct','#bUse','#bJump'],lk:['#look']},
 minenschicht:{mv:['#stick'],ac:['.actions'],lk:['#look']},
 tiefenrausch:{mv:['#joy'],ac:['.vbtns'],lk:[]}
}[GID]||{mv:[],ac:[],lk:[]};

/* ---------- Touch-Bedienung anordnen ---------- */
function refBox(e){var p=e.offsetParent;if(p){var b=p.getBoundingClientRect();return{l:b.left,r:b.right,b:b.bottom,w:b.width}}return{l:0,r:innerWidth,b:innerHeight,w:innerWidth}}
function els(list){var o=[];list.forEach(function(s){var n=document.querySelectorAll(s);for(var i=0;i<n.length;i++)o.push(n[i])});return o}
var lastSig='';
function layout(){
 var all=els(CFG.mv.concat(CFG.ac)),lk=els(CFG.lk);
 var sig=[S.ui,S.swap,S.lift,innerWidth,innerHeight].join('|');
 var items=[];
 var P=['left','right','bottom','top','transform','transformOrigin'];
 all.concat(lk).forEach(function(e){if(!e.__g0){e.__g0={};P.forEach(function(k){e.__g0[k]=e.style[k]})}P.forEach(function(k){e.style[k]=e.__g0[k]})});
 var def=S.ui===1&&!S.swap&&!S.lift;
 if(def)return;
 all.forEach(function(e){var r=e.getBoundingClientRect();if(r.width<2)return;var f=refBox(e);items.push({e:e,r:r,f:f,scale:true})});
 lk.forEach(function(e){var r=e.getBoundingClientRect();if(r.width<2)return;var f=refBox(e);items.push({e:e,r:r,f:f,scale:false})});
 items.forEach(function(it){var r=it.r,f=it.f,e=it.e,left=r.left-f.l,wasLeft=(r.left+r.right)/2-f.l<f.w/2,onLeft=S.swap?!wasLeft:wasLeft;
  if(S.swap)left=f.w-(r.right-f.l);
  e.style.right='auto';e.style.left=left+'px';
  if(it.scale){e.style.top='auto';e.style.bottom=(f.b-r.bottom+S.lift)+'px';e.style.transformOrigin=onLeft?'bottom left':'bottom right';if(S.ui!==1)e.style.transform='scale('+S.ui+')'}})}
var lt=0;function relayout(){clearTimeout(lt);lt=setTimeout(layout,30)}
addEventListener('resize',relayout);addEventListener('orientationchange',relayout);setInterval(layout,900);

/* ---------- Oberfläche ---------- */
var host=document.createElement('div');host.style.cssText='position:fixed;z-index:2147483001;left:0;top:0;width:0;height:0';document.body.appendChild(host);
var sh=host.attachShadow({mode:'open'});
var pos=GID==='tiefenrausch'?'top:12px;right:168px':'top:10px;left:50%;margin-left:21px';
sh.innerHTML='<style>*{box-sizing:border-box}'+
'.q{position:fixed;'+pos+';width:30px;height:30px;border-radius:50%;border:1px solid #fff5;background:#000a;color:#fff;font:700 16px system-ui,sans-serif;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}'+
'.ov{position:fixed;left:0;top:0;width:100vw;height:100vh;height:100dvh;display:none;align-items:center;justify-content:center;background:rgba(5,8,10,.72);padding:10px;font-family:"Alegreya Sans","Figtree",system-ui,sans-serif;color:#f4efe2}.ov.on{display:flex}'+
'.c{width:min(480px,100%);max-height:100%;overflow:auto;background:#181b1e;border:1px solid '+acc+'55;border-radius:18px;box-shadow:0 20px 60px #000a;padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px}'+
'h2{margin:0;font:400 24px/1.1 Bevan,Rye,"Bricolage Grotesque",Georgia,serif;color:#fff}'+
'h3{margin:6px 0 0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:'+acc+'}'+
'.r{display:grid;grid-template-columns:1fr auto;gap:2px 12px;align-items:center;font-size:17px}'+
'.r small{grid-column:1/3;color:#a9a393;font-size:13px;line-height:1.25}'+
'.r output{font-weight:800;color:'+acc+';min-width:54px;text-align:right}'+
'input[type=range]{grid-column:1/3;width:100%;accent-color:'+acc+';height:28px}'+
'.sw{position:relative;width:48px;height:28px;border-radius:14px;background:#ffffff22;border:0;cursor:pointer;padding:0}.sw::after{content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.15s}.sw.on{background:'+acc+'}.sw.on::after{left:23px;background:#1d1405}'+
'.f{display:flex;justify-content:space-between;gap:10px;margin-top:4px}'+
'button.b{font:inherit;font-weight:800;border-radius:12px;padding:9px 16px;cursor:pointer;border:1px solid #fff3;background:#ffffff14;color:#f4efe2}button.b.p{background:'+acc+';color:#1d1405;border:0}'+
'.tag{font-size:11px;background:#ffffff1c;border-radius:6px;padding:1px 6px;margin-left:6px;color:#cfc8b8;font-weight:700}'+
'</style><button class="q" type="button" aria-label="Einstellungen">⚙</button>'+
'<div class="ov" role="dialog" aria-label="Einstellungen"><div class="c"><h2>Steuerung</h2>'+
'<h3>Blick</h3>'+
'<div class="r"><span>Empfindlichkeit</span><output id="oS"></output><input id="iS" type="range" min="0.3" max="3" step="0.05"><small>Wie schnell sich die Sicht mit Maus oder Finger dreht.</small></div>'+
'<div class="r"><span>Oben und unten umkehren</span><button class="sw" id="bY" type="button" role="switch"></button></div>'+
'<div class="r"><span>Links und rechts umkehren</span><button class="sw" id="bX" type="button" role="switch"></button></div>'+
'<h3>Touch-Bedienung</h3>'+
'<div class="r"><span>Größe</span><output id="oU"></output><input id="iU" type="range" min="0.6" max="1.6" step="0.05"></div>'+
'<div class="r"><span>Seiten tauschen</span><button class="sw" id="bW" type="button" role="switch"></button><small>Stick und Knöpfe wechseln die Seite, die Blickfläche auch.</small></div>'+
'<div class="r"><span>Höhe vom unteren Rand</span><output id="oL"></output><input id="iL" type="range" min="0" max="160" step="5"></div>'+
'<div class="f"><button class="b" id="rs" type="button">Zurücksetzen</button><button class="b p" id="ok" type="button">Fertig</button></div></div></div>';
var $=function(s){return sh.querySelector(s)},ov=$('.ov');
function sync(){$('#iS').value=S.sens;$('#oS').textContent='×'+S.sens.toFixed(2).replace('.',',');$('#iU').value=S.ui;$('#oU').textContent=Math.round(S.ui*100)+' %';$('#iL').value=S.lift;$('#oL').textContent=S.lift+' px';
 $('#bY').classList.toggle('on',S.invY);$('#bX').classList.toggle('on',S.invX);$('#bW').classList.toggle('on',S.swap);
 ['#bY','#bX','#bW'].forEach(function(k){$(k).setAttribute('aria-checked',$(k).classList.contains('on'))})}
function chg(){save();sync();layout()}
$('#iS').addEventListener('input',function(e){S.sens=+e.target.value;chg()});
$('#iU').addEventListener('input',function(e){S.ui=+e.target.value;chg()});
$('#iL').addEventListener('input',function(e){S.lift=+e.target.value;chg()});
$('#bY').addEventListener('click',function(){S.invY=!S.invY;chg()});$('#bX').addEventListener('click',function(){S.invX=!S.invX;chg()});$('#bW').addEventListener('click',function(){S.swap=!S.swap;chg()});
$('#rs').addEventListener('click',function(){Object.assign(S,DEF);chg()});
function open(){try{if(document.pointerLockElement)document.exitPointerLock()}catch(e){}ov.classList.add('on');sync()}
function close(){ov.classList.remove('on')}
$('.q').addEventListener('click',function(e){e.stopPropagation();open()});
$('#ok').addEventListener('click',close);
ov.addEventListener('pointerdown',function(e){e.stopPropagation()});ov.addEventListener('click',function(e){if(e.target===ov)close()});
addEventListener('keydown',function(e){if(!ov.classList.contains('on'))return;if(e.code==='Escape'){e.stopImmediatePropagation();close();return}if(e.code==='Tab')return;e.stopImmediatePropagation()},true);
addEventListener('keyup',function(e){if(ov.classList.contains('on'))e.stopImmediatePropagation()},true);
window.__gset={open:open,close:close,layout:layout,S:S};
layout();
})();
