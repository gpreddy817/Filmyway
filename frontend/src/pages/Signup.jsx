import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Popcorn, Chrome } from 'lucide-react';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const { username, email, password, confirmPassword } = formData;
    const [localError, setLocalError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }
        try {
            setIsRegistering(true);
            const response = await axios.post(`${API_URL}/register`, { username, email, password });
            if (response.data) {
                navigate('/login');
            }
        } catch (error) {
            setIsRegistering(false);
            setLocalError((error.response && error.response.data && error.response.data.message) || error.message);
        }
    };

    if (isRegistering) {
        return (
            <div className="auth-container">
                <div className="auth-card glass-panel animate-fade auth-skeleton">
                    <div className="auth-header">
                        <div className="skeleton skeleton-icon" />
                        <div className="skeleton skeleton-auth-title" />
                        <div className="skeleton skeleton-auth-subtitle" />
                    </div>
                    <div className="auth-form">
                        <div className="skeleton skeleton-input" />
                        <div className="skeleton skeleton-input" />
                        <div className="skeleton skeleton-input" />
                        <div className="skeleton skeleton-input" />
                        <div className="skeleton skeleton-button" />
                    </div>
                    <div className="skeleton skeleton-auth-footer" />
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            {/* Centered glass card matching modern-stunning-sign-in style */}
            <div className="auth-card glass-card-modern animate-fade">
                {/* Logo & Header */}
                <div className="auth-logo-badge">
                    <Popcorn className="w-6 h-6 text-white" />
                </div>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join Filmyway to discover and save movies</p>

                {/* Form */}
                <form onSubmit={onSubmit} className="auth-form">
                    {localError && <div className="error-message">{localError}</div>}
                    <div className="form-group">
                        <input
                            type="text"
                            className="modern-input"
                            id="username"
                            name="username"
                            value={username}
                            placeholder="Username"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            className="modern-input"
                            id="email"
                            name="email"
                            value={email}
                            placeholder="Email address"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="modern-input"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Password"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="modern-input"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            placeholder="Confirm Password"
                            onChange={onChange}
                            required
                        />
                    </div>

                    <hr className="auth-divider" />

                    <button type="submit" className="modern-btn-primary">
                        Sign up
                    </button>

                    <button
                        type="button"
                        className="modern-btn-google"
                        onClick={() => alert("Google authentication requires backend OAuth integration.")}
                    >
                        <Chrome className="w-5 h-5 text-white" />
                        Continue with Google
                    </button>
                </form>

                <div className="auth-footer-text">
                    <span>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </span>
                </div>
            </div>

            {/* User count & avatars badge */}
            <div className="auth-social-proof">
                <p className="social-proof-text">
                    Join <span className="font-medium text-white">thousands</span> of movie lovers on Filmyway.
                </p>
                <div className="avatar-group">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                        alt="User avatar 1"
                        className="social-avatar"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                        alt="User avatar 2"
                        className="social-avatar"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                        alt="User avatar 3"
                        className="social-avatar"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                        alt="User avatar 4"
                        className="social-avatar"
                    />
                </div>
            </div>
        </div>
    );
};

export default Signup;

