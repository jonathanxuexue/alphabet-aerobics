let labels = [];
let bars = {};
let graphWrapper;
let letterContainer;
let lastClass;

// Speech recognition stuff
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent =
    SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
let recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.start();
let text = '';

const keyword = 'click';

recognition.onstart = function (event) {
    console.log('SPEECH REC STARTED');
}

recognition.onresult = function (event) {
    let fullTranscript = '';
    for (let r = 0; r < event.results.length; r++) {
        fullTranscript += event.results[r][0].transcript;
    }
    text = fullTranscript;

    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    const words = transcript.split(' ');
    const lastWordSaid = words[words.length - 1];

    console.log(text);
    console.log('LAST WORD: ', lastWordSaid);

    if (lastWordSaid == 'click' || lastWordSaid == 'press' || lastWordSaid == 'print' || lastWordSaid == 'select') {
        console.log('writing on!');
        letterContainer.innerText = letterContainer.innerText + ' ' + lastClass;
        bars[className].image.classList.add('selected');
    }
};

recognition.onend = function (event) {
    console.log('speech recognition ended');
    recognition.start();
};

export async function setupKeyboard(URL) {
    // the metatadata json file contains the text labels of your model
    const metadataURL = `${URL}metadata.json`;
    // get the metadata fdrom the file URL
    const response = await fetch(metadataURL);
    const json = await response.json();

    // get the names of the labels from the metadata of the model
    labels = json.labels;

    //get the area of the webpage we want to build the keys
    let keyback = document.getElementById('back');
    letterContainer = document.getElementById('text');


    labels.forEach((label) => makeKey(label));
}

function makeKey(label) {
    let key = document.createElement('div');
    key.classList.add('key');
    key.classList.add('key' + label);
    key.id = label;

    let keyImage = document.createElement('img');
    keyImage.classList.add('letter-image')
    keyImage.src =  '../alphabet-aerobics/public/' + label.toLowerCase() + 'Draw.svg';

    let keyback =  document.getElementById('back');
    keyback.appendChild(key);
    key.appendChild(keyImage);
}

export async function setupDisplay(URL) {
    const metadataURL = `${URL}metadata.json`;
    // get the metadata fdrom the file URL
    const response = await fetch(metadataURL);
    const json = await response.json();

    // get the names of the labels from the metadata of the model
    labels = json.labels;

    let display = document.getElementById('display-wrapper');

    labels.forEach((label) => makeImage(label));
}

function makeImage(label) {

    let displayImage = document.createElement('img');

    displayImage.classList.add('letter');
    displayImage.src = '../alphabet-aerobics/public/' + label.toLowerCase() + 'Draw.svg';

    let display = document.getElementById('display-wrapper');

    display.appendChild(displayImage);

    bars[label] = {
        image: displayImage
    };
}



// This function takes data (retrieved in the model.js file)
// The data is in the form of an array of objects like this:
// [{ className:class1, probability:0.75 }, { className:class2, probability:0.25 }, ... ]
// it uses this data to update the progress and labels of of each bar in the graph
export function updateBarGraph(data) {
    // iterate through each element in the data
    let currentClass;
    let highestProb = 0;
    data.forEach(({ className, probability }) => {
        // get the HTML elements that we stored in the makeBar function
        let barElements = bars[className];
        let image = barElements.image;
        // set the progress on the bar
        if (probability > highestProb) {
            highestProb = probability;
            currentClass = className;
        }
        // set the percent value on the label
        // percentElement.innerText = convertToPercent(probability);
    });

    lastClass = currentClass;

    // |data| is of the format:
    // [ {className: 'A', probability: 0.4, num: 2, magic: true }, {...}, {...}, {...} ]

    // data.forEach((datum) => {
    //     // |datum| is of  the format:
    //     // { className: 'B', probability: 0.3 }
    //     const className = datum.className;
    //     const probability = datum.probability;
    // });

    // data.forEach(({ className, probability, ...rest}) => {
    //     // |datum| is of  the format:
    //     // { className: 'B', probability: 0.3 }
    //     // const className = datum.className;
    //     // const probability = datum.probability;
    // });
    
    data.forEach(({ className, probability }) => {
       
        if (lastClass == className) {
            bars[className].image.classList.add('on');
        } else {
            bars[className].image.classList.remove('on');
        }
    });

    // if (lastClass != currentClass) {
    //     if (currentClass == data[0].className) {
    //         // First class
    //         letterContainer.innerText = letterContainer.innerText + 'A';
    //     } else if (currentClass == data[1].className) {
    //         // Second class
    //         letterContainer.innerText = letterContainer.innerText + 'B';
    //     }
    // }
}

// This function converts a decimal number (between 0 and 1)
// to an integer percent (between 0% and 100%)
function convertToPercent(num) {
    num *= 100;
    num = Math.round(num);
    return `${num}%`;
}
