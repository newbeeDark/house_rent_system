import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

interface PropertyCardProps {
    property: Property;
    delay?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, delay = 0 }) => {
    const { user } = useAuth();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();

    // Format distance
    const dist = property.distance !== undefined
        ? (property.distance < 1 ? (property.distance * 1000).toFixed(0) + ' m' : property.distance.toFixed(2) + ' km')
        : '';

    const isNearby = property.distance !== undefined && property.distance <= 1.2;

    // Use O(1) lookup from favorites context instead of database query
    const liked = isFavorite(property.id);
    const [toggling, setToggling] = useState(false);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Please log in to add favorites.");
            return;
        }

        if (toggling) return;

        setToggling(true);
        try {
            if (liked) {
                await removeFavorite(property.id);
            } else {
                await addFavorite(property.id);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            alert('Failed to update favorite status');
        } finally {
            setToggling(false);
        }
    };

    // Animation delay style
    const style = {
        '--delay': `${delay}ms`,
        opacity: 0,
        animationDelay: `${delay}ms`
    } as React.CSSProperties;

    return (
        <article className="listing-card in-view" style={style}>
            <div className="thumb" style={{ backgroundImage: `url('${property.img}')` }} aria-hidden="true"></div>

            <div className="info">
                <div className="title-row">
                    <div>
                        <div className="title">{property.title}</div>
                        <div className="meta">{property.area} · {property.beds} bedrooms · {property.furnished} furnished {/*· Rating {property.rating}*/}</div>
                    </div>
                    <div className="tags">
                        {isNearby && <div className="tag nearby">Nearby</div>}
                        {(property.stats?.views || 0) > 50 && (
                            <div className="tag" style={{ backgroundColor: '#ffebee', color: '#c62828', borderColor: '#ffcdd2' }}>Hot 🔥</div>
                        )}
                        <div className="tag">Top pick</div>
                    </div>
                </div>

                <div className="actions-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="price">RM {property.price}</div>
                        <div className="distance">{dist}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                        {/* Heart button */}
                        <button
                            className="heart"
                            title={liked ? "Remove from favourites" : "Add to favourites"}
                            aria-label={liked ? "Remove from favourites" : "Add to favourites"}
                            onClick={handleToggleFavorite}
                            disabled={toggling}
                            style={{
                                color: liked ? 'red' : 'inherit',
                                opacity: toggling ? 0.5 : 1,
                                cursor: toggling ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {liked ? '♥' : '♡'}
                        </button>

                        <Link to={`/property/${property.id}`} className="btn btn-ghost view-link" style={{ marginLeft: '8px' }}>View</Link>
                    </div>
                </div>
            </div>
        </article>
    );
};
