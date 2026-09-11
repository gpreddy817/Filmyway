import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit, Plus, Users, Film } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('movies');

    // Movie Form State
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentMovieId, setCurrentMovieId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', posterUrl: '', description: '', releaseDate: '', trailerUrl: '', genre: '', category: 'Movies'
    });

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, moviesRes] = await Promise.all([
                axios.get(`${API_URL}/users`, config),
                axios.get(`${API_URL}/movies`, config) // Custom admin added movies
            ]);
            setUsers(usersRes.data);
            setMovies(moviesRes.data);
        } catch (error) {
            console.error("Admin fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_URL}/users/${id}`, config);
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleDeleteMovie = async (id) => {
        if (window.confirm('Are you sure you want to delete this movie?')) {
            try {
                await axios.delete(`${API_URL}/movies/${id}`, config);
                setMovies(movies.filter(m => m._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleEditMovie = (movie) => {
        setFormData({
            title: movie.title, posterUrl: movie.posterUrl, description: movie.description,
            releaseDate: movie.releaseDate, trailerUrl: movie.trailerUrl, genre: movie.genre, category: movie.category
        });
        setEditMode(true);
        setCurrentMovieId(movie._id);
        setShowForm(true);
    };

    const handleSubmitMovie = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`${API_URL}/movies/${currentMovieId}`, formData, config);
            } else {
                await axios.post(`${API_URL}/movies`, formData, config);
            }
            setShowForm(false);
            setFormData({ title: '', posterUrl: '', description: '', releaseDate: '', trailerUrl: '', genre: '', category: 'Movies' });
            setEditMode(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
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
                    <div className="table-wrapper glass-panel">
                        <div className="skeleton skeleton-table-row" />
                        <div className="skeleton skeleton-table-row" />
                        <div className="skeleton skeleton-table-row" />
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="dashboard-container container animate-fade">
            <div className="dashboard-header">
                <h1>Admin Control Panel</h1>
                <div className="dashboard-tabs">
                    <button className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => setActiveTab('movies')}>
                        <Film size={18} /> Manage Movies
                    </button>
                    <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> Manage Users
                    </button>
                </div>
            </div>

            {activeTab === 'movies' && (
                <section className="dashboard-section">
                    {!showForm && (
                        <button className="btn-primary mb-4" onClick={() => { setShowForm(true); setEditMode(false); }}>
                            <Plus size={18} /> Add Custom Movie
                        </button>
                    )}

                    {showForm ? (
                        <div className="admin-form-container glass-panel">
                            <h3 className="mb-4">{editMode ? 'Edit Movie' : 'Add New Movie'}</h3>
                            <form onSubmit={handleSubmitMovie} className="admin-form">
                                <input type="text" placeholder="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="form-control" />
                                <input type="text" placeholder="Poster URL" value={formData.posterUrl} onChange={e => setFormData({ ...formData, posterUrl: e.target.value })} className="form-control" />
                                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="form-control" rows="3"></textarea>
                                <div className="form-row">
                                    <input type="date" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} className="form-control" />
                                    <input type="text" placeholder="Genre" value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} className="form-control" />
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="form-control">
                                        <option value="Movies">Movies</option>
                                        <option value="TV Shows">TV Shows</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="YouTube Trailer Link" value={formData.trailerUrl} onChange={e => setFormData({ ...formData, trailerUrl: e.target.value })} className="form-control" />

                                <div className="form-actions mt-4">
                                    <button type="submit" className="btn-primary">{editMode ? 'Update' : 'Save'}</button>
                                    <button type="button" className="btn-glass" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="table-wrapper glass-panel">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Genre</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movies.length === 0 && <tr><td colSpan="4">No custom movies added yet.</td></tr>}
                                    {movies.map(movie => (
                                        <tr key={movie._id}>
                                            <td>{movie.title}</td>
                                            <td>{movie.category}</td>
                                            <td>{movie.genre}</td>
                                            <td className="actions-cell">
                                                <button className="btn-icon text-blue-400" onClick={() => handleEditMovie(movie)}><Edit size={18} /></button>
                                                <button className="btn-icon text-red-400" onClick={() => handleDeleteMovie(movie._id)}><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {activeTab === 'users' && (
                <section className="dashboard-section">
                    <div className="table-wrapper glass-panel">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="actions-cell">
                                            {u.role !== 'admin' && (
                                                <button className="btn-icon" onClick={() => handleDeleteUser(u._id)} title="Delete User">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminDashboard;
