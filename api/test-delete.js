import axios from 'axios';

const BASE_URL = 'http://localhost:8800/api';

async function testDeleteAppointment() {
  try {
    console.log('Testing DELETE appointment endpoint...');
    
    // Step 1: Login to get a valid token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'amin@utm.my',
      password: '123456' // Assuming this is the password
    }, {
      withCredentials: true
    });
    
    console.log('Login successful:', loginResponse.data);
    
    // Step 2: Try to delete an appointment
    console.log('Step 2: Attempting to delete appointment...');
    const deleteResponse = await axios.delete(`${BASE_URL}/appointments/6860ba9dea26f51cb7c58d4c`, {
      withCredentials: true
    });
    
    console.log('Delete successful:', deleteResponse.status);
    console.log('Response:', deleteResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testDeleteAppointment(); 