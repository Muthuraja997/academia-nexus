#!/usr/bin/env python3
"""
Simplified Dashboard Analytics API
Direct database integration for intelligent dashboard insights
"""

import json
import os
import sys
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'academia_nexus'),
    'charset': 'utf8mb4'
}

class DashboardAnalytics:
    def __init__(self):
        pass
    
    def get_connection(self):
        """Get database connection"""
        return pymysql.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database'],
            charset=DB_CONFIG['charset'],
            cursorclass=pymysql.cursors.DictCursor
        )

    def get_user_dashboard_insights(self, user_id):
        """Get comprehensive dashboard insights for a user"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        try:
            # Get user profile
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return {"error": "User not found"}
            
            # Get recent activities (last 30 days)
            cursor.execute("""
                SELECT activity_type, COUNT(*) as count, AVG(score) as avg_score, 
                       MAX(created_at) as last_activity, SUM(session_duration) as total_time
                FROM student_activities 
                WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY activity_type
                ORDER BY count DESC
            """, (user_id,))
            activities = cursor.fetchall()

            # Get test performance
            cursor.execute("""
                SELECT AVG(score_percentage) as avg_score, COUNT(*) as test_count,
                       MAX(created_at) as last_test
                FROM test_results 
                WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            """, (user_id,))
            test_performance = cursor.fetchone() or {}

            # Get study consistency (last 14 days)
            cursor.execute("""
                SELECT DATE(created_at) as study_date, COUNT(*) as activities
                FROM student_activities
                WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                GROUP BY DATE(created_at)
                ORDER BY study_date DESC
            """, (user_id,))
            study_consistency = cursor.fetchall()

            # Generate insights
            insights = self.generate_dashboard_insights(user, activities, test_performance, study_consistency)
            return insights
            
        finally:
            cursor.close()
            connection.close()

    def generate_dashboard_insights(self, user, activities, test_performance, study_consistency):
        """Generate intelligent dashboard insights"""
        # Personalized greeting
        hour = datetime.now().hour
        time_greeting = "Good morning" if hour < 12 else "Good afternoon" if hour < 17 else "Good evening"
        name = user.get('first_name') or user.get('username') or 'Student'
        
        # Learning momentum analysis
        total_activities = sum(activity['count'] for activity in activities if activity.get('count'))
        avg_score = sum(activity.get('avg_score', 0) or 0 for activity in activities) / len(activities) if activities else 0
        consistent_days = len(study_consistency) if study_consistency else 0
        
        momentum_level = 'high' if consistent_days >= 10 else 'moderate' if consistent_days >= 5 else 'low'
        momentum_description = {
            'high': 'Excellent! You\'re on a fantastic learning streak.',
            'moderate': 'Good progress! Try to maintain this consistency.',
            'low': 'Let\'s build some momentum. Consider setting small daily goals.'
        }.get(momentum_level, 'Getting started with your learning journey.')

        # Study streak calculation
        streak_info = self.calculate_study_streak(study_consistency)
        
        # Weekly goals
        weekly_goals = [
            {
                'type': 'consistency',
                'title': 'Study Streak',
                'description': 'Complete at least one learning activity for 5 consecutive days',
                'progress': consistent_days,
                'target': 5
            }
        ]
        
        if avg_score > 0:
            weekly_goals.append({
                'type': 'improvement',
                'title': 'Score Enhancement',
                'description': f'Achieve an average score above {round(avg_score + 5)}%',
                'progress': round(avg_score),
                'target': round(avg_score + 5)
            })

        # Performance highlights
        highlights = []
        test_avg_score = test_performance.get('avg_score') if test_performance else None
        if test_avg_score is not None and test_avg_score >= 85:
            highlights.append({
                'type': 'achievement',
                'title': 'Excellent Test Performance',
                'description': f'Average score of {round(test_avg_score)}% - Keep it up!',
                'icon': '🏆'
            })
        
        if activities:
            top_activity = activities[0]
            highlights.append({
                'type': 'activity',
                'title': 'Most Active in',
                'description': f'{top_activity["activity_type"]} ({top_activity["count"]} sessions)',
                'icon': '📚'
            })

        # Focus areas
        focus_areas = []
        for activity in activities[:3]:
            focus_areas.append({
                'area': activity['activity_type'],
                'sessions': activity['count'],
                'averageScore': round((activity.get('avg_score', 0) or 0) * 100) / 100,
                'totalTime': round((activity.get('total_time', 0) or 0) / 60),
                'recommendation': self.get_area_recommendation(activity.get('avg_score', 0))
            })

        return {
            'personalizedGreeting': {
                'greeting': f"{time_greeting}, {name}!",
                'motivationalMessage': self.get_motivational_message(user.get('id', 0))
            },
            'learningMomentum': {
                'level': momentum_level,
                'description': momentum_description,
                'metrics': {
                    'totalActivities': total_activities,
                    'averageScore': round(avg_score * 100) / 100,
                    'consistentDays': consistent_days,
                    'weeklyGoal': max(7, consistent_days + 2)
                }
            },
            'performanceHighlights': highlights,
            'weeklyGoals': weekly_goals,
            'motivationalInsight': self.get_motivational_insight(),
            'nextSteps': self.suggest_next_steps(activities),
            'streakInfo': streak_info,
            'focusAreas': focus_areas
        }

    def calculate_study_streak(self, study_consistency):
        """Calculate current study streak"""
        if not study_consistency:
            return {
                'current': 0,
                'longest': 0,
                'encouragement': 'Start your learning streak today!'
            }
        
        # Sort by date descending and calculate streak
        sorted_days = sorted(study_consistency, key=lambda x: x['study_date'], reverse=True)
        
        current_streak = 0
        today = datetime.now().date()
        
        for day_data in sorted_days:
            study_date = day_data['study_date']
            expected_date = today - timedelta(days=current_streak)
            
            if study_date == expected_date:
                current_streak += 1
            else:
                break
        
        max_streak = len(sorted_days)  # Simplified calculation
        
        encouragement = f"Great job! {current_streak} day streak!" if current_streak > 0 else "Start a new streak today!"
        
        return {
            'current': current_streak,
            'longest': max_streak,
            'encouragement': encouragement
        }

    def get_motivational_message(self, user_id):
        """Get a motivational message based on user ID"""
        messages = [
            "Ready to unlock your potential today?",
            "Every expert was once a beginner. Keep learning!",
            "Your future self will thank you for today's efforts.",
            "Progress, not perfection. Let's make today count!",
            "The best time to plant a tree was 20 years ago. The second best time is now."
        ]
        return messages[user_id % len(messages)]

    def get_motivational_insight(self):
        """Get a general motivational insight"""
        insights = [
            "Your dedication to learning shows great potential for success.",
            "Consistency in small efforts leads to extraordinary results.",
            "Each study session is an investment in your future career.",
            "Your progress might be gradual, but it's definitely forward."
        ]
        import random
        return random.choice(insights)

    def suggest_next_steps(self, activities):
        """Suggest next steps based on activities"""
        if not activities:
            return [{
                'priority': 'high',
                'action': 'Start Learning',
                'description': 'Begin with a career exploration session',
                'link': '/career-path'
            }]
        
        steps = []
        weak_area = next((a for a in activities if (a.get('avg_score', 0) or 0) < 70), None)
        if weak_area:
            steps.append({
                'priority': 'medium',
                'action': 'Improve Skills',
                'description': f'Focus on {weak_area["activity_type"]} to boost your scores',
                'link': '/study'
            })
        
        return steps

    def get_area_recommendation(self, avg_score):
        """Get recommendation based on average score"""
        if avg_score is None or avg_score == 0:
            return "Getting started! Take some assessments to track your progress."
        elif avg_score >= 90:
            return "Excellent work! Consider mentoring others."
        elif avg_score >= 80:
            return "Strong performance! Try more challenging exercises."
        elif avg_score >= 70:
            return "Good progress! Focus on consistency."
        else:
            return "Room for improvement. Consider additional practice."

    def get_learning_patterns(self, user_id, time_range='month'):
        """Get learning pattern analysis"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        try:
            days_map = {'week': 7, 'month': 30, 'quarter': 90}
            days = days_map.get(time_range, 30)
            
            # Get learning activities
            cursor.execute("""
                SELECT activity_type, activity_details, score, session_duration, 
                       skills_used, difficulty_level, created_at
                FROM student_activities
                WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                ORDER BY created_at DESC
            """, (user_id, days))
            activities = cursor.fetchall()

            # Get communication sessions
            cursor.execute("""
                SELECT scenario_type, feedback_score, confidence_level, created_at
                FROM communication_sessions
                WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                ORDER BY created_at DESC
            """, (user_id, days))
            comm_sessions = cursor.fetchall()

            return self.analyze_learning_patterns(activities, comm_sessions, time_range)
            
        finally:
            cursor.close()
            connection.close()

    def analyze_learning_patterns(self, activities, comm_sessions, time_range):
        """Analyze learning patterns from data"""
        total_sessions = len(activities)
        
        # Calculate learning velocity
        sessions_by_week = {}
        for activity in activities:
            week = activity['created_at'].strftime('%Y-%W')
            sessions_by_week[week] = sessions_by_week.get(week, 0) + 1
        
        avg_sessions_per_week = sum(sessions_by_week.values()) / max(len(sessions_by_week), 1)
        
        # Communication growth
        comm_growth = {
            'totalSessions': len(comm_sessions),
            'averageScore': sum(s.get('feedback_score', 0) or 0 for s in comm_sessions) / max(len(comm_sessions), 1),
            'growth': 'improving'
        }
        
        # Recommendations
        recommendations = []
        if total_sessions < 5:
            recommendations.append({
                'type': 'engagement',
                'priority': 'high',
                'title': 'Increase Learning Frequency',
                'description': 'Try to complete at least one learning activity daily for better skill development.'
            })

        return {
            'timeframe': time_range,
            'totalSessions': total_sessions,
            'learningVelocity': {
                'rate': round(avg_sessions_per_week * 10) / 10,
                'trend': 'stable'
            },
            'communicationGrowth': comm_growth,
            'recommendations': recommendations
        }

