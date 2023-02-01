import React, {CSSProperties, Dispatch, SetStateAction, useEffect, useState} from "react";
import UseMousePosition from "../../utils/UseMousePosition";
import GameNav from "./GameNav";
import LeftPaddle from "./LeftPaddle";
import RightPaddle from "./RightPaddle";
import Ball from "./Ball";
import {MainProps} from "../Main";
import GamePaddlePosition from "../../models/GamePaddlePosition";
import BallDirection from "../../models/BallDirection";
import Watch, {WatchProps} from "./Watch";
import {GameParameters} from "./GameParameters";
import CustomLoader, {CustomAnimations} from "../../utils/CustomLoader";
import MyLabel from "../../utils/Label";
import gameObject from "../../models/GameObject";
import {colors, SERVER_URL} from "../../constants";
import Invites from "./Invites";
import {captureRejectionSymbol} from "form-data";
import {appStates} from "../../App";

export enum GameState {
	onLobby,
	onGamePlay,
	onGameWatch
}

export enum GameFlowState {
    onPause,
    isStarted,
    isFinished,
    onError
}

export type PairedUsers = {
	id : number;
	player1id : number;
	player2id : number;
	winner : number;
	leftPlayerScore : number;
	rightPlayerScore : number;
	finished : boolean;
}

export interface GameFinish {
    gameId: number,
    leftUserId: number,
    rightUserId: number,
    leftPlayerScore: number,
    rightPlayerScore: number,
    error: boolean
}

const baseSize = 12.5
const ballSize = baseSize * 2
const paddleSize = {
	height: baseSize * 8,
	width: baseSize * 2
}
const gameFieldSize = { width: 600, height: 600 }
const navBarSize = baseSize * 8
let visualField = {width: gameFieldSize.width + ballSize + (2 * paddleSize.width), height : gameFieldSize.height + ballSize}

let defaultSpeed : number = gameFieldSize.width/125
let ballSpeed: number = defaultSpeed
let leftPaddlePositionY : number = (visualField.height - paddleSize.height) / 2
let rightPaddlePositionY : number = leftPaddlePositionY


let ballDirectionX  : number= 0.5
let ballDirectionY : number= 0.5
// let ballPositionX : number
// let ballPositionY : number
let ballPositionX : number
let ballPositionY : number
let startBallPositionX : number
let startBallPositionY : number
let timestamp : number
let gameId : number
let player : number
let leftPlayerScore : number
let rightPlayerScore : number
let leftPlayerName : string
let rightPlayerName : string
let leftPlayerId : number
let rightPlayerId : number
let mirror : boolean

const btnsStyleLong = {
    padding: "0px 30px 0px 30px",
    width: 600,
    height: 50,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    fontSize: 15,
    fontWeight: "bolder",
    color: colors.TEXT_COLOR_DEFAULT,
}
const btnStyleGrey = {
	padding: "0px 30px 0px 30px",
	height: 50,
	alignItems: "center",
	justifyContent: "space-around",
	display: "flex",
	fontSize: 15,
	color: "#444",
	width: "100%",
	margin: 5,
}
const GameFinishedText = {
    border: "solid 1px "+colors.BG_COLOR_30,
    borderRadius:10,
    position : "absolute",
    width: 300,
    height: 50,
    left: "calc(50% - 150px)",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    fontSize: 15,
    fontWeight: "bolder",
    color: colors.TEXT_COLOR_DEFAULT,
}

export interface BallPropsNew  {
    custom : boolean,
	ballSize : number,
	// isStartedGame : boolean,
	paddleSize : { height: number; width: number },
	gameFieldSize : { width: number, height: number},
	visualFieldSize : { width: number, height: number},
	ballSpeed: number,
	player : number,
	navBarSize : number,
	ballDirectionX : number,
	ballDirectionY : number,
	startBallPositionX  : number,
	startBallPositionY  : number,
	timestamp  : number,
    gameFlowState : GameFlowState,
    setGameFlowState : Dispatch<SetStateAction<GameFlowState>>
}

