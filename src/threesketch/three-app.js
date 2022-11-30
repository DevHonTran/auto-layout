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
    Vector2,
    TextureLoader
} from 'three'


// import {Sky} from 'three/examples/jsm/objects/Sky.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';

import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';

import vertex from './post-processing/vertex.glsl';
// import quadtree from './post-processing/quadtree.glsl';
import simpleGalaxy from './post-processing/simple-galaxy.glsl';
import {
    generateRandomSphere, generateMultiRandomSphere,
} from './gen-locations'

import Stats from 'three/examples/jsm/libs/stats.module'

import {
    generateGalaxyMetaverse, generateMultiGalaxyMetaverse,
} from './gen-galaxy-locations'
import {sineIn} from '@/libs/easing'

const W = 2
const DELTA_T = (2 * Math.PI) / (10 * 5000)
const DELTA_POS = 0.3

function rand(l, r) {
    return Math.random() * (r - l) + l
}

// gen a function with 2*PI period
function genPeriodicFuncs() {
    let x = Math.random() * 2 * Math.PI
    let w = rand(0.2, 1)
    let a = Math.cos(x) * w
    let b = Math.sin(x) * w
    let u = rand(0.8, 1.2)
    let v = rand(0.8, 1.2)
    return (t) => {
        return a * Math.cos(t) + b * Math.sin(t)
    }
}

class MovingObject {
    constructor(mesh, fx, fy, fz, ox, oy, oz, ot, w) {
        this.fx = fx
        this.fy = fy
        this.fz = fz
        this.ox = ox
        this.oy = oy
        this.oz = oz
        this.ot = ot
        this.mesh = mesh
        this.w = w || 1
    }

    getPos(t) {
        return {
            x: (this.fx(t + this.ot) + this.ox) * this.w,
            y: (this.fy(t + this.ot) + this.oy) * this.w,
            z: (this.fz(t + this.ot) + this.oz) * this.w,
        }
    }
}

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
        this.scene.background = new Color(0x000000)
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
        this.postProcessing();
        this.initLight()
        this.bindEvents()
    }

    postProcessing() {
        // postprocessing

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));


        this.effect1 = new ShaderPass({
            uniforms: {
                tDiffuse: {value: null},
                iChannel: {value: null},
                iTime: {value: 0},
                iResolution: {value: new Vector2(window.innerWidth, window.innerHeight)}
            }, vertexShader: vertex, // fragmentShader: quadtree
            fragmentShader: simpleGalaxy
        });
        // effect1.uniforms[ 'scale' ].value = 4;
        this.composer.addPass(this.effect1);

        const texture = new TextureLoader().load('assets/channel/iChannel.png');
        this.effect1.uniforms['iChannel'].value = texture;

        // const effect2 = new ShaderPass( RGBShiftShader );
        // effect2.uniforms[ 'amount' ].value = 0.0015;
        // composer.addPass( effect2 );

        //
    }

    initSkybox() {
        // textureCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
        // textureCube.encoding = THREE.sRGBEncoding;
        //
        // const textureLoader = new THREE.TextureLoader();
        //
        // textureEquirec = textureLoader.load( 'textures/2294472375_24a3b8ef46_o.jpg' );
        // textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
        // textureEquirec.encoding = THREE.sRGBEncoding;
        //
        // scene.background = textureCube;
    }

    init() {
        const geo = new SphereGeometry(0.1, 32, 16)
        const mat = new MeshStandardMaterial({color: 0xffffff})

        // let locations = generateRandomSphere(1000, 4, 0.1) // random thanh 1 hinh cau
        // let locations = generateMultiRandomSphere(1000, 20, 40) // random thanh nhieu hinh cau
        // let locations = generateMultiGalaxyMetaverse(1000, 20, 50, 0.8) // random thanh nhieu hinh dia
        // let locations = generateGalaxyMetaverse(1000, 10, 1) // random thanh mot cai dia

        const calcOffset = (fx) => {
            const samples = 1000
            let sum = 0
            for (let i = 0; i < 2 * Math.PI; i += (2 * Math.PI) / samples) {
                sum += fx(i)
            }
            return -sum / samples
        }

        this.movingObject = []
        const lines = 16
        for (let i = 0; i < lines; i++) {
            let fx = genPeriodicFuncs()
            let fy = genPeriodicFuncs()
            let fz = genPeriodicFuncs()
            let ox = calcOffset(fx)
            let oy = calcOffset(fy)
            let oz = calcOffset(fz)

            for (let j = 0; j < 1024 / lines; j++) {
                const ot = (j * 2 * Math.PI) / (1024 / lines)
                const mesh = new Mesh(geo, mat)

                mesh.position.x = fx(ot) + ox
                mesh.position.y = fy(ot) + oy
                mesh.position.z = fz(ot) + oz

                mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1

                const mObj = new MovingObject(mesh, fx, fy, fz, ox, oy, oz, ot)

                this.movingObject.push(mObj)

                this.scene.add(mObj.mesh)
            }
        }
        this.startTime = Date.now()

        // for (let i = 0; i < 1000; i++) {
        //   let rotated = locations[i]
        //   const mesh = new Mesh(geo, mat)

        //   mesh.position.x = rotated[0]
        //   mesh.position.y = rotated[1]
        //   mesh.position.z = rotated[2]

        //   mesh.scale.x = mesh.scale.y = mesh.scale.z = 2

        //   this.scene.add(mesh)
        // }
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
        this.composer.setSize(width, height);
    }

    pageEnter() {
        //gsap.ticker.remove(this.render)
    }

    pageLoaded() {
        gsap.ticker.add(this.render)
    }

    render() {
        const curTime = Date.now()
        // this.camera.position.x += ( this.mouse.x - this.camera.position.x ) * .05;
        // this.camera.position.y += ( - this.mouse.y - this.camera.position.y ) * .05;

        for (let i = 0; i < this.movingObject.length; i++) {
            const {x, y, z} = this.movingObject[i].getPos((curTime - this.startTime) * DELTA_T,)
            this.movingObject[i].mesh.position.x = x
            this.movingObject[i].mesh.position.y = y
            this.movingObject[i].mesh.position.z = z
        }

        // const { x, y, z } = this.movingObject[0].getPos(
        //   (curTime - this.startTime) * DELTA_T,
        // )
        // this.camera.position.x = x
        // this.camera.position.y = y
        // this.camera.position.z = z + 0.05
        // this.camera.position.x = 0.1
        // this.camera.position.y = -0.1
        // this.camera.position.z = 0

        // const delta = this.clock.getDelta();

        this.controls.update();

        this.stats.update();
        this.renderer.render(this.scene, this.camera)

        this.effect1.uniforms['iTime'].value += .1;

        this.composer.render();
    }

    mouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }


    bindEvents() {

        window.addEventListener('resize', this.onWindowResize.bind(this))
        _EMIT_EVENT_.on(PAGE_ENTER, this.pageEnter.bind(this))
        _EMIT_EVENT_.on(PAGE_LOADED, this.pageLoaded.bind(this))
        _EMIT_EVENT_.on(PAGE_BEFORE_LEAVE, () => this.isHasWork = false)
    }

    clear() {
        // this.mapControl_ && this.mapControl_.clear()
    }
}
