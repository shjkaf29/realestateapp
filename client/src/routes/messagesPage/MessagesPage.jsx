import { useEffect, useState, useContext } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./messagesPage.scss";

function MessagesPage() {
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser?.role !== "agent") return;
    
    fetchMessages();
  }, [currentUser]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.get("/contact-messages/agent");
      setMessages(res.data);
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await apiRequest.patch(`/contact-messages/${messageId}/read`);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (err) {
      console.error("Failed to mark message as read");
    }
  };

  const handleClearMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await apiRequest.delete(`/contact-messages/${messageId}`);
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } catch (err) {
        console.error("Failed to delete message");
      }
    }
  };

  if (currentUser?.role !== "agent") {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>
        Only agents can access this page.
      </div>
    );
  }

  return (
    <div className="messagesPage">
      <div className="container">
        <h1>Customer Messages</h1>
        
        {loading && <div className="loading">Loading messages...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && messages.length === 0 && (
          <div className="no-messages">No messages found.</div>
        )}

        <div className="messages-list">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message-card ${!message.isRead ? 'unread' : ''}`}
            >
              <div className="message-header">
                <div className="sender-info">
                  <img 
                    src={message.sender?.avatar || "/noavatar.jpg"} 
                    alt="sender" 
                    className="sender-avatar"
                  />
                  <div className="sender-details">
                    <div className="sender-name">{message.sender?.username || message.senderName}</div>
                    <div className="sender-email">{message.sender?.email || message.senderEmail}</div>
                  </div>
                </div>
                <div className="message-meta">
                  <div className="message-date">
                    {new Date(message.createdAt).toLocaleDateString()} at{' '}
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {!message.isRead && <span className="unread-badge">NEW</span>}
                </div>
              </div>
              
              <div className="message-subject">
                <strong>{message.subject}</strong>
              </div>
              
              <div className="message-content">
                {message.message}
              </div>
              
              <div className="message-actions">
                {!message.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(message.id)}
                    className="mark-read-btn"
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  onClick={() => handleClearMessage(message.id)}
                  className="clear-btn"
                >
                  Clear Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
