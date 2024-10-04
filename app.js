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

// Planet Data with textures and descriptions
const planetData = [
    {
        name: 'Mercury',
        texture: '',
        radius: 1.5,
        distance: 10,
        speed: 0.002, // slower speed
        description: 'Mercury is the smallest planet in our solar system and the closest to the Sun.'
    },
    {
        name: 'Venus',
        texture: '',
        radius: 3.5,
        distance: 15,
        speed: 0.0015, // slower speed
        description: 'Venus is the second planet from the Sun and is similar in structure to Earth.'
    },
    {
        name: 'Earth',
        texture: '',
        radius: 4,
        distance: 20,
        speed: 0.001, // slower speed
        satellites: [
            {
                name: 'Moon',
                texture: '',
                radius: 1,
                distance: 5
            }
        ],
        spaceObjects: [
            {
                name: 'Hubble Space Telescope',
                texture: '',
                distance: 6
            }
        ],
        description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.'
    },
    {
        name: 'Mars',
        texture: '',
        radius: 3,
        distance: 25,
        speed: 0.0008, // slower speed
        satellites: [
            {
                name: 'Phobos',
                texture: '',
                radius: 0.5,
                distance: 2
            },
            {
                name: 'Deimos',
                texture: '',
                radius: 0.5,
                distance: 3
            }
        ],
        description: 'Mars is the fourth planet from the Sun and is known for its red color.'
    },
    {
        name: 'Jupiter',
        texture: '',
        radius: 10,
        distance: 40,
        speed: 0.0005, // slower speed
        description: 'Jupiter is the largest planet in our solar system, known for its Great Red Spot.'
    },
    {
        name: 'Saturn',
        texture: '',
        radius: 9,
        distance: 50,
        speed: 0.0003, // slower speed
        description: 'Saturn is famous for its stunning rings and is the second largest planet in the solar system.'
    },
    {
        name: 'Uranus',
        texture: '',
        radius: 7,
        distance: 60,
        speed: 0.0001, // slower speed
        description: 'Uranus is the third largest planet in our solar system and has a unique blue color.'
    },
    {
        name: 'Neptune',
        texture: '',
        radius: 7,
        distance: 70,
        speed: 0.00005, // slower speed
        description: 'Neptune is known for its deep blue color and is the farthest planet from the Sun.'
    }
];

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Background stars
    const starGeometry = new THREE.SphereGeometry(100, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.BackSide });
    const stars = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(stars);

    // Sun with texture
    const sunTexture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/4/42/Sun_large.jpg'); // Sun texture
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
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
        planet.userData = { name: data.name, speed: data.speed, distance: data.distance, satellites: data.satellites || [], spaceObjects: data.spaceObjects || [], description: data.description };

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
        const infoContainer = document.getElementById('infoContainer');
        infoContainer.innerHTML = `
            <div style="backdrop-filter: blur(5px); padding: 10px; color: white;">
                <h2>${planetData.name}</h2>
                <p>${planetData.description}</p>
            </div>
        `;

        // If Earth is clicked, display satellites and nearby objects
        if (planetData.name === 'Earth') {
            planetData.spaceObjects.forEach(obj => {
                alert(`Nearby object: ${obj.name}`);
            });
        }
    }
}
