import React, {CSSProperties, Dispatch, SetStateAction, useEffect, useLayoutEffect, useState} from "react";
import ContactsView from "./contacts/ContactsView"
import ChatView from "./chat/ChatView"
import {colors, SERVER_URL} from "../../constants";
import NewGroup from "./chat/NewGroup";
import {MainProps} from "../Main";
import Chat from "../../models/Chat";
import Message from "../../models/Message";
import ChatWithMessages from "../../models/ChatWithMessages";
import SearchList from "../../models/SearchList";
import User from "../../models/User";
import {appStates} from "../../App";
import ChatList from "../../models/ChatList";
import HistoryState from "../../models/HistoryState";

export enum OnNewGroupEnum {
    firstOccurrence,
    newGroupPageLoad,
    groupCreated,
    default,
}

export interface CommunityProps {
        mainProps : MainProps,
        page: {
            position: string;
            display: string;
            width: number;
            height: number;
        };
        divideLineStyle: {
            width: number;
            height: number;
            backgroundColor: string;
       };
        onChatId            : number,
        setOnChatId         : Dispatch<SetStateAction<number>>,
        onNewGroup          : OnNewGroupEnum;
        setOnNewGroup       : Dispatch<SetStateAction<OnNewGroupEnum>>
        chatListUpdate      : boolean
        setChatListUpdate   : Dispatch<SetStateAction<boolean>>
        chatList            : ChatList,
        searchList          : SearchList,
        setChatList         : Dispatch<SetStateAction<ChatList>>,
        onSearch            : string | null,
        setOnSearch         : Dispatch<SetStateAction<string | null>>,
        newMessageBadge     : number,
        setNewMessageBadge  : Dispatch<SetStateAction<number>>,
        onChatDetails       : ChatWithMessages | number | undefined,
        setOnChatDetails    : Dispatch<SetStateAction<ChatWithMessages | number | undefined>>,
        showAlert           : Dispatch<SetStateAction<string>>
}

