const PROFILE_KEY = 'linkedin_profile';
const POSTS_KEY = 'linkedin_posts';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=200&fit=crop';
const AVATAR_KEY = 'linkedin_avatar';
const BANNER_KEY = 'linkedin_banner';

const defaultProfile = {
  name: 'Alex Turner',
  headline: 'Full Stack Developer | React & Node.js Enthusiast | Open Source Contributor',
  location: 'San Francisco Bay Area',
  company: 'Open Source Contributor',
  education: 'University of California',
  connections: 50,
  avatarUrl: DEFAULT_AVATAR,
  bannerUrl: DEFAULT_BANNER,
};

const peopleData = [
  { name: 'Sarah Chen', title: 'UI/UX Designer at Figma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face' },
  { name: 'Marcus Johnson', title: 'Software Engineer at Google', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face' },
  { name: 'Priya Sharma', title: 'Product Manager at Stripe', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face' },
  { name: 'Alex Rodriguez', title: 'Data Scientist at Netflix', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face' },
  { name: 'Emily Watson', title: 'Frontend Lead at Vercel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face' },
];

const reactionTypes = [
  { id: 'like', label: 'Like', icon: '👍' },
  { id: 'celebrate', label: 'Celebrate', icon: '🎉' },
  { id: 'support', label: 'Support', icon: '💪' },
  { id: 'love', label: 'Love', icon: '❤️' },
  { id: 'insightful', label: 'Insightful', icon: '💡' },
];

const seedPosts = [
  {
    text: "Excited to share that I've joined the team at Netlify as a Senior Frontend Engineer! After an amazing 3 years building developer tools, I'm ready for this new chapter. The interview process was rigorous but incredibly rewarding. Grateful to everyone who helped me prepare! 🚀",
    time: Date.now() - 3600000 * 2,
    reactions: { like: 47, celebrate: 12, love: 8, insightful: 3 },
    userReaction: null,
    comments: [
      { name: 'Sarah Chen', text: 'Congrats Alex! You deserve it! 🎉', time: Date.now() - 3600000 },
      { name: 'Marcus Johnson', text: 'Welcome to the team! 🚀', time: Date.now() - 1800000 },
    ],
  },
  {
    text: "Just published my first deep-dive blog post: 'Building Resilient Micro-Frontends with Module Federation.' Covers architecture patterns, deployment strategies, and lessons learned from production. Would love feedback from the community! 📝\n\n🔗 Link in comments",
    time: Date.now() - 3600000 * 24,
    reactions: { like: 89, celebrate: 15, insightful: 42, support: 6 },
    userReaction: null,
    comments: [
      { name: 'Priya Sharma', text: 'Great read! The deployment section really resonated with our challenges at Stripe.', time: Date.now() - 3600000 * 20 },
      { name: 'Alex Rodriguez', text: 'Bookmarked this. Really clear explanations of the tradeoffs.', time: Date.now() - 3600000 * 18 },
    ],
  },
  {
    text: "Thrilled to share that our team won the annual internal hackathon! 🏆 We built an AI-powered code review assistant that detects performance bottlenecks before PRs even get submitted. 48 hours of caffeine, code, and camaraderie. Proud of what we accomplished!",
    time: Date.now() - 3600000 * 48,
    reactions: { like: 156, celebrate: 73, love: 29, support: 11, insightful: 8 },
    userReaction: null,
    comments: [
      { name: 'Emily Watson', text: 'Incredible! Would love to see a demo!', time: Date.now() - 3600000 * 40 },
    ],
  },
  {
    text: 'I see a lot of junior devs asking "how do I get started with system design?"\n\nHere\'s my honest take:\n1. Learn the fundamentals (CAP, ACID, consistent hashing)\n2. Read real engineering blogs (not just interview prep)\n3. Build something that breaks and fix it\n4. Review past incidents at major companies\n\nWhat would you add to this list?',
    time: Date.now() - 3600000 * 72,
    reactions: { like: 234, insightful: 98, support: 17, love: 12 },
    userReaction: null,
    comments: [
      { name: 'Marcus Johnson', text: 'Solid advice. I\'d add: understand the business domain before diving into tech choices.', time: Date.now() - 3600000 * 60 },
      { name: 'Sarah Chen', text: 'The "build something that breaks" is so underrated!', time: Date.now() - 3600000 * 55 },
      { name: 'Alex Rodriguez', text: '➕1 on reading engineering blogs. The Stripe and Netflix tech blogs are gold.', time: Date.now() - 3600000 * 50 },
    ],
  },
  {
    text: "After months of iteration, our open source project just hit 5K stars on GitHub! ⭐ What started as a side project to solve our own problem has grown into a thriving community with 40+ contributors across 12 countries.\n\nOpen source is truly magical. 🌟\n\nRepo: github.com/example/project",
    time: Date.now() - 3600000 * 96,
    reactions: { like: 312, celebrate: 89, love: 45, support: 23, insightful: 7 },
    userReaction: null,
    comments: [
      { name: 'Priya Sharma', text: 'Amazing milestone! We use this tool daily on our team 🙌', time: Date.now() - 3600000 * 80 },
      { name: 'Emily Watson', text: 'The contributor map is incredible! Truly global collaboration.', time: Date.now() - 3600000 * 78 },
    ],
  },
];

let profile = {};
let posts = [];
let connectedStates = {};

function loadProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    profile = saved ? JSON.parse(saved) : { ...defaultProfile };
  } catch {
    profile = { ...defaultProfile };
  }
}

function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

function loadPosts() {
  try {
    const saved = localStorage.getItem(POSTS_KEY);
    posts = saved ? JSON.parse(saved) : [];
  } catch {
    posts = [];
  }
  if (posts.length === 0) {
    posts = seedPosts.map(p => ({ ...p, comments: p.comments.map(c => ({ ...c })) }));
  }
}

function savePosts() {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch {}
}

function renderProfile() {
  const fields = [
    { el: 'bannerName', val: profile.name },
    { el: 'bannerHeadline', val: profile.headline },
    { el: 'bannerLocation', val: `📍 ${profile.location}` },
    { el: 'bannerCompany', val: `💼 ${profile.company}` },
    { el: 'bannerEducation', val: `🎓 ${profile.education || ''}` },
    { el: 'miniName', val: profile.name },
    { el: 'miniHeadline', val: profile.headline },
    { el: 'postModalName', val: profile.name },
  ];
  fields.forEach(({ el, val }) => {
    const elm = document.getElementById(el);
    if (elm) elm.textContent = val;
  });

  const connEls = document.querySelectorAll('#connectionsDisplay, #connectionsCount');
  connEls.forEach((el) => { el.textContent = profile.connections; });

  document.getElementById('bannerConnections').innerHTML =
    `<span>${profile.connections}</span> connections`;

  const avatar = profile.avatarUrl || DEFAULT_AVATAR;
  document.getElementById('bannerAvatarImg').src = avatar;
  document.getElementById('miniAvatarImg').src = avatar;
  document.getElementById('postAvatarImg').src = avatar;
  document.getElementById('navAvatarImg').src = avatar;
  document.getElementById('postModalAvatar').src = avatar;

  const banner = profile.bannerUrl || DEFAULT_BANNER;
  document.getElementById('bannerBgImg').src = banner;
  document.getElementById('miniBannerImg').src = banner;
}

function renderFeedSort() {
  const container = document.querySelector('.feed-sort');
  if (!container) return;
  container.innerHTML = `<span>Sort by: <strong>Recent</strong> ▼</span> <span style="color:var(--text-muted);font-size:0.82rem">${posts.length} posts</span>`;
}

function totalReactions(reactions) {
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}

function topReactions(reactions, limit = 3) {
  return reactionTypes
    .filter(r => (reactions[r.id] || 0) > 0)
    .sort((a, b) => (reactions[b.id] || 0) - (reactions[a.id] || 0))
    .slice(0, limit);
}

function getReactionIcon(id) {
  const r = reactionTypes.find(x => x.id === id);
  return r ? r.icon : '👍';
}

function renderPosts() {
  const list = document.getElementById('feedList');
  renderFeedSort();
  if (posts.length === 0) {
    list.innerHTML = '<div class="feed-empty">No posts yet. Share something!</div>';
    return;
  }
  list.innerHTML = posts
    .map((p, i) => {
      const d = new Date(p.time);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      let timeStr;
      if (diffMins < 60) timeStr = `${diffMins}m ago`;
      else if (diffHours < 24) timeStr = `${diffHours}h ago`;
      else if (diffDays < 7) timeStr = `${diffDays}d ago`;
      else timeStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const total = totalReactions(p.reactions);
      const top3 = topReactions(p.reactions);
      const commentCount = p.comments ? p.comments.length : 0;
      const hasReacted = p.userReaction !== null;

      return `
        <div class="feed-post">
          <div class="feed-post-header">
            <img class="feed-post-avatar" src="${profile.avatarUrl || DEFAULT_AVATAR}" alt="">
            <div>
              <div class="feed-post-author">${profile.name}</div>
              <div class="feed-post-headline">${profile.headline}</div>
              <div class="feed-post-time">${timeStr}</div>
            </div>
          </div>
          <div class="feed-post-body">${p.text}</div>
          ${total > 0 || commentCount > 0 ? `
          <div class="feed-post-stats">
            <div class="feed-post-reactions">
              ${top3.map(r => `<span class="reaction-icon-sm">${r.icon}</span>`).join('')}
              ${total > 0 ? `<span class="reaction-count">${total}</span>` : ''}
            </div>
            <div class="feed-post-comment-count">${commentCount > 0 ? `${commentCount} comment${commentCount > 1 ? 's' : ''}` : ''}</div>
          </div>` : ''}
          <div class="feed-post-actions">
            ${reactionTypes.map(r => `
              <button class="feed-post-action${p.userReaction === r.id ? ' reacted' : ''}" data-reaction="${r.id}" data-index="${i}" title="${r.label}">
                ${r.icon}
                <span>${r.label}</span>
              </button>
            `).join('')}
            <button class="feed-post-action" data-action="comment" data-index="${i}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Comment</span>
            </button>
          </div>
          ${commentCount > 0 ? `
          <div class="feed-post-comments">
            ${p.comments.slice(0, 2).map(c => `
              <div class="comment-row">
                <strong>${c.name}</strong>
                <span>${c.text}</span>
              </div>
            `).join('')}
            ${commentCount > 2 ? `<div class="comment-more">View all ${commentCount} comments</div>` : ''}
          </div>` : ''}
        </div>`;
    })
    .join('');

  document.querySelectorAll('.feed-post-action[data-reaction]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const rid = btn.dataset.reaction;
      const post = posts[idx];
      if (post.userReaction === rid) {
        post.reactions[rid] = Math.max(0, (post.reactions[rid] || 0) - 1);
        post.userReaction = null;
      } else {
        if (post.userReaction) {
          post.reactions[post.userReaction] = Math.max(0, (post.reactions[post.userReaction] || 0) - 1);
        }
        post.reactions[rid] = (post.reactions[rid] || 0) + 1;
        post.userReaction = rid;
      }
      savePosts();
      renderPosts();
    });
  });

  document.querySelectorAll('.feed-post-action[data-action="comment"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const msg = prompt('Write a comment:');
      if (msg && msg.trim()) {
        const idx = parseInt(btn.dataset.index);
        if (!posts[idx].comments) posts[idx].comments = [];
        posts[idx].comments.push({ name: profile.name, text: msg.trim(), time: Date.now() });
        savePosts();
        renderPosts();
      }
    });
  });
}

