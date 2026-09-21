import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { requestLogout, reset } from '../features/authSlice';
import { searchMovies, clearSearch } from '../features/movieSlice';
import { Search, Filter, LogOut, Menu, X } from 'lucide-react';
import { GENRES } from '../utils/genres';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const searchWrapperRef = useRef(null);
    const navRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const { searchResults } = useSelector((state) => state.movies);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const category = location.pathname === '/' ? (searchParams.get('category') || 'home') : null;
    const currentGenreId = searchParams.get('genreId') || '';

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

    // Close menu on location change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsMenuOpen(false);
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
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
            setIsMenuOpen(false);
        }
    };

    const handleGenreChange = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) {
            navigate('/?category=home');
        } else {
            const found = GENRES.find(g => g.id === selectedId);
            const genreName = found ? found.name : '';
            navigate(`/?genre=${encodeURIComponent(genreName)}&genreId=${selectedId}`);
        }
    };

    const handleSelectSuggestion = (movie) => {
        const id = movie.id || movie.tmdbId || movie._id;
        if (!id) return;
        navigate(`/movie/${id}`);
        setShowSuggestions(false);
        setSearchQuery('');
        setIsMenuOpen(false);
        dispatch(clearSearch());
    };

    return (
        <nav className={`glass-nav ${isScrolled ? 'scrolled' : ''}`} ref={navRef}>
            <div className="nav-brand">
                <Link to="/" className="brand-link">
                    <span className="brand-text text-gradient">Filmyway</span>
                </Link>
            </div>

            <div className="nav-center" ref={searchWrapperRef}>
                <div className="nav-categories desktop-only">
                    <Link to="/?category=home" className={`nav-item ${category === 'home' && !currentGenreId ? 'active' : ''}`}>Home</Link>
                    <Link to="/?category=trending" className={`nav-item ${category === 'trending' && !currentGenreId ? 'active' : ''}`}>Trending</Link>
                    <Link to="/?category=movies" className={`nav-item ${category === 'movies' && !currentGenreId ? 'active' : ''}`}>Movies</Link>
                    <Link to="/?category=tvshows" className={`nav-item ${category === 'tvshows' && !currentGenreId ? 'active' : ''}`}>TV Shows</Link>
                    
                    <div className="genre-filter-pill">
                        <Filter size={14} className="genre-icon" />
                        <select
                            className="genre-select"
                            value={currentGenreId}
                            onChange={handleGenreChange}
                            aria-label="Filter by genre"
                        >
                            {GENRES.map((g) => (
                                <option key={g.id || 'all'} value={g.id} className="genre-option">
                                    {g.name}
                                </option>
                            ))}
                        </select>
                    </div>
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
                        <Link to="/favorites" className="nav-item desktop-only">Favorites</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-item desktop-only">Admin</Link>
                        )}
                        <div className="user-menu desktop-only">
                            <span className="welcome-text">Hi, {user.username}</span>
                            <button onClick={handleLogout} className="btn-icon" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="auth-links desktop-only">
                        <Link to="/login" className="btn-glass">Sign In</Link>
                        <Link to="/signup" className="btn-primary">Sign Up</Link>
                    </div>
                )}

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Collapsible Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu-dropdown animate-fade">
                    <div className="mobile-nav-categories">
                        <Link
                            to="/?category=home"
                            className={`mobile-nav-item ${category === 'home' && !currentGenreId ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/?category=trending"
                            className={`mobile-nav-item ${category === 'trending' && !currentGenreId ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trending
                        </Link>
                        <Link
                            to="/?category=movies"
                            className={`mobile-nav-item ${category === 'movies' && !currentGenreId ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Movies
                        </Link>
                        <Link
                            to="/?category=tvshows"
                            className={`mobile-nav-item ${category === 'tvshows' && !currentGenreId ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            TV Shows
                        </Link>

                        <div className="genre-filter-pill mobile-genre-pill">
                            <Filter size={14} className="genre-icon" />
                            <select
                                className="genre-select"
                                value={currentGenreId}
                                onChange={(e) => {
                                    handleGenreChange(e);
                                    setIsMenuOpen(false);
                                }}
                                aria-label="Filter by genre"
                            >
                                {GENRES.map((g) => (
                                    <option key={g.id || 'all'} value={g.id} className="genre-option">
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {user ? (
                            <div className="mobile-user-section">
                                <Link to="/favorites" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                                    Favorites
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                                        Admin Dashboard
                                    </Link>
                                )}
                                <div className="mobile-user-info">
                                    <span>Hi, {user.username}</span>
                                    <button onClick={handleLogout} className="btn-icon" title="Logout">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mobile-auth-links">
                                <Link to="/login" className="btn-glass mobile-auth-btn" onClick={() => setIsMenuOpen(false)}>
                                    Sign In
                                </Link>
                                <Link to="/signup" className="btn-primary mobile-auth-btn" onClick={() => setIsMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
