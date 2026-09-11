import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { requestLogout, reset } from '../features/authSlice';
import { searchMovies, clearSearch } from '../features/movieSlice';
import { Search, Popcorn, User as UserIcon, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchWrapperRef = useRef(null);
    const { user } = useSelector((state) => state.auth);
    const { searchResults, status: movieStatus } = useSelector((state) => state.movies);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active category for highlighting
    const searchParams = new URLSearchParams(location.search);
    const category = location.pathname === '/' ? (searchParams.get('category') || 'home') : null;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close suggestions on outside click or scroll
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        const handleScrollClose = () => {
            setShowSuggestions(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScrollClose);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScrollClose);
        };
    }, []);

    // Debounced live search suggestions
    useEffect(() => {
        if (!searchQuery.trim()) {
            dispatch(clearSearch());
            setShowSuggestions(false);
            return;
        }

        const handler = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                dispatch(searchMovies({ query: searchQuery.trim(), page: 1 }));
                setShowSuggestions(true);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery, dispatch]);

    const handleLogout = () => {
        dispatch(requestLogout());
        dispatch(reset());
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${searchQuery}`);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (movie) => {
        const id = movie.id || movie.tmdbId || movie._id;
        if (!id) return;
        navigate(`/movie/${id}`);
        setShowSuggestions(false);
        setSearchQuery('');
        dispatch(clearSearch());
    };

    return (
        <nav className={`glass-nav ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-brand">
                <Link to="/" className="brand-link">
                    
                    <span className="brand-text text-gradient">Filmyway</span>
                </Link>
            </div>

            <div className="nav-center" ref={searchWrapperRef}>
                <div className="nav-categories">
                    <Link to="/?category=home" className={`nav-item ${category === 'home' ? 'active' : ''}`}>Home</Link>
                    <Link to="/?category=trending" className={`nav-item ${category === 'trending' ? 'active' : ''}`}>Trending</Link>
                    <Link to="/?category=movies" className={`nav-item ${category === 'movies' ? 'active' : ''}`}>Movies</Link>
                    <Link to="/?category=tvshows" className={`nav-item ${category === 'tvshows' ? 'active' : ''}`}>TV Shows</Link>
                </div>
                <form onSubmit={handleSearch} className="search-form">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search movies, tv shows..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                            if (searchResults.length > 0) setShowSuggestions(true);
                        }}
                    />
                </form>
                {showSuggestions && searchResults.length > 0 && (
                    <div className="search-suggestions">
                        {searchResults.slice(0, 8).map((movie) => (
                            <button
                                key={movie.id || movie.tmdbId || movie._id}
                                type="button"
                                className="suggestion-item"
                                onClick={() => handleSelectSuggestion(movie)}
                            >
                                <span className="suggestion-title">
                                    {movie.title || movie.name}
                                </span>
                                {movie.release_date || movie.first_air_date ? (
                                    <span className="suggestion-year">
                                        {new Date(movie.release_date || movie.first_air_date).getFullYear()}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="nav-links">
                {user ? (
                    <>
                        <Link to="/favorites" className="nav-item">Favorites</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-item">Admin</Link>
                        )}
                        <div className="user-menu">
                            <span className="welcome-text">Hi, {user.username}</span>
                            <button onClick={handleLogout} className="btn-icon" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="auth-links">
                        <Link to="/login" className="btn-glass">Sign In</Link>
                        <Link to="/signup" className="btn-primary">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
