const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;

document.querySelector(".model").appendChild(renderer.domElement);

// Ajout d'une carte HDR pour améliorer les réflexions
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new THREE.RGBELoader()
    .setPath("https://threejs.org/examples/textures/equirectangular/")
    .load("royal_esplanade_1k.hdr", function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = envMap;
        scene.background = null;
        texture.dispose();
        pmremGenerator.dispose();
    });

const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
mainLight.castShadow = true;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 1.5);
scene.add(hemiLight);

function basicAnimate() {
    renderer.render(scene, camera);
    requestAnimationFrame(basicAnimate);
}
basicAnimate();

let model;
const loader = new THREE.GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();

dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(dracoLoader);
loader.load("./assets/models/ring.glb", function (gltf) {
    model = gltf.scene;
    model.traverse((node) => {
        if (node.isMesh) {
            if (node.material) {
                if (node.name.toLowerCase().includes("metal")) {
                    // Matériau pour les parties en métal
                    node.material = new THREE.MeshStandardMaterial({
                        metalness: 0.5,
                        roughness: 0.2,
                        envMapIntensity: 2.5,
                    });
                } else if (node.name.toLowerCase().includes("diamond")) {
                    node.material = new THREE.MeshPhysicalMaterial({
                        color: 0xffffff,
                        metalness: 0,
                        roughness: 0,
                        transmission: 1,
                        transparent: true,
                        ior: 2.417,
                        thickness: 0.5,
                        clearcoat: 1,
                        clearcoatRoughness: 0,
                        reflectivity: 1,
                        envMapIntensity: 2,
                    });
                }
            }

            node.castShadow = true;
            node.receiveShadow = true;
        }
    });


    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    scene.add(model);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 1.75;

    model.rotation.set(0, 0.2, 0);
    playInitialAnimation();

    cancelAnimationFrame(basicAnimate);
    animate();
});

const floatAmplitude = 0.2;
const floatSpeed = 1.5;
const rotationSpeed = 0.3;
let isFloating = true;
let currentScroll = 0;

const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;

function playInitialAnimation() {
    if (model) {
        gsap.to(model.scale, {
            x: 2,
            y: 2,
            z: 2,
            duration: 1,
            ease: "power2.out",
        });
    }
}

lenis.on("scroll", (e) => {
    currentScroll = e.scroll;
});

function animate() {
    if (model) {
        if (isFloating) {
            const floatOffset =
                Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
            model.position.y = floatOffset;
        }

        const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

        const baseTilt = 0.5;
        model.rotation.x = scrollProgress * Math.PI * 4 + baseTilt;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
