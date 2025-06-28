import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import FiltersPanel from './FiltersPanel';
import DashboardActions from './DashboardActions';

const CLIENT_ID = 'e0574b8f856b411db7cb33d502b56d31';
const REDIRECT_URI = 'https://8437-47-35-151-22.ngrok-free.app/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'code';
const SCOPE = 'user-top-read playlist-modify-private playlist-modify-public';

function App() {
  const [token, setToken] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [explicit, setExplicit] = useState(false);
  const [limit, setLimit] = useState(50);
  const [filtersChanged, setFiltersChanged] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');
    if (code && !token) {
      axios
        .post('http://localhost:5000/api/token', { code })
        .then((response) => {
          const { access_token } = response.data;
          setToken(access_token);
          localStorage.setItem('token', access_token);
        })
        .catch((error) => console.error('Error exchanging code for token:', error));
    }
  }, [token]);

  // Only fetch tracks on initial load or login, not on filter change
  useEffect(() => {
    if (token && !filtersChanged) {
      fetchTopTracks();
    }
    // eslint-disable-next-line
  }, [token]);

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  const fetchTopTracks = async () => {
    try {
      console.log('Fetching top tracks with:', { timeRange, limit, artist, explicit });
      const response = await axios.get(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let tracks = response.data.items;
      console.log('Fetched tracks:', tracks);

      // Filter by artist if specified
      let filteredTracks = tracks;
      if (artist) {
        filteredTracks = tracks.filter(track =>
          track.artists.some(a =>
            a.name.toLowerCase().includes(artist.toLowerCase())
          )
        );
      }

      if (explicit) {
        filteredTracks = filteredTracks.filter(track => track.explicit === false);
      }

      // If not enough tracks, optionally fetch more from the artist's top tracks
      if (artist && filteredTracks.length < limit) {
        // 1. Search for the artist to get their Spotify ID
        const searchRes = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const artistId = searchRes.data.artists.items[0]?.id;
        if (artistId) {
          // 2. Fetch the artist's top tracks
          const artistTopRes = await axios.get(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // 3. Filter out tracks already in filteredTracks
          const existingIds = new Set(filteredTracks.map(t => t.id));
          const additionalTracks = artistTopRes.data.tracks.filter(t => !existingIds.has(t.id));
          // 4. Add enough tracks to reach the limit
          filteredTracks = [
            ...filteredTracks,
            ...additionalTracks.slice(0, limit - filteredTracks.length)
          ];
        }
      }

      filteredTracks = filteredTracks.slice(0, limit);
      setTopTracks(filteredTracks);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  // In each filter setter, set filtersChanged to true
  const handleArtistChange = (value) => { setArtist(value); setFiltersChanged(true); };
  const handleExplicitChange = (value) => { setExplicit(value); setFiltersChanged(true); };
  const handleTimeRangeChange = (value) => { setTimeRange(value); setFiltersChanged(true); };
  const handleLimitChange = (value) => { setLimit(value); setFiltersChanged(true); };

  // Only call fetchTopTracks when Apply Filters is clicked
  const handleApplyFilters = () => {
    fetchTopTracks();
    setFiltersChanged(false);
  };

  const handleCreatePlaylist = async () => {
    try {
      // Prompt user for playlist title
      const title = window.prompt('Enter a title for your new playlist:', 'My Spotify Dashboard Playlist');
      if (!title) return;

      // Build a description from filters
      const desc = `Top songs${artist ? ` by "${artist}"` : ''}${explicit ? ', non-explicit only' : ''} (${timeRange.replace('_', ' ')}, limit: ${limit})`;

      // 1. Get current user's ID
      const userRes = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = userRes.data.id;

      // 2. Create a new playlist
      const playlistRes = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: title,
          description: desc,
          public: false,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const playlistId = playlistRes.data.id;

      // 3. Add tracks to the playlist
      const uris = topTracks.map(track => track.uri);
      if (uris.length === 0) {
        alert('No tracks to add!');
        return;
      }
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // New code to save playlist details to the server
      await axios.post('http://localhost:5000/api/playlists/save', {
        userId: userId,
        playlistId: playlistId,
        name: title,
        description: desc,
        trackUris: uris,
        filters: { artist, explicit, timeRange, limit }
      });

      alert('Playlist created!');
    } catch (error) {
      alert('Failed to create playlist');
      console.error(error);
    }
  };

  // New code to save or update user details on login
  useEffect(() => {
    const saveUserDetails = async () => {
      if (!token) return;

      try {
        // 1. Get current user's details
        const userRes = await axios.get('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { id: userId, display_name: displayName, email } = userRes.data;

        // 2. Get the refresh token from the server (if available)
        const refreshTokenRes = await axios.get(`http://localhost:5000/api/users/refresh-token/${userId}`);
        const refreshToken = refreshTokenRes.data.refreshToken;

        console.log('Preparing to save user:', {
          spotifyId: userId,
          displayName: displayName,
          email: email,
          refreshToken: refreshToken
        });

        const saveRes = await axios.post('http://localhost:5000/api/users/save', {
          spotifyId: userId,
          displayName: displayName,
          email: email,
          refreshToken: refreshToken
        });

        console.log('User save response:', saveRes.data);

        console.log('User details saved/updated successfully');
      } catch (error) {
        console.error('Error saving user details:', error);
      }
    };

    saveUserDetails();
  }, [token]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Dashboard</h1>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
          >
            Login to Spotify
          </a>
        ) : (
          <div className="dashboard-layout">
            <div>
              <FiltersPanel
                timeRange={timeRange}
                setTimeRange={handleTimeRangeChange}
                limit={limit}
                setLimit={handleLimitChange}
                artist={artist}
                setArtist={handleArtistChange}
                explicit={explicit}
                setExplicit={handleExplicitChange}
                onApplyFilters={handleApplyFilters}
              />
              <DashboardActions
                onLogout={logout}
                onCreatePlaylist={handleCreatePlaylist}
                disabled={topTracks.length === 0}
              />
            </div>
            <main className="dashboard-main">
              {topTracks.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Track Name</th>
                      <th>Artist(s)</th>
                      <th>Album</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTracks.map((track, index) => (
                      <tr
                        key={track.id}
                        className="fade-in-row"
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <td>{index + 1}</td>
                        <td>{track.name}</td>
                        <td>{track.artists.map((artist) => artist.name).join(', ')}</td>
                        <td>{track.album.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </main>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
