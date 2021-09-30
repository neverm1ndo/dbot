import { model, Schema } from 'mongoose';

export const CHATTER = model('Chatter', new Schema ({
    username: String,
    type: String,
    joins_count: Number
}));
