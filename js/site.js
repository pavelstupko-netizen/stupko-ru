(function(){
  /* появление частей секций */
  var parts=document.querySelectorAll('main h1, main h2, main h3, main p, main .card, main .sc, main .ac, main .pi, main .pf, main .gal figure, main .fig, main .btn, main .cover, main .yr-out, main input, main output');
  parts.forEach(function(e){ if(!e.closest('.hero')) e.classList.add('rv'); });
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting)return;var el=x.target;
      var sib=Array.prototype.indexOf.call(el.parentNode.children,el); setTimeout(function(){el.classList.add('on');},Math.min(sib,8)*70); io.unobserve(el);});},{rootMargin:'0px 0px -6% 0px',threshold:.05});
    els.forEach(function(e){io.observe(e);});
  } else els.forEach(function(e){e.classList.add('on');});
  setTimeout(function(){els.forEach(function(e){e.classList.add('on');});},2500);

  /* живые фотографии: клик по фото с data-live — поверх появляется видео */
  function liveOf(img){
    var box=img.closest('.pf')||img.closest('.card'); if(!box) return null;
    var v=box.querySelector('video');
    if(!v){ v=document.createElement('video'); v.muted=true; v.loop=true; v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('muted','');
      v.preload='auto'; img.insertAdjacentElement('afterend',v); v.src=img.getAttribute('data-live'); v.load(); }
    return {box:box,v:v};
  }
  Array.prototype.forEach.call(document.querySelectorAll('img[data-live]'),function(img){
    img.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation();
      var L=liveOf(img); if(!L) return;
      if(L.box.classList.contains('playing')){ L.v.pause(); L.box.classList.remove('playing'); return; }
      L.v.style.height=img.getBoundingClientRect().height+'px';
      L.box.classList.add('playing');
      var go=function(){ var pr=L.v.play(); if(pr&&pr.catch) pr.catch(function(){L.box.classList.remove('playing');}); };
      if(L.v.readyState>=2) go(); else L.v.addEventListener('loadeddata',go,{once:true});
    },true);
  });

  /* лайтбокс */
  var imgs=Array.prototype.slice.call(document.querySelectorAll('.card img, .gal img, .pf img, .fig img, .story .cover, .docs img')).filter(function(i){return !i.hasAttribute('data-live');});
  var lb=document.getElementById('lb'); if(lb&&imgs.length){
    var im=document.getElementById('lbimg'),cap=document.getElementById('lbcap'),cnt=document.getElementById('lbcnt'),cur=-1,last=null;
    function capOf(img){var f=img.closest('figure');var fc=f&&f.querySelector('figcaption');if(fc)return fc.innerHTML;var c=img.closest('.card');if(c)return c.querySelector('b').textContent;return img.alt||'';}
    function show(i){cur=(i+imgs.length)%imgs.length;im.src=imgs[cur].getAttribute('data-full')||imgs[cur].currentSrc||imgs[cur].src;im.alt=imgs[cur].alt||'';cap.innerHTML=capOf(imgs[cur]);cnt.textContent=(cur+1)+' / '+imgs.length;}
    function open(i){last=document.activeElement;show(i);lb.classList.add('on');document.body.classList.add('lb-open');lb.querySelector('.lbx').focus();}
    function close(){lb.classList.remove('on');document.body.classList.remove('lb-open');if(last&&last.focus)last.focus();}
    imgs.forEach(function(img,i){img.classList.add('zoomable');img.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open(i);});});
    lb.querySelector('.lbx').addEventListener('click',close);
    lb.querySelector('.lbp').addEventListener('click',function(e){e.stopPropagation();show(cur-1);});
    lb.querySelector('.lbn').addEventListener('click',function(e){e.stopPropagation();show(cur+1);});
    im.addEventListener('click',function(e){e.stopPropagation();close();});
    lb.addEventListener('click',function(e){if(e.target===lb||e.target===cap||e.target===cnt)close();});
    document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1);});
    var tx=null;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true});
    lb.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50)show(dx<0?cur+1:cur-1);},{passive:true});
  }

  /* линии дерева: родитель → ребёнок */
  var tree=document.getElementById('tree');
  if(tree){
    var svg=tree.querySelector('svg.links'), drawn=false;
    function draw(){
      if(window.innerWidth<821){ svg.innerHTML=''; return; }
      var r=tree.getBoundingClientRect(); svg.setAttribute('viewBox','0 0 '+r.width+' '+r.height); svg.innerHTML='';
      var cards={}; var all=Array.prototype.slice.call(tree.querySelectorAll('.card'));
      all.forEach(function(c){cards[c.dataset.id]=c;});
      var ns='http://www.w3.org/2000/svg'; var anim=!drawn && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      all.forEach(function(c){
        (c.dataset.parents||'').split(',').filter(Boolean).forEach(function(pid){
          var p=cards[pid]; if(!p) return;
          var a=p.getBoundingClientRect(), b=c.getBoundingClientRect();
          var gen=p.closest('.gen'); var gb=gen.getBoundingClientRect();
          var x1=a.left-r.left+a.width/2, y1=a.bottom-r.top, x2=b.left-r.left+b.width/2, y2=b.top-r.top;
          var rowBelow=Array.prototype.some.call(gen.querySelectorAll('.card'),function(o){return o.getBoundingClientRect().top>a.bottom+4;});
          var direct=c.classList.contains('direct')&&p.classList.contains('direct');
          var ym=y2-Math.max(28,(y2-(gb.bottom-r.top))*0.55)-(direct?0:10);
          var d='M'+x1+' '+y1;
          if(rowBelow){ var xs=(a.right+12<r.right-8)?a.right-r.left+12:a.left-r.left-12; d+=' V'+(y1+14)+' H'+xs+' V'+ym+' H'+x2+' V'+y2; }
          else d+=' V'+ym+' H'+x2+' V'+y2;
          var path=document.createElementNS(ns,'path');
          path.setAttribute('d',d); path.setAttribute('fill','none'); path.setAttribute('stroke', direct?'#2a4b9b':'#8c5a3c');
          path.setAttribute('stroke-width', direct?'3':'1.5'); path.setAttribute('opacity', direct?'.85':'.6'); path.setAttribute('stroke-linejoin','round');
          svg.appendChild(path);
          if(anim){ var len=path.getTotalLength(); path.style.strokeDasharray=len; path.style.strokeDashoffset=len; path.style.transition='stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)';
            requestAnimationFrame(function(){requestAnimationFrame(function(){path.style.strokeDashoffset=0;});}); }
        });
      });
      drawn=true;
    }
    window.addEventListener('load',draw); window.addEventListener('resize',draw);
    document.fonts&&document.fonts.ready.then(draw); setTimeout(draw,1800); setTimeout(draw,3200);
  }

  /* год */
  var yr=document.getElementById('yr');
  if(yr&&window.ROD){
    var yv=document.getElementById('yv'), yo=document.getElementById('yo');
    function upd(){
      var y=+yr.value; yv.textContent=y;
      var ev=null; window.ROD.events.forEach(function(e){ if(e.y<=y && (!ev||e.y>ev.y)) ev=e; });
      var alive=window.ROD.people.filter(function(p){ return p.b && +String(p.b).slice(0,4)<=y && (!p.d || +String(p.d).slice(0,4)>=y); });
      var h=ev?'<p class="ev">'+ev.y+(ev.y<y?' → '+y:'')+'. '+ev.t+'</p>':'';
      h+=alive.length?'<ul>'+alive.map(function(p){var age=y-+String(p.b).slice(0,4);return '<li><b>'+p.n+'</b> <span>'+age+(age%10==1&&age%100!=11?' год':(age%10>=2&&age%10<=4&&(age%100<10||age%100>=20))?' года':' лет')+(p.where?' · '+p.where:'')+'</span></li>';}).join('')+'</ul>':'<p>Никого из известных нам людей рода в этом году ещё не было.</p>';
      yo.innerHTML=h;
    }
    yr.addEventListener('input',upd); upd();
  }
})();
