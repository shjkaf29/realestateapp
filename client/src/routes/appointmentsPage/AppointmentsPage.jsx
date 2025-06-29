import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function AppointmentsPage() {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]); // as customer
  const [agentAppointments, setAgentAppointments] = useState([]); // as agent
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [error, setError] = useState("");
  const [agentError, setAgentError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      try {
        const res = await apiRequest.get("/appointments/user");
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
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
    try {
      const response = await apiRequest.patch(`/appointments/${id}/accept`);
      setAgentAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "accepted" } : a));
      console.log("Appointment approved:", response.data);
    } catch (err) {
      console.error("Failed to approve appointment:", err);
      alert("Failed to approve appointment. Please try again.");
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await apiRequest.patch(`/appointments/${id}/cancel`);
      setAgentAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
      console.log("Appointment cancelled:", response.data);
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setEditDate(new Date(appointment.date).toISOString().slice(0, 16));
    setEditNotes(appointment.notes || "");
  };

  const handleUpdate = async (id) => {
    try {
      await apiRequest.patch(`/appointments/${id}`, {
        date: editDate,
        notes: editNotes,
      });
      // Re-fetch all appointments to ensure fresh data
      const res = await apiRequest.get("/appointments/user");
      setAppointments(res.data);
      setEditingId(null);
      setEditDate("");
      setEditNotes("");
    } catch (err) {
      console.error("Failed to update appointment:", err);
      alert("Failed to update appointment. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await apiRequest.delete(`/appointments/${id}`);
        setAppointments(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        console.error("Failed to delete appointment:", err);
        alert("Failed to delete appointment. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "#e6b800";
    if (status === "accepted") return "#2ecc40";
    return "#888";
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate("");
    setEditNotes("");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 32 }}>My Appointments</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {appointments.map((appt) => {
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
                  <b>Status:</b> <span style={{ color: getStatusColor(appt.status) }}>{appt.status}</span>
                </div>
                {appt.notes && <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}><b>Notes:</b> {appt.notes}</div>}
                
                {/* Edit form for pending appointments */}
                {editingId === appt.id ? (
                  <div style={{ marginTop: 16, padding: 16, background: '#f9f9f9', borderRadius: 8, border: '1px solid #ddd' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Edit Appointment</h4>
                    <div style={{ marginBottom: 12 }}>
                      <label htmlFor={`edit-date-${appt.id}`} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Date & Time:</label>
                      <input 
                        id={`edit-date-${appt.id}`}
                        type="datetime-local" 
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                      />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label htmlFor={`edit-notes-${appt.id}`} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Notes:</label>
                      <textarea 
                        id={`edit-notes-${appt.id}`}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
                        placeholder="Add any additional notes..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => handleUpdate(appt.id)}
                        style={{ 
                          background: '#2ecc40', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          padding: '8px 16px', 
                          cursor: 'pointer',
                          fontSize: 14
                        }}
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={cancelEdit}
                        style={{ 
                          background: '#888', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          padding: '8px 16px', 
                          cursor: 'pointer',
                          fontSize: 14
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action buttons for pending appointments */
                  appt.status === "pending" && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button 
                        onClick={() => handleEdit(appt)}
                        style={{ 
                          background: '#007bff', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          padding: '6px 12px', 
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(appt.id)}
                        style={{ 
                          background: '#ff4d4f', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          padding: '6px 12px', 
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )
                )}
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
            {agentAppointments.map((appt) => {
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
                  opacity: appt.status === "rejected" ? 0.6 : 1,
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
                      <b>Status:</b> <span style={{ color: getStatusColor(appt.status) }}>{appt.status.toUpperCase()}</span>
                    </div>
                    {appt.notes && <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}><b>Notes:</b> {appt.notes}</div>}
                    {appt.status === "pending" && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                        <button onClick={() => handleApprove(appt.id)} style={{ background: '#2ecc40', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleCancel(appt.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    )}
                    {appt.status === "accepted" && (
                      <div style={{ marginTop: 10, padding: '8px 16px', background: '#f0f9ff', borderRadius: 6, border: '1px solid #2ecc40' }}>
                        <span style={{ color: '#2ecc40', fontWeight: 600, fontSize: 14 }}>✓ Appointment Confirmed</span>
                      </div>
                    )}
                    {appt.status === "rejected" && (
                      <div style={{ marginTop: 10, padding: '8px 16px', background: '#fff5f5', borderRadius: 6, border: '1px solid #ff4d4f' }}>
                        <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 14 }}>✗ Appointment Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {(!agentLoading && agentAppointments.length === 0) && <div style={{ color: '#888', fontSize: 18 }}>No customer appointments.</div>}
          </div>
        </>
      )}
    </div>
  );
}

export default AppointmentsPage; 