import "./singlePage.scss";

import { useContext, useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import DOMPurify from "dompurify";
import Map from "../../components/map/Map";
import Slider from "../../components/slider/Slider";
import apiRequest from "../../lib/apiRequest";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const [saving, setSaving] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [timeError, setTimeError] = useState("");

  // Debug: Log the initial state
  console.log("SinglePage loaded - Post:", post.id, "Initial isSaved:", post.isSaved, "Current user:", currentUser?.id);

  // Only update saved state when user changes, not on every component mount
  useEffect(() => {
    if (!currentUser) {
      setSaved(false);
    } else {
      // Set saved state from initial post data
      setSaved(post.isSaved);
    }
  }, [currentUser, post.isSaved]);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (saving) return; // Prevent multiple clicks
    
    setSaving(true);
    
    // Optimistically update the UI
    const previousSavedState = saved;
    setSaved(!saved);
    
    try {
      console.log("Current saved state before toggle:", previousSavedState);
      const response = await apiRequest.post("/users/save", { postId: post.id });
      console.log("Backend response:", response.data);
      
      // Backend returns "Post saved" or "Post removed from saved list"  
      const wasSaved = response.data.message === "Post saved";
      console.log("New saved state:", wasSaved);
      
      // Update state based on server response (in case our optimistic update was wrong)
      setSaved(wasSaved);
    } catch (err) {
      console.error("Error saving post:", err);
      
      // Revert the optimistic update on error
      setSaved(previousSavedState);
      
      // Show user-friendly error message
      alert("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  // Helper to check if time is between 9am and 5pm
  const isTimeInRange = (dateTimeStr) => {
    if (!dateTimeStr) return false;
    const date = new Date(dateTimeStr);
    const hours = date.getHours();
    return hours >= 9 && hours < 17;
  };

  // Check if current user is the property owner and is an agent
  const isPropertyOwner = currentUser && post.user && currentUser.id === post.user.id;
  const canEditProperty = isPropertyOwner && currentUser?.role === "agent";
  const canMeetAgent = currentUser && currentUser?.role === "customer" && !isPropertyOwner;

  const handleEdit = () => {
    navigate(`/edit-post/${post.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      try {
        await apiRequest.delete(`/posts/${post.id}`);
        navigate("/list");
      } catch (err) {
        console.log(err);
        alert("Failed to delete property. Please try again.");
      }
    }
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
                <div className="action-buttons" style={{display:'flex', gap:16, marginTop:24, flexWrap: 'wrap'}}>
                  {/* Show save and meet agent buttons for customers who don't own the property */}
                  {canMeetAgent && (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: saved ? '#fece51' : '#fff',
                          border: '1.5px solid #ddd', borderRadius: 8, padding: '12px 24px', fontWeight: 500, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s', height: 48,
                          opacity: saving ? 0.7 : 1
                        }}
                        onMouseOver={e => !saving && (e.currentTarget.style.borderColor = '#fece51')}
                        onMouseOut={e => !saving && (e.currentTarget.style.borderColor = '#ddd')}
                        onFocus={e => !saving && (e.currentTarget.style.borderColor = '#fece51')}
                        onBlur={e => !saving && (e.currentTarget.style.borderColor = '#ddd')}
                      >
                        <img src="/save.png" alt="" style={{width: 22, height: 22}} />
                        {saving ? "Saving..." : (saved ? "Saved" : "Save")}
                      </button>
                      <button
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: '#fece51', color: '#222', fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', height: 48, transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#ffd77a'}
                        onMouseOut={e => e.currentTarget.style.background = '#fece51'}
                        onFocus={e => e.currentTarget.style.background = '#ffd77a'}
                        onBlur={e => e.currentTarget.style.background = '#fece51'}
                        onClick={() => setShowModal(true)}
                      >
                        <img src="/chat.png" alt="Chat" style={{width: 22, height: 22, filter: 'brightness(0.7)'}} />
                        Meet agent
                      </button>
                    </>
                  )}
                  
                  {/* Show edit and delete buttons for property owners who are agents */}
                  {canEditProperty && (
                    <>
                      <button
                        onClick={handleEdit}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: '#4caf50', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', height: 48, transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#45a049'}
                        onMouseOut={e => e.currentTarget.style.background = '#4caf50'}
                        onFocus={e => e.currentTarget.style.background = '#45a049'}
                        onBlur={e => e.currentTarget.style.background = '#4caf50'}
                      >
                        <span style={{fontSize: 18}}>✏️</span>
                        Edit Property
                      </button>
                      <button
                        onClick={handleDelete}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: '#f44336', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', height: 48, transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#da190b'}
                        onMouseOut={e => e.currentTarget.style.background = '#f44336'}
                        onFocus={e => e.currentTarget.style.background = '#da190b'}
                        onBlur={e => e.currentTarget.style.background = '#f44336'}
                      >
                        <span style={{fontSize: 18}}>🗑️</span>
                        Delete Property
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="user" style={{margin: 0, background: 'none'}}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#fff', border: '1.5px solid #ddd', borderRadius: 8,
                  padding: '12px 24px', height: 48, minWidth: 0, maxWidth: 180, boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <img src={(post.user?.avatar) || '/noavatar.jpg'} alt="" style={{width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#eee'}} />
                  <span style={{fontWeight: 500, fontSize: 16, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{post.user?.username || "Unknown agent"}</span>
                </div>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school > 999
                    ? post.postDetail.school / 1000 + "km"
                    : post.postDetail.school + "m"}{" "}
                  away
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
        </div>
      </div>
      {showModal && canMeetAgent && (
        <div className="modal-overlay" style={{position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div className="modal-content" style={{background:'#fff', padding:'36px 32px', borderRadius:16, minWidth:340, maxWidth:420, boxShadow:'0 4px 32px rgba(0,0,0,0.13)', textAlign:'left'}}>
            <h2 style={{fontSize:'2rem', fontWeight:700, marginBottom:24, color:'#222'}}>Book an Appointment</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBookingMsg("");
                setTimeError("");
                if (!isTimeInRange(appointmentDate)) {
                  setTimeError("Please select a time between 9:00 AM and 5:00 PM.");
                  return;
                }
                try {
                  await apiRequest.post("/appointments/book", {
                    agentId: post.user.id,
                    postId: post.id,
                    date: appointmentDate,
                    notes,
                  });
                  setBookingMsg("Appointment booked! Pending agent approval.");
                  setShowModal(false);
                } catch (err) {
                  setBookingMsg("Failed to book appointment.");
                }
              }}
            >
              <div style={{marginBottom:18}}>
                <label style={{fontWeight:600, fontSize:15, marginBottom:6, display:'block'}}>Agent:</label>
                <input type="text" value={post.user.username} disabled style={{width:'100%', borderRadius:8, border:'1.5px solid #eee', padding:'12px', fontSize:15, background:'#f8f8f8', color:'#888'}} />
              </div>
              <div style={{marginBottom:18}}>
                <label style={{fontWeight:600, fontSize:15, marginBottom:6, display:'block'}}>Your Name:</label>
                <input type="text" value={currentUser?.username || ''} disabled style={{width:'100%', borderRadius:8, border:'1.5px solid #eee', padding:'12px', fontSize:15, background:'#f8f8f8', color:'#888'}} />
              </div>
              <div style={{marginBottom:18}}>
                <label style={{fontWeight:600, fontSize:15, marginBottom:6, display:'block'}}>Date:</label>
                <input type="datetime-local" required value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} style={{width:'100%', borderRadius:8, border:'1.5px solid #eee', padding:'12px', fontSize:15, background:'#f8f8f8'}} min={getMinDateTime()} />
              </div>
              <div style={{marginBottom:18}}>
                <label style={{fontWeight:600, fontSize:15, marginBottom:6, display:'block'}}>Notes:</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{width:'100%', borderRadius:8, border:'1.5px solid #eee', padding:'12px', fontSize:15, background:'#f8f8f8', minHeight:60}} placeholder="Add any notes for the agent..." />
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:12, marginTop:8}}>
                <button type="button" onClick={() => setShowModal(false)} style={{background:'#f3f3f3', border:'none', borderRadius:6, padding:'10px 22px', fontWeight:500, fontSize:15, color:'#444', cursor:'pointer', transition:'all 0.2s'}}>Cancel</button>
                <button type="submit" style={{background:'#fece51', border:'none', borderRadius:6, padding:'10px 22px', fontWeight:600, fontSize:15, color:'#222', cursor:'pointer', transition:'all 0.2s'}}>Book</button>
              </div>
              {bookingMsg && <div style={{marginTop:16, color:'green', fontWeight:500}}>{bookingMsg}</div>}
              {timeError && <div style={{marginBottom:10, color:'red', fontWeight:500}}>{timeError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SinglePage;
