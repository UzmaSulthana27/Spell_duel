import { useState, useEffect, useCallback, useRef } from "react";

const WORD_LIST = [
  "ace","act","age","ago","aid","aim","air","ale","apt","arc","are","ark","arm","art","ash","ask","axe",
  "bale","bane","bare","bark","base","bath","bear","beat","bell","belt","bend","bile","bite","blade","blame","blare","blast","blaze",
  "bolt","bone","bore","born","brag","bran","brave","brew","brim","brine","brisk","broke","burn","burst",
  "cage","calm","came","cape","care","cast","cave","char","charm","chase","chill","chip","clan","claw","clay","cloak","clone",
  "coil","cold","come","core","corn","cost","crag","cram","crane","craze","crest","crisp","crop","crown","crush","cure","curl",
  "dale","dame","dare","dark","dart","dash","dawn","daze","deal","dear","debt","deck","deem","deep","deft","den","dew",
  "dire","dive","dome","doom","dote","dove","down","drag","drain","drake","dram","drape","draw","dream","drift","drill","drip",
  "drop","drum","dune","dusk","dust","dwell","dye",
  "earl","earn","ease","east","edge","elf","elk","elm","emit","envy","epic","even","ever","evil","exam",
  "fade","fail","fain","fake","fame","fang","fare","farm","fate","fear","fell","fend","fern","fierce","fire","firm","fist",
  "flag","flail","flake","flame","flare","flask","flaw","flea","flee","flesh","flint","flit","flock","flood","flow","flux","foam","fold",
  "font","fool","ford","fore","fork","form","foul","free","fume","furl",
  "gale","game","gate","gaze","gear","gild","glade","glee","glow","gloom","glyph","gnaw","gore","grace","grain","grant","grave",
  "gray","grim","grind","grip","grit","grog","grow","growl","gruel","guard","guild","guile","gust",
  "hack","hail","hale","halt","hand","hare","harm","harp","haste","hate","haunt","heal","heap","helm","help","hide","hilt","hive",
  "hold","hole","home","hope","horn","howl","hunt","hurl","hymn","hex",
  "idle","iris","iron","isle","jade","jail","jest","jolt","joy",
  "keen","kill","kind","king","kneel","knew","knot",
  "lace","lake","lame","land","lane","lark","lash","last","late","laud","lava","lawn","laze","lead","leaf","lean","leap","lend","lore",
  "lost","loud","lure","lurk","lust","lute",
  "mace","made","mage","maid","mail","main","make","male","mana","mark","mars","mask","mast","maze","mead","mean","melt","mend",
  "mere","mesh","mild","mind","mine","mire","mist","moat","mock","molt","mope","more","moss","move","muck","murk","myth",
  "nail","name","nape","near","need","nest","night","nimble","noble","node","noir","norm","null",
  "oath","ogre","once","only","open","orb","omen",
  "pace","pact","page","pain","pale","pang","past","path","pave","peak","peal","peel","peer","pelt","pend","pine","pipe","plain",
  "plan","plane","plant","plea","plow","plume","plunge","pole","pond","pore","port","pose","pour","power","prey","prim","probe",
  "prone","proof","prowl","prune","pull","pure","push",
  "rage","raid","rain","rake","ramp","rang","rank","rant","raze","read","real","reap","reel","rend","rest","rift","ring","rise","risk",
  "roam","roar","robe","rock","role","roll","rook","rout","rove","ruin","rule","rune","rush",
  "safe","sage","sail","sale","salt","sand","sang","sane","sap","scar","scorn","scry","seal","seam","sear","seed","seek","seen","seep",
  "send","shade","shaft","shake","shall","shame","shape","share","sharp","shear","shed","shell","shield","shift","shine","shroud",
  "siege","sigh","silk","silt","sire","skill","skin","slab","slag","slam","slant","slash","slate","slay","slew","slime","slip",
  "slope","smash","smite","smoke","snare","sneak","snow","soar","soil","sole","some","song","soot","sore","soul","spark",
  "spear","spell","spire","spite","split","spoke","spur","stab","stain","stake","stalk","stand","stark","steal","steel","stem","step",
  "stir","stone","storm","stray","stride","strike","strip","strode","strong","struck","stub","stun","surge","swear","sweep",
  "swift","swipe","swirl","swore","sword",
  "tail","take","tale","tame","tang","task","tear","tell","temp","tend","test","thick","thin","thorn","tide","tile",
  "time","toll","tome","tone","tore","torn","toil","town","trap","trek","trial","trick","trim","trod","true","trust","turn",
  "vale","vane","veil","vein","vile","vine","void","vow","vex",
  "wade","wage","wake","wand","wane","ward","ware","warm","warp","wary","wave","weak","weal","weld","well","wend","whet",
  "whirl","wild","will","wilt","wind","wine","wing","wink","wire","wise","wish","wisp","woe","woke","wolf","womb","wrath","wrest",
  "wring","writ","wrote","yore","zeal","zone","zap"
];
const WORD_SET = new Set(WORD_LIST);
const LETTER_SCORES = {a:1,e:1,i:1,o:1,u:1,l:1,n:1,s:1,t:1,r:1,d:2,g:2,b:3,c:3,m:3,p:3,f:4,h:4,v:4,w:4,y:4,k:5,j:8,x:8,q:10,z:10};
const wordScore = w => w.split("").reduce((s,c)=>s+(LETTER_SCORES[c]||1),0);

