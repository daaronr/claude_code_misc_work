// Math Estimator Game

// ============ CONFIGURATION ============
const LEVELS = {
    // Numbers Mode Levels
    easy: {
        name: 'Easy',
        mode: 'numbers',
        tolerance: { bullseye: 0.05, close: 0.10, neighborhood: 0.20 },
        problems: [
            { type: 'multiplication', range: [2, 12], label: 'Multiplication', visual: true },
            { type: 'multiplicationLarge', range: [10, 25], range2: [2, 5], label: 'Multiplication' },
            { type: 'fractionOf', range: [10, 100], fractions: ['1/2', '1/4', '3/4'], label: 'Fractions', visual: true }
        ]
    },
    medium: {
        name: 'Medium',
        mode: 'numbers',
        tolerance: { bullseye: 0.05, close: 0.10, neighborhood: 0.15 },
        problems: [
            { type: 'multiplication', range: [10, 50], range2: [3, 12], label: 'Multiplication', visual: true },
            { type: 'multiplicationLarge', range: [25, 100], range2: [5, 20], label: 'Big Multiplication' },
            { type: 'division', range: [50, 200], range2: [3, 12], label: 'Division', visual: true },
            { type: 'decimal', range: [5, 25], label: 'Decimals' },
            { type: 'fractionOf', range: [50, 200], fractions: ['1/2', '1/3', '1/4', '2/3', '3/4'], label: 'Fractions' }
        ]
    },
    hard: {
        name: 'Hard',
        mode: 'numbers',
        tolerance: { bullseye: 0.03, close: 0.07, neighborhood: 0.10 },
        problems: [
            { type: 'multiplication', range: [50, 150], range2: [10, 50], label: 'Multiplication' },
            { type: 'multiplicationLarge', range: [100, 500], range2: [20, 100], label: 'Big Multiplication' },
            { type: 'division', range: [200, 1000], range2: [5, 25], label: 'Division' },
            { type: 'decimal', range: [10, 50], label: 'Decimals' },
            { type: 'fractionAdd', label: 'Fraction Addition' },
            { type: 'percentOf', range: [100, 500], label: 'Percentages' }
        ]
    },
    // Baby Mode (single level - visual only)
    baby: {
        name: 'Baby Mode',
        mode: 'baby',
        problems: [
            { type: 'counting', maxCount: 5 },
            { type: 'addVisual', maxNum: 3 }
        ]
    },
    // Shopping Mode Levels
    deals: {
        name: 'Price Per Ounce',
        mode: 'shopping',
        tolerance: { bullseye: 0.05, close: 0.12, neighborhood: 0.20 },
        problems: [{ type: 'unitPrice', label: 'Unit Price' }]
    },
    basket: {
        name: 'Basket Total',
        mode: 'shopping',
        tolerance: { bullseye: 0.05, close: 0.10, neighborhood: 0.15 },
        problems: [{ type: 'basketTotal', label: 'Basket Total' }]
    },
    tips: {
        name: 'Tips & Discounts',
        mode: 'shopping',
        tolerance: { bullseye: 0.05, close: 0.10, neighborhood: 0.15 },
        problems: [
            { type: 'tipCalc', label: 'Tip Calculator' },
            { type: 'discount', label: 'Discount' }
        ]
    },
    quick: {
        name: 'Quick Totals',
        mode: 'shopping',
        tolerance: { bullseye: 0.03, close: 0.08, neighborhood: 0.12 },
        problems: [{ type: 'quickAdd', label: 'Quick Add' }]
    },
    // College Level Mode
    sciNotation: {
        name: 'Scientific Notation',
        mode: 'college',
        tolerance: { bullseye: 0.1, close: 0.25, neighborhood: 0.5 }, // More lenient - order of magnitude
        problems: [
            { type: 'sciMultiply', label: 'Scientific Notation' },
            { type: 'sciDivide', label: 'Scientific Notation' }
        ]
    },
    economics: {
        name: 'Economics & Scale',
        mode: 'college',
        tolerance: { bullseye: 0.1, close: 0.25, neighborhood: 0.5 },
        problems: [
            { type: 'perCapita', label: 'Per Capita' },
            { type: 'percentLarge', label: 'Large Percentages' },
            { type: 'ratioScale', label: 'Scale Ratios' }
        ]
    },
    fermi: {
        name: 'Fermi Estimation',
        mode: 'college',
        tolerance: { bullseye: 0.3, close: 0.5, neighborhood: 1.0 }, // Order of magnitude scoring
        problems: [{ type: 'fermi', label: 'Fermi Problem' }]
    },
    compound: {
        name: 'Growth & Interest',
        mode: 'college',
        tolerance: { bullseye: 0.05, close: 0.15, neighborhood: 0.25 },
        problems: [
            { type: 'compoundInterest', label: 'Compound Interest' },
            { type: 'exponentialGrowth', label: 'Exponential Growth' }
        ]
    },
    // ============ NEW MODES ============
    // Real World Mode - Guess actual real-world values
    realWorldKids: {
        name: 'Kid Facts',
        mode: 'realworld',
        tolerance: { bullseye: 0.1, close: 0.25, neighborhood: 0.5 },
        problems: [{ type: 'realWorldKid', label: 'Real World' }]
    },
    realWorldAdult: {
        name: 'World Facts',
        mode: 'realworld',
        tolerance: { bullseye: 0.15, close: 0.35, neighborhood: 0.6 },
        problems: [{ type: 'realWorldAdult', label: 'Real World' }]
    },
    realWorldPrices: {
        name: 'Price Check',
        mode: 'realworld',
        tolerance: { bullseye: 0.1, close: 0.25, neighborhood: 0.4 },
        problems: [{ type: 'realWorldPrice', label: 'Price Guess' }]
    },
    // Magnitude Mode - Understanding big numbers
    magnitudeEasy: {
        name: 'Big vs Bigger',
        mode: 'magnitude',
        tolerance: { bullseye: 0.15, close: 0.3, neighborhood: 0.5 },
        problems: [{ type: 'magnitudeCompare', label: 'Magnitude' }]
    },
    magnitudeHard: {
        name: 'Million vs Billion',
        mode: 'magnitude',
        tolerance: { bullseye: 0.2, close: 0.4, neighborhood: 0.7 },
        problems: [{ type: 'magnitudeScale', label: 'Scale' }]
    },
    // Time Detective Mode - Time questions for kids
    timeDaily: {
        name: 'Your Day',
        mode: 'time',
        tolerance: { bullseye: 0.1, close: 0.2, neighborhood: 0.35 },
        problems: [{ type: 'timeDaily', label: 'Daily Time' }]
    },
    timeLife: {
        name: 'Lifetime',
        mode: 'time',
        tolerance: { bullseye: 0.15, close: 0.3, neighborhood: 0.5 },
        problems: [{ type: 'timeLife', label: 'Lifetime' }]
    },
    // Friends & Combinations - Combinatorics for kids
    friendsMode: {
        name: 'Friends Math',
        mode: 'friends',
        tolerance: { bullseye: 0.1, close: 0.25, neighborhood: 0.4 },
        problems: [{ type: 'friendsCombinations', label: 'Friend Math' }]
    },
    // About Me - Personal questions based on user's data
    aboutMeMode: {
        name: 'About Me',
        mode: 'aboutme',
        tolerance: { bullseye: 0.1, close: 0.2, neighborhood: 0.35 },
        problems: [{ type: 'aboutMe', label: 'About Me' }]
    },
    // Puzzlers Mode - Brain teasers and classic math puzzles
    puzzlersSequences: {
        name: 'Sequences',
        mode: 'puzzlers',
        tolerance: { bullseye: 0.05, close: 0.15, neighborhood: 0.30 },
        problems: [
            { type: 'triangular', label: 'Triangular Numbers' },
            { type: 'fibonacci', label: 'Fibonacci' }
        ]
    },
    puzzlersPaths: {
        name: 'Grid Paths',
        mode: 'puzzlers',
        tolerance: { bullseye: 0.1, close: 0.25, neighborhood: 0.40 },
        problems: [{ type: 'gridPaths', label: 'Grid Paths' }]
    },
    puzzlersClassic: {
        name: 'Classic Puzzles',
        mode: 'puzzlers',
        tolerance: { bullseye: 0.1, close: 0.25, neighborhood: 0.40 },
        problems: [
            { type: 'towerHanoi', label: 'Tower of Hanoi' },
            { type: 'factorials', label: 'Factorials' }
        ]
    },
    puzzlersProbability: {
        name: 'Probability',
        mode: 'puzzlers',
        tolerance: { bullseye: 0.15, close: 0.30, neighborhood: 0.50 },
        problems: [
            { type: 'birthday', label: 'Birthday Problem' },
            { type: 'diceProb', label: 'Dice Probability' }
        ]
    },
    // Fallacies & Scams Mode - Common misconceptions and tricks
    fallaciesProbability: {
        name: 'Probability Traps',
        mode: 'fallacies',
        tolerance: { bullseye: 0.15, close: 0.30, neighborhood: 0.50 },
        problems: [
            { type: 'gambler', label: 'Gambler\'s Fallacy' },
            { type: 'baseRate', label: 'Base Rate' },
            { type: 'lottery', label: 'Lottery Math' }
        ]
    },
    fallaciesFinancial: {
        name: 'Financial Tricks',
        mode: 'fallacies',
        tolerance: { bullseye: 0.10, close: 0.25, neighborhood: 0.40 },
        problems: [
            { type: 'mlm', label: 'MLM Math' },
            { type: 'fakeDiscount', label: 'Fake Discounts' },
            { type: 'compound', label: 'Hidden Costs' }
        ]
    },
    fallaciesStatistics: {
        name: 'Statistics Lies',
        mode: 'fallacies',
        tolerance: { bullseye: 0.15, close: 0.30, neighborhood: 0.50 },
        problems: [
            { type: 'survivalBias', label: 'Survivorship Bias' },
            { type: 'cherryPick', label: 'Cherry Picking' },
            { type: 'correlation', label: 'Correlation ≠ Causation' }
        ]
    }
};

// Baby Mode visual items - separated for appropriate contexts
const BABY_FOOD_ITEMS = ['🍎', '🍪', '🍕', '🧁', '🍩', '🍓', '🍌', '🍇', '🥕', '🍬'];
const BABY_TOY_ITEMS = ['🌟', '🎈', '⚽', '🚗', '🎨', '🧸', '🎁', '🔵', '💎', '🎯'];
const BABY_ITEMS = [...BABY_FOOD_ITEMS, ...BABY_TOY_ITEMS]; // All items for counting

// Shopping product data
const PRODUCTS = [
    { name: 'Milk', emoji: '🥛', basePrice: 4.49, unit: 'gal' },
    { name: 'Bread', emoji: '🍞', basePrice: 3.99, unit: 'loaf' },
    { name: 'Eggs', emoji: '🥚', basePrice: 5.99, unit: 'dozen' },
    { name: 'Cheese', emoji: '🧀', basePrice: 6.49, unit: 'lb' },
    { name: 'Apples', emoji: '🍎', basePrice: 4.99, unit: 'lb' },
    { name: 'Bananas', emoji: '🍌', basePrice: 0.69, unit: 'lb' },
    { name: 'Chicken', emoji: '🍗', basePrice: 8.99, unit: 'lb' },
    { name: 'Rice', emoji: '🍚', basePrice: 3.49, unit: 'lb' },
    { name: 'Pasta', emoji: '🍝', basePrice: 2.29, unit: 'box' },
    { name: 'Cereal', emoji: '🥣', basePrice: 4.79, unit: 'box' },
    { name: 'Orange Juice', emoji: '🧃', basePrice: 5.49, unit: 'half gal' },
    { name: 'Coffee', emoji: '☕', basePrice: 9.99, unit: 'bag' },
    { name: 'Butter', emoji: '🧈', basePrice: 5.29, unit: 'lb' },
    { name: 'Yogurt', emoji: '🥛', basePrice: 1.29, unit: 'cup' },
    { name: 'Chips', emoji: '🥔', basePrice: 3.99, unit: 'bag' },
    { name: 'Soda', emoji: '🥤', basePrice: 2.49, unit: '2L' },
    { name: 'Ice Cream', emoji: '🍦', basePrice: 5.99, unit: 'pint' },
    { name: 'Tomatoes', emoji: '🍅', basePrice: 3.49, unit: 'lb' },
    { name: 'Onions', emoji: '🧅', basePrice: 1.99, unit: 'lb' },
    { name: 'Carrots', emoji: '🥕', basePrice: 2.49, unit: 'lb' }
];

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
    mode: 'numbers',
    level: null,
    currentProblem: null,
    estimate: 50,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalPoints: 0,
    minValue: 0,
    maxValue: 100,
    isDragging: false,
    shoppingItems: [], // For basket display
    // Baby mode state
    babyCorrect: 0,
    babyAnswer: null,
    // Tracking for credits reminder
    problemCount: 0,
    // Timer/performance tracking
    timerEnabled: true,
    problemStartTime: null,
    lastProblemTime: 0,
    totalTime: 0,
    problemsSolved: 0,
    timerInterval: null,
    // Input mode tracking
    useNumberInput: false,
    hintUsed: false
};

// ============ DOM ELEMENTS ============
const elements = {
    // Screens
    modeScreen: document.getElementById('mode-screen'),
    levelScreen: document.getElementById('level-screen'),
    gameScreen: document.getElementById('game-screen'),
    babyScreen: document.getElementById('baby-screen'),
    // Level screen
    levelScreenTitle: document.getElementById('level-screen-title'),
    numbersLevels: document.getElementById('numbers-levels'),
    shoppingLevels: document.getElementById('shopping-levels'),
    collegeLevels: document.getElementById('college-levels'),
    realworldLevels: document.getElementById('realworld-levels'),
    timeLevels: document.getElementById('time-levels'),
    magnitudeLevels: document.getElementById('magnitude-levels'),
    friendsLevels: document.getElementById('friends-levels'),
    puzzlersLevels: document.getElementById('puzzlers-levels'),
    fallaciesLevels: document.getElementById('fallacies-levels'),
    backToModeBtn: document.getElementById('back-to-mode-btn'),
    // About Me setup
    aboutMeSetupScreen: document.getElementById('aboutme-setup-screen'),
    aboutMeBackBtn: document.getElementById('aboutme-back-btn'),
    aboutMeStartBtn: document.getElementById('aboutme-start-btn'),
    aboutMeAge: document.getElementById('aboutme-age'),
    aboutMeSiblings: document.getElementById('aboutme-siblings'),
    aboutMePets: document.getElementById('aboutme-pets'),
    aboutMeRooms: document.getElementById('aboutme-rooms'),
    aboutMeFamily: document.getElementById('aboutme-family'),
    aboutMeBooks: document.getElementById('aboutme-books'),
    aboutMeFavNum: document.getElementById('aboutme-favnum'),
    // Game screen
    problem: document.getElementById('problem'),
    problemType: document.getElementById('problem-type'),
    problemVisual: document.getElementById('problem-visual'),
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
    numberLineTrack: document.querySelector('.number-line-track'),
    // Shopping display
    shoppingDisplay: document.getElementById('shopping-display'),
    shoppingItems: document.getElementById('shopping-items'),
    // Baby mode
    babyProblem: document.getElementById('baby-problem'),
    babyChoices: document.getElementById('baby-choices'),
    babyFeedback: document.getElementById('baby-feedback'),
    babyStars: document.getElementById('baby-stars'),
    babyBackBtn: document.getElementById('baby-back-btn'),
    // Timer
    timerDisplay: document.getElementById('timer-display'),
    timerValue: document.getElementById('timer-value'),
    timerToggle: document.getElementById('timer-toggle'),
    // Number input (for advanced modes)
    numberInputContainer: document.getElementById('number-input-container'),
    numberLineContainer: document.getElementById('number-line-container'),
    numberInput: document.getElementById('number-input'),
    hintBtn: document.getElementById('hint-btn'),
    hintDisplay: document.getElementById('hint-display')
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

// Smart rounding based on problem scale - no decimals for large numbers!
function smartRound(num, maxScale) {
    // For very large scales (college mode, etc), round to significant figures
    if (maxScale >= 1000000) {
        const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(num, 1))) - 1);
        return Math.round(num / magnitude) * magnitude;
    }
    // For large scales (100+), round to whole numbers
    if (maxScale >= 100) {
        return Math.round(num);
    }
    // For medium scales (10-100), round to 1 decimal
    if (maxScale >= 10) {
        return Math.round(num * 10) / 10;
    }
    // For small scales (fractions, decimals), keep 2 decimals
    return Math.round(num * 100) / 100;
}

function formatNumber(num) {
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(num < 10 ? 2 : 1);
}

// Determine if a level should use direct number input vs slider
function shouldUseNumberInput(level) {
    // Advanced modes that would give away magnitude with slider
    const numberInputLevels = [
        'fermi', 'economics', 'sciNotation', 'compound', // College modes
        'magnitudeHard', // Hard magnitude
        'realWorldAdult' // Harder real world facts
    ];
    return numberInputLevels.includes(level);
}

// Check if hint is available for this problem
function hasHintAvailable(problem) {
    return problem && (problem.hint || problem.source);
}

