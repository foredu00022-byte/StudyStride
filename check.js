

/* =========================
   STUDY PLAN
========================= */

const PLAN = [
["Day 1","Bhadra 21","C. Math","English"],
["Day 2","Bhadra 22","Science","Social"],
["Day 3","Bhadra 23","O. Math","Nepali"],
["Day 4","Bhadra 24","C. Math","Computer"],
["Day 5","Bhadra 25","Science","English"],
["Day 6","Bhadra 26","O. Math","Social"],
["Day 7","Bhadra 27","C. Math","Nepali"],
["Day 8","Bhadra 28","Science","Computer"],
["Day 9","Bhadra 29","O. Math","English"],
["Day 10","Bhadra 30","C. Math","Social"],
["Day 11","Ashoj 1","Science","Nepali"],
["Day 12","Ashoj 2","O. Math","Computer"],
["Day 13","Ashoj 3","Weakest Heavy Subject","Weakest Theory Subject"],
["Day 14","Ashoj 4","Full Heavy Revision","Full Theory Revision"]
];

const EXERCISES = [
["Push-ups","Comfortable target"],
["Bodyweight Squats","Controlled reps"],
["Core Exercise","Safe variation"],
["Shadow Boxing","Technique + movement"],
["Mobility","A few minutes"]
];

const SUBJECTS=[
"All","C. Math","O. Math","Science",
"Social","English","Nepali","Computer","General"
];


/* =========================
   DATA SYSTEM - BULLETPROOF
========================= */

const DEFAULT_DATA = {
completedDays: [],
dayNotes: {},
tasks: [],
dailyNotes: "",
focusMinutes: 0,
focusSessions: [],
workoutSessions: [],
workoutChecks: {},
workoutNote: "",
vault: [],
flashcards: [],
flashXP: 0,
flashReviewed: 0,
calendarEvents: [],
habitStacks: [],
biometrics: [],
aiHistory: [],
importantQuestions: [],
mastery: [],
exams: [],
nextWeekFocus: "",
settings: {theme:"dark", density:"comfortable", displayName:"Yubaraj", apiEndpoint:"", apiModel:"", apiKey:""}
};

let savedData = {};

try {
  savedData = JSON.parse(localStorage.getItem("seeCommandData")) || {};
} catch(error) {
  savedData = {};
}

let data = {
  ...DEFAULT_DATA,
  ...savedData
};

/* FORCE CORRECT DATA TYPES */
if(!Array.isArray(data.completedDays)) data.completedDays=[];
if(typeof data.dayNotes !== "object" || data.dayNotes===null) data.dayNotes={};
if(!Array.isArray(data.tasks)) data.tasks=[];
if(!Array.isArray(data.focusSessions)) data.focusSessions=[];
if(!Array.isArray(data.workoutSessions)) data.workoutSessions=[];
if(typeof data.workoutChecks !== "object" || data.workoutChecks===null) data.workoutChecks={};
if(!Array.isArray(data.vault)) data.vault=[];
if(!Array.isArray(data.flashcards)) data.flashcards=[];
if(typeof data.flashXP !== "number") data.flashXP=0;
if(typeof data.flashReviewed !== "number") data.flashReviewed=0;
if(!Array.isArray(data.calendarEvents)) data.calendarEvents=[];
if(!Array.isArray(data.habitStacks)) data.habitStacks=[];
if(!Array.isArray(data.biometrics)) data.biometrics=[];
if(!Array.isArray(data.aiHistory)) data.aiHistory=[];
if(!Array.isArray(data.importantQuestions)) data.importantQuestions=[];
if(!Array.isArray(data.mastery)) data.mastery=[];
if(!Array.isArray(data.exams)) data.exams=[];
if(typeof data.nextWeekFocus!=="string") data.nextWeekFocus="";
if(typeof data.settings !== "object" || data.settings===null) data.settings={...DEFAULT_DATA.settings};
if(typeof data.focusMinutes !== "number") data.focusMinutes=0;
if(typeof data.dailyNotes !== "string") data.dailyNotes="";
if(typeof data.workoutNote !== "string") data.workoutNote="";

let vaultFilter="All";


function save(){
  try{
    localStorage.setItem("seeCommandData",JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("studystride:data-changed",{detail:data}));
  }catch(error){
    console.error("Storage error:",error);
    alert("Could not save data. Browser storage may be full.");
  }
  updateDashboard();
}


function escapeHTML(str=""){
  const div=document.createElement("div");
  div.textContent=String(str);
  return div.innerHTML;
}


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    switchTab(btn.dataset.tab);
  });
});

function switchTab(tab){

  document.querySelectorAll(".panel").forEach(panel=>{
    panel.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.classList.remove("active");
  });

  document.getElementById(tab).classList.add("active");

  const button=document.querySelector(`[data-tab="${tab}"]`);
  if(button) button.classList.add("active");

  if(tab==="analytics") updateCharts();
}


/* =========================
   STUDY PLAN
========================= */

