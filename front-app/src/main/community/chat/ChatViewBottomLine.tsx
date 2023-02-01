import React, {useEffect, useRef, useState} from "react";
import "./ChatView.css"
import {ChatViewProps} from "./ChatView";
import {colors, SERVER_URL} from "../../../constants";
import ChatWithMessages from "../../../models/ChatWithMessages";
import "./ChatViewBottomLine.css"

enum PassStates {
    joinBtn,
    pwdInput,
    pwdIncorrect
}

export default function ChatViewBottomLine(props: ChatViewProps) {
    const [chat,setChat] = useState<ChatWithMessages | undefined>()
    useEffect(()=>{
        if(inputLine.current) {
            // @ts-ignore
            inputLine.current.focus()
        }
        if(!props.parentProps.onChatId)
            return;
        setChat((chat) => (props.parentProps.chatList.getChat(props.parentProps.onChatId)))
    },[props.parentProps.chatListUpdate, props.parentProps.onChatId])
    // console.log("ChatViewBottomLine()")
    const passBoxStyleNormal = {
        display:"flex",
        alignItems:"center",
        border: "solid 1px #333",
        width: "auto",
        borderRadius:10,
        justifyContent:"center"
    }
    const passBoxStyleRed = {
        display:"flex",
        alignItems:"center",
        border: "solid 1px #c53",
        width: "auto",
        borderRadius:10,
        justifyContent:"center"
    }
    let passBoxStyle = passBoxStyleNormal
    const [joinState,setJoinState] = useState<PassStates>(PassStates.joinBtn)
    useEffect(() => {
      return () => {
      }
    },[joinState])
    const inputLine = useRef(null)
    const passLine = useRef(null)
    const handlePassJoinGroup   = () => {
        setJoinState(PassStates.pwdInput)
    }
    const handleJoinGroup   = () => {
        // @ts-ignore
        if(chat?.chat.id && joinState === PassStates.pwdInput && (!passLine || !passLine.current || passLine.current.value === "")) {
            setJoinState(PassStates.pwdIncorrect)
            return
        }
        // @ts-ignore
        if(!chat) {
            return
        }
        console.log("======================================================\nChatView(): join chat CLICK: "+ chat?.chat.name)
        fetch(SERVER_URL+"chat/join/",{
            method : "POST",
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + props.parentProps.mainProps.appProps.token
            },
            body: JSON.stringify({
                chatId : props.parentProps.onChatId,
                // @ts-ignore
                password: chat?.chat.requestPass ?  passLine.current.value : ""
            })
        }).then(r => {
            if (r.ok && props.parentProps.onChatId) {
                props.parentProps.mainProps.mainProps.webSocket?.emit('chat:requestUpdate:participants', {chatId: props.parentProps.onChatId})
            } else if(r.status === 401){
                setJoinState(PassStates.pwdIncorrect)
            }
        })
    }
    const sendMessage = () => {
        // @ts-ignore
        console.log("======================================================\nChatView(): send msg CLICK: "+ inputLine.current.value + " chatList.len: "+props.parentProps.chatList.length())
        // @ts-ignore
        if (inputLine.current.value !== "" && props.parentProps.mainProps.mainProps.webSocket) {
            // @ts-ignore
            const x = inputLine.current.value;
            props.parentProps.mainProps.mainProps.webSocket.emit('message', {data: x })
            // console.log(props);
            props.parentProps.mainProps.mainProps.webSocket.emit('message:post',  {userId : props.parentProps.mainProps.mainProps.userId ,userName: props.parentProps.mainProps.mainProps.userName, text: x , ChatId: props.parentProps.onChatId})
            console.log('message to ' + chat?.chat.name +' sent');
            // @ts-ignore
            inputLine.current.value = ""
        }
    }
    const handleKeyPress    = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage()
        }
    };
    const handleKeyPressPass    = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleJoinGroup()
        }
    };
    if(joinState === PassStates.pwdIncorrect){
        passBoxStyle = passBoxStyleRed
    }
    // console.log("ChatViewBottomLine()")
    const inputBoxStyle = {
        backgroundColor: colors.BG_COLOR_24,
        // borderRadius:10,
        alignItems: "center",
        justifyContent: "center",
        display: "flex"
    }
    const inputMsgStyle = {
        margin:5,
        backgroundColor : colors.BG_COLOR_DEFAULT,
        color : colors.TEXT_COLOR_DEFAULT,
        borderRadius: 10,
        outline: "none",
        border: "none",
        width: "100%",
        height: 40,
        padding: "0px 15px",
    }
    const sendBtnStyle = {
        borderRadius:10,
        padding: "0px 25px 0px 25px",
        marginRight: 5,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 14,
        color: colors.TEXT_COLOR_DEFAULT,
    }
    const joinBtnStyle = {
        padding: "5px 40px 5px 40px",
        borderRadius:10,
        height: 35,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        color: colors.TEXT_COLOR_DEFAULT,
    }
    const passInputStyle = {
        width: 400,
        border: "none",
        outline: "none",
        backgroundColor : colors.BG_COLOR_DEFAULT,
        borderRadius:10,
        fontSize: "16px",
        color: colors.TEXT_COLOR_DEFAULT,
        padding: "5px 5px 5px 5px",
    }
    if(chat && props.parentProps.chatList.isInList(chat.chat.id)) {
        return (
            !chat?.chat.muteList.find((id) => id === props.parentProps.mainProps.mainProps.userId) ?
                <div style={inputBoxStyle}>
                <input
                    autoFocus
                    ref={inputLine}
                    type="text"
                    className="input-msg"
                    placeholder="message"
                    style={inputMsgStyle}
                    onKeyPress={(e) => handleKeyPress(e)}
                />
                <div className="send-btn" style={sendBtnStyle} onClick={sendMessage}>
                    send
                </div>
            </div>
                :
                <div className="mute-msg" style={sendBtnStyle} onClick={sendMessage}>
                    you are muted
                </div>

        )
    } else {
        if(!chat?.chat.requestPass) {
            return (
                <div className="send-btn" style={joinBtnStyle} onClick={handleJoinGroup}>
                    join group
                </div>
            )
        } else {
            return (
                <>
                    {
                        joinState === PassStates.joinBtn
                            ?
                                <div className="send-btn" style={joinBtnStyle} onClick={handlePassJoinGroup}>
                                    join group
                                </div>
                            :
                            <div style={{display:"flex",justifyContent:"center",margin:5}}>
                                <div className="send-btn" style={sendBtnStyle} onClick={() => setJoinState(PassStates.joinBtn)}>
                                    back
                                </div>
                                <div className="pass-box" style={passBoxStyle}>
                                    <input
                                        autoFocus
                                        ref={passLine}
                                        type="password"
                                        className="input-new-group"
                                        placeholder="password"
                                        style={passInputStyle}
                                        onChange={()=>setJoinState(PassStates.pwdInput)}
                                        onKeyPress={(e) => {
                                            handleKeyPressPass(e)
                                        }}
                                    />
                                    <div style={{margin:"0px 10px 0px 0px"}} onClick={()=>{
                                        // @ts-ignore
                                        passLine.current.type === "text" ? passLine.current.type = "password" : passLine.current.type = "text"}
                                    }>👀</div>
                                </div>
                                <div className="send-btn" style={sendBtnStyle} onClick={handleJoinGroup}>
                                send
                                </div>
                            </div>
                    }
                </>
            )
        }

    }
}