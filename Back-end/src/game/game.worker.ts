import { Logger } from "@nestjs/common";
import { parentPort, workerData } from "worker_threads";
import { logic } from "./game.logic";
import { Vector3 } from "three";

const LOOP_WAIT_MS: number = 10 /* ms */;
const SYNC_DELAY: number = 500;
const MAP_WIDTH: number = 300;
const MAP_HEIGHT: number = 150;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const logger = new Logger("GameWorker");

parentPort.on("message", dispatchMessage);

class Data {
	public startGame = false;
	public playerPos: number[] = [0, 0];
	public ballPos: Vector3 = new Vector3(0, 0, 0);
	public ballDirection = new Vector3(0, 0, 0);

	public roundPromise: Promise<void> = null;
}

var games: Map<number, Data> = new Map();

function startGame(id: number): void {
	games.set(id, new Data());
}

function throwBall(id: number): void {
	logger.debug(`THROWBALL: ${id}`);

	let game = games.get(id);
	game.startGame = true;

	game.roundPromise = roundUpdate(id, game);
}

function endGame(id: number): void {
	games.delete(id);
}

function setPlayerPos(id: number, player: number, pos: number): void {
	let game = games.get(id);

	game.playerPos[player] = pos;

	emitMessage("onPlayerSync", {id: id, player: player, pos: pos});
}

function dispatchMessage(message: any) {
	switch (message.event) {
		case "startGame": startGame(message.data.id); break;
		case "throwBall": throwBall(message.data.id); break;
		case "setPlayerPos": setPlayerPos(message.data.id, message.data.player, message.data.pos); break;
		case "endGame": endGame(message.data.id); break;
	}
}

async function roundUpdate(id: number, game: Data) {
	let lastLoop = Date.now();
	let lastUpdate = 0;

	emitMessage("ballThrown", {id: id});

	while (true) {
		await sleep(LOOP_WAIT_MS /* ms */);


		let delta = Date.now() - lastLoop;

		logic.checkHits(game.ballPos, game.playerPos[0], game.playerPos[1], MAP_WIDTH);
		logic.checkBounce(game.ballPos, MAP_HEIGHT);
		game.ballDirection = logic.ballDirection(game.startGame, game.ballPos, delta);

		if (Date.now() - lastUpdate >= SYNC_DELAY) {
			emitMessage("ballSync", {
				id: id,
				pos: [game.ballPos.x, game.ballPos.z],
				vel: [game.ballDirection.x, game.ballDirection.z]
			});
			lastUpdate = Date.now();
		}
		lastLoop = Date.now();
	}
}

function emitMessage(event: string, data: any) {
	parentPort.postMessage({event: event, data: data});
}
