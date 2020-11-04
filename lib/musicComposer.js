function GVolume() {
    this.instance = this;
    const elId = 'g-volume-control';
    const el = document.getElementById(elId) || document.createElement('div');
    el.id = elId;
    el.className = 'btn';
    el.style.position = 'absolute';
    el.style.right = '2px';
    el.style.top = '2px';
    el.style.fontSize = '30px';
    el.style.opacity = '0.2';
    el.onclick = () => this.mute(!this.muted);
    document.body.appendChild(el);

    const storage = new GStorage("volume");

    this.muted = true;
    storage.get('muted', false).then((val) => this.mute(val));

    let volume = 100;
    this.volume = 100;
    storage.get('volume', 100).then((val) => this.setVolume(val));

    this.mute = (val) => {
        if (val) {
            el.textContent = '🔇';
            this.muted = true;
            this.volume = 0;
        } else {
            el.textContent = '🔊';
            this.muted = false;
            this.volume = volume;
        }
        storage.set('muted', val);
    }

    this.setVolume = (val) => {
        volume = val;
        if (!this.muted) {
            this.volume = val;
        }
        storage.set('volume', val);
    };

    this.show = (val = true) => {
        if (val) {
            el.style.visibility = 'visible';
        } else {
            el.style.visibility = 'hidden';
        }
    };

    this.mute(false);
    this.show(false);
}

GVolume.prototype.instance = null;
GVolume.prototype.create = () => GVolume.prototype.instance ? GVolume.prototype.instance : new GVolume();


function GTone(tone, duration = 200, volume = null) {
    const frequency = GTone.prototype.tone2freq(tone);
    const volumeControl = GVolume.prototype.create();

    this.play = () => {
        volumeControl.show();
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        volume = volume === null ? volumeControl.volume : volume;

        gainNode.gain.value = volume / 100;
        oscillator.frequency.value = frequency;
        oscillator.type = 'triangle';

        oscillator.start();

        return new Promise((resolve) => {
            setTimeout(() => {
                oscillator.stop();
                resolve();
            }, duration);
        });
    };
}

GTone.prototype.audioCtx = new window.AudioContext();

GTone.prototype.tone2freq = (tone) => {
    if (typeof tone === 'number') {
        return tone;
    }

    tone = tone.toUpperCase();
    if (!(/.*[0-9]+$/.test(tone))) {
        tone += '3';
    }

    return GToneMap[tone] || 0;
}

function GSong(tones, tonesPerSecond = 3, pausePercentage = 0.2) {
    const toneDuration = 1000 / (tonesPerSecond * (1 + pausePercentage));
    const pauseDuration = toneDuration * pausePercentage;
    const pauseTone = new GTone(0, pauseDuration);

    tones = tones.map((tone) => {
        if (tone instanceof GTone) {
            return tone;
        }
        return new GTone(tone, toneDuration);
    });

    this.play = async () => {
        for (let i = 0; i < tones.length; i++) {
            await tones[i].play();
            await pauseTone.play();
        }
    };
}

function GTonesSequence(seq) {
    let tonesGroups = [];
    seq.forEach((x) => tonesGroups.push(x[0].map((t) => new GTone(t, x[1]))));

    this.play = async () => {
        for (let group of tonesGroups) {
            await Promise.all(group.map(t => t.play()));
        }
    };
}

const GToneMap = {
    "C0": 16.35,
    "C#0": 17.32,
    "D0": 18.35,
    "D#0": 19.45,
    "E0": 20.6,
    "F0": 21.83,
    "F#0": 23.12,
    "G0": 24.5,
    "G#0": 25.96,
    "A0": 27.5,
    "A#0": 29.14,
    "B0": 30.87,
    "C1": 32.7,
    "C#1": 34.65,
    "D1": 36.71,
    "D#1": 38.89,
    "E1": 41.2,
    "F1": 43.65,
    "F#1": 46.25,
    "G1": 49,
    "G#1": 51.91,
    "A1": 55,
    "A#1": 58.27,
    "B1": 61.74,
    "C2": 65.41,
    "C#2": 69.3,
    "D2": 73.42,
    "D#2": 77.78,
    "E2": 82.41,
    "F2": 87.31,
    "F#2": 92.5,
    "G2": 98,
    "G#2": 103.83,
    "A2": 110,
    "A#2": 116.54,
    "B2": 123.47,
    "C3": 130.81,
    "C#3": 138.59,
    "D3": 146.83,
    "D#3": 155.56,
    "E3": 164.81,
    "F3": 174.61,
    "F#3": 185,
    "G3": 196,
    "G#3": 207.65,
    "A3": 220,
    "A#3": 233.08,
    "B3": 246.94,
    "C4": 261.63,
    "C#4": 277.18,
    "D4": 293.66,
    "D#4": 311.13,
    "E4": 329.63,
    "F4": 349.23,
    "F#4": 369.99,
    "G4": 392,
    "G#4": 415.3,
    "A4": 440,
    "A#4": 466.16,
    "B4": 493.88,
    "C5": 523.25,
    "C#5": 554.37,
    "D5": 587.33,
    "D#5": 622.25,
    "E5": 659.25,
    "F5": 698.46,
    "F#5": 739.99,
    "G5": 783.99,
    "G#5": 830.61,
    "A5": 880,
    "A#5": 932.33,
    "B5": 987.77,
    "C6": 1046.5,
    "C#6": 1108.73,
    "D6": 1174.66,
    "D#6": 1244.51,
    "E6": 1318.51,
    "F6": 1396.91,
    "F#6": 1479.98,
    "G6": 1567.98,
    "G#6": 1661.22,
    "A6": 1760,
    "A#6": 1864.66,
    "B6": 1975.53,
    "C7": 2093,
    "C#7": 2217.46,
    "D7": 2349.32,
    "D#7": 2489.02,
    "E7": 2637.02,
    "F7": 2793.83,
    "F#7": 2959.96,
    "G7": 3135.96,
    "G#7": 3322.44,
    "A7": 3520,
    "A#7": 3729.31,
    "B7": 3951.07,
    "C8": 4186.01,
    "C#8": 4434.92,
    "D8": 4698.63,
    "D#8": 4978.03,
    "E8": 5274.04,
    "F8": 5587.65,
    "F#8": 5919.91,
    "G8": 6271.93,
    "G#8": 6644.88,
    "A8": 7040,
    "A#8": 7458.62,
    "B8": 7902.13
}

