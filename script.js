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
	let title;

	for (var i = 0; i < originalText.length; i++) {
		const span = document.createElement('span');
		span.classList.add('correct', 'invisible');
		span.textContent = originalText[i];
		textToType.appendChild(span);
	}

	
	if(getParameterByName("bookId")==null){
		originalText = "Start!";
		initDrawScreen();
		drawScreen();
		drawUserTypedOutput();
	}else{
		fetch("https://ai.csnewcs.dev:8080/book?bookId="+getParameterByName("bookId"))
			.then((response) => {
				if(!response.ok)
					throw new Error("Network response was not ok");
				return response.text();
			}).then((result) => {
//				console.log("result", result);
				result = JSON.parse(
					result.replace(/\r\\n/g, ' ')
					.replace(/\r/g, '')
					.replace(/\\\\/g, '\\')
				);

				originalText = result.content.replace(/\n/g, ' ').replace(/\s+/g, ' ');
				title = result.title;
				initDrawScreen();
				drawScreen();
				drawUserTypedOutput();
//				console.log(splittedText);
//				console.log(originalText.slice(30,40));
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
		if(str.length > splittedText[rowIdx].length){
			baseIdx += splittedText[rowIdx].length;
			rowIdx++;
			colIdx = -1;

			inputArea.value = '';
			userTypedOutput.innerHTML = '';
			drawScreen();
			setTimeout(drawUserTypedOutput, 0);
			return;
		}

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

//		if(str.length)userTypedText[rawIdx] = str[colIdx];
		if(str.length)for(let i=0; i<=colIdx; ++i)
			userTypedText[baseIdx+i] = str[i];

		userTypedOutput.innerHTML = '';
		for (var i = 0; i < str.length; i++) {
			const span = document.createElement('span');
			span.classList.add(
				userTypedText[baseIdx+i] === originalText[baseIdx+i]
				|| (lang === "ko" && i === str.length-1)
				? 'correct' : 'incorrect'
			);
			span.textContent = str[i];
			userTypedOutput.appendChild(span);
		}

		const span = document.createElement('span');
		span.classList.add('correct');
		span.textContent = '_';
		userTypedOutput.appendChild(span);

		if(skipLineFeed){
			skipLineFeed = false;
			return;
		}
		if(str.length === splittedText[rowIdx].length){
			rowIdx++;
			baseIdx += colIdx+1;
			colIdx = -1;
			rawIdx = baseIdx+colIdx;

			inputArea.value = '';
			userTypedOutput.innerHTML = '';
			drawScreen();
			setTimeout(drawUserTypedOutput, 0);
			return;
		}
	}

	inputArea.addEventListener('input', (event) => {
		if(isEndPractice)return;
		drawUserTypedOutput();
	});

	let keydownEventCallbackState = 0;
    inputArea.addEventListener('keydown', (event) => {
		setTimeout(calculateKPMAndAccuracy, 0);
		switch(keydownEventCallbackState){
		case 0:
			startTime = new Date();
			keydownEventCallbackState = 1;
		case 1:
			const str = inputArea.value;
			if (event.key === 'Backspace') {
				switch(str.length){
				case 0:
//					console.log("backspace 0");
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
//					console.log("backspace 1");
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
//			console.log("preventDefault on keydown")
			event.preventDefault();
			break;
		}
    });

	document.addEventListener('paste', (event) => {
		event.preventDefault();
	});
	
	document.addEventListener('click', (event) => {
		inputArea.focus();
	});

	inputArea.focus();

	function getFont(e){
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
		const words = str.split(' ');
		const spanSpace = document.createElement('span');
		const areaWidth = parseInt(window.getComputedStyle(e.parentElement).width);
		const hidden = document.getElementById('hiddenContainer');

		copyFontStyles(e, spanSpace);
//		console.log(1, spanSpace.font);

		let tmpString = '';

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

//	let splittedText = [];
	function initDrawScreen(){
		var res = getBreakIndex(textToType, originalText);
		res.unshift(0);
		for(let i=0; i<res.length; ++i)
			splittedText.push(originalText.slice(res[i], res[i+1]));
		splittedText.push("< Done! Press any key to end >");
		splittedText.push("");
	}

	function drawScreen(){
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
//		console.log("endPractice");
		if(isAtHome){
			document.location.href = "./practice.html";
			return;
		}

		let main = document.getElementById('main');
		let src = document.getElementById("resultScreenCopy");

		resultSpeed = document.getElementById('typingSpeed').textContent + " TPM";
		resultAccuracy = document.getElementById('typingAccuracy').textContent + "%";
		resultScore = parseInt(resultSpeed) * parseInt(resultAccuracy);

//		console.log(resultSpeed, resultAccuracy, resultScore);

		main.innerHTML = src.innerHTML;

		document.getElementById('resultTitle').textContent = title;
		document.getElementById('resultSpeed').textContent = resultSpeed;
		document.getElementById('resultAccuracy').textContent = resultAccuracy;
		document.getElementById('resultScore').textContent = resultScore;

		document.getElementById("postButton").addEventListener('click', postToRanking);
	}

	function isSpecialChar(c){
		const specialCharRegex = /[^w\s]/;
		return specialCharRegex.test(c) || c === '\u00A0';

		const elapsedTime = (endTime - startTime);
		const corrects = userTypedText.slice(0, rawIdx).filter((c, i) => isSame(c, originalText[i]));
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
		var specialCharCount = 0, nonSpecialCharCount = 0;

		corrects.forEach((c, i) => {
			if(isSpecialChar(c))++specialCharCount;
			else ++nonSpecialCharCount;
		});

//		console.log("Idx ", baseIdx, rowIdx, colIdx, "calc", rawIdx, specialCharCount, nonSpecialCharCount,"val", userTypedText.join('').replace(/ /g,'<sp>').replace(/\u00A0/g, '<nbsp>'));

		const tpms = ((lang === "en" ? nonSpecialCharCount / 5 : nonSpecialCharCount * 2) + specialCharCount)
						* 60000 / elapsedTime;

		const accuracy = 100 * userTypedText.slice(0, rawIdx)
			.filter((c, i) => c === originalText[i]).length / (rawIdx);
		document.getElementById('typingAccuracy').textContent = accuracy.toFixed(2);
		document.getElementById('typingSpeed').textContent = tpms.toFixed(2);
	}

	function postToRanking(event){
		// POST /typing

//		console.log("postToRanking");
//		console.log(document.getElementById("nameInput").value);
		const data = {
			username: document.getElementById("nameInput").value,
			bookId: getParameterByName("bookId")*1,
			startTime: startTime*1,
			endTime: endTime*1,
			score: document.getElementById('resultScore').textContent*1
		};

//		console.log(data);

		sectionPost = document.getElementById("sectionPost");
		sectionPost.innerHTML = "<span>Posting...</span>";

		fetch('https://ai.csnewcs.dev:8080/typing', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then((response) => {
			if(!response.ok)
				throw new Error("Network response was not ok");
			return response.json();
		}).then((result) => {
//			console.log("result", result);
			sectionPost.innerHTML = "";
			let resultDisplay = document.getElementById("resultDisplay");

			let div = document.createElement("div");
			div.classList.add("resultItem");
			div.innerHTML = "<span>Your Name</span><span>"+data.username+"</span>";
			resultDisplay.appendChild(div);

			div = document.createElement("div");
			div.classList.add("resultItem");
			div.innerHTML = "<span>Your Rank</span><span>"+result.rank+"</span>";
			resultDisplay.appendChild(div);
		}).catch((error) => {
			console.error("error", error);
		});
	}

	let calculateKPMAndAccuracyIntervalID = setInterval(calculateKPMAndAccuracy, 16);

});

