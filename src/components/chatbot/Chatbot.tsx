
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { useChatbot } from '@/hooks/useChatbot';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { messages, sendMessage, isLoading } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-prisma-chartreuse hover:bg-prisma-chartreuse/90 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-prisma-purple" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-prisma-purple text-white rounded-t-lg">
        <CardTitle className="text-sm font-medium">PRISMA</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
          {messages.length === 0 && (
            <div className="space-y-2">
              <ChatMessage
                message={{
                  id: 'welcome',
                  text: 'Bonjour ! Je suis PRISMA. Comment puis-je vous aider aujourd\'hui ?',
                  isBot: true,
                  timestamp: new Date()
                }}
              />
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Actions rapides :</p>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-8"
                    onClick={() => handleQuickAction('Quels sont vos services ?')}
                  >
                    Nos services
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-8"
                    onClick={() => handleQuickAction('Comment vous contacter ?')}
                  >
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start h-8"
                    onClick={() => handleQuickAction('Demande de devis')}
                  >
                    Demande de devis
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">PRISMA écrit...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 bg-prisma-purple hover:bg-prisma-purple/90"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Chatbot;
