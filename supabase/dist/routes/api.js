"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
const propertyService_1 = require("../services/propertyService");
const zod_1 = require("zod");
const config_1 = require("../config");
const router = express_1.default.Router();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/).optional(),
    role: zod_1.z.enum(['tenant', 'landlord', 'agent']).default('tenant'),
    nickname: zod_1.z.string().min(2).max(20).optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const phoneLoginSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/),
    password: zod_1.z.string().min(6)
});
const updateProfileSchema = zod_1.z.object({
    nickname: zod_1.z.string().min(2).max(20).optional(),
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/).optional(),
    avatar_url: zod_1.z.string().url().optional()
});
const propertySchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(200),
    description: zod_1.z.string().min(10).max(2000),
    price: zod_1.z.number().positive(),
    area: zod_1.z.number().positive(),
    rooms: zod_1.z.number().int().positive(),
    bedrooms: zod_1.z.number().int().positive(),
    bathrooms: zod_1.z.number().int().positive(),
    address: zod_1.z.string().min(5).max(500),
    city: zod_1.z.string().min(2).max(100),
    district: zod_1.z.string().min(2).max(100),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    facilities: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).min(1).max(10)
});
const searchSchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(10),
    city: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    price_min: zod_1.z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
    price_max: zod_1.z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
    area_min: zod_1.z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
    area_max: zod_1.z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
    rooms: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    bedrooms: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    bathrooms: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
});
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'no_token' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const { data: { user }, error } = await config_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'invalid_token' });
        }
        req.auth = { user, token };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'invalid_token' });
    }
}
router.post('/auth/register', async (req, res) => {
    try {
        const parse = registerSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'invalid_payload' });
        }
        const result = await authService_1.authService.register(parse.data);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/auth/login', async (req, res) => {
    try {
        const parse = loginSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'invalid_payload' });
        }
        const result = await authService_1.authService.login(parse.data.email, parse.data.password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
router.post('/auth/login/phone', async (req, res) => {
    try {
        const parse = phoneLoginSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'invalid_payload' });
        }
        const result = await authService_1.authService.loginByPhone(parse.data.phone, parse.data.password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
router.get('/auth/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const user = await authService_1.authService.getProfile(userId);
        res.json({ user });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.put('/auth/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const updates = updateProfileSchema.parse(req.body);
        const user = await authService_1.authService.updateProfile(userId, updates);
        res.json({ user });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/properties', async (req, res) => {
    try {
        const filters = searchSchema.parse(req.query);
        const result = await propertyService_1.propertyService.searchProperties(filters);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/properties/:id', async (req, res) => {
    try {
        const property = await propertyService_1.propertyService.getPropertyById(req.params.id);
        res.json({ property });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.post('/properties', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const property = await propertyService_1.propertyService.createProperty(userId, req.body);
        res.json({ property });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/properties/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const property = await propertyService_1.propertyService.updateProperty(req.params.id, userId, req.body);
        res.json({ property });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/properties/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const result = await propertyService_1.propertyService.deleteProperty(req.params.id, userId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/properties/user/my', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const properties = await propertyService_1.propertyService.getUserProperties(userId);
        res.json({ properties });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/properties/:id/favorite', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const result = await propertyService_1.propertyService.toggleFavorite(userId, req.params.id);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/properties/user/favorites', authMiddleware, async (req, res) => {
    try {
        const userId = req.auth.user.id;
        const properties = await propertyService_1.propertyService.getUserFavorites(userId);
        res.json({ properties });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=api.js.map