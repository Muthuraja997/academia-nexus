import { getDatabase } from '../../../../../database/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export async function POST(request) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return Response.json({ 
                success: false, 
                error: 'No token provided' 
            }, { status: 401 });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.userId;

            const db = getDatabase();

            // Delete session from database
            await db.deleteSession(token);

            // Log logout activity
            await db.logActivity(
                userId, 
                'logout', 
                { logout_method: 'manual' }, 
                0, 
                null, 
                null, 
                null
            );

            return Response.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (jwtError) {
            // Token is invalid, but we can still respond with success
            // since the goal is to log out
            return Response.json({
                success: true,
                message: 'Logged out successfully'
            });
        }

    } catch (error) {
        console.error('Logout error:', error);
        return Response.json({ 
            success: false, 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}
