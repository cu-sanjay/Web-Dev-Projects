document.addEventListener('DOMContentLoaded', () => {
    const birthDateInput = document.getElementById('birth-date');
    const calculateBtn = document.getElementById('calculate-btn');
    const errorMsg = document.getElementById('error-message');
    const resultsPanel = document.getElementById('results-panel');

    // Display elements
    const resYears = document.getElementById('res-years');
    const resMonths = document.getElementById('res-months');
    const resDays = document.getElementById('res-days');
    
    const nextMonths = document.getElementById('next-months');
    const nextDays = document.getElementById('next-days');

    const statMonths = document.getElementById('stat-months');
    const statWeeks = document.getElementById('stat-weeks');
    const statDays = document.getElementById('stat-days');
    const statHours = document.getElementById('stat-hours');

    // Restrict date choices to past boundaries only
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    birthDateInput.max = formattedToday;

    function calculateAge() {
        const birthDateString = birthDateInput.value;
        if (!birthDateString) {
            errorMsg.hidden = false;
            resultsPanel.hidden = true;
            return;
        }

        const birthDate = new Date(birthDateString);
        if (birthDate > today) {
            errorMsg.hidden = false;
            resultsPanel.hidden = true;
            return;
        }

        errorMsg.hidden = true;
        resultsPanel.hidden = false;

        // 1. Core Primary Breakdown Calculation (Years, Months, Days)
        let yearsDiff = today.getFullYear() - birthDate.getFullYear();
        let monthsDiff = today.getMonth() - birthDate.getMonth();
        let daysDiff = today.getDate() - birthDate.getDate();

        if (daysDiff < 0) {
            monthsDiff--;
            // Fetch length of previous month
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            daysDiff += prevMonth.getDate();
        }

        if (monthsDiff < 0) {
            yearsDiff--;
            monthsDiff += 12;
        }

        resYears.textContent = yearsDiff < 10 ? `0${yearsDiff}` : yearsDiff;
        resMonths.textContent = monthsDiff < 10 ? `0${monthsDiff}` : monthsDiff;
        resDays.textContent = daysDiff < 10 ? `0${daysDiff}` : daysDiff;

        // 2. Next Birthday Remaining Countdown Calculation
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        let remMonths = nextBirthday.getMonth() - today.getMonth();
        let remDays = nextBirthday.getDate() - today.getDate();

        if (remDays < 0) {
            remMonths--;
            const currentMonthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            remDays += currentMonthDays;
        }
        if (remMonths < 0) {
            remMonths += 12;
        }

        nextMonths.textContent = remMonths;
        nextDays.textContent = remDays;

        // 3. Lifetime Secondary Aggregations
        const totalTimeDiff = today.getTime() - birthDate.getTime();
        const totalDaysLived = Math.floor(totalTimeDiff / (1000 * 60 * 60 * 24));
        const totalWeeksLived = Math.floor(totalDaysLived / 7);
        const totalMonthsLived = (yearsDiff * 12) + monthsDiff;
        const totalHoursLived = totalDaysLived * 24;

        statMonths.textContent = totalMonthsLived.toLocaleString();
        statWeeks.textContent = totalWeeksLived.toLocaleString();
        statDays.textContent = totalDaysLived.toLocaleString();
        statHours.textContent = totalHoursLived.toLocaleString();
    }

    calculateBtn.addEventListener('click', calculateAge);
    
    // Allow pressing 'Enter' key inside input target to calculate age
    birthDateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateAge();
    });
});