function renderPlan(){

  const grid=document.getElementById("daysGrid");
  grid.innerHTML="";

  PLAN.forEach((day,index)=>{

    const done=data.completedDays.includes(index);

    const card=document.createElement("div");

    card.className="card day-card"+(done?" done":"");

    card.innerHTML=`
      <div class="day-top">
        <span class="day-num">${day[0]}</span>
        <span class="day-date">${day[1]}</span>
      </div>

      <div class="badge heavy">🧠 ${day[2]}</div>
      <div class="badge light">📖 ${day[3]}</div>

      <textarea class="notes"
      placeholder="Specific topics / chapters..."
      onchange="saveDayNote(${index},this.value)">${escapeHTML(data.dayNotes[index]||"")}</textarea>

      <div class="day-controls">
        <button class="small-btn done-btn"
        onclick="toggleDay(${index})">
        ${done?"✓ Completed":"Mark Complete"}
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}


function toggleDay(index){

  if(data.completedDays.includes(index)){
    data.completedDays=data.completedDays.filter(x=>x!==index);
  }else{
    data.completedDays.push(index);
  }

  save();
  renderPlan();
}


function saveDayNote(index,value){
  data.dayNotes[index]=value;
  save();
}


/* =========================
   TASKS
========================= */

function renderTasks(){

  const list=document.getElementById("taskList");

  if(data.tasks.length===0){
    list.innerHTML="<p class='muted' style='padding:15px 0'>No tasks yet.</p>";
    return;
  }

  list.innerHTML="";

  data.tasks.forEach((task,index)=>{

    const div=document.createElement("div");

    div.className="task-item"+(task.done?" done-task":"");

    div.innerHTML=`
      <input type="checkbox"
      ${task.done?"checked":""}
      onchange="toggleTask(${index})">

      <span>${escapeHTML(task.text)}</span>

      <button class="delete"
      onclick="deleteTask(${index})">×</button>
    `;

    list.appendChild(div);
  });
}


function addTask(){

  const input=document.getElementById("taskInput");
  const text=input.value.trim();

  if(!text) return;

  data.tasks.unshift({
    text:text,
    done:false,
    created:new Date().toISOString()
  });

  input.value="";

  save();
  renderTasks();
}


document.getElementById("taskInput").addEventListener("keydown",function(e){
  if(e.key==="Enter") addTask();
});


function toggleTask(index){
  data.tasks[index].done=!data.tasks[index].done;
  save();
  renderTasks();
}


function deleteTask(index){
  data.tasks.splice(index,1);
  save();
  renderTasks();
}


function saveDailyNotes(){
  data.dailyNotes=document.getElementById("dailyNotes").value;
  save();
}


/* =========================
   KNOWLEDGE VAULT
========================= */

function toggleVaultFields(){

  const type=document.getElementById("vaultType").value;
  const content=document.getElementById("vaultContent");
  const url=document.getElementById("vaultUrl");

  if(type==="note"){
    content.style.display="block";
    url.style.display="none";
  }else{
    content.style.display="none";
    url.style.display="block";
  }
}


function addVaultItem(){

  /* EXTRA SAFETY */
  if(!Array.isArray(data.vault)){
    data.vault=[];
  }

  const type=document.getElementById("vaultType").value;
  const subject=document.getElementById("vaultSubject").value;
  const chapter=document.getElementById("vaultChapter").value.trim();
  const title=document.getElementById("vaultTitle").value.trim();
  const content=document.getElementById("vaultContent").value.trim();
  const url=document.getElementById("vaultUrl").value.trim();

  if(title===""){
    alert("Please give your note/resource a title.");
    return;
  }

  if(type==="note" && content===""){
    alert("Please write some content for your note.");
    return;
  }

  if(type==="resource" && url===""){
    alert("Please paste a resource URL.");
    return;
  }

  const newItem={
    id:Date.now()+Math.floor(Math.random()*1000),
    type:type,
    subject:subject,
    chapter:chapter,
    title:title,
    content:type==="note"?content:"",
    url:type==="resource"?url:"",
    pinned:false,
    created:new Date().toLocaleString()
  };

  data.vault.unshift(newItem);

  /* CLEAR FORM */
  document.getElementById("vaultChapter").value="";
  document.getElementById("vaultTitle").value="";
  document.getElementById("vaultContent").value="";
  document.getElementById("vaultUrl").value="";

  save();
  renderVault();

  /* VISUAL CONFIRMATION */
  alert("✓ Added to Knowledge Vault!");
}


function setVaultFilter(filter){

  vaultFilter=filter;

  document.querySelectorAll(".filter-btn").forEach(btn=>{
    btn.classList.toggle(
      "active",
      btn.dataset.filter===filter
    );
  });

  renderVault();
}


function renderSubjectFilters(){

  const container=document.getElementById("subjectFilters");

  container.innerHTML="";

  SUBJECTS.slice(1).forEach(subject=>{

    const count=data.vault.filter(item=>
      item.subject===subject
    ).length;

    if(count===0) return;

    const btn=document.createElement("button");

    btn.className="filter-btn";
    btn.textContent=`${subject} (${count})`;

    btn.onclick=()=>{
      vaultFilter=subject;

      document.querySelectorAll(".filter-btn").forEach(x=>{
        x.classList.remove("active");
      });

      renderVault();
    };

    container.appendChild(btn);
  });
}


function renderVault(){

  if(!Array.isArray(data.vault)){
    data.vault=[];
  }

  const grid=document.getElementById("vaultGrid");

  const searchInput=document.getElementById("vaultSearch");

  const search=searchInput
    ?searchInput.value.toLowerCase()
    :"";

  let items=data.vault.filter(item=>{

    const searchable=(
      item.title+" "+
      item.subject+" "+
      item.chapter+" "+
      item.content+" "+
      item.url
    ).toLowerCase();

    const matchesSearch=searchable.includes(search);

    let matchesFilter=true;

    if(vaultFilter==="note"){
      matchesFilter=item.type==="note";
    }
    else if(vaultFilter==="resource"){
      matchesFilter=item.type==="resource";
    }
    else if(vaultFilter==="Pinned"){
      matchesFilter=item.pinned===true;
    }
    else if(vaultFilter!=="All"){
      matchesFilter=item.subject===vaultFilter;
    }

    return matchesSearch && matchesFilter;
  });

  items.sort((a,b)=>Number(b.pinned)-Number(a.pinned));

  grid.innerHTML="";

  if(items.length===0){

    grid.innerHTML=`
      <div class="empty-state">
        <div>🧠</div>
        <b>Your vault is quiet.</b>
        <p style="margin-top:6px">
        Add notes, resources, question banks or useful links.
        </p>
      </div>
    `;

  }else{

    items.forEach(item=>{

      const div=document.createElement("div");

      div.className="vault-item"+(item.pinned?" pinned":"");

      const preview=item.type==="note"
        ?escapeHTML(item.content)
        :escapeHTML(item.url);

      div.innerHTML=`

        <div class="vault-top">

          <span class="vault-type">
            ${item.type==="note"?"📝 NOTE":"🔗 RESOURCE"}
          </span>

          ${item.pinned?'<span class="pin">📌</span>':""}

        </div>

        <div class="vault-subject">
          ${escapeHTML(item.subject)}
          ${item.chapter?" · "+escapeHTML(item.chapter):""}
        </div>

        <div class="vault-title">
          ${escapeHTML(item.title)}
        </div>

        <div class="vault-preview">
          ${preview}
        </div>

        <div class="vault-meta">
          Added ${escapeHTML(item.created)}
        </div>

        <div class="vault-actions">

          <button class="icon-btn"
          onclick="viewVaultItem(${item.id})">
          View
          </button>

          ${item.type==="resource"
            ?`<button class="icon-btn"
              onclick="openResource(${item.id})">
              Open ↗
              </button>`
            :""
          }

          <button class="icon-btn ${item.pinned?"pin":""}"
          onclick="pinVaultItem(${item.id})">
          ${item.pinned?"Unpin":"Pin 📌"}
          </button>

          <button class="icon-btn"
          onclick="deleteVaultItem(${item.id})">
          Delete
          </button>

        </div>
      `;

      grid.appendChild(div);
    });
  }

  document.getElementById("noteCount").textContent=
    data.vault.filter(x=>x.type==="note").length;

  document.getElementById("resourceCount").textContent=
    data.vault.filter(x=>x.type==="resource").length;

  document.getElementById("pinnedCount").textContent=
    data.vault.filter(x=>x.pinned).length;

  renderSubjectFilters();
}


function viewVaultItem(id){

  const item=data.vault.find(x=>x.id===id);

  if(!item) return;

  document.getElementById("modalTitle").textContent=item.title;

  const body=document.getElementById("modalBody");

  if(item.type==="note"){

    body.innerHTML=`

      <div class="vault-subject">
      ${escapeHTML(item.subject)}
      ${item.chapter?" · "+escapeHTML(item.chapter):""}
      </div>

      <div style="
      white-space:pre-wrap;
      line-height:1.8;
      margin-top:18px
      ">
      ${escapeHTML(item.content)}
      </div>

      <button class="primary"
      style="margin-top:20px"
      onclick="copyVaultNote(${item.id})">
      Copy Note
      </button>
    `;

  }else{

    body.innerHTML=`

      <div class="vault-subject">
      ${escapeHTML(item.subject)}
      ${item.chapter?" · "+escapeHTML(item.chapter):""}
      </div>

      <p class="muted"
      style="margin-top:18px;word-break:break-all">
      ${escapeHTML(item.url)}
      </p>

      <button class="primary"
      style="margin-top:20px"
      onclick="openResource(${item.id})">
      Open Resource ↗
      </button>
    `;
  }

  document.getElementById("viewModal").classList.add("show");
}


function closeModal(){
  document.getElementById("viewModal").classList.remove("show");
}


function openResource(id){

  const item=data.vault.find(x=>x.id===id);

  if(!item || !item.url) return;

  let url=item.url.trim();

  /* AUTO FIX URL */
  if(!url.startsWith("http://") && !url.startsWith("https://")){
    url="https://"+url;
  }

  window.open(url,"_blank","noopener,noreferrer");
}


function pinVaultItem(id){

  const item=data.vault.find(x=>x.id===id);

  if(!item) return;

  item.pinned=!item.pinned;

  save();
  renderVault();
}


function deleteVaultItem(id){

  if(!confirm("Delete this vault item?")) return;

  data.vault=data.vault.filter(x=>x.id!==id);

  save();
  renderVault();
}


function copyVaultNote(id){

  const item=data.vault.find(x=>x.id===id);

  if(!item) return;

  navigator.clipboard.writeText(item.content)
  .then(()=>{
    alert("Note copied!");
  })
  .catch(()=>{
    alert("Could not copy automatically.");
  });
}


/* =========================
   TIMER
========================= */

let timerSeconds=25*60;
let timerRunning=false;
let timerInterval=null;
let selectedMinutes=25;


function renderTimer(){

  const minutes=Math.floor(timerSeconds/60)
    .toString().padStart(2,"0");

  const seconds=(timerSeconds%60)
    .toString().padStart(2,"0");

  document.getElementById("timerDisplay").textContent=
    `${minutes}:${seconds}`;
}


function setTimer(minutes){

  if(timerRunning) return;

  selectedMinutes=minutes;
  timerSeconds=minutes*60;

  renderTimer();
}


function toggleTimer(){

  const button=document.getElementById("timerStart");

  if(timerRunning){

    clearInterval(timerInterval);

    timerRunning=false;

    button.textContent="Resume";

    return;
  }

  timerRunning=true;

  button.textContent="Pause";

  timerInterval=setInterval(()=>{

    timerSeconds--;

    renderTimer();

    if(timerSeconds<=0){

      clearInterval(timerInterval);

      timerRunning=false;

      button.textContent="Start";

      data.focusMinutes+=selectedMinutes;

      data.focusSessions.unshift({
        minutes:selectedMinutes,
        date:new Date().toLocaleString()
      });

      save();

      renderFocusLog();

      timerSeconds=selectedMinutes*60;

      renderTimer();

      alert("Focus session complete. Nice work!");
    }

  },1000);
}


function resetTimer(){

  clearInterval(timerInterval);

  timerRunning=false;

  document.getElementById("timerStart").textContent="Start";

  timerSeconds=selectedMinutes*60;

  renderTimer();
}


function renderFocusLog(){

  const element=document.getElementById("focusLog");

  const sessions=data.focusSessions.slice(0,8);

  if(sessions.length===0){
    element.innerHTML="<p class='muted'>No completed sessions yet.</p>";
    return;
  }

  element.innerHTML="";

  sessions.forEach(session=>{

    element.innerHTML+=`
      <div class="task-item">
        <span>⏱ ${session.minutes} minute session</span>
        <small class="muted" style="margin-left:auto">
        ${escapeHTML(session.date)}
        </small>
      </div>
    `;
  });
}


/* =========================
   WORKOUT
========================= */

function renderWorkout(){

  const list=document.getElementById("exerciseList");

  list.innerHTML="";

  EXERCISES.forEach((exercise,index)=>{

    const checked=data.workoutChecks[index]||false;

    list.innerHTML+=`

      <label class="exercise">

        <input type="checkbox"
        ${checked?"checked":""}
        onchange="toggleWorkoutExercise(${index},this.checked)">

        <div>
          <div class="exercise-name">${exercise[0]}</div>
          <div class="exercise-detail">${exercise[1]}</div>
        </div>

      </label>
    `;
  });

  document.getElementById("workoutNote").value=data.workoutNote||"";
}


function toggleWorkoutExercise(index,checked){

  data.workoutChecks[index]=checked;

  save();
}


function completeWorkout(){

  const completed=Object.values(data.workoutChecks)
    .filter(Boolean).length;

  if(completed===0){
    alert("Complete at least one exercise first.");
    return;
  }

  data.workoutNote=document.getElementById("workoutNote").value;

  data.workoutSessions.unshift({
    date:new Date().toLocaleDateString(),
    exercises:completed,
    note:data.workoutNote
  });

  data.workoutChecks={};
  data.workoutNote="";

  save();

  renderWorkout();

  alert("Workout logged! Another brick laid. 💪");
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard(){

  const days=data.completedDays.length;

  const tasksDone=data.tasks.filter(task=>task.done).length;

  document.getElementById("statDays").textContent=
    `${days}/14`;

  document.getElementById("statTasks").textContent=
    tasksDone;

  document.getElementById("statFocus").textContent=
    data.focusMinutes+"m";

  document.getElementById("statVault").textContent=
    data.vault.length;

  document.getElementById("planProgress").style.width=
    (days/14*100)+"%";

  document.getElementById("planProgressText").textContent=
    `${days} / 14 complete`;

  const workouts=data.workoutSessions.length;

  document.getElementById("workoutCount").textContent=
    workouts;

  document.getElementById("workoutBar").style.width=
    Math.min(workouts/30*100,100)+"%";

  let next=PLAN.findIndex((_,index)=>
    !data.completedDays.includes(index)
  );

  if(next===-1) next=13;

  document.getElementById("todayPlanDate").textContent=
    PLAN[next][1];

  document.getElementById("todayHeavy").textContent=
    PLAN[next][2];

  document.getElementById("todayLight").textContent=
    PLAN[next][3];

  document.getElementById("dailyNotes").value=
    data.dailyNotes||"";

  document.getElementById("headerStreak").textContent=
    calculateActivityDays();

  renderDashboardChart();

  updateStorageStatus();
}


function calculateActivityDays(){

  const dates=[
    ...data.focusSessions.map(x=>x.date),
    ...data.workoutSessions.map(x=>x.date)
  ];

  return new Set(dates).size;
}



/* Dynamic date + command center (V2.3) */
const PLAN_START = new Date(2026,8,6); // Bhadra 21, 2083 approx. for this sprint
function getPlanDayIndex(){ const now=new Date(); const a=new Date(PLAN_START.getFullYear(),PLAN_START.getMonth(),PLAN_START.getDate()); const b=new Date(now.getFullYear(),now.getMonth(),now.getDate()); return Math.floor((b-a)/86400000); }
function dynamicMission(){const i=getPlanDayIndex(); if(i>=0&&i<PLAN.length)return {i,...{label:PLAN[i][1],heavy:PLAN[i][2],light:PLAN[i][3]}}; const next=PLAN.findIndex((_,x)=>!data.completedDays.includes(x)); const j=next<0?PLAN.length-1:next; return {i:j,label:i<0?'Plan starts Bhadra 21':(i>=PLAN.length?'Midterm sprint complete':PLAN[j][1]),heavy:i>=PLAN.length?'Revision & recovery':PLAN[j][2],light:i>=PLAN.length?'Review results':PLAN[j][3]};}
const _baseUpdateDashboard=updateDashboard;
updateDashboard=function(){_baseUpdateDashboard(); const m=dynamicMission(); const d=document.getElementById('todayPlanDate'),h=document.getElementById('todayHeavy'),l=document.getElementById('todayLight'); if(d)d.textContent=m.label;if(h)h.textContent=m.heavy;if(l)l.textContent=m.light;renderCommandCenter();};
function renderCommandCenter(){const taskOpen=data.tasks.filter(x=>!x.done).length;const m=dynamicMission();const cs=document.getElementById('commandSummary');if(cs)cs.innerHTML=`<b>${escapeHTML(m.heavy)}</b> + <b>${escapeHTML(m.light)}</b><br>${taskOpen?`${taskOpen} task${taskOpen>1?'s':''} waiting in your inbox.`:'Clean inbox. Add one meaningful task.'} Focus on the next useful action, not the whole mountain.`;
 const dm=document.getElementById('dashboardMastery'); if(dm){const subs=['Science','C. Math','O. Math']; dm.innerHTML=subs.map(s=>{const a=data.mastery.filter(x=>x.subject===s);const score=a.length?a.reduce((z,x)=>z+({weak:25,learning:55,strong:80,mastered:100}[x.level]||0),0)/a.length:0;return `<div><span>${s}</span><b>${a.length?Math.round(score)+'%':'—'}</b></div>`}).join('');}
 const exams=[...data.exams].filter(x=>x.date>=new Date().toISOString().slice(0,10)).sort((a,b)=>a.date.localeCompare(b.date));const de=document.getElementById('dashboardExam'),ds=document.getElementById('dashboardExamSub');if(exams.length){const e=exams[0],days=Math.ceil((new Date(e.date+'T00:00:00')-new Date())/86400000);if(de)de.textContent=`${e.subject} · ${Math.max(0,days)}d`;if(ds)ds.textContent=e.date+(e.chapters?` · ${e.chapters}`:'');}else{if(de)de.textContent='No exam added';if(ds)ds.textContent='Add your next exam in Exam Mode.';}
 const wa=document.getElementById('weekActivity');if(wa){const since=Date.now()-7*86400000;const f=data.focusSessions.filter(x=>new Date(x.date).getTime()>=since).length,w=data.workoutSessions.filter(x=>new Date(x.date).getTime()>=since).length,t=data.tasks.filter(x=>x.done).length;wa.innerHTML=`<div><span>Focus sessions</span><b>${f}</b></div><div><span>Workouts</span><b>${w}</b></div><div><span>Tasks completed</span><b>${t}</b></div>`;}}
function sendPrompt(q){switchTab('ai');setTimeout(()=>{const i=document.getElementById('aiInput');if(i){i.value=q;askAI();}},80);}

/* =========================
   CHARTS
========================= */

let progressChart;
let consistencyChart;
let activityChart;


function renderDashboardChart(){

  const canvas=document.getElementById("progressChart");

  if(!canvas || typeof Chart==="undefined") return;

  if(progressChart) progressChart.destroy();

  progressChart=new Chart(canvas,{
    type:"doughnut",

    data:{
      labels:["Completed","Remaining"],

      datasets:[{
        data:[
          data.completedDays.length,
          14-data.completedDays.length
        ],

        backgroundColor:[
          "#7c6cff",
          "#202735"
        ],

        borderWidth:0
      }]
    },

    options:{
      cutout:"76%",
      plugins:{
        legend:{display:false}
      }
    }
  });
}


function updateCharts(){

  if(typeof Chart==="undefined") return;

  const done=data.completedDays.length;

  if(consistencyChart) consistencyChart.destroy();
  if(activityChart) activityChart.destroy();

  consistencyChart=new Chart(
    document.getElementById("consistencyChart"),
    {
      type:"bar",

      data:{
        labels:["Midterm Plan"],

        datasets:[
          {
            label:"Completed",
            data:[done],
            backgroundColor:"#7c6cff",
            borderRadius:8
          },
          {
            label:"Remaining",
            data:[14-done],
            backgroundColor:"#283142",
            borderRadius:8
          }
        ]
      },

      options:{
        responsive:true,
        maintainAspectRatio:false
      }
    }
  );

  activityChart=new Chart(
    document.getElementById("activityChart"),
    {
      type:"doughnut",

      data:{
        labels:[
          "Focus Sessions",
          "Tasks Done",
          "Workouts",
          "Vault Items"
        ],

        datasets:[{
          data:[
            data.focusSessions.length,
            data.tasks.filter(x=>x.done).length,
            data.workoutSessions.length,
            data.vault.length
          ],

          backgroundColor:[
            "#55b8ff",
            "#3ddc97",
            "#ffad5a",
            "#7c6cff"
          ],

          borderWidth:0
        }]
      }
    }
  );
}


/* =========================
   BACKUP SYSTEM
========================= */

function exportData(){

  const blob=new Blob(
    [JSON.stringify(data,null,2)],
    {type:"application/json"}
  );

  const url=URL.createObjectURL(blob);

  const link=document.createElement("a");

  link.href=url;

  link.download="studystride-backup.json";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}


function importData(event){

  const file=event.target.files[0];

  if(!file) return;

  const reader=new FileReader();

  reader.onload=function(e){

    try{

      const imported=JSON.parse(e.target.result);

      data={
        ...DEFAULT_DATA,
        ...imported
      };

      if(!Array.isArray(data.vault)) data.vault=[];
      if(!Array.isArray(data.tasks)) data.tasks=[];
      if(!Array.isArray(data.completedDays)) data.completedDays=[];
      if(!Array.isArray(data.focusSessions)) data.focusSessions=[];
      if(!Array.isArray(data.workoutSessions)) data.workoutSessions=[];
      if(!data.dayNotes) data.dayNotes={};
      if(!data.workoutChecks) data.workoutChecks={};

      save();

      renderAll();

      alert("Backup restored successfully!");

    }catch(error){

      alert("Invalid backup file.");

    }
  };

  reader.readAsText(file);
}


function resetAll(){

  if(confirm(
    "Reset everything? Export a backup first if you want to keep your data."
  )){

    localStorage.removeItem("seeCommandData");

    location.reload();
  }
}


function updateStorageStatus(){

  try{

    const size=new Blob([
      JSON.stringify(data)
    ]).size;

    document.getElementById("storageStatus").textContent=
      `${(size/1024).toFixed(2)} KB stored locally in this browser.`;

  }catch(error){

    document.getElementById("storageStatus").textContent=
      "Storage information unavailable.";
  }
}


/* =========================
   DATE
========================= */

function updateDate(){

  document.getElementById("liveDate").textContent=
    new Date().toLocaleDateString(
      undefined,
      {
        weekday:"short",
        month:"short",
        day:"numeric"
      }
    );
}


/* =========================
   INITIALIZATION
========================= */

function renderAll(){

  renderPlan();

  renderTasks();

  renderFocusLog();

  renderWorkout();

  renderVault();

  updateDashboard();
}


updateDate();

toggleVaultFields();

renderTimer();

renderAll();



/* =========================
   STUDYSTRIDE V2 FEATURES
========================= */
let flashIndex=0, calendarCursor=new Date(), studySweatMode=false;
let audioCtx=null, soundNode=null, soundGain=null, currentSound=null;

function renderV2(){renderFlashcards();renderCalendar();renderEvents();renderHabitStacks();renderBiometrics();generateCoachInsight();renderImportantQuestions();renderMastery();renderExams();renderWeeklyReview();renderCommandCenter();}
function flipFlashcard(){document.getElementById('flashCard').classList.toggle('flipped');}
function currentFlash(){return data.flashcards.length?data.flashcards[flashIndex%data.flashcards.length]:null;}
function renderFlashcards(){
 const c=currentFlash(), q=document.getElementById('flashQuestion'), a=document.getElementById('flashAnswer');
 if(c){q.textContent=c.q;a.textContent=c.a;} else {q.textContent='Add your first flashcard below.';a.textContent='Your answer will appear here.';}
 document.getElementById('flashCard')?.classList.remove('flipped');
 const level=Math.floor(data.flashXP/100)+1, progress=data.flashXP%100;
 document.getElementById('flashLevel').textContent=level;document.getElementById('flashXP').textContent=data.flashXP;
 document.getElementById('xpFill').style.width=progress+'%';
 document.getElementById('flashStats').textContent=`${data.flashcards.length} cards · ${data.flashReviewed} reviews`;
 const decks={};data.flashcards.forEach(x=>{const k=`${x.subject} · ${x.deck||'General'}`;decks[k]=(decks[k]||0)+1});
 document.getElementById('flashDeckList').innerHTML=Object.keys(decks).length?Object.entries(decks).map(([k,v])=>`<div class="task-item"><span>${escapeHTML(k)}</span><b>${v} cards</b></div>`).join(''):'<div class="muted">No decks yet. Create your first one.</div>';
}
function addFlashcard(){const q=document.getElementById('flashQInput').value.trim(),a=document.getElementById('flashAInput').value.trim();if(!q||!a)return alert('Add both a question and answer.');data.flashcards.push({id:Date.now(),subject:document.getElementById('flashSubject').value,deck:document.getElementById('flashDeck').value.trim(),q,a});document.getElementById('flashQInput').value='';document.getElementById('flashAInput').value='';save();renderFlashcards();}
function reviewCard(score){if(!data.flashcards.length)return;data.flashXP += [2,5,10,15][score];data.flashReviewed++;flashIndex=(flashIndex+1)%data.flashcards.length;save();renderFlashcards();}

function bsApprox(d){const anchor=new Date(2026,8,6), diff=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-anchor)/86400000);let year=2083,months=['बैशाख','जेठ','असार','श्रावण','भदौ','असोज','कार्तिक','मंसिर','पौष','माघ','फागुन','चैत'];let month=4,day=21+diff;const lens=[31,31,32,32,31,30,30,29,30,29,30,30];while(day>lens[month]){day-=lens[month];month++;if(month>=12){month=0;year++;}}while(day<1){month--;if(month<0){month=11;year--;}day+=lens[month];}return `${months[month]} ${day}, ${year} BS`;}
function renderCalendar(){const d=new Date(),ad=d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});document.getElementById('adToday').textContent=ad;document.getElementById('bsToday').textContent=bsApprox(d);const exam=new Date(2026,8,21),days=Math.ceil((exam-d)/86400000);document.getElementById('examCountdown').textContent=days>=0?`${days} days`:'Exam period active';
 const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();document.getElementById('calendarTitle').textContent=new Date(y,m,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});const grid=document.getElementById('calendarGrid');let s=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="cal-head">${x}</div>`).join('');const first=new Date(y,m,1).getDay(),last=new Date(y,m+1,0).getDate();s+=Array(first).fill('<div></div>').join('');for(let day=1;day<=last;day++){const x=new Date(y,m,day),today=x.toDateString()===new Date().toDateString();s+=`<div class="cal-day ${today?'today':''}"><b>${day}</b><span class="bs">${bsApprox(x).split(',')[0]}</span></div>`;}grid.innerHTML=s;}
function changeCalendarMonth(n){calendarCursor.setMonth(calendarCursor.getMonth()+n);renderCalendar();}
function addCalendarEvent(){const title=document.getElementById('eventTitle').value.trim(),date=document.getElementById('eventDate').value;if(!title||!date)return alert('Add an event title and date.');data.calendarEvents.push({id:Date.now(),title,date});save();document.getElementById('eventTitle').value='';renderEvents();}
function renderEvents(){const el=document.getElementById('eventList');if(!el)return;el.innerHTML=data.calendarEvents.length?data.calendarEvents.sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<div class="task-item"><span>${escapeHTML(e.title)}<small class="muted"> · ${e.date}</small></span><button onclick="deleteEvent(${e.id})">×</button></div>`).join(''):'<div class="muted">No important dates added.</div>';}
function deleteEvent(id){data.calendarEvents=data.calendarEvents.filter(e=>e.id!==id);save();renderEvents();}

function newMovementPrompt(){const p=['20 bodyweight squats','10 incline push-ups','30 seconds shoulder mobility','1 minute brisk walk','20 jumping jacks','30 seconds deep breathing'];document.getElementById('movementPrompt').textContent=p[Math.floor(Math.random()*p.length)];}
function startStudySweat(){studySweatMode=true;setTimer(25);if(!timerRunning)toggleTimer();alert('Study & Sweat started: 25 minutes of study. Your movement prompt is ready for the break.');}
function createNoise(type){audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*4,audioCtx.sampleRate),d=buffer.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const white=Math.random()*2-1;if(type==='brown'){last=(last+0.02*white)/1.02;d[i]=last*3.5;}else if(type==='rain'){d[i]=white*(Math.random()>.96?.18:.55);}else d[i]=white*.32;}soundNode=audioCtx.createBufferSource();soundNode.buffer=buffer;soundNode.loop=true;soundGain=audioCtx.createGain();soundGain.gain.value=.18;soundNode.connect(soundGain).connect(audioCtx.destination);soundNode.start();}
async function toggleSound(type){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')await audioCtx.resume();if(currentSound===type){if(soundNode){try{soundNode.stop();}catch(e){}}soundNode=null;currentSound=null;document.querySelectorAll('.sound-btn').forEach(b=>b.classList.remove('active'));return;}if(soundNode){try{soundNode.stop();}catch(e){}}createNoise(type);if(audioCtx.state==='suspended')await audioCtx.resume();currentSound=type;document.querySelectorAll('.sound-btn').forEach(b=>b.classList.toggle('active',b.dataset.sound===type));}catch(e){console.error(e);alert('Sound could not start. Interact with the page once and try again.');}}
function setSoundVolume(v){if(soundGain)soundGain.gain.value=v/100;}

function addHabitStack(){const s=document.getElementById('habitStudy').value.trim(),f=document.getElementById('habitFitness').value.trim();if(!s||!f)return alert('Fill both parts of the habit stack.');data.habitStacks.push({id:Date.now(),study:s,fitness:f,done:false});save();renderHabitStacks();}
function renderHabitStacks(){const el=document.getElementById('habitMatrix');if(!el)return;if(!data.habitStacks.length){data.habitStacks=[{id:1,study:'After I review Biology',fitness:'I will do 20 squats',done:false},{id:2,study:'After I finish O. Math',fitness:'I will stretch for 2 minutes',done:false}];save();}el.innerHTML=data.habitStacks.map(h=>`<div class="matrix-row"><label><input type="checkbox" ${h.done?'checked':''} onchange="toggleHabit(${h.id})"> ${escapeHTML(h.study)}</label><span>→ 💪 ${escapeHTML(h.fitness)}</span><button onclick="removeHabit(${h.id})">×</button></div>`).join('');}
function toggleHabit(id){const h=data.habitStacks.find(x=>x.id===id);if(h){h.done=!h.done;save();renderHabitStacks();}}
function removeHabit(id){data.habitStacks=data.habitStacks.filter(x=>x.id!==id);save();renderHabitStacks();}

function saveBiometrics(){const sleep=parseFloat(document.getElementById('bioSleep').value),energy=parseInt(document.getElementById('bioEnergy').value),focus=parseInt(document.getElementById('bioFocus').value);if([sleep,energy,focus].some(Number.isNaN))return alert('Enter sleep, energy, and focus values.');const today=new Date().toISOString().slice(0,10);data.biometrics=data.biometrics.filter(x=>x.date!==today);data.biometrics.push({date:today,sleep,energy,focus});save();renderBiometrics();}
function renderBiometrics(){const el=document.getElementById('bioInsight');if(!el)return;const b=data.biometrics;if(b.length<2){el.textContent='Log at least two days to begin comparing your sleep, energy, and focus.';return;}const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;const high=b.filter(x=>x.sleep>=7),low=b.filter(x=>x.sleep<7);let msg=`Across ${b.length} logged days, your average focus is ${avg(b.map(x=>x.focus)).toFixed(1)}/10.`;if(high.length&&low.length)msg+=` On 7+ hour sleep days your focus averages ${avg(high.map(x=>x.focus)).toFixed(1)}, versus ${avg(low.map(x=>x.focus)).toFixed(1)} on shorter-sleep days.`;el.textContent=msg;}

function appendAI(role,text){const el=document.getElementById('aiMessages');if(!el)return;const d=document.createElement('div');d.className='chat-bubble '+role;d.textContent=text;el.appendChild(d);el.scrollTop=el.scrollHeight;}
function askAI(){const input=document.getElementById('aiInput'),q=input.value.trim();if(!q)return;appendAI('user',q);input.value='';data.aiHistory.push({role:'user',text:q,time:Date.now()});let l=q.toLowerCase(),r;if(l.includes('quiz'))r='Quiz mode: tell me the subject and chapter, then I can generate a focused question sequence for you.';else if(l.includes('math'))r='For Math: write the exact question or topic. I will help you break it into steps rather than dumping unexplained answers.';else if(l.includes('science'))r='For Science revision, try: concept → key terms → diagram/process → textbook questions → recall without notes.';else if(l.includes('study today')||l.includes('what should'))r='Check your Study Plan first. Start with the heavy subject while your brain is freshest, then pair it with a lighter theory/language subject.';else if(l.includes('focus'))r='Try one distraction-free block, then take a real break. Your Focus Lab also has Study & Sweat for movement resets.';else r='I can help with explanations, quizzes, revision plans, flashcards, and study strategy. For advanced open-ended AI answers, connect a secure server-side AI endpoint later.';setTimeout(()=>{appendAI('bot',r);data.aiHistory.push({role:'bot',text:r,time:Date.now()});save();},250);}
function generateCoachInsight(){const f=data.focusSessions?.length||0,w=data.workoutSessions?.length||0,b=data.biometrics||[];let msg=`You've logged ${f} focus sessions and ${w} workout sessions.`;if(b.length>=3){const avg=b.reduce((s,x)=>s+x.focus,0)/b.length;msg+=` Your logged average focus is ${avg.toFixed(1)}/10. `;const high=b.filter(x=>x.sleep>=7),low=b.filter(x=>x.sleep<7);if(high.length&&low.length){const ah=high.reduce((s,x)=>s+x.focus,0)/high.length,al=low.reduce((s,x)=>s+x.focus,0)/low.length;msg+=`Your data currently suggests ${ah>al?'better':'not clearly better'} focus on 7+ hour sleep days (${ah.toFixed(1)} vs ${al.toFixed(1)}).`;}}else msg+=' Keep logging sleep, energy, and focus for at least three days so the coach can find your patterns.';const el=document.getElementById('coachInsight');if(el)el.textContent=msg;}
const originalRenderAll=window.renderAll; if(typeof originalRenderAll==='function'){window.renderAll=function(){originalRenderAll();setTimeout(renderV2,0);};}
document.addEventListener('DOMContentLoaded',()=>setTimeout(renderV2,300));


import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* StudyStride Supabase configuration */
const SUPABASE_URL = "https://opvgsoyaiyqfgtcszxcq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdmdzb3lhaXlxZmd0Y3N6eGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NDk3NzEsImV4cCI6MjEwNDIyNTc3MX0.9vo_Yolx-V9Q7KUeJkd58eofoWo2GwJ9SjdxR7f_abU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

let cloudUser = null;
let syncTimer = null;
let isPulling = false;

const setStatus = (text) => {
  const el = document.getElementById("syncStatus");
  if (el) el.textContent = text;
};

const normalizeData = (raw = {}) => {
  const merged = { ...DEFAULT_DATA, ...raw };
  if(!Array.isArray(merged.completedDays)) merged.completedDays=[];
  if(typeof merged.dayNotes !== "object" || merged.dayNotes===null) merged.dayNotes={};
  if(!Array.isArray(merged.tasks)) merged.tasks=[];
  if(!Array.isArray(merged.focusSessions)) merged.focusSessions=[];
  if(!Array.isArray(merged.workoutSessions)) merged.workoutSessions=[];
  if(typeof merged.workoutChecks !== "object" || merged.workoutChecks===null) merged.workoutChecks={};
  if(!Array.isArray(merged.vault)) merged.vault=[];
  if(!Array.isArray(merged.flashcards)) merged.flashcards=[];
  if(typeof merged.flashXP !== "number") merged.flashXP=0;
  if(typeof merged.flashReviewed !== "number") merged.flashReviewed=0;
  if(!Array.isArray(merged.calendarEvents)) merged.calendarEvents=[];
  if(!Array.isArray(merged.habitStacks)) merged.habitStacks=[];
  if(!Array.isArray(merged.biometrics)) merged.biometrics=[];
  if(!Array.isArray(merged.aiHistory)) merged.aiHistory=[];
  if(!Array.isArray(merged.importantQuestions)) merged.importantQuestions=[];
  if(!Array.isArray(merged.mastery)) merged.mastery=[];
  if(!Array.isArray(merged.exams)) merged.exams=[];
  if(typeof merged.nextWeekFocus!=="string") merged.nextWeekFocus="";
  if(typeof merged.focusMinutes !== "number") merged.focusMinutes=0;
  if(typeof merged.dailyNotes !== "string") merged.dailyNotes="";
  if(typeof merged.workoutNote !== "string") merged.workoutNote="";
  return merged;
};

async function pushCloudData() {
  if (!cloudUser || isPulling) return;
  try {
    setStatus("☁ Syncing...");
    const payload = JSON.parse(JSON.stringify(data));
    const { error } = await supabase
      .from("studystride_data")
      .upsert({
        user_id: cloudUser.id,
        data: payload,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (error) throw error;
    setStatus("☁ Synced");
  } catch (error) {
    console.error("StudyStride sync error:", error);
    setStatus("⚠ Sync paused");
  }
}

async function pullCloudData() {
  if (!cloudUser) return;

  try {
    isPulling = true;
    setStatus("☁ Checking cloud...");

    const { data: row, error } = await supabase
      .from("studystride_data")
      .select("data, updated_at")
      .eq("user_id", cloudUser.id)
      .maybeSingle();

    if (error) throw error;

    if (row && row.data) {
      const cloudData = normalizeData(row.data);
      const localHasData =
        data.vault.length ||
        data.tasks.length ||
        data.completedDays.length ||
        data.focusSessions.length ||
        data.workoutSessions.length;

      if (localHasData) {
        const useCloud = confirm(
          "StudyStride found cloud data. Press OK to load the cloud version on this device. Press Cancel to keep this device's current data and upload it."
        );
        if (useCloud) {
          data = cloudData;
          localStorage.setItem("seeCommandData", JSON.stringify(data));
          renderAll();
        } else {
          await pushCloudData();
        }
      } else {
        data = cloudData;
        localStorage.setItem("seeCommandData", JSON.stringify(data));
        renderAll();
      }
    } else {
      await pushCloudData();
    }

    setStatus("☁ Synced");
  } catch (error) {
    console.error("Cloud load error:", error);
    setStatus("⚠ Sync error");
  } finally {
    isPulling = false;
  }
}

window.addEventListener("studystride:data-changed", () => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushCloudData, 700);
});

/* Google login. Enable Google provider in Supabase Auth first. */
window.cloudSignIn = async function() {
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo }
  });

  if (error) {
    console.error(error);
    alert("Login failed. Make sure Google Auth is enabled in Supabase and this website URL is added to Redirect URLs.");
  }
};

