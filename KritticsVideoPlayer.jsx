// KritticsVideoPlayer.jsx

import React, { useEffect, useRef } from "react";
// We now import the library directly, which works with your framework
import videojs from "video.js";
import "video.js/dist/video-js.css";

// 1. Define the Trigger Points (Data from your old script block)
const VIDEO_TRIGGER_POINTS = [
    { time: 30, type: "ad", data_id: "AD_001", triggered: false },
    { time: 125, type: "trivia", data_id: "Q_987", triggered: false },
    { time: 350, type: "ad", data_id: "AD_002", triggered: false },
];

const TIME_TOLERANCE = 0.5;

const KritticsVideoPlayer = ({ options, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // This ensures the logic runs ONLY after the video element exists.
        if (!playerRef.current) {
            const videoElement = videoRef.current;
            if (!videoElement) return;

            // 2. Combine Initialization and Plugin Logic
            const player = (playerRef.current = videojs(
                videoElement,
                options,
                () => {
                    console.log(
                        "Video.js Player is Ready and Initialized in React!",
                    );
                },
            ));

            const triggerData = VIDEO_TRIGGER_POINTS;

            const checkTimeForTriggers = function () {
                const currentTime = player.currentTime();

                triggerData.forEach((point) => {
                    // Check if already triggered
                    if (point.triggered) return;

                    // Check if current time is within the trigger window
                    if (
                        currentTime >= point.time - TIME_TOLERANCE &&
                        currentTime < point.time + TIME_TOLERANCE
                    ) {
                        point.triggered = true;

                        // 3. PAUSE AND TRIGGER
                        player.pause();

                        console.log(
                            `[Plugin Trigger] Firing event: ${point.type} at ${point.time}s`,
                        );
                        player.trigger("krittics-trigger", point);
                    }
                });
            };

            // Attach the listener
            player.on("timeupdate", checkTimeForTriggers);

            // Set the working test source
            player.src({
                src: "https://vjs.zencdn.net/v/oceans.mp4",
                type: "video/mp4",
            });
        }

        // 4. Dispose the player when the component is unmounted (cleanup)
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [options]); // Depend on options to re-run if config changes

    // 5. RENDER the HTML video element that Video.js will attach to
    return (
        <div data-vjs-player>
            <video
                ref={videoRef}
                className="video-js vjs-default-skin"
                playsInline
                controls
            />
        </div>
    );
};

export default KritticsVideoPlayer;
