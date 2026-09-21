const tmdbProxy = async (req, res) => {
    try {
        let path = '';
        if (Array.isArray(req.params.path)) {
            path = req.params.path.join('/');
        } else if (typeof req.params.path === 'string') {
            path = req.params.path;
        } else if (typeof req.path === 'string') {
            path = req.path;
        }
        path = path.replace(/^\//, '');
        const queryParams = new URLSearchParams(req.query).toString();
        const url = `https://api.tmdb.org/3/${path}${queryParams ? `?${queryParams}` : ''}`;

        const tmdbSecret = process.env.TMDB_SECRET;
        if (!tmdbSecret) {
            return res.status(500).json({ message: 'TMDB secret key not configured on server' });
        }

        const response = await fetch(url, {
            method: req.method,
            headers: {
                Authorization: `Bearer ${tmdbSecret}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('TMDB Proxy Error:', error);
        return res.status(500).json({ message: 'Failed to fetch data from TMDB', error: error.message });
    }
};

module.exports = { tmdbProxy };
