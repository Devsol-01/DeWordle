"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Trophy, Target, Clock, Flame, BarChart3, Award, Crown, Calendar, Zap } from "lucide-react"
import type { StatsResponse, PlayerStats, DifficultyStats, GameSession, Milestone } from "@/types/stats"

interface AnimatedStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  color?: string
  animate?: boolean
}

function AnimatedStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
  animate = true,
}: AnimatedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === "string" ? Number.parseFloat(value) || 0 : value

  useEffect(() => {
    if (!animate || typeof value === "string") return

    let start = 0
    const end = numericValue
    const duration = 1000
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [numericValue, animate])

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />
    if (trend === "down") return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
    return null
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`text-${color}-600`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {animate && typeof value === "number" ? displayValue.toLocaleString() : value}
          {getTrendIcon()}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

interface StatsChartProps {
  difficultyStats: DifficultyStats[]
  recentGames: GameSession[]
}

function StatsCharts({ difficultyStats, recentGames }: StatsChartProps) {
  const difficultyChartData = difficultyStats.map((stat) => ({
    difficulty: stat.level,
    winRate: stat.winRate,
    gamesPlayed: stat.gamesPlayed,
    averageAttempts: stat.averageAttempts,
  }))

  const recentPerformanceData = recentGames
    .slice(0, 10)
    .reverse()
    .map((game, index) => ({
      game: index + 1,
      attempts: game.attempts,
      score: game.score,
      won: game.won,
    }))

  const difficultyDistribution = difficultyStats.map((stat) => ({
    name: stat.level,
    value: stat.gamesPlayed,
    color: {
      easy: "#22c55e",
      normal: "#eab308",
      hard: "#f97316",
      expert: "#ef4444",
    }[stat.level],
  }))

  return (
    <div className="space-y-6">
      {/* Win Rate by Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Difficulty</CardTitle>
          <CardDescription>Win rate and average attempts across difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              winRate: {
                label: "Win Rate (%)",
                color: "hsl(var(--chart-1))",
              },
              averageAttempts: {
                label: "Avg Attempts",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="difficulty" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="winRate" fill="var(--color-winRate)" name="Win Rate (%)" />
                <Bar dataKey="averageAttempts" fill="var(--color-averageAttempts)" name="Avg Attempts" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>Your last 10 games performance trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              score: {
                label: "Score",
                color: "hsl(var(--chart-1))",
              },
              attempts: {
                label: "Attempts",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} />
                <Line type="monotone" dataKey="attempts" stroke="var(--color-attempts)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Games Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Games by Difficulty</CardTitle>
          <CardDescription>Distribution of games played across difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              easy: { label: "Easy", color: "#22c55e" },
              normal: { label: "Normal", color: "#eab308" },
              hard: { label: "Hard", color: "#f97316" },
              expert: { label: "Expert", color: "#ef4444" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

interface MilestonesGridProps {
  milestones: Milestone[]
}

function MilestonesGrid({ milestones }: MilestonesGridProps) {
  const categories = ["games", "streaks", "speed", "difficulty", "score"] as const

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryMilestones = milestones.filter((m) => m.category === category)
        if (categoryMilestones.length === 0) return null

        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
              {category === "games" && <Target className="h-5 w-5" />}
              {category === "streaks" && <Flame className="h-5 w-5" />}
              {category === "speed" && <Zap className="h-5 w-5" />}
              {category === "difficulty" && <Trophy className="h-5 w-5" />}
              {category === "score" && <Award className="h-5 w-5" />}
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryMilestones.map((milestone) => (
                <Card
                  key={milestone.id}
                  className={`relative ${milestone.achieved ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{milestone.icon}</span>
                        <CardTitle className="text-sm">{milestone.title}</CardTitle>
                      </div>
                      {milestone.achieved && <Badge variant="default">Completed</Badge>}
                    </div>
                    <CardDescription className="text-xs">{milestone.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>
                          {milestone.progress}/{milestone.target}
                        </span>
                      </div>
                      <Progress value={(milestone.progress / milestone.target) * 100} className="h-2" />
                      {milestone.achieved && milestone.achievedAt && (
                        <div className="text-xs text-green-600">
                          Achieved: {new Date(milestone.achievedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface GlobalRankingProps {
  playerStats: PlayerStats
}

function GlobalRanking({ playerStats }: GlobalRankingProps) {
  // Mock global ranking data - in real app, this would come from API
  const mockRankings = [
    { category: "overall", rank: 1247, totalPlayers: 15420, percentile: 91.9 },
    { category: "winRate", rank: 892, totalPlayers: 15420, percentile: 94.2 },
    { category: "streak", rank: 2156, totalPlayers: 15420, percentile: 86.0 },
    { category: "speed", rank: 3421, totalPlayers: 15420, percentile: 77.8 },
    { category: "score", rank: 756, totalPlayers: 15420, percentile: 95.1 },
  ]

  const getRankColor = (percentile: number) => {
    if (percentile >= 95) return "text-yellow-600"
    if (percentile >= 90) return "text-green-600"
    if (percentile >= 75) return "text-blue-600"
    return "text-gray-600"
  }

  const getRankIcon = (percentile: number) => {
    if (percentile >= 95) return <Crown className="h-4 w-4 text-yellow-600" />
    if (percentile >= 90) return <Trophy className="h-4 w-4 text-green-600" />
    if (percentile >= 75) return <Award className="h-4 w-4 text-blue-600" />
    return <BarChart3 className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Global Rankings</h3>
        <p className="text-sm text-gray-600">See how you stack up against other players worldwide</p>
      </div>

      <div className="grid gap-4">
        {mockRankings.map((ranking) => (
          <Card key={ranking.category}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(ranking.percentile)}
                  <div>
                    <div className="font-medium capitalize">{ranking.category}</div>
                    <div className="text-sm text-gray-600">
                      Rank #{ranking.rank.toLocaleString()} of {ranking.totalPlayers.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getRankColor(ranking.percentile)}`}>{ranking.percentile}%</div>
                  <div className="text-xs text-gray-500">percentile</div>
                </div>
              </div>
              <Progress value={ranking.percentile} className="mt-3 h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function StatsDashboard() {
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStatsData(data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchStats()
    }
  }, [isOpen])

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <BarChart3 className="h-4 w-4" />
            Stats
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Stats...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!statsData) {
    return null
  }

  const { playerStats, difficultyStats, recentGames, milestones } = statsData

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <BarChart3 className="h-4 w-4" />
          Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Personal Stats Dashboard
          </DialogTitle>
          <DialogDescription>Track your progress and achievements in Dewordle</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatedStatCard
                title="Total Games"
                value={playerStats.totalGames}
                icon={<Target className="h-4 w-4" />}
                color="blue"
              />
              <AnimatedStatCard
                title="Win Rate"
                value={`${playerStats.winRate.toFixed(1)}%`}
                icon={<Trophy className="h-4 w-4" />}
                color="green"
                trend={playerStats.winRate > 50 ? "up" : "down"}
              />
              <AnimatedStatCard
                title="Current Streak"
                value={playerStats.currentStreak}
                subtitle={`Best: ${playerStats.bestStreak}`}
                icon={<Flame className="h-4 w-4" />}
                color="orange"
              />
              <AnimatedStatCard
                title="Best Score"
                value={playerStats.bestScore.toLocaleString()}
                subtitle={`Total: ${playerStats.totalScore.toLocaleString()}`}
                icon={<Award className="h-4 w-4" />}
                color="purple"
              />
            </div>

            <Separator />

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Attempts:</span>
                    <span className="font-bold">{playerStats.averageAttempts.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Time:</span>
                    <span className="font-bold">
                      {Math.floor(playerStats.averageTime / 60)}:
                      {(playerStats.averageTime % 60).toFixed(0).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Games Won:</span>
                    <span className="font-bold text-green-600">{playerStats.gamesWon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Games Lost:</span>
                    <span className="font-bold text-red-600">{playerStats.gamesLost}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Last Played:</span>
                    <span className="font-bold">
                      {playerStats.lastPlayed ? new Date(playerStats.lastPlayed).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Member Since:</span>
                    <span className="font-bold">{new Date(playerStats.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recent Games:</span>
                    <span className="font-bold">{recentGames.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Difficulty Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {difficultyStats.map((stat) => (
                    <div key={stat.level} className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold capitalize mb-2">{stat.level}</div>
                      <div className="space-y-1 text-sm">
                        <div>Games: {stat.gamesPlayed}</div>
                        <div>Win Rate: {stat.winRate.toFixed(1)}%</div>
                        <div>Avg Attempts: {stat.averageAttempts.toFixed(1)}</div>
                        <div>Best Score: {stat.bestScore.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <StatsCharts difficultyStats={difficultyStats} recentGames={recentGames} />
          </TabsContent>

          <TabsContent value="milestones">
            <MilestonesGrid milestones={milestones} />
          </TabsContent>

          <TabsContent value="rankings">
            <GlobalRanking playerStats={playerStats} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