// Show hint for current problem
function showHint() {
    if (!state.currentProblem || state.hintUsed) return;

    const problem = state.currentProblem;
    let hintText = '';

    if (problem.hint) {
        hintText = problem.hint;
    } else if (problem.source) {
        hintText = `Source: ${problem.source}`;
    }

    if (hintText && elements.hintDisplay) {
        elements.hintDisplay.textContent = `💡 ${hintText}`;
        elements.hintDisplay.classList.remove('hidden');
        elements.hintBtn.disabled = true;
        state.hintUsed = true;
    }
}

function parseFraction(str) {
    const [num, denom] = str.split('/').map(Number);
    return num / denom;
}

// ============ TIMER FUNCTIONS ============
function startTimer() {
    if (!state.timerEnabled) return;

    state.problemStartTime = Date.now();
    if (state.timerInterval) clearInterval(state.timerInterval);

    state.timerInterval = setInterval(() => {
        const elapsed = (Date.now() - state.problemStartTime) / 1000;
        updateTimerDisplay(elapsed);
    }, 100);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    if (state.problemStartTime) {
        state.lastProblemTime = (Date.now() - state.problemStartTime) / 1000;
        state.totalTime += state.lastProblemTime;
        state.problemsSolved++;
    }
}

function updateTimerDisplay(seconds) {
    if (elements.timerValue) {
        elements.timerValue.textContent = seconds.toFixed(1) + 's';
    }
}

function resetTimerDisplay() {
    if (elements.timerValue) {
        elements.timerValue.textContent = '0.0s';
    }
}

function getAverageTime() {
    if (state.problemsSolved === 0) return 0;
    return state.totalTime / state.problemsSolved;
}

function formatTimeForFeedback(seconds) {
    if (seconds < 10) return seconds.toFixed(1) + 's';
    return Math.round(seconds) + 's';
}

function toggleTimer(enabled) {
    state.timerEnabled = enabled;
    if (elements.timerDisplay) {
        elements.timerDisplay.classList.toggle('hidden', !enabled);
    }
    // Save preference
    saveProgress();
}

// ============ PROBLEM GENERATORS ============

// Visual helpers for number problems
const NUMBER_VISUALS = ['🔵', '🟢', '🟡', '🔴', '⭐', '🍎', '🎈', '💎'];

function makeVisualGrid(count, emoji, perRow = 10) {
    if (count > 100) return ''; // Too many to visualize
    const rows = [];
    for (let i = 0; i < count; i += perRow) {
        const rowCount = Math.min(perRow, count - i);
        rows.push(Array(rowCount).fill(emoji).join(''));
    }
    return rows.join('\n');
}

function generateProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    switch (problemConfig.type) {
        case 'multiplication':
            return generateMultiplication(problemConfig);
        case 'multiplicationLarge':
            return generateMultiplicationLarge(problemConfig);
        case 'division':
            return generateDivision(problemConfig);
        case 'decimal':
            return generateDecimal(problemConfig);
        case 'fractionOf':
            return generateFractionOf(problemConfig);
        case 'fractionAdd':
            return generateFractionAdd(problemConfig);
        case 'percentOf':
            return generatePercentOf(problemConfig);
        default:
            return generateMultiplication(problemConfig);
    }
}

function generateMultiplication(config) {
    const a = randInt(config.range[0], config.range[1]);
    const b = config.range2 ? randInt(config.range2[0], config.range2[1]) : randInt(config.range[0], config.range[1]);
    const answer = a * b;
    const scale = calculateScale(answer);

    // Add visual for smaller numbers
    let visual = '';
    if (config.visual && a <= 10 && b <= 10) {
        const emoji = randChoice(NUMBER_VISUALS);
        // Show a rows of b items
        const rows = [];
        for (let i = 0; i < a; i++) {
            rows.push(Array(b).fill(emoji).join(''));
        }
        visual = rows.join('\n');
    }

    return {
        text: `${a} × ${b} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label,
        visual: visual
    };
}

function generateMultiplicationLarge(config) {
    const a = randInt(config.range[0], config.range[1]);
    const b = randInt(config.range2[0], config.range2[1]);
    const answer = a * b;
    const scale = calculateScale(answer);

    return {
        text: `${a.toLocaleString()} × ${b.toLocaleString()} ≈ ?`,
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

    // Add visual for smaller numbers - show items being split into groups
    let visual = '';
    if (config.visual && dividend <= 50 && divisor <= 8) {
        const emoji = randChoice(NUMBER_VISUALS);
        const perGroup = Math.floor(dividend / divisor);
        const groups = [];
        for (let i = 0; i < divisor; i++) {
            groups.push('[' + Array(perGroup).fill(emoji).join('') + ']');
        }
        visual = groups.join(' ');
    }

    return {
        text: `${dividend} ÷ ${divisor} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label,
        visual: visual
    };
}

function generatePercentOf(config) {
    const base = randInt(config.range[0], config.range[1]);
    const percent = randChoice([10, 15, 20, 25, 30, 40, 50, 75]);
    const answer = roundNice(base * percent / 100);
    const scale = calculateScale(answer);

    // Visual: show a bar representing the percentage
    const filledBlocks = Math.round(percent / 10);
    const emptyBlocks = 10 - filledBlocks;
    const visual = '🟩'.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks) + ` (${percent}%)`;

    return {
        text: `${percent}% of ${base} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label,
        visual: visual
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

    // Visual: show a pie/bar representing the fraction
    let visual = '';
    if (config.visual) {
        const denom = getDenom(fraction);
        const numer = parseInt(fraction.split('/')[0]);
        if (denom <= 8) {
            const filled = '🟦'.repeat(numer);
            const empty = '⬜'.repeat(denom - numer);
            visual = filled + empty + ` = ${fraction}`;
        }
    }

    return {
        text: `${fraction} of ${actualWhole} ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label,
        visual: visual
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

function calculateScale(answer, wideRange = false) {
    // wideRange = true for questions where we don't want to give away magnitude
    if (wideRange) {
        // Much wider ranges - don't give away the answer
        if (answer <= 10) return { min: 0, max: 50 };
        if (answer <= 50) return { min: 0, max: 200 };
        if (answer <= 100) return { min: 0, max: 500 };
        if (answer <= 500) return { min: 0, max: 2000 };
        if (answer <= 1000) return { min: 0, max: 5000 };
        return { min: 0, max: Math.ceil(answer * 5 / 1000) * 1000 };
    }
    // Standard ranges for basic math problems
    if (answer <= 1) return { min: 0, max: 2 };
    if (answer <= 10) return { min: 0, max: Math.ceil(answer * 2.5 / 5) * 5 };
    if (answer <= 50) return { min: 0, max: Math.ceil(answer * 2 / 10) * 10 };
    if (answer <= 100) return { min: 0, max: Math.ceil(answer * 2 / 50) * 50 };
    if (answer <= 500) return { min: 0, max: Math.ceil(answer * 2 / 100) * 100 };
    if (answer <= 1000) return { min: 0, max: Math.ceil(answer * 2 / 500) * 500 };
    return { min: 0, max: Math.ceil(answer * 2 / 1000) * 1000 };
}

// ============ SHOPPING PROBLEM GENERATORS ============
function formatPrice(num) {
    return '$' + num.toFixed(2);
}

function generateShoppingProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    switch (problemConfig.type) {
        case 'unitPrice':
            return generateUnitPrice(problemConfig);
        case 'basketTotal':
            return generateBasketTotal(problemConfig);
        case 'tipCalc':
            return generateTipCalc(problemConfig);
        case 'discount':
            return generateDiscount(problemConfig);
        case 'quickAdd':
            return generateQuickAdd(problemConfig);
        default:
            return generateBasketTotal(problemConfig);
    }
}

function generateUnitPrice(config) {
    // Generate a single item and ask for its unit price (simpler, works with slider)
    const product = randChoice(PRODUCTS);
    const sizes = [6, 8, 10, 12, 16, 20, 24, 32];
    const size = randChoice(sizes);

    // Generate a realistic price
    const pricePerOz = (product.basePrice / 10) * (0.7 + Math.random() * 0.6);
    const totalPrice = roundNice(size * pricePerOz);

    // The answer is cents per oz (easier for kids to understand)
    const unitPriceCents = Math.round((totalPrice / size) * 100);

    // Store item for display
    state.shoppingItems = [
        { emoji: product.emoji, name: `${size}oz ${product.name}`, price: totalPrice }
    ];

    return {
        text: `${size}oz costs ${formatPrice(totalPrice)}\nHow many CENTS per oz?`,
        answer: unitPriceCents,
        min: 0,
        max: Math.ceil(unitPriceCents * 2),
        label: config.label,
        showItems: true,
        visual: `${product.emoji} ${size}oz = ${formatPrice(totalPrice)}`,
        feedbackExtra: `${formatPrice(totalPrice)} ÷ ${size}oz = ${unitPriceCents}¢/oz`,
        useCents: true  // Flag for cents display on slider
    };
}

function generateBasketTotal(config) {
    // Pick 3-5 random products with quantities and possible discounts
    const numItems = randInt(3, 5);
    const items = [];
    const usedProducts = new Set();

    let total = 0;
    for (let i = 0; i < numItems; i++) {
        let product;
        do {
            product = randChoice(PRODUCTS);
        } while (usedProducts.has(product.name));
        usedProducts.add(product.name);

        // Random quantity (1-3)
        const quantity = randInt(1, 3);

        // Base price with slight variation
        const unitPrice = roundNice(product.basePrice * (0.8 + Math.random() * 0.4));

        // Maybe apply a discount (30% chance)
        let discount = null;
        let itemTotal = unitPrice * quantity;

        if (Math.random() < 0.3 && quantity > 1) {
            const discountTypes = ['percent', 'bogo'];
            const discountType = randChoice(discountTypes);

            if (discountType === 'percent') {
                const percentOff = randChoice([10, 15, 20, 25]);
                discount = `${percentOff}% off`;
                itemTotal = itemTotal * (1 - percentOff / 100);
            } else if (discountType === 'bogo' && quantity >= 2) {
                discount = 'Buy 2 Get 1 Free';
                const freeItems = Math.floor(quantity / 2);
                itemTotal = unitPrice * (quantity - freeItems);
            }
        }

        items.push({
            emoji: product.emoji,
            name: product.name,
            unitPrice: unitPrice,
            quantity: quantity,
            discount: discount,
            itemTotal: roundNice(itemTotal)
        });
        total += itemTotal;
    }

    state.shoppingItems = items;

    // Create visual summary of items in basket
    const visualItems = items.map(item => {
        return item.quantity > 1 ? `${item.emoji}×${item.quantity}` : item.emoji;
    }).join(' ');

    return {
        text: `Estimate your basket total`,
        answer: roundNice(total),
        min: 0,
        max: Math.ceil(total * 1.5 / 5) * 5,
        label: config.label,
        showItems: true,
        visual: `🛒 ${visualItems}`,
        feedbackExtra: `Actual total: ${formatPrice(total)}`
    };
}

function generateTipCalc(config) {
    // Generate a bill amount
    const bill = roundNice(randInt(20, 120) + randInt(0, 99) / 100);
    const tipPercent = randChoice([15, 18, 20, 25]);
    const answer = roundNice(bill * tipPercent / 100);

    state.shoppingItems = [];

    // Visual: show a receipt-like representation
    const filledBlocks = Math.round(tipPercent / 5);
    const emptyBlocks = 20 - filledBlocks;
    const tipBar = '🟩'.repeat(filledBlocks) + '⬜'.repeat(Math.max(0, 5 - filledBlocks));

    return {
        text: `Your bill is ${formatPrice(bill)}\nEstimate a ${tipPercent}% tip`,
        answer: answer,
        min: 0,
        max: Math.ceil(answer * 2),
        label: config.label,
        showItems: false,
        visual: `🧾 ${formatPrice(bill)} → 💵 ${tipBar} (${tipPercent}%)`,
        feedbackExtra: `${tipPercent}% of ${formatPrice(bill)} = ${formatPrice(answer)}`
    };
}

function generateDiscount(config) {
    // Generate original price and discount
    const originalPrice = randInt(20, 150);
    const discountPercent = randChoice([10, 15, 20, 25, 30, 40, 50]);
    const discountAmount = originalPrice * discountPercent / 100;
    const answer = roundNice(originalPrice - discountAmount);

    state.shoppingItems = [];

    // Visual: show price being crossed out with discount
    const payBlocks = Math.round((100 - discountPercent) / 10);
    const discountBlocks = Math.round(discountPercent / 10);
    const priceBar = '🟩'.repeat(payBlocks) + '🟥'.repeat(discountBlocks);

    return {
        text: `${discountPercent}% off ${formatPrice(originalPrice)}\nWhat do you pay?`,
        answer: answer,
        min: 0,
        max: originalPrice,
        label: config.label,
        showItems: false,
        visual: `🏷️ ${priceBar}\n💰 ${formatPrice(originalPrice)} → 🟥 -${discountPercent}%`,
        feedbackExtra: `Save ${formatPrice(discountAmount)}, pay ${formatPrice(answer)}`
    };
}

function generateQuickAdd(config) {
    // Generate 3-4 prices that look like real store prices
    const numPrices = randInt(3, 4);
    const prices = [];
    let total = 0;

    // Pick random product emojis for visual
    const itemEmojis = ['🍎', '🥛', '🍞', '🧀', '🥚', '🍌', '☕', '🍕', '🍩', '🧁'];
    const selectedEmojis = [];
    for (let i = 0; i < numPrices; i++) {
        selectedEmojis.push(randChoice(itemEmojis));
    }

    for (let i = 0; i < numPrices; i++) {
        // Generate prices like $X.99, $X.49, $X.29
        const dollars = randInt(2, 25);
        const cents = randChoice([0.29, 0.49, 0.79, 0.99]);
        const price = dollars + cents;
        prices.push(price);
        total += price;
    }

    state.shoppingItems = prices.map((p, i) => ({
        emoji: selectedEmojis[i],
        name: `Item ${i + 1}`,
        price: p
    }));

    // Visual: show items with price tags
    const visualItems = prices.map((p, i) => `${selectedEmojis[i]}${formatPrice(p)}`).join(' + ');

    return {
        text: `Quick! Add these up:`,
        answer: roundNice(total),
        min: 0,
        max: Math.ceil(total * 1.3 / 5) * 5,
        label: config.label,
        showItems: false,
        visual: `🧮 ${visualItems}`,
        feedbackExtra: `Total: ${formatPrice(total)}`
    };
}

// ============ COLLEGE LEVEL GENERATORS ============

