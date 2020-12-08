let video;
let posenet;
let poses;

var beginTime = 5; // sec
var endTime = 120; // sec
var rescaleDimensionFactor = 1;
var videoWidth = 640;
var videoHeight = 480;
var tempo = 90; // BPM (beats per minutes)
var eightNoteTime = (60 / tempo) / 2;
var takt = 1;
var startTime;
var isPlaying = [false, false, false, false];

var handRX = 0, handRY = 0;
var handLX = 0, handLY = 0;

// Bottom Speed-Slider
var sliderPosition = videoWidth/2;

// Visualizations
var visualsPositions = [[], [], [], []];
var visualsRadius = 40;

// Audio
var context = new AudioContext();
var biquadFilters = [];
var gains = [];
var audioBuffers = [];
for (let i = 0; i < 4; i++) getAudioData(i);

var deltaTime = 0;
var lastTime = 0;
var loopTimes = [0, 0, 0, 0]

function setup() {
  video = createCapture(VIDEO);
  rescaleDimensionFactor = windowWidth/videoWidth;
  videoWidth = windowWidth;
  videoHeight = videoHeight * rescaleDimensionFactor;
  createCanvas(videoWidth, videoHeight);
  video.hide();
  
  posenet = ml5.poseNet(video, modelLoaded);
  posenet.on('pose', getPoses);

  // startTime = context.currentTime;
}

