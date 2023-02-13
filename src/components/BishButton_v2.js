import { useState, useEffect, useRef } from "react";
import RollingDigits from "./RollingDigits";
import './BishButton.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import useSound from 'use-sound';

import bish_basic from '../wav/bish_basic.wav';
import bish_haha from '../wav/bish_haha.wav';
import bish_ogbg from '../wav/bish_ogbg.mp3';
import bish_vg from '../wav/bish_vg.mp3';


export default function BishButton_v2() {
    const endpoint = 'https://1c104v13x0.execute-api.us-east-1.amazonaws.com/v1/counter';
    const
        TIMEOUT_IN = 10,
        [counter_display, setCounter_display] = useState(0),        // counter_local
        [increment_display, setIncrement_display] = useState(0),    // incrementation
        [increment_tobe_posted, setIncrement_tobe_posted] = useState(0),    // New Variable

        getFrequency = 3 * 1000,     // frequency of getting latest counter
        postFrequency = 5 * 1000,     // frequency of posting increment_tobe_posted
        [TimeoutcountDown, setTimeoutCountDown] = useState(TIMEOUT_IN),  // actual TIMEOUT TIME = x * 

        [play_bish_basic] = useSound(bish_basic),
        [play_bish_haha] = useSound(bish_haha),
        [play_bish_ogbg] = useSound(bish_ogbg),
        [play_bish_vg] = useSound(bish_vg);


    // Update once when mount
    useEffect(
        () => {
            updater(endpoint, 'GET', null)
                .then((data) => {
                    console.log('\t\t\t\t\t\t\tinitial-get/fetched. counter: ', data);
                    setCounter_display(data);
                }).catch((error) => {
                    console.error(error);
                })
        },
        []
    );

    // if there's something to post, keep posting
    useEffect(
        () => {
            console.log('****theres something to post, increment_tobe_posted:', increment_tobe_posted);
            let intervalUpdateId = setInterval(
                () => {

                    if (increment_tobe_posted) {       // keep post-ing

                        updater(       // post if increment_tobe_posted != 0
                            endpoint, 'POST', { increment: increment_tobe_posted }      // posting increment_tobe_posted in {} 
                        )
                            .then((data) => {
                                console.log('\t\t\t\t\t\t\tposted increment_tobe_posted : ', increment_tobe_posted);
                                setIncrement_tobe_posted(0);
                            })
                            .catch(error => console.error(error));

                    }
                }, postFrequency
            );
            return () => {
                clearInterval(intervalUpdateId);
            };
        }
        , [increment_tobe_posted]
    );


    // keep polling. restart when btn clicked
    useEffect(
        () => {
            let intervalUpdateId = setInterval(
                () => {
                    console.log('TimeoutcountDown: ', TimeoutcountDown, (TimeoutcountDown < 0 ? ' but timeout\'d' : ''));
                    setTimeoutCountDown(t => t - 1);    // countDown t - 1

                    if (TimeoutcountDown > 0) {

                        updater(endpoint, 'GET', null)
                            .then((data) => {
                                if (data > counter_display) {
                                    console.log('\t\t\t\t\t\t\tre-get/fetched. counter: (data > counter_display): ', data);
                                    setCounter_display(data);
                                } else {
                                    console.log('\t\t\t\t\t\t\tre-get/fetched. counter: (data == counter_display), data: ', data);
                                }
                            })
                            .catch(error => console.error(error));

                    }
                    else if (TimeoutcountDown === 0) {       // timeout 以后 试着 post 一下

                        // post if increment_tobe_posted != 0
                        increment_tobe_posted && updater(
                            endpoint, 'POST', { increment: increment_tobe_posted }      // posting increment_tobe_posted in {} 
                        )
                            .then((data) => {
                                console.log('\tposted increment_tobe_posted : ', increment_tobe_posted);
                                setIncrement_tobe_posted(0);
                            })
                            .catch(error => console.error(error))

                    }
                }, getFrequency
            );
            return () => {
                clearInterval(intervalUpdateId);
            };
        }
        , [TimeoutcountDown]
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
            onMouseLeave={onMouseLeaveHandler}
        >
            <img src={
                require("../img/Normal.png")
                // require("../img/Angry.png")
            }></img>
        </button>
        <h3> {TimeoutcountDown < 0 ? 'Timedout. keep bishing to resume.' : null} </h3>


        <br />

    </>;
    /////////////////////////////////////////////////////

    function onMouseLeaveHandler(event) {
        increment_tobe_posted && updater(
            endpoint, 'POST', { increment: increment_tobe_posted }
        )
            .then((data) => {
                console.log('onmouseleave():\t\t\t\t\t\t\t posted increment_tobe_posted : ', increment_tobe_posted);
                setIncrement_tobe_posted(0);
            }).catch((error) => {
                console.error(error);
            });
    }

    function onClickHandler() {
        // console.log(Date.now() - last_time_bish_long.current);
        // mouse_click_time.current = Date.now()
        setTimeoutCountDown(TIMEOUT_IN);
        setCounter_display(x => x + 1);
        setIncrement_display(x => x + 1);
        setIncrement_tobe_posted(x => x + 1);
        console.log(
            'onClickHandler() : clicked  TimeoutCountDown recharged',
            '\n\tincrement_display: ', increment_display,
            '\n\tincrement_tobe_posted:', increment_tobe_posted);

        if (Math.random() > 0.75) {
            play_bish_basic();
        } else if (Math.random() > 0.5) {
            play_bish_haha();
        } else if (Math.random() > 0.25) {
            play_bish_ogbg()
        } else {
            play_bish_vg()
        }


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


