import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { apiFetch, connectChatSocket, getUser } from "../../lib/api";

export default function Chat() {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [coachUser, setCoachUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const currentUser = getUser();

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let wsCleanup: (() => void) | undefined;

    async function loadChat() {
      try {
        // Get user profile with assigned coach info
        const profile = await apiFetch("/user/profile");
        if (profile?.coach) {
          const coachInfo = profile.coach;
          setCoachUser(coachInfo.user); // Contains name, email, and the userId

          // Fetch past messages
          const pastMsgs = await apiFetch(`/chat/messages?otherUserId=${coachInfo.userId}`);
          setMessages(pastMsgs);

          // Connect websocket
          const socket = connectChatSocket((msg) => {
            // Append message if it's related to the coach
            if (msg.senderId === coachInfo.userId || msg.receiverId === coachInfo.userId) {
              setMessages(prev => {
                // Prevent duplicate appending
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
          });
          if (socket) {
            wsCleanup = socket.close;
          }
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        setLoading(false);
      }
    }

    loadChat();

    return () => {
      if (wsCleanup) wsCleanup();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !coachUser) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    try {
      const msg = await apiFetch("/chat/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId: coachUser.id, // This is coach's user ID
          content,
        }),
      });

      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Connecting to Chat...
      </div>
    );
  }

  if (!coachUser) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-zinc-900 text-brand rounded-full flex items-center justify-center mb-4 border border-zinc-800">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Coach Assigned</h2>
        <p className="text-zinc-400 max-w-md">You are currently not assigned to a premium coach. Once the admin assigns you a coach, you'll be able to message them directly here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-white">Chat with Coach</h2>
        <p className="text-zinc-400">Direct line to your personal trainer, Coach {coachUser.name}.</p>
      </div>

      <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-black font-bold text-lg">
            {coachUser.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-white">Coach {coachUser.name}</h3>
            <p className="text-xs text-brand flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand inline-block animate-pulse"></span> Online Support
            </p>
          </div>
        </div>

        {/* Message Flow */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm gap-2">
              <MessageSquare className="w-8 h-8 opacity-45" />
              <span>Say hello to Coach {coachUser.name} to kick off your transformation!</span>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[70%] shadow-sm ${
                    isMe 
                      ? 'bg-brand text-black rounded-tr-none' 
                      : 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700/50'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[10px] mt-1 block ${
                      isMe ? 'text-black/60 text-right' : 'text-zinc-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand outline-none text-white text-sm" 
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-brand text-black p-3 rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
