import React, {
    CSSProperties, Dispatch, SetStateAction,
    useLayoutEffect,
    useState
} from "react";
import MessageLeft from "./MessageLeft"
import MessageRight from "./MessageRight"
import "./ChatView.css"
import {CommunityProps} from "../Community";
import ChatViewDetails from "./ChatViewDetails";
import ChatViewBottomLine from "./ChatViewBottomLine";
import {colors} from "../../../constants";

export interface ChatViewProps {
        parentProps : CommunityProps,
        showAlert : Dispatch<SetStateAction<string>>
}

export default function ChatView(props: CommunityProps) {
    const rightChatStyle = {
        marginTop:5,
        backgroundColor: colors.BG_COLOR_222,
        width: window.innerWidth / 4 * 3 - 5,
        display: "flex",
        flexDirection: "column",
        height: props.page.height - 5,
        alignSelf: "top",
        fontWeight: "bolder",
        borderRadius: 10
    }
    const getMessages = () => {
        let messages: JSX.Element[] = []
        props.chatList.getChat(props.onChatId).messages.forEach((msg) => {
            const user = props.mainProps.mainProps.users.find((user) => user.id === msg.userId)
            let userName = user ? user.name : "default"
            if (!user) {
                console.log("ChatView(): message view generation: user name with ID:" + msg.userId + " not found | user:" + user)
            }
            const msgProps = {
                parentProps: props,
                userName: userName,
                userId: msg.userId,
                rightChatStyle: rightChatStyle,
                text: msg.text,
                key: msg.id
            }
            if (msg.userId !== props.mainProps.mainProps.userId) {
                messages.unshift(<MessageLeft {...msgProps} key={msg.id}/>);
            } else {
                messages.unshift(<MessageRight {...msgProps} key={msg.id}/>);
            }
        })
        return messages
    }
    // console.log("ChatView()")
    const chatMessagesViewStyle = {
        width: rightChatStyle.width,
        display: "flex",
        height: props.page.height,
        alignSelf: "end",
        overflowY: 'scroll',
        flexDirection: "column-reverse"
    }
    const btnBoxStyle = {
        borderRadius:10,
        height: 50,
        alignItems: "center",
        justifyContent: "left",
        display: "flex"
    }
    const navTextStyle = {
        padding: "3px 5px 0px 5px",
        height: btnBoxStyle.height,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 16,
        color: colors.TEXT_COLOR_DEFAULT,
    }
    const contactLogoStyleFriend = {
        objectFit:"cover",
        margin: "10px",
        height: "40px",
        width: "40px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        border: "solid 2px #4a8"
    }
    const contactLogoStyle = {
        objectFit:"cover",
        margin: "10px",
        height: "40px",
        width: "40px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        padding: 2,
    }
    const navInfoBoxStyle = {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }
    const chatDetailsProps = {
        parentProps: props,
        rightChatStyleWidth : rightChatStyle.width,
        rightChatStyle : rightChatStyle,
        showAlert : props.showAlert
    }
    const chatViewBottomLineProps = {
        parentProps : props,
        showAlert : props.showAlert
    }
    if(props.onChatDetails) {
        return(
            <ChatViewDetails {...chatDetailsProps}/>
        );
    } else {
        const chat = props.chatList.getChat(props.onChatId)
        let userIdSecondPart : number
        if(chat) {
            userIdSecondPart = chat.chat.participants[0] === props.mainProps.mainProps.userId ? chat.chat.participants[1] : chat.chat.participants[0]
        } else {
            props.showAlert("ChatView() chat not found")
            return <></>
        }
        return (
            <div className="chat-window" style={rightChatStyle as CSSProperties } onClick={() => {
                props.setOnSearch(null)
            }}>
                <div className="nav-box-focus" style={btnBoxStyle} onClick={() => {
                    if(props.chatList.isInList(chat.chat.id)) {
                        if(chat.chat.chat) {
                            props.setOnChatDetails(userIdSecondPart)
                            props.setOnChatId(0)
                        } else if(!chat.chat.chat) {
                            props.setOnChatDetails(chat)
                            props.setOnChatId(0)
                        }
                    }
                }}>
                    <div className="nav-box" style={navInfoBoxStyle as CSSProperties}>
                        {chat.chat.chat && userIdSecondPart &&
                            <img
                                alt="user/chat avatar"
                                src={props.mainProps.mainProps.userAvatarUrl[0] + userIdSecondPart + props.mainProps.mainProps.userAvatarUrl[1]}
                                className="contact-logo"
                                style={props.mainProps.mainProps.users.find((user) => user.id === userIdSecondPart)?.isFriend
                                    ?
                                    contactLogoStyleFriend as CSSProperties
                                    :
                                    contactLogoStyle as CSSProperties}
                            />

                        }
                        {!chat.chat.chat &&
                            <img
                                alt="user/chat avatar"
                                src={props.mainProps.mainProps.userAvatarUrl[0] + "group"}
                                className="contact-logo"
                                style={contactLogoStyle as CSSProperties}
                            />

                        }
                        <div className="nav-text" style={navTextStyle}>
                            {
                                (chat.chat.chat && userIdSecondPart)
                                    ?
                                        props.mainProps.mainProps.users.find((user)=> user.id===userIdSecondPart)?.name
                                    :
                                        chat.chat.name
                            }
                        </div>
                    </div>
                </div>
                <div className="chat-msg-window" style={chatMessagesViewStyle as CSSProperties}>
                    {chat.chat.requestPass && !props.chatList.isInList(props.onChatId) ? "" : getMessages()}
                </div>
                <div style={{width:rightChatStyle.width-5}}>
                    <ChatViewBottomLine {...chatViewBottomLineProps}/>
                </div>
            </div>  
        );
    }
}