
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Search, Circle, MessageSquare, Paperclip, ArrowLeft } from 'lucide-react';
import { messagesAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import useSocket from '../../hooks/useSocket';
import { formatDateTime, getInitials, cn } from '../../lib/utils';

const MessagesPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { on, off, emit, onlineUsers } = useSocket();

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesAPI.conversations(),
    select: (r) => r.data.data,
  });

  const { data: users } = useQuery({
    queryKey: ['messageableUsers'],
    queryFn: () => messagesAPI.users(),
    select: (r) => r.data.data,
  });

  const { data: msgData, isLoading } = useQuery({
    queryKey: ['messages', selectedUser?._id],
    queryFn: () => messagesAPI.getMessages(selectedUser._id),
    select: (r) => r.data.data,
    enabled: !!selectedUser,
  });

  useEffect(() => {
    if (msgData) {
      setMessages(msgData.messages || []);
    }
  }, [msgData]);

  const sendMutation = useMutation({
    mutationFn: (data) => messagesAPI.send(data),
    onSuccess: (res) => {
      setMessages((prev) => [...prev, res.data.data]);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    const handler = (msg) => {
      if (selectedUser && (msg.sender._id === selectedUser._id || msg.receiver._id === selectedUser._id)) {
        setMessages((prev) => [...prev, msg]);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };
    on('new_message', handler);
    return () => off('new_message', handler);
  }, [selectedUser]);

  useEffect(() => {
    const handler = ({ from }) => { if (from === selectedUser?._id) setIsTyping(true); };
    const stopHandler = ({ from }) => { if (from === selectedUser?._id) setIsTyping(false); };
    on('typing', handler);
    on('stop_typing', stopHandler);
    return () => { off('typing', handler); off('stop_typing', stopHandler); };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    sendMutation.mutate({ receiverId: selectedUser._id, content: message });
    setMessage('');
    emit('stop_typing', { to: selectedUser._id });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    emit('typing', { to: selectedUser?._id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emit('stop_typing', { to: selectedUser?._id }), 1500);
  };

  return (
    <div className="flex h-[calc(100vh-144px)] rounded-xl border border-border bg-card overflow-hidden">
      {/* Sidebar — Conversations */}
      <div className={cn('w-full sm:w-80 border-r border-border flex flex-col flex-shrink-0', selectedUser ? 'hidden sm:flex' : 'flex')}>
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search messages…" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* New Chat Users */}
          <div className="p-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Start New Chat</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(users || []).map((u) => (
                <button key={u._id} onClick={() => setSelectedUser(u)} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(u.name)}
                    </div>
                    {onlineUsers.includes(u._id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground max-w-[48px] truncate">{u.name.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div className="divide-y divide-border">
            {(conversations || []).map((conv) => (
              <button key={conv.conversationId} className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left', selectedUser?._id === conv.other?._id && 'bg-primary/5')} onClick={() => setSelectedUser(conv.other)}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full gradient-info flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(conv.other?.name)}
                  </div>
                  {onlineUsers.includes(conv.other?._id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm text-foreground truncate">{conv.other?.name}</p>
                    <p className="text-[10px] text-muted-foreground flex-shrink-0">{formatDateTime(conv.lastMessage?.createdAt)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage?.content}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn('flex-1 flex flex-col', !selectedUser ? 'hidden sm:flex' : 'flex')}>
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm mt-1">Choose from your contacts or start a new chat</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-accent/30">
              <button onClick={() => setSelectedUser(null)} className="sm:hidden p-1 rounded-lg hover:bg-accent">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="relative">
                <div className="w-9 h-9 rounded-full gradient-info flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(selectedUser.name)}
                </div>
                {onlineUsers.includes(selectedUser._id) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                  {onlineUsers.includes(selectedUser._id) ? (
                    <><Circle className="w-2 h-2 fill-green-500 text-green-500" /> Online</>
                  ) : selectedUser.role}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages || []).map((msg) => {
                const isMe = msg.sender._id === user._id || msg.sender === user._id;
                return (
                  <div key={msg._id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[70%] px-4 py-2.5 rounded-2xl text-sm', isMe ? 'gradient-primary text-white rounded-br-sm' : 'bg-accent text-foreground rounded-bl-sm')}>
                      <p>{msg.content}</p>
                      <p className={cn('text-[10px] mt-1', isMe ? 'text-white/70 text-right' : 'text-muted-foreground')}>{formatDateTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => <div key={d} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                  {selectedUser.name.split(' ')[0]} is typing…
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30">
                <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  value={message}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending}
                  className="p-2 rounded-lg gradient-primary text-white disabled:opacity-50 hover:opacity-90 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
