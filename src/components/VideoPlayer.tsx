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
    <div className="flex h-full">
      <div className="w-3/5 p-4">
        <div className="h-[480px]">
          <YouTube
            videoId={videoId}
            onReady={handleVideoReady}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 0,
                origin: window.location.origin, // Add this line to fix the postMessage error
              },
            }}
          />
        </div>
      </div>

      <div className="w-2/5 border-l border-gray-200 flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <p>{message.content}</p>
                {message.timestamp && (
                  <button
                    onClick={() => {
                      player?.seekTo(message.timestamp);
                      player?.playVideo();
                    }}
                    className="text-xs underline mt-1"
                  >
                    Jump to {Math.floor(message.timestamp)}s
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleQuestionSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the video..."
              className="flex-1 px-4 py-2 border rounded-lg"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
