import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Message } from '../lib/supabase';
import { Starfield } from './Starfield';

export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;

          // Fetch sender's display_name
          const { data: userData } = await supabase
            .from('chat_users')
            .select('display_name')
            .eq('id', newMsg.sender_id)
            .single();

          const enrichedMessage = {
            ...newMsg,
            chat_users: userData ? { display_name: userData.display_name } : null,
          };

          setMessages((prev) => [...prev, enrichedMessage]);
          setIsTyping(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, chat_users ( display_name )') //getting the username
      .order('created_at', { ascending: true });

    if (data && !error) {
      setMessages(data as any); // We cast to any for now
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsTyping(true);

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          content: newMessage.trim()
        }
      ]);

    if (!error) {
      setNewMessage('');
    } else {
      setIsTyping(false);
    }
  };

  const isOwnMessage = (senderId: string) => senderId === user?.id;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />
      <Starfield />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full mx-auto flex flex-col" style={{ height: '85vh' }}>
          <div className="backdrop-blur-xl bg-white/5 rounded-t-3xl p-6 border-t border-x border-white/10">
            <h1 className="text-3xl font-bold text-white text-center tracking-wide">
              Mystery Chat ✨💬
            </h1>
            <p className="text-pink-200 text-center text-sm mt-2">
              Logged in as {user?.username}
            </p>
          </div>

          <div className="flex-1 backdrop-blur-xl bg-white/5 border-x border-white/10 overflow-y-auto p-6 space-y-4 chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message.sender_id) ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-md px-6 py-3 rounded-2xl backdrop-blur-lg border transition-all duration-300 hover:scale-105 ${isOwnMessage(message.sender_id)
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-400/30 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 border-blue-400/30 text-white shadow-lg shadow-blue-500/20'
                    }`}
                  style={{
                    boxShadow: isOwnMessage(message.sender_id)
                      ? '0 0 20px rgba(236, 72, 153, 0.3)'
                      : '0 0 20px rgba(96, 165, 250, 0.3)'
                  }}
                >
                  <p className="text-sm mb-1 opacity-70">
                    {message.chat_users?.display_name || 'Unknown User'}
                  </p>
                  <p className="break-words">{message.content}</p>
                  <p className="text-xs opacity-50 mt-2">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-md px-6 py-3 rounded-2xl backdrop-blur-lg bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-400/30">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="backdrop-blur-xl bg-white/5 rounded-b-3xl p-6 border-b border-x border-white/10"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                <Send size={20} />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        
      `}</style>
    </div>
  );
}
