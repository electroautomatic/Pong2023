import React from "react";
import {colors} from "../constants";

export interface LabelProps {
    labelText : string,
    width: number
    justifyContent : string
    margin: string
}

export default function MyLabel(props : LabelProps) {
    return(
        <div style={{
            width:props.width,
            display:"flex",
            justifyContent:props.justifyContent,
            alignItems: "center",
            fontWeight:"normal",
            color:colors.TEXT_COLOR_MINUS_2,
            fontSize:13,
            margin: props.margin
            // marginTop:10,
            // marginLeft:10
            }}>
            {props.labelText}
        </div>
    )
}