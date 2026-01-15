// Math Estimator Game

// ============ CONFIGURATION ============
const LEVELS = {
    easy: {
        name: 'Easy',
        tolerance: { bullseye: 0.05, close: 0.10, neighborhood: 0.20 },
        problems: [
            { type: 'multiplication', range: [2, 9], label: 'Multiplication' },
            { type: 'fractionOf', range: [10, 50], fractions: ['1/2', '1/4', '3/4'], label: 'Fractions' }
        ]
    },
    medium: {
        name: 'Medium',
        tolerance: { bullseye: 0.05, close: 0.10, neighborhood: 0.15 },
        problems: [
            { type: 'multiplication', range: [10, 30], range2: [2, 9], label: 'Multiplication' },
            { type: 'division', range: [20, 100], range2: [2, 9], label: 'Division' },
            { type: 'decimal', range: [2, 10], label: 'Decimals' },
            { type: 'fractionOf', range: [20, 100], fractions: ['1/2', '1/3', '1/4', '2/3', '3/4'], label: 'Fractions' }
        ]
    },
    hard: {
        name: 'Hard',
        tolerance: { bullseye: 0.03, close: 0.07, neighborhood: 0.10 },
        problems: [
            { type: 'multiplication', range: [20, 99], range2: [10, 30], label: 'Multiplication' },
            { type: 'division', range: [100, 500], range2: [5, 15], label: 'Division' },
            { type: 'decimal', range: [5, 20], label: 'Decimals' },
            { type: 'fractionAdd', label: 'Fraction Addition' }
        ]
    }
};

const POINTS = {
    bullseye: 100,
    close: 75,
    neighborhood: 50,
    far: 10,
    streakBonus: 25
};

const FEEDBACK = {
    bullseye: { emoji: '🎯', text: 'Bullseye!' },
    close: { emoji: '🌟', text: 'Very Close!' },
    neighborhood: { emoji: '👍', text: 'In the Neighborhood!' },
    far: { emoji: '💪', text: 'Keep Practicing!' }
};

// ============ GAME STATE ============
let state = {
    level: null,
    currentProblem: null,
    estimate: 50,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalPoints: 0,
    minValue: 0,
    maxValue: 100,
    isDragging: false
};

// ============ DOM ELEMENTS ============
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    problem: document.getElementById('problem'),
    problemType: document.getElementById('problem-type'),
    sliderThumb: document.getElementById('slider-thumb'),
    answerMarker: document.getElementById('answer-marker'),
    estimateValue: document.getElementById('estimate-value'),
    minLabel: document.getElementById('min-label'),
    maxLabel: document.getElementById('max-label'),
    feedback: document.getElementById('feedback'),
    feedbackEmoji: document.getElementById('feedback-emoji'),
    feedbackText: document.getElementById('feedback-text'),
    actualAnswer: document.getElementById('actual-answer'),
    yourGuess: document.getElementById('your-guess'),
    pointsEarned: document.getElementById('points-earned'),
    currentScore: document.getElementById('current-score'),
    currentStreak: document.getElementById('current-streak'),
    streakIcon: document.getElementById('streak-icon'),
    submitBtn: document.getElementById('submit-btn'),
    nextBtn: document.getElementById('next-btn'),
    backBtn: document.getElementById('back-btn'),
    bestStreakDisplay: document.getElementById('best-streak-display'),
    totalPointsDisplay: document.getElementById('total-points-display'),
    numberLineTrack: document.querySelector('.number-line-track')
};

// ============ UTILITY FUNCTIONS ============
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function roundNice(num) {
    if (num >= 100) return Math.round(num);
    if (num >= 10) return Math.round(num * 10) / 10;
    return Math.round(num * 100) / 100;
}

function formatNumber(num) {
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(num < 10 ? 2 : 1);
}

function parseFraction(str) {
    const [num, denom] = str.split('/').map(Number);
    return num / denom;
}

// ============ PROBLEM GENERATORS ============
function generateProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    switch (problemConfig.type) {
        case 'multiplication':
            return generateMultiplication(problemConfig);
        case 'division':
            return generateDivision(problemConfig);
        case 'decimal':
            return generateDecimal(problemConfig);
        case 'fractionOf':
            return generateFractionOf(problemConfig);
        case 'fractionAdd':
            return generateFractionAdd(problemConfig);
        default:
            return generateMultiplication(problemConfig);
    }
}

