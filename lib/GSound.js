function GVolume() {
    GVolume.prototype.instance = this;
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

    // Append el after document.body is ready
    setTimeout(() => {
        const appendEl = () => document.body.appendChild(el);

        try {
            appendEl();
        } catch (_) {
            setTimeout(() => appendEl(), 30);
        }
    })

    const storage = new GStorage("volume");

    this.muted = true;
    storage.get('muted', false).then((val) => this.mute(val));

    let volume = 100;
    this.volume = 100;
    storage.get('volume', 100).then((val) => this.setVolume(val));

    this.musicEnabled = false;
    storage.get('musicEnabled', false).then((val) => this.musicEnabled = val);

    this.mute = async (val) => {
        if (val) {
            el.textContent = '🔇';
            this.muted = true;
            this.volume = 0;
        } else {
            el.textContent = '🔊';
            this.muted = false;
            this.volume = volume;
        }
        await storage.set('muted', val);
    }

    this.setVolume = async (val) => {
        volume = val;
        if (!this.muted) {
            this.volume = val;
        }
        await storage.set('volume', val);
    };

    this.setMusicEnabled = async (enabled) => {
        this.musicEnabled = enabled;
        await storage.set('musicEnabled', enabled);
    }

    this.show = (val = true) => {
        if (val) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
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
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        volume = volume === null ? volumeControl.volume : volume;

        if (volume > 0.1) {
            gainNode.gain.value = volume / 100;
            oscillator.frequency.value = frequency;
            oscillator.type = 'triangle';
            oscillator.start();
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                if (volume > 0.1) {
                    oscillator.stop();
                }
                resolve();
            }, duration);
        });
    };

    this.setVolume = (val) => {
        volume = val;
    }
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

function GTonesSequence(seq, isMusic = false) {
    let tonesGroups = [];
    let stopped = false;
    // disable volume if this is music and the music is not enabled
    let volume = isMusic && !GVolume.prototype.create().musicEnabled ? 0 : null;

    seq.forEach((x) => tonesGroups.push(x[0].map((t) => new GTone(t, x[1]))));

    this.play = async (repeatCount=0) => {
        stopped = false;
        do {
            for (let group of tonesGroups) {
                await Promise.all(group.map(t => {
                    t.setVolume(volume);
                    return t.play();
                }));
                if (stopped) {
                    break;
                }
            }
            repeatCount -= 1;
        } while (!stopped && repeatCount !== -1);
    };

    this.setVolume = (val) => volume = val;

    this.stop = () => stopped = true;
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

function GSongLib() {
    const storage = new GStorage('songs');
    let storageLoaded = false;
    this.cache = {};

    this.downloadOnlineSongs = async () => {
        let response = await fetch(`https://api.qrpr.eu/music/library`);
        Object.assign(this.cache, await response.json());
        return storage.set('cache', this.cache);
    }

    this.fetchLocalSaved = async () => {
        try {
            let response = await fetch(`data/music.json`);
            Object.assign(this.cache, await response.json());
        } catch (_) {
            return false;
        }
        return storage.set('cache', this.cache);
    }

    this.get = async (name) => {
        if (!storageLoaded) {
            Object.assign(this.cache, await storage.get('cache', {}))
            storageLoaded = true;
        }

        if (!(name in this.cache)) {
            await this.fetchLocalSaved() || await this.downloadOnlineSongs();
        }
        if (!name in this.cache) {
            return null;
        }

        const isSong = name.toLowerCase().startsWith('song');
        return new GTonesSequence(this.cache[name], isSong);
    }

    this.play = async (name, repeatCount=0, volume=null) => {
        const seq = await this.get(name);
        if (seq) {
            if (volume !== null) {
                seq.setVolume(volume);
            }
            await seq.play(repeatCount);
            return true;
        }

        return null;
    }
}

new GTone(''); // initialize tones
