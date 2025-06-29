import "./editPostPage.scss";
import "react-quill/dist/quill.snow.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import ReactQuill from "react-quill";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import apiRequest from "../../lib/apiRequest";

function EditPostPage() {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiRequest.get(`/posts/${id}`);
        const postData = res.data;
        
        // Check if current user is the owner
        if (!currentUser || postData.userId !== currentUser.id) {
          navigate("/");
          return;
        }
        
        setPost(postData);
        setValue(postData.postDetail?.desc || "");
        setImages(postData.images || []);
      } catch (err) {
        console.log(err);
        setError("Failed to load post data");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, currentUser, navigate]);

  if (currentUser?.role !== "agent") {
    setTimeout(() => navigate("/"), 2000);
    return <div style={{padding: 40, textAlign: 'center', color: 'red'}}>Only agents can edit listings. Redirecting to home...</div>;
  }

  if (loading) {
    return <div style={{padding: 40, textAlign: 'center'}}>Loading...</div>;
  }

  if (!post) {
    return <div style={{padding: 40, textAlign: 'center', color: 'red'}}>Post not found or access denied.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    // Basic validation
    if (!inputs.title || !inputs.price || !inputs.address || !inputs.city) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      console.log("Submitting update with data:", inputs);
      const res = await apiRequest.put(`/posts/${id}`, {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: inputs.city,
          bedroom: parseInt(inputs.bedroom) || 1,
          bathroom: parseInt(inputs.bathroom) || 1,
          type: inputs.type,
          property: inputs.property,
          latitude: inputs.latitude || "0",
          longitude: inputs.longitude || "0",
          images: images,
        },
        postDetail: {
          desc: value || "",
          utilities: inputs.utilities || "owner",
          pet: inputs.pet || "not-allowed",
          income: inputs.income || "",
          size: parseInt(inputs.size) || 0,
          school: parseInt(inputs.school) || 0,
          bus: parseInt(inputs.bus) || 0,
          restaurant: parseInt(inputs.restaurant) || 0,
        },
      });
      navigate(`/${res.data.id}`);
    } catch (err) {
      console.log("Update error:", err);
      setError(err.response?.data?.message || "Failed to update post");
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1>Edit Property Listing</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="title">Title *</label>
              <input id="title" name="title" type="text" defaultValue={post.title} required />
            </div>
            <div className="item">
              <label htmlFor="price">Price *</label>
              <input id="price" name="price" type="number" defaultValue={post.price} required />
            </div>
            <div className="item">
              <label htmlFor="address">Address *</label>
              <input id="address" name="address" type="text" defaultValue={post.address} required />
            </div>
            <div className="item description">
              <label htmlFor="desc">Description</label>
              <ReactQuill theme="snow" onChange={setValue} value={value} />
            </div>
            <div className="item">
              <label htmlFor="city">City *</label>
              <input id="city" name="city" type="text" defaultValue={post.city} required />
            </div>
            <div className="item">
              <label htmlFor="bedroom">Bedroom Number</label>
              <input id="bedroom" name="bedroom" min={1} type="number" defaultValue={post.bedroom} />
            </div>
            <div className="item">
              <label htmlFor="bathroom">Bathroom Number</label>
              <input id="bathroom" name="bathroom" min={1} type="number" defaultValue={post.bathroom} />
            </div>
            <div className="item">
              <label htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" type="text" defaultValue={post.latitude} />
            </div>
            <div className="item">
              <label htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" type="text" defaultValue={post.longitude} />
            </div>
            <div className="item">
              <label htmlFor="type">Type</label>
              <select name="type" defaultValue={post.type}>
                <option value="rent">Rent</option>
                <option value="buy">Buy</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="property">Property</label>
              <select name="property" defaultValue={post.property}>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="utilities">Utilities Policy</label>
              <select name="utilities" defaultValue={post.postDetail?.utilities}>
                <option value="owner">Owner is responsible</option>
                <option value="tenant">Tenant is responsible</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="pet">Pet Policy</label>
              <select name="pet" defaultValue={post.postDetail?.pet}>
                <option value="allowed">Allowed</option>
                <option value="not-allowed">Not Allowed</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="income">Income Policy</label>
              <input
                id="income"
                name="income"
                type="text"
                placeholder="Income Policy"
                defaultValue={post.postDetail?.income}
              />
            </div>
            <div className="item">
              <label htmlFor="size">Total Size (sqft)</label>
              <input id="size" name="size" min={0} type="number" defaultValue={post.postDetail?.size} />
            </div>
            <div className="item">
              <label htmlFor="school">School</label>
              <input
                id="school"
                name="school"
                min={0}
                type="number"
                defaultValue={post.postDetail?.school}
              />
            </div>
            <div className="item">
              <label htmlFor="bus">Bus</label>
              <input id="bus" name="bus" min={0} type="number" defaultValue={post.postDetail?.bus} />
            </div>
            <div className="item">
              <label htmlFor="restaurant">Restaurant</label>
              <input
                id="restaurant"
                name="restaurant"
                min={0}
                type="number"
                defaultValue={post.postDetail?.restaurant}
              />
            </div>
            <button className="sendButton">Update</button>
            {error && <span>{error}</span>}
          </form>
        </div>
      </div>
      <div className="sideContainer">
        {images.map((image, index) => (
          <img src={image} key={`image-${index}-${image.substring(image.lastIndexOf('/') + 1)}`} alt="" />
        ))}
        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "lamadev",
            uploadPreset: "estate",
            folder: "posts",
          }}
          setState={setImages}
        />
      </div>
    </div>
  );
}

export default EditPostPage;
