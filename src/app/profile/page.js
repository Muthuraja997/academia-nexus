'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfilePage = () => {
    const { user, updateUser, getAuthHeaders } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        university: '',
        major: '',
        year_of_study: '',
        education_level: '',
        graduation_year: '',
        phone: '',
        date_of_birth: '',
        nationality: '',
        gpa: '',
        bio: '',
        interests: '',
        achievements: '',
        skills: '',
        career_goals: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: ''
    });
    const [preferences, setPreferences] = useState({
        theme: 'system',
        notifications: {
            email: true,
            push: true,
            scholarships: true,
            reminders: true
        },
        privacy: {
            profileVisibility: 'private',
            shareProgress: true,
            analyticsOptOut: false
        },
        dashboard: {
            showWelcomeMessage: true,
            showQuickActions: true,
            showRecentActivity: true
        }
    });
    const [savedScholarshipSearches, setSavedScholarshipSearches] = useState([]);

    useEffect(() => {
        if (user) {
            // Load existing profile data
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                university: user.university || '',
                major: user.major || '',
                year_of_study: user.year_of_study || '',
                education_level: user.education_level || '',
                graduation_year: user.graduation_year || '',
                phone: user.phone || '',
                date_of_birth: user.date_of_birth || '',
                nationality: user.nationality || '',
                gpa: user.gpa || '',
                bio: user.bio || '',
                interests: user.interests || '',
                achievements: user.achievements || '',
                skills: user.skills || '',
                career_goals: user.career_goals || '',
                linkedin_url: user.linkedin_url || '',
                github_url: user.github_url || '',
                portfolio_url: user.portfolio_url || ''
            });
            
            // Load preferences
            loadPreferences();
            
            // Load saved scholarship searches
            loadSavedScholarshipSearches();
        }
    }, [user]);

    const loadPreferences = async () => {
        try {
            const response = await fetch('/api/user/preferences', {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            const result = await response.json();
            
            if (result.success) {
                setPreferences(result.preferences);
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    };

    const loadSavedScholarshipSearches = () => {
        try {
            const saved = localStorage.getItem(`scholarshipSearches_${user.id}`);
            if (saved) {
                setSavedScholarshipSearches(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load saved scholarship searches:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const endpoint = activeTab === 'profile' ? '/api/user/profile' : '/api/user/preferences';
            const data = activeTab === 'profile' ? profileData : preferences;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                setMessage(`${activeTab === 'profile' ? 'Profile' : 'Preferences'} updated successfully!`);
                setIsEditing(false);
                // Update the user context if profile was updated
                if (activeTab === 'profile' && updateUser) {
                    updateUser(result.profile);
                }
            } else {
                setMessage(result.error || `Failed to update ${activeTab}`);
            }
        } catch (error) {
            console.error(`${activeTab} update error:`, error);
            setMessage(`Failed to update ${activeTab}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferenceChange = (category, key, value) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const deleteScholarshipSearch = (searchId) => {
        const updatedSearches = savedScholarshipSearches.filter(search => search.id !== searchId);
        setSavedScholarshipSearches(updatedSearches);
        localStorage.setItem(`scholarshipSearches_${user.id}`, JSON.stringify(updatedSearches));
    };

    const clearAllScholarshipSearches = () => {
        setSavedScholarshipSearches([]);
        localStorage.removeItem(`scholarshipSearches_${user.id}`);
    };

    const InputField = ({ label, name, type = 'text', placeholder, required = false, options = null, textarea = false }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {textarea ? (
                <textarea
                    name={name}
                    value={profileData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                />
            ) : options ? (
                <select
                    name={name}
                    value={profileData[name]}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                >
                    <option value="">Select {label}</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={profileData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                />
            )}
        </div>
    );

    const educationLevels = [
        { value: 'high_school', label: 'High School' },
        { value: 'undergraduate', label: 'Undergraduate' },
        { value: 'graduate', label: 'Graduate' },
        { value: 'phd', label: 'PhD' }
    ];

    const yearOptions = Array.from({ length: 11 }, (_, i) => ({
        value: (2020 + i).toString(),
        label: (2020 + i).toString()
    }));

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please log in to view your profile</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                My Profile
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage your personal information and preferences
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            {!isEditing ? (
                                <Button 
                                    onClick={() => setIsEditing(true)}
                                    variant="primary"
                                >
                                    Edit {activeTab === 'profile' ? 'Profile' : 'Preferences'}
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setMessage('');
                                        }}
                                        variant="secondary"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleSubmit}
                                        variant="primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => {
                                    setActiveTab('profile');
                                    setIsEditing(false);
                                    setMessage('');
                                }}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'profile'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Personal Information
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('preferences');
                                    setIsEditing(false);
                                    setMessage('');
                                }}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'preferences'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Preferences & Settings
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.includes('success') 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Content */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {activeTab === 'profile' ? (
                        <>
                            {/* Personal Information */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            label="First Name"
                                            name="first_name"
                                            placeholder="Enter your first name"
                                            required
                                        />
                                        <InputField
                                            label="Last Name"
                                            name="last_name"
                                            placeholder="Enter your last name"
                                            required
                                        />
                                        <InputField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            required
                                        />
                                        <InputField
                                            label="Phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="Enter your phone number"
                                        />
                                        <InputField
                                            label="Date of Birth"
                                            name="date_of_birth"
                                            type="date"
                                        />
                                        <InputField
                                            label="Nationality"
                                            name="nationality"
                                            placeholder="Enter your nationality"
                                        />
                                    </div>
                                    <div className="mt-6">
                                        <InputField
                                            label="Bio"
                                            name="bio"
                                            placeholder="Tell us about yourself..."
                                            textarea
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Academic Information */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Academic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            label="University/School"
                                            name="university"
                                            placeholder="Enter your institution"
                                        />
                                        <InputField
                                            label="Major/Field of Study"
                                            name="major"
                                            placeholder="Enter your major"
                                        />
                                        <InputField
                                            label="Education Level"
                                            name="education_level"
                                            options={educationLevels}
                                        />
                                        <InputField
                                            label="Year of Study"
                                            name="year_of_study"
                                            placeholder="e.g., Freshman, Sophomore, Junior, Senior"
                                        />
                                        <InputField
                                            label="Graduation Year"
                                            name="graduation_year"
                                            options={yearOptions}
                                        />
                                        <InputField
                                            label="GPA"
                                            name="gpa"
                                            type="number"
                                            placeholder="Enter your GPA (0.0 - 4.0)"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Skills & Interests */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Skills & Interests
                                    </h2>
                                    <div className="space-y-6">
                                        <InputField
                                            label="Skills"
                                            name="skills"
                                            placeholder="e.g., Python, JavaScript, Data Analysis, Project Management..."
                                            textarea
                                        />
                                        <InputField
                                            label="Interests"
                                            name="interests"
                                            placeholder="e.g., Machine Learning, Web Development, Finance, Healthcare..."
                                            textarea
                                        />
                                        <InputField
                                            label="Achievements"
                                            name="achievements"
                                            placeholder="Academic awards, certifications, competitions, etc."
                                            textarea
                                        />
                                        <InputField
                                            label="Career Goals"
                                            name="career_goals"
                                            placeholder="Describe your career aspirations and goals..."
                                            textarea
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Social Links */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Professional Links
                                    </h2>
                                    <div className="space-y-6">
                                        <InputField
                                            label="LinkedIn URL"
                                            name="linkedin_url"
                                            type="url"
                                            placeholder="https://www.linkedin.com/in/your-profile"
                                        />
                                        <InputField
                                            label="GitHub URL"
                                            name="github_url"
                                            type="url"
                                            placeholder="https://github.com/your-username"
                                        />
                                        <InputField
                                            label="Portfolio URL"
                                            name="portfolio_url"
                                            type="url"
                                            placeholder="https://your-portfolio.com"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Theme Settings */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Appearance
                                    </h2>
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Theme Preference
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['light', 'dark', 'system'].map(theme => (
                                                <button
                                                    key={theme}
                                                    type="button"
                                                    disabled={!isEditing}
                                                    onClick={() => handlePreferenceChange('theme', null, theme)}
                                                    className={`p-4 border rounded-lg text-center capitalize transition-colors ${
                                                        preferences.theme === theme
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Notification Settings */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Notifications
                                    </h2>
                                    <div className="space-y-6">
                                        {Object.entries({
                                            email: 'Email Notifications',
                                            push: 'Push Notifications',
                                            scholarships: 'Scholarship Updates',
                                            reminders: 'Study Reminders'
                                        }).map(([key, label]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {label}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {key === 'email' && 'Receive updates via email'}
                                                        {key === 'push' && 'Browser push notifications'}
                                                        {key === 'scholarships' && 'New scholarship opportunities'}
                                                        {key === 'reminders' && 'Study session reminders'}
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        disabled={!isEditing}
                                                        checked={preferences.notifications[key]}
                                                        onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Privacy Settings */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Privacy & Security
                                    </h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Profile Visibility
                                            </label>
                                            <select
                                                disabled={!isEditing}
                                                value={preferences.privacy.profileVisibility}
                                                onChange={(e) => handlePreferenceChange('privacy', 'profileVisibility', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                                            >
                                                <option value="private">Private</option>
                                                <option value="friends">Friends Only</option>
                                                <option value="public">Public</option>
                                            </select>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Share Progress
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Allow others to see your achievements and progress
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    disabled={!isEditing}
                                                    checked={preferences.privacy.shareProgress}
                                                    onChange={(e) => handlePreferenceChange('privacy', 'shareProgress', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Analytics Opt-out
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Disable usage analytics and tracking
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    disabled={!isEditing}
                                                    checked={preferences.privacy.analyticsOptOut}
                                                    onChange={(e) => handlePreferenceChange('privacy', 'analyticsOptOut', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Dashboard Settings */}
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Dashboard Preferences
                                    </h2>
                                    <div className="space-y-6">
                                        {Object.entries({
                                            showWelcomeMessage: 'Show Welcome Message',
                                            showQuickActions: 'Show Quick Actions',
                                            showRecentActivity: 'Show Recent Activity'
                                        }).map(([key, label]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {label}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {key === 'showWelcomeMessage' && 'Display personalized welcome messages'}
                                                        {key === 'showQuickActions' && 'Show quick action buttons on dashboard'}
                                                        {key === 'showRecentActivity' && 'Display your recent activity feed'}
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        disabled={!isEditing}
                                                        checked={preferences.dashboard[key]}
                                                        onChange={(e) => handlePreferenceChange('dashboard', key, e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* Save Button for Mobile */}
                    {isEditing && (
                        <div className="md:hidden">
                            <Button 
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
