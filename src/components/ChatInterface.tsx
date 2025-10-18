import { useState, useEffect, useRef } from 'react';
import { Send, Smile, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Message } from '../lib/supabase';
import { Starfield } from './Starfield';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'; // Import EmojiPicker

export function ChatInterface() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPicker, setShowPicker] = useState(false); // State to manage picker visibility
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

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




  const pickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const pickerEl = pickerRef.current;
      const buttonEl = emojiButtonRef.current;

      // Close if clicked outside both picker & button
      if (
        pickerEl &&
        !pickerEl.contains(event.target as Node) &&
        buttonEl &&
        !buttonEl.contains(event.target as Node)
      ) {
        // ✅ Explicitly close if clicked in the message input too
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          setShowPicker(false);
        } else {
          setShowPicker(false);
        }
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);



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

  // Function to add the selected emoji to the input
  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

  const isOwnMessage = (senderId: string) => senderId === user?.id;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />
      <Starfield />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full mx-auto flex flex-col" style={{ height: '85vh' }}>
          <div className="flex justify-between items-center backdrop-blur-xl bg-white/5 rounded-t-3xl p-6 border-t border-x border-white/10">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                Mystery Chat ✨💬
              </h1>
              <p className="text-pink-200 text-sm mt-1">
                Logged in as {user?.username}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-white font-semibold hover:bg-red-500/40 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex-1 backdrop-blur-xl bg-white/5 border-x border-white/10 overflow-y-auto p-6 space-y-4 chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message.sender_id) ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 md:px-6 md:py-3 rounded-2xl backdrop-blur-lg border transition-all duration-300 hover:scale-105 ${isOwnMessage(message.sender_id)
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

          <div className="relative" ref={pickerContainerRef}>
            {showPicker && (
              <div className="absolute bottom-full mb-2" ref={pickerRef}>
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
            <form
              onSubmit={sendMessage}
              className="backdrop-blur-xl bg-white/5 rounded-b-3xl p-2 sm:p-6 border-b border-x border-white/10 "
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  ref={emojiButtonRef}
                  onClick={() => setShowPicker(val => !val)}
                  className="p-1.5 sm:p-3 rounded-full hover:bg-white/20 transition-colors ml-1 sm:ml-0"
                >
                  <Smile className="text-white/70 sm:w-7 sm:h-7 w-5 h-5" size={24} />
                  
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-3 py-2 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  <Send size={20} className="sm:w-5 sm:h-5 w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
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
