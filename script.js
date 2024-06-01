const initText = "Ipsum dolor sit amet";
const testText = "This is a sample text for typing practice. Type this text to improve your typing speed and accuracy. The correctly typed characters will appear in black, while incorrect characters will be shown in red. 한글 타이핑 연습 문장입니다. 이 문장을 타이핑해보세요. 키보드에서 타자를 칠 때 올바른 글자는 검정색으로 표시되고, 잘못된 글자는 빨간색으로 표시됩니다.";
tmpParagraph = initText;

document.addEventListener('DOMContentLoaded', (event) => {
    const userTypedOutput = document.getElementById('userTypedOutput');
	const inputArea = document.getElementById('inputArea');
	const textToType = document.getElementById('textToType');
	const areaUserTypedOutput = document.getElementById('areaUserTypedOutput');

	let userTypedText = [];
    let originalText = tmpParagraph;
	let splittedText=[];
	let rawIdx = 0, rowIdx = 0, colIdx = 0, baseIdx = 0;
	let skipLineFeed = false;
	let isEndPractice = false;

	for (var i = 0; i < originalText.length; i++) {
		console.log(textToType.offsetWidth);
		const span = document.createElement('span');
		span.classList.add('correct', 'invisible');
		span.textContent = originalText[i];
		textToType.appendChild(span);
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

		if(rawIdx >= originalText.length){
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
			span.classList.add(userTypedText[baseIdx+i] === originalText[baseIdx+i] ? 'correct' : 'incorrect');
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

    inputArea.addEventListener('keydown', (event) => {
		if(isEndPractice){
			event.preventDefault();
			return;
		}

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
		splittedText.push("< Done! >");
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

	originalText = testText;
	drawScreen();
	console.log(splittedText);

	function endPractice(){
		console.log("endPractice");
	}
});

