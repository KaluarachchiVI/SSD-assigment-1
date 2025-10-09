import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";       
import Googlelogin from "./Login";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [csrfToken, setCsrfToken] = useState("");

  // Fetch CSRF token when component mounts
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/csrf-token", {
          credentials: 'include', // Important for cookies
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Store the token if your backend returns one
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.message || "An error occurred during login");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
          <button type="button" onClick={() => navigate("/register")}>
            Go to Register
          </button>
          
        </form>
        <Googlelogin />
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
