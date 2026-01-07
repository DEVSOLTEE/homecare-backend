const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testSignup() {
    console.log('Testing Contractor Signup...');
    const form = new FormData();
    form.append('email', `test_contractor_${Date.now()}@example.com`);
    form.append('password', 'Password123!');
    form.append('firstName', 'Test');
    form.append('lastName', 'Contractor');
    form.append('phone', '1234567890');

    // Create a dummy file for identification
    fs.writeFileSync('dummy_id.txt', 'This is a test identification document');
    form.append('identification', fs.createReadStream('dummy_id.txt'));

    try {
        const response = await axios.post('http://localhost:3010/auth/contractor-signup', form, {
            headers: form.getHeaders(),
        });
        console.log('Signup Successful:', response.data);
    } catch (error) {
        console.error('Signup Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    } finally {
        if (fs.existsSync('dummy_id.txt')) {
            fs.unlinkSync('dummy_id.txt');
        }
    }
}

testSignup();
