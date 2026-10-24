(function(){
  var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

  // preloader
  addEventListener('load',function(){setTimeout(function(){$('#preloader').classList.add('hide')},500)});
  setTimeout(function(){$('#preloader').classList.add('hide')},3000);
  $('#yr').textContent=new Date().getFullYear();

  // nav, progress, steps line
  var nav=$('#nav'),prog=$('#progress'),fill=$('#lineFill');
  function onScroll(){
    var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    nav.classList.toggle('scrolled',y>30);
    prog.style.width=(y/h*100)+'%';
    var st=$('.steps');
    if(st){var r=st.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.75-r.top)/(r.height+120)));fill.style.width=(p*100)+'%'}
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // mobile menu
  var burger=$('#burger'),links=$('#links');
  burger.onclick=function(){burger.classList.toggle('open');links.classList.toggle('open')};
  $$('a',links).forEach(function(a){a.onclick=function(){burger.classList.remove('open');links.classList.remove('open')}});

  // reveal
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
  $$('.reveal').forEach(function(el){io.observe(el)});

  // cursor glow + tilt
  var glow=$('#cursorGlow');
  addEventListener('pointermove',function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});
  if(!reduce&&matchMedia('(hover:hover)').matches){
    $$('[data-tilt]').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        el.style.transform='perspective(800px) rotateY('+((x-.5)*10)+'deg) rotateX('+((.5-y)*10)+'deg)';
        el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%');
      });
      el.addEventListener('pointerleave',function(){el.style.transform=''});
    });
  }

  // spine vertebrae
  var sp=$('#spine');
  for(var i=0;i<18;i++){var v=document.createElement('div');v.className='vert';var t=i/17;v.style.width=(34+Math.sin(t*Math.PI)*26)+'px';v.style.marginLeft=(Math.sin(t*5)*10)+'px';sp.appendChild(v)}

  // neural network canvas
  var c=$('#neural'),x=c.getContext('2d'),pts=[],W,H,mouse={x:-999,y:-999};
  function size(){W=c.width=c.offsetWidth*devicePixelRatio;H=c.height=c.offsetHeight*devicePixelRatio;var n=Math.min(90,Math.floor(c.offsetWidth/14));pts=[];for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.5*devicePixelRatio,vy:(Math.random()-.5)*.5*devicePixelRatio})}
  size();addEventListener('resize',size);
  c.parentNode.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();mouse.x=(e.clientX-r.left)*devicePixelRatio;mouse.y=(e.clientY-r.top)*devicePixelRatio});
  var D=150*devicePixelRatio;
  function neural(){
    x.clearRect(0,0,W,H);
    pts.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      x.beginPath();x.arc(p.x,p.y,2*devicePixelRatio,0,7);x.fillStyle='rgba(90,190,255,.8)';x.fill();
    });
    for(var i=0;i<pts.length;i++){
      for(var j=i+1;j<pts.length;j++){
        var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.hypot(dx,dy);
        if(d<D){x.strokeStyle='rgba(60,160,255,'+(1-d/D)*.35+')';x.lineWidth=devicePixelRatio;x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.stroke()}
      }
      var md=Math.hypot(pts[i].x-mouse.x,pts[i].y-mouse.y);
      if(md<D*1.4){x.strokeStyle='rgba(56,210,255,'+(1-md/(D*1.4))*.6+')';x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(mouse.x,mouse.y);x.stroke()}
    }
    if(!reduce)requestAnimationFrame(neural);
  }
  neural();

  // EEG canvas
  var e=$('#eegCanvas'),g=e.getContext('2d'),eh=$('#hz'),t0=0,vis=false;
  new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(e);
  function eeg(){
    requestAnimationFrame(eeg);if(!vis)return;
    var w=e.width=e.offsetWidth*devicePixelRatio,h=e.height=e.offsetHeight*devicePixelRatio;
    t0+=.03;
    var ch=4;
    for(var k=0;k<ch;k++){
      var base=h*(k+.5)/ch,amp=h/ch*.32;
      g.beginPath();
      for(var i=0;i<w;i+=2){
        var u=i/w*14+t0*(1+k*.15)+k*3;
        var y=base+amp*(Math.sin(u*2.1)*.55+Math.sin(u*5.3+k)*.25+Math.sin(u*11.7)*.12+(Math.sin(u*.9+k)>.97?1.2:0)*Math.sin(u*40));
        i?g.lineTo(i,y):g.moveTo(i,y);
      }
      g.strokeStyle=['#38d2ff','#1e90ff','#6a7cff','#2dff9b'][k];g.lineWidth=1.8*devicePixelRatio;g.shadowColor=g.strokeStyle;g.shadowBlur=8;g.stroke();
    }
    eh.textContent=(9.6+Math.sin(t0*.6)*.6).toFixed(1);
  }
  eeg();

  // form → Telegram share
  var f=$('#form'),note=$('#formNote');
  f.addEventListener('submit',function(ev){
    ev.preventDefault();var ok=true;
    ['name','phone'].forEach(function(n){var i=f.elements[n];var bad=i.value.trim().length<(n==='phone'?7:2);i.classList.toggle('err',bad);if(bad)ok=false});
    if(!ok){note.textContent='Iltimos, ism va telefon raqamni to\'g\'ri kiriting.';return}
    var d=f.elements,text='NEURO CLINICS — yangi so\'rov\nIsm: '+d.name.value+'\nTelefon: '+d.phone.value+'\nXizmat: '+d.service.value+(d.msg.value?'\nIzoh: '+d.msg.value:'');
    if(location.protocol.indexOf('http')===0){try{fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})}catch(_){}}
    window.open('https://t.me/share/url?url=%20&text='+encodeURIComponent(text),'_blank');
    note.textContent='Rahmat! So\'rovingiz tayyor — Telegram orqali yuboring.';f.reset();
  });
})();

