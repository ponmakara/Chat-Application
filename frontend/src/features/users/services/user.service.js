import api from "../../../lib/api";

export const fetchCurrentUser = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

export const updateCurrentUserRequest = async (payload) => {
  const { data } = await api.put("/users/me", payload);
  return data;
};

export const uploadCurrentUserAvatarRequest = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return data;
};
