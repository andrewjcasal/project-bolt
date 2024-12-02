import React from 'react';
import { User, Bot } from 'lucide-react';

interface MessageListProps {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-4 mb-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex items-start gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          <div
            className={`p-2 rounded-full ${
              message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
            }`}
          >
            {message.role === 'user' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          <div
            className={`flex-1 p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500/10 border border-blue-500/20'
                : 'bg-purple-500/10 border border-purple-500/20'
            }`}
          >
            <p className="text-gray-100">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};