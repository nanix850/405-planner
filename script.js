const KEY="405planner_v1";
let data=JSON.parse(localStorage.getItem(KEY)||'{"homeworks":[],"revisions":[],"schedule":[],"dark":false}');
const $=s=>document.querySelector(s);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const fmt=d=>new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});
function empty(t="Rien à afficher pour le moment."){return `<div class="empty">${t}</div>`}
function render(){
 document.body.classList.toggle("dark",data.dark); $("#themeBtn").textContent=data.dark?"☀️":"🌙";
 const todo=data.homeworks.filter(x=>!x.done).sort((a,b)=>a.due.localeCompare(b.due));
 $("#statTodo").textContent=todo.length; $("#statRevision").textContent=data.revisions.filter(x=>x.date>=today()).length; $("#statNext").textContent=todo[0]?fmt(todo[0].due):"—";
 $("#upcoming").innerHTML=todo.slice(0,5).map(homeworkHTML).join("")||empty("Aucun devoir à venir.");
 $("#nextRevisions").innerHTML=data.revisions.filter(x=>x.date>=today()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5).map(revisionHTML).join("")||empty("Aucune révision prévue.");
 $("#homeworkList").innerHTML=todo.concat(data.homeworks.filter(x=>x.done)).map(homeworkHTML).join("")||empty("Ajoute ton premier devoir !");
 $("#revisionList").innerHTML=data.revisions.sort((a,b)=>a.date.localeCompare(b.date)).map(revisionHTML).join("")||empty("Ajoute une séance de révision !");
 const days=["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];
 $("#scheduleGrid").innerHTML=days.map(day=>`<div class="day"><h3>${day}</h3>${data.schedule.filter(x=>x.day===day).sort((a,b)=>a.time.localeCompare(b.time)).map(x=>`<div class="lesson"><small>${x.time}</small><b>${esc(x.subject)}</b><span>${esc(x.room||"")}</span><button class="delete" data-del-schedule="${x.id}">×</button></div>`).join("")||"<small class='muted'>Aucun cours</small>"}</div>`).join("");
}
function homeworkHTML(x){return `<div class="item ${x.done?"done":""}"><input type="checkbox" data-check="${x.id}" ${x.done?"checked":""}><div class="grow"><strong>${esc(x.subject)} — ${esc(x.title)}</strong><small>À rendre le ${fmt(x.due)}</small></div><button class="delete" data-del-homework="${x.id}">×</button></div>`}
function revisionHTML(x){return `<div class="item"><div class="grow"><strong>${esc(x.subject)}</strong><small>${fmt(x.date)} · ${x.duration} min</small></div><button class="delete" data-del-revision="${x.id}">×</button></div>`}
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random()}
function show(page){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===page));document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.go===page));scrollTo(0,0)}
document.addEventListener("click",e=>{
 const go=e.target.closest("[data-go]"); if(go) show(go.dataset.go);
 if(e.target.id==="themeBtn"){data.dark=!data.dark;save()}
 const ch=e.target.closest("[data-check]"); if(ch){let x=data.homeworks.find(x=>x.id===ch.dataset.check);x.done=ch.checked;save()}
 const dh=e.target.closest("[data-del-homework]");if(dh){data.homeworks=data.homeworks.filter(x=>x.id!==dh.dataset.delHomework);save()}
 const dr=e.target.closest("[data-del-revision]");if(dr){data.revisions=data.revisions.filter(x=>x.id!==dr.dataset.delRevision);save()}
 const ds=e.target.closest("[data-del-schedule]");if(ds){data.schedule=data.schedule.filter(x=>x.id!==ds.dataset.delSchedule);save()}
});
$("#addHomeworkBtn").onclick=()=>$("#homeworkDialog").showModal(); $("#addRevisionBtn").onclick=()=>$("#revisionDialog").showModal(); $("#addScheduleBtn").onclick=()=>$("#scheduleDialog").showModal();
$("#homeworkForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);data.homeworks.push({id:id(),subject:f.get("subject"),title:f.get("title"),due:f.get("due"),done:false});e.target.closest("dialog").close();e.target.reset();save()};
$("#revisionForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);data.revisions.push({id:id(),subject:f.get("subject"),date:f.get("date"),duration:Number(f.get("duration"))});e.target.closest("dialog").close();e.target.reset();save()};
$("#scheduleForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);data.schedule.push({id:id(),day:f.get("day"),time:f.get("time"),subject:f.get("subject"),room:f.get("room")});e.target.closest("dialog").close();e.target.reset();save()};
$("#exportBtn").onclick=()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="405-planner-sauvegarde.json";a.click()};
$("#importInput").onchange=e=>{let file=e.target.files[0];if(!file)return;let r=new FileReader();r.onload=()=>{try{data=JSON.parse(r.result);save();alert("Import réussi !")}catch{alert("Fichier invalide.")}};r.readAsText(file)};
$("#resetBtn").onclick=()=>{if(confirm("Effacer toutes les données ?")){data={homeworks:[],revisions:[],schedule:[],dark:data.dark};save()}};
render();