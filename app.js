(function(){
  "use strict";
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- CONFIG: owner can edit ---- */
  var STORE_EMAIL = "hello@dollarnplus.ca"; // TODO: set the store's real email for the callback form

  /* ---- needs-search (evergreen) ---- */
  var DATA=[
    {name:"Stationery & Office", kind:"shop", target:"#departments", kw:"pen pens pencil notebook paper card cards greeting school office supplies binder file marker highlighter stationery study"},
    {name:"Kitchenware & Tableware", kind:"shop", target:"#departments", kw:"kitchen cook cookware pot pan plate plates bowl mug cup utensil tableware dish dishes storage bake gadget dorm"},
    {name:"Cleaning & Household", kind:"shop", target:"#departments", kw:"clean cleaning broom mop dustpan sponge detergent soap trash organizer organize battery bulb household tidy laundry"},
    {name:"Health & Beauty", kind:"shop", target:"#departments", kw:"beauty health skincare skin hair shampoo conditioner soap cosmetics makeup toiletries baby care lotion self care personal"},
    {name:"Party & Balloons", kind:"shop", target:"#departments", kw:"party balloon balloons helium birthday celebration graduation banner candle decoration tableware plates cups"},
    {name:"Crafts & Art", kind:"shop", target:"#departments", kw:"craft crafts art paint canvas glue bead diy draw drawing supplies"},
    {name:"Gifts & Novelty", kind:"shop", target:"#departments", kw:"gift gifts wrap wrapping ribbon present novelty random souvenir"},
    {name:"Garden, Plants & Flowers", kind:"shop", target:"#departments", kw:"garden plant plants flower flowers decor pot soil greenery"},
    {name:"Hardware & More", kind:"shop", target:"#departments", kw:"hardware tool tools screw nail fix repair tape glue hook"},
    {name:"Snacks & Drinks", kind:"shop", target:"#departments", kw:"snack snacks candy chips nuts popcorn drink drinks soda pop noodles food hungry"},
    {name:"U-Haul Rental", kind:"service", target:"#services", kw:"uhaul u-haul truck van rent rental moving move haul cargo trailer"},
    {name:"Moving Service", kind:"service", target:"#services", kw:"move moving help labour movers dorm apartment relocate"},
    {name:"Shipping", kind:"service", target:"#services", kw:"ship shipping parcel package post mail send box courier deliver"},
    {name:"Internet & Phone Plans", kind:"service", target:"#services", kw:"internet phone plan plans sim data mobile cell wifi connection"},
    {name:"Home Cleaning", kind:"service", target:"#services", kw:"cleaning clean home house maid housekeeping tidy service"}
  ];
  var input=document.getElementById('need'), results=document.getElementById('results'), active=-1, current=[];
  function score(item,q){q=q.toLowerCase().trim(); if(!q) return 0; var hay=(item.name+" "+item.kw).toLowerCase(),s=0; q.split(/\s+/).forEach(function(t){ if(hay.indexOf(t)>-1) s+=(item.name.toLowerCase().indexOf(t)>-1?3:1);}); return s;}
  function render(q){
    current=DATA.map(function(d){return {d:d,s:score(d,q)};}).filter(function(x){return x.s>0;}).sort(function(a,b){return b.s-a.s;}).slice(0,6).map(function(x){return x.d;});
    active=-1;
    if(!q.trim()){results.classList.remove('show');input.setAttribute('aria-expanded','false');return;}
    if(!current.length){results.innerHTML='<div class="rempty">No match — but we probably still have it. Ask at the counter or call (604) 764-8475.</div>';}
    else{results.innerHTML=current.map(function(d,i){return '<a class="ritem" role="option" data-i="'+i+'" href="'+d.target+'"><span class="rname">'+d.name+'</span><span class="rkind '+d.kind+'">'+(d.kind==='shop'?'Department':'Service')+'</span></a>';}).join('');}
    results.classList.add('show');input.setAttribute('aria-expanded','true');
  }
  function go(target){results.classList.remove('show');input.setAttribute('aria-expanded','false');var el=document.querySelector(target);if(el)el.scrollIntoView({behavior:reduce?'auto':'smooth'});}
  if(input){
    input.addEventListener('input',function(){render(this.value);});
    input.addEventListener('focus',function(){if(this.value.trim())render(this.value);});
    input.addEventListener('keydown',function(e){
      var items=results.querySelectorAll('.ritem');
      if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,items.length-1);}
      else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);}
      else if(e.key==='Enter'){if(current[active]){e.preventDefault();go(current[active].target);}else if(current[0]){e.preventDefault();go(current[0].target);}return;}
      else if(e.key==='Escape'){results.classList.remove('show');return;}
      else return;
      items.forEach(function(it,i){it.classList.toggle('active',i===active);});
    });
    results.addEventListener('click',function(e){var a=e.target.closest('.ritem');if(a){e.preventDefault();go(a.getAttribute('href'));}});
    document.getElementById('searchGo').addEventListener('click',function(){if(current[0])go(current[0].target);else input.focus();});
    document.addEventListener('click',function(e){if(!e.target.closest('.search-wrap'))results.classList.remove('show');});
  }
  document.querySelectorAll('.quick button').forEach(function(b){b.addEventListener('click',function(){input.value=this.dataset.q;render(this.dataset.q);input.focus();});});

  /* ---- open/closed (America/Vancouver) ---- */
  var HOURS={0:[540,1230],1:[510,1230],2:[510,1230],3:[510,1230],4:[510,1230],5:[510,1230],6:[510,1230]};
  function vanNow(){try{var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Vancouver',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),m={};p.forEach(function(x){m[x.type]=x.value;});var days={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6},h=parseInt(m.hour,10);if(h===24)h=0;return{day:days[m.weekday],mins:h*60+parseInt(m.minute,10)};}catch(e){var d=new Date();return{day:d.getDay(),mins:d.getHours()*60+d.getMinutes()};}}
  function fmt(x){var h=Math.floor(x/60),mn=x%60,ap=h>=12?'PM':'AM',hh=h%12||12;return hh+(mn?':'+(mn<10?'0':'')+mn:'')+' '+ap;}
  function status(){var n=vanNow(),h=HOURS[n.day],open=h&&n.mins>=h[0]&&n.mins<h[1];
    var t=document.getElementById('openText');
    if(t){ if(open)t.textContent='Open now · until '+fmt(h[1]); else if(h&&n.mins<h[0])t.textContent='Opens '+fmt(h[0])+' today'; else t.textContent='Opens '+fmt(HOURS[(n.day+1)%7][0])+' tomorrow'; }
    document.querySelectorAll('.mini-hours .row').forEach(function(r){r.classList.toggle('now',parseInt(r.dataset.d,10)===n.day);});
  }
  status();setInterval(status,60000);

  /* ---- mobile menu (focus return) ---- */
  var mb=document.getElementById('menuBtn'),mm=document.getElementById('navMenu');
  if(mb){
    mb.addEventListener('click',function(){var s=mm.classList.toggle('show');mb.setAttribute('aria-expanded',s);if(s){var f=mm.querySelector('a');if(f)f.focus();}});
    mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mm.classList.remove('show');mb.setAttribute('aria-expanded','false');mb.focus();});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mm.classList.contains('show')){mm.classList.remove('show');mb.setAttribute('aria-expanded','false');mb.focus();}});
  }

  /* ---- lightbox (focus trap + return) ---- */
  var lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),lbList=[],lbIdx=0,lastFocus=null;
  lbList=[].slice.call(document.querySelectorAll('[data-full]'));
  function showImg(){var el=lbList[lbIdx];lbImg.src=el.dataset.full;var im=el.querySelector('img');lbImg.alt=(im&&im.alt)||'Store photo';}
  function openLB(i){lastFocus=document.activeElement;lbIdx=i;showImg();lb.classList.add('show');document.getElementById('lbX').focus();}
  function closeLB(){lb.classList.remove('show');if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  lbList.forEach(function(el,i){el.addEventListener('click',function(){openLB(i);});});
  if(lb){
    document.getElementById('lbX').addEventListener('click',closeLB);
    document.getElementById('lbNext').addEventListener('click',function(){lbIdx=(lbIdx+1)%lbList.length;showImg();});
    document.getElementById('lbPrev').addEventListener('click',function(){lbIdx=(lbIdx-1+lbList.length)%lbList.length;showImg();});
    lb.addEventListener('click',function(e){if(e.target===lb)closeLB();});
    document.addEventListener('keydown',function(e){
      if(!lb.classList.contains('show'))return;
      if(e.key==='Escape')closeLB();
      else if(e.key==='ArrowRight'){lbIdx=(lbIdx+1)%lbList.length;showImg();}
      else if(e.key==='ArrowLeft'){lbIdx=(lbIdx-1+lbList.length)%lbList.length;showImg();}
      else if(e.key==='Tab'){ // trap focus among the 3 controls
        var f=[].slice.call(lb.querySelectorAll('button')); if(!f.length)return;
        var i=f.indexOf(document.activeElement);
        if(e.shiftKey){ if(i<=0){e.preventDefault();f[f.length-1].focus();} }
        else { if(i===f.length-1){e.preventDefault();f[0].focus();} }
      }
    });
  }

  /* ---- callback form (no backend -> mailto) ---- */
  var form=document.getElementById('cbForm');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=(document.getElementById('cbName').value||'').trim();
      var phone=(document.getElementById('cbPhone').value||'').trim();
      var need=document.getElementById('cbNeed').value;
      var msg=(document.getElementById('cbMsg').value||'').trim();
      var out=document.getElementById('cbMsgOut');
      if(!name||!phone){out.style.color='var(--primary)';out.textContent='Please add your name and a phone number.';return;}
      var subject='Website enquiry — '+need;
      var body='Name: '+name+'\nPhone: '+phone+'\nInterested in: '+need+'\n\n'+msg;
      window.location.href='mailto:'+STORE_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      out.style.color='var(--green)';out.textContent='Opening your email app to send… or just call (604) 764-8475.';
      form.reset();
    });
  }

  /* ---- hero carousel ---- */
  var car=document.getElementById('heroCarousel');
  if(car){
    var slides=[].slice.call(car.querySelectorAll('.slide'));
    var dotsWrap=document.getElementById('carDots'), cap=document.getElementById('carCap'), ci=0, timer=null;
    slides.forEach(function(s,i){var btn=document.createElement('button');btn.setAttribute('aria-label','Show photo '+(i+1));btn.addEventListener('click',function(){cgo(i);restartCar();});dotsWrap.appendChild(btn);});
    var dots=[].slice.call(dotsWrap.children); if(dots[0])dots[0].classList.add('on');
    function cgo(i){slides[ci].classList.remove('on');if(dots[ci])dots[ci].classList.remove('on');ci=i;slides[ci].classList.add('on');if(dots[ci])dots[ci].classList.add('on');if(cap)cap.textContent=slides[ci].getAttribute('data-cap')||'';}
    function cnext(){cgo((ci+1)%slides.length);}
    function cstart(){if(!reduce&&slides.length>1)timer=setInterval(cnext,3800);}
    function restartCar(){if(timer)clearInterval(timer);cstart();}
    cstart();
    car.addEventListener('mouseenter',function(){if(timer)clearInterval(timer);});
    car.addEventListener('mouseleave',cstart);
  }

  /* ---- reveal ---- */
  if('IntersectionObserver' in window && !reduce){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});}
  else document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});

  var yr=document.getElementById('yr'); if(yr)yr.textContent=new Date().getFullYear();
})();
