import Game, {GameFinish} from "./game/Game";
import React, {Dispatch, SetStateAction, useEffect, useLayoutEffect, useState} from "react";
import Community from "./community/Community";
import Nav from "./Nav";
import {AppProps, appStates} from "../App";
import UserMenu from "./userMenu/UserMenu";
import User from "../models/User";
import {SERVER_URL} from "../constants";
import {io, Socket} from "socket.io-client";
import Chat from "../models/Chat";
import useWindowDimensions from "../utils/UseWindowDimensions";
import GameObject from "../models/GameObject";
import GameInvite from "../models/GameInvite";
import GameInvites from "../models/GameInvites";
import HistoryState from "../models/HistoryState";

export type MainProps = {
	appProps : AppProps
	mainProps : {
		userAvatarUrl : string[]
		userName : string
		defaultGroupAvatarUrl : string
		setUserAvatarUrl :Dispatch<SetStateAction<string[]>>
		setDefaultGroupAvatarUrl :Dispatch<SetStateAction<string>>
		setUserName :Dispatch<SetStateAction<string>>
		onStateUserMenuChange: Dispatch<SetStateAction<boolean>>
		stateUserMenu: boolean
		userId : number
		setUserId :Dispatch<SetStateAction<number>>
		webSocket : Socket | null
		users : User[]
		setUsers : Dispatch<SetStateAction<User[]>>
		setUpdateMain: Dispatch<SetStateAction<boolean>>
		updateMain: boolean
		newMessagesForCommunity : Set<number>,
		setNewMessagesForCommunity : Dispatch<SetStateAction<Set<number>>>,
		navBadgeCommunity : boolean,
		navBadgePlay : boolean,
		setNavBadgeCommunity : Dispatch<SetStateAction<boolean>>
		setNavBadgePlay : Dispatch<SetStateAction<boolean>>
		matchHistory : Map<number,GameObject>
		setMatchHistory : Dispatch<SetStateAction<Map<number,GameObject>>>
		activeGameInvites : GameInvites
		setActiveGameInvites : Dispatch<SetStateAction<GameInvites>>
		userGameCustomisationValue : boolean
		userGameCustomisation : Dispatch<SetStateAction<boolean>>
		isConnected : boolean
		popStateHistory : HistoryState | undefined
		setPopStateHistory : Dispatch<SetStateAction<HistoryState | undefined>>
		gameFinishData : GameFinish | undefined
	}
	showAlert : Dispatch<SetStateAction<string>>
}

