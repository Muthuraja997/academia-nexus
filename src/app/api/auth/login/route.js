import { getDatabase } from '../../../../../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = '7d';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return Response.json({ 
                success: false, 
                error: 'Email and password are required' 
            }, { status: 400 });
        }

        const db = getDatabase();

        // Find user by email
        const user = await db.getUserByEmail(email);
        if (!user) {
            return Response.json({ 
                success: false, 
                error: 'Invalid email or password' 
            }, { status: 401 });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return Response.json({ 
                success: false, 
                error: 'Invalid email or password' 
            }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Create session in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        await db.createSession(user.id, token, expiresAt.toISOString());

        // Update last login
        await db.updateLastLogin(user.id);

        // Log login activity
        await db.logActivity(
            user.id, 
            'login', 
            { login_method: 'email_password' }, 
            0, 
            null, 
            null, 
            null
        );

        // Return success response (exclude password hash)
        const { password_hash, ...userResponse } = user;
        
        return Response.json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            token: token,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error('Login error:', error);
        return Response.json({ 
            success: false, 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}
