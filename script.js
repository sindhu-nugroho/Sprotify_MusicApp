const CLIENT_ID = '8ddad82cf4254dd7aa6b0bd2a55d839b'; // Spotify Client ID
const REDIRECT_URI = 'http://localhost:5500'; // redirect URI
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const API_BASE_URL = 'https://api.spotify.com/v1';
const SCOPES = ['user-read-private', 'user-read-email'];

// 1: Handle Login
document.getElementById('login-btn').addEventListener('click', () => {
  const authURL = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES.join(
    '%20'
  )}&response_type=token`;
  window.location = authURL;
});

// 2: Extract Token from URL
const getTokenFromUrl = () => {
  const hash = window.location.hash.substring(1);
  const params = {};
  hash.split('&').forEach((item) => {
    const parts = item.split('=');
    params[parts[0]] = decodeURIComponent(parts[1]);
  });
  return params.access_token;
};

const token = getTokenFromUrl();
if (token) {
  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('content').style.display = 'block';
}

// 3: Search Functionality
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search').value;
  fetch(`${API_BASE_URL}/search?q=${query}&type=track&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const results = data.tracks.items;
      const resultsContainer = document.getElementById('results');
      resultsContainer.innerHTML = '';
      results.forEach((track) => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track');
        trackElement.innerHTML = `
          <p><strong>${track.name}</strong> by ${track.artists
          .map((artist) => artist.name)
          .join(', ')}</p>
          <audio controls>
            <source src="${track.preview_url}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        `;
        resultsContainer.appendChild(trackElement);
      });
    })
    .catch((error) => console.error('Error:', error));
});


// recomendation code

// Mood-based Recommendations
document.getElementById('recommend-btn').addEventListener('click', () => {
  const mood = document.getElementById('mood-selector').value;

  // track attributes  mood
  const moodAttributes = {
    happy: { valence: 0.8, energy: 0.7, danceability: 0.8 },
    sad: { valence: 0.2, energy: 0.3, danceability: 0.4 },
    energetic: { valence: 0.6, energy: 0.9, danceability: 0.8 },
    calm: { valence: 0.5, energy: 0.3, danceability: 0.5 },
  };

  const attributes = moodAttributes[mood];

  fetch(
    `${API_BASE_URL}/recommendations?seed_genres=pop&target_valence=${attributes.valence}&target_energy=${attributes.energy}&target_danceability=${attributes.danceability}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const recommendations = data.tracks;
      const recommendationsContainer = document.getElementById('recommendations');
      recommendationsContainer.innerHTML = '';
      recommendations.forEach((track) => {
        const recommendationElement = document.createElement('div');
        recommendationElement.classList.add('recommendation');
        recommendationElement.innerHTML = `
          <p><strong>${track.name}</strong> by ${track.artists
          .map((artist) => artist.name)
          .join(', ')}</p>
          <audio controls>
            <source src="${track.preview_url}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        `;
        recommendationsContainer.appendChild(recommendationElement);
      });
    })
    .catch((error) => console.error('Error:', error));
});
