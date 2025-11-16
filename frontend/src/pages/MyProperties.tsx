import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePropertyStore } from '../stores/propertyStore'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/Card'
import Button from '../components/Button'

export default function MyProperties() {
  const { isAuthenticated } = useAuthStore()
  const { properties, loading, fetchUserProperties, deleteProperty } = usePropertyStore()
  const [activeTab, setActiveTab] = useState<'my' | 'favorites'>('my')

  useEffect(() => {
    if (activeTab === 'my') {
      fetchUserProperties()
    } else {
      // Fetch favorites would be implemented here
      // For now, we'll just use the same properties
      fetchUserProperties()
    }
  }, [activeTab])

  const handleDelete = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(propertyId)
      } catch (error) {
        console.error('Failed to delete property:', error)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="header"><ThemeToggle /></div>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Access Denied</h2>
            <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>Please login to view your properties.</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Login
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <ThemeToggle />
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/properties" className="btn btn-outline">Browse Properties</Link>
          <Link to="/properties/publish" className="btn btn-primary">Publish Property</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <Card>
          <h1 className="title">My Properties</h1>
          <p className="subtitle">Manage your property listings and favorites</p>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              onClick={() => setActiveTab('my')}
              className={`btn ${activeTab === 'my' ? 'btn-primary' : 'btn-outline'}`}
            >
              My Properties
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-outline'}`}
            >
              Favorites
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: 'var(--color-muted)' }}>Loading properties...</div>
            </div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: 'var(--color-muted)' }}>
                {activeTab === 'my' ? 'No properties published yet' : 'No favorite properties yet'}
              </div>
              <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>
                {activeTab === 'my' ? 'Start by publishing your first property!' : 'Browse properties and add them to your favorites!'}
              </p>
              {activeTab === 'my' && (
                <Link to="/properties/publish" className="btn btn-primary" style={{ marginTop: '16px' }}>
                  Publish Property
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {properties.map(property => (
                <Card key={property.id}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                        <Link to={`/properties/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {property.title}
                        </Link>
                      </h3>
                      <p style={{ margin: '0 0 8px 0', color: 'var(--color-muted)', fontSize: '14px' }}>
                        {property.city}, {property.district}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeTab === 'my' ? (
                        <>
                          <Link to={`/properties/${property.id}/edit`} className="btn btn-outline" style={{ fontSize: '14px' }}>
                            Edit
                          </Link>
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(property.id)}
                            style={{ fontSize: '14px', color: '#ef4444' }}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => {/* Remove from favorites */}}
                          style={{ fontSize: '14px' }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}