function generateMultiplication(config) {
    const a = randInt(config.range[0], config.range[1]);
    const b = config.range2 ? randInt(config.range2[0], config.range2[1]) : randInt(config.range[0], config.range[1]);
    const answer = a * b;
    const scale = calculateScale(answer);

    return {
        text: `${a} × ${b} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label
    };
}

function generateDivision(config) {
    const divisor = randInt(config.range2[0], config.range2[1]);
    const dividend = randInt(config.range[0], config.range[1]);
    const answer = roundNice(dividend / divisor);
    const scale = calculateScale(answer);

    return {
        text: `${dividend} ÷ ${divisor} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label
    };
}

function generateDecimal(config) {
    const a = (randInt(config.range[0] * 10, config.range[1] * 10) / 10);
    const b = (randInt(20, 50) / 10);
    const answer = roundNice(a * b);
    const scale = calculateScale(answer);

    return {
        text: `${a.toFixed(1)} × ${b.toFixed(1)} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label
    };
}

function generateFractionOf(config) {
    const fraction = randChoice(config.fractions);
    const whole = randInt(config.range[0], config.range[1]);
    // Make whole a nice multiple for cleaner answers
    const adjustedWhole = whole - (whole % getDenom(fraction));
    const actualWhole = adjustedWhole > 0 ? adjustedWhole : whole;
    const answer = roundNice(parseFraction(fraction) * actualWhole);
    const scale = calculateScale(answer);

    return {
        text: `${fraction} of ${actualWhole} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label
    };
}

function getDenom(fraction) {
    return parseInt(fraction.split('/')[1]);
}

function generateFractionAdd(config) {
    const fractions = [
        { num: 1, denom: 2 },
        { num: 1, denom: 3 },
        { num: 1, denom: 4 },
        { num: 2, denom: 3 },
        { num: 3, denom: 4 },
        { num: 1, denom: 5 },
        { num: 2, denom: 5 }
    ];

    const f1 = randChoice(fractions);
    const f2 = randChoice(fractions);
    const answer = roundNice((f1.num / f1.denom) + (f2.num / f2.denom));

    return {
        text: `${f1.num}/${f1.denom} + ${f2.num}/${f2.denom} ≈ ?`,
        answer: answer,
        min: 0,
        max: 2,
        label: config.label
    };
}

function calculateScale(answer) {
    if (answer <= 1) return { min: 0, max: 2 };
    if (answer <= 10) return { min: 0, max: Math.ceil(answer * 2 / 5) * 5 };
    if (answer <= 50) return { min: 0, max: Math.ceil(answer * 1.5 / 10) * 10 };
    if (answer <= 100) return { min: 0, max: Math.ceil(answer * 1.5 / 50) * 50 };
    if (answer <= 500) return { min: 0, max: Math.ceil(answer * 1.5 / 100) * 100 };
    if (answer <= 1000) return { min: 0, max: Math.ceil(answer * 1.5 / 500) * 500 };
    return { min: 0, max: Math.ceil(answer * 1.5 / 1000) * 1000 };
}

// ============ SLIDER LOGIC ============
function initSlider() {
    const track = elements.numberLineTrack;

    function handleStart(e) {
        state.isDragging = true;
        elements.sliderThumb.classList.add('active');
        handleMove(e);
    }

    function handleMove(e) {
        if (!state.isDragging) return;

        e.preventDefault();
        const rect = track.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        state.estimate = state.minValue + percent * (state.maxValue - state.minValue);
        updateSliderPosition(percent);
        updateEstimateDisplay();
    }

    function handleEnd() {
        state.isDragging = false;
        elements.sliderThumb.classList.remove('active');
    }

    // Mouse events
    track.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events
    track.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    // Click on track
    track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        state.estimate = state.minValue + percent * (state.maxValue - state.minValue);
        updateSliderPosition(percent);
        updateEstimateDisplay();
    });
}

function updateSliderPosition(percent) {
    elements.sliderThumb.style.left = `${percent * 100}%`;
}

function updateEstimateDisplay() {
    elements.estimateValue.textContent = formatNumber(roundNice(state.estimate));
}

function setSliderToMiddle() {
    state.estimate = (state.minValue + state.maxValue) / 2;
    updateSliderPosition(0.5);
    updateEstimateDisplay();
}

// ============ GAME LOGIC ============
function startGame(level) {
    state.level = level;
    state.score = 0;
    state.streak = 0;

    elements.startScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');

    updateScoreDisplay();
    nextProblem();
}

