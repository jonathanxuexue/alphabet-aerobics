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

    let lastWordSaid = event.results[event.results.length - 1][0].transcript.trim();

    console.log(text);
    console.log('LAST WORD: ', lastWordSaid);

    if (lastWordSaid == 'click' || lastWordSaid == 'press' || lastWordSaid == 'print' || lastWordSaid == 'select') {
        console.log('writing on!');
        letterContainer.innerText = letterContainer.innerText + ' ' + lastClass;
    }
};

recognition.onend = function (event) {
    console.log('speech recognition ended');
    recognition.start();
};

// these are the colors of our bars
let colors = ['#E67701', '#D84C6F', '#794AEF', '#1291D0'];
let lightColors = ['#FFECE2', '#FFE9EC', '#F1F0FF', '#E2F5FF'];

// This function makes the bar graph
// it takes in a URL to a teachable machine model,
// so we can retrieve the labels of our classes for the bars
export async function setupBarGraph(URL) {
    // the metatadata json file contains the text labels of your model
    const metadataURL = `${URL}metadata.json`;
    // get the metadata fdrom the file URL
    const response = await fetch(metadataURL);
    const json = await response.json();
    // get the names of the labels from the metadata of the model
    labels = json.labels;
    // get the area of the webpage we want to build the bar graph
    graphWrapper = document.getElementById('graph-wrapper');
    letterContainer = document.getElementById('text');
    // make a bar in the graph for each label in the metadata
    labels.forEach((label, index) => makeBar(label, index));
}

// Render each class
function makeBar(label, index) {
    // make the elements of the bar
    let barWrapper = document.createElement('div');
    barWrapper.classList.add('class');
    barWrapper.id = label;
    let barEl = document.createElement('progress');
    let percentEl = document.createElement('span');
    let labelEl = document.createElement('span');
    labelEl.innerText = label;

    let labelImage = document.createElement('img');
    labelImage.src = '../public/' + label.toLowerCase() + 'Draw.png';


    // assemble the elements
    barWrapper.appendChild(labelEl);
    barWrapper.appendChild(barEl);
    barWrapper.appendChild(percentEl);
    barWrapper.appendChild(labelImage);
    labelImage.classList.add('letter-image');
    let graphWrapper = document.getElementById('graph-wrapper');
    graphWrapper.appendChild(barWrapper);

    // style the elements
    let color = colors[index % colors.length];
    let lightColor = lightColors[index % colors.length];
    barWrapper.style.color = color;
    barWrapper.style.setProperty('--color', color);
    barWrapper.style.setProperty('--color-light', lightColor);

    // save references to each element, so we can update them later
    bars[label] = {
        bar: barEl,
        percent: percentEl
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
        let barElement = barElements.bar;
        let percentElement = barElements.percent;
        // set the progress on the bar
        barElement.value = probability;
        if (probability > highestProb) {
            highestProb = probability;
            currentClass = className;
        }
        // set the percent value on the label
        percentElement.innerText = convertToPercent(probability);
    });

    lastClass = currentClass;
    
    data.forEach(({ className, probability }) => {
        if (lastClass == className) {
            document.getElementById(className).style.background = 'yellow';
        } else {
            document.getElementById(className).style.background = 'none';
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
