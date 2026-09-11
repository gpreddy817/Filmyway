import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../features/authSlice';
import { Popcorn } from 'lucide-react';
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
        // Skeleton screen while login is processing
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
                <div className="auth-card glass-panel animate-fade">
                    <div className="auth-header">
                        <Popcorn size={48} color="var(--accent-color)" />
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue to Filmyway</p>
                    </div>
                    <form onSubmit={onSubmit} className="auth-form">
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
                        <button type="submit" className="btn-primary auth-btn">
                            Sign In
                        </button>
                    </form>
                    <p className="auth-footer">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;
