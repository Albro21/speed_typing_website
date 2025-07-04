// Default settings for practice
const defaultState = {
    test_type: 'timed',
    duration: '60',
    text_type: 'story',
    length: 'medium',
    difficulty: 'medium',
    extras: []
};

// Load saved settings from localStorage or use default settings
let state = JSON.parse(localStorage.getItem('practiceSettings')) || { ...defaultState };

// Save current state to localStorage
function saveState() {
    localStorage.setItem('practiceSettings', JSON.stringify(state));
}

// Build URL based on current state
function buildStartUrl() {
    const baseUrl = '/test/';
    const params = { ...state };

    adjustParamsForUrl(params);

    const queryString = new URLSearchParams(params).toString();
    return baseUrl + (queryString ? '?' + queryString : '');
}

// Adjust parameters for URL generation
function adjustParamsForUrl(params) {
    if (params.test_type === 'timed') {
        delete params.word_count;
    } else {
        delete params.duration;
    }

    if (params.text_type === 'random') {
        delete params.length;
    }

    if (Array.isArray(params.extras)) {
        if (params.extras.length === 0) {
            delete params.extras;
        } else {
            params.extras = params.extras.join(',');
        }
    }
}

// Update UI based on current state
function updateUI() {
    toggleOptionsVisibility();
    updateButtonStates();
    updateStartButtonUrl();
}

// Toggle visibility of options based on state
function toggleOptionsVisibility() {
    const timeOptions = document.getElementById('time-options');
    const lengthOptions = document.getElementById('length-options');
    const wordCountOptions = document.getElementById('word-count-options');
    const extrasOptions = document.getElementById('extras');

    timeOptions.classList.replace(
        state.test_type === 'timed' ? 'd-none' : 'd-flex',
        state.test_type === 'timed' ? 'd-flex' : 'd-none'
    );

    if (state.test_type === 'timed') {
        wordCountOptions.classList.replace('d-flex', 'd-none');
        lengthOptions.classList.replace('d-flex', 'd-none');
        delete state.word_count;
        delete state.length;
    } else {
        if (state.text_type === 'random') {
            wordCountOptions.classList.replace('d-none', 'd-flex');
            lengthOptions.classList.replace('d-flex', 'd-none');
            delete state.length;
        } else {
            wordCountOptions.classList.replace('d-flex', 'd-none');
            lengthOptions.classList.replace('d-none', 'd-flex');
            delete state.word_count;
        }
    }

    extrasOptions.classList.replace(
        state.text_type === 'random' ? 'd-flex' : 'd-none',
        state.text_type === 'random' ? 'd-none' : 'd-flex'
    );
}

// Update button states based on current state
function updateButtonStates() {
    document.querySelectorAll('.option').forEach(btn => {
        const group = btn.dataset.group;
        btn.classList.toggle('active', state[group] === btn.dataset.value);
    });

    document.querySelectorAll('.extra-option').forEach(btn => {
        btn.classList.toggle('active', state.extras.includes(btn.dataset.value));
    });
}

// Update start button URL
function updateStartButtonUrl() {
    const startButton = document.getElementById('start-button');
    startButton.href = buildStartUrl();
}

// Adjust state based on group and value
function adjustStateForGroup(group, value) {
    if (group === 'test_type') {
        if (value === 'timed') {
            delete state.word_count;
            if (!state.duration) state.duration = '60';
            delete state.length;
        } else {
            delete state.duration;
            if (state.text_type === 'random' && !state.word_count) {
                state.word_count = '50';
            }
            if (state.text_type !== 'random' && !state.length) {
                state.length = 'medium';
            }
        }
    }

    if (group === 'text_type') {
        if (value === 'random') {
            if (!state.difficulty) state.difficulty = 'medium';
            delete state.length;
            if (!state.word_count) state.word_count = '50';
        } else {
            if (!state.difficulty) state.difficulty = 'medium';
            delete state.word_count;
            if (!state.length) state.length = 'medium';
        }
    }
}

// Handle option button clicks
function handleOptionClick(btn) {
    btn.addEventListener('click', e => {
        e.preventDefault();
        const group = btn.dataset.group;
        const value = btn.dataset.value;

        state[group] = value;
        adjustStateForGroup(group, value);

        saveState();
        updateUI();
    });
}

// Handle extra option button clicks
function handleExtraOptionClick(btn) {
    btn.addEventListener('click', e => {
        e.preventDefault();
        const val = btn.dataset.value;
        const index = state.extras.indexOf(val);
        if (index === -1) {
            state.extras.push(val);
        } else {
            state.extras.splice(index, 1);
        }
        saveState();
        updateUI();
    });
}

// Initialize UI and event listeners for options and extra options on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    document.querySelectorAll('.option').forEach(handleOptionClick);
    document.querySelectorAll('.extra-option').forEach(handleExtraOptionClick);
});
