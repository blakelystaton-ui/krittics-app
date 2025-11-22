/**
 * MovieService.ts
 * 
 * Business logic for movie operations including search, filtering, and metadata
 */

import type { IStorage } from "../models/IStorage";
import type { Movie } from "@shared/schema";

export interface MovieSearchParams {
  query?: string;
  genre?: string;
  year?: number;
  rating?: string;
}

export class MovieService {
  constructor(private storage: IStorage) {}

  /**
   * Get all movies from the catalog
   */
  async getAllMovies(): Promise<Movie[]> {
    return await this.storage.getAllMovies();
  }

  /**
   * Get a specific movie by ID
   */
  async getMovieById(id: string): Promise<Movie | undefined> {
    return await this.storage.getMovie(id);
  }

  /**
   * Search and filter movies by multiple criteria
   */
  async searchMovies(params: MovieSearchParams): Promise<Movie[]> {
    let movies = await this.storage.getAllMovies();

    // Search by title or description
    if (params.query) {
      const query = params.query.toLowerCase();
      movies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(query) ||
        movie.description?.toLowerCase().includes(query)
      );
    }

    // Filter by genre
    if (params.genre) {
      movies = movies.filter((movie) => movie.genre === params.genre);
    }

    // Filter by year
    if (params.year) {
      movies = movies.filter((movie) => movie.year === params.year);
    }

    // Filter by rating
    if (params.rating) {
      movies = movies.filter((movie) => movie.rating === params.rating);
    }

    return movies;
  }
}
