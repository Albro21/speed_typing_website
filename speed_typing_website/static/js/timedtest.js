const storyText = document.getElementById('story').dataset.text;
const storyId = document.getElementById('story').dataset.storyId;
const duration = document.getElementById('duration').dataset.duration * 60;
const testType = document.getElementById('duration').dataset.testType;

let wpm = 0;
let mistypedLetters = {};
let allLetterTimings = {};
let speedCurve = [];

let correctLettersCount = 0;
let incorrectLettersCount = 0;

// Split the text into letters
const letters = storyText
    .split(" ") // Split the text into words by spaces
    .map(word => // Process each word
    word.split("") // Split the word into individual letters
    .map(letter =>  // Process each letter
    `<span class="letter font-monospace rounded-3">${letter}</span>`) // Wrap each letter in a span element
    .join("") // Join the letters back together into a word
    + '<span class="letter font-monospace rounded-3">&#8203 </span>') // Add a span for space after each word
    .join(''); // Join the words back together

// Display the text
const textDisplay = document.getElementById("textDisplay");
textDisplay.innerHTML = letters;

// Letter spans constant
const letter_spans = textDisplay.querySelectorAll('.letter');

// Highlight the first letter
letter_spans[0].classList.add('text-decoration-underline', 'text-primary');

// Focus on the input when it loses focus
const input = document.getElementById("userInput");
input.addEventListener('blur', (event) => {
    input.focus();
});

let timerInterval = null; // To store the interval ID
const timeLeftElement = document.getElementById("timeLeft");

function calculateAverageLetterTimings() {
    const averageLetterDelays = {};

    for (const letter in allLetterTimings) {
        const delays = allLetterTimings[letter];
        const sum = delays.reduce((a, b) => a + b, 0);
        const avg = sum / delays.length;
        averageLetterDelays[letter] = parseFloat(avg.toFixed(2)); // Rounded to 2 decimal places
    }

    return averageLetterDelays;
}

async function endTest() {
    const letterTimings = calculateAverageLetterTimings();

    // Sort mistypedLetters by count descending
    const sortedMistypedLetters = Object.fromEntries(
        Object.entries(mistypedLetters)
            .sort(([, a], [, b]) => b - a)
    );

    // Sort letterTimings by average delay descending
    const sortedLetterTimings = Object.fromEntries(
        Object.entries(letterTimings)
            .sort(([, a], [, b]) => b - a)
    );

    url = `/result/create/`;
    method = 'POST';
    requestBody = JSON.stringify({
        'story_id': storyId,
        'test_type': testType,
        'wpm': wpm,	
        'duration': duration,
        'accuracy': parseFloat(((correctLettersCount / (correctLettersCount + incorrectLettersCount)) * 100).toFixed(2)),
        'correct_count': correctLettersCount,
        'mistake_count': incorrectLettersCount,
        'mistyped_letters': sortedMistypedLetters,
        'letter_timings': sortedLetterTimings,
        'speed_curve': speedCurve,
    });

    console.log(requestBody);
    const data = await sendRequest(url, method, requestBody);

    const resultId = data.result_id;
    window.location.href = `/result/${resultId}/`;
}

function updateTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timeLeftElement.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Calculate and display WPM
let startTime = null;
wpmElement  = document.getElementById("wpm");

function calculateWPM() {
    const elapsedTimeInMinutes = (Date.now() - startTime) / 60000;
    if (elapsedTimeInMinutes > 0) {
        wpm = Math.floor((correctLettersCount / 5) / elapsedTimeInMinutes);
    }
    wpmElement.textContent = wpm;
    speedCurve.push(wpm);
}

// Timer update function
function startTimer(duration) {
    updateTimeLeft(duration); // Initialize display
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

// Initialize the timer
updateTimeLeft(duration);

// Handle typing
let currentLetterIndex = 0;
let lastLineTop = null; 
let currentLineIndex = 0;
let timerStarted = false;

// Calculate and display accuracy
accuracyElement = document.getElementById("accuracy");
function calculateAccuracy() {
    const accuracy = (correctLettersCount / (correctLettersCount + incorrectLettersCount)) * 100;
    accuracyElement.textContent = `${accuracy.toFixed(2)}%`;
}

// Calculate letter timings
let lastKeyTime = null; 

input.addEventListener('input', (event) => {
    const typedLetter = input.value.slice(-1);
    const expectedLetter = storyText[currentLetterIndex];
    const currentLetterSpan = letter_spans[currentLetterIndex];

    // Handle character matching and calculate accuracy
    if (typedLetter === expectedLetter) {
        currentLetterSpan.classList.add('bg-success');
        correctLettersCount++;

        // Start the timer on the first correct letter
        if (!timerStarted) {
            startTimer(duration);
            startTime = Date.now();
            timerStarted = true;
        }
        const now = Date.now();

        if (lastKeyTime !== null) {
            const delay = now - lastKeyTime;
            const expectedLetter = storyText[currentLetterIndex];  // Not typedLetter — since we're basing it on expected
            if (!allLetterTimings[expectedLetter]) {
                allLetterTimings[expectedLetter] = [];
            }
            allLetterTimings[expectedLetter].push(delay);
        }
        lastKeyTime = now;
    } else {
        mistypedLetters[expectedLetter] = (mistypedLetters[expectedLetter] || 0) + 1;
        incorrectLettersCount++;
        currentLetterSpan.classList.add('bg-danger');
    }
    calculateAccuracy();


    // Handle backspace
    if (event.inputType === 'deleteContentBackward') {
        if (currentLetterIndex > 0) {
            currentLetterIndex--;
        }
        incorrectLettersCount--;
        letter_spans[currentLetterIndex].classList.remove('bg-success', 'bg-danger');
        letter_spans[currentLetterIndex].classList.add('text-decoration-underline', 'text-primary');
        currentLetterSpan.classList.remove('bg-success', 'bg-danger', 'text-decoration-underline', 'text-primary');
    
    // Handle regular key input
    } else if (event.inputType === 'insertText') {
        currentLetterSpan.classList.remove('text-decoration-underline', 'text-primary');
        currentLetterIndex++;
        letter_spans[currentLetterIndex].classList.add('text-decoration-underline', 'text-primary');
    }

    // Check for line change
    const nextLetterRect = letter_spans[currentLetterIndex].getBoundingClientRect();

    if (lastLineTop === null || nextLetterRect.top > lastLineTop) {
        lastLineTop = nextLetterRect.top;
        currentLineIndex++;
        textDisplay.style.transform = `translateY(-${(currentLineIndex-1) * 62.999}px)`;
    }

    // Check if text is fully typed
    if (currentLetterIndex >= storyText.length) {
        alert('You have completed the text!');
    }
});

// Disable certain keys
input.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.altKey) || ['Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        console.log(`${event.key} is disabled`);
    }
});
