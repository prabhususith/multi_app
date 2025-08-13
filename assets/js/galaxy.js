
window.Galaxy=(function(){
  let c,ctx,stars=[];
  function init(id){
    c=document.getElementById(id); ctx=c.getContext('2d');
    resize(); window.addEventListener('resize', resize);
    for(let i=0;i<400;i++){ stars.push({x:Math.random(),y:Math.random(),z:Math.random()}); }
    requestAnimationFrame(loop);
  }
  function resize(){ c.width=window.innerWidth-20; c.height=300; }
  function loop(){
    ctx.fillStyle='#0b1020'; ctx.fillRect(0,0,c.width,c.height);
    stars.forEach(s=>{
      s.z-=0.002; if(s.z<=0) s.z=1;
      const sx=(s.x-0.5)/s.z*c.width+ c.width/2;
      const sy=(s.y-0.5)/s.z*c.height+ c.height/2;
      const r=(1-s.z)*2;
      ctx.beginPath(); ctx.arc(sx,sy,r,0,6.28);
      ctx.fillStyle='rgba(200,220,255,'+(1-s.z)+')'; ctx.fill();
    });
    // planets
    for(let p=0;p<3;p++){
      const t=Date.now()/1000+p*2;
      const cx=c.width/2, cy=c.height/2;
      const R=70+ p*40;
      const x=cx+Math.cos(t*(0.2+p*0.05))*R;
      const y=cy+Math.sin(t*(0.2+p*0.05))*R;
      ctx.beginPath(); ctx.arc(x,y,12+p*4,0,6.28);
      ctx.fillStyle=['#90caf9','#a5d6a7','#ffab91'][p%3]; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(cx,cy,R,0,6.28); ctx.stroke();
    }
    requestAnimationFrame(loop);
  }
  return {init};
})();
