// 'foreign' key names.

var time = 0;
var startTime = 0;
var currentTime = 0;
var total = 0;
var correct = 0;
var incorrect = 0;
var wpm = 0;

var startTimer = false;
var pressedShift = false;
var pressedDakuten = false;
var pressedHandakuten = false;
var keyboardIsJapanese = false;

var curKeyboard = [];
var displaySentence = "";

window.onload = function(){
	ChangeKeyboard(document.getElementById("selector").value);
	startTimer = false;
	ClearAllFields();
	StartButtonColor();
	// set info text
	WriteInfoText(infoText);
	
	document.getElementById("infoButton").onclick = function() {
		document.getElementById("infoPane").style.display = "block";
	}
	
	document.getElementById("closeInfo").onclick = function(){
		document.getElementById("infoPane").style.display = "none";
	}
};

var letsTypeWith = setInterval(function(){
	if (startTimer) {
		myGame();
	} else {
		ResetDisplays();
}},100);

function WriteNewKeyboard(data){
	// build string to apply to keyboard element.
	var output = "";
	for ( var i = 0; i < data.length; i++ ) {
		// for each row.
		output += "<ul>";
		for ( var j = 0; j < data[i].length; j++ ) {
			// for each key.
			output += "<li id=\'";
			output += data[i][j].id;
			output += "\' data-keyValues=\'";
			output += data[i][j].keyValues;
			output += "\'>";
			output += data[i][j].displayChars;
			output += "</li>";
		}
		output += "</ul>";
	}
	ChangeElementByID("allKeys",output);
}

function ResetDisplays(){
	ChangeElementByID("time","00:00");
	ChangeElementByID("wpm","0");
	ChangeElementByID("correct","0");
	ChangeElementByID("incorrect","0");
	ChangeElementByID("exampleText","");
}

function myGame() {
    var d = new Date();	// need new?
    currentTime = d.getTime();
    time = currentTime - startTime;
	DisplayTheTime(time);
    ChangeElementByID("wpm",wpm);
    ChangeElementByID("correct",correct);
    ChangeElementByID("incorrect",incorrect);
}

function DisplayTheTime(time){
	// show the time the current test has been going
	var myTime = new Date(time);
	var myMinutes = myTime.getUTCMinutes();
	if (myMinutes < 10) {myMinutes = "0" + myMinutes;}
	var mySeconds = myTime.getUTCSeconds();
	if (mySeconds < 10) {mySeconds = "0" + mySeconds;}
	var displayTime = myMinutes + ":" + mySeconds;
	ChangeElementByID("time",displayTime);
}

function StartStop(){
	// toggle start timer
	startTimer = !startTimer;
	// if test has started pick the first sentence
	if (startTimer){
		var d = new Date();
		startTime = d.getTime();
		PickSentence();
	} else {
		ClearAllFields();
	}
	StartButtonColor();	// update color and text 
}

function StopTheClock(){
	// stop the timer and clear all vars and displays of previous times.
	startTimer = false;
	ClearAllFields();
	ResetDisplays();
}

function ClearAllFields(){
	// clear all variables from previous session.
	time = 0;
	startTime = 0;
	currentTime = 0;
	total = 0;
	correct = 0;
	incorrect = 0;
	wpm = 0;
	displaySentence = "";
}

function PickSentence(){
	displaySentence = loadedSentences.Next();
	DisplaySentence(displaySentence);
	HighlightCurChar();
}

function DisplaySentence(myString){
	ChangeElementByID("exampleText",myString);
}

function ChangeKeyboard(param){
	StopTheClock(); // if clock is running stop and clear vars and displays
	keyboardIsJapanese = false;
	switch (param) {
		case "qwerty":
			loadedSentences.Load(qwertyWordList);
			curKeyboard = newQuertyKeys;
		break;
		case "dvorak":
			loadedSentences.Load(qwertyWordList);
			curKeyboard = newDvorakKeys;
		break;
		case "nihongo":
			loadedSentences.Load(japaneseWordList);
			curKeyboard = newJapaneseKeys;
			keyboardIsJapanese = true;
		break;
		case "hangul":
			loadedSentences.Load(koreanWordList);
			curKeyboard = newKoreanKeys;
		break;
		case "bopomofo":
			loadedSentences.Load(taiwaneseWordList);
			curKeyboard = newTaiwaneseKeys;
		break;
		default:
	}

	WriteNewKeyboard(curKeyboard);
}

function CheckLetter(myKeyCode){
	// compare current letter in display sentence to the character of the key element that matches the key code.
	var curLetter = displaySentence.charAt(total);
	var virtualKeyboardLetter = document.getElementById(myKeyCode).innerHTML;

	var typedKey = document.getElementById(myKeyCode);
	var keyData = typedKey.getAttribute('data-keyValues');
	// check for each char of keyValues to see of === to curLetter
	if (pressedShift){
		if (keyData.charAt(1) === curLetter )
			return true;
		else
			return false;
	} else if ( pressedDakuten ) {
		if (keyData.charAt(2) === curLetter )
			return true;
		else
			return false;
	} else if ( pressedHandakuten ) {
		if (keyData.charAt(3) === curLetter )
			return true;
		else
			return false;
	} else { // if not modified key stroke
		if (keyData.charAt(0) === curLetter )
			return true;
		else
			return false;
	}
}

