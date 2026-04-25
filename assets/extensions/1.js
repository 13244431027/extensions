(function (Scratch) {
"use strict";
if (!Scratch.extensions.unsandboxed) throw new Error("虚拟键盘扩展需要在非沙盒模式下运行。");

const KEY_SIZE=44,KEY_GAP=7,MIN_SCALE=0.35,LONG_PRESS_DELAY=420,LONG_PRESS_INTERVAL=75;
const SPECIAL={" ":"space",ArrowUp:"up arrow",ArrowDown:"down arrow",ArrowLeft:"left arrow",ArrowRight:"right arrow",Enter:"enter",Backspace:"backspace",Delete:"delete",Insert:"insert",Home:"home",End:"end",PageUp:"page up",PageDown:"page down",Tab:"tab",Escape:"escape",Shift:"shift",Control:"control",Alt:"alt",Meta:"meta",CapsLock:"caps lock",NumLock:"num lock",ScrollLock:"scroll lock",PrintScreen:"print screen",Pause:"pause",ContextMenu:"context menu"};
const clamp=(v,min,max)=>Math.min(Math.max(v,min),max);
const scratchKeyName=k=>SPECIAL[k]||(typeof k==="string"&&k.length===1?k.toLowerCase():String(k).toLowerCase());
const isLetterCode=c=>/^Key[A-Z]$/.test(c);
const focused=()=>document.activeElement||document.body||document.documentElement;
function legacy(e,k){try{Object.defineProperty(e,"keyCode",{get:()=>k});Object.defineProperty(e,"which",{get:()=>k});Object.defineProperty(e,"charCode",{get:()=>k});}catch(_){}}
function keyCodeFromData(d,k){if(typeof d.keyCode==="number")return d.keyCode;if(typeof k==="string"&&k.length===1)return k.toUpperCase().charCodeAt(0);return 0;}
function K(label,code,key,opt={}){return Object.assign({label,code,key,width:1,height:1,keyCode:0,location:0,modifier:false,sticky:false,toggle:false,shifted:null},opt);}

const letterKeyboardLayout=[
[
K("Esc","Escape","Escape",{keyCode:27}),{spacer:.7},K("`","Backquote","`",{shifted:"~",keyCode:192}),K("1","Digit1","1",{shifted:"!",keyCode:49}),K("2","Digit2","2",{shifted:"@",keyCode:50}),K("3","Digit3","3",{shifted:"#",keyCode:51}),K("4","Digit4","4",{shifted:"$",keyCode:52}),K("5","Digit5","5",{shifted:"%",keyCode:53}),K("6","Digit6","6",{shifted:"^",keyCode:54}),K("7","Digit7","7",{shifted:"&",keyCode:55}),K("8","Digit8","8",{shifted:"*",keyCode:56}),K("9","Digit9","9",{shifted:"(",keyCode:57}),K("0","Digit0","0",{shifted:")",keyCode:48}),K("-","Minus","-",{shifted:"_",keyCode:189}),K("=","Equal","=",{shifted:"+",keyCode:187}),K("Backspace","Backspace","Backspace",{width:2.1,keyCode:8})
],
[
K("Tab","Tab","Tab",{width:1.55,keyCode:9}),K("Q","KeyQ","q",{keyCode:81}),K("W","KeyW","w",{keyCode:87}),K("E","KeyE","e",{keyCode:69}),K("R","KeyR","r",{keyCode:82}),K("T","KeyT","t",{keyCode:84}),K("Y","KeyY","y",{keyCode:89}),K("U","KeyU","u",{keyCode:85}),K("I","KeyI","i",{keyCode:73}),K("O","KeyO","o",{keyCode:79}),K("P","KeyP","p",{keyCode:80}),K("[","BracketLeft","[",{shifted:"{",keyCode:219}),K("]","BracketRight","]",{shifted:"}",keyCode:221}),K("\\","Backslash","\\",{shifted:"|",width:1.55,keyCode:220})
],
[
K("Caps","CapsLock","CapsLock",{width:1.9,keyCode:20,toggle:true}),K("A","KeyA","a",{keyCode:65}),K("S","KeyS","s",{keyCode:83}),K("D","KeyD","d",{keyCode:68}),K("F","KeyF","f",{keyCode:70}),K("G","KeyG","g",{keyCode:71}),K("H","KeyH","h",{keyCode:72}),K("J","KeyJ","j",{keyCode:74}),K("K","KeyK","k",{keyCode:75}),K("L","KeyL","l",{keyCode:76}),K(";","Semicolon",";",{shifted:":",keyCode:186}),K("'","Quote","'",{shifted:"\"",keyCode:222}),K("Enter","Enter","Enter",{width:2.35,keyCode:13})
],
[
K("Shift","ShiftLeft","Shift",{width:2.55,keyCode:16,modifier:true,sticky:true,location:1}),K("Z","KeyZ","z",{keyCode:90}),K("X","KeyX","x",{keyCode:88}),K("C","KeyC","c",{keyCode:67}),K("V","KeyV","v",{keyCode:86}),K("B","KeyB","b",{keyCode:66}),K("N","KeyN","n",{keyCode:78}),K("M","KeyM","m",{keyCode:77}),K(",","Comma",",",{shifted:"<",keyCode:188}),K(".","Period",".",{shifted:">",keyCode:190}),K("/","Slash","/",{shifted:"?",keyCode:191}),K("Shift","ShiftRight","Shift",{width:2.55,keyCode:16,modifier:true,sticky:true,location:2})
],
[
K("Ctrl","ControlLeft","Control",{width:1.45,keyCode:17,modifier:true,sticky:true,location:1}),K("Win","MetaLeft","Meta",{width:1.25,keyCode:91,modifier:true,sticky:true,location:1}),K("Alt","AltLeft","Alt",{width:1.25,keyCode:18,modifier:true,sticky:true,location:1}),K("Space","Space"," ",{width:6.4,keyCode:32}),K("Alt","AltRight","Alt",{width:1.25,keyCode:18,modifier:true,sticky:true,location:2}),K("Win","MetaRight","Meta",{width:1.25,keyCode:92,modifier:true,sticky:true,location:2}),K("Menu","ContextMenu","ContextMenu",{width:1.25,keyCode:93}),K("Ctrl","ControlRight","Control",{width:1.45,keyCode:17,modifier:true,sticky:true,location:2})
]
];

const functionKeyboardLayout={
functions:[[
K("Esc","Escape","Escape",{keyCode:27}),{spacer:.6},K("F1","F1","F1",{keyCode:112}),K("F2","F2","F2",{keyCode:113}),K("F3","F3","F3",{keyCode:114}),K("F4","F4","F4",{keyCode:115}),{spacer:.4},K("F5","F5","F5",{keyCode:116}),K("F6","F6","F6",{keyCode:117}),K("F7","F7","F7",{keyCode:118}),K("F8","F8","F8",{keyCode:119}),{spacer:.4},K("F9","F9","F9",{keyCode:120}),K("F10","F10","F10",{keyCode:121}),K("F11","F11","F11",{keyCode:122}),K("F12","F12","F12",{keyCode:123})
]],
navigation:[
[K("PrtSc","PrintScreen","PrintScreen",{keyCode:44}),K("ScrLk","ScrollLock","ScrollLock",{keyCode:145,toggle:true}),K("Pause","Pause","Pause",{keyCode:19})],
[K("Ins","Insert","Insert",{keyCode:45}),K("Home","Home","Home",{keyCode:36}),K("PgUp","PageUp","PageUp",{keyCode:33})],
[K("Del","Delete","Delete",{keyCode:46}),K("End","End","End",{keyCode:35}),K("PgDn","PageDown","PageDown",{keyCode:34})],
[{spacer:1},K("↑","ArrowUp","ArrowUp",{keyCode:38}),{spacer:1}],
[K("←","ArrowLeft","ArrowLeft",{keyCode:37}),K("↓","ArrowDown","ArrowDown",{keyCode:40}),K("→","ArrowRight","ArrowRight",{keyCode:39})]
],
numpad:[
[K("Num","NumLock","NumLock",{keyCode:144,toggle:true,location:3}),K("/","NumpadDivide","/",{keyCode:111,location:3}),K("*","NumpadMultiply","*",{keyCode:106,location:3}),K("-","NumpadSubtract","-",{keyCode:109,location:3})],
[K("7","Numpad7","7",{keyCode:103,location:3}),K("8","Numpad8","8",{keyCode:104,location:3}),K("9","Numpad9","9",{keyCode:105,location:3}),K("+","NumpadAdd","+",{keyCode:107,height:2,location:3})],
[K("4","Numpad4","4",{keyCode:100,location:3}),K("5","Numpad5","5",{keyCode:101,location:3}),K("6","Numpad6","6",{keyCode:102,location:3})],
[K("1","Numpad1","1",{keyCode:97,location:3}),K("2","Numpad2","2",{keyCode:98,location:3}),K("3","Numpad3","3",{keyCode:99,location:3}),K("Enter","NumpadEnter","Enter",{keyCode:13,height:2,location:3})],
[K("0","Numpad0","0",{keyCode:96,width:2,location:3}),K(".","NumpadDecimal",".",{keyCode:110,location:3})]
],
extra:[
[K("Backspace","Backspace","Backspace",{width:2.2,keyCode:8}),K("Tab","Tab","Tab",{width:1.4,keyCode:9}),K("Enter","Enter","Enter",{width:1.8,keyCode:13}),K("Space","Space"," ",{width:3.2,keyCode:32})],
[K("Ctrl","ControlLeft","Control",{width:1.4,keyCode:17,modifier:true,sticky:true,location:1}),K("Shift","ShiftLeft","Shift",{width:1.7,keyCode:16,modifier:true,sticky:true,location:1}),K("Alt","AltLeft","Alt",{width:1.3,keyCode:18,modifier:true,sticky:true,location:1}),K("Win","MetaLeft","Meta",{width:1.3,keyCode:91,modifier:true,sticky:true,location:1})]
]
};

// 游戏键盘布局：仅上下左右十字键
const gameKeyboardKeys = [
  K("↑","ArrowUp","ArrowUp",{keyCode:38}),
  K("←","ArrowLeft","ArrowLeft",{keyCode:37}),
  K("↓","ArrowDown","ArrowDown",{keyCode:40}),
  K("→","ArrowRight","ArrowRight",{keyCode:39})
];

class VirtualKeyboard{
constructor(runtime){
this.runtime=runtime;this.vm=Scratch.vm||null;this.visible=false;this.mode="letters";
this.modal=null;this.header=null;this.keyboardContainer=null;this.statusText=null;this.modeLettersButton=null;this.modeNumbersButton=null;this.modeGameButton=null;
this.scale=1;this.keyElements=new Map();this.pressedCodes=new Set();this.stickyModifiers=new Set();this.toggledLocks=new Set();this.repeatTimers=new Map();
this.dragging=false;this.dragPointerId=null;this.dragStartX=0;this.dragStartY=0;this.modalStartLeft=0;this.modalStartTop=0;
this.boundResize=this.handleResize.bind(this);this.boundBlur=this.handleBlur.bind(this);
this.simulating=true; // 默认启用模拟
}
show(mode){if(mode==="letters"||mode==="numbers"||mode==="game")this.mode=mode;if(this.visible){this.renderKeyboard();this.updateModeButtons();this.updateStatus();this.fitToScreen(true);return;}this.createUI();this.visible=true;window.addEventListener("resize",this.boundResize);window.addEventListener("orientationchange",this.boundResize);window.addEventListener("blur",this.boundBlur);}
hide(){if(!this.visible)return;this.releaseAllKeys();if(this.modal&&this.modal.parentNode)this.modal.parentNode.removeChild(this.modal);this.modal=this.header=this.keyboardContainer=this.statusText=this.modeLettersButton=this.modeNumbersButton=this.modeGameButton=null;this.keyElements.clear();this.visible=false;window.removeEventListener("resize",this.boundResize);window.removeEventListener("orientationchange",this.boundResize);window.removeEventListener("blur",this.boundBlur);}
toggle(){this.visible?this.hide():this.show();}
isVisible(){return this.visible;}
setMode(mode){if(mode!=="letters"&&mode!=="numbers"&&mode!=="game")return;this.mode=mode;if(this.visible){this.renderKeyboard();this.updateModeButtons();this.updateStatus();this.fitToScreen(true);}}
getModeName(){if(this.mode==="letters")return"字母键盘";if(this.mode==="numbers")return"数字+方向+功能";return"游戏键盘";}
getModifierState(extra){const has=c=>this.pressedCodes.has(c)||this.stickyModifiers.has(c)||extra===c;return{shift:has("ShiftLeft")||has("ShiftRight"),ctrl:has("ControlLeft")||has("ControlRight"),alt:has("AltLeft")||has("AltRight"),meta:has("MetaLeft")||has("MetaRight"),caps:this.toggledLocks.has("CapsLock"),num:this.toggledLocks.has("NumLock"),scroll:this.toggledLocks.has("ScrollLock")};}
resolveKey(d,extra){const s=this.getModifierState(extra);if(isLetterCode(d.code)){const l=d.key.toLowerCase();return s.shift^s.caps?l.toUpperCase():l;}if(s.shift&&d.shifted)return d.shifted;return d.key;}
dispatchDOM(type,d,repeat=false){const key=this.resolveKey(d,type==="keydown"?d.code:null),s=this.getModifierState(type==="keydown"?d.code:null),kc=keyCodeFromData(d,key);const e=new KeyboardEvent(type,{key,code:d.code,location:d.location||0,bubbles:true,cancelable:true,composed:true,repeat,shiftKey:s.shift,ctrlKey:s.ctrl,altKey:s.alt,metaKey:s.meta});legacy(e,kc);const t=focused();try{t.dispatchEvent(e)}catch(_){}try{document.dispatchEvent(e)}catch(_){}try{window.dispatchEvent(e)}catch(_){}return key;}
postScratch(d,isDown,key){if(!this.vm||!this.vm.runtime)return;const r=this.vm.runtime,kb=r.ioDevices&&r.ioDevices.keyboard,sk=scratchKeyName(key),kc=keyCodeFromData(d,key);try{if(kb&&typeof kb.postData==="function")kb.postData({key:sk,isDown,keyCode:kc});}catch(_){}try{if(isDown&&typeof r.startHats==="function")r.startHats("event_whenkeypressed",{KEY_OPTION:sk});}catch(_){}}
keyDown(d){
  if(this.pressedCodes.has(d.code)) return;
  this.pressedCodes.add(d.code);
  const k=this.resolveKey(d,d.code);
  if(this.simulating){
    this.dispatchDOM("keydown",d,false);
    this.postScratch(d,true,k);
  }
  this.refreshKeyStyle(d.code);this.updateStatus();
}
keyUp(d){
  if(!this.pressedCodes.has(d.code)) return;
  this.stopLongPress(d.code);
  const k=this.resolveKey(d,null);
  if(this.simulating){
    this.dispatchDOM("keyup",d,false);
    this.postScratch(d,false,k);
  }
  this.pressedCodes.delete(d.code);
  this.refreshKeyStyle(d.code);this.updateStatus();
}
tapKey(d){this.keyDown(d);setTimeout(()=>this.keyUp(d),70);}
repeatKey(d){
  if(!this.pressedCodes.has(d.code)) return;
  if(this.simulating){
    const k=this.dispatchDOM("keydown",d,true);
    this.postScratch(d,true,k);
  }
}
startLongPress(d){if(!d||d.modifier||d.toggle)return;this.stopLongPress(d.code);const td={delayTimer:null,intervalTimer:null};td.delayTimer=setTimeout(()=>{if(!this.pressedCodes.has(d.code)){this.stopLongPress(d.code);return;}td.intervalTimer=setInterval(()=>{if(!this.pressedCodes.has(d.code)){this.stopLongPress(d.code);return;}this.repeatKey(d);},LONG_PRESS_INTERVAL);},LONG_PRESS_DELAY);this.repeatTimers.set(d.code,td);}
stopLongPress(code){const td=this.repeatTimers.get(code);if(!td)return;if(td.delayTimer)clearTimeout(td.delayTimer);if(td.intervalTimer)clearInterval(td.intervalTimer);this.repeatTimers.delete(code);}
stopAllLongPress(){for(const c of Array.from(this.repeatTimers.keys()))this.stopLongPress(c);}
toggleStickyModifier(d){if(this.stickyModifiers.has(d.code)){this.stickyModifiers.delete(d.code);this.keyUp(d);}else{this.stickyModifiers.add(d.code);this.keyDown(d);}this.refreshKeyStyle(d.code);this.updateStatus();}
toggleLock(d){this.tapKey(d);this.toggledLocks.has(d.code)?this.toggledLocks.delete(d.code):this.toggledLocks.add(d.code);this.refreshKeyStyle(d.code);this.updateStatus();}
releaseAllKeys(){this.stopAllLongPress();const codes=Array.from(this.pressedCodes);for(const c of codes){const d=this.findKeyData(c);if(d)this.keyUp(d);}this.pressedCodes.clear();this.stickyModifiers.clear();this.refreshAllKeys();this.updateStatus();}
findKeyData(code){const scan=rows=>{for(const r of rows)for(const i of r)if(i&&i.code===code)return i;return null;};return scan(letterKeyboardLayout)||scan(functionKeyboardLayout.functions)||scan(functionKeyboardLayout.navigation)||scan(functionKeyboardLayout.numpad)||scan(functionKeyboardLayout.extra)||scan(gameKeyboardKeys);}
createUI(){
this.modal=document.createElement("div");this.modal.className="tw-vkbd-modal";
Object.assign(this.modal.style,{position:"fixed",left:"0px",top:"0px",background:"linear-gradient(145deg, rgba(42,47,58,0.98), rgba(27,31,40,0.98))",border:"1px solid rgba(255,255,255,0.14)",borderRadius:"18px",padding:"18px",boxShadow:"0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)",userSelect:"none",touchAction:"none",overflow:"visible",boxSizing:"border-box",transformOrigin:"left top",willChange:"left, top, transform",zIndex:"999999",pointerEvents:"auto",cursor:"grab"});
this.header=document.createElement("div");Object.assign(this.header.style,{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",padding:"0 0 14px 0",marginBottom:"14px",borderBottom:"1px solid rgba(255,255,255,0.1)",cursor:"grab",touchAction:"none"});
const titleBox=document.createElement("div"),title=document.createElement("div"),subtitle=document.createElement("div");title.textContent="虚拟键盘";subtitle.textContent="可拖动标题栏 / 长按连发 / 自动缩放";Object.assign(title.style,{color:"#fff",fontSize:"19px",fontWeight:"700",letterSpacing:"0.5px",marginBottom:"5px",whiteSpace:"nowrap"});Object.assign(subtitle.style,{color:"#aeb7c8",fontSize:"12px",whiteSpace:"nowrap"});titleBox.append(title,subtitle);
const right=document.createElement("div");Object.assign(right.style,{display:"flex",alignItems:"center",gap:"10px",flexWrap:"nowrap",justifyContent:"flex-end"});
const modeSwitch=document.createElement("div");Object.assign(modeSwitch.style,{display:"flex",padding:"4px",borderRadius:"10px",background:"rgba(14,17,23,0.7)",border:"1px solid rgba(255,255,255,0.08)",gap:"4px"});
this.modeLettersButton=this.createModeButton("字母键盘","letters");
this.modeNumbersButton=this.createModeButton("数字/方向","numbers");
this.modeGameButton=this.createModeButton("游戏键盘","game");
modeSwitch.append(this.modeLettersButton,this.modeNumbersButton,this.modeGameButton);
const statusBox=document.createElement("div");Object.assign(statusBox.style,{color:"#cad3e2",fontSize:"12px",padding:"8px 10px",borderRadius:"10px",background:"rgba(14,17,23,0.58)",border:"1px solid rgba(255,255,255,0.08)",whiteSpace:"nowrap"});this.statusText=document.createElement("span");statusBox.appendChild(this.statusText);
const close=document.createElement("button");close.textContent="×";close.className="tw-vkbd-no-drag";Object.assign(close.style,{width:"34px",height:"34px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",color:"#d6deeb",fontSize:"24px",lineHeight:"28px",cursor:"pointer",transition:"all 0.15s"});close.addEventListener("pointerdown",e=>e.stopPropagation());close.addEventListener("click",e=>{e.stopPropagation();this.hide();});
right.append(modeSwitch,statusBox,close);this.header.append(titleBox,right);
this.keyboardContainer=document.createElement("div");Object.assign(this.keyboardContainer.style,{display:"flex",gap:"18px",alignItems:"flex-start",touchAction:"none",overflow:"visible"});
this.modal.append(this.header,this.keyboardContainer);document.body.appendChild(this.modal);
this.renderKeyboard();this.updateModeButtons();this.updateStatus();this.fitToScreen(true);this.bindDrag();
}
createModeButton(text,mode){const b=document.createElement("button");b.textContent=text;b.className="tw-vkbd-no-drag";Object.assign(b.style,{border:"none",borderRadius:"8px",padding:"7px 11px",fontSize:"12px",color:"#aeb7c8",background:"transparent",cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"});b.addEventListener("pointerdown",e=>e.stopPropagation());b.addEventListener("click",e=>{e.stopPropagation();this.setMode(mode);});return b;}
updateModeButtons(){
const a=b=>{b.style.background="linear-gradient(135deg,#4d78cc,#6b8ff0)";b.style.color="#fff";b.style.boxShadow="0 4px 12px rgba(77,120,204,.35)";},i=b=>{b.style.background="transparent";b.style.color="#aeb7c8";b.style.boxShadow="none";};
if(this.modeLettersButton){this.mode==="letters"?a(this.modeLettersButton):i(this.modeLettersButton);}
if(this.modeNumbersButton){this.mode==="numbers"?a(this.modeNumbersButton):i(this.modeNumbersButton);}
if(this.modeGameButton){this.mode==="game"?a(this.modeGameButton):i(this.modeGameButton);}
}
getOverlaySize(){return {width:window.innerWidth,height:window.innerHeight};}
fitToScreen(center){
if(!this.modal)return;
this.modal.style.transform="scale(1)";
const s=this.getOverlaySize(),rw=this.modal.offsetWidth,rh=this.modal.offsetHeight,aw=Math.max(1,s.width-16),ah=Math.max(1,s.height-16);
this.scale=Math.max(MIN_SCALE,Math.min(1,aw/rw,ah/rh));
this.modal.style.transform=`scale(${this.scale})`;
const vw=rw*this.scale,vh=rh*this.scale;
if(center){this.modal.style.left=`${Math.max(8,(s.width-vw)/2)}px`;this.modal.style.top=`${Math.max(8,(s.height-vh)/2)}px`;}else this.keepInsideScreen();
}
keepInsideScreen(){
if(!this.modal)return;
const s=this.getOverlaySize(),vw=this.modal.offsetWidth*this.scale,vh=this.modal.offsetHeight*this.scale,maxX=Math.max(0,s.width-vw),maxY=Math.max(0,s.height-vh),l=parseFloat(this.modal.style.left)||0,t=parseFloat(this.modal.style.top)||0;
this.modal.style.left=`${clamp(l,0,maxX)}px`;this.modal.style.top=`${clamp(t,0,maxY)}px`;
}
handleResize(){if(this.visible)this.fitToScreen(false);}
handleBlur(){this.releaseAllKeys();}
shouldStartDrag(t){if(!t)return true;if(t.closest&&t.closest(".tw-vkbd-key"))return false;if(t.closest&&t.closest(".tw-vkbd-no-drag"))return false;return true;}
bindDrag(){
const down=e=>{if(!this.shouldStartDrag(e.target))return;if(e.button!==undefined&&e.button!==0)return;e.preventDefault();this.dragging=true;this.dragPointerId=e.pointerId;this.dragStartX=e.clientX;this.dragStartY=e.clientY;this.modalStartLeft=parseFloat(this.modal.style.left)||0;this.modalStartTop=parseFloat(this.modal.style.top)||0;try{this.modal.setPointerCapture(e.pointerId)}catch(_){}this.modal.style.cursor="grabbing";document.body.style.userSelect="none";},
move=e=>{if(!this.dragging)return;if(this.dragPointerId!==null&&e.pointerId!==this.dragPointerId)return;e.preventDefault();const dx=e.clientX-this.dragStartX,dy=e.clientY-this.dragStartY,s=this.getOverlaySize(),vw=this.modal.offsetWidth*this.scale,vh=this.modal.offsetHeight*this.scale;this.modal.style.left=`${clamp(this.modalStartLeft+dx,0,Math.max(0,s.width-vw))}px`;this.modal.style.top=`${clamp(this.modalStartTop+dy,0,Math.max(0,s.height-vh))}px`;},
up=e=>{if(!this.dragging)return;if(e&&this.dragPointerId!==null&&e.pointerId!==this.dragPointerId)return;this.dragging=false;this.dragPointerId=null;this.modal.style.cursor="grab";document.body.style.userSelect="";};
this.modal.addEventListener("pointerdown",down);this.modal.addEventListener("pointermove",move);this.modal.addEventListener("pointerup",up);this.modal.addEventListener("pointercancel",up);this.modal.addEventListener("lostpointercapture",up);
}
createSection(rows){
const sec=document.createElement("div");Object.assign(sec.style,{display:"flex",flexDirection:"column",gap:`${KEY_GAP}px`,overflow:"visible"});
for(const rowData of rows){const row=document.createElement("div");Object.assign(row.style,{display:"flex",gap:`${KEY_GAP}px`,height:`${KEY_SIZE}px`,alignItems:"stretch",overflow:"visible"});for(const d of rowData){if(d.spacer){const sp=document.createElement("div");sp.style.width=`calc(${d.spacer*KEY_SIZE}px + ${(d.spacer-1)*KEY_GAP}px)`;row.appendChild(sp);continue;}row.appendChild(this.createKeyElement(d,false));}sec.appendChild(row);}
return sec;
}
createNumpad(rows){
const g=document.createElement("div");Object.assign(g.style,{display:"grid",gridTemplateColumns:`repeat(4,${KEY_SIZE}px)`,gridAutoRows:`${KEY_SIZE}px`,gap:`${KEY_GAP}px`,overflow:"visible"});
for(const r of rows)for(const d of r){if(d.spacer)continue;g.appendChild(this.createKeyElement(d,true));}return g;
}
createGamepad(){
const pad=document.createElement("div");
pad.style.display="grid";
pad.style.gridTemplateColumns=`repeat(3,${KEY_SIZE}px)`;
pad.style.gridTemplateRows=`repeat(2,${KEY_SIZE}px)`;
pad.style.gap=`${KEY_GAP}px`;
const up=this.createKeyElement(gameKeyboardKeys[0],true);
up.style.gridColumn="2";up.style.gridRow="1";
const left=this.createKeyElement(gameKeyboardKeys[1],true);
left.style.gridColumn="1";left.style.gridRow="2";
const down=this.createKeyElement(gameKeyboardKeys[2],true);
down.style.gridColumn="2";down.style.gridRow="2";
const right=this.createKeyElement(gameKeyboardKeys[3],true);
right.style.gridColumn="3";right.style.gridRow="2";
pad.append(up,left,down,right);
return pad;
}
createKeyElement(d,grid){
const el=document.createElement("div");el.className="tw-vkbd-key tw-vkbd-no-drag";
el.dataset.code=d.code;el.textContent=d.label;el.title=`code: ${d.code}\nkey: ${d.key}`;
const w=d.width||1,h=d.height||1;
Object.assign(el.style,{position:"relative",width:grid?"auto":`calc(${w*KEY_SIZE}px + ${(w-1)*KEY_GAP}px)`,height:grid?"auto":"100%",gridColumn:grid?`span ${w}`:"",gridRow:grid?`span ${h}`:"",minHeight:`${KEY_SIZE}px`,boxSizing:"border-box",borderRadius:"9px",border:"1px solid rgba(255,255,255,.09)",background:"linear-gradient(180deg,#454c5d,#343a48)",color:"#e5ebf5",boxShadow:"0 3px 0 #171a22,0 8px 18px rgba(0,0,0,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"transform .08s,background .12s,box-shadow .08s,color .12s",touchAction:"none",padding:"0 5px",whiteSpace:"nowrap",overflow:"hidden"});
if(d.modifier||d.toggle)el.style.background="linear-gradient(180deg,#4d566a,#394153)";
this.bindKeyEvents(el,d);
this.keyElements.set(d.code,el);
this.refreshKeyStyle(d.code);
return el;
}
bindKeyEvents(el,d){
let isDown=false,pid=null;
const vd=()=>{el.style.transform="translateY(3px)";el.style.boxShadow="0 0 0 #171a22,0 3px 8px rgba(0,0,0,.2)";},
vu=()=>{el.style.transform="translateY(0)";this.refreshKeyStyle(d.code);};
el.addEventListener("pointerdown",e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();pid=e.pointerId;try{el.setPointerCapture(pid)}catch(_){}vd();if(d.toggle){this.toggleLock(d);vu();return;}if(d.modifier&&d.sticky){this.toggleStickyModifier(d);vu();return;}isDown=true;this.keyDown(d);this.startLongPress(d);});
el.addEventListener("pointerup",e=>{if(!isDown)return;if(pid!==null&&e.pointerId!==pid)return;e.preventDefault();e.stopPropagation();isDown=false;this.stopLongPress(d.code);this.keyUp(d);vu();});
const cancel=()=>{if(!isDown)return;isDown=false;this.stopLongPress(d.code);this.keyUp(d);vu();};
el.addEventListener("pointercancel",cancel);el.addEventListener("lostpointercapture",cancel);
el.addEventListener("mouseenter",()=>{if(!this.pressedCodes.has(d.code)&&!this.stickyModifiers.has(d.code)&&!this.toggledLocks.has(d.code)){el.style.background="linear-gradient(180deg,#566073,#3e4657)";el.style.color="#fff";}});
el.addEventListener("mouseleave",()=>{if(!isDown)this.refreshKeyStyle(d.code);});
el.addEventListener("contextmenu",e=>e.preventDefault());
}
refreshKeyStyle(code){
const el=this.keyElements.get(code);if(!el)return;
const active=this.pressedCodes.has(code)||this.stickyModifiers.has(code)||this.toggledLocks.has(code);
if(active){el.style.background="linear-gradient(180deg,#6c93ff,#4d78cc)";el.style.color="#fff";el.style.boxShadow="0 0 0 #171a22,0 0 18px rgba(86,130,255,.35)";}
else{const d=this.findKeyData(code);el.style.background=d&&(d.modifier||d.toggle)?"linear-gradient(180deg,#4d566a,#394153)":"linear-gradient(180deg,#454c5d,#343a48)";el.style.color="#e5ebf5";el.style.boxShadow="0 3px 0 #171a22,0 8px 18px rgba(0,0,0,.22)";}
}
refreshAllKeys(){for(const c of this.keyElements.keys())this.refreshKeyStyle(c);}
renderKeyboard(){
if(!this.keyboardContainer)return;
this.keyboardContainer.innerHTML="";this.keyElements.clear();
if(this.mode==="letters"){
this.keyboardContainer.style.flexDirection="row";this.keyboardContainer.style.gap="18px";
this.keyboardContainer.appendChild(this.createSection(letterKeyboardLayout));
}else if(this.mode==="numbers"){
this.keyboardContainer.style.flexDirection="column";this.keyboardContainer.style.gap="18px";
const top=document.createElement("div"),bottom=document.createElement("div");
Object.assign(top.style,{display:"flex",gap:"18px",alignItems:"flex-start",overflow:"visible"});
Object.assign(bottom.style,{display:"flex",gap:"18px",alignItems:"flex-start",overflow:"visible"});
top.appendChild(this.createSection(functionKeyboardLayout.functions));
bottom.append(this.createSection(functionKeyboardLayout.navigation),this.createNumpad(functionKeyboardLayout.numpad),this.createSection(functionKeyboardLayout.extra));
this.keyboardContainer.append(top,bottom);
}else if(this.mode==="game"){
this.keyboardContainer.style.flexDirection="row";
this.keyboardContainer.style.justifyContent="center";
this.keyboardContainer.style.gap="0";
this.keyboardContainer.appendChild(this.createGamepad());
}
this.refreshAllKeys();
}
updateStatus(){
if(!this.statusText)return;
const p=[this.getModeName()];
if(this.stickyModifiers.has("ShiftLeft")||this.stickyModifiers.has("ShiftRight"))p.push("Shift");
if(this.stickyModifiers.has("ControlLeft")||this.stickyModifiers.has("ControlRight"))p.push("Ctrl");
if(this.stickyModifiers.has("AltLeft")||this.stickyModifiers.has("AltRight"))p.push("Alt");
if(this.stickyModifiers.has("MetaLeft")||this.stickyModifiers.has("MetaRight"))p.push("Meta");
if(this.toggledLocks.has("CapsLock"))p.push("Caps");
if(this.toggledLocks.has("NumLock"))p.push("Num");
if(this.toggledLocks.has("ScrollLock"))p.push("ScrLk");
this.statusText.textContent=p.join(" / ");
}
// 新增：设置模拟开关
setSimulating(enable){this.simulating=!!enable;}
getSimulating(){return this.simulating;}
getPressedKeys(){
  const keys=[];
  for(const code of this.pressedCodes){
    const d=this.findKeyData(code);
    keys.push(d?d.label:scratchKeyName(code));
  }
  return keys;
}
}

let instance=null;
function getKeyboard(runtime){if(!instance)instance=new VirtualKeyboard(runtime);return instance;}

class VirtualKeyboardExtension{
constructor(runtime){this.runtime=runtime;}
getInfo(){return{id:"VirtualKeyboardPlus",name:"虚拟键盘",color1:"#3e4451",color2:"#2c313a",color3:"#4d78cc",blocks:[
{opcode:"showKeyboard",blockType:Scratch.BlockType.COMMAND,text:"显示虚拟键盘"},
{opcode:"hideKeyboard",blockType:Scratch.BlockType.COMMAND,text:"隐藏虚拟键盘"},
{opcode:"toggleKeyboard",blockType:Scratch.BlockType.COMMAND,text:"[STATE] 虚拟键盘",arguments:{STATE:{type:Scratch.ArgumentType.STRING,menu:"showHideMenu",defaultValue:"show"}}},
{opcode:"showKeyboardMode",blockType:Scratch.BlockType.COMMAND,text:"显示虚拟键盘 类型 [MODE]",arguments:{MODE:{type:Scratch.ArgumentType.STRING,menu:"keyboardModeMenu",defaultValue:"letters"}}},
{opcode:"setKeyboardMode",blockType:Scratch.BlockType.COMMAND,text:"切换虚拟键盘为 [MODE]",arguments:{MODE:{type:Scratch.ArgumentType.STRING,menu:"keyboardModeMenu",defaultValue:"letters"}}},
{opcode:"isKeyboardVisible",blockType:Scratch.BlockType.BOOLEAN,text:"虚拟键盘已显示？"},
{opcode:"currentKeyboardMode",blockType:Scratch.BlockType.REPORTER,text:"当前虚拟键盘类型"},
// 新增积木
{opcode:"setSimulating",blockType:Scratch.BlockType.COMMAND,text:"模拟按键 [STATE]",arguments:{STATE:{type:Scratch.ArgumentType.STRING,menu:"enableDisableMenu",defaultValue:"enable"}}},
{opcode:"getPressedKeys",blockType:Scratch.BlockType.REPORTER,text:"按下了那些按键"}
],menus:{showHideMenu:{acceptReporters:false,items:[{text:"显示",value:"show"},{text:"隐藏",value:"hide"}]},keyboardModeMenu:{acceptReporters:false,items:[{text:"字母键盘",value:"letters"},{text:"数字+方向+功能",value:"numbers"},{text:"游戏键盘 (仅方向)",value:"game"}]},enableDisableMenu:{acceptReporters:false,items:[{text:"启用",value:"enable"},{text:"停止",value:"disable"}]}}};}
showKeyboard(){getKeyboard(this.runtime).show();}
hideKeyboard(){getKeyboard(this.runtime).hide();}
toggleKeyboard(args){const k=getKeyboard(this.runtime);args.STATE==="hide"?k.hide():k.show();}
showKeyboardMode(args){const mode=args.MODE;getKeyboard(this.runtime).show(mode==="numbers"?"numbers":mode==="game"?"game":"letters");}
setKeyboardMode(args){const mode=args.MODE;getKeyboard(this.runtime).setMode(mode==="numbers"?"numbers":mode==="game"?"game":"letters");}
isKeyboardVisible(){return getKeyboard(this.runtime).isVisible();}
currentKeyboardMode(){return getKeyboard(this.runtime).getModeName();}
// 新增实现
setSimulating(args){getKeyboard(this.runtime).setSimulating(args.STATE==="enable");}
getPressedKeys(){const keys=getKeyboard(this.runtime).getPressedKeys();return keys.length?keys.join(", "):"无";}
}
Scratch.extensions.register(new VirtualKeyboardExtension());
})(Scratch);
