import express from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const CLIENT_ID = 'e0574b8f856b411db7cb33d502b56d31';
const CLIENT_SECRET = '9cb3c0491a7146688f0cf5c73f98f7d0'; // Replace with your Spotify Client Secret
const REDIRECT_URI = 'https://18f0-47-35-151-22.ngrok-free.app/callback';

app.post('/api/token', async (req, res) => {
  const { code } = req.body;
  console.log('Authorization code received:', code); // Log the code

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange code for token', details: error.response?.data || error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));