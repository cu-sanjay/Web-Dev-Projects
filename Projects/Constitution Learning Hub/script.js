const CONSTITUTION = {
  articles: [
    { id:1, part:"Preamble", title:"Preamble", summary:"We the People of the United States, in Order to form a more perfect Union...", text:"We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America." },
    { id:2, part:"Article I", title:"Article I — The Legislative Branch", summary:"Establishes Congress as the lawmaking branch with enumerated powers.", text:"All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives. Section 1 establishes the bicameral legislature. Section 2 defines the House: elected every two years, must be 25+, a citizen for 7+ years. Section 3 defines the Senate: two per state, elected every six years, must be 30+, a citizen for 9+ years." },
    { id:3, part:"Article II", title:"Article II — The Executive Branch", summary:"Vests executive power in the President, defines qualifications and duties.", text:"The executive Power shall be vested in a President of the United States of America. He shall hold his Office during the Term of four Years. The President must be a natural-born citizen, 35+ years old, and a resident for 14+ years. The Electoral College system is established. The President is Commander in Chief and has treaty and appointment powers with Senate advice and consent." },
    { id:4, part:"Article III", title:"Article III — The Judicial Branch", summary:"Establishes the Supreme Court and defines judicial power.", text:"The judicial Power of the United States, shall be vested in one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish. Judges hold office during good behavior (life tenure) and receive compensation that cannot be diminished. The Court has original jurisdiction in cases affecting ambassadors and appellate jurisdiction in all other cases." },
    { id:5, part:"Article IV", title:"Article IV — States' Relations", summary:"Defines state relationships, full faith and credit, and admission of new states.", text:"Full Faith and Credit shall be given in each State to the public Acts, Records, and judicial Proceedings of every other State. Citizens of each state are entitled to privileges and immunities of citizens in the several states. Fugitives must be returned. Congress may admit new states and shall guarantee a republican form of government to each state." },
    { id:6, part:"Article V", title:"Article V — Amendment Process", summary:"Outlines the process for amending the Constitution.", text:"The Congress, whenever two thirds of both Houses shall deem it necessary, shall propose Amendments to this Constitution, or on the Application of the Legislatures of two thirds of the several States, shall call a Convention for proposing Amendments. Amendments must be ratified by three fourths of the state legislatures or conventions." },
    { id:7, part:"Article VI", title:"Article VI — Supremacy Clause", summary:"Establishes the Constitution as the supreme law of the land.", text:"This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land. No religious test shall ever be required as a Qualification to any Office or public Trust under the United States." },
    { id:8, part:"Article VII", title:"Article VII — Ratification", summary:"Specified ratification requirements for the Constitution.", text:"The Ratification of the Conventions of nine States, shall be sufficient for the Establishment of this Constitution between the States so ratifying the Same. Done in Convention by the Unanimous Consent of the States present the Seventeenth Day of September in the Year of our Lord one thousand seven hundred and Eighty seven." },
  ],
  amendments: [
    { id:1, title:"1st Amendment", year:1791, summary:"Freedom of religion, speech, press, assembly, and petition.", text:"Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances." },
    { id:2, title:"2nd Amendment", year:1791, summary:"Right to keep and bear arms.", text:"A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed." },
    { id:3, title:"4th Amendment", year:1791, summary:"Protection against unreasonable searches and seizures.", text:"The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized." },
    { id:4, title:"5th Amendment", year:1791, summary:"Rights in criminal cases, due process, eminent domain.", text:"No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury... nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb... nor shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law; nor shall private property be taken for public use, without just compensation." },
    { id:5, title:"13th Amendment", year:1865, summary:"Abolished slavery and involuntary servitude.", text:"Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction. Congress shall have power to enforce this article by appropriate legislation." },
    { id:6, title:"14th Amendment", year:1868, summary:"Citizenship, equal protection, due process clause.", text:"All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens... nor deny to any person within its jurisdiction the equal protection of the laws." },
    { id:7, title:"15th Amendment", year:1870, summary:"Right to vote regardless of race.", text:"The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of race, color, or previous condition of servitude." },
    { id:8, title:"19th Amendment", year:1920, summary:"Women's right to vote.", text:"The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of sex. Congress shall have power to enforce this article by appropriate legislation." },
    { id:9, title:"22nd Amendment", year:1951, summary:"Presidential term limits (two-term limit).", text:"No person shall be elected to the office of the President more than twice, and no person who has held the office of President, or acted as President, for more than two years of a term to which some other person was elected President shall be elected to the office of the President more than once." },
    { id:10, title:"26th Amendment", year:1971, summary:"Voting age set to 18.", text:"The right of citizens of the United States, who are eighteen years of age or older, to vote shall not be denied or abridged by the United States or by any State on account of age." },
  ],
};