function spellTier(word) {
  const l = word.length;
  if(l>=7) return {name:"Legendary",dmg:wordScore(word)*3,color:"#f59e0b",glow:"#fbbf24",emoji:"⚡",rank:4};
  if(l>=6) return {name:"Greater",  dmg:wordScore(word)*2,color:"#a78bfa",glow:"#c4b5fd",emoji:"🔮",rank:3};
  if(l>=5) return {name:"Magic",    dmg:wordScore(word)*1.5,color:"#60a5fa",glow:"#93c5fd",emoji:"✨",rank:2};
  if(l>=4) return {name:"Minor",    dmg:wordScore(word),  color:"#34d399",glow:"#6ee7b7",emoji:"🌿",rank:1};
  return          {name:"Cantrip",  dmg:Math.max(1,wordScore(word)-1),color:"#94a3b8",glow:"#cbd5e1",emoji:"💨",rank:0};
}

function generateLetters() {
  const v="aeiou",c="bcdfghlmnprst",x="rwyvkz";
  let p="";
  for(let i=0;i<4;i++) p+=v[Math.floor(Math.random()*v.length)];
  for(let i=0;i<5;i++) p+=c[Math.floor(Math.random()*c.length)];
  p+=x[Math.floor(Math.random()*x.length)];
  return p.split("").sort(()=>Math.random()-.5);
}

function canMakeWord(word,letters){
  const a=[...letters];
  for(const c of word){const i=a.indexOf(c);if(i===-1)return false;a.splice(i,1);}
  return true;
}

function aiPickWord(letters,usedWords,difficulty){
  const valid=WORD_LIST.filter(w=>!usedWords.has(w)&&canMakeWord(w,letters));
  if(!valid.length)return null;
  valid.sort((a,b)=>b.length-a.length||wordScore(b)-wordScore(a));
  if(difficulty==="easy"){const sh=valid.filter(w=>w.length<=4);const p=sh.length?sh:valid.slice(Math.floor(valid.length*.6));return p[Math.floor(Math.random()*p.length)];}
  if(difficulty==="medium"){const mid=valid.slice(Math.floor(valid.length*.2),Math.floor(valid.length*.7));const p=mid.length?mid:valid;return p[Math.floor(Math.random()*p.length)];}
  return valid[0];
}

const TRASH = {
  legendary:["A LEGENDARY spell?! My ancestors weep! 😭","You absolute menace... 😤⚡","I felt that in my SOUL. Respect. 👏","That word just broke reality. 🤯"],
  greater:  ["Ooh, showing off, are we? 😏","Not bad... not bad at all. 🔮","I'm sweating a little. 💦","My shield barely held! 😰"],
  magic:    ["A solid cast! But I've seen better. 😒","Keep dreaming, wizard. ✨","Nice spell — enjoy it while you can 😈","Hmm. Acceptable. 🧐"],
  minor:    ["That tickled. 😂","Is that all you've got?! 🙄","My grandmother hits harder. 👵","A Minor Spell? Really? 🫤"],
  cantrip:  ["A cantrip? A CANTRIP?! 😂😂","Bro... just... bro. 🤦","My cat casts better spells. 🐱","I'm not dignifying that. 💅"],
  pass:     ["Too scared to cast? 😏","Taking the coward's path! 🐔","Hah! Ran out of ideas? 😁","Resting already?! 😤"],
};
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
function getTaunt(tier,passed){
  if(passed) return pick(TRASH.pass);
  if(tier.rank===4) return pick(TRASH.legendary);
  if(tier.rank===3) return pick(TRASH.greater);
  if(tier.rank===2) return pick(TRASH.magic);
  if(tier.rank===1) return pick(TRASH.minor);
  return pick(TRASH.cantrip);
}

