import React from 'react';

export default function FiltersPanel({
  artist,
  setArtist,
  explicit,
  setExplicit,
  timeRange,
  setTimeRange,
  limit,
  setLimit,
  onApplyFilters,
}) {
  return (
    <div className="filters-panel">
      <h2>Filters</h2>
      <div>
        <label>Time Range:</label>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
          <option value="short_term">Last 4 Weeks</option>
          <option value="medium_term">Last 6 Months</option>
          <option value="long_term">All Time</option>
        </select>
      </div>
      <div>
        <label>Show Top (Maximum 50):</label>
        <input
          type="number"
          min={1}
          max={50}
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          placeholder="Number of tracks"
        />
      </div>
      <div>
        <label>Artist:</label>
        <input
          type="text"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          placeholder="Enter artist name"
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={explicit}
            onChange={e => setExplicit(e.target.checked)}
          />
          Show only non-explicit tracks
        </label>
      </div>
      <button type="button" onClick={onApplyFilters}>Apply Filters</button>
    </div>
  );
}