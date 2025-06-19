// Section Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Daily Health Tip
const tips = [
    "Drink at least 2 liters of water daily to stay hydrated.",
    "Aim for 30 minutes of physical activity most days of the week.",
    "Get 7-9 hours of sleep per night for optimal health.",
    "Put your phone away 1 hour before bed to improve sleep quality and reduce anxiety.",
    "Practice deep breathing for 60 seconds when you feel stressed - it activates your body's relaxation response.",
    "Choose stairs over elevators when possible to strengthen your heart and legs.",
    "Stop eating 3 hours before bedtime to improve sleep quality and digestion."
];

function displayDailyTip() {
    const tipElement = document.getElementById('dailyTip');
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipElement.textContent = `Daily Tip: ${randomTip}`;
}

// Subcategory Mapping
const subcategories = {
    Nutrition: ["Dietary Guidelines", "Micronutrients", "Macronutrients", "Hydration"],
    "Mental Health": ["Stress Management", "Anxiety", "Depression", "Mindfulness", "Cognitive Health"],
    Fitness: ["Strength Training", "Cardio", "Flexibility", "Recovery"],
    "Cardiovascular Health": ["Cholesterol", "Heart Rate", "Vascular Health"],
    "Sleep Health": ["Sleep Hygiene", "Insomnia", "Sleep Disorders", "Circadian Rhythm"],
    "Preventive Care": ["Vaccinations", "Screenings", "Lifestyle Factors", "Injury Prevention"],
    "Chronic Conditions": ["Diabetes", "Hypertension", "Asthma"]
};

function updateSubcategories() {
    const category = document.getElementById('category').value;
    const subcategorySelect = document.getElementById('subcategory');
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    if (category && subcategories[category]) {
        subcategories[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subcategorySelect.appendChild(option);
        });
    }
}

// Quiz State
let currentQuiz = {
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    startTime: null,
    type: '',
    userName: '',
    category: '',
    subcategory: ''
};

// Fetch Questions from JSON
async function fetchQuestions() {
    try {
        const response = await fetch('mini.json');
        if (!response.ok) throw new Error('Failed to fetch questions');
        return await response.json();
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

// Shuffle Array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Quick Quiz Setup
document.getElementById('quickQuizForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    currentQuiz.userName = document.getElementById('quickName').value;
    currentQuiz.category = document.getElementById('category').value;
    currentQuiz.subcategory = document.getElementById('subcategory').value;
    currentQuiz.type = 'quick';
    
    const allQuestions = await fetchQuestions();
    let filteredQuestions = allQuestions.filter(q => 
        q.category === currentQuiz.category && 
        q.subcategory === currentQuiz.subcategory
    );
    if (filteredQuestions.length === 0) {
        alert('No questions available for this category/subcategory.');
        return;
    }
    currentQuiz.questions = shuffle([...filteredQuestions]).slice(0, 5); // Random 5 questions
    
    startQuiz();
});

// Custom Quiz Setup
document.getElementById('customQuizForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentQuiz.userName = document.getElementById('customName').value;
    currentQuiz.type = 'custom';
    showProfilingQuestions();
});

// Profiling Questions
function showProfilingQuestions() {
    const profilingDiv = document.getElementById('profilingQuestions');
    const questions = [
        {
            id: 'dietPreference',
            question: 'What is your dietary preference?',
            options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Other']
        },
        {
            id: 'activityLevel',
            question: 'How many days a week do you engage in physical activity?',
            options: ['0-1', '2-3', '4-5', '6-7']
        },
        {
            id: 'stressLevel',
            question: 'How would you rate your stress level?',
            options: ['Low', 'Moderate', 'High']
        }
    ];

    let html = '<form id="profilingForm">';
    questions.forEach(q => {
        html += `<label>${q.question}</label><select id="${q.id}" required>`;
        html += '<option value="">Select</option>';
        q.options.forEach(opt => {
            html += `<option value="${opt}">${opt}</option>`;
        });
        html += '</select><br>';
    });
    html += '</form>';
    profilingDiv.innerHTML = html;
    showSection('customProfiling');
}

