import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  refreshToken: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);