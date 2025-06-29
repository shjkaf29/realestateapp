import { useEffect, useState, useContext } from "react";
import apiRequest from "../../lib/apiRequest";
import Card from "../../components/card/Card";
import { AuthContext } from "../../context/AuthContext";

function AgentsPage() {
  const { currentUser } = useContext(AuthContext);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentProperties, setAgentProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState("");
  const [contactId, setContactId] = useState(null);
  const [emailBody, setEmailBody] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await apiRequest.get("/users/agents");
        setAgents(res.data);
      } catch (err) {
        setError("Failed to load agents.");
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const handleAgentClick = async (agent) => {
    setSelectedAgent(agent);
    setAgentProperties([]);
    setPropertiesError("");
    setPropertiesLoading(true);
    try {
      const res = await apiRequest.get(`/posts?userId=${agent.id}`);
      setAgentProperties(res.data);
    } catch (err) {
      setPropertiesError("Failed to load properties.");
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleContact = async (agent) => {
    if (!currentUser) {
      setEmailStatus("Please login to send messages.");
      return;
    }
    
    setEmailStatus("Sending...");
    try {
      await apiRequest.post("/contact-messages/send", {
        recipientId: agent.id,
        message: emailBody,
        subject: "Contact from Customer",
        senderName: currentUser.username,
        senderEmail: currentUser.email,
      });
      setEmailStatus("Message sent to " + agent.username + "!");
      setContactId(null);
      setEmailBody("");
    } catch (err) {
      setEmailStatus("Failed to send message. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 32 }}>Agents</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 40 }}>
        {agents.map((agent) => (
          <div key={agent.id} style={{
            background: selectedAgent?.id === agent.id ? "#fffbe6" : "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            minWidth: 320,
            maxWidth: 360,
            flex: 1,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
            cursor: "pointer",
            border: selectedAgent?.id === agent.id ? "2px solid #fece51" : "none"
          }}
          onClick={() => handleAgentClick(agent)}
          >
            <img src={agent.avatar || "/noavatar.jpg"} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 16, background: "#eee" }} />
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>{agent.username}</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 10 }}>{agent.email}</div>
            <button
              style={{ background: "#fece51", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, fontSize: 15, color: "#222", cursor: "pointer", marginTop: 8 }}
              onClick={e => { e.stopPropagation(); setContactId(agent.id); setEmailStatus(""); }}
            >
              Contact
            </button>
            {contactId === agent.id && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleContact(agent);
                }}
                style={{ marginTop: 16, width: "100%" }}
              >
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Write your message..."
                  required
                  style={{ width: "100%", borderRadius: 8, border: "1.5px solid #eee", padding: 12, fontSize: 15, minHeight: 60, marginBottom: 10 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setContactId(null)} style={{ background: "#f3f3f3", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 500, fontSize: 15, color: "#444", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ background: "#fece51", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 15, color: "#222", cursor: "pointer" }}>Send</button>
                </div>
                {emailStatus && <div style={{ marginTop: 10, color: "green", fontWeight: 500 }}>{emailStatus}</div>}
              </form>
            )}
          </div>
        ))}
        {(!loading && agents.length === 0) && <div style={{ color: '#888', fontSize: 18 }}>No agents found.</div>}
      </div>
      {selectedAgent && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Agent Details</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#fffbe6', borderRadius: 12, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', marginBottom: 24 }}>
            <img src={selectedAgent.avatar || "/noavatar.jpg"} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", background: "#eee" }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>{selectedAgent.username}</div>
              <div style={{ color: "#888", fontSize: 15, marginBottom: 10 }}>{selectedAgent.email}</div>
            </div>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 16 }}>Properties by agent</h3>
          {propertiesLoading && <div>Loading properties...</div>}
          {propertiesError && <div style={{ color: 'red' }}>{propertiesError}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            {agentProperties.map((post) => (
              <Card key={post.id} item={post} />
            ))}
            {(!propertiesLoading && agentProperties.length === 0) && <div style={{ color: '#888', fontSize: 18 }}>No properties found for this agent.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentsPage; 