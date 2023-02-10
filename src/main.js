import './style.css'
import * as THREE from 'three'


class FirstPersonControl {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = false;
    this.xSpeed = 0.5;
    this.ySpeed = 0.5;
    this.yMinLimit = -90;
    this.yMaxLimit = 90;
    this.x = 0;
    this.y = 0;
    this.velocity = new THREE.Vector3();
    this.vector = new THREE.Vector3();

    this.domElement.addEventListener('click', this.requestPointerLock.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // W
        this.velocity.z = -1;
        break;
      case 83: // S
        this.velocity.z = 1;
        break;
      case 65: // A
        this.velocity.x = -1;
        break;
      case 68: // D
        this.velocity.x = 1;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case 87: // W
      case 83: // S
        this.velocity.z = 0;
        break;
      case 65: // A
      case 68: // D
        this.velocity.x = 0;
        break;
    }
  }

  requestPointerLock() {
    this.domElement.requestPointerLock();
    this.domElement.requestFullscreen()
  }

  onPointerLockChange() {
    if (document.pointerLockElement === this.domElement) {
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }

  onMouseMove(event) {
    if (!this.enabled) return;
    this.x += event.movementX * this.xSpeed;
    this.y -= event.movementY * this.ySpeed;
    this.y = Math.max(Math.min(this.y, this.yMaxLimit), this.yMinLimit);
  }

  onTouchStart(event) {
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }

  onTouchMove(event) {
    if (!this.enabled) return;
    const screenWidth = window.innerWidth;
    if (event.touches[0].clientX > screenWidth / 2) {
      this.x += (event.touches[0].clientX - this.startX) * this.xSpeed;
      this.y -= (event.touches[0].clientY - this.startY) * this.ySpeed;
      this.y = Math.max(Math.min(this.y, this.yMaxLimit), this.yMinLimit);
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
    }
  }

  moveForward(distance) {

    this.vector.setFromMatrixColumn(this.camera.matrix, 0);
    this.vector.crossVectors(this.camera.up, this.vector);
    this.camera.position.addScaledVector(this.vector, distance);

  };

  moveRight(distance) {
    this.vector.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.vector, distance);
  }

  update(timeElapsedS) {
    this.moveForward(-this.velocity.z / 20)
    this.moveRight(this.velocity.x / 20)
    this.camera.rotation.y = -this.x * (Math.PI / 180);
    this.camera.rotation.x = this.y * (Math.PI / 180);

  }
}


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
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

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
plane.rotation.x = -Math.PI / 2
scene.add(plane)

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.y = 1
camera.rotation.reorder('YXZ')
scene.add(camera)

const controls = new FirstPersonControl(camera, canvas);
/**
* Renderer
*/
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()
let lastElapsedTime = 0
const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  controls.update(elapsedTime)

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()