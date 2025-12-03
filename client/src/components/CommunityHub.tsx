import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, ThumbsUp, Users, TrendingUp, Search, Filter, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ForumPost {
  id: string;
  author: string;
  avatar?: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  replies: number;
  views: number;
  timestamp: string;
  isPinned?: boolean;
  isSolved?: boolean;
}

interface ChatMessage {
  id: string;
  author: string;
  avatar?: string;
  message: string;
  timestamp: string;
  isSupport?: boolean;
}

export function CommunityHub() {
  const [selectedTab, setSelectedTab] = useState("forum");
  const [chatMessage, setChatMessage] = useState("");

  const forumPosts: ForumPost[] = [
    {
      id: "1",
      author: "Aisha Mohammed",
      avatar: "/api/placeholder/40/40",
      title: "Best practices for sorting plastic waste?",
      content: "I've been collecting for 2 months now and want to improve my sorting efficiency...",
      category: "Tips & Tricks",
      likes: 24,
      replies: 8,
      views: 156,
      timestamp: "2 hours ago",
      isPinned: true
    },
    {
      id: "2",
      author: "Emmanuel Adeyemi",
      avatar: "/api/placeholder/40/40",
      title: "How to reach Level 5 quickly?",
      content: "Looking for advice on the fastest way to level up. Currently at Level 3...",
      category: "Questions",
      likes: 18,
      replies: 12,
      views: 203,
      timestamp: "5 hours ago",
      isSolved: true
    },
    {
      id: "3",
      author: "Fatima Bello",
      avatar: "/api/placeholder/40/40",
      title: "New vendor partnership in Kano!",
      content: "Excited to announce a new recycling center just opened near Sabon Gari market...",
      category: "News",
      likes: 45,
      replies: 15,
      views: 387,
      timestamp: "1 day ago"
    },
    {
      id: "4",
      author: "Chukwudi Okafor",
      avatar: "/api/placeholder/40/40",
      title: "KOBO withdrawal taking longer than usual?",
      content: "Has anyone experienced delays in bank transfers this week?...",
      category: "Support",
      likes: 9,
      replies: 6,
      views: 94,
      timestamp: "3 hours ago"
    }
  ];

  const liveChat: ChatMessage[] = [
    {
      id: "1",
      author: "Support Team",
      message: "Welcome to KudiChain Community Chat! How can we help you today?",
      timestamp: "10:00 AM",
      isSupport: true
    },
    {
      id: "2",
      author: "Ibrahim Y.",
      avatar: "/api/placeholder/40/40",
      message: "Hi! Quick question about payment processing times",
      timestamp: "10:02 AM"
    },
    {
      id: "3",
      author: "Support Team",
      message: "Happy to help! KOBO payments are typically instant. Bank transfers take 2-5 minutes. Are you experiencing a delay?",
      timestamp: "10:03 AM",
      isSupport: true
    },
    {
      id: "4",
      author: "Ngozi O.",
      avatar: "/api/placeholder/40/40",
      message: "Just hit Level 8! 🎉",
      timestamp: "10:05 AM"
    }
  ];

  const categories = [
    { name: "All", count: 156 },
    { name: "Tips & Tricks", count: 42 },
    { name: "Questions", count: 38 },
    { name: "News", count: 24 },
    { name: "Support", count: 52 }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-4">
            Community Hub
          </h2>
          <p className="text-muted-foreground text-lg">
            Connect, learn, and grow together with fellow collectors
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Members", value: "1,247", icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Forum Posts", value: "2,456", icon: MessageSquare, color: "from-green-500 to-green-600" },
            { label: "Solved Issues", value: "892", icon: TrendingUp, color: "from-purple-500 to-purple-600" },
            { label: "Online Now", value: "89", icon: AlertCircle, color: "from-orange-500 to-orange-600" }
          ].map((stat, idx) => (
            <Card key={idx} className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="font-bold text-2xl mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-grid md:grid-cols-2">
            <TabsTrigger value="forum" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <Send className="h-4 w-4" />
              Live Chat
            </TabsTrigger>
          </TabsList>

          {/* Forum Tab */}
          <TabsContent value="forum" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search discussions..." className="pl-10" />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-2">
                <MessageSquare className="h-4 w-4" />
                New Post
              </Button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button key={cat.name} variant="outline" size="sm" className="gap-2">
                  {cat.name}
                  <Badge variant="secondary" className="ml-1">{cat.count}</Badge>
                </Button>
              ))}
            </div>

            {/* Forum Posts */}
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className="hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={post.avatar} alt={post.author} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                          {post.author.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-lg">{post.title}</h3>
                              {post.isPinned && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  Pinned
                                </Badge>
                              )}
                              {post.isSolved && (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                  Solved
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              by <span className="font-medium">{post.author}</span> • {post.timestamp}
                            </p>
                          </div>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </button>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.replies} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{post.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat">
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    Live Community Chat
                  </span>
                  <Badge variant="secondary">89 online</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {/* Chat Messages */}
                <div className="space-y-4 mb-6 h-[400px] overflow-y-auto">
                  {liveChat.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.isSupport ? 'bg-primary/5 -mx-6 px-6 py-3' : ''}`}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={msg.avatar} alt={msg.author} />
                        <AvatarFallback className={msg.isSupport ? "bg-primary text-white" : "bg-gradient-to-br from-green-500 to-blue-600 text-white"}>
                          {msg.author.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.author}</span>
                          {msg.isSupport && (
                            <Badge variant="secondary" className="bg-primary text-white text-xs">
                              Support
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && chatMessage.trim()) {
                        setChatMessage("");
                        // Handle send
                      }
                    }}
                  />
                  <Button size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Be respectful and follow our community guidelines
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
