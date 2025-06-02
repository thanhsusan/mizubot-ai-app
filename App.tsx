
import React, { useState, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, GroundingChunk, UserRole } from './types';
import {
  BOT_NAME,
  INITIAL_BOT_GREETING_CUSTOMER,
  INITIAL_BOT_GREETING_EMPLOYEE,
  SYSTEM_INSTRUCTION_CUSTOMER,
  SYSTEM_INSTRUCTION_EMPLOYEE,
} from './constants';
import { initializeGemini, startChatSession, streamMessage } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import RoleSelectionScreen from './components/RoleSelectionScreen';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleSelected, setRoleSelected] = useState<boolean>(false);

  const initChat = useCallback(async (selectedRole: UserRole) => {
    if (!selectedRole) return;

    try {
      setIsLoading(true);
      setError(null);
      
      if (!process.env.API_KEY) {
        setApiKeyMissing(true);
        setError("API_KEY is not configured. Chatbot cannot function.");
        setMessages(prev => [...prev, {
          id: 'apikey-error',
          text: "Lỗi cấu hình: API Key không tồn tại. Vui lòng liên hệ quản trị viên.",
          sender: 'error' as 'error',
          timestamp: Date.now(),
        }]);
        setIsLoading(false);
        return;
      }
      setApiKeyMissing(false);
      
      initializeGemini(); 
      
      let systemInstruction = '';
      let initialGreeting = '';

      if (selectedRole === 'customer') {
        systemInstruction = SYSTEM_INSTRUCTION_CUSTOMER;
        initialGreeting = INITIAL_BOT_GREETING_CUSTOMER;
      } else if (selectedRole === 'employee') {
        systemInstruction = SYSTEM_INSTRUCTION_EMPLOYEE;
        initialGreeting = INITIAL_BOT_GREETING_EMPLOYEE;
      }

      const session = await startChatSession(systemInstruction);
      setChatSession(session);

      setMessages([
        {
          id: 'initial-greeting',
          text: initialGreeting,
          sender: 'bot',
          timestamp: Date.now(),
        },
      ]);
    } catch (e: any) {
      console.error("Lỗi khởi tạo chat:", e);
      const errorMessage = e.message.includes("API_KEY_MISSING") 
        ? "Khóa API chưa được cấu hình. Vui lòng kiểm tra lại."
        : `Không thể khởi tạo chatbot cho vai trò ${selectedRole}. Vui lòng thử lại sau.`;
      setError(errorMessage);
      setMessages(prev => [...prev, {
        id: 'init-error',
        text: `Lỗi: ${errorMessage}`,
        sender: 'error' as 'error',
        timestamp: Date.now(),
      }]);
      if (e.message.includes("API_KEY_MISSING")) {
        setApiKeyMissing(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      console.warn("API Key is missing. Chat functionality will be disabled.");
    }
  }, []);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setUserRole(selectedRole);
    setRoleSelected(true);
    setMessages([]); 
    initChat(selectedRole);
  };

  const handleSendMessage = async (userInput: string) => {
    if (!chatSession || isLoading || apiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setCurrentGroundingChunks(undefined); 

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: userInput,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const botMessageId = `bot-${Date.now()}`;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);

    try {
      await streamMessage(
        chatSession,
        userInput,
        (textChunk, groundingChunks) => { 
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: msg.text + textChunk, isStreaming: true }
                : msg
            )
          );
          if (groundingChunks && groundingChunks.length > 0) {
            setCurrentGroundingChunks(prev => {
              const newChunks = [...(prev || []), ...groundingChunks];
              return Array.from(new Map(newChunks.map(item => [(item.web?.uri || item.retrievedContext?.uri)!, item])).values());
            });
          }
        },
        (fullText, finalGroundingChunks) => { 
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: fullText, isStreaming: false }
                : msg
            )
          );
          setIsLoading(false);
          if (finalGroundingChunks && finalGroundingChunks.length > 0) {
            setCurrentGroundingChunks(finalGroundingChunks);
          }
        },
        (e) => { 
          console.error("Lỗi API:", e);
          setError(`${BOT_NAME} gặp sự cố: ${e.message}. Vui lòng thử lại.`);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: `Xin lỗi, đã có lỗi xảy ra: ${e.message}`, sender: 'error' as 'error', isStreaming: false }
                : msg
            ).filter(msg => !(msg.id === botMessageId && msg.text === '' && msg.sender !== 'user')) 
          );
          setIsLoading(false);
        }
      );
    } catch (e: any) {
        console.error("Lỗi không mong muốn khi gửi tin nhắn:", e);
        setError(`Lỗi hệ thống: ${e.message}.`);
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: `Lỗi hệ thống: ${e.message}`, sender: 'error' as 'error', isStreaming: false }
                : msg
            ).filter(msg => !(msg.id === botMessageId && msg.text === '' && msg.sender !== 'user'))
        );
        setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-200 via-sky-100 to-indigo-200">
      {!roleSelected ? (
        <RoleSelectionScreen onSelectRole={handleRoleSelect} apiKeyMissing={apiKeyMissing} />
      ) : (
        <div className="w-full max-w-2xl h-[90vh] max-h-[700px] md:h-[calc(100vh-80px)]">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            error={error}
            apiKeyMissing={apiKeyMissing}
            currentGroundingChunks={currentGroundingChunks}
            userRole={userRole}
          />
        </div>
      )}
    </div>
  );
};

export default App;