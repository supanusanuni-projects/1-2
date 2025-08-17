import mongoose, { Schema } from "mongoose";

const selling_Item = new Schema({
  iName: {
    type: String,
    required: true,
  },
  user_credentials: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  image: {
    required: true,
    type: String,
  },
});

export const selling_ItemDB =
  mongoose.models.item || mongoose.model("item", selling_Item);
