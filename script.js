// Universal Converter
function convert() {
    let value = parseFloat(document.getElementById('inputValue').value);
    let from = document.getElementById('inputUnit').value;
    let to = document.getElementById('outputUnit').value;
    if(isNaN(value)) { alert('Enter a valid number!'); return; }

    let meters = value;
    if(from==='km') meters=value*1000;
    if(from==='cm') meters=value/100;

    let result = meters;
    if(to==='km') result = meters/1000;
    if(to==='cm') result = meters*100;

    document.getElementById('result').innerText=`Result: ${result} ${to}`;
}

// Toggle productivity/fun/game sections
const cards = document.querySelectorAll('.tool-card');
cards.forEach(card => {
    card.addEventListener('click', ()=> {
        const id = card.id.split('-')[0];
        const sectionMap = {
            todo:'todo',
            pomodoro:'pomodoro',
            habit:'habit',
            meme:'meme',
            name:'name-gen',
            quiz:'quiz',
            clicker:'clicker',
            puzzle:'puzzle',
            challenge:'challenge'
        };
        Object.values(sectionMap).forEach(sec => document.getElementById(sec)?.classList.add('tool-hidden'));
        if(sectionMap[id]) document.getElementById(sectionMap[id]).classList.remove('tool-hidden');
    });
});

// To-Do List
let todoList = JSON.parse(localStorage.getItem('todos')) || [];
function renderTodos(){
    const ul = document.getElementById('todo-list'); ul.innerHTML='';
    todoList.forEach((task,i)=>{
        const li = document.createElement('li'); li.textContent=task;
        const del = document.createElement('button'); del.textContent='Delete'; del.onclick=()=>{todoList.splice(i,1); saveTodos(); renderTodos();};
        li.appendChild(del); ul.appendChild(li);
    });
}
function addTodo(){ const val=document.getElementById('todo-input').value; if(val){todoList.push(val); saveTodos(); renderTodos(); document.getElementById('todo-input').value='';} }
function saveTodos(){localStorage.setItem('todos',JSON.stringify(todoList);}
renderTodos();

// Pomodoro Timer
let pomodoroTime=1500, timerInterval=null, isRunning=false;
function startPomodoro(){ if(!isRunning){isRunning=true; timerInterval=setInterval(updatePomodoro,1000);} }
function pausePomodoro(){ clearInterval(timerInterval); isRunning=false; }
function resetPomodoro(){ clearInterval(timerInterval); pomodoroTime=1500; updatePomodoroDisplay(); isRunning=false; }
function updatePomodoro(){ pomodoroTime--; updatePomodoroDisplay(); if(pomodoroTime<=0){clearInterval(timerInterval);isRunning=false; alert('Pomodoro finished!');} }
function updatePomodoroDisplay(){ let min=Math.floor(pomodoroTime/60); let sec=pomodoroTime%60; document.getElementById('timer').innerText=`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}
updatePomodoroDisplay();

// Meme Generator
let memeImg=null; const canvas=document.getElementById('meme-canvas'); const ctx=canvas.getContext('2d');
document.getElementById('meme-img').onchange=function(e){const reader=new FileReader(); reader.onload=function(){memeImg=new Image(); memeImg.src=reader.result; memeImg.onload=()=>{canvas.width=memeImg.width/2; canvas.height=memeImg.height/2; ctx.drawImage(memeImg,0,0,canvas.width,canvas.height);}}; reader.readAsDataURL(e.target.files[0]);}
function generateMeme(){ if(!memeImg){alert('Upload image first'); return;} ctx.drawImage(memeImg,0,0,canvas.width,canvas.height); const text=document.getElementById('meme-text').value; ctx.font="30px Arial"; ctx.fillStyle="white"; ctx.fillText(text,10,40);}
function downloadMeme(){ const link=document.createElement('a'); link.download='meme.png'; link.href=canvas.toDataURL(); link.click();}

// Random Name Generator
function generateName(){ const names=["Farzeen","Nova","Luna","Zyra","Kai","Miko"]; document.getElementById('name-result').innerText=names[Math.floor(Math.random()*names.length)];}

// Quiz Generator
function answerQuiz(ans){ const res=document.getElementById('quiz-result'); res.innerText=ans===4?"Correct!":"Wrong!";}

// Clicker Game
let score=0; function clickerIncrement(){score++; document.getElementById('clicker-score').innerText=score;}

// Weather Widget (OpenWeather API)
async function getWeather(){
    const city=document.getElementById('city').value;
    if(!city){alert('Enter city'); return;}
    const key='473e7a02a18c4d14a41170951252810';
    try{
        const res=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`);
        const data=await res.json();
        if(data.cod!==200){ alert('City not found'); return; }
        document.getElementById('weather-text').innerText=`${data.name}: ${data.main.temp}°C, ${data.weather[0].description}`;
        document.getElementById('weather-icon').src=`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    }catch(e){ alert('Error fetching weather'); }
}
