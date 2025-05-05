import { Schema, Document } from 'mongoose';
import { UserRoles } from '../const/userRoles';

export interface User extends Document {
  id: string;
  email: string;
  passwordHash: string;
  lock: boolean;
  role: UserRoles;
}

export const UserSchema = new Schema<User>(
  {
    _id: { type: String },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    lock: { type: Boolean, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true },
);

UserSchema.virtual('id').get(function (this: User) {
  return this._id;
});

UserSchema.set('toJSON', { virtuals: true });
