import mongoose from "mongoose";
import { asynchandler } from "../utils/asynhandler.js";   
import  apiError  from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";
import Apirsponse from "../utils/apiresponse.js";
import jwt from "jsonwebtoken"; 

const createPlaylist = asynchandler(async (req, res) => {
    const {name, description} = req.body
    const userid = req.user._id;
    // Step 1: Validate input
  if (!name || name.trim() === "") {
    throw new apiError(400, "Playlist name is required");
  }
  try {
    // create new playlist
    const playlist = await Playlist.create({
        name,
        description:description || "",
        owner:userid
    })
   res.status(201).json(
      new Apirsponse(201, playlist, "Playlist created successfully")
    )

  } catch (error) {
    throw new apiError(500, "Failed to create Playlist");
  }
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const {userid} = req.params
    // Step 1: Validate userId
    if (!userid || !mongoose.Types.ObjectId.isValid(userid)) {
      throw new apiError(400, "Invalid or missing user ID");
    }
    try {
        // fetch all playlist of user
        const playlists = await Playlist
        .find({owner:userid})
        .sort({createdAt:-1})
        .select("-__v")
        
        // Step 3: Optional - handle no playlist found
        if (playlists.length === 0) {
        return res.status(200).json(
            new Apirsponse(200, { total: 0, playlists: [] }, "No playlists found")
        )
        
  }
        // Step 4: Return playlists
        return res.status(200).json(
        new Apirsponse(200, { total: playlists.length, playlists }, "Playlists fetched successfully")
        )
    } catch (error) {
        throw new apiError(500, "Failed to fetch playlists", error?.message)
    }
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    // Step 1: Validate ID
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
     throw new apiError(400, "Invalid or missing playlist ID");
    }

    try {
        // Step 2: Find playlist and populate videos and owner
        const playlist = await Playlist.findById(playlistId)
        .populate({
        path: "videos",
        populate: {
        path: "owner",
        select: "name avatar", // Show who uploaded each video
        },
        })
        .populate({
        path: "owner",
        select: "name avatar", // Playlist creator
        })
        .select("-__v")

        // Step 3: Check if not found
        if (!playlist) {
         throw new apiError(404, "Playlist not found");
        }

        // Step 4: Respond with playlist
    res.status(200).json(
        new Apirsponse(200, playlist, "Playlist fetched successfully")
);
    } catch (error) {
        throw new apiError(500, "Failed to fetch playlist", error?.message);
    }
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const userId = req.user._id;
    // Step 1: Validate IDs
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
         throw new apiError(400, "Invalid or missing playlist ID");
    }
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
         throw new apiError(400, "Invalid or missing video ID");
    }

     // Step 2: Find playlist and verify ownership
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
     }
    if (playlist.owner.toString() !== userId.toString()) {
        throw new apiError(403, "You are not authorized to modify this playlist");
    }

    // Step 3: Check if video already in playlist
    if (playlist.videos.includes(videoId)) {
        return res.status(200).json(
             new Apirsponse(200, playlist, "Video already exists in the playlist")
    )
    }

        // Step 4: Add video to playlist
        playlist.videos.push(videoId);
        await playlist.save();

        // Step 5: Send response
        res.status(200).json(
        new Apirsponse(200, playlist, "Video added to playlist successfully")
        )
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const userId = req.user._id;

    // Step 1: Validate IDs
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError(400, "Invalid or missing playlist ID");
    }
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "Invalid or missing video ID");
    }

    // Step 2: Find playlist and check ownership
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
    throw new apiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== userId.toString()) {
    throw new apiError(403, "You are not authorized to modify this playlist");
    }

    // Step 3: Remove video from playlist
    const initialLength = playlist.videos.length;
    playlist.videos = playlist.videos.filter(
    (id) => id.toString() !== videoId.toString()
    )

    // Optional: check if video was not in the list
    if (playlist.videos.length === initialLength) {
    return res.status(200).json(
    new Apirsponse(200, playlist, "Video not found in playlist")
    )
    }

    await playlist.save();

    // Step 4: Send response
    return res.status(200).json(
    new Apirsponse(200, playlist, "Video removed from playlist successfully")
    )
})

const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.user._id;

    // Step 1: Validate
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError(400, "Invalid or missing playlist ID");
    }

    // Step 2: Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
    throw new apiError(404, "Playlist not found");
    }

    // Step 3: Check ownership
    if (playlist.owner.toString() !== userId.toString()) {
    throw new apiError(403, "You are not authorized to delete this playlist");
    }

    // Step 4: Delete playlist----
    await playlist.deleteOne();

    // Step 5: Respond
    return res.status(200).json(
    new Apirsponse(200, {}, "Playlist deleted successfully")
    );   
})

const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    // Step 1: Validate
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError(400, "Invalid or missing playlist ID");
    }
    if (!name || name.trim() === "") {
    throw new apiError(400, "Playlist name is required");
    }

    // Step 2: Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
    throw new apiError(404, "Playlist not found");
    }

    // Step 3: Check ownership
    if (playlist.owner.toString() !== userId.toString()) {
    throw new apiError(403, "You are not authorized to update this playlist");
    }  


    // Step 4: Update fields---
    playlist.name = name;
    playlist.description = description || playlist.description;
    await playlist.save();

    // Step 5: Respond
    return res.status(200).json(
    new Apirsponse(200, playlist, "Playlist updated successfully")
    );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}


/*🛠 Optional Improvements You Can Add Later:

Add isPublic or isPrivate field to playlist

Return total video count: playlist.videos.length

Add createdAt and updatedAt in the response if useful

Allow filter: /api/playlist/:id?videosOnly=true etc. */