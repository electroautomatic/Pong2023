import React, {CSSProperties, Dispatch, SetStateAction, useEffect, useState} from "react";
import Contact from "./Contact"
import "./Contact.css"
import SearchBar from "./SearchBar"
import ChatWithMessages from "../../../models/ChatWithMessages";
import {CommunityProps, OnNewGroupEnum} from "../Community";
import {MainProps} from "../../Main";
import SearchList from "../../../models/SearchList";
import ChatList from "../../../models/ChatList";
import {colors} from "../../../constants";

export type ContactsViewProps = {
        mainProps : MainProps,
        page: {
            position: string;
            display: string;
            width: number;
            height: number;
        };
        chatList: ChatList;
        searchList: SearchList;
        onNewGroup: OnNewGroupEnum;
        setOnNewGroup: Dispatch<SetStateAction<OnNewGroupEnum>>
        onSearch: string | null;
        onChatId : number,
        setOnChatId : Dispatch<SetStateAction<number>>,
        setOnSearch: Dispatch<SetStateAction<string | null>>,
        newMessageBadge : number,
        setNewMessageBadge : Dispatch<SetStateAction<number>>
}

export default function ContactsView(props: CommunityProps) {
    useEffect(()=>{
    },[props.chatListUpdate])
    const contactsViewStyle = {
        marginTop:5,
        marginRight:5,
        display: "flex",
        backgroundColor: colors.BG_COLOR_24,
        borderRadius: 10,
        flexDirection: "column",
        alignSelf: "start",
        width: props.page.width/4,
        height: props.page.height -5,
        position: "relative",
        color: colors.TEXT_COLOR_DEFAULT,
        justifyContent: "center",
        alignItems: "center",
    }
    const contactsSearchBarProps = {
        contactsViewProps : props,
        display: "flex",
        width: contactsViewStyle.width,
        height: 45,
        alignItems: "center",
        position: "relative",
        borderRadius:10
    }
    const contactsWindowStyle = {
        marginTop: 10,
        margin: 5,
        display: "flex",
        flexDirection: "column",
        alignSelf: "start",
        width: contactsViewStyle,
        position: "relative",
        height: contactsViewStyle.height - contactsSearchBarProps.height -10,
        color: colors.TEXT_COLOR_DEFAULT,
        overflowY: 'scroll',
    }
    const contactLineStyle = {
        width : contactsViewStyle.width,
        height : 3,
        backgroundColor : colors.BG_COLOR_26,
    }
    let contacts: JSX.Element[] = []
    if(props.onSearch) {
        if (props.chatList.getSearchList().length()) {
            props.chatList.getSearchList().chats.forEach((chat) => {
                if(chat.chat.participants.length) {
                    const contactProps = {
                        parentProps: props,
                        contactsViewStyle: contactsViewStyle,
                        chat: chat,
                        user: null,
                        participants: null,
                        isHighlighted: false,
                        isForChannelDetails: false
                    }
                    contacts.push(<Contact {...contactProps} key={chat.chat.id}/>);
                }
            })
            props.chatList.getSearchList().users.forEach((user) => {
                const contactProps = {
                    parentProps: props,
                    contactsViewStyle: contactsViewStyle,
                    chat: null,
                    user: user,
                    participants: null,
                    isHighlighted : false,
                    isForChannelDetails : false
                }
                contacts.push(<Contact {...contactProps} key={user.id}/>);
            })
        }
    } else {
        if (props.chatList !== undefined && props.chatList.length()) {
            props.chatList.getList().forEach((chat) => {
                const contactProps = {
                    parentProps: props,
                    contactsViewStyle: contactsViewStyle,
                    chat: chat,
                    user: null,
                    participants: null,
                    isHighlighted : props.onChatId === chat.chat.id,
                    isForChannelDetails : false
                }
                let userIdSecondPart : number
                if(chat.chat.chat) {
                    userIdSecondPart = ((chat.chat.participants[0] === props.mainProps.mainProps.userId)) ? chat.chat.participants[1] : chat.chat.participants[0]
                    if(!(userIdSecondPart && props.mainProps.mainProps.users.find((user)=>user.id === userIdSecondPart)?.isBlocked))
                        contacts.push(<Contact {...contactProps} key={chat.chat.id}/>);
                } else {
                    contacts.push(<Contact {...contactProps} key={chat.chat.id}/>);
                }
            })
        }
    }
    // console.log("ContactsView()")
    return (
        <div className="contacts-view" style={contactsViewStyle as CSSProperties}>
            <SearchBar {...contactsSearchBarProps}/>
            {/*<div className="contact-line" style={contactLineStyle}/>*/}
            { props.onSearch === "" ?
                <div className="contacts-window" style={contactsWindowStyle as unknown as CSSProperties}>
                </div>
                :
                <div className="contacts-window" style={contactsWindowStyle as unknown as CSSProperties}>
                    {contacts}
                </div>
            }
        </div>
    );
}
