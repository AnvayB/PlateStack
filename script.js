// Standard plate weights available (in pounds)
const PLATE_WEIGHTS_LBS = [45, 35, 25, 10, 5, 2.5];
const PLATE_WEIGHTS_KG = [20.4, 15.9, 11.3, 4.5, 2.3, 1.1]; // Approximate kg equivalents

// Conversion constants
const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

// Current unit state
let isMetric = false;

// DOM elements
const weightInput = document.getElementById('weight-input');
const calculateBtn = document.getElementById('calculate-btn');
const resultsDiv = document.getElementById('results');
const plateListDiv = document.getElementById('plate-list');
const totalWeightSpan = document.getElementById('total-weight');
const weightPerSideSpan = document.getElementById('weight-per-side');
const barWeightDiv = document.getElementById('bar-weight');
const calculatorTypeRadios = document.querySelectorAll('input[name="calculator-type"]');

// Reverse calculator DOM elements
const reverseCalculateBtn = document.getElementById('reverse-calculate-btn');
const reverseResultsDiv = document.getElementById('reverse-results');
const reversePlateListDiv = document.getElementById('reverse-plate-list');
const reverseWeightPerSideSpan = document.getElementById('reverse-weight-per-side');
const reverseTotalWeightSpan = document.getElementById('reverse-total-weight');
const reverseBarWeightDiv = document.getElementById('reverse-bar-weight');

// Unit toggle elements
const unitToggle = document.getElementById('unit-toggle');
const weightUnitSpan = document.getElementById('weight-unit');

// Event listeners
calculateBtn.addEventListener('click', calculateWeightDistribution);
weightInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculateWeightDistribution();
    }
});

// Reverse calculator event listeners
reverseCalculateBtn.addEventListener('click', calculateReverseWeight);

// Unit toggle event listener
unitToggle.addEventListener('change', handleUnitToggle);

// Handle unit toggle
function handleUnitToggle() {
    isMetric = unitToggle.checked;
    
    // Update UI labels
    weightUnitSpan.textContent = isMetric ? 'kg' : 'lbs';
    
    // Convert current input value if it exists
    const currentValue = weightInput.value;
    if (currentValue && currentValue !== '') {
        const numValue = parseFloat(currentValue);
        if (!isNaN(numValue)) {
            if (isMetric) {
                // Convert lbs to kg
                weightInput.value = (numValue * LBS_TO_KG).toFixed(1);
            } else {
                // Convert kg to lbs
                weightInput.value = (numValue * KG_TO_LBS).toFixed(1);
            }
        }
    }
    
    // Update plate weight labels in reverse calculator
    updatePlateLabels();
    
    // Update info section plate weights
    updateInfoSection();
    
    // Recalculate if there are existing results
    if (!resultsDiv.classList.contains('hidden')) {
        calculateWeightDistribution();
    }
    if (!reverseResultsDiv.classList.contains('hidden')) {
        calculateReverseWeight();
    }
}

// Update plate labels in reverse calculator
function updatePlateLabels() {
    const plateLabels = {
        'plate-45': isMetric ? '20.4 kg' : '45 lbs',
        'plate-35': isMetric ? '15.9 kg' : '35 lbs',
        'plate-25': isMetric ? '11.3 kg' : '25 lbs',
        'plate-10': isMetric ? '4.5 kg' : '10 lbs',
        'plate-5': isMetric ? '2.3 kg' : '5 lbs',
        'plate-2-5': isMetric ? '1.1 kg' : '2.5 lbs'
    };
    
    Object.entries(plateLabels).forEach(([id, label]) => {
        const element = document.querySelector(`label[for="${id}"]`);
        if (element) {
            element.textContent = label + ':';
        }
    });
}

// Update info section plate weights
function updateInfoSection() {
    const plateWeightElements = document.querySelectorAll('.plate-weight');
    const weights = isMetric ? PLATE_WEIGHTS_KG : PLATE_WEIGHTS_LBS;
    const unit = isMetric ? ' kg' : ' lbs';
    
    plateWeightElements.forEach((element, index) => {
        if (index < weights.length) {
            element.textContent = weights[index] + unit;
        }
    });
}

// Conversion helper functions
function convertToMetric(weight) {
    return weight * LBS_TO_KG;
}

function convertToImperial(weight) {
    return weight * KG_TO_LBS;
}

