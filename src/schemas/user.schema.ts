import { model, Schema, Types } from 'mongoose';

export const USER = model('User', new Schema ({
  user: {
    id: { type: String },
    login: { type: String },
    display_name: { type: String },
    type: { type: String },
    broadcaster_type: { type: String },
    description: { type: String },
    profile_image_url: { type: String },
    offline_image_url: { type: String },
    view_count: { type: Number },
    email: { type: String },
    created_at: { type: String }
  },
  accessToken: String,
  refreshToken: String,
  settings: {
    automessages: [
      {
        interval: { type: Number },
        message: { type: String },
      }
    ],
    banwords: [String],
    announcer_delay: Number,
    sounds: [
      {
        command: { type: String },
        path: { type: String },
        gain: { type: Number }
      }
    ],
    commands: [
      {
        command: { type: String },
        response: { type: String }
      }
    ]
  },
  chat_db: {
    inc: [
      {
        _id: false,
        id: { type: Types.ObjectId },
        counters: [
          {
            nickname: { type: String },
            counter: { type: Number },
          }
        ]
      }
    ]
  },
  moderationUsersAllows: [{
    userId: Number,
    login: String,
    allowedSections: [String]
  }]
}));
