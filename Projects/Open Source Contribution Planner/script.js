(function(){'use strict';
const reposBySkill={
javascript:[{name:'first-contributions',desc:'Help beginners make their first open source contribution',stars:'45k',badge:'good first issue'},{name:'freeCodeCamp',desc:'Open source codebase and curriculum',stars:'400k',badge:'help wanted'},{name:'lodash',desc:'Modern JavaScript utility library',stars:'60k',badge:'up-for-grabs'}],
python:[{name:'scikit-learn',desc:'Machine learning in Python',stars:'60k',badge:'good first issue'},{name:'Django',desc:'The web framework for perfectionists',stars:'80k',badge:'help wanted'},{name:'pandas',desc:'Data analysis library',stars:'43k',badge:'good first issue'}],
java:[{name:'elasticsearch',desc:'Distributed search and analytics engine',stars:'70k',badge:'good first issue'},{name:'spring-framework',desc:'Spring framework core',stars:'57k',badge:'help wanted'},{name:'guava',desc:'Google core libraries for Java',stars:'50k',badge:'up-for-grabs'}],
rust:[{name:'rust',desc:'The Rust compiler',stars:'98k',badge:'good first issue'},{name:'alacritty',desc:'Cross-platform GPU-accelerated terminal',stars:'56k',badge:'help wanted'},{name:'servo',desc:'Parallel browser engine',stars:'28k',badge:'good first issue'}],
go:[{name:'kubernetes',desc:'Container orchestration platform',stars:'110k',badge:'good first issue'},{name:'docker',desc:'Container runtime and tooling',stars:'70k',badge:'help wanted'},{name:'hugo',desc:'Static site generator',stars:'75k',badge:'up-for-grabs'}],
typescript:[{name:'VS Code',desc:'Visual Studio Code source code',stars:'160k',badge:'up-for-grabs'},{name:'TypeScript',desc:'TypeScript compiler and tools',stars:'100k',badge:'good first issue'},{name:'angular',desc:'Angular framework',stars:'96k',badge:'help wanted'}],
cpp:[{name:'tensorflow',desc:'Machine learning platform',stars:'185k',badge:'good first issue'},{name:'electron',desc:'Desktop app framework',stars:'114k',badge:'help wanted'},{name:'bitcoin',desc:'Bitcoin Core',stars:'78k',badge:'up-for-grabs'}]
};
const roadmapItems=[{week:'Week 1',task:'Setup: GitHub profile, clone repos, read CONTRIBUTING.md'},
{week:'Week 2',task:'Find and fix a "good first issue" — focus on documentation or simple bug'},
{week:'Week 3',task:'Submit a PR with a code change — add a test or fix a small feature'},
{week:'Week 4',task:'Engage with community: review PRs, comment on issues, join discussions'}];
let selectedSkills=['javascript'];
document.querySelectorAll('.skill-btn').forEach(btn=>{
btn.addEventListener('click',function(){
const skill=this.dataset.skill;
const idx=selectedSkills.indexOf(skill);
if(idx>-1){selectedSkills.splice(idx,1);this.classList.remove('active');}
else{selectedSkills.push(skill);this.classList.add('active');}
});
});
document.getElementById('hours').addEventListener('input',function(){document.getElementById('hours-value').textContent=this.value+' hrs';});
function generatePlan(){
const level=document.getElementById('exp-level').value;
const hours=parseInt(document.getElementById('hours').value);
document.getElementById('plan-level').textContent=level;
document.getElementById('hours-budget').textContent=hours*4;
let totalRepos=0,totalGFI=0;
const repoList=document.getElementById('repo-list');
repoList.innerHTML='';
selectedSkills.forEach(skill=>{
const repos=reposBySkill[skill]||[];
repos.forEach(r=>{
totalRepos++;
if(r.badge==='good first issue')totalGFI++;
const card=document.createElement('div');card.className='repo-card';
card.innerHTML='<div class="repo-header"><span class="repo-name">'+r.name+'</span><span class="repo-badge'+(r.badge==='good first issue'?' good-first':'')+'">'+r.badge+'</span></div><div class="repo-desc">'+r.desc+'</div><div class="repo-meta"><span>⭐ '+r.stars+'</span><span>📂 '+skill+'</span><span>👥 '+r.badge+'</span></div>';
repoList.appendChild(card);});
});
if(repoList.children.length===0){
repoList.innerHTML='<div style="color:var(--muted);font-size:11px">Select skills to find repositories.</div>';
}
document.getElementById('repo-count').textContent=totalRepos;
document.getElementById('gfi-count').textContent=totalGFI*3+level==='beginner'?8:level==='intermediate'?15:22;
// Update roadmap
const roadmap=document.getElementById('roadmap');
roadmap.innerHTML='';
roadmapItems.forEach((item,i)=>{
const div=document.createElement('div');div.className='roadmap-item'+(i===0?' done':i===1?' active':'');
div.innerHTML='<div class="rm-week">'+item.week+'</div><div class="rm-task">'+item.task+'</div>';
roadmap.appendChild(div);});
}
document.getElementById('btn-plan').addEventListener('click',generatePlan);
generatePlan();
})();