// Real-world data for college problems
const COLLEGE_DATA = {
    countries: [
        { name: 'USA', pop: 330e6, gdp: 25e12 },
        { name: 'China', pop: 1.4e9, gdp: 18e12 },
        { name: 'Japan', pop: 125e6, gdp: 4.2e12 },
        { name: 'Germany', pop: 83e6, gdp: 4.1e12 },
        { name: 'UK', pop: 67e6, gdp: 3.1e12 },
        { name: 'India', pop: 1.4e9, gdp: 3.4e12 },
        { name: 'France', pop: 67e6, gdp: 2.8e12 },
        { name: 'Brazil', pop: 215e6, gdp: 1.9e12 }
    ],
    scales: [
        { name: 'Earth\'s diameter', value: 12742, unit: 'km' },
        { name: 'Moon\'s diameter', value: 3474, unit: 'km' },
        { name: 'Sun\'s diameter', value: 1.4e6, unit: 'km' },
        { name: 'Earth-Moon distance', value: 384400, unit: 'km' },
        { name: 'Speed of light', value: 3e8, unit: 'm/s' },
        { name: 'Speed of sound', value: 343, unit: 'm/s' }
    ],
    fermiProblems: [
        {
            q: 'Piano tuners in Chicago',
            answer: 100,
            reasoning: `🏙️ FERMI ESTIMATION: PIANO TUNERS

STEP 1: Chicago population
• ~2.7 million people

STEP 2: Households with pianos
• ~1 million households
• ~5% own pianos = 50,000 pianos

STEP 3: Tunings needed per year
• Pianos tuned ~1×/year
• 50,000 tunings/year needed

STEP 4: Tuner capacity
• 4 tunings/day × 250 work days
• = 1,000 tunings/year per tuner

STEP 5: Calculate
• 50,000 ÷ 1,000 = 50-150 tuners

✅ RESULT: ~100 piano tuners`,
            sourceUrl: 'https://www.quantifiedintuitions.org/estimation-game'
        },
        {
            q: 'Golf balls that fit in a school bus',
            answer: 500000,
            reasoning: `🚌 FERMI ESTIMATION: GOLF BALLS IN BUS

STEP 1: School bus dimensions
• ~35ft × 8ft × 6ft (interior)
• Volume: ~1,680 cubic feet
• = ~2.9 million cubic inches

STEP 2: Golf ball size
• Diameter: 1.68 inches
• Volume: ~2.5 cubic inches

STEP 3: Packing efficiency
• Spheres pack at ~64% efficiency
• Usable space: 2.9M × 0.64 = 1.86M cu in

STEP 4: Calculate
• 1.86M ÷ 2.5 = ~750,000 balls
• Account for seats: ~500,000

✅ RESULT: ~500,000 golf balls`
        },
        {
            q: 'Gas stations in the USA',
            answer: 150000,
            reasoning: `⛽ FERMI ESTIMATION: US GAS STATIONS

STEP 1: US car count
• ~330 million people
• ~280 million registered vehicles

STEP 2: Fuel consumption
• Average: fill up every 1-2 weeks
• ~26 fill-ups/year per car

STEP 3: Station capacity
• Each pump: ~10 cars/day
• Average station: 8 pumps
• 80 fill-ups/day × 365 = 29,000/year

STEP 4: Calculate
• 280M cars × 26 fills = 7.3B fills/year
• 7.3B ÷ 29,000 = ~250,000 stations
• (Actual ~150,000 - some overlap)

✅ RESULT: ~150,000 gas stations`,
            sourceUrl: 'https://www.statista.com/statistics/525107/gas-stations-in-the-united-states/'
        },
        {
            q: 'Hair on a human head',
            answer: 100000,
            reasoning: `💇 FERMI ESTIMATION: HAIR COUNT

STEP 1: Scalp area
• Average head ~120 square inches
• Scalp with hair ~80-100 square inches

STEP 2: Hair density
• Hair follicles vary by color:
• Blonde: ~150/sq in (most)
• Brown: ~110/sq in
• Black: ~100/sq in
• Red: ~90/sq in (least)

STEP 3: Calculate
• ~100 sq in × ~1,000 hairs/sq in
• = ~100,000 hairs total

✅ RESULT: 80,000-150,000 hairs
(Average person: ~100,000)`
        },
        {
            q: 'Heartbeats in a lifetime (80 yrs)',
            answer: 3e9,
            reasoning: `❤️ FERMI ESTIMATION: LIFETIME HEARTBEATS

STEP 1: Heart rate
• Resting: ~60-80 bpm
• Average over day: ~70 bpm

STEP 2: Beats per day
• 70 × 60 min × 24 hr
• = 100,800 beats/day

STEP 3: Beats per year
• 100,800 × 365
• = ~37 million beats/year

STEP 4: Lifetime (80 years)
• 37M × 80 = ~3 billion beats

✅ RESULT: ~3,000,000,000 beats
That's 3 BILLION heartbeats!`
        },
        {
            q: 'Windows in New York City',
            answer: 20e6,
            reasoning: `🏙️ FERMI ESTIMATION: NYC WINDOWS

STEP 1: NYC buildings
• ~1 million buildings total
• Mix of houses and skyscrapers

STEP 2: Average windows per building
• Houses/small: ~10 windows
• Mid-size: ~50 windows
• Skyscrapers: ~5,000 windows
• Weighted average: ~20 windows

STEP 3: Calculate
• 1 million × 20 = 20 million windows

✅ RESULT: ~20 million windows`,
            sourceUrl: 'https://www.quantifiedintuitions.org/estimation-game'
        },
        {
            q: 'Hot dogs eaten at US baseball games per year',
            answer: 26e6,
            reasoning: `⚾ FERMI ESTIMATION: BASEBALL HOT DOGS

STEP 1: MLB attendance
• 30 teams × 81 home games = 2,430 games
• Average attendance: ~30,000
• Total: ~73 million fans/year

STEP 2: Hot dog purchase rate
• ~35% of fans buy hot dogs

STEP 3: Calculate
• 73M × 0.35 = ~26 million hot dogs

(Minor leagues add millions more!)

✅ RESULT: ~26 million hot dogs`,
            sourceUrl: 'https://www.nhdsc.org/hot-dog-history'
        },
        {
            q: 'Blades of grass in Central Park',
            answer: 50e9,
            reasoning: `🌿 FERMI ESTIMATION: CENTRAL PARK GRASS

STEP 1: Central Park area
• 843 acres total
• ~250 acres of grass/lawn
• = ~1 billion sq feet

STEP 2: Grass density
• ~6 grass blades per sq inch
• = ~860 blades per sq foot

STEP 3: Calculate (grassy areas only)
• 250 acres × 43,560 sq ft/acre
• = 10.9 million sq feet of grass
• × 5,000 blades/sq ft
• = ~50 billion blades

✅ RESULT: ~50 billion grass blades`
        }
    ]
};

function formatSciNotation(num) {
    if (num === 0) return '0';
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const mantissa = num / Math.pow(10, exp);
    if (exp === 0) return num.toFixed(1);
    return `${mantissa.toFixed(1)} × 10^${exp}`;
}

function formatLargeNumber(num) {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)} trillion`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)} billion`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)} million`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toFixed(0);
}

function formatCollegeNumber(num) {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    if (num >= 100) return Math.round(num).toLocaleString();
    return num.toFixed(1);
}

function generateCollegeProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    switch (problemConfig.type) {
        case 'sciMultiply':
            return generateSciMultiply(problemConfig);
        case 'sciDivide':
            return generateSciDivide(problemConfig);
        case 'perCapita':
            return generatePerCapita(problemConfig);
        case 'percentLarge':
            return generatePercentLarge(problemConfig);
        case 'ratioScale':
            return generateRatioScale(problemConfig);
        case 'fermi':
            return generateFermiProblem(problemConfig);
        case 'compoundInterest':
            return generateCompoundInterest(problemConfig);
        case 'exponentialGrowth':
            return generateExponentialGrowth(problemConfig);
        default:
            return generateSciMultiply(problemConfig);
    }
}

function generateSciMultiply(config) {
    // e.g., 3.2 × 10^6 × 4.1 × 10^3
    const m1 = roundNice(1 + Math.random() * 8);
    const e1 = randInt(3, 7);
    const m2 = roundNice(1 + Math.random() * 8);
    const e2 = randInt(2, 5);

    const num1 = m1 * Math.pow(10, e1);
    const num2 = m2 * Math.pow(10, e2);
    const answer = num1 * num2;

    const answerExp = Math.floor(Math.log10(answer));
    const scale = calculateCollegeScale(answer);

    return {
        text: `(${m1} × 10^${e1}) × (${m2} × 10^${e2}) ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label,
        feedbackExtra: `≈ ${formatSciNotation(answer)}`
    };
}

function generateSciDivide(config) {
    const m1 = roundNice(1 + Math.random() * 8);
    const e1 = randInt(8, 12);
    const m2 = roundNice(1 + Math.random() * 8);
    const e2 = randInt(3, 6);

    const num1 = m1 * Math.pow(10, e1);
    const num2 = m2 * Math.pow(10, e2);
    const answer = num1 / num2;

    const scale = calculateCollegeScale(answer);

    return {
        text: `(${m1} × 10^${e1}) ÷ (${m2} × 10^${e2}) ≈ ?`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label,
        feedbackExtra: `≈ ${formatSciNotation(answer)}`
    };
}

function generatePerCapita(config) {
    const country = randChoice(COLLEGE_DATA.countries);
    const answer = country.gdp / country.pop;
    const scale = calculateCollegeScale(answer);

    return {
        text: `${country.name}'s GDP (${formatLargeNumber(country.gdp)})\n÷ population (${formatLargeNumber(country.pop)})\n= GDP per capita?`,
        answer: roundNice(answer),
        min: scale.min,
        max: scale.max,
        label: config.label,
        feedbackExtra: `≈ $${formatLargeNumber(answer)} per person`
    };
}

function generatePercentLarge(config) {
    // e.g., 0.3% of 2.4 million
    const base = randChoice([1e6, 2.5e6, 10e6, 100e6, 1e9]);
    const percent = randChoice([0.1, 0.25, 0.5, 1, 2, 5]);
    const answer = base * percent / 100;

    const scale = calculateCollegeScale(answer);

    return {
        text: `${percent}% of ${formatLargeNumber(base)} = ?`,
        answer: roundNice(answer),
        min: scale.min,
        max: scale.max,
        label: config.label,
        feedbackExtra: `= ${formatLargeNumber(answer)}`
    };
}

function generateRatioScale(config) {
    const items = COLLEGE_DATA.scales;
    const item1 = randChoice(items);
    let item2 = randChoice(items);
    while (item2.name === item1.name) {
        item2 = randChoice(items);
    }

    const larger = item1.value > item2.value ? item1 : item2;
    const smaller = item1.value > item2.value ? item2 : item1;
    const answer = larger.value / smaller.value;

    const scale = calculateCollegeScale(answer);

    return {
        text: `${larger.name}\n÷ ${smaller.name}\n= ratio?`,
        answer: roundNice(answer),
        min: scale.min,
        max: scale.max,
        label: config.label,
        feedbackExtra: `${larger.value.toLocaleString()} ÷ ${smaller.value.toLocaleString()} ≈ ${answer.toFixed(1)}`
    };
}

function generateFermiProblem(config) {
    const problem = randChoice(COLLEGE_DATA.fermiProblems);
    const answer = problem.answer;
    const scale = calculateCollegeScale(answer);

    return {
        text: `Estimate:\n${problem.q}`,
        answer: answer,
        min: scale.min,
        max: scale.max,
        label: config.label,
        hint: 'Break it down: What do you need to know? Make reasonable assumptions for each step.',
        feedbackExtra: problem.reasoning,
        sourceUrl: problem.sourceUrl
    };
}

