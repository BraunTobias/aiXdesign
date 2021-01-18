function visualsNoisy(visualsPositions, tempo) {
    translate(videoWidth / 2, videoHeight / 2);

    strokeWeight(1);
    stroke(255);
    noFill();

    let noiseMax = 1;
    let noiseHeight = 20;
    let radius = 0;
    
    // Beat
    let sound = 0;
    if (visualsPositions[sound].length) {
        let lastSound = visualsPositions[sound][visualsPositions[sound].length -1][0]; // Spielzeit vom letzten Sound
        let deltaSound = context.currentTime - lastSound; // Zeit die seit dem letzten Sound vergangen ist
        if (deltaSound < 2) {
            radius = map(deltaSound, 0, 2, 50, 0);
            noiseMax = map(deltaSound, 0, 2, 2, 1);
            noiseHeight = map(deltaSound, 0, 2, 400, 30);
            // if (radius < 0) radius = 0;
        }
    }

    // Sound 1
    sound = 1;
    if (visualsPositions[sound].length) {
        let lastSound = visualsPositions[sound][visualsPositions[sound].length -1][0]; // Spielzeit vom letzten Sound
        let deltaSound = context.currentTime - lastSound; // Zeit die seit dem letzten Sound vergangen ist
        if (deltaSound < 4) {
            // radius = map(deltaSound, 0, 4, 50, 0);
            noiseMax += map(deltaSound, 0, 4, 3, 0);
            noiseHeight += map(deltaSound, 0, 4, 30, 0);
        }
    } 

    // Sound 2
    sound = 2;
    if (visualsPositions[sound].length) {
        let lastSound = visualsPositions[sound][visualsPositions[sound].length -1][0]; // Spielzeit vom letzten Sound
        let deltaSound = context.currentTime - lastSound; // Zeit die seit dem letzten Sound vergangen ist
        if (deltaSound < 4) {
            // radius = map(deltaSound, 0, 4, 50, 0);
            noiseMax += map(deltaSound, 0, 4, 10, 0);
            noiseHeight += map(deltaSound, 0, 4, 30, 0);
        }
    } 

    for (let i = 0; i < radius; i += 10) {
        beginShape();
        for (let a = 0; a < TWO_PI; a += 0.01) {
            
            let xoff = map(cos(a), -1, 1, 0, noiseMax);
            let yoff = map(sin(a), -1, 1, 0, noiseMax);
            let r = map(noise(xoff, yoff), 0, 1, 50, 50 + noiseHeight) + i;
            let x = r * cos(a);
            let y = r * sin(a);
            vertex(x, y);
        }
        endShape(CLOSE);
    }

    
}