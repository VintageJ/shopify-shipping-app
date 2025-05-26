import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["flat", "quantity", "weight"], required: true },
  flatRate: Number,
  baseRate: Number,
  additionalRate: Number,
  ratePerPound: Number,
  handlingFee: Number,
  shippingZone: String
});

export default mongoose.model("Vendor", VendorSchema);
