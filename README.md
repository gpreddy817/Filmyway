# 🎬 Filmyway - Modern Movie Discovery Platform

![Filmyway Banner](https://img.freepik.com/free-photo/movie-theatre-with-empty-seats_23-2149114881.jpg?t=st=1741533475~exp=1741537075~hmac=5c6a5c1a7b8e9d0c1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d)
*Note: This is a placeholder banner. For the best experience, replace with your custom branding.*

Filmyway is a premium movie discovery and streaming-like platform built with the MERN stack. It features a sleek glassmorphism design, real-time data from TMDB & OMDB, and a robust admin dashboard for managing custom content.

---

## 🚀 Key Features

-   **🎬 Cinematic Experience**: Immersive hero carousel and sleek dark-mode design with glassmorphism overlays.
-   **🔍 Smart Search**: Powerful search functionality integrated with TMDB and OMDB APIs.
-   **📱 Fully Responsive**: Optimized for all devices, from desktops to mobile phones.
-   **🔐 Secure Authentication**: JWT-based login and signup system with Redux state management.
-   **⭐️ Personal Favorites**: Add and manage your favorite movies and shows.
-   **⚡️ High Performance**: Implements virtualized grids (react-window) for lightning-fast scrolling through thousands of titles.
-   **🛠 Admin Dashboard**: Dedicated portal for administrators to upload and manage "Filmyway Originals".
-   **📺 Interactive Details**: Watch trailers directly on the site via the integrated YouTube player.

---

## 🛠 Tech Stack

### Frontend
-   **React 19** (Vite)
-   **Redux Toolkit** (State Management)
-   **React Router 7** (Navigation)
-   **Tailwind CSS** (Styling)
-   **Lucide React** (Icons)
-   **Axios** (API Requests)

### Backend
-   **Node.js & Express**
-   **MongoDB & Mongoose**
-   **JWT & BcryptJS** (Security)
-   **MongoDB Memory Server** (In-memory fallback for development)

---

## ⚙️ Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   MongoDB Atlas or Local MongoDB
-   TMDB API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/filmyway.git
cd filmyway
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_key
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_TMDB_API_KEY=your_tmdb_key
```
Run the frontend:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
Filmyway/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # API logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Auth & error handling
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios configurations
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Redux slices
│   │   ├── pages/        # Main application pages
│   │   └── assets/       # Static files (images, etc.)
│   └── index.html
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

---

Developed with ❤️ by [Girish](https://github.com/yourgithubprofile)
