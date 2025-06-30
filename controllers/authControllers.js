import  User  from '../models/userModel.js'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail } from '../utils/sendEmail.js';
import { sendWelcomeEmail ,resetPasswordEmail,passwordResetSuccessEmail} from '../utils/EmailTemplate.js';
// import { verificationEmailContent } from '../utils/emailTemplates.js';


export const login = async (req, res) => {
 const {email,password} = req.body;

 try {
    const user = await User.findOne({email});

    if(!user){
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
        throw new Error('Invalid password');
    }

    generateTokenAndSetCookie(res,user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({success:true,message:"logged in successfully",user:{...user._doc,password:null}})
 } catch (error) {
    res.status(200).json({success:false,message:error.message})
 }
}

export const register = async (req, res) => {
    //get input on register
    const { fullName, email, phone, password, role = 'user' } = req.body

    try {
        //check if all fields are inputted
        if (!fullName || !email || !phone || !password) {
            throw new Error("all fields required");
        }

        //check if user is already registered
        const userAlreadyExists = await User.findOne({ email });

        if (userAlreadyExists) {
            throw new Error("user already exists");
        }

        //create user 
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            phone,
            password: hashedPassword,
            role,
            bio: ""
        })

        await user.save();

        //sign jwt and create token to be able to verify user via email
        generateTokenAndSetCookie(res, user._id);
        //send verification email
        await sendEmail({
            to: email,
            subject: 'verification code',
            text: 'verification email',
            html: `${sendWelcomeEmail(fullName,role, process.env.SENDGRID_DEFAULT_FROM,email,password)}`,
        });
        res.status(201).json({ success: true, message: 'user registered successfully', user: { ...user._doc, password: null} });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({success:true,message:'logged out successfully'})
}

export const forgotPassword = async (req,res)=>{
    const {email} = req.body;
  try {
    const user = await User.findOne({email});

    if(!email){
        throw new Error("email is not linked to any account")
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1* 60 *60* 1000;

    user.resetPasswordToken = resetToken;
	user.resetPasswordExpiresAt = resetTokenExpiresAt;

    user.save();

    await sendEmail({
        to: email,
        subject: 'forgot password',
        text: 'reset password link',
        html: `${resetPasswordEmail(email,resetToken)}`,
    });

    res.status(200).json({success:true,message:'reset password sent to your email address'})
  } catch (error) {
    res.status(404).json({success:false,message:error.message})
  }
}

export const resetPassword= async (req,res)=>{
   const {token} = req.params;
   const {password} = req.body;
    try {
        const user = await User.findOne({resetPasswordToken:token,resetPasswordExpiresAt: {$gt: Date.now()}});
        console.log(user)
        if(!user){
            throw new Error("reset link expired")
        }

        const hashedPassword = await bcrypt.hash(password,10);

        user.password = hashedPassword;
        user.resetPasswordExpiresAt = "";
        user.resetPasswordToken = "";
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'password reset success',
            text: 'password reset',
            html: `${passwordResetSuccessEmail(user.email, Date.now())}`,
        });

        res.status(200).json({ success: true, message: 'password reset was successful' })
    } catch (error) {
        res.status(404).json({ success: false, message: error.message })
    }
}

export const getAllNurses = async (req, res) => {
    try {
      // Authorization check - only admins can access
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized: Admin access required' 
        });
      }
  
      // Get all users excluding sensitive fields
      const users = await User.find({role:"nurse"}).select(
        '-password -resetPasswordToken -resetPasswordExpiresAt'
      );
  
      res.status(200).json({ 
        success: true, 
        users 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  };