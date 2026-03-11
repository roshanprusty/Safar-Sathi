import { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Every great trip starts with a question. What\'s yours?' }
  ]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (text) => {
    // Add user message immediately
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:4000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();

      // Store answer + sources from RAG response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not reach the server. Please try again.',
          sources: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, messages, sendMessage, isTyping }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
