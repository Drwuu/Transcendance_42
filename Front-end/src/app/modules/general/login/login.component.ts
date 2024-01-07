import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Data } from './entities/Data.entities';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	constructor(public router: Router,
		public appService: AppService
		) { this.data = this.appService.data;}

	id: number = 0;
	windows: any
	data: Data;
	show_login="true";
	show_Auth="false";
	codeSecret: String = "";
	badcode='false';
	code : boolean = false;

	async ngOnInit(){
	}

	CheckCodeAuth(){
		this.windows.close();
		this.show_login = "false";
		this.show_Auth = "true";
	}

	Connected()
	{
		this.windows.close();
		this.appService.init_socket();
		this.router.navigate(['/home']);
	}

	async VerifCode(){
		try {
			this.code = (await this.appService.postData(this.appService.LINK_API + "/login/2fa_login", {token: this.codeSecret})).code
		} catch (error) {}
		if (this.code)
			await this.ProcessOauthState();
		else
			this.badcode = "true";

	}

	OpenWindowOauth(){
		var url = this.appService.LINK_API + "/login/redir_42api";
		let windowFeatures = "width=320,height=320";
		this.windows =  window.open(url, "_blank", windowFeatures);
	}

	async ProcessOauthState()
	{
		try {
			await this.appService.GetData(this.appService.LINK_API);
		} catch (error) {}
		this.data = this.appService.data;
		if (this.data.authStatus === "Accepted")
			this.Connected();
		else if (this.data.authStatus === "WaitingFor2FA"){
			this.CheckCodeAuth();
		}
		else if (this.data.authStatus === "Refused")
			this.windows.close();
		else
			console.error("Process Oauth return : " + this.data.authStatus);
	}

	Process_oauth()
	{
		this.show_login = "false";
		this.OpenWindowOauth();
		this.ProcessOauthState();
	}
}
