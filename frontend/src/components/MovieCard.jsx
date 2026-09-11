import React from 'react';
import { Link } from 'react-router-dom';
import { Star, PlayCircle } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
    const imageUrl = movie.posterUrl || (movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/no-poster.png');

    const title = movie.title || movie.name || movie.Title;
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : (movie.imdbRating || null);
    const id = movie.id || movie.imdbID || movie._id;
    const year = (movie.release_date || movie.first_air_date)
        ? new Date(movie.release_date || movie.first_air_date).getFullYear()
        : null;

    return (
        <Link to={`/movie/${id}`} className="movie-card">
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={title} className="card-image" loading="lazy" />
                <div className="card-overlay">
                    <PlayCircle size={48} className="play-icon" />
                </div>
                {rating && (
                    <div className="card-rating">
                        <Star size={13} className="star-icon" />
                        <span>{rating}</span>
                    </div>
                )}
            </div>
            <div className="card-content">
                <h3 className="card-title" title={title}>{title}</h3>
                <div className="card-meta">
                    {year && <span className="card-year">{year}</span>}
                    {rating && (
                        <span className="card-rating-text">
                            <Star size={12} className="star-icon" /> {rating}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