window.cloudSignOut = async function() {
  await supabase.auth.signOut();
  setStatus("☁ Local mode");
};

supabase.auth.onAuthStateChange(async (_event, session) => {
  cloudUser = session?.user || null;

  const login = document.getElementById("cloudLoginBtn");
  const logout = document.getElementById("cloudLogoutBtn");

  if (cloudUser) {
    setStatus("☁ " + (cloudUser.email || "Connected"));
    if (login) login.style.display = "none";
    if (logout) logout.style.display = "inline-block";
    const info = document.getElementById("cloudUserInfo");
    const desc = document.getElementById("cloudSyncDescription");
    if (info) { info.style.display = "block"; info.textContent = "✓ Connected as " + (cloudUser.email || "your account"); }
    if (desc) desc.textContent = "Your StudyStride data will sync securely across devices.";
    await pullCloudData();
  } else {
    setStatus("☁ Local mode");
    if (login) login.style.display = "inline-block";
    if (logout) logout.style.display = "none";
    const info = document.getElementById("cloudUserInfo");
    const desc = document.getElementById("cloudSyncDescription");
    if (info) info.style.display = "none";
    if (desc) desc.textContent = "Sign in to sync StudyStride across your devices.";
  }
});

/* PWA installation */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const button = document.getElementById("installBtn");
  if (button) button.style.display = "inline-block";
});

