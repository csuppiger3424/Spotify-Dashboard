import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const CLIENT_ID = 'e0574b8f856b411db7cb33d502b56d31';
const REDIRECT_URI = 'https://18f0-47-35-151-22.ngrok-free.app/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'code';

function App() {
  const [token, setToken] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [timeRange, setTimeRange] = useState('medium_term'); // Default time range

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');
    console.log('Code from URL:', code);

    if (code && !token) {
      console.log('Exchanging code for token...');
      axios
        .post('http://localhost:5000/api/token', { code })
        .then((response) => {
          console.log('Token response:', response.data);
          const { access_token } = response.data;
          setToken(access_token);
          localStorage.setItem('token', access_token);
        })
        .catch((error) => console.error('Error exchanging code for token:', error));
    }
  }, [token]);

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  const fetchTopTracks = async () => {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTopTracks(response.data.items);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Dashboard</h1>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-top-read`}
          >
            Login to Spotify
          </a>
        ) : (
          <div>
            <button onClick={logout}>Logout</button>
            <div>
              <label htmlFor="timeRange">Select Time Range: </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="short_term">Last 4 Weeks</option>
                <option value="medium_term">Last 6 Months</option>
                <option value="long_term">All Time</option>
              </select>
              <button onClick={fetchTopTracks}>Get Top Tracks</button>
            </div>
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
                    <tr key={track.id}>
                      <td>{index + 1}</td>
                      <td>{track.name}</td>
                      <td>{track.artists.map((artist) => artist.name).join(', ')}</td>
                      <td>{track.album.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
