// app.js - Final Platform Jumper with double-jump & tall TNTs
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const modeBtns = Array.from(document.querySelectorAll('.modeBtn'));
const countdownEl = document.getElementById('countdown');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartBtn = document.getElementById('restartBtn');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const scoresDisplay = document.getElementById('scoresDisplay');

const playerImg = new Image(); playerImg.src = 'player.png';
const tntImg = new Image(); tntImg.src = 'tnt.png';

let gameLoop = null;
let stars = [];
let obstacles = [];
let score = 0;
let obstacleTimer = 0;
const GROUND = 355;
let gameSpeed = 5, spawnRate = 70, currentMode = 'medium';
let isGameOverAnimation = false, rotation = 0;

// double-jump control
const MAX_JUMPS = 2;
let jumpsLeft = MAX_JUMPS;

const player = { x:70, y:300, width:60, height:55, dy:0, jumpForce:15, gravity:1, isJumping:false, hitOffsetX:8, hitOffsetY:10 };

// persistent highscores
let highScores = JSON.parse(localStorage.getItem('pj_highscores_v1')) || { easy:0, medium:0, hard:0 };

function initCanvas(){ canvas.width=800; canvas.height=400; initStars(); }

function initStars(){ stars=[]; for(let i=0;i<70;i++){ stars.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height*0.9, size:Math.random()*2+0.6, speed:Math.random()*0.6+0.08 }); } }

function createAudioCtx(){ try{ return new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return null; } }
function playTone(freq,dur,type='sine'){ const C=createAudioCtx(); if(!C) return; const o=C.createOscillator(); const g=C.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(C.destination); g.gain.setValueAtTime(0.18,C.currentTime); o.start(); g.gain.exponentialRampToValueAtTime(0.0001,C.currentTime+dur); o.stop(C.currentTime+dur+0.02); }
function playJump(){ playTone(520,0.12,'sine'); }
function playDodge(){ playTone(980,0.08,'triangle'); }
function playExplosion(){ playTone(120,0.45,'sawtooth'); }

// mode buttons
modeBtns.forEach(b=>{ b.addEventListener('click', ()=>{ modeBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentMode=b.dataset.mode; }); });

function applyMode(){ if(currentMode==='easy'){ gameSpeed=3; spawnRate=110; } else if(currentMode==='medium'){ gameSpeed=5; spawnRate=70; } else { gameSpeed=7; spawnRate=45; } }

// visible countdown (3,2,1,GO)
function startCountdownAndGame(){
  applyMode();
  let count=3;
  countdownEl.setAttribute('aria-hidden','false');
  countdownEl.textContent = count;
  countdownEl.style.display='block';
  const t = setInterval(()=>{
    count--;
    if(count>0){ countdownEl.textContent = count; }
    else if(count===0){ countdownEl.textContent = 'GO!'; }
    else { clearInterval(t); countdownEl.style.display='none'; startGame(); }
  },900);
}

startBtn.addEventListener('click', ()=> startCountdownAndGame() );
restartBtn.addEventListener('click', ()=> location.reload() );

function startGame(){
  if(gameLoop) clearInterval(gameLoop);
  startScreen.style.display='none';
  gameOverScreen.style.display='none';
  canvas.style.display='block';
  initCanvas();
  resetGame();
  gameLoop = setInterval(update,30);
}

function resetGame(){ player.y=300; player.dy=0; player.isJumping=false; jumpsLeft=MAX_JUMPS; obstacles=[]; score=0; obstacleTimer=0; isGameOverAnimation=false; rotation=0; }

// double jump logic on Space
document.addEventListener('keydown', (e)=>{
  if(e.code==='Space' && jumpsLeft>0 && !isGameOverAnimation && gameLoop!==null){
    playJump();
    player.dy = -player.jumpForce;
    player.isJumping = true;
    jumpsLeft--;
  }
});

// reset jumps when player lands
function checkLanding(){ if(player.y + player.height >= GROUND){ player.y = GROUND - player.height; player.isJumping=false; jumpsLeft = MAX_JUMPS; } }

// create obstacle; sometimes tall (stacked)
function createObstacle(){
  // 20% chance to create tall obstacle (stacked TNT)
  if(Math.random() < 0.2){
    // tall: two parts
    obstacles.push({ x: canvas.width + 20, parts:[ {y: 235}, {y:295} ], width:65, height:65, hitOffsetX:10, hitOffsetY:10, tall:true });
  } else {
    obstacles.push({ x: canvas.width + 20, y:295, width:65, height:65, hitOffsetX:10, hitOffsetY:10, tall:false });
  }
}

