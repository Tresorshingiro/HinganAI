import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Lightbulb, Leaf, Bug, Cloud, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { agricultureChatbot } from '@/lib/agriculture-chatbot';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface QuickTip {
  category: string;
  tip: string;
}

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickTip, setQuickTip] = useState<QuickTip | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await agricultureChatbot.startNewConversation();
        // Add welcome message
        setMessages([{
          id: Date.now().toString(),
          type: 'bot',
          content: "🌱 Hello! I'm HinganAI, your agricultural advisor. I'm here to help you with farming advice, crop management, pest control, and agricultural business strategies. What farming challenge can I help you with today?",
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        setMessages([{
          id: Date.now().toString(),
          type: 'bot',
          content: "⚠️ I'm having trouble connecting right now. Please check your internet connection and try again.",
          timestamp: new Date()
        }]);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Get bot response
      const response = await agricultureChatbot.sendMessage(userMessage);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.success ? response.response! : response.error!,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const getQuickTip = async (category: 'crops' | 'soil' | 'pest' | 'weather' | 'business') => {
    setIsLoadingTip(true);
    try {
      const response = await agricultureChatbot.getQuickTip(category);
      if (response.success) {
        setQuickTip({
          category: category,
          tip: response.tip
        });
      }
    } catch (error) {
      console.error('Failed to get quick tip:', error);
    } finally {
      setIsLoadingTip(false);
    }
  };

  const quickActionButtons = [
    { icon: Leaf, label: 'Crop Tips', category: 'crops' as const, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { icon: Cloud, label: 'Weather Advice', category: 'weather' as const, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { icon: Bug, label: 'Pest Control', category: 'pest' as const, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
    { icon: DollarSign, label: 'Farm Business', category: 'business' as const, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-green-600" />
            Agriculture Chatbot
            <Badge variant="secondary" className="ml-auto">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Tips Panel */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Quick Tips & Actions</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {quickActionButtons.map((action) => (
              <Button
                key={action.category}
                variant="outline"
                size="sm"
                className={`${action.color} border-0 h-auto py-2 px-3 flex flex-col items-center gap-1`}
                onClick={() => getQuickTip(action.category)}
                disabled={isLoadingTip}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
          
          {quickTip && (
            <>
              <Separator className="my-3" />
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 capitalize">{quickTip.category} Tip</span>
                </div>
                <p className="text-sm text-green-700">{quickTip.tip}</p>
              </div>
            </>
          )}
          
          {isLoadingTip && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                <span className="ml-2 text-sm text-gray-600">Getting farming tip...</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      <span className="text-sm text-gray-600">Thinking about your farming question...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about crops, soil, pests, weather, or farming business..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                💡 Try: "How to control pests naturally?"
              </Badge>
              <Badge variant="outline" className="text-xs">
                🌱 "What crops to plant this season?"
              </Badge>
              <Badge variant="outline" className="text-xs">
                💰 "How to increase farm profit?"
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chatbot;