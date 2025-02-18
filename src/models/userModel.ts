import mongoose , {Schema,Document} from 'mongoose';
import  { User }  from '../types/types'


const UserSchema:Schema<User> = new Schema({
    username: {type: String, required: [true, 'Username is required'],trim: true,unique: true},
    //match matches the email with the regex
    email: {type: String, required: [true, 'Email is required'],unique: true,match: [/\S+@\S+\.\S+/, 'Please enter a valid email']},
    password: {type: String, required: [true, 'Password is required']},
    verifyCode: {type: String, required: [true, 'Verification code is required']},
    isVerified: {type: Boolean, default: false},
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
      required: [true, 'Role is required']
  },
    verifyCodeExpiry: {type: Date, required: [true,"Code Expiry is required"], default: Date.now}
});

const UserModel =  (mongoose.models.User) || mongoose.model<User>('User', UserSchema) ;

export default UserModel;