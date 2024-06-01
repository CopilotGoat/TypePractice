const initText = "Ipsum dolor sit amet";
const lang = "ko";
"This is a sample text for typing practice. Type this text to improve your typing speed and accuracy. The correctly typed characters will appear in black, while incorrect characters will be shown in red."
const testText = "한글 타이핑 연습 문장입니다. 이 문장을 타이핑해보세요. 키보드에서 타자를 칠 때 올바른 글자는 검정색으로 표시되고, 잘못된 글자는 빨간색으로 표시됩니다.";
tmpParagraph = initText;

document.addEventListener('DOMContentLoaded', (event) => {
	function getParameterByName(name, url = window.location.href) {
		name = name.replace(/[\[\]]/g, '\\$&');
		let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			result = regex.exec(url);
		if(!result)return null;
		if(!result[2])return '';
		return decodeURIComponent(result[2].replace(/\+/g, ' '));
	}

    const userTypedOutput = document.getElementById('userTypedOutput');
	const inputArea = document.getElementById('inputArea');
	const textToType = document.getElementById('textToType');
	const areaUserTypedOutput = document.getElementById('areaUserTypedOutput');

	let userTypedText = [];
    let originalText = tmpParagraph;
	let splittedText=[];
	let rawIdx = 0, rowIdx = 0, colIdx = 0, baseIdx = 0;
	let skipLineFeed = false, isEndPractice = false;
	let startTime, endTime;
	let isAtHome = getParameterByName("bookId") === null;

	for (var i = 0; i < originalText.length; i++) {
		const span = document.createElement('span');
		span.classList.add('correct', 'invisible');
		span.textContent = originalText[i];
		textToType.appendChild(span);
	}

	
	if(getParameterByName("bookId")==null){
		originalText = "Start!";
		drawScreen();
	}
	else{
		fetch("https://ai.csnewcs.dev:8080/book?bookId="+getParameterByName("bookId"))
			.then((response) => {
				if(!response.ok){
					throw new Error("Network response was not ok");
				}
				return response.text();
			}).then((result) => {
				console.log("result", result);
				result = JSON.parse(
					result.replace(/\r\\n/g, ' ')
					.replace(/\r/g, '')
					.replace(/\\\\/g, '\\')
				);

				originalText = result.content.replace(/\n/g, ' ').replace(/\s+/g, ' ');
				drawScreen();
				console.log(splittedText);
			}).catch((error) => {
				console.error("error", error);
			});
	}

	function isSameChar(a, b){
		sp = [' ', '\u00A0'];
		return a === b || (sp.includes(a) && sp.includes(b));
	}

	function drawUserTypedOutput(){
		const str = inputArea.value;
		console.log("A", str.length, str);

		colIdx = str.length - 1;
		rawIdx = baseIdx + colIdx;

		if(rawIdx >= originalText.length){ // end of the text
			endTime = new Date();
			keydownEventCallbackState = 2;
			clearInterval(calculateKPMAndAccuracyIntervalID);
			isEndPractice = true;
			setTimeout(endPractice, 0);
			return;
		}

		userTypedText[rawIdx] = str[colIdx];
		console.log(userTypedText);
		console.log("a", colIdx, userTypedText[colIdx-1], userTypedText[colIdx]);;

		console.log("B", rowIdx, colIdx, baseIdx, rawIdx);
		console.log("C", userTypedText[rawIdx], originalText[rawIdx], userTypedText[baseIdx+colIdx], originalText[baseIdx+colIdx]);

		userTypedOutput.innerHTML = '';
		for (var i = 0; i < str.length; i++) {
			const span = document.createElement('span');
//			console.log("D", userTypedText[baseIdx+i], originalText[baseIdx+i]);
			span.classList.add(
				userTypedText[baseIdx+i] === originalText[baseIdx+i]
				|| (lang === "ko" && i === str.length-1)
				? 'correct' : 'incorrect'
			);
			span.textContent = str[i];
			userTypedOutput.appendChild(span);
		}

		if(skipLineFeed){
			skipLineFeed = false;
			return;
		}
		if(str.length === splittedText[rowIdx].length){
			rowIdx++;
			baseIdx += colIdx+1;
			colIdx = 0;

			inputArea.value = '';
			userTypedOutput.innerHTML = '';
			drawScreen();
			return;
		}
	}

	inputArea.addEventListener('input', (event) => {
		if(isEndPractice)return;
		console.log("input");
		drawUserTypedOutput();
	});

//	document.getElementById("testbox").addEventListener('input', (event) => {
//		console.log("input 2");
//		drawUserTypedOutput();
//	});

	let keydownEventCallbackState = 0;
    inputArea.addEventListener('keydown', (event) => {
		setTimeout(calculateKPMAndAccuracy, 0);
		switch(keydownEventCallbackState){
		case 0:
			startTime = new Date();
			keydownEventCallbackState = 1;
		case 1:
			const str = inputArea.value;
			console.log(str);
			console.log("keydown", event.key);
			// move cursor to the end of the text
	//		const range = document.createRange();
	//		const selection = window.getSelection();
	//		range.selectNodeContents(inputArea);
	//		range.collapse(false);
	//		selection.removeAllRanges();
	//		selection.addRange(range);

			if (event.key === 'Backspace') {
				switch(str.length){
				case 0:
					console.log("backspace 0");
					event.preventDefault();
					if(rowIdx === 0)break;
					skipLineFeed = true;
					--rowIdx;
					colIdx = splittedText[rowIdx].length-1;
					baseIdx -= splittedText[rowIdx].length;
					inputArea.value = userTypedText.slice(baseIdx, baseIdx+colIdx+1).join('');
					drawScreen();
					drawUserTypedOutput();
					break;
				case 1:
					console.log("backspace 1");
					event.preventDefault();
					inputArea.value = '';
					drawUserTypedOutput();
					break;
				}
			}

			if (event.key === 'Tab' || event.key === 'Enter') {
				event.preventDefault();
				inputArea.value += '\u00A0';
				drawUserTypedOutput();
			}
			break;
		case 2:
			if(event.key === 'Control' || event.key === 'Alt'
				|| event.key === 'Shift' || event.key === 'Meta'
				|| event.key === 'CapsLock' || event.key === 'Tab'
				|| event.key === 'Enter'){
				break;
			}
			event.preventDefault();
			break;
		}
    });

	document.addEventListener('paste', (event) => {
		event.preventDefault();
		console.log("paste");
	});
	
	document.addEventListener('click', (event) => {
		console.log("addEventListener");
		inputArea.focus();

		// move cursor to the end of the text
//		const range = document.createRange();
//		const selection = window.getSelection();
//		range.selectNodeContents(inputArea);
//		range.collapse(false);
//		selection.removeAllRanges();
//		selection.addRange(range);
	});

	inputArea.focus();

	function getFont(e){
		console.log(getComputedStyle(e).fontWeight);
		return window.getComputedStyle(e).font;
	}

	function copyFontStyles(sourceElement, targetElement) {
		var computedStyle = window.getComputedStyle(sourceElement);
		var fontProperties = [
			'fontFamily',
			'fontSize',
			'fontWeight',
			'fontStyle',
			'lineHeight',
			'letterSpacing',
			'textTransform',
			'textDecoration',
			'textShadow'
		];

		fontProperties.forEach(function(property) {
			targetElement.style[property] = computedStyle[property];
		});
	}

	function getBreakIndex(e, str){
		console.log("getBreakIndex");

		const words = str.split(' ');
		const spanSpace = document.createElement('span');
		const areaWidth = parseInt(window.getComputedStyle(e.parentElement).width);
		// get width as px with getComputedStyle
		const hidden = document.getElementById('hiddenContainer');

		copyFontStyles(e, spanSpace);
		console.log(1, spanSpace.font);

		let tmpString = '';

//		const spaceSpan = document.createElement('span');
//		spaceSpan.textContent = ' ';
//		spaceSpan.classList.add('correct');

		prev = 0;
		idx = 0;
		let res = [];

		for(let i=0; i<words.length; ++i){
			for(let j=0; j<words[i].length; ++j){
				const span = document.createElement('span');
				span.classList.add('correct');
				span.textContent = words[i][j];
				spanSpace.appendChild(span);
			}

			const span = document.createElement('span');
			span.textContent = ' ';
			span.classList.add('correct');
			spanSpace.appendChild(span);

			idx += words[i].length + 1;

			hidden.appendChild(spanSpace);
			if(areaWidth < spanSpace.offsetWidth){
				tmp = []
				for(let j=0; j<spanSpace.childNodes.length; ++j)
					tmp.push(spanSpace.childNodes[j].offsetWidth);
				res.push(prev);
				spanSpace.innerHTML = '';
				idx -= words[i].length + 1;
				--i;
			}
			prev = idx;
			hidden.removeChild(spanSpace);
		}


		return res;
	}

	function drawScreen(){
		var res = getBreakIndex(textToType, originalText);
		res.unshift(0);
		splittedText = [];
		for(let i=0; i<res.length; ++i)
			splittedText.push(originalText.slice(res[i], res[i+1]));
		splittedText.push("< Done! Press any key to end >");
		splittedText.push("");

		textToType.innerHTML = '';

		splittedText[rowIdx].split('').forEach((char, index) => {
			const span = document.createElement('span');
			span.classList.add(rowIdx+2 < splittedText.length ? 'correct' : 'doneText');
			span.textContent = char;
			textToType.appendChild(span);
		});

		textToType.appendChild(document.createElement('br'));

		splittedText[rowIdx+1].split('').forEach((char, index) => {
			const span = document.createElement('span');
			span.classList.add(rowIdx+3 < splittedText.length ? 'correct' : 'doneText', 'opacity-65');
			span.textContent = char;
			textToType.appendChild(span);
		});
	}

	function endPractice(){
		console.log("endPractice");
		if(isAtHome){
			document.location.href = "./practice.html";
			return;
		}
	}

	function isSpecialChar(c){
		const specialCharRegex = /[^w\s]/;
		return specialCharRegex.test(c) || c === '\u00A0';

		const elapsedTime = (endTime - startTime);
		const corrects = userTypedText.slice(0, rawIdx).filter((c, i) => c === originalText[i]);
		let specialCharCount = 0, nonSpecialCharCount = 0;

		corrects.forEach((c, i) => {
			if(isSpecialChar(c))++specialCharCount;
			else ++nonSpecialCharCount;
		});

		const tpms = ((lang === "en" ? nonSpecialCharCount / 5 : nonSpecialCharCount * 2) + specialCharCount)
						* 60000 / elapsedTime;

		const accuracy = 100 * userTypedText.slice(0, rawIdx)
			.filter((c, i) => c === originalText[i]).length / (rawIdx);
		document.getElementById('typingAccuracy').textContent = accuracy.toFixed(2);
		document.getElementById('typingSpeed').textContent = tpms.toFixed(2);
	}

	function calculateKPMAndAccuracy(){
		if(rawIdx < 1)return;
		const elapsedTime = (new Date() - startTime);
		const corrects = userTypedText.slice(0, rawIdx).filter((c, i) => c === originalText[i]);
		let specialCharCount = 0, nonSpecialCharCount = 0;

		corrects.forEach((c, i) => {
			if(isSpecialChar(c))++specialCharCount;
			else ++nonSpecialCharCount;
		});

		const tpms = ((lang === "en" ? nonSpecialCharCount / 5 : nonSpecialCharCount * 2) + specialCharCount)
						* 60000 / elapsedTime;

		const accuracy = 100 * userTypedText.slice(0, rawIdx)
			.filter((c, i) => c === originalText[i]).length / (rawIdx);
		document.getElementById('typingAccuracy').textContent = accuracy.toFixed(2);
		document.getElementById('typingSpeed').textContent = tpms.toFixed(2);
	}

	let calculateKPMAndAccuracyIntervalID = setInterval(calculateKPMAndAccuracy, 16);

});

