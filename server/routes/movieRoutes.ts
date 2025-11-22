/**
 * movieRoutes.ts
 * 
 * API routes for movie operations
 */

import type { Express } from "express";
import { MovieService } from "../services/MovieService";
import type { IStorage } from "../models/IStorage";

export function registerMovieRoutes(app: Express, storage: IStorage) {
  const movieService = new MovieService(storage);

  /**
   * GET /api/movies
   * Get all available movies from the catalog
   */
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await movieService.getAllMovies();
      res.json(movies);
    } catch (error) {
      console.error("[Movies] Error fetching movies:", error);
      res.status(500).json({ error: "Failed to fetch movies" });
    }
  });

  /**
   * GET /api/movies/search
   * Search movies with filters (query, genre, year, rating)
   */
  app.get("/api/movies/search", async (req, res) => {
    try {
      const { q, genre, year, rating } = req.query;
      
      const movies = await movieService.searchMovies({
        query: q as string,
        genre: genre as string,
        year: year ? parseInt(year as string) : undefined,
        rating: rating as string,
      });
      
      res.json(movies);
    } catch (error) {
      console.error("[Movies] Error searching movies:", error);
      res.status(500).json({ error: "Failed to search movies" });
    }
  });

  /**
   * GET /api/movies/:id
   * Get a specific movie by ID
   */
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await movieService.getMovieById(req.params.id);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("[Movies] Error fetching movie:", error);
      res.status(500).json({ error: "Failed to fetch movie" });
    }
  });
}
