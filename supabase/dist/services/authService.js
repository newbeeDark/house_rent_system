"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const config_1 = require("../config");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const phoneLoginSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/),
    password: zod_1.z.string().min(6)
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/).optional(),
    role: zod_1.z.enum(['tenant', 'landlord', 'agent']).default('tenant'),
    nickname: zod_1.z.string().min(2).max(20).optional()
});
const updateProfileSchema = zod_1.z.object({
    nickname: zod_1.z.string().min(2).max(20).optional(),
    phone: zod_1.z.string().regex(/^1[3-9]\d{9}$/).optional(),
    avatar_url: zod_1.z.string().url().optional()
});
class AuthService {
    async login(email, password) {
        const parse = loginSchema.safeParse({ email, password });
        if (!parse.success) {
            throw new Error('invalid_payload');
        }
        const { data, error } = await config_1.supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            throw new Error(error.message);
        }
        const { data: userData, error: userError } = await config_1.supabaseAdmin
            .from('users')
            .select('id, email, phone, role, nickname, avatar_url, created_at')
            .eq('id', data.user.id)
            .single();
        if (userError) {
            throw new Error('user_not_found');
        }
        return {
            user: userData,
            token: data.session.access_token
        };
    }
    async loginByPhone(phone, password) {
        const parse = phoneLoginSchema.safeParse({ phone, password });
        if (!parse.success) {
            throw new Error('invalid_payload');
        }
        const { data: userData, error: userError } = await config_1.supabaseAdmin
            .from('users')
            .select('email')
            .eq('phone', phone)
            .single();
        if (userError || !userData) {
            throw new Error('phone_not_found');
        }
        return this.login(userData.email, password);
    }
    async register(data) {
        const parse = registerSchema.safeParse(data);
        if (!parse.success) {
            throw new Error('invalid_payload');
        }
        const { email, password, phone, role, nickname } = parse.data;
        const { data: authData, error: authError } = await config_1.supabase.auth.signUp({
            email,
            password
        });
        if (authError) {
            throw new Error(authError.message);
        }
        if (!authData.user) {
            throw new Error('registration_failed');
        }
        const { error: profileError } = await config_1.supabaseAdmin
            .from('users')
            .insert({
            id: authData.user.id,
            email,
            phone: phone || null,
            role: role || 'tenant',
            nickname: nickname || email.split('@')[0],
            created_at: new Date().toISOString()
        });
        if (profileError) {
            await config_1.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw new Error('profile_creation_failed');
        }
        const { data: userData } = await config_1.supabaseAdmin
            .from('users')
            .select('id, email, phone, role, nickname, avatar_url, created_at')
            .eq('id', authData.user.id)
            .single();
        return {
            user: userData,
            token: authData.session?.access_token
        };
    }
    async getProfile(userId) {
        const { data, error } = await config_1.supabaseAdmin
            .from('users')
            .select('id, email, phone, role, nickname, avatar_url, created_at')
            .eq('id', userId)
            .single();
        if (error) {
            throw new Error('user_not_found');
        }
        return data;
    }
    async updateProfile(userId, updates) {
        const parse = updateProfileSchema.safeParse(updates);
        if (!parse.success) {
            throw new Error('invalid_payload');
        }
        if (updates.phone) {
            const { data: existing } = await config_1.supabaseAdmin
                .from('users')
                .select('id')
                .eq('phone', updates.phone)
                .neq('id', userId)
                .single();
            if (existing) {
                throw new Error('phone_exists');
            }
        }
        const { data, error } = await config_1.supabaseAdmin
            .from('users')
            .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
            .eq('id', userId)
            .select('id, email, phone, role, nickname, avatar_url, created_at')
            .single();
        if (error) {
            throw new Error('update_failed');
        }
        return data;
    }
    async logout() {
        const { error } = await config_1.supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map