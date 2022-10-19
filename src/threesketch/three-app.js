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
    WebGLCubeRenderTarget, BoxGeometry, Mesh, MeshBasicMaterial, sRGBEncoding, SphereGeometry, MeshStandardMaterial,
} from 'three'

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass'


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
        this.renderer.domElement.classList.add('three-app')

        document.body.appendChild(this.renderer.domElement)


        this.scene = new Scene()
        this.scene.background = new Color(0xececec)
        // this.scene.fog = new Fog(0xffffff, 3000, 4000);


        this.scene.add(this.cubeCamera);

        this.mouse = {x: 0, y: 0}
        const {width, height, devicePixelRatio} = _SERVICES_.winSize
        const aspect = width / height

        // this.camera = new PerspectiveCamera(60, aspect, .01, 1000);
        this.camera = new PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 100 );
        this.camera.position.z = 3;
        this.camera.focalLength = 3;
        this.camera.aspect = width / height


        const renderPass = new RenderPass(this.scene, this.camera)
        this.bokehPass = new BokehPass(this.scene, this.camera, {
            focus: 1.0, aperture: 0.0001, maxblur: 1.0, width: window.innerWidth, height: window.innerHeight
        })
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(renderPass)
        this.composer.addPass(this.bokehPass)

        const cubeRenderTarget = new WebGLCubeRenderTarget(2048)
        this.cubeCamera = new CubeCamera(0.1, 100, cubeRenderTarget)

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
        this.render = this.render.bind(this)
        this.init()
        this.initLight()
        this.bindEvents()
    }

    init() {

        const geo = new SphereGeometry( 0.1, 32, 16 );
        const mat = new MeshStandardMaterial({color: 0x00ABB3});

        for ( let i = 0; i < 500; i ++ ) {

            const mesh = new Mesh(geo, mat);

            mesh.position.x = Math.random() * 10 - 5;
            mesh.position.y = Math.random() * 10 - 5;
            mesh.position.z = Math.random() * 10 - 5;

            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

            this.scene.add( mesh );


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

        this.camera.position.x += ( this.mouse.x - this.camera.position.x ) * .05;
        this.camera.position.y += ( - this.mouse.y - this.camera.position.y ) * .05;

        this.renderer.render(this.scene, this.camera)
    }

    mouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    bindEvents() {

        this.mouseMove = this.mouseMove.bind(this)

        window.addEventListener('resize', this.onWindowResize.bind(this))
        window.addEventListener('mousemove', this.mouseMove.bind(this))
        _EMIT_EVENT_.on(PAGE_ENTER, this.pageEnter.bind(this))
        _EMIT_EVENT_.on(PAGE_LOADED, this.pageLoaded.bind(this))
        _EMIT_EVENT_.on(PAGE_BEFORE_LEAVE, () => this.isHasWork = false)
    }

    clear() {
        // this.mapControl_ && this.mapControl_.clear()
    }
}
