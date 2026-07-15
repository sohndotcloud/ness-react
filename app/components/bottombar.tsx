import React, {useEffect, useState} from "react";
import {useBar} from "~/context/bottombar-context";
import {useUserWeather} from "~/util/useUserWeather";
import blondeArt from "../assets/Blonde.jpg";
import playButton from "../assets/play.png";
import pauseButton from "../assets/pause.png";
import Timer from '~/components/timer';

export default function Bottombar() {
    const { weather, error, loading } = useUserWeather();
    const { isPlaying, setIsPlaying } = useBar();
    const [time, setTime] = useState<Date>(new Date());
    const title = "Blond";

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    function togglePlay(isPlaying: boolean, setIsPlaying: ((arg0: boolean) => void) | undefined) {
        if (setIsPlaying) {
            setIsPlaying(!isPlaying);
        }
    }

    return (
        <div className="fixed bottom-0 left-0 w-full z-20 bottom-div h-[75px] border border-gray-200 dark:border-gray-800 text-left bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center overflow-hidden relative h-full">
                <div className="w-[75px] p-4 flex-shrink-0 dark:bg-slate-900">
                    <div>
                        { isPlaying ?
                            <a><img
                                onClick={() => togglePlay(isPlaying, setIsPlaying)}
                                src={playButton}
                                alt="Play Button"
                                className="dark:block"
                            /></a>
                            :
                            <a><img
                                onClick={() => togglePlay(isPlaying, setIsPlaying)}
                                src={pauseButton}
                                alt="Pause Button"
                                className="block"
                            /></a>
                        }
                    </div>
                </div>
                <div className="animate-scroll w-[200px] dark:bg-slate-900 flex">
                    <p>{title}</p>
                </div>
                <div className="w-[150px] flex-shrink-0 dark:bg-slate-900">
                    <img src={blondeArt}
                         alt="Album art"
                         className="w-[75px] h-[75px]"
                    />
                </div>
                <div className="w-[calc(100vw-685px)]">
                    <div className="text-right">
                        { weather?.temperature !== undefined && weather?.temperature + "°F" }
                    </div>
                    <div className="text-right">
                        {time.toLocaleTimeString()}
                    </div>
                </div>

                <Timer/>
            </div>
        </div>
    )
}