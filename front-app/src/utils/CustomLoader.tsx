import React, {CSSProperties} from "react";
import "./CustomLoader.css"

export enum CustomAnimations {
    rotate_tr,
    translate_vertical
}

export interface LoaderProps {
    widthBall: number
    heightBall: number
    left: number | string
    animation: CustomAnimations
    loopTimeInSeconds : number
}

export default function CustomLoader(props : LoaderProps) {
    let animName : String = "rotate-tr"
    switch (props.animation){
        case CustomAnimations.rotate_tr : {
            animName = "rotate-tr"
            break
        }
        case CustomAnimations.translate_vertical : {
            animName = "translate-vertical"
            break
        }
    }

    let time = props.loopTimeInSeconds.toString() + "s linear infinite"
    const animation : string = animName + " " + time
    const style = {
        animation: animation,
        width:props.widthBall,
        height:props.heightBall,
        borderRadius: "50%",
        backgroundColor: "#fff",
        position: 'absolute',
        top: "50%",
        left: props.left,
        webkitAnimation:animation

    }

    return (
        <div style={style as CSSProperties} className="loader"/>
    )
}