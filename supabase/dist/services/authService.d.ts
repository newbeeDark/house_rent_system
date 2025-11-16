export declare class AuthService {
    login(email: string, password: string): Promise<{
        user: {
            id: any;
            email: any;
            phone: any;
            role: any;
            nickname: any;
            avatar_url: any;
            created_at: any;
        };
        token: string;
    }>;
    loginByPhone(phone: string, password: string): Promise<{
        user: {
            id: any;
            email: any;
            phone: any;
            role: any;
            nickname: any;
            avatar_url: any;
            created_at: any;
        };
        token: string;
    }>;
    register(data: {
        email: string;
        password: string;
        phone?: string;
        role?: string;
        nickname?: string;
    }): Promise<{
        user: {
            id: any;
            email: any;
            phone: any;
            role: any;
            nickname: any;
            avatar_url: any;
            created_at: any;
        } | null;
        token: string | undefined;
    }>;
    getProfile(userId: string): Promise<{
        id: any;
        email: any;
        phone: any;
        role: any;
        nickname: any;
        avatar_url: any;
        created_at: any;
    }>;
    updateProfile(userId: string, updates: {
        nickname?: string;
        phone?: string;
        avatar_url?: string;
    }): Promise<{
        id: any;
        email: any;
        phone: any;
        role: any;
        nickname: any;
        avatar_url: any;
        created_at: any;
    }>;
    logout(): Promise<void>;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map