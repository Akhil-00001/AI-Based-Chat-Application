import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../services/api";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";

export default function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try{

            setLoading(true);

            await API.post("/auth/forgot-password",{
                email
            });

            navigate("/verify-otp",{
                state:{
                    email,
                    mode:"reset"
                }
            });

        }

        catch(err){

            setError(
                err.response?.data?.message ||
                "Something went wrong."
            );

        }

        finally{

            setLoading(false);

        }

    };

    return(

        <AuthLayout>

            <AuthCard
                title="Forgot Password"
                subtitle="Enter your email to receive a password reset OTP."
            >

                {error &&

                <div
                style={{
                    background:"#FFF5F5",
                    color:"#DC2626",
                    padding:12,
                    borderRadius:10,
                }}
                >

                    {error}

                </div>

                }

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display:"flex",
                        flexDirection:"column",
                        gap:20,
                    }}
                >

                    <AuthInput

                        label="Email"

                        type="email"

                        name="email"

                        value={email}

                        placeholder="Enter your email"

                        onChange={(e)=>setEmail(e.target.value)}

                    />

                    <AuthButton
                        type="submit"
                        loading={loading}
                    >
                        Send OTP
                    </AuthButton>

                </form>

                <p
                    style={{
                        marginTop:24,
                        textAlign:"center",
                    }}
                >

                    <Link
                        to="/login"
                    >
                        Back to Login
                    </Link>

                </p>

            </AuthCard>

        </AuthLayout>

    );

}