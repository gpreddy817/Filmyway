import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { omdbApi, OMDB_API_KEY } from '../api/omdb';
import axios from 'axios';
import { Heart, Play, X } from 'lucide-react';
import './MovieDetails.css';

/* ─── helpers ─────────────────────────────────────────────────────── */

/** Extract a YouTube video-ID from any YouTube/youtu.be URL */
const extractYouTubeId = (url) => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtu.be')) {
            return parsed.pathname.split('/').filter(Boolean).pop();
        }
        const v = parsed.searchParams.get('v');
        if (v) return v;
        const segments = parsed.pathname.split('/').filter(Boolean);
        return segments.pop() || null;
    } catch {
        return null;
    }
};

/**
 * Build a YouTube search-embed src that shows the best matching trailer
 * using YouTube's native listType=search parameter — NO API key required.
 */
const buildYouTubeSearchSrc = (title, year) => {
    const query = encodeURIComponent(`${title} ${year || ''} official trailer`);
    return `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1&rel=0&modestbranding=1`;
};

/* ─── component ────────────────────────────────────────────────────── */

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [authError, setAuthError] = useState('');
    const [showTrailer, setShowTrailer] = useState(false);
    /** trailerSrc: the full iframe src string, or '' for no-trailer fallback */
    const [trailerSrc, setTrailerSrc] = useState(null);

    const { user } = useSelector((state) => state.auth);
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    /* ── fetch movie data ──────────────────────────────────────────── */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const isCustomMovieId = /^[0-9a-fA-F]{24}$/.test(id);

                let loadedMovie;

                if (isCustomMovieId) {
                    const res = await axios.get(`${API_URL}/movies/${id}`);
                    loadedMovie = { ...res.data, isCustom: true };
                } else {
                    const detailRes = await omdbApi.get('', {
                        params: { apikey: OMDB_API_KEY, i: id, plot: 'full' },
                    });
                    loadedMovie = { ...detailRes.data, isCustom: false };
                }

                setMovie(loadedMovie);

                // Add to history
                if (user && loadedMovie) {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const historyId = loadedMovie.isCustom ? loadedMovie._id : loadedMovie.imdbID;
                    const historyData = {
                        tmdbId: historyId,
                        title: loadedMovie.isCustom ? loadedMovie.title : loadedMovie.Title,
                        posterUrl: loadedMovie.isCustom
                            ? loadedMovie.posterUrl
                            : (loadedMovie.Poster && loadedMovie.Poster !== 'N/A' ? loadedMovie.Poster : ''),
                        mediaType: loadedMovie.isCustom ? loadedMovie.category : loadedMovie.Type,
                    };
                    axios.post(`${API_URL}/users/history`, historyData, config).catch(console.error);

                    const favRes = await axios.get(`${API_URL}/users/favorites`, config);
                    const isFav = favRes.data.some(f => f.tmdbId === historyId);
                    setIsFavorite(isFav);
                }
            } catch (error) {
                console.error('Failed to load movie details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user, API_URL]);

    /* ── reset on id change ────────────────────────────────────────── */
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setMovie(null);
        setTrailerSrc(null);
        setShowTrailer(false);
    }, [id]);

    /* ── trailer click ─────────────────────────────────────────────── */
    const handlePlayTrailer = () => {
        if (!movie) return;

        // Build src only once
        if (trailerSrc === null) {
            if (movie.isCustom && movie.trailerUrl) {
                // Admin-uploaded movie — use saved YouTube link
                const videoId = extractYouTubeId(movie.trailerUrl);
                setTrailerSrc(
                    videoId
                        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
                        : buildYouTubeSearchSrc(movie.title, movie.releaseDate?.substring(0, 4))
                );
            } else {
                // OMDb movie — search YouTube by title + year (no API key needed)
                const title = movie.Title || '';
                const year  = movie.Year  || '';
                setTrailerSrc(buildYouTubeSearchSrc(title, year));
            }
        }

        setShowTrailer(true);
    };

    const closeTrailer = () => setShowTrailer(false);

    /* ── toggle favorite ───────────────────────────────────────────── */
    const toggleFavorite = async () => {
        if (!user || !movie) {
            setAuthError('Please login to add favorites.');
            setTimeout(() => setAuthError(''), 2500);
            return;
        }
        setAuthError('');
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const isCustom = movie.isCustom;
        const favId    = isCustom ? movie._id : movie.imdbID;

        try {
            if (isFavorite) {
                await axios.delete(`${API_URL}/users/favorites/${favId}`, config);
                setIsFavorite(false);
            } else {
                const favData = {
                    tmdbId: favId,
                    title: isCustom ? movie.title : movie.Title,
                    posterUrl: isCustom
                        ? movie.posterUrl
                        : (movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : ''),
                    mediaType: isCustom ? movie.category : movie.Type,
                };
                await axios.post(`${API_URL}/users/favorites`, favData, config);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Favorite toggle failed', error);
        }
    };

    /* ── skeleton ──────────────────────────────────────────────────── */
    if (loading) {
        const skeletonMeta = Array.from({ length: 3 });
        return (
            <div className="movie-details-container animate-fade">
                <div className="backdrop-banner skeleton-backdrop">
                    <div className="backdrop-overlay" />
                </div>
                <div className="details-content container">
                    <div className="poster-col">
                        <div className="detail-poster skeleton skeleton-detail-poster" />
                    </div>
                    <div className="info-col">
                        <div className="skeleton skeleton-detail-title" />
                        <div className="meta-info">
                            {skeletonMeta.map((_, i) => (
                                <div key={i} className="skeleton skeleton-meta-pill" />
                            ))}
                        </div>
                        <div className="overview-section">
                            <div className="skeleton skeleton-overview-line" />
                            <div className="skeleton skeleton-overview-line" />
                            <div className="skeleton skeleton-overview-line short" />
                        </div>
                        <div className="action-buttons">
                            <div className="skeleton skeleton-action-btn" />
                            <div className="skeleton skeleton-action-btn" />
                        </div>
                    </div>
                </div>
                <div className="trailer-section container">
                    <div className="skeleton skeleton-trailer" />
                </div>
            </div>
        );
    }

    if (!movie || (!movie.isCustom && movie.Response === 'False')) {
        return <div className="error-message">Movie not found</div>;
    }

    const posterSrc = movie.isCustom
        ? (movie.posterUrl || '/no-poster.png')
        : (movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/no-poster.png');

    const title = movie.isCustom ? movie.title : movie.Title;
    const year  = movie.isCustom
        ? (movie.releaseDate ? movie.releaseDate.substring(0, 4) : '')
        : movie.Year;

    /* ── render ────────────────────────────────────────────────────── */
    return (
        <>
            {authError && <div className="toast toast-error">{authError}</div>}

            <div className="movie-details-container animate-fade">

                {/* ── Backdrop ──────────────────────────────────── */}
                <div
                    className="backdrop-banner"
                    style={{ backgroundImage: `url(${posterSrc})` }}
                >
                    <div className="backdrop-overlay" />
                </div>

                {/* ── Details card ──────────────────────────────── */}
                <div className="details-content container">
                    <div className="poster-col">
                        <img
                            src={posterSrc}
                            alt={title}
                            className="detail-poster"
                        />
                    </div>

                    <div className="info-col">
                        <h1 className="detail-title">{title}</h1>

                        <div className="meta-info">
                            {movie.Rated && movie.Rated !== 'N/A' && (
                                <span className="content-rating">{movie.Rated}</span>
                            )}
                            <span className="rating-badge">
                                ★ {movie.isCustom ? 'NR' : (movie.imdbRating || 'NR')}
                            </span>
                            <span className="date">{year}</span>
                            {!movie.isCustom && movie.Runtime && movie.Runtime !== 'N/A' && (
                                <span className="runtime">{movie.Runtime}</span>
                            )}
                        </div>

                        <div className="genres">
                            {(movie.isCustom ? movie.genre : movie.Genre)
                                ?.split(',')
                                .map(g => (
                                    <span key={g.trim()} className="genre-badge">{g.trim()}</span>
                                ))}
                        </div>

                        <div className="overview-section">
                            <h3>Overview</h3>
                            <p className="overview-text">
                                {movie.isCustom
                                    ? (movie.description || 'Description not available')
                                    : (movie.Plot || 'Description not available')}
                            </p>
                        </div>

                        {!movie.isCustom && movie.Director && movie.Director !== 'N/A' && (
                            <div className="overview-section">
                                <h3>Director</h3>
                                <p className="overview-text">{movie.Director}</p>
                            </div>
                        )}

                        {!movie.isCustom && movie.Actors && movie.Actors !== 'N/A' && (
                            <div className="overview-section">
                                <h3>Cast</h3>
                                <p className="overview-text">{movie.Actors}</p>
                            </div>
                        )}

                        <div className="action-buttons">
                            <button className="btn-primary" onClick={handlePlayTrailer}>
                                <Play size={20} /> Watch Trailer
                            </button>
                            <button
                                className={`btn-glass fav-btn ${isFavorite ? 'active' : ''}`}
                                onClick={toggleFavorite}
                            >
                                <Heart
                                    size={20}
                                    fill={isFavorite ? '#ef4444' : 'none'}
                                    color={isFavorite ? '#ef4444' : 'white'}
                                />
                                {isFavorite ? 'Saved' : 'Add to Favorites'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Trailer Modal ─────────────────────────────── */}
                {showTrailer && (
                    <div className="trailer-modal" onClick={closeTrailer}>
                        <div className="trailer-modal-content" onClick={e => e.stopPropagation()}>
                            <button className="trailer-close-btn" onClick={closeTrailer}>
                                <X size={24} />
                            </button>

                            <div className="trailer-modal-header">
                                <span className="trailer-modal-title">{title} — Trailer</span>
                            </div>

                            <div className="video-responsive">
                                <iframe
                                    src={trailerSrc}
                                    title={`${title} trailer`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>

                            <div className="trailer-powered-by">
                                Powered by&nbsp;
                                <svg viewBox="0 0 90 20" height="14" aria-label="YouTube" className="yt-logo-inline">
                                    <path fill="#ff0000" d="M27.9 3.9S27.6 2 26.8 1.2c-.8-.8-1.7-.8-2.1-.9C20.9 0 15 0 15 0S9.1 0 5.3.3C4.9.4 4 .4 3.2 1.2 2.4 2 2.1 3.9 2.1 3.9S1.8 6.1 1.8 8.4v2.1c0 2.3.3 4.5.3 4.5s.3 1.9 1.1 2.7c1 1 2.3.9 2.9 1 2.1.2 8.9.3 8.9.3s5.9 0 9.7-.3c.4-.1 1.3-.1 2.1-.9s1.1-2.7 1.1-2.7.3-2.2.3-4.5V8.4c0-2.3-.3-4.5-.3-4.5zM12 13.4V5.8l7 3.8-7 3.8z" />
                                    <path fill="#fff" d="M12 5.8v7.6l7-3.8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default MovieDetails;
