
window.Pinball = (function(){
  let canvas,ctx,ball,flippers,anim,bumpers,scoreEl,score=0;
  function init(id){
    canvas=document.getElementById(id); ctx=canvas.getContext('2d');
    scoreEl=document.getElementById('pinScore');
    resize(); window.addEventListener('resize', resize);
    ball={x:canvas.width/2,y:50,vx:2,vy:0,r:8};
    flippers=[{x:canvas.width*0.35,y:canvas.height-40,angle:0,side:-1},
              {x:canvas.width*0.65,y:canvas.height-40,angle:0,side:1}];
    bumpers=[{x:canvas.width*0.3,y:140,r:14},{x:canvas.width*0.5,y:100,r:18},{x:canvas.width*0.7,y:160,r:14}];
    canvas.addEventListener('pointerdown',e=>{ flippers.forEach(f=>f.angle=0.7*f.side); navigator.vibrate&&navigator.vibrate(10); });
    canvas.addEventListener('pointerup',e=>{ flippers.forEach(f=>f.angle=0); });
    loop();
  }
  function resize(){ canvas.width=window.innerWidth-20; canvas.height=320; }
  function physics(){
    ball.vy+=0.35; ball.x+=ball.vx; ball.y+=ball.vy;
    if(ball.x<ball.r||ball.x>canvas.width-ball.r) ball.vx*=-1;
    if(ball.y<ball.r){ ball.vy*=-1; }
    if(ball.y>canvas.height-ball.r){ ball.vy*=-0.8; ball.y=canvas.height-ball.r; new Audio('assets/sounds/bounce.wav').play().catch(()=>{}); }
    // bumpers collisions
    bumpers.forEach(b=>{
      const dx=ball.x-b.x, dy=ball.y-b.y; const dist=Math.hypot(dx,dy);
      if(dist < ball.r + b.r){
        const nx=dx/dist, ny=dy/dist;
        const dot=ball.vx*nx + ball.vy*ny;
        ball.vx -= 2*dot*nx; ball.vy -= 2*dot*ny;
        ball.x = b.x + (ball.r + b.r + 0.1)*nx;
        ball.y = b.y + (ball.r + b.r + 0.1)*ny;
        score+=10; if(scoreEl) scoreEl.textContent='Score: '+score;
        new Audio('assets/sounds/coin.wav').play().catch(()=>{});
      }
    });
  }
  function draw(){
    ctx.fillStyle='black'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // starfield bg
    for(let i=0;i<120;i++){ ctx.fillStyle='white'; ctx.fillRect((i*53+Date.now()/20)%canvas.width,(i*29)%canvas.height,1,1); }
    // bumpers
    bumpers.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,6.28); ctx.fillStyle='#29b6f6'; ctx.fill(); ctx.strokeStyle='#fff8'; ctx.stroke(); });
    // flippers
    flippers.forEach(f=>{
      ctx.save(); ctx.translate(f.x,f.y); ctx.rotate(f.angle);
      ctx.fillStyle='#66bb6a'; ctx.fillRect(-60, -10, 120, 20); ctx.restore();
    });
    // ball
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fillStyle='#ffd54f'; ctx.fill(); ctx.strokeStyle='#fff'; ctx.stroke();
  }
  function loop(){ physics(); draw(); anim=requestAnimationFrame(loop); }
  return {init};
})();
