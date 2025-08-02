import jwt from 'jsonwebtoken';
import { getDatabase } from '../../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export async function authenticateToken(request) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return { success: false, error: 'No token provided', status: 401 };
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        const db = getDatabase();

        // Check if session exists in database
        const session = await db.getValidSession(token);
        if (!session) {
            return { success: false, error: 'Invalid or expired session', status: 401 };
        }

        // Check if session is expired
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        if (now > expiresAt) {
            // Clean up expired session
            await db.deleteSession(token);
            return { success: false, error: 'Session expired', status: 401 };
        }

        // Get user details
        const user = await db.getUserById(userId);
        if (!user) {
            return { success: false, error: 'User not found', status: 401 };
        }

        // Remove password hash from user object
        const { password_hash, ...userWithoutPassword } = user;

        return { 
            success: true, 
            user: userWithoutPassword, 
            userId: userId,
            token: token 
        };

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return { success: false, error: 'Invalid token', status: 401 };
        }
        if (error.name === 'TokenExpiredError') {
            return { success: false, error: 'Token expired', status: 401 };
        }
        
        console.error('Authentication error:', error);
        return { success: false, error: 'Authentication failed', status: 500 };
    }
}

export function requireAuth(handler) {
    return async function(request) {
        const authResult = await authenticateToken(request);
        
        if (!authResult.success) {
            return Response.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }
        
        // Add user info to request for use in handler
        request.user = authResult.user;
        request.userId = authResult.userId;
        request.token = authResult.token;
        
        return handler(request);
    };
}

export async function getOptionalAuth(request) {
    try {
        const authResult = await authenticateToken(request);
        return authResult.success ? authResult : null;
    } catch (error) {
        return null;
    }
}
