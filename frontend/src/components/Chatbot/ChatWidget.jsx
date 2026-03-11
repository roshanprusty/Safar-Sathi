import React, { useState, useRef, useEffect } from 'react';
import { useChat } from './chatProvider';
import './Chatbot.css';

// ── Destination quick-fire pills ──────────────────────────────
const DESTINATIONS = [
  '🌴 Bali', '🗼 Paris', '🏝 Maldives',
  '🌆 Dubai', '🗾 Tokyo', '🏔 Machu Picchu',
  '🇬🇷 Santorini', '🌍 Cape Town',
];

// ── FAQ suggestion chips ───────────────────────────────────────
const FAQS = [
  { icon: '🔁', text: 'What is the cancellation policy?' },
  { icon: '💰', text: 'How are refunds processed?' },
  { icon: '📋', text: 'How do I book a tour?' },
  { icon: '✅', text: "What's included in the package?" },
  { icon: '🏷️', text: 'Are there any discounts available?' },
  { icon: '🛂', text: 'Do you provide visa assistance?' },
  { icon: '🛡️', text: 'What does travel insurance cover?' },
  { icon: '🎧', text: 'How do I contact support?' },
];

// ── Welcome message shown before any conversation ─────────────
const WELCOME = {
  heading: 'Hello, I\'m Nova ✦',
  subheading: 'Your AI travel companion from Wanderlust Tours.',
  body: 'I can help you explore destinations, understand our booking & cancellation policies, find the best deals, and plan your perfect trip — all powered by our live knowledge base.',
  cta: 'Where would you like to go? 🌍',
};

// ── Tiny helper ───────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─────────────────────────────────────────────────────────────
const ChatWidget = () => {
  const { isOpen, toggleChat, messages, sendMessage, isTyping } = useChat();
  const [input, setInput] = useState('');
  const [showBadge, setShowBadge] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Hide tooltip after 5 s
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => {
    toggleChat();
    setShowBadge(false);
    setShowTooltip(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;
    sendMessage(text);
    setInput('');
  };

  const handleChip = (text) => {
    if (isTyping) return;
    sendMessage(text);
  };

  const handleDestination = (dest) => {
    const name = dest.replace(/^\S+\s/, ''); // strip emoji
    handleChip(`Tell me about tours to ${name}`);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={`chat-container${isOpen ? ' open' : ''}`}>

      {/* ── FAB ─────────────────────────────────────────────── */}
      <div className="fab-wrap">
        {!isOpen && showBadge && <span className="notif-badge">1</span>}
        {!isOpen && showTooltip && (
          <div className="fab-tooltip">👋 Ask Nova anything about tours!</div>
        )}
        <button
          className={`chat-fab${isOpen ? ' open' : ''}`}
          onClick={isOpen ? toggleChat : handleOpen}
          aria-label="Toggle Nova chat"
        >
          {isOpen ? '✕' : '✈️'}
        </button>
      </div>

      {/* ── Chat Window ──────────────────────────────────────── */}
      <div className="chat-window" role="dialog" aria-label="Nova travel assistant">

        {/* Header */}
        <div className="chat-header">
          <div>
            <h3>Nova</h3>
            <button onClick={toggleChat} aria-label="Close chat">✕</button>
          </div>

          {/* Destination strip — always visible */}
          <div className="dest-strip">
            {DESTINATIONS.map((d) => (
              <button
                key={d}
                className="dest-pill"
                onClick={() => handleDestination(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">

          {/* ── Welcome card (shown only before first message) ── */}
          {isEmpty && (
            <div className="welcome-card">
              <div className="welcome-avatar">✦</div>
              <div className="welcome-heading">{WELCOME.heading}</div>
              <div className="welcome-sub">{WELCOME.subheading}</div>
              <div className="welcome-body">{WELCOME.body}</div>
              <div className="welcome-cta">{WELCOME.cta}</div>

              {/* FAQ chips */}
              <div className="faq-label">Frequently asked</div>
              <div className="faq-grid">
                {FAQS.map((f) => (
                  <button
                    key={f.text}
                    className="faq-chip"
                    onClick={() => handleChip(f.text)}
                  >
                    <span className="faq-icon">{f.icon}</span>
                    <span>{f.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Conversation messages ── */}
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="msg-avatar">✦</div>
              )}
              <div className="bubble-col">
                <div className={`message ${msg.role}`}>
                  {msg.content}
                </div>

                {/* RAG source tags */}
                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="message-sources">
                    {msg.sources.map((src, j) => (
                      <span
                        key={j}
                        className={`source-tag source-tag--${src.category}`}
                        title={`Source: ${src.title}`}
                      >
                        {src.title}
                      </span>
                    ))}
                  </div>
                )}

                <span className="msg-time">{msg.time || getTime()}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="message-row assistant">
              <div className="msg-avatar">✦</div>
              <div className="message assistant typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* FAQ re-suggestions after conversation starts */}
          {!isEmpty && !isTyping && messages[messages.length - 1]?.role === 'assistant' && (
            <div className="inline-faqs">
              <div className="inline-faqs-label">You might also ask</div>
              <div className="inline-faq-chips">
                {FAQS.slice(0, 4).map((f) => (
                  <button
                    key={f.text}
                    className="inline-faq-chip"
                    onClick={() => handleChip(f.text)}
                  >
                    {f.icon} {f.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="chat-input-area">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nova about tours, policies, destinations…"
            disabled={isTyping}
            autoComplete="off"
          />
          <button type="submit" disabled={!input.trim() || isTyping}>
            Send
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatWidget;