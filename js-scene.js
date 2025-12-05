class SceneEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.useAscii = true;
        
        // Config
        this.sphereRadius = 15;
        this.sphereDetail = 5;
        
        this.init();
    }

    init() {
        // Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0, 0, 0);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // ASCII Effect
        this.effect = new THREE.AsciiEffect(this.renderer, ' .`^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$', { 
            invert: true, resolution: 0.15
        });
        this.effect.setSize(window.innerWidth, window.innerHeight);
        this.effect.domElement.style.color = '#00ff00';
        this.effect.domElement.style.backgroundColor = 'black';

        this.container.appendChild(this.effect.domElement);

        this.createObjects();
        this.createLights();

        window.addEventListener('resize', () => this.onResize(), false);
    }

    createObjects() {
        const geometry = new THREE.IcosahedronGeometry(this.sphereRadius, this.sphereDetail);
        
        // Save original positions for morphing
        this.originalPositions = [];
        const pos = geometry.attributes.position;
        for(let i=0; i<pos.count; i++){
            this.originalPositions.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
        }

        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff, flatShading: true, shininess: 100
        });

        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);

        // Cage
        const cageGeo = new THREE.IcosahedronGeometry(this.sphereRadius * 1.3, 1);
        const cageMat = new THREE.MeshBasicMaterial({ color: 0x004400, wireframe: true, transparent: true, opacity: 0.2 });
        this.cage = new THREE.Mesh(cageGeo, cageMat);
        this.sphere.add(this.cage);
    }

    createLights() {
        this.scene.add(new THREE.AmbientLight(0x222222));
        this.lights = [
            new THREE.PointLight(0x00ffff, 1, 100),
            new THREE.PointLight(0xff00ff, 1, 100)
        ];
        this.lights[0].position.set(20, 20, 20);
        this.lights[1].position.set(-20, -20, 20);
        this.scene.add(this.lights[0]);
        this.scene.add(this.lights[1]);
    }

    render(audioData, bassAvg, isPlaying) {
        const time = Date.now() * 0.001;

        // Animate Lights
        this.lights[0].position.x = Math.sin(time) * 30;
        this.lights[0].position.z = Math.cos(time) * 30;
        this.lights[1].position.x = Math.sin(time + 2) * 30;
        this.lights[1].position.y = Math.cos(time + 2) * 30;

        // Deform Sphere
        const positions = this.sphere.geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const original = this.originalPositions[i];
            
            // 1. Idle Liquid Flow (Upwards)
            const idleWave = Math.sin(original.y * 0.5 - time * 2) * 2 
                           + Math.cos(original.z * 0.5 - time * 1.5) * 2;
            const liquidOffset = 1 + (idleWave * 0.05);

            // 2. Audio Reaction
            let audioOffset = 0;
            if(isPlaying && audioData) {
                const freqIndex = i % audioData.length;
                audioOffset = (audioData[freqIndex] / 255) * 0.6;
            }

            const totalOffset = liquidOffset + audioOffset;
            positions.setXYZ(i, original.x * totalOffset, original.y * totalOffset, original.z * totalOffset);
        }
        positions.needsUpdate = true;

        // Rotation & Pulse
        this.sphere.rotation.y += 0.002;
        this.sphere.rotation.z = Math.sin(time * 0.5) * 0.1;
        const scale = 1 + (bassAvg / 255) * 0.1;
        this.sphere.scale.setScalar(scale);

        // Render
        if (this.useAscii) {
            this.effect.render(this.scene, this.camera);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    toggleAscii() {
        this.useAscii = !this.useAscii;
        this.container.innerHTML = '';
        if(this.useAscii) {
            this.container.appendChild(this.effect.domElement);
            document.body.style.backgroundColor = 'black';
        } else {
            this.container.appendChild(this.renderer.domElement);
            document.body.style.backgroundColor = '#111';
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.effect.setSize(window.innerWidth, window.innerHeight);
    }
}