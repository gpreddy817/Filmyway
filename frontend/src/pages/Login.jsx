import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../features/authSlice';
import { Popcorn, Chrome } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (isError && message) {
            setToastMessage(message);
            const timer = setTimeout(() => {
                setToastMessage('');
                dispatch(reset());
            }, 2000);
            return () => clearTimeout(timer);
        }
        if (isSuccess || user) {
            navigate('/');
            dispatch(reset());
        }
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { email, password };
        dispatch(login(userData));
    };

    if (isLoading) {
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
                        <div className="skeleton skeleton-button" />
                    </div>
                    <div className="skeleton skeleton-auth-footer" />
                </div>
            </div>
        );
    }

    return (
        <>
            {toastMessage && (
                <div className="toast toast-error">
                    {toastMessage}
                </div>
            )}
            <div className="auth-container">
                {/* Centered glass card matching modern-stunning-sign-in style */}
                <div className="auth-card glass-card-modern animate-fade">
                    {/* Logo & Header */}
                    <div className="auth-logo-badge">
                        <Popcorn className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="auth-title font-pacifico">Filmyway</h2>
                    <p className="auth-subtitle">Sign in to continue watching your favorites</p>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="auth-form">
                        <div className="form-group">
                            <input
                                type="email"
                                className="modern-input"
                                id="email"
                                name="email"
                                value={email}
                                placeholder="Email"
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

                        <hr className="auth-divider" />

                        <button type="submit" className="modern-btn-primary">
                            Sign in
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
                            Don't have an account?{' '}
                            <Link to="/signup" className="auth-link">
                                Sign up, it's free!
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
        </>
    );
};

export default Login;

