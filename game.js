// Snake — Letter Quest (final) - letters stick to tail forever
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cell = 24;
const cols = canvas.width / cell;
const rows = canvas.height / cell;

// sequence to collect
const sequence = ['A','Y','O','U','B','-','D','E','R','R','E','C','H','E'];
let seqIndex = 0;

const nextLetterEl = document.getElementById('nextLetter');
const lenEl = document.getElementById('len');
const winOverlay = document.getElementById('winOverlay');

nextLetterEl.textContent = sequence[seqIndex];

// snake segments: each has x,y,char (char null means plain segment)
let snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2), char: null}];
let dir = {x:1,y:0};
let pendingDir = null;
let targetPos = null;
let running = true;
let speed = 8;

// place target (letter or star)
function placeTarget(){
  while(true){
    const x = Math.floor(Math.random()*cols);
    const y = Math.floor(Math.random()*rows);
    if(!snake.some(s=>s.x===x && s.y===y)){
      targetPos = {x,y};
      break;
    }
  }
}
placeTarget();

function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  ctx.fill();
}

// draw star
function drawStar(cx,cy,r){
  ctx.beginPath();
  for(let i=0;i<5;i++){
    ctx.lineTo(cx + r * Math.cos((18 + i*72)*Math.PI/180), cy - r * Math.sin((18 + i*72)*Math.PI/180));
    ctx.lineTo(cx + (r/2.5) * Math.cos((54 + i*72)*Math.PI/180), cy - (r/2.5) * Math.sin((54 + i*72)*Math.PI/180));
  }
  ctx.closePath();
  ctx.fill();
}

function draw(){
  // background warm checker
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      ctx.fillStyle = (c%2===0) ? '#fff3e0' : '#ffe8cc';
      ctx.fillRect(c*cell, r*cell, cell, cell);
    }
  }
  // subtle grid
  ctx.strokeStyle = 'rgba(0,0,0,0.03)';
  for(let i=0;i<=cols;i++){ ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,canvas.height); ctx.stroke(); }
  for(let i=0;i<=rows;i++){ ctx.beginPath(); ctx.moveTo(0,i*cell); ctx.lineTo(canvas.width,i*cell); ctx.stroke(); }

  // draw target
  if(seqIndex < sequence.length){
    ctx.fillStyle = '#ffd166';
    roundRect(targetPos.x*cell + 4, targetPos.y*cell + 4, cell-8, cell-8, 6);
    ctx.fillStyle = '#5b3b23';
    ctx.font = (cell-10) + 'px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sequence[seqIndex], targetPos.x*cell + cell/2, targetPos.y*cell + cell/2 + 1);
  } else {
    ctx.fillStyle = '#ffd54a';
    drawStar(targetPos.x*cell + cell/2, targetPos.y*cell + cell/2, cell/2 - 6);
  }

  // draw snake
  for(let i=0;i<snake.length;i++){
    const seg = snake[i];
    const isHead = (i === snake.length - 1);
    ctx.fillStyle = isHead ? '#4b3832' : '#7b5a45';
    roundRect(seg.x*cell + 3, seg.y*cell + 3, cell-6, cell-6, 5);
    if(seg.char){
      ctx.fillStyle = '#fff8e7';
      ctx.font = (cell-12) + 'px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(seg.char, seg.x*cell + cell/2, seg.y*cell + cell/2 + 1);
      if(isHead){
        ctx.fillStyle = '#fff8e7';
        ctx.fillRect(seg.x*cell + cell - 9, seg.y*cell + 6, 4, 4);
      }
    } else {
      if(isHead){
        ctx.fillStyle = '#fff8e7';
        ctx.fillRect(seg.x*cell + cell - 9, seg.y*cell + 6, 4, 4);
      }
    }
  }
}

function step(){
  if(!running) return;

  if(pendingDir){
    if(!(pendingDir.x === -dir.x && pendingDir.y === -dir.y)){
      dir = pendingDir;
    }
    pendingDir = null;
  }

  const head = { x: snake[snake.length-1].x + dir.x, y: snake[snake.length-1].y + dir.y, char: null };

  // wrap
  if(head.x < 0) head.x = cols-1;
  if(head.x >= cols) head.x = 0;
  if(head.y < 0) head.y = rows-1;
  if(head.y >= rows) head.y = 0;

  // self collision
  if(snake.some(seg => seg.x === head.x && seg.y === head.y)){
    running = false;
    // show game over text on overlay area
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff8e7';
    ctx.font = '26px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER! You collided with yourself.', canvas.width/2, canvas.height/2);
    return;
  }

  // push head
  snake.push(head);

  // eating target
  if(head.x === targetPos.x && head.y === targetPos.y){
    if(seqIndex < sequence.length){
      // assign char to head so it stays visible forever on that segment
      snake[snake.length-1].char = sequence[seqIndex];
      seqIndex++;
      lenEl.textContent = snake.length;
      if(seqIndex < sequence.length){
        placeTarget();
        nextLetterEl.textContent = sequence[seqIndex];
      } else {
        // spawn star
        placeTarget();
        nextLetterEl.textContent = '★';
      }
    } else {
      // star eaten -> win
      running = false;
      // draw final state then show YOU WIN centered
      draw();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      winOverlay.classList.remove('hidden');
      return;
    }
    // important: do NOT remove tail here -> snake grows and letter remains
  } else {
    // normal move: remove tail only if tail has no permanent letter.
    // if tail.char exists, do not remove it (letters stick forever)
    const tail = snake.shift();
    if(tail && tail.char){
      // if the removed tail had a char, put it back at beginning to preserve it
      snake.unshift(tail);
      // This effectively prevents removing any segment that has a letter,
      // making collected letters permanent parts of the snake.
    }
  }

  // speed scaling
  speed = 8 + Math.floor(snake.length / 3);

  draw();
}

// input
document.addEventListener('keydown', e => {
  if(e.key === 'ArrowUp' || e.key === 'w'){ pendingDir = {x:0,y:-1}; }
  if(e.key === 'ArrowDown' || e.key === 's'){ pendingDir = {x:0,y:1}; }
  if(e.key === 'ArrowLeft' || e.key === 'a'){ pendingDir = {x:-1,y:0}; }
  if(e.key === 'ArrowRight' || e.key === 'd'){ pendingDir = {x:1,y:0}; }
});

// mobile controls
document.getElementById('up').addEventListener('click', ()=>{ pendingDir = {x:0,y:-1}; });
document.getElementById('down').addEventListener('click', ()=>{ pendingDir = {x:0,y:1}; });
document.getElementById('left').addEventListener('click', ()=>{ pendingDir = {x:-1,y:0}; });
document.getElementById('right').addEventListener('click', ()=>{ pendingDir = {x:1,y:0}; });

if(window.innerWidth < 600) document.getElementById('controls').classList.remove('hidden');

let lastTime = performance.now();
function mainLoop(now){
  const delta = now - lastTime;
  const interval = 1000 / speed;
  if(delta >= interval){
    lastTime = now - (delta % interval);
    step();
  }
  if(running) requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);
