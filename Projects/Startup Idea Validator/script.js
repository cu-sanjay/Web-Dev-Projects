(function(){'use strict';
const feedbackDB={
tech:{b2c:{high:'Strong B2C tech play. Viral growth potential through social sharing. Focus on UX and onboarding.',mid:'Decent tech idea. Consider narrowing your niche for initial traction.',low:'Highly competitive space. Need a clear differentiator or unique tech advantage.'},b2b:{high:'Enterprise tech with strong margins. Focus on security and compliance features.',mid:'Solid B2B opportunity. Consider a vertical-specific approach.',low:'B2B tech is crowded. Try solving a specific pain point for one industry.'},both:{high:'Dual-market strategy works well for platforms. Ensure different value props.',mid:'Consider a wedge strategy: dominate one side first.',low:'Serving both markets early can dilute resources. Focus on one.'}},
health:{b2c:{high:'Wellness is booming. Gamification and social accountability can drive retention.',mid:'Health apps need strong scientific backing. Consider partnering with experts.',low:'Very competitive. Find a specific underserved health niche.'},b2b:{high:'Healthcare SaaS has great margins. HIPAA compliance is key.',mid:'Good B2B health play. Integration with existing EHR systems is critical.',low:'Healthcare sales cycles are long. Be prepared for enterprise deals.'},both:{high:'Platform play works if you bridge patients and providers effectively.',mid:'Consider starting B2C for brand, then expanding to B2B.',low:'Too broad. Pick B2B or B2C for initial focus.'}},
edu:{b2c:{high:'EdTech continues to grow. Micro-learning and AI personalization are differentiators.',mid:'Good idea. Focus on outcomes and certifications for credibility.',low:'Many free resources exist. Your content needs to be significantly better.'},b2b:{high:'Corporate training is a huge market. Focus on measurable ROI.',mid:'Solid B2B opportunity. Consider compliance-driven training needs.',low:'Enterprise education is relationship-driven. Strong sales team needed.'},both:{high:'Dual model works if you license content to institutions while offering direct access.',mid:'Consider freemium for individuals, premium for institutions.',low:'Complex business model. Simplify your go-to-market first.'}},
fin:{b2c:{high:'Personal finance is hot. Transparency and trust are your biggest assets.',mid:'Interesting concept. Strong regulatory compliance required.',low:'FinTech is highly regulated and competitive. Find a narrow niche.'},b2b:{high:'B2B FinTech has high switching costs — great for retention.',mid:'Consider embedded finance as a growth strategy.',low:'Enterprise finance is tough to break into. Strong partnerships needed.'},both:{high:'Platform model works. Ensure you comply with regulations for both sides.',mid:'Dual focus can work but doubles compliance burden.',low:'Regulatory complexity makes dual-market difficult early on.'}},
env:{b2c:{high:'Environmental awareness is at an all-time high. Behavior change apps with community features drive retention.',mid:'Good timing. Consider corporate partnerships for scale.',low:'Awareness alone isnt enough. Provide clear measurable impact.'},b2b:{high:'Sustainability consulting/reporting for enterprises is growing fast.',mid:'Good B2B environment play. ESG compliance is a key driver.',low:'Enterprise sustainability is relationship-heavy. Start with case studies.'},both:{high:'Connecting consumers with eco-conscious businesses is a winning model.',mid:'Focus on one side first. Consumer adoption drives business interest.',low:'Two-sided marketplace for sustainability is complex. Start niche.'}},
food:{b2c:{high:'Food tech is always evolving. Unique recipes or dietary focus can win.',mid:'Consider meal planning or subscription model for recurring revenue.',low:'Extremely competitive space. Need a strong brand identity.'},b2b:{high:'Restaurant/kitchen tech solutions have strong demand.',mid:'Good B2B opportunity. Focus on operational efficiency.',low:'Thin margins in food. Ensure your solution drives clear cost savings.'},both:{high:'Marketplace connecting food businesses with consumers works well.',mid:'Consider starting on one side to build liquidity.',low:'Two-sided food marketplaces are challenging. Start niche.'}}
};
function validate(){
const name=document.getElementById('idea-name').value||'Your Idea';
const desc=document.getElementById('idea-desc').value||'';
const industry=document.getElementById('industry').value;
const market=document.getElementById('market').value;
const seed=hashCode(name+desc+industry+market);
const rng=seededRandom(seed);
const scores={
marketSize:40+Math.floor(rng()*45),
feasibility:40+Math.floor(rng()*50),
monetization:30+Math.floor(rng()*55),
uniqueness:30+Math.floor(rng()*55),
need:40+Math.floor(rng()*50),
timing:40+Math.floor(rng()*50)
};
const total=Object.values(scores).reduce((a,b)=>a+b,0)/6;
const score=Math.round(total);

// animate score
const arc=document.getElementById('score-arc');
const circ=314;
const offset=circ-(score/100*circ);
arc.setAttribute('stroke-dashoffset',offset);
document.getElementById('score-text').textContent=score;

let label='Risky';
if(score>=80)label='Excellent 🎉';
else if(score>=70)label='Promising';
else if(score>=55)label='Needs Work';
else if(score>=40)label='Risky';
else label='Invalid';
document.getElementById('score-label').textContent=label;
document.getElementById('score-label').style.color=score>=70?'#22c55e':score>=55?'#eab308':'#ef4444';

// detail bars
Object.entries(scores).forEach(([key,val],i)=>{
const bars=document.querySelectorAll('.detail-fill');
if(bars[i]){bars[i].style.width=val+'%';}
const vals=document.querySelectorAll('.detail-value');
if(vals[i])vals[i].textContent=val+'%';
});

// feedback
const f=feedbackDB[industry]&&feedbackDB[industry][market];
let fb='';
if(f){fb=score>=70?f.high:score>=55?f.mid:f.low;}
if(!fb)fb='Interesting idea! Consider refining your value proposition and target market.';
document.getElementById('feedback-text').textContent=fb;
}
function hashCode(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return Math.abs(h);}
function seededRandom(seed){return function(){seed=(seed*9301+49297)%233280;return seed/233280;};}
document.getElementById('btn-validate').addEventListener('click',validate);
validate();
})();
