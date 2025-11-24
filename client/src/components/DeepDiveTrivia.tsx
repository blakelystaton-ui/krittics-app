import { useState, useEffect } from "react";
import { Check, X, Trophy, RotateCcw, Sparkles, Film, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdSense } from "@/components/AdSense";
import type { GeneratedTriviaQuestion } from "@shared/schema";

interface DeepDiveTriviaProps {
  movieTitle: string;
  questions: GeneratedTriviaQuestion[];
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
  onRestart: () => void;
  onPlayRandomMovie?: () => void;
  onClose?: () => void;
}

export function DeepDiveTrivia({
  movieTitle,
  questions,
  isGenerating,
  error,
  onGenerate,
  onRestart,
  onPlayRandomMovie,
  onClose,
}: DeepDiveTriviaProps) {
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameStatus, setGameStatus] = useState<"initial" | "playing" | "finished">("initial");
  const [showAd, setShowAd] = useState(false);
  const [upNextCountdown, setUpNextCountdown] = useState(60);

  const currentQuestion = questions?.[currentQuestionIndex];

  // 60-second countdown on initial screen - auto-plays random movie when reaches 0
  useEffect(() => {
    if (gameStatus === "initial" && !isGenerating && !error) {
      // Reset countdown to 60 whenever we enter the initial state
      setUpNextCountdown(60);
      console.log("[Trivia] Starting 60-second countdown on initial screen");
      
      const interval = setInterval(() => {
        setUpNextCountdown((prev) => {
          if (prev <= 1) {
            // Clear interval before navigation
            clearInterval(interval);
            
            console.log("[Trivia] Countdown reached 0 → autoplaying random movie");
            
            // Defer navigation to next tick to avoid React warning
            setTimeout(() => {
              // Always reset state before navigation
              if (onClose) onClose();
              
              // Auto-play random movie when countdown reaches 0
              try {
                if (onPlayRandomMovie) {
                  onPlayRandomMovie();
                } else {
                  setLocation("/");
                }
              } catch (error) {
                console.error("[Trivia] Error playing random movie:", error);
                // Still navigate away on error
                setLocation("/");
              }
            }, 0);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStatus, isGenerating, error, onPlayRandomMovie, onClose, setLocation]);

  const handleAnswer = (option: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedAnswer || !currentQuestion) return; // Prevent double-clicking and ensure question exists

    // Remove focus from the button to prevent grey highlight on next question
    (event.currentTarget as HTMLButtonElement).blur();

    setSelectedAnswer(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (questions && currentQuestionIndex < questions.length - 1) {
        // Show ad after 3rd question (index 2)
        if (currentQuestionIndex === 2) {
          setShowAd(true);
          // Wait 3 seconds for ad, then continue
          setTimeout(() => {
            setShowAd(false);
            setCurrentQuestionIndex((i) => i + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
          }, 3000);
        } else {
          setCurrentQuestionIndex((i) => i + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
        }
      } else {
        setGameStatus("finished");
      }
    }, 1500);
  };

  const handleStart = () => {
    if (questions && questions.length > 0) {
      setGameStatus("playing");
      setScore(0);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      onGenerate();
    }
  };

  const handleRestart = () => {
    setGameStatus("initial");
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    onRestart();
  };

  // Loading state
  if (isGenerating) {
    return (
      <Card className="mx-auto max-w-4xl overflow-hidden">
        <div className="teal-gradient-bg p-12 text-center">
          <div className="teal-icon-glow mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <Sparkles className="h-12 w-12 animate-pulse text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            Generating Deep Dive Trivia
          </h3>
          <p className="mt-2 text-base text-muted-foreground">
            Creating unique questions for <span className="font-semibold text-foreground">{movieTitle}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">This may take a few seconds...</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="mx-auto max-w-4xl border-destructive bg-destructive/5 p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <X className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-display text-xl font-bold text-destructive">Trivia Generation Failed</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button onClick={onGenerate} variant="destructive" className="mt-6" data-testid="button-retry">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Initial state - merged with countdown
  if (gameStatus === "initial") {
    return (
      <Card className="mx-auto max-w-4xl overflow-hidden">
        <div className="teal-gradient-bg p-4 sm:p-8 md:p-12 text-center">
          {/* Trophy icon - smaller on mobile */}
          <div className="teal-icon-subtle mx-auto mb-3 sm:mb-4 md:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          
          {/* Title - responsive font sizes */}
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground">
            End-of-Movie Deep Dive Trivia
          </h3>
          
          {/* Description - responsive font sizes */}
          <p className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Test your recall on <span className="font-semibold text-foreground">{movieTitle}</span>'s plot, quotes, and
            behind-the-scenes facts.
          </p>
          
          {/* Countdown timer - compact on mobile */}
          <div className="mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 md:mb-8">
            <p className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground mb-1 sm:mb-2" data-testid="text-countdown">
              Up next in {upNextCountdown} seconds...
            </p>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              We'll start playing a random movie for you
            </p>
          </div>

          {/* Three buttons - stack on mobile, responsive padding and text */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={handleStart}
              className="gradient-border-button"
              data-testid="button-start-game"
            >
              <span className="gradient-border-content px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 text-sm sm:text-base md:text-lg font-bold">
                <Sparkles className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 inline-block" />
                Start Trivia Now
              </span>
            </button>
            <button
              onClick={() => {
                // Always reset state before navigation
                if (onClose) onClose();
                
                if (onPlayRandomMovie) {
                  onPlayRandomMovie();
                } else {
                  setLocation("/");
                }
              }}
              className="gradient-border-button"
              data-testid="button-continue-watching-next"
            >
              <span className="gradient-border-content px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 text-sm sm:text-base md:text-lg font-bold">
                <Film className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 inline-block" />
                Continue watching
              </span>
            </button>
            <button
              onClick={() => {
                console.log("[Trivia] User clicked Back to Browse → navigating to Browse");
                if (onClose) onClose();
                setLocation("/");
              }}
              className="gradient-border-button"
              data-testid="button-back-to-browse"
            >
              <span className="gradient-border-content px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 text-sm sm:text-base md:text-lg font-bold">
                <ArrowLeft className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 inline-block" />
                Back to Browse
              </span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Finished state
  if (gameStatus === "finished") {
    const percentage = questions && questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    let tier: string;
    let tierColor: string;
    let tierMessage: string;

    if (percentage === 100) {
      tier = "Perfect Score!";
      tierColor = "var(--teal)";
      tierMessage = "You're a true cinema expert!";
    } else if (percentage >= 80) {
      tier = "Expert Critic!";
      tierColor = "var(--teal)";
      tierMessage = "Impressive knowledge of the film!";
    } else if (percentage >= 60) {
      tier = "Movie Buff";
      tierColor = "hsl(var(--foreground))";
      tierMessage = "Good job! Keep watching!";
    } else {
      tier = "Keep Watching";
      tierColor = "hsl(var(--muted-foreground))";
      tierMessage = "Practice makes perfect!";
    }

    return (
      <Card className="mx-auto max-w-4xl overflow-hidden">
        <div className="teal-gradient-bg p-4 sm:p-8 md:p-12 text-center">
          {/* Trophy icon - smaller on mobile */}
          <div className="teal-icon-subtle mx-auto mb-3 sm:mb-4 md:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
          </div>
          
          {/* Tier title - responsive */}
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold" style={{ color: tierColor }}>{tier}</h3>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">{tierMessage}</p>

          {/* Score display - responsive */}
          <div className="mx-auto mt-4 sm:mt-6 md:mt-8 max-w-md">
            <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-12">
              <div>
                <div className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold" style={{ color: 'var(--teal)' }} data-testid="text-final-score">
                  {score}/{questions?.length || 0}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div>
                <div className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground" data-testid="text-percentage">
                  {percentage}%
                </div>
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Buttons - responsive */}
          <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={handleRestart}
              className="gradient-border-button"
              data-testid="button-play-again"
            >
              <span className="gradient-border-content px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium">
                <RotateCcw className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 inline-block" />
                Play Again
              </span>
            </button>
            <button
              onClick={() => setLocation("/")}
              className="gradient-border-button"
              data-testid="button-back-to-browse"
            >
              <span className="gradient-border-content px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium">
                <Film className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 inline-block" />
                Browse
              </span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Playing state - ensure we have a valid current question
  if (!currentQuestion) {
    return null;
  }

  return (
    <>
    <Card className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {questions && Array.from({ length: questions.length }).map((_, index) => (
            <div
              key={index}
              className="h-2 w-8 rounded-full transition-all"
              style={{
                backgroundColor: index < currentQuestionIndex
                  ? '#1ba9af'
                  : index === currentQuestionIndex
                  ? 'rgba(27, 169, 175, 0.5)'
                  : 'rgba(27, 169, 175, 0.15)'
              }}
              data-testid={`progress-dot-${index}`}
            />
          ))}
        </div>
        <div className="text-sm font-medium text-muted-foreground" data-testid="text-question-counter">
          Question {currentQuestionIndex + 1}/{questions?.length || 0}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-display text-2xl font-bold leading-relaxed text-foreground" data-testid="text-question">
          {currentQuestion.question}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === currentQuestion.correctAnswer;
          const showFeedback = selectedAnswer !== null;

          return (
            <button
              key={index}
              className="gradient-border-button min-h-[4rem] text-left"
              onClick={(e) => handleAnswer(option, e)}
              disabled={selectedAnswer !== null}
              data-testid={`button-option-${index}`}
            >
              <span 
                className="gradient-border-content px-4 py-3 justify-start w-full"
                style={
                  showFeedback && isSelected && isCorrect
                    ? { backgroundColor: '#1ba9af', color: 'white' }
                    : showFeedback && isSelected && !isCorrect
                    ? { backgroundColor: 'hsl(var(--destructive))', color: 'white' }
                    : showFeedback && isCorrectOption
                    ? { backgroundColor: 'rgba(27, 169, 175, 0.2)', color: '#1ba9af' }
                    : undefined
                }
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex-1 font-medium text-base">{option}</span>
                  {showFeedback && isSelected && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                    </div>
                  )}
                  {showFeedback && !isSelected && isCorrectOption && (
                    <Check className="h-5 w-5 flex-shrink-0" />
                  )}
                </div>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground">
          Score: <span className="font-bold text-foreground" data-testid="text-current-score">{score}</span>
        </div>
      </div>
    </Card>

    {showAd && (
      <div className="mx-auto max-w-4xl mt-6">
        <AdSense 
          adSlot="5966285343"
          className="my-4 flex items-center justify-center min-h-[200px] bg-card/50 rounded-lg p-4"
        />
      </div>
    )}
  </>
  );
}