function generateCompoundInterest(config) {
    const principal = randChoice([1000, 5000, 10000, 50000]);
    const rate = randChoice([3, 4, 5, 6, 7, 8]) / 100;
    const years = randChoice([5, 10, 15, 20]);

    const answer = principal * Math.pow(1 + rate, years);
    const scale = { min: principal, max: Math.ceil(answer * 1.5 / 1000) * 1000 };

    return {
        text: `$${principal.toLocaleString()} at ${(rate * 100)}%/year\nfor ${years} years = ?`,
        answer: roundNice(answer),
        min: scale.min,
        max: scale.max,
        label: config.label,
        hint: `Rule of 72: money doubles in ~${Math.round(72 / (rate * 100))} years at ${(rate * 100)}%`,
        feedbackExtra: `= $${answer.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    };
}

function generateExponentialGrowth(config) {
    const start = randChoice([100, 500, 1000]);
    const doublingTime = randChoice([2, 3, 5, 7]);
    const days = doublingTime * randInt(2, 5);

    const doublings = days / doublingTime;
    const answer = start * Math.pow(2, doublings);
    const scale = calculateCollegeScale(answer);

    return {
        text: `Starts at ${start}, doubles every ${doublingTime} days.\nAfter ${days} days = ?`,
        answer: roundNice(answer),
        min: start,
        max: scale.max,
        label: config.label,
        hint: `Count doublings: ${days} ÷ ${doublingTime} = ${doublings} doublings`,
        feedbackExtra: `${doublings} doublings: ${start} × 2^${doublings} = ${answer.toLocaleString()}`
    };
}

function calculateCollegeScale(answer) {
    if (answer <= 100) return { min: 0, max: Math.ceil(answer * 2 / 10) * 10 };
    if (answer <= 1000) return { min: 0, max: Math.ceil(answer * 1.5 / 100) * 100 };
    if (answer <= 10000) return { min: 0, max: Math.ceil(answer * 1.5 / 1000) * 1000 };
    if (answer <= 100000) return { min: 0, max: Math.ceil(answer * 1.5 / 10000) * 10000 };
    if (answer <= 1e6) return { min: 0, max: Math.ceil(answer * 1.5 / 100000) * 100000 };
    if (answer <= 1e9) return { min: 0, max: Math.ceil(answer * 1.5 / 1e6) * 1e6 };
    return { min: 0, max: Math.ceil(answer * 1.5 / 1e9) * 1e9 };
}

// ============ REAL WORLD MODE DATA & GENERATORS ============
const REAL_WORLD_KIDS = [
    { q: 'How many teeth does an adult have?', answer: 32, emoji: '🦷', hint: 'Count your teeth!', sourceUrl: 'https://www.mouthhealthy.org/all-topics-a-z/eruption-charts' },
    { q: 'How many bones in a human body?', answer: 206, emoji: '🦴', hint: '206 bones total', sourceUrl: 'https://www.britannica.com/science/human-skeleton' },
    { q: 'How many days in a year?', answer: 365, emoji: '📅', hint: 'About 52 weeks' },
    { q: 'How many hours in a week?', answer: 168, emoji: '⏰', hint: '24 × 7' },
    { q: 'How many minutes in a day?', answer: 1440, emoji: '⏱️', hint: '60 × 24' },
    { q: 'How tall is a giraffe in feet?', answer: 18, emoji: '🦒', hint: 'Tallest animal!', sourceUrl: 'https://www.nationalgeographic.com/animals/mammals/facts/giraffe' },
    { q: 'How many legs does a spider have?', answer: 8, emoji: '🕷️', hint: 'More than 6!', sourceUrl: 'https://www.britannica.com/animal/spider-arachnid' },
    { q: 'How many players on a soccer team?', answer: 11, emoji: '⚽', hint: 'On the field', sourceUrl: 'https://www.fifa.com/technical/football-technology/law-3-the-players' },
    { q: 'How many strings on a guitar?', answer: 6, emoji: '🎸', hint: 'Standard guitar' },
    { q: 'How many continents are there?', answer: 7, emoji: '🌍', hint: 'Big land masses', sourceUrl: 'https://www.nationalgeographic.org/encyclopedia/continent/' },
    { q: 'How many planets in our solar system?', answer: 8, emoji: '🪐', hint: 'Sorry, Pluto!', sourceUrl: 'https://science.nasa.gov/solar-system/planets/' },
    { q: 'How many states in the USA?', answer: 50, emoji: '🇺🇸', hint: 'Stars on the flag' },
    { q: 'How many keys on a piano?', answer: 88, emoji: '🎹', hint: 'Black and white', sourceUrl: 'https://www.britannica.com/art/piano' },
    { q: 'How many ounces in a pound?', answer: 16, emoji: '⚖️', hint: 'Weight measure' },
    { q: 'How fast can a cheetah run (mph)?', answer: 70, emoji: '🐆', hint: 'Fastest land animal', sourceUrl: 'https://www.nationalgeographic.com/animals/mammals/facts/cheetah' },
    { q: 'How many colors in a rainbow?', answer: 7, emoji: '🌈', hint: 'ROY G BIV' },
    { q: 'How many holes on a golf course?', answer: 18, emoji: '⛳', hint: 'Full round' },
    { q: 'Average human heart beats per minute?', answer: 72, emoji: '❤️', hint: 'Feel your pulse', sourceUrl: 'https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse' },
];

const REAL_WORLD_ADULT = [
    { q: 'US population (millions)?', answer: 335, emoji: '🇺🇸', hint: '~330-340 million', sourceUrl: 'https://www.census.gov/popclock/' },
    { q: 'World population (billions)?', answer: 8, emoji: '🌍', hint: 'Hit 8B in 2022', sourceUrl: 'https://ourworldindata.org/world-population-growth' },
    { q: 'China population (billions)?', answer: 1.4, emoji: '🇨🇳', hint: 'Most populous country', sourceUrl: 'https://ourworldindata.org/grapher/population' },
    { q: 'Distance to the Moon (thousand miles)?', answer: 239, emoji: '🌙', hint: '~240,000 miles', sourceUrl: 'https://science.nasa.gov/moon/facts/' },
    { q: 'Speed of light (thousand miles/sec)?', answer: 186, emoji: '💡', hint: 'Very fast!', sourceUrl: 'https://www.nist.gov/si-redefinition/speed-light' },
    { q: 'Height of Everest (feet)?', answer: 29032, emoji: '🏔️', hint: 'Tallest mountain', sourceUrl: 'https://www.britannica.com/place/Mount-Everest' },
    { q: 'Depth of Mariana Trench (feet)?', answer: 36000, emoji: '🌊', hint: 'Deepest ocean', sourceUrl: 'https://oceanexplorer.noaa.gov/facts/mariana-trench.html' },
    { q: 'Year the US declared independence?', answer: 1776, emoji: '🗽', hint: 'July 4th' },
    { q: 'Number of countries in the world?', answer: 195, emoji: '🗺️', hint: 'UN members + 2', sourceUrl: 'https://www.un.org/en/about-us/member-states' },
    { q: 'Average US household income ($K)?', answer: 75, emoji: '💰', hint: 'Median ~$75K', sourceUrl: 'https://www.census.gov/library/publications/2023/demo/p60-279.html' },
    { q: 'US minimum wage ($/hour)?', answer: 7.25, emoji: '💵', hint: 'Federal minimum', sourceUrl: 'https://www.dol.gov/agencies/whd/minimum-wage' },
    { q: 'NYC population (millions)?', answer: 8.3, emoji: '🗽', hint: 'Biggest US city', sourceUrl: 'https://www.census.gov/quickfacts/newyorkcitynewyork' },
    { q: 'London population (millions)?', answer: 9, emoji: '🇬🇧', hint: 'UK capital', sourceUrl: 'https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates' },
    { q: 'Cost of Apollo program ($ billions)?', answer: 280, emoji: '🚀', hint: 'In 2023 dollars', sourceUrl: 'https://www.planetary.org/space-policy/cost-of-apollo' },
    // OWID (Our World in Data) sourced questions
    { q: 'Global life expectancy (years)?', answer: 73, emoji: '🌍', hint: 'Average worldwide in 2024', sourceUrl: 'https://ourworldindata.org/life-expectancy' },
    { q: 'Child mortality rate globally (deaths per 1000 births)?', answer: 38, emoji: '👶', hint: 'Under-5 mortality', sourceUrl: 'https://ourworldindata.org/child-mortality' },
    { q: 'Extreme poverty rate worldwide (%)?', answer: 8.5, emoji: '💵', hint: 'Living on <$2.15/day', sourceUrl: 'https://ourworldindata.org/extreme-poverty' },
    { q: 'Global CO2 emissions (billion tonnes/year)?', answer: 37, emoji: '🏭', hint: 'Fossil fuels + industry', sourceUrl: 'https://ourworldindata.org/co2-emissions' },
    { q: 'World literacy rate (%)?', answer: 87, emoji: '📚', hint: 'Adults who can read', sourceUrl: 'https://ourworldindata.org/literacy' },
    { q: 'Share of world using internet (%)?', answer: 66, emoji: '🌐', hint: 'Connected to web', sourceUrl: 'https://ourworldindata.org/internet' },
    { q: 'Global vaccination rate for measles (%)?', answer: 83, emoji: '💉', hint: 'Children vaccinated', sourceUrl: 'https://ourworldindata.org/vaccination' },
    { q: 'Renewable energy share globally (%)?', answer: 14, emoji: '🌱', hint: 'Of total energy', sourceUrl: 'https://ourworldindata.org/renewable-energy' },
    { q: 'Global average years of schooling?', answer: 8.7, emoji: '🎒', hint: 'Adults 25+', sourceUrl: 'https://ourworldindata.org/global-education' },
    { q: 'Share of population with electricity (%)?', answer: 91, emoji: '💡', hint: 'Global access', sourceUrl: 'https://ourworldindata.org/energy-access' },
];

const REAL_WORLD_PRICES = [
    { q: 'Gallon of milk ($)?', answer: 4.50, emoji: '🥛', hint: 'Grocery staple', sourceUrl: 'https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandmidwest_table.htm' },
    { q: 'Dozen eggs ($)?', answer: 4.00, emoji: '🥚', hint: 'Prices vary a lot!', sourceUrl: 'https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandmidwest_table.htm' },
    { q: 'Loaf of bread ($)?', answer: 3.50, emoji: '🍞', hint: 'Basic bread', sourceUrl: 'https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandmidwest_table.htm' },
    { q: 'Big Mac ($)?', answer: 5.50, emoji: '🍔', hint: 'McDonalds classic', sourceUrl: 'https://www.economist.com/big-mac-index' },
    { q: 'Movie ticket ($)?', answer: 12, emoji: '🎬', hint: 'Average price', sourceUrl: 'https://www.natoonline.org/data/ticket-price/' },
    { q: 'Gallon of gas ($)?', answer: 3.50, emoji: '⛽', hint: 'Varies by state', sourceUrl: 'https://gasprices.aaa.com/' },
    { q: 'Basic iPhone ($)?', answer: 800, emoji: '📱', hint: 'Latest model', sourceUrl: 'https://www.apple.com/shop/buy-iphone' },
    { q: 'Average new car ($K)?', answer: 48, emoji: '🚗', hint: 'US average 2024', sourceUrl: 'https://www.kbb.com/car-news/average-new-car-price/' },
    { q: 'Median US home price ($K)?', answer: 420, emoji: '🏠', hint: '2024 median', sourceUrl: 'https://fred.stlouisfed.org/series/MSPUS' },
    { q: 'College textbook ($)?', answer: 80, emoji: '📚', hint: 'One textbook' },
    { q: 'Netflix monthly ($)?', answer: 15, emoji: '📺', hint: 'Standard plan', sourceUrl: 'https://www.netflix.com/signup/planform' },
    { q: 'Cup of Starbucks coffee ($)?', answer: 5, emoji: '☕', hint: 'Grande latte' },
    { q: 'Pair of Nikes ($)?', answer: 110, emoji: '👟', hint: 'Average sneakers' },
    { q: 'Disneyland ticket ($)?', answer: 160, emoji: '🏰', hint: 'One day pass', sourceUrl: 'https://disneyland.disney.go.com/admission/tickets/' },
];

function generateRealWorldProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    switch (problemConfig.type) {
        case 'realWorldKid':
            return generateRealWorldKidProblem();
        case 'realWorldAdult':
            return generateRealWorldAdultProblem();
        case 'realWorldPrice':
            return generateRealWorldPriceProblem();
        default:
            return generateRealWorldKidProblem();
    }
}

function generateRealWorldKidProblem() {
    const fact = randChoice(REAL_WORLD_KIDS);
    const scale = calculateCollegeScale(fact.answer);

    return {
        text: fact.q,
        answer: fact.answer,
        min: 0,
        max: scale.max,
        label: 'Real World',
        visual: `${fact.emoji} Do you know?`,
        feedbackExtra: fact.hint,
        sourceUrl: fact.sourceUrl
    };
}

function generateRealWorldAdultProblem() {
    const fact = randChoice(REAL_WORLD_ADULT);
    const scale = calculateCollegeScale(fact.answer);

    return {
        text: fact.q,
        answer: fact.answer,
        min: 0,
        max: scale.max,
        label: 'World Facts',
        visual: `${fact.emoji} Think big!`,
        feedbackExtra: fact.hint,
        sourceUrl: fact.sourceUrl
    };
}

function generateRealWorldPriceProblem() {
    const item = randChoice(REAL_WORLD_PRICES);
    const scale = calculateCollegeScale(item.answer);

    return {
        text: item.q,
        answer: item.answer,
        min: 0,
        max: Math.max(scale.max, item.answer * 2),
        label: 'Price Check',
        visual: `${item.emoji} How much?`,
        feedbackExtra: item.hint,
        sourceUrl: item.sourceUrl
    };
}

// ============ MAGNITUDE MODE GENERATORS ============
// Magnitude comparisons - basic scale understanding
const MAGNITUDE_COMPARISONS = [
    { q: 'Seconds in an hour?', answer: 3600, context: 'Calc: 60 × 60 = 3,600', emoji: '⏰' },
    { q: 'Seconds in a day?', answer: 86400, context: 'Calc: 60 × 60 × 24 = 86,400', emoji: '📅' },
    { q: 'How many thousands in 1 million?', answer: 1000, context: '1,000,000 ÷ 1,000 = 1,000', emoji: '📊' },
    { q: 'How many millions in 1 billion?', answer: 1000, context: '1,000,000,000 ÷ 1,000,000 = 1,000', emoji: '💰' },
    { q: 'If you counted 1 number per second, hours to reach 10,000?', answer: 2.8, context: 'Calc: 10,000 ÷ 3,600 = 2.78 hours', emoji: '🔢' },
    { q: 'If 1 million seconds passed, how many days?', answer: 11.6, context: 'Calc: 1M ÷ 86,400 = 11.6 days', emoji: '📆' },
    { q: 'If 1 billion seconds passed, how many years?', answer: 31.7, context: 'Calc: 1B ÷ 31.5M sec/year ≈ 32 years', emoji: '🗓️' },
    { q: 'Minutes in a week?', answer: 10080, context: 'Calc: 60 × 24 × 7 = 10,080', emoji: '📆' },
];

// Magnitude scale - bigger picture with sources
const MAGNITUDE_SCALE = [
    { q: 'A million $100 bills weighs how many pounds?', answer: 22, hint: 'Calc: 10,000 bills × 1g each = 22 lbs (US Treasury)', emoji: '💵' },
    { q: 'A billion seconds ago, what year was it?', answer: 1993, hint: 'Calc: 2025 - 31.7 ≈ 1993', emoji: '📅' },
    { q: 'If you spent $1/second, days to spend $1 million?', answer: 11.6, hint: 'Calc: 1M ÷ 86,400 sec/day = 11.6 days', emoji: '💸' },
    { q: 'If you spent $1/second, years to spend $1 billion?', answer: 31.7, hint: 'Calc: 1B ÷ 31.5M sec/year ≈ 32 years!', emoji: '🤯' },
    { q: 'Stack of 1 million pennies in feet?', answer: 5000, hint: 'Calc: 1M × 0.06" = ~5,000 ft (nearly 1 mile!)', emoji: '🏔️' },
    { q: 'Grains of rice in a pound?', answer: 29000, hint: '~29,000 grains (long grain rice average)', emoji: '🍚' },
];

// Policy & Science comparisons - real world numbers with sources
const POLICY_COMPARISONS = [
    {
        q: 'US annual military budget is about how many billion $?',
        answer: 886,
        hint: 'DoD FY2024 = $886B',
        emoji: '🎖️',
        sourceUrl: 'https://www.defense.gov/About/Office-of-the-Secretary-of-Defense/Budget/'
    },
    {
        q: 'NASA annual budget is about how many billion $?',
        answer: 25,
        hint: 'NASA FY2024 = $25B',
        emoji: '🚀',
        sourceUrl: 'https://www.nasa.gov/budgets-plans-and-reports/'
    },
    {
        q: 'How many times bigger is military budget than NASA?',
        answer: 35,
        hint: 'Calc: $886B ÷ $25B ≈ 35×',
        emoji: '📊'
    },
    {
        q: 'US national debt is about how many trillion $?',
        answer: 34,
        hint: 'Treasury Dept 2024 = ~$34T',
        emoji: '💳',
        sourceUrl: 'https://fiscaldata.treasury.gov/americas-finance-guide/national-debt/'
    },
    {
        q: 'World population in billions?',
        answer: 8.1,
        hint: 'UN 2024 = ~8.1B people',
        emoji: '🌍',
        sourceUrl: 'https://ourworldindata.org/world-population-growth'
    },
    {
        q: 'US population in millions?',
        answer: 335,
        hint: 'Census 2024 = ~335M',
        emoji: '🇺🇸',
        sourceUrl: 'https://www.census.gov/popclock/'
    },
    {
        q: 'US healthcare spending per person per year ($)?',
        answer: 13000,
        hint: 'CMS 2023 = ~$13,000/person',
        emoji: '🏥',
        sourceUrl: 'https://www.cms.gov/research-statistics-data-and-systems/statistics-trends-and-reports/nationalhealthexpenddata'
    },
    {
        q: 'Average US household income ($)?',
        answer: 75000,
        hint: 'Census 2023 median = ~$75,000',
        emoji: '💰',
        sourceUrl: 'https://www.census.gov/library/publications/2023/demo/p60-279.html'
    },
    {
        q: 'CO2 in atmosphere (parts per million)?',
        answer: 425,
        hint: 'NOAA 2024 = ~425 ppm',
        emoji: '🌡️',
        sourceUrl: 'https://gml.noaa.gov/ccgg/trends/'
    },
    {
        q: 'Distance to Moon in thousands of miles?',
        answer: 239,
        hint: 'NASA = 238,900 miles average',
        emoji: '🌙',
        sourceUrl: 'https://science.nasa.gov/moon/facts/'
    },
    {
        q: 'Speed of light in thousands of miles per second?',
        answer: 186,
        hint: 'Physics constant = 186,282 mi/s',
        emoji: '💡',
        sourceUrl: 'https://www.nist.gov/si-redefinition/speed-light'
    },
    {
        q: 'Age of Earth in billions of years?',
        answer: 4.5,
        hint: 'Radiometric dating = 4.54B years',
        emoji: '🌏',
        sourceUrl: 'https://www.usgs.gov/special-topics/geologic-time/science/age-earth'
    },
];

function generateMagnitudeProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    if (problemConfig.type === 'magnitudeCompare') {
        const problem = randChoice(MAGNITUDE_COMPARISONS);
        const scale = calculateCollegeScale(problem.answer);
        return {
            text: problem.q,
            answer: problem.answer,
            min: 0,
            max: scale.max,
            label: 'Magnitude',
            visual: `${problem.emoji} Think about scale!`,
            feedbackExtra: problem.context
        };
    } else {
        // Mix of scale questions and policy/science comparisons
        const usePolicy = Math.random() < 0.5;
        if (usePolicy) {
            const problem = randChoice(POLICY_COMPARISONS);
            const scale = calculateCollegeScale(problem.answer);
            return {
                text: problem.q,
                answer: problem.answer,
                min: 0,
                max: scale.max,
                label: 'Real World',
                visual: `${problem.emoji} Policy & Science`,
                hint: problem.hint,
                feedbackExtra: problem.hint,
                sourceUrl: problem.sourceUrl
            };
        } else {
            const problem = randChoice(MAGNITUDE_SCALE);
            const scale = calculateCollegeScale(problem.answer);
            return {
                text: problem.q,
                answer: problem.answer,
                min: 0,
                max: scale.max,
                label: 'Big Numbers',
                visual: `${problem.emoji} Million vs Billion`,
                hint: problem.context || 'Think about the scale...',
                feedbackExtra: problem.hint
            };
        }
    }
}

// ============ TIME DETECTIVE MODE GENERATORS ============
const TIME_DAILY = [
    { q: 'If you sleep 9 hours, what % of your day is sleep?', answer: 37.5, hint: '9/24 = 37.5%', emoji: '😴' },
    { q: 'School is 6 hours. Minutes in school per day?', answer: 360, hint: '6 × 60', emoji: '🏫' },
    { q: 'If you get 2 hours screen time, minutes per week?', answer: 840, hint: '2 × 60 × 7', emoji: '📱' },
    { q: '30 min breakfast, 30 min lunch, 45 min dinner. Total eating minutes?', answer: 105, hint: 'Add them up!', emoji: '🍽️' },
    { q: 'If recess is 20 min twice a day, weekly recess hours?', answer: 3.3, hint: '40min × 5 days', emoji: '🎉' },
    { q: 'You brush teeth 2 min, twice daily. Hours per year?', answer: 24, hint: '4 min × 365 ÷ 60', emoji: '🪥' },
    { q: 'Reading 30 min/day for a year = how many hours?', answer: 182.5, hint: '30 × 365 ÷ 60', emoji: '📖' },
    { q: '8 hours sleep × 7 nights = hours sleeping weekly?', answer: 56, hint: '8 × 7', emoji: '🛏️' },
];

const TIME_LIFE = [
    { q: 'Hours in a year (approximate)?', answer: 8760, hint: '365 × 24', emoji: '📅' },
    { q: 'If you live 80 years, days alive?', answer: 29200, hint: '80 × 365', emoji: '🎂' },
    { q: 'Years of school (K-12)?', answer: 13, hint: 'K through 12th grade', emoji: '🎓' },
    { q: 'If school year is 180 days, total school days K-12?', answer: 2340, hint: '180 × 13', emoji: '📚' },
    { q: 'Hours spent in school K-12 (6hr days)?', answer: 14040, hint: '2340 × 6', emoji: '⏰' },
    { q: 'If you sleep 8hrs/day, years asleep by age 75?', answer: 25, hint: '1/3 of your life!', emoji: '😴' },
    { q: 'Heartbeats in a day (70 bpm)?', answer: 100800, hint: '70 × 60 × 24', emoji: '❤️' },
    { q: 'How many weekends in a year?', answer: 52, hint: '52 weeks', emoji: '🎊' },
    { q: 'Summer vacation days (typical)?', answer: 75, hint: '~10-11 weeks', emoji: '☀️' },
];

function generateTimeProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    if (problemConfig.type === 'timeDaily') {
        const problem = randChoice(TIME_DAILY);
        const scale = calculateCollegeScale(problem.answer);
        return {
            text: problem.q,
            answer: problem.answer,
            min: 0,
            max: scale.max,
            label: 'Daily Time',
            visual: `${problem.emoji} Your Day`,
            feedbackExtra: problem.hint
        };
    } else {
        const problem = randChoice(TIME_LIFE);
        const scale = calculateCollegeScale(problem.answer);
        return {
            text: problem.q,
            answer: problem.answer,
            min: 0,
            max: scale.max,
            label: 'Lifetime',
            visual: `${problem.emoji} Big Picture`,
            feedbackExtra: problem.hint
        };
    }
}

// ============ FRIENDS & COMBINATIONS MODE ============

// Helper: Generate emoji connection diagram
function generateConnectionDiagram(n) {
    // Create visual showing people with connecting lines
    const people = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, n);

    if (n === 3) {
        // Triangle: A-B-C with all connections
        return `    👤A
   ╱  ╲
  ╱    ╲
👤B━━━━👤C

3 connections: A━B, A━C, B━C`;
    }

    if (n === 4) {
        // Square with diagonals
        return `👤A━━━━━👤B
 ┃╲    ╱┃
 ┃  ╲╱  ┃
 ┃  ╱╲  ┃
 ┃╱    ╲┃
👤D━━━━━👤C

6 connections: sides + diagonals`;
    }

    if (n === 5) {
        // Pentagon description
        return `    👤A
   ╱ ╲ ╲
  👤E   👤B
   ╲   ╳   ╱
    👤D━👤C

10 connections total`;
    }

    if (n === 6) {
        // Two rows
        return `👤A━👤B━👤C
 ╲ ╳ ╱╲ ╳ ╱
👤D━👤E━👤F

15 connections total`;
    }

    // For larger n, show a simpler representation
    const peopleRow = people.map(p => `👤${p}`).join('━');
    return `${peopleRow}\n(all ${(n * (n - 1)) / 2} pairs connected)`;
}

// Helper: Generate visual explanation for combinations
function generatePairsVisual(n, emoji) {
    // Create a visual showing each person's connections
    // For n=4: A-B, A-C, A-D, B-C, B-D, C-D = 6 pairs
    const letters = 'ABCDEFGHIJ'.split('').slice(0, n);
    const pairs = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            pairs.push(`${letters[i]}-${letters[j]}`);
        }
    }
    return pairs.join(', ');
}

// Helper: Show the "triangle number" pattern visually
function triangleExplanation(n) {
    // Person 1 meets: 2,3,4,5 (n-1 people)
    // Person 2 meets: 3,4,5 (n-2 people, since already met 1)
    // etc.
    const steps = [];
    for (let i = 1; i < n; i++) {
        steps.push(n - i);
    }
    return steps.join(' + ') + ' = ' + steps.reduce((a, b) => a + b, 0);
}

function generateFriendsProblem(level) {
    // More varied and relatable scenarios for kids
    const problemTypes = [
        'handshakes', 'highFives', 'hugs', 'selfies', 'games',
        'phoneCalls', 'teams', 'pizzaSlices', 'stickers'
    ];
    const type = randChoice(problemTypes);

    const n = randInt(4, 10); // Wider range for more challenge

    // For combination problems, use much wider range to make it harder
    // People often guess n×n or n×(n-1), so include those as decoys
    const combinationMax = n * n; // Much wider than answer×2

    switch (type) {
        case 'handshakes': {
            const answer = (n * (n - 1)) / 2;
            const pairsVisual = generatePairsVisual(n, '🤝');
            const triangle = triangleExplanation(n);
            const diagram = generateConnectionDiagram(n);
            return {
                text: `${n} friends meet. Everyone shakes hands with everyone else ONCE. Total handshakes?`,
                answer: answer,
                min: 0,
                max: combinationMax,
                label: 'Friend Math',
                visual: `🤝 ${n} people: ${'👤'.repeat(n)}`,
                feedbackExtra: `Formula: n(n-1)/2 = ${n}×${n-1}÷2 = ${answer}\n\n📊 CONNECTION DIAGRAM:\n${diagram}\n\nCount each person's new handshakes:\n${triangle}\n\nAll pairs: ${pairsVisual}`
            };
        }
        case 'highFives': {
            const answer = (n * (n - 1)) / 2;
            const triangle = triangleExplanation(n);
            const diagram = generateConnectionDiagram(n);
            return {
                text: `${n} teammates celebrate! Each high-fives everyone else ONCE. Total high-fives?`,
                answer: answer,
                min: 0,
                max: combinationMax,
                label: 'Friend Math',
                visual: `🙌 ${n} teammates: ${'👤'.repeat(n)}`,
                feedbackExtra: `Formula: n(n-1)/2 = ${n}×${n-1}÷2 = ${answer}\n\n📊 CONNECTION DIAGRAM:\n${diagram}\n\nThink: ${triangle}`
            };
        }
        case 'hugs': {
            const answer = (n * (n - 1)) / 2;
            const pairsVisual = generatePairsVisual(n, '🫂');
            const diagram = generateConnectionDiagram(n);
            return {
                text: `At a party, ${n} friends each hug everyone else ONCE. How many total hugs?`,
                answer: answer,
                min: 0,
                max: combinationMax,
                label: 'Friend Math',
                visual: `🫂 ${n} friends hugging: ${'👤'.repeat(n)}`,
                feedbackExtra: `Formula: n(n-1)/2 = ${n}×${n-1}÷2 = ${answer}\n\n📊 CONNECTION DIAGRAM:\n${diagram}\n\nPairs: ${pairsVisual}`
            };
        }
        case 'selfies': {
            const answer = (n * (n - 1)) / 2;
            return {
                text: `${n} friends take pair selfies (each pair takes ONE photo together). How many photos?`,
                answer: answer,
                min: 0,
                max: combinationMax,
                label: 'Friend Math',
                visual: `📸 ${n} friends: ${'👤'.repeat(n)}`,
                feedbackExtra: `Formula: n(n-1)/2 = ${n}×${n-1}÷2 = ${answer}\n\n⚠️ Common mistake: ${n}×${n}=${n*n} counts each pair TWICE!`
            };
        }
        case 'games': {
            const answer = (n * (n - 1)) / 2;
            const triangle = triangleExplanation(n);
            const diagram = generateConnectionDiagram(n);
            return {
                text: `${n} kids in a tournament. Everyone plays everyone ONCE. Total games?`,
                answer: answer,
                min: 0,
                max: combinationMax,
                label: 'Tournament',
                visual: `♟️ ${n}-player tournament: ${'👤'.repeat(n)}`,
                feedbackExtra: `Formula: n(n-1)/2 = ${n}×${n-1}÷2 = ${answer}\n\n📊 CONNECTION DIAGRAM:\n${diagram}\n\nPlayer 1 plays ${n-1}, Player 2 plays ${n-2} NEW...\n${triangle}`
            };
        }
        case 'phoneCalls': {
            // Each person calls each other (order matters - A calls B ≠ B calls A)
            const answer = n * (n - 1);
            return {
                text: `${n} friends each CALL every other friend once. (A calling B ≠ B calling A). Total calls?`,
                answer: answer,
                min: 0,
                max: n * n + 10,
                label: 'Ordered Pairs',
                visual: `📱 ${n} friends calling: ${'👤'.repeat(n)}`,
                feedbackExtra: `Formula: n×(n-1) = ${n}×${n-1} = ${answer}\n\n⚠️ This is DIFFERENT from handshakes!\nEach of ${n} people makes ${n-1} calls.`
            };
        }
        case 'teams': {
            const answer = (n * (n - 1)) / 2;
            const visual = generatePairsVisual(n, '⚽');
            return {
                text: `Pick 2 players from ${n} kids for doubles tennis. How many DIFFERENT pairs possible?`,
                answer: answer,
                min: 0,
                max: combinationMax,
                label: 'Combinations',
                visual: `🎾 Picking 2 from ${n}: ${'👤'.repeat(n)}`,
                feedbackExtra: `Formula: n(n-1)/2 = ${n}×${n-1}÷2 = ${answer}\n\nPossible pairs:\n${visual}`
            };
        }
        case 'pizzaSlices': {
            const slices = randChoice([8, 10, 12, 16]);
            const answer = Math.floor(slices / n);
            const leftover = slices % n;
            return {
                text: `${slices} pizza slices shared equally among ${n} friends. Slices EACH?`,
                answer: answer,
                min: 0,
                max: slices,
                label: 'Fair Share',
                visual: `🍕 ${'🍕'.repeat(Math.min(slices, 8))}${slices > 8 ? '...' : ''}`,
                feedbackExtra: `${slices} ÷ ${n} = ${answer} each${leftover > 0 ? ` (with ${leftover} left over!)` : ' (exactly!)'}`
            };
        }
        case 'stickers': {
            const stickers = randInt(15, 30);
            const answer = Math.floor(stickers / n);
            const leftover = stickers % n;
            return {
                text: `${stickers} stickers shared among ${n} kids equally. How many EACH?`,
                answer: answer,
                min: 0,
                max: Math.ceil(stickers / 2),
                label: 'Fair Share',
                visual: `⭐ ${stickers} stickers → ${n} kids`,
                feedbackExtra: `${stickers} ÷ ${n} = ${answer} each${leftover > 0 ? ` (${leftover} remaining)` : ''}`
            };
        }
        default: {
            const answer = (n * (n - 1)) / 2;
            return {
                text: `${n} friends pair up. How many UNIQUE pairs?`,
                answer: answer,
                min: 0,
                max: combinationMax,
                label: 'Friend Math',
                visual: `👫 Making pairs from ${n} people`,
                feedbackExtra: `Formula: n(n-1)/2 = ${n}×${n-1}÷2 = ${answer}`
            };
        }
    }
}

