// Initialize Modules
const audioMgr = new AudioManager();
const sceneEngine = new SceneEngine('container');

// --- Event Listeners ---

// 1. File Upload
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    audioMgr.loadAudio(file);

    // Update UI
    const startScreen = document.getElementById('start-screen');
    startScreen.style.opacity = 0;
    setTimeout(() => startScreen.style.display = 'none', 500);
    document.getElementById('controls').classList.add('show-controls');
});

// 2. Toggle Button
document.getElementById('btn-toggle').addEventListener('click', () => {
    sceneEngine.toggleAscii();
});

// --- Main Animation Loop ---

function animate() {
    requestAnimationFrame(animate);

    // Update Audio Data
    audioMgr.update();

    // Get Data for Visualization
    const freqData = audioMgr.getFrequencyData();
    const bass = audioMgr.getBassAverage();
    const isPlaying = audioMgr.isPlaying;

    // Render Scene with Data
    sceneEngine.render(freqData, bass, isPlaying);
}

// Start Loop
animate();