import React, {CSSProperties, useEffect, useState} from "react";
import "./ChatView.css"
import {AchievementsResource, colors, SERVER_URL} from "../../../constants";
import ChatWithMessages from "../../../models/ChatWithMessages";
import {OnNewGroupEnum} from "../Community";
import User from "../../../models/User";
import "./ChatViewDetails.css"
import {ChatDetailsProps} from "./ChatViewDetails";
import {alertAddFriend, alertRemoveFriend} from "../../../utils/Alert/AlertsResourses";
import Chat from "../../../models/Chat";
import MyLabel from "../../../utils/Label";
import UserMenuGameHistory from "../../userMenu/UserMenuGameHistory";
import {appStates} from "../../../App";

export default function ChatViewDetailsUser(props: ChatDetailsProps,key: number) {
	useEffect(()=>{},[props.parentProps.mainProps.mainProps.users])
	const [update,setUpdate] = useState(false)
	const handlePrivateChat = (userId : number | null) => {
		if(!userId) {
			// console.log("no user")
			return
		}
		const user = props.parentProps.mainProps.mainProps.users.find((user) => user.id === userId)
		if(!user)
			return(<></>)

		const chat = props.parentProps.chatList.getList().find((chat) => chat.chat.participants.find((p)=>p===user.id) &&  chat.chat.participants.find((p)=>p===props.parentProps.mainProps.mainProps.userId))
		if(chat !== undefined && chat.chat.chat) {
			props.parentProps.setOnChatId(chat.chat.id)
		} else {
			console.log("not found -> create chat")
			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
				},
				body: JSON.stringify({
					name : "private chat",
					chat : true,
					participants : [props.parentProps.mainProps.mainProps.userId,userId],
					password : ""
				})
			};
			fetch(SERVER_URL+"chat/create", requestOptions)
				.then((r)=> {
					if(r.ok) {
						r.json().then((chatResponse : Chat) => {
							chatResponse.name = user.name
							props.parentProps.chatList.addChatWithoutMessages(chatResponse)
							props.parentProps.setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true)
							props.parentProps.setOnChatId(chatResponse.id)
							props.parentProps.setOnNewGroup(OnNewGroupEnum.groupCreated)
							if (props.parentProps.mainProps.mainProps.webSocket)
								props.parentProps.mainProps.mainProps.webSocket.emit('chat:requestUpdate:participants', {chatId: chatResponse.id})
						})
					} else {
						throw new Error('Server unavailable');
					}
				})
				.catch(() => {
					props.showAlert("Chat create: connection lost, try later")
					props.parentProps.setOnNewGroup(OnNewGroupEnum.firstOccurrence)
					props.parentProps.setOnChatId(0)
				});
		}
	}
	const handleFriends = (src: User | undefined) => {
		if(!src)
			return
		const user = src
		if(!user)
			return
		const requestOptions = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
			},
		};
		if(user.isFriend) {
			fetch(SERVER_URL+"user/friend/delete/"+user.id, requestOptions).then((r)=> {
				if(r.ok){
					// @ts-ignore
					props.parentProps.mainProps.mainProps.users.find((userRes) => userRes.id === user.id).isFriend = false
					setUpdate(update => update === true ? false : true)
					// @ts-ignore
					props.parentProps.mainProps.mainProps.setUpdateMain(!props.parentProps.mainProps.mainProps.updateMain)
				}
			})
		} else {
			fetch(SERVER_URL+"user/friend/add/"+user.id, requestOptions).then((r)=> {
				if(r.ok){
					// @ts-ignore
					props.parentProps.mainProps.mainProps.users.find((userRes) => userRes.id === user.id).isFriend = true
					setUpdate(update => update === true ? false : true)
					// @ts-ignore
					props.parentProps.mainProps.mainProps.setUpdateMain(!props.parentProps.mainProps.mainProps.updateMain)
				}
			})
		}
	}
	const handleUserBlock = (src: User | undefined) => {
		if(!src)
			return
		console.log("handleBlock")
		// const user = props.parentProps.mainProps.mainProps.users.find((user)=>user.id === id)
		const user = src
		if(!user)
			return
		const requestOptions = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
			},
		};
			fetch(SERVER_URL+"user/block/"+user.id, requestOptions).then((r)=> {
				if(r.ok){
					// @ts-ignore
					props.parentProps.mainProps.mainProps.users.find((userRes) => userRes.id === user.id).isBlocked = user.isBlocked ? false : true
					setUpdate(update => update === true ? false : true)
					props.parentProps.mainProps.mainProps.setUpdateMain(!props.parentProps.mainProps.mainProps.updateMain)
				}
			})
	}
	const btnBoxStyle = {
		width: props.rightChatStyleWidth,
		height: "50px",
		alignItems: "center",
		justifyContent: "left",
		display: "flex"
	}

	const btnStyleGrey : CSSProperties = {
		padding: "0px 30px 0px 30px",
		width: 100,
		height: 50,
		alignItems: "center",
		justifyContent: "space-around",
		display: "flex",
		fontSize: 15,
		color: colors.BG_COLOR_444,
	}
	const btnStyle : CSSProperties = {
		padding: "0px 30px 0px 30px",
		width: 100,
		height: 50,
		alignItems: "center",
		justifyContent: "space-around",
		display: "flex",
		fontSize: 15,
		color: colors.TEXT_COLOR_DEFAULT,
	}
	const chatInfoNameStyle = {
		margin: "10px 30px 5px 30px",
		height: 30,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
		fontSize: 20,
		color: colors.TEXT_COLOR_DEFAULT,
	}
	const chatLogoStyle = {
		objectFit:"cover",
		padding : 4,
		marginTop: 20,
		display: "flex",
		height: "150px",
		width: "150px",
		backgroundColor: colors.TEXT_COLOR_DEFAULT,
		borderRadius: "50%",
	}
	const chatLogoStyleFriend = {
		objectFit:"cover",
		marginTop: 20,
		display: "flex",
		height: "150px",
		width: "150px",
		backgroundColor: colors.TEXT_COLOR_DEFAULT,
		borderRadius: "50%",
		border: "solid 4px #4a8"
	}
	const chatLogoStyleBlocked = {
		objectFit:"cover",
		marginTop: 20,
		display: "flex",
		height: "150px",
		width: "150px",
		backgroundColor: colors.TEXT_COLOR_DEFAULT,
		borderRadius: "50%",
		border: "solid 4px #a53"
	}
	const infoContentStyle = {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection:"column"
	}
	const userMenuStatsWinsLosesStyle = {
		display:"flex", alignItems:"center", justifyContent:"center"
	}
	const winsLosesBox = {
		padding: "7px 45px 7px 45px",
		display:"flex", alignItems:"center", justifyContent:"center",flexDirection: "column",
		fontWeight:"bolder",
	}
	const winsLosesDescription = {
		marginBottom:"5px",
		color:colors.TEXT_COLOR_MINUS_1
	}
	const infoContentBoxColumnStyle : CSSProperties = {
		margin: "5px 0px 5px 0px",
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent : "space-between",
		flexDirection:"column",
		width : 600,
		height : "auto",
		borderRadius : 5
	}
	const infoContentBoxStyleSpace : CSSProperties = {
		margin: "5px 0px 5px 0px",
		position: "relative",
		display: "flex",
		justifyContent:"space-between",
		width : 600,
		height : "auto",
		backgroundColor : colors.BG_COLOR_24,
		borderRadius : 5
	}
	const infoContentWinsLosesBoxStyle : CSSProperties = {
		padding: 5,
		margin: "5px 5px 5px 5px",
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-around",
		width : 285,
		height : "auto",
		backgroundColor : colors.BG_COLOR_24,
		borderRadius : 5,
	}
	let userRes : User | undefined
	if(props.parentProps.onChatDetails === null) {
		return (<></>)
	} else if(props.parentProps.onChatDetails &&  props.parentProps.onChatDetails > 0) {
		userRes = props.parentProps.mainProps.mainProps.users.find((user) => user.id === props.parentProps.onChatDetails)
	} else if(props.parentProps.onChatDetails instanceof  ChatWithMessages && props.parentProps.onChatDetails.chat) {
		// @ts-ignore
		userRes = props.parentProps.mainProps.mainProps.users.find((user) => user.name === props.parentProps.onChatDetails.chat.name)
	}
	if(!userRes)
		return(<></>)
	const contactLogoStyle = () => {
		if(userRes?.isBlocked)
			return chatLogoStyleBlocked
		else if (userRes?.isFriend)
			return chatLogoStyleFriend
		else
			return chatLogoStyle
	}
	const underNameLabelText = () => {
		if(userRes?.blackList.find((i)=> i===props.parentProps.mainProps.mainProps.userId))
			return "blocked you"
		if (userRes?.isBlocked)
			return "is blocked"
		return userRes?.isOnline? "online" : "offline"
	}
  
	const history = (userRes.id === props.parentProps.mainProps.mainProps.userId) ? props.parentProps.mainProps.mainProps.matchHistory : userRes.games
	const handleInvite = () => {
		if(props.parentProps.mainProps.mainProps.webSocket && typeof props.parentProps.onChatDetails === "number"){
			props.parentProps.mainProps.mainProps.webSocket.emit(
				"game:invite:create",
				{
					user1: props.parentProps.mainProps.mainProps.userId,
					user2: props.parentProps.onChatDetails
				})
		}
	}
	// console.log("ChatViewDetailsUser()")
	const achIds = props.parentProps.mainProps.mainProps.users.find((user)=>user.id === props.parentProps.onChatDetails)?.achievementsId
	return (
		<div className="info-content" style={infoContentStyle as CSSProperties}>
			<div className="info-content-logo-box" style={infoContentBoxColumnStyle as CSSProperties}>
				<img
					alt="user/chat avatar"
					src={props.parentProps.mainProps.mainProps.userAvatarUrl[0] + userRes.id + props.parentProps.mainProps.mainProps.userAvatarUrl[1]}
					className="contact-logo"
					style={contactLogoStyle() as CSSProperties}
				/>
				<div className="new-group-nav-text" style={chatInfoNameStyle}>
					{(props.parentProps.onChatDetails instanceof ChatWithMessages) ? props.parentProps.onChatDetails.chat.name : userRes?.name}
				</div>
				<MyLabel labelText={underNameLabelText()} width={200} justifyContent={"center"} margin={"0px 0px 0px 0px"}/>
				<div style={{display:"flex",margin:10}}>
					{
						AchievementsResource.map((ach,id)=>(
							<div style={{
								display:"flex",
								justifyContent:"center",
								alignItems:"center",
								height:20,
								width:20,
								fontSize: 10,
								borderRadius:"50%",
								filter:  achIds?.find((achId) => achId === id) ? "saturate(3)" : "grayscale(1)",
								backgroundColor: achIds?.find((achId) => achId === id) ? AchievementsResource[id].color : colors.BG_COLOR_28,
							}}>
								{AchievementsResource[id].text}
							</div>
						))
					}
				</div>
			</div>
			{
				underNameLabelText() !== "blocked you"
				&&
                <>
					{props.parentProps.mainProps.mainProps.userId !== userRes.id
						&&
                        <div className="info-content-user-buttons" style={infoContentBoxStyleSpace as CSSProperties}>
                            <div className="back-btn"
                                 style={!userRes?.isBlocked ? btnStyle : btnStyleGrey as CSSProperties} onClick={() => {
								// @ts-ignore
								if (!userRes?.isBlocked) {
									// @ts-ignore
									handlePrivateChat(userRes?.id)
									props.parentProps.setOnChatDetails(undefined)
								} else {
									props.showAlert("User is blocked")
								}
							}}>
                                message
                            </div>
                            <div className="back-btn"
                                 style={!userRes?.isBlocked ? btnStyle : btnStyleGrey as CSSProperties}
                                 onClick={() => {
									 if (!userRes?.isBlocked) {
										 // @ts-ignore
										 handleFriends(userRes)
										 props.showAlert(userRes?.isFriend ? alertRemoveFriend(userRes?.name) : alertAddFriend(userRes?.name))
									 } else {
										 props.showAlert("User is blocked")
									 }
								 }}>
								{userRes?.isFriend ? "unfriend" : "friend"}
                            </div>
                            <div className="back-btn"
                                 style={userRes?.isOnline && !userRes.isBlocked ? btnStyle : btnStyleGrey as CSSProperties}
                                 onClick={() => {
									 if (!userRes?.isBlocked) {
										 userRes?.isOnline
											 ?
											 handleInvite()
											 :
											 props.showAlert("User is offline")
									 } else {
										 props.showAlert("User is blocked")
									 }
								 }}>
                                play
                            </div>
                            <div className="back-btn" style={btnStyle as CSSProperties}
                                 onClick={() => {
									 handleUserBlock(userRes)
									 props.parentProps.setOnChatDetails(undefined)
									 props.parentProps.setOnChatId(0)
								 }}>
								{userRes?.isBlocked ? "unblock" : "block"}
                            </div>
                        </div>
					}
                </>
			}
			{!userRes.isBlocked && underNameLabelText() !== "blocked you"
				&&
				<div style={{display:"flex",height:220}}>
					<div className="info-content-user-wins-loses" style={infoContentWinsLosesBoxStyle as CSSProperties}>
						<div className="user-menu-stats-wins-loses" style={userMenuStatsWinsLosesStyle as CSSProperties}>
							<div className="wins-box" style={winsLosesBox as CSSProperties}>
								<div className="wins-box-description" style={winsLosesDescription}>
									wins
								</div>
								<div className="wins-box-value" style={{color: colors.GREEN, fontWeight: "bold"}}>
									{userRes?.wines}
								</div>
							</div>
							<div className="loses-box" style={winsLosesBox as CSSProperties}>

								<div className="loses-box-description" style={winsLosesDescription}>
									loses
								</div>
								<div className="loses-box-value" style={{color: colors.RED, fontWeight: "bold"}}>
									{userRes?.loses}
								</div>
							</div>
						</div>
					</div>
					<div className="info-content-user-wins-loses" style={infoContentWinsLosesBoxStyle as CSSProperties}>
						<UserMenuGameHistory mainProps={props.parentProps.mainProps} userId={props.parentProps.onChatDetails as number} matchHistory={history}/>
					</div>
                </div>
			}
		</div>
	)
}