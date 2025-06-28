import express from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv'; // Add this line
import playlistRoutes from './routes/playlists.js';
import userRoutes from './routes/users.js';
import './db.js';

dotenv.config(); // Add this line

const app = express();
app.use(cors());
app.use(bodyParser.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://8437-47-35-151-22.ngrok-free.app/callback';

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

app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));