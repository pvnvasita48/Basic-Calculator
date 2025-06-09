// Get the display element from the DOM
let display = document.getElementById("display");
// Initialize memory variable
let memory = 0;
// Initialize variables to store the first operand, operator, and percentage calculation state
let firstOperand = null;
let operator = null;
let isNextNumberNew = true; // Flag to indicate if the next number should overwrite or append

// --- Helper Functions ---

/**
 * Parses the current display value to a number.
 * Returns NaN if the display shows an error or is not a valid number.
 * @returns {number} The parsed number or NaN.
 */
function getDisplayNumber() {
    if (display.value === "Error" || display.value === "Cannot divide by zero") {
        return NaN; // Indicate an error state that should halt operations
    }
    return parseFloat(display.value);
}

/**
 * Resets the core calculator state (operands, operator).
 */
function resetCoreState() {
    firstOperand = null;
    operator = null;
    isNextNumberNew = true; // After an operation or clear, next input starts a new number
}

/**
 * Sets the display value, handling precision for numbers.
 * @param {string | number} value - The value to display.
 */
function setDisplayValue(value) {
    if (typeof value === 'number' && isFinite(value)) {
        // Limit precision to avoid long floating point numbers
        display.value = parseFloat(value.toPrecision(12)).toString();
    } else {
        display.value = value.toString();
    }
}

// --- Main Calculator Functions ---

// Function to append a value (number or decimal point) to the display
function appendValue(value) {
    if (display.value === "Error" || display.value === "Cannot divide by zero" || isNextNumberNew) {
        setDisplayValue(value === '.' ? "0." : value); // Start new number, handle leading decimal
        isNextNumberNew = false;
    } else {
        // Prevent multiple decimal points
        if (value === '.' && display.value.includes('.')) return;
        display.value += value;
    }
}

// Function to clear the display and reset calculator state
function clearDisplay() {
    setDisplayValue("0"); // Show 0 by default after clear
    resetCoreState();
    // memory remains unchanged by C/CE, only by MC
}

// Function to delete the last character from the display
function deleteLast() {
    if (display.value === "Error" || display.value === "Cannot divide by zero") {
        clearDisplay();
        return;
    }
    display.value = display.value.slice(0, -1);
    if (display.value === "" || display.value === "-") { // Handle empty or just negative sign
        setDisplayValue("0");
        isNextNumberNew = true;
    }
}

// Function to set the operator and store the first operand
function setOperator(op) {
    const currentDisplayNumber = getDisplayNumber();

    if (isNaN(currentDisplayNumber) && display.value !== "0") { // Allow "0" as valid input for operations
         // If display is "Error" or "Cannot divide by zero", getDisplayNumber returns NaN.
         // If it's other non-numeric text, also NaN.
         // We only want to potentially show "Error" if it wasn't already an error message.
        if (display.value !== "Error" && display.value !== "Cannot divide by zero") {
            setDisplayValue("Error");
        }
        resetCoreState();
        return;
    }

    if (operator && firstOperand !== null && !isNextNumberNew) { // Check isNextNumberNew to avoid re-calculating if user just pressed another operator
        calculateResult(); // Calculate intermediate result
        // After calculateResult, the result is on display, firstOperand and operator are reset.
        // We need to re-capture the result as the new firstOperand for the chained operation.
        firstOperand = getDisplayNumber(); // Result of previous operation is new firstOperand
         if (isNaN(firstOperand)) { // If calculation resulted in error
            resetCoreState();
            return;
        }
    } else if (!isNaN(currentDisplayNumber)) {
        firstOperand = currentDisplayNumber;
    }
    // If firstOperand is null and display is 0 (e.g. after C), allow setting operator.
    // firstOperand might still be null if user presses C, then an operator.

    operator = op;
    isNextNumberNew = true; // Next number input will be the second operand
}


