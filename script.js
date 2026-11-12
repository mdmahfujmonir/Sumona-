/* শুভ জন্মদিন সুরভি — script.js
   কাউন্টার, হার্ট ক্যানভাস, গ্যালারি, ২৫ কারণ, মাইক/ট্যাপ কেক, কনফেত্তি, চিঠি, গান */
(function () {
  'use strict';

  /* বাংলা সংখ্যা */
  var BN = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  function bn(n) { return String(n).replace(/[0-9]/g, function (d) { return BN[+d]; }); }
  function pad2(n) { return (n < 10 ? '০' : '') + bn(n); }

  /* ---------- ১. লাইভ কাউন্টার: ১৪ নভেম্বর ২০০৫ থেকে, প্রতি সেকেন্ডে ---------- */
  var birth = new Date(2005, 10, 14, 0, 0, 0); // মাস ১০ = নভেম্বর
  function tickCounter() {
    var diff = Date.now() - birth.getTime();
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor(diff / 3600000) % 24;
    var mins = Math.floor(diff / 60000) % 60;
    var secs = Math.floor(diff / 1000) % 60;
    var d = document.getElementById('cDays'), h = document.getElementById('cHours'),
        m = document.getElementById('cMins'), s = document.getElementById('cSecs');
    if (d) d.textContent = bn(days);
    if (h) h.textContent = pad2(hours);
    if (m) m.textContent = pad2(mins);
    if (s) s.textContent = pad2(secs);
  }
  tickCounter();
  setInterval(tickCounter, 1000);

  /* ---------- ২. হার্ট ক্যানভাস: প্রজাপতি/কণা দিয়ে হার্ট আঁকা ---------- */
  var canvas = document.getElementById('heartCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    function heartPoint(t) { // parametric heart equation
      var x = 16 * Math.pow(Math.sin(t), 3);
      var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return { x: W / 2 + x * 15, y: H / 2 - 6 - y * 15 };
    }
    var targets = [];
    for (var i = 0; i < 520; i++) { targets.push(heartPoint(Math.random() * Math.PI * 2)); }
    var sprites = targets.map(function (p, idx) {
      return {
        tx: p.x, ty: p.y,
        x: Math.random() * W, y: Math.random() * H,
        size: 2 + Math.random() * 4.5,
        hue: idx % 5 === 0 ? '255,180,60' : (idx % 3 === 0 ? '255,143,163' : '255,77,109'),
        kind: idx % 9 === 0 ? '🦋' : (idx % 7 === 0 ? '✦' : '●'),
        speed: 0.02 + Math.random() * 0.035,
        wob: Math.random() * Math.PI * 2
      };
    });
    var bgStars = [];
    for (var s = 0; s < 70; s++) bgStars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2, p: Math.random() * 6 });
    var frame = 0;
    function drawHeart() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      bgStars.forEach(function (st) {
        ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(frame / 40 + st.p));
        ctx.fillStyle = '#f3d9a4'; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
      sprites.forEach(function (sp) {
        sp.x += (sp.tx - sp.x) * sp.speed; sp.y += (sp.ty - sp.y) * sp.speed;
        sp.wob += 0.06;
        var ox = Math.sin(sp.wob) * 3, oy = Math.cos(sp.wob * 1.3) * 3;
        if (sp.kind === '●') {
          ctx.fillStyle = 'rgba(' + sp.hue + ',0.95)';
          ctx.beginPath(); ctx.arc(sp.x + ox, sp.y + oy, sp.size, 0, 7); ctx.fill();
        } else {
          ctx.font = (sp.size * 4) + 'px serif';
          ctx.fillText(sp.kind, sp.x + ox, sp.y + oy);
        }
      });
      requestAnimationFrame(drawHeart);
    }
    drawHeart();
  }

  /* ---------- ৩. স্ক্রল-রিভিল ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- ৪. গ্যালারি স্লাইডশো: ফেড/স্লাইড, ডট, কাউন্টার, অটো ---------- */
  var photos = [
    { src: 'assets/surovi-01.jpg', cap: 'তোমার হাসি — দিনটাকে আলো করে দেয়' },
    { src: 'assets/surovi-02.jpg', cap: 'তোমার চোখে একটা শান্ত আলো আছে' },
    { src: 'assets/surovi-03.jpg', cap: 'এই মুহূর্তটা শুধু তোমার' },
    { src: 'assets/surovi-04.jpg', cap: 'তুমি যেখানেই থাকো, দিনটা সুন্দর লাগে' },
    { src: 'assets/surovi-05.jpg', cap: 'তোমার সরলতাই তোমার সবচেয়ে বড় সৌন্দর্য' },
    { src: 'assets/surovi-06.jpg', cap: 'শুভ জন্মদিন, সুরভি — সামনের দিনগুলো আরও সুন্দর হোক' }
  ];
  var img = document.getElementById('slideImg'), cap = document.getElementById('slideCaption'),
      counterEl = document.getElementById('slideCounter'), dotsBox = document.getElementById('dots');
  var slideIdx = 0, autoTimer = null;
  photos.forEach(function (_, i) {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'ছবি ' + bn(i + 1));
    b.addEventListener('click', function () { showSlide(i); restartAuto(); });
    dotsBox.appendChild(b);
  });
  function showSlide(i) {
    slideIdx = (i + photos.length) % photos.length;
    img.classList.add('fading');
    setTimeout(function () {
      img.src = photos[slideIdx].src; img.alt = 'সুরভির ছবি ' + bn(slideIdx + 1);
      cap.textContent = photos[slideIdx].cap;
      counterEl.textContent = bn(slideIdx + 1) + ' / ' + bn(photos.length);
      dotsBox.querySelectorAll('button').forEach(function (d, j) { d.classList.toggle('active', j === slideIdx); });
      img.classList.remove('fading');
    }, 320);
  }
  function restartAuto() { clearInterval(autoTimer); autoTimer = setInterval(function () { showSlide(slideIdx + 1); }, 4500); }
  document.getElementById('prevBtn').addEventListener('click', function () { showSlide(slideIdx - 1); restartAuto(); });
  document.getElementById('nextBtn').addEventListener('click', function () { showSlide(slideIdx + 1); restartAuto(); });
  showSlide(0); restartAuto();

  /* ---------- ৫. ২৫টি কারণ (JS array), র‍্যান্ডম, কাউন্টার ১/২৫, হার্ট-বার্স্ট ---------- */
  var reasons = [
    'কারণ তোমার হাসি দেখলে মনটা হালকা হয়ে যায়।',
    'কারণ তুমি মানুষকে সম্মান দিয়ে কথা বলো।',
    'কারণ তোমার সরলতায় একটা আলাদা সৌন্দর্য আছে।',
    'কারণ তুমি ছোট ছোট জিনিসেও আনন্দ খুঁজে পাও।',
    'কারণ তোমার সঙ্গে কথা বললে সময়টা সুন্দর কাটে।',
    'কারণ তুমি নিজের মতো করে বাঁচতে জানো।',
    'কারণ তোমার ধৈর্য দেখে আমি মুগ্ধ হই।',
    'কারণ তুমি কঠিন সময়েও হাল ছাড়ো না।',
    'কারণ তোমার মনটা পরিষ্কার আর সৎ।',
    'কারণ তুমি পরিবারকে অনেক ভালোবাসো।',
    'কারণ তোমার উপস্থিতিতেই পরিবেশটা ভালো লাগে।',
    'কারণ তুমি অন্যের ভালো চাও — নিঃস্বার্থভাবে।',
    'কারণ তোমার কথা বলার ভঙ্গিটা খুব মিষ্টি।',
    'কারণ তুমি শিখতে আর নিজেকে ভালো করতে চাও।',
    'কারণ তোমার চোখে স্বপ্ন দেখা যায়।',
    'কারণ তুমি বন্ধুত্বের মূল্য বোঝো।',
    'কারণ তুমি কাউকে ছোট করে দেখো না।',
    'কারণ তোমার হাসির শব্দটা দিনটাকে ভালো করে দেয়।',
    'কারণ তুমি সত্যি কথা বলতে ভয় পাও না।',
    'কারণ তুমি নিজের ভুল স্বীকার করতে পারো।',
    'কারণ তোমার সঙ্গে থাকলে আমি নিজেকে ভালো মানুষ মনে করি।',
    'কারণ তুমি প্রতিদিন একটু একটু করে এগিয়ে যাচ্ছো।',
    'কারণ তোমার ভবিষ্যৎ নিয়ে তোমার একটা সুন্দর স্বপ্ন আছে।',
    'কারণ তুমি যেমন আছো, ঠিক তেমনই সুন্দর।',
    'কারণ আজ তোমার জন্মদিন — আর এই দিনটা তোমার মতোই বিশেষ।'
  ];
  var shown = [], reasonBtn = document.getElementById('reasonBtn'),
      reasonText = document.getElementById('reasonText'), reasonCount = document.getElementById('reasonCount'),
      reasonHeart = document.getElementById('reasonHeart');
  reasonBtn.addEventListener('click', function () {
    if (shown.length >= reasons.length) { shown = []; }
    var pick;
    do { pick = Math.floor(Math.random() * reasons.length); } while (shown.indexOf(pick) !== -1);
    shown.push(pick);
    reasonText.textContent = reasons[pick];
    reasonCount.textContent = bn(shown.length);
    reasonHeart.classList.remove('burst'); void reasonHeart.offsetWidth; reasonHeart.classList.add('burst');
    reasonBtn.textContent = shown.length >= reasons.length ? 'আবার শুরু থেকে দেখো' : 'আরেকটা কারণ দেখো';
  });

  /* ---------- ৬. কনফেত্তি ---------- */
  function confetti() {
    var box = document.getElementById('confetti');
    var colors = ['#ff4d6d', '#ffd166', '#d4af69', '#ff8fa3', '#7bdff2', '#fff'];
    for (var i = 0; i < 90; i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (2.2 + Math.random() * 2.4) + 's';
      p.style.animationDelay = (Math.random() * 0.7) + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      box.appendChild(p);
      (function (el) { setTimeout(function () { el.remove(); }, 6000); })(p);
    }
  }

  /* ---------- ৭. কেক: মোমবাতি, মাইক ফুঁ, ট্যাপ ---------- */
  var candles = Array.prototype.slice.call(document.querySelectorAll('.candle'));
  var outCount = 0, wishDone = false;
  var blowStatus = document.getElementById('blowStatus'), blowFill = document.getElementById('blowFill'),
      micNote = document.getElementById('micNote');
  function blowOne() {
    if (wishDone) return;
    var next = candles[outCount];
    if (!next) return;
    next.classList.add('out'); outCount++;
    blowStatus.textContent = outCount < 3
      ? 'একটি মোমবাতি নিভলো! আর ' + bn(3 - outCount) + 'টি বাকি…'
      : 'সব মোমবাতি নিভে গেছে — তোমার ইচ্ছে পূরণ হোক! 🎉';
    if (outCount >= 3) { wishDone = true; confetti(); openLetter(true); }
  }
  candles.forEach(function (c) { c.addEventListener('click', blowOne); });
  document.getElementById('tapBtn').addEventListener('click', blowOne);

  var micStream = null, micOn = false;
  document.getElementById('micBtn').addEventListener('click', function () {
    if (micOn) { blowStatus.textContent = 'মাইক চালু আছে — জোরে ফুঁ দাও!'; return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micNote.textContent = 'এই ব্রাউজারে মাইক চালু করা যাচ্ছে না — মোমবাতিতে ট্যাপ করো।';
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      micOn = true; micStream = stream;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      var actx = new AudioCtx();
      var src = actx.createMediaStreamSource(stream);
      var analyser = actx.createAnalyser(); analyser.fftSize = 512; src.connect(analyser);
      var data = new Uint8Array(analyser.frequencyBinCount);
      blowStatus.textContent = 'মাইক চালু! এবার জোরে ফুঁ দাও…';
      micNote.textContent = '';
      (function listen() {
        if (wishDone) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
        analyser.getByteTimeDomainData(data);
        var vol = 0;
        for (var i = 0; i < data.length; i++) vol = Math.max(vol, Math.abs(data[i] - 128));
        blowFill.style.width = Math.min(100, vol * 2.4) + '%';
        if (vol > 32) blowOne(); // ফুঁ শনাক্ত — ভলিউম থ্রেশহোল্ড
        requestAnimationFrame(listen);
      })();
    }).catch(function () {
      micNote.textContent = 'মাইকের অনুমতি দেওয়া হয়নি — চিন্তা নেই, মোমবাতিতে ট্যাপ করলেই নিভবে।';
      blowStatus.textContent = 'মোমবাতিতে ট্যাপ করে নেভাও।';
    });
  });

  /* ---------- ৮. চিঠি: খাম খোলা ---------- */
  var envelope = document.getElementById('envelope'), letterCard = document.getElementById('letterCard');
  function openLetter(auto) {
    envelope.classList.add('open');
    letterCard.hidden = false;
    letterCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (auto) confetti();
  }
  document.getElementById('openLetterBtn').addEventListener('click', function () { openLetter(false); });
  document.getElementById('againBtn').addEventListener('click', function () {
    candles.forEach(function (c) { c.classList.remove('out'); });
    outCount = 0; wishDone = false;
    blowStatus.textContent = 'মোমবাতি আবার জ্বলছে — নতুন করে ইচ্ছে করো।';
    document.getElementById('wish').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('memoriesBtn').addEventListener('click', function () {
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- ৯. গান: Web Audio-তে নরম সুর (কোনো ফাইল লাগে না) ---------- */
  var musicBtn = document.getElementById('musicBtn'), musicCtx = null, musicTimer = null, musicPlaying = false;
  var notes = [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33];
  function playNote(freq, when, dur) {
    var o = musicCtx.createOscillator(), g = musicCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.08, when + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(musicCtx.destination);
    o.start(when); o.stop(when + dur + 0.1);
  }
  musicBtn.addEventListener('click', function () {
    if (!musicPlaying) {
      if (!musicCtx) musicCtx = new (window.AudioContext || window.webkitAudioContext)();
      musicCtx.resume();
      var step = 0;
      var loop = function () {
        var t = musicCtx.currentTime + 0.05;
        playNote(notes[step % notes.length], t, 0.9);
        playNote(notes[step % notes.length] / 2, t, 1.1);
        step++;
      };
      loop(); musicTimer = setInterval(loop, 950);
      musicPlaying = true; musicBtn.textContent = '⏸️ গান বন্ধ করুন';
    } else {
      clearInterval(musicTimer); musicPlaying = false;
      musicBtn.textContent = '🎵 গান চালু করুন';
    }
  });
})();
