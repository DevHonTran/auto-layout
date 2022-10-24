import {gsap} from 'gsap'
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

import {generateRandomSphere, generateMultiRandomSphere} from './gen-locations'
// import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
// import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
// import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass'
import {FlyControls} from 'three/examples/jsm/controls/FlyControls'
import Stats from 'three/examples/jsm/libs/stats.module'

import {generateGalaxyMetaverse, generateMultiGalaxyMetaverse} from './gen-galaxy-locations'


const DELTA_POS = 0.3;
const DELTA_ROT = 0.1;

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
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.domElement.classList.add('three-app')

        document.body.appendChild(this.renderer.domElement)


        this.scene = new Scene()
        this.scene.background = new Color(0xececec)
        // this.scene.fog = new Fog(0xffffff, 3000, 4000);


        // this.scene.add(this.cubeCamera);

        this.mouse = {x: 0, y: 0}
        const {width, height, devicePixelRatio} = _SERVICES_.winSize
        const aspect = width / height

        // this.camera = new PerspectiveCamera(60, aspect, .01, 1000);

        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100);
        this.camera.position.z = 10;
        // this.camera.focalLength = 10;

        this.camera.aspect = width / height


        // const renderPass = new RenderPass(this.scene, this.camera)
        // this.bokehPass = new BokehPass(this.scene, this.camera, {
        //     focus: 1.0, aperture: 0.0001, maxblur: 1.0, width: window.innerWidth, height: window.innerHeight
        // })
        // this.composer = new EffectComposer(this.renderer)
        // this.composer.addPass(renderPass)
        // this.composer.addPass(this.bokehPass)
        //
        // const cubeRenderTarget = new WebGLCubeRenderTarget(2048)
        // this.cubeCamera = new CubeCamera(0.1, 100, cubeRenderTarget)

        this.clock = new Clock()
        this.props = {scrollTop: 0}
        this.scroll = {last: 0, current: 0}

        // this.envFbo = new WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)
        // this.backfaceFbo = new WebGLRenderTarget(width * devicePixelRatio, height * devicePixelRatio)
        //
        // this.orthoCamera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000)
        // this.orthoCamera.layers.set(1)
        //
        // this.camera.position.z = 250
        // this.orthoCamera.position.z = 250

        // this.panel = new GUI({width: 310});

        this.flyControl = new FlyControls(this.camera, this.renderer.domElement);

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        this.flyControl.movementSpeed = 50;
        // this.flyControl.domElement = this.renderer.domElement;
        this.flyControl.rollSpeed = Math.PI / 24;
        this.flyControl.autoForward = false;
        this.flyControl.dragToLook = false;

        this.render = this.render.bind(this)
        this.init()
        this.initLight()
        this.bindEvents()
    }

    init() {

        const geo = new SphereGeometry(0.1, 32, 16);
        const mat = new MeshStandardMaterial({color: 0x00ABB3});

        // let locations = generateRandomSphere(1000, 4, 0.1)
        let locations = generateMultiRandomSphere(1000, 20, 40)
        // let locations = generateMultiGalaxyMetaverse(1000, 20, 50, 0.8)
        // let locations = generateGalaxyMetaverse(1000, 10, 1)


        for (let i = 0; i < 1000; i++) {

            let rotated = locations[i]
            const mesh = new Mesh(geo, mat);

            mesh.position.x = rotated[0];
            mesh.position.y = rotated[1];
            mesh.position.z = rotated[2];

            mesh.scale.x = mesh.scale.y = mesh.scale.z = 2;

            this.scene.add(mesh);
        }

    }

    initLight() {

        const dirLight1 = new DirectionalLight(0xffffff, .5)
        dirLight1.position.set(0, 1, 1)
        dirLight1.scale.multiplyScalar(20)
        this.scene.add(dirLight1)

        const hemiLight = new HemisphereLight(0xffffff, 0xffffff, .5)
        hemiLight.color.setHSL(0.6, 1, 0.6)
        hemiLight.groundColor.setHSL(0.095, 1, 0.75)
        hemiLight.position.set(0, 0, 0)
        hemiLight.scale.multiplyScalar(150)
        this.scene.add(hemiLight)

        const ambientLight = new AmbientLight(0x000000, 1)
        this.scene.add(ambientLight)

        const light = new PointLight(0xffffff, .2)
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

        // this.camera.position.x += ( this.mouse.x - this.camera.position.x ) * .05;
        // this.camera.position.y += ( - this.mouse.y - this.camera.position.y ) * .05;

        const delta = this.clock.getDelta();
        this.flyControl.update(delta);

        this.stats.update();
        this.renderer.render(this.scene, this.camera)

        // this.flyControl.movementSpeed = 0.33 * d;
        // console.log('___delta', delta);


    }

    moveXInc() {
        this.camera.position.x += DELTA_POS;
    }

    moveXDec(event) {
        console.log(event);
        this.camera.position.x -= DELTA_POS;
    }

    moveYInc() {
        this.camera.position.y += DELTA_POS;
    }

    moveYDec() {
        this.camera.position.y -= DELTA_POS;
    }

    moveZInc() {
        this.camera.position.z += DELTA_POS;
    }

    moveZDec() {
        this.camera.position.z -= DELTA_POS;
    }

    rotXInc() {
        this.camera.rotation.x += DELTA_POS;
    }

    rotXDec() {
        this.camera.rotation.x -= DELTA_POS;
    }

    rotYInc() {
        this.camera.rotation.y += DELTA_POS;
    }

    rotYDec() {
        this.camera.rotation.y -= DELTA_POS;
    }

    rotZInc() {
        this.camera.rotation.z += DELTA_POS;
    }

    rotZDec() {
        this.camera.rotation.z -= DELTA_POS;
    }

    mouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    handleKeyPress(event) {
        console.log(event)
        if (event.shiftKey) {
            switch (event.code) {
                case 'KeyA':
                    this.rotYInc()
                    break;
                case 'KeyD':
                    this.rotYDec()
                    break;
                case 'KeyW':
                    this.rotXInc()
                    break;
                case 'KeyS':
                    this.rotXDec()
                    break;
                case 'KeyQ':
                    this.rotZDec()
                    break;
                case 'KeyE':
                    this.rotZInc()
                    break;
            }
        } else {
            switch (event.code) {
                case 'KeyA':
                    this.moveXDec()
                    break;
                case 'KeyD':
                    this.moveXInc()
                    break;
                case 'KeyW':
                    this.moveYInc()
                    break;
                case 'KeyS':
                    this.moveYDec()
                    break;
                case 'KeyQ':
                    this.moveZDec()
                    break;
                case 'KeyE':
                    this.moveZInc()
                    break;
            }
        }


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
