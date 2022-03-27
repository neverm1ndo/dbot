import { model, Schema } from 'mongoose';

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
    automessages: [String],
    banwords: [String],
    announcer_delay: Number,
    sounds: [
      {
        _id : false,
        command: { type: String },
        path: { type: String },
        gain: { type: Number }
      }
    ],
    commands: [
      {
        name: { type: String },
        response: { type: String }
      }
    ]
  },
  moderationUsersAllows: [{
    userId: Number,
    login: String,
    allowedSections: [String]
  }]
}));
