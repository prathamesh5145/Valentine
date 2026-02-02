const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");
const zone = document.getElementById("zone");
const hint = document.getElementById("hint");

const fxCanvas = document.getElementById("fxCanvas");
const confettiInstance = confetti.create(fxCanvas, { resize: true });

/* Confetti */
function fireConfetti(){
  confettiInstance({ particleCount: 200, spread: 120, startVelocity: 60 });
}

/* Grow YES */
let yesScale = 1;
function growYes(){
  yesScale = Math.min(2.2, yesScale + 0.12);
  yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
}

/* Move NO away */
function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }

function hopNo(px,py){
  const z = zone.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();

  const dx=(b.left+b.width/2)-px;
  const dy=(b.top+b.height/2)-py;
  const mag=Math.hypot(dx,dy)||1;

  const ndx=dx/mag;
  const ndy=dy/mag;

  let newL=(b.left-z.left)+ndx*160;
  let newT=(b.top-z.top)+ndy*160;

  newL=clamp(newL,0,z.width-b.width);
  newT=clamp(newT,0,z.height-b.height);

  noBtn.style.left=newL+"px";
  noBtn.style.top=newT+"px";

  growYes();
}

zone.addEventListener("pointermove",e=>{
  const b=noBtn.getBoundingClientRect();
  const d=Math.hypot((b.left+b.width/2)-e.clientX,(b.top+b.height/2)-e.clientY);
  if(d<150) hopNo(e.clientX,e.clientY);
});

noBtn.addEventListener("click",e=>e.preventDefault());

yesBtn.addEventListener("click",()=>{
  zone.style.display="none";
  hint.style.display="none";
  result.style.display="block";
  fireConfetti();
});
