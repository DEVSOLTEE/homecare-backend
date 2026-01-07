const axios = require('axios');

async function testLogin() {
    console.log('--- API Login Test ---');
    try {
        const response = await axios.post('http://localhost:3010/auth/login', {
            email: 'admin@homecare.com',
            password: 'Password123!'
        });
        console.log('✅ Status: SUCCESS');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Status: FAILED');
        if (error.response) {
            console.error('Status Code:', error.response.status);
            console.error('Error Body:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testLogin();
