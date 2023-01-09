import { useState, useEffect, useRef } from "react";
import RollingDigits from "./RollingDigits";
import './BishButton.css';

import 'bootstrap/dist/css/bootstrap.min.css';

export default function BishButton() {

    const endpoint = 'https://1c104v13x0.execute-api.us-east-1.amazonaws.com/v1/counter';
    const getFrequency = 5000,
        TimeoutcountDownTime = 5,
        // timeoutTime = 60000,
        [counter_local_initial, setCounter_local_initial] = useState(0),
        [counter_local, setCounter_local] = useState(0),
        [incrementation_count, setIncrementation] = useState(0),
        [flag, setFlag] = useState(true),
        [TimeoutcountDown, setTimeoutCountDown] = useState(TimeoutcountDownTime),    // new timeout time in second
        last_onMouseLeave_incrementation = useRef(0),
        mouse_click_time = useRef(new Date().getSeconds());
    let intervalUpdateId;

    // Update once when mount
    useEffect(
        () => {
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
                new Date().getSeconds() === mouse_click_time.current
                    ?
                    require("../img/Angry.png")
                    :
                    require("../img/Normal.png")
            }></img>
        </button>
        <h3> {!flag ? 'Timedout. keep bishing to resume.' : null} </h3>
        <br />
        <p>
            getFrequency = {getFrequency}
            <br />
            {/* timeoutTime = {timeoutTime}, */}
            , flag = {String(flag)}, TimeoutcountDown = {TimeoutcountDown}
            <br />
            {/* , intervalUpdateId = {String(intervalUpdateId)}, timeoutID = {String(timeoutID)} */}
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
        mouse_click_time.current = new Date().getSeconds();
        setIncrementation(x => x + 1);
        console.log('onClickHandler() : click_count: ', incrementation_count);
        setFlag(true);
        // clearTimeout(timeoutID);
        setTimeoutCountDown(TimeoutcountDownTime);
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