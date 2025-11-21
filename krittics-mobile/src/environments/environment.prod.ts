export const environment = {
  production: true,
  apiUrl: 'https://www.krittics.com/api',
  adsensePublisherId: 'ca-pub-2630873967811499',
  
  // Firebase config - production credentials
  firebaseConfig: {
    apiKey: 'AIzaSyDLo_cIaCZI3XBsUWx4xGaOjLI3f3M_VQY', // Replace with your Firebase API key
    authDomain: 'krittics-45e1f.firebaseapp.com',
    projectId: 'krittics-45e1f',
    storageBucket: 'krittics-45e1f.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456' // Replace with your Firebase App ID
  },
  
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
