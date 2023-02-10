import { useState, useEffect, useRef } from "react";
import RollingDigits from "./RollingDigits";
import './BishButton.css';
import 'bootstrap/dist/css/bootstrap.min.css';



export default function BishButton_v2() {
    let intervalUpdateId;
    const endpoint = 'https://1c104v13x0.execute-api.us-east-1.amazonaws.com/v1/counter';
    const
        [counter_display, setCounter_display] = useState(0),        // counter_local
        [increment_display, setIncrement_display] = useState(0),    // incrementation
        [increment_tobe_posted, setIncrement_tobe_posted] = useState(0),    // New Variable

        getFrequency = 30324500;     // frequency of getting latest counter

    // Update once when mount
    useEffect(
        () => {
            updater(endpoint, 'GET', null)
                .then((data) => {
                    console.log('initial-get/fetched. counter: ', data);
                    setCounter_display(data);
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
                    if (true) {
                        updater(endpoint, 'GET', null)
                            .then((data) => {
                                console.log('\tre-get/fetched. counter: ', data);
                                // setCounter_local(data);
                            }).catch((error) => {
                                console.error(error);
                            });
                    }
                    else if (true) {

                    }
                }, getFrequency
            );
            return () => {
                clearInterval(intervalUpdateId);
            };
        }
        , []
    );


    /////////////////////////////////////////////////
    return <>
        Total Bishes:
        <div className="rd mx-auto">
            <RollingDigits fromParent={counter_display}></RollingDigits>
        </div>

        Bishes you contributed:
        <div className="rd mx-auto">
            &nbsp;<div id="incremention-container">{increment_display}</div>&nbsp;
        </div>
        
        <button id="increment-btn"
            onClick={onClickHandler}
        >
            increment
        </button>
        
        {/* <h3> {!flag ? 'Timedout. keep bishing to resume.' : null} </h3> */}
        
        <br />

    </>;
    /////////////////////////////////////////////////////




    function onClickHandler() {
        // console.log(Date.now() - last_time_bish_long.current);
        // mouse_click_time.current = Date.now()
        setCounter_display(x => x + 1);
        setIncrement_display(x => x + 1);
        console.log('onClickHandler() : clicked ', increment_display);
    };


    // POST or GET, with payload, to communicate 
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

}


