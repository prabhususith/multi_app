
window.Pinball = (function(){
  let canvas,ctx,ball,flippers,anim;
  function init(id){
    canvas=document.getElementById(id); ctx=canvas.getContext('2d');
    resize(); window.addEventListener('resize', resize);
    ball={x:canvas.width/2,y:50,vx:2,vy:0,r:8};
    flippers=[{x:canvas.width*0.35,y:canvas.height-40,angle:0,side:-1},
              {x:canvas.width*0.65,y:canvas.height-40,angle:0,side:1}];
    canvas.addEventListener('pointerdown',e=>{ flippers.forEach(f=>f.angle=0.6*f.side); navigator.vibrate&&navigator.vibrate(10); });
    canvas.addEventListener('pointerup',e=>{ flippers.forEach(f=>f.angle=0); });
    loop();
  }
  function resize(){ canvas.width=window.innerWidth-20; canvas.height=300; }
  function physics(){
    ball.vy+=0.3; ball.x+=ball.vx; ball.y+=ball.vy;
    if(ball.x<ball.r||ball.x>canvas.width-ball.r) ball.vx*=-1;
    if(ball.y>canvas.height-ball.r){ ball.vy*=-0.8; ball.y=canvas.height-ball.r; new Audio('assets/sounds/bounce.wav').play().catch(()=>{}); }
    // simple collision with flippers line segments
  }
  function draw(){
    ctx.fillStyle='black'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // stars
    for(let i=0;i<100;i++){ ctx.fillStyle='white'; ctx.fillRect((i*53+Date.now()/20)%canvas.width,(i*29)%canvas.height,1,1); }
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
