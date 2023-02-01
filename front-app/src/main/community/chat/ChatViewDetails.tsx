import React, {CSSProperties, Dispatch, SetStateAction, useEffect} from "react";
import "./ChatView.css"
import {colors, SERVER_URL} from "../../../constants";
import ChatWithMessages from "../../../models/ChatWithMessages";
import {CommunityProps} from "../Community";
import "./ChatViewDetails.css"
import ChatViewDetailsUser from "./ChatViewDetailsUser";
import ChatViewDetailsChannel from "./ChatViewDetailsChannel";
import {type} from "@testing-library/user-event/dist/type";
import GameObject from "../../../models/GameObject";

export interface ChatDetailsProps {
		parentProps : CommunityProps,
		rightChatStyle : any,
		rightChatStyleWidth : number,
		showAlert : Dispatch<SetStateAction<string>>
}

export default function ChatViewDetails(props: ChatDetailsProps) {
	useEffect(()=>{
		if(typeof props.parentProps.onChatDetails !== "number")
			return
		fetch(SERVER_URL + "all/games/"+props.parentProps.onChatDetails, {
			headers: {
				'Accept': 'application/json',
				Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
			}
		}).then(r => {
			if (r.ok) {
				r.json().then((games: GameObject[]) => {
						// console.log(games)
						let map = new Map<number,GameObject>()
						games.forEach((game)=>{
							map.set(game.id,game)
						})
					let user = props.parentProps.mainProps.mainProps.users.find((u)=>u.id===props.parentProps.onChatDetails)
					if(user){
						user.games = map
						props.parentProps.mainProps.mainProps.setUsers([...props.parentProps.mainProps.mainProps.users])
					}
				})
			}
		})
	},[])
	const handleLeaveChat = (chat: ChatWithMessages | null) => {
		if (!chat) {
			return
		}
		const requestOptions = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
			},
			body: JSON.stringify({
				chatId: chat.chat.id,
			})
		};
		console.log("fetch PUT /leave/chat")
		fetch(SERVER_URL + "leave/chat", requestOptions).then((r) => {
			if (r.ok) {
				props.parentProps.mainProps.mainProps.webSocket?.emit('chat:requestUpdate:participants', {chatId: chat.chat.id})
				props.parentProps.setOnChatDetails(undefined)
				props.parentProps.chatList.removeChat(chat.chat.id)
				props.parentProps.setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true )
				props.parentProps.setOnChatId(0)
			} else if(r.status === 403){
				r.json().then( (data : {message: string})=>{
						props.showAlert(data.message)
					})
			}
		})
	}
	const btnBoxStyle = {
		width: props.rightChatStyleWidth,
		height: 40,
		alignItems: "center",
		justifyContent: "left",
		display: "flex"
	}
	const btnBoxStyleInfo = {
		height: 50,
		alignItems: "center",
		display: "flex",
		justifyContent: "center",
		position: "relative",
		borderRadius:10,
	}
	const chatInfoBackBtnStyle = {
		padding: "0px 30px 0px 30px",
		height: 50,
		position: "absolute",
		left: 0,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
		fontSize: 15,
		color: colors.TEXT_COLOR_DEFAULT,
	}
	const btnStyleRedAbsolute: CSSProperties = {
		padding: "0px 30px 0px 30px",
		position: "absolute",
		right: 0,
		width: "auto",
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
		fontSize: 15,
		color: colors.RED,
	}
	const navTextStyle = {
		padding: "3px 5px 0px 5px",
		height: btnBoxStyle.height,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
		fontSize: 15,
		color: colors.TEXT_COLOR_DEFAULT,
	}
	// console.log("ChatViewDetails()")
	return (
		<>
			<div className="chat-window" style={props.rightChatStyle as CSSProperties} onClick={() => {
				props.parentProps.setOnSearch(null)
			}}>
				<div className="nav-button-box" style={btnBoxStyleInfo as CSSProperties}>
					<div className="back-btn" style={chatInfoBackBtnStyle as CSSProperties}
						 onClick={() => window.history.back()}>
						back
					</div>
					<div className="chat-details-nav-text" style={navTextStyle as CSSProperties}>
						Info
					</div>
					{
						(props.parentProps.onChatDetails instanceof ChatWithMessages && !props.parentProps.onChatDetails.chat.chat)
						&&
                        <div className="back-btn" style={btnStyleRedAbsolute as CSSProperties} onClick={() => {
							// @ts-ignore
							// console.log("======================================================\nChatView(): leave chat CLICK: " + props.parentProps.onChatDetails.chat.name)
							handleLeaveChat(props.parentProps.onChatDetails)
						}}>
                            leave channel
                        </div>
					}
				</div>
				{(props.parentProps.onChatDetails && typeof props.parentProps.onChatDetails !== "number" && !props.parentProps.onChatDetails.chat.chat)
					&&
                    <ChatViewDetailsChannel {...props}/>
				}
				{(props.parentProps.onChatDetails && typeof props.parentProps.onChatDetails === "number")
					&&
                    <ChatViewDetailsUser {...props}/>
				}
			</div>
		</>
	)
}