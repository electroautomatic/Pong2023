export default class GameInvite {
	public inviteId : number
	public user1 : number
	public user2 : number
	public constructor(inviteId : number, user1 : number, user2 : number) {
		this.inviteId = inviteId
		this.user2 = user2
		this.user1 = user1
	}
}