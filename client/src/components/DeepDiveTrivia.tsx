import { useState } from "react";
import { Check, X, Trophy, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GeneratedTriviaQuestion } from "@shared/schema";

interface DeepDiveTriviaProps {
  movieTitle: string;
  questions: GeneratedTriviaQuestion[];
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
  onRestart: () => void;
}

export function DeepDiveTrivia({
  movieTitle,
  questions,
  isGenerating,
  error,
  onGenerate,
  onRestart,
}: DeepDiveTriviaProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameStatus, setGameStatus] = useState<"initial" | "playing" | "finished">("initial");

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent double-clicking

    setSelectedAnswer(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setGameStatus("finished");
      }
    }, 1500);
  };

  const handleStart = () => {
    if (questions.length > 0) {
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
      <Card className="mx-auto max-w-4xl p-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <Sparkles className="h-12 w-12 animate-pulse text-primary" />
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

  // Initial state
  if (gameStatus === "initial") {
    return (
      <Card className="mx-auto max-w-4xl p-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-display text-3xl font-extrabold text-foreground">
            End-of-Movie Deep Dive Trivia
          </h3>
          <p className="mt-4 text-lg text-muted-foreground">
            Test your recall on <span className="font-semibold text-foreground">{movieTitle}</span>'s plot, quotes, and
            behind-the-scenes facts.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="mt-8 px-8 py-6 text-lg font-bold"
            data-testid="button-start-game"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Trivia Now
          </Button>
        </div>
      </Card>
    );
  }

  // Finished state
  if (gameStatus === "finished") {
    const percentage = Math.round((score / questions.length) * 100);
    let tier: string;
    let tierColor: string;
    let tierMessage: string;

    if (percentage === 100) {
      tier = "Perfect Score!";
      tierColor = "text-primary";
      tierMessage = "You're a true cinema expert!";
    } else if (percentage >= 80) {
      tier = "Expert Critic!";
      tierColor = "text-primary";
      tierMessage = "Impressive knowledge of the film!";
    } else if (percentage >= 60) {
      tier = "Movie Buff";
      tierColor = "text-foreground";
      tierMessage = "Good job! Keep watching!";
    } else {
      tier = "Keep Watching";
      tierColor = "text-muted-foreground";
      tierMessage = "Practice makes perfect!";
    }

    return (
      <Card className="mx-auto max-w-4xl p-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <h3 className={`font-display text-4xl font-extrabold ${tierColor}`}>{tier}</h3>
          <p className="mt-2 text-lg text-muted-foreground">{tierMessage}</p>

          <div className="mx-auto mt-8 max-w-md">
            <div className="flex items-center justify-center gap-12">
              <div>
                <div className="font-display text-5xl font-extrabold text-primary" data-testid="text-final-score">
                  {score}/{questions.length}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div>
                <div className="font-display text-5xl font-extrabold text-foreground" data-testid="text-percentage">
                  {percentage}%
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="px-6"
              data-testid="button-play-again"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Playing state
  return (
    <Card className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: questions.length }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-all ${
                index < currentQuestionIndex
                  ? "bg-primary"
                  : index === currentQuestionIndex
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
              data-testid={`progress-dot-${index}`}
            />
          ))}
        </div>
        <div className="text-sm font-medium text-muted-foreground" data-testid="text-question-counter">
          Question {currentQuestionIndex + 1}/{questions.length}
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

          let buttonClasses = "h-auto min-h-[4rem] justify-start text-left p-4 font-medium text-base transition-all";

          if (showFeedback) {
            if (isSelected && isCorrect) {
              buttonClasses += " bg-primary text-primary-foreground border-primary";
            } else if (isSelected && !isCorrect) {
              buttonClasses += " bg-destructive text-destructive-foreground border-destructive";
            } else if (isCorrectOption) {
              buttonClasses += " bg-primary/20 text-primary border-primary";
            }
          } else {
            buttonClasses += " hover-elevate";
          }

          return (
            <Button
              key={index}
              variant={showFeedback ? "default" : "outline"}
              className={buttonClasses}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              data-testid={`button-option-${index}`}
            >
              <div className="flex w-full items-center justify-between gap-4">
                <span className="flex-1">{option}</span>
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
            </Button>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground">
          Score: <span className="font-bold text-foreground" data-testid="text-current-score">{score}</span>
        </div>
      </div>
    </Card>
  );
}
