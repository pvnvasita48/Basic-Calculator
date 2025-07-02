let display = document.getElementById("display");

function appendValue(value) {
  if (display.value === "Error" || display.value === "Cannot divide by zero") {
    display.value = "";
  }

  const lastChar = display.value.slice(-1);
  const operators = "+-*/";

  // Replace last operator if two in a row
  if (operators.includes(lastChar) && operators.includes(value)) {
    display.value = display.value.slice(0, -1) + value;
    return;
  }

  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function deleteLast() {
  if (display.value === "Error" || display.value === "Cannot divide by zero") {
    clearDisplay();
  } else {
    display.value = display.value.slice(0, -1);
  }
}

function calculateResult() {
  try {
    const result = eval(display.value);
    if (result === Infinity || result === -Infinity) {
      display.value = "Cannot divide by zero";
    } else {
      display.value = parseFloat(result.toPrecision(12)).toString();
    }
  } catch {
    display.value = "Error";
  }
}

function calculateSqrt() {
  try {
    const num = eval(display.value);
    if (num < 0) {
      display.value = "Error";
    } else {
      display.value = Math.sqrt(num).toString();
    }
  } catch {
    display.value = "Error";
  }
}

// Keyboard support
document.addEventListener("keydown", function (event) {
  const key = event.key;
  if ("0123456789.".includes(key)) {
    appendValue(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    appendValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearDisplay();
  }
});

clearDisplay();
