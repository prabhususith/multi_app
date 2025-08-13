
(function(){
  $.ready(function(){
    JQMTabs.init();
    initCalculator();
    initCurrency();
    initCrypto();
    initPaint();
    initCoin();
    initDice();
    Galaxy.init('galaxyCanvas');
    initMedia();
    initRecorder();
    initHoroscope();
    initTodo();
    initChess();
    Pinball.init('pinballCanvas');
    initFlash();
    // PWA
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js'); }
  });

  function loader(on){
    const l=document.getElementById('loader');
    l.style.display= on ? 'flex' : 'none';
  }

  function playTap(){ new Audio('assets/sounds/tap.wav').play().catch(()=>{}); navigator.vibrate&&navigator.vibrate(5); }

  // Tab 1 Calculator (basic + scientific)
  function initCalculator(){
    const out = document.getElementById('calcOut');
    document.querySelectorAll('.calc-btn').forEach(b=>b.addEventListener('click',()=>{
      playTap();
      const v=b.getAttribute('data-v');
      if(v==='C') out.value='';
      else if(v==='='){
        try{ out.value= String(Function('return ('+out.value+')')()); }
        catch(e){ out.value='Err'; }
      }else{
        out.value+=v;
      }
    }));
    document.getElementById('calcSave').addEventListener('click',()=>{
      const k='calc_mem'; const mem=JSON.parse(localStorage.getItem(k)||'[]');
      mem.push({ts:Date.now(),expr:document.getElementById('calcOut').value});
      localStorage.setItem(k,JSON.stringify(mem));
      renderMem();
      playTap();
    });
    function renderMem(){
      const list=document.getElementById('calcMem'); list.innerHTML='';
      (JSON.parse(localStorage.getItem('calc_mem')||'[]')).slice(-10).reverse().forEach(it=>{
        const li=document.createElement('li'); li.textContent=new Date(it.ts).toLocaleString()+': '+it.expr; list.appendChild(li);
      });
    }
    renderMem();
  }

  // Helpers for once-per-day caching
  async function cachedFetch(key,url){
    const today=new Date().toISOString().slice(0,10);
    const meta=JSON.parse(localStorage.getItem(key+'_meta')||'{}');
    if(meta.date===today && localStorage.getItem(key)){
      return JSON.parse(localStorage.getItem(key));
    }
    loader(true);
    try{
      const res=await fetch(url); const data=await res.json();
      localStorage.setItem(key,JSON.stringify(data));
      localStorage.setItem(key+'_meta',JSON.stringify({date:today}));
      return data;
    }catch(e){
      return JSON.parse(localStorage.getItem(key)||'{}');
    }finally{ loader(false); }
  }

  // Tab 2 Currency
  function initCurrency(){
    const from=document.getElementById('curFrom'), to=document.getElementById('curTo');
    const amt=document.getElementById('curAmt'), rng=document.getElementById('curRange'), out=document.getElementById('curOut');
    rng.addEventListener('input',()=>{ amt.value=rng.value; convert(); });
    amt.addEventListener('input',()=>{ rng.value=amt.value; convert(); });
    from.addEventListener('change',convert); to.addEventListener('change',convert);
    const url='https://api.exchangerate.host/latest';
    cachedFetch('fxrates',url).then(data=>{
      const symbols=Object.keys(data.rates||{USD:1,EUR:0.9,INR:83});
      [from,to].forEach(sel=>{ symbols.forEach(s=>{ const o=document.createElement('option'); o.value=s;o.textContent=s; sel.appendChild(o); }); });
      from.value='USD'; to.value='INR'; convert();
    });
    function convert(){
      const data=JSON.parse(localStorage.getItem('fxrates')||'{}');
      if(!data.rates) return;
      const a=parseFloat(amt.value||0);
      const rate=(data.rates[to.value]/data.rates[from.value]);
      out.textContent= (a*rate).toFixed(2);
    }
  }

  // Tab 3 Crypto
  function initCrypto(){
    const from=document.getElementById('crFrom'), to=document.getElementById('crTo'), extra=document.getElementById('crExtra');
    const amt=document.getElementById('crAmt'), rng=document.getElementById('crRange'), out=document.getElementById('crOut'), out2=document.getElementById('crOut2');
    rng.addEventListener('input',()=>{ amt.value=rng.value; convert(); });
    amt.addEventListener('input',()=>{ rng.value=amt.value; convert(); });
    [from,to,extra].forEach(e=>e.addEventListener('change',convert));
    const url='https://api.coingecko.com/api/v3/exchange_rates';
    cachedFetch('cryptorates',url).then(data=>{
      const r=data.rates||{};
      const coins=Object.keys(r);
      coins.forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s.toUpperCase(); from.appendChild(o.cloneNode(true)); to.appendChild(o.cloneNode(true)); extra.appendChild(o.cloneNode(true)); });
      from.value='btc'; to.value='usd'; extra.value='inr'; convert();
    });
    function convert(){
      const data=JSON.parse(localStorage.getItem('cryptorates')||'{}'); if(!data.rates) return;
      const a=parseFloat(amt.value||0);
      function rate(sym){ return data.rates[sym]?.value || 1; }
      const v=a* (rate(to.value)/rate(from.value));
      const v2=a* (rate(extra.value)/rate(from.value));
      out.textContent=v.toFixed(6); out2.textContent=v2.toFixed(6);
    }
  }

  // Tab 4 Paint 3D-ish (canvas + shapes, image/text, export)
  function initPaint(){
    const c=document.getElementById('paint'); const ctx=c.getContext('2d'); c.width=window.innerWidth-20; c.height=300;
    let drawing=false, brush=5, color='#ff4081';
    c.addEventListener('pointerdown',e=>{ drawing=true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); playTap(); });
    c.addEventListener('pointermove',e=>{ if(!drawing) return; ctx.lineWidth=brush; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.strokeStyle=color; ctx.shadowBlur=10; ctx.shadowColor=color; ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); });
    c.addEventListener('pointerup',()=>{ drawing=false; });
    document.getElementById('brush').addEventListener('input',e=>brush=parseInt(e.target.value));
    document.getElementById('pcolor').addEventListener('input',e=>color=e.target.value);
    document.getElementById('addText').addEventListener('click',()=>{
      const t=prompt('Text?'); if(!t) return; ctx.save(); ctx.font='24px sans-serif'; ctx.fillStyle=color; ctx.fillText(t,20,40); ctx.restore();
    });
    document.getElementById('addShape').addEventListener('click',()=>{
      ctx.save(); ctx.fillStyle=color; ctx.translate(150,150); ctx.rotate(Date.now()/500); ctx.fillRect(-20,-20,40,40); ctx.restore();
    });
    document.getElementById('imgUpload').addEventListener('change',e=>{
      const file=e.target.files[0]; if(!file) return; const url=URL.createObjectURL(file); const img=new Image(); img.onload=()=>{ ctx.drawImage(img,0,0,200,150); }; img.src=url;
    });
    document.getElementById('exportPNG').addEventListener('click',()=>{
      const a=document.createElement('a'); a.download='paint.png'; a.href=c.toDataURL('image/png'); a.click();
    });
    document.getElementById('exportJPG').addEventListener('click',()=>{
      const a=document.createElement('a'); a.download='paint.jpg'; a.href=c.toDataURL('image/jpeg',0.92); a.click();
    });
    document.getElementById('exportPDF').addEventListener('click',()=>{
      const pdf=new jsPDF(); pdf.addImage(c.toDataURL('image/png'),'PNG',20,20,170,120); pdf.save('paint.pdf');
    });
  }

  // Tab 5 Coin
  function initCoin(){
    const btn=document.getElementById('flip'); const out=document.getElementById('coinOut');
    btn.addEventListener('click',()=>{
      playTap();
      const res=Math.random()<0.5?'Heads':'Tails';
      out.textContent=res;
      new Audio('assets/sounds/coin.wav').play().catch(()=>{});
    });
  }

  // Tab 6 Dice
  function initDice(){
    const btn=document.getElementById('roll'); const out=document.getElementById('diceOut');
    btn.addEventListener('click',()=>{
      playTap();
      const n=1+Math.floor(Math.random()*6);
      out.textContent='🎲 '+n;
      new Audio('assets/sounds/dice.wav').play().catch(()=>{});
    });
  }

  // Tab 8 Recorder + Camera with effects
  function initRecorder(){
    const v=document.getElementById('cam'); const recBtn=document.getElementById('recBtn'); const playBtn=document.getElementById('playBtn');
    let media, chunks=[], recorder;
    document.getElementById('camStart').addEventListener('click',async ()=>{
      playTap();
      media=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      v.srcObject=media; v.play();
    });
    recBtn.addEventListener('click',()=>{
      if(!media) return;
      recorder=new MediaRecorder(media); chunks=[];
      recorder.ondataavailable=e=>chunks.push(e.data);
      recorder.onstop=()=>{
        const blob=new Blob(chunks,{type:'video/webm'}); v.srcObject=null; v.src=URL.createObjectURL(blob); v.controls=true;
      };
      recorder.start(); recBtn.disabled=true; playBtn.disabled=false; new Audio('assets/sounds/rec.wav').play().catch(()=>{});
    });
    playBtn.addEventListener('click',()=>{ recorder && recorder.stop(); recBtn.disabled=false; playBtn.disabled=true; });
    document.getElementById('effect').addEventListener('change',e=>{ v.className=e.target.value; });
  }

  // Tab 9 Horoscopes (static demo + i18n Tamil/English)
  function initHoroscope(){
    const langSel=document.getElementById('hsLang'), signSel=document.getElementById('hsSign'), out=document.getElementById('hsOut');
    const data={
      en:{aries:"Take bold steps today.",taurus:"Focus on stability.",gemini:"Conversations open doors.",cancer:"Home brings comfort.",leo:"Lead with heart.",virgo:"Organize and thrive.",libra:"Seek balance.",scorpio:"Trust your gut.",sagittarius:"Explore ideas.",capricorn:"Discipline pays.",aquarius:"Innovate freely.",pisces:"Create and care."},
      ta:{aries:"இன்று துணிச்சலாக முன்னேறுங்கள்.",taurus:"நிலைத்தன்மைக்கு முக்கியத்துவம்.",gemini:"உரையாடல்கள் வாய்ப்புகளைத் தரும்.",cancer:"வீடு அமைதியைக் கொடுக்கும்.",leo:"இதயத்துடன் வழிநடத்துங்கள்.",virgo:"ஒழுங்குபடுத்தி முன்னேறுங்கள்.",libra:"சமநிலையைத் தேடுங்கள்.",scorpio:"உள் உணர்வில் நம்பிக்கை வையுங்கள்.",sagittarius:"புதிய எண்ணங்களை ஆராயுங்கள்.",capricorn:"ஒழுக்கம் பலன் தரும்.",aquarius:"புதுமை காட்டு.",pisces:"உருவாக்கமும் அக்கறையும் காட்டுங்கள்."}
    };
    function render(){ const L=langSel.value, S=signSel.value; out.textContent=(data[L][S]||''); }
    langSel.addEventListener('change',render); signSel.addEventListener('change',render); render();
  }

  // Tab 10 Todo + Notifications
  function initTodo(){
    const list=document.getElementById('todoList');
    const form=document.getElementById('todoForm');
    load();
    form.addEventListener('submit',e=>{
      e.preventDefault(); playTap();
      const t=document.getElementById('todoText').value;
      const d=document.getElementById('todoDate').value;
      const i=Date.now(); const item={id:i,text:t,when:d,done:false};
      const arr=get(); arr.push(item); save(arr); render(arr);
      schedule(item);
      form.reset();
    });
    function get(){ return JSON.parse(localStorage.getItem('todos')||'[]'); }
    function save(a){ localStorage.setItem('todos',JSON.stringify(a)); }
    function load(){ render(get()); }
    function render(a){
      list.innerHTML='';
      a.forEach(it=>{
        const li=document.createElement('li');
        li.innerHTML=`<input type="checkbox" ${it.done?'checked':''} data-id="${it.id}"> ${it.text} <small>${it.when||''}</small>
        <button class="btn icon" data-act="edit" data-id="${it.id}"><span class="material-icons">edit</span></button>
        <button class="btn icon" data-act="del" data-id="${it.id}"><span class="material-icons">delete</span></button>`;
        list.appendChild(li);
      });
      list.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.addEventListener('change',()=>{
        const id=parseInt(cb.getAttribute('data-id')); const a=get(); const it=a.find(x=>x.id===id); it.done=cb.checked; save(a);
      }));
      list.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
        const id=parseInt(b.getAttribute('data-id')); const act=b.getAttribute('data-act'); const a=get(); const it=a.find(x=>x.id===id);
        if(act==='edit'){ const nt=prompt('Edit',it.text)||it.text; it.text=nt; save(a); render(a); }
        else if(act==='del'){ save(a.filter(x=>x.id!==id)); render(get()); }
      }));
    }
    async function schedule(it){
      if('Notification' in window){
        if(Notification.permission!=='granted'){ await Notification.requestPermission(); }
        if(Notification.permission==='granted'){
          const when=new Date(it.when).getTime(); const delay=Math.max(0,when-Date.now());
          setTimeout(()=>{ new Notification('Reminder',{body:it.text}); new Audio('assets/sounds/notify.wav').play().catch(()=>{}); }, delay);
        }
      }
    }
  }

  // Tab 11 Import (read word, pdf, csv, doc) - basic support
  function initImport(){
    const input=document.getElementById('fileImport'); const out=document.getElementById('importOut');
    input.addEventListener('change',async e=>{
      playTap();
      const f=e.target.files[0]; if(!f) return;
      const ext=f.name.split('.').pop().toLowerCase();
      if(ext==='csv' || ext==='txt'){ const t=await f.text(); out.textContent=t.slice(0,2000); }
      else if(ext==='pdf'){ out.textContent='PDF selected: '+f.name+' ('+Math.round(f.size/1024)+' KB)'; }
      else if(ext==='doc' || ext==='docx' || ext==='word'){ out.textContent='Word file selected: '+f.name; }
      else { out.textContent='Unsupported file preview. File name: '+f.name; }
    });
  }
  initImport();

  // Tab 12 Chess (very simple click-move)
  function initChess(){
    const board=document.getElementById('chess'); render();
    board.addEventListener('click',e=>{
      const cell=e.target.closest('.sq'); if(!cell) return;
      const r=parseInt(cell.dataset.r), c=parseInt(cell.dataset.c);
      const sel=document.querySelector('.sq.sel');
      if(sel){ // second click
        const r0=parseInt(sel.dataset.r), c0=parseInt(sel.dataset.c);
        if(MicroChess.move(r0,c0,r,c)){ render(); }
        sel.classList.remove('sel');
      }else{
        cell.classList.add('sel');
      }
    });
    document.getElementById('chessReset').addEventListener('click',()=>{ MicroChess.reset(); render(); });
    function render(){
      const b=MicroChess.get();
      board.innerHTML='';
      for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
          const ch=b[r][c];
          const div=document.createElement('div'); div.className='sq'; div.dataset.r=r; div.dataset.c=c;
          div.textContent=ch==='.'?'':ch;
          if((r+c)%2===0) div.classList.add('light'); else div.classList.add('dark');
          board.appendChild(div);
        }
      }
    }
  }

  // Tab 14 Screen Flash & Torch (where supported)
  function initFlash(){
    const color=document.getElementById('flashColor'); const btn=document.getElementById('flashBtn'); const screen=document.getElementById('flashScreen');
    btn.addEventListener('click',async ()=>{
      playTap();
      screen.style.background=color.value; screen.classList.toggle('on');
      // Torch attempt where supported (Android Chrome behind flag / ImageCapture)
      try{
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
        const track=stream.getVideoTracks()[0];
        const imageCapture=new ImageCapture(track);
        const capabilities=await imageCapture.getPhotoCapabilities();
        if(capabilities.torch){ await track.applyConstraints({advanced:[{torch:screen.classList.contains('on')}]}); }
      }catch(e){ /* silently ignore */ }
    });
  }

  // Tab 15 Media Player
  function initMedia(){ SimpleAV.init(); }

})();
