import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchLatest, fetchTrending, fetchPopular, fetchTvShows, searchMovies, fetchByGenre, clearSearch, clearGenre } from '../features/movieSlice';
import MovieCard from '../components/MovieCard';
import VirtualizedMovieGrid from '../components/VirtualizedMovieGrid';
import HeroCarousel from '../components/HeroCarousel';
import axios from 'axios';
import './Home.css';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Home = () => {
    const dispatch = useDispatch();
    const queryLocation = useQuery();
    const query = queryLocation.get('search');
    const category = queryLocation.get('category') || 'home';
    const genre = queryLocation.get('genre');
    const genreId = queryLocation.get('genreId');

    const { latest, trending, popular, tvShows, searchResults, genreResults, status } = useSelector((state) => state.movies);
    const [page, setPage] = useState(1);
    const [showNoResults, setShowNoResults] = useState(false);
    const [customMovies, setCustomMovies] = useState([]);
    const observer = useRef();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (query) {
            dispatch(searchMovies({ query, page: 1 }));
            setPage(1);
        } else if (genreId) {
            dispatch(fetchByGenre({ genreId, page: 1 }));
            setPage(1);
        } else {
            dispatch(clearSearch());
            dispatch(clearGenre());
            // Fetch initial sections concurrently for faster first load
            if (category === 'home') {
                if (latest.length === 0) dispatch(fetchLatest());
                if (trending.length === 0) dispatch(fetchTrending());
                if (popular.length === 0) dispatch(fetchPopular(1));
            } else if (category === 'movies') {
                if (latest.length === 0) dispatch(fetchLatest());
                if (popular.length === 0) dispatch(fetchPopular(1));
            } else if (category === 'trending') {
                if (trending.length === 0) dispatch(fetchTrending());
            } else if (category === 'tvshows') {
                if (tvShows.length === 0) dispatch(fetchTvShows(1));
            }
        }
    }, [query, genreId, category, dispatch]);

    // Load custom admin movies concurrently for home page
    useEffect(() => {
        let isMounted = true;
        const loadCustomMovies = async () => {
            try {
                const res = await axios.get(`${API_URL}/movies`);
                if (isMounted) {
                    const sorted = (res.data || []).sort((a, b) => {
                        const yearA = a.releaseDate ? new Date(a.releaseDate).getFullYear() : 0;
                        const yearB = b.releaseDate ? new Date(b.releaseDate).getFullYear() : 0;
                        return yearB - yearA;
                    });
                    setCustomMovies(sorted);
                }
            } catch (error) {
                console.error('Failed to load custom movies', error);
            }
        };

        if (!query && !genreId && category === 'home' && customMovies.length === 0) {
            loadCustomMovies();
        }

        return () => {
            isMounted = false;
        };
    }, [API_URL, query, genreId, category, customMovies.length]);

    // Delay "no results" message so skeleton shows briefly
    useEffect(() => {
        if (!query && !genreId) {
            setShowNoResults(false);
            return;
        }

        const itemsLength = query ? searchResults.length : genreResults.length;

        if (status === 'succeeded' && itemsLength === 0) {
            const timer = setTimeout(() => setShowNoResults(true), 2000);
            return () => clearTimeout(timer);
        }

        setShowNoResults(false);
    }, [query, genreId, status, searchResults.length, genreResults.length]);

    useEffect(() => {
        if (page > 1 && !query && !genreId) {
            dispatch(fetchPopular(page));
        } else if (page > 1 && query) {
            dispatch(searchMovies({ query, page }));
        } else if (page > 1 && genreId) {
            dispatch(fetchByGenre({ genreId, page }));
        }
    }, [page, query, genreId, category, dispatch]);

    const lastElementRef = useCallback(node => {
        if (status === 'loading') return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [status]);

    if (!query && !genreId && status === 'loading' && page === 1) {
        // Skeleton screen for initial home load
        const skeletonItems = Array.from({ length: 6 });

        return (
            <div className="home-container">
                <HeroCarousel movies={[]} />

                <section className="movie-section">
                    <div className="skeleton skeleton-section-title" />
                    <div className="movie-scroll">
                        {skeletonItems.map((_, index) => (
                            <div className="scroll-item" key={index}>
                                <div className="skeleton-card">
                                    <div className="skeleton skeleton-poster" />
                                    <div className="skeleton skeleton-text" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="movie-section">
                    <div className="skeleton skeleton-section-title" />
                    <div className="movie-scroll">
                        {skeletonItems.map((_, index) => (
                            <div className="scroll-item" key={index}>
                                <div className="skeleton-card">
                                    <div className="skeleton skeleton-poster" />
                                    <div className="skeleton skeleton-text" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className={`home-container animate-fade ${(query || genreId) ? 'has-top-padding' : ''}`}>
            {query ? (
                <section className="movie-section">
                    <h2 className="section-title">Search Results for "{query}"</h2>

                    {(status === 'loading' || (!showNoResults && searchResults.length === 0)) ? (
                        <div className="movie-grid">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="skeleton-card">
                                    <div className="skeleton skeleton-poster" />
                                    <div className="skeleton skeleton-text" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <VirtualizedMovieGrid
                                items={searchResults}
                                estimatedItemHeight={320}
                                renderCard={(movie, index) => {
                                    const isLast = index === searchResults.length - 1;
                                    const card = <MovieCard movie={movie} />;
                                    return isLast ? (
                                        <div ref={lastElementRef} key={movie.id || movie.imdbID || index}>
                                            {card}
                                        </div>
                                    ) : (
                                        <React.Fragment key={movie.id || movie.imdbID || index}>
                                            {card}
                                        </React.Fragment>
                                    );
                                }}
                            />
                            {searchResults.length === 0 && showNoResults && (
                                <p className="no-results">No movies or shows found.</p>
                            )}
                        </>
                    )}
                </section>
            ) : genreId ? (
                <section className="movie-section">
                    <h2 className="section-title">{genre ? `${genre} Movies` : 'Genre Movies'}</h2>

                    {(status === 'loading' && page === 1) ? (
                        <div className="movie-grid">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="skeleton-card">
                                    <div className="skeleton skeleton-poster" />
                                    <div className="skeleton skeleton-text" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <VirtualizedMovieGrid
                                items={genreResults}
                                estimatedItemHeight={320}
                                renderCard={(movie, index) => {
                                    const isLast = index === genreResults.length - 1;
                                    const card = <MovieCard movie={movie} />;
                                    return isLast ? (
                                        <div ref={lastElementRef} key={movie.id || movie.imdbID || index}>
                                            {card}
                                        </div>
                                    ) : (
                                        <React.Fragment key={movie.id || movie.imdbID || index}>
                                            {card}
                                        </React.Fragment>
                                    );
                                }}
                            />
                            {genreResults.length === 0 && showNoResults && (
                                <p className="no-results">No movies found for this genre.</p>
                            )}
                        </>
                    )}
                </section>
            ) : (
                <>
                    {category === 'home' && (
                        <>
                            <HeroCarousel movies={latest} />

                            <section className="movie-section">
                                <h2 className="section-title">Popular Movies</h2>
                                <VirtualizedMovieGrid
                                    items={popular}
                                    estimatedItemHeight={320}
                                    renderCard={(movie, index) => {
                                        const isLast = index === popular.length - 1;
                                        const card = <MovieCard movie={movie} />;
                                        return isLast ? (
                                            <div ref={lastElementRef} key={`${movie.id || movie.imdbID || index}-${index}`}>
                                                {card}
                                            </div>
                                        ) : (
                                            <React.Fragment key={`${movie.id || movie.imdbID || index}-${index}`}>
                                                {card}
                                            </React.Fragment>
                                        );
                                    }}
                                />
                                {status === 'loading' && <div className="loading-more">Loading more...</div>}
                            </section>

                            {customMovies.length > 0 && (
                                <section className="movie-section">
                                    <h2 className="section-title"><span className="font-pacifico">Filmyway</span> Originals</h2>
                                    <VirtualizedMovieGrid
                                        items={customMovies}
                                        estimatedItemHeight={320}
                                        renderCard={(movie, index) => (
                                            <MovieCard key={movie._id || index} movie={{ ...movie, id: movie._id }} />
                                        )}
                                    />
                                </section>
                            )}
                        </>
                    )}

                    {category === 'trending' && (
                        <>
                            <HeroCarousel movies={trending} />
                            <section className="movie-section">
                                <h2 className="section-title">Trending</h2>
                                <VirtualizedMovieGrid
                                    items={trending}
                                    estimatedItemHeight={320}
                                    renderCard={(movie, index) => (
                                        <React.Fragment key={`${movie.id || movie.imdbID || index}-${index}`}>
                                            <MovieCard movie={movie} />
                                        </React.Fragment>
                                    )}
                                />
                            </section>
                        </>
                    )}

                    {category === 'movies' && (
                        <>
                            <HeroCarousel movies={popular.length > 0 ? popular : latest} />
                            <section className="movie-section">
                                <h2 className="section-title">Movies</h2>
                                <VirtualizedMovieGrid
                                    items={popular}
                                    estimatedItemHeight={320}
                                    renderCard={(movie, index) => {
                                        const isLast = index === popular.length - 1;
                                        const card = <MovieCard movie={movie} />;
                                        return isLast ? (
                                            <div ref={lastElementRef} key={`${movie.id || movie.imdbID || index}-${index}`}>
                                                {card}
                                            </div>
                                        ) : (
                                            <React.Fragment key={`${movie.id || movie.imdbID || index}-${index}`}>
                                                {card}
                                            </React.Fragment>
                                        );
                                    }}
                                />
                                {status === 'loading' && <div className="loading-more">Loading more...</div>}
                            </section>
                        </>
                    )}

                    {category === 'tvshows' && (
                        <>
                            <HeroCarousel movies={tvShows.length > 0 ? tvShows : latest} />
                            <section className="movie-section">
                                <h2 className="section-title">TV Shows</h2>
                                <VirtualizedMovieGrid
                                    items={tvShows}
                                    estimatedItemHeight={320}
                                    renderCard={(movie, index) => (
                                        <React.Fragment key={`${movie.id || movie.imdbID || index}-${index}`}>
                                            <MovieCard movie={movie} />
                                        </React.Fragment>
                                    )}
                                />
                            </section>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
