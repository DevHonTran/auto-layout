import {Scene, WebGLRenderTarget, PerspectiveCamera} from 'three';

export class RtSapcebox{
    constructor(renderer) {


        this.renderer = renderer;
        const rtWidth = 512;
        const rtHeight = 512;
        this.renderTarget = new WebGLRenderTarget(rtWidth, rtHeight);

        const rtFov = 75;
        const rtAspect = rtWidth / rtHeight;
        const rtNear = 0.1;
        const rtFar = 5;
        this.rtCamera = new PerspectiveCamera(rtFov, rtAspect, rtNear, rtFar);
        this.rtCamera.position.z = 2;

        this.rtScene = new Scene();

        // this.plane = new Mesh(new PlaneGeomertry(1,1), )
    }

    resize(){
        this.renderTarget.setSize(canvas.width, canvas.height);
        this.rtCamera.aspect = camera.aspect;
        this.rtCamera.updateProjectionMatrix();
    }

    render(){
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.rtScene, this.rtCamera);
        this.renderer.setRenderTarget(null);
    }
}