window.installApp = async function() {
  if (!deferredPrompt) {
    alert("Open StudyStride in Chrome or Brave and use the browser menu → Install app.");
    return;
  }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  const button = document.getElementById("installBtn");
  if (button) button.style.display = "none";
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
}


/* STUDYSTRIDE V2.1 FIXES: restored panels, device upload, settings and optional API */
function applySettings(){
  const s={...DEFAULT_DATA.settings,...(data.settings||{})};
  document.body.classList.toggle('theme-light',s.theme==='light');
  document.body.classList.toggle('compact',s.density==='compact');
  const t=document.getElementById('themeSelect'),d=document.getElementById('densitySelect'),n=document.getElementById('displayName'),e=document.getElementById('apiEndpoint'),m=document.getElementById('apiModel'),k=document.getElementById('apiKey');
  if(t)t.value=s.theme;if(d)d.value=s.density;if(n)n.value=s.displayName||'';if(e)e.value=s.apiEndpoint||'';if(m)m.value=s.apiModel||'';if(k)k.value=s.apiKey||'';
}
function saveSettings(){
  data.settings={
    theme:document.getElementById('themeSelect')?.value||'dark',
    density:document.getElementById('densitySelect')?.value||'comfortable',
    displayName:document.getElementById('displayName')?.value.trim()||'Yubaraj',
    apiEndpoint:document.getElementById('apiEndpoint')?.value.trim()||'',
    apiModel:document.getElementById('apiModel')?.value.trim()||'',
    apiKey:document.getElementById('apiKey')?.value.trim()||''
  };
  save();applySettings();alert('✓ Settings saved.');
}
function resetSettings(){if(confirm('Reset StudyStride settings? Your study data will remain.')){data.settings={...DEFAULT_DATA.settings};save();applySettings();}}

