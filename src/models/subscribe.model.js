import mongoose, { Schema, Types } from 'mongoose';

const subscribeSchema = new Schema(
  {
    subscribe: {
      Types: Schema.Types.ObjectId, // One who is subscribing
      ref: 'User',
    },
    channel: {
      Types: Schema.Types.ObjectId, // One who is being subscribed to
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Subscribe = mongoose.model('Subscribe', subscribeSchema);