const QUIZ = [
  { q:"What is the first article of the Constitution about?", opts:["The Executive Branch","The Legislative Branch","The Judicial Branch","States' Rights"], ans:1 },
  { q:"How many amendments does the Constitution have?", opts:["10","27","33","19"], ans:1 },
  { q:"What does the 1st Amendment protect?", opts:["Right to bear arms","Freedom of speech, religion, press","Right to vote","Protection from searches"], ans:1 },
  { q:"What year was the Constitution signed?", opts:["1776","1787","1791","1800"], ans:1 },
  { q:"How many articles does the Constitution have?", opts:["5","7","10","12"], ans:1 },
  { q:"Which amendment abolished slavery?", opts:["12th","13th","14th","15th"], ans:1 },
  { q:"Who is the Commander in Chief of the military?", opts:["Secretary of Defense","President","General of the Army","Vice President"], ans:1 },
  { q:"What is the supreme law of the land?", opts:["The Declaration","The Constitution","The Bill of Rights","Federal Statutes"], ans:1 },
  { q:"Which amendment gave women the right to vote?", opts:["15th","17th","19th","21st"], ans:2 },
  { q:"How many senators are there per state?", opts:["1","2","It varies","4"], ans:1 },
  { q:"What does the 14th Amendment guarantee?", opts:["Free speech","Equal protection under law","Right to bear arms","No cruel punishment"], ans:1 },
  { q:"How old must the President be?", opts:["30","35","40","25"], ans:1 },
  { q:"Which amendment set the voting age to 18?", opts:["24th","25th","26th","27th"], ans:2 },
  { q:"What fraction of Congress must propose an amendment?", opts:["Majority","Two-thirds","Three-fourths","Unanimous"], ans:1 },
  { q:"How many states were needed to ratify the Constitution?", opts:["7","9","11","13"], ans:1 },
];

const $=id=>document.getElementById(id);
const state={ tab:'articles', quiz:{ current:0, score:0, answered:false, done:false } };

function shuffle(a){ for(let i=a.length-1;i>0;i--){ let j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

function renderArticles(filter='', part='all'){
  const list=$('articleList');
  let items=CONSTITUTION.articles;
  if(filter) items=items.filter(a=>a.title.toLowerCase().includes(filter.toLowerCase())||a.summary.toLowerCase().includes(filter.toLowerCase()));
  if(part!=='all') items=items.filter(a=>a.part===part);
  if(!items.length){ list.innerHTML='<div class="empty-state"><h3>No Results</h3><p>Try adjusting your search.</p></div>'; return; }
  list.innerHTML=items.map(a=>`<div class="card" tabindex="0"><h3>${a.title}</h3><div class="meta">${a.part}</div><p>${a.summary}</p><div class="detail">${a.text}</div></div>`).join('');
  list.querySelectorAll('.card').forEach(c=>{ c.addEventListener('click',()=>c.classList.toggle('expanded')); c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); c.click() } }); });
}

function renderAmendments(filter=''){
  const list=$('amendList');
  let items=CONSTITUTION.amendments;
  if(filter) items=items.filter(a=>a.title.toLowerCase().includes(filter.toLowerCase())||a.summary.toLowerCase().includes(filter.toLowerCase()));
  if(!items.length){ list.innerHTML='<div class="empty-state"><h3>No Results</h3><p>Try adjusting your search.</p></div>'; return; }
  list.innerHTML=items.map(a=>`<div class="card" tabindex="0"><h3>${a.title}</h3><div class="meta">Ratified ${a.year}</div><p>${a.summary}</p><div class="detail">${a.text}</div></div>`).join('');
  list.querySelectorAll('.card').forEach(c=>{ c.addEventListener('click',()=>c.classList.toggle('expanded')); c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); c.click() } }); });
}