function keyDown(myEvent){
	// on keydown event call to see which key was pressed
	var myKeyCode = myEvent.which; // get the keycode

	if ( startTimer) {		// if time has been started actually do stuff
		if ( myKeyCode == 16 ) {
			pressedShift = true;
			downColorMod(myKeyCode);
		} else if (keyboardIsJapanese && myKeyCode == 219) {
			pressedDakuten = true;
			downColorMod(myKeyCode);
		} else if (keyboardIsJapanese && myKeyCode == 221) {
			pressedHandakuten = true;
			downColorMod(myKeyCode);
		} else {
			if (CheckLetter(myKeyCode)) {
				downColorCorrect(myKeyCode);
				correct++;
				total++;
			} else {
				downColorWrong(myKeyCode);
				incorrect++;
			}
			pressedShift = false;
			pressedDakuten = false;
			pressedHandakuten = false;
		}
		CalculateWPM();
		HighlightCurChar();
	}
	if (total >= displaySentence.length) {
		// change to new sentece once old one is complete
		PickSentence();
		total = 0;
		HighlightCurChar();
	}
}

function HighlightCurChar(){
	// highlight the current character of the example sentece to be typed
	var highlitSentence = "";
	for ( var i = 0; i < displaySentence.length; i++) {
		if ( i == total) {
			highlitSentence += "<span class='highlight'>";
			highlitSentence += displaySentence.charAt(i);
			highlitSentence += "</span>";
		} else {
			highlitSentence += displaySentence.charAt(i);	
		}
	}
	DisplaySentence(highlitSentence);
}

function CalculateWPM(){
	// calculate and display the current WPM of the user
	var myTime = new Date(time);
	var myMinutes = myTime.getUTCMinutes();
	var mySeconds = myTime.getUTCSeconds();
	mySeconds= AddZero(mySeconds);
	var totalTime = parseFloat(myMinutes + "." + mySeconds);
	
	wpm = ( correct / 5 ) / ( totalTime );
	wpm = Math.floor((wpm));
	// this seems off, may need to figure out a better calculation.
}

function AddZero(num) {
    if (num < 10) {
        num = "0" + num;
    }
    return num;
}

function downColorCorrect(letter){	// set virtual key color to 'correct' colors
	document.getElementById(letter).style.color = "white";
	document.getElementById(letter).style.backgroundColor = "lime";
}

function downColorWrong(letter){	// set virtual key color to 'wrong' colors
	document.getElementById(letter).style.color = "white";
	document.getElementById(letter).style.backgroundColor = "red";
}

function downColorMod(letter) {
	document.getElementById(letter).style.color = "black";
	document.getElementById(letter).style.backgroundColor = "yellow";
}

function StartButtonColor (){
	if (startTimer) {
		ChangeElementByID("startStopButton","Stop");
		document.getElementById("startStopButton").style.color = "white";
		document.getElementById("startStopButton").style.backgroundColor = "red";
	} else {
		ChangeElementByID("startStopButton","Start");
		document.getElementById("startStopButton").style.color = "white";
		document.getElementById("startStopButton").style.backgroundColor = "lime";
	}
}

function keyUp(){	// onkeyup event call to reset 'virtual' keys to default colors
	var allTheKeys = document.getElementById("allKeys");
	var keyRows = allTheKeys.children;
	for(var x=0;x<keyRows.length;x++){
		var aRow = keyRows[x].children;
		for(var y=0;y<aRow.length;y++){
			aRow[y].style.color = "white";
			aRow[y].style.backgroundColor = "black";
		}
	}
}

function ChangeElementByID(id,newText){
	// set the innerHTML of a element identified by it's ID value
    document.getElementById(id).innerHTML = newText;
}

function Log(x){
	// Less typing to log something.
	console.log(x);
}

function ForEach ( collection, action ) {
	if ( Array.isArray(collection)){
		//array
		for ( var i = 0; i < collection.length; i++ ) {
			action(collection[i]);
		}
	} else if ( IsObject(collection)) {
		//obj
		for ( var item in collection ) {
			action(collection[item]);
		}
	} else {
		// else not collection?
		Log("provided var is not a collection");
	}
}

function IsObject(obj) {
  return obj === Object(obj);
}

var loadedSentences = {	
	sentences : [],
	NumberOfSentences : function(){
		return this.sentences.length;
	},	
	currentSelection : 0,	
	Load : function (array){
		this.sentences = array;
		this.Randomize();
	},	
	ShowAll : function (){
		ForEach(this.sentences,Log);
	},	
	Randomize : function(){
		var prevFirst = this.sentences[0];
		for (var i = 0; i < this.NumberOfSentences(); i++ ) {
			var tmp = this.sentences[i];
			// Log(tmp);
			var rand = Math.floor( (Math.random() * this.NumberOfSentences()));
			// Log(rand);
			this.sentences[i] = this.sentences[rand];
			this.sentences[rand] = tmp;
		}
		// check to make sure first sentece isn't same as last time.
		if ( this.sentences[0] == prevFirst)
			this.Randomize();
	},	
	Next : function(){
		// return next sentence
		var nextSentence = this.sentences[this.currentSelection];
		this.UpdateSelection();
		return nextSentence;
	},	
	UpdateSelection : function () {
		// if less than length ++ else 0 and re-randomize
		if (this.currentSelection < this.NumberOfSentences() - 1){
			this.currentSelection++;
		} else {
			this.currentSelection = 0;
			this.Randomize();
		}
	}
};

function WriteInfoText (arr){
	var output = "";
	ForEach(arr,function(item){
		output += "<p>";
		output += item;
		output += "</p>\n<br>\n";
	});
	ChangeElementByID("infoText",output);
}

// Future ToDos
// user login	// save date / time and WPM per keyboard.
// keep current session data
// save data to user 'account'
// different colors for home row?