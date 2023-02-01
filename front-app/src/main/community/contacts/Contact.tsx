import React, {CSSProperties, useEffect, useState} from "react";
import "./Contact.css"
import ChatWithMessages from "../../../models/ChatWithMessages";
import {CommunityProps} from "../Community";
import User from "../../../models/User";
import {colors} from "../../../constants";

interface ContactProps {
        parentProps : CommunityProps,
        contactsViewStyle: {
            display: string;
            flexDirection: string;
            alignSelf: string;
            width: number;
            height: any;
            position: string;
            color: string;
            justifyContent: string;
            alignItems: string;
        };
        isHighlighted : boolean
        isForChannelDetails : boolean
        participants : Set<number>| null
        chat: ChatWithMessages | null
        user: User | null
}

export default function Contact(props: ContactProps) {
    const [isHighlighted, setIsHighlighted] = useState<boolean>(props.isHighlighted)
    useEffect(()=>{
        return () => {
            if((props.isForChannelDetails && props.chat && props.chat.chat.id !== props.parentProps.mainProps.mainProps.userId))
                setIsHighlighted(false)
        }
    },[props.chat, props.isForChannelDetails, props.parentProps.chatListUpdate, props.parentProps.mainProps.mainProps.userId,props.parentProps.onChatId, props.user])
    const contactBoxStyleHighlighted = {
        margin: "3px 3px 0px 3px",
        // border: "solid 1px #333",
        backgroundColor: colors.BG_COLOR_30,
        borderRadius:10,
        width: props.contactsViewStyle.width - 15,
        position: "relative",
        display: "flex",
    }
    const contactBoxStyleNormal = {
        margin: "3px 3px 0px 3px",
        // border: "solid 1px #222",
        // backgroundColor: BG_COLOR_222,
        borderRadius:10,
        width: props.contactsViewStyle.width - 15,
        position: "relative",
        display: "flex",
    }
    let contactBoxStyle = ((isHighlighted && props.isForChannelDetails) || props.parentProps.onChatId === props.chat?.chat.id) ? contactBoxStyleHighlighted : contactBoxStyleNormal
    const contactLogoStyleFriend = {
        objectFit:"cover",
        margin: 10,
        height: "50px",
        width: "50px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        border: "solid 3px #4a8"
    }
    const contactLogoStyle = {
        objectFit:"cover",
        padding: 3,
        margin: "10px",
        height: "50px",
        width: "50px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
    }
    const unreadMsgCounterStyle = {
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bottom : 0,
        right : "5px",
        margin: "10px",
        height: "25px",
        width: "25px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        border: "solid 2px #444"
    }
    const counterTextStyle = {
        fontSize: 12,
        color: colors.BG_COLOR_333
    }
    const contactNameStyle = {
        paddingLeft : "10px",
        color: colors.TEXT_COLOR_DEFAULT,
        fontSize: "16px",
        marginTop : "7px",
        fontWeight:"bolder"
    }
    const userMenuAvatarOnlineStyle = {
        height: 10,
        padding: 2,
        width: 10,
        backgroundColor: "#2f3",
        position: "absolute",
        borderRadius: "50%",
        bottom:8,
        right:8,
        border: "solid 2px #222"
    }
    const userMenuRelativeBoxStyle = {
        position : 'relative',
        display:"flex",alignItems:"center", flexDirection:"column",
    }
    if(props.user) {
        return (
                <div className="contact-box" style={contactBoxStyle as CSSProperties} onClick={() => {
                    if((props.user &&  props.user.id !== props.parentProps.mainProps.mainProps.userId) && props.isForChannelDetails) {
                        if(!isHighlighted) {
                            props.participants?.add(props.user.id)
                            setIsHighlighted(true)
                        } else {
                            props.participants?.delete(props.user.id)
                            setIsHighlighted(false)
                        }
                        console.log("======================================================\nContact(): contact CLICK: " + props.user.name)
                    } else if(props.user && !props.isForChannelDetails) {
                        props.parentProps.setOnChatId(0)
                        props.parentProps.setOnChatDetails(props.user.id)
                    }
                }}>
                    <div className="user-menu-avatar-box" style={userMenuRelativeBoxStyle as CSSProperties}>
                        <img
                            src={props.parentProps.mainProps.mainProps.userAvatarUrl[0]+props.user.id+props.parentProps.mainProps.mainProps.userAvatarUrl[1]}
                            className="contact-logo"
                            alt="user avatar"
                            // @ts-ignore
                            style={((props.parentProps.mainProps.mainProps.users.find((user) => user.id === props.user.id)?.isFriend))
                                ?
                                contactLogoStyleFriend as CSSProperties
                                :
                                contactLogoStyle as CSSProperties
                            }
                        />
                    </div>
                        <div className="contact-name" style={contactNameStyle}>
                            {props.user.name}
                        </div>
                </div>
        );
    } else if(props.chat && props.chat.chat) {
        const userIdSecondPart = (props.chat.chat.participants[0] === props.parentProps.mainProps.mainProps.userId )? props.chat.chat.participants[1] : props.chat.chat.participants[0]
        const user = props.parentProps.mainProps.mainProps.users.find((user)=>user.id === userIdSecondPart)
        return (
                    <div className="contact-box" style={ contactBoxStyle as CSSProperties} onClick={() => {
                        if(!props.chat)
                            return
                        setIsHighlighted(true)
                        props.parentProps.setOnNewGroup(0)
                        props.parentProps.setOnChatDetails(undefined)
                        props.parentProps.setOnChatId(props.chat.chat.id)
                        props.parentProps.chatList.getChat(props.chat.chat.id).unreadMessagesCount = 0
                        props.parentProps.setChatListUpdate(!props.parentProps.chatListUpdate)
                        console.log("======================================================\nContact(): onChatId"+ props.parentProps.onChatId +" contact CLICK: "+props.chat.chat.id+" msg count: "+props.chat.messages.length)
                    }}>
                    {
                        props.chat.chat.chat && userIdSecondPart && user &&
                        <div className="user-menu-avatar-box" style={userMenuRelativeBoxStyle as CSSProperties}>
                            <img
                                alt="chat avatar"
                                src={props.parentProps.mainProps.mainProps.userAvatarUrl[0] + userIdSecondPart + props.parentProps.mainProps.mainProps.userAvatarUrl[1]}
                                className="contact-logo"
                                style={props.chat.chat.chat && props.parentProps.mainProps.mainProps.users.find((user) => user.id === userIdSecondPart)?.isFriend
                                    ?
                                    contactLogoStyleFriend as CSSProperties
                                    :
                                    contactLogoStyle as CSSProperties}
                            />
                            {props.chat.chat.chat && props.parentProps.mainProps.mainProps.users.find((user) => user.id === userIdSecondPart)?.isOnline
                                &&
                                <div style={userMenuAvatarOnlineStyle as CSSProperties}/>
                            }
                        </div>
                    }
                    {
                        !props.chat.chat.chat && userIdSecondPart && user &&
                        <div className="user-menu-avatar-box" style={userMenuRelativeBoxStyle as CSSProperties}>
                            <img
                                alt="channel avatar"
                                src={props.parentProps.mainProps.mainProps.userAvatarUrl[0]+"group"}
                                className="contact-logo"
                                style={props.chat.chat.chat && props.parentProps.mainProps.mainProps.users.find((user) => user.id === userIdSecondPart)?.isFriend
                                    ?
                                    contactLogoStyleFriend as CSSProperties
                                    :
                                    contactLogoStyle as CSSProperties}
                            />
                            {props.chat.chat.chat && props.parentProps.mainProps.mainProps.users.find((user) => user.id === userIdSecondPart)?.isOnline
                                &&
                                <div style={userMenuAvatarOnlineStyle as CSSProperties}/>
                            }
                        </div>
                    }
                    {
                        !props.chat.chat.chat && !userIdSecondPart &&
                        <div className="user-menu-avatar-box" style={userMenuRelativeBoxStyle as CSSProperties}>
                            <img
                                alt="channel avatar"
                                src={props.parentProps.mainProps.mainProps.userAvatarUrl[0]+"group"}
                                className="contact-logo"
                                style={props.chat.chat.chat && props.parentProps.mainProps.mainProps.users.find((user) => user.id === userIdSecondPart)?.isFriend
                                    ?
                                    contactLogoStyleFriend as CSSProperties
                                    :
                                    contactLogoStyle as CSSProperties}
                            />
                        </div>
                    }
                    <div className="contact-name" style={contactNameStyle}>

                        {props.chat.chat.chat && userIdSecondPart && user
                            ?
                                user.name
                            :
                                props.chat.chat.name
                        }
                    </div>
                        {
                        props.chat.unreadMessagesCount
                        ?
                            <div>
                                <div className="unread-msg-counter" style={unreadMsgCounterStyle as CSSProperties}>
                                    <div className="counter-text" style={counterTextStyle as CSSProperties}>
                                        {props.chat.unreadMessagesCount}
                                    </div>
                                </div>
                            </div>
                        :
                            <></>
                        }
            </div>
        );
    } else {
        return (<>impossible</>)
    }
}
