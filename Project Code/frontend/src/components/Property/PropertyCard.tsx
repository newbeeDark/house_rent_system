import React from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../../types';
import { useAuth } from '../../context/AuthContext';
// import clsx from 'clsx'; // Unused

interface PropertyCardProps {
    property: Property;
    delay?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, delay = 0 }) => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const isLandlord = user?.role === 'landlord' || user?.role === 'agent' || user?.role === 'host';
    // const isGuest = !user; // Unused

    // Format distance
    const dist = property.distance !== undefined
        ? (property.distance < 1 ? (property.distance * 1000).toFixed(0) + ' m' : property.distance.toFixed(2) + ' km')
        : '';

    const isNearby = property.distance !== undefined && property.distance <= 1.2;
    const [liked, setLiked] = React.useState(false);

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
                        <div className="meta">{property.area} · {property.beds} bed · Rating {property.rating}</div>
                    </div>
                    <div className="tags">
                        {isNearby && <div className="tag nearby">Nearby</div>}
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
                        {/* Heart button */}
                        <button
                            className="heart"
                            title="Add to favourites"
                            aria-label="Add to favourites"
                            onClick={(e) => {
                                e.preventDefault(); // Prevent navigating if inside Link
                                setLiked(!liked);
                            }}
                            style={{ color: liked ? 'red' : 'inherit' }}
                        >
                            {liked ? '♥' : '♡'}
                        </button>

                        <Link to={`/property/${property.id}`} className="btn btn-ghost view-link" style={{ marginLeft: '8px' }}>View</Link>

                        {isStudent && (
                            <Link to={`/apply/${property.id}`} className="btn btn-ghost apply-link">Apply</Link>
                        )}

                        {isLandlord && (
                            <Link to={`/edit/${property.id}`} className="btn btn-ghost edit-link">Edit</Link>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};