// ============ PUZZLERS MODE GENERATORS ============
// Helper functions for puzzler calculations
function factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function fibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

function triangularNumber(n) {
    return (n * (n + 1)) / 2;
}

function gridPaths(m, n) {
    // Number of paths from (0,0) to (m,n) moving only right or down
    // = C(m+n, m) = (m+n)! / (m! * n!)
    return factorial(m + n) / (factorial(m) * factorial(n));
}

function birthdayProbability(n) {
    // Probability that at least 2 people share a birthday
    // P = 1 - (365/365)(364/365)...(365-n+1/365)
    if (n >= 365) return 100;
    let prob = 1;
    for (let i = 0; i < n; i++) {
        prob *= (365 - i) / 365;
    }
    return Math.round((1 - prob) * 100);
}

function generatePuzzlersProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    switch (problemConfig.type) {
        case 'triangular':
            return generateTriangularProblem();
        case 'fibonacci':
            return generateFibonacciProblem();
        case 'gridPaths':
            return generateGridPathsProblem();
        case 'towerHanoi':
            return generateTowerHanoiProblem();
        case 'factorials':
            return generateFactorialProblem();
        case 'birthday':
            return generateBirthdayProblem();
        case 'diceProb':
            return generateDiceProblem();
        default:
            return generateTriangularProblem();
    }
}

function generateTriangularProblem() {
    const n = randInt(5, 15);
    const answer = triangularNumber(n);

    const visual = `🔺 ${Array(Math.min(n, 5)).fill(0).map((_, i) => '●'.repeat(i + 1)).join(' + ')}${n > 5 ? '...' : ''}`;

    return {
        text: `What is 1 + 2 + 3 + ... + ${n}?`,
        answer: answer,
        min: 0,
        max: Math.ceil(answer * 1.5),
        label: 'Triangular Numbers',
        visual: visual,
        feedbackExtra: `🔢 TRIANGULAR NUMBERS:\nFormula: n(n+1)/2 = ${n}×${n+1}÷2 = ${answer}\n\nVisual:\n● (1)\n●● (2)\n●●● (3)\n... up to ${n}\n\nGauss's trick: Pair 1+${n}, 2+${n-1}, 3+${n-2}...\nYou get ${Math.floor(n/2)} pairs of ${n+1}${n % 2 === 1 ? ` + middle number ${Math.ceil(n/2)}` : ''}`
    };
}

function generateFibonacciProblem() {
    const n = randInt(8, 15);
    const answer = fibonacci(n);

    // Generate first few Fibonacci numbers for hint
    const sequence = [0, 1];
    for (let i = 2; i <= Math.min(n, 10); i++) {
        sequence.push(sequence[i-1] + sequence[i-2]);
    }

    return {
        text: `What is the ${n}th Fibonacci number? (Starting 0, 1, 1, 2, 3, 5...)`,
        answer: answer,
        min: 0,
        max: Math.ceil(answer * 1.5),
        label: 'Fibonacci',
        visual: `🌀 0 → 1 → 1 → 2 → 3 → 5 → 8 → ...`,
        hint: `Each number = sum of previous two`,
        feedbackExtra: `🌀 FIBONACCI SEQUENCE:\nEach number = previous two added together\n\nSequence: ${sequence.slice(0, Math.min(n+1, 11)).join(', ')}${n > 10 ? '...' : ''}\n\n${n}th number = ${answer}\n\n🐚 Fun fact: Fibonacci appears in nature (shells, flowers, pinecones)!`,
        sourceUrl: 'https://www.britannica.com/science/Fibonacci-number'
    };
}

function generateGridPathsProblem() {
    const m = randInt(2, 4);
    const n = randInt(2, 4);
    const answer = gridPaths(m, n);

    // Create a visual grid
    let gridVisual = '';
    for (let i = 0; i <= n; i++) {
        gridVisual += (i === 0 ? 'A' : '●') + '─●'.repeat(m) + (i === n ? 'B' : '') + '\n';
        if (i < n) gridVisual += '│ '.repeat(m + 1) + '\n';
    }

    return {
        text: `On a ${m}×${n} grid, how many paths from A to B? (Only move right ➡️ or down ⬇️)`,
        answer: answer,
        min: 0,
        max: Math.ceil(answer * 2),
        label: 'Grid Paths',
        visual: `🗺️ ${m}×${n} grid (right & down only)`,
        hint: `Think: ${m} rights and ${n} downs in some order`,
        feedbackExtra: `🗺️ GRID PATH COUNTING:\n\nYou need exactly ${m} rights (→) and ${n} downs (↓)\nTotal moves: ${m + n}\n\nFormula: Choose which ${m} moves are "right"\nC(${m+n}, ${m}) = ${m+n}! / (${m}! × ${n}!) = ${answer}\n\nAlternatively: Fill grid with path counts\n(Each cell = sum of left + above)`,
        sourceUrl: 'https://www.mathsisfun.com/combinatorics/combinations-permutations.html'
    };
}

function generateTowerHanoiProblem() {
    const n = randInt(3, 7);
    const answer = Math.pow(2, n) - 1;

    return {
        text: `Tower of Hanoi: Minimum moves to transfer ${n} disks?`,
        answer: answer,
        min: 0,
        max: Math.ceil(answer * 1.5),
        label: 'Tower of Hanoi',
        visual: `🗼 ${n} disks: ${'🔴'.repeat(Math.min(n, 5))}${n > 5 ? '...' : ''}`,
        hint: `Pattern: moves doubles for each extra disk`,
        feedbackExtra: `🗼 TOWER OF HANOI:\n\nRules: Move disks one at a time, never put larger on smaller\n\nPattern:\n1 disk = 1 move\n2 disks = 3 moves\n3 disks = 7 moves\n4 disks = 15 moves\n...\n\nFormula: 2ⁿ - 1 = 2^${n} - 1 = ${Math.pow(2, n)} - 1 = ${answer}\n\n🤯 64 disks (legend) = 18 quintillion moves!\nAt 1/sec = 585 billion years!`,
        sourceUrl: 'https://www.britannica.com/topic/Tower-of-Hanoi'
    };
}

function generateFactorialProblem() {
    const n = randInt(4, 8);
    const answer = factorial(n);

    const expansion = Array.from({length: n}, (_, i) => n - i).join(' × ');

    return {
        text: `What is ${n}! (${n} factorial)?`,
        answer: answer,
        min: 0,
        max: Math.ceil(answer * 1.5),
        label: 'Factorials',
        visual: `❗ ${n}! = ${n} × ${n-1} × ${n-2} × ...`,
        feedbackExtra: `❗ FACTORIAL:\n${n}! = ${expansion} = ${answer}\n\n📊 Factorials grow VERY fast:\n1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n6! = 720\n7! = 5,040\n8! = 40,320\n\n🎯 Use: Counting arrangements\n${n} people in a line = ${n}! = ${answer} ways`
    };
}

function generateBirthdayProblem() {
    const n = randChoice([10, 15, 20, 23, 25, 30, 40, 50]);
    const answer = birthdayProbability(n);

    return {
        text: `In a room of ${n} people, what's the % chance at least 2 share a birthday?`,
        answer: answer,
        min: 0,
        max: 100,
        label: 'Birthday Paradox',
        visual: `🎂 ${n} people in a room`,
        hint: `It's higher than most people guess!`,
        feedbackExtra: `🎂 BIRTHDAY PARADOX:\n\n${n} people → ${answer}% chance of shared birthday!\n\n🤯 Surprising results:\n• 23 people → 50% chance\n• 50 people → 97% chance\n• 70 people → 99.9% chance\n\nWhy? We're checking ALL pairs:\n${n} people = ${(n * (n-1)) / 2} different pairs to compare!\n\nThis is a famous example of why human intuition about probability is often wrong.`,
        sourceUrl: 'https://www.scientificamerican.com/article/bring-science-home-probability-birthday-paradox/'
    };
}

function generateDiceProblem() {
    const type = randChoice(['sum', 'atLeastOne', 'both']);

    if (type === 'sum') {
        const target = randChoice([7, 8, 9, 10, 11]);
        // Ways to make each sum with 2 dice
        const waysToSum = {7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1};
        const ways = waysToSum[target];
        const answer = Math.round((ways / 36) * 100);

        return {
            text: `Roll 2 dice. What's the % chance of getting sum = ${target}?`,
            answer: answer,
            min: 0,
            max: 50,
            label: 'Dice Probability',
            visual: `🎲🎲 Sum = ${target}?`,
            feedbackExtra: `🎲 DICE PROBABILITY:\n\n2 dice = 36 possible outcomes\n\nWays to make ${target}:\n${target === 7 ? '(1,6) (2,5) (3,4) (4,3) (5,2) (6,1) = 6 ways' :
                target === 8 ? '(2,6) (3,5) (4,4) (5,3) (6,2) = 5 ways' :
                target === 9 ? '(3,6) (4,5) (5,4) (6,3) = 4 ways' :
                target === 10 ? '(4,6) (5,5) (6,4) = 3 ways' : '(5,6) (6,5) = 2 ways'}\n\nP(sum=${target}) = ${ways}/36 ≈ ${answer}%\n\n💡 7 is most likely (6 ways), 2 and 12 least likely (1 way each)`
        };
    } else if (type === 'atLeastOne') {
        const target = randInt(1, 6);
        // P(at least one n) = 1 - P(no n) = 1 - (5/6)^2
        const answer = Math.round((1 - Math.pow(5/6, 2)) * 100);

        return {
            text: `Roll 2 dice. What's the % chance of getting at least one ${target}?`,
            answer: answer,
            min: 0,
            max: 60,
            label: 'Dice Probability',
            visual: `🎲🎲 At least one ${target}?`,
            feedbackExtra: `🎲 "AT LEAST ONE" TRICK:\n\nEasier to calculate the opposite!\n\nP(no ${target}) = (5/6) × (5/6) = 25/36\n\nP(at least one ${target}) = 1 - 25/36 = 11/36 ≈ ${answer}%\n\n💡 This "complement" trick works for many probability problems!`
        };
    } else {
        // Both dice same number
        const answer = Math.round((6/36) * 100);

        return {
            text: `Roll 2 dice. What's the % chance both show the SAME number (doubles)?`,
            answer: answer,
            min: 0,
            max: 40,
            label: 'Dice Probability',
            visual: `🎲🎲 Doubles?`,
            feedbackExtra: `🎲 DOUBLES:\n\nDoubles: (1,1) (2,2) (3,3) (4,4) (5,5) (6,6)\n= 6 ways out of 36\n\nP(doubles) = 6/36 = 1/6 ≈ ${answer}%\n\n💡 First die can be anything (6 options)\nSecond die must match = 1/6 chance`
        };
    }
}

