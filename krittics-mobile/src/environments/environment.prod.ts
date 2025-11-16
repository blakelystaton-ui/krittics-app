export const environment = {
  production: true,
  apiUrl: 'https://your-published-app.repl.co/api',
  adsensePublisherId: 'ca-pub-2630873967811499',
  
  // Movie genres - matches web app for unified experience
  movieGenres: [
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Sci-Fi',
    'Romance',
    'Documentary',
    'Animation',
    'Thriller',
    'Family'
  ] as const
};
