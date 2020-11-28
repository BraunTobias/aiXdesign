// ml5.js: Pose Classification
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/7.2-pose-classification.html
// https://youtu.be/FYgYyq-xqAw

// All code: https://editor.p5js.org/codingtrain/sketches/JoZl-QRPK

// Separated into three sketches
// 1: Data Collection: https://editor.p5js.org/codingtrain/sketches/kTM0Gm-1q
// 2: Model Training: https://editor.p5js.org/codingtrain/sketches/-Ywq20rM9
// 3: Model Deployment: https://editor.p5js.org/codingtrain/sketches/c5sDNr8eM

// Code modified by Tobias Braun
var context = new AudioContext();
var audioBuffers = [];

for (let i = 0; i < 3; i++) getAudioData(i);
function getAudioData(i) {
    var audioBuffer;
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
}

function playSound(buffer, time) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(time);
}

let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "NULL";
let lastPoseLabel = "NULL";

let dotPosX;
let dotPosY;
let radius;
let r;
let g;
let b;
let alpha;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
  }
  //console.log(results[0].confidence);
  classifyPose();
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
    push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0, video.width, video.height);

    if (pose) {
        for (let i = 0; i < skeleton.length; i++) {
        let a = skeleton[i][0];
        let b = skeleton[i][1];
        strokeWeight(2);
        stroke(0);

        line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
        for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(0);
        stroke(255);
        ellipse(x, y, 16, 16);
        }
    }
    pop();
    
    if (radius > 0) radius --;
    if (alpha > 0) alpha --;
    if (lastPoseLabel != poseLabel) {
        // console.log('poseLabel: ' + poseLabel)
        alpha = 255;
        switch (lastPoseLabel) {
            case 'R':
                if (poseLabel == 'U') {
                    dotPosX = width / 4 * 3;
                    dotPosY = height / 5*4;
                    radius = 50;
                    r = 255;
                    g = 0;
                    b = 0;

                    var bassdrum = audioBuffers[0];
                    playSound(bassdrum, 0);
                }
                break;
            case 'L':
                if (poseLabel == 'U') {
                    dotPosX = width / 4;
                    dotPosY = height / 5*4;
                    radius = 50;
                    r = 0;
                    g = 255;
                    b = 0;

                    var snaredrum = audioBuffers[1];
                    playSound(snaredrum, 0);
                }
                break;
            case 'O':
                if (poseLabel == 'U') {
                    dotPosX = width / 2;
                    dotPosY = height / 5*4;
                    radius = 75;
                    r = 0;
                    g = 0;
                    b = 255;

                    var hihat = audioBuffers[2];
                    playSound(hihat, 0);
                }
                break;
            // default:
            //     dotPosX = width / 2;
            //     dotPosY = height / 2;
            //     radius = 100;
            //     r = 0;
            //     g = 0;
            //     b = 0;
            //     break;
        }
    }
    fill(r, g, b, alpha);
    noStroke();
    ellipse(dotPosX, dotPosY, radius)
    lastPoseLabel = poseLabel;
    
}