// ============ FALLACIES & SCAMS MODE GENERATORS ============
function generateFallaciesProblem(level) {
    const config = LEVELS[level];
    const problemConfig = randChoice(config.problems);

    switch (problemConfig.type) {
        case 'gambler':
            return generateGamblerFallacyProblem();
        case 'baseRate':
            return generateBaseRateProblem();
        case 'lottery':
            return generateLotteryProblem();
        case 'mlm':
            return generateMLMProblem();
        case 'fakeDiscount':
            return generateFakeDiscountProblem();
        case 'compound':
            return generateHiddenCostsProblem();
        case 'survivalBias':
            return generateSurvivalBiasProblem();
        case 'cherryPick':
            return generateCherryPickProblem();
        case 'correlation':
            return generateCorrelationProblem();
        default:
            return generateGamblerFallacyProblem();
    }
}

function generateGamblerFallacyProblem() {
    const scenarios = [
        {
            text: `A fair coin lands HEADS 9 times in a row. What's the % chance the NEXT flip is heads?`,
            answer: 50,
            explanation: `🎰 GAMBLER'S FALLACY:\n\nThe coin doesn't "remember" previous flips!\n\nEach flip is INDEPENDENT.\nP(heads) = 50%, always.\n\n⚠️ Common mistake: "It's DUE for tails!"\nBut the coin has no memory.\n\nCasinos LOVE this fallacy!`
        },
        {
            text: `Roulette wheel hits RED 8 times in a row. What's the % chance next spin is RED? (Assume fair wheel with equal red/black)`,
            answer: 50,
            explanation: `🎰 GAMBLER'S FALLACY:\n\nPast spins don't affect future spins!\n\nEach spin is INDEPENDENT.\nP(red) = 50% (on a fair wheel)\n\n⚠️ "RED is hot!" or "BLACK is due!"\nBoth are wrong. The wheel has no memory.`
        },
        {
            text: `A slot machine hasn't paid out in 50 spins. Compared to a fresh machine, is your chance of winning HIGHER, LOWER, or SAME? (Enter 50 for same, >50 for higher, <50 for lower)`,
            answer: 50,
            explanation: `🎰 GAMBLER'S FALLACY:\n\nSlot machines use RNG (random number generators).\nEach spin is completely independent!\n\n⚠️ "This machine is DUE to pay!"\n⚠️ "This machine is HOT!"\nBoth are myths. Machines have no memory.\n\n💸 Casinos profit from this belief!`
        }
    ];

    const scenario = randChoice(scenarios);
    return {
        text: scenario.text,
        answer: scenario.answer,
        min: 0,
        max: 100,
        label: "Gambler's Fallacy",
        visual: `🎰 Think carefully...`,
        feedbackExtra: scenario.explanation,
        sourceUrl: 'https://www.britannica.com/science/gamblers-fallacy'
    };
}

function generateBaseRateProblem() {
    // False positive paradox / base rate neglect
    const scenarios = [
        {
            text: `A test for a rare disease (1 in 1000 people) is 99% accurate. You test positive. What's the % chance you actually HAVE the disease?`,
            answer: 9,
            explanation: `🏥 BASE RATE NEGLECT:\n\nSeems like 99%, right? WRONG!\n\nOut of 1000 people:\n• 1 has disease → tests positive (true positive)\n• 999 healthy → ~10 test positive (false positives)\n\n11 positive tests, only 1 has disease!\nP(disease|positive) ≈ 1/11 ≈ 9%\n\n💡 Always consider how RARE the condition is!`,
            sourceUrl: 'https://www.ncbi.nlm.nih.gov/books/NBK63647/'
        },
        {
            text: `Airport scanner is 95% accurate at detecting contraband. Only 0.1% of bags have contraband. If flagged, what's the % chance there's actually contraband?`,
            answer: 2,
            explanation: `🛃 BASE RATE NEGLECT:\n\nPer 10,000 bags:\n• 10 have contraband → ~9.5 caught (95%)\n• 9,990 clean → ~500 false alarms (5%)\n\nTotal flagged: ~509.5\nActual contraband: ~9.5\n\nP(contraband|flagged) ≈ 9.5/509.5 ≈ 2%\n\n💡 When something is RARE, even accurate tests produce many false positives!`
        }
    ];

    const scenario = randChoice(scenarios);
    return {
        text: scenario.text,
        answer: scenario.answer,
        min: 0,
        max: 100,
        label: 'Base Rate Neglect',
        visual: `📊 Watch out for base rates!`,
        feedbackExtra: scenario.explanation,
        sourceUrl: scenario.sourceUrl || 'https://en.wikipedia.org/wiki/Base_rate_fallacy'
    };
}

function generateLotteryProblem() {
    const scenarios = [
        {
            text: `Powerball odds are 1 in 292 million. If you play every day for 80 years, about how many DAYS would you expect to win?`,
            answer: 0,
            max: 10,
            explanation: `🎟️ LOTTERY MATH:\n\n80 years = ~29,200 days\nOdds: 1 in 292,000,000\n\nExpected wins = 29,200 / 292,000,000\n= 0.0001 wins\n\n💸 You'd need to play for ~10,000 LIFETIMES to expect ONE win!\n\n⚠️ Lottery is a tax on people bad at math.`
        },
        {
            text: `You play 1-2-3-4-5-6 in the lottery. Your friend plays random numbers. Whose odds are better? (Enter 50 for equal, >50 if yours is better, <50 if friend's is better)`,
            answer: 50,
            explanation: `🎟️ LOTTERY FALLACY:\n\nBoth have EXACTLY the same odds!\n\n1-2-3-4-5-6 seems "special" but it's just as likely as any other combination.\n\n⚠️ Your brain sees patterns where there are none.\n\n💡 Every combination has the same tiny, tiny chance.`
        },
        {
            text: `You've played the same lottery numbers for 10 years without winning. Compared to someone playing for the first time today, are your odds better (>50), worse (<50), or same (50)?`,
            answer: 50,
            explanation: `🎟️ SUNK COST + GAMBLER'S FALLACY:\n\nYour odds are EXACTLY THE SAME as a first-time player!\n\n⚠️ "I've invested so much, I can't quit now!"\nThis is the SUNK COST FALLACY.\n\n⚠️ "I'm due to win after all this time!"\nThis is the GAMBLER'S FALLACY.\n\nPast tickets don't affect future draws.`
        }
    ];

    const scenario = randChoice(scenarios);
    return {
        text: scenario.text,
        answer: scenario.answer,
        min: 0,
        max: scenario.max || 100,
        label: 'Lottery Math',
        visual: `🎟️ Calculate the real odds!`,
        feedbackExtra: scenario.explanation,
        sourceUrl: 'https://www.powerball.com/games/powerball'
    };
}

function generateMLMProblem() {
    const levels = randInt(4, 7);
    const recruitsPerPerson = randChoice([4, 5, 6]);
    const totalAtLevel = Math.pow(recruitsPerPerson, levels);

    return {
        text: `MLM scheme: Each person recruits ${recruitsPerPerson} people. At level ${levels}, how many total people are needed?`,
        answer: totalAtLevel,
        min: 0,
        max: Math.ceil(totalAtLevel * 1.5),
        label: 'MLM Math',
        visual: `📈 Exponential growth!`,
        feedbackExtra: `💸 MLM PYRAMID MATH:\n\nLevel 1: ${recruitsPerPerson}\nLevel 2: ${recruitsPerPerson}² = ${Math.pow(recruitsPerPerson, 2)}\nLevel 3: ${recruitsPerPerson}³ = ${Math.pow(recruitsPerPerson, 3)}\n...\nLevel ${levels}: ${recruitsPerPerson}^${levels} = ${totalAtLevel.toLocaleString()}\n\n🤯 At level 13 with ${recruitsPerPerson} recruits each:\n${Math.pow(recruitsPerPerson, 13).toLocaleString()} people needed!\n(More than world population by level 15!)\n\n⚠️ 99% of MLM participants LOSE money.`,
        sourceUrl: 'https://www.ftc.gov/business-guidance/resources/multi-level-marketing-businesses-pyramid-schemes'
    };
}

function generateFakeDiscountProblem() {
    const original = randChoice([40, 50, 60, 80, 100]);
    const markup = randChoice([50, 60, 75, 100]); // percent
    const discount = randChoice([30, 40, 50]); // percent

    const markedUp = original * (1 + markup/100);
    const finalPrice = markedUp * (1 - discount/100);
    const actualDiscount = Math.round((1 - finalPrice/original) * 100);

    return {
        text: `Store marks up a $${original} item by ${markup}%, then has a "${discount}% OFF SALE!" What % are you ACTUALLY saving from the original price?`,
        answer: actualDiscount,
        min: -50,
        max: 60,
        label: 'Fake Discounts',
        visual: `🏷️ ${discount}% OFF! (Or is it?)`,
        feedbackExtra: `🏷️ FAKE DISCOUNT TRICK:\n\nOriginal: $${original}\nMarked up ${markup}%: $${markedUp.toFixed(2)}\n"${discount}% off" sale: $${finalPrice.toFixed(2)}\n\nActual change from original:\n${actualDiscount > 0 ? 'Saving' : 'PAYING MORE'} ${Math.abs(actualDiscount)}%!\n\n⚠️ Stores often raise prices before "sales"\n💡 Track prices before buying on "sale"`,
        sourceUrl: 'https://www.ftc.gov/news-events/topics/consumer-protection'
    };
}

function generateHiddenCostsProblem() {
    const scenarios = [
        {
            text: `Credit card charges 24% APR. You keep $1000 balance for 1 year. How much interest do you pay? (compound monthly)`,
            answer: 268,
            explanation: `💳 COMPOUND INTEREST TRAP:\n\n24% APR = 2% monthly\n\n$1000 × (1.02)^12 = $1,268.24\nInterest paid: $268.24\n\n⚠️ That's MORE than simple 24%!\n(Simple would be $240)\n\n💡 Compounding works FOR you in savings,\nbut AGAINST you in debt!`
        },
        {
            text: `"Only $99/month for 24 months!" What's the TRUE total cost of this $1,499 item?`,
            answer: 2376,
            explanation: `💸 PAYMENT PLAN MATH:\n\n$99 × 24 = $2,376\n\nThat's $877 MORE than $1,499!\n(58% extra!)\n\n⚠️ "Easy monthly payments" often hide huge markups.\n💡 Always calculate: monthly × months`
        },
        {
            text: `A gym charges $10/month with $50 annual fee. You go 20 times per year. What's your ACTUAL cost per visit in $?`,
            answer: 8.5,
            explanation: `🏋️ TRUE COST CALCULATION:\n\nYearly: $10×12 + $50 = $170\n20 visits per year\nCost per visit: $170/20 = $8.50\n\n⚠️ That "cheap" membership isn't so cheap if you don't go often!\n💡 Calculate cost per USE, not per month.`
        }
    ];

    const scenario = randChoice(scenarios);
    return {
        text: scenario.text,
        answer: scenario.answer,
        min: 0,
        max: Math.ceil(scenario.answer * 1.5),
        label: 'Hidden Costs',
        visual: `💸 Read the fine print!`,
        feedbackExtra: scenario.explanation
    };
}

function generateSurvivalBiasProblem() {
    const scenarios = [
        {
            text: `10,000 people try day trading. 100 become millionaires (1%). Media only interviews the successful ones. What % of traders they show you FAILED?`,
            answer: 0,
            explanation: `📺 SURVIVORSHIP BIAS:\n\nYou only see the winners!\n\nOf 10,000 traders:\n• 100 succeeded (1%)\n• 9,900 failed (99%)\n\nMedia shows: 100% winners\nReality: 99% losers\n\n⚠️ Success stories are SELECTED, not representative.\n💡 "I read about this guy who..." is dangerous logic.`,
            sourceUrl: 'https://www.britannica.com/topic/survivorship-bias'
        },
        {
            text: `"Buildings were better built in the 1800s - they're still standing!" Of 1000 buildings from 1850, 50 still stand. What % were NOT built to last?`,
            answer: 95,
            explanation: `🏛️ SURVIVORSHIP BIAS:\n\n1000 buildings built in 1850\n50 still standing (5%)\n950 demolished or collapsed (95%)\n\nYou only SEE the 50 survivors!\n\n⚠️ "Old things were better" ignores all the old things that broke.\n💡 You can't see what didn't survive.`
        }
    ];

    const scenario = randChoice(scenarios);
    return {
        text: scenario.text,
        answer: scenario.answer,
        min: 0,
        max: 100,
        label: 'Survivorship Bias',
        visual: `📊 What are you NOT seeing?`,
        feedbackExtra: scenario.explanation,
        sourceUrl: scenario.sourceUrl
    };
}

function generateCherryPickProblem() {
    const scenarios = [
        {
            text: `A fund brags "UP 50% since 2020!" But they started in 2019, down 40% that year. What's the REAL total return since 2019?`,
            answer: -10,
            explanation: `📉 CHERRY-PICKED TIMEFRAME:\n\n2019: -40% (start at 100 → 60)\n2020-now: +50% (60 → 90)\n\nTotal: 90/100 = -10%\n\n⚠️ They chose to start AFTER the bad year!\n💡 Always ask: "Why THIS starting point?"`,
            min: -50
        },
        {
            text: `Study shows "Widget users are 30% happier!" But widget users are also wealthier. If wealth explains 25 of the 30 points, how many points are actually from the widget?`,
            answer: 5,
            explanation: `📊 CONFOUNDING VARIABLES:\n\n30% "happiness boost"\n25% explained by wealth (confound)\n5% might be the widget\n\n⚠️ Correlation ≠ Causation\n💡 Ask: "What else could explain this?"\n\nMaybe widget does nothing, and wealthy people just buy widgets AND are happier!`
        }
    ];

    const scenario = randChoice(scenarios);
    return {
        text: scenario.text,
        answer: scenario.answer,
        min: scenario.min || 0,
        max: 100,
        label: 'Cherry Picking',
        visual: `🍒 Check the full picture!`,
        feedbackExtra: scenario.explanation
    };
}

function generateCorrelationProblem() {
    const scenarios = [
        {
            text: `Ice cream sales and drowning deaths both increase in summer. If 1000 more ice creams are sold, how many additional drownings does ice cream CAUSE?`,
            answer: 0,
            explanation: `🍦 CORRELATION ≠ CAUSATION:\n\nIce cream sales ↑ in summer\nDrownings ↑ in summer\nBut ice cream doesn't CAUSE drowning!\n\nThe HIDDEN variable: Hot weather\n• More people swim → more drownings\n• More people buy ice cream\n\n⚠️ Two things can be correlated without one causing the other!`,
            sourceUrl: 'https://www.britannica.com/science/correlation'
        },
        {
            text: `Countries with more Nobel Prize winners also consume more chocolate per capita. If a country doubles chocolate consumption, how many more Nobel Prizes will they win?`,
            answer: 0,
            explanation: `🍫 SPURIOUS CORRELATION:\n\nChocolate consumption and Nobel Prizes are correlated, but chocolate doesn't CAUSE Nobel Prizes!\n\nHidden variables might be:\n• Wealth (can afford chocolate AND fund research)\n• Education levels\n• Random chance\n\n⚠️ Funny correlations are everywhere - they don't imply causation!`
        }
    ];

    const scenario = randChoice(scenarios);
    return {
        text: scenario.text,
        answer: scenario.answer,
        min: 0,
        max: 50,
        label: 'Correlation ≠ Causation',
        visual: `📈📉 Does A really cause B?`,
        feedbackExtra: scenario.explanation,
        sourceUrl: scenario.sourceUrl
    };
}

// ============ ABOUT ME MODE ============
// Store user's personal data
let aboutMeData = {
    age: 8,
    siblings: 2,
    pets: 1,
    rooms: 6,
    family: 4,
    books: 10,
    favNum: 7
};

function loadAboutMeData() {
    const saved = localStorage.getItem('mathEstimator_aboutMe');
    if (saved) {
        aboutMeData = JSON.parse(saved);
        // Pre-fill form if data exists
        if (elements.aboutMeAge) elements.aboutMeAge.value = aboutMeData.age;
        if (elements.aboutMeSiblings) elements.aboutMeSiblings.value = aboutMeData.siblings;
        if (elements.aboutMePets) elements.aboutMePets.value = aboutMeData.pets;
        if (elements.aboutMeRooms) elements.aboutMeRooms.value = aboutMeData.rooms;
        if (elements.aboutMeFamily) elements.aboutMeFamily.value = aboutMeData.family;
        if (elements.aboutMeBooks) elements.aboutMeBooks.value = aboutMeData.books;
        if (elements.aboutMeFavNum) elements.aboutMeFavNum.value = aboutMeData.favNum;
    }
}

