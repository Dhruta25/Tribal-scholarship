import mongoose from 'mongoose';
const counterSchema = new mongoose.Schema({ _id: String, sequence: { type: Number, default: 0 } });
export default mongoose.model('Counter', counterSchema);
