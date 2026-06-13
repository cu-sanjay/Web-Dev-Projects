/**
 * Chat Room — script.js
 * Real-time multi-tab chat using BroadcastChannel API + localStorage
 * No server, no dependencies — pure vanilla JS
 */

'use strict';

/* ─── Constants ─────────────────────────────────────────── */
const CHANNEL_NAME = 'chat-room';
const STORAGE_KEY  = 'chat-room:messages';
const MAX_MESSAGES = 100;
const BOT_NAME     = 'ChatBot 🤖';
const BOT_REPLIES  = [
  'Hey there! 👋 Open another browser tab to chat with yourself!',
  'Interesting thought! 🤔',
  "I'm just a bot — open a second tab to chat with a real user.",
  "You're the only one here. Try opening another tab!",
  '🚀 This chat uses the BroadcastChannel API — no server needed!',
  '💡 Tip: messages are shared across all tabs of this file.',
  "That's pretty cool! 😄",
  '🎉 Nice one!',
  "I couldn't agree more.",
  'Tell me more…',
];

/* ─── State ──────────────────────────────────────────────── */
let myNickname     = '';
let myId           = '';
let channel        = null;
let botTypingTimer = null;
let iAmTyping      = false;
let typingTimer    = null;
let typingBcTimer  = null;

/* ─── DOM refs ───────────────────────────────────────────── */
const $overlay       = document.getElementById('nickname-overlay');
const $app           = document.getElementById('app');
const $nickForm      = document.getElementById('nickname-form');
const $nickInput     = document.getElementById('nickname-input');
const $msgForm       = document.getElementById('msg-form');
const $msgInput      = document.getElementById('msg-input');
const $messages      = document.getElementById('messages');
const $welcome       = document.getElementById('chat-welcome');
const $onlineList    = document.getElementById('online-list');
const $onlineCount   = document.getElementById('online-count');
const $meAvatar      = document.getElementById('me-avatar');
const $meName        = document.getElementById('me-name');
const $leaveBtn      = document.getElementById('leave-btn');
const $clearBtn      = document.getElementById('clear-btn');
const $typingBar     = document.getElementById('typing-bar');
const $typingText    = document.getElementById('typing-text');
const $sidebar       = document.getElementById('sidebar');
const $sidebarToggle = document.getElementById('sidebar-toggle');
const $msgTemplate   = document.getElementById('msg-template');
const $sysTemplate   = document.getElementById('msg-system-template');

/* ─── Show / Hide helpers ────────────────────────────────── */
function show(el, displayVal) {
  el.style.display = displayVal || 'block';
}
function hide(el) {
  el.style.display = 'none';
}

/* ─── Helpers ────────────────────────────────────────────── */
function stringToHsl(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 'hsl(' + (Math.abs(hash) % 360) + ',55%,55%)';
}

function initials(name) {
  return name.trim().split(/\s+/).map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function isGrouped(a, b) {
  return a && b && a.senderId === b.senderId && (b.timestamp - a.timestamp) < 3 * 60 * 1000;
}

/* ─── Persistent messages ────────────────────────────────── */
function encode(val) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(val)))); } catch (e) { return ''; }
}

function decode(raw) {
  try { return JSON.parse(decodeURIComponent(escape(atob(raw)))); } catch (e) { return null; }
}

function loadMessages() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    var d = decode(raw);
    return Array.isArray(d) ? d : [];
  } catch (e) { return []; }
}

function saveMessages(msgs) {
  try { localStorage.setItem(STORAGE_KEY, encode(msgs.slice(-MAX_MESSAGES))); }
  catch (e) { /* quota */ }
}

/* ─── Presence ───────────────────────────────────────────── */
const PRESENCE_KEY = 'chat-room:presence';

function setPresence(on) {
  let all = getPresence();
  if (on) {
    all[myId] = { nickname: myNickname, ts: Date.now() };
  } else {
    delete all[myId];
  }
  try { localStorage.setItem(PRESENCE_KEY, encode(all)); } catch(e) {}
}

function getPresence() {
  try {
    const raw = localStorage.getItem(PRESENCE_KEY);
    if (!raw) return {};
    const d = decode(raw);
    if (!d || typeof d !== 'object') return {};
    const now = Date.now();
    Object.keys(d).forEach(function(id) {
      if (now - d[id].ts > 15000) delete d[id];
    });
    return d;
  } catch(e) { return {}; }
}

