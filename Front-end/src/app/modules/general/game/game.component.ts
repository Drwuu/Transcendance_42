import { Component, AfterViewInit , ElementRef, ViewChild } from '@angular/core';
import { game } from './game.client'
import { controller } from './game.controller'
import { io, Socket, Manager } from 'socket.io-client';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.scss']
})

export class GameComponent implements AfterViewInit {

	public ShowGame:string = "true";
	public ShowWin:string = "";
	public ShowSpectate:string = "";
	private isSpectate:boolean = false;
	private savewidth:number = window.innerWidth;
	private _clientSocket:Socket = new Socket(new Manager(), "");

	@ViewChild('canvas') _canvas!: ElementRef;

	constructor(private appService: AppService, public router: Router) {
	}

	async init_refresh() {
		if (this.appService.data.authStatus !== "Accepted") {
			await this.appService.GetDataRefresh(this.appService.LINK_API);
			if (this.appService.data.authStatus !== "Accepted") {
				this.router.navigate(['/login']);
				return;
			}
		}
	}

	private get canvas(): HTMLCanvasElement {
		return this._canvas.nativeElement;
	}

	ngOnInit(): void {
		this.init_refresh();
		if(this.appService.get_game_state() === false){
			this.router.navigate(['/login']);
			return ;
		}
	}

	ngAfterViewInit(): void {
		controller.up = {key:"ArrowUp", isOn:false}
		controller.down = {key:"ArrowDown", isOn:false}
		controller.start = {key:" ", isOn:false}

		if (this.appService.get_game_state() === false){
			this.router.navigate(['/login']);
			return ;
		}

		const socket = io(this.appService.LINK_API + "/game", { withCredentials: true });
		this._clientSocket = socket;

		socket.on('launch', (socketDatas:{player:string, map:number, difficulty:number}) => {
			this._canvas.nativeElement.width = window.innerWidth;
			this._canvas.nativeElement.height = window.innerHeight;
			if (socketDatas.player == 'spectate')
				this.isSpectate = true;

			var clientGame:game = new game(this.canvas, socketDatas);

			window.addEventListener(
				'resize', () => {
					let height = window.innerHeight;
					let width =  window.innerWidth;
					// Update camera
					clientGame.camera.aspect = width / height;
					if (clientGame.camera.aspect < 1)
						clientGame.camera.aspect = height / width;
					clientGame.camera.updateProjectionMatrix();
					// Update renderer
					clientGame.renderer.setSize(width, height);
					clientGame.renderer.setPixelRatio(devicePixelRatio);
				}
			);

			clientGame.start(socket);
			clientGame.update(socket);
		});

		socket.on('disconnectInGame', (datas:{win:boolean, score1:number, score2:number, player:string}) => {
			this.ShowGame="false";
			if (!this.isSpectate) {
				if (datas.win)
					this.ShowWin="true";
			}
			else
				this.ShowSpectate="true";
			this.appService.set_endGame();
			socket.disconnect();
		});

		//////////////////////////////
		// REMOVE IT WHEN OPERATIONNAL
		socket.emit('ready', []);
		//////////////////////////////
	}

	return_home(){
		this.appService.set_game_state(false);
		this.router.navigate(['/home']);
	}

	ngOnDestroy(): void{
        this.appService.set_game_state(false);
        this.appService.set_endGame();
        if (this._clientSocket && this._clientSocket.connected){
            this._clientSocket.disconnect();
        }
    }
}
