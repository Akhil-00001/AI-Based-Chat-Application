import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (canResend) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [canResend]);

    const handleResend = async () => {
        try {
            const endpoint =
                mode === "register"
                    ? "/auth/resend-otp"
                    : "/auth/forgot-password";

            await API.post(endpoint, {
                email,
            });

            setCanResend(false);
            setTimer(30);

            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to resend OTP"
            );
        }
    };

    const email = location.state?.email;
    const mode = location.state?.mode || "register";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate(
                mode === "register"
                    ? "/register"
                    : "/forgot-password"
            );
        }
    }, [email, mode, navigate]);

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pasted) return;

        const arr = pasted.split("");

        while (arr.length < 6) {
            arr.push("");
        }

        setOtp(arr);

        inputRefs.current[
            Math.min(pasted.length, 6) - 1
        ]?.focus();
    };

    const handleVerify = async () => {
        try {
            setLoading(true);
            setError("");

            const code = otp.join("");

            const endpoint =
                mode === "register"
                    ? "/auth/verify-otp"
                    : "/auth/verify-reset-otp";

            const res = await API.post(endpoint, {
                email,
                otp: code,
            });

            if (mode === "register") {

                login(res.data.user, res.data.token);

                navigate("/chat");

            } else {

                navigate("/reset-password", {
                    state: {
                        email,
                    },
                });

            }

        } catch (err) {
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setError(
                err.response?.data?.message ||
                "Verification failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>


                <h2>
                    {mode === "register"
                        ? "Verify Email"
                        : "Reset Password"}
                </h2>

                <p>
                    {mode === "register"
                        ? "Enter the verification code sent to"
                        : "Enter the password reset code sent to"}

                    <br />

                    <strong>{email}</strong>
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <div
                    style={styles.otpContainer}
                    onPaste={handlePaste}
                >
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) =>
                                (inputRefs.current[index] = el)
                            }
                            value={digit}
                            maxLength={1}
                            onChange={(e) =>
                                handleChange(
                                    e.target.value,
                                    index
                                )
                            }
                            onKeyDown={(e) =>
                                handleKeyDown(e, index)
                            }
                            style={styles.otpBox}
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    style={styles.button}
                >
                    {loading
                        ? "Verifying..."
                        : "Verify OTP"}
                </button>
                <div
                    style={{
                        marginTop: 20,
                        textAlign: "center",
                    }}
                >
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            style={{
                                border: "none",
                                background: "none",
                                color: "#4f9cff",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Resend OTP
                        </button>
                    ) : (
                        <span
                            style={{
                                color: "#666",
                            }}
                        >
                            Resend OTP in {timer}s
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
};

const styles = {
    container: {
        height: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f7fb",
    },

    card: {
        width: 420,
        background: "#fff",
        padding: 35,
        borderRadius: 16,
        boxShadow:
            "0 10px 40px rgba(0,0,0,.08)",
        textAlign: "center",
    },

    otpContainer: {
        display: "flex",
        justifyContent: "center",
        gap: 10,
        margin: "25px 0",
    },

    otpBox: {
        width: 52,
        height: 60,
        textAlign: "center",
        fontSize: 24,
        borderRadius: 10,
        border: "1px solid #ccc",
    },

    button: {
        width: "100%",
        padding: 14,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
    },

    error: {
        color: "red",
        marginTop: 10,
    },
};

export default VerifyOtp;