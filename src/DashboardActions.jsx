import React from 'react';

export default function DashboardActions({ onLogout, onCreatePlaylist, disabled }) {
  return (
    <div className="dashboard-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
      <button onClick={onLogout}>Logout</button>
      <button onClick={onCreatePlaylist} disabled={disabled}>Create Playlist from Displayed Songs</button>
    </div>
  );
}