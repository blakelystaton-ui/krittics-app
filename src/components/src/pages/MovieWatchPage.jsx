import React, { useState, useEffect } from "react";
import MoviePlayer from "../components/MoviePlayer";
// Assume you have functions to fetch data from your Firebase backend/API
import { getMovieData, getTriviaData } from "../api/firebaseApi";
import TriviaScreen from "../components/TriviaScreen"; // Component you will build next

const MovieWatchPage = ({ movieId }) => {
    // Assume movieId is passed via URL params/props
    const [currentMovie, setCurrentMovie] = useState(null);
    const [triviaData, setTriviaData] = useState(null);
    const [pageState, setPageState] = useState("LOADING"); // 'LOADING', 'VIDEO', 'TRIVIA'

    // --- Data Fetching ---
    useEffect(() => {
        setPageState("LOADING");
        // Fetch the movie data (which contains metadata and stream info)
        getMovieData(movieId)
            .then((data) => {
                setCurrentMovie(data);
                setPageState("VIDEO"); // Transition to video once data is ready
            })
            .catch((error) => {
                console.error("Error fetching movie data:", error);
                setPageState("ERROR");
            });
    }, [movieId]);

    // --- The Trigger Handler ---
    const handleVideoEnded = async (id) => {
        setPageState("TRIVIA_LOADING");

        // Fetch the automatically generated trivia data using the Movie ID
        const trivia = await getTriviaData(id);

        setTriviaData(trivia);
        setPageState("TRIVIA"); // Transition to the trivia screen
    };

    // --- Conditional Rendering ---
    if (pageState === "LOADING") {
        return <div className="loading-screen">Loading Krittics Movie...</div>;
    }
    if (pageState === "ERROR") {
        return <div className="error-screen">Error loading content.</div>;
    }
    if (pageState === "TRIVIA_LOADING") {
        return (
            <div className="loading-screen">
                Preparing Krittics Trivia Challenge...
            </div>
        );
    }

    // Show the Video Player when the state is 'VIDEO'
    if (pageState === "VIDEO" && currentMovie) {
        return (
            <div className="video-view">
                <h1>{currentMovie.title}</h1>
                <MoviePlayer
                    movie={currentMovie}
                    onVideoEnded={handleVideoEnded}
                />
            </div>
        );
    }

    // Show the Trivia Screen when the state is 'TRIVIA'
    if (pageState === "TRIVIA" && triviaData) {
        return <TriviaScreen trivia={triviaData} />;
    }

    return null;
};

export default MovieWatchPage;
