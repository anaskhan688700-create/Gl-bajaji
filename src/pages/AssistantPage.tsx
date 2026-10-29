import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  ArrowRight,
  Droplets,
  Sprout,
  HelpCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useSensors } from '../context/SensorContext';
import { useLanguage } from '../context/LanguageContext';

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sourceCitations?: string[];
  relatedPage?: string;
  time: string;
}

export const AssistantPage: React.FC = () => {
  const { selectedFarm } = useFarms();
  const { latestTelemetry } = useSensors();
  const { language, setLanguage, t } = useLanguage();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text:
        language === 'hi'
          ? `नमस्ते किसान भाई! मैं आपका **AI किसान सहायक (KisanRakshak Assistant)** हूँ।\n\nमैं आपके खेत **"${selectedFarm?.name || 'आपके खेत'}"** के लाइव सेंसर डेटा, मिट्टी की स्थिति और ICAR दिशानिर्देशों के आधार पर आपकी मदद कर सकता हूँ। आप नीचे दिए गए प्रश्नों पर क्लिक कर सकते हैं या अपना प्रश्न हिन्दी अथवा अंग्रेजी में पूछ सकते हैं।`
          : `Hello! I am your **AI Kisan Assistant**.\n\nI have loaded the live telemetry and crop profile for **"${selectedFarm?.name || 'Your Farm'}"**. Feel free to ask about soil moisture stress, sensor interpretations, next-season crop planning, or profit calculations.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions =
    language === 'hi'
      ? [
          'मेरी फसल में पानी की कमी कैसे पता चलेगी?',
          'मेरे खेत के सेंसर रीडिंग्स का क्या मतलब है?',
          'अगले सीजन के लिए कौन सी फसल सबसे लाभदायक होगी?',
          'फसल की कुल लागत और अनुमानित मुनाफा कितना होगा?',
          'खेत में मिले अलर्ट का सरल भाषा में मतलब समझाओ।',
        ]
      : [
          'How do I identify moisture stress for my crop?',
          'What do my current sensor readings indicate?',
          'Which alternative crop is best for the next season?',
          'Estimate cultivation cost and projected profit.',
          'Explain the active alert in simple terms.',
        ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (qToSend?: string) => {
    const question = (qToSend || inputQuestion).trim();
    if (!question || isLoading) return;

    const userMsg: ChatEntry = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          farmId: selectedFarm?.id || 'farm-01',
          language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const botMsg: ChatEntry = {
          id: `msg-bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          sourceCitations: data.sourceCitations,
          relatedPage: data.relatedPage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (e) {
      console.error(e);
      const errMsg: ChatEntry = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I could not connect to the advisory service. Please check your network.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <BotMessageSquare className="w-7 h-7 text-agri" />
            <span>{t.navAssistant}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Conversational agricultural advisor with live farm context & ICAR standards
          </p>
        </div>

        {/* Language Switch */}
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 text-xs font-semibold self-start sm:self-auto shadow-soft">
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              language === 'hi' ? 'bg-forest text-limeAccent font-bold' : 'text-gray-600 hover:text-darkText'
            }`}
          >
            🇮🇳 हिन्दी (Hindi)
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              language === 'en' ? 'bg-forest text-white font-bold' : 'text-gray-600 hover:text-darkText'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Active Farm Context Pill Bar */}
      <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-soft flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-forest">
          <Sprout className="w-4 h-4 text-agri" />
          <span>Active Context:</span>
          <span className="text-darkText">{selectedFarm?.name} ({selectedFarm?.location.district})</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-secondaryText">
          <span>Crop: <strong className="text-darkText">{selectedFarm?.currentCropId}</strong></span>
          <span>•</span>
          <span>Moisture: <strong className="text-agri">{latestTelemetry?.soilMoisture ?? 42}%</strong></span>
          <span>•</span>
          <span>Temp: <strong className="text-forest">{latestTelemetry?.ambientTemperature ?? 22.8}°C</strong></span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft flex flex-col h-[600px] overflow-hidden">
        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user' ? 'bg-forest text-limeAccent' : 'bg-agri text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-forest text-white rounded-tr-none'
                  : 'bg-warmBg text-darkText rounded-tl-none border border-gray-100'
              }`}>
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Sources & Page Link */}
                {msg.sender === 'assistant' && (msg.sourceCitations || msg.relatedPage) && (
                  <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    {msg.sourceCitations && (
                      <span className="text-secondaryText font-medium flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-agri" />
                        Source: {msg.sourceCitations.join(', ')}
                      </span>
                    )}

                    {msg.relatedPage && (
                      <Link
                        to={msg.relatedPage}
                        className="text-agri font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Open Dashboard Page</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}

                <span className={`block text-[10px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-xl bg-agri text-white flex items-center justify-center text-xs">
                <BotMessageSquare className="w-4 h-4" />
              </div>
              <div className="p-3 bg-warmBg rounded-2xl text-xs text-secondaryText flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-agri animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-agri animate-bounce delay-150" />
                <span className="w-2 h-2 rounded-full bg-agri animate-bounce delay-300" />
                <span>AI Kisan is analyzing farm telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions Bar */}
        <div className="px-4 py-2 bg-warmBg border-t border-gray-100 overflow-x-auto flex gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-darkText hover:border-agri hover:text-agri text-xs font-semibold whitespace-nowrap transition-colors shadow-soft"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-2 bg-white">
          <input
            type="text"
            value={inputQuestion}
            onChange={e => setInputQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={language === 'hi' ? 'अपनी फसल या खेत के बारे में पूछें...' : 'Ask about your crop or soil conditions...'}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-agri focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuestion.trim() || isLoading}
            className="p-3 rounded-2xl bg-forest text-limeAccent font-bold hover:bg-forest-light transition-colors disabled:opacity-50 shadow-soft"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

