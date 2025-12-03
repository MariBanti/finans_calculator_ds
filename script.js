class BigNumberCalculator {
	constructor() {
		this.initializeElements();
		this.bindEvents();
		this.operations = {
			op1: "add",
			op2: "add",
			op3: "add",
		};
		this.updatePreview();
	}

	initializeElements() {
		this.number1Input = document.getElementById("number1");
		this.number2Input = document.getElementById("number2");
		this.number3Input = document.getElementById("number3");
		this.number4Input = document.getElementById("number4");
		this.calculateBtn = document.getElementById("calculateBtn");
		this.resultDisplay = document.getElementById("result");
		this.roundingSection = document.getElementById("rounding-section");
		this.roundedResultDisplay = document.getElementById("rounded-result");
		this.op1Preview = document.getElementById("op1-preview");
		this.op2Preview = document.getElementById("op2-preview");
		this.op3Preview = document.getElementById("op3-preview");
	}

	bindEvents() {
		document.querySelectorAll(".op-btn-small").forEach(btn => {
			btn.addEventListener("click", e => {
				const opNum = e.target.dataset.op;
				const opType = e.target.dataset.type;
				this.selectOperation(opNum, opType);
			});
		});

		this.calculateBtn.addEventListener("click", () => this.calculate());

		[
			this.number1Input,
			this.number2Input,
			this.number3Input,
			this.number4Input,
		].forEach(input => {
			input.addEventListener("input", e => this.normalizeInput(e));
			input.addEventListener("keydown", e => this.handleKeyboardShortcuts(e));
			input.addEventListener("keypress", e => {
				if (e.key === "Enter") this.calculate();
			});
		});

		document.querySelectorAll(".rounding-btn").forEach(btn => {
			btn.addEventListener("click", e => {
				const roundingType = e.target.dataset.rounding;
				this.applyRounding(roundingType);
			});
		});
	}

	selectOperation(opNum, opType) {
		this.operations[`op${opNum}`] = opType;

		document.querySelectorAll(`[data-op="${opNum}"]`).forEach(btn => {
			btn.classList.toggle("active", btn.dataset.type === opType);
		});

		this.updatePreview();
	}

	updatePreview() {
		const opSymbols = {
			add: "+",
			subtract: "-",
			multiply: "×",
			divide: "÷",
		};

		this.op1Preview.textContent = opSymbols[this.operations.op1];
		this.op2Preview.textContent = opSymbols[this.operations.op2];
		this.op3Preview.textContent = opSymbols[this.operations.op3];
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

	roundTo10Decimals(numStr) {
		const num = parseFloat(numStr);
		if (isNaN(num)) return numStr;

		const multiplier = Math.pow(10, 10);
		const rounded = Math.round(num * multiplier) / multiplier;

		const parts = rounded.toString().split(".");
		if (parts.length === 1) {
			return parts[0] + ".0000000000";
		}

		const decPart = parts[1].padEnd(10, "0").substring(0, 10);
		return parts[0] + "." + decPart;
	}

	roundMathematical(numStr) {
		const num = parseFloat(numStr);
		if (isNaN(num)) return "0";
		return Math.round(num).toString();
	}

	roundBankers(numStr) {
		const num = parseFloat(numStr);
		if (isNaN(num)) return "0";

		const absNum = Math.abs(num);
		const floor = Math.floor(absNum);
		const decimal = absNum - floor;

		if (
			Math.abs(decimal - 0.5) < 0.0000001 ||
			(Math.abs(decimal - 0.5) > 0.4999999 &&
				Math.abs(decimal - 0.5) < 0.5000001)
		) {
			const result = (floor % 2 === 0 ? floor : floor + 1) * (num < 0 ? -1 : 1);
			return result.toString();
		}

		return Math.round(num).toString();
	}

	roundTruncate(numStr) {
		const num = parseFloat(numStr);
		if (isNaN(num)) return "0";
		return Math.trunc(num).toString();
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

	performOperation(num1Str, num2Str, operation) {
		switch (operation) {
			case "add":
				return this.addBigNumbers(num1Str, num2Str);
			case "subtract":
				return this.subtractBigNumbers(num1Str, num2Str);
			case "multiply":
				return this.multiplyBigNumbers(num1Str, num2Str);
			case "divide":
				return this.divideBigNumbers(num1Str, num2Str);
			default:
				throw new Error("Неизвестная операция");
		}
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

		const precision = 10;
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
			const num1Str = this.parseNumber(this.number1Input.value) || "0";
			const num2Str = this.parseNumber(this.number2Input.value) || "0";
			const num3Str = this.parseNumber(this.number3Input.value) || "0";
			const num4Str = this.parseNumber(this.number4Input.value) || "0";

			if (
				!this.validateRange(num1Str) ||
				!this.validateRange(num2Str) ||
				!this.validateRange(num3Str) ||
				!this.validateRange(num4Str)
			) {
				this.showResult(
					"Числа должны быть в диапазоне от -1,000,000,000,000.000000 до +1,000,000,000,000.000000",
					"error"
				);
				this.roundingSection.style.display = "none";
				return;
			}

			let intermediate1;
			try {
				intermediate1 = this.performOperation(
					num2Str,
					num3Str,
					this.operations.op2
				);
			} catch (error) {
				this.showResult(`Ошибка: ${error.message}`, "error");
				this.roundingSection.style.display = "none";
				return;
			}

			intermediate1 = this.roundTo10Decimals(intermediate1);

			if (!this.validateRange(intermediate1)) {
				this.showResult(
					"Переполнение: промежуточное вычисление превышает допустимый диапазон",
					"error"
				);
				this.roundingSection.style.display = "none";
				return;
			}

			let intermediate2;
			try {
				intermediate2 = this.performOperation(
					num1Str,
					intermediate1,
					this.operations.op1
				);
			} catch (error) {
				this.showResult(`Ошибка: ${error.message}`, "error");
				this.roundingSection.style.display = "none";
				return;
			}

			intermediate2 = this.roundTo10Decimals(intermediate2);

			if (!this.validateRange(intermediate2)) {
				this.showResult(
					"Переполнение: промежуточное вычисление превышает допустимый диапазон",
					"error"
				);
				this.roundingSection.style.display = "none";
				return;
			}

			let finalResult;
			try {
				finalResult = this.performOperation(
					intermediate2,
					num4Str,
					this.operations.op3
				);
			} catch (error) {
				this.showResult(`Ошибка: ${error.message}`, "error");
				this.roundingSection.style.display = "none";
				return;
			}

			if (!this.validateRange(finalResult)) {
				this.showResult(
					"Переполнение: результат превышает допустимый диапазон",
					"error"
				);
				this.roundingSection.style.display = "none";
				return;
			}

			this.finalResult = finalResult;

			const formattedResult = this.formatResult(finalResult);
			this.showResult(`Результат: ${formattedResult}`, "success");

			this.roundingSection.style.display = "block";
			this.roundedResultDisplay.textContent = "";

			document.querySelectorAll(".rounding-btn").forEach(btn => {
				btn.classList.remove("active");
			});
		} catch (error) {
			this.showResult(`Ошибка: ${error.message}`, "error");
			this.roundingSection.style.display = "none";
		}
	}

	applyRounding(roundingType) {
		if (!this.finalResult) return;

		document.querySelectorAll(".rounding-btn").forEach(btn => {
			btn.classList.toggle("active", btn.dataset.rounding === roundingType);
		});

		let rounded;
		switch (roundingType) {
			case "math":
				rounded = this.roundMathematical(this.finalResult);
				break;
			case "bank":
				rounded = this.roundBankers(this.finalResult);
				break;
			case "truncate":
				rounded = this.roundTruncate(this.finalResult);
				break;
			default:
				return;
		}

		const isNegative = rounded.startsWith("-");
		const absRounded = isNegative ? rounded.substring(1) : rounded;
		const formattedRounded = this.formatIntegerPart(absRounded);
		const finalFormatted = (isNegative ? "-" : "") + formattedRounded;

		this.roundedResultDisplay.textContent = `Округленный до целых результат: ${finalFormatted}`;
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
