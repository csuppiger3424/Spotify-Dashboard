# Spotify Dashboard

A full-stack web application that lets you explore your Spotify listening habits, filter your top tracks, and create custom playlists—all powered by the Spotify Web API.

## Features

- **Spotify Login:** Secure OAuth login with your Spotify account.
- **Top Tracks Dashboard:** View your top tracks with filters for artist, time range, explicit content, and more.
- **Custom Playlists:** Instantly create Spotify playlists from your filtered tracks.
- **Playlist & User Storage:** All created playlists and user profiles are saved to a MongoDB database for future reference.
- **Modern UI:** Built with React and Vite for a fast, responsive experience.

## How It Works

1. **Login:**  
   Click "Login to Spotify" to authenticate via Spotify's OAuth flow.

2. **Dashboard:**  
   After login, your top tracks are fetched from Spotify. Use filters to customize your view.

3. **Create Playlist:**  
   Click "Create Playlist" to save the current filtered tracks as a new Spotify playlist. The playlist and your user info are also saved to the backend database.

4. **Backend:**  
   The backend (Node.js/Express) handles Spotify API requests, user and playlist storage, and token management. MongoDB is used for persistent storage.

## Tech Stack

- **Frontend:** React, Vite, Axios, CSS
- **Backend:** Node.js, Express, Axios, dotenv, Mongoose (MongoDB)
- **Database:** MongoDB (local or Atlas)
- **Authentication:** Spotify OAuth 2.0

## Getting Started

1. **Clone the repository**
2. **Install dependencies** in both `backend` and `frontend` folders.
3. **Set up your `.env` file** in the backend with your Spotify API credentials and MongoDB URI.
4. **Start MongoDB** (locally or use Atlas).
5. **Run the backend server:**