async function addDeviceFilesToVault(){
  const input=document.getElementById('vaultDeviceFile'), files=[...(input?.files||[])];
  if(!files.length){alert('Choose at least one file first.');return;}
  const list=document.getElementById('vaultUploadList');
  for(const f of files){
    const item={id:Date.now()+Math.floor(Math.random()*99999),type:'file',subject:'General',chapter:'',title:f.name,content:`Device file · ${Math.round(f.size/1024)} KB · ${f.type||'Unknown type'}`,url:'',fileName:f.name,fileSize:f.size,fileType:f.type,created:new Date().toLocaleString(),pinned:false};
    data.vault.unshift(item);
  }
  input.value='';save();renderVault();
  if(list)list.innerHTML=files.map(f=>`<div class="upload-item">📎 ${escapeHTML(f.name)} · ${Math.round(f.size/1024)} KB</div>`).join('');
  alert(`✓ Added ${files.length} file${files.length>1?'s':''} to Knowledge Vault.`);
}

/* Replace local AI helper with optional configured API, with safe fallback. */
const _oldAskAI=window.askAI;
window.askAI=async function(){
  const input=document.getElementById('aiInput'); let q=input?.value.trim()||'';
  if(!q && !aiMedia)return;
  let mediaText='';
  if(aiMedia){ try{appendAIFormatted('bot','Reading image…');const bubbles=document.querySelectorAll('#aiMessages .chat-bubble');const loading=bubbles[bubbles.length-1];mediaText=await extractOCR(aiMedia);if(loading)loading.remove(); if(!mediaText)mediaText='[Image attached but no readable text was detected.]'; q=(q? q+'\n\n':'')+'Image OCR text:\n'+mediaText;}catch(e){appendAIFormatted('bot','I could not read text from that image. Try a clearer, higher-contrast photo.');clearAIMedia();return;} }
  appendAIFormatted('user',q); input.value=''; clearAIMedia(); data.aiHistory.push({role:'user',text:q,time:Date.now()});save();
  const endpoint=data.settings?.apiEndpoint?.trim();
  if(endpoint){try{const thinking=appendAIFormatted('bot','Thinking…');const headers={'Content-Type':'application/json'};if(data.settings.apiKey)headers['Authorization']='Bearer '+data.settings.apiKey;const res=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({message:q,model:data.settings.apiModel||undefined,messages:data.aiHistory.slice(-12).map(x=>({role:x.role==='bot'?'assistant':x.role,content:x.text}))})});if(!res.ok)throw new Error('HTTP '+res.status);const out=await res.json();const answer=out.answer||out.message||out.response||out.choices?.[0]?.message?.content;if(!answer)throw new Error('No answer');thinking.innerHTML=renderMarkdown(answer);data.aiHistory.push({role:'bot',text:answer,time:Date.now()});save();return;}catch(err){console.warn('AI endpoint failed',err);appendAIFormatted('bot','Your configured AI endpoint could not be reached. Check the endpoint URL and Worker deployment.');}}
  appendAIFormatted('bot','Local helper: configure your AI endpoint for full model-powered answers.');
};