function useAudio() {
  const ctx = useRef(null);
  const getCtx = () => {
    if(!ctx.current) ctx.current = new (window.AudioContext||window.webkitAudioContext)();
    return ctx.current;
  };
  return useCallback((type, tier=0) => {
    try {
      const ac=getCtx(), g=ac.createGain();
      g.connect(ac.destination);
      if(type==="cast"){
        const o=ac.createOscillator();
        o.connect(g);
        const base=[440,523,659,784,987][Math.min(tier,4)];
        o.frequency.setValueAtTime(base,ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(base*1.5,ac.currentTime+0.15);
        g.gain.setValueAtTime(0.3,ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.4);
        o.start();o.stop(ac.currentTime+0.4);
      } else if(type==="hit"){
        const o=ac.createOscillator(),dist=ac.createWaveShaper();
        const curve=new Float32Array(256);
        for(let i=0;i<256;i++){const x=i*2/256-1;curve[i]=x*(Math.abs(x)+0.5)/(Math.abs(x*1.5)+1);}
        dist.curve=curve; o.connect(dist); dist.connect(g);
        o.frequency.setValueAtTime(200-tier*20,ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(50,ac.currentTime+0.3);
        g.gain.setValueAtTime(0.4,ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.35);
        o.start();o.stop(ac.currentTime+0.35);
      } else if(type==="victory"){
        [523,659,784,1047].forEach((f,i)=>{
          const o=ac.createOscillator(),og=ac.createGain();
          o.connect(og);og.connect(ac.destination);
          o.frequency.value=f;og.gain.setValueAtTime(0,ac.currentTime+i*0.12);
          og.gain.linearRampToValueAtTime(0.25,ac.currentTime+i*0.12+0.05);
          og.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+i*0.12+0.4);
          o.start(ac.currentTime+i*0.12);o.stop(ac.currentTime+i*0.12+0.45);
        });
      } else if(type==="defeat"){
        [392,349,311,261].forEach((f,i)=>{
          const o=ac.createOscillator(),og=ac.createGain();
          o.connect(og);og.connect(ac.destination);
          o.frequency.value=f;og.gain.setValueAtTime(0,ac.currentTime+i*0.15);
          og.gain.linearRampToValueAtTime(0.2,ac.currentTime+i*0.15+0.05);
          og.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+i*0.15+0.5);
          o.start(ac.currentTime+i*0.15);o.stop(ac.currentTime+i*0.15+0.55);
        });
      } else if(type==="ambient"){
        const o=ac.createOscillator(),lfo=ac.createOscillator(),lfoG=ac.createGain();
        lfo.frequency.value=0.3;lfoG.gain.value=8;
        lfo.connect(lfoG);lfoG.connect(o.frequency);
        o.connect(g);o.type="sine";o.frequency.value=110;
        g.gain.setValueAtTime(0.05,ac.currentTime);
        g.gain.linearRampToValueAtTime(0.001,ac.currentTime+4);
        lfo.start();o.start();lfo.stop(ac.currentTime+4);o.stop(ac.currentTime+4);
      }
    } catch(e){}
  },[]);
}

function ParticleCanvas({particles}){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    let frame,list=particles.map(p=>({...p,life:1,vx:(Math.random()-0.5)*8,vy:(Math.random()-1)*10,size:Math.random()*8+4}));
    const animate=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      list=list.filter(p=>p.life>0.01);
      list.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.3;p.life*=0.93;ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill();});
      if(list.length>0) frame=requestAnimationFrame(animate);
      else ctx.clearRect(0,0,canvas.width,canvas.height);
    };
    frame=requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(frame);
  },[particles]);
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:999}}/>;
}

function makeParticles(color,count=40){
  const cx=window.innerWidth/2,cy=window.innerHeight/2;
  return Array.from({length:count},()=>({x:cx+(Math.random()-0.5)*200,y:cy+(Math.random()-0.5)*100,color}));
}

