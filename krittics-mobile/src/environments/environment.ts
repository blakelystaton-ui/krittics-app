// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  adsensePublisherId: 'ca-pub-2630873967811499',
  
  // Firebase config - replace with your actual credentials
  // Note: For production builds, use Angular environment replacement or Capacitor config
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
