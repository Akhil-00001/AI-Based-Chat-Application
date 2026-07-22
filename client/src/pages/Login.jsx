
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import Divider from "../components/auth/Divider";
import GoogleButton from "../components/auth/GoogleButton";
import useResponsive from "../components/hooks/useResponsive";
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {isMobile} = useResponsive();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", formData);

      login(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await API.post("/auth/google", {
        credential: response.credential,
      });

      login(res.data.user, res.data.token);

      navigate("/chat");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Google Login Failed"
      );
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Continue your conversations."
      >
        {error && (
          <div
            style={{
              color: "#d93025",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <AuthInput
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            {/* <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input type="checkbox" />
              Remember me
            </label> */}

            <Link
              to="/forgot-password"
              style={{
                color: "#A8743B",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <AuthButton
            type="submit"
          >
            Login
          </AuthButton>
        </form>

        <Divider />

        <GoogleButton
          onSuccess={handleGoogleSuccess}
        />

        <p
          style={{
            marginTop: isMobile ? 4 : 16,
            textAlign: "center",
            color: "#666",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#A8743B",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Register
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};



export default Login;

// import { Link, useNavigate } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google";
// import API from "../services/api";
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }))
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await API.post("/auth/login", formData);

//       login(res.data.user, res.data.token);
//       navigate("/chat");
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };

//   const handleGoogleSuccess = async (response) => {
//   try {
//     const res = await API.post("/auth/google", {
//       credential: response.credential,
//     });

//     login(res.data.user, res.data.token);

//     navigate("/chat");
//   } catch (err) {
//     console.error(err);
//     setError(
//       err.response?.data?.message || "Google Login Failed"
//     );
//   }
// };

//   return (
//     <div style={styles.container}>
//       <form style={styles.form} onSubmit={handleSubmit}>
//         <h2>Login</h2>

//         {error && <p style={styles.error}>{error}</p>}

//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           style={styles.input}
//         />

//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           style={styles.input}
//         />

//         <button type="submit" style={styles.button}>
//           Login
//         </button>
//         <GoogleLogin
//           onSuccess={handleGoogleSuccess}
//           onError={() => {
//             console.log("Google Login Failed");
//           }}
//         />

//         <p>
//           Don’t have an account? <Link to="/register">Register</Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     minHeight: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     background: "#f4f4f4",
//   },
//   form: {
//     background: "#fff",
//     padding: "30px",
//     borderRadius: "10px",
//     width: "320px",
//     display: "flex",
//     flexDirection: "column",
//     gap: "12px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//   },
//   input: {
//     padding: "10px",
//     fontSize: "14px",
//   },
//   button: {
//     padding: "10px",
//     cursor: "pointer",
//   },
//   error: {
//     color: "red",
//     fontSize: "14px",
//   },
// };

// export default Login;