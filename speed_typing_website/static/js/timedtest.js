const storyText = document.getElementById('story').getAttribute('data-text');
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

// Timer update function
function startTimer(duration) {
    updateTimeLeft(duration); // Initialize display
    timerInterval = setInterval(() => {
        duration--;
        calculateWPM();
        updateTimeLeft(duration);
        
        if (duration <= 0) {
            clearInterval(timerInterval);
            alert('Time is up!');
        }
    }, 1000);
}

function updateTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timeLeftElement.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Initialize the timer
let duration = document.getElementById('duration').getAttribute('data-duration') * 60;
updateTimeLeft(duration);



// Calculate and display WPM
let startTime = null;
wpmElement  = document.getElementById("wpm");

function calculateWPM() {
    const elapsedTimeInMinutes = (Date.now() - startTime) / 60000;
    let wpm = 0;
    if (elapsedTimeInMinutes > 0) {
        wpm = Math.floor((correctLettersCount / 5) / elapsedTimeInMinutes);
    }
    wpmElement.textContent = wpm;
}


// Calculate and display accuracy
accuracyElement = document.getElementById("accuracy");
function calculateAccuracy() {
    console.log(correctLettersCount, incorrectLettersCount);
    const accuracy = (correctLettersCount / (correctLettersCount + incorrectLettersCount)) * 100;
    accuracyElement.textContent = `${accuracy.toFixed(2)}%`;
}



// Handle typing
let currentLetterIndex = 0;
let lastLineTop = null; 
let currentLineIndex = 0;
let timerStarted = false;


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
    } else {
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
