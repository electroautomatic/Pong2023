import React, {CSSProperties, useEffect, useState} from "react";
import {MainProps} from "../Main";
import MyLabel from "../../utils/Label";
import GameInvites from "../../models/GameInvites";
import GameInvite from "../../models/GameInvite";
import {colors} from "../../constants";

const btnsStyleLong = {
	padding: "0px 10px 0px 10px",
	width: "100%",
	height: 50,
	margin: 5,
	alignItems: "center",
	justifyContent: "left",
	display: "flex",
	fontSize: 15,
	fontWeight: "bolder",
	color: "#ccc",
}
const btnStyleGrey = {
	padding: "0px 10px 0px 10px",
	height: 50,
	alignItems: "center",
	justifyContent: "space-around",
	display: "flex",
	fontSize: 15,
	color: "#444",
	width: "100%",
	margin: 5,
}

export default function Invites(props: MainProps) {
	const [invites,setInvites] = useState<GameInvite[]>([])
	useEffect(()=>{
		setInvites(props.mainProps.activeGameInvites.getGameInvitesArray())
		// console.log("Invites:",invites)
	},[props.mainProps.activeGameInvites])
	const infoContentBoxStyleSpace : CSSProperties = {
		display: "flex",
		alignItems: "center",
		justifyContent:"space-around",
		width : 600,
		height : "auto",
		borderRadius : 5
	}
	const infoContentBoxColumnStyle : CSSProperties = {
		margin: "5px 0px 5px 0px",
		maxHeight: 150,
		overflowY: "scroll",
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent : "space-between",
		flexDirection:"column",
		width : 600,
		backgroundColor : colors.BG_COLOR_24,
		height : "auto",
		borderRadius : 10
	}
	const msgLogoStyleLeft = {
		margin : "5px",
		height: "40px",
		width: "40px",
		backgroundColor: "#ccc",
		borderRadius: "50%",
		objectFit:"cover",
		padding: 2
	}
	const textStyle = {
		fontWeight:"bolder",
		height: 5,
		margin: 5,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
		fontSize: 15,
		color: "#bbb",
	}
	const textStyleGrey = {
		// fontWeight:"bolder",
		height: 5,
		margin: 5,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
		fontSize: 15,
		color: "#444",
	}
	const btnStyle = {
		fontWeight:"bolder",
		height: 45,
		minWidth: 100,
		margin: 5,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
		fontSize: 15,
		color: "#bbb",
	}

	const handleAccept = (inviteId : number) => {
		if(props.mainProps.webSocket)
			props.mainProps.webSocket.emit("game:invite:accept",{
				inviteId: inviteId,
				gameFieldSize: {
					width: 600,
					height: 600
				},
				paddleSize: {
					width: 25,
					height: 100

				},
				ballSize: 25
			})
	}
	const handleCancel = (inviteId : number) => {
		if(props.mainProps.webSocket)
			props.mainProps.webSocket.emit("game:invite:cancel",{inviteId:inviteId})
	}

	return(
		<div className="info-content-user-buttons" style={infoContentBoxColumnStyle as CSSProperties}>
			{
				invites.length > 0
					?
					invites.map((invite) => (
						<div className="info-content-user-buttons" style={infoContentBoxStyleSpace as CSSProperties}>
							<div style={btnsStyleLong as CSSProperties}>
									<img
										alt="player1-avatar"
										src= {
											invite.user1 === props.mainProps.userId
												?
												props.mainProps.userAvatarUrl[0]+invite.user2+props.mainProps.userAvatarUrl[1]
												:
												props.mainProps.userAvatarUrl[0]+invite.user1+props.mainProps.userAvatarUrl[1]
										}
										style={msgLogoStyleLeft as CSSProperties}
									/>
									{
										invite.user1 === props.mainProps.userId
										?
										<div style={textStyleGrey as CSSProperties}>
											{props.mainProps.users.find((user) => user.id === invite.user2)?.name }
										</div>
										:
										<div style={textStyle as CSSProperties}>
											{props.mainProps.users.find((user) => user.id === invite.user1)?.name }
										</div>
									}
							</div>
							{
								invite.user1 === props.mainProps.userId
									?
									<div className="back-btn" style={btnStyle as CSSProperties} onClick={()=>handleCancel(invite.inviteId)}>
										cancel
									</div>
									:
									<>
										<div className="back-btn" style={btnStyle as CSSProperties} onClick={()=>handleAccept(invite.inviteId)} >
											play now
										</div>
										<div className="back-btn" style={btnStyle as CSSProperties} onClick={()=>handleCancel(invite.inviteId)}>
											decline
										</div>
									</>

							}
						</div>
					))
					:
					<div className="info-content-user-buttons" style={infoContentBoxStyleSpace as CSSProperties}>
						<div style={btnStyleGrey as CSSProperties}>
							no active invites
						</div>
					</div>
			}
		</div>
	)
}