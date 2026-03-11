import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi là CoinSight AI. Tôi có thể giúp bạn phân tích thị trường và kiến thức crypto.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==========================
  // SEND MESSAGE
  // ==========================
  const handleSend = async () => {

    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();

    const userMessage: Message = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const botId = Date.now() + 1;

    const botMessage: Message = {
      id: botId,
      text: '',
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userText
          })
        }
      );

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();

      const reply = data.reply || 'AI không có phản hồi.';

      setMessages(prev =>
        prev.map(msg =>
          msg.id === botId
            ? { ...msg, text: reply }
            : msg
        )
      );

    } catch (error) {

      setMessages(prev =>
        prev.map(msg =>
          msg.id === botId
            ? { ...msg, text: '⚠️ Không thể kết nối tới server.' }
            : msg
        )
      );

    } finally {
      setIsTyping(false);
    }

  };

  // ==========================
  // QUICK QUESTIONS
  // ==========================
  const quickQuestions = [
    'Giá BTC bao nhiêu?',
    'EMA Crossover là gì?',
    'Rủi ro khi trade?'
  ];

  // ==========================
  // OPEN BUTTON
  // ==========================
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#9EEC37] text-black shadow-lg"
      >
        <Bot className="h-7 w-7" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-black/10 bg-white shadow-2xl ${
        isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'
      }`}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-black/10 bg-[#9EEC37] p-4">

        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-black" />
          <div>
            <div className="font-bold text-black">
              CoinSight AI
            </div>
            <div className="text-xs text-black/70">
              AI phân tích thị trường
            </div>
          </div>
        </div>

        <div className="flex gap-2">

          <button onClick={() => setIsMinimized(!isMinimized)}>
            <Minimize2 className="h-4 w-4" />
          </button>

          <button onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </button>

        </div>

      </div>

      {!isMinimized && (
        <>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {messages.map((message) => (

              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-[#9EEC37]'
                      : 'bg-black/5'
                  }`}
                >

                  <p className="whitespace-pre-wrap text-sm">
                    {message.text}
                  </p>

                </div>

              </div>

            ))}

            {isTyping && (
              <div className="text-sm text-gray-400">
                AI đang trả lời...
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* INPUT */}
          <div className="border-t p-4 flex gap-2">

            <input
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === 'Enter' && handleSend()
              }
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Nhập câu hỏi..."
            />

            <button
              onClick={handleSend}
              className="bg-[#9EEC37] px-4 rounded-lg"
            >
              <Send size={16} />
            </button>

          </div>

        </>
      )}
    </div>
  );
} 