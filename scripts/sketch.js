let isButtonPressed = false;

let video;
let posenet;
let poses;
let handRX = 0, handRY = 0;
let handLX = 0, handLY = 0;
let lastRX = 0, lastRY = 0;
let lastLX = 0, lastLY = 0;
let beginTime = 2; // sec
let endTime = 120; // sec

// Menü
// let font;
let headlineTextSize = 60;
let buttonTextSize = 40;

// Visualisierung
let rescaleDimensionFactor = 1;
let history = 2;
let videoWidth = 640;
let videoHeight = 480;
let ranges = {};
// Bottom Speed-Slider
let sliderPosition = videoWidth / 2;
// Visualizations
let visualsPositions = [[], [], [], []];
let visualsRadius = 100;
// Hands
let imgR, imgL;

// Audio
let context;
let source;
let sphere;
let sphereIsPlaying = false;
var sphereFilter;

let biquadFilters = [];
let audioBuffers = [];

// Time
let startTime;
let deltaTime = 0;
let lastTime = 0;
let loopTimes = [0, 0, 0, 0]
let isPlaying = [false, false, false, false];
// Tempo
let tempo = 90; // BPM (beats per minutes)
let eightNoteTime = (60 / tempo) / 2;
let takt = 1;

function createAudioContext(theme) {

  context = new AudioContext();

  sphere = new Audio(theme + "/sphere.wav");
  sphere.loop = true;
  source = context.createMediaElementSource(sphere);
  sphereFilter = context.createBiquadFilter();

  source.connect(sphereFilter)
  sphereFilter.connect(context.destination);

  biquadFilters = [];
  audioBuffers = [];
  for (let i = 0; i < 3; i++) getAudioData(i, theme);

  isButtonPressed = true;

  video = createCapture(VIDEO);
  video.hide();

  posenet = ml5.poseNet(video, modelLoaded);
  posenet.on('pose', getPoses);
}

function preload() {
  // Font
  // font = loadFont('/assets/')

  // Handvisuals
  imgR = loadImage('assets/R2.png');
  imgL = loadImage('assets/L2.png');
}

function setup() {
  background(0);
  rescaleDimensionFactor = windowWidth / videoWidth;
  videoWidth = window.innerWidth;
  videoHeight = window.innerHeight; //videoHeight * rescaleDimensionFactor;
  createCanvas(videoWidth, videoHeight);

  // areas on window edges
  ranges = {
    x: {
      low: 0,
      high: videoWidth
    },
    y: {
      low: 0,
      high: videoHeight
    },
    x1: {
      low: 0,
      high: videoWidth / 4,
      width: videoWidth / 4
    },
    y1: {
      low: videoWidth / 8,
      high: videoHeight / 8 * 5,
      height: videoHeight / 2,
    },
    x2: {
      low: videoWidth / 4,
      high: videoWidth / 4 * 3,
      width: videoWidth / 2,
    },
    y2: {
      low: 0,
      high: videoWidth / 4,
      height: videoWidth / 4,
    },
    x3: {
      low: videoWidth / 4 * 3,
      high: videoWidth / 4 * 4,
      width: videoWidth / 4,
    },
    y3: {
      low: videoWidth / 8,
      high: videoHeight / 8 * 5,
      height: videoHeight / 2,
    }
  };
}

