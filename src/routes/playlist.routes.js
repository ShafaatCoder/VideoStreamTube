import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes below require authentication
router.use(verifyJWT);

// Create a new playlist
router.post("/playlist", createPlaylist);

// Get playlists of a specific user
router.get("/playlist/user/:userId", getUserPlaylists);

// Get a playlist by its ID
router.get("/playlist/:playlistId", getPlaylistById);

// Add video to playlist
router.patch("/playlist/:playlistId/add/:videoId", addVideoToPlaylist);

// Remove video from playlist
router.patch("/playlist/:playlistId/remove/:videoId", removeVideoFromPlaylist);

// Update a playlist (name/description)
router.patch("/playlist/:playlistId", updatePlaylist);

// Delete a playlist
router.delete("/playlist/:playlistId", deletePlaylist);

export default router;
