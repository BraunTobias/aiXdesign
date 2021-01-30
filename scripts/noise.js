function visualsNoisy(visualsPositions, tempo) {
    translate(videoWidth / 2, videoHeight / 2);
    
    let currentTime = context.currentTime;
    let MAXTRANSPARENCY = 20;
    let STEP = 2;
    let VISUSIZE = 50;
    let sound = -1;

    // Sound 1
    sound = 1;
    let noiseMax1 = 0;
    let noiseHeight1 = 0;
    let color1 = {
        r: 255,
        g: 0,
        b: 0,
        a: 0
    };
    let position1 = createVector(0, 0);
    let movement1 = createVector(0, 0);
    if (visualsPositions[sound].length) {
        for (soundElement in visualsPositions[sound]) {
            let time = visualsPositions[sound][soundElement][0];
            if (currentTime >= time && currentTime - 2 <= time) {
                let deltaSound = currentTime - time; // Zeit die seit dem letzten Sound vergangen ist
                noiseMax1 = map(deltaSound, 0, 4, 0.65, 0, true);
                noiseHeight1 = map(deltaSound, 0, 4, 100, 0, true);
                color1.g = map(visualsPositions[sound][soundElement][1], 0, 2750, 150, 0, true);
                color1.b = map(visualsPositions[sound][soundElement][1], 2750, 5000, 0, 200, true);
                color1.a = map(deltaSound, 0, 2, MAXTRANSPARENCY, 0, true);
                position1.x = map(visualsPositions[sound][soundElement][3], 1, 0, -75, 0, true); // Gain on X { x: 0 <= x <= 1 }
                position1.y = map(visualsPositions[sound][soundElement][1], 500, 5000, 50, -50, true); // Frequency on Y { x: 500 <= x <= 5000 }
                for (let i = VISUSIZE; i > 0; i -= STEP) {
                    if (soundElement > 0) movement1.set( 
                        map(visualsPositions[sound][soundElement - 1][3] - visualsPositions[sound][soundElement][3], .01, -.01, -.05, .05) * i, 
                        map(visualsPositions[sound][soundElement - 1][1] - visualsPositions[sound][soundElement][1], 100, -100, .1, -.1) * i);
                    noStroke();
                    fill(color1.r,color1.g,color1.b,color1.a - (i/2));
                    beginShape();
                    for (let a = 0; a < TWO_PI; a += 0.01) {
                        let xoff = map(cos(a), -1, 1, 0, noiseMax1, true);
                        let yoff = map(sin(a), -1, 1, 0, noiseMax1, true) - 10;
                        let r = map(noise(xoff, yoff), 0, 1, 150, 150 + noiseHeight1, true) - (i*4);
                        let x = r > 0 ? r * cos(a) + position1.x + movement1.x : 0;
                        let y = r > 0 ? r * sin(a) + position1.y + movement1.y : 0;
                        vertex(x, y);
                    }
                    endShape(CLOSE);
                }
            }
        }
    }

    // Sound 2
    sound = 2;
    let noiseMax2 = 0;
    let noiseHeight2 = 0;
    let color2 = {
        r: 0,
        g: 0,
        b: 255,
        a: 0
    };
    let position2 = createVector(0, 0);
    let movement2 = createVector(0, 0);
    if (visualsPositions[sound].length) {
        for (soundElement in visualsPositions[sound]) {
            let time = visualsPositions[sound][soundElement][0];
            if (currentTime >= time && currentTime - 0.5 <= time) {
                let deltaSound = currentTime - time; // Zeit die seit dem letzten Sound vergangen ist
                noiseMax2 = map(deltaSound, 0, 1, 0.65, 0, true);
                noiseHeight2 = map(deltaSound, 0, 1, 100, 0, true);
                color2.r = map(visualsPositions[sound][soundElement][1], 2750, 5000, 0, 120, true);
                color2.g = map(visualsPositions[sound][soundElement][1], 0, 2750, 220, 0, true);
                color2.a = map(deltaSound, 0, 2, MAXTRANSPARENCY, 0, true);
                position2.x = map(visualsPositions[sound][soundElement][3], 1, 0, 75, 0, true); // Gain on X { x: 0 <= x <= 1 }
                position2.y = map(visualsPositions[sound][soundElement][1], 500, 5000, 50, -50, true); // Frequency on Y { x: 500 <= x <= 5000 }
                for (let i = VISUSIZE; i > 0; i -= STEP) {
                    if (soundElement > 0) movement2.set( 
                        map(visualsPositions[sound][soundElement - 1][3] - visualsPositions[sound][soundElement][3], .01, -.01, -.05, .05) * i, 
                        map(visualsPositions[sound][soundElement - 1][1] - visualsPositions[sound][soundElement][1], 100, -100, .2, -.2) * i);
                    noStroke();
                    fill(color2.r,color2.g,color2.b,color2.a - (i/2));
                    beginShape();
                    for (let a = 0; a < TWO_PI; a += 0.01) {
                        let xoff = map(cos(a), -1, 1, 0, noiseMax2, true);
                        let yoff = map(sin(a), -1, 1, 0, noiseMax2, true) + 10;
                        let r = map(noise(xoff, yoff), 0, 1, 150, 150 + noiseHeight2, true) - (i*4);
                        let x = r > 0 ? r * cos(a) + position2.x + movement2.x : 0;
                        let y = r > 0 ? r * sin(a) + position2.y + movement2.y : 0;
                        vertex(x, y);
                    }
                    endShape(CLOSE);
                }
            }
        }
    }

    // Spherical
    sound = 2;
    let noiseMaxSpheric = 0;
    let noiseHeightSpheric = 0;
    let colorSpheric = {
        r: 0,
        g: 255,
        b: 0,
        a: 0
    };
    let positionSpheric = createVector(0, 0)
    let movementSpheric = createVector(0, 0)
    let lastSphereFilter = {
        gain : { value: 0.25 },
        frequency : { value: 2250 },
        Q : { value: 25 }
    };
    if (sphereIsPlaying) {
        noiseMaxSpheric = map(sphereFilter.gain.value, 0, .5, 0, 0.65, true);
        noiseHeightSpheric = map(sphereFilter.gain.value, 0, .5, 0, 100, true);
        colorSpheric.r = map(sphereFilter.frequency.value, 2750, 5000, 0, 200, true);
        colorSpheric.b = map(sphereFilter.frequency.value, 0, 2750, 190, 0, true);
        colorSpheric.a = map(sphereFilter.gain.value, 0, .5, 0, MAXTRANSPARENCY, true);
        positionSpheric.x = map(sphereFilter.frequency.value, 500, 5000, -50, 50, true); // Frequency on X { x: 500 <= x <= 5000 }
        positionSpheric.y = map(sphereFilter.gain.value, 0, .5, 0, -75, true); // gain on Y { x: 0 <= x <= 0.5 }
        for (let i = VISUSIZE; i > 0; i -= STEP) {
            movementSpheric.set( 
                map(lastSphereFilter.frequency.value - sphereFilter.frequency.value, 100, -100, -.1, .1) * i, 
                map(lastSphereFilter.gain.value - sphereFilter.gain.value, .01, -.01, .1, -.1) * i);
            noStroke();
            fill(colorSpheric.r,colorSpheric.g,colorSpheric.b,colorSpheric.a - (i/2));
            beginShape();
            for (let a = 0; a < TWO_PI; a += 0.01) {
                let xoff = map(cos(a), -1, 1, 0, noiseMaxSpheric, true) + 10;
                let yoff = map(sin(a), -1, 1, 0, noiseMaxSpheric, true);
                let r = map(noise(xoff, yoff), 0, 1, 150, 150 + noiseHeightSpheric, true) - (i*4);
                let x = r > 0 ? r * cos(a) + positionSpheric.x + movementSpheric.x : 0;
                let y = r > 0 ? r * sin(a) + positionSpheric.y + movementSpheric.y : 0;
                vertex(x, y);
            }
            endShape(CLOSE);
        }
    }
    lastSphereFilter = {
        gain : { value: sphereFilter.gain.value },
        frequency : { value: sphereFilter.frequency.value },
        Q : { value: sphereFilter.Q.value }
    };

    // Beat
    sound = 0;
    let noiseMaxBeat = 0;
    let noiseHeightBeat = 0;
    let transparencyBeat = 0;
    if (visualsPositions[sound].length) {
        let lastSound = visualsPositions[sound][visualsPositions[sound].length -1][0]; // Spielzeit vom letzten Sound
        let deltaSound = context.currentTime - lastSound; // Zeit die seit dem letzten Sound vergangen ist
        if (deltaSound < 2) {
            //radiusBeat = map(deltaSound, 0, 2, 50, 0, true);
            noiseMaxBeat = map(deltaSound, 0, 4, 0.65, 0, true);
            noiseHeightBeat = map(deltaSound, 0, 4, 100, 0, true);
            transparencyBeat = map(deltaSound, 0, 2, MAXTRANSPARENCY, 0, true);
        }
        for (let i = VISUSIZE; i > 0; i -= STEP) {
            noStroke();
            fill(255, 255, 255, transparencyBeat - (i/2));
            beginShape();
            for (let a = 0; a < TWO_PI; a += 0.01) {
                
                let xoff = map(cos(a), -1, 1, 0, noiseMaxBeat, true);
                let yoff = map(sin(a), -1, 1, 0, noiseMaxBeat, true);
                let r = map(noise(xoff, yoff), 0, 1, 120, 120 + noiseHeightBeat, true) - (i*4);
                let x = r > 0 ? r * cos(a) : 0;
                let y = r > 0 ? r * sin(a) : 0;
                vertex(x, y);
            }
            endShape(CLOSE);
        }
    }
}