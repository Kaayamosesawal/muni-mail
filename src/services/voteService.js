import { auth } from "../config/firebase"; // Your frontend firebase config

/**
 * BASE_URL: Points to Render in production or Localhost in development.
 * Note: If your .env has the /api/v1 prefix, remove it from API_URL to avoid double-pathing.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";
const API_URL = BASE_URL.endsWith('/api/v1') ? BASE_URL : `${BASE_URL}/api/v1`;

/**
 * castVote: Sends a secure ballot to the Render API
 * @param {Object} voteData - { electionId, candidateId, clubId }
 */
export const castVote = async (voteData) => {
  try {
    // 1. AUTHENTICATION CHECK
    // Ensure we have a user session before even attempting a network call
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User session not found. Please log in to vote.");
    }

    /**
     * 2. SECURITY TOKEN RETRIEVAL
     * We force a fresh token to ensure the backend receives the latest 
     * custom claims/roles assigned to the user.
     */
    const token = await user.getIdToken(true);

    // 3. SECURE POST REQUEST
    const response = await fetch(`${API_URL}/vote/cast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(voteData),
    });

    // 4. RESPONSE HANDLING
    const data = await response.json();

    if (!response.ok) {
      // Passes the specific error message from your errorHandler.js (e.g., "ALREADY_VOTED")
      throw new Error(data.message || "An unexpected error occurred while casting your vote.");
    }

    return data; // { success: true, message: "..." }

  } catch (error) {
    console.error("--- [VOTE_SERVICE_ERROR] ---", error.message);
    throw error; // Re-throw to be handled by your UI (e.g., showing a Toast or Alert)
  }
};