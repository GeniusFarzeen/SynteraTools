document.addEventListener('DOMContentLoaded', () => {
  /* ===== SETUP ===== */
  // OpenWeather key you provided
  const OPENWEATHER_KEY = '473e7a02a18c4d14a41170951252810';

  /* ---------- UI helpers ---------- */
  const showPanel = (id) => {
    document.querySelectorAll('.tool-panel').forEach(p => p.hidden = true);
    const el = document.getElementById(id);
    if (el) el.hidden = false;
    // scroll into view slightly
    if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
  };

  // Card clicks
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const tool = card.getAttribute('data-tool');
      if (tool) showPanel(tool);
    });
  });

  /* ===== CONVERTER ===== */
  const inputCategory = document.getElementById('inputCategory');
  const converterRows = document.getElementById('converter-rows');
  const inputValue = document.getElementById('inputValue');
  const resultEl = document.getElementById('result');

  // Build UI rows depending on category
  function buildConverterUI() {
    converterRows.innerHTML = '';
    const cat = inputCategory.value;
    if (cat === 'length') {
      converterRows.innerHTML = `
        <div class="row">
          <select id="fromUnit">
            <option value="m">Meter (m)</option>
            <option value="km">Kilometer (km)</option>
            <option value="cm">Centimeter (cm)</option>
            <option value="in">Inch (in)</option>
            <option value="ft">Feet (ft)</option>
          </select>
          <select id="toUnit">
            <option value="m">Meter (m)</option>
            <option value="km">Kilometer (km)</option>
            <option value="cm">Centimeter (cm)</option>
            <option value="in">Inch (in)</option>
            <option value="ft">Feet (ft)</option>
          </select>
        </div>`;
    } else if (cat === 'temperature') {
      converterRows.innerHTML = `
        <div class="row">
          <select id="fromUnit">
            <option value="c">Celsius (°C)</option>
            <option value="f">Fahrenheit (°F)</option>
            <option value="k">Kelvin (K)</option>
          </select>
          <select id="toUnit">
            <option value="c">Celsius (°C)</option>
            <option value="f">Fahrenheit (°F)</option>
            <option value="k">Kelvin (K)</option>
          </select>
        </div>`;
    } else if (cat === 'filesize') {
      converterRows.innerHTML = `
        <div class="row">
          <select id="fromUnit">
            <option value="b">Bytes</option>
            <option value="kb">KB</option>
            <option value="mb">MB</option>
            <option value="gb">GB</option>
          </select>
          <select id="toUnit">
            <option value="b">Bytes</option>
            <option value="kb">KB</option>
            <option value="mb">MB</option>
            <option value="gb">GB</option>
          </select>
        </div>`;
    }
  }
  inputCategory.addEventListener('change', buildConverterUI);
  buildConverterUI();

  function convertValue() {
    const cat = inputCategory.value;
    const val = parseFloat(inputValue.value);
    if (isNaN(val)) { alert('Enter a valid number'); return; }
    const from = document.getElementById('fromUnit').value;
    const to = document.getElementById('toUnit').value;
    let out = val;

    if (cat === 'length') {
      // convert to meters
      const toMeters = { m:1, km:1000, cm:0.01, in:0.0254, ft:0.3048 };
      const meters = val * toMeters[from];
      out = meters / toMeters[to];
      resultEl.innerText = `Result: ${Number(out.toFixed(6))} ${to}`;
    } else if (cat === 'temperature') {
      // convert any to celsius then to target
      function toC(v, u){
        if(u==='c') return v;
        if(u==='f') return (v - 32) * 5/9;
        if(u==='k') return v - 273.15;
      }
      function fromC(v, u){
        if(u==='c') return v;
        if(u==='f') return v * 9/5 + 32;
        if(u==='k') return v + 273.15;
      }
      const c = toC(val, from);
      out = fromC(c, to);
      resultEl.innerText = `Result: ${Number(out.toFixed(2))} ${to.toUpperCase()}`;
    } else if (cat === 'filesize') {
      const mult = { b:1, kb:1024, mb:1024**2, gb:1024**3 };
      const bytes = val * mult[from];
      out = bytes / mult[to];
      resultEl.innerText = `Result: ${Number(out.toFixed(4))} ${to.toUpperCase()}`;
    }
  }
  document.getElementById('convertBtn').addEventListener('click', convertValue);

  /* ===== TODO LIST ===== */
  const todoInput = document.getElementById('todo-input');
  const todoListEl = document.getElementById('todo-list');
  const TODOS_KEY = 'syn_todos_v1';
  let todos = JSON.parse(localStorage.getItem(TODOS_KEY) || '[]');

  function renderTodos(){
    todoListEl.innerHTML = '';
    todos.forEach((t,i)=>{
      const li = document.createElement('li');
      li.textContent = t;
      const del = document.createElement('button'); del.textContent='Delete';
      del.addEventListener('click', ()=>{ todos.splice(i,1); saveTodos(); renderTodos(); });
      li.appendChild(del);
      todoListEl.appendChild(li);
    });
  }
  function saveTodos(){ localStorage.setItem(TODOS_KEY, JSON.stringify(todos)); }
  document.getElementById('todo-add').addEventListener('click', ()=>{
    const v = todoInput.value.trim();
    if(!v) return;
    todos.push(v); todoInput.value=''; saveTodos(); renderTodos();
  });
  renderTodos();

  /* ===== POMODORO ===== */
  let pomTime = 25*60;
  let pomTimer = null;
  const timerDisplay = document.getElementById('timer-display');
  function updateTimer(){ const m = Math.floor(pomTime/60); const s = pomTime%60; timerDisplay.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
  document.getElementById('pom-start').addEventListener('click', ()=>{
    if(pomTimer) return;
    pomTimer = setInterval(()=>{ pomTime--; updateTimer(); if(pomTime<=0){ clearInterval(pomTimer); pomTimer=null; alert('Pomodoro finished!'); } }, 1000);
  });
  document.getElementById('pom-pause').addEventListener('click', ()=>{ if(pomTimer){ clearInterval(pomTimer); pomTimer=null; }});
  document.getElementById('pom-reset').addEventListener('click', ()=>{ if(pomTimer){ clearInterval(pomTimer); pomTimer=null; } pomTime = 25*60; updateTimer(); });
  updateTimer();

  /* ===== HABIT TRACKER ===== */
  const habitChecks = document.querySelectorAll('.habit-list input[type="checkbox"]');
  const HAB_KEY = 'syn_habits_v1';
  const storedHab = JSON.parse(localStorage.getItem(HAB_KEY) || '{}');
  habitChecks.forEach(cb => {
    const k = cb.dataset.habit;
    cb.checked = !!storedHab[k];
    cb.addEventListener('change', ()=> {
      storedHab[k] = cb.checked;
      localStorage.setItem(HAB_KEY, JSON.stringify(storedHab));
    });
  });

  /* ===== MEME GENERATOR ===== */
  const memeFile = document.getElementById('meme-file');
  const memeCanvas = document.getElementById('meme-canvas');
  const memeCtx = memeCanvas.getContext ? memeCanvas.getContext('2d') : null;
  let memeImg = null;

  memeFile.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      memeImg = new Image();
      memeImg.onload = () => {
        // limit width for canvas to 800 for safety
        const maxW = 800;
        const ratio = memeImg.width > maxW ? maxW / memeImg.width : 1;
        memeCanvas.width = memeImg.width * ratio;
        memeCanvas.height = memeImg.height * ratio;
        memeCtx.drawImage(memeImg, 0, 0, memeCanvas.width, memeCanvas.height);
      }
      memeImg.src = reader.result;
    }
    reader.readAsDataURL(f);
  });

  document.getElementById('meme-gen').addEventListener('click', () => {
    if(!memeImg){ alert('Upload image first'); return; }
    memeCtx.drawImage(memeImg, 0, 0, memeCanvas.width, memeCanvas.height);
    const text = document.getElementById('meme-text').value || '';
    memeCtx.font = `${Math.max(18, memeCanvas.width * 0.05)}px Arial`;
    memeCtx.fillStyle = 'white';
    memeCtx.strokeStyle = 'black';
    memeCtx.lineWidth = Math.max(2, memeCanvas.width * 0.004);
    const x = 10;
    const y = 40;
    memeCtx.strokeText(text, x, y);
    memeCtx.fillText(text, x, y);
  });

  document.getElementById('meme-download').addEventListener('click', () => {
    if(!memeCanvas.toDataURL) return alert('No meme to download');
    const link = document.createElement('a');
    link.href = memeCanvas.toDataURL('image/png');
    link.download = 'meme.png';
    link.click();
  });

  /* ===== NAME GENERATOR ===== */
  const nameList = ["Farzeen","Nova","Luna","Zyra","Kai","Miko","Orion","Riven","Axel","Ivy","Echo","Nyx"];
  document.getElementById('gen-name').addEventListener('click', () => {
    const pick = nameList[Math.floor(Math.random()*nameList.length)];
    document.getElementById('name-result').textContent = pick;
  });

  /* ===== QUIZ ===== */
  const quizCorrect = '8'; // sample
  document.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const res = document.getElementById('quiz-res');
      if(btn.textContent === quizCorrect) { res.textContent = 'Correct 🎉'; res.style.color = '#8fffb8' }
      else { res.textContent = 'Wrong — try again'; res.style.color = '#ffb3b3' }
    });
  });

  /* ===== CLICKER ===== */
  let score = 0;
  const scoreEl = document.getElementById('clicker-score');
  document.getElementById('clicker-btn').addEventListener('click', ()=>{ score++; scoreEl.textContent = score; });

  /* ===== PUZZLE (simple swap-based) ===== */
  const puzzleBoard = document.getElementById('puzzle-board');
  const puzzleImgSrc = 'images/puzzle.png';
  let puzzleTiles = [];
  let firstPick = null;

  function buildPuzzle() {
    puzzleBoard.innerHTML = '';
    puzzleTiles = [];
    const rows = 3, cols = 3;
    // create 9 tiles, using css object-position to show parts of the same image
    for (let i=0;i<rows*cols;i++){
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      const img = document.createElement('img');
      img.src = puzzleImgSrc;
      img.dataset.index = i;
      // we'll use CSS clip via object-position; set width height via CSS already
      img.style.objectPosition = `${(i%cols)*(-100)/ (cols-1)}% ${Math.floor(i/cols)*(-100)/(rows-1)}%`;
      tile.appendChild(img);
      tile.addEventListener('click', ()=> {
        if(!firstPick){ firstPick = tile; tile.style.outline = '2px solid rgba(159,103,255,0.8)'; }
        else {
          // swap image src/objectPosition by swapping dataset.index
          const img1 = firstPick.querySelector('img');
          const img2 = tile.querySelector('img');
          const temp = img1.style.objectPosition;
          img1.style.objectPosition = img2.style.objectPosition;
          img2.style.objectPosition = temp;
          firstPick.style.outline = 'none';
          firstPick = null;
        }
      });
      puzzleBoard.appendChild(tile);
      puzzleTiles.push(tile);
    }
  }
  document.getElementById('puzzle-shuffle').addEventListener('click', ()=> {
    // shuffle objectPosition styles randomly
    const positions = puzzleTiles.map((t,i)=>{
      return t.querySelector('img').style.objectPosition;
    });
    // shuffle positions
    for(let i=positions.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    puzzleTiles.forEach((t,i)=> t.querySelector('img').style.objectPosition = positions[i]);
  });
  buildPuzzle();

  /* ===== WEATHER ===== */
  document.getElementById('get-weather').addEventListener('click', async () => {
    const city = document.getElementById('city-input').value.trim();
    if(!city) return alert('Enter a city');
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`);
      const data = await res.json();
      if(data.cod && data.cod !== 200){ return alert('City not found'); }
      document.getElementById('weather-city').textContent = `${data.name}, ${data.sys.country}`;
      document.getElementById('weather-desc').textContent = data.weather[0].description;
      document.getElementById('weather-temp').textContent = `${data.main.temp} °C`;
      document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      document.getElementById('weather-box').classList.remove('hidden');
    } catch (e) {
      console.error(e);
      alert('Weather error');
    }
  });

  /* optional: keyboard quick open tools via numbers */
  window.addEventListener('keydown', (e) => {
    if(e.key === '1') showPanel('todo');
    if(e.key === '2') showPanel('pomodoro');
    if(e.key === '3') showPanel('meme');
  });

}); // DOMContentLoaded end