// collision: check against single or tall parts
function checkCollision(a,b){
  if(b.tall){
    for(let p of b.parts){
      const rect = { x:b.x, y:p.y, width:b.width, height:b.height, hitOffsetX:b.hitOffsetX, hitOffsetY:b.hitOffsetY };
      if( rectCollision(a, rect) ) return true;
    }
    return false;
  } else {
    return rectCollision(a, b);
  }
}

function rectCollision(a,b){
  return ( a.x + a.hitOffsetX < b.x + b.width - b.hitOffsetX &&
           a.x + a.width - a.hitOffsetX > b.x + b.hitOffsetX &&
           a.y + a.hitOffsetY < b.y + b.height - b.hitOffsetY &&
           a.y + a.height - a.hitOffsetY > b.y + b.hitOffsetY );
}

// draw stars
function drawStars(){ ctx.fillStyle='white'; for(let s of stars){ ctx.globalAlpha=0.85; ctx.fillRect(s.x,s.y,s.size,s.size); s.x -= s.speed; if(s.x < -5) { s.x = canvas.width + 5; s.y = Math.random()*canvas.height*0.7; s.speed = Math.random()*0.6+0.08; } } ctx.globalAlpha=1; }

// update loop
function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawStars();
  // ground
  ctx.fillStyle = '#1e2250';
  ctx.fillRect(0, GROUND, canvas.width, 6);

  // physics
  if(isGameOverAnimation){
    // fall animation: accelerated, rotate
    player.dy += player.gravity * 1.8;
    player.y += player.dy;
    rotation += 0.08;
  } else {
    player.dy += player.gravity;
    player.y += player.dy;
    checkLanding();
  }

  // draw player with rotation if animating
  if(isGameOverAnimation){
    ctx.save();
    const cx = player.x + player.width/2;
    const cy = player.y + player.height/2;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.drawImage(playerImg, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();
  } else {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  }

  // spawn obstacles
  obstacleTimer++;
  if(obstacleTimer > spawnRate){ obstacleTimer = 0; createObstacle(); }

  // move & draw obstacles (handle tall ones)
  for(let i = obstacles.length - 1; i >= 0; i--){
    const obs = obstacles[i];
    obs.x -= gameSpeed;
    if(obs.tall){
      // draw two parts
      for(let p of obs.parts){
        ctx.drawImage(tntImg, obs.x, p.y, obs.width, obs.height);
      }
    } else {
      ctx.drawImage(tntImg, obs.x, obs.y, obs.width, obs.height);
    }

    if(obs.x + obs.width < 0){ playDodge(); obstacles.splice(i,1); continue; }
    if(checkCollision(player, obs)) return handleGameOver();
  }

  // score & HI (T-Rex style)
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, canvas.width - 180, 30);
  const hi = highScores[currentMode] || 0;
  const hiText = 'HI ' + String(hi).padStart(5,'0');
  ctx.fillText(hiText, canvas.width - 320, 30);

  score++;
}

// handle game over with animation and highscores
function handleGameOver(){
  if(gameLoop) clearInterval(gameLoop);
  playExplosion();
  document.body.classList.add('flash');
  setTimeout(()=>document.body.classList.remove('flash'), 280);

  // start fall animation
  isGameOverAnimation = true;
  player.dy = -6;
  rotation = 0;

  // update persistent highscore
  if(score > (highScores[currentMode] || 0)){
    highScores[currentMode] = score;
    localStorage.setItem('pj_highscores_v1', JSON.stringify(highScores));
  }

  // after animation show game over screen
  setTimeout(()=>{
    isGameOverAnimation = false;
    canvas.style.display = 'none';
    finalScoreEl.textContent = 'Your Score: ' + score;
    bestScoreEl.textContent = '🏆 Highscore (' + currentMode.toUpperCase() + '): ' + highScores[currentMode];
    scoresDisplay.innerHTML = '';
    ['easy','medium','hard'].forEach(m=>{
      const b = document.createElement('div'); b.className='scoreBadge'; b.textContent = m.toUpperCase() + ': ' + (highScores[m]||0);
      scoresDisplay.appendChild(b);
    });
    gameOverScreen.style.display = 'block';
  }, 900);
}

// initial state
startScreen.style.display = 'block';
gameOverScreen.style.display = 'none';
canvas.style.display = 'none';
initCanvas();
