// Get initial elements and settings
const storyText = document.getElementById('story').dataset.text;
const duration = window.initialSettings.duration;
const testType = window.initialSettings.test_type;

let wpm = 0;
let mistypedLetters = {};
let allLetterTimings = {};
let speedCurve = [];
let typedCorrectLettersTimeline = [];
let correctLettersCount = 0;
let incorrectLettersCount = 0;
let timerInterval = null;
let startTime = null;
let timerStarted = false;
let currentLetterIndex = 0;
let lastLineTop = null;
let currentLineIndex = 0;
let lastKeyTime = null;

// Initialize UI
function initializeUI() {
    const textDisplay = document.getElementById("textDisplay");
    textDisplay.innerHTML = splitStoryIntoSpans(storyText);

    const firstLetterSpan = textDisplay.querySelectorAll('.letter')[0];
    firstLetterSpan.classList.add('text-decoration-underline', 'text-primary');

    const input = document.getElementById("userInput");
    input.addEventListener('blur', () => input.focus());
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', disableCertainKeys);

    if (testType === 'timed') {
        updateTimeLeft(duration);
    } else {
        document.getElementById("timeLeft").textContent = '';
    }
}

// Split the story text into span elements
function splitStoryIntoSpans(text) {
    return text
        .split(" ")
        .map(word =>
            word.split("").map(letter =>
                `<span class="letter font-monospace rounded-3">${letter}</span>`
            ).join("") + '<span class="letter font-monospace rounded-3"> </span>'
        ).join('');
}

// Update the timer display
function updateTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    document.getElementById("timeLeft").textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Calculate and display WPM
function calculateWPM() {
    const now = Date.now();
    const windowMs = 5000;
    let windowStartIndex = 0;

    for (let i = typedCorrectLettersTimeline.length - 1; i >= 0; i--) {
        if (typedCorrectLettersTimeline[i].time <= now - windowMs) {
            windowStartIndex = i;
            break;
        }
    }

    const startEntry = typedCorrectLettersTimeline[windowStartIndex];
    const endEntry = typedCorrectLettersTimeline[typedCorrectLettersTimeline.length - 1];
    let wpmCalc = 0;

    if (startEntry && endEntry && startEntry !== endEntry) {
        const elapsedMinutes = (endEntry.time - startEntry.time) / 60000;
        const lettersTyped = endEntry.count - startEntry.count;
        wpmCalc = Math.floor((lettersTyped / 5) / elapsedMinutes);
    } else {
        const elapsedMinutes = (now - startTime) / 60000;
        if (elapsedMinutes > 0) {
            wpmCalc = Math.floor((correctLettersCount / 5) / elapsedMinutes);
        }
    }

    wpm = wpmCalc;
    document.getElementById("wpm").textContent = wpm;
    speedCurve.push(wpm);
}

// Start the timer for timed tests
function startTimer(duration) {
    updateTimeLeft(duration);
    timerInterval = setInterval(() => {
        duration--;
        calculateWPM();
        updateTimeLeft(duration);

        if (duration <= 0) {
            clearInterval(timerInterval);
            endTest();
        }
    }, 1000);
}

// Handle input events
function handleInput(event) {
    const typedLetter = event.target.value.slice(-1);
    const expectedLetter = storyText[currentLetterIndex];
    const currentLetterSpan = document.querySelectorAll('.letter')[currentLetterIndex];

    if (typedLetter === expectedLetter) {
        correctLetterTyped(currentLetterSpan, expectedLetter);
    } else {
        incorrectLetterTyped(currentLetterSpan, expectedLetter);
    }

    calculateAccuracy();

    if (event.inputType === 'deleteContentBackward') {
        handleBackspace(currentLetterSpan);
    } else if (event.inputType === 'insertText') {
        handleInsertText(currentLetterSpan);
    }

    scrollTextDisplay();
    if (currentLetterIndex >= storyText.length) {
        endTest();
    }
}

// Handle correct letter typed
function correctLetterTyped(currentLetterSpan, expectedLetter) {
    currentLetterSpan.classList.add('bg-success');
    correctLettersCount++;
    const now = Date.now();
    typedCorrectLettersTimeline.push({ time: now, count: correctLettersCount });

    if (!timerStarted) {
        if (testType === 'timed') {
            startTimer(duration);
        } else {
            startElapsedTimer();
        }
        timerStarted = true;
    }

    if (lastKeyTime !== null) {
        const delay = now - lastKeyTime;
        if (!allLetterTimings[expectedLetter]) {
            allLetterTimings[expectedLetter] = [];
        }
        allLetterTimings[expectedLetter].push(delay);
    }
    lastKeyTime = now;
}