// Start Custom Quiz
async function startCustomQuiz() {
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const healthGoal = document.getElementById('healthGoal').value;
    const fitnessLevel = document.getElementById('fitnessLevel').value;
    const medicalHistory = document.getElementById('medicalHistory').value;
    const dietPreference = document.getElementById('dietPreference').value;
    const activityLevel = document.getElementById('activityLevel').value;
    const stressLevel = document.getElementById('stressLevel').value;

    const allQuestions = await fetchQuestions();
    let categories = ['Nutrition', 'Mental Health', 'Fitness'];
    if (medicalHistory !== 'None') categories.push('Chronic Conditions');
    if (healthGoal === 'Better Sleep') categories.push('Sleep Health');

    currentQuiz.questions = [];
    categories.forEach(cat => {
        let catQuestions = allQuestions.filter(q => q.category === cat);
        if (catQuestions.length > 0) {
            currentQuiz.questions.push(...shuffle([...catQuestions]).slice(0, 2)); // Random 2 questions per category
        }
    });

    if (currentQuiz.questions.length === 0) {
        alert('No questions available for your profile.');
        return;
    }

    startQuiz();
}

// Start Quiz
function startQuiz() {
    currentQuiz.currentIndex = 0;
    currentQuiz.score = 0;
    currentQuiz.answers = [];
    currentQuiz.startTime = new Date();
    showSection('quiz');
    loadQuestion();
}

// Timer
let timerInterval;
function startTimer() {
    let timeLeft = 40; // 40 seconds per question
    const timerElement = document.getElementById('timer');
    
    timerInterval = setInterval(() => {
        const seconds = timeLeft % 60;
        timerElement.textContent = `Time Left: ${seconds} seconds`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            // Automatically submit empty answer if time runs out
            currentQuiz.answers.push({
                question: currentQuiz.questions[currentQuiz.currentIndex].question,
                userAnswer: null,
                isCorrect: false,
                explanation: currentQuiz.questions[currentQuiz.currentIndex].explanation
            });
            loadNextQuestion();
        }
    }, 1000);
}

// Load Question
function loadQuestion() {
    const q = currentQuiz.questions[currentQuiz.currentIndex];
    const questionNumber = currentQuiz.currentIndex + 1;
    const totalQuestions = currentQuiz.questions.length;
    document.getElementById('quizTitle').textContent = `${currentQuiz.type === 'quick' ? 'Quick' : 'Custom'} Quiz: ${q.category} - ${q.subcategory} (Question ${questionNumber}/${totalQuestions})`;
    const questionDiv = document.getElementById('question');
    const optionsDiv = document.getElementById('options');
    questionDiv.innerHTML = '';
    optionsDiv.innerHTML = '';

    questionDiv.innerHTML = `<p>${q.question}</p>`;
    if (q.image) {
        questionDiv.innerHTML += `<img src="${q.image}" alt="Question Image" style="max-width: 300px;">`;
    }

    if (q.type === 'mcq' || q.type === 'image' || q.type === 'picture' || q.type === 'pictureBased') {
        q.options.forEach(opt => {
            optionsDiv.innerHTML += `
                <label>
                    <input type="radio" name="answer" value="${opt}" required>
                    ${opt}
                </label><br>
            `;
        });
    } else if (q.type === 'multiSelect' || q.type === 'multiple') {
        q.options.forEach(opt => {
            optionsDiv.innerHTML += `
                <label>
                    <input type="checkbox" name="answer" value="${opt}">
                    ${opt}
                </label><br>
            `;
        });
    } else if (q.type === 'trueFalse') {
        q.options.forEach(opt => {
            optionsDiv.innerHTML += `
                <label>
                    <input type="radio" name="answer" value="${opt}" required>
                    ${opt}
                </label><br>
            `;
        });
    } else if (q.type === 'match' || q.type === 'matching') {
        const leftItems = q.options ? Object.keys(q.options) : q.pairs.map(p => p.left);
        const rightItems = shuffle([...(q.options ? Object.values(q.options).flat() : q.pairs.map(p => p.right))]);
        leftItems.forEach(left => {
            optionsDiv.innerHTML += `
                <p>${left}: 
                    <select name="answer_${left}" required>
                        <option value="">Select</option>
                        ${rightItems.map(right => `<option value="${right}">${right}</option>`).join('')}
                    </select>
                </p>
            `;
        });
    }

    document.getElementById('submitAnswer').classList.remove('hidden');
    document.getElementById('nextQuestionBtn').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
    
    // Start timer for the new question
    clearInterval(timerInterval); // Clear any existing timer
    startTimer();
}

