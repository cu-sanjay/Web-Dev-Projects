(function () {
  var characters = [
    { id:1, name:'SpongeBob SquarePants', universe:'90s Nostalgia', role:'Fry Cook at the Krusty Krab', bio:'A cheerful, optimistic sea sponge who lives in a pineapple under the sea. He works at the Krusty Krab and loves jellyfishing with his best friend Patrick.', catchphrase:'I\'m ready!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=SpongeBob&backgroundColor=ffdfbf' },
    { id:2, name:'Naruto Uzumaki', universe:'Modern Anime', role:'Hokage of Hidden Leaf Village', bio:'A ninja from the Hidden Leaf Village who rose from being an outcast to becoming the village leader. He never gives up on his friends or his dream.', catchphrase:'Believe it!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Naruto&backgroundColor=f88c49' },
    { id:3, name:'Rick Sanchez', universe:'Sci-Fi Cartoons', role:'Mad Scientist / Inventor', bio:'A genius alcoholic scientist who travels across dimensions with his grandson Morty. He is known for his catchphrase, burping, and extremely dangerous inventions.', catchphrase:'Wubba lubba dub dub!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Rick&backgroundColor=00e5c8' },
    { id:4, name:'Bugs Bunny', universe:'90s Nostalgia', role:'Trickster Rabbit', bio:'A clever and laid-back rabbit living in a burrow. He is always outsmarting his enemies like Elmer Fudd and Yosemite Sam with witty one-liners.', catchphrase:'Eh, what\'s up, doc?', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=BugsBunny&backgroundColor=b6e3f4' },
    { id:5, name:'Eren Yeager', universe:'Modern Anime', role:'Titan Shifter / Scout Regiment', bio:'A determined young man who joins the Scout Regiment to fight Titans. His quest for freedom leads him down a dark path that changes the world forever.', catchphrase:'Tatakae! (Fight!)', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Eren&backgroundColor=59656d' },
    { id:6, name:'Finn the Human', universe:'Modern Anime', role:'Hero of Ooo', bio:'The last known human in the Land of Ooo, Finn adventures with his brother Jake the Dog. He fights evil using his swords and heroic spirit.', catchphrase:'Algebraic!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Finn&backgroundColor=d1d4f9' },
    { id:7, name:'Tom & Jerry', universe:'90s Nostalgia', role:'Cat and Mouse Duo', bio:'An iconic cat-and-mouse pair known for their endless chase. Despite constant conflict, they have shown they care for each other in moments of danger.', catchphrase:'(meowing and squeaking)', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=TomJerry&backgroundColor=c0aede' },
    { id:8, name:'Leela', universe:'Sci-Fi Cartoons', role:'Captain of Planet Express Ship', bio:'A one-eyed mutant spaceship captain working for Planet Express. She is tough, competent, and often the voice of reason among the delivery crew.', catchphrase:'Good news, everyone! (actually Fry says that)', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Leela&backgroundColor=ffdfbf' },
    { id:9, name:'Goku', universe:'Modern Anime', role:'Saiyan Warrior / Earth\'s Protector', bio:'A Saiyan raised on Earth who constantly pushes his limits to become stronger. He defends Earth from increasingly powerful threats with his friends.', catchphrase:'It\'s over 9000!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Goku&backgroundColor=f88c49' },
    { id:10, name:'Scooby-Doo', universe:'90s Nostalgia', role:'Mystery-Solving Great Dane', bio:'A cowardly but lovable Great Dane who solves supernatural mysteries with Shaggy and the Mystery Inc. gang. He is motivated primarily by Scooby Snacks.', catchphrase:'Scooby-Dooby-Doo!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Scooby&backgroundColor=b6e3f4' },
    { id:11, name:'Morty Smith', universe:'Sci-Fi Cartoons', role:'Sidekick / Student', bio:'A nervous 14-year-old boy who gets dragged into interdimensional adventures by his grandfather Rick. He is often terrified but has moments of surprising courage.', catchphrase:'Aw, jeez, Rick!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Morty&backgroundColor=ffdfbf' },
    { id:12, name:'Dexter', universe:'90s Nostalgia', role:'Boy Genius / Inventor', bio:'A boy genius with a secret laboratory hidden behind a bookcase. He constantly battles his annoying sister Dee Dee while working on complex inventions.', catchphrase:'Dexter\'s Laboratory!', image:'https://api.dicebear.com/7x/fun-emoji/svg?seed=Dexter&backgroundColor=d1d4f9' },
  ];

  var gallery = document.getElementById('gallery');
  var searchInput = document.getElementById('searchInput');
  var tally = document.getElementById('tally');
  var chips = document.querySelectorAll('.chip');
  var drawer = document.getElementById('drawer');
  var drawerBackdrop = document.getElementById('drawerBackdrop');
  var drawerPanel = document.getElementById('drawerPanel');
  var drawerContent = document.getElementById('drawerContent');
  var drawerClose = document.getElementById('drawerClose');

  var activeUniverse = 'all';
  var searchQuery = '';

  /* ---- render ---- */
  function render() {
    var filtered = characters.filter(function (c) {
      if (activeUniverse !== 'all' && c.universe !== activeUniverse) return false;
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        if (c.name.toLowerCase().indexOf(q) === -1 && c.bio.toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    });

    gallery.innerHTML = '';
    tally.textContent = filtered.length + ' character' + (filtered.length !== 1 ? 's' : '');

    if (filtered.length === 0) {
      var nf = document.createElement('div');
      nf.className = 'not-found';
      nf.innerHTML = '<span>No Characters Found</span><p>matching your search criteria</p>';
      gallery.appendChild(nf);
      return;
    }

    filtered.forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<div class="card-avatar"><img src="' + c.image + '" alt="' + esc(c.name) + '" loading="lazy"></div>' +
        '<div class="card-name">' + esc(c.name) + '</div>' +
        '<div class="card-universe">' + esc(c.universe) + '</div>' +
        '<div class="card-role">' + esc(c.role) + '</div>' +
        '<div class="card-catch">"' + esc(c.catchphrase) + '"</div>';
      card.addEventListener('click', function () { openDrawer(c); });
      gallery.appendChild(card);
    });
  }

  /* ---- drawer ---- */
  function openDrawer(c) {
    drawerContent.innerHTML =
      '<div class="dr-avatar"><img src="' + c.image + '" alt="' + esc(c.name) + '"></div>' +
      '<div class="dr-name">' + esc(c.name) + '</div>' +
      '<div class="dr-meta"><span>' + esc(c.universe) + '</span><span>&middot;</span><span>' + esc(c.role) + '</span></div>' +
      '<div class="dr-catchphrase">"' + c.catchphrase + '"</div>' +
      '<div class="dr-role">' + esc(c.role) + '</div>' +
      '<div class="dr-bio">' + esc(c.bio) + '</div>';
    drawer.classList.remove('drawer--closed');
    drawer.classList.add('drawer--open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('drawer--open');
    drawer.classList.add('drawer--closed');
    document.body.style.overflow = '';
  }

  drawerClose.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* ---- filters ---- */
  searchInput.addEventListener('input', function () {
    searchQuery = this.value;
    render();
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      activeUniverse = this.dataset.universe;
      render();
    });
  });

  /* ---- util ---- */
  function esc(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

  /* ---- boot ---- */
  render();
})();
