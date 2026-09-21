import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Info } from 'lucide-react';
import './HeroCarousel.css';

const getHiRes = (url) => {
    if (!url || url === 'N/A') return null;
    return url
        .replace(/_SX\d+/, '')
        .replace(/_SY\d+/, '')
        .replace(/_CR\d+,\d+,\d+,\d+_/, '')
        .replace(/_UX\d+_/, '')
        .replace(/\._V1_.*\.jpg/i, '._V1_.jpg');
};

const HeroCarousel = ({ movies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const carouselMovies = movies?.filter(m => m.posterUrl || m.Poster)?.slice(0, 6) || [];

    useEffect(() => {
        if (carouselMovies.length === 0) return;
        const interval = setInterval(() => {
            if (!isHovered) {
                setCurrentIndex(prev => (prev + 1) % carouselMovies.length);
            }
        }, 6000);
        return () => clearInterval(interval);
    }, [carouselMovies.length, isHovered]);

    if (carouselMovies.length === 0) {
        return (
            <div className="hero-carousel skeleton-carousel">
                <div className="skeleton-carousel-bg" />
                <div className="skeleton-carousel-content">
                    <div className="skeleton skeleton-carousel-title" />
                    <div className="skeleton skeleton-carousel-subtitle" />
                    <div className="skeleton skeleton-carousel-btn" />
                </div>
            </div>
        );
    }

    const movie = carouselMovies[currentIndex];
    const rawImg = movie.backdropUrl || movie.posterUrl || movie.Poster;
    const bgImage = getHiRes(rawImg) || rawImg;
    const title = movie.title || movie.name || movie.Title || 'Untitled Movie';
    const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : (movie.Year || '');
    const id = movie.id || movie.tmdbId || movie.imdbID || movie._id;
    const rating = movie.vote_average
        ? (typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : movie.vote_average)
        : movie.imdbRating || null;
    const overview = movie.overview || movie.Plot || 'Stream latest blockbuster movies and web series exclusively on Filmyway.';

    return (
        <div
            className="hero-carousel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ── Background Backdrop Image ──────────────── */}
            <img
                key={currentIndex}
                src={bgImage}
                alt={title}
                className="carousel-bg-img"
            />
            <div className="carousel-bg-overlay" />

            {/* ── Hero Info ──────────────────────────────── */}
            <div className="carousel-content" key={`info-${currentIndex}`}>
                <div className="carousel-badge-row">
                    <span className="badge-tag brand-badge">FILMYWAY ORIGINALS</span>
                    {year && <span className="carousel-year">{year}</span>}
                    {rating && <span className="carousel-rating">★ {rating}</span>}
                    <span className="badge-tag hd-badge">4K ULTRA HD</span>
                </div>

                <h1 className="carousel-movie-title">{title}</h1>
                <p className="carousel-overview">{overview}</p>

                <div className="carousel-actions">
                    <Link to={`/movie/${id}`} className="btn-primary hotstar-play-btn">
                        <Play size={20} fill="white" />
                        Watch Free
                    </Link>
                    <Link to={`/movie/${id}`} className="btn-glass hotstar-more-btn">
                        <Info size={18} />
                        Details
                    </Link>
                </div>
            </div>

            {/* ── Side Thumbnail Strip ─────────────────────── */}
            <div className="carousel-thumbs">
                {carouselMovies.map((m, i) => (
                    <button
                        key={i}
                        className={`carousel-thumb ${i === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(i)}
                        style={{ backgroundImage: `url(${m.posterUrl || m.Poster})` }}
                        aria-label={m.title || m.Title}
                    />
                ))}
            </div>

            {/* ── Carousel Indicators ───────────────────────── */}
            <div className="carousel-dots">
                {carouselMovies.map((_, i) => (
                    <button
                        key={i}
                        className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(i)}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
