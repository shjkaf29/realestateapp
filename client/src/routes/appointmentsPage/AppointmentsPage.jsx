import { useEffect, useState, useContext } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

function AppointmentsPage() {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]); // as customer
  const [agentAppointments, setAgentAppointments] = useState([]); // as agent
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [error, setError] = useState("");
  const [agentError, setAgentError] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      try {
        const res = await apiRequest.get("/appointments/user");
        setAppointments(res.data);
      } catch (err) {
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
    if (currentUser?.role === "agent") {
      setAgentLoading(true);
      apiRequest.get("/appointments/agent")
        .then(res => setAgentAppointments(res.data))
        .catch(() => setAgentError("Failed to load customer appointments."))
        .finally(() => setAgentLoading(false));
    }
  }, [currentUser]);

  const handleApprove = async (id) => {
    await apiRequest.patch(`/appointments/${id}/accept`);
    setAgentAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "accepted" } : a));
  };
  const handleCancel = async (id) => {
    await apiRequest.patch(`/appointments/${id}/cancel`);
    setAgentAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 32 }}>My Appointments</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {appointments.map((appt, idx) => {
          const post = appt.post;
          const postDetail = post?.postDetail;
          return (
            <div key={appt.id} style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              display: "flex",
              width: '100%',
              alignItems: "center",
              padding: 20,
              gap: 20,
              marginBottom: 28,
            }}>
              <img src={post?.images?.[0] || "/noavatar.jpg"} alt="" style={{ width: 90, height: 90, borderRadius: 8, objectFit: "cover", background: "#eee" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{post?.title || "Unknown Listing"}</div>
                <div style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>{post?.address || "-"}</div>
                <div style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>{post?.city ? `${post.city}` : ""}</div>
                {postDetail?.desc && <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>{postDetail.desc}</div>}
                <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                  {post?.bedroom ? `${post.bedroom} bed` : ""} {post?.bathroom ? `| ${post.bathroom} bath` : ""} {post?.size ? `| ${post.size} sqft` : ""}
                </div>
                {post?.price && <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>RM {post.price.toLocaleString()}</div>}
                {/* Appointment info */}
                <div style={{ fontSize: 15, marginBottom: 6 }}>
                  <b>Date:</b> {new Date(appt.date).toLocaleString()}
                </div>
                <div style={{ fontSize: 15, marginBottom: 6 }}>
                  <b>Status:</b> <span style={{ color: appt.status === "pending" ? "#e6b800" : appt.status === "accepted" ? "#2ecc40" : "#888" }}>{appt.status}</span>
                </div>
                {appt.notes && <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}><b>Notes:</b> {appt.notes}</div>}
              </div>
            </div>
          );
        })}
        {(!loading && appointments.length === 0) && <div style={{ color: '#888', fontSize: 18 }}>No appointments found.</div>}
      </div>
      {/* Agent section */}
      {currentUser?.role === "agent" && (
        <>
          <hr style={{ margin: '48px 0', border: 0, borderTop: '2px solid #eee' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Customer Appointments</h2>
          {agentLoading && <div>Loading...</div>}
          {agentError && <div style={{ color: 'red' }}>{agentError}</div>}
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {agentAppointments.filter(a => a.status === "pending").map((appt) => {
              const post = appt.post;
              const customer = appt.customer;
              return (
                <div key={appt.id} style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                  display: "flex",
                  width: '100%',
                  alignItems: "center",
                  padding: 20,
                  gap: 20,
                  marginBottom: 28,
                }}>
                  <img src={post?.images?.[0] || "/noavatar.jpg"} alt="" style={{ width: 90, height: 90, borderRadius: 8, objectFit: "cover", background: "#eee" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{post?.title || "Unknown Listing"}</div>
                    <div style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>{post?.address || "-"}</div>
                    <div style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>{post?.city ? `${post.city}` : ""}</div>
                    <div style={{ fontSize: 15, marginBottom: 6 }}>
                      <b>Customer:</b> {customer?.username || "Unknown"} ({customer?.email})
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 6 }}>
                      <b>Date:</b> {new Date(appt.date).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 15, marginBottom: 6 }}>
                      <b>Status:</b> <span style={{ color: appt.status === "pending" ? "#e6b800" : appt.status === "accepted" ? "#2ecc40" : "#888" }}>{appt.status}</span>
                    </div>
                    {appt.notes && <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}><b>Notes:</b> {appt.notes}</div>}
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                      <button onClick={() => handleApprove(appt.id)} style={{ background: '#2ecc40', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => handleCancel(appt.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!agentLoading && agentAppointments.filter(a => a.status === "pending").length === 0) && <div style={{ color: '#888', fontSize: 18 }}>No pending customer appointments.</div>}
          </div>
        </>
      )}
    </div>
  );
}

export default AppointmentsPage; 