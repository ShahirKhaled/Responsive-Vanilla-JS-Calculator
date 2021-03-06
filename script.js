import Calculator from './Calculator.js';

const numberButtons = document.querySelectorAll('[data-numbers]');
const operationButtons = document.querySelectorAll('[data-operations]');
const plusMinusButton = document.querySelector('[data-plus-minus]');
const parenthesis = document.querySelector('[data-parenthesis]');
const equalButton = document.querySelector('[data-equals]');
const allClearButton = document.querySelector('[data-all-clear]');
const backspaceElement = document.querySelector('[data-backspace]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');
const resultTextElement = document.querySelector('[data-result]');
window.calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, resultTextElement);

calculator.allClear();

allClearButton.addEventListener('click', () => {
    calculator.allClear();
    calculator.updateDisplay();
});

numberButtons.forEach(numbers => {
    numbers.addEventListener('click', () => {
        calculator.appendNumber(numbers.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.selectOperation(button.innerText);
        calculator.updateDisplay();
    });
});

backspaceElement.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

equalButton.addEventListener('click', () => {
    if (!calculator.currentOperand && !calculator.previousOperand) return;
    if (!calculator.currentOperand || !calculator.previousOperand || calculator.currentOperand.slice(-1) === '.') {
        resultTextElement.innerText = "Invalid Operation!";
        return;
    }
    calculator.entry = [];
    calculator.currentOperand = '';
    calculator.operation = undefined;
    calculator.updateDisplay();
});

plusMinusButton.addEventListener('click', () => {
    calculator.addPlusMinus();
    calculator.updateDisplay();
});

parenthesis.addEventListener('click', () => {
    calculator.addBrackets();
    calculator.updateDisplay();
});

console.log(
    `%cHi there!
%cSince you are here in the console, I assume you are a developer too.
If you want to get in touch, I would love to connect with you.
%cGitHub: %chttps://www.github.com/Shahir-Khaled`,
    'font-size: 2em; color: rgb(101, 197, 255); width: 100%; text-align: center;',
    '',
    'font-weight: bold;',
    ''
);