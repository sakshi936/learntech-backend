import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '../helpers/sendVerificationMail';
import { Request } from 'express';
import  UserModel  from '../models/userModel';



export const register = async (req:Request, res:any) => {
   try {
      const { username, email, password, role } = req.body;
      // Check for existing verified user with same username
      const existingUserVerifiedByUsername = await UserModel.findOne({ 
          username, 
          isVerified: true 
      });

      if (existingUserVerifiedByUsername) {
          return res.status(400).json({
              success: false,
              message: "Username already exists"
          });
      }

      const existingUserByEmail = await UserModel.findOne({ email });
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      if (existingUserByEmail) {
          if (existingUserByEmail.isVerified) {
              return res.status(400).json({
                  success: false,
                  message: "Email already exists"
              });
          } else {
              const hashedPassword = await bcrypt.hash(password, 10);
              existingUserByEmail.password = hashedPassword;
              existingUserByEmail.verifyCode = verifyCode;
              existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
              await existingUserByEmail.save();
          }
      } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 1);

          const newUser = new UserModel({
              username,
              email,
              password: hashedPassword,
              verifyCode,
              isVerified: false,
              role,
              verifyCodeExpiry: expiryDate,
          });
          await newUser.save();
      }

      const emailResponse = await sendVerificationEmail(email, username, verifyCode);
      if (!emailResponse.success) {
          return res.status(500).json({
              success: false,
              message: emailResponse.message
          });
      }

      return res.status(201).json({
          success: true,
          message: "User registered successfully, Please verify your email to login"
      });

  } catch (error) {
      console.error('Error registering user', error);
      return res.status(500).json({
          success: false,
          message: "Error registering user"
      });
  }
}