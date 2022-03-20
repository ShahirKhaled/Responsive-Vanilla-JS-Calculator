export default function(previousOperandTextElement, currentOperandTextElement, resultTextElement) {
    this.allClear = function() {
        this.previousOperand = '';
        this.currentOperand = '';
        this.result = '';
        this.openParenthesesCount = 0;
        this.i = 0;
        this.entries = [];
        this.boolean = true;
    }

    this.clearEntry = function() {
        if (!this.previousOperand && !this.currentOperand) return;
        if (!this.previousOperand && this.currentOperand || this.result && !this.previousOperand) this.allClear();
        else {
            this.entries.pop();
            this.currentOperand = this.entries.pop();
            // The big problem here is that previousOperad is not changed here and being added back to this.entries in
            // updateDisplay function
        }
    }

    this.delete = function() {
        this.currentOperand = this.currentOperand.trim().slice(0, -1).trim();
        if (this.previousOperand && !this.currentOperand) {
            this.currentOperand = this.previousOperand.slice(0, -3);
            this.previousOperand = '';
        }
    }

    this.getCommaSeparated = number => {
        const numberArray = number.toString().split('.');
        const integerDigits = (!isNaN(number) && number) ? parseFloat(numberArray[0]).toLocaleString('en-us'):numberArray[0];
        const decimalDigits = numberArray[1];
        if (decimalDigits) return `${integerDigits}.${decimalDigits}`;
        else return integerDigits;
    }

    this.updateDisplay = function() {
        if (!this.openParenthesesCount && this.previousOperand || this.currentOperand) {
            this.entries = this.parseBrackets();
            this.backtrackRecursively();
        }
        const commaSeparated = (function deepClone(array = calculator.entries) {
            return array.map(item => {
                if (Array.isArray(item)) return deepClone(item);
                else {
                    item = item.trim().split(' ');
                    return item.map(element => calculator.getCommaSeparated(element));
                }
            });
        })().flat();

        const stringifyArray = () => {
            if (commaSeparated.length % 2 !== 0) {
                const lastElement = commaSeparated[commaSeparated.length -1].slice(0, 1);
                const string = JSON.stringify(commaSeparated.slice(0, -1));
                const stringVersion = string.replace(string.slice(0, 1), '').replace(string.slice(-1), '');
                return stringVersion.replace(/\[/g, '(').replace(/\]/g, ')').replace(/,"/g, ' ').replace(/",/g, ' ').replace(/"/g, '');
            } else {
                const lastEelement = commaSeparated[commaSeparated.length -1].slice(0, 1);
                const string = JSON.stringify(commaSeparated);
                const stringVersion = string.replace(string.slice(0, 1), '').replace(string.slice(-1), '');
                return stringVersion.replace(/\[/g, '(').replace(/\]/g, ')').replace(/,"/g, ' ').replace(/",/g, ' ').replace(/"/g, '');
            }
        }

        previousOperandTextElement.innerText = (commaSeparated.length > 1) ? stringifyArray():'';
        currentOperandTextElement.innerText = this.currentOperand;
        resultTextElement.innerText = this.getCommaSeparated(this.result);
    }
    
    this.addThisOrThat = function(firstValue, secondValue, beginningValue) {
        let x;
        if (this.boolean){
            x = firstValue;
            this.boolean = false;
        } else {
            x = secondValue;
            this.boolean = true;
        }
        if (beginningValue) return beginningValue + x;
        else return x;
    }

    this.addPlusMinus = function() {
        const arrayConverted = this.currentOperand.split('');
        arrayConverted.splice(arrayConverted.length - this.i, this.i);
        this.i = 2;
        if (arrayConverted.length && arrayConverted[arrayConverted.length -1] !== '(' && arrayConverted[arrayConverted.length -2] !== '×') {
            arrayConverted[arrayConverted.length] = this.addThisOrThat('-', '+', ' × (');
            this.i = 4;
        } else arrayConverted[arrayConverted.length] = this.addThisOrThat('-', '+', '(');
        this.currentOperand = arrayConverted.join('');
    }
    
    this.addBrackets = function () {
        clearTimeout(this.timeout);
        const value = this.addThisOrThat('(', ')');
        const arrayConverted = this.currentOperand.split('');
        const thisValue = this;
        arrayConverted.splice(arrayConverted.length - this.i, this.i);
        if (value === '(') this.i = 4;
        else this.i = 1;
        arrayConverted[arrayConverted.length] = (value === '(' && arrayConverted.length && /[\d.]/.test(this.currentOperand)) ? ' × ' + value:value;
        this.currentOperand = arrayConverted.join('');
        this.parseBrackets();
        this.timeout = setTimeout(function() {
            thisValue.i = 0;
            thisValue.boolean = true;
        }, 1500);
    }
    
    this.appendNumber = function(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (number === '.' && !/[0-9]/.test(this.currentOperand.slice(-1))) this.currentOperand += '0' + number;
        else this.currentOperand += number;
        this.parseBrackets();
        this.boolean = true;
        this.i = 0;
    }
    
    this.selectOperation = function(operation) {
        if (!this.currentOperand || this.currentOperand.slice(-1) === '.' || this.currentOperand.slice(-1) === '-') return;
        this.currentOperand += ` ${operation} `;
        this.boolean = true;
        if (this.openParenthesesCount) return;
        this.previousOperand += this.currentOperand;
        this.currentOperand = '';
    }

    this.parseBrackets = function(value = this.previousOperand + this.currentOperand) {
        this.openParenthesesCount = 0;
        let openParenthesesIndex = 0;
        let closeParenthesesIndex = 0;
        const result = [];
        for (let i = 0; i < value.length; i++) {
            if (value[i] === '(') {
                if (this.openParenthesesCount === 0) {
                    openParenthesesIndex = i;
                    if (i !== closeParenthesesIndex) result.push(value.substring(closeParenthesesIndex, i -1));
                }
                this.openParenthesesCount++;
            }
            if (value[i] === ')') {
                this.openParenthesesCount--;
                if (this.openParenthesesCount === 0) {
                    closeParenthesesIndex = i + 1;
                    result.push(this.parseBrackets(value.substring(openParenthesesIndex + 1, i)));
                }
            }
        }
        if (value.length > closeParenthesesIndex) result.push(value.substring(closeParenthesesIndex));
        return result;
    }

    this.backtrackRecursively = function(array = [JSON.parse(JSON.stringify(this.entries))]) {
        for (let i = 0; i < array.length; i++) {
            if (Array.isArray(array[i])) {
                this.backtrackRecursively(array[i]);
                this.calculate(array[i]);
            }
            else array[i] = array[i].trim().split(' ');
        }
    }

    this.calculate = function (value) {
        for (let i = 1; i < value.length; i++) {
            if (value[i].length > 1) for (let j = 0; j < value[i].length; j++) value[0].push(value[i][j]);
            else value[0].push(value[i]);
            value.splice(i, 1);
            i--;
        }
        for (let i = 0; i < value[0].length; i++) {
            const operation = (i % 2 !== 0 && !/[+-]/.test(value[0][i])) ? value[0].splice(i, 1)[0] : undefined;
            if (!operation) continue;
            const previous = (value[0][i - 1]) ? parseFloat(value[0][i - 1]) : undefined;
            const current = parseFloat(value[0][i]); // I will use replace(/,/g, '') in here🤘
            switch (operation) {
                case '×':
                    value[0].splice(i - 1, 2, previous * current);
                    i--;
                    break;
                case '÷':
                    value[0].splice(i - 1, 2, previous / current);
                    i--;
            }
        }
        for (let i = 0; i < value[0].length; i++) {
            const operation = (i % 2 !== 0) ? value[0].splice(i, 1)[0] : undefined;
            const previous = (value[0][i - 1]) ? parseFloat(value[0][i - 1]) : undefined;
            const current = parseFloat(value[0][i]);
            switch (operation) {
                case '+':
                    value[0].splice(i - 1, 2, previous + current);
                    i--;
                    break;
                case '-':
                    value[0].splice(i - 1, 2, previous - current);
                    i--;
            }
        }
        this.result = value;
    }
}