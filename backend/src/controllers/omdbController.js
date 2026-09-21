const omdbProxy = async (req, res) => {
    try {
        const omdbApiKey = process.env.OMDB_API_KEY;
        if (!omdbApiKey) {
            return res.status(500).json({ message: 'OMDB API key not configured on server' });
        }

        const queryParams = new URLSearchParams({
            ...req.query,
            apikey: omdbApiKey,
        }).toString();

        const url = `https://www.omdbapi.com/?${queryParams}`;

        const response = await fetch(url);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('OMDB Proxy Error:', error);
        return res.status(500).json({ message: 'Failed to fetch data from OMDB', error: error.message });
    }
};

module.exports = { omdbProxy };
