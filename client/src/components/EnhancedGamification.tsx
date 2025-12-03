import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Target, Zap, Crown, Star, TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  progress?: number;
  unlocked: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  wasteCollected: string;
  trend: "up" | "down" | "same";
  isCurrentUser?: boolean;
}

export function EnhancedGamification() {
  const badges: Badge[] = [
    {
      id: "1",
      name: "First Drop",
      description: "Complete your first waste collection",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      rarity: "common",
      progress: 100,
      unlocked: true
    },
    {
      id: "2",
      name: "Week Warrior",
      description: "Collect waste for 7 consecutive days",
      icon: Zap,
      color: "from-purple-500 to-purple-600",
      rarity: "rare",
      progress: 85,
      unlocked: false
    },
    {
      id: "3",
      name: "Eco Champion",
      description: "Collect 1,000kg of waste",
      icon: Award,
      color: "from-green-500 to-green-600",
      rarity: "epic",
      progress: 60,
      unlocked: false
    },
    {
      id: "4",
      name: "KOBO King",
      description: "Earn 100,000 KOBO tokens",
      icon: Crown,
      color: "from-yellow-500 to-orange-600",
      rarity: "legendary",
      progress: 45,
      unlocked: false
    },
    {
      id: "5",
      name: "Top Performer",
      description: "Rank in top 10 on leaderboard",
      icon: Trophy,
      color: "from-pink-500 to-red-600",
      rarity: "epic",
      progress: 30,
      unlocked: false
    },
    {
      id: "6",
      name: "Team Player",
      description: "Refer 5 active collectors",
      icon: Users,
      color: "from-indigo-500 to-purple-600",
      rarity: "rare",
      progress: 40,
      unlocked: false
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "Aisha Mohammed", avatar: "/api/placeholder/40/40", points: 15420, wasteCollected: "2,340 kg", trend: "up" },
    { rank: 2, name: "Chukwudi Okafor", avatar: "/api/placeholder/40/40", points: 14850, wasteCollected: "2,180 kg", trend: "up" },
    { rank: 3, name: "Fatima Bello", avatar: "/api/placeholder/40/40", points: 13990, wasteCollected: "2,050 kg", trend: "down" },
    { rank: 4, name: "Emmanuel Adeyemi", avatar: "/api/placeholder/40/40", points: 12750, wasteCollected: "1,890 kg", trend: "same" },
    { rank: 5, name: "You", points: 11200, wasteCollected: "1,650 kg", trend: "up", isCurrentUser: true },
    { rank: 6, name: "Ibrahim Yusuf", avatar: "/api/placeholder/40/40", points: 10850, wasteCollected: "1,580 kg", trend: "up" },
    { rank: 7, name: "Ngozi Okonkwo", avatar: "/api/placeholder/40/40", points: 9940, wasteCollected: "1,450 kg", trend: "down" },
    { rank: 8, name: "Ahmed Balarabe", avatar: "/api/placeholder/40/40", points: 9320, wasteCollected: "1,380 kg", trend: "up" },
  ];

  const rarityColors = {
    common: "bg-gray-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-yellow-500"
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Achievement Badges */}
          <div>
            <div className="mb-8">
              <h2 className="font-outfit font-bold text-3xl md:text-4xl mb-3">
                Achievement Badges
              </h2>
              <p className="text-muted-foreground">
                Unlock exclusive rewards as you progress
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    badge.unlocked ? "border-primary shadow-lg hover:shadow-xl" : "border-dashed hover:border-primary/50"
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${badge.color}`} />
                  
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center ${
                        badge.unlocked ? "shadow-lg" : "opacity-50"
                      }`}>
                        <badge.icon className="h-7 w-7 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`${rarityColors[badge.rarity]} text-white text-xs`}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {badge.description}
                    </p>
                    
                    {!badge.unlocked && badge.progress !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Progress</span>
                          <span className="text-xs font-bold text-primary">{badge.progress}%</span>
                        </div>
                        <Progress value={badge.progress} className="h-2" />
                      </div>
                    )}
                    
                    {badge.unlocked && (
                      <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                        <Star className="h-4 w-4 fill-current" />
                        <span>Unlocked!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stats Summary */}
            <Card className="mt-6 border-2 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">2/6</div>
                    <div className="text-xs text-muted-foreground">Unlocked</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">4</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">85%</div>
                    <div className="text-xs text-muted-foreground">Next Badge</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="mb-8">
              <h2 className="font-outfit font-bold text-3xl md:text-4xl mb-3">
                Global Leaderboard
              </h2>
              <p className="text-muted-foreground">
                Compete with top collectors worldwide
              </p>
            </div>

            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    Top Performers This Month
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        entry.isCurrentUser ? "bg-primary/5 border-l-4 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          entry.rank === 1 ? "bg-yellow-500 text-white" :
                          entry.rank === 2 ? "bg-gray-400 text-white" :
                          entry.rank === 3 ? "bg-orange-600 text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {entry.rank}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-12 h-12 border-2 border-background">
                          <AvatarImage src={entry.avatar} alt={entry.name} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                            {entry.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate">{entry.name}</p>
                            {entry.isCurrentUser && (
                              <Badge variant="default" className="text-xs">You</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {entry.wasteCollected}
                          </p>
                        </div>

                        {/* Points & Trend */}
                        <div className="text-right">
                          <div className="font-bold text-lg mb-1">
                            {entry.points.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className={`h-3 w-3 ${
                              entry.trend === "up" ? "text-green-600 rotate-0" :
                              entry.trend === "down" ? "text-red-600 rotate-180" :
                              "text-gray-400 rotate-90"
                            }`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Stats */}
            <Card className="mt-6 border-2 border-primary">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Rank</span>
                    <span className="font-bold text-xl text-primary">#5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Points to #4</span>
                    <span className="font-bold">1,550 pts</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  <p className="text-xs text-center text-muted-foreground">
                    Collect 220kg more to move up!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
