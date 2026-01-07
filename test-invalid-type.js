const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testInvalidFileType() {
    const filePath = path.join(__dirname, 'test.pdf');
    fs.writeFileSync(filePath, 'dummy pdf content');

    const form = new FormData();
    form.append('email', 'fail_type@homecare.com');
    form.append('password', 'Password123!');
    form.append('firstName', 'Fail');
    form.append('lastName', 'Type');
    form.append('identification', fs.createReadStream(filePath));

    try {
        await axios.post('http://localhost:3010/auth/contractor-signup', form, {
            headers: form.getHeaders(),
        });
        console.log('❌ Unexpected Success (Should have failed)');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ Correctly rejected invalid file type with 400');
            console.log('Error message:', error.response.data.message);
        } else {
            console.error('❌ Failed with unexpected error:', error.message);
        }
    } finally {
        fs.unlinkSync(filePath);
    }
}

testInvalidFileType();
