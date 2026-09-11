import React from 'react';

const VirtualizedMovieGrid = ({ items, renderCard }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="movie-grid">
            {items.map((item, index) => renderCard(item, index))}
        </div>
    );
};

export default VirtualizedMovieGrid;
