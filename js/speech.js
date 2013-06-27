function getElementsByAttribute(oElm, strTagName, strAttributeName, strAttributeValue) {
    var arrElements = (strTagName === "*" && oElm.all) ? oElm.all : oElm.getElementsByTagName(strTagName),
        arrReturnElements = [],
        oAttributeValue = (typeof strAttributeValue !== "undefined") ? new RegExp("(^|\\s)" + strAttributeValue + ":(\\s|$)", "i") : null,
        oCurrent,
        oAttribute;
    for (var i = 0; i < arrElements.length; i++) {
        oCurrent = arrElements[i];
        oAttribute = oCurrent.getAttribute && oCurrent.getAttribute(strAttributeName);
        if (typeof oAttribute === "string" && oAttribute.length > 0) {
            if (typeof strAttributeValue === "undefined" || (oAttributeValue && oAttributeValue.test(oAttribute))) {
                arrReturnElements.push(oCurrent);
            }
        }
    }
    return arrReturnElements;
}

var ignore,
    gameDone = false,
    start,
    answering = false,
    clue = [],
    recognizing = false,
    numberStrings = [ "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve" ],
    speech = new webkitSpeechRecognition(),
    reverse = false,
    log = document.getElementById( "log" ),
    button = document.getElementById( "start" );

speech.continuous = true;
speech.interimResults = true;
speech.confidence = 0.90;

button.addEventListener( "click", function(ev) {
    reverse = !reverse;
    button.innerHTML = reverse ? "Stop" : "Start";
    console.log( reverse, button.style );
    reverse ? button.classList.add( "stop" ) : button.classList.remove( "stop" );
    reverse ? speech.start() : speech.stop();
    ev.preventDefault();
}, false );

speech.onstart = function() {
    recognizing = true;
    start = Date.now();
    log.innerHTML += ("Speak now" + "<br/>");
};

speech.onerror = function(event) {
    if (event.error === 'no-speech') {
        log.innerHTML += ("No speech was detected. Try Again." + "<br/>");
        ignore = true;
    }
    if (event.error === 'audio-capture') {
            log.innerHTML += ("Seems an mic error has occurred. Try Again" + "<br/>");
        ignore = true;
    }
    if (event.error === 'not-allowed') {
        if ((event.timeStamp - start) < 100) {
        } else {
        }
        ignore = true;
    }
};

speech.onend = function() {
    recognizing = false;
    // if (ignore) {
    //     return;
    // }
    // if (!gameDone) {
    //     return;
    // }
    button.click();
    log.innerHTML += ("Seems you were disconnected. Click Start to continue." + "<br/>");

};

speech.onresult = function(event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            var lowerCase = event.results[i][0].transcript.trim().toLowerCase();
            log.innerHTML += ( lowerCase + "<br/>" );
            log.scrollTop = log.scrollHeight;
            if( ( lowerCase === "cancel word") || ( lowerCase === "clear word") ) {
                answering = false;
                [].slice.call(document.getElementsByClassName('selected')).forEach(function(elem) {
                    elem.classList.remove("selected");
                    if( lowerCase === "clear word") {
                        elem.innerHTML = "";
                    }
                });
                return;
            }
            if( lowerCase === "stop game" || lowerCase === "stopgame") {
                [].slice.call(document.getElementsByClassName('selected')).forEach(function(elem) {
                    elem.classList.remove("selected");
                });
                speech.stop();
                gameDone = true;
                return;
            }
            var answer = lowerCase.split("");
            if (answer.length < 2) {
                return;
            }
            var test = lowerCase.split(" "),
                dir = null,
                number = null;
            if (test.length >= 2) {
                if (test[1].indexOf("cross") !== -1) {
                    dir = "across";
                }
                else {
                    if (test[1].indexOf("down") !== -1) {
                        dir = "down";
                    }
                }
                number = parseInt( test[0], 10 ) || numberStrings.indexOf(test[0]) || test[0];

            }

            if (!answering && dir) {
                clue = getElementsByAttribute(document.getElementById("crossword"), "td", "title", number + " " + dir);
            }

            if (!answering && clue && clue.length > 2) {
                answering = true;
                for (var j = 0; j < clue.length; j++) {
                    clue[j].classList.add("selected");
                }
            } else {
                if( answer.length >= clue.length ) {
                    for (var f = 0; f < clue.length; f++) {
                        clue[f].innerHTML = answer[f];
                        answering = false;
                        clue[f].classList.remove("selected");
                    }
                }
            }
        }
    }
};