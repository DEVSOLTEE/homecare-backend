const axios = require('axios');
const FormData = require('form-data');

async function testMissingFile() {
    const form = new FormData();
    form.append('email', 'fail_missing_file@homecare.com');
    form.append('password', 'Password123!');
    form.append('firstName', 'Fail');
    form.append('lastName', 'Missing');

    try {
        await axios.post('http://localhost:3010/auth/contractor-signup', form, {
            headers: form.getHeaders(),
        });
        console.log('❌ Unexpected Success (Should have failed)');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ Correctly rejected missing file with 400');
            console.log('Error message:', error.response.data.message);
        } else {
            console.error('❌ Failed with unexpected error:', error.message);
        }
    }
}

testMissingFile();