function renderPeople() {
  const list = document.getElementById('peopleList');
  list.innerHTML = peopleData
    .map((p, i) => {
      const isConnected = connectedStates[p.name];
      return `
        <div class="people-item" style="animation-delay:${i * 0.05}s">
          <img class="people-avatar-img" src="${p.avatar}" alt="${p.name}">
          <div class="people-info">
            <div class="people-name">${p.name}</div>
            <div class="people-title">${p.title}</div>
            <button class="connect-btn" data-person="${p.name}"${isConnected ? ' disabled' : ''}>${isConnected ? 'Pending' : 'Connect'}</button>
          </div>
        </div>`;
    })
    .join('');

  list.querySelectorAll('.connect-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.person;
      connectedStates[name] = true;
      profile.connections += 1;
      saveProfile();
      renderProfile();
      renderPeople();
      showToast(`Connection request sent to ${name} 🎉`);
    });
  });
}

function openEditModal() {
  document.getElementById('editName').value = profile.name;
  document.getElementById('editHeadline').value = profile.headline;
  document.getElementById('editLocation').value = profile.location;
  document.getElementById('editCompany').value = profile.company;
  document.getElementById('editEducation').value = profile.education || '';
  document.getElementById('editAvatarUrl').value = profile.avatarUrl || '';
  document.getElementById('editBannerUrl').value = profile.bannerUrl || '';
  document.getElementById('editConnections').value = profile.connections;
  document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadPosts();
  renderProfile();
  renderPosts();
  renderPeople();

  document.getElementById('editProfileBtn').addEventListener('click', openEditModal);
  document.getElementById('modalClose').addEventListener('click', closeEditModal);
  document.getElementById('modalCancel').addEventListener('click', closeEditModal);
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    profile.name = document.getElementById('editName').value.trim();
    profile.headline = document.getElementById('editHeadline').value.trim();
    profile.location = document.getElementById('editLocation').value.trim();
    profile.company = document.getElementById('editCompany').value.trim();
    profile.education = document.getElementById('editEducation').value.trim();
    profile.avatarUrl = document.getElementById('editAvatarUrl').value.trim() || DEFAULT_AVATAR;
    profile.bannerUrl = document.getElementById('editBannerUrl').value.trim() || DEFAULT_BANNER;
    profile.connections = parseInt(document.getElementById('editConnections').value) || 0;
    saveProfile();
    renderProfile();
    renderPeople();
    closeEditModal();
    showToast('Profile updated successfully ✨');
  });

  document.getElementById('openPostModal').addEventListener('click', () => {
    document.getElementById('postTextarea').value = '';
    document.getElementById('postModal').classList.add('open');
  });

  document.getElementById('postModalClose').addEventListener('click', () => {
    document.getElementById('postModal').classList.remove('open');
  });

  document.getElementById('postModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('postModal').classList.remove('open');
  });

  document.querySelectorAll('.post-emoji-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById('postTextarea');
      ta.value += btn.dataset.emoji;
      ta.focus();
    });
  });

  document.getElementById('postSubmit').addEventListener('click', () => {
    const ta = document.getElementById('postTextarea');
    const text = ta.value.trim();
    if (!text) return;
    posts.unshift({
      text,
      time: Date.now(),
      reactions: { like: 0, celebrate: 0, support: 0, love: 0, insightful: 0 },
      userReaction: null,
      comments: [],
    });
    savePosts();
    renderPosts();
    document.getElementById('postModal').classList.remove('open');
    showToast('Post published successfully 🚀');
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    window.print();
  });
});