function nextProblem() {
    state.currentProblem = generateProblem(state.level);
    state.minValue = state.currentProblem.min;
    state.maxValue = state.currentProblem.max;

    // Update UI
    elements.problem.textContent = state.currentProblem.text;
    elements.problemType.textContent = state.currentProblem.label;
    elements.minLabel.textContent = formatNumber(state.minValue);
    elements.maxLabel.textContent = formatNumber(state.maxValue);

    // Reset slider
    setSliderToMiddle();

    // Hide feedback and answer marker
    elements.feedback.classList.add('hidden');
    elements.answerMarker.classList.add('hidden');

    // Show submit, hide next
    elements.submitBtn.classList.remove('hidden');
    elements.nextBtn.classList.add('hidden');
}

function checkEstimate() {
    const problem = state.currentProblem;
    const tolerance = LEVELS[state.level].tolerance;
    const answer = problem.answer;
    const estimate = roundNice(state.estimate);

    // Calculate error as percentage of answer (handle zero case)
    const error = answer === 0 ? Math.abs(estimate) : Math.abs(estimate - answer) / Math.abs(answer);

    // Determine result
    let result, points;
    if (error <= tolerance.bullseye) {
        result = 'bullseye';
        points = POINTS.bullseye;
    } else if (error <= tolerance.close) {
        result = 'close';
        points = POINTS.close;
    } else if (error <= tolerance.neighborhood) {
        result = 'neighborhood';
        points = POINTS.neighborhood;
    } else {
        result = 'far';
        points = POINTS.far;
    }

    // Streak bonus
    if (result !== 'far') {
        state.streak++;
        if (state.streak > 1) {
            points += POINTS.streakBonus * (state.streak - 1);
        }
        if (state.streak > state.bestStreak) {
            state.bestStreak = state.streak;
        }
    } else {
        state.streak = 0;
    }

    // Update score
    state.score += points;
    state.totalPoints += points;

    // Show feedback
    showFeedback(result, answer, estimate, points);
    showAnswerMarker(answer);

    // Update displays
    updateScoreDisplay();
    saveProgress();

    // Switch buttons
    elements.submitBtn.classList.add('hidden');
    elements.nextBtn.classList.remove('hidden');
}

function showFeedback(result, answer, estimate, points) {
    const fb = FEEDBACK[result];
    elements.feedbackEmoji.textContent = fb.emoji;
    elements.feedbackText.textContent = fb.text;
    elements.actualAnswer.textContent = formatNumber(answer);
    elements.yourGuess.textContent = formatNumber(estimate);
    elements.pointsEarned.textContent = `+${points}`;

    elements.feedback.classList.remove('hidden');
    elements.feedback.className = `feedback ${result}`;
}

function showAnswerMarker(answer) {
    const percent = (answer - state.minValue) / (state.maxValue - state.minValue);
    elements.answerMarker.style.left = `${percent * 100}%`;
    elements.answerMarker.classList.remove('hidden');
}

function updateScoreDisplay() {
    elements.currentScore.textContent = state.score;
    elements.currentStreak.textContent = state.streak;
    elements.streakIcon.textContent = state.streak >= 3 ? '🔥' : '⚡';

    // Animate streak if high
    if (state.streak >= 3) {
        elements.streakIcon.classList.add('fire');
    } else {
        elements.streakIcon.classList.remove('fire');
    }
}

function goToMenu() {
    elements.gameScreen.classList.remove('active');
    elements.startScreen.classList.add('active');
    loadProgress();
}

// ============ PERSISTENCE ============
function saveProgress() {
    const data = {
        bestStreak: state.bestStreak,
        totalPoints: state.totalPoints
    };
    localStorage.setItem('mathEstimatorProgress', JSON.stringify(data));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('mathEstimatorProgress'));
        if (data) {
            state.bestStreak = data.bestStreak || 0;
            state.totalPoints = data.totalPoints || 0;
        }
    } catch (e) {
        console.log('No saved progress found');
    }

    elements.bestStreakDisplay.textContent = state.bestStreak;
    elements.totalPointsDisplay.textContent = state.totalPoints;
}

// ============ SERVICE WORKER ============
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// ============ EVENT LISTENERS ============
function initEventListeners() {
    // Level selection
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.dataset.level;
            startGame(level);
        });
    });

    // Game buttons
    elements.submitBtn.addEventListener('click', checkEstimate);
    elements.nextBtn.addEventListener('click', nextProblem);
    elements.backBtn.addEventListener('click', goToMenu);

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (elements.gameScreen.classList.contains('active')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!elements.submitBtn.classList.contains('hidden')) {
                    checkEstimate();
                } else {
                    nextProblem();
                }
            }
        }
    });
}

// ============ INITIALIZATION ============
function init() {
    loadProgress();
    initSlider();
    initEventListeners();
    registerServiceWorker();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