function draw() {
  background(0);
  translate(videoWidth, 0)

  // Wenn Spiel noch nicht läuft, Buttons anzeigen
  if (!isButtonPressed) {
    scale(1, 1)

    let string = 'WÄHLE EINE SOUNDWELT'
    textSize(headlineTextSize);
    textAlign(CENTER);
    fill(255);
    text(string, -videoWidth / 2, videoHeight / 7 * 2);

    
    textSize(buttonTextSize);
    string = 'SPHÄRISCH'
    text(string, - videoWidth / 9 * 2, videoHeight / 7 * 4);
    string = 'EXPERIMENTELL'
    text(string, - videoWidth / 2, videoHeight / 7 * 4);
    string = 'MEDITATIV'
    text(string, - videoWidth / 9 * 7, videoHeight / 7 * 4);

  }
  // Wenn Buttons gedrückt worden sind, Spiel starten
  else {
    scale(-1, 1)

    // image(video, 0, 0, videoWidth, videoHeight);
    let currentHandRX = 0, currentHandRY = 0;
    let currentHandLX = 0, currentHandLY = 0;
    if (poses) {
      currentHandRX = (poses.rightWrist.x * rescaleDimensionFactor + handRX + lastRX) / 3;
      currentHandRY = (poses.rightWrist.y * rescaleDimensionFactor + handRY + lastRY) / 3;
      currentHandLX = (poses.leftWrist.x * rescaleDimensionFactor + handLX + lastLX) / 3;
      currentHandLY = (poses.leftWrist.y * rescaleDimensionFactor + handLY + lastLY) / 3;
    }
    lastRX = handRX;
    lastRY = handRY;
    lastLX = handLX;
    lastLY = handLY;
    handRX = currentHandRX;
    handRY = currentHandRY;
    handLX = currentHandLX;
    handLY = currentHandLY;

    // Play Beat
    deltaTime = context.currentTime - lastTime;
    // console.log(deltaTime);
    lastTime = context.currentTime
    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[0] += deltaTime;
      if (loopTimes[0] > (takt * 8 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[0] = 0;
        playBeat(0, 2500, 0);
      }
    }

    // Top Area
    topArea();

    // Visualizations
    // visualsSoundsAtHandPos();
    visualizationBody();

    // Bottom Speed-Slider
    bottomSpeedSlider();

    visualsNoisy(visualsPositions, tempo);
  }
}

function mousePressed() {
  if (mouseY > videoHeight / 7 * 4 - buttonTextSize / 2 && mouseY < videoHeight / 7 * 4 + buttonTextSize / 2) {
    if (mouseX > videoWidth / 9 * 2 -40 && mouseX < videoWidth / 9 * 2 +40){
      createAudioContext("theme1");
    } else if (mouseX > videoWidth / 2 -40 && mouseX < videoWidth / 2 +40){
      createAudioContext("theme2");
    } else if (mouseX > videoWidth / 9 * 2 -40 && mouseX < videoWidth / 9 * 4 +40){
      createAudioContext("theme3");
    }
  }
}