function renderOnlineList() {
  const presence = getPresence();
  const users = Object.keys(presence);
  $onlineCount.textContent = users.length;
  $onlineList.innerHTML = '';
  users.forEach(function(id) {
    const p = presence[id];
    const color = stringToHsl(p.nickname);
    const li = document.createElement('li');
    li.className = 'online-user';
    li.innerHTML =
      '<div class="online-user__dot"></div>' +
      '<div class="online-user__avatar" style="background:' + color + '">' + escHtml(initials(p.nickname)) + '</div>' +
      '<span class="online-user__name">' + escHtml(p.nickname) + (id === myId ? ' (you)' : '') + '</span>';
    $onlineList.appendChild(li);
  });
}

function heartbeat() {
  setPresence(true);
  renderOnlineList();
}

/* ─── Render messages ────────────────────────────────────── */
function renderMsg(msg, prev) {
  if (msg.system) {
    const el = $sysTemplate.content.cloneNode(true);
    el.querySelector('.msg__system-text').textContent = msg.text;
    $messages.appendChild(el);
  } else {
    // Hide welcome banner only when a real chat message arrives
    hide($welcome);

    const grouped = isGrouped(prev, msg);
    const el = $msgTemplate.content.cloneNode(true);
    const li = el.querySelector('.msg');

    if (grouped) li.classList.add('msg--grouped');
    if (msg.own)  li.classList.add('msg--own');
    if (msg.bot)  li.classList.add('msg--bot');

    const color = stringToHsl(msg.sender);
    li.querySelector('.msg__avatar').style.background = color;
    li.querySelector('.msg__avatar').textContent = initials(msg.sender);
    li.querySelector('.msg__author').textContent  = msg.sender;
    li.querySelector('.msg__author').style.color  = color;
    li.querySelector('.msg__time').textContent    = formatTime(msg.timestamp);
    li.querySelector('.msg__time').dateTime       = new Date(msg.timestamp).toISOString();
    li.querySelector('.msg__text').textContent    = msg.text;

    $messages.appendChild(el);
  }

  // Scroll to bottom
  $messages.scrollTop = $messages.scrollHeight;
}

function renderAll() {
  $messages.innerHTML = '';
  const msgs = loadMessages();
  if (msgs.length === 0) {
    show($welcome, 'flex');
    return;
  }
  hide($welcome);
  msgs.forEach(function(m, i) { renderMsg(m, msgs[i - 1] || null); });
}

/* ─── BroadcastChannel ───────────────────────────────────── */
function broadcast(msg) {
  if (channel) channel.postMessage(msg);
}

function handleIncoming(data) {
  if (!data || data.senderId === myId) return;

  const msgs = loadMessages();
  const prev = msgs[msgs.length - 1] || null;

  if (data.type === 'chat') {
    msgs.push(data);
    saveMessages(msgs);
    renderMsg(data, prev);
  } else if (data.type === 'typing') {
    showTyping(data.sender);
  } else if (data.type === 'stopped-typing') {
    hideTyping();
  } else if (data.type === 'presence') {
    renderOnlineList();
  } else if (data.type === 'clear') {
    localStorage.removeItem(STORAGE_KEY);
    $messages.innerHTML = '';
    show($welcome, 'flex');
  }
}

/* ─── Typing indicator ───────────────────────────────────── */
function showTyping(name) {
  $typingText.textContent = name + ' is typing…';
  show($typingBar, 'flex');
  clearTimeout(typingTimer);
  typingTimer = setTimeout(hideTyping, 3500);
}

function hideTyping() {
  hide($typingBar);
}

/* ─── Send message ───────────────────────────────────────── */
function sendMessage(text) {
  const msgs  = loadMessages();
  const prev  = msgs[msgs.length - 1] || null;
  const msg   = {
    type:      'chat',
    id:        uid(),
    senderId:  myId,
    sender:    myNickname,
    text:      text.trim(),
    timestamp: Date.now(),
    own:       true,
  };

  msgs.push(msg);
  saveMessages(msgs);
  renderMsg(msg, prev);

  // Broadcast without own=true so other tabs don't highlight it as own
  const outgoing = Object.assign({}, msg, { own: false });
  broadcast(outgoing);

  // Echo bot if alone
  const others = Object.keys(getPresence()).filter(function(id) { return id !== myId; });
  if (others.length === 0) scheduleBotReply();
}

