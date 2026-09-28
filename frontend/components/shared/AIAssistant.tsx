'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, RefreshCw, ChevronDown, Headphones, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello! I am your MarketLink AI Assistant. Ask me about fresh crop stock, market operating hours, surplus produce discounts, or farm traceability!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const quickPrompts = [
    'Is Honeycrisp Apple in stock?',
    'What are Downtown Market hours?',
    'How does surplus produce matching work?',
    'How do I trace batch QR codes?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Generate intelligent AI response
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = '';

      if (lower.includes('stock') || lower.includes('apple') || lower.includes('tomato') || lower.includes('price')) {
        reply =
          'ðŸŽ Produce Stock & Prices Update:\n- Heirloom Tomatoes: $4.50/lb (45 lbs available, Surplus match!)\n- Honeycrisp Apples: $3.80/lb (60 lbs in stock)\n- Wildflower Raw Honey: $12.00/jar\n- Pasture Eggs: $7.50/dozen';
      } else if (lower.includes('hour') || lower.includes('timing') || lower.includes('open') || lower.includes('market')) {
        reply =
          'â° Regional Market Hours:\nâ€¢ Downtown Farmers Market (Oakland): Sat & Sun, 8:00 AM â€“ 2:00 PM\nâ€¢ Sunnyside Community Market (Seattle): Sunday, 9:00 AM â€“ 3:00 PM';
      } else if (lower.includes('surplus') || lower.includes('discount') || lower.includes('waste')) {
        reply =
          'ðŸŒ¾ MarketLink Surplus Matching tags fresh excess harvest crops at a 20-40% discount, preventing food waste while helping local farmers recover value!';
      } else if (lower.includes('trace') || lower.includes('qr') || lower.includes('code') || lower.includes('batch')) {
        reply =
          'ðŸŒ± Batch Traceability: Navigate to the Traceability tab or scan the QR code on your produce packaging to view exact harvest timestamps, soil bed compliance, and cold-chain logs.';
      } else {
        reply =
          'I am here to assist with all your MarketLink queries! You can pre-order produce for weekend stall pickup, check verified farmer credentials, or explore regional market directories.';
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Trigger Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open MarketLink AI Shopping Assistant"
        className="fixed bottom-6 right-6 z-50 bg-black/85 hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl border border-[#C9A45C]/75 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 group"
      >
        <Headphones className="w-4 h-4 text-[#C9A45C] group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-xs sm:text-sm tracking-wide text-white">
          {isOpen ? 'Close AI' : 'AI Shopping Assistant'}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[#C9A45C] group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Floating Assistant Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-[#F5F0E6] rounded-md border border-agri-border shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-agri-dark text-[#F5F0E6] p-4 flex items-center justify-between border-b border-agri-dark/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#263A2E]/10 flex items-center justify-center text-amber-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm font-serif flex items-center gap-1.5">
                  MarketLink AI
                  <span className="w-2 h-2 rounded-full bg-[#263A2E]/10 animate-pulse" />
                </h4>
                <p className="text-[10px] text-[#263A2E]">Instant Produce &amp; Market Support</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#F5F0E6]/10 text-[#F5F0E6]/80 hover:text-[#F5F0E6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-agri-cream/30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-[#263A2E]/10 text-amber-300 flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-lg text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#263A2E]/10 text-[#F5F0E6] rounded-tr-none shadow-sm'
                      : 'bg-[#F5F0E6] text-agri-dark border border-agri-border rounded-tl-none shadow-sm whitespace-pre-line'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`text-[9px] block mt-1 ${
                      m.sender === 'user' ? 'text-[#263A2E] text-right' : 'text-agri-muted'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-agri-muted font-semibold pl-2 py-1">
                <Bot className="w-4 h-4 text-[#263A2E] animate-bounce" />
                <span>MarketLink AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Container */}
          <div className="px-3 py-2 bg-[#F5F0E6] border-t border-agri-border/60 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full bg-[#263A2E]/10 hover:bg-[#263A2E]/10 text-[#263A2E] border border-emerald-200 text-[10px] font-bold whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#F5F0E6] border-t border-agri-border flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI about crops, timings, or FAQs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-agri-surface border border-agri-border rounded-md px-3.5 py-2 text-xs text-agri-dark focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              className="rounded-md px-3 py-2"
              disabled={!input.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};
