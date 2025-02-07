import * as THREE from 'three';
import Stats from 'https://unpkg.com/three@0.141.0/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.141.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.141.0/examples/jsm/loaders/GLTFLoader.js';


export default function threeDface() {
    
    
    let camera, scene, renderer, stats;
    
    init();
    animate();

    function init() {
	
        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.1, 100 );
        camera.position.x = 0;
        camera.position.y = 1;
        camera.position.z = 10;
    
        scene = new THREE.Scene();
    
        const loader = new GLTFLoader();
        loader.load( './img/myface.gltf', function ( gltf ) {
            
            const geometry = gltf.scene.children[ 0 ].geometry;
    
            let mesh = new THREE.Mesh( geometry, buildTwistMaterial( -4.0 ) );
            mesh.position.x = - 1.5;
            mesh.position.y = - 0.5;
            scene.add( mesh );
    
            mesh = new THREE.Mesh( geometry, buildOriginMaterial( 4.0 ) );
            mesh.position.x = 1.5;
            mesh.position.y = - 0.5;
            scene.add( mesh );
    
        } );
    
        renderer = new THREE.WebGLRenderer( {    
            canvas : document.querySelector('#threeDface'),
            antialias : true
        } );
        renderer.setPixelRatio( window.devicePixelRatio );



        const controls = new OrbitControls( camera, renderer.domElement );
        controls.minDistance = 10;
        controls.maxDistance = 50;
    
        //
    
        //stats = new Stats();
        //document.body.appendChild( stats.dom );
    
        // EVENTS
    
        window.addEventListener( 'resize', onWindowResize );
    
    }
    
    function buildTwistMaterial( amount ) {
    
        const material = new THREE.MeshNormalMaterial();
        material.onBeforeCompile = function ( shader ) {
    
            shader.uniforms.time = { value: 0 };
    
            shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    `float theta = sin( time + position.y ) / ${ amount.toFixed( 1 ) };`,
                    'float c = cos( theta );',
                    'float s = sin( theta );',
                    'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
                    'vec3 transformed = vec3( position ) * m;',
                    'vNormal = vNormal * m;'
                ].join( '\n' )
            );
    
            material.userData.shader = shader;
    
        };
    
        // Make sure WebGLRenderer doesnt reuse a single program
    
        material.customProgramCacheKey = function () {
    
            return amount;
    
        };
    
        return material;
    
    }


    function buildOriginMaterial( amount ) {
    
        const texture = new THREE.TextureLoader().load('./img/myface_tex.png');

        const material = new THREE.MeshBasicMaterial({
            map : texture
        });
        material.onBeforeCompile = function ( shader ) {
    
            shader.uniforms.time = { value: 0 };
    
            shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    `float theta = sin( time + position.y ) / ${ amount.toFixed( 1 ) };`,
                    'float c = cos( theta );',
                    'float s = sin( theta );',
                    'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
                    'vec3 transformed = vec3( position ) * m;',
                    // 'vNormal = vNormal * m;'
                ].join( '\n' )
            );
    
            material.userData.shader = shader;
    
        };
    
        // Make sure WebGLRenderer doesnt reuse a single program
    
        material.customProgramCacheKey = function () {
    
            return amount;
    
        };
    
        return material;
    
    }

    
    //
    
    function onWindowResize() {
    
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    
        renderer.setSize( width, height );
    
    }
    
    //
    
    function animate() {
    
        requestAnimationFrame( animate );
    
        render();
    
        //stats.update();
    
    }
    
    function render() {
    
        scene.traverse( function ( child ) {
    
            if ( child.isMesh ) {
    
                const shader = child.material.userData.shader;
    
                if ( shader ) {
    
                    shader.uniforms.time.value = performance.now() / 1000;
    
                }
    
            }
    
        } );
    
        scene.background = new THREE.Color('#f5f5f5');
    
        renderer.render( scene, camera );
    
    }

}