export default function Community(props: MainProps) {
    /*
    * useState block
    * */

    const [searchList, setSearchList]           = useState<SearchList>(new SearchList(""));
    const [chatList, setChatList]               = useState<ChatList>(new ChatList(searchList));
    const [onChatId, setOnChatId]               = useState<number>(0);
    const [onSearch, setOnSearch]               = useState<string | null>(null);
    const [chatListUpdate, setChatListUpdate]   = useState(false)
    const [onChatDetails, setOnChatDetails]     = useState<ChatWithMessages | number | undefined>(undefined);
    const [onNewGroup, setOnNewGroup]           = useState<OnNewGroupEnum>(OnNewGroupEnum.firstOccurrence);
    const [newMessageBadge, setNewMessageBadge] = useState<number>(0);
    chatList.loadOnChatId(onChatId)

    /*
    * useEffect block
    * */

    useLayoutEffect(() => {
        const handleNewMessage  = (msg : Message) => {
            if(msg.ChatId) {
                console.log("=========================================\nChatView(): handle newMessage: msg: " + msg.text + " chatList.len: "+ chatList.length())
                chatList.addMessage(msg)
                if (onChatId !== msg.ChatId) {
                    let chatTmp = chatList.getChat(msg.ChatId)
                    chatTmp.unreadMessagesCount++
                    setNewMessageBadge(chatTmp.unreadMessagesCount)
                }
                // setNewMessage(msg)
                chatList.getList().sort()
                setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true )
            }
        }
        console.log("   ChatView(): useEffect for chatList update")
        if(!props.mainProps.webSocket)
            return
        props.mainProps.webSocket?.on('message:post', (data : Message) => {
            console.log('message received');
            console.log(data);
            handleNewMessage(data);

        })
        return () => {
            if(props.mainProps.webSocket) {
                props.mainProps.webSocket.off('message:post');
            }
        };
    }, [chatListUpdate, props.mainProps.webSocket]); // new message

    useLayoutEffect(()=>{
        const addHistory = () => {
            let state = window.history.state
            if ( (state.onNewGroup === onNewGroup)
                &&
                (state.onChatDetails === onChatDetails || (onChatDetails instanceof ChatWithMessages && state.onChatDetails?.chat?.id === onChatDetails.chat.id))
                &&
                (state.onChatId === onChatId)) {
                return
            }
            // console.log("§+++++++++++++++\\/+++++++++++++++")
            // console.log("§          Community(): add history:")
            // console.log("§          onNewGroup: "+ onNewGroup)
            // // @ts-ignore
            // console.log("§          onChatDetails: ",onChatDetails?.chat?.id,onChatDetails)
            // console.log("§          onChatId: "+ onChatId)
            // // console.log("§          ",props.mainProps.users)
            // console.log("§+++++++++++++++/\\+++++++++++++++")
            console.log("push history community")
            window.history.pushState({
                appState: appStates.onCommunity,
                onNewGroup : onNewGroup,
                onChatDetails : onChatDetails,
                onChatId : onChatId,
            }, "");
        }
        addHistory()
    },[onChatDetails, onChatId,onNewGroup]) // add history
    useLayoutEffect(()=>{
        const popHistory = (state : HistoryState) => {
            console.log("poping history community")
            // console.log("§---------------\\/---------------")
            // console.log("§          Community(): popEvent:")
            // console.log("§          onNewGroup: ",state.onNewGroup)
            // console.log("§          onChatDetails: ",state.onChatDetails)
            // console.log("§          onChatId: ",state.onChatId)
            // console.log("§---------------/\\---------------")
            setOnChatDetails(state.onChatDetails)
            setOnChatId(state.onChatId)
            setOnNewGroup(state.onNewGroup)
            if(state.appState === appStates.onCommunity){
                setOnNewGroup(state.onNewGroup)
                let check = state.onChatDetails
                if(check) {
                    // @ts-ignore
                    if (check && check.chat) {
                        // @ts-ignore
                        let checkChatId = check.chat.id
                        if (chatList.isInList(checkChatId)) {
                            // @ts-ignore
                            let tmp : ChatWithMessages = check
                            let res = new ChatWithMessages(tmp.chat,tmp.chat.id,tmp.messages)
                            setOnChatDetails(res)
                            // console.log("onChatDetails", tmp)
                            setOnChatId(0)
                        } else {
                            props.showAlert("Chat is not found")
                            window.history.back()
                        }
                    } else if (check && check > 0) {
                        if (props.mainProps.users.find((user) => user.id === check)) {
                            setOnChatDetails(check)
                            setOnChatId(0)
                        } else {
                            props.showAlert("User is not found")
                            window.history.back()
                        }
                    } else {
                        setOnChatDetails(undefined)
                    }
                } else {
                    check = state.onChatId
                    if (!check || chatList.isInList(check)) {
                        setOnChatId(check)
                        // setOnChatDetails(null)
                    } else {
                        props.showAlert("Chat is not found")
                        window.history.back()
                    }
                }
            }
        }
        if(props.mainProps.popStateHistory) {
            popHistory(props.mainProps.popStateHistory)
            props.mainProps.setPopStateHistory(undefined)
        }
    },[onNewGroup, onChatId, onChatDetails,props.mainProps.popStateHistory]) // history back/forward buttons
    useLayoutEffect(()=> {
        if(props.mainProps.webSocket) {
            props.mainProps.webSocket.on('chat:responseUpdate:muteList', (data: Chat) => {
                if(chatList.isInList(data.id)) {
                    handleChatUpdate(data)
                }
            })
            props.mainProps.webSocket.on('chat:responseUpdate:adminList', (data: Chat) => {
                console.log("   Community(): handleChatUpdate: " + data.participants + " adm" + chatList)
                if(chatList.isInList(data.id)) {
                    handleChatUpdate(data)
                }
            })
            props.mainProps.webSocket.on('chat:responseUpdate:banList', (data: Chat) => {
                if(chatList.isInList(data.id)) {
                    handleChatUpdate(data)
                }
            })
            props.mainProps.webSocket.on('chat:responseUpdate:participants', (data : { chat :Chat,userId : number }) => {
                if(data.chat.participants.find((p)=> p===props.mainProps.userId) || chatList.isInList(data.chat.id))
                    handleChatUpdate(data.chat)
            })
        }
        function handleChatUpdate(data : Chat) {
            if(!data.participants.find((id) => props.mainProps.userId === id)) {
                console.log("   Community(): handleChatUpdate: " + data.participants + " missing this: no user found in group")
                return
            }
            console.log("   Community(): handleChatUpdate: " + data.participants + " start" + chatList.isInList(data.id))
            data.msgLoaded = false
            chatList.isInList(data.id) ? chatList.replaceChatWithoutMessages(data) : chatList.addChatWithoutMessages(data)
            setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true )
            setOnSearch(null)
        }
        return () => {
            if(props.mainProps.webSocket) {
                props.mainProps.webSocket.off('chats:requestUpdate:muteList');
                props.mainProps.webSocket.off('chats:requestUpdate:adminList');
                props.mainProps.webSocket.off('chats:requestUpdate:banList');
                props.mainProps.webSocket.off('chats:requestUpdate:participants');
            }
        };
    }, []); // update chats websocket
    useLayoutEffect(()=> {
        console.log("   Community(): useEffect fetch all chats")
        let res : ChatWithMessages[] = []
        fetch(SERVER_URL+"all/chats/user/",{
            headers : {
                'Accept': 'application/json',
                Authorization: 'Bearer ' + props.appProps.token
                }
        }).then(r => {
            if(r.ok) {
                r.json().then((chats: Chat[]) => {
                    chats.forEach((chat: Chat) => {
                        let tmp = new ChatWithMessages(chat, chat.id, [])
                        tmp.chat.msgLoaded = false
                        if(onChatId !== chat.id && !props.mainProps.newMessagesForCommunity.has(-1) && !props.mainProps.newMessagesForCommunity.has(chat.id)){
                            tmp.unreadMessagesCount++
                        }
                        res.unshift(tmp)
                    })
                    chatList.reassign(res)
                    setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true )
                    return
                })
            } else {
                throw new Error('Server unavailable')
            }
        })
        .catch(() => {
            props.showAlert("Server unavailable:(, try later")
        });
        }, [props.appProps.token]) // fetch chats
    useLayoutEffect(()=> {
        if(!onSearch || onSearch === "") {
            chatList.setSearchList(new SearchList(""))
            return;
        }
        let list = new SearchList("")
        console.log("   Community(): useEffect onSearch="+onSearch)
        let res : ChatWithMessages[] = []
        fetch(SERVER_URL+"all/chats/search/",{
            method : "PUT",
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + props.appProps.token
            },
            body: JSON.stringify({ 'name': onSearch })
        }).then(async r => {
            if(r.ok){
                r.json().then((responceChats : Chat[])=>{
                    responceChats.forEach((chat : Chat) => {
                        let tmp = new ChatWithMessages(chat, chat.id, [])
                        tmp.chat.msgLoaded = false
                        res.unshift(tmp)
                    })
                    list.chats = res
                    fetch(SERVER_URL+"all/search/user",{
                        method : "PUT",
                        headers : {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + props.appProps.token
                        },
                        body: JSON.stringify({ 'name': onSearch })
                    }).then(async r => {
                        if(r.ok){
                            r.json().then((responseUsers : User[])=>{
                                list.users = responseUsers
                                // setSearchList(list)
                                chatList.setSearchList(list)
                                setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true )
                            })
                        }
                    })
                })
            }
        })
    }, [onSearch, props.appProps.token]) // search
    useLayoutEffect(()=>{
            if(!onChatId)
                return;
            let resChat : ChatWithMessages | undefined = chatList.getChat(onChatId)
            // if (!resChat) {
            //     resChat = searchList.chats.find((chat) => chat.chat.id === onChatId)
            // }
            if(resChat === undefined) {
                return;
            }
            if(resChat.chat.msgLoaded) {
                return;
            }
            fetch(SERVER_URL + "chat/" + resChat.chat.id + "/messages", {
                headers: {
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + props.appProps.token
                }
            }).then(r => {
                if(r.ok) {
                    r.json().then((msg: Message[]) => {
                        // @ts-ignore
                        resChat.messages = msg
                        // @ts-ignore
                        resChat.chat.msgLoaded = true
                        if(resChat) {
                            // console.log("fetch msgs","replace chat",resChat.chat.id,)
                            chatList.replaceChatWithMessages(resChat)
                            setChatListUpdate(chatListUpdate => chatListUpdate === true ? false : true )
                        }
                    })
                }
            })
    },[onChatId, props.appProps.token,onChatDetails]) // fetch messages

    /*
    * style block
    * */

    const pageStyle = {
        position: "relative",
        display: "flex",
        width: window.innerWidth,
        height: window.innerHeight - 70
    }
    const divideLineStyle = {
        width : 4,
        height : pageStyle.height,
        backgroundColor : colors.BG_COLOR_26,
    }

    /*
    * props block
    * */

    const communityProps = {
        mainProps: props,
        page: pageStyle,
        divideLineStyle     : divideLineStyle,
        onNewGroup          : onNewGroup,
        setOnNewGroup       : setOnNewGroup,
        onChatId            : onChatId,
        setOnChatId         : setOnChatId,
        chatList            : chatList,
        searchList          : searchList,
        setChatList         : setChatList,
        onSearch            : onSearch,
        setOnSearch         : setOnSearch,
        newMessageBadge     : newMessageBadge,
        setNewMessageBadge  : setNewMessageBadge,
        onChatDetails       : onChatDetails,
        setOnChatDetails    : setOnChatDetails,
        showAlert           : props.showAlert,
        chatListUpdate      : chatListUpdate,
        setChatListUpdate   : setChatListUpdate,
    }
    // console.log("Community()")

    /*
    * return block
    * */

    return (
        <div className="page" style={pageStyle as CSSProperties} onClick={()=>props.mainProps.onStateUserMenuChange(false)}>
            <ContactsView {...communityProps}/>
            {/*<div className="divide-line" style={divideLineStyle}/>*/}
            {onNewGroup === 1
                ?
                    <NewGroup {...communityProps}/>
                :
                <>
                    {
                        (onChatId || onChatDetails)
                        ?
                            <ChatView {...communityProps}/>
                        :
                            <div className="empty" style={{width: "100%"}} onClick={() => {
                                setOnSearch(null)
                        }}>
                        </div>
                    }
                </>
            }
        </div>
    )
}
