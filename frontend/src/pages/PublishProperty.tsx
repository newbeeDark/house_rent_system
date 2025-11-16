import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePropertyStore } from '../stores/propertyStore'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'

export default function PublishProperty() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { createProperty, loading } = usePropertyStore()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    address: '',
    city: '',
    district: '',
    facilities: [] as string[],
    images: [] as string[]
  })
  
  const [newFacility, setNewFacility] = useState('')
  const [newImage, setNewImage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const addFacility = () => {
    if (newFacility.trim()) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, newFacility.trim()]
      }))
      setNewFacility('')
    }
  }

  const removeFacility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }))
  }

  const addImage = () => {
    if (newImage.trim() && isValidUrl(newImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }))
      setNewImage('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.area || Number(formData.area) <= 0) newErrors.area = 'Valid area is required'
    if (!formData.rooms || Number(formData.rooms) <= 0) newErrors.rooms = 'Valid number of rooms is required'
    if (!formData.bedrooms || Number(formData.bedrooms) <= 0) newErrors.bedrooms = 'Valid number of bedrooms is required'
    if (!formData.bathrooms || Number(formData.bathrooms) <= 0) newErrors.bathrooms = 'Valid number of bathrooms is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.district.trim()) newErrors.district = 'District is required'
    if (formData.images.length === 0) newErrors.images = 'At least one image is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        area: Number(formData.area),
        rooms: Number(formData.rooms),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        facilities: formData.facilities,
        images: formData.images
      }
      
      await createProperty(propertyData)
      navigate('/properties')
    } catch (error) {
      console.error('Failed to create property:', error)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <ThemeToggle />
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/properties" className="btn btn-outline">Back to Properties</Link>
          <Link to="/profile" className="btn btn-outline">Profile</Link>
        </div>
      </div>

      <Card>
        <h1 className="title">Publish New Property</h1>
        <p className="subtitle">Fill in the details to list your property for rent</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <Input
            label="Title"
            placeholder="Modern 2-bedroom apartment in downtown"
            value={formData.title}
            onChange={(value) => handleInputChange('title', value)}
            error={errors.title}
            required
          />

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              placeholder="Describe your property in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '8px 12px',
                border: errors.description ? '1px solid #ef4444' : '1px solid var(--color-border)',
                borderRadius: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
              required
            />
            {errors.description && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {errors.description}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Input
              label="Price (¥/month)"
              type="number"
              placeholder="5000"
              value={formData.price}
              onChange={(value) => handleInputChange('price', value)}
              error={errors.price}
              required
            />
            <Input
              label="Area (m²)"
              type="number"
              placeholder="80"
              value={formData.area}
              onChange={(value) => handleInputChange('area', value)}
              error={errors.area}
              required
            />
            <Input
              label="Total Rooms"
              type="number"
              placeholder="3"
              value={formData.rooms}
              onChange={(value) => handleInputChange('rooms', value)}
              error={errors.rooms}
              required
            />
            <Input
              label="Bedrooms"
              type="number"
              placeholder="2"
              value={formData.bedrooms}
              onChange={(value) => handleInputChange('bedrooms', value)}
              error={errors.bedrooms}
              required
            />
            <Input
              label="Bathrooms"
              type="number"
              placeholder="1"
              value={formData.bathrooms}
              onChange={(value) => handleInputChange('bathrooms', value)}
              error={errors.bathrooms}
              required
            />
          </div>

          <Input
            label="Address"
            placeholder="123 Main Street, Building A, Unit 501"
            value={formData.address}
            onChange={(value) => handleInputChange('address', value)}
            error={errors.address}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Input
              label="City"
              placeholder="Shanghai"
              value={formData.city}
              onChange={(value) => handleInputChange('city', value)}
              error={errors.city}
              required
            />
            <Input
              label="District"
              placeholder="Pudong"
              value={formData.district}
              onChange={(value) => handleInputChange('district', value)}
              error={errors.district}
              required
            />
          </div>

          {/* Facilities */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Facilities
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Add facility (e.g., WiFi, Parking, Gym)"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
              />
              <button
                type="button"
                onClick={addFacility}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.facilities.map((facility, index) => (
                <span
                  key={index}
                  style={{
                    background: 'var(--color-surface)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {facility}
                  <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Images <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="url"
                placeholder="Add image URL (https://example.com/image.jpg)"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: errors.images ? '1px solid #ef4444' : '1px solid var(--color-border)',
                  borderRadius: '6px',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
              />
              <button
                type="button"
                onClick={addImage}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
            {errors.images && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>
                {errors.images}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <img
                    src={image}
                    alt={`Property image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Publishing...' : 'Publish Property'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/properties')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}