import {
  getUserProfile,
  getUsersForSidebar,
  updateUserProfile,
  updateUserProfileImage
} from "./user.service.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getUsersForSidebar(req.user.id);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load users" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load your profile" });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const payload = {
      username: req.body.username?.trim(),
      display_name: req.body.display_name?.trim(),
      profile_image_url: req.body.profile_image_url?.trim() || "",
      headline: req.body.headline?.trim() || "",
      email: req.body.email?.trim(),
      availability_status: req.body.availability_status,
      profile_visibility: req.body.profile_visibility,
      push_notifications: Boolean(req.body.push_notifications),
      email_digest: Boolean(req.body.email_digest)
    };

    if (!payload.username || !payload.display_name || !payload.email) {
      return res.status(400).json({ message: "Username, display name, and email are required" });
    }

    if (payload.profile_image_url) {
      try {
        const parsed = new URL(payload.profile_image_url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return res.status(400).json({ message: "Profile image URL must use http or https" });
        }
      } catch (error) {
        return res.status(400).json({ message: "Profile image URL is not valid" });
      }
    }

    if (!["available", "away", "offline"].includes(payload.availability_status)) {
      return res.status(400).json({ message: "Invalid availability status" });
    }

    if (!["contacts", "private", "public"].includes(payload.profile_visibility)) {
      return res.status(400).json({ message: "Invalid profile visibility" });
    }

    const user = await updateUserProfile(req.user.id, payload);
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Unable to update your profile" });
  }
};

export const uploadCurrentUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please choose an image to upload" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profileImageUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    const user = await updateUserProfileImage(req.user.id, profileImageUrl);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to upload avatar" });
  }
};
