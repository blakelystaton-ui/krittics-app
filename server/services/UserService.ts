/**
 * UserService.ts
 * 
 * Business logic for user management, interests, and crew matching
 */

import type { IStorage } from "../models/IStorage";
import type { User, UpsertUser } from "@shared/schema";

export class UserService {
  constructor(private storage: IStorage) {}

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User | undefined> {
    return await this.storage.getUser(id);
  }

  /**
   * Create or update a user (used by Replit Auth)
   */
  async upsertUser(user: UpsertUser): Promise<User> {
    return await this.storage.upsertUser(user);
  }

  /**
   * Update user's interests (genres they like)
   */
  async updateInterests(userId: string, interests: string[]): Promise<User> {
    return await this.storage.updateUserInterests(userId, interests);
  }

  /**
   * Get user's interests
   */
  async getInterests(userId: string): Promise<string[]> {
    return await this.storage.getUserInterests(userId);
  }

  /**
   * Find crew members with shared interests
   * Returns users ranked by number of shared interests
   */
  async findCrewMatches(userId: string): Promise<(User & { sharedInterests: string[] })[]> {
    return await this.storage.findCrewByInterests(userId);
  }

  /**
   * Search for users by name or email
   */
  async searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
    return await this.storage.searchUsers(query, excludeUserId);
  }

  /**
   * Get user's friends with interaction counts
   */
  async getFriends(userId: string) {
    return await this.storage.getFriendsByUser(userId);
  }

  /**
   * Add a friend connection
   */
  async addFriend(userId: string, friendId: string) {
    return await this.storage.addFriend(userId, friendId);
  }

  /**
   * Track an interaction with a friend (for ranking)
   */
  async trackInteraction(userId: string, friendId: string, interactionType: string) {
    await this.storage.trackInteraction(userId, friendId, interactionType);
  }
}
