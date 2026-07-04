import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/auth/GoogleButton";

import API from "../services/api";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import Divider from "../components/auth/Divider";

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      await API.post("/auth/register", formData);

      navigate("/verify-otp", {
        state: {
          email: formData.email,
          mode:"register"
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
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
        err.response?.data?.message ||
        "Google Sign Up Failed"
      );
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        subtitle="Create your Chat Up account."
      >
        {error && (
          <div
            style={{
              background: "#FFF5F5",
              color: "#DC2626",
              border: "1px solid #FECACA",
              padding: "12px 14px",
              borderRadius: 10,
              fontSize: 14,
              marginBottom: 6,
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
            gap: 10,
          }}
        >
          <AuthInput
            label="Full Name"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
          />

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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />

          <AuthButton
            type="submit"
            loading={loading}
          >
            Create Account
          </AuthButton>
        </form>

        <Divider />

        <div>
          <GoogleButton
            onSuccess={handleGoogleSuccess}
          />
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 10,
            color: "#666",
            marginBottom:"0",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#A8743B",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import API from "../services/api";
// import { useAuth } from "../context/AuthContext";

// const Register = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await API.post("/auth/register", formData);

//       navigate("/verify-otp", {
//         state: {
//           email: formData.email,
//         },
//       });

//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Registration failed"
//       );
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <form style={styles.form} onSubmit={handleSubmit}>
//         <h2>Register</h2>

//         {error && <p style={styles.error}>{error}</p>}

//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleChange}
//           style={styles.input}
//         />

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
//           Register
//         </button>

//         <p>
//           Already have an account? <Link to="/login">Login</Link>
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

// export default Register;