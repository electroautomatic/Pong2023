import React, {CSSProperties, useEffect} from "react";
import {PairedUsers} from "./Game";
import User from "../../models/User";
import {colors} from "../../constants";

const textStyle : CSSProperties = {
    width: 590,
    height: 60,
    alignItems: "center",
    justifyContent: "space-evenly",
    display: "flex",
    fontSize: 15,
    color: colors.TEXT_COLOR_MINUS_2,
}

const boxStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width : "100%",
    height : "100%",
    backgroundColor : colors.BG_COLOR_24,
    borderRadius : 10,
    margin: 5,
}
type DisplayedPair = {
    gameId : number;
    player1Name:string,
    player1Avatar : string,
    player2Name:string,
    player2Avatar : string,
}

export type WatchProps = {
    allUsers:User[];
    activeGames:PairedUsers[];
    userAvatarUrl : string[];
    handleGameToWatch:(value:number)=>void;
}
const Watch = (props:WatchProps) => {
    const [pairs, setPairs] = React.useState<DisplayedPair[]>([]);
    useEffect(()=>{
        let mappedPairs:Set<DisplayedPair> = new Set<DisplayedPair>();
        // console.log("WATCH PROPS: ", props);
        if (props.activeGames !== undefined) {
            let activeGames = props.activeGames;
            activeGames.forEach(elem=>{
                const p1 = props.allUsers.find((user) => user.id === elem.player1id);
                const p2 = props.allUsers.find((user) => user.id === elem.player2id);
                if (p1 != undefined && p2 != undefined) {
                    let mappedPair: DisplayedPair = {
                        gameId : elem.id,
                        player1Name: p1.name,
                        player1Avatar: props.userAvatarUrl[0] + p1.id +props.userAvatarUrl[1],
                        player2Name: p2.name,
                        player2Avatar: props.userAvatarUrl[0] + p2.id +props.userAvatarUrl[1]
                    }
                    mappedPairs.add(mappedPair)
                }
            })
            setPairs([...Array.from(mappedPairs.values())]);
        }
    }, [props.activeGames])

    const msgLogoStyleLeft = {
        // alignSelf: "left",
        margin : "5px",
        // marginRight : "30px",
        height: "40px",
        width: "40px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        objectFit:"cover",
        padding: 2
    }
    const msgLogoStyleRight = {
        // alignSelf:"right",
        margin : "5px",
        // marginLeft: "30px",
        height: "40px",
        width: "40px",
        backgroundColor: colors.TEXT_COLOR_DEFAULT,
        borderRadius: "50%",
        objectFit:"cover",
        padding: 2
    }
    const btnStyle = {
        fontWeight:"bolder",
        height: 5,
        margin: 5,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        fontSize: 15,
        color: colors.TEXT_COLOR_MINUS_1,
    }
    const btnStyleGrey : CSSProperties = {
        padding: "0px 30px 0px 30px",
        height: 50,
        alignItems: "center",
        justifyContent: "space-around",
        display: "flex",
        fontSize: 15,
        color: colors.BG_COLOR_444,
    }
    // const pairs:DisplayedPair[] = [{player1:'NEREALKA', player2:'REALKA'}, {player1:'snuts', player2:'wtaylor'}, {player1:"Koshka Tochka", player2:"Sobaka Ulybaka"}];
    return(
        <div style={boxStyle as CSSProperties}>
            {
                pairs.length
                    ?
                    pairs.map((elem)=>(
                        <div className="back-btn" style={textStyle as CSSProperties} onClick={()=>props.handleGameToWatch(elem.gameId)}>
                            <img
                                alt="player1-avatar"
                                src={elem.player1Avatar}
                                style={msgLogoStyleLeft as CSSProperties}
                            />
                            <div style={btnStyle as CSSProperties}>{elem.player1Name} vs {elem.player2Name}</div>
                            <img
                                alt="player2-avatar"
                                src={elem.player2Avatar}
                                style={msgLogoStyleRight as CSSProperties}/>
                        </div>))
                    :
                        <div style={btnStyleGrey as CSSProperties}>no active games</div>
            }
        </div>
    )
}

export default Watch;
