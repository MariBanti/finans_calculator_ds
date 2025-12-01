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
		this.multiplyBtn = document.getElementById("multiplyBtn");
		this.divideBtn = document.getElementById("divideBtn");
		this.calculateBtn = document.getElementById("calculateBtn");
		this.resultDisplay = document.getElementById("result");
	}

	bindEvents() {
		this.addBtn.addEventListener("click", () => this.selectOperation("add"));
		this.subtractBtn.addEventListener("click", () =>
			this.selectOperation("subtract")
		);
		this.multiplyBtn.addEventListener("click", () =>
			this.selectOperation("multiply")
		);
		this.divideBtn.addEventListener("click", () =>
			this.selectOperation("divide")
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
		this.multiplyBtn.classList.toggle("active", operation === "multiply");
		this.divideBtn.classList.toggle("active", operation === "divide");
	}

	normalizeInput(event) {
		let value = event.target.value;

		value = value.replace(/,/g, ".");

		value = value.replace(/[^0-9.\-\s]/g, "");

		if (value.indexOf("-") > 0) {
			value = value.replace(/-/g, "");
		}
		if (value.includes("-") && !value.startsWith("-")) {
			value = value.replace(/-/g, "");
		}

		const dotCount = (value.match(/\./g) || []).length;
		if (dotCount > 1) {
			const firstDotIndex = value.indexOf(".");
			value =
				value.substring(0, firstDotIndex + 1) +
				value.substring(firstDotIndex + 1).replace(/\./g, "");
		}

		value = value.replace(/\s*\.\s*/g, ".");
		value = value.replace(/\s*-\s*/g, "-");

		if (/\.\d*-/.test(value) || /\d+\.\d*-/.test(value)) {
			value = value.replace(/-/g, "");
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

		let normalized = str.trim().replace(/,/g, ".");

		if (/[a-zA-Zа-яА-Я]/.test(normalized)) {
			throw new Error("Некорректный ввод: обнаружены буквы");
		}

		if (/\.\d*-/.test(normalized) || /\d+\.\d*-/.test(normalized)) {
			throw new Error("Некорректный формат числа");
		}

		if (normalized.includes(" ")) {
			const parts = normalized.split(".");
			const intPart = parts[0].replace("-", "");
			const intWithoutSpaces = intPart.replace(/\s/g, "");

			if (/\s{2,}/.test(intPart)) {
				throw new Error(
					"Некорректное использование пробелов: несколько пробелов подряд"
				);
			}

			if (parts.length > 1 && parts[1].includes(" ")) {
				throw new Error("Пробелы не допускаются в дробной части числа");
			}

			if (intWithoutSpaces.length > 0 && intPart.includes(" ")) {
				const correctFormat = this.formatIntegerPart(intWithoutSpaces);

				const userSpacesPattern = intPart.replace(/\d/g, "");
				const correctSpacesPattern = correctFormat.replace(/\d/g, "");

				if (userSpacesPattern !== correctSpacesPattern) {
					throw new Error(
						"Некорректное использование пробелов: пробелы должны разделять группы по 3 цифры справа налево"
					);
				}

				if (intPart.startsWith(" ") || intPart.endsWith(" ")) {
					throw new Error(
						"Некорректное использование пробелов: пробелы не должны быть в начале или конце числа"
					);
				}
			}
		}

		const withoutSpaces = normalized.replace(/\s/g, "");

		if (!/^-?\d*\.?\d+$/.test(withoutSpaces)) {
			throw new Error("Неверный формат числа");
		}

		return withoutSpaces;
	}

	validateRange(numStr) {
		const num = parseFloat(numStr);
		const min = -1000000000000.0;
		const max = 1000000000000.0;

		return num >= min && num <= max;
	}

	formatIntegerPart(intStr) {
		if (!intStr || intStr === "0") return "0";

		let result = "";
		let count = 0;

		for (let i = intStr.length - 1; i >= 0; i--) {
			if (count > 0 && count % 3 === 0) {
				result = " " + result;
			}
			result = intStr[i] + result;
			count++;
		}

		return result;
	}

	formatResult(resultStr) {
		const isNegative = resultStr.startsWith("-");
		const absResult = isNegative ? resultStr.substring(1) : resultStr;

		let [intPart, decPart = ""] = absResult.split(".");

		intPart = this.formatIntegerPart(intPart);

		if (decPart) {
			if (decPart.length > 6) {
				decPart = decPart.substring(0, 6);
			}
			decPart = decPart.replace(/0+$/, "");

			if (decPart === "") {
				return (isNegative ? "-" : "") + intPart;
			}

			return (isNegative ? "-" : "") + intPart + "." + decPart;
		}

		return (isNegative ? "-" : "") + intPart;
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

	multiplyBigNumbers(num1Str, num2Str) {
		let sign1 = num1Str.startsWith("-") ? -1 : 1;
		let sign2 = num2Str.startsWith("-") ? -1 : 1;
		const resultSign = sign1 * sign2;

		num1Str = num1Str.replace("-", "");
		num2Str = num2Str.replace("-", "");

		let [int1, dec1 = ""] = num1Str.split(".");
		let [int2, dec2 = ""] = num2Str.split(".");

		const dec1Length = dec1.length;
		const dec2Length = dec2.length;
		const totalDecLength = dec1Length + dec2Length;

		const num1 = BigInt(int1 + dec1.padEnd(dec1Length, "0"));
		const num2 = BigInt(int2 + dec2.padEnd(dec2Length, "0"));

		const result = num1 * num2 * BigInt(resultSign);

		const resultStr = result.toString();
		const isNegative = result < 0n;
		const absResult = isNegative ? resultStr.substring(1) : resultStr;

		if (totalDecLength === 0) {
			return (isNegative ? "-" : "") + absResult;
		}

		if (absResult.length <= totalDecLength) {
			const padded = absResult.padStart(totalDecLength + 1, "0");
			const intPart = padded.substring(0, padded.length - totalDecLength);
			const decPart = padded.substring(padded.length - totalDecLength);
			return (isNegative ? "-" : "") + intPart + "." + decPart;
		} else {
			const intPart = absResult.substring(0, absResult.length - totalDecLength);
			const decPart = absResult.substring(absResult.length - totalDecLength);
			return (isNegative ? "-" : "") + intPart + "." + decPart;
		}
	}

	divideBigNumbers(num1Str, num2Str) {
		const num2WithoutSign = num2Str.replace("-", "");
		if (
			num2WithoutSign === "0" ||
			num2WithoutSign === "0.0" ||
			parseFloat(num2WithoutSign) === 0
		) {
			throw new Error("Деление на ноль невозможно");
		}

		let sign1 = num1Str.startsWith("-") ? -1 : 1;
		let sign2 = num2Str.startsWith("-") ? -1 : 1;
		const resultSign = sign1 * sign2;

		num1Str = num1Str.replace("-", "");
		num2Str = num2Str.replace("-", "");

		let [int1, dec1 = ""] = num1Str.split(".");
		let [int2, dec2 = ""] = num2Str.split(".");

		const maxDecLength = Math.max(dec1.length, dec2.length);
		dec1 = dec1.padEnd(maxDecLength, "0");
		dec2 = dec2.padEnd(maxDecLength, "0");

		const num1 = BigInt(int1 + dec1);
		const num2 = BigInt(int2 + dec2);

		const precision = 6;
		const multiplier = BigInt(10 ** precision);
		const num1Scaled = num1 * multiplier;

		const quotient = num1Scaled / num2;
		const remainder = num1Scaled % num2;

		let result = quotient;
		if (remainder * 2n >= num2) {
			result = result + 1n;
		}

		result = result * BigInt(resultSign);

		const resultStr = result.toString();
		const isNegative = result < 0n;
		const absResult = isNegative ? resultStr.substring(1) : resultStr;

		if (absResult.length <= precision) {
			const padded = absResult.padStart(precision + 1, "0");
			const intPart = padded.substring(0, padded.length - precision);
			const decPart = padded.substring(padded.length - precision);
			return (isNegative ? "-" : "") + intPart + "." + decPart;
		} else {
			const intPart = absResult.substring(0, absResult.length - precision);
			const decPart = absResult.substring(absResult.length - precision);
			return (isNegative ? "-" : "") + intPart + "." + decPart;
		}
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
			try {
				if (this.currentOperation === "add") {
					result = this.addBigNumbers(num1Str, num2Str);
				} else if (this.currentOperation === "subtract") {
					result = this.subtractBigNumbers(num1Str, num2Str);
				} else if (this.currentOperation === "multiply") {
					result = this.multiplyBigNumbers(num1Str, num2Str);
				} else if (this.currentOperation === "divide") {
					result = this.divideBigNumbers(num1Str, num2Str);
				}
			} catch (error) {
				this.showResult(`Ошибка: ${error.message}`, "error");
				return;
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
