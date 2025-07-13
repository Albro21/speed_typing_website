document.addEventListener('DOMContentLoaded', () => {
    const metricButtons = document.querySelectorAll('.list-group:nth-child(1) .list-group-item');
    const timeframeButtons = document.querySelectorAll('.list-group:nth-child(2) .list-group-item');
    const leaderboardTitle = document.getElementById('leaderboard-title');
    const leaderboardContainer = document.getElementById('leaderboard');

    const urlParams = new URLSearchParams(window.location.search);
    let metric = normalizeMetric(urlParams.get('metric') || 'wpm');
    let timeframe = urlParams.get('timeframe') || 'daily';

    function normalizeMetric(label) {
        const key = (label || '').toLowerCase().replace(/\s+/g, '');
        switch (key) {
            case 'wpm':
                return 'wpm';
            case 'completedtests':
            case 'completed':
                return 'completed';
            case 'typingtime':
            case 'time':
                return 'time';
            default:
                return 'wpm';
        }
    }

    function setActiveButton(buttons, activeValue, normalizeFn = s => s) {
        buttons.forEach(btn => {
            const btnKey = normalizeFn(btn.textContent);
            btn.classList.toggle('active', btnKey === activeValue);
        });
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    }

    function renderLeaderboard(data, metric, timeframe) {
        const titleMap = {
            wpm: 'Average WPM',
            completed: 'Completed Tests',
            time: 'Total Typing Time'
        };
        const title = titleMap[metric] || metric;
        leaderboardTitle.textContent = `Leaderboard - ${title} (${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})`;

        if (!Array.isArray(data) || data.length === 0) {
            leaderboardContainer.innerHTML = `<p>No data available for ${title} (${timeframe}).</p>`;
            return;
        }

        let html = '';
        if (metric === 'wpm') {
            html += `
                <div class="row py-2 mx-0 fw-bold" id="table-title">
                    <div class="col-1">#</div>
                    <div class="col">User</div>
                    <div class="col text-center">WPM</div>
                    <div class="col text-center">Accuracy</div>
                    <div class="col text-end">Date</div>
                </div>
            `;
            data.forEach((entry, index) => {
                const user = entry.nickname || entry.user__nickname || 'Unknown';
                const wpm = entry.value ? entry.value.toFixed(2) : '0';
                const accuracy = entry.accuracy !== undefined ? `${Math.round(entry.accuracy)}%` : '–';
                const date = entry.created_at ? formatDate(entry.created_at) : '–';
                const bg = index % 2 === 0 ? 'secondary-bg' : '';

                html += `
                    <div class="row py-2 mx-0 ${bg}">
                        <div class="col-1">${index + 1}</div>
                        <div class="col">${user}</div>
                        <div class="col text-center">${wpm}</div>
                        <div class="col text-center">${accuracy}</div>
                        <div class="col text-end">${date}</div>
                    </div>
                `;
            });
        } else if (metric === 'completed') {
            html += `
                <div class="row py-2 mx-0 fw-bold" id="table-title">
                    <div class="col-1">#</div>
                    <div class="col">User</div>
                    <div class="col text-center">Completed Tests</div>
                </div>
            `;
            data.forEach((entry, index) => {
                const user = entry.nickname || entry.user__nickname || 'Unknown';
                const count = entry.value ?? 0;
                const bg = index % 2 === 0 ? 'secondary-bg' : '';
                html += `
                    <div class="row py-2 mx-0 ${bg}">
                        <div class="col-1">${index + 1}</div>
                        <div class="col">${user}</div>
                        <div class="col text-center">${count}</div>
                    </div>
                `;
            });
        } else if (metric === 'time') {
            html += `
                <div class="row py-2 mx-0 fw-bold" id="table-title">
                    <div class="col-1">#</div>
                    <div class="col">User</div>
                    <div class="col text-center">Typing Time</div>
                </div>
            `;
            data.forEach((entry, index) => {
                const user = entry.nickname || entry.user__nickname || 'Unknown';
                const timeInSeconds = entry.value ?? 0;
                const timeFormatted = formatDuration(timeInSeconds);
                const bg = index % 2 === 0 ? 'secondary-bg' : '';
                html += `
                    <div class="row py-2 mx-0 ${bg}">
                        <div class="col-1">${index + 1}</div>
                        <div class="col">${user}</div>
                        <div class="col text-center">${timeFormatted}</div>
                    </div>
                `;
            });
        }

        leaderboardContainer.innerHTML = html;
    }

    async function fetchLeaderboard(metric, timeframe) {
        const url = `/get-leaderboard/?metric=${encodeURIComponent(metric)}&timeframe=${encodeURIComponent(timeframe)}`;
        const data = await sendRequest(url, 'GET');

        if (!data || data.length === 0) {
            leaderboardTitle.textContent = 'Leaderboard - No data';
            leaderboardContainer.innerHTML = `<p class="text-danger">No leaderboard data available.</p>`;
            return;
        }

        renderLeaderboard(data, metric, timeframe);
    }

    function updateUrlParams(metric, timeframe) {
        const params = new URLSearchParams(window.location.search);
        params.set('metric', metric);
        params.set('timeframe', timeframe);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    metricButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            metric = normalizeMetric(btn.textContent);
            setActiveButton(metricButtons, metric, normalizeMetric);
            updateUrlParams(metric, timeframe);
            fetchLeaderboard(metric, timeframe);
        });
    });

    timeframeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            timeframe = normalizeTimeframe(btn.textContent);
            setActiveButton(timeframeButtons, timeframe, normalizeTimeframe);
            updateUrlParams(metric, timeframe);
            fetchLeaderboard(metric, timeframe);
        });
    });

    // Set initial state
    setActiveButton(metricButtons, metric, normalizeMetric);
    setActiveButton(timeframeButtons, timeframe, normalizeTimeframe);
    fetchLeaderboard(metric, timeframe);
});

function normalizeTimeframe(label) {
    return (label || '').toLowerCase().replace(/\s+/g, '');
}

