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
        name: 'Better Deals',
        mode: 'shopping',
        tolerance: { bullseye: 0.03, close: 0.08, neighborhood: 0.15 },
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
    }
};

// Baby Mode visual items
const BABY_ITEMS = ['🍎', '🌟', '🐶', '🎈', '🌸', '🐱', '🍪', '🦋', '🚗', '⚽'];

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
    babyAnswer: null
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
    backToModeBtn: document.getElementById('back-to-mode-btn'),
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
    babyBackBtn: document.getElementById('baby-back-btn')
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

function calculateScale(answer) {
    if (answer <= 1) return { min: 0, max: 2 };
    if (answer <= 10) return { min: 0, max: Math.ceil(answer * 2 / 5) * 5 };
    if (answer <= 50) return { min: 0, max: Math.ceil(answer * 1.5 / 10) * 10 };
    if (answer <= 100) return { min: 0, max: Math.ceil(answer * 1.5 / 50) * 50 };
    if (answer <= 500) return { min: 0, max: Math.ceil(answer * 1.5 / 100) * 100 };
    if (answer <= 1000) return { min: 0, max: Math.ceil(answer * 1.5 / 500) * 500 };
    return { min: 0, max: Math.ceil(answer * 1.5 / 1000) * 1000 };
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
    // Generate two options with different sizes/prices
    const product = randChoice(PRODUCTS);
    const size1 = randChoice([8, 10, 12, 16]);
    const size2 = randChoice([18, 20, 24, 32]);

    // Make prices realistic (the larger one should be better deal ~70% of time)
    const pricePerOz1 = (product.basePrice / 10) * (0.8 + Math.random() * 0.4);
    const pricePerOz2 = pricePerOz1 * (0.7 + Math.random() * 0.5);

    const price1 = roundNice(size1 * pricePerOz1);
    const price2 = roundNice(size2 * pricePerOz2);

    const unitPrice1 = price1 / size1;
    const unitPrice2 = price2 / size2;
    const betterDeal = unitPrice1 < unitPrice2 ? 1 : 2;
    const answer = Math.min(unitPrice1, unitPrice2);

    // Store items for display
    state.shoppingItems = [
        { emoji: product.emoji, name: `${size1}oz`, price: price1 },
        { emoji: product.emoji, name: `${size2}oz`, price: price2 }
    ];

    return {
        text: `Which is cheaper per oz?\nEstimate the better price/oz`,
        answer: roundNice(answer * 100) / 100,
        min: 0,
        max: Math.ceil(Math.max(unitPrice1, unitPrice2) * 1.5 * 100) / 100,
        label: config.label,
        showItems: true,
        feedbackExtra: `Option ${betterDeal} wins at ${formatPrice(answer)}/oz`
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

    return {
        text: `Estimate your basket total`,
        answer: roundNice(total),
        min: 0,
        max: Math.ceil(total * 1.5 / 5) * 5,
        label: config.label,
        showItems: true,
        feedbackExtra: `Actual total: ${formatPrice(total)}`
    };
}

function generateTipCalc(config) {
    // Generate a bill amount
    const bill = roundNice(randInt(20, 120) + randInt(0, 99) / 100);
    const tipPercent = randChoice([15, 18, 20, 25]);
    const answer = roundNice(bill * tipPercent / 100);

    state.shoppingItems = [];

    return {
        text: `Your bill is ${formatPrice(bill)}\nEstimate a ${tipPercent}% tip`,
        answer: answer,
        min: 0,
        max: Math.ceil(answer * 2),
        label: config.label,
        showItems: false,
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

    return {
        text: `${discountPercent}% off ${formatPrice(originalPrice)}\nWhat do you pay?`,
        answer: answer,
        min: 0,
        max: originalPrice,
        label: config.label,
        showItems: false,
        feedbackExtra: `Save ${formatPrice(discountAmount)}, pay ${formatPrice(answer)}`
    };
}

function generateQuickAdd(config) {
    // Generate 3-4 prices that look like real store prices
    const numPrices = randInt(3, 4);
    const prices = [];
    let total = 0;

    for (let i = 0; i < numPrices; i++) {
        // Generate prices like $X.99, $X.49, $X.29
        const dollars = randInt(2, 25);
        const cents = randChoice([0.29, 0.49, 0.79, 0.99]);
        const price = dollars + cents;
        prices.push(price);
        total += price;
    }

    state.shoppingItems = prices.map((p, i) => ({
        emoji: '💰',
        name: `Item ${i + 1}`,
        price: p
    }));

    return {
        text: `Quick! Add these up:\n${prices.map(p => formatPrice(p)).join(' + ')}`,
        answer: roundNice(total),
        min: 0,
        max: Math.ceil(total * 1.3 / 5) * 5,
        label: config.label,
        showItems: false,
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
        { q: 'Piano tuners in Chicago', answer: 100, hint: 'Pop ~2.7M, ~10% own pianos, tuned yearly, 4 tunings/day' },
        { q: 'Golf balls that fit in a school bus', answer: 500000, hint: 'Bus ~2000 cu ft, ball ~2.5 cu in' },
        { q: 'Gas stations in the USA', answer: 150000, hint: '330M people, ~250M cars, each station serves ~1700 cars' },
        { q: 'Hair on a human head', answer: 100000, hint: '~120-150K typical, varies by hair color' },
        { q: 'Heartbeats in a lifetime (80 yrs)', answer: 3e9, hint: '~70 bpm × 60 × 24 × 365 × 80' }
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
        feedbackExtra: `≈ ${formatLargeNumber(answer)}\n(${problem.hint})`
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

// ============ BABY MODE GENERATORS ============
function generateBabyProblem() {
    // Mostly visual problem types - minimize numerals
    const problemTypes = [
        'countingVisual',    // Count items, visual choices (most common)
        'countingVisual',    // Double weight
        'additionVisual',    // Visual addition with + symbol
        'additionVisual',    // Double weight
        'takeAway',          // Visual subtraction with hand taking away
        'takeAway',          // Double weight
        'whichMore',         // Which group has more?
        'whichLess',         // Which group has less?
        'sharing',           // Divide into equal groups (pie concept)
        'groups',            // Simple multiplication (groups of items)
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
        question: 'How many?',
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
        question: 'How many?',
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
        question: 'Put together?',
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
        question: 'How many stay?',
        answer: answer,
        choices: choices,
        choiceType: 'visual'
    };
}

// Sharing/division - splitting into equal groups
function generateBabySharing() {
    const numPeople = randInt(2, 4);
    const perPerson = randInt(2, 4);
    const total = numPeople * perPerson;
    const emoji = randChoice(BABY_ITEMS);

    // Show total items and people
    const allItems = Array(total).fill(emoji).join('');
    const people = Array(numPeople).fill('👤').join(' ');

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
        const wrong = randInt(1, 4);
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

    return {
        type: 'sharing',
        visual: `${allItems}\n🍽️ ${people}`,
        question: 'Each person gets?',
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
        question: compareType === 'more' ? 'Which has MORE?' : 'Which has LESS?',
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
        question: 'How many in all?',
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

    // Show mode screen
    elements.modeScreen.classList.add('active');
    loadProgress();
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
    if (state.mode === 'shopping') {
        elements.estimateValue.textContent = formatPrice(roundNice(state.estimate));
    } else if (state.mode === 'college') {
        elements.estimateValue.textContent = formatCollegeNumber(roundNice(state.estimate));
    } else {
        elements.estimateValue.textContent = formatNumber(roundNice(state.estimate));
    }
}

function setSliderToMiddle() {
    state.estimate = (state.minValue + state.maxValue) / 2;
    updateSliderPosition(0.5);
    updateEstimateDisplay();
}

// ============ GAME LOGIC ============
function startGame(level) {
    state.level = level;
    state.mode = LEVELS[level].mode;
    state.score = 0;
    state.streak = 0;

    // Hide level screen, show game screen
    elements.levelScreen.classList.remove('active');
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
        elements.minLabel.textContent = formatPrice(state.minValue);
        elements.maxLabel.textContent = formatPrice(state.maxValue);
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

    // Reset slider
    setSliderToMiddle();

    // Hide feedback and answer marker
    elements.feedback.classList.add('hidden');
    elements.answerMarker.classList.add('hidden');

    // Show submit, hide next
    elements.submitBtn.classList.remove('hidden');
    elements.nextBtn.classList.add('hidden');
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
    elements.modeScreen.classList.add('active');
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
    // Mode card selection (Stage 1)
    document.querySelectorAll('.mode-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;

            if (mode === 'baby') {
                // Baby mode goes directly to game
                startBabyMode();
            } else {
                // Numbers and Shopping go to level selection
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
    if (elements.collegeLevels) {
        elements.collegeLevels.classList.add('hidden');
    }

    // Update title and show appropriate levels based on mode
    if (mode === 'numbers') {
        elements.levelScreenTitle.textContent = 'Choose Difficulty';
        elements.numbersLevels.classList.remove('hidden');
    } else if (mode === 'shopping') {
        elements.levelScreenTitle.textContent = 'Choose Challenge';
        elements.shoppingLevels.classList.remove('hidden');
    } else if (mode === 'college') {
        elements.levelScreenTitle.textContent = 'Choose Topic';
        if (elements.collegeLevels) {
            elements.collegeLevels.classList.remove('hidden');
        }
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