function saveAboutMeData() {
    aboutMeData = {
        age: parseInt(elements.aboutMeAge.value) || 8,
        siblings: parseInt(elements.aboutMeSiblings.value) || 0,
        pets: parseInt(elements.aboutMePets.value) || 0,
        rooms: parseInt(elements.aboutMeRooms.value) || 6,
        family: parseInt(elements.aboutMeFamily.value) || 4,
        books: parseInt(elements.aboutMeBooks.value) || 5,
        favNum: parseInt(elements.aboutMeFavNum.value) || 7
    };
    localStorage.setItem('mathEstimator_aboutMe', JSON.stringify(aboutMeData));
}

function generateAboutMeProblem() {
    const d = aboutMeData; // Shorthand

    // Generate FUN personalized questions based on user data
    const questions = [
        // Age-based (silly)
        {
            q: `You're ${d.age}. If a wizard adds ${d.favNum} years, how old are you now?`,
            answer: d.age + d.favNum,
            emoji: '🧙‍♂️',
            hint: `${d.age} + ${d.favNum} = ${d.age + d.favNum}`
        },
        {
            q: `If you traveled back in time ${Math.min(d.age - 1, 3)} years, how old would you be?`,
            answer: d.age - Math.min(d.age - 1, 3),
            emoji: '⏰',
            hint: `${d.age} - ${Math.min(d.age - 1, 3)} = ${d.age - Math.min(d.age - 1, 3)}`
        },
        {
            q: `How many birthday cakes have you eaten in your ${d.age * 12} months alive? (1 per birthday)`,
            answer: d.age,
            emoji: '🎂',
            hint: `One cake per year = ${d.age} cakes!`
        },
        // Family-based (funny)
        {
            q: `${d.family} people doing jazz hands! 🎷 Total fingers waving?`,
            answer: d.family * 10,
            emoji: '🖐️',
            hint: `${d.family} × 10 fingers = ${d.family * 10}`
        },
        {
            q: `If everyone in your house (${d.family}) grew bunny ears, total ears?`,
            answer: d.family * 4,
            emoji: '🐰',
            hint: `${d.family} × 4 ears = ${d.family * 4} (2 human + 2 bunny!)`
        },
        {
            q: `${d.family} family members eat ${d.favNum} tacos each. TACO COUNT?`,
            answer: d.family * d.favNum,
            emoji: '🌮',
            hint: `${d.family} × ${d.favNum} = ${d.family * d.favNum} tacos!`
        },
        {
            q: `Family dance party! ${d.family} people × 2 feet = how many feet stomping?`,
            answer: d.family * 2,
            emoji: '💃',
            hint: `${d.family} × 2 = ${d.family * 2} feet!`
        },
        // Rooms-based (silly)
        {
            q: `A spider builds a web in each corner of your ${d.rooms} rooms. Total webs?`,
            answer: d.rooms * 4,
            emoji: '🕷️',
            hint: `${d.rooms} rooms × 4 corners = ${d.rooms * 4} webs!`
        },
        {
            q: `You hide a rubber duck in each of your ${d.rooms} rooms. Total ducks?`,
            answer: d.rooms,
            emoji: '🦆',
            hint: `1 duck × ${d.rooms} rooms = ${d.rooms} ducks!`
        },
        // Siblings-based (fun)
        {
            q: `You + ${d.siblings} siblings start a rock band. How many band members?`,
            answer: d.siblings + 1,
            emoji: '🎸',
            hint: `${d.siblings} + 1 (you!) = ${d.siblings + 1} rockstars!`
        },
        {
            q: `${d.siblings + 1} kids (you + siblings) each get 3 scoops of ice cream. Total scoops?`,
            answer: (d.siblings + 1) * 3,
            emoji: '🍦',
            hint: `${d.siblings + 1} × 3 = ${(d.siblings + 1) * 3} scoops!`
        },
        // Pets-based (cute)
        {
            q: `Your ${d.pets} pet(s) doing a silly walk. Total paws on the ground?`,
            answer: d.pets * 4,
            emoji: '🐕',
            hint: `${d.pets} × 4 paws = ${d.pets * 4}`
        },
        {
            q: `If your ${d.pets} pet(s) each wore tiny sunglasses, total sunglasses?`,
            answer: d.pets,
            emoji: '😎',
            hint: `${d.pets} pets = ${d.pets} cool sunglasses!`
        },
        // Books-based (adventurous)
        {
            q: `You've read ${d.books} books! If each had 1 dragon, total dragons you've met?`,
            answer: d.books,
            emoji: '🐉',
            hint: `${d.books} books = ${d.books} dragons!`
        },
        {
            q: `${d.books} books × 3 chapters each = total adventures?`,
            answer: d.books * 3,
            emoji: '📖',
            hint: `${d.books} × 3 = ${d.books * 3} adventures!`
        },
        // Favorite number combos (magical)
        {
            q: `Your magic number is ${d.favNum}. What's ${d.favNum} unicorns × ${d.favNum} rainbows?`,
            answer: d.favNum * d.favNum,
            emoji: '🦄',
            hint: `${d.favNum} × ${d.favNum} = ${d.favNum * d.favNum}`
        },
        {
            q: `${d.age} birthday candles + ${d.favNum} wish candles = ?`,
            answer: d.age + d.favNum,
            emoji: '🕯️',
            hint: `${d.age} + ${d.favNum} = ${d.age + d.favNum} candles!`
        },
        // Combined questions (wacky)
        {
            q: `Alien invasion! ${d.family} humans + ${d.pets} pets vs aliens. Total defenders?`,
            answer: d.family + d.pets,
            emoji: '👽',
            hint: `${d.family} + ${d.pets} = ${d.family + d.pets} defenders!`
        },
        {
            q: `Everyone in your house (${d.family}) builds a snowman. Total snowmen?`,
            answer: d.family,
            emoji: '⛄',
            hint: `${d.family} people = ${d.family} snowmen!`
        },
        {
            q: `Pillow fight! ${d.family} people with ${d.favNum} pillows each. Total pillows flying?`,
            answer: d.family * d.favNum,
            emoji: '🛏️',
            hint: `${d.family} × ${d.favNum} = ${d.family * d.favNum} pillows!`
        }
    ];

    // Filter out questions with answer 0 or negative
    const validQuestions = questions.filter(q => q.answer > 0);
    const selected = randChoice(validQuestions);

    const scale = calculateCollegeScale(selected.answer);

    return {
        text: selected.q,
        answer: selected.answer,
        min: 0,
        max: Math.max(scale.max, selected.answer * 2),
        label: 'About Me',
        visual: `${selected.emoji} Personal Math!`,
        feedbackExtra: selected.hint
    };
}

// ============ BABY MODE GENERATORS ============
function generateBabyProblem() {
    // Mostly visual problem types - minimize numerals
    const problemTypes = [
        'countingVisual',    // Count items, visual choices
        'countingVisual',    // Double weight
        'additionVisual',    // Visual addition with + symbol
        'additionVisual',    // Double weight
        'takeAway',          // Visual subtraction with hand taking away
        'takeAway',          // Double weight
        'whichMore',         // Which group has more?
        'whichLess',         // Which group has less?
        'sharing',           // Divide FOOD into equal groups
        'groups',            // Simple multiplication (groups of items)
        'grid',              // Count items in a grid/rectangle
        'grid',              // Double weight
        'cube',              // Count items in 3D layers
        'countingNumeral'    // Occasional numeral practice (reduced)
    ];

    const problemType = randChoice(problemTypes);

    switch (problemType) {
        case 'countingVisual':
            return generateBabyCountingVisual();
        case 'countingNumeral':
            return generateBabyCountingNumeral();
        case 'additionVisual':
            return generateBabyAdditionVisual();
        case 'takeAway':
            return generateBabyTakeAway();
        case 'whichMore':
            return generateBabyComparison('more');
        case 'whichLess':
            return generateBabyComparison('less');
        case 'sharing':
            return generateBabySharing();
        case 'groups':
            return generateBabyGroups();
        case 'grid':
            return generateBabyGrid();
        case 'cube':
            return generateBabyCube();
        default:
            return generateBabyCountingVisual();
    }
}

// Helper to create visual choice (emoji repeated n times)
function makeVisualChoice(emoji, count) {
    if (count === 0) return '🚫'; // Empty/none symbol
    return Array(count).fill(emoji).join('');
}

// Counting with VISUAL answer choices (no numerals needed)
function generateBabyCountingVisual() {
    const count = randInt(1, 6);
    const emoji = randChoice(BABY_ITEMS);
    const items = Array(count).fill(emoji).join(' ');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(1, 7);
        if (wrong !== count && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    // Create visual choices (show emoji quantities)
    const allAnswers = [count, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: makeVisualChoice(emoji, n),
        isVisual: true
    }));

    return {
        type: 'countingVisual',
        visual: items,
        question: '= ❓',  // Visual: equals what?
        answer: count,
        choices: choices,
        choiceType: 'visual'
    };
}

// Counting with NUMERAL choices (for learning numbers)
function generateBabyCountingNumeral() {
    const count = randInt(1, 8);
    const emoji = randChoice(BABY_ITEMS);
    const items = Array(count).fill(emoji).join(' ');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(1, 9);
        if (wrong !== count && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allAnswers = [count, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: n.toString(),
        isVisual: false
    }));

    return {
        type: 'countingNumeral',
        visual: items,
        question: '= ❓',  // Visual: equals what number?
        answer: count,
        choices: choices,
        choiceType: 'numeral'
    };
}

// Visual addition with VISUAL answer choices and clear + symbol
function generateBabyAdditionVisual() {
    const num1 = randInt(1, 5);
    const num2 = randInt(1, 4);
    const emoji = randChoice(BABY_ITEMS);
    const answer = num1 + num2;

    const visual1 = Array(num1).fill(emoji).join('');
    const visual2 = Array(num2).fill(emoji).join('');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(1, 6);
        if (wrong !== answer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allAnswers = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: makeVisualChoice(emoji, n),
        isVisual: true
    }));

    return {
        type: 'additionVisual',
        visual: `${visual1} ➕ ${visual2}`,
        question: '= ❓',  // Visual: equals what?
        answer: answer,
        choices: choices,
        choiceType: 'visual'
    };
}

// Visual take away with hand grabbing symbol
function generateBabyTakeAway() {
    const total = randInt(4, 8);
    const takeAway = randInt(1, total - 1);
    const answer = total - takeAway;
    const emoji = randChoice(BABY_ITEMS);

    // Show items with hand taking some away
    const allItems = Array(total).fill(emoji).join('');
    const takenItems = Array(takeAway).fill(emoji).join('');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(0, 5);
        if (wrong !== answer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allAnswers = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: n === 0 ? '🚫' : makeVisualChoice(emoji, n),
        isVisual: true
    }));

    return {
        type: 'takeAway',
        visual: `${allItems}\n✋➡️${takenItems}`,
        question: '= ❓',  // Visual: what's left?
        answer: answer,
        choices: choices,
        choiceType: 'visual'
    };
}

// Sharing/division - splitting FOOD into equal groups (no animals!)
function generateBabySharing() {
    const numPeople = randInt(2, 4);
    const perPerson = randInt(2, 4);
    const total = numPeople * perPerson;
    const emoji = randChoice(BABY_FOOD_ITEMS); // Only food items!

    // Show total items above plates with people
    const allItems = Array(total).fill(emoji).join('');
    const plates = Array(numPeople).fill('🍽️').join(' ');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(1, 5);
        if (wrong !== perPerson && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allAnswers = [perPerson, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: makeVisualChoice(emoji, n),
        isVisual: true
    }));

    // Visual only - show items → plates (no text question)
    return {
        type: 'sharing',
        visual: `${allItems}\n⬇️\n${plates}`,
        question: '🍽️ = ❓',  // Visual question: what goes on each plate?
        answer: perPerson,
        choices: choices,
        choiceType: 'visual'
    };
}

// Which has more / Which has less
function generateBabyComparison(compareType) {
    const emoji1 = randChoice(BABY_ITEMS);
    let emoji2 = randChoice(BABY_ITEMS);
    while (emoji2 === emoji1) {
        emoji2 = randChoice(BABY_ITEMS);
    }

    const count1 = randInt(1, 4);
    let count2 = randInt(1, 4);
    while (count2 === count1) {
        count2 = randInt(1, 4);
    }

    const group1 = Array(count1).fill(emoji1).join(' ');
    const group2 = Array(count2).fill(emoji2).join(' ');

    // Determine correct answer based on comparison type
    let answer, wrongAnswer;
    if (compareType === 'more') {
        answer = count1 > count2 ? 1 : 2;
        wrongAnswer = count1 > count2 ? 2 : 1;
    } else {
        answer = count1 < count2 ? 1 : 2;
        wrongAnswer = count1 < count2 ? 2 : 1;
    }

    const choices = [
        { value: 1, display: group1, isVisual: true, label: 'A' },
        { value: 2, display: group2, isVisual: true, label: 'B' }
    ].sort(() => Math.random() - 0.5);

    return {
        type: 'comparison',
        visual: `${group1}\n\n${group2}`,
        question: compareType === 'more' ? '👆 Which has MORE?' : '👇 Which has LESS?',
        answer: answer,
        choices: choices,
        choiceType: 'visual',
        isComparison: true
    };
}

// Groups (simple multiplication concept)
function generateBabyGroups() {
    const numGroups = randInt(2, 3);
    const perGroup = randInt(2, 3);
    const answer = numGroups * perGroup;
    const emoji = randChoice(BABY_ITEMS);

    // Visual: show groups separated
    const group = Array(perGroup).fill(emoji).join('');
    const visual = Array(numGroups).fill(`[${group}]`).join('  ');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(2, 9);
        if (wrong !== answer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allAnswers = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: makeVisualChoice(emoji, n),
        isVisual: true
    }));

    return {
        type: 'groups',
        visual: visual,
        question: '= ❓',  // Visual: total?
        answer: answer,
        choices: choices,
        choiceType: 'visual'
    };
}

// Grid to line - count items in a rectangle/square
function generateBabyGrid() {
    const rows = randInt(2, 4);
    const cols = randInt(2, 4);
    const answer = rows * cols;
    const emoji = randChoice(BABY_TOY_ITEMS);

    // Show items in a grid
    const grid = [];
    for (let r = 0; r < rows; r++) {
        grid.push(Array(cols).fill(emoji).join(''));
    }
    const visual = grid.join('\n');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(2, 16);
        if (wrong !== answer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allAnswers = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: makeVisualChoice(emoji, n),
        isVisual: true
    }));

    return {
        type: 'grid',
        visual: `📦\n${visual}`,
        question: '= ❓',
        answer: answer,
        choices: choices,
        choiceType: 'visual'
    };
}

// 3D concept - layers of grids (simplified cube visualization)
function generateBabyCube() {
    const size = randInt(2, 3); // Small cube
    const answer = size * size * size;
    const emoji = randChoice(BABY_TOY_ITEMS);

    // Show multiple layers to suggest 3D
    const layer = [];
    for (let r = 0; r < size; r++) {
        layer.push(Array(size).fill(emoji).join(''));
    }
    const layerStr = layer.join('\n');

    // Show layers with separators
    const layers = [];
    for (let l = 0; l < size; l++) {
        layers.push(layerStr);
    }
    const visual = layers.join('\n➖➖\n');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(4, 30);
        if (wrong !== answer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }

    const allAnswers = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const choices = allAnswers.map(n => ({
        value: n,
        display: makeVisualChoice(emoji, n),
        isVisual: true
    }));

    return {
        type: 'cube',
        visual: `📦📦📦\n${visual}`,
        question: '= ❓',
        answer: answer,
        choices: choices,
        choiceType: 'visual'
    };
}

// ============ BABY MODE GAME LOGIC ============
function startBabyMode() {
    state.mode = 'baby';
    state.level = 'baby';
    state.babyCorrect = 0;

    elements.modeScreen.classList.remove('active');
    elements.babyScreen.classList.add('active');

    updateBabyStars();
    nextBabyProblem();
}

function nextBabyProblem() {
    state.currentProblem = generateBabyProblem();
    const problem = state.currentProblem;

    // Render the visual problem with question
    elements.babyProblem.innerHTML = `
        <div class="baby-visual">${problem.visual}</div>
        <div class="baby-question">${problem.question}</div>
    `;

    // Render the choice buttons (now handles both visual and numeral choices)
    elements.babyChoices.innerHTML = problem.choices.map(choice => {
        const btnClass = choice.isVisual ? 'baby-choice-btn visual-choice' : 'baby-choice-btn numeral-choice';
        return `
            <button class="${btnClass}" data-value="${choice.value}">
                ${choice.display}
            </button>
        `;
    }).join('');

    // Add click listeners to choices
    document.querySelectorAll('.baby-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => handleBabyChoice(parseInt(btn.dataset.value)));
    });

    // Hide feedback
    elements.babyFeedback.classList.add('hidden');
}

