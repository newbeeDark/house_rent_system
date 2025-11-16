import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Rental Platform API (Supabase)',
      version: '1.0.0',
      description: '基于 Supabase 的租房平台后端 API 文档',
    },
    servers: [
      { url: 'http://localhost:3001' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: { error: { type: 'string' } }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['tenant', 'landlord', 'agent'] },
            nickname: { type: 'string' },
            avatar_url: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            phone: { type: 'string', pattern: '^\\+?\\d{7,15}$', description: '国际纯数字手机号（例如马来西亚 143663232 或含区号）' },
            role: { type: 'string', enum: ['tenant', 'landlord', 'agent'] },
            nickname: { type: 'string' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        },
        PhoneLoginRequest: {
          type: 'object',
          required: ['phone', 'password'],
          properties: {
            phone: { type: 'string', pattern: '^\\+?\\d{7,15}$', description: '国际纯数字手机号' },
            password: { type: 'string', minLength: 6 }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            nickname: { type: 'string' },
            phone: { type: 'string', pattern: '^\\+?\\d{7,15}$', description: '国际纯数字手机号' },
            avatar_url: { type: 'string', format: 'uri' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            landlord_id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            area: { type: 'number' },
            rooms: { type: 'integer' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            address: { type: 'string' },
            city: { type: 'string' },
            district: { type: 'string' },
            latitude: { type: 'number', nullable: true },
            longitude: { type: 'number', nullable: true },
            facilities: { type: 'array', items: { type: 'string' }, nullable: true },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  image_url: { type: 'string', format: 'uri' },
                  is_primary: { type: 'boolean' },
                  sort_order: { type: 'integer' }
                }
              }
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' }
          }
        },
        SearchResponse: {
          type: 'object',
          properties: {
            properties: { type: 'array', items: { $ref: '#/components/schemas/Property' } },
            pagination: { $ref: '#/components/schemas/Pagination' }
          }
        },
        ToggleFavoriteResponse: {
          type: 'object',
          properties: { favorited: { type: 'boolean' } }
        }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } }
            }
          },
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Invalid payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
          },
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/login/phone': {
        post: {
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PhoneLoginRequest' } } }
          },
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/profile': {
        get: {
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } },
            404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        put: {
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } }
          },
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } },
            400: { description: 'Invalid payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/properties': {
        get: {
          tags: ['Properties'],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'city', schema: { type: 'string' } },
            { in: 'query', name: 'district', schema: { type: 'string' } },
            { in: 'query', name: 'price_min', schema: { type: 'number' } },
            { in: 'query', name: 'price_max', schema: { type: 'number' } },
            { in: 'query', name: 'area_min', schema: { type: 'number' } },
            { in: 'query', name: 'area_max', schema: { type: 'number' } },
            { in: 'query', name: 'rooms', schema: { type: 'integer' } },
            { in: 'query', name: 'bedrooms', schema: { type: 'integer' } },
            { in: 'query', name: 'bathrooms', schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } } },
            400: { description: 'Invalid filters', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        post: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Property' } } }
          },
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { property: { $ref: '#/components/schemas/Property' } } } } } },
            400: { description: 'Invalid payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/properties/{id}': {
        get: {
          tags: ['Properties'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { property: { $ref: '#/components/schemas/Property' } } } } } },
            404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        put: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Property' } } }
          },
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { property: { $ref: '#/components/schemas/Property' } } } } } },
            400: { description: 'Update failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        delete: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
            400: { description: 'Delete failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/properties/user/my': {
        get: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { properties: { type: 'array', items: { $ref: '#/components/schemas/Property' } } } } } } },
            400: { description: 'Fetch failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/properties/{id}/favorite': {
        post: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ToggleFavoriteResponse' } } } },
            400: { description: 'Failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/properties/user/favorites': {
        get: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { properties: { type: 'array', items: { $ref: '#/components/schemas/Property' } } } } } } },
            400: { description: 'Fetch failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      }
    }
  },
  apis: []
}

export const swaggerSpec = swaggerJSDoc(options)