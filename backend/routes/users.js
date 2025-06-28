import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Save or update a user
router.post('/save', async (req, res) => {
  console.log('Received user save request:', req.body);
  try {
    const { spotifyId, displayName, email, refreshToken } = req.body;
    let user = await User.findOneAndUpdate(
      { spotifyId },
      { displayName, email, refreshToken },
      { new: true, upsert: true }
    );
    console.log('User saved/updated:', user);
    res.status(201).json({ message: 'User saved!', user });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save user', details: error.message });
  }
});

// Get refresh token by Spotify ID
router.get('/refresh-token/:spotifyId', async (req, res) => {
  try {
    const user = await User.findOne({ spotifyId: req.params.spotifyId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ refreshToken: user.refreshToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get refresh token', details: error.message });
  }
});

// Get a user by Spotify ID
router.get('/:spotifyId', async (req, res) => {
  try {
    const user = await User.findOne({ spotifyId: req.params.spotifyId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

export default router;