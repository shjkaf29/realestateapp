import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import apiRequest from "../../lib/apiRequest";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("customer"); // default to customer

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await apiRequest.post("/auth/register", {
        username,
        email,
        password,
        role, // send role to backend
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Create an Account</h1>
          <div>
            <label>
              <input
                type="radio"
                name="role"
                value="customer"
                checked={role === "customer"}
                onChange={() => setRole("customer")}
              />
              Customer
            </label>
            <label style={{ marginLeft: "20px" }}>
              <input
                type="radio"
                name="role"
                value="agent"
                checked={role === "agent"}
                onChange={() => setRole("agent")}
              />
              Agent
            </label>
          </div>
          <input name="username" type="text" placeholder="Username" required />
          <input name="email" type="text" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button disabled={isLoading}>Register</button>
          {error && <span>{error}</span>}
          <Link to="/login">Do you have an account?</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Register;