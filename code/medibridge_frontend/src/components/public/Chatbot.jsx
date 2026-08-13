import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  // Keeps track of whether the chatbot window is currently open
  const [isOpen, setIsOpen] = useState(false);

  // Stores the complete conversation between the user and the bot
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! 👋 I'm the MediBridge assistant. How can I help you today?",
      sender: 'bot',
    }
  ]);

  // Stores whatever the user is currently typing
  const [inputValue, setInputValue] = useState('');

  // Used to automatically move the chat to the latest message
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg = { id: Date.now(), text: userText, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Convert the existing messages into the format expected by the AI backend
    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    try {
      // Send the user's message along with the previous conversation to the AI service
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          history: history
        })
      });
      
      const data = await response.json();
      
      // Add the AI's response to the chat and store any action returned by the backend
      const botMsg = {
        id: Date.now() + 1,
        text: data.response || "Sorry, I am having trouble understanding you right now.",
        sender: 'bot',
        action: data.action
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      // Show a helpful message if the AI backend cannot be reached
      console.error("Error connecting to GenAI service:", error);
      const errorMsg = {
        id: Date.now() + 1,
        text: "Error connecting to the MediBridge AI Support. Please ensure the AI backend is running.",
        sender: 'bot'
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          style={{ height: '450px', width: '350px', display: 'flex', flexDirection: 'column', transformOrigin: 'bottom right', marginBottom: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          className="rounded-2xl bg-white border border-slate-100 overflow-hidden transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#2563EB] p-4 text-white" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2563EB', padding: '16px', color: 'white' }}>
            <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="flex items-center justify-center rounded-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', width: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px' }}>
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>MediBridge Support</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1" style={{ fontSize: '12px', color: '#dbeafe', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#4ade80', display: 'inline-block' }}></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 transition-colors"
              style={{ borderRadius: '9999px', padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4" style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    backgroundColor: msg.sender === 'user' ? '#2563EB' : 'white',
                    color: msg.sender === 'user' ? 'white' : '#334155',
                    borderTopRightRadius: msg.sender === 'user' ? '0' : '16px',
                    borderTopLeftRadius: msg.sender === 'user' ? '16px' : '0',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: msg.sender === 'user' ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <p className="leading-relaxed" style={{ margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                  {msg.action && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <Link
                        to={msg.action.link}
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: 'inline-block',
                          width: '100%',
                          textAlign: 'center',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#2563EB',
                          textDecoration: 'none'
                        }}
                      >
                        {msg.action.label}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ backgroundColor: 'white', borderTop: '1px solid #f1f5f9', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ask a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  flex: 1,
                  borderRadius: '9999px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: '10px 16px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '40px',
                  width: '40px',
                  borderRadius: '9999px',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  border: 'none',
                  cursor: !inputValue.trim() ? 'not-allowed' : 'pointer',
                  opacity: !inputValue.trim() ? 0.5 : 1,
                  flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '64px',
            width: '64px',
            borderRadius: '9999px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}