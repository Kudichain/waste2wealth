import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  HelpCircle,
  CreditCard,
  Package,
  TrendingUp,
  Phone,
  Minimize2,
  Maximize2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot" | "agent";
  timestamp: Date;
  quickActions?: string[];
}

const FAQ_RESPONSES: Record<string, string> = {
  "how to collect": "To start collecting waste:\n1. Sign up as a Collector\n2. Complete your profile with ID verification\n3. Link your bank account for payments\n4. View available tasks in your dashboard\n5. Accept tasks near you and start earning! 💰",
  
  "payment": "Payments are processed within 24-48 hours after waste verification. You can:\n• View your payment history in the Statements tab\n• Link your bank account in Settings\n• Withdraw funds to your bank anytime\n• Track all transactions with reference numbers",
  
  "bank account": "To link your bank account:\n1. Go to Settings/Profile\n2. Click 'Link Bank Account'\n3. Enter your account details (Bank name, Account number)\n4. Verify with OTP sent to your phone\n5. Start receiving payments directly! 🏦",
  
  "id verification": "For ID verification:\n• Upload clear photo of NIN or Voter's Card\n• Ensure all details are visible\n• Name on ID will appear on your profile\n• Verification takes 24 hours\n• Required for withdrawals",
  
  "pricing": "Waste pricing varies by type:\n• Plastic (PET): ₦1,500/kg\n• Aluminum: ₦2,100/kg\n• Glass: ₦800/kg\n• Paper: ₦600/kg\n• E-Waste: ₦3,500/kg\nPrices may vary by vendor and quality.",
  
  "become vendor": "To become a vendor:\n1. Register as Vendor on sign-up page\n2. Provide business registration details\n3. Upload business certificate\n4. Link business bank account\n5. Set waste types you accept\n6. Start receiving from collectors! 🏪",
  
  "contact": "Need human support?\n📞 Phone: +234 800 123 4567\n📧 Email: support@waste2wealth.ng\n⏰ Hours: Mon-Sat, 8AM-6PM WAT\n\nOr type 'speak to agent' to connect with our team!",
};

const QUICK_ACTIONS = [
  { label: "How to collect waste", icon: Package, key: "how to collect" },
  { label: "Payment info", icon: CreditCard, key: "payment" },
  { label: "Link bank account", icon: TrendingUp, key: "bank account" },
  { label: "ID verification", icon: User, key: "id verification" },
  { label: "Pricing", icon: CreditCard, key: "pricing" },
  { label: "Contact support", icon: Phone, key: "contact" },
];

export function SupportChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello${user ? ` ${user.username}` : ""}! 👋 I'm your Waste2Wealth AI assistant. How can I help you today?`,
      sender: "bot",
      timestamp: new Date(),
      quickActions: QUICK_ACTIONS.map(a => a.label),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Check FAQ responses
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (input.includes(key)) {
        return response;
      }
    }

    // Keyword-based responses
    if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      return "Hello! 👋 I'm here to help with any questions about Waste2Wealth. What would you like to know?";
    }
    
    if (input.includes("agent") || input.includes("human") || input.includes("person")) {
      return "I'll connect you with a human agent. Please hold on... 🙋\n\nIn the meantime, you can also reach us at:\n📞 +234 800 123 4567\n📧 support@waste2wealth.ng";
    }

    if (input.includes("thank")) {
      return "You're welcome! 😊 Is there anything else I can help you with?";
    }

    // Default response
    return "I'm not sure I understand. Could you rephrase that? Or choose from the quick actions below to get help with common topics. 🤔";
  };

  const handleSend = async (message?: string) => {
    const messageText = message || input.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Get bot response
    const botResponse = getBotResponse(messageText);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      sender: "bot",
      timestamp: new Date(),
      quickActions: messageText.toLowerCase().includes("agent") 
        ? undefined 
        : ["How to collect waste", "Payment info", "Link bank account"],
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 z-50 animate-bounce"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    );
  }

  return (
    <Card className={`fixed ${isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96 h-[600px]'} shadow-2xl z-50 transition-all duration-300`}>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                AI Support <Sparkles className="h-4 w-4" />
              </CardTitle>
              <p className="text-xs text-purple-100">Usually replies instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex gap-3 ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : "bg-gradient-to-br from-purple-500 to-indigo-500"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-green-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {message.quickActions && (
                    <div className="mt-3 ml-11 flex flex-wrap gap-2">
                      {message.quickActions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="text-xs h-8 rounded-full hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900"
                        >
                          <HelpCircle className="h-3 w-3 mr-1" />
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Powered by AI • Instant responses 24/7
            </p>
          </div>
        </CardContent>
      )}

      {isMinimized && (
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Chat minimized. Click to expand.</p>
        </CardContent>
      )}
    </Card>
  );
}