// Submit Answer
function submitAnswer() {
    const q = currentQuiz.questions[currentQuiz.currentIndex];
    let userAnswer;
    let isCorrect = false;

    if (q.type === 'mcq' || q.type === 'image' || q.type === 'picture' || q.type === 'pictureBased' || q.type === 'trueFalse') {
        userAnswer = document.querySelector('input[name="answer"]:checked')?.value;
        isCorrect = userAnswer === q.correct;
    } else if (q.type === 'multiSelect' || q.type === 'multiple') {
        userAnswer = Array.from(document.querySelectorAll('input[name="answer"]:checked')).map(cb => cb.value);
        isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(q.correct.sort());
    } else if (q.type === 'match' || q.type === 'matching') {
        userAnswer = {};
        const selects = document.querySelectorAll('select[name^="answer_"]');
        selects.forEach(select => {
            const key = select.name.replace('answer_', '');
            userAnswer[key] = select.value;
        });
        isCorrect = q.options ? 
            Object.keys(q.correct).every(key => userAnswer[key] === q.correct[key]) :
            q.pairs.every(p => userAnswer[p.left] === p.right);
    }

    if (isCorrect) currentQuiz.score++;
    currentQuiz.answers.push({ question: q.question, userAnswer, isCorrect, explanation: q.explanation });

    const explanationDiv = document.getElementById('explanation');
    explanationDiv.innerHTML = `
        <p><strong>Correct Answer:</strong> ${q.type === 'multiSelect' || q.type === 'multiple' ? q.correct.join(', ') : q.type === 'match' || q.type === 'matching' ? JSON.stringify(q.correct) : q.correct}</p>
        <p><strong>Explanation:</strong> ${q.explanation}</p>
    `;
    explanationDiv.classList.remove('hidden');

    document.getElementById('submitAnswer').classList.add('hidden');
    document.getElementById('nextQuestionBtn').classList.remove('hidden');

    clearInterval(timerInterval); // Stop timer when answer is submitted
}

// Load Next Question
function loadNextQuestion() {
    currentQuiz.currentIndex++;
    if (currentQuiz.currentIndex < currentQuiz.questions.length) {
        loadQuestion();
    } else {
        clearInterval(timerInterval);
        showResults();
    }
}

// Show Results
function showResults() {
    const endTime = new Date();
    const timeTaken = Math.round((endTime - currentQuiz.startTime) / 1000);
    const resultDiv = document.getElementById('resultDetails');
    let html = `
        <h3>Results for ${currentQuiz.userName}</h3>
        <p>Score: ${currentQuiz.score} / ${currentQuiz.questions.length}</p>
        <p>Time Taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</p>
        <h4>Summary:</h4>
        <ul>
    `;
    currentQuiz.answers.forEach((ans, index) => {
        html += `
            <li>
                <strong>Q${index + 1}: ${ans.question}</strong><br>
                Your Answer: ${Array.isArray(ans.userAnswer) ? ans.userAnswer.join(', ') : ans.userAnswer || 'None'}<br>
                Status: ${ans.isCorrect ? 'Correct' : 'Incorrect'}<br>
                Explanation: ${ans.explanation}
            </li>
        `;
    });
    html += '</ul>';
    resultDiv.innerHTML = html;
    showSection('result');
    
    saveToProfile('quiz', {
        name: currentQuiz.userName,
        type: currentQuiz.type,
        category: currentQuiz.category || 'Custom',
        subcategory: currentQuiz.subcategory || 'Custom',
        score: currentQuiz.score,
        total: currentQuiz.questions.length,
        date: new Date().toLocaleString()
    });
}

