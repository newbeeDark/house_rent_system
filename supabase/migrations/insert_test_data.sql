-- Insert a test user first
INSERT INTO public.users (
  id,
  email,
  phone,
  role,
  nickname,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'testlandlord@example.com',
  '13800138001',
  'landlord',
  'Test Landlord',
  NOW()
);

-- Now insert a test property
INSERT INTO public.properties (
  landlord_id,
  title,
  description,
  price,
  area,
  rooms,
  bedrooms,
  bathrooms,
  address,
  city,
  district,
  facilities,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Test Property for Demo',
  'This is a test property for demonstrating the rental platform functionality.',
  5000,
  80,
  3,
  2,
  1,
  '123 Test Street',
  'Shanghai',
  'Pudong',
  '["WiFi", "Parking", "Gym"]',
  'available'
);

-- Insert test images for the property
INSERT INTO public.property_images (property_id, image_url, is_primary, sort_order) VALUES
  ((SELECT id FROM public.properties WHERE title = 'Test Property for Demo'),
   'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
   true,
   0),
  ((SELECT id FROM public.properties WHERE title = 'Test Property for Demo'),
   'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
   false,
   1);