import {Dispatch, SetStateAction, useEffect, useLayoutEffect, useState} from "react";
import {MainProps} from "../main/Main";
import {GameState} from "../main/game/Game";


export default function UseMousePosition(props : MainProps,
                                         gameFieldSize : any,
                                         paddleSize : any,
                                         visualField : any,
                                         gameId:number,
                                         gameState : GameState) {
    function getLeftPaddlePosition(mousePosY: number){
        let posY;
        // if mouse didnt moved yet(before game start), paddle pos is gameField height/2
        if(!mousePosY){
            return  (gameFieldSize.height + paddleSize.height)/2
        }
        if(mousePosY < paddleSize.height + 110) { // TODO hardcode
            posY = 0
        } else if(mousePosY > visualField.height + 115){
            posY = visualField.height - paddleSize.height// TODO hardcode
        } else {
            posY = mousePosY - (paddleSize.height + 115)// TODO hardcode
        }
        return (posY);
    }
    let mousePosLocalY = 0
    const handleMouseMove = (event: { clientX: number; clientY: number; }) => {
        mousePosLocalY = event.clientY
    };
    const [mousePosY, setMousePosY] = useState<number | undefined>(undefined);
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        function tick() {
            setMousePosY(mousePosLocalY);
        }
        let id = setInterval(tick, 20);
        return () => {
            clearInterval(id)
            window.removeEventListener(
                'mousemove',
                handleMouseMove
            );
        };
    }, [mousePosY]);

    useEffect(()=>{
        if(!mousePosY || mousePosY < 1)
            return
        let pos = getLeftPaddlePosition(mousePosY)
        if(props.mainProps.webSocket && gameState === GameState.onGamePlay) {
            props.mainProps.webSocket.emit('game:paddlePosition', {
                gameId: gameId,
                userId: props.mainProps.userId,
                paddlePosition: pos
            })
        }
    },[mousePosY])
}