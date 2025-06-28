import { useEffect, useState } from "react";
import apiRequest from "../../lib/apiRequest";

function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const handleContact = async (agent) => {
    // Here you would call your backend to send the email
    // For now, just simulate success
    setEmailStatus("Sending...");
    setTimeout(() => {
      setEmailStatus("Email sent to " + agent.email + "!");
      setContactId(null);
      setEmailBody("");
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 32 }}>Agents</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        {agents.map((agent) => (
          <div key={agent.id} style={{
            background: "#fff",
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
          }}>
            <img src={agent.avatar || "/noavatar.jpg"} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 16, background: "#eee" }} />
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>{agent.username}</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 10 }}>{agent.email}</div>
            <button
              style={{ background: "#fece51", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, fontSize: 15, color: "#222", cursor: "pointer", marginTop: 8 }}
              onClick={() => { setContactId(agent.id); setEmailStatus(""); }}
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
    </div>
  );
}

export default AgentsPage; 