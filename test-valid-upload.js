const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testValidUpload() {
    // Create a dummy image file
    const filePath = path.join(__dirname, 'test-image.png');
    // Minimal valid PNG header
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    fs.writeFileSync(filePath, pngBuffer);

    const form = new FormData();
    form.append('email', 'success_upload@homecare.com');
    form.append('password', 'Password123!');
    form.append('firstName', 'Success');
    form.append('lastName', 'Upload');
    form.append('identification', fs.createReadStream(filePath));

    try {
        const res = await axios.post('http://localhost:3010/auth/contractor-signup', form, {
            headers: form.getHeaders(),
        });
        console.log('✅ Upload Success:', res.data);
    } catch (error) {
        console.error('❌ Upload Failed:', error.response ? error.response.data : error.message);
    } finally {
        fs.unlinkSync(filePath);
    }
}

testValidUpload();
