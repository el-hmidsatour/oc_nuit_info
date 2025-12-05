class AudioManager {
    constructor() {
        this.audioElement = document.getElementById('audio-element');
        this.context = null;
        this.analyser = null;
        this.dataArray = null;
        this.isPlaying = false;
        this.smoothedData = new Uint8Array(256).fill(0);
        this.smoothingFactor = 0.2;
    }

    loadAudio(file) {
        const url = URL.createObjectURL(file);
        this.audioElement.src = url;
        this.audioElement.load();
        
        if (!this.context) {
            this.initContext();
        }

        this.audioElement.play();
        this.isPlaying = true;
    }

    initContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 512;

        const src = this.context.createMediaElementSource(this.audioElement);
        src.connect(this.analyser);
        this.analyser.connect(this.context.destination);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    update() {
        if (this.isPlaying && this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Apply smoothing
            for(let i = 0; i < this.dataArray.length; i++) {
                this.smoothedData[i] = THREE.MathUtils.lerp(
                    this.smoothedData[i], 
                    this.dataArray[i], 
                    this.smoothingFactor
                );
            }
        }
    }

    getFrequencyData() {
        return this.smoothedData;
    }

    getBassAverage() {
        if (!this.isPlaying) return 0;
        const bassRange = this.smoothedData.slice(0, 30);
        const sum = bassRange.reduce((a, b) => a + b, 0);
        return sum / bassRange.length;
    }
}