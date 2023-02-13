import { useState, useEffect, useRef } from "react";
import RollingDigits from "./RollingDigits";
import './BishButton.css';
import 'bootstrap/dist/css/bootstrap.min.css';



export default function BishButton_v2() {
    const endpoint = 'https://1c104v13x0.execute-api.us-east-1.amazonaws.com/v1/counter';
    const
        TIMEOUT_IN = 10,
        [counter_display, setCounter_display] = useState(0),        // counter_local
        [increment_display, setIncrement_display] = useState(0),    // incrementation
        [increment_tobe_posted, setIncrement_tobe_posted] = useState(0),    // New Variable

        getFrequency = 3 * 1000,     // frequency of getting latest counter
        postFrequency = 5 * 1000,     // frequency of posting increment_tobe_posted
        [TimeoutcountDown, setTimeoutCountDown] = useState(TIMEOUT_IN)    // actual TIMEOUT TIME = x * 

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

    // if there's something to post, keep posting
    useEffect(
        () => {
            console.log('theres something to post, increment_tobe_posted:', increment_tobe_posted);
            let intervalUpdateId = setInterval(
                () => {

                    if (increment_tobe_posted) {       // keep post-ing

                        updater(       // post if increment_tobe_posted != 0
                            endpoint, 'POST', { increment: increment_tobe_posted }      // posting increment_tobe_posted in {} 
                        )
                            .then((data) => {
                                console.log('\t\t\t\t\tposted increment_tobe_posted : ', increment_tobe_posted);
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
                    console.log('TimeoutcountDown: ', TimeoutcountDown);
                    if (TimeoutcountDown > 0) {
                        setTimeoutCountDown(t => t - 1);    // countDown t - 1

                        updater(endpoint, 'GET', null)
                            .then((data) => {
                                if (data > counter_display) {
                                    console.log('\t\t\t\t\tre-get/fetched. counter: (data > counter_display): ', data);
                                    setCounter_display(data);
                                } else {
                                    console.log('\t\t\t\t\tre-get/fetched. counter: (data == counter_display), data: ', data);
                                }
                            })
                            .catch(error => console.error(error));

                    }
                    else if (TimeoutcountDown <= 0) {       // timeout 以后 试着 post 一下

                        console.log('timed out');

                        increment_tobe_posted ? updater(       // post if increment_tobe_posted != 0
                            endpoint, 'POST', { increment: increment_tobe_posted }      // posting increment_tobe_posted in {} 
                        )
                            .then((data) => {
                                console.log('\tposted increment_tobe_posted : ', increment_tobe_posted);
                                setIncrement_tobe_posted(0);
                            })
                            .catch(error => console.error(error))
                            :
                            console.log('nothing to post');

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
        setTimeoutCountDown(TIMEOUT_IN);
        setCounter_display(x => x + 1);
        setIncrement_display(x => x + 1);
        setIncrement_tobe_posted(x => x + 1);
        console.log(
            'onClickHandler() : clicked  TimeoutCountDown recharged',
            '\n\tincrement_display: ', increment_display,
            '\n\tincrement_tobe_posted:', increment_tobe_posted);
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


