import express from 'express';
import Playlist from '../models/Playlist.js';

const router = express.Router();

router.post('/save', async (req, res) => {
  try {
    const playlist = new Playlist(req.body);
    await playlist.save();
    res.status(201).json({ message: 'Playlist saved!', playlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save playlist', details: error.message });
  }
});

export default router;