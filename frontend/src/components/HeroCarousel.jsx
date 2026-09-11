import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import './HeroCarousel.css';

// Strips Amazon CDN size constraints to get full-resolution poster
// e.g. https://m.media-amazon.com/...._V1_SX300.jpg → ..._V1_.jpg
const getHiRes = (url) => {
    if (!url || url === 'N/A') return null;
    return url
        .replace(/_SX\d+/, '')     // remove width constraint
        .replace(/_SY\d+/, '')     // remove height constraint
        .replace(/_CR\d+,\d+,\d+,\d+_/, '') // remove crop
        .replace(/_UX\d+_/, '')    // remove other size tokens
        .replace(/\._V1_.*\.jpg/i, '._V1_.jpg'); // normalise suffix
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


    // ── Skeleton while movies are loading ─────────────────────
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
    const rawImg = movie.posterUrl || movie.Poster;
    const bgImage = getHiRes(rawImg) || rawImg;  // full-res background
    const thumbImg = rawImg;                         // smaller is fine for thumbs
    const title = movie.title || movie.name || movie.Title || 'Unknown';
    const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : (movie.Year || '');
    const id = movie.id || movie.imdbID || movie._id;
    const rating = movie.vote_average
        ? movie.vote_average.toFixed(1)
        : movie.imdbRating || null;

    return (
        <div
            className="hero-carousel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ── Full-bleed background image ──────────────── */}
            <img
                key={currentIndex}
                src={bgImage}
                alt={title}
                className="carousel-bg-img"
            />
            <div className="carousel-bg-overlay" />

            {/* ── Left: movie info ──────────────────────────── */}
            <div className="carousel-content" key={`info-${currentIndex}`}>
                <div className="carousel-badge-row">
                    {year && <span className="carousel-year">{year}</span>}
                    {rating && <span className="carousel-rating">★ {rating}</span>}
                </div>

                <h1 className="carousel-movie-title">{title}</h1>

                <Link to={`/movie/${id}`} className="carousel-know-more">
                    <Info size={18} />
                    Know More
                </Link>
            </div>

            {/* ── Thumbnail strip (right side) ─────────────── */}
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

            {/* ── Arrow controls ────────────────────────────── */}

            {/* ── Dot indicators ───────────────────────────── */}
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