// Handle incorrect letter typed
function incorrectLetterTyped(currentLetterSpan, expectedLetter) {
    mistypedLetters[expectedLetter] = (mistypedLetters[expectedLetter] || 0) + 1;
    incorrectLettersCount++;
    currentLetterSpan.classList.add('bg-danger');
}

// Handle backspace event
function handleBackspace(currentLetterSpan) {
    if (currentLetterIndex > 0) {
        currentLetterIndex--;
    }
    incorrectLettersCount = Math.max(incorrectLettersCount - 1, 0);
    const previousLetterSpan = document.querySelectorAll('.letter')[currentLetterIndex];
    previousLetterSpan.classList.remove('bg-success', 'bg-danger');
    previousLetterSpan.classList.add('text-decoration-underline', 'text-primary');
    currentLetterSpan.classList.remove('bg-success', 'bg-danger', 'text-decoration-underline', 'text-primary');
}

// Handle insert text event
function handleInsertText(currentLetterSpan) {
    currentLetterSpan.classList.remove('text-decoration-underline', 'text-primary');
    currentLetterIndex++;
    const nextLetterSpan = document.querySelectorAll('.letter')[currentLetterIndex];
    if (nextLetterSpan) {
        nextLetterSpan.classList.add('text-decoration-underline', 'text-primary');
    }
}

// Scroll text display to keep current line visible
function scrollTextDisplay() {
    const nextLetterRect = document.querySelectorAll('.letter')[currentLetterIndex]?.getBoundingClientRect();
    if (nextLetterRect && (lastLineTop === null || nextLetterRect.top > lastLineTop)) {
        lastLineTop = nextLetterRect.top;
        currentLineIndex++;
        document.getElementById("textDisplay").style.transform = `translateY(-${(currentLineIndex - 1) * 62.999}px)`;
    }
}

// Calculate and display accuracy
function calculateAccuracy() {
    const total = correctLettersCount + incorrectLettersCount;
    const accuracy = total === 0 ? 100 : (correctLettersCount / total) * 100;
    document.getElementById("accuracy").textContent = `${accuracy.toFixed(2)}%`;
}

// Start elapsed timer for non-timed tests
function startElapsedTimer() {
    let elapsed = 0;
    updateTimeLeft(elapsed);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        elapsed++;
        calculateWPM();
        updateTimeLeft(elapsed);
    }, 1000);
}

// Calculate average letter timings
function calculateAverageLetterTimings() {
    const averageLetterDelays = {};
    for (const letter in allLetterTimings) {
        const delays = allLetterTimings[letter];
        const sum = delays.reduce((a, b) => a + b, 0);
        const avg = sum / delays.length;
        averageLetterDelays[letter] = parseFloat(avg.toFixed(2));
    }
    return averageLetterDelays;
}

// End the test and send results
async function endTest() {
    if (timerInterval) clearInterval(timerInterval);

    const letterTimings = calculateAverageLetterTimings();
    const sortedMistypedLetters = Object.fromEntries(
        Object.entries(mistypedLetters).sort(([, a], [, b]) => b - a)
    );
    const sortedLetterTimings = Object.fromEntries(
        Object.entries(letterTimings).sort(([, a], [, b]) => b - a)
    );
    const accuracy = correctLettersCount + incorrectLettersCount === 0 ? 0 :
        parseFloat(((correctLettersCount / (correctLettersCount + incorrectLettersCount)) * 100).toFixed(2));
    const elapsedTime = (isNaN(parseInt(duration)) || parseInt(duration) === 0) ? Math.floor((Date.now() - startTime) / 1000) : parseInt(duration);

    const requestBody = JSON.stringify({
        article_id: window.initialSettings.articleId || 0,
        story_id: window.initialSettings.storyId || 0,
        test_type: testType,
        difficulty: window.initialSettings.difficulty || null,
        length: window.initialSettings.length || null,
        wpm: wpm,
        duration: elapsedTime,
        accuracy: accuracy,
        correct_count: correctLettersCount,
        mistake_count: incorrectLettersCount,
        mistyped_letters: sortedMistypedLetters,
        letter_timings: sortedLetterTimings,
        speed_curve: speedCurve,
    });

    const data = await sendRequest(`/results/create/`, 'POST', requestBody);
    window.location.href = `/results/${data.result_id}/`;
}

// Disable certain keys during typing test
function disableCertainKeys(event) {
    if ((event.ctrlKey || event.altKey) || ['Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        console.log(`${event.key} is disabled`);
    }
}

// Initialize UI when the script loads
initializeUI();