import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5009/api', withCredentials: true });

// Function to retrieve the token from where it's stored (e.g., localStorage)
function getToken() {
  return localStorage.getItem('authToken');
}

API.interceptors.request.use((config) => {
  const token = getToken();
  console.log('Intercepting request, token:', token); // Log to see what's happening
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('No token available');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

function testApiCall() {
  const token = localStorage.getItem('authToken');
  axios.get('http://localhost:5009/api/users/me', {
      headers: {
          'Authorization': `Bearer ${token}`
      }
  })
  .then(response => console.log('API Call Success:', response))
  .catch(error => console.error('API Call Error:', error));
}

export default API;
