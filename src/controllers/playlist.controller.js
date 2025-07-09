import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name) throw new ApiError(400, "Playlist name is required");

  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
    videos: [],
  });

  return res.status(201).json(
    new ApiResponse({
      message: "Playlist created successfully",
      data: playlist,
    })
  );
});

// Get playlists for a user
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

  const playlists = await Playlist.find({ owner: userId });
  return res.status(200).json(
    new ApiResponse({
      message: "User playlists fetched",
      data: playlists,
    })
  );
});

// Get playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId).populate("videos");
  if (!playlist) throw new ApiError(404, "Playlist not found");

  return res.status(200).json(
    new ApiResponse({
      message: "Playlist fetched",
      data: playlist,
    })
  );
});

// Add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res.status(200).json(
    new ApiResponse({
      message: "Video added to playlist",
      data: playlist,
    })
  );
});

// Remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId);
  await playlist.save();

  return res.status(200).json(
    new ApiResponse({
      message: "Video removed from playlist",
      data: playlist,
    })
  );
});

// Delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const deleted = await Playlist.findByIdAndDelete(playlistId);
  if (!deleted) throw new ApiError(404, "Playlist not found");

  return res.status(200).json(
    new ApiResponse({
      message: "Playlist deleted",
      data: deleted,
    })
  );
});

// Update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (name) playlist.name = name;
  if (description) playlist.description = description;
  await playlist.save();

  return res.status(200).json(
    new ApiResponse({
      message: "Playlist updated",
      data: playlist,
    })
  );
});

export {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
};
