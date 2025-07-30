"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useOfflineGame } from "@/contexts/offline-game-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DifficultySettings } from "@/components/difficulty-settings"
import { DifficultyWarnings } from "@/components/difficulty-warnings"
import { GameTimer } from "@/components/game-timer"
import { ScoreDisplay } from "@/components/score-display"
import { useDifficulty } from "@/contexts/difficulty-context"
import { StatsDashboard } from "@/components/stats-dashboard"
import { WordHintSystem } from "@/components/word-hint-system"
import { GameHistoryViewer } from "@/components/game-history-viewer"
import { AchievementNotifications } from "@/components/achievement-notifications"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import { DailyChallenge } from "@/components/daily-challenge"
import { SocialSharing } from "@/components/social-sharing"
import { GameSettings } from "@/components/game-settings"
import { Leaderboard } from "@/components/leaderboard"
import { WordDefinition } from "@/components/word-definition"
import { GameTutorial } from "@/components/game-tutorial"
import type { Milestone } from "@/types/stats"

interface LetterBoxProps {
  letter: string
  status: "correct" | "present" | "absent" | "empty"
}

function LetterBox({ letter, status }: LetterBoxProps) {
  const getBackgroundColor = () => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white"
      case "present":
        return "bg-yellow-500 text-white"
      case "absent":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-100 border-2 border-gray-300"
    }
  }

  return (
    <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg rounded ${getBackgroundColor()}`}>
      {letter}
    </div>
  )
}

function GuessRow({
  guess,
  targetWord,
  isCurrentGuess = false,
}: {
  guess: string
  targetWord: string
  isCurrentGuess?: boolean
}) {
  const getLetterStatus = (letter: string, index: number): "correct" | "present" | "absent" | "empty" => {
    if (!letter) return "empty"
    if (isCurrentGuess) return "empty"

    if (targetWord[index]?.toLowerCase() === letter.toLowerCase()) {
      return "correct"
    } else if (targetWord.toLowerCase().includes(letter.toLowerCase())) {
      return "present"
    } else {
      return "absent"
    }
  }

  const paddedGuess = guess.padEnd(5, " ")

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 5 }).map((_, index) => (
        <LetterBox
          key={index}
          letter={paddedGuess[index] === " " ? "" : paddedGuess[index]}
          status={getLetterStatus(paddedGuess[index], index)}
        />
      ))}
    </div>
  )
}

export function OfflineGameBoard() {
  const { state, dispatch, startNewGame, makeGuess, saveGameProgress } = useOfflineGame()
  const { validateGuess, saveGameResult, resetGameState, state: difficultyState } = useDifficulty()
  const [newAchievements, setNewAchievements] = useState<Milestone[]>([])
  const [showKeyboard, setShowKeyboard] = useState(true)

  useEffect(() => {
    if (!state.currentWord && state.availableWords > 0) {
      startNewGame()
    }
  }, [state.availableWords])

  useEffect(() => {
    if (state.gameStatus !== "playing") {
      saveGameProgress()
      // Check for new achievements here
      checkForNewAchievements()
    }
  }, [state.gameStatus])

  const checkForNewAchievements = () => {
    // Mock achievement checking - in real app, this would be more sophisticated
    const mockAchievements: Milestone[] = []

    if (state.gameStatus === "won" && state.guesses.length === 1) {
      mockAchievements.push({
        id: "perfect_game",
        title: "Perfect Game",
        description: "Won in just 1 guess!",
        icon: "💎",
        achieved: true,
        progress: 1,
        target: 1,
        category: "difficulty",
      })
    }

    if (mockAchievements.length > 0) {
      setNewAchievements(mockAchievements)
    }
  }

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (state.currentGuess.length === 5) {
      const violations = validateGuess(state.currentGuess.toUpperCase(), state.guesses)
      const hasErrors = violations.some((v) => v.severity === "error")

      if (!hasErrors || !difficultyState.settings.penalizeInvalidGuesses) {
        makeGuess(state.currentGuess.toUpperCase())
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 5)
    dispatch({ type: "SET_CURRENT_GUESS", payload: value })
  }

  const handleKeyPress = (key: string) => {
    if (state.currentGuess.length < 5) {
      dispatch({ type: "SET_CURRENT_GUESS", payload: state.currentGuess + key })
    }
  }

  const handleBackspace = () => {
    dispatch({ type: "SET_CURRENT_GUESS", payload: state.currentGuess.slice(0, -1) })
  }

  const handleEnter = () => {
    if (state.currentGuess.length === 5) {
      const violations = validateGuess(state.currentGuess.toUpperCase(), state.guesses)
      const hasErrors = violations.some((v) => v.severity === "error")

      if (!hasErrors || !difficultyState.settings.penalizeInvalidGuesses) {
        makeGuess(state.currentGuess.toUpperCase())
      }
    }
  }

  const handleAchievementDismissed = (achievementId: string) => {
    setNewAchievements((prev) => prev.filter((a) => a.id !== achievementId))
  }

  if (state.availableWords === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Offline Mode Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No words are cached for offline play. Please connect to the internet to download word cache.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const gameResult =
    state.gameStatus !== "playing"
      ? {
          word: state.currentWord,
          attempts: state.guesses.length,
          maxAttempts: difficultyState.settings.maxGuesses,
          timeElapsed: Math.floor((Date.now() - state.startTime) / 1000),
          score: 0, // This would be calculated
          difficulty: difficultyState.settings.level,
          won: state.gameStatus === "won",
          guesses: state.guesses,
        }
      : undefined

  return (
    <>
      {/* Achievement Notifications */}
      <AchievementNotifications achievements={newAchievements} onAchievementDismissed={handleAchievementDismissed} />

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dewordle {state.isOffline && "(Offline)"}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <GameTutorial />
              <DifficultySettings />
              <StatsDashboard />
              <GameHistoryViewer />
              <DailyChallenge />
              <Leaderboard />
              <GameSettings />
              {gameResult && <SocialSharing gameResult={gameResult} shareType="game" />}
              {state.isOffline && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {state.availableWords} words cached
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  startNewGame()
                  resetGameState()
                }}
                className="flex items-center gap-1 bg-transparent"
              >
                <RotateCcw className="h-3 w-3" />
                New Game
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Game Board */}
          <div className="space-y-2">
            {/* Previous guesses */}
            {state.guesses.map((guess, index) => (
              <GuessRow key={index} guess={guess} targetWord={state.currentWord} />
            ))}

            {/* Current guess row */}
            {state.gameStatus === "playing" && state.guesses.length < difficultyState.settings.maxGuesses && (
              <GuessRow guess={state.currentGuess} targetWord={state.currentWord} isCurrentGuess={true} />
            )}

            {/* Empty rows */}
            {Array.from({
              length: Math.max(
                0,
                difficultyState.settings.maxGuesses - state.guesses.length - (state.gameStatus === "playing" ? 1 : 0),
              ),
            }).map((_, index) => (
              <GuessRow key={`empty-${index}`} guess="" targetWord={state.currentWord} />
            ))}
          </div>

          <GameTimer gameStatus={state.gameStatus} />
          <DifficultyWarnings />

          {/* Word Hint System */}
          <WordHintSystem
            currentWord={state.currentWord}
            guesses={state.guesses}
            gameStatus={state.gameStatus}
            onHintUsed={(cost) => {
              // Handle hint usage - could affect scoring
              console.log(`Hint used, cost: ${cost}`)
            }}
          />

          {/* Input form */}
          {state.gameStatus === "playing" && (
            <form onSubmit={handleGuessSubmit} className="space-y-2">
              <Input
                type="text"
                value={state.currentGuess}
                onChange={handleInputChange}
                placeholder="Enter your guess..."
                maxLength={5}
                className="text-center text-lg font-mono uppercase"
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={state.currentGuess.length !== 5}>
                Submit Guess
              </Button>
            </form>
          )}

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <VirtualKeyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onEnter={handleEnter}
              guesses={state.guesses}
              targetWord={state.currentWord}
              disabled={state.gameStatus !== "playing"}
            />
          )}

          {/* Game result */}
          {state.gameStatus !== "playing" && (
            <div className="text-center space-y-2">
              <div className={`text-lg font-bold ${state.gameStatus === "won" ? "text-green-600" : "text-red-600"}`}>
                {state.gameStatus === "won" ? "🎉 You Won!" : "😔 Game Over"}
              </div>
              <div className="text-sm text-gray-600">
                The word was: <span className="font-bold text-lg">{state.currentWord}</span>
              </div>
              <div className="text-xs text-gray-500">
                Guesses: {state.guesses.length}/{difficultyState.settings.maxGuesses}
              </div>
              {state.isOffline && (
                <div className="text-xs text-orange-600">Result saved locally - will sync when online</div>
              )}
            </div>
          )}

          <ScoreDisplay gameStatus={state.gameStatus} guesses={state.guesses.length} />

          {/* Word Definition */}
          <WordDefinition
            word={state.currentWord}
            gameCompleted={state.gameStatus !== "playing"}
            won={state.gameStatus === "won"}
          />
        </CardContent>
      </Card>
    </>
  )
}
