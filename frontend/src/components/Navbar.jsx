import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { requestLogout, reset } from '../features/authSlice';
import { searchMovies, clearSearch } from '../features/movieSlice';
import { Search, Home as HomeIcon, Flame, Film, Tv, Filter, Heart, Shield, LogOut, User as UserIcon } from 'lucide-react';
import { GENRES } from '../utils/genres';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    const searchWrapperRef = useRef(null);

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
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        }, 400);

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
        dispatch(clearSearch());
    };

    return (
        <>
            {/* ─── JioHotstar Left Sidebar Navigation Rail ───────────────── */}
            <aside
                className={`hotstar-rail ${isNavExpanded ? 'expanded' : ''}`}
                onMouseEnter={() => setIsNavExpanded(true)}
                onMouseLeave={() => setIsNavExpanded(false)}
            >
                <div className="rail-brand">
                    <Link to="/" className="rail-logo">
                        <span className="logo-spark font-pacifico">F</span>
                        <span className="rail-label brand-title">Filmyway</span>
                    </Link>
                </div>

                <div className="rail-menu">
                    <Link
                        to="/?category=home"
                        className={`rail-item ${category === 'home' && !currentGenreId ? 'active' : ''}`}
                    >
                        <HomeIcon size={22} className="rail-icon" />
                        <span className="rail-label">Home</span>
                    </Link>

                    <Link
                        to="/?category=trending"
                        className={`rail-item ${category === 'trending' && !currentGenreId ? 'active' : ''}`}
                    >
                        <Flame size={22} className="rail-icon" />
                        <span className="rail-label">Trending</span>
                    </Link>

                    <Link
                        to="/?category=movies"
                        className={`rail-item ${category === 'movies' && !currentGenreId ? 'active' : ''}`}
                    >
                        <Film size={22} className="rail-icon" />
                        <span className="rail-label">Movies</span>
                    </Link>

                    <Link
                        to="/?category=tvshows"
                        className={`rail-item ${category === 'tvshows' && !currentGenreId ? 'active' : ''}`}
                    >
                        <Tv size={22} className="rail-icon" />
                        <span className="rail-label">TV Shows</span>
                    </Link>

                    {user && (
                        <Link
                            to="/favorites"
                            className={`rail-item ${location.pathname === '/favorites' ? 'active' : ''}`}
                        >
                            <Heart size={22} className="rail-icon" />
                            <span className="rail-label">Watchlist</span>
                        </Link>
                    )}

                    {user?.role === 'admin' && (
                        <Link
                            to="/admin"
                            className={`rail-item ${location.pathname === '/admin' ? 'active' : ''}`}
                        >
                            <Shield size={22} className="rail-icon" />
                            <span className="rail-label">Admin</span>
                        </Link>
                    )}
                </div>

                <div className="rail-footer">
                    {user ? (
                        <button onClick={handleLogout} className="rail-item logout-item" title="Logout">
                            <LogOut size={22} className="rail-icon text-red" />
                            <span className="rail-label text-red">Logout</span>
                        </button>
                    ) : (
                        <Link to="/login" className="rail-item">
                            <UserIcon size={22} className="rail-icon" />
                            <span className="rail-label">Sign In</span>
                        </Link>
                    )}
                </div>
            </aside>

            {/* ─── Top Header Bar ────────────────────────────────────────── */}
            <header className={`hotstar-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-left">
                    <Link to="/" className="mobile-brand font-pacifico">Filmyway</Link>
                </div>

                <div className="header-center" ref={searchWrapperRef}>
                    <form onSubmit={handleSearch} className="hotstar-search-form">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Movies, Shows and more..."
                            className="hotstar-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowSuggestions(true);
                            }}
                        />
                    </form>

                    <div className="genre-pill-hotstar">
                        <Filter size={14} className="genre-icon" />
                        <select
                            className="genre-select-hotstar"
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

                    {showSuggestions && searchResults.length > 0 && (
                        <div className="hotstar-suggestions">
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

                <div className="header-right">
                    {user && (
                        <div className="hotstar-user-pill">
                            <span className="user-name">Hi, {user.username}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* ─── Mobile Bottom Navigation Bar ──────────────────────────── */}
            <nav className="hotstar-mobile-nav">
                <Link to="/?category=home" className={`mobile-nav-link ${category === 'home' && !currentGenreId ? 'active' : ''}`}>
                    <HomeIcon size={20} />
                    <span>Home</span>
                </Link>
                <Link to="/?category=trending" className={`mobile-nav-link ${category === 'trending' && !currentGenreId ? 'active' : ''}`}>
                    <Flame size={20} />
                    <span>Trending</span>
                </Link>
                <Link to="/?category=movies" className={`mobile-nav-link ${category === 'movies' && !currentGenreId ? 'active' : ''}`}>
                    <Film size={20} />
                    <span>Movies</span>
                </Link>

                {user ? (
                    <Link to="/favorites" className={`mobile-nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}>
                        <Heart size={20} />
                        <span>Watchlist</span>
                    </Link>
                ) : (
                    <Link to="/login" className={`mobile-nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                        <UserIcon size={20} />
                        <span>My Space</span>
                    </Link>
                )}
            </nav>
        </>
    );
};

export default Navbar;
