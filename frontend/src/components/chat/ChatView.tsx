import React, { useState, useRef, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Chat, TutorConfig, Message } from '@/types';
import { Send, Clock, Bot, User, ArrowUp } from 'lucide-react';
import { subjectColors } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ChatViewProps {
  chat: Chat;
  tutor: TutorConfig;
}

const ChatView: React.FC<ChatViewProps> = ({ chat, tutor }) => {
  const { addMessage, updateChat } = useData();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const colorClass = subjectColors[tutor.subject] || subjectColors.default;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, isTyping]);

  const generateAIResponse = (userMessage: string): string => {
    const responses: Record<string, string[]> = {
      'Mathematik': [
        'Das ist eine gute Frage! Lass uns das Schritt für Schritt durchgehen...',
        'Bei dieser Art von Aufgabe ist es wichtig, zuerst die Grundlagen zu verstehen.',
        'Hier ist ein ähnliches Beispiel, das dir helfen könnte: ...',
      ],
      'Deutsch': [
        'Interessante Frage zur Textanalyse! Schauen wir uns die wichtigsten Elemente an...',
        'Bei der Interpretation ist es wichtig, auf sprachliche Mittel zu achten.',
        'Lass uns die Struktur des Textes gemeinsam analysieren.',
      ],
      'Physik': [
        'Dieses Phänomen lässt sich durch folgendes Prinzip erklären...',
        'Stelle dir vor, du würdest dieses Experiment durchführen...',
        'Die Formel, die wir hier anwenden, ist...',
      ],
      'default': [
        'Ich helfe dir gerne dabei! Hier ist meine Erklärung...',
        'Das ist ein spannendes Thema. Lass mich dir mehr darüber erzählen...',
        'Gute Frage! Hier sind die wichtigsten Punkte, die du beachten solltest...',
      ],
    };

    const subjectResponses = responses[tutor.subject] || responses['default'];
    const randomResponse = subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
    
    return `${randomResponse}\n\nBezüglich deiner Frage "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}": Das ist ein wichtiger Aspekt in ${tutor.subject}. Wenn du weitere Fragen hast, frag ruhig!`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(chat.id, userMessage);
    setInput('');
    setIsTyping(true);

    if (chat.messages.length === 0) {
      const title = input.trim().slice(0, 40) + (input.length > 40 ? '...' : '');
      updateChat(chat.id, { title });
    }

    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: generateAIResponse(input.trim()),
        timestamp: new Date(),
      };
      addMessage(chat.id, aiResponse);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card">
        <div className="text-2xl">{tutor.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{tutor.name}</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", colorClass)}>
              {tutor.subject}
            </Badge>
            {chat.isTemporary && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                Temporär
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{tutor.description}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {chat.messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">{tutor.icon}</span>
              </div>
              <h3 className="font-medium text-sm mb-1">Chat mit {tutor.name}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Stelle mir Fragen zu {tutor.subject}. Ich helfe dir gerne!
              </p>
            </div>
          ) : (
            chat.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>
                <div
                  className={cn(
                    'flex-1 max-w-[80%]',
                    message.role === 'user' ? 'text-right' : ''
                  )}
                >
                  <div
                    className={cn(
                      'inline-block rounded-2xl px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Nachricht an ${tutor.name}...`}
              className="min-h-[48px] max-h-[200px] resize-none pr-12 rounded-xl"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon-sm"
              className="absolute right-2 bottom-2 rounded-lg"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Enter zum Senden • Shift+Enter für Zeilenumbruch
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
