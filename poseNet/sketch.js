let video;
let posenet;
let poses;

function setup() {
  createCanvas(480, 360);
  video = createCapture(VIDEO);
  video.hide();
  posenet = ml5.poseNet(video, modelLoaded);
  posenet.on('pose', getPoses);
}

function draw() {
  
  background(220);
  image(video, 0, 0, width, height);
  // scale(-1.0, 1.0)
  if (poses) {
    // console.log(poses);
    handRX = poses.rightWrist.x;
    handRY = poses.rightWrist.y;
    console.log('Hand Right: '+ handRX + ', ' + handRY);
    
    handLX = poses.leftWrist.x;
    handLY = poses.leftWrist.y;
    console.log('Hand Left: '+ handLX + ', ' + handLY);

    topCornerEllipses(handRX, handRY, handLX, handLY);
    drums(handRX, handRY, handLX, handLY);
  }
  
}
function topCornerEllipses (handRX, handRY, handLX, handLY) {
  if (handRY < 200)fill(255, 0, 0);
  else fill(80, 80, 80);
  ellipse(0, 0, 50);
  if (handLY < 200)fill(0, 255, 0);
  else fill(80, 80, 80);
  ellipse(480, 0, 50);
}
function drums (handRX, handRY, handLX, handLY) {
  if ((0 < handRX && handRX < 150 && 250 < handRY && handRY < 350) || (0 < handLX && handLX < 150 && 250 < handLY && handLY < 350)) {
    fill(255, 0, 0, 175);
  }
  else fill(120, 120, 120, 175);
  // ellipse(75, 300, 150, 100);
  rect(0,250, 150,100);
  
  if ((330 < handRX && handRX < 480 && 250 < handRY && handRY < 350) || (330 < handLX && handLX < 480 && 250 < handLY && handLY < 350)) {
    fill(0, 255, 0, 175);
  }
  else fill(120, 120, 120, 175);
  // ellipse(405, 300, 150, 100);
  rect(330,250, 150,100);
}

function modelLoaded () {
  createDiv('Model loaded');
}

function getPoses (results) {
  // if (results.length < 0) {
    poses = results[0].pose;
  // }
}