export default function Game(props: MainProps) {
    const [btnTextCustomisations,setBtnTextCustomisations] = useState(props.mainProps.userGameCustomisationValue)
    const [gameState,setGameState] = useState(GameState.onLobby)
    const [gameFlowState,setGameFlowState] = useState(GameFlowState.onPause)
    const [gameFrameColor,setGameFrameColor] = useState(0)
    const [isInTheQueue, setIsInTheQueue] = React.useState<boolean>(false);
    // const [gamePlay, setGamePlay] = React.useState<PairedUsers | undefined>();
    // const [gameToWatch, setGameIdToWatch] = React.useState<number>(-1);
    const [ballPropsUpdate, setBallPropsUpdate] = useState<boolean>(false)
    const [update, setUpdate] = useState(false)
    const [watchActiveGames,setWatchActiveGames] = useState<PairedUsers[]>([])
    function startGame(){
        setGameFlowState(GameFlowState.isStarted)
        // isStartedGame = true
    }
    function stopGame(){
        setGameFlowState(GameFlowState.onPause)
        // isStartedGame = false
    }
    const upodateFrameColor = (mode : string, data : any = null) => {
        if(gameState === GameState.onGameWatch) {
            setGameFrameColor(0)
            return
        }
        switch (mode) {
            case "pressKey" :
            case "ball" : {
                setGameFrameColor(0)
                break
            }
            case "finish" : {
                if(leftPlayerName === props.mainProps.userName)
                    setGameFrameColor(data.rightPlayerScore > data.leftPlayerScore ? -1 : 1)
                else
                    setGameFrameColor(data.rightPlayerScore > data.leftPlayerScore ? 1 : -1)
                break
            }
            case "round" : {
                if((!leftPlayerScore && !rightPlayerScore) && !data.leftPlayerScore && !data.rightPlayerScore) {
                    setGameFrameColor(0)
                } else {
                    if(leftPlayerId === props.mainProps.userId)
                        setGameFrameColor(leftPlayerScore > data.leftPlayerScore ? 1 : -1)
                    else
                        setGameFrameColor(leftPlayerScore > data.leftPlayerScore ? -1 : 1)
                }
                break
            }
        }
    }
    let ballPropsNew : BallPropsNew = {
        custom : props.mainProps.userGameCustomisationValue,
        visualFieldSize : visualField,
        ballSize : ballSize,
        paddleSize : paddleSize,
        gameFieldSize : gameFieldSize,
        ballSpeed  : ballSpeed,
        player : player,
        navBarSize : navBarSize,
        ballDirectionX : ballDirectionX,
        ballDirectionY : ballDirectionY,
        startBallPositionX  : startBallPositionX + ballSize,
        startBallPositionY  : startBallPositionY,
        timestamp  : timestamp,
        gameFlowState : gameFlowState,
        setGameFlowState : setGameFlowState
    }
    let pps:WatchProps = {
        allUsers : props.mainProps.users,
        activeGames : watchActiveGames,
        userAvatarUrl : props.mainProps.userAvatarUrl,
        handleGameToWatch: (value:number)=>{
            if(isInTheQueue) {
                setIsInTheQueue(false)
                if (props.mainProps.webSocket)
                    props.mainProps.webSocket.emit("game:queue:user:leave", {userId: props.mainProps.userId})
            }
            console.log('game to watch debug debug: ', value)
            if (props.mainProps.webSocket) {
                props.mainProps.webSocket.emit('game:watch', {gameId: value});
                gameId = value
            } else {
                return
            }
            let pair = pps.activeGames?.find(elem=>elem.id===value);
            if (pair !== undefined) {
                let id1 = pair.player1id
                let id2 = pair.player2id
                let leftPlayerObject = props.mainProps.users.find((user) => user.id === id1)
                let rightPlayerObject = props.mainProps.users.find((user) => user.id === id2)
                if (leftPlayerObject) {
                    leftPlayerName = leftPlayerObject.name;
                    leftPlayerId= leftPlayerObject.id;
                }
                if (rightPlayerObject) {
                    rightPlayerName = rightPlayerObject.name;
                    rightPlayerId = rightPlayerObject.id;
                }
            }
            if (props.mainProps.webSocket && pair) {
                props.mainProps.webSocket.on('game:watch', (data: GameParameters) => {
                    if(!data.gameID || data.gameID !== gameId){
                        return
                    }
                    if (props.mainProps.userId === data.leftPlayer || props.mainProps.userId === data.rightPlayer)
                        return;
                    ballPropsNew.ballDirectionX = - data.vector.x
                    ballDirectionX = - data.vector.x

                    ballPropsNew.ballDirectionY = data.vector.y
                    ballDirectionY = data.vector.y

                    ballPropsNew.ballSpeed = data.speed
                    ballSpeed = data.speed

                    startBallPositionX = gameFieldSize.width - data.coordinates.x
                    ballPropsNew.startBallPositionX = gameFieldSize.width - data.coordinates.x

                    startBallPositionY = data.coordinates.y
                    ballPropsNew.startBallPositionY = data.coordinates.y

                    timestamp = data.timestamp
                    ballPropsNew.timestamp = data.timestamp

                    leftPlayerScore = data.leftPlayerScore
                    rightPlayerScore = data.rightPlayerScore
                    leftPaddlePositionY = data.leftPaddlePosition
                    rightPaddlePositionY = data.rightPaddlePosition
                    leftPlayerScore = data.leftPlayerScore
                    rightPlayerScore = data.rightPlayerScore
                    gameFieldSize.width = data.fieldSize.x
                    gameFieldSize.height = data.fieldSize.y
                    paddleSize.width = data.paddleSize.x
                    paddleSize.height = data.paddleSize.y
                    console.log("   Game()","game:watch:",data.gameID,gameId, "stop paddle:",data.stopPaddle)
                    ballPropsNew.gameFlowState = data.stopPaddle ? GameFlowState.onPause : GameFlowState.isStarted
                    setGameFlowState(data.stopPaddle ? GameFlowState.onPause : GameFlowState.isStarted)
                    setBallPropsUpdate(ballPropsUpdate => ballPropsUpdate === true ? false : true)
                    setUpdate(update => update === true ? false : true)
                    setGameState(GameState.onGameWatch)
                })
            }
        }
    }
    useEffect(()=>{
        if(!props.mainProps.isConnected && (gameState === GameState.onGamePlay || gameState === GameState.onGameWatch)){
            gameId = -1
            setGameState(GameState.onLobby)
            props.showAlert("Error: connection with server lost")
            return
        }
    },[props.mainProps.isConnected])
    useEffect(()=>{
        if(!rightPlayerName || !leftPlayerName)
            setGameState(GameState.onLobby)
    },[leftPlayerName,rightPlayerName])
    useEffect(()=>{
        if(props.mainProps.webSocket) {
            props.mainProps.webSocket.emit('games:online:get');
        }
    },[]) // get active games
    useEffect(()=>{
        let data = props.mainProps.gameFinishData
        if(data !== undefined && data.gameId) {
            console.log("   Game() game:finish", "data.gameId", data.gameId, "gameId", gameId)
            let list = watchActiveGames
            if (list) {
                // @ts-ignore
                let game = list.find((game) => game.id === data.gameId)
                if (game) {
                    let index = list.indexOf(game)
                    if (index !== -1) {
                        list.splice(index, 1)
                        setWatchActiveGames([...list])
                    }
                }
            }
            if (data.gameId > 0 && data.gameId === gameId) {
                leftPlayerScore = data.leftPlayerScore
                rightPlayerScore = data.rightPlayerScore
                if (data.error) {
                    props.showAlert("Game error: user disconnected")
                    setGameState(GameState.onLobby)
                    gameId = -1
                    return
                }
                upodateFrameColor("finish", data)
                finishGame();
                gameId = -1
                setGameFlowState(GameFlowState.isFinished)
                setBallPropsUpdate(ballPropsUpdate => ballPropsUpdate === true ? false : true)
            }
        }
    },[props.mainProps.gameFinishData])
    useEffect(()=> {
        if (!props.mainProps.webSocket)
            return
        props.mainProps.webSocket.on('game:startGame', (data: PairedUsers) => {
            console.log('id:  ' + data.id + '  user1:  ' + data.player1id + '  user2:  ' + data.player2id)
            let list = watchActiveGames
            if(list && data.id) {
                let game = list.find((game) => game.id === data.id)
                if (!game) {
                    console.log("   Game()", "useEffect for watch list:","game:start")
                    list.unshift(data)
                    setWatchActiveGames([...list])
                }
            }
            if(data.id != null) {
                if (data.player1id !== props.mainProps.userId && data.player2id !== props.mainProps.userId)
                    return
                setIsInTheQueue(false);
                if (props.mainProps.webSocket)
                    props.mainProps.webSocket.emit("game:queue:user:leave", {userId: props.mainProps.userId})
                setGameState(GameState.onGamePlay)
                setGameFlowState(GameFlowState.onPause)
                gameId = data.id;
                player = props.mainProps.userId === data.player1id ? 1 : 2;
                leftPlayerScore = data.leftPlayerScore;
                rightPlayerScore = data.rightPlayerScore;
                let leftPlayerObject = props.mainProps.users.find((user)=>user.id === data.player1id)
                let rightPlayerObject = props.mainProps.users.find((user)=>user.id === data.player2id)
                if (leftPlayerObject) {
                    leftPlayerName = leftPlayerObject.name;
                    leftPlayerId = leftPlayerObject.id
                }
                if (rightPlayerObject) {
                    rightPlayerName = rightPlayerObject.name;
                    rightPlayerId = rightPlayerObject.id
                }
                mirror = player === 2 && gameId !== -1
            }
        });
        props.mainProps.webSocket.on('game:round', (data: any) => {
            if (data.gameId === gameId) {
                upodateFrameColor("round",data)
                leftPlayerScore = data.leftPlayerScore
                rightPlayerScore = data.rightPlayerScore
                stopGame();
                setBallPropsUpdate(ballPropsUpdate => ballPropsUpdate === true ? false : true)
                setUpdate(update => update === true ? false : true)
            }
        })
        props.mainProps.webSocket.on('game:paddlePosition', (data : GamePaddlePosition) => {
            if (data.gameId !== gameId) {
                return
            }
            if(gameState === GameState.onGameWatch){
            // if(gameToWatch === data.gameId){
                leftPlayerId === data.userId
                    ?
                    rightPaddlePositionY = data.paddlePosition
                    :
                leftPaddlePositionY = data.paddlePosition
            } else {
                if (data.userId !== props.mainProps.userId)
                    rightPaddlePositionY = data.paddlePosition
                else if (data.userId === props.mainProps.userId) {
                    leftPaddlePositionY = data.paddlePosition
                }
            }
            setUpdate(update => update === true ? false : true)
        })
        props.mainProps.webSocket.on('game:ball', (data: BallDirection) => {
            if(gameId !== data.gameId)
                return
            ballPropsNew.ballDirectionX = data.vector.x * (player == 1 ? 1 : -1)
            ballDirectionX = data.vector.x * (player == 1 ? 1 : -1)

            ballPropsNew.ballDirectionY = data.vector.y
            ballDirectionY = data.vector.y

            ballPropsNew.ballSpeed = data.speed
            ballSpeed = data.speed

            startBallPositionX = (player == 1 ? data.coordinates.x : gameFieldSize.width - data.coordinates.x)
            ballPropsNew.startBallPositionX = (player == 1 ? data.coordinates.x : gameFieldSize.width - data.coordinates.x)

            startBallPositionY = data.coordinates.y
            ballPropsNew.startBallPositionY = data.coordinates.y

            timestamp = data.timestamp
            ballPropsNew.timestamp = data.timestamp

            console.log('game:ball message received: ', data.gameId, data.vector.x, data.vector.y);
            startGame();
            upodateFrameColor("ball")
            setBallPropsUpdate(ballPropsUpdate => ballPropsUpdate === true ? false : true)
        })
        props.mainProps.webSocket.on('games:player:get', (data: PairedUsers[]) => {
            if (data!==undefined) {
                console.log("   Game()", "useEffect for watch list:","game:player:get")
                setWatchActiveGames(data)
            }
        });
        return () => {
            if(props.mainProps.webSocket) {
                props.mainProps.webSocket.off('game:startGame');
                props.mainProps.webSocket.off('game:round');
                props.mainProps.webSocket.off('game:paddlePosition');
                props.mainProps.webSocket.off('game:ball');
                props.mainProps.webSocket.off('game:player:get');
            }
        };
    }, [watchActiveGames,gameFlowState,gameState]); // update current game
    UseMousePosition(props,gameFieldSize,paddleSize,visualField,gameId,gameState)
	// updating game navigation props
	const propsGameNav = {
		props : props,
		player: player,
		leftPlayerScore: leftPlayerScore,
		rightPlayerScore: rightPlayerScore,
		leftPlayerName: leftPlayerName,
		rightPlayerName: rightPlayerName,
		gameNavHeight: navBarSize,
		visualFieldWidth : visualField.width,
        leftPlayerId : leftPlayerId,
        rightPlayerId : rightPlayerId,
        gameState : gameState,
        setGameState : setGameState
	}
	// check for ball leaves game area or intersects with paddle
	function finishGame() {
		stopGame();
        gameId = -1
        setGameFlowState(GameFlowState.isFinished)
	}
    const handleQueueButton = () => {
        if(isInTheQueue){
            setIsInTheQueue(false)
            if(props.mainProps.webSocket)
                props.mainProps.webSocket.emit("game:queue:user:leave",{userId: props.mainProps.userId})
        } else {
            enterQueue();
            setIsInTheQueue(true);
        }
    }
    function enterQueue() {
        if(props.mainProps.webSocket) {
            props.mainProps.webSocket.emit('game:startGame', {userId: props.mainProps.userId, gameFieldSize: gameFieldSize, paddleSize: paddleSize, ballSize: 30});
        }
    }
    const resetGame = () => {
        gameId = -1
        defaultSpeed  = gameFieldSize.width/250
        ballDirectionX  = 0.5
        ballDirectionY = 0.5
        ballSpeed = defaultSpeed
    }
    const handleIsFinishedButton = () => {
        gameId = -1
        setGameFlowState(GameFlowState.isFinished)
        setGameState(GameState.onLobby)
        setGameFrameColor(0)
        setIsInTheQueue(false);
        resetGame();

    }
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
    let gameFrameStyle
    let gameFrameBase : CSSProperties = {
        border: "1px solid " + colors.BG_COLOR_26,
        backgroundColor: colors.BG_COLOR_26,
        height: visualField.height,
        width: visualField.width,
        position: "absolute",
        borderRadius:10,
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    }
    const gameFrameGreen : CSSProperties = {
        border: "1px solid #4a8",
        backgroundColor: colors.BG_COLOR_26,
        height: visualField.height,
        width: visualField.width,
        position: "absolute",
        borderRadius:10,
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    }
    const gameFrameRed : CSSProperties = {
        border: "1px solid #c53",
        backgroundColor: colors.BG_COLOR_26,
        height: visualField.height,
        width: visualField.width,
        position: "absolute",
        borderRadius:10,
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    }
    
    const propsLeftPaddle = {
        custom: props.mainProps.userGameCustomisationValue,
        width: paddleSize.width,
        height: paddleSize.height, 
        positionX: paddleSize.width,
        positionY: leftPaddlePositionY,
    }
    // updating right paddle props
    const propsRightPaddle = {
        custom: props.mainProps.userGameCustomisationValue,
        positionX: gameFieldSize.width + paddleSize.width,
        positionY: rightPaddlePositionY,
        width: paddleSize.width,
        height: paddleSize.height,
    }
    // switch (gameFrameColor){
    //     case -1 :{
    //         gameFrameStyle = gameFrameRed
    //         break
    //     }
    //     case 1 :{
    //         gameFrameStyle = gameFrameGreen
    //         break
    //     }
    //     default :{
            gameFrameStyle = gameFrameBase
    //         break
    //     }
    // }

    useEffect(()=>{
        setBtnTextCustomisations(props.mainProps.userGameCustomisationValue)
    },[props.mainProps.userGameCustomisationValue])
    const handleGameCustomChange = () => {
        fetch(SERVER_URL+"user/changeCustom",{
            method : "PUT",
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + props.appProps.token
            },
        }).then(r => {
            if(r.ok)
                props.mainProps.userGameCustomisation(props.mainProps.userGameCustomisationValue === true ? false : true)
        })
    }
    return (
        <div style={{height:"100%",width:"100%"}}>
            { gameState === GameState.onLobby
                &&
                <div style={{height:"100%",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",marginTop:30}}>
                    <>
                        <div className="info-content-user-buttons" style={infoContentBoxColumnStyle as CSSProperties}>
                            <div className="info-content-user-buttons" style={infoContentBoxStyleSpace as CSSProperties}>
                                {isInTheQueue && <CustomLoader widthBall={6} heightBall={6} left={"31%"} animation={CustomAnimations.translate_vertical} loopTimeInSeconds={0.5}/>}
                                <div className="back-btn"
                                     style={btnsStyleLong as CSSProperties}
                                     onClick={handleQueueButton}>
                                    {isInTheQueue? "waiting for second player..." : "new game"}
                                </div>
                            </div>
                        </div>
                        <MyLabel labelText="active invites" width={600} justifyContent="left" margin="10px 0px 0px 10px"/>
                        <Invites appProps={props.appProps} mainProps={props.mainProps} showAlert={props.showAlert}/>
                        <MyLabel labelText="games to watch" width={600} justifyContent="left" margin="10px 0px 0px 10px"/>
                        <div className="info-content-user-buttons" style={infoContentBoxColumnStyle as CSSProperties}>
                            {
                                <div className="info-content-user-buttons" style={infoContentBoxStyleSpace as CSSProperties}>
                                    <Watch {...pps}/>
                                </div>
                            }
                        </div>
                        <MyLabel labelText="game customisations" width={600} justifyContent="left" margin="10px 0px 0px 10px"/>
                        <div className="info-content-user-buttons" style={infoContentBoxColumnStyle as CSSProperties}>
                            <div className="info-content-user-buttons" style={infoContentBoxStyleSpace as CSSProperties}>
                            <div className="back-btn" style={btnsStyleLong as CSSProperties} onClick={() => {
                                handleGameCustomChange()
                            }}>
                                {btnTextCustomisations
                                    ?
                                    "game customisations enabled"
                                    :
                                    "game customisations disabled"
                                }
                            </div>
                            </div>
                        </div>
                    </>
                </div>
            }
            {
                (gameState !== GameState.onLobby)
                // (isMatched || gameToWatch !== -1)
                &&
                <div
                    className="game"
                    onClick={() => {
                        if(gameFlowState !== GameFlowState.isStarted && props.mainProps.webSocket && gameState === GameState.onGamePlay) { // HARDCORE игра или подглядка
                            props.mainProps.webSocket.emit('game:pressKey', {gameId: gameId})
                            upodateFrameColor("pressKey")
                        }
                    }
                    }>
                    <GameNav  {...propsGameNav}/>
                    <div className="game-body" style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
                        <div className="game-frame" style={{
                            height:visualField.height,
                            width: visualField.width,
                            position: "relative",
                            display: "flex",
                            alignItems:"center",
                            justifyContent: "center"
                        }}>
                            <div className="actual-frame" style={gameFrameStyle}/>
                            {
                                gameState === GameState.onGameWatch
                                &&
                                <div style={{
                                    position: "absolute",
                                    color: "#555",
                                    height: 50,
                                    width: 100,
                                    top: 5,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    watch mode
                                </div>
                            }
                            {gameFlowState !== GameFlowState.isFinished && <LeftPaddle {...propsLeftPaddle}/>}
                            {gameFlowState !== GameFlowState.isFinished && <RightPaddle {...propsRightPaddle}/>}
                            {gameFlowState !== GameFlowState.isFinished && <Ball {...ballPropsNew}/>}
                            {
                                gameFlowState === GameFlowState.isFinished && leftPlayerName && rightPlayerName
                                    &&
                                <div className="back-btn" style={GameFinishedText as CSSProperties} onClick={handleIsFinishedButton}>
                                        {(leftPlayerScore > rightPlayerScore ? leftPlayerName  : rightPlayerName) + ' wins!'}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}