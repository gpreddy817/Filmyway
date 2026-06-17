const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Success:', res.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testRegister();
