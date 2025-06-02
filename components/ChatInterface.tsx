
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GroundingChunk, UserRole } from '../types';
import { BOT_NAME } from '../constants';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import SendIcon from './icons/SendIcon';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
  apiKeyMissing: boolean;
  currentGroundingChunks?: GroundingChunk[];
  userRole?: UserRole | null;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 p-2">
    <span className="text-gray-500">{BOT_NAME} đang soạn tin</span>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-200"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
  </div>
);

const GroundingSource: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
  const source = chunk.web || chunk.retrievedContext;
  if (!source || !source.uri) return null;

  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title || source.uri}
      className="text-xs text-blue-500 hover:text-blue-700 hover:underline truncate block max-w-xs"
    >
      {source.title || source.uri}
    </a>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  error,
  apiKeyMissing,
  currentGroundingChunks,
  userRole,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading && !apiKeyMissing) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const getHeaderText = () => {
    if (userRole === 'customer') {
      return `${BOT_NAME} - Hỗ trợ Khách hàng`;
    }
    if (userRole === 'employee') {
      return `${BOT_NAME} - Hỗ trợ Nhân viên Mizuchan`;
    }
    return `${BOT_NAME} - Tư vấn lọc nước, xử lý nước Mizuchan`;
  }

  const getInputPlaceholder = () => {
    if (apiKeyMissing) return "API Key bị thiếu hoặc không hợp lệ...";
    if (isLoading) return `${BOT_NAME} đang xử lý...`;
    return "Nhập câu hỏi của bạn...";
  }

  return (
    <div className="flex flex-col h-full max-h-full bg-white shadow-2xl rounded-lg overflow-hidden">
      <header className="bg-gradient-to-r from-sky-500 to-indigo-600 p-4 text-white shadow-md flex justify-between items-center">
        <h1 className="text-xl font-semibold flex items-center">
          <BotIcon className="w-8 h-8 mr-2 text-white" />
          {getHeaderText()}
        </h1>
      </header>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end space-x-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'bot' && (
              <BotIcon className="w-8 h-8 text-indigo-500 self-start flex-shrink-0" />
            )}
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow ${
                msg.sender === 'user'
                  ? 'bg-sky-500 text-white rounded-br-none'
                  : msg.sender === 'bot'
                  ? 'bg-white text-gray-800 rounded-bl-none border border-slate-200'
                  : 'bg-red-100 text-red-700 rounded-bl-none'
              }`}
            >
              {msg.isStreaming && msg.text === '' ? (
                 <TypingIndicator />
              ) : (
                <MarkdownRenderer content={msg.text} className={msg.sender === 'user' ? 'text-white' : 'text-gray-800'}/>
              )}
              {msg.sender === 'bot' && !msg.isStreaming && currentGroundingChunks && currentGroundingChunks.length > 0 && messages[messages.length -1].id === msg.id && (
                 <div className="mt-2 pt-2 border-t border-slate-200">
                   <p className="text-xs font-semibold text-gray-600 mb-1">Nguồn tham khảo:</p>
                   {currentGroundingChunks.map((chunk, index) => (
                     <GroundingSource key={index} chunk={chunk} />
                   ))}
                 </div>
              )}
            </div>
            {msg.sender === 'user' && (
              <UserIcon className="w-8 h-8 text-sky-500 self-start flex-shrink-0" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isLoading && messages.length > 0 && messages[messages.length - 1]?.sender !== 'user' && !messages[messages.length - 1]?.isStreaming && (
         <div className="p-4 border-t border-slate-200">
           <TypingIndicator />
         </div>
      )}
       {isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === 'user' && (
         <div className="p-4 border-t border-slate-200">
           <TypingIndicator />
         </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 text-red-700 text-sm border-t border-red-200">
          <strong>Lỗi:</strong> {error}
        </div>
      )}
      {apiKeyMissing && !error && (
         <div className="p-3 bg-yellow-100 text-yellow-700 text-sm border-t border-yellow-200">
           <strong>Cảnh báo:</strong> Khóa API chưa được cấu hình hoặc không hợp lệ. Chức năng chat có thể không hoạt động.
         </div>
      )}

      <div className="border-t border-slate-200 p-3 bg-white">
        <div className="flex items-center space-x-2">
          <textarea
            rows={1}
            className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none outline-none scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100"
            placeholder={getInputPlaceholder()}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || apiKeyMissing}
            aria-label="Nhập câu hỏi của bạn"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || apiKeyMissing || !inputText.trim()}
            className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Gửi tin nhắn"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 pt-2 mt-1">
          Phiên bản Mizubot AI v1.05.25 bởi Mizuchan team
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;