function renderQuiz(){
  const sq=shuffle([...QUIZ]).slice(0,10);
  state.quiz={ current:0, score:0, answered:false, done:false, questions:sq };
  showQuestion();
}

function showQuestion(){
  const qs=state.quiz;
  if(qs.done||qs.current>=qs.questions.length){ showResults(); return; }
  const q=qs.questions[qs.current];
  $('quizProgress').textContent=`Question ${qs.current+1} / ${qs.questions.length}`;
  $('quizScore').textContent=`Score: ${qs.score}`;
  $('quizQuestion').textContent=q.q;
  $('quizFeedback').className='quiz-feedback';
  $('quizFeedback').style.display='none';
  $('quizNext').disabled=true;
  qs.answered=false;
  $('quizOptions').innerHTML=q.opts.map((o,i)=>`<button class="quiz-option" data-idx="${i}">${o}</button>`).join('');
  $('quizOptions').querySelectorAll('.quiz-option').forEach(b=>{
    b.addEventListener('click',()=>{
      if(qs.answered) return;
      qs.answered=true;
      const idx=parseInt(b.dataset.idx);
      const correct=idx===q.ans;
      if(correct){ qs.score++; $('quizScore').textContent=`Score: ${qs.score}`; }
      b.classList.add(correct?'correct':'wrong');
      if(!correct) $('quizOptions').querySelectorAll('.quiz-option')[q.ans].classList.add('correct');
      document.querySelectorAll('.quiz-option').forEach(o=>o.disabled=true);
      const fb=$('quizFeedback');
      fb.textContent=correct?'Correct! Well done.' : `Incorrect. The correct answer was: ${q.opts[q.ans]}`;
      fb.className='quiz-feedback show '+(correct?'correct':'wrong');
      $('quizNext').disabled=false;
    });
  });
}

function showResults(){
  const qs=state.quiz;
  const pct=Math.round((qs.score/qs.questions.length)*100);
  $('quizProgress').textContent='Quiz Complete!';
  $('quizScore').textContent=`Final Score: ${qs.score}/${qs.questions.length}`;
  $('quizQuestion').textContent=`You scored ${qs.score} out of ${qs.questions.length} (${pct}%)`;
  $('quizOptions').innerHTML='';
  const fb=$('quizFeedback');
  fb.textContent=pct>=70?'Great job! You have a solid understanding of the Constitution.' : pct>=40?'Good effort! Review the articles and amendments above and try again.' : 'Keep studying! Browse the Articles and Amendments sections to learn more.';
  fb.className='quiz-feedback show done';
  $('quizNext').disabled=true;
  qs.done=true;
}

$('articleSearch').addEventListener('input',e=>renderArticles(e.target.value,$('articleFilter').value));
$('articleFilter').addEventListener('change',e=>renderArticles($('articleSearch').value,e.target.value));
$('amendSearch').addEventListener('input',e=>renderAmendments(e.target.value));
$('quizNext').addEventListener('click',()=>{ state.quiz.current++; showQuestion(); });
$('quizRestart').addEventListener('click',renderQuiz);

document.querySelectorAll('.tab-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(x=>{ x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); b.setAttribute('aria-selected','true');
    const panel=$('panel-'+b.dataset.tab);
    if(panel) panel.classList.add('active');
    state.tab=b.dataset.tab;
    if(state.tab==='quiz'&&!state.quiz.done) renderQuiz();
  });
});

const parts=[...new Set(CONSTITUTION.articles.map(a=>a.part))];
const sel=$('articleFilter');
parts.forEach(p=>{ const o=document.createElement('option'); o.value=p; o.textContent=p; sel.appendChild(o); });

renderArticles();
renderAmendments();
renderQuiz();
