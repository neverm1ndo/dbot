import { model, Schema } from 'mongoose';

const schema =  new Schema ({
  channel: String,
  message: String,
  tags: Schema.Types.Mixed,
  self: Boolean,
  date: Date
});

export const MESSAGE = model('Message', schema);
