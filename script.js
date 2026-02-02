/* ========= HEARTS PARTICLE ENGINE ========= */

const canvas = document.getElementById("heartCanvas")
const ctx = canvas.getContext("2d")

let W, H
let hearts = []
const HEART_COUNT = 85

function resize(){
  W = canvas.width = window.innerWidth
  H = canvas.height = window.innerHeight
}
resize()
window.onresize = resize

function spawnHeart(){
  return {
    x: Math.random()*W,
    y: Math.random()*H,
    size: 8 + Math.random()*14,
    vx: (Math.random()*2 - 1) * 0.8,
    vy: (Math.random()*2 - 1) * 0.8,
    life: 1,
    decay: 0.005 + Math.random()*0.01
  }
}

for(let i=0;i<HEART_COUNT;i++){
  hearts.push(spawnHeart())
}

function drawHeart(x, y, s, a){
  ctx.save()
  ctx.translate(x,y)
  ctx.scale(s,s)
  ctx.beginPath()
  ctx.globalAlpha = a

  ctx.moveTo(0,0)
  ctx.bezierCurveTo(-1,-1.5, -2,-0.2, -2,0.8)
  ctx.bezierCurveTo(-2,2, 0,3.2, 0,4)
  ctx.bezierCurveTo(0,3.2, 2,2, 2,0.8)
  ctx.bezierCurveTo(2,-0.2, 1,-1.5, 0,0)
  ctx.fillStyle = "#ff4f8b"
  ctx.fill()

  ctx.restore()
}

function update(){
  ctx.clearRect(0,0,W,H)

  for(let i=0;i<hearts.length;i++){
    let h = hearts[i]

    h.x += h.vx
    h.y += h.vy
    h.life -= h.decay

    if(h.life <= 0){
      hearts[i] = spawnHeart()
      continue
    }

    drawHeart(h.x, h.y, h.size*0.12, h.life)
  }

  requestAnimationFrame(update)
}
update()


/* ===== BUTTON LOGIC ===== */

const yesBtn = document.getElementById("yesBtn")
const noBtn = document.getElementById("noBtn")
const zone = document.getElementById("zone")
const result = document.getElementById("result")
const hint = document.getElementById("hint")

/* Move NO */
function hop(e){
  const z = zone.getBoundingClientRect()
  const b = noBtn.getBoundingClientRect()

  const dx = (b.left+b.width/2)-e.clientX
  const dy = (b.top+b.height/2)-e.clientY
  const mag = Math.hypot(dx,dy)||1

  const ndx = dx/mag
  const ndy = dy/mag

  let newL = (b.left-z.left)+ndx*180
  let newT = (b.top-z.top)+ndy*180

  newL = Math.max(0, Math.min(z.width-b.width, newL))
  newT = Math.max(0, Math.min(z.height-b.height, newT))

  noBtn.style.left = newL+"px"
  noBtn.style.top = newT+"px"
}

zone.addEventListener("pointermove", e=>{
  const b=noBtn.getBoundingClientRect()
  if(Math.hypot((b.left+b.width/2)-e.clientX,(b.top+b.height/2)-e.clientY) < 160){
    hop(e)
  }
})

noBtn.onclick = e => e.preventDefault()

yesBtn.onclick = () =>{
  zone.style.display="none"
  hint.style.display="none"
  result.style.display="block"
}