function draw() {
  
  background(220);
  translate(videoWidth, 0)
  scale(-1, 1)
  image(video, 0, 0, videoWidth, videoHeight);

  if (poses) {
    // console.log(poses);
    handRX = poses.rightWrist.x * rescaleDimensionFactor;
    handRY = poses.rightWrist.y * rescaleDimensionFactor;
    // console.log('Hand Right: '+ handRX + ', ' + handRY);
    
    handLX = poses.leftWrist.x * rescaleDimensionFactor;
    handLY = poses.leftWrist.y * rescaleDimensionFactor;
    // console.log('Hand Left: '+ handLX + ', ' + handLY);
  }

  // Play Beat
  deltaTime = context.currentTime - lastTime;
  lastTime = context.currentTime
  if (context.currentTime > beginTime && context.currentTime < endTime) {
    loopTimes[0] += deltaTime;
    if(loopTimes[0] > (takt * 8 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
      loopTimes[0] = 0;
      playBeat();
    }
  }

  // Top Area
  topArea();

  // Bottom Speed-Slider
  bottomSpeedSlider();

  // Visualizations
  visualizationsSounds();
  visualizationBody();
}

// Interaction
function topArea() {

  var ranges = {
    y : {
      low: 0, 
      high: videoHeight/2
    },
    x : {
      low: 0, 
      high: videoWidth
    },
    x1 : {
      low : 0,
      high : videoWidth/3,
    },
    x2 : { 
      low : videoWidth/3,
      high : videoWidth/3*2,
    },
    x3 : { 
      low : videoWidth/3*2,
      high : videoWidth,
    }
  };

  if ((handRY < ranges.y.high && handRX > ranges.x1.low && handRX < ranges.x1.high) ||
  (handLY < ranges.y.high && handLX > ranges.x1.low && handLX < ranges.x1.high)) {

    biquadFilters[1].frequency.value = map (handRY, ranges.y.low, ranges.y.high, 5, 20000);
    // biquadFilters[1].detune.value = map (handRX, ranges.x1.low , ranges.x1.high, 0, 45); // Detune
    // biquadFilters[1].Q.value = map (handRX, ranges.x1.low , ranges.x1.high, 0, 50); // Q
    // biquadFilters[1].gain.value =  map (handRX, ranges.x1.low, ranges.x1.high, -100, 100); // Gain // hat keine Auswirkungen
    // gains[1].gain.value = map (handRX, ranges.x1.low , ranges.x1.high, -50, 0); // Volume

    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[1] += deltaTime;
      if(loopTimes[1] > (takt * 8 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[1] = 0;
        playSound(1);
      }
    }
    // if (!isPlaying[1]) {
    //   playSound(1);
    //   isPlaying[1] = true
    // }
    
  }
  if ((handRY < ranges.y.high && handRX > ranges.x2.low && handRX < ranges.x2.high) ||
  (handLY < ranges.y.high && handLX > ranges.x2.low && handLX < ranges.x2.high)) {

    biquadFilters[2].frequency.value = map (handRY, ranges.y.low, ranges.y.high, 5, 20000);
    // biquadFilters[2].detune.value = map (handRX, ranges.x2.low , ranges.x2.high, 0, 45); // Detune
    // biquadFilters[2].Q.value = map (handRX, ranges.x2.low , ranges.x2.high, 0, 50); // Q
    // biquadFilters[2].gain.value =  map (handRX, ranges.x2.low, ranges.x2.high, -100, 100); // Gain // hat keine Auswirkungen
    // gains[2].gain.value = map (handRX, ranges.x2.low , ranges.x2.high, -50, 0); // Volume

    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[2] += deltaTime;
      if(loopTimes[2] > (takt * 8 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[2] = 0;
        playSound(3);
      }
    }
    // if (!isPlaying[2]) {
    //   playSound(2);
    //   isPlaying[2] = true
    // }
  }
  if ((handRY < ranges.y.high && handRX > ranges.x3.low && handRX < ranges.x3.high) || 
  (handLY < ranges.y.high && handLX > ranges.x3.low && handLX < ranges.x3.high)) {

    biquadFilters[3].frequency.value = map (handRY, ranges.y.low, ranges.y.high, 5, 20000);
    // biquadFilters[3].detune.value = map (handRX, ranges.x3.low , ranges.x3.high, 0, 45); // Detune
    // biquadFilters[3].Q.value = map (handRX, ranges.x3.low , ranges.x3.high, 0, 50); // Q
    // biquadFilters[3].gain.value =  map (handRX, ranges.x3.low, ranges.x3.high, -100, 100); // Gain // hat keine Auswirkungen
    // gains[3].gain.value = map (handRX, ranges.x3.low , ranges.x3.high, -50, 0); // Volume

    if (context.currentTime > beginTime && context.currentTime < endTime) {
      loopTimes[3] += deltaTime;
      if(loopTimes[3] > (takt * 8 * eightNoteTime)) { // takt * 8 * eightNoteTime = 4.266
        loopTimes[3] = 0;
        playSound(2);
      }
    }
    // playSound(3);
  }
  
  // Visualization
  strokeWeight(3);
  var margin = 10;
  for (var i = 1; i < 4; i++) {
    switch (i) {
      case 1: 
        fill(255,0,0,50);
        stroke(255,0,0);
        rect(ranges.x1.low + margin, margin, ranges.x1.high - margin*2, videoHeight/2 - margin);
        break;
      case 2: 
        fill(0,255,0,50);
        stroke(0,255,0);
        rect(ranges.x2.low + margin, margin, ranges.x1.high - margin*2, videoHeight/2 - margin);
        break;
      case 3: 
        fill(0,0,255,50);
        stroke(0,0,255);
        rect(ranges.x3.low + margin, margin, ranges.x1.high - margin*2, videoHeight/2 - margin);
        break;
    }
  }
}
function bottomSpeedSlider() {
  if (handLY > videoHeight-150) { 
    sliderPosition = handLX;
    tempo = map(handLX, 0, videoWidth, 80, 400, true);
    eightNoteTime = (60 / tempo) / 2;
  }

  // Visualization
  noStroke();
  fill(200, 200, 200);
  rect(20, videoHeight-40, videoWidth-40, 15);
  fill(100);
  ellipse(sliderPosition, videoHeight-32.5, 30);
}

// Visualization
function chooseColor(color) {
  // console.log('chooseColor')
  switch (color) {
    case '0':
      // console.log('case 0')
      fill(255,255,255,127);
      stroke(255,255,255);
      break;
    case '1':
      // console.log('case 1')
      fill(255,0,0,127);
      stroke(255,0,0);
      break;
    case '2':
      // console.log('case 2')
      fill(0,255,0,127);
      stroke(0,255,0);
      break;
    case '3':
      // console.log('case 3')
      fill(0,0,255,127);
      stroke(0,0,255);
      break;
  }
}
function visualizationsSounds () {
  var currentTime = map (int(context.currentTime), 0, endTime, 0, videoWidth, true);
  
  // console.log(visualsPositions);

  for (sound in visualsPositions) {
    chooseColor(sound);
    for (pos in visualsPositions[sound]) {
      if (currentTime >= visualsPositions[sound][pos])
      
      ellipse(visualsPositions[sound][pos], videoHeight-100*(int(sound)+1), visualsRadius);
    }
    line(0, videoHeight-100*(int(sound)+1), videoWidth, videoHeight-100*(int(sound)+1));
  }
}
function visualizationBody () {
  fill(200,200,200);
  stroke(50,50,50);
  ellipse(handRX, handRY, 40);
  ellipse(handLX, handLY, 40);
}

// Audio
function getAudioData(i) {
  var request = new XMLHttpRequest();
  request.open('GET',  "drumsounds/sound" + (i+1) + ".wav", true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
      var undecodedAudio = request.response;

      context.decodeAudioData(undecodedAudio, function (buffer) {
          audioBuffers[i] = buffer;
      });
  };
  request.send();

  biquadFilters[i] = context.createBiquadFilter();
  gains[i] = context.createGain();
}
function playSounds(buffer, time, i) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  if (i != 0) {
    source.connect(gains[i]);
    gains[i].connect(biquadFilters[i]);
    biquadFilters[i].connect(context.destination);
  } else source.connect(context.destination);
  source.start(time);

  visualsPositions[i].push(map (time, 0, endTime, 0, videoWidth, false));
}
function playBeat() {
  var bassdrum = audioBuffers[0];
  var time = context.currentTime;
  playSounds(bassdrum, time + 0 * eightNoteTime, 0);
  playSounds(bassdrum, time + 2 * eightNoteTime, 0);
  playSounds(bassdrum, time + 4 * eightNoteTime, 0);
}
function playSound(i) {
  var sound = audioBuffers[i];
  var time = context.currentTime;
  playSounds(sound, time + 0 * eightNoteTime, i);
  // playSounds(sound, time + 2 * eightNoteTime, i);
}

// Posemodel
function modelLoaded () {
  console.log('Model loaded');
}
function getPoses (results) {
  if (results.length > 0) {
    poses = results[0].pose;
  }
}