document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{applySettings();renderV2();},350);});

/* V2.3 feature functions */
const IQ_SUBJECTS=['Science','C. Math','O. Math','Social','English','Nepali','Computer']; let activeIQSubject='Science'; let aiMedia=null;
function renderImportantQuestions(){const tabs=document.getElementById('questionSubjectTabs'),list=document.getElementById('importantQuestionList');if(!tabs||!list)return;tabs.innerHTML=IQ_SUBJECTS.map(x=>`<button class="${x===activeIQSubject?'active':''}" onclick="setIQSubject(${JSON.stringify(x)})">${x}</button>`).join('');const arr=data.importantQuestions.filter(x=>x.subject===activeIQSubject);list.innerHTML=arr.length?arr.map(x=>`<div class="question-item"><div class="question-item-head"><div><b>${escapeHTML(x.chapter||'General')}</b><div>${escapeHTML(x.text||'(Image question)')}</div></div><button class="tiny-btn" onclick="deleteImportantQuestion(${x.id})">Delete</button></div>${x.image?`<img src="${x.image}" alt="Important question">`:''}</div>`).join(''):`<div class="card-sub">No saved important questions for ${activeIQSubject} yet.</div>`;}
function setIQSubject(x){activeIQSubject=x;renderImportantQuestions();}
function readCompressedImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const max=900,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.72));};img.onerror=reject;img.src=e.target.result;};r.onerror=reject;r.readAsDataURL(file);});}
async function addImportantQuestion(){const subject=document.getElementById('iqSubject').value,chapter=document.getElementById('iqChapter').value.trim(),text=document.getElementById('iqText').value.trim(),file=document.getElementById('iqImage').files[0];if(!text&&!file)return alert('Type a question or choose an image.');let image='';if(file){if(file.size>8*1024*1024)return alert('Please use an image under 8 MB.');image=await readCompressedImage(file);}data.importantQuestions.unshift({id:Date.now(),subject,chapter,text,image,created:new Date().toISOString()});document.getElementById('iqChapter').value='';document.getElementById('iqText').value='';document.getElementById('iqImage').value='';activeIQSubject=subject;save();renderImportantQuestions();}
function deleteImportantQuestion(id){data.importantQuestions=data.importantQuestions.filter(x=>x.id!==id);save();renderImportantQuestions();}
const LEVEL_SCORE={weak:25,learning:55,strong:80,mastered:100}; const LEVEL_LABEL={weak:'🔴 Weak',learning:'🟡 Learning',strong:'🟢 Strong',mastered:'🔵 Mastered'};
function addMasteryTopic(){const subject=document.getElementById('masterySubject').value,topic=document.getElementById('masteryTopic').value.trim(),level=document.getElementById('masteryLevel').value;if(!topic)return alert('Enter a chapter or topic.');data.mastery.push({id:Date.now(),subject,topic,level});document.getElementById('masteryTopic').value='';save();renderMastery();}
function renderMastery(){const o=document.getElementById('masteryOverview'),l=document.getElementById('masteryList');if(!o||!l)return;const subjects=[...new Set(data.mastery.map(x=>x.subject))];o.innerHTML=subjects.length?subjects.map(s=>{const a=data.mastery.filter(x=>x.subject===s),v=Math.round(a.reduce((z,x)=>z+LEVEL_SCORE[x.level],0)/a.length);return `<div class="mastery-card"><b>${s}</b><div class="mastery-track"><div class="mastery-fill" style="width:${v}%"></div></div><small>${v}% average · ${a.length} topic${a.length>1?'s':''}</small></div>`}).join(''):'<div class="card-sub">Add your first topic to start measuring mastery.</div>';l.innerHTML=data.mastery.length?data.mastery.map(x=>`<div class="mastery-item"><b>${escapeHTML(x.subject)}</b><span>${escapeHTML(x.topic)}</span><select onchange="changeMastery(${x.id},this.value)">${Object.keys(LEVEL_LABEL).map(k=>`<option value="${k}" ${x.level===k?'selected':''}>${LEVEL_LABEL[k]}</option>`).join('')}</select><button class="tiny-btn" onclick="deleteMastery(${x.id})">×</button></div>`).join(''):'';}
function changeMastery(id,v){const x=data.mastery.find(x=>x.id===id);if(x){x.level=v;save();renderMastery();}}
function deleteMastery(id){data.mastery=data.mastery.filter(x=>x.id!==id);save();renderMastery();}
function addExam(){const subject=document.getElementById('examSubject').value,date=document.getElementById('examDateInput').value,chapters=document.getElementById('examChapters').value.trim();if(!date)return alert('Choose the exam date.');data.exams.push({id:Date.now(),subject,date,chapters});document.getElementById('examDateInput').value='';document.getElementById('examChapters').value='';save();renderExams();}
function renderExams(){const el=document.getElementById('examList');if(!el)return;const a=[...data.exams].sort((x,y)=>x.date.localeCompare(y.date));el.innerHTML=a.length?a.map(x=>{const days=Math.ceil((new Date(x.date+'T00:00:00')-new Date())/86400000);return `<div class="exam-item"><div><b>${x.subject}</b><div class="card-sub">${x.date}${x.chapters?' · '+escapeHTML(x.chapters):''}</div></div><div><b>${days>=0?days+' days left':'Completed'}</b> <button class="tiny-btn" onclick="deleteExam(${x.id})">Delete</button></div></div>`}).join(''):'<div class="card-sub">No exams added yet.</div>';}
function deleteExam(id){data.exams=data.exams.filter(x=>x.id!==id);save();renderExams();}
function renderWeeklyReview(){const el=document.getElementById('weeklyReport');if(!el)return;const since=Date.now()-7*86400000;const f=data.focusSessions.filter(x=>new Date(x.date).getTime()>=since),w=data.workoutSessions.filter(x=>new Date(x.date).getTime()>=since),t=data.tasks.filter(x=>x.done).length,q=data.importantQuestions.length;const mins=f.reduce((z,x)=>z+(x.minutes||x.duration||25),0);el.innerHTML=`<div class="review-stat">Focus time<b>${mins}m</b></div><div class="review-stat">Focus sessions<b>${f.length}</b></div><div class="review-stat">Workouts<b>${w.length}</b></div><div class="review-stat">Tasks completed<b>${t}</b></div><div class="review-stat">Questions banked<b>${q}</b></div>`;const n=document.getElementById('nextWeekFocus');if(n)n.value=data.nextWeekFocus||'';}
function saveNextWeekFocus(){data.nextWeekFocus=document.getElementById('nextWeekFocus').value;save();alert('Next week focus saved.');}
function renderMarkdown(text){let h=escapeHTML(text);h=h.replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>').replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/^\s*[-•] (.*)$/gm,'<li>$1</li>').replace(/(<li>[\s\S]*?<\/li>)/g,'$1').replace(/\n/g,'<br>');return h;}
function appendAIFormatted(role,text){const el=document.getElementById('aiMessages');if(!el)return null;const d=document.createElement('div');d.className='chat-bubble '+role;d.innerHTML=role==='bot'?renderMarkdown(text):escapeHTML(text);el.appendChild(d);el.scrollTop=el.scrollHeight;return d;}
function handleAIMedia(event){const f=event.target.files[0];if(!f)return;if(!f.type.startsWith('image/'))return alert('For now, AI attachments support images.');aiMedia=f;const p=document.getElementById('aiAttachmentPreview');p.style.display='flex';p.innerHTML=`<img src="${URL.createObjectURL(f)}"><span>📷 ${escapeHTML(f.name)} ready for OCR</span><button class="tiny-btn" onclick="clearAIMedia()">Remove</button>`;}
function clearAIMedia(){aiMedia=null;const p=document.getElementById('aiAttachmentPreview');if(p){p.style.display='none';p.innerHTML='';}document.getElementById('aiMediaInput').value='';}
async function extractOCR(file){if(!window.Tesseract){await new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';sc.onload=resolve;sc.onerror=reject;document.head.appendChild(sc);});}const r=await Tesseract.recognize(file,'eng');return r.data.text.trim();}



/* ================= STUDYSTRIDE V2.3 ================= */
(function(){
  const ensure=(k,v)=>{if(data[k]===undefined||data[k]===null)data[k]=v;};
  ensure('mistakes',[]);ensure('generatedTests',[]);ensure('syllabus',[]);ensure('globalXP',0);ensure('achievements',[]);ensure('quickCaptures',[]);ensure('studyActivity',{});
  if(!Array.isArray(data.mistakes))data.mistakes=[];if(!Array.isArray(data.generatedTests))data.generatedTests=[];if(!Array.isArray(data.syllabus))data.syllabus=[];if(!Array.isArray(data.achievements))data.achievements=[];if(!Array.isArray(data.quickCaptures))data.quickCaptures=[];
  const SUBJECTS=['Science','C. Math','O. Math','Social','English','Nepali','Computer'];
  const LEVELS=[{xp:0,name:'Starter'},{xp:100,name:'Focused Learner'},{xp:300,name:'Consistency Builder'},{xp:700,name:'Scholar'},{xp:1400,name:'Study Strategist'},{xp:2500,name:'Mastermind'}];
  function levelInfo(){let i=0;for(let j=0;j<LEVELS.length;j++)if(data.globalXP>=LEVELS[j].xp)i=j;const cur=LEVELS[i],next=LEVELS[i+1]||{xp:cur.xp+1000,name:'Legend'};return {level:i+1,name:cur.name,cur:cur.xp,next:next.xp,pct:Math.min(100,((data.globalXP-cur.xp)/(next.xp-cur.xp))*100)};}
  window.awardXP=function(amount,reason='Activity'){data.globalXP=(Number(data.globalXP)||0)+amount;data.studyActivity[new Date().toISOString().slice(0,10)]=(data.studyActivity[new Date().toISOString().slice(0,10)]||0)+amount;checkAchievements();save();renderV23();}
  function checkAchievements(){const defs=[['first-focus','🎯','First Focus','Complete a focus session',data.focusSessions.length>=1],['task-ten','✅','Task Tamer','Complete 10 tasks',data.tasks.filter(x=>x.done).length>=10],['cards-50','🃏','Card Shark','Review 50 flashcards',data.flashReviewed>=50],['mistakes-10','📕','Mistake Miner','Log 10 learning mistakes',data.mistakes.length>=10],['xp-500','⚡','Momentum','Earn 500 global XP',data.globalXP>=500],['workout-10','💪','Balanced Builder','Log 10 workouts',data.workoutSessions.length>=10]];defs.forEach(([id,icon,title,desc,ok])=>{if(ok&&!data.achievements.includes(id))data.achievements.push(id);});}
  window.renderV23=function(){renderProgressHub();renderDataCoach();renderSyllabus();renderMistakes();};
  function renderProgressHub(){const li=levelInfo(),lv=document.getElementById('globalLevel'),fill=document.getElementById('globalXPFill'),txt=document.getElementById('globalXPText'),rank=document.getElementById('globalRank');if(lv)lv.textContent=li.level;if(fill)fill.style.width=li.pct+'%';if(txt)txt.textContent=`${data.globalXP} XP · ${li.next-data.globalXP>0?li.next-data.globalXP+' to next level':'Max level milestone reached'}`;if(rank)rank.textContent=li.name;const grid=document.getElementById('achievementGrid');if(grid){const defs=[['first-focus','🎯','First Focus'],['task-ten','✅','Task Tamer'],['cards-50','🃏','Card Shark'],['mistakes-10','📕','Mistake Miner'],['xp-500','⚡','Momentum'],['workout-10','💪','Balanced Builder']];grid.innerHTML=defs.map(x=>`<div class="achievement ${data.achievements.includes(x[0])?'unlocked':''}">${x[1]} <b>${x[2]}</b><div class="card-sub">${data.achievements.includes(x[0])?'Unlocked':'Locked'}</div></div>`).join('');}
    const heat=document.getElementById('studyHeatmap');if(heat){let h='';for(let i=27;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10),v=data.studyActivity[key]||0,cl=v>=60?4:v>=35?3:v>=15?2:v>0?1:0;h+=`<div class="heat-cell heat-${cl}" title="${key}: ${v} XP">${d.getDate()}</div>`;}heat.innerHTML=h;}}
  window.addMistake=function(){const subject=document.getElementById('mistakeSubject').value,chapter=document.getElementById('mistakeChapter').value.trim(),what=document.getElementById('mistakeWhat').value.trim(),fix=document.getElementById('mistakeFix').value.trim();if(!what||!fix)return alert('Write both the mistake and the corrected lesson.');data.mistakes.unshift({id:Date.now(),subject,chapter,what,fix,created:new Date().toISOString()});['mistakeChapter','mistakeWhat','mistakeFix'].forEach(id=>document.getElementById(id).value='');awardXP(8,'Mistake logged');renderMistakes();};
  window.renderMistakes=function(){const el=document.getElementById('mistakeList');if(!el)return;el.innerHTML=data.mistakes.length?data.mistakes.map(m=>`<div class="mistake-item"><b>${escapeHTML(m.what)}</b><div class="mistake-meta"><span class="tag">${escapeHTML(m.subject)}</span><span class="tag">${escapeHTML(m.chapter||'General')}</span></div><div class="card-sub"><b>Correct lesson:</b> ${escapeHTML(m.fix)}</div><button class="tiny-btn" style="margin-top:8px" onclick="deleteMistake(${m.id})">Delete</button></div>`).join(''):'<div class="card-sub">No mistakes yet. That is either excellent or suspiciously early. 😭</div>';};
  window.deleteMistake=id=>{data.mistakes=data.mistakes.filter(x=>x.id!==id);save();renderMistakes();};
  window.renderSyllabus=function(){const el=document.getElementById('syllabusProgress');if(!el)return;const all=[...data.mastery];const by=SUBJECTS.filter(s=>all.some(x=>x.subject===s));el.innerHTML=by.length?by.map(s=>{const a=all.filter(x=>x.subject===s),v=Math.round(a.reduce((z,x)=>z+(LEVEL_SCORE[x.level]||0),0)/a.length);return `<div class="syllabus-row"><b>${s}</b><div class="syllabus-track"><div style="width:${v}%"></div></div><span>${v}% · ${a.length} chapters</span></div>`}).join(''):'<div class="card-sub">Add chapters in Subject Mastery and your syllabus progress will appear here.</div>';};
  // Spaced repetition override
  const oldReview=window.reviewCard;window.reviewCard=function(score){if(!data.flashcards.length)return;const card=data.flashcards[flashIndex];if(card){const now=Date.now();card.repetitions=card.repetitions||0;card.interval=card.interval||0;card.ease=card.ease||2.3;if(score===0){card.repetitions=0;card.interval=0;card.ease=Math.max(1.3,card.ease-.2);card.due=now+10*60*1000;}else if(score===1){card.repetitions++;card.interval=Math.max(1,Math.round((card.interval||1)*1.2));card.due=now+card.interval*86400000;}else if(score===2){card.repetitions++;card.interval=card.repetitions===1?1:Math.max(2,Math.round((card.interval||1)*card.ease));card.due=now+card.interval*86400000;}else{card.repetitions++;card.ease=Math.min(3.2,card.ease+.1);card.interval=card.repetitions===1?3:Math.max(4,Math.round((card.interval||3)*card.ease));card.due=now+card.interval*86400000;}data.flashXP+=(score===0?2:score===1?5:score===2?10:15);data.flashReviewed++;awardXP(score===0?2:score===1?5:score===2?10:15,'Flashcard review');flashIndex=(flashIndex+1)%data.flashcards.length;save();renderFlashcards();}else if(oldReview)oldReview(score);};
  // AI generation
  async function callAI(message){const endpoint=data.settings?.apiEndpoint?.trim();if(!endpoint)throw new Error('No AI endpoint configured. Add your Cloudflare Worker URL in Settings.');const headers={'Content-Type':'application/json'};if(data.settings.apiKey)headers.Authorization='Bearer '+data.settings.apiKey;const res=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({message,model:data.settings.apiModel||undefined})});if(!res.ok)throw new Error('AI endpoint returned HTTP '+res.status);const out=await res.json();return out.answer||out.message||out.response||out.choices?.[0]?.message?.content||JSON.stringify(out);}
  function jsonFromAI(t){const clean=String(t).replace(/```json/gi,'').replace(/```/g,'').trim();const a=clean.indexOf('{'),b=clean.lastIndexOf('}');const aa=clean.indexOf('['),bb=clean.lastIndexOf(']');let part=(a>=0&&b>a)?clean.slice(a,b+1):(aa>=0&&bb>aa)?clean.slice(aa,bb+1):clean;return JSON.parse(part);}
  window.generateStudy=async function(type){const topic=document.getElementById('genTopic').value.trim(),subject=document.getElementById('genSubject').value,difficulty=document.getElementById('genDifficulty').value,count=Number(document.getElementById('genCount').value),status=document.getElementById('generatorStatus'),out=document.getElementById('generatorOutput');if(!topic)return alert('Enter a topic first.');status.textContent='🧠 AI is building your study material…';out.innerHTML='';let instruction='';if(type==='flashcards')instruction=`Return ONLY JSON: {"flashcards":[{"q":"","a":""}]}. Generate ${count} concise, accurate flashcards.`;if(type==='mcq')instruction=`Return ONLY JSON: {"mcqs":[{"q":"","options":["A","B","C","D"],"answer":0,"explanation":""}]}. Generate ${count} MCQs.`;if(type==='mock')instruction=`Return ONLY JSON: {"title":"","questions":[{"q":"","options":["A","B","C","D"],"answer":0,"explanation":""}]}. Generate ${count} exam-style questions.`;if(type==='pack')instruction=`Return ONLY JSON: {"summary":"","flashcards":[{"q":"","a":""}],"mcqs":[{"q":"","options":["A","B","C","D"],"answer":0,"explanation":""}]}. Create a concise study pack with ${Math.max(5,Math.floor(count/2))} flashcards and ${Math.max(5,Math.floor(count/2))} MCQs.`;try{const raw=await callAI(`You are StudyStride's Grade 10 study generator. Subject: ${subject}. Topic: ${topic}. Difficulty: ${difficulty}. Be factually careful and age-appropriate. ${instruction}`);const obj=jsonFromAI(raw);if(obj.flashcards?.length){obj.flashcards.forEach((c,i)=>data.flashcards.push({id:Date.now()+i,subject,deck:topic,q:c.q,a:c.a,due:Date.now(),interval:0,repetitions:0,ease:2.3}));out.innerHTML+=`<div class="generated-card"><b>🃏 ${obj.flashcards.length} flashcards added to your deck</b><div class="card-sub">Open Flashcards to review them with spaced repetition.</div></div>`;}
      const qs=obj.mcqs||obj.questions;if(qs?.length){const test={id:Date.now(),title:obj.title||`${topic} ${type==='mock'?'Mock Test':'MCQs'}`,subject,topic,questions:qs,created:new Date().toISOString(),answers:{}};data.generatedTests.unshift(test);out.innerHTML+=`<div class="generated-card"><b>📝 ${qs.length} questions generated</b><div id="generatedTestArea"></div></div>`;renderGeneratedTest(test.id);}
      if(obj.summary)out.innerHTML=`<div class="generated-card"><b>📖 Quick Summary</b><div class="card-sub" style="margin-top:8px">${escapeHTML(obj.summary)}</div></div>`+out.innerHTML;awardXP(20,'AI study material generated');save();status.textContent='✓ Study material generated successfully.';}catch(e){console.error(e);status.textContent='⚠ '+e.message;out.innerHTML='<div class="card-sub">Tip: make sure your Cloudflare Worker URL is saved in Settings and reachable.</div>';}}
  window.renderGeneratedTest=function(id){const test=data.generatedTests.find(x=>x.id===id),el=document.getElementById('generatedTestArea');if(!test||!el)return;el.innerHTML=test.questions.map((q,qi)=>`<div class="mcq-card"><div class="test-question">${qi+1}. ${escapeHTML(q.q)}</div><div class="test-options">${q.options.map((o,oi)=>`<button onclick="answerGenerated(${id},${qi},${oi},this)">${String.fromCharCode(65+oi)}. ${escapeHTML(o)}</button>`).join('')}</div><div class="card-sub" id="explain-${id}-${qi}"></div></div>`).join('');};
  window.answerGenerated=function(id,qi,oi,btn){const t=data.generatedTests.find(x=>x.id===id),q=t?.questions[qi];if(!q)return;const buttons=btn.parentElement.querySelectorAll('button');buttons.forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');else if(i===oi)b.classList.add('wrong');});t.answers[qi]=oi;const ex=document.getElementById(`explain-${id}-${qi}`);if(ex)ex.textContent=(oi===q.answer?'✓ Correct. ':'✗ Review: ')+(q.explanation||'');if(oi===q.answer)awardXP(5,'Correct AI question');save();};
  // Quick capture
  let quickType='task';window.toggleQuickCapture=()=>document.getElementById('quickCaptureMenu').classList.toggle('open');window.setQuickType=t=>{quickType=t;document.querySelectorAll('[data-quick]').forEach(b=>b.classList.toggle('active',b.dataset.quick===t));};window.saveQuickCapture=function(){const text=document.getElementById('quickCaptureText').value.trim();if(!text)return;const item={id:Date.now(),type:quickType,text,created:new Date().toISOString()};data.quickCaptures.unshift(item);if(quickType==='task')data.tasks.unshift({text,done:false,created:item.created});else if(quickType==='note')data.vault.unshift({id:item.id,type:'note',subject:'General',chapter:'Quick Capture',title:'Quick Note',content:text,created:new Date().toLocaleString(),pinned:false});else if(quickType==='mistake')data.mistakes.unshift({id:item.id,subject:'General',chapter:'Quick Capture',what:text,fix:'Add the corrected lesson when you review this.',created:item.created});else data.importantQuestions.unshift({id:item.id,subject:'Science',chapter:'Quick Capture',text,image:'',created:item.created});document.getElementById('quickCaptureText').value='';document.getElementById('quickCaptureMenu').classList.remove('open');awardXP(3,'Quick capture');renderAll();renderV2();renderV23();};
  // Better data-aware coach. AI only when explicitly requested, deterministic insight always.
  window.renderDataCoach=function(){const el=document.getElementById('dataCoach');if(!el)return;const focus=data.focusSessions.length,done=data.tasks.filter(x=>x.done).length,total=data.tasks.length,mist=data.mistakes.length,mastery=data.mastery.length?Math.round(data.mastery.reduce((z,x)=>z+(LEVEL_SCORE[x.level]||0),0)/data.mastery.length):0;el.textContent=`You have ${focus} focus sessions, ${done}/${total} tasks completed, ${mist} logged mistakes, and ${mastery}% average topic mastery. ${mist? 'Review your Mistake Book before your next test.':'Start logging mistakes to reveal recurring weak spots.'}`;};
  window.generateDataCoach=async function(useAI){if(!useAI)return renderDataCoach();const el=document.getElementById('dataCoach');el.textContent='Analyzing your StudyStride data…';const snapshot={focusSessions:data.focusSessions.slice(0,30),tasks:data.tasks.slice(0,50),workouts:data.workoutSessions.slice(0,30),mastery:data.mastery,biometrics:data.biometrics.slice(0,30),mistakes:data.mistakes.slice(0,20),tests:data.generatedTests.slice(0,10).map(t=>({title:t.title,questions:t.questions.length,answers:t.answers}))};try{const answer=await callAI(`You are a careful performance coach. Analyze this student's own logged data. Do NOT invent statistics or claim causation from tiny samples. Give 3 concise evidence-based insights and 3 practical next actions. Data: ${JSON.stringify(snapshot)}`);el.innerHTML=renderMarkdown(answer);}catch(e){el.textContent='Could not reach AI coach: '+e.message;}};
  // Award XP on task completion without rewarding unchecking.
  const oldToggle=window.toggleTask;window.toggleTask=function(index){const was=data.tasks[index]?.done;oldToggle(index);if(!was&&data.tasks[index]?.done)awardXP(10,'Task completed');};
  // Dynamic mission date: always today's real date.
  window.dynamicMission=function(){const i=getPlanDayIndex();const j=(i>=0&&i<PLAN.length)?i:Math.max(0,PLAN.findIndex((_,x)=>!data.completedDays.includes(x)));const today=new Date();return {i:j,label:today.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}),heavy:PLAN[j]?.[2]||'Revision',light:PLAN[j]?.[3]||'Recovery'};};
  // Make old cards due immediately.
  data.flashcards.forEach(c=>{if(!c.due)c.due=Date.now();if(c.ease==null)c.ease=2.3;if(c.interval==null)c.interval=0;if(c.repetitions==null)c.repetitions=0;});
  setTimeout(()=>{checkAchievements();renderV23();},600);
})();
