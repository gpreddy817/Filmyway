import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { login } from '../features/authSlice';
import { Popcorn } from 'lucide-react';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const { username, email, password, confirmPassword } = formData;
    const [localError, setLocalError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
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
                // Redirect to login page instead of auto-login
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
            <div className="auth-card glass-panel animate-fade">
                <div className="auth-header">
                    <Popcorn size={48} color="var(--accent-color)" />
                    <h2>Join Filmyway</h2>
                    <p>Create your account and discover movies</p>
                </div>
                <form onSubmit={onSubmit} className="auth-form">
                    {localError && <div className="error-message">{localError}</div>}
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
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
                            className="form-control"
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
                            className="form-control"
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
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            placeholder="Confirm Password"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-btn">
                        Sign Up
                    </button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
