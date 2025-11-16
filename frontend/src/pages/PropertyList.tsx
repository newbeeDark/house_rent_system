import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePropertyStore } from '../stores/propertyStore'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/Card'



export default function PropertyList() {
  const { isAuthenticated } = useAuthStore()
  const { properties, loading, pagination, fetchProperties, setSearchFilters } = usePropertyStore()
  const [filters, setFilters] = useState({
    city: '',
    district: '',
    price_min: '',
    price_max: '',
    rooms: ''
  })

  useEffect(() => {
    fetchProperties()
  }, [pagination.page])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const numericFilters = {
      city: filters.city || undefined,
      district: filters.district || undefined,
      price_min: filters.price_min ? Number(filters.price_min) : undefined,
      price_max: filters.price_max ? Number(filters.price_max) : undefined,
      rooms: filters.rooms ? Number(filters.rooms) : undefined
    }
    setSearchFilters(numericFilters)
    fetchProperties(1)
  }

  const resetFilters = () => {
    setFilters({ city: '', district: '', price_min: '', price_max: '', rooms: '' })
    setSearchFilters({})
    fetchProperties(1)
  }

  return (
    <div className="container">
      <div className="header">
        <ThemeToggle />
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/" className="btn btn-outline">Home</Link>
          {isAuthenticated && (
            <>
              <Link to="/profile" className="btn btn-outline">Profile</Link>
              <Link to="/properties/publish" className="btn btn-primary">Publish Property</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <Card>
          <h2 className="title">Find Your Perfect Home</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
            <input
              type="text"
              placeholder="District"
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
            <input
              type="number"
              placeholder="Min Price"
              value={filters.price_min}
              onChange={(e) => handleFilterChange('price_min', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.price_max}
              onChange={(e) => handleFilterChange('price_max', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
            <input
              type="number"
              placeholder="Rooms"
              value={filters.rooms}
              onChange={(e) => handleFilterChange('rooms', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={applyFilters} className="btn btn-primary">Search</button>
            <button onClick={resetFilters} className="btn btn-outline">Reset</button>
          </div>
        </Card>

        {loading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: 'var(--color-muted)' }}>Loading properties...</div>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {properties.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '18px', color: 'var(--color-muted)' }}>No properties found</div>
                  <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>Try adjusting your search criteria</p>
                </div>
              </Card>
            ) : (
              properties.map(property => (
                <Card key={property.id} style={{ cursor: 'pointer' }}>
                  <Link to={`/properties/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ 
                        width: '120px', 
                        height: '90px', 
                        backgroundColor: '#e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '12px',
                        backgroundImage: property.images.length > 0 ? `url(${property.images[0].image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {property.images.length === 0 ? 'No Image' : ''}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{property.title}</h3>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--color-muted)', fontSize: '14px' }}>
                          {property.city}, {property.district} • {property.landlord.nickname}
                        </p>
                        <div style={{ display: 'flex', gap: 16, fontSize: '14px', color: 'var(--color-muted)' }}>
                          <span>{property.rooms} rooms</span>
                          <span>{property.bedrooms} bedrooms</span>
                          <span>{property.bathrooms} bathrooms</span>
                          <span>{property.area} m²</span>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
                          ¥{property.price.toLocaleString()}/month
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            )}
          </div>
        )}

        {pagination.pages > 1 && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button
                onClick={() => fetchProperties(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchProperties(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page === pagination.pages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}