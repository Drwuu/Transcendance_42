import * as THREE from 'three'
import { logic } from './game.logic'
import { shape } from './game.shape'
import { datas } from './game.datas'
import { settings } from './game.settings'
import { Socket } from 'socket.io-client';
import { OrbitControls } from 'three-orbitcontrols-ts'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';

const RAD:number = Math.PI / 180;

export class game {
	private _camera:THREE.PerspectiveCamera;
	private _scene:THREE.Scene;
	private _renderer:THREE.WebGLRenderer;
	private _clock:THREE.Clock;
	private _settings:settings;
	private _logic:logic;

	private _delta:number;

	private _ground:shape;
	private _ball:shape;
	private _player1:shape;
	private _player2:shape;

	private _isPlayer1:boolean;
	private _isSpectate:boolean;

	private _gameMap:FBXLoader;
	private _difficulty:number;

	public get camera(): THREE.PerspectiveCamera {
		return this._camera;
	}
	public get renderer(): THREE.WebGLRenderer {
		return this._renderer;
	}
	public get scene(): THREE.Scene {
		return this._scene;
	}

	constructor(canvas:HTMLCanvasElement, socketDatas:{player:string, map:number
	, difficulty:number}) {

		this._clock = new THREE.Clock();
		this._delta = this._clock.getDelta();

		this._settings = {ballSpeed:4, playerSize:15, fov:70, camHeight:200, backgroundColor:0xa0a0a0}
		this._logic = new logic(this._settings);

		if (socketDatas.difficulty === 1)
			this._difficulty = 0;
		else
			this._difficulty = 0.4;

		this._gameMap = new FBXLoader();
		datas.score1 = 0;
		datas.score2 = 0;
		datas.combos = 0;
		this._logic.camEventCombos = 0;
		this._logic.startGame = false;

		this._isPlayer1 = false;
		this._isSpectate = false;
		if (socketDatas.player === 'player1')
			this._isPlayer1 = true;
		else if (socketDatas.player === 'spectate')
			this._isSpectate = true;

		this._ground = new shape("ground", 300, 10, 150, 0x3f095d);
		this._ground.mesh.receiveShadow = true;
		this._ball = new shape("ball", 3, 100, 100, 0xfdb81f);
		this._ball.mesh.position.y = 14;
		this._ball.mesh.castShadow = true;
		this._player1 = new shape("player1", 5, 5, 30, 0x9b0787);
		this._player1.mesh.position.y = 14;
		this._player1.mesh.position.x = this._ground.mesh.geometry.boundingBox!.min.x + 10;
		this._player1.mesh.castShadow = true;
		this._player2 = new shape("player2", 5, 5, 30, 0x039ff7);
		this._player2.mesh.position.y = 14;
		this._player2.mesh.position.x = this._ground.mesh.geometry.boundingBox!.max.x - 10;
		this._player2.mesh.castShadow = true;
		this._scene = new THREE.Scene;
		if (socketDatas.map === 1) {
			this._scene.background = new THREE.TextureLoader().load( '../../assets/img/004.jpeg' );
		}
		else if (socketDatas.map === 2)
			this._scene.background = new THREE.TextureLoader().load( '../../assets/img/005.jpeg' );
		else
			this._scene.background = new THREE.TextureLoader().load( '../../assets/img/zyro-image00.png' );

		let ratio = canvas.clientWidth / canvas.clientHeight;

		if (ratio < 1) {
			ratio = canvas.clientHeight / canvas.clientWidth;
		}
		this._camera = new THREE.PerspectiveCamera(this._settings.fov, ratio, 0.1, 10000);

		this._camera.position.set(0, this._settings.camHeight, 160);
		this._camera.rotation.x = RAD * -50;

		this._renderer = new THREE.WebGLRenderer( {canvas: canvas, antialias: true } );
		this._renderer.setPixelRatio( devicePixelRatio );
		this._renderer.setSize( canvas.clientWidth, canvas.clientHeight );
		this._renderer.shadowMap.enabled = true;
	}

	start(socket:Socket) {
		var hemLight = new THREE.HemisphereLight( 0xffffff, 0xc3377a);
		hemLight.position.set( -5, 10, -7.5 );
		this._scene.add( hemLight );

		var direcLight = new THREE.DirectionalLight( 0xffffff );
		direcLight.position.set( 5, 10, 7.5 );
		direcLight.castShadow = true;
		this._scene.add( direcLight );

		this._scene.add( this._ground.mesh );
		this._scene.add( this._player1.mesh );
		this._scene.add( this._player2.mesh );
		this._scene.add( this._ball.mesh );

		this.gameEvents(socket);

	}
	update(socket:Socket) {
		let id = requestAnimationFrame(() => { this.update(socket) });

		if (socket.disconnected) {
			cancelAnimationFrame(id);
			return;
		}

		this._delta = this._clock.getDelta();

		if (!this._isSpectate) {
			this._logic.checkKeys(socket, this._isPlayer1, this._ball);
			if (this._isPlayer1) {
				this._logic.onKeyAction(250, this._player1, this._ground, this._delta, socket);
				this._logic.ballDirection(this._ball, this._difficulty, socket);
				this._logic.checkHits(this._ball, this._player1, this._player2, this._difficulty);
				this._logic.checkBounce(this._ball, this._ground);
				this._logic.checkGoals(this._ball, this._ground, socket);
			}
			else {
				this._logic.onKeyAction(250, this._player2, this._ground, this._delta, socket);
			}
		}
		this._renderer.render(this._scene, this._camera);

		if (this._logic.isEndOfGame(datas.score1, datas.score2)) {
			this._scene.clear();
			window.cancelAnimationFrame(id);
			return ;
		}
	}

	private gameEvents(socket:Socket) {
		if (!this._isSpectate) {												// players
			socket.on("startGame", () => {
				this._logic.startGame = true;
			});

			socket.on("setPlayerPos", (pos: number) => {
				if (this._isPlayer1)
					this._player2.mesh.position.setZ(pos);
				else
					this._player1.mesh.position.setZ(pos);
			});
			socket.on("ballServerPosition", (pos: THREE.Vector3) => {
				if (!this._isPlayer1) {
					this._ball.mesh.position.x = pos.x;
					this._ball.mesh.position.z = pos.z;
				}
			});
		}
		else {																	// spectate
			socket.on("ballServerPosition", (pos: THREE.Vector3) => {
				this._ball.mesh.position.x = pos.x;
				this._ball.mesh.position.z = pos.z;
			});
			socket.on('paddlePosition', (paddlePos:{player:string, playerPosition:number}) => {
				if (paddlePos.player == 'player1')
					this._player1.mesh.position.setZ(paddlePos.playerPosition);
				else if (paddlePos.player == 'player2')
					this._player2.mesh.position.setZ(paddlePos.playerPosition);
			});
		}

		socket.on('updateScore', (data:{score1:number, score2:number}) => {		// all
			this.updateScore(data);
			datas.score1 = data.score1;
			datas.score2 = data.score2;
		});


	}
	controlCamera() {
		let controls = new OrbitControls(this._camera);
		controls.target.set(0, 150, 0);
		controls.update()
	}

	private updateScore(data:{score1:number, score2:number}) {
		document.querySelector("#score1")!.innerHTML = data.score1.toString();
		document.querySelector("#score2")!.innerHTML = data.score2.toString();
	}

	private rotateCam(angle:number, rotateSpeed:number) {
		if (this._logic.camEventCombos >= 2) {
			this._camera.rotation.x += (RAD * angle) * rotateSpeed;
		}
		if (this._camera.rotation.x >= angle) {
			this._logic.camEventCombos = 0;
		}
	}
}
