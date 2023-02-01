import GameInvite from "./GameInvite";

class GameInvites{

	public invites : Map<number,GameInvite> = new Map<number,GameInvite>()

	public constructor(obj: any) {
		Object.assign(this, obj);
	}
	reassign(a : Map<number,GameInvite>){
		this.invites = a
	}
	getGameInvitesArray(){
		let arr = Array.from(this.invites,(([k,v])=>(v)))
		return arr
	}
	addInvite(inviteId : number, user1 : number, user2 : number){
		this.invites?.set(inviteId,new GameInvite(inviteId,user1,user2))
	}
	addInviteObj(data : GameInvite){
		this.invites?.set(data.inviteId,data)
	}
	removeInvite(inviteId : number){
		if(this.invites?.has(inviteId)){
			this.invites?.delete(inviteId)
		}
	}
	has(inviteId : number){
		return !!this.invites?.has(inviteId);

	}
	size(){
		return this.invites?.size
	}
}

export default GameInvites;