import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import VirtualizedMovieGrid from '../components/VirtualizedMovieGrid';
import { Heart, Clock } from 'lucide-react';
import './Dashboard.css';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'history'

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                const favRes = await axios.get(`${API_URL}/users/favorites`, config);
                setFavorites(favRes.data);

                const histRes = await axios.get(`${API_URL}/users/history`, config);
                setHistory(histRes.data);

            } catch (error) {
                console.error("Failed to load user data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, navigate, API_URL]);

    if (loading) {
        const skeletonItems = Array.from({ length: 8 });

        return (
            <div className="dashboard-container container animate-fade">
                <div className="dashboard-header">
                    <div className="skeleton skeleton-dashboard-title" />
                    <div className="dashboard-tabs">
                        <div className="skeleton skeleton-tab" />
                        <div className="skeleton skeleton-tab" />
                    </div>
                </div>

                <section className="dashboard-section">
                    <div className="movie-grid">
                        {skeletonItems.map((_, index) => (
                            <div key={index} className="skeleton-card">
                                <div className="skeleton skeleton-poster" />
                                <div className="skeleton skeleton-text" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="dashboard-container container animate-fade">
            <div className="dashboard-header">
                <h1>My Dashboard</h1>
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <Heart size={18} /> Favorites ({favorites.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <Clock size={18} /> Watch History ({history.length})
                    </button>
                </div>
            </div>

            {activeTab === 'favorites' && (
                <section className="dashboard-section">
                    {favorites.length === 0 ? (
                        <div className="empty-state">
                            <Heart size={48} className="empty-icon" />
                            <p>You haven't added any favorites yet.</p>
                            <button className="btn-primary mt-4" onClick={() => navigate('/')}>Discover Movies</button>
                        </div>
                    ) : (
                        <VirtualizedMovieGrid
                            items={favorites}
                            estimatedItemHeight={320}
                            renderCard={(fav, index) => (
                                <MovieCard key={fav.tmdbId || index} movie={{ ...fav, id: fav.tmdbId }} />
                            )}
                        />
                    )}
                </section>
            )}

            {activeTab === 'history' && (
                <section className="dashboard-section">
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <Clock size={48} className="empty-icon" />
                            <p>Your watch history is empty.</p>
                        </div>
                    ) : (
                        <VirtualizedMovieGrid
                            items={history}
                            estimatedItemHeight={320}
                            renderCard={(hist, index) => (
                                <MovieCard key={`${hist.tmdbId}-${hist.watchedAt || index}`} movie={{ ...hist, id: hist.tmdbId }} />
                            )}
                        />
                    )}
                </section>
            )}
        </div>
    );
};

export default Favorites;