// Profile Management
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || { quizzes: [], calculators: [] };

function saveToProfile(type, data) {
    if (type === 'quiz') {
        userProfile.quizzes.push(data);
    } else if (type === 'calculator') {
        userProfile.calculators.push(data);
    }
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    displayProfile();
}

function clearProfileHistory() {
    if (confirm('Are you sure you want to delete all quiz and calculator history? This action cannot be undone.')) {
        userProfile = { quizzes: [], calculators: [] };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        displayProfile();
    }
}

function displayProfile() {
    const profileDiv = document.getElementById('profileResults');
    let html = '<h3>Your Health History</h3>';

    html += '<h4>Quiz History</h4>';
    if (userProfile.quizzes.length === 0) {
        html += '<p>No quizzes taken yet.</p>';
    } else {
        html += '<ul>';
        userProfile.quizzes.forEach(quiz => {
            html += `
                <li>
                    ${quiz.date}: ${quiz.name} took a ${quiz.type} quiz in ${quiz.category} - ${quiz.subcategory}<br>
                    Score: ${quiz.score}/${quiz.total}
                </li>
            `;
        });
        html += '</ul>';
    }

    html += '<h4>Calculator History</h4>';
    if (userProfile.calculators.length === 0) {
        html += '<p>No calculators used yet.</p>';
    } else {
        html += '<ul>';
        userProfile.calculators.forEach(calc => {
            html += `
                <li>
                    ${calc.date}: ${calc.name} used ${calc.type}<br>
                    Result: ${calc.result}
                </li>
            `;
        });
        html += '</ul>';
    }

    html += '<button onclick="clearProfileHistory()">Clear All History</button>';
    profileDiv.innerHTML = html;
}

