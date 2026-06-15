(function(){'use strict';
const papers=[
{title:'Attention Is All You Need',authors:'Vaswani et al.',venue:'NeurIPS 2017',abstract:'Proposed the Transformer architecture, which replaced recurrent layers with multi-head self-attention, becoming the foundation of modern LLMs.',tags:['nlp','theory'],year:'2023',cat:'nlp'},
{title:'BERT: Pre-training of Deep Bidirectional Transformers',authors:'Devlin et al.',venue:'NAACL 2019',abstract:'Introduced masked language modeling and next-sentence prediction for pre-training bidirectional representations, achieving SOTA on 11 NLP tasks.',tags:['nlp','theory'],year:'2023',cat:'nlp'},
{title:'GPT-4 Technical Report',authors:'OpenAI',venue:'OpenAI Blog 2023',abstract:'Describes GPT-4, a large multimodal model capable of processing text and image inputs and producing human-level text outputs across diverse domains.',tags:['nlp','gen'],year:'2024',cat:'nlp'},
{title:'Denoising Diffusion Probabilistic Models',authors:'Ho et al.',venue:'NeurIPS 2020',abstract:'Introduced DDPMs, a class of generative models that learn to reverse a Markov diffusion process to generate high-quality images.',tags:['gen','cv'],year:'2023',cat:'gen'},
{title:'High-Resolution Image Synthesis with Latent Diffusion Models',authors:'Rombach et al.',venue:'CVPR 2022',abstract:'Proposed Stable Diffusion, a latent diffusion model that performs diffusion in a compressed latent space for efficient high-resolution image generation.',tags:['cv','gen'],year:'2024',cat:'cv'},
{title:'Playing Atari with Deep Reinforcement Learning',authors:'Mnih et al.',venue:'NIPS 2013 Workshop',abstract:'First deep RL model using DQN that learned to play Atari games directly from pixel input, pioneering deep reinforcement learning.',tags:['rl'],year:'2022',cat:'rl'},
{title:'Proximal Policy Optimization Algorithms',authors:'Schulman et al.',venue:'arXiv 2017',abstract:'Introduced PPO, a family of policy gradient methods that achieve reliable and stable training with clipped surrogate objectives.',tags:['rl','theory'],year:'2023',cat:'rl'},
{title:'An Image is Worth 16x16 Words: Transformers for Image Recognition',authors:'Dosovitskiy et al.',venue:'ICLR 2021',abstract:'Applied Transformer architecture directly to image patches for image classification, demonstrating that pure transformers can match CNNs on vision tasks.',tags:['cv','theory'],year:'2024',cat:'cv'},
{title:'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',authors:'Wei et al.',venue:'NeurIPS 2022',abstract:'Showed that generating intermediate reasoning steps (chain-of-thought) significantly improves LLM performance on arithmetic, commonsense, and symbolic reasoning tasks.',tags:['nlp','theory'],year:'2024',cat:'nlp'},
{title:'Learning Transferable Visual Models From Natural Language Supervision',authors:'Radford et al.',venue:'ICML 2021',abstract:'Introduced CLIP, trained on 400M image-text pairs using contrastive learning, enabling zero-shot transfer to many vision tasks.',tags:['cv','nlp'],year:'2023',cat:'cv'},
{title:'HuBERT: Self-Supervised Speech Representation Learning',authors:'Hsu et al.',venue:'NeurIPS 2021',abstract:'Proposed a self-supervised speech representation learning method using hidden units from k-means clustering as targets.',tags:['nlp'],year:'2022',cat:'nlp'},
{title:'DreamBooth: Fine Tuning Text-to-Image Diffusion Models',authors:'Ruiz et al.',venue:'CVPR 2023',abstract:'Fine-tunes pretrained text-to-image diffusion models to synthesize novel views of a subject in different contexts given a few reference images.',tags:['gen','cv'],year:'2024',cat:'gen'}
];
function renderPapers(filter='all',year='all',query=''){
const filtered=papers.filter(p=>{
if(filter!=='all'&&p.cat!==filter)return false;
if(year!=='all'&&p.year!==year)return false;
if(query){const q=query.toLowerCase();return p.title.toLowerCase().includes(q)||p.authors.toLowerCase().includes(q)||p.abstract.toLowerCase().includes(q)||p.tags.some(t=>t.includes(q));}
return true;
});
document.getElementById('result-count').textContent=filtered.length;
const grid=document.getElementById('papers-grid');grid.innerHTML='';
filtered.forEach(p=>{
const card=document.createElement('div');card.className='paper-card';
card.innerHTML='<div class="paper-title">'+p.title+'</div><div class="paper-authors">'+p.authors+'</div><div class="paper-venue">'+p.venue+'</div><div class="paper-abstract">'+p.abstract+'</div><div class="paper-tags">'+p.tags.map(t=>'<span class="paper-tag">'+t+'</span>').join('')+'</div><div class="paper-year">'+p.year+'</div>';
card.addEventListener('click',function(){alert(p.title+'\n\n'+p.authors+'\n'+p.venue+'\n\n'+p.abstract);});
grid.appendChild(card);});
}
let currentFilter='all',currentYear='all',currentQuery='';
document.querySelectorAll('#filter-list .filter-btn').forEach(btn=>{btn.addEventListener('click',function(){
document.querySelectorAll('#filter-list .filter-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');currentFilter=this.dataset.cat;renderPapers(currentFilter,currentYear,currentQuery);});});
document.querySelectorAll('#year-filter .filter-btn').forEach(btn=>{btn.addEventListener('click',function(){
document.querySelectorAll('#year-filter .filter-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');currentYear=this.dataset.year;renderPapers(currentFilter,currentYear,currentQuery);});});
document.getElementById('btn-search').addEventListener('click',function(){currentQuery=document.getElementById('search-input').value;renderPapers(currentFilter,currentYear,currentQuery);});
document.getElementById('search-input').addEventListener('keydown',function(e){if(e.key==='Enter'){currentQuery=this.value;renderPapers(currentFilter,currentYear,currentQuery);}});
renderPapers();
})();
