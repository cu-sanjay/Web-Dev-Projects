document.addEventListener('DOMContentLoaded', () => {
    const billInput = document.getElementById('bill-amount');
    const tipBtns = document.querySelectorAll('.tip-btn');
    const customTipInput = document.getElementById('custom-tip');
    const numPeopleInput = document.getElementById('num-people');
    const splitModeToggle = document.getElementById('split-mode-toggle');
    const unequalSection = document.getElementById('unequal-inputs');
    const peopleInputsContainer = document.getElementById('people-inputs-container');
    const validationMsg = document.getElementById('validation-msg');
    
    const totalTipDisplay = document.getElementById('total-tip');
    const totalWithTipDisplay = document.getElementById('total-with-tip');
    const equalSplitResult = document.getElementById('equal-split-result');
    const amountPerPersonDisplay = document.getElementById('amount-per-person');
    const resetBtn = document.getElementById('reset-btn');

    let tipPercentage = parseFloat(localStorage.getItem('preferredTip')) || 0;
    let currentTotals = { tip: 0, bill: 0, perPerson: 0 };

    // --- Logic Functions ---

    function animateValue(element, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;
            element.textContent = `$${value.toFixed(2)}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function calculate() {
        const bill = parseFloat(billInput.value) || 0;
        const numPeople = parseInt(numPeopleInput.value) || 1;
        
        const tipAmount = bill * (tipPercentage / 100);
        const totalAmount = bill + tipAmount;
        const perPerson = totalAmount / numPeople;

        // Animate changes
        animateValue(totalTipDisplay, currentTotals.tip, tipAmount, 300);
        animateValue(totalWithTipDisplay, currentTotals.bill, totalAmount, 300);
        
        currentTotals = { tip: tipAmount, bill: totalAmount, perPerson: perPerson };

        if (!splitModeToggle.checked) {
            animateValue(amountPerPersonDisplay, currentTotals.perPerson, perPerson, 300);
            equalSplitResult.classList.remove('hidden');
            validationMsg.textContent = '';
        } else {
            equalSplitResult.classList.add('hidden');
            validateUnequalSplit(totalAmount);
        }

        resetBtn.disabled = bill === 0 && tipPercentage === 0 && numPeople === 1 && !splitModeToggle.checked;
    }

    function renderPersonInputs() {
        const numPeople = parseInt(numPeopleInput.value) || 1;
        peopleInputsContainer.innerHTML = '';
        
        for (let i = 1; i <= numPeople; i++) {
            const div = document.createElement('div');
            div.className = 'person-input-row';
            div.innerHTML = `
                <input type="text" class="person-name" placeholder="Person ${i}" data-index="${i}">
                <input type="number" class="manual-share" placeholder="0.00" min="0" step="0.01">
            `;
            peopleInputsContainer.appendChild(div);
        }

        document.querySelectorAll('.manual-share').forEach(input => {
            input.addEventListener('input', () => calculate());
        });
    }

    function validateUnequalSplit(targetTotal) {
        const shares = document.querySelectorAll('.manual-share');
        let currentSum = 0;
        shares.forEach(input => {
            currentSum += parseFloat(input.value) || 0;
        });

        const diff = targetTotal - currentSum;
        
        if (Math.abs(diff) < 0.01) {
            validationMsg.textContent = '✅ All shares perfectly assigned!';
            validationMsg.className = 'validation-msg success';
        } else if (diff > 0) {
            validationMsg.textContent = `Pending: $${diff.toFixed(2)}`;
            validationMsg.className = 'validation-msg error';
        } else {
            validationMsg.textContent = `Over limit: $${Math.abs(diff).toFixed(2)}`;
            validationMsg.className = 'validation-msg error';
        }
    }

    // --- Event Listeners ---

    billInput.addEventListener('input', calculate);

    tipBtns.forEach(btn => {
        if (parseFloat(btn.dataset.tip) === tipPercentage) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            tipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            customTipInput.value = '';
            tipPercentage = parseFloat(btn.dataset.tip);
            localStorage.setItem('preferredTip', tipPercentage);
            calculate();
        });
    });

    customTipInput.addEventListener('input', () => {
        tipBtns.forEach(b => b.classList.remove('active'));
        tipPercentage = parseFloat(customTipInput.value) || 0;
        calculate();
    });

    numPeopleInput.addEventListener('input', () => {
        if (splitModeToggle.checked) {
            renderPersonInputs();
        }
        calculate();
    });

    splitModeToggle.addEventListener('change', () => {
        if (splitModeToggle.checked) {
            unequalSection.classList.remove('hidden');
            renderPersonInputs();
        } else {
            unequalSection.classList.add('hidden');
        }
        calculate();
    });

    resetBtn.addEventListener('click', () => {
        billInput.value = '';
        tipBtns.forEach(b => b.classList.remove('active'));
        customTipInput.value = '';
        numPeopleInput.value = '1';
        splitModeToggle.checked = false;
        unequalSection.classList.add('hidden');
        tipPercentage = 0;
        localStorage.removeItem('preferredTip');
        calculate();
    });

    // Initial calculation
    calculate();
});
