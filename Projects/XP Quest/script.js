 const SKILLS = [
            { id: 'logic', name: 'Logic', color: 'var(--logic)', icon: '🧩' },
            { id: 'verbal', name: 'Verbal', color: 'var(--verbal)', icon: '📖' },
            { id: 'memory', name: 'Memory', color: 'var(--memory)', icon: '🧠' },
            { id: 'knowledge', name: 'Knowledge', color: 'var(--knowledge)', icon: '🌍' },
            { id: 'productivity', name: 'Productivity', color: 'var(--productivity)', icon: '⚡' }
        ];

        // Initialize XP from LocalStorage or 0
        let xpState = JSON.parse(localStorage.getItem('global_xp_system')) || {
            logic: 0, verbal: 0, memory: 0, knowledge: 0, productivity: 0
        };

        function save() {
            localStorage.setItem('global_xp_system', JSON.stringify(xpState));
        }

        function getLevel(xp) {
            return Math.floor(Math.sqrt(xp / 100)) + 1;
        }

        function getXPProgress(xp) {
            const lv = getLevel(xp);
            const currentLvStart = Math.pow(lv - 1, 2) * 100;
            const nextLvStart = Math.pow(lv, 2) * 100;
            return ((xp - currentLvStart) / (nextLvStart - currentLvStart)) * 100;
        }

        function render() {
            const container = document.getElementById('skill-container');
            container.innerHTML = '';

            let totalXP = 0;
            SKILLS.forEach(skill => {
                const xp = xpState[skill.id];
                totalXP += xp;
                const lv = getLevel(xp);
                const progress = getXPProgress(xp);

                container.innerHTML += `
                    <div class="skill-card">
                        <div class="skill-header">
                            <span class="skill-name">${skill.icon} ${skill.name}</span>
                            <span class="skill-lv" style="color: ${skill.color}">LV ${lv}</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${progress}%; background: ${skill.color}; color: ${skill.color}"></div>
                        </div>
                        <div class="xp-val">${xp} Total XP</div>
                    </div>
                `;
            });

            // Update Global
            const globalLv = getLevel(totalXP / 2); // Global scales slower
            document.getElementById('global-lv').innerText = globalLv;
            document.getElementById('global-bar').style.width = getXPProgress(totalXP / 2) + "%";
            
            const ranks = ["Novice", "Apprentice", "Adept", "Expert", "Master", "Grandmaster", "Legend"];
            document.getElementById('rank-name').innerText = ranks[Math.min(globalLv - 1, ranks.length - 1)] + " Scholar";
        }

        function addXP(skillId, amount, reason) {
            xpState[skillId] += amount;
            save();
            render();
            
            const log = document.getElementById('activity-log');
            const div = document.createElement('div');
            div.className = 'log-item';
            div.innerHTML = `<span>${reason}</span><span style="color: var(--xp-color)">+${amount} XP</span>`;
            log.prepend(div);
            if(log.children.length > 5) log.lastChild.remove();
        }

        function simulateGain() {
            const reasons = [
                { s: 'logic', r: 'Solved Complex Puzzle', v: 150 },
                { s: 'verbal', r: 'Mastered New Word', v: 50 },
                { s: 'memory', r: 'Perfect Room Recall', v: 200 },
                { s: 'knowledge', r: 'Identified Fake Fact', v: 75 },
                { s: 'productivity', r: 'Completed Focus Session', v: 300 }
            ];
            const pick = reasons[Math.floor(Math.random() * reasons.length)];
            addXP(pick.s, pick.v, pick.r);
        }

        render();