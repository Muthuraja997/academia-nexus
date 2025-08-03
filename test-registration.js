// Test registration endpoint
const testRegistration = async () => {
    const timestamp = Date.now();
    const testUser = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: "password123",
        confirmPassword: "password123",
        fullName: "Test User",
        phone: "1234567890",
        university: "Test University",
        major: "Computer Science",
        graduationYear: 2025
    };

    console.log('🧪 Testing registration endpoint...');
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        const result = await response.json();
        
        console.log(`📊 Status: ${response.status}`);
        console.log('📝 Response:', result);
        
        if (response.ok) {
            console.log('✅ Registration test passed!');
        } else {
            console.log('❌ Registration test failed:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

testRegistration();
