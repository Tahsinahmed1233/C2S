import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { chatsAPI } from '../api';
import './Chats.css';

const Chats = () => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(2); // # line-supervisors
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
    loadMessages(activeChannel);
  }, []);

  const loadChannels = async () => {
    const res = await chatsAPI.getChannels();
    if (res.data?.success) setChannels(res.data.data);
  };

  const loadMessages = async (channelId) => {
    setLoading(true);
    const res = await chatsAPI.getMessages(channelId);
    if (res.data?.success) setMessages(res.data.data);
    setLoading(false);
  };

  const handleSelectChannel = (channelId) => {
    setActiveChannel(channelId);
    loadMessages(channelId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const msgText = inputText;
    setInputText('');

    const res = await chatsAPI.sendMessage({
      channel_id: activeChannel,
      message: msgText,
    });

    if (res.data?.success && res.data?.data?.id) {
      // Use real server response
      setMessages((prev) => [...prev, res.data.data]);
    } else {
      // Optimistic fallback using local user info
      const fullName = currentUser.full_name || 'User';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender_name: fullName,
          avatar: fullName.charAt(0).toUpperCase(),
          is_self: true,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          text: msgText,
        },
      ]);
    }
  };

  const activeChannelObj = channels.find((c) => c.id === activeChannel) || {
    name: '# line-supervisors',
  };

  return (
    <Layout>
      <div className="chats-page">
        <div className="chats-layout-card">
          {/* Channels Sidebar */}
          <div className="chats-channels-pane">
            <div className="channels-pane-header">
              <h2>Factory Communications</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => alert('New Channel Dialog')}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>

            <div className="channels-search">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search streams..." />
            </div>

            <div className="channels-list">
              <span className="channels-group-label">Active Work Streams</span>
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  className={`channel-item ${activeChannel === ch.id ? 'active' : ''}`}
                  onClick={() => handleSelectChannel(ch.id)}
                >
                  <div className="channel-info">
                    <span className="channel-name">{ch.name}</span>
                    <span className="channel-snippet">{ch.last_message}</span>
                  </div>
                  {ch.unread > 0 && (
                    <span className="channel-unread-pill">{ch.unread}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Pane */}
          <div className="chats-conversation-pane">
            <div className="conversation-header">
              <div>
                <h3>{activeChannelObj.name}</h3>
                <span className="conversation-topic">
                  Operational floor synchronization • 12 participants
                </span>
              </div>
              <div className="conversation-header-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => alert('Exporting chat history transcript...')}
                >
                  <i className="fas fa-file-alt"></i> Export Transcript
                </button>
              </div>
            </div>

            <div className="messages-stream">
              {loading ? (
                <div className="loading-state">Loading messages...</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-item ${msg.is_self ? 'self' : ''}`}
                  >
                    <div className="message-avatar">{msg.avatar}</div>
                    <div className="message-content-wrap">
                      <div className="message-meta">
                        <span className="message-author">
                          {msg.sender_name}
                        </span>
                        <span className="message-time">{msg.time}</span>
                      </div>
                      <div className="message-bubble">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form className="message-input-bar" onSubmit={handleSendMessage}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => alert('Attaching factory document / CAD file')}
              >
                <i className="fas fa-paperclip"></i>
              </button>
              <input
                type="text"
                placeholder={`Message in ${activeChannelObj.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="fas fa-paper-plane"></i> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chats;