/* ─── Echo Bot ───────────────────────────────────────────── */
function scheduleBotReply() {
  clearTimeout(botTypingTimer);
  const delay = 1200 + Math.random() * 1800;

  botTypingTimer = setTimeout(function() {
    showTyping(BOT_NAME);

    botTypingTimer = setTimeout(function() {
      hideTyping();
      const text = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      const msgs = loadMessages();
      const prev = msgs[msgs.length - 1] || null;
      const botMsg = {
        type:      'chat',
        id:        uid(),
        senderId:  'bot',
        sender:    BOT_NAME,
        text:      text,
        timestamp: Date.now(),
        bot:       true,
      };
      msgs.push(botMsg);
      saveMessages(msgs);
      renderMsg(botMsg, prev);
    }, 1000 + Math.random() * 800);
  }, delay);
}

/* ─── Auto-resize textarea ───────────────────────────────── */
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

/* ─── Nickname flow ──────────────────────────────────────── */
function showModal() {
  show($overlay, 'flex');
  hide($app);
  $nickInput.value = '';
  setTimeout(function() { $nickInput.focus(); }, 60);
}

function joinChat(nickname) {
  myNickname = nickname.trim();
  myId       = uid();

  // Open BroadcastChannel
  if (channel) channel.close();
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.addEventListener('message', function(e) { handleIncoming(e.data); });

  // Swap screens
  hide($overlay);
  show($app, 'flex');

  // Sidebar user card
  const color = stringToHsl(myNickname);
  $meAvatar.style.background = color;
  $meAvatar.textContent = initials(myNickname);
  $meName.textContent   = myNickname;

  // Presence + heartbeat
  setPresence(true);
  broadcast({ type: 'presence', senderId: myId });
  setInterval(heartbeat, 10000);
  heartbeat();

  // Render history (welcome banner shows if no messages)
  renderAll();

  $msgInput.focus();
}

/* ─── Event Listeners ────────────────────────────────────── */

// Join form
$nickForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const val = $nickInput.value.trim();
  if (val) joinChat(val);
});

// Send message
$msgForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const text = $msgInput.value.trim();
  if (!text) return;
  sendMessage(text);
  $msgInput.value = '';
  autoResize($msgInput);
  if (iAmTyping) {
    iAmTyping = false;
    broadcast({ type: 'stopped-typing', senderId: myId });
  }
});

// Enter = send, Shift+Enter = newline
$msgInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $msgForm.dispatchEvent(new Event('submit'));
  }
});

// Typing broadcast
$msgInput.addEventListener('input', function() {
  autoResize($msgInput);
  if (!iAmTyping) {
    iAmTyping = true;
    broadcast({ type: 'typing', sender: myNickname, senderId: myId });
  }
  clearTimeout(typingBcTimer);
  typingBcTimer = setTimeout(function() {
    iAmTyping = false;
    broadcast({ type: 'stopped-typing', senderId: myId });
  }, 2500);
});

// Clear chat
$clearBtn.addEventListener('click', function() {
  if (!confirm('Clear all messages?')) return;
  localStorage.removeItem(STORAGE_KEY);
  $messages.innerHTML = '';
  show($welcome, 'flex');
  broadcast({ type: 'clear', senderId: myId });
});

// Leave / change nickname
$leaveBtn.addEventListener('click', function() {
  setPresence(false);
  broadcast({ type: 'presence', senderId: myId });
  if (channel) { channel.close(); channel = null; }
  showModal();
});

// Mobile sidebar toggle
$sidebarToggle.addEventListener('click', function() {
  const isOpen = $sidebar.classList.toggle('sidebar--open');
  $sidebarToggle.setAttribute('aria-expanded', String(isOpen));

  let sOverlay = document.querySelector('.sidebar-overlay');
  if (isOpen) {
    if (!sOverlay) {
      sOverlay = document.createElement('div');
      sOverlay.className = 'sidebar-overlay';
      document.body.appendChild(sOverlay);
    }
    sOverlay.addEventListener('click', function() {
      $sidebar.classList.remove('sidebar--open');
      $sidebarToggle.setAttribute('aria-expanded', 'false');
      sOverlay.remove();
    }, { once: true });
  } else {
    if (sOverlay) sOverlay.remove();
  }
});

// Presence sync across tabs via storage events
window.addEventListener('storage', function(e) {
  if (e.key === PRESENCE_KEY) renderOnlineList();
});

// Cleanup on close
window.addEventListener('beforeunload', function() {
  setPresence(false);
  if (channel) channel.close();
});

/* ─── Init ───────────────────────────────────────────────── */
// Hide app initially via inline style (no CSS attribute dependency)
hide($app);
hide($typingBar);
show($overlay, 'flex');
showModal();
