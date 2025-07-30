"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Twitter, Facebook, Link, Copy, Trophy, Target, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface GameResult {
  word: string
  attempts: number
  maxAttempts: number
  timeElapsed: number
  score: number
  difficulty: string
  won: boolean
  guesses: string[]
}

interface SocialSharingProps {
  gameResult?: GameResult
  playerStats?: {
    totalGames: number
    winRate: number
    currentStreak: number
    bestStreak: number
  }
  shareType?: "game" | "stats" | "achievement"
  achievement?: {
    title: string
    description: string
    icon: string
  }
}

export function SocialSharing({ gameResult, playerStats, shareType = "game", achievement }: SocialSharingProps) {
  const [isOpen, setIsOpen] = useState(false)

  const generateGameEmoji = (guesses: string[], targetWord: string, maxAttempts: number) => {
    let emojiGrid = ""

    guesses.forEach((guess) => {
      let row = ""
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i]
        if (targetWord[i] === letter) {
          row += "🟩" // Correct position
        } else if (targetWord.includes(letter)) {
          row += "🟨" // Wrong position
        } else {
          row += "⬛" // Not in word
        }
      }
      emojiGrid += row + "\n"
    })

    // Add empty rows if didn't use all attempts
    const remainingRows = maxAttempts - guesses.length
    for (let i = 0; i < remainingRows; i++) {
      emojiGrid += "⬜⬜⬜⬜⬜\n"
    }

    return emojiGrid.trim()
  }

  const generateShareText = () => {
    if (shareType === "achievement" && achievement) {
      return `🎉 Achievement Unlocked in Dewordle!\n\n${achievement.icon} ${achievement.title}\n${achievement.description}\n\nPlay Dewordle - The decentralized word game!\n#Dewordle #Achievement #WordGame`
    }

    if (shareType === "stats" && playerStats) {
      return `📊 My Dewordle Stats:\n\n🎮 Games Played: ${playerStats.totalGames}\n🏆 Win Rate: ${playerStats.winRate.toFixed(1)}%\n🔥 Current Streak: ${playerStats.currentStreak}\n⭐ Best Streak: ${playerStats.bestStreak}\n\nPlay Dewordle - The decentralized word game!\n#Dewordle #Stats #WordGame`
    }

    if (shareType === "game" && gameResult) {
      const emojiGrid = generateGameEmoji(gameResult.guesses, gameResult.word, gameResult.maxAttempts)
      const resultText = gameResult.won ? "✅ Solved" : "❌ Failed"
      const timeText = `${Math.floor(gameResult.timeElapsed / 60)}:${(gameResult.timeElapsed % 60).toString().padStart(2, "0")}`

      return `🎯 Dewordle ${resultText}!\n\nWord: ${gameResult.word}\nAttempts: ${gameResult.attempts}/${gameResult.maxAttempts}\nTime: ${timeText}\nScore: ${gameResult.score.toLocaleString()}\nDifficulty: ${gameResult.difficulty.toUpperCase()}\n\n${emojiGrid}\n\nPlay Dewordle - The decentralized word game!\n#Dewordle #WordGame #Blockchain`
    }

    return "Check out Dewordle - The decentralized word game! #Dewordle #WordGame"
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(generateShareText())
    const url = `https://twitter.com/intent/tweet?text=${text}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareToFacebook = () => {
    const text = encodeURIComponent(generateShareText())
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText())
      toast({
        title: "Copied to clipboard!",
        description: "Share text has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      })
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Game link has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const getShareTitle = () => {
    switch (shareType) {
      case "achievement":
        return "Share Achievement"
      case "stats":
        return "Share Stats"
      case "game":
        return "Share Game Result"
      default:
        return "Share"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getShareTitle()}</DialogTitle>
          <DialogDescription>
            Share your Dewordle {shareType} with friends and challenge them to beat your score!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                {generateShareText()}
              </pre>
            </CardContent>
          </Card>

          {/* Game Summary (for game results) */}
          {shareType === "game" && gameResult && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Game Summary</h4>
                  <Badge variant={gameResult.won ? "default" : "destructive"}>
                    {gameResult.won ? "Victory" : "Defeat"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span>
                      {gameResult.attempts}/{gameResult.maxAttempts} attempts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {Math.floor(gameResult.timeElapsed / 60)}:
                      {(gameResult.timeElapsed % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3" />
                    <span>{gameResult.score.toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Difficulty:</span>
                    <Badge variant="outline" className="text-xs">
                      {gameResult.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Share Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Share Options</h4>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={shareToTwitter}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Twitter className="h-4 w-4 text-blue-500" />
                Twitter
              </Button>

              <Button
                variant="outline"
                onClick={shareToFacebook}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2 bg-transparent">
                <Copy className="h-4 w-4" />
                Copy Text
              </Button>

              <Button variant="outline" onClick={copyLink} className="flex items-center gap-2 bg-transparent">
                <Link className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="text-xs text-blue-800">
                <strong>💡 Tip:</strong> Share your results to challenge friends and grow the Dewordle community!
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
