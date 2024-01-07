
export class Data{
	constructor(
	public requires2FA: boolean,
	public id:number,
	public loose:number,
	public win:number,
	public authStatus:string,
	public userStatus:string,
	public displayName:string,
	public login:string,
	public imageUrl:string,
	public level:number,
	public ratio:number
	) {}
}
