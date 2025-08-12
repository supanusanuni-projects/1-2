import mongoose from "mongoose";

const userShema = new mongoose.Schema({
  user_credentials : { type: String, required: true },
  password: { type: String },
  name: { type: String, required: true },
  favourites: {
    type: [],
    default: [],
  },
  location: {
    type: String,
  },
  phone: {
    type: String,
  },
});

export const UserDB = mongoose.models.User || mongoose.model("User", userShema);