// Interaction
function topArea() {

  // Rot
  if (handRY > ranges.y1.low && handRY < ranges.y1.high && handRX > ranges.x1.low && handRX < ranges.x1.high) {

    // biquadFilters[1].frequency.value = map (handRY, ranges.y.low, ranges.y.high, 5, 20000);
    // biquadFilters[1].detune.value = map (handRX, ranges.x1.low , ranges.x1.high, 0, 45); // Detune
    // biquadFilters[1].Q.value = map (handRX, ranges.x1.low , ranges.x1.high, 0, 50); // Q
    // biquadFilters[1].gain.value =  map (handRX, ranges.x1.low, ranges.x1.high, -100, 100); // Gain // hat keine Auswirkungen
    // gains[1].gain.value = map (handRY, ranges.y.low, ranges.y.high, -50, 0); // Volume

    var random = Math.random();
    var detune = 100;
    var frequency = map(handRY, ranges.y1.high, ranges.y1.low, 500, 5000);// + random *50 -25;
    var Q = map(handRX, ranges.x1.low, ranges.x1.high, 0, 50, true);// + random *10 -5;
    var gain = map(handRX, ranges.x1.low, ranges.x1.high, 1, 0, true);

    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[1] += deltaTime;
      if (loopTimes[1] > (takt * 8 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[1] = 0;
        playSoundRight(detune, frequency, Q, gain);
      }
    }
  } else if (handLY > ranges.y1.low && handLY < ranges.y1.high && handLX > ranges.x1.low && handLX < ranges.x1.high) {

    // biquadFilters[1].frequency.value = map (handRY, ranges.y.low, ranges.y.high, 5, 20000);
    // biquadFilters[1].detune.value = map (handRX, ranges.x1.low , ranges.x1.high, 0, 45); // Detune
    // biquadFilters[1].Q.value = map (handRX, ranges.x1.low , ranges.x1.high, 0, 50); // Q
    // biquadFilters[1].gain.value =  map (handRX, ranges.x1.low, ranges.x1.high, -100, 100); // Gain // hat keine Auswirkungen
    // gains[1].gain.value = map (handRY, ranges.y.low, ranges.y.high, -50, 0); // Volume

    var random = Math.random();
    var detune = 100;
    var frequency = map(handLY, ranges.y1.high, ranges.y1.low, 500, 5000);// + random *50 -25;
    var Q = map(handLX, ranges.x1.low, ranges.x1.high, 0, 50, true);// + random *10 -5;
    var gain = map(handLX, ranges.x1.low, ranges.x1.high, 1, 0, true);

    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[1] += deltaTime;
      if (loopTimes[1] > (takt * 8 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[1] = 0;
        playSoundRight(detune, frequency, Q, gain);
      }
    }
  }
  // Grün
  if (handRY > ranges.y2.low && handRY < ranges.y2.high && handRX > ranges.x2.low && handRX < ranges.x2.high) {

    // var random = Math.random();
    // var detune = 100;
    // var frequency = map (handRY, ranges.y2.high, ranges.y2.low, 500, 5000);// + random *50 -25;
    // var Q = map (handRX, ranges.x2.low , ranges.x2.high, 0, 50, true);// + random *10 -5;
    // var gain = map (handRY, ranges.y2.high, ranges.y2.low, 0, 0.5, true);

    // if (context.currentTime > beginTime && context.currentTime < endTime) {
    //   loopTimes[2] += deltaTime;
    //   if(loopTimes[2] > (takt * 1 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
    //     loopTimes[2] = 0;
    //     playSound2(detune, frequency, Q, gain);
    //   }
    // }

    sphereFilter.frequency.value = map(handRY, ranges.y2.high, ranges.y2.low, 500, 5000);
    sphereFilter.Q.value = map(handRX, ranges.x2.low, ranges.x2.high, 0, 50, true);
    sphereFilter.gain.value = map(handRY, ranges.y2.high, ranges.y2.low, 0, 0.5, true);
    // gainNode.gain.value = map (handRY, ranges.y2.high, ranges.y2.low, 0, 1, true);

    if (!sphereIsPlaying) sphere.play();
    sphereIsPlaying = true;

  } else if (handLY > ranges.y2.low && handLY < ranges.y2.high && handLX > ranges.x2.low && handLX < ranges.x2.high) {

    // var random = Math.random();
    // var detune = 100;
    // var frequency = map (handLY, ranges.y2.high, ranges.y2.low, 500, 5000);// + random *50 -25;
    // var Q = map (handLX, ranges.x2.low , ranges.x2.high, 0, 50, true);// + random *10 -5;
    // var gain = map (handLY, ranges.y2.high, ranges.y2.low, 0, 0.5, true);

    // if (context.currentTime > beginTime && context.currentTime < endTime) {
    //   loopTimes[2] += deltaTime;
    //   if(loopTimes[2] > (takt * 1 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
    //     loopTimes[2] = 0;
    //     playSound2(detune, frequency, Q, gain);
    //   }
    // }

    sphereFilter.frequency.value = map(handLX, ranges.x2.low, ranges.x2.high, 500, 5000);
    sphereFilter.Q.value = map(handLX, ranges.x2.low, ranges.x2.high, 0, 50, true);
    sphereFilter.gain.value = map(handLY, ranges.y2.high, ranges.y2.low, 0, 0.5, true);
    // gainNode.gain.value = map (handRY, ranges.y2.high, ranges.y2.low, 0, 1, true);

    if (!sphereIsPlaying) sphere.play();
    sphereIsPlaying = true;
  } else {
    sphereIsPlaying = false;
    sphere.pause()
  }
  // Blau
  if (handRY > ranges.y3.low && handRY < ranges.y3.high && handRX > ranges.x3.low && handRX < ranges.x3.high) {

    var random = Math.random();
    var detune = 100;
    var frequency = map(handRY, ranges.y3.high, ranges.y3.low, 500, 5000);// + random *50 -25;
    var Q = map(handRX, ranges.x3.low, ranges.x3.high, 0, 50, true);// + random *10 -5;
    var gain = map(handRX, ranges.x3.low, ranges.x3.high, 0, 3, true);

    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[3] += deltaTime;
      if (loopTimes[3] > (takt * 2 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[3] = 0;
        playSoundLeft(detune, frequency, Q, gain);
      }
    }
  } else if (handLY > ranges.y3.low && handLY < ranges.y3.high && handLX > ranges.x3.low && handLX < ranges.x3.high) {

    var random = Math.random();
    var detune = 100;
    var frequency = map(handLY, ranges.y3.high, ranges.y3.low, 500, 5000);// + random *50 -25;
    var Q = map(handLX, ranges.x3.low, ranges.x3.high, 0, 50, true);// + random *5 -2.5;
    var gain = map(handLX, ranges.x3.low, ranges.x3.high, 0, 3, true);

    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[3] += deltaTime;
      if (loopTimes[3] > (takt * 2 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[3] = 0;
        playSoundLeft(detune, frequency, Q, gain);
      }
    }
  }

  // Visualization Areas
  visualsAreas()
}
function bottomSpeedSlider() {
  if (handLY > videoHeight - 150) {
    sliderPosition = handLX;
    tempo = map(handLX, 0, videoWidth, 80, 400, true);
    eightNoteTime = (60 / tempo) / 2;
  }

  // Visualization
  noStroke();
  fill(200, 200, 200);
  rect(20, videoHeight - 40, videoWidth - 40, 15);
  fill(100);
  ellipse(sliderPosition, videoHeight - 32.5, 30);
}

