import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePropertyStore } from '../stores/propertyStore'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/Card'
import Button from '../components/Button'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { currentProperty, loading, fetchPropertyById, toggleFavorite } = usePropertyStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPropertyById(id)
    }
  }, [id])

  if (loading) {
    return (
      <div className="container">
        <div className="header"><ThemeToggle /></div>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: 'var(--color-muted)' }}>Loading property details...</div>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentProperty) {
    return (
      <div className="container">
        <div className="header"><ThemeToggle /></div>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Property Not Found</h2>
            <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>The property you're looking for doesn't exist.</p>
            <Link to="/properties" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Browse Properties
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    try {
      await toggleFavorite(currentProperty.id)
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Show contact information or open contact form
    alert(`Contact ${currentProperty.landlord.nickname} at ${currentProperty.landlord.phone || currentProperty.landlord.email}`)
  }

  return (
    <div className="container">
      <div className="header">
        <ThemeToggle />
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/properties" className="btn btn-outline">Back to Properties</Link>
          {isAuthenticated && (
            <>
              <Link to="/profile" className="btn btn-outline">Profile</Link>
              <Link to="/properties/publish" className="btn btn-primary">Publish Property</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Image Gallery */}
        <Card>
          <div style={{ marginBottom: '16px' }}>
            {currentProperty.images.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={currentProperty.images[currentImageIndex].image_url}
                  alt={currentProperty.title}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                {currentProperty.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                      disabled={currentImageIndex === 0}
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer'
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(Math.min(currentProperty.images.length - 1, currentImageIndex + 1))}
                      disabled={currentImageIndex === currentProperty.images.length - 1}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer'
                      }}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: '18px'
              }}>
                No Images Available
              </div>
            )}
          </div>
          
          {currentProperty.images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {currentProperty.images.map((image, index) => (
                <img
                  key={image.id}
                  src={image.image_url}
                  alt={`Property image ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: '80px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: currentImageIndex === index ? '2px solid #3b82f6' : '2px solid transparent'
                  }}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Property Information */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{currentProperty.title}</h1>
              <p style={{ margin: '0', color: 'var(--color-muted)' }}>
                {currentProperty.city}, {currentProperty.district}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                ¥{currentProperty.price.toLocaleString()}/month
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                {currentProperty.area} m²
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Rooms</div>
              <div style={{ fontWeight: 'bold' }}>{currentProperty.rooms}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Bedrooms</div>
              <div style={{ fontWeight: 'bold' }}>{currentProperty.bedrooms}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Bathrooms</div>
              <div style={{ fontWeight: 'bold' }}>{currentProperty.bathrooms}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Status</div>
              <div style={{ fontWeight: 'bold', color: currentProperty.status === 'available' ? '#10b981' : '#6b7280' }}>
                {currentProperty.status === 'available' ? 'Available' : 'Rented'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Description</h3>
            <p style={{ margin: '0', lineHeight: '1.6' }}>{currentProperty.description}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Address</h3>
            <p style={{ margin: '0', color: 'var(--color-muted)' }}>{currentProperty.address}</p>
          </div>

          {currentProperty.facilities && currentProperty.facilities.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Facilities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentProperty.facilities.map((facility, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'var(--color-surface)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Contact Information</h3>
            <p style={{ margin: '0' }}>
              <strong>Landlord:</strong> {currentProperty.landlord.nickname}
            </p>
            <p style={{ margin: '4px 0 0 0', color: 'var(--color-muted)', fontSize: '14px' }}>
              Contact: {currentProperty.landlord.phone || currentProperty.landlord.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button onClick={handleContact} style={{ flex: 1 }}>
              Contact Landlord
            </Button>
            <Button onClick={handleFavorite} variant="outline">
              {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}