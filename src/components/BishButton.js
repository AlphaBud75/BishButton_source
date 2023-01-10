import { useState, useEffect, useRef } from "react";
import RollingDigits from "./RollingDigits";
import './BishButton.css';

import 'bootstrap/dist/css/bootstrap.min.css';

let quite_flag = true;
Audio.prototype.myPlay = function () {
    console.log('quite_flag: ', quite_flag, 'myplay()', this.duration);
    if (quite_flag) {
        quite_flag = false;
        setTimeout(
            () => {
                quite_flag = true;
                console.log(this.duration);
            },
            this.duration * 1100
        )
        this.play();
    }
};

export default function BishButton() {

    const endpoint = 'https://1c104v13x0.execute-api.us-east-1.amazonaws.com/v1/counter';
    // const endpoint = 'https://1c104v13x0.execute-api.us-east-1.amazonaws.com/v1/counterkjygkjyg';

    const bish_short = new Audio(require('../wav/BitchA.wav')), bish_long = new Audio(require('../wav/BitchB.wav'));
    const getFrequency = 5000,
        TimeoutcountDownTime = 5,
        // timeoutTime = 60000,
        [counter_local_initial, setCounter_local_initial] = useState(0),
        [counter_local, setCounter_local] = useState(0),
        [incrementation_count, setIncrementation] = useState(0),
        [flag, setFlag] = useState(true),
        [TimeoutcountDown, setTimeoutCountDown] = useState(TimeoutcountDownTime),    // new timeout time in second
        last_onMouseLeave_incrementation = useRef(0),
        mouse_click_time = useRef(0),
        last_time_bish_long = useRef(0),
        [playingLongBish, setPlayingLongBish] = useState(false);
    ;
    let intervalUpdateId;

    // Update once when mount
    useEffect(
        () => {
            last_time_bish_long.current = Date.now();
            updater(endpoint, 'GET', null)
                .then((data) => {
                    console.log('initial-get/fetched. counter: ', data);
                    setCounter_local_initial(data);
                    setCounter_local(data);
                }).catch((error) => {
                    console.error(error);
                })
        },
        []
    );

    // keep polling. restart when btn clicked
    useEffect(
        () => {
            intervalUpdateId = setInterval(
                () => {
                    if (flag && TimeoutcountDown > 0) {
                        setPlayingLongBish(false);
                        console.log('ivuid', intervalUpdateId, ' Timeoutcountdown: ', TimeoutcountDown, ' - try to update on ', new Date().toLocaleString());
                        setTimeoutCountDown(t => t - 1);
                        updater(endpoint, 'GET', null)
                            .then((data) => {
                                console.log('\tre-get/fetched. counter: ', data);
                                setCounter_local(data);
                            }).catch((error) => {
                                console.error(error);
                            });
                    }
                    else if (!flag || TimeoutcountDown <= 0) {
                        setFlag(false);
                        console.log(' \n No action for ', TimeoutcountDown, ' sec, timed out. refresh/increment to resume');
                        clearInterval(intervalUpdateId);
                        incrementation_count && updater(
                            endpoint, 'POST',
                            {
                                // count: counter_local,
                                increment: incrementation_count + counter_local - counter_local_initial
                            }
                        )
                            .then((data) => {
                                console.log('posted increment: ', incrementation_count, '+', counter_local, '-', counter_local_initial, ' = ', incrementation_count + counter_local - counter_local_initial);
                            }).catch((error) => {
                                console.error(error);
                            });
                    }
                }, getFrequency
            );
            return () => {
                clearInterval(intervalUpdateId);
            };
        }
        , [flag, TimeoutcountDown]
    );

    //beforeUnload
    window.addEventListener("beforeunload", function (e) {
        incrementation_count && updater(endpoint, 'POST', { count: counter_local, increment: incrementation_count })
            .then((data) => {
                console.log('posted');
            }).catch((error) => {
                console.error(error);
            });
    }, false);

    return <>
        <div className="rd mx-auto">
            <RollingDigits fromParent={counter_local + incrementation_count}></RollingDigits>
        </div>
        <div className="rd mx-auto">
            &nbsp;<div id="incremention-container">{incrementation_count}</div>&nbsp;
        </div>
        <button id="increment-btn"
            onClick={onClickHandler}
            onMouseLeave={onMouseLeaveHandler}
        >
            {/* increment */}
            <img src={
                playingLongBish
                    ?
                    require("../img/Angry.png")
                    :
                    require("../img/Normal.png")
            }></img>
        </button>
        <h3> {!flag ? 'Timedout. keep bishing to resume.' : null} </h3>
        <br />
        <p>
            quite_flag = {quite_flag},
            <br />
            getFrequency = {getFrequency}
            {/* timeoutTime = {timeoutTime}, */}
            <br />
            TimeoutcountDown = {TimeoutcountDown}
            <br />
            , flag = {String(flag)},
            {/* , intervalUpdateId = {String(intervalUpdateId)}, timeoutID = {String(timeoutID)} */}
            <br />
            , last_onMouseLeave_incrementation.current = {last_onMouseLeave_incrementation.current}
            <br />
            , mouse_click_time.current = {mouse_click_time.current};
        </p>
    </>;

    function onMouseLeaveHandler(event) {
        incrementation_count - last_onMouseLeave_incrementation.current && updater(
            endpoint, 'POST', { increment: incrementation_count - last_onMouseLeave_incrementation.current }
        )
            .then((data) => {
                console.log('posted', incrementation_count - last_onMouseLeave_incrementation.current);
            }).catch((error) => {
                console.error(error);
            });
        last_onMouseLeave_incrementation.current = incrementation_count;
    }



    function onClickHandler() {
        console.log(Date.now() - last_time_bish_long.current);
        // play short bish
        if (Math.random() > 0.05 && quite_flag) {
            try {
                bish_short.play();
            } catch {
                alert('you broke the site(i mean my code is weak). please refresh')
            }

            mouse_click_time.current = Date.now()
            setIncrementation(x => x + 1);
            console.log('onClickHandler() : click_count: ', incrementation_count);
            setFlag(true);
            setTimeoutCountDown(TimeoutcountDownTime);
        }
        else {
            //play long bish
            if (
                // quite_flag
                // &&
                (Date.now() - last_time_bish_long.current) > 5 * 1000
            ) {
                bish_long.myPlay();
                last_time_bish_long.current = Date.now();
                setPlayingLongBish(true);
            }
        }

    };

    async function updater(url, method, body) {
        const response = await fetch(url, {
            method: method,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            headers: { 'Content-Type': 'text/plain', },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: body && JSON.stringify(body)
        });
        if (method === 'GET')
            return response.json()
        return response;
    };

};