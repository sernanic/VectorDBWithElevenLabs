import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ isOpen, onClose }) => {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [volume, setVolume] = useState(1);
  const [messages, setMessages] = useState<Array<{ type: string; content: string }>>([]);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

  // Helper function to safely convert error to string
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      return JSON.stringify(error);
    }
    return 'An unknown error occurred';
  };

  useEffect(() => {
    // Debug environment variables
    console.log('Environment variables:', {
      agentId,
      allEnv: import.meta.env
    });

    if (!agentId) {
      console.error('Missing VITE_ELEVENLABS_AGENT_ID environment variable');
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Agent ID not configured. Please check your environment variables.' 
      }]);
    }
  }, []);

  const conversation = useConversation({
    agentId,
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setMessages(prev => [...prev, { type: 'system', content: 'Connected to AI Agent' }]);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setMessages(prev => [...prev, { type: 'system', content: 'Disconnected from AI Agent' }]);
    },
    onMessage: (message) => {
      console.log('Received message:', message);
      const messageContent = typeof message === 'string' ? message : JSON.stringify(message);
      setMessages(prev => [...prev, { type: 'ai', content: messageContent }]);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: getErrorMessage(error)
      }]);
    }
  });

  useEffect(() => {
    // Check if microphone permission is already granted
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicPermission('granted');
      })
      .catch((error) => {
        console.error('Initial microphone check error:', error);
        setMicPermission('denied');
        setMessages(prev => [...prev, { 
          type: 'error', 
          content: 'Microphone access is required. Please enable it in your browser settings.' 
        }]);
      });
  }, []);

  const handleMicToggle = async () => {
    try {
      if (!isMicEnabled) {
        console.log('Starting conversation with agent ID:', agentId);
        
        if (!agentId) {
          throw new Error('Agent ID not configured. Please check your environment variables.');
        }

        if (micPermission !== 'granted') {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission('granted');
          } catch (error) {
            console.error('Microphone permission error:', error);
            setMicPermission('denied');
            setMessages(prev => [...prev, { 
              type: 'error', 
              content: 'Microphone access is required. Please enable it in your browser settings.' 
            }]);
            return;
          }
        }

        console.log('Starting session...');
        const conversationId = await conversation.startSession();
        console.log('Started conversation:', conversationId);
      } else {
        await conversation.endSession();
      }
      setIsMicEnabled(!isMicEnabled);
    } catch (error) {
      console.error('Conversation error:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: getErrorMessage(error)
      }]);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    await conversation.setVolume({ volume: newVolume });
    setVolume(newVolume);
  };

  useEffect(() => {
    if (!isOpen && isMicEnabled) {
      handleMicToggle();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Voice Chat</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleMicToggle}
            className={`p-2 rounded-full ${
              isMicEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isMicEnabled ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>
          
          <button
            onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            {volume === 0 ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="h-48 overflow-y-auto border rounded p-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                msg.type === 'error' 
                  ? 'bg-red-100 text-red-700' 
                  : msg.type === 'system' 
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
