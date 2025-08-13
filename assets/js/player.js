
window.SimpleAV=(function(){
  let audio,video,ctx,src,filters=[];
  function init(){
    audio=document.getElementById('audio'); video=document.getElementById('video');
    document.getElementById('audioFile').addEventListener('change',e=>loadMedia(e.target.files[0],'audio'));
    document.getElementById('videoFile').addEventListener('change',e=>loadMedia(e.target.files[0],'video'));
    document.getElementById('eqEnable').addEventListener('change',toggleEq);
  }
  function loadMedia(file,type){
    const url=URL.createObjectURL(file);
    if(type==='audio'){ audio.src=url; audio.play(); }
    else { video.src=url; video.play(); }
    navigator.vibrate&&navigator.vibrate(10);
  }
  function toggleEq(e){
    if(!ctx){ ctx=new (window.AudioContext||window.webkitAudioContext)(); src=ctx.createMediaElementSource(audio);
      const freqs=[60,170,350,1000,3500,10000];
      let prev=src;
      freqs.forEach((f,i)=>{ const biq=ctx.createBiquadFilter(); biq.type='peaking'; biq.frequency.value=f; biq.Q.value=1; biq.gain.value=0;
        const slider=document.getElementById('eq'+i); slider.addEventListener('input',()=>biq.gain.value=parseFloat(slider.value));
        prev.connect(biq); prev=biq; filters.push(biq);
      });
      prev.connect(ctx.destination);
    }
    if(e.target.checked){ audio.pause(); audio.play(); }
  }
  return {init};
})();