// Visualization
function chooseColor(color, value) { //value: Wert zw. 0 - 50
  // val = map (value, 0, 50 , 0, 127, false);
  val = value / 100;
  switch (color) {
    case '0':
      fill(255, 255, 255, 127);
      stroke(255, 255, 255);
      break;
    case '1':
      fill(127 + 127 * val * 2, 200 * val, 200 * val, 127);
      stroke(255, 0, 0);
      break;
    case '2':
      fill(200 * val, 127 + 127 * val * 2, 200 * val, 127);
      stroke(0, 255, 0);
      break;
    case '3':
      fill(200 * val, 200 * val, 127 + 127 * val * 2, 127);
      stroke(0, 0, 255);
      break;
  }
}
function visualsSoundsAtHandPos() {
  if (context.currentTime < endTime) var currentTime = context.currentTime;
  else var currentTime = endTime;
  // Beat
  var sound = 0;
  for (visual in visualsPositions[sound]) {
    if (currentTime >= visualsPositions[sound][visual][0]) {
      let alphaVal = map(currentTime - visualsPositions[sound][visual][0], 0, 0.85, 255, 0)
      fill(127, 127, 127, alphaVal);
      noStroke();
      ellipse(videoWidth / 2, videoHeight, visualsRadius * 4);
    }
  }
  // Rot
  sound = 1;
  for (visual in visualsPositions[sound]) {
    let gain = visualsPositions[sound][visual][3];
    var frequencyPos = map(visualsPositions[sound][visual][1], 500, 5000, ranges.y1.high, ranges.y1.low);
    var QPos = map(visualsPositions[sound][visual][2], 0, 50, ranges.x1.low, ranges.x1.high);
    let val = visualsPositions[sound][visual][2] / 100;

    if (currentTime >= visualsPositions[sound][visual][0]) {
      let alphaVal = map(currentTime - visualsPositions[sound][visual][0], 0, 10, 255, 0)
      fill(127 + 127 * val * 2, 200 * val, 200 * val, alphaVal);
      noStroke();
      ellipse(QPos, frequencyPos, visualsRadius * gain);
    }
  }
  // Grün
  sound = 2;
  for (visual in visualsPositions[sound]) {
    let gain = visualsPositions[sound][visual][3];
    var frequencyPos = map(visualsPositions[sound][visual][1], 500, 5000, ranges.y2.high, ranges.y2.low);
    var QPos = map(visualsPositions[sound][visual][2], 0, 50, ranges.x2.low, ranges.x2.high);
    let val = visualsPositions[sound][visual][2] / 100;

    if (currentTime >= visualsPositions[2][visual][0]) {
      let alphaVal = map(currentTime - visualsPositions[sound][visual][0], 0, 10, 255, 0)
      fill(200 * val, 127 + 127 * val * 2, 200 * val, alphaVal);
      noStroke();
      ellipse(QPos, frequencyPos, visualsRadius * gain * 2);
    }
  }
  // Blau
  sound = 3;
  for (visual in visualsPositions[sound]) {
    let gain = visualsPositions[sound][visual][3];
    var frequencyPos = map(visualsPositions[sound][visual][1], 500, 5000, ranges.y3.high, ranges.y3.low);
    var QPos = map(visualsPositions[sound][visual][2], 0, 50, ranges.x3.low, ranges.x3.high);
    let val = visualsPositions[sound][visual][2] / 100;

    if (currentTime >= visualsPositions[3][visual][0]) {
      let alphaVal = map(currentTime - visualsPositions[sound][visual][0], 0, 10, 255, 0)
      fill(200 * val, 200 * val, 127 + 127 * val * 2, alphaVal);
      noStroke();
      ellipse(QPos, frequencyPos, visualsRadius * gain / 3);
    }
  }
}
function visualsSoundsOnBottomLines() {
  if (context.currentTime < endTime) var currentTime = context.currentTime;
  else var currentTime = endTime;
  for (sound in visualsPositions) {
    for (visual in visualsPositions[sound]) {
      if (currentTime >= visualsPositions[sound][visual][0]) {
        chooseColor(sound, visualsPositions[sound][visual][2]);
        noStroke();
        ellipse(
          // Laufleiste
          // map(visualsPositions[sound][visual][0], beginTime, endTime, videoWidth, 0, false),

          // Zeitleiste
          map(visualsPositions[sound][visual][0] - currentTime, endTime, 0, 0, videoWidth * history, false) - videoWidth * 2,

          videoHeight - 100 * (int(sound) + 1) - map(visualsPositions[sound][visual][1], 500, 5000, -20, 20),
          visualsRadius
        );
      }
    }
    chooseColor(sound, 0);
    line(0, videoHeight - 100 * (int(sound) + 1), videoWidth, videoHeight - 100 * (int(sound) + 1));
  }
}
function visualizationBody() {
  // fill(200, 200, 200);
  // stroke(50, 50, 50);
  // ellipse(handRX, handRY, 40);
  // ellipse(handLX, handLY, 40);
  image(imgR, handLX-36, handLY-50, 72, 100);
  image(imgL, handRX-36, handRY-50, 72, 100);
}
function visualsAreas1() {
  strokeWeight(5);
  var margin = 10;
  for (var i = 1; i < 4; i++) {
    switch (i) {
      case 1:
        fill(255, 0, 0, 0);
        stroke(255, 0, 0, 100);
        rect(ranges.x1.low + margin, ranges.y1.low + margin, ranges.x1.width - margin * 2, ranges.y1.height - margin * 2);
        break;
      case 2:
        fill(0, 255, 0, 0);
        stroke(0, 255, 0, 100);
        rect(ranges.x2.low + margin, ranges.y2.low + margin, ranges.x2.width - margin * 2, ranges.y2.height - margin * 2);
        break;
      case 3:
        fill(0, 0, 255, 0);
        stroke(0, 0, 255, 100);
        rect(ranges.x3.low + margin, ranges.y3.low + margin, ranges.x3.width - margin * 2, ranges.y3.height - margin * 2);
        break;
    }
  }
}
function visualsAreas() {
  strokeWeight(2);
  let margin = 10;
  let cornersR = 20;
  noFill();
  stroke(255, 255, 255, 50);
  for (var i = 1; i < 4; i++) {
    switch (i) {
      case 1:
        rect(
          ranges.x1.low + margin, // X
          ranges.y1.low + margin, // Y
          ranges.x1.width - margin * 2, // w 
          ranges.y1.height - margin * 2, // h
          cornersR // 
        );
        break;
      case 2:
        rect(
          ranges.x2.low + margin, 
          ranges.y2.low + margin, 
          ranges.x2.width - margin * 2, 
          ranges.y2.height - margin * 2,
          cornersR
        );
        break;
      case 3:
        rect(
          ranges.x3.low + margin, 
          ranges.y3.low + margin, 
          ranges.x3.width - margin * 2, 
          ranges.y3.height - margin * 2,
          cornersR
        );
        break;
    }
  }
}

