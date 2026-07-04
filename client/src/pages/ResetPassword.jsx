import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";

export default function ResetPassword() {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const [success] = useState(
        location.state?.message || ""
    );

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (password !== confirmPassword) {

            return setError("Passwords do not match.");

        }

        try {

            setLoading(true);

            await API.post("/auth/reset-password", {

                email,
                password,

            });

            alert("Password updated successfully!");

            navigate("/login", {
                state: {
                    message: "Password updated successfully. Please login.",
                },
            });

        }

        catch (err) {

            setError(

                err.response?.data?.message ||

                "Failed to reset password."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout>

            <AuthCard
                title="Create New Password"
                subtitle="Your new password must be different from the old one."
            >

                {error &&

                    <div
                        style={{
                            background: "#FFF5F5",
                            color: "#DC2626",
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 18,
                        }}
                    >

                        {error}

                    </div>

                }

                {success && (
                    <div
                        style={{
                            background: "#ECFDF3",
                            color: "#166534",
                            border: "1px solid #BBF7D0",
                            padding: "12px",
                            borderRadius: 10,
                            marginBottom: 12,
                            fontSize: 14,
                        }}
                    >
                        {success}
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
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <AuthInput
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <AuthButton
                        type="submit"
                        loading={loading}
                    >

                        Update Password

                    </AuthButton>

                </form>

            </AuthCard>

        </AuthLayout>

    );

}