// Calculator Implementations
function initCalculators() {
    // Calorie Needs Calculator
    document.getElementById('calorieCalc').innerHTML = `
        <h3>Calorie Needs Calculator</h3>
        <form id="calorieForm">
            <label>Age (years):</label><input type="number" id="calorieAge" min="10" max="120" required><br>
            <label>Gender:</label>
            <select id="calorieGender" required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select><br>
            <label>Weight (kg):</label><input type="number" id="calorieWeight" min="30" max="200" step="0.1" required><br>
            <label>Height (cm):</label><input type="number" id="calorieHeight" min="100" max="250" step="0.1" required><br>
            <label>Dietary Preference:</label>
            <select id="calorieDiet" required>
                <option value="">Select</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="nonVegetarian">Non-Vegetarian</option>
            </select><br>
            <label>Exercise Frequency (days/week):</label>
            <select id="calorieExercise" required>
                <option value="">Select</option>
                <option value="0-1">0-1</option>
                <option value="2-3">2-3</option>
                <option value="4-5">4-5</option>
                <option value="6-7">6-7</option>
            </select><br>
            <label>Health Goal:</label>
            <select id="calorieGoal" required>
                <option value="">Select</option>
                <option value="weightLoss">Weight Loss</option>
                <option value="maintain">Maintain</option>
                <option value="muscleGain">Muscle Gain</option>
            </select><br>
            <button type="submit">Calculate</button>
        </form>
        <div id="calorieResult"></div>
    `;
    document.getElementById('calorieForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const age = parseFloat(document.getElementById('calorieAge').value);
        const gender = document.getElementById('calorieGender').value;
        const weight = parseFloat(document.getElementById('calorieWeight').value);
        const height = parseFloat(document.getElementById('calorieHeight').value);
        const diet = document.getElementById('calorieDiet').value;
        const exercise = document.getElementById('calorieExercise').value;
        const goal = document.getElementById('calorieGoal').value;

        // Mifflin-St Jeor Equation
        let bmr = gender === 'male' ?
            10 * weight + 6.25 * height - 5 * age + 5 :
            10 * weight + 6.25 * height - 5 * age - 161;

        // Activity multiplier based on exercise frequency
        const activityLevels = { '0-1': 1.2, '2-3': 1.375, '4-5': 1.55, '6-7': 1.725 };
        let calories = bmr * activityLevels[exercise];

        // Adjust for goal
        if (goal === 'weightLoss') calories *= 0.85; // 15% deficit
        else if (goal === 'muscleGain') calories *= 1.15; // 15% surplus

        calories = Math.round(calories);

        // Personalized recommendations
        let tips = [];
        if (diet === 'vegetarian' || diet === 'vegan') {
            tips.push("Ensure adequate protein from sources like lentils, tofu, and quinoa.");
            if (diet === 'vegan') tips.push("Consider B12 supplements or fortified foods.");
        } else {
            tips.push("Include lean proteins like chicken, fish, or eggs for muscle repair.");
        }
        if (goal === 'weightLoss') {
            tips.push("Focus on high-fiber foods like vegetables and whole grains to stay full.");
        } else if (goal === 'muscleGain') {
            tips.push("Eat protein-rich meals within 2 hours post-workout for muscle recovery.");
        }
        if (exercise === '0-1') {
            tips.push("Incorporate light activity like walking to boost metabolism.");
        }

        const resultDiv = document.getElementById('calorieResult');
        resultDiv.innerHTML = `
            <p><strong>Daily Calorie Needs:</strong> ${calories} kcal</p>
            <p>This estimate supports your ${goal.replace(/([A-Z])/g, ' $1').toLowerCase()} goal based on your ${exercise} days/week exercise frequency.</p>
            <p><strong>Recommendations:</strong></p>
            <ul>${tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        `;

        saveToProfile('calculator', {
            name: currentQuiz.userName || 'User',
            type: 'Calorie Needs',
            result: `${calories} kcal (${goal})`,
            date: new Date().toLocaleString()
        });
    });

    // Healthy Plate Guide
    document.getElementById('plateGuideCalc').innerHTML = `
        <h3>Healthy Plate Guide</h3>
        <form id="plateForm">
            <label>Health Goal:</label>
            <select id="plateGoal" required>
                <option value="">Select</option>
                <option value="weightLoss">Weight Loss</option>
                <option value="muscleGain">Muscle Gain</option>
                <option value="general">General Wellness</option>
            </select><br>
            <label>Dietary Preference:</label>
            <select id="plateDiet" required>
                <option value="">Select</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="nonVegetarian">Non-Vegetarian</option>
            </select><br>
            <label>Grain Preference:</label>
            <select id="plateGrain" required>
                <option value="">Select</option>
                <option value="rice">Rice-Based</option>
                <option value="wheat">Wheat-Based</option>
                <option value="mixed">Mixed</option>
            </select><br>
            <button type="submit">Generate Plate</button>
        </form>
        <div id="plateResult"></div>
    `;
    document.getElementById('plateForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const goal = document.getElementById('plateGoal').value;
        const diet = document.getElementById('plateDiet').value;
        const grain = document.getElementById('plateGrain').value;
        let plate = {};

        // Adjust plate based on goal, diet, and grain preference
        if (goal === 'weightLoss') {
            plate = {
                vegetables: 50,
                protein: 25,
                grains: 15,
                fruits: 10
            };
        } else if (goal === 'muscleGain') {
            plate = {
                vegetables: 30,
                protein: diet === 'vegan' ? 35 : 40,
                grains: diet === 'vegan' ? 25 : 20,
                fruits: 10
            };
        } else {
            plate = {
                vegetables: 40,
                protein: 25,
                grains: 25,
                fruits: 10
            };
        }

        // Recommendations tailored for Indian users
        let tips = [];
        if (diet === 'vegetarian' || diet === 'vegan') {
            tips.push("Include plant-based proteins like chana, rajma, or paneer.");
            if (diet === 'vegan') tips.push("Ensure omega-3 from flaxseeds or walnuts.");
        } else {
            tips.push("Choose lean proteins like chicken, fish, or eggs for satiety.");
        }
        if (grain === 'rice') {
            tips.push("Opt for brown rice or red rice for higher fiber content.");
        } else if (grain === 'wheat') {
            tips.push("Use whole wheat roti or millets like jowar for better nutrition.");
        } else {
            tips.push("Combine brown rice and whole wheat for balanced carbs.");
        }
        if (goal === 'weightLoss') {
            tips.push("Fill half your plate with low-calorie vegetables like bhindi or lauki.");
        } else if (goal === 'muscleGain') {
            tips.push("Pair protein with complex carbs like dal and roti for muscle repair.");
        }
        tips.push("Use a standard 9-inch thali to control portion sizes.");

        const resultDiv = document.getElementById('plateResult');
        resultDiv.innerHTML = `
            <p><strong>Your Healthy Plate:</strong></p>
            <ul>
                <li>Vegetables: ${plate.vegetables}% (e.g., palak, gobi)</li>
                <li>Protein: ${plate.protein}% (e.g., dal, paneer)</li>
                <li>Grains: ${plate.grains}% (${grain === 'rice' ? 'rice' : grain === 'wheat' ? 'roti' : 'rice/roti'})</li>
                <li>Fruits: ${plate.fruits}% (e.g., mango, guava)</li>
            </ul>
            <p>This plate is tailored for ${goal.replace(/([A-Z])/g, ' $1').toLowerCase()} with ${diet} and ${grain} preferences.</p>
            <p><strong>Recommendations:</strong></p>
            <ul>${tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        `;

        saveToProfile('calculator', {
            name: currentQuiz.userName || 'User',
            type: 'Healthy Plate',
            result: `Vegetables: ${plate.vegetables}%, Protein: ${plate.protein}%, Grains: ${plate.grains}%, Fruits: ${plate.fruits}%`,
            date: new Date().toLocaleString()
        });
    });

    // Hydration Needs Calculator
    document.getElementById('hydrationCalc').innerHTML = `
        <h3>Hydration Needs Calculator</h3>
        <form id="hydrationForm">
            <label>Weight (kg):</label><input type="number" id="hydrationWeight" min="30" max="200" step="0.1" required><br>
            <label>Exercise Frequency (days/week):</label>
            <select id="hydrationExercise" required>
                <option value="">Select</option>
                <option value="0-1">0-1</option>
                <option value="2-3">2-3</option>
                <option value="4-5">4-5</option>
                <option value="6-7">6-7</option>
            </select><br>
            <label>Climate:</label>
            <select id="hydrationClimate" required>
                <option value="">Select</option>
                <option value="temperate">Temperate</option>
                <option value="hot">Hot/Humid</option>
            </select><br>
            <label>Health Conditions:</label>
            <select id="hydrationCondition" required>
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="diabetes">Diabetes</option>
                <option value="kidney">Kidney Issues</option>
            </select><br>
            <button type="submit">Calculate</button>
        </form>
        <div id="hydrationResult"></div>
    `;
    document.getElementById('hydrationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('hydrationWeight').value);
        const exercise = document.getElementById('hydrationExercise').value;
        const climate = document.getElementById('hydrationClimate').value;
        const condition = document.getElementById('hydrationCondition').value;

        let baseWater = weight * 33; // 33 ml/kg
        const exerciseAdd = { '0-1': 0, '2-3': 500, '4-5': 750, '6-7': 1000 };
        baseWater += exerciseAdd[exercise];
        if (climate === 'hot') baseWater += 500;
        if (condition === 'diabetes') baseWater += 300; // Extra for glucose management
        else if (condition === 'kidney') baseWater -= 200; // Conservative estimate

        const liters = (baseWater / 1000).toFixed(2);

        // Recommendations
        let tips = [];
        if (exercise !== '0-1') {
            tips.push("Drink water before, during, and after exercise to stay hydrated.");
        }
        if (climate === 'hot') {
            tips.push("Carry a water bottle to sip regularly in hot weather.");
        }
        if (condition === 'diabetes') {
            tips.push("Monitor blood sugar, as dehydration can affect glucose levels.");
        } else if (condition === 'kidney') {
            tips.push("Consult your doctor for precise fluid intake recommendations.");
        }
        tips.push("Spread water intake evenly throughout the day for best absorption.");

        const resultDiv = document.getElementById('hydrationResult');
        resultDiv.innerHTML = `
            <p><strong>Daily Water Needs:</strong> ${liters} liters</p>
            <p>This accounts for your weight, ${exercise} days/week exercise, ${climate} climate, and ${condition === 'none' ? 'no' : condition} health conditions.</p>
            <p><strong>Recommendations:</strong></p>
            <ul>${tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        `;

        saveToProfile('calculator', {
            name: currentQuiz.userName || 'User',
            type: 'Hydration Needs',
            result: `${liters} liters`,
            date: new Date().toLocaleString()
        });
    });

    // Body Fat Percentage Calculator
    document.getElementById('bodyFatCalc').innerHTML = `
        <h3>Body Fat Percentage Calculator</h3>
        <form id="bodyFatForm">
            <label>Gender:</label>
            <select id="bodyFatGender" required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select><br>
            <label>Age (years):</label><input type="number" id="bodyFatAge" min="10" max="120" required><br>
            <label>Weight (kg):</label><input type="number" id="bodyFatWeight" min="30" max="200" step="0.1" required><br>
            <label>Height (cm):</label><input type="number" id="bodyFatHeight" min="100" max="250" step="0.1" required><br>
            <label>Exercise Frequency (days/week):</label>
            <select id="bodyFatExercise" required>
                <option value="">Select</option>
                <option value="0-1">0-1</option>
                <option value="2-3">2-3</option>
                <option value="4-5">4-5</option>
                <option value="6-7">6-7</option>
            </select><br>
            <button type="submit">Calculate</button>
        </form>
        <div id="bodyFatResult"></div>
    `;
    document.getElementById('bodyFatForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const gender = document.getElementById('bodyFatGender').value;
        const age = parseFloat(document.getElementById('bodyFatAge').value);
        const weight = parseFloat(document.getElementById('bodyFatWeight').value);
        const height = parseFloat(document.getElementById('bodyFatHeight').value);
        const exercise = document.getElementById('bodyFatExercise').value;

        // Calculate BMI
        const heightMeters = height / 100;
        const bmi = weight / (heightMeters * heightMeters);

        // Estimate body fat using BMI-based formula (Deurenberg et al.)
        let bodyFat = (1.2 * bmi) + (0.23 * age) - (10.8 * (gender === 'male' ? 1 : 0)) - 5.4;
        bodyFat = Math.round(bodyFat * 10) / 10;

        // Recommendations
        let tips = [];
        if (bodyFat > (gender === 'male' ? 25 : 32)) {
            tips.push("Incorporate cardio and strength training to reduce body fat.");
            tips.push("Focus on a balanced diet with high-fiber foods like dal and vegetables.");
        } else if (bodyFat < (gender === 'male' ? 10 : 18)) {
            tips.push("Ensure adequate calorie intake with nutrient-dense foods like nuts and ghee.");
        }
        if (exercise === '0-1') {
            tips.push("Start with 2-3 days of brisk walking or yoga to improve fitness.");
        } else if (exercise === '6-7') {
            tips.push("Include rest days with light stretching to prevent overtraining.");
        }
        tips.push("Track progress monthly for consistent results.");

        const resultDiv = document.getElementById('bodyFatResult');
        resultDiv.innerHTML = `
            <p><strong>Body Fat Percentage:</strong> ${bodyFat}%</p>
            <p>Estimated using a BMI-based method for your ${gender} body, age ${age}, and ${exercise} days/week exercise.</p>
            <p><strong>Recommendations:</strong></p>
            <ul>${tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        `;

        saveToProfile('calculator', {
            name: currentQuiz.userName || 'User',
            type: 'Body Fat Percentage',
            result: `${bodyFat}%`,
            date: new Date().toLocaleString()
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayDailyTip();
    showSection('home');
    initCalculators();
    displayProfile();
    
    // Ensure subcategory updates on category change
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', updateSubcategories);
        updateSubcategories(); // Initial call to populate subcategories
    }
});