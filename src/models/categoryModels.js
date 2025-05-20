import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image_uri: { type: String, required: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
