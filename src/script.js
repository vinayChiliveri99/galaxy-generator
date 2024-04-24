import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const params = {}
params.count = 100000
params.size = 0.01
params.insideColor = '#ff6030',
params.outsideColor = '#1b3984',
params.radius = 5
params.branches = 3
params.spin = 1
params.randomness = 0.2
params.randomnessPower = 3

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
    // mesh = combination of geometry and material
    // user defined object using buffer geometry

    if(points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    // Geometry

    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(params.count * 3)
    const colors = new Float32Array(params.count * 3)

    for(let i = 0; i < params.count; i++) {
        const i3 = i * 3
        const radius = Math.random() * params.radius
    
        const colorInside = new THREE.Color(params.insideColor)
        const colorOutside = new THREE.Color(params.outsideColor)

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / params.radius)
    
        const spinAngle = radius * params.spin
        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2
        
        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * params.randomness * radius
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * params.randomness * radius
        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * params.randomness * radius
    
        positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g 
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Material
    material = new THREE.PointsMaterial({ 
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy();

gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(params, 'size').min(0.001).max(0.2).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy)
gui.add(params, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(params, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(params, 'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy)
gui.add(params, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, 'randomnessPower').min(0).max(10).step(0.001).onFinishChange(generateGalaxy)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()