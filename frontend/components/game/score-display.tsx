"use client"

import { useDifficulty } from "@/contexts/difficulty-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, Zap } from "lucide-react"

interface ScoreDisplayProps {
  gameStatus: "playing" | "won" | "lost"
  guesses: number
}

export function ScoreDisplay({ gameStatus, guesses }: ScoreDisplayProps) {
  const { state } = useDifficulty()

  if (gameStatus === "playing") {
    return null
  }

  const difficultyMultipliers = {
    easy: 1.0,
    normal: 1.2,
    hard: 1.5,
    expert: 2.0,
  }

  const baseScore = gameStatus === "won" ? 1000 : 0
  const difficultyBonus = Math.round(baseScore * (difficultyMultipliers[state.settings.level] - 1))
  const guessBonus = gameStatus === "won" ? Math.max(0, (state.settings.maxGuesses - guesses + 1) * 100) : 0

  let timeBonus = 0
  if (state.settings.timeLimit && gameStatus === "won") {
    const timeRemaining = Math.max(0, state.settings.timeLimit - state.timeElapsed)
    timeBonus = Math.round((timeRemaining / state.settings.timeLimit) * 200)
  }

  const hardModeBonus = state.settings.hardModeEnabled && gameStatus === "won" ? Math.round(baseScore * 0.3) : 0
  const violationPenalty = state.settings.penalizeInvalidGuesses
    ? state.currentViolations.filter((v) => v.severity === "error").length * 50
    : 0

  const totalScore = Math.max(
    0,
    baseScore + difficultyBonus + guessBonus + timeBonus + hardModeBonus - violationPenalty,
  )

  if (gameStatus === "lost") {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center">
          <div className="text-lg font-bold text-gray-600 mb-2">Game Over</div>
          <div className="text-sm text-gray-500">No score awarded</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-lg">Final Score</span>
          </div>
          <Badge variant="default" className="text-lg px-3 py-1">
            {totalScore.toLocaleString()}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Score:</span>
            <span>+{baseScore.toLocaleString()}</span>
          </div>

          {difficultyBonus > 0 && (
            <div className="flex justify-between text-blue-600">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Difficulty Bonus ({state.settings.level}):
              </span>
              <span>+{difficultyBonus.toLocaleString()}</span>
            </div>
          )}

          {guessBonus > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Guess Efficiency:
              </span>
              <span>+{guessBonus.toLocaleString()}</span>
            </div>
          )}

          {timeBonus > 0 && (
            <div className="flex justify-between text-purple-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Time Bonus:
              </span>
              <span>+{timeBonus.toLocaleString()}</span>
            </div>
          )}

          {hardModeBonus > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Hard Mode Bonus:</span>
              <span>+{hardModeBonus.toLocaleString()}</span>
            </div>
          )}

          {violationPenalty > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Rule Violations:</span>
              <span>-{violationPenalty.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between font-bold">
            <span>Total Score:</span>
            <span>{totalScore.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