const CSS = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
@keyframes shake{0%,100%{transform:translate(0)}20%{transform:translate(-6px,3px)}40%{transform:translate(6px,-3px)}60%{transform:translate(-4px,2px)}80%{transform:translate(4px,-2px)}}
@keyframes fadeIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
input,button{font-family:Georgia,serif;-webkit-appearance:none;}
`;

const HP_MAX=100;
const BG="linear-gradient(135deg,#0f0c29,#302b63,#24243e)";

function HPBar({hp,color,label}){
  return(
    <div style={{width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:11,color:"#94a3b8"}}>{label}</span>
        <span style={{fontSize:11,color:"#e2e8f0",fontWeight:"bold"}}>{hp}/{HP_MAX}</span>
      </div>
      <div style={{background:"#1e293b",borderRadius:8,height:12,overflow:"hidden",border:"1px solid #334155"}}>
        <div style={{width:`${(hp/HP_MAX)*100}%`,height:"100%",background:color,borderRadius:8,transition:"width .5s ease",boxShadow:`0 0 8px ${color}`}}/>
      </div>
    </div>
  );
}

function PassScreen({nextPlayer,color,taunt,casterName,onReady}){
  return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",color:"#e2e8f0",padding:"16px"}}>
      <div style={{textAlign:"center",width:"100%",maxWidth:400,animation:"slideUp .4s ease"}}>
        <div style={{fontSize:48,marginBottom:10}}>🔄</div>
        {taunt&&(
          <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:14,padding:"12px 16px",marginBottom:20,animation:"fadeIn .5s ease"}}>
            <p style={{fontSize:11,color:"#64748b",marginBottom:4,margin:"0 0 4px"}}>{casterName} says:</p>
            <p style={{fontSize:15,color:"#e2e8f0",fontStyle:"italic",margin:0}}>"{taunt}"</p>
          </div>
        )}
        <h2 style={{fontSize:24,margin:"0 0 8px",color}}>Hand it over!</h2>
        <p style={{color:"#94a3b8",marginBottom:6,fontSize:14,margin:"0 0 6px"}}>Pass the device to</p>
        <p style={{fontSize:26,fontWeight:"bold",color,margin:"0 0 24px"}}>{nextPlayer}</p>
        <button onClick={onReady}
          style={{padding:"14px 40px",borderRadius:12,border:`1px solid ${color}66`,background:"linear-gradient(135deg,#1e1b4b,#2e1065)",color:"#e2e8f0",fontSize:17,cursor:"pointer",boxShadow:`0 0 20px ${color}33`,width:"100%",maxWidth:280}}>
          I'm Ready ⚔️
        </button>
      </div>
    </div>
  );
}

export default function SpellDuel(){
  const [screen,setScreen]        = useState("menu");
  const [mode,setMode]            = useState("ai");
  const [difficulty,setDiff]      = useState("medium");
  const [p1name,setP1name]        = useState("Player 1");
  const [p2name,setP2name]        = useState("Player 2");
  const [letters,setLetters]      = useState([]);
  const [input,setInput]          = useState("");
  const [hp,setHp]                = useState([HP_MAX,HP_MAX]);
  const [usedWords,setUsedWords]  = useState(new Set());
  const [log,setLog]              = useState([]);
  const [round,setRound]          = useState(1);
  const [phase,setPhase]          = useState("player");
  const [timeLeft,setTimeLeft]    = useState(20);
  const [castAnim,setCastAnim]    = useState(null);
  const [winner,setWinner]        = useState(null);
  const [error,setError]          = useState("");
  const [passTo,setPassTo]        = useState("");
  const [passColor,setPassColor]  = useState("#a78bfa");
  const [passTaunt,setPassTaunt]  = useState("");
  const [passCaster,setPassCaster]= useState("");
  const [particles,setParticles]  = useState([]);
  const [shake,setShake]          = useState(false);
  const timerRef=useRef(null);
  const inputRef=useRef(null);
  const playSound=useAudio();

  const addLog=e=>setLog(l=>[e,...l].slice(0,20));

  const triggerHit=useCallback((tier)=>{
    setParticles(makeParticles(tier.glow,30+tier.rank*15));
    if(tier.rank>=3){setShake(true);setTimeout(()=>setShake(false),500);}
    playSound("hit",tier.rank);
    setTimeout(()=>setParticles([]),1500);
  },[playSound]);

  const endGame=useCallback(w=>{
    setWinner(w);setScreen("over");clearInterval(timerRef.current);
    playSound(w==="ai"||w===p2name?"defeat":"victory");
  },[playSound,p2name]);

  const doAiTurn=useCallback(()=>{
    setPhase("ai");setInput("");
    setTimeout(()=>{
      setUsedWords(prev=>{
        const word=aiPickWord(letters,prev,difficulty);
        if(word){
          const tier=spellTier(word),dmg=Math.round(tier.dmg);
          playSound("cast",tier.rank);
          setTimeout(()=>triggerHit(tier),300);
          setHp(h=>{const next=[Math.max(0,h[0]-dmg),h[1]];if(next[0]<=0)setTimeout(()=>endGame("ai"),600);return next;});
          setCastAnim({who:"ai",word,tier});
          addLog({who:"ai",name:"AI Wizard",word,tier,dmg});
          setTimeout(()=>setCastAnim(null),1200);
        } else addLog({who:"ai",name:"AI Wizard",word:null});
        const n=new Set(prev);if(word)n.add(word);return n;
      });
      setTimeout(()=>{setRound(r=>r+1);setLetters(generateLetters());setTimeLeft(20);setPhase("player");if(inputRef.current)inputRef.current.focus();},1500);
    },900);
  },[letters,difficulty,endGame,playSound,triggerHit]);

  useEffect(()=>{
    if(screen!=="game")return;
    if(phase!=="player"&&phase!=="p2")return;
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(timerRef.current);
          if(mode==="ai") doAiTurn();
          else if(phase==="player") triggerPvpPass(true);
          else advancePvpRound(true);
          return 0;
        }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[screen,phase,round,mode]);

  const triggerPvpPass=useCallback((passed=false,tier=null)=>{
    clearInterval(timerRef.current);
    setPassTo(p2name);setPassColor("#f87171");
    setPassTaunt(getTaunt(tier||{rank:0},passed));
    setPassCaster(p1name);setPhase("pass");
  },[p1name,p2name]);

  const advancePvpRound=useCallback((passed=false,tier=null)=>{
    setRound(r=>r+1);setLetters(generateLetters());
    setPassTo(p1name);setPassColor("#a78bfa");
    setPassTaunt(getTaunt(tier||{rank:0},passed));
    setPassCaster(p2name);setPhase("pass");
  },[p1name,p2name]);

  const onPassReady=()=>{
    if(passTo===p2name){setPhase("p2");setInput("");setTimeLeft(20);setTimeout(()=>inputRef.current&&inputRef.current.focus(),100);}
    else{setPhase("player");setInput("");setTimeLeft(20);setTimeout(()=>inputRef.current&&inputRef.current.focus(),100);}
  };

  const submitWord=(isP2=false)=>{
    const word=input.trim().toLowerCase();
    setError("");
    const defender=isP2?0:1;
    if(!word){
      clearInterval(timerRef.current);
      if(mode==="ai") doAiTurn();
      else if(!isP2) triggerPvpPass(true);
      else advancePvpRound(true);
      return;
    }
    if(word.length<3){setError("Too short! Min 3 letters.");return;}
    if(!canMakeWord(word,letters)){setError("Can't make that from these letters!");return;}
    if(!WORD_SET.has(word)){setError("Not a valid word!");return;}
    if(usedWords.has(word)){setError("Already used!");return;}
    clearInterval(timerRef.current);
    const tier=spellTier(word),dmg=Math.round(tier.dmg);
    playSound("cast",tier.rank);
    setTimeout(()=>triggerHit(tier),300);
    setUsedWords(prev=>new Set([...prev,word]));
    setHp(h=>{const n=[...h];n[defender]=Math.max(0,h[defender]-dmg);if(n[defender]<=0)setTimeout(()=>endGame(isP2?p2name:p1name),600);return n;});
    setCastAnim({who:isP2?"p2":"p1",word,tier});
    addLog({who:isP2?"p2":"p1",name:isP2?p2name:p1name,word,tier,dmg});
    setTimeout(()=>setCastAnim(null),1200);
    setInput("");
    if(mode==="ai") doAiTurn();
    else if(!isP2) triggerPvpPass(false,tier);
    else advancePvpRound(false,tier);
  };

  const startGame=()=>{
    setHp([HP_MAX,HP_MAX]);setUsedWords(new Set());setLog([]);setRound(1);
    setLetters(generateLetters());setInput("");setCastAnim(null);setWinner(null);setError("");
    setParticles([]);setShake(false);
    if(mode==="pvp"){setPhase("pass");setPassTo(p1name);setPassColor("#a78bfa");setPassTaunt("");setPassCaster("");}
    else{setPhase("player");setTimeLeft(20);}
    setScreen("game");
    playSound("ambient");
  };

  const isP2Turn=phase==="p2";
  const curColor=isP2Turn?"#f87171":"#a78bfa";
  const curName=isP2Turn?p2name:p1name;

  if(screen==="game"&&phase==="pass")
    return <PassScreen nextPlayer={passTo} color={passColor} taunt={passTaunt} casterName={passCaster} onReady={onPassReady}/>;

  // ── MENU ──
  if(screen==="menu") return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",color:"#e2e8f0",padding:"16px"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:420,textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:4}}>⚔️</div>
        <h1 style={{fontSize:"clamp(28px,8vw,40px)",fontWeight:"bold",margin:"0 0 6px",background:"linear-gradient(90deg,#c084fc,#60a5fa,#f59e0b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Spell Duel</h1>
        <p style={{color:"#94a3b8",marginBottom:24,fontSize:"clamp(13px,3.5vw,15px)"}}>Forge words. Cast spells. Defeat your foe.</p>

        <p style={{color:"#cbd5e1",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>Game Mode</p>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          {[["ai","🤖 vs AI"],["pvp","👥 vs Friend"]].map(([m,label])=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"11px 0",borderRadius:12,border:`1px solid ${mode===m?"#7c3aed":"#334155"}`,background:mode===m?"linear-gradient(135deg,#4c1d95,#2e1065)":"linear-gradient(135deg,#1e293b,#0f172a)",color:mode===m?"#e2e8f0":"#64748b",fontSize:"clamp(13px,3.5vw,15px)",cursor:"pointer",transition:"all .2s"}}>{label}</button>
          ))}
        </div>

        {mode==="pvp"&&(
          <div style={{marginBottom:16,textAlign:"left"}}>
            <p style={{color:"#cbd5e1",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1,textAlign:"center"}}>Wizard Names</p>
            {[[p1name,setP1name,"#a78bfa"],[p2name,setP2name,"#f87171"]].map(([val,set,col],idx)=>(
              <input key={idx} value={val} onChange={e=>set(e.target.value)} placeholder={`Wizard ${idx+1}`} maxLength={16}
                style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"#0f172a",border:`1px solid ${col}44`,color:"#e2e8f0",fontSize:15,marginBottom:8,fontFamily:"inherit",outline:"none"}}/>
            ))}
          </div>
        )}

        {mode==="ai"&&(
          <>
            <p style={{color:"#cbd5e1",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>Difficulty</p>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {[["easy","🌿 Apprentice"],["medium","🔮 Mage"],["hard","⚡ Archmage"]].map(([d,label])=>(
                <button key={d} onClick={()=>setDiff(d)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`1px solid ${difficulty===d?"#7c3aed":"#334155"}`,background:difficulty===d?"linear-gradient(135deg,#4c1d95,#2e1065)":"linear-gradient(135deg,#1e293b,#0f172a)",color:difficulty===d?"#e2e8f0":"#64748b",fontSize:"clamp(10px,2.8vw,12px)",cursor:"pointer",transition:"all .2s"}}>{label}</button>
              ))}
            </div>
          </>
        )}

        <button onClick={startGame} style={{width:"100%",padding:"14px 0",borderRadius:12,border:"1px solid #4c1d95",background:"linear-gradient(135deg,#1e1b4b,#2e1065)",color:"#e2e8f0",fontSize:"clamp(15px,4vw,18px)",cursor:"pointer",boxShadow:"0 0 16px #7c3aed44"}}>Begin Duel ⚔️</button>
        <p style={{color:"#475569",fontSize:11,marginTop:16}}>Form words from letters • Longer = stronger spells • 20s per turn</p>
      </div>
    </div>
  );

  // ── GAME OVER ──
  if(screen==="over") return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",color:"#e2e8f0",padding:"16px"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",width:"100%",maxWidth:400,animation:"slideUp .5s ease"}}>
        <div style={{fontSize:64}}>{winner===p1name||winner==="player"?"🏆":"💀"}</div>
        <h2 style={{fontSize:"clamp(24px,7vw,36px)",margin:"10px 0 8px",color:"#f59e0b"}}>
          {mode==="pvp"?`${winner} wins!`:winner==="player"?"Victory!":"Defeated!"}
        </h2>
        <p style={{color:"#94a3b8",marginBottom:6,fontSize:14}}>
          {mode==="pvp"?`${winner} is the mightier wizard!`:winner==="player"?"The AI crumbles before you!":"The AI wizard bested you..."}
        </p>
        <p style={{color:"#64748b",fontSize:13,marginBottom:24}}>Survived {round} rounds</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>setScreen("menu")} style={{flex:1,maxWidth:140,padding:"12px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",fontSize:15,cursor:"pointer"}}>Menu</button>
          <button onClick={startGame} style={{flex:1,maxWidth:140,padding:"12px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#065f46,#047857)",color:"#fff",fontSize:15,cursor:"pointer"}}>Play Again</button>
        </div>
      </div>
    </div>
  );

  // ── GAME ──
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",color:"#e2e8f0",padding:"12px 10px 20px",animation:shake?"shake .5s ease":"none"}}>
      <style>{CSS}</style>
      <ParticleCanvas particles={particles}/>

      {/* Exit */}
      <div style={{position:"fixed",top:12,right:12,zIndex:999}}>
        <button onClick={()=>setScreen("menu")} style={{padding:"6px 12px",borderRadius:10,border:"1px solid #334155",background:"#0f172aee",color:"#94a3b8",fontSize:16,cursor:"pointer"}}>✕</button>
      </div>

      <div style={{maxWidth:540,margin:"0 auto"}}>
        {/* Round + turn */}
        <div style={{textAlign:"center",marginBottom:10,paddingTop:2}}>
          <span style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:2}}>Round {round}</span>
          {mode==="pvp"&&<span style={{marginLeft:10,fontSize:12,color:curColor,fontWeight:"bold"}}>{curName}'s turn</span>}
        </div>

        {/* HP Bars */}
        <div style={{background:"#0f172a99",borderRadius:14,padding:"12px 14px",marginBottom:10,border:"1px solid #1e293b",display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,flexWrap:"wrap"}}>
              <span style={{fontSize:18}}>🧙</span>
              <span style={{fontSize:"clamp(11px,3vw,13px)",fontWeight:"bold",color:"#a78bfa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80px"}}>{mode==="pvp"?p1name:"You"}</span>
              {mode==="pvp"&&phase==="player"&&<span style={{fontSize:9,color:"#a78bfa",background:"#4c1d9555",borderRadius:5,padding:"1px 5px",whiteSpace:"nowrap"}}>YOUR TURN</span>}
            </div>
            <HPBar hp={hp[0]} color="#a78bfa" label="HP"/>
          </div>
          <div style={{width:1,background:"#1e293b",alignSelf:"stretch"}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,justifyContent:"flex-end",flexWrap:"wrap"}}>
              {mode==="pvp"&&phase==="p2"&&<span style={{fontSize:9,color:"#f87171",background:"#7f1d1d55",borderRadius:5,padding:"1px 5px",whiteSpace:"nowrap"}}>YOUR TURN</span>}
              <span style={{fontSize:"clamp(11px,3vw,13px)",fontWeight:"bold",color:"#f87171",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80px"}}>{mode==="pvp"?p2name:"AI Wizard"}</span>
              <span style={{fontSize:18}}>{mode==="pvp"?"🧙‍♀️":"🧟"}</span>
            </div>
            <HPBar hp={hp[1]} color="#f87171" label="HP"/>
          </div>
        </div>

        {/* Cast anim */}
        <div style={{minHeight:48,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
          {castAnim&&(
            <div style={{textAlign:"center",animation:"fadeIn .3s",padding:"7px 14px",borderRadius:20,border:`1px solid ${castAnim.tier.color}`,background:`${castAnim.tier.color}22`,boxShadow:`0 0 20px ${castAnim.tier.glow}55`,maxWidth:"100%"}}>
              <span style={{color:castAnim.tier.color,fontWeight:"bold",fontSize:"clamp(12px,3vw,14px)"}}>
                {castAnim.tier.emoji} {castAnim.who==="ai"?"AI":castAnim.who==="p2"?p2name:mode==="pvp"?p1name:"You"} cast <b style={{textTransform:"uppercase"}}>"{castAnim.word}"</b> — {castAnim.tier.name}! <span style={{color:"#f87171"}}>-{Math.round(castAnim.tier.dmg)} HP</span>
              </span>
            </div>
          )}
        </div>

        {/* Letters */}
        <div style={{background:"#0f172a99",borderRadius:14,padding:"14px 12px",marginBottom:10,border:"1px solid #1e293b",textAlign:"center"}}>
          <p style={{fontSize:10,color:"#475569",marginBottom:8,textTransform:"uppercase",letterSpacing:2}}>Available Letters</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
            {letters.map((l,i)=>(
              <div key={i} onClick={()=>(phase==="player"||phase==="p2")&&setInput(inp=>inp+l)}
                style={{width:"clamp(36px,9vw,44px)",height:"clamp(36px,9vw,44px)",borderRadius:10,background:"linear-gradient(135deg,#1e1b4b,#312e81)",border:"1px solid #4338ca",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(16px,4.5vw,20px)",fontWeight:"bold",color:"#c7d2fe",cursor:(phase==="player"||phase==="p2")?"pointer":"default",textTransform:"uppercase",userSelect:"none",boxShadow:"0 0 8px #4f46e533",transition:"transform .1s",touchAction:"manipulation"}}
                onPointerDown={e=>{e.currentTarget.style.transform="scale(.88)";}}
                onPointerUp={e=>{e.currentTarget.style.transform="scale(1)";}}
              >{l}</div>
            ))}
          </div>
        </div>

        {/* Input */}
        {(phase==="player"||phase==="p2")&&(
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",gap:6,marginBottom:5}}>
              <input ref={inputRef} value={input}
                onChange={e=>{setInput(e.target.value.toLowerCase().replace(/[^a-z]/g,""));setError("");}}
                onKeyDown={e=>e.key==="Enter"&&submitWord(isP2Turn)}
                placeholder="Type your spell..."
                autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck="false"
                style={{flex:1,padding:"11px 12px",borderRadius:10,background:"#0f172a",border:`1px solid ${curColor}88`,color:"#e2e8f0",fontSize:"clamp(14px,4vw,17px)",outline:"none",letterSpacing:2,textTransform:"uppercase",minWidth:0}}/>
              <button onClick={()=>submitWord(isP2Turn)}
                style={{padding:"11px 14px",borderRadius:10,border:"none",background:isP2Turn?"linear-gradient(135deg,#7f1d1d,#b91c1c)":"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",fontSize:"clamp(12px,3.5vw,14px)",cursor:"pointer",whiteSpace:"nowrap",touchAction:"manipulation"}}>Cast ✨</button>
              <button onClick={()=>setInput("")}
                style={{padding:"11px 10px",borderRadius:10,border:"1px solid #334155",background:"transparent",color:"#94a3b8",fontSize:13,cursor:"pointer",touchAction:"manipulation"}}>✕</button>
            </div>
            {error&&<p style={{color:"#f87171",fontSize:12,margin:"2px 0 0 2px"}}>⚠ {error}</p>}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{fontSize:11,color:"#475569"}}>Tap letters or type • Empty = pass</span>
              <span style={{fontSize:12,color:timeLeft<=5?"#f87171":"#94a3b8",fontWeight:timeLeft<=5?"bold":"normal"}}>⏱ {timeLeft}s</span>
            </div>
          </div>
        )}
        {phase==="ai"&&<div style={{textAlign:"center",padding:"12px 0",color:"#94a3b8",fontSize:14}}>🧟 AI Wizard is conjuring...</div>}

        {/* Log */}
        <div style={{background:"#0f172a99",borderRadius:14,padding:"12px 14px",border:"1px solid #1e293b",maxHeight:120,overflowY:"auto"}}>
          <p style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Battle Log</p>
          {log.length===0&&<p style={{color:"#334155",fontSize:12}}>The duel begins...</p>}
          {log.map((e,i)=>(
            <div key={i} style={{fontSize:"clamp(11px,3vw,13px)",color:i===0?"#e2e8f0":"#475569",marginBottom:3}}>
              {e.word
                ?<span><span style={{color:e.who==="p2"?"#f87171":"#a78bfa"}}>{e.name}</span> cast <b style={{color:e.tier.color}}>{e.word.toUpperCase()}</b> ({e.tier.name}) → <span style={{color:"#f87171"}}>-{e.dmg} HP</span></span>
                :<span style={{color:"#334155"}}>{e.name} passed</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}