import {
  ChangeDetectionStrategy,
  Component,
  signal,
  OnInit,
  Injectable,
  inject,
} from '@angular/core';
import { CommonModule, NgClass, CurrencyPipe } from '@angular/common';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  Auth,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';

// --- Start of Gemini Service Definition (Since we must use a single file) ---
// This is a minimal definition to resolve the import error.
export interface TriviaQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  // Placeholder service to satisfy the import requirement
  // Actual API logic would be here.
  constructor() {}
}
// --- End of Gemini Service Definition ---

// FIX: DECLARE GLOBAL VARIABLES FOR TYPESCRIPT COMPILER
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

// Define global variables expected from the environment (or use safe defaults)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== 'undefined' ? __firebase_config : '{}',
);
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgClass, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-gray-900 shadow-md p-4 pt-6">
      <div class="flex flex-wrap justify-between items-center text-white">
        <h1 class="font-extrabold text-xl text-green-400">KRITTICS</h1>

        <!-- Search Icon -->
        <div class="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <svg
            class="w-6 h-6 cursor-pointer text-gray-300 hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>

          <!-- Notification Icon -->
          <svg
            class="w-6 h-6 cursor-pointer text-gray-300 hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.405L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
            ></path>
          </svg>

          <!-- Profile/Sign In Button -->
          <button
            class="text-xs border border-green-400 text-white rounded-full h-8 px-2 sm:px-4 hover:bg-green-400/10 transition duration-150"
          >
            {{ authStatus() === 'Signed In' ? 'Profile' : 'Sign In' }}
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div
        class="flex justify-start space-x-4 sm:space-x-6 px-0 mt-4 text-white text-sm"
      >
        <a
          class="font-bold text-green-400 border-b-2 border-green-400 pb-1 cursor-pointer"
          >Browse</a
        >
        <a class="text-gray-400 hover:text-green-400 pb-1 cursor-pointer"
          >Krossfire</a
        >
        <a class="text-gray-400 hover:text-green-400 pb-1 cursor-pointer"
          >Queue</a
        >
      </div>
    </header>

    <main class="bg-gray-900 text-white min-h-screen relative">
      <!-- Auth Status Display -->
      <div
        class="text-center p-3 text-sm"
        [class.text-green-400]="isAuthReady()"
        [class.text-red-500]="authStatus() === 'Failed'"
      >
        Auth Status: {{ authStatus() }}
        @if (userId()) {
          | User ID: {{ userId() }}
        }
      </div>

      <!-- Hero Section / Movie Poster Placeholder -->
      <div class="relative w-full h-[400px] overflow-hidden">
        <!-- FIX: Completed the unterminated template literal (src attribute) and closed the img tag -->
        <img
          src="https://placehold.co/1080x1600/171717/FFFFFF?text=Krittics+Movie+Poster"
          alt="Movie Poster Placeholder"
          class="w-full h-full object-cover opacity-70"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"
        ></div>
        <div class="absolute bottom-0 left-0 p-6">
          <h2 class="text-4xl font-extrabold mb-1">Dune: Part Two</h2>
          <p class="text-lg text-gray-300">Sci-Fi, Adventure | 2024</p>
          <button
            class="mt-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
          >
            Watch Now
          </button>
        </div>
      </div>

      <!-- Content Section (Example) -->
      <div class="p-6">
        <h3 class="text-2xl font-bold mb-4">Trending Now</h3>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          @for (movie of trendingMovies(); track movie.title) {
            <div
              class="rounded-lg overflow-hidden shadow-lg transform hover:scale-[1.03] transition duration-300 cursor-pointer bg-gray-800"
            >
              <img
                [src]="movie.poster"
                [alt]="movie.title"
                class="w-full h-48 object-cover"
              />
              <div class="p-3">
                <p class="font-semibold text-sm truncate">{{ movie.title }}</p>
                <p class="text-xs text-gray-400">{{ movie.year }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </main>
  `,
})
// FIX: Added 'export' to the AppComponent class definition
export class AppComponent implements OnInit {
  private db!: Firestore;
  private auth!: Auth;
  private geminiService = inject(GeminiService);

  // State Signals
  userId = signal<string | null>(null);
  authStatus = signal<
    'Initializing' | 'Signed In' | 'Anon Signed In' | 'Failed'
  >('Initializing');
  isAuthReady = signal<boolean>(false);

  trendingMovies = signal([
    {
      title: 'The Matrix',
      year: 1999,
      poster: 'https://placehold.co/400x600/374151/FFFFFF?text=Matrix',
    },
    {
      title: 'Inception',
      year: 2010,
      poster: 'https://placehold.co/400x600/374151/FFFFFF?text=Inception',
    },
    {
      title: 'Interstellar',
      year: 2014,
      poster: 'https://placehold.co/400x600/374151/FFFFFF?text=Interstellar',
    },
    {
      title: 'Arrival',
      year: 2016,
      poster: 'https://placehold.co/400x600/374151/FFFFFF?text=Arrival',
    },
    {
      title: 'Blade Runner 2049',
      year: 2017,
      poster: 'https://placehold.co/400x600/374151/FFFFFF?text=Blade+Runner',
    },
  ]);

  ngOnInit(): void {
    if (Object.keys(firebaseConfig).length > 0) {
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
      this.auth = getAuth(app);
      this.initializeAuth();
    } else {
      console.error(
        'Firebase config is missing. App will not function correctly.',
      );
      this.authStatus.set('Failed');
      this.isAuthReady.set(true);
    }
  }

  private async initializeAuth(): Promise<void> {
    try {
      if (initialAuthToken) {
        // Use custom token for authenticated users
        await signInWithCustomToken(this.auth, initialAuthToken);
      } else {
        // Fallback to anonymous sign-in
        await signInAnonymously(this.auth);
      }
    } catch (error) {
      console.error('Firebase Auth failed during initial sign-in:', error);
      this.authStatus.set('Failed');
      this.isAuthReady.set(true);
      return;
    }

    // Set up Auth State Listener
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId.set(user.uid);
        this.authStatus.set(user.isAnonymous ? 'Anon Signed In' : 'Signed In');
        this.isAuthReady.set(true);
        this.loadOrCreateUserData(user);
      } else {
        // Should not happen immediately after sign-in, but handle logouts
        this.userId.set(null);
        this.authStatus.set('Failed');
        this.isAuthReady.set(true);
      }
    });
  }

  // Example function to save/load user data
  private async loadOrCreateUserData(user: User): Promise<void> {
    const userDocRef = doc(
      this.db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'profile',
      'data',
    );

    try {
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // Initialize user data if it doesn't exist
        await setDoc(userDocRef, {
          username: `KritticsUser_${user.uid.substring(0, 8)}`,
          joined: new Date().toISOString(),
          // Initial Krittics-specific data
          kritticsBalance: 0,
        });
        console.log('New user profile created.');
      } else {
        console.log('User profile loaded:', docSnap.data());
      }
    } catch (error) {
      console.error('Error loading or creating user data:', error);
    }
  }
}