function handleBabyChoice(choice) {
    const correct = choice === state.currentProblem.answer;

    // Disable all buttons and highlight correct/wrong
    document.querySelectorAll('.baby-choice-btn').forEach(btn => {
        btn.disabled = true;
        const btnValue = parseInt(btn.dataset.value);
        if (btnValue === state.currentProblem.answer) {
            btn.classList.add('correct');
        } else if (btnValue === choice && !correct) {
            btn.classList.add('wrong');
        }
    });

    // Show feedback
    elements.babyFeedback.querySelector('.baby-feedback-emoji').textContent = correct ? '🎉' : '💪';
    elements.babyFeedback.classList.remove('hidden');
    elements.babyFeedback.classList.toggle('correct', correct);
    elements.babyFeedback.classList.toggle('wrong', !correct);

    if (correct) {
        state.babyCorrect++;
        state.streak++;
        if (state.streak > state.bestStreak) {
            state.bestStreak = state.streak;
        }
        state.totalPoints += 50;
        saveProgress();
    } else {
        state.streak = 0;
    }

    updateBabyStars();

    // Auto-advance after delay
    setTimeout(() => {
        nextBabyProblem();
    }, correct ? 1200 : 1800);
}

function updateBabyStars() {
    const stars = Math.min(state.babyCorrect, 10);
    elements.babyStars.textContent = '⭐'.repeat(stars) || '🌟';
}

function goToModeScreen() {
    // Hide all screens
    elements.modeScreen.classList.remove('active');
    elements.levelScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.babyScreen.classList.remove('active');
    if (elements.aboutMeSetupScreen) {
        elements.aboutMeSetupScreen.classList.remove('active');
    }

    // Show mode screen
    elements.modeScreen.classList.add('active');
    loadProgress();
}

function showAboutMeSetup() {
    // Hide mode screen
    elements.modeScreen.classList.remove('active');

    // Show About Me setup screen
    if (elements.aboutMeSetupScreen) {
        elements.aboutMeSetupScreen.classList.add('active');
        loadAboutMeData(); // Pre-fill with saved data
    }
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
    const rounded = smartRound(state.estimate, state.maxValue);
    if (state.mode === 'shopping') {
        if (state.currentProblem && state.currentProblem.useCents) {
            elements.estimateValue.textContent = Math.round(rounded) + '¢';
        } else {
            elements.estimateValue.textContent = formatPrice(rounded);
        }
    } else if (state.mode === 'college') {
        elements.estimateValue.textContent = formatCollegeNumber(rounded);
    } else {
        // Format based on whether we're dealing with whole numbers or not
        if (state.maxValue >= 100) {
            elements.estimateValue.textContent = Math.round(rounded).toLocaleString();
        } else {
            elements.estimateValue.textContent = formatNumber(rounded);
        }
    }
}

function setSliderToRandomPosition() {
    // Start slider at a random position (avoiding the exact middle)
    // Use a random position between 20% and 80% of the range
    const randomPercent = 0.2 + Math.random() * 0.6;
    state.estimate = state.minValue + randomPercent * (state.maxValue - state.minValue);
    updateSliderPosition(randomPercent);
    updateEstimateDisplay();
}

// ============ GAME LOGIC ============
function startGame(level) {
    state.level = level;
    state.mode = LEVELS[level].mode;
    state.score = 0;
    state.streak = 0;

    // Hide all selection screens, show game screen
    elements.levelScreen.classList.remove('active');
    elements.modeScreen.classList.remove('active');
    if (elements.aboutMeSetupScreen) {
        elements.aboutMeSetupScreen.classList.remove('active');
    }
    elements.gameScreen.classList.add('active');

    // Add mode class for styling
    elements.gameScreen.classList.remove('shopping-mode', 'college-mode');
    if (state.mode === 'shopping') {
        elements.gameScreen.classList.add('shopping-mode');
    } else if (state.mode === 'college') {
        elements.gameScreen.classList.add('college-mode');
    }

    updateScoreDisplay();
    nextProblem();
}

function nextProblem() {
    // Generate problem based on mode
    if (state.mode === 'shopping') {
        state.currentProblem = generateShoppingProblem(state.level);
    } else if (state.mode === 'college') {
        state.currentProblem = generateCollegeProblem(state.level);
    } else if (state.mode === 'realworld') {
        state.currentProblem = generateRealWorldProblem(state.level);
    } else if (state.mode === 'magnitude') {
        state.currentProblem = generateMagnitudeProblem(state.level);
    } else if (state.mode === 'time') {
        state.currentProblem = generateTimeProblem(state.level);
    } else if (state.mode === 'friends') {
        state.currentProblem = generateFriendsProblem(state.level);
    } else if (state.mode === 'aboutme') {
        state.currentProblem = generateAboutMeProblem();
    } else if (state.mode === 'puzzlers') {
        state.currentProblem = generatePuzzlersProblem(state.level);
    } else if (state.mode === 'fallacies') {
        state.currentProblem = generateFallaciesProblem(state.level);
    } else {
        state.currentProblem = generateProblem(state.level);
    }

    state.minValue = state.currentProblem.min;
    state.maxValue = state.currentProblem.max;

    // Update UI
    elements.problem.textContent = state.currentProblem.text;
    elements.problemType.textContent = state.currentProblem.label;

    // Show visual if available
    if (state.currentProblem.visual) {
        elements.problemVisual.textContent = state.currentProblem.visual;
    } else {
        elements.problemVisual.textContent = '';
    }

    // Format labels based on mode
    if (state.mode === 'shopping') {
        if (state.currentProblem.useCents) {
            elements.minLabel.textContent = state.minValue + '¢';
            elements.maxLabel.textContent = state.maxValue + '¢';
        } else {
            elements.minLabel.textContent = formatPrice(state.minValue);
            elements.maxLabel.textContent = formatPrice(state.maxValue);
        }
    } else if (state.mode === 'college') {
        elements.minLabel.textContent = formatCollegeNumber(state.minValue);
        elements.maxLabel.textContent = formatCollegeNumber(state.maxValue);
    } else {
        elements.minLabel.textContent = formatNumber(state.minValue);
        elements.maxLabel.textContent = formatNumber(state.maxValue);
    }

    // Show/hide shopping items display
    if (state.currentProblem.showItems && state.shoppingItems.length > 0) {
        renderShoppingItems();
        elements.shoppingDisplay.classList.remove('hidden');
    } else {
        elements.shoppingDisplay.classList.add('hidden');
    }

    // Determine input mode: number input vs slider
    state.useNumberInput = shouldUseNumberInput(state.level);
    state.hintUsed = false;

    if (state.useNumberInput) {
        // Show number input, hide slider
        if (elements.numberInputContainer) {
            elements.numberInputContainer.classList.remove('hidden');
            elements.numberInput.value = '';
            elements.numberInput.placeholder = 'Enter your guess';
        }
        if (elements.numberLineContainer) {
            elements.numberLineContainer.classList.add('hidden');
        }
        // Show/hide hint button based on whether hint is available
        if (elements.hintBtn) {
            if (hasHintAvailable(state.currentProblem)) {
                elements.hintBtn.classList.remove('hidden');
                elements.hintBtn.disabled = false;
            } else {
                elements.hintBtn.classList.add('hidden');
            }
        }
        if (elements.hintDisplay) {
            elements.hintDisplay.classList.add('hidden');
        }
    } else {
        // Show slider, hide number input
        if (elements.numberInputContainer) {
            elements.numberInputContainer.classList.add('hidden');
        }
        if (elements.numberLineContainer) {
            elements.numberLineContainer.classList.remove('hidden');
        }
        // Reset slider to random position
        setSliderToRandomPosition();
    }

    // Hide feedback and answer marker
    elements.feedback.classList.add('hidden');
    elements.answerMarker.classList.add('hidden');

    // Show submit, hide next
    elements.submitBtn.classList.remove('hidden');
    elements.nextBtn.classList.add('hidden');

    // Start timer
    resetTimerDisplay();
    startTimer();
}

function renderShoppingItems() {
    const container = elements.shoppingItems;
    container.innerHTML = state.shoppingItems.map(item => {
        // Handle new format with quantities/discounts or old simple format
        if (item.quantity !== undefined) {
            const qtyDisplay = item.quantity > 1 ? `×${item.quantity}` : '';
            const discountDisplay = item.discount ? `<span class="item-discount">${item.discount}</span>` : '';
            return `
                <div class="shopping-item${item.discount ? ' has-discount' : ''}">
                    <span class="item-emoji">${item.emoji}</span>
                    <span class="item-name">${item.name} ${qtyDisplay}</span>
                    <span class="item-price">${formatPrice(item.unitPrice)}</span>
                    ${discountDisplay}
                </div>
            `;
        } else {
            return `
                <div class="shopping-item">
                    <span class="item-emoji">${item.emoji}</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${formatPrice(item.price)}</span>
                </div>
            `;
        }
    }).join('');
}

function checkEstimate() {
    // Stop timer first
    stopTimer();

    const problem = state.currentProblem;
    const tolerance = LEVELS[state.level].tolerance;
    const answer = problem.answer;

    // Get estimate from either number input or slider
    let estimate;
    if (state.useNumberInput && elements.numberInput) {
        const inputVal = parseFloat(elements.numberInput.value);
        if (isNaN(inputVal)) {
            // No valid input - prompt user
            elements.numberInput.focus();
            elements.numberInput.placeholder = 'Please enter a number!';
            startTimer(); // Restart timer
            return;
        }
        estimate = inputVal;
        state.estimate = inputVal; // Store for display
    } else {
        estimate = smartRound(state.estimate, state.maxValue);
    }

    // Calculate error as percentage of answer (handle zero case)
    const error = answer === 0 ? Math.abs(estimate) : Math.abs(estimate - answer) / Math.abs(answer);

    // Determine result - Bullseye ONLY for exact matches!
    let result, points;
    const isExactMatch = estimate === answer || Math.abs(estimate - answer) < 0.001;

    if (isExactMatch) {
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

    // Format answer/estimate based on mode
    if (state.mode === 'shopping') {
        elements.actualAnswer.textContent = formatPrice(answer);
        elements.yourGuess.textContent = formatPrice(estimate);
    } else if (state.mode === 'college') {
        elements.actualAnswer.textContent = formatCollegeNumber(answer);
        elements.yourGuess.textContent = formatCollegeNumber(estimate);
    } else {
        elements.actualAnswer.textContent = formatNumber(answer);
        elements.yourGuess.textContent = formatNumber(estimate);
    }
    elements.pointsEarned.textContent = `+${points}`;

    // Add time info if timer enabled
    const timeInfoEl = document.getElementById('time-info');
    if (timeInfoEl && state.timerEnabled && state.lastProblemTime > 0) {
        const avgTime = getAverageTime();
        timeInfoEl.innerHTML = `⏱️ ${formatTimeForFeedback(state.lastProblemTime)}` +
            (state.problemsSolved > 1 ? ` (avg: ${formatTimeForFeedback(avgTime)})` : '');
        timeInfoEl.classList.remove('hidden');
    } else if (timeInfoEl) {
        timeInfoEl.classList.add('hidden');
    }

    // Show explanation if available
    const explanationEl = document.getElementById('feedback-explanation');
    if (explanationEl && state.currentProblem && state.currentProblem.feedbackExtra) {
        // Escape HTML in feedbackExtra to prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        let explanationHtml = escapeHtml(state.currentProblem.feedbackExtra);
        // Convert newlines to <br> for proper formatting
        explanationHtml = explanationHtml.replace(/\n/g, '<br>');

        // Add source link if available
        if (state.currentProblem.sourceUrl) {
            const domain = new URL(state.currentProblem.sourceUrl).hostname.replace('www.', '');
            explanationHtml += `<br><br><a href="${state.currentProblem.sourceUrl}" target="_blank" rel="noopener">📖 Source: ${domain}</a>`;
        }

        explanationEl.innerHTML = explanationHtml;
        explanationEl.classList.remove('hidden');
    } else if (explanationEl) {
        explanationEl.classList.add('hidden');
    }

    elements.feedback.classList.remove('hidden');
    elements.feedback.className = `feedback ${result}`;

    // Show periodic credits reminder (every 6 problems)
    state.problemCount++;
    const creditsEl = document.getElementById('credits-reminder');
    if (creditsEl) {
        if (state.problemCount % 6 === 0) {
            creditsEl.classList.remove('hidden');
        } else {
            creditsEl.classList.add('hidden');
        }
    }
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
    elements.modeScreen.classList.add('active');
    loadProgress();
}

// ============ PERSISTENCE ============
function saveProgress() {
    const data = {
        bestStreak: state.bestStreak,
        totalPoints: state.totalPoints,
        timerEnabled: state.timerEnabled
    };
    localStorage.setItem('mathEstimatorProgress', JSON.stringify(data));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('mathEstimatorProgress'));
        if (data) {
            state.bestStreak = data.bestStreak || 0;
            state.totalPoints = data.totalPoints || 0;
            state.timerEnabled = data.timerEnabled !== false; // Default to true
        }
    } catch (e) {
        console.log('No saved progress found');
    }

    elements.bestStreakDisplay.textContent = state.bestStreak;
    elements.totalPointsDisplay.textContent = state.totalPoints;

    // Apply timer preference
    if (elements.timerToggle) {
        elements.timerToggle.checked = state.timerEnabled;
    }
    if (elements.timerDisplay) {
        elements.timerDisplay.classList.toggle('hidden', !state.timerEnabled);
    }
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
    // Mode card selection (Stage 1)
    document.querySelectorAll('.mode-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;

            if (mode === 'baby') {
                // Baby mode goes directly to game
                startBabyMode();
            } else if (mode === 'aboutme') {
                // About Me mode goes to setup screen
                showAboutMeSetup();
            } else {
                // Other modes go to level selection
                showLevelScreen(mode);
            }
        });
    });

    // Back to mode selection from level screen
    elements.backToModeBtn.addEventListener('click', goToModeScreen);

    // Level selection (both modes)
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

    // Baby mode back button
    elements.babyBackBtn.addEventListener('click', goToModeScreen);

    // About Me mode setup
    if (elements.aboutMeBackBtn) {
        elements.aboutMeBackBtn.addEventListener('click', goToModeScreen);
    }
    if (elements.aboutMeStartBtn) {
        elements.aboutMeStartBtn.addEventListener('click', () => {
            saveAboutMeData();
            startGame('aboutMeMode');
        });
    }

    // Timer toggle
    if (elements.timerToggle) {
        elements.timerToggle.addEventListener('change', (e) => {
            toggleTimer(e.target.checked);
        });
    }

    // Hint button
    if (elements.hintBtn) {
        elements.hintBtn.addEventListener('click', showHint);
    }

    // Number input Enter key support
    if (elements.numberInput) {
        elements.numberInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !elements.submitBtn.classList.contains('hidden')) {
                e.preventDefault();
                checkEstimate();
            }
        });
    }

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

function showLevelScreen(mode) {
    // Hide all screens
    elements.modeScreen.classList.remove('active');

    // Show level screen
    elements.levelScreen.classList.add('active');

    // Hide all level selectors first
    elements.numbersLevels.classList.add('hidden');
    elements.shoppingLevels.classList.add('hidden');
    if (elements.collegeLevels) elements.collegeLevels.classList.add('hidden');
    if (elements.realworldLevels) elements.realworldLevels.classList.add('hidden');
    if (elements.timeLevels) elements.timeLevels.classList.add('hidden');
    if (elements.magnitudeLevels) elements.magnitudeLevels.classList.add('hidden');
    if (elements.friendsLevels) elements.friendsLevels.classList.add('hidden');
    if (elements.puzzlersLevels) elements.puzzlersLevels.classList.add('hidden');
    if (elements.fallaciesLevels) elements.fallaciesLevels.classList.add('hidden');

    // Update title and show appropriate levels based on mode
    if (mode === 'numbers') {
        elements.levelScreenTitle.textContent = 'Choose Difficulty';
        elements.numbersLevels.classList.remove('hidden');
    } else if (mode === 'shopping') {
        elements.levelScreenTitle.textContent = 'Choose Challenge';
        elements.shoppingLevels.classList.remove('hidden');
    } else if (mode === 'college') {
        elements.levelScreenTitle.textContent = 'Choose Topic';
        if (elements.collegeLevels) elements.collegeLevels.classList.remove('hidden');
    } else if (mode === 'realworld') {
        elements.levelScreenTitle.textContent = 'Choose Topic';
        if (elements.realworldLevels) elements.realworldLevels.classList.remove('hidden');
    } else if (mode === 'time') {
        elements.levelScreenTitle.textContent = 'Choose Timeframe';
        if (elements.timeLevels) elements.timeLevels.classList.remove('hidden');
    } else if (mode === 'magnitude') {
        elements.levelScreenTitle.textContent = 'Choose Challenge';
        if (elements.magnitudeLevels) elements.magnitudeLevels.classList.remove('hidden');
    } else if (mode === 'friends') {
        elements.levelScreenTitle.textContent = 'Friends & Combinations';
        if (elements.friendsLevels) elements.friendsLevels.classList.remove('hidden');
    } else if (mode === 'puzzlers') {
        elements.levelScreenTitle.textContent = 'Brain Teasers';
        if (elements.puzzlersLevels) elements.puzzlersLevels.classList.remove('hidden');
    } else if (mode === 'fallacies') {
        elements.levelScreenTitle.textContent = 'Fallacies & Scams';
        if (elements.fallaciesLevels) elements.fallaciesLevels.classList.remove('hidden');
    }
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
