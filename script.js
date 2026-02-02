:root{
  --bgA:#fff1f7;
  --bgB:#eef9f2;
  --paper:#ffffffc7;
  --ink:#1c2b23;
  --hot:#ff1466;
  --blush:#ff7aa2;
}

/* 🔥 GLOBAL SCALE = 50% ZOOM */
body{
  transform: scale(0.55);
  transform-origin: top center;
  height: 200vh; /* ensures full scroll area */
  background: linear-gradient(135deg, var(--bgA), var(--bgB));
  margin:0;
  overflow-x:hidden;
}

/* center stage */
.stage{
  display:flex;
  justify-content:center;
  padding-top:40px;
}

.card{
  width: 1400px;
  background: var(--paper);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,.15);
}

.frame{ 
  padding:14px; 
}

.frameInner{
  background:white;
  border-radius:20px;
  padding:10px;
}

.frog{
  width:100%;
  display:block;
}

/* ⭐ Anime FX */
.animeBob{
  animation: bob 3s ease-in-out infinite;
}
@keyframes bob{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-6px); }
}

.blinkEyes circle:nth-child(1),
.blinkEyes circle:nth-child(2){
  animation: blink 6s infinite;
}
@keyframes blink{
  0%,92%,100%{ transform: scaleY(1); }
  95%{ transform: scaleY(0.1); }
}

.blushPulse{
  animation: blush 2.5s ease-in-out infinite;
}
@keyframes blush{
  0%,100%{ opacity:.35; }
  50%{ opacity:.55; }
}

.animePulse{
  animation: pulse 2.2s ease-in-out infinite;
}
@keyframes pulse{
  0%,100%{ transform: scale(1); }
  50%{ transform: scale(1.06); }
}

/* Buttons */
.buttonZone{
  margin-top:30px;
  position:relative;
  height:160px;
}

.btn{
  position:absolute;
  padding:18px 34px;
  border:none;
  border-radius:40px;
  font-weight:800;
  font-size:24px;
  cursor:pointer;
}

.yes{
  background: var(--hot);
  color:white;
  left:20%;
}

.no{
  background:#fff;
  border:1px solid #ccc;
  left:60%;
}

.hint{
  text-align:center;
  margin-top:80px;
  font-size:20px;
}

/* result */
.result{
  display:none;
  text-align:center;
  margin-top:30px;
}

.centerGif{
  display:block;
  margin:0 auto;
  width:420px;
  border-radius:20px;
}