analytics = DashboardAnalytics()

@app.route('/api/dashboard/insights/<int:user_id>', methods=['GET'])
def get_dashboard_insights(user_id):
    """Get comprehensive dashboard insights for a user"""
    try:
        insights = analytics.get_user_dashboard_insights(user_id)
        
        return jsonify({
            'success': True,
            'data': insights,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/dashboard/learning-patterns/<int:user_id>', methods=['GET'])
def get_learning_patterns(user_id):
    """Get learning pattern analysis for a user"""
    try:
        time_range = request.args.get('timeRange', 'month')
        patterns = analytics.get_learning_patterns(user_id, time_range)
        
        return jsonify({
            'success': True,
            'data': patterns,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/dashboard/complete-analysis/<int:user_id>', methods=['GET'])
def get_complete_analysis(user_id):
    """Get complete dashboard analysis"""
    try:
        insights = analytics.get_user_dashboard_insights(user_id)
        patterns = analytics.get_learning_patterns(user_id, 'month')
        
        complete_analysis = {
            'dashboardInsights': insights,
            'learningPatterns': patterns,
            'careerInsights': None,  # Placeholder for future implementation
            'skillProgression': None,  # Placeholder for future implementation
            'achievements': None  # Placeholder for future implementation
        }
        
        return jsonify({
            'success': True,
            'data': complete_analysis,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Simplified Dashboard Analytics API',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8082))
    print(f"🚀 Starting Dashboard Analytics API on port {port}")
    print(f"📊 Health check: http://localhost:{port}/health")
    app.run(debug=True, host='0.0.0.0', port=port)