// Audio
function getAudioData(i, theme) {

  var request = new XMLHttpRequest();
  request.open('GET', theme + "/sound" + (i + 1) + ".wav", true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    var undecodedAudio = request.response;

    context.decodeAudioData(undecodedAudio, function (buffer) {
      audioBuffers[i] = buffer;
    });
  };
  request.send();

  biquadFilters[i] = context.createBiquadFilter();
}

function playSounds(buffer, time, i, detune, frequency, Q, gain) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  // if (i != 0) {
  source.connect(biquadFilters[i]);
  biquadFilters[i].connect(context.destination);

  biquadFilters[i].detune.value = detune;
  biquadFilters[i].frequency.value = frequency;
  biquadFilters[i].Q.value = Q;

  // } else source.connect(context.destination);
  source.start(time);

  visualsPositions[i].push([
    time,
    frequency,
    Q,
    gain
  ]);
}
function playBeat(detune, frequency, Q) {
  var bassdrum = audioBuffers[0];
  var time = context.currentTime;
  playSounds(bassdrum, time + 0 * eightNoteTime, 0, detune, frequency, Q, 1);
  // playSounds(bassdrum, time + 2 * eightNoteTime, 0, detune, frequency, Q, 1);
  // playSounds(bassdrum, time + 4 * eightNoteTime, 0, detune, frequency, Q, 1);
}
function playSoundRight(detune, frequency, Q, gain) {
  var sound = audioBuffers[1];
  var time = context.currentTime;
  playSounds(sound, time + 0 * eightNoteTime, 1, detune, frequency, Q, gain);
}
function playSoundLeft(detune, frequency, Q, gain) {
  var sound = audioBuffers[2];
  var time = context.currentTime;
  playSounds(sound, time + 0 * eightNoteTime, 2, detune, frequency, Q, gain);
  // playSounds(sound, time + 2 * eightNoteTime, 2, detune, frequency, Q, gain);
  // playSounds(sound, time + 4 * eightNoteTime, 2, detune, frequency, Q, gain);
  // playSounds(sound, time + 6 * eightNoteTime, 2, detune, frequency, Q, gain);
}
/* function playSound(i) {
   var sound = audioBuffers[i];
   var time = context.currentTime;
   playSounds(sound, time + 0 * eightNoteTime, i);
 }*/

// Posemodel
function modelLoaded() {
  console.log('Model loaded');
}
function getPoses(results) {
  if (results.length > 0) {
    poses = results[0].pose;
  }
}

// document.getElementById("buttonPlay").addEventListener("click", function (e) { createAudioContext() } );
// document.getElementById("Theme1").addEventListener("click", function (e) { createAudioContext("theme1") } );
// document.getElementById("Theme2").addEventListener("click", function (e) { createAudioContext("theme2") } );
// document.getElementById("Theme3").addEventListener("click", function (e) { createAudioContext("theme3") } );