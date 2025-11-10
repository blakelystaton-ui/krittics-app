import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@arte/videojs-vast"; // Import VAST plugin styles/code

// Configuration: Replace with your actual Google Ad Manager VAST URL
const VAST_AD_URL = "YOUR_GOOGLE_AD_MANAGER_VAST_TAG_URL";

const MoviePlayer = ({ movie, onVideoEnded }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    // Get the stream URL from the movie data (assuming your backend provides it)
    const HLS_STREAM_URL = movie?.cloudflareStreamUrl;

    // Video.js Options setup
    const videoJsOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
            {
                src: HLS_STREAM_URL,
                type: "application/x-mpegURL", // For Cloudflare HLS streams
            },
        ],
        // This object tells Video.js to use the VAST plugin for ad insertion
        vast: {
            vastUrl: VAST_AD_URL,
            // You can add more options here (timeout, skip button, etc.)
        },
    };

    // --- Core Logic: Initialize Player and Handle Events ---
    useEffect(() => {
        // 1. Initialize Player only once
        if (videoRef.current && !playerRef.current) {
            const player = (playerRef.current = videojs(
                videoRef.current,
                videoJsOptions,
                () => {
                    console.log(
                        `Video.js Player is Ready for Movie: ${movie.title}`,
                    );
                },
            ));

            // 2. TRIVIA TRIGGER: Listen for the 'ended' event
            player.on("ended", () => {
                console.log(
                    "Movie playback ended! Triggering trivia transition.",
                );
                // Call the handler function passed down from the parent page
                onVideoEnded(movie.id);
                // Important: Dispose of the player instance to clean up memory
                player.dispose();
            });
        }

        // 3. Cleanup: Dispose the player when the component unmounts
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
        // Re-run effect if movie ID changes, ensuring the player is re-initialized for a new movie
    }, [movie?.id, onVideoEnded]);

    return (
        <div className="player-container">
            {/* The wrapper div for the Video.js player */}
            <div data-vjs-player>
                <video
                    ref={videoRef}
                    className="video-js vjs-big-play-centered"
                />
            </div>
        </div>
    );
};

export default MoviePlayer;
