import { getDatabase } from '../../../../../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = '7d';

export async function POST(request) {
    try {
        const {
            username,
            email,
            password,
            confirmPassword,
            fullName,
            phone,
            university,
            major,
            graduationYear
        } = await request.json();

        // Validate input
        if (!username || !email || !password || !fullName) {
            return Response.json({
                success: false,
                error: 'Username, email, password, and full name are required'
            }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return Response.json({
                success: false,
                error: 'Passwords do not match'
            }, { status: 400 });
        }

        if (password.length < 6) {
            return Response.json({
                success: false,
                error: 'Password must be at least 6 characters long'
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json({
                success: false,
                error: 'Please enter a valid email address'
            }, { status: 400 });
        }

        const db = getDatabase();

        // Check if user already exists
        const existingUserByEmail = await db.getUserByEmail(email);
        if (existingUserByEmail) {
            return Response.json({
                success: false,
                error: 'User with this email already exists'
            }, { status: 409 });
        }

        const existingUserByUsername = await db.getUserByUsername(username);
        if (existingUserByUsername) {
            return Response.json({
                success: false,
                error: 'Username is already taken'
            }, { status: 409 });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const userData = {
            username,
            email,
            password_hash: passwordHash,
            first_name: fullName ? fullName.split(' ')[0] : null,
            last_name: fullName ? fullName.split(' ').slice(1).join(' ') : null,
            phone,
            university,
            major,
            year_of_study: graduationYear ? parseInt(graduationYear) : null
        };

        const userId = await db.createUser(userData);

        // Create default user preferences
        await db.createUserPreferences(userId, {
            communication_practice_enabled: true,
            interview_prep_enabled: true,
            scholarship_alerts: true,
            career_recommendations: true,
            difficulty_level: 'intermediate',
            preferred_subjects: '[]',
            notification_settings: JSON.stringify({
                email_notifications: true,
                push_notifications: true,
                weekly_summary: true
            })
        });

        // Award "Welcome" achievement
        await db.createAchievement(userId, 'Welcome to Academia Nexus!', 'welcome', 'Completed account registration');

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: userId, 
                email: email, 
                username: username 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Create session in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        await db.createSession(userId, token, expiresAt.toISOString());

        // Log registration activity
        await db.logActivity(
            userId, 
            'registration', 
            { registration_method: 'email' }, 
            0, 
            null, 
            null, 
            null
        );

        // Get created user (excluding password)
        const newUser = await db.getUserById(userId);
        const { password_hash, ...userResponse } = newUser;

        return Response.json({
            success: true,
            message: 'Registration successful! Welcome to Academia Nexus.',
            user: userResponse,
            token: token,
            expiresAt: expiresAt.toISOString()
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ 
            success: false, 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}