// Function to calculate and display the final result
function calculateResult() {
    const secondOperand = getDisplayNumber();

    if (operator === null || firstOperand === null || isNaN(secondOperand)) {
        // If not enough info or error on display, don't calculate
        // (unless it's a unary op like sqrt, but that's handled separately)
        if (isNaN(secondOperand) && display.value !== "Error" && display.value !== "Cannot divide by zero") {
            // If second operand is invalid (e.g. user typed "5 + abc =")
            // setDisplayValue("Error"); // Optionally show error, or just do nothing
        }
        // Don't resetCoreState here if only one number is entered and then '=' is pressed.
        // The number should remain on display.
        return;
    }

    let result;
    switch (operator) {
        case '+': result = firstOperand + secondOperand; break;
        case '-': result = firstOperand - secondOperand; break;
        case '*': result = firstOperand * secondOperand; break;
        case '/':
            if (secondOperand === 0) {
                setDisplayValue("Cannot divide by zero");
                resetCoreState();
                return;
            }
            result = firstOperand / secondOperand;
            break;
        default: return; // Should not happen
    }

    setDisplayValue(result);
    // After calculation, the result becomes the new firstOperand for potential chained operations if user presses another operator.
    // However, standard calculator behavior often resets for the next full operation unless an operator is pressed immediately.
    // For now, we reset, and setOperator will pick up the displayed value if an operator is pressed next.
    firstOperand = result; // Store result for potential chaining (e.g. 2+3 = 5, then *2 should be 5*2)
    operator = null; // Operation complete, clear operator until a new one is set
    isNextNumberNew = true; // Next number input will start a new value
}

// Function to calculate the square root of the displayed number
function calculateSqrt() {
    const num = getDisplayNumber();
    if (isNaN(num)) {
        if (display.value !== "Error" && display.value !== "Cannot divide by zero") setDisplayValue("Error");
        return;
    }
    if (num < 0) {
        setDisplayValue("Error"); // Sqrt of negative
    } else {
        setDisplayValue(Math.sqrt(num));
    }
    resetCoreState(); // Sqrt is a final operation for the current number
}

// Function to handle percentage calculation
// Behavior: X % -> X/100;  A + B % -> A + (A * B/100)
function calculatePercent() {
    const currentDisplayNumber = getDisplayNumber();
    if (isNaN(currentDisplayNumber)) {
         if (display.value !== "Error" && display.value !== "Cannot divide by zero") setDisplayValue("Error");
        return;
    }

    if (operator && firstOperand !== null) {
        // Case: A (operator) B %  =>  A (operator) (A * B/100)
        const percentageOfFirst = (firstOperand * currentDisplayNumber) / 100;
        setDisplayValue(percentageOfFirst);
        calculateResult(); // Perform the original operation with the percentage result
    } else {
        // Case: X % => X/100
        setDisplayValue(currentDisplayNumber / 100);
        resetCoreState(); // Percentage of a single number is a final operation
    }
}

// // --- Memory Functions ---
// function memoryAdd() {
//     const val = getDisplayNumber();
//     if (!isNaN(val)) memory += val;
//     isNextNumberNew = true; // After M+, next number input should be new
// }

// function memorySubtract() {
//     const val = getDisplayNumber();
//     if (!isNaN(val)) memory -= val;
//     isNextNumberNew = true; // After M-, next number input should be new
// }

// function memoryRecall() {
//     setDisplayValue(memory);
//     isNextNumberNew = true; // Value from MR is a new number
// }

// function memoryClear() {
//     memory = 0;
//     // MC usually doesn't affect the display or current calculation state
// }

// // --- Keyboard Input Support ---
// document.addEventListener("keydown", function(event) {
//     const key = event.key;
//     if ("0123456789.".includes(key)) {
//         appendValue(key);
//     } else if (["+", "-", "*", "/"].includes(key)) {
//         setOperator(key);
//     } else if (key === "%") {
//         calculatePercent();
//     } else if (key === "Enter" || key === "=") {
//         event.preventDefault();
//         calculateResult();
//     } else if (key === "Backspace") {
//         deleteLast();
//     } else if (key === "Escape") {
//         clearDisplay();
//     }
//     // Add more keyboard shortcuts if desired (e.g., 'm' for M+, 'r' for MR, 'c' for MC, 's' for sqrt)
// });

// // Initialize display
// clearDisplay();