function formatWeight(weight, unit) {
    return `${weight.toFixed(1)} ${unit}`;
}

// Main calculation function
function calculateWeightDistribution() {
    const weight = parseFloat(weightInput.value);
    const calculatorType = document.querySelector('input[name="calculator-type"]:checked').value;
    
    if (!weight || weight <= 0) {
        alert('Please enter a valid weight greater than 0.');
        return;
    }
    
    let targetWeight, barWeight = 0;
    
    if (calculatorType === 'bench') {
        // For bench press, subtract 45lb bar weight (or 20.4kg)
        barWeight = isMetric ? 20.4 : 45;
        targetWeight = weight - barWeight;
        
        if (targetWeight < 0) {
            const barWeightText = isMetric ? '20.4 kg' : '45 lbs';
            alert(`Weight must be at least ${barWeightText} for bench press (bar weight).`);
            return;
        }
    } else {
        // For general calculator, use the full weight
        targetWeight = weight;
    }
    
    // Calculate plates needed for each side
    const platesPerSide = calculatePlatesForWeight(targetWeight / 2);
    
    if (platesPerSide.length === 0) {
        alert('Unable to achieve this weight with standard plates. Please try a different weight.');
        return;
    }
    
    // Display results
    displayResults(platesPerSide, weight, barWeight, calculatorType);
}

// Reverse calculation function
function calculateReverseWeight() {
    const plateInputs = {
        45: parseInt(document.getElementById('plate-45').value) || 0,
        35: parseInt(document.getElementById('plate-35').value) || 0,
        25: parseInt(document.getElementById('plate-25').value) || 0,
        10: parseInt(document.getElementById('plate-10').value) || 0,
        5: parseInt(document.getElementById('plate-5').value) || 0,
        2.5: parseInt(document.getElementById('plate-2-5').value) || 0
    };
    
    const calculatorType = document.querySelector('input[name="reverse-calculator-type"]:checked').value;
    
    // Calculate weight per side (always in lbs for plate calculations)
    let weightPerSide = 0;
    const platesPerSide = [];
    
    Object.entries(plateInputs).forEach(([weight, count]) => {
        const plateWeight = parseFloat(weight);
        for (let i = 0; i < count; i++) {
            platesPerSide.push(plateWeight);
            weightPerSide += plateWeight;
        }
    });
    
    if (weightPerSide === 0) {
        alert('Please enter at least one plate.');
        return;
    }
    
    // Calculate total weight
    let totalWeight = weightPerSide * 2; // Both sides
    let barWeight = 0;
    
    if (calculatorType === 'bench') {
        barWeight = 45; // Always 45 lbs for bar
        totalWeight += barWeight;
    }
    
    // Convert to metric if needed
    if (isMetric) {
        weightPerSide = convertToMetric(weightPerSide);
        totalWeight = convertToMetric(totalWeight);
        barWeight = convertToMetric(barWeight);
    }
    
    // Display reverse results
    displayReverseResults(platesPerSide, weightPerSide, totalWeight, barWeight, calculatorType);
}

// Calculate optimal plate combination for a given weight
function calculatePlatesForWeight(targetWeight) {
    const plates = [];
    let remainingWeight = targetWeight;
    
    // Use the appropriate plate weights based on current unit
    const plateWeights = isMetric ? PLATE_WEIGHTS_KG : PLATE_WEIGHTS_LBS;
    
    // Use greedy approach - start with largest plates
    for (const plateWeight of plateWeights) {
        while (remainingWeight >= plateWeight) {
            plates.push(plateWeight);
            remainingWeight -= plateWeight;
        }
    }
    
    // If we can't achieve exact weight, return empty array
    if (Math.abs(remainingWeight) > 0.1) {
        return [];
    }
    
    return plates;
}