export default function Main(props: AppProps) {
    useWindowDimensions()
	const [gameFinishData,setGameFinishData] = useState<GameFinish | undefined>(undefined)
	const [popStateHistory,setPopStateHistory] = useState<HistoryState | undefined>(undefined)
	const [isConnected, setIsConnected] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [userAvatarUrl, setUserAvatarUrl] = useState(["",""])
    const [userId, setUserId] = useState(-1)
	const [userGameCustomisationValue, userGameCustomisation] = useState(false)
    const [userName, setUserName] = useState("")
    const [activeGameInvites, setActiveGameInvites] = useState<GameInvites>(new GameInvites(""))
    const [matchHistory,setMatchHistory] = useState(new Map<number,GameObject>())
    const [defaultGroupAvatarUrl, setDefaultGroupAvatarUrl] = useState("")
    const [webSocket, setWebSocket] = useState<Socket | null>(null)
    const [stateUserMenu,setStateUserMenu] = useState(false)
    const [navBadgePlay,setNavBadgePlay] = useState(false)
    const [navBadgeCommunity,setNavBadgeCommunity] = useState(false)
    const [newMessagesForCommunity,setNewMessagesForCommunity] = useState(new Set<number>())
    const [updateMain,setUpdateMain] = useState(false)
    const fetchChatsForMain = () => {
        if(!newMessagesForCommunity.size) {
            fetch(SERVER_URL + "all/chats/user/", {
                headers: {
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + props.token
                }
            })
				.then(r => {
					if (r.ok) {
						r.json().then((chats: Chat[]) => {
							let set =  new Set<number>()
							chats.forEach((chat: Chat) => {
								set.add(chat.id)
								setNewMessagesForCommunity(set)
							})
						})
					} else {
						setNewMessagesForCommunity(newMessagesForCommunity.add(-1))
						throw new Error('Server unavailable')
					}
				})
				.catch(() => {
					props.showAlert("Server unavailable:( Try later")
				});
        }
    }
    fetchChatsForMain()
    useLayoutEffect(()=>{
        const popHistory = (e : PopStateEvent) => {
			console.log("pop history main")
            let state : HistoryState = e.state
            console.log("popEvent", state)
            props.setAppState(state.appState)
			if(state.appState === appStates.onCommunity)
				setPopStateHistory(state)
        }
        window.onpopstate = (e) => {
            popHistory(e)
        }
    },[props, props.appState])
    useEffect(()=>{
        if(!webSocket)
            return
        if(props.appState !== appStates.onGame){
            webSocket.emit("game:game:user:leave",{userId: userId})
            activeGameInvites.invites.forEach((invite)=>{
                if(invite.user1 === userId)
                    webSocket.emit("game:invite:cancel",{inviteId:invite.inviteId})
            })
        }
    },[props.appState])
    useLayoutEffect( ()=> {
        console.log("   Main(): useEffect: login/me/profile")
        fetch(SERVER_URL+"login/me/profile",{
            headers: {
                'Accept': 'application/json',
                Authorization: 'Bearer ' + props.token
            },
        }).then(async r => {
            if(r.ok) {
                r.json().then((data: User)=> {
                    console.log("   Main(): useEffect: webSocket creating")
                    if (webSocket)
                        return
                    const socket = io(SERVER_URL, {transports: ['websocket']})
                    setWebSocket(socket)
                    console.log("   Main(): useEffect: SET webSocket:", webSocket)
					// users.push(data)
                    setUserName(data.name)
                    setUserId(data.id)
					if(data.custom !== undefined)
						userGameCustomisation(data.custom)
                    fetch(SERVER_URL + "all/games/"+data.id, {
                        headers: {
                            'Accept': 'application/json',
                            Authorization: 'Bearer ' + props.token
                        }
                    }).then(r => {
                        if (r.ok) {
                            r.json().then((games: GameObject[]) => {
                                    let map = new Map<number,GameObject>()
                                    games.forEach((game)=>{
                                        map.set(game.id,game)
                                    })
                                    setMatchHistory(map)
                                }
                            )
                        }
                    })
                    setUserAvatarUrl([SERVER_URL + "avatar/", "?hash=start"])
                    console.log("   Main(): useEffect: users")
                    fetch(SERVER_URL + "users", {
                        headers: {
                            'Accept': 'application/json',
                            Authorization: 'Bearer ' + props.token
                        }
                    }).then(r => {
                        if (r.ok) {
                            r.json().then((u: User[]) => {
								setUsers(u)
                                }
                            )
                        }
                    })
					console.log("push history main")
					window.history.pushState({
						appState: appStates.onMain
					}, "",);
					document.title = "ft_transcendence: " + data.name
					}
				)}
		})
	}, []) // start
	useEffect(() => {
		if(webSocket) {
			webSocket.on('connect', () => {
				console.log("   Main(): useEffect: for webSocket : Connected ", webSocket.id)
				setIsConnected(true)
			});
			webSocket.on('disconnect', () => {
				console.log("   Main(): useEffect: for webSocket : Disconnected")
				setIsConnected(false)
			});
			webSocket.on('user:avatarUpdate', (data:{msgUserId : number}) => {
				console.log("   Main(): useEffect: for webSocket LISTEN avatarUpdate: " + userId)
				handleUserAvatarUpdate()
			});
			webSocket.on('user:online', (data :{userId: number, isOnline: boolean}) => {
				// console.log("   Main(): useEffect: for webSocket : usersOnline: "+ data.userId + " " + data.isOnline)
				handleUserOnlineUpdate(data)
				if(data.isOnline)
					return
				let tmp = new GameInvites("")
				tmp.reassign(activeGameInvites.invites)
				tmp.invites.forEach((invite)=>{
					if(invite.user2 === data.userId || invite.user1 === data.userId)
						tmp.removeInvite(invite.inviteId)
				})
				setActiveGameInvites(tmp)
			});
			webSocket.on('messages:editName', (data: User) => {
				console.log("   Main(): useEffect: for webSocket LISTEN editName: ",data.name + " / " + data.id)
				handleUserUpdate(data)
			})
			webSocket.on('messages:editUser', (data: User) => {
				console.log("   Main(): useEffect: for webSocket LISTEN editUser: ",data.name + " / " + data.id)
				handleUserUpdate(data)
			})
			webSocket.on('user:update:achievement', (data: {userId:number,achId:number}) => {
				if(data.userId === userId)
					props.showAlert("Ach: "+data.achId)
				console.log("   Main(): useEffect: for webSocket LISTEN update achievement: ",data.userId + " / " + data.achId)
			})
			webSocket.on('game:invite:cancel', (data : { inviteId: number }) => {
				console.log("   Main(): useEffect: for webSocket LISTEN game:invite:cancel: ", data.inviteId)
				let tmp = new GameInvites("")
				tmp.reassign(activeGameInvites.invites)
				if(tmp.has(data.inviteId)) {
					tmp.removeInvite(data.inviteId)
					setActiveGameInvites(tmp)
				}
			})
			webSocket.on('game:invite:create', (data: GameInvite) => {
				console.log("   Main(): useEffect: for webSocket LISTEN game:invite:create: ",data.user1 + " + " + data.user2)
				let tmp = new GameInvites("")
				tmp.reassign(activeGameInvites.invites)
				if(tmp.has(data.inviteId) || (data.user1 !== userId && data.user2 !== userId))
					return
				tmp.addInviteObj(data)
				setActiveGameInvites(tmp)
				// console.log("invites",tmp)
				if(data.user1 === userId) {
					props.showAlert("Invite sent")
					props.setAppState(appStates.onGame)
				}
				if(data.user2 === userId) {
					setNavBadgePlay(true)
				}
			})
			webSocket.on('game:finish', (data : GameFinish) => {
				console.log("   Main(): useEffect: for webSocket LISTEN game:finish ",data.gameId)
				if(data.gameId) {
					setGameFinishData(data)
					updateUserGameDataByGameFinish(data)
				}

			})
            if(webSocket.id && userId) {
                webSocket.emit('users:online', {})
                webSocket.emit('giveMeID', {socketId: webSocket.id, userId: userId})
            }
        }
		let us = users
		let me = us.find((us)=>us.id === userId)
        if(me) {
            us.forEach((user : User) => {
                user.isFriend = !!me?.friends.find((id) => id === user.id)
                user.isBlocked = !!me?.blackList.find((id) => id === user.id)
            })
			setUsers(us)
            setUpdateMain(updateMain => updateMain == true ? false : true)
			console.log("   Main(): useEffect: frends+blocked :  updated ")
        }
        return () => {
            if(webSocket) {
                webSocket.off('message:post');
				webSocket.off('game:finish');
                webSocket.off('connect',() => {})
                webSocket.off('disconnect',() => {})
                webSocket.off('user:online',() => {})
                webSocket.off('avatarUpdate',() => {})
                webSocket.off('messages:editName',() => {})
				webSocket.off('game:invite:cancel',() => {})
				webSocket.off('game:invite:create',() => {})
            }
        };
    }, [users.length, props.appState, webSocket, userId, activeGameInvites.invites]);
    // console.log("Main()")
	const updateUserGameDataByGameFinish = (data : GameFinish) => {
		const leftUser = users.find((us)=>us.id === data.leftUserId)
		const rightUser = users.find((us)=>us.id === data.rightUserId)
		if(!leftUser || !rightUser || !data.gameId || matchHistory.has(data.gameId))
				return;
		const leftUserIndex = users.indexOf(leftUser)
		const rightUserIndex = users.indexOf(rightUser)
		// update score
		if(data.leftPlayerScore > data.rightPlayerScore){
			leftUser.wines += 1
			rightUser.loses += 1
		} else if(data.leftPlayerScore < data.rightPlayerScore){
			rightUser.wines += 1
			leftUser.loses += 1
		}
		// MH
		let game = new GameObject("")
		game.id = data.gameId
		game.score1 = data.leftPlayerScore
		game.score2 = data.rightPlayerScore
		game.player1id = data.leftUserId
		game.player2id = data.rightUserId
		// leftUser.games.set(data.gameId,game)
		// rightUser.games.set(data.gameId,game)
		setMatchHistory(matchHistory.set(game.id,game))
		users[leftUserIndex]  = leftUser
		users[rightUserIndex] =	rightUser
		setUpdateMain(updateMain => updateMain === true ? false : true)
	}
    const handleUserAvatarUpdate = () => {
        setUserAvatarUrl([SERVER_URL+"avatar/","?hash="+Date.now().toString()])
        setUpdateMain(updateMain => updateMain === true ? false : true)
    }
    const handleUserOnlineUpdate = (data :{userId: number, isOnline: boolean}) => {
        const user =  users.find((user) => user.id === data.userId)
        if(user) {
            user.isOnline = data.isOnline
            setUpdateMain(updateMain => updateMain === true ? false : true)
        } else {
            console.log("   Main(): useEffect: for webSocket LISTEN editName:  NOT FOUND in USERS ",data.userId)
        }
    }
    const handleUserUpdate = (data :User) => {
        if(data.id === userId) {
            setUserName(data.name)
        }
        let user = users.find((user) => user.id === data.id)
        if(user){
			users[users.indexOf(user)] = data
            console.log("   Main(): useEffect: for webSocket LISTEN editName: found user",data.name)
        } else {
			users.push(data)
            console.log("   Main(): useEffect: for webSocket LISTEN updateUsers: adding user ",data.name)
        }
		setUpdateMain(updateMain => updateMain === true ? false : true)
    }
    const mainProps = {
        appProps : props,
        mainProps : {
            userAvatarUrl : userAvatarUrl,
            userName : userName,
            setUserAvatarUrl : setUserAvatarUrl,
            setUserName : setUserName,
            onStateUserMenuChange: setStateUserMenu,
            stateUserMenu: stateUserMenu,
            defaultGroupAvatarUrl : defaultGroupAvatarUrl,
            setDefaultGroupAvatarUrl : setDefaultGroupAvatarUrl,
            userId : userId,
            setUserId : setUserId,
            webSocket : webSocket,
            users : users,
            setUsers : setUsers,
            updateMain : updateMain,
            setUpdateMain : setUpdateMain,
            newMessagesForCommunity : newMessagesForCommunity,
            setNewMessagesForCommunity : setNewMessagesForCommunity,
            navBadgeCommunity : navBadgeCommunity,
            navBadgePlay : navBadgePlay,
            setNavBadgeCommunity : setNavBadgeCommunity,
            setNavBadgePlay : setNavBadgePlay,
            matchHistory : matchHistory,
            setMatchHistory : setMatchHistory,
            activeGameInvites : activeGameInvites,
            setActiveGameInvites : setActiveGameInvites,
			userGameCustomisationValue: userGameCustomisationValue,
			userGameCustomisation : userGameCustomisation,
			isConnected : isConnected,
			popStateHistory : popStateHistory,
			setPopStateHistory : setPopStateHistory,
			gameFinishData : gameFinishData
        },
        showAlert : props.showAlert
    }
            return (
                <div className="main-page" style={{position:"relative",height: "100vh",width:"100vw"}}>
                    <Nav {...mainProps}/>
                    <div className="content" style={{display:"flex",flexDirection:"column",position:"relative",height: "100%",width:"100%"}}>
                        {
                            props.appState === appStates.onGame
                                &&
                            <Game {...mainProps}/>
                        }
                        {
                            props.appState === appStates.onCommunity
                            &&
                            <Community {...mainProps}/>
                        }
                    </div>
                    <UserMenu {...mainProps}/>
                </div>
            );
}
