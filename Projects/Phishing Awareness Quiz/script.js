(function () {
  var STORAGE_KEY = 'phishing_quiz_data';

  /* ---- Scenarios ---- */
  var SCENARIOS = [
    {
      id: 1,
      sender: 'Netflix Security <security@netflix-secure.com>',
      replyTo: 'reply@phish-bank.ru',
      subject: 'URGENT: Your account has been suspended',
      body: 'Dear Valued Customer,\n\nWe detected unusual activity on your account. Your membership has been temporarily suspended.\n\nTo restore access, verify your account immediately:\n\nhttps://netflix-login.verify-now.ru/update\n\nFailure to verify within 24 hours will result in permanent closure.\n\n-Netflix Support',
      hoverUrl: 'https://netflix-login.verify-now.ru/update',
      isPhishing: true,
      redFlags: ['Display name "Netflix Security" does not match email domain (netflix-secure.com)', 'Reply-To header points to external Russian domain (phish-bank.ru)', 'Hover URL reveals lookalike domain (netflix-login.verify-now.ru instead of netflix.com)', 'Creates false urgency with "permanent closure" threat', 'Generic greeting "Dear Valued Customer" — no personalization'],
      hlFields: ['from','reply','subject','url']
    },
    {
      id: 2,
      sender: 'IT Support Desk <support@google.com>',
      replyTo: 'support@google.com',
      subject: 'Security Alert: New device signed in to your account',
      body: 'Hi there,\n\nA new sign-in was detected on your Google Account from Windows 10, Chrome browser, location: Moscow, Russia.\n\nIf this was you, you can ignore this message. If not, please review your security settings:\n\nhttps://myaccount.google.com/security-checkup\n\n- Google Account Team',
      hoverUrl: 'https://myaccount.google.com/security-checkup',
      isPhishing: false,
      redFlags: [],
      hlFields: []
    },
    {
      id: 3,
      sender: 'Microsoft Account Team <alert@microsoft-security-alerts.com>',
      replyTo: 'verify@microsoft-account-restore.tk',
      subject: 'Action Required: Verify your Microsoft account',
      body: 'Dear User,\n\nYour Microsoft account has been locked due to multiple failed login attempts.\n\nPlease verify your identity to restore access:\n\nhttp://microsoft-account-restore.tk/verify\n\nThis link expires in 12 hours.\n\n-Microsoft Account Team',
      hoverUrl: 'http://microsoft-account-restore.tk/verify',
      isPhishing: true,
      redFlags: ['Sender domain (microsoft-security-alerts.com) is not an official Microsoft domain', 'Reply-To uses suspicious .tk TLD (microsoft-account-restore.tk)', 'Hover URL reveals credential harvesting site (.tk domain)', 'Generic greeting "Dear User"', 'Uses HTTP, not HTTPS — no secure connection'],
      hlFields: ['from','reply','subject','url']
    },
    {
      id: 4,
      sender: 'HR Department <hr@company.internal>',
      replyTo: 'hr@company.internal',
      subject: 'Updated Employee Benefits Package',
      body: 'Hello Team,\n\nWe are pleased to announce the updated employee benefits package for Q3.\n\nPlease review the attached document for details on the new health insurance options and wellness benefits.\n\nBest,\nHR Department',
      hoverUrl: '',
      isPhishing: false,
      redFlags: [],
      hlFields: []
    },
    {
      id: 5,
      sender: 'PayPal Services <service@paypa1.com>',
      replyTo: 'dispute@paypa1-security.net',
      subject: 'Urgent: Unauthorized transaction detected',
      body: 'Dear PayPal Member,\n\nWe have detected an unauthorized transaction of $849.99 from your account.\n\nIf you did not authorize this payment, please dispute immediately:\n\nhttp://paypa1.com-dispute.center/secure/login\n\nYour account will be debited if no action is taken within 48 hours.\n\n-PayPal Security Center',
      hoverUrl: 'http://paypa1.com-dispute.center/secure/login',
      isPhishing: true,
      redFlags: ['Spoofed display domain — "paypa1.com" uses number "1" instead of letter "l"', 'Reply-To goes to a different domain (paypa1-security.net)', 'Hover URL reveals complex lookalike domain (paypa1.com-dispute.center)', 'Creates urgency with "48 hours" deadline', 'Generic greeting "Dear PayPal Member"'],
      hlFields: ['from','reply','subject','url']
    },
    {
      id: 6,
      sender: 'GitHub Security <security@github.com>',
      replyTo: 'security@github.com',
      subject: 'New SSH key added to your account',
      body: 'Hi,\n\nA new SSH key was added to your GitHub account "my-dev-key" on 2026-06-08.\n\nIf you added this key, no further action is needed. If you did not, remove it immediately and review your security log:\n\nhttps://github.com/settings/security\n\n- The GitHub Team',
      hoverUrl: 'https://github.com/settings/security',
      isPhishing: false,
      redFlags: [],
      hlFields: []
    },
    {
      id: 7,
      sender: 'DHL Express <dhl.express@shipment-update.dhl-delivery.net>',
      replyTo: 'tracking@dhl-delivery.net',
      subject: 'Package delivery failed — customs fee required',
      body: 'Dear Customer,\n\nYour international shipment (#DHL987654321) is held at customs pending a clearance fee of $2.50.\n\nTo release your package, please complete payment:\n\nhttp://dhl-delivery.net/customs/pay\n\nPackage will be returned to sender within 72 hours if unpaid.\n\n-DHL Express Team',
      hoverUrl: 'http://dhl-delivery.net/customs/pay',
      isPhishing: true,
      redFlags: ['Sender domain (shipment-update.dhl-delivery.net) is not an official DHL domain', 'Reply-To points to unrelated domain (dhl-delivery.net)', 'Hover URL is a lookalike phishing page', 'Small fee ($2.50) is a common social engineering tactic', 'Creates urgency with "72 hours" deadline'],
      hlFields: ['from','reply','subject','url']
    },
    {
      id: 8,
      sender: 'Dropbox <no-reply@dropbox.com>',
      replyTo: 'no-reply@dropbox.com',
      subject: 'Shared folder invitation: Q4 Budget',
      body: 'Hello,\n\nSarah Chen has invited you to view the shared folder "Q4 Budget Planning" on Dropbox.\n\nOpen folder:\nhttps://www.dropbox.com/shared/invitation/abc123def456\n\nThis invitation expires in 7 days.\n\n- Dropbox Team',
      hoverUrl: 'https://www.dropbox.com/shared/invitation/abc123def456',
      isPhishing: false,
      redFlags: [],
      hlFields: []
    },
    {
      id: 9,
      sender: 'Apple ID Support <appleid@apple.com-security-alerts.xyz>',
      replyTo: 'verify@appleid-restore.xyz',
      subject: 'Your Apple ID has been locked for security',
      body: 'Dear Apple User,\n\nYour Apple ID was locked on June 8, 2026 due to a security breach.\n\nTo unlock your account, verify your identity here:\n\nhttp://apple.com-security-alerts.xyz/unlock\n\nFailure to verify will result in permanent account deactivation.\n\n- Apple Support',
      hoverUrl: 'http://apple.com-security-alerts.xyz/unlock',
      isPhishing: true,
      redFlags: ['Deceptive subdomain trick — "apple.com-security-alerts.xyz" is NOT apple.com', 'Reply-To uses suspicious .xyz TLD', 'Hover URL reveals harvesting site (.xyz domain)', 'Threatens "permanent account deactivation" to create panic', 'Generic greeting "Dear Apple User"'],
      hlFields: ['from','reply','subject','url']
    },
    {
      id: 10,
      sender: 'Stack Overflow Team <noreply@stackoverflow.email>',
      replyTo: 'noreply@stackoverflow.email',
      subject: 'Your question received 15 upvotes!',
      body: 'Congratulations!\n\nYour answer to "How to optimize React rendering performance" received 15 upvotes this week.\n\nYou earned the "Nice Answer" badge. View your achievement:\n\nhttps://stackoverflow.com/help/badges\n\nKeep contributing!\n-Stack Overflow',
      hoverUrl: 'https://stackoverflow.com/help/badges',
      isPhishing: false,
      redFlags: [],
      hlFields: []
    },
    {
      id: 11,
      sender: 'LinkedIn Network <invitations@linkedin-mail.com>',
      replyTo: 'confirm@linkedin-verify.net',
      subject: 'You have 8 new connection requests',
      body: 'Hi,\n\nYou have 8 pending connection requests from professionals in your network.\n\nSee who wants to connect:\n\nhttp://linkedin-verify.net/login?redirect=requests\n\nDon\'t miss out on valuable networking opportunities.\n\n- LinkedIn Team',
      hoverUrl: 'http://linkedin-verify.net/login?redirect=requests',
      isPhishing: true,
      redFlags: ['Sender domain (linkedin-mail.com) is not official linkedin.com', 'Reply-To goes to phishing domain (linkedin-verify.net)', 'Hover URL exposes credential harvesting site', 'Social engineering using networking opportunity as bait', 'Misleading "8 new connection requests" to trigger curiosity'],
      hlFields: ['from','reply','subject','url']
    },
  ];

  /* ---- State ---- */
  var score = 0;
  var correct = 0;
  var incorrect = 0;
  var streak = 0;
  var best = 0;
  var idx = 0;
  var locked = false;
  var scenarios = [];

  /* ---- Elements ---- */
  var telScore = document.getElementById('telScore');
  var telRating = document.getElementById('telRating');
  var telStreak = document.getElementById('telStreak');
  var telBest = document.getElementById('telBest');
  var qIdx = document.getElementById('qIdx');
  var qTotal = document.getElementById('qTotal');
  var emailCard = document.getElementById('emailCard');
  var efrom = document.getElementById('efrom');
  var ereply = document.getElementById('ereply');
  var esubject = document.getElementById('esubject');
  var ebody = document.getElementById('ebody');
  var ehoverText = document.getElementById('ehoverText');
  var ehoverDisplay = document.getElementById('ehoverDisplay');
  var feedbackArea = document.getElementById('feedbackArea');
  var feedbackBanner = document.getElementById('feedbackBanner');
  var redflagDrawer = document.getElementById('redflagDrawer');
  var redflagFields = document.getElementById('redflagFields');
  var redflagList = document.getElementById('redflagList');
  var nextBtn = document.getElementById('nextBtn');
  var btnLegit = document.getElementById('btnLegit');
  var btnPhish = document.getElementById('btnPhish');
  var summaryModal = document.getElementById('summaryModal');
  var summaryOverlay = document.getElementById('summaryOverlay');
  var sumScore = document.getElementById('sumScore');
  var sumRating = document.getElementById('sumRating');
  var sumCorrect = document.getElementById('sumCorrect');
  var sumIncorrect = document.getElementById('sumIncorrect');
  var sumAccuracy = document.getElementById('sumAccuracy');
  var sumBest = document.getElementById('sumBest');
  var restartBtn = document.getElementById('restartBtn');
  var app = document.getElementById('app');

  /* ---- Storage ---- */
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d.best) best = d.best;
      }
    } catch (e) {}
  }

  function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ best: best })); } catch (e) {}
  }

  /* ---- Helpers ---- */
  function esc(str) { var d = document.createElement('div'); d.appendChild(document.createTextNode(str)); return d.innerHTML; }

  function getRating() {
    var total = correct + incorrect;
    if (total === 0) return 'Unrated';
    var pct = correct / total;
    if (pct >= 0.9) return 'Elite Guardian';
    if (pct >= 0.7) return 'Security Analyst';
    if (pct >= 0.5) return 'Security Trainee';
    return 'At Risk';
  }

  function updateTele() {
    telScore.textContent = score;
    telRating.textContent = getRating();
    telStreak.textContent = streak;
    telBest.textContent = best;
    qIdx.textContent = idx + 1;
    qTotal.textContent = scenarios.length;
  }

  /* ---- Render Email ---- */
  function renderScenario() {
    locked = false;
    btnLegit.disabled = false;
    btnPhish.disabled = false;
    feedbackArea.classList.add('hidden');
    nextBtn.classList.add('hidden');
    redflagDrawer.classList.add('hidden');
    emailCard.className = '';
    emailCard.classList.remove('correct','incorrect','field-hl-from','field-hl-reply','field-hl-subject','field-hl-url');

    var s = scenarios[idx];
    efrom.textContent = s.sender;
    ereply.textContent = s.replyTo;
    esubject.textContent = s.subject;
    ebody.textContent = s.body;
    ehoverText.textContent = s.hoverUrl ? s.hoverUrl : '(no link in this email)';
    ehoverDisplay.className = '';
    if (!s.hoverUrl) ehoverDisplay.classList.add('active');
    updateTele();
  }

  /* ---- Hover link preview ---- */
  document.addEventListener('mouseover', function (e) {
    var t = e.target;
    if (t.id === 'ebody' || t.id === 'ebody' || ebody.contains(t)) {
      var s = scenarios[idx];
      if (s.hoverUrl) {
        ehoverText.textContent = s.hoverUrl;
        ehoverDisplay.className = 'active';
      }
    }
  });

  document.addEventListener('mouseout', function (e) {
    var t = e.target;
    if (t.id === 'ebody' || ebody.contains(t)) {
      var s = scenarios[idx];
      if (s.hoverUrl) {
        ehoverText.textContent = s.hoverUrl;
        ehoverDisplay.className = '';
      }
    }
  });

  /* ---- Evaluation ---- */
  function evaluate(choice) {
    if (locked) return;
    locked = true;
    btnLegit.disabled = true;
    btnPhish.disabled = true;

    var s = scenarios[idx];
    var isCorrect = (choice === 'legit' && !s.isPhishing) || (choice === 'phish' && s.isPhishing);

    feedbackArea.classList.remove('hidden');

    if (isCorrect) {
      var pts = 10 + (streak * 2);
      if (pts > 30) pts = 30;
      score += pts;
      correct++;
      streak++;
      if (streak > best) best = streak;
      emailCard.classList.add('correct');
      feedbackBanner.className = 'correct';
      feedbackBanner.innerHTML = '&#9989; Correct! +' + pts + ' pts &mdash; ' + (s.isPhishing ? 'Phishing threat correctly identified.' : 'Legitimate email correctly identified.');
      redflagDrawer.classList.add('hidden');
      nextBtn.classList.remove('hidden');
    } else {
      incorrect++;
      streak = 0;
      emailCard.classList.add('incorrect');
      app.classList.remove('shake');
      void app.offsetWidth;
      app.classList.add('shake');

      feedbackBanner.className = 'incorrect';
      feedbackBanner.innerHTML = '&#10060; Incorrect! ' + (s.isPhishing ? 'This WAS a phishing email.' : 'This WAS a legitimate email.');

      redflagDrawer.classList.remove('hidden');
      renderRedFlags(s);
      nextBtn.classList.remove('hidden');
    }

    saveData();
    updateTele();
  }

  function renderRedFlags(s) {
    /* highlight fields */
    var hlMap = { from:'ehFrom', reply:'ehReply', subject:'ehSubject', url:'ehoverDisplay' };
    redflagFields.innerHTML = '';
    s.hlFields.forEach(function (key) {
      var el = document.getElementById(hlMap[key]);
      if (el) el.classList.add('eh-highlight');
      var label = { from:'From header domain mismatch', reply:'Reply-To to untrusted domain', subject:'Urgent/Suspicious subject line', url:'Deceptive hover URL' }[key];
      if (label) {
        var div = document.createElement('div');
        div.className = 'rf-item';
        div.textContent = '&#9656; ' + label;
        redflagFields.appendChild(div);
      }
    });

    redflagList.innerHTML = '';
    s.redFlags.forEach(function (flag) {
      var div = document.createElement('div');
      div.className = 'rf-item';
      div.textContent = '\u2022 ' + flag;
      redflagList.appendChild(div);
    });
  }

  /* ---- Next / Reset ---- */
  function nextScenario() {
    /* clear highlights */
    document.querySelectorAll('.eh-highlight').forEach(function (el) { el.classList.remove('eh-highlight'); });
    idx++;
    if (idx >= scenarios.length) {
      showSummary();
      return;
    }
    renderScenario();
  }

  function showSummary() {
    var total = correct + incorrect;
    var pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    sumScore.textContent = score;
    sumRating.textContent = getRating();
    sumCorrect.textContent = correct;
    sumIncorrect.textContent = incorrect;
    sumAccuracy.textContent = pct + '%';
    sumBest.textContent = best;
    summaryModal.classList.remove('hidden');
  }

  function restart() {
    summaryModal.classList.add('hidden');
    score = 0;
    correct = 0;
    incorrect = 0;
    streak = 0;
    idx = 0;
    scenarios = SCENARIOS.slice().sort(function () { return Math.random() - 0.5; });
    renderScenario();
    updateTele();
    feedbackArea.classList.add('hidden');
  }

  /* ---- Event binding ---- */
  btnLegit.addEventListener('click', function () { evaluate('legit'); });
  btnPhish.addEventListener('click', function () { evaluate('phish'); });
  nextBtn.addEventListener('click', nextScenario);
  restartBtn.addEventListener('click', restart);
  summaryOverlay.addEventListener('click', restart);

  /* ---- Boot ---- */
  loadData();
  scenarios = SCENARIOS.slice().sort(function () { return Math.random() - 0.5; });
  renderScenario();
  updateTele();
})();