// Display the calculation results
function displayResults(platesPerSide, totalWeight, barWeight, calculatorType) {
    // Show results section
    resultsDiv.classList.remove('hidden');
    
    // Display plates
    plateListDiv.innerHTML = '';
    if (platesPerSide.length === 0) {
        plateListDiv.innerHTML = '<p>No plates needed</p>';
    } else {
        // Group plates by weight and count them
        const plateCounts = {};
        platesPerSide.forEach(plate => {
            plateCounts[plate] = (plateCounts[plate] || 0) + 1;
        });
        
        // Create plate elements
        Object.entries(plateCounts).forEach(([weight, count]) => {
            const plateElement = document.createElement('div');
            plateElement.className = 'plate';
            const unit = isMetric ? ' kg' : ' lbs';
            plateElement.textContent = `${weight}${unit}`;
            
            if (count > 1) {
                plateElement.textContent += ` (${count})`;
            }
            
            plateListDiv.appendChild(plateElement);
        });
    }
    
    // Update weight information
    const unit = isMetric ? ' kg' : ' lbs';
    totalWeightSpan.textContent = formatWeight(totalWeight, unit);
    
    const weightPerSide = platesPerSide.reduce((sum, plate) => sum + plate, 0);
    weightPerSideSpan.textContent = formatWeight(weightPerSide, unit);
    
    // Show/hide bar weight for bench press
    if (calculatorType === 'bench') {
        reverseBarWeightDiv.classList.remove('hidden');
        const barWeightElement = reverseBarWeightDiv.querySelector('.value');
        barWeightElement.textContent = formatWeight(barWeight, unit);
    } else {
        reverseBarWeightDiv.classList.add('hidden');
    }
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Display reverse calculation results
function displayReverseResults(platesPerSide, weightPerSide, totalWeight, barWeight, calculatorType) {
    // Show results section
    reverseResultsDiv.classList.remove('hidden');
    
    // Display plates (always show in lbs since that's what plates are)
    reversePlateListDiv.innerHTML = '';
    if (platesPerSide.length === 0) {
        reversePlateListDiv.innerHTML = '<p>No plates entered</p>';
    } else {
        // Group plates by weight and count them
        const plateCounts = {};
        platesPerSide.forEach(plate => {
            plateCounts[plate] = (plateCounts[plate] || 0) + 1;
        });
        
        // Create plate elements
        Object.entries(plateCounts).forEach(([weight, count]) => {
            const plateElement = document.createElement('div');
            plateElement.className = 'plate';
            plateElement.textContent = `${weight} lbs`;
            
            if (count > 1) {
                plateElement.textContent += ` (${count})`;
            }
            
            reversePlateListDiv.appendChild(plateElement);
        });
    }
    
    // Update weight information
    const unit = isMetric ? ' kg' : ' lbs';
    reverseWeightPerSideSpan.textContent = formatWeight(weightPerSide, unit);
    reverseTotalWeightSpan.textContent = formatWeight(totalWeight, unit);
    
    // Show/hide bar weight for bench press
    if (calculatorType === 'bench') {
        reverseBarWeightDiv.classList.remove('hidden');
        const barWeightElement = reverseBarWeightDiv.querySelector('.value');
        barWeightElement.textContent = formatWeight(barWeight, unit);
    } else {
        reverseBarWeightDiv.classList.add('hidden');
    }
    
    // Scroll to results
    reverseResultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Add some example functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize unit display
    updatePlateLabels();
    updateInfoSection();
    
    // Add example button functionality
    const addExampleButton = () => {
        const exampleBtn = document.createElement('button');
        exampleBtn.textContent = 'Try Example: 145 lbs';
        exampleBtn.className = 'example-btn';
        exampleBtn.style.cssText = `
            background: #28a745;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            margin-top: 1rem;
            cursor: pointer;
            font-size: 0.9rem;
        `;
        
        exampleBtn.addEventListener('click', () => {
            weightInput.value = '145';
            calculateWeightDistribution();
        });
        
        document.querySelector('.calculator-section').appendChild(exampleBtn);
    };
    
    // Add reverse example button
    const addReverseExampleButton = () => {
        const reverseExampleBtn = document.createElement('button');
        reverseExampleBtn.textContent = 'Try Example: 1x45 + 1x10';
        reverseExampleBtn.className = 'example-btn';
        reverseExampleBtn.style.cssText = `
            background: #17a2b8;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            margin-top: 1rem;
            cursor: pointer;
            font-size: 0.9rem;
        `;
        
        reverseExampleBtn.addEventListener('click', () => {
            document.getElementById('plate-45').value = '1';
            document.getElementById('plate-10').value = '1';
            calculateReverseWeight();
        });
        
        document.querySelector('.reverse-calculator').appendChild(reverseExampleBtn);
    };
    
    addExampleButton();
    addReverseExampleButton();
}); 