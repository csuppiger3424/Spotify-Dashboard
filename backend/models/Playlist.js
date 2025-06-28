import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  userId: String,
  playlistId: String,
  name: String,
  description: String,
  trackUris: [String],
  filters: Object,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Playlist', playlistSchema);