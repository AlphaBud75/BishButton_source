import { useState, useEffect, useRef } from "react";
import RollingDigits from "./RollingDigits";
import './BishButton.css';




export default function BishButton_v2() {

    const [ennaIsAngry, setEnnaIsAngry] = useState(true);

    return <>
        <h1>asdfadsf</h1>


        <div className="rd mx-auto">
            <RollingDigits fromParent={999}></RollingDigits>
        </div>

        <button id="increment-btn"
        >
            <img src={
                ennaIsAngry
                    ?
                    require("../img/Angry.png")
                    :
                    require("../img/Normal.png")
            }></img>
        </button>

    </>

}


