class BigNumberCalculator {
	constructor() {
		this.initializeElements();
		this.bindEvents();
		this.currentOperation = "add";
	}

	initializeElements() {
		this.number1Input = document.getElementById("number1");
		this.number2Input = document.getElementById("number2");
		this.addBtn = document.getElementById("addBtn");
		this.subtractBtn = document.getElementById("subtractBtn");
		this.calculateBtn = document.getElementById("calculateBtn");
		this.resultDisplay = document.getElementById("result");
	}

	bindEvents() {
		this.addBtn.addEventListener("click", () => this.selectOperation("add"));
		this.subtractBtn.addEventListener("click", () =>
			this.selectOperation("subtract")
		);

		this.calculateBtn.addEventListener("click", () => this.calculate());

		this.number1Input.addEventListener("input", e => this.normalizeInput(e));
		this.number2Input.addEventListener("input", e => this.normalizeInput(e));

		this.number1Input.addEventListener("keydown", e =>
			this.handleKeyboardShortcuts(e)
		);
		this.number2Input.addEventListener("keydown", e =>
			this.handleKeyboardShortcuts(e)
		);

		this.number1Input.addEventListener("keypress", e => {
			if (e.key === "Enter") this.calculate();
		});
		this.number2Input.addEventListener("keypress", e => {
			if (e.key === "Enter") this.calculate();
		});
	}

	selectOperation(operation) {
		this.currentOperation = operation;

		this.addBtn.classList.toggle("active", operation === "add");
		this.subtractBtn.classList.toggle("active", operation === "subtract");
	}

	normalizeInput(event) {
		let value = event.target.value;

		value = value.replace(",", ".");

		value = value.replace(/[^0-9.-]/g, "");

		if (value.indexOf("-") > 0) {
			value = value.replace(/-/g, "");
		}

		const dotCount = (value.match(/\./g) || []).length;
		if (dotCount > 1) {
			const firstDotIndex = value.indexOf(".");
			value =
				value.substring(0, firstDotIndex + 1) +
				value.substring(firstDotIndex + 1).replace(/\./g, "");
		}

		event.target.value = value;
	}

	handleKeyboardShortcuts(event) {
		if (event.ctrlKey && (event.key === "c" || event.key === "v")) {
			return;
		}
	}

	parseNumber(str) {
		if (!str || str.trim() === "") {
			return null;
		}

		str = str.trim().replace(",", ".");

		if (!/^-?\d*\.?\d+$/.test(str)) {
			throw new Error("Неверный формат числа");
		}

		return str;
	}

	validateRange(numStr) {
		const num = parseFloat(numStr);
		const min = -1000000000000.0;
		const max = 1000000000000.0;

		return num >= min && num <= max;
	}

	addBigNumbers(num1Str, num2Str) {
		let sign1 = num1Str.startsWith("-") ? -1 : 1;
		let sign2 = num2Str.startsWith("-") ? -1 : 1;

		num1Str = num1Str.replace("-", "");
		num2Str = num2Str.replace("-", "");

		let [int1, dec1 = ""] = num1Str.split(".");
		let [int2, dec2 = ""] = num2Str.split(".");

		const maxDecLength = Math.max(dec1.length, dec2.length);
		dec1 = dec1.padEnd(maxDecLength, "0");
		dec2 = dec2.padEnd(maxDecLength, "0");

		const factor = Math.pow(10, maxDecLength);
		const num1 = BigInt(int1 + dec1) * BigInt(sign1);
		const num2 = BigInt(int2 + dec2) * BigInt(sign2);

		const result = num1 + num2;

		const resultStr = result.toString();
		const isNegative = result < 0n;
		const absResult = isNegative ? resultStr.substring(1) : resultStr;

		if (maxDecLength === 0) {
			return (isNegative ? "-" : "") + absResult;
		}

		if (absResult.length <= maxDecLength) {
			const padded = absResult.padStart(maxDecLength + 1, "0");
			const intPart = padded.substring(0, padded.length - maxDecLength);
			const decPart = padded.substring(padded.length - maxDecLength);
			return (isNegative ? "-" : "") + intPart + "." + decPart;
		} else {
			const intPart = absResult.substring(0, absResult.length - maxDecLength);
			const decPart = absResult.substring(absResult.length - maxDecLength);
			return (isNegative ? "-" : "") + intPart + "." + decPart;
		}
	}

	subtractBigNumbers(num1Str, num2Str) {
		let sign2 = num2Str.startsWith("-") ? 1 : -1;
		const num2WithOppositeSign =
			(sign2 === 1 ? "" : "-") + num2Str.replace("-", "");
		return this.addBigNumbers(num1Str, num2WithOppositeSign);
	}

	calculate() {
		try {
			const num1Str = this.parseNumber(this.number1Input.value);
			const num2Str = this.parseNumber(this.number2Input.value);

			if (num1Str === null || num2Str === null) {
				this.showResult("Пожалуйста, введите оба числа", "error");
				return;
			}

			if (!this.validateRange(num1Str) || !this.validateRange(num2Str)) {
				this.showResult(
					"Числа должны быть в диапазоне от -1,000,000,000,000.000000 до +1,000,000,000,000.000000",
					"error"
				);
				return;
			}

			let result;
			if (this.currentOperation === "add") {
				result = this.addBigNumbers(num1Str, num2Str);
			} else {
				result = this.subtractBigNumbers(num1Str, num2Str);
			}

			if (!this.validateRange(result)) {
				this.showResult(
					"Переполнение: результат превышает допустимый диапазон",
					"error"
				);
				return;
			}

			result = this.formatResult(result);

			this.showResult(`Результат: ${result}`, "success");
		} catch (error) {
			this.showResult(`Ошибка: ${error.message}`, "error");
		}
	}

	formatResult(result) {
		if (result.includes(".")) {
			result = result.replace(/\.?0+$/, "");
			if (result.endsWith(".")) {
				result = result.slice(0, -1);
			}
		}
		return result;
	}

	showResult(message, type) {
		this.resultDisplay.textContent = message;
		this.resultDisplay.className = `result-display ${type}`;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new BigNumberCalculator();
});

document.addEventListener("keydown", e => {
	if (e.ctrlKey) {
		if (e.key === "ц" || e.key === "c") {
			return;
		}
		if (e.key === "м" || e.key === "v") {
			return;
		}
	}
});
