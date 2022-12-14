import gsap from 'gsap'
import {_SERVICES_} from '@/libs/services'
import {
    _EMIT_EVENT_, PAGE_BEFORE_LEAVE, PAGE_ENTER, PAGE_LOADED,
} from '@/libs/emit-event'
import {
    WebGLRenderer,
    Scene,
    Color,
    PerspectiveCamera,
    Clock,
    ACESFilmicToneMapping,
    AmbientLight,
    PointLight,
    HemisphereLight,
    DirectionalLight,
    CubeCamera,
    WebGLCubeRenderTarget,
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    sRGBEncoding,
    SphereGeometry,
    MeshStandardMaterial,
} from 'three'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {genMovingObjects} from './gen-moving-objects'

import Stats from 'three/examples/jsm/libs/stats.module'

const W = 2
const DELTA_T = (2 * Math.PI) / (10 * 2000)
const NUM_ROCKS = 1000
const DELTA_POS = 0.3


export class ThreeApp {
    constructor() {
        this.renderer = new WebGLRenderer({
            antialias: true, // powerPreference: 'high-performance',
            // stencil: true,
        })

        this.renderer.toneMapping = ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1
        this.renderer.setSize(_SERVICES_.winSize.width, _SERVICES_.winSize.height)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.outputEncoding = sRGBEncoding
        this.renderer.physicallyCorrectLights = true
        this.renderer.domElement.classList.add('three-app')

        document.body.appendChild(this.renderer.domElement)

        this.scene = new Scene()
        this.scene.background = new Color(0xffffff)
        // this.scene.fog = new Fog(0xffffff, 3000, 4000);

        this.mouse = {x: 0, y: 0}
        const {width, height, devicePixelRatio} = _SERVICES_.winSize
        const aspect = width / height

        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000)
        this.camera.position.z = 3
        this.camera.focalLength = 3
        this.camera.aspect = width / height

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.clock = new Clock()
        this.props = {scrollTop: 0}
        this.scroll = {last: 0, current: 0}

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        this.render = this.render.bind(this)
        this.init()
        this.initLight()
        this.bindEvents()
    }

    init() {
        const geo = new SphereGeometry(0.1, 32, 16)
        const mat = new MeshStandardMaterial({color: 0x00abb3})

        this.movingObjects = genMovingObjects(NUM_ROCKS)
        this.meshes = []
        for (let i = 0; i < NUM_ROCKS; i++) {
          const {x, y, z} = this.movingObjects[i].getPos(Date.now() * DELTA_T);
          const mesh = new Mesh(geo, mat);
          this.meshes.push(mesh);
          this.meshes[i].position.x = x;
          this.meshes[i].position.y = y;
          this.meshes[i].position.z = z;
          mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1
          this.scene.add(this.meshes[i])
        }
        this.startTime = Date.now()
    }

    initLight() {
        const dirLight1 = new DirectionalLight(0xffffff, 0.5)
        dirLight1.position.set(0, 1, 1)
        dirLight1.scale.multiplyScalar(20)
        this.scene.add(dirLight1)

        const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.5)
        hemiLight.color.setHSL(0.6, 1, 0.6)
        hemiLight.groundColor.setHSL(0.095, 1, 0.75)
        hemiLight.position.set(0, 0, 0)
        hemiLight.scale.multiplyScalar(150)
        this.scene.add(hemiLight)

        const ambientLight = new AmbientLight(0x000000, 1)
        this.scene.add(ambientLight)

        const light = new PointLight(0xffffff, 0.2)
        this.camera.add(light)
        this.scene.add(this.camera)
    }

    onWindowResize() {
        const {width, height} = _SERVICES_.winSize
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(width, height)
    }

    pageEnter() {
        //gsap.ticker.remove(this.render)
    }

    pageLoaded() {
        gsap.ticker.add(this.render)
    }

    render() {
        const curTime = Date.now()

        for (let i = 0; i < this.movingObjects.length; i++) {
            const {x, y, z} = this.movingObjects[i].getPos((curTime) * DELTA_T,)
            this.meshes[i].position.x = x
            this.meshes[i].position.y = y
            this.meshes[i].position.z = z
        }

        this.controls.update();

        this.stats.update();
        this.renderer.render(this.scene, this.camera)
    }

    mouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    bindEvents() {
        this.mouseMove = this.mouseMove.bind(this)
        // window.addEventListener('keypress', this.handleKeyPress.bind(this))

        window.addEventListener('resize', this.onWindowResize.bind(this))
        // window.addEventListener('mousemove', this.mouseMove.bind(this))
        _EMIT_EVENT_.on(PAGE_ENTER, this.pageEnter.bind(this))
        _EMIT_EVENT_.on(PAGE_LOADED, this.pageLoaded.bind(this))
        _EMIT_EVENT_.on(PAGE_BEFORE_LEAVE, () => this.isHasWork = false)
    }

    clear() {
        // this.mapControl_ && this.mapControl_.clear()
    }
}
