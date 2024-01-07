import * as THREE from 'three'
import { settings } from './game.settings'
import { shape } from './game.shape'
import { tools } from './game.tools'
import { datas } from './game.datas'
import { controller } from './game.controller'
import { Socket } from 'socket.io-client';

const MAX_SPEED:number = 6;
const BALL_MARGIN:number = 4;

export class logic {
	private _settings:settings;
	private _angle:number;
	private _ballSpeed:number;
	private _ballDirection:THREE.Vector3;
	public startGame:boolean;
	public camEventCombos:number;

	constructor(settings:settings) {
		this._settings = settings;
		this._angle = 0;
		this._ballSpeed = this._settings.ballSpeed;
		this._ballDirection = new THREE.Vector3(tools.getRandom(0, 2),0,0);
		this.startGame = false;
		this.camEventCombos = 0;
	}

	ballDirection(ball:shape, difficulty:number, socket:Socket) {
		if (!this.startGame) {
			ball.mesh.position.x = 0;
			ball.mesh.position.z = 0;
			socket.emit('ballClientPosition', ball.mesh.position);
		}
		else {
			ball.mesh.translateOnAxis(this._ballDirection, this._ballSpeed);
			socket.emit('ballClientPosition', ball.mesh.position);
		}
	}

	checkGoals(ball:shape, ground:shape, socket:Socket) {
		// goal left
		if (ball.mesh.position.x < ground.mesh.geometry.boundingBox!.min.x) {
			socket.emit('scored', "player2");
			this._ballSpeed = 4;
			this._angle = 0;
			this._ballDirection = new THREE.Vector3(tools.getRandom(0, 2),0,0);
			this.startGame = false;
			datas.combos = 0;
			this.camEventCombos = 0;
		}
		// goal right
		else if (ball.mesh.position.x > ground.mesh.geometry.boundingBox!.max.x) {
			socket.emit('scored', "player1");
			this._ballSpeed = 4;
			this._angle = 0;
			this._ballDirection = new THREE.Vector3(tools.getRandom(0, 2),0,0);
			this.startGame = false;
			datas.combos = 0;
			this.camEventCombos = 0;
		}
	}
	checkBounce(ball:shape, ground:shape) {
		if (ball.mesh.position.z > ground.mesh.geometry.boundingBox!.max.z
		|| ball.mesh.position.z < ground.mesh.geometry.boundingBox!.min.z) {
			this._angle *= -1;
			this._ballDirection.z = 1/180 * this._angle;
		}
	}

	checkHits(ball:shape, player1:shape, player2:shape, difficulty:number) {
		// player1
		if (ball.mesh.position.z > player1.mesh.position.z - this._settings.playerSize
		&& ball.mesh.position.z < player1.mesh.position.z + this._settings.playerSize
		&& ball.mesh.position.x - BALL_MARGIN < player1.mesh.position.x) {
			this._angle = this.hitBall(ball, player1, 120);
			this._ballDirection = new THREE.Vector3(1, 0, 1/180 * this._angle);
			if (this._ballSpeed < MAX_SPEED)
				this._ballSpeed += difficulty;
			datas.combos++;
			this.camEventCombos++;
		}
		// player2
		else if (ball.mesh.position.z > player2.mesh.position.z - this._settings.playerSize
		&& ball.mesh.position.z < player2.mesh.position.z + this._settings.playerSize
		&& ball.mesh.position.x + BALL_MARGIN > player2.mesh.position.x) {
			this._angle = this.hitBall(ball, player2, 120);
			this._ballDirection = new THREE.Vector3(-1, 0, 1/180 * this._angle);
			if (this._ballSpeed < MAX_SPEED)
				this._ballSpeed += difficulty;
			datas.combos++;
			this.camEventCombos++;
		}
	}
	private hitBall(ball:shape, player:shape, maxAngle:number) {
		var ratio = maxAngle/this._settings.playerSize;
		return ratio * (ball.mesh.position.z - player.mesh.position.z);
	}

	checkKeys(socket:Socket, isPlayer1:boolean, ball:shape) {
		document.onkeydown = (e) => {
			if (e.key == controller.down.key)
				controller.down.isOn = true;
			else if (e.key == controller.up.key)
				controller.up.isOn = true;
			else if (e.key == controller.start.key) {
				if (controller.start.isOn)
					return ;
				controller.start.isOn = true;
			}
			if (controller.start.isOn && !this.startGame && isPlayer1 && ball.mesh.position.x == 0) {
				this.startGame = false;
				socket.emit('throwBall');
			}
		};
		document.onkeyup = (e)=> {
			if (e.key == controller.up.key)
				controller.up.isOn = false;
			if (e.key == controller.down.key)
				controller.down.isOn = false;
			if (e.key == controller.start.key)
				controller.start.isOn = false;
		};
	}
	onKeyAction(speedMove:number, player:shape, ground:shape, delta:number, socket:Socket) {
		if (controller.up.isOn || controller.down.isOn) {
			if (player.mesh.position.z - this._settings.playerSize > ground.mesh.position.z
			- (ground.depth/2) + 2 && controller.up.isOn) {
				player.mesh.position.z -= (speedMove * delta);

			}
			else if (player.mesh.position.z + this._settings.playerSize < ground.mesh.position.z
			+ (ground.depth/2) - 2 && controller.down.isOn) {
				player.mesh.position.z += (speedMove * delta);
			}
			socket.emit('playerPosition', player.mesh.position.z);
		};
	}

	isEndOfGame(score1:number, score2:number):boolean {
		if (score1 >= 11 || score2 >= 11) {
			return true;
		}
		return false;
	}
}