(function(){
  var $=function(s){return document.querySelector(s)},reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

  // headline word reveal
  var h=$('.hero h1');
  if(h&&!reduce){
    var i=0;
    (function wrap(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var f=document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(t){
            if(!t)return;
            if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '));return}
            var w=document.createElement('span');w.className='w';
            var c=document.createElement('i');c.textContent=t;c.style.setProperty('--i',i++);w.appendChild(c);f.appendChild(w);
          });
          node.replaceChild(f,n);
        }else if(n.nodeType===1&&!n.classList.contains('w')){wrap(n)}
      });
    })(h);
    h.classList.remove('reveal');h.style.opacity=1;h.style.transform='none';
  }

  // counters
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,to=+el.dataset.count,t0=performance.now();
    (function step(t){var p=Math.min(1,(t-t0)/1400),v=1-Math.pow(1-p,3);el.textContent=Math.round(to*v);if(p<1)requestAnimationFrame(step)})(t0);
  })},{threshold:.6});
  [].forEach.call(document.querySelectorAll('[data-count]'),function(el){cio.observe(el)});

  // magnetic buttons
  if(!reduce&&matchMedia('(hover:hover)').matches){
    [].forEach.call(document.querySelectorAll('.btn'),function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.3-2)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
  }

  // particle logo
  var cv=$('#logoParticles');if(!cv)return;
  var vis=cv.parentNode,ctx=cv.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1),P=[],mx=-9999,my=-9999,S=0,img=new Image();
  img.onload=function(){
    try{
      var N=innerWidth<700?240:320,o=document.createElement('canvas');o.width=o.height=N;var oc=o.getContext('2d');
      oc.drawImage(img,0,0,N,N);
      var d=oc.getImageData(0,0,N,N).data,step=2;
      for(var y=0;y<N;y+=step)for(var x=0;x<N;x+=step){
        var k=(y*N+x)*4,r=d[k],g=d[k+1],b=d[k+2],a=d[k+3];
        if(a<200||(r>225&&g>225&&b>225))continue;
        var cx=x-N/2,cy=y-N/2;if(cx*cx+cy*cy>N*N/4*.97)continue;
        P.push({hx:x/N,hy:y/N,x:Math.random(),y:Math.random(),vx:0,vy:0,c:'rgb('+Math.min(255,r+40)+','+Math.min(255,g+50)+','+Math.min(255,b+30)+')',s:.8+Math.random()*.9});
      }
      resize();vis.classList.add('ready');loop();
    }catch(e){/* file:// or blocked: fallback image stays */}
  };
  img.src='assets/logo.png';
  function resize(){S=vis.clientWidth;cv.width=cv.height=S*dpr}
  addEventListener('resize',function(){if(P.length)resize()});
  vis.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height});
  vis.addEventListener('pointerleave',function(){mx=my=-9999});
  var on=true;new IntersectionObserver(function(es){on=es[0].isIntersecting}).observe(vis);
  var t=0;
  function loop(){
    requestAnimationFrame(loop);if(!on)return;
    t+=.016;ctx.clearRect(0,0,cv.width,cv.height);ctx.globalCompositeOperation='lighter';
    var R=.13,sz=1.7*dpr*S/520+.5;
    for(var i=0;i<P.length;i++){
      var p=P[i],tx=p.hx+Math.sin(t*1.3+p.hy*9)*.0035,ty=p.hy+Math.cos(t*1.1+p.hx*9)*.0035;
      p.vx+=(tx-p.x)*.035;p.vy+=(ty-p.y)*.035;
      var dx=p.x-mx,dy=p.y-my,dd=dx*dx+dy*dy;
      if(dd<R*R){var f=(1-Math.sqrt(dd)/R)*.012,m=Math.sqrt(dd)||1;p.vx+=dx/m*f*3;p.vy+=dy/m*f*3}
      p.vx*=.86;p.vy*=.86;p.x+=p.vx;p.y+=p.vy;
      ctx.fillStyle=p.c;ctx.fillRect(p.x*cv.width-sz/2,p.y*cv.height-sz/2,sz*p.s,sz*p.s);
    }
    ctx.globalCompositeOperation='source-over';
  }
})();

(function(){
  var f=document.getElementById('bannerFig'),lb=document.getElementById('lightbox');
  if(!f||!lb)return;
  function close(){lb.classList.remove('open')}
  f.onclick=function(){lb.querySelector('img').src=f.querySelector('img').src;lb.classList.add('open')};
  lb.onclick=close;addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();
