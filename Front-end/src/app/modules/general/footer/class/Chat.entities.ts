
export class TabMsg{
	constructor(
	public msg:string,
	public from: string,
	public sender: string,
	public senderId: number
	) {}
}

export class ListeConvo{
	constructor(
	public name:string,
	public roomId:number,
	public type:string,
	public key:string,
	public tabmsg: TabMsg[]
	) {}
}