const GSongLib = {
    "success": new GTonesSequence([[["C2"],100],[["E2"],100],[["F2"],100],[["G2"],300],[["A2"],100],[["G2"],500],[[],500]]),
    "successLong": new GTonesSequence([[["D#4"],50],[["E4"],200],[["G4"],200],[["E4"],200],[["C4"],200],[["C#4"],50],[["D4"],200],[["F4"],200],[["D4"],200],[["B3"],200],[["C4"],500],[[],500]]),
    "fail": new GTonesSequence([[["A4"],100],[["F4"],100],[["G4"],100],[["E4"],100],[["F4"],100],[["D4"],100],[["E4"],100],[["C#4"],100],[["D4"],500],[[],500]]),
    "failLong": new GTonesSequence([[["D#4"],50],[["E4"],200],[["G4"],200],[["E4"],200],[["C4"],200],[["C#4"],50],[["D4"],200],[["F4"],200],[["D4"],200],[["B3"],200],[["C4"],500],[[],500]]),
    "powerup": new GTonesSequence([[["C4","E4","G4"],200],[["C#4","F4","G#4"],200],[["D4","F#4","A4"],200],[["D#4","G4","A#4"],200],[["E4","G#4","B4"],200],[["F4","A4","C5"],800],[[],500]]),
    "action": new GTonesSequence([[["C4"],50],[["E4"],50],[["G4"],50],[[],500]]),
    "songA": new GTonesSequence([[["C4"],200],[["D#4"],20],[["E4"],200],[["G4"],200],[["A4"],200],[["G4"],20],[["A4"],20],[["A#4"],200],[["A4"],200],[["G4"],200],[["E4"],200],[["C4"],300],[["0"],100],[["C4"],200],[["A#3"],500],[["0"],500],[["G4"],200],[["A#4"],20],[["B4"],200],[["D5"],200],[["E5"],200],[["D5"],20],[["E5"],20],[["F5"],200],[["E5"],200],[["D5"],200],[["B4"],200],[["F4"],200],[["G#4"],20],[[],500],[["A4"],200],[["C5"],200],[["D5"],200],[["C5"],20],[["D5"],20],[["D#5"],200],[["D5"],200],[["C5"],200],[["A4"],200],[["C4"],200],[["D#4"],20],[["E4"],200],[["G4"],200],[["A4"],200],[["G4"],20],[["A4"],20],[["A#4"],200],[["A4"],200],[["G4"],200],[["E4"],200],[["C4"],200],[["0"],500],[["C4","E4","G4","B4"],1000],[[],500]]),
    "songALooping": new GTonesSequence([[["C4"],200],[["D#4"],20],[["E4"],200],[["G4"],200],[["A4"],200],[["G4"],20],[["A4"],20],[["A#4"],200],[["A4"],200],[["G4"],200],[["E4"],200],[["C4"],300],[["0"],100],[["C4"],200],[["A#3"],500],[["0"],500],[["G4"],200],[["A#4"],20],[["B4"],200],[["D5"],200],[["E5"],200],[["D5"],20],[["E5"],20],[["F5"],200],[["E5"],200],[["D5"],200],[["B4"],200],[["F4"],200],[["G#4"],20],[[],500],[["A4"],200],[["C5"],200],[["D5"],200],[["C5"],20],[["D5"],20],[["D#5"],200],[["D5"],200],[["C5"],200],[["A4"],200],[["C4"],200],[["D#4"],20],[["E4"],200],[["G4"],200],[["A4"],200],[["G4"],20],[["A4"],20],[["A#4"],200],[["A4"],200],[["G4"],200],[["E4"],200],[[],500]])
}
