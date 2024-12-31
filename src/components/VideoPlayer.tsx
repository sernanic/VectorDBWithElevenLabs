import React, { useState } from 'react';
import YouTube from 'react-youtube';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface VideoPlayerProps {
  videoId: string;
  onVideoProcessed?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onVideoProcessed }) => {
  const [player, setPlayer] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');

  const handleVideoReady = (event: any) => {
    setPlayer(event.target);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setIsProcessing(true);
      const response = await fetch('/api/videos/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token' // Replace with actual auth token
        },
        body: JSON.stringify({
          videoId,
          message: question,
        }),
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, 
        { role: 'user', content: question },
        { role: 'assistant', content: data.response, timestamp: data.timestamp }
      ]);

      if (data.timestamp && player) {
        player.seekTo(data.timestamp);
        player.playVideo();
      }

      setQuestion('');
    } catch (error) {
      console.error('Error sending question:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-4 p-4">
      <div className="lg:w-2/3 h-full flex flex-col">
        <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
          <div className="absolute inset-0">
            <YouTube
              videoId={videoId}
              onReady={handleVideoReady}
              opts={{
                height: '100%',
                width: '100%',
                playerVars: {
                  autoplay: 0,
                  origin: window.location.origin,
                },
              }}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="lg:w-1/3 h-full flex flex-col bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-4 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.timestamp && (
                    <button
                      onClick={() => {
                        player?.seekTo(message.timestamp);
                        player?.playVideo();
                      }}
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-blue-100 hover:text-white'
                          : 'text-blue-500 hover:text-blue-700'
                      }`}
                    >
                      Jump to {Math.floor(message.timestamp / 60)}:{String(Math.floor(message.timestamp % 60)).padStart(2, '0')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleQuestionSubmit} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the video..."
              className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
