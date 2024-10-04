// Elements
const startButton = document.getElementById('startButton');
const container = document.getElementById('container');

// Event listener to start the experience
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    container.style.display = 'block';
    init();  // Initialize 3D scene
});

let scene, camera, renderer, controls;
let sun, planets = [];

// Planet Data with textures
const planetData = [
    {
        name: 'Mercury',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Mercury_in_True_Color.jpg',
        radius: 1.5,
        distance: 10,
        speed: 0.02
    },
    {
        name: 'Venus',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Venus_surface.jpg',
        radius: 3.5,
        distance: 15,
        speed: 0.015
    },
    {
        name: 'Earth',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Earth_%28planet%29.jpg',
        radius: 4,
        distance: 20,
        speed: 0.01,
        satellites: [
            {
                name: 'Moon',
                texture: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Moon_2024.jpg',
                radius: 1,
                distance: 5
            }
        ],
        spaceObjects: [
            {
                name: 'Hubble Space Telescope',
                texture: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Hubble_Space_Telescope.png',
                distance: 6
            }
        ]
    },
    {
        name: 'Mars',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Mars_viking.jpg',
        radius: 3,
        distance: 25,
        speed: 0.008,
        satellites: [
            {
                name: 'Phobos',
                texture: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Phobos.jpg',
                radius: 0.5,
                distance: 2
            },
            {
                name: 'Deimos',
                texture: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Deimos.jpg',
                radius: 0.5,
                distance: 3
            }
        ]
    },
    {
        name: 'Jupiter',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg',
        radius: 10,
        distance: 40,
        speed: 0.005
    },
    {
        name: 'Saturn',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Saturn.jpg',
        radius: 9,
        distance: 50,
        speed: 0.004
    },
    {
        name: 'Uranus',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Uranus.jpg',
        radius: 7,
        distance: 60,
        speed: 0.003
    },
    {
        name: 'Neptune',
        texture: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Neptune.jpg',
        radius: 7,
        distance: 70,
        speed: 0.002
    }
];

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 0, 0);  // Light source from the Sun
    scene.add(pointLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
    planetData.forEach(data => {
        const textureLoader = new THREE.TextureLoader();
        const planetGeometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({
            map: textureLoader.load(data.texture, () => {
                console.log(`Loaded texture for ${data.name}`);
            }, undefined, (err) => {
                console.error(`Error loading texture for ${data.name}:`, err);
            })
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.set(data.distance, 0, 0);
        planet.userData = { name: data.name, speed: data.speed, distance: data.distance, satellites: data.satellites  [], spaceObjects: data.spaceObjects  [] };

        planets.push(planet);
        scene.add(planet);
    });

    camera.position.z = 100;

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    planets.forEach(planet => {
        const speed = planet.userData.speed;
        const distance = planet.userData.distance;
        planet.position.x = distance * Math.cos(Date.now() * speed);
        planet.position.z = distance * Math.sin(Date.now() * speed);
        planet.rotation.y += 0.01;  // Rotation of the planet
    });

    controls.update();
    renderer.render(scene, camera);
}

// Event listener for clicking on planets
window.addEventListener('click', onPlanetClick);

function onPlanetClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(planets);
    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object;
        const planetData = selectedPlanet.userData;

        // Move camera closer to the planet
        camera.position.set(selectedPlanet.position.x, selectedPlanet.position.y, selectedPlanet.position.z + 10);
        controls.target.set(selectedPlanet.position.x, selectedPlanet.position.y, selectedPlanet.position.z);

        // Display planet information
        alert(`You clicked on ${planetData.name}`);

        // If Earth is clicked, display satellites and nearby objects
        if (planetData.name === 'Earth') {
            planetData.spaceObjects.forEach(obj => {
                alert(`Nearby object: ${obj.name}`);
            });
        }
    }
}
