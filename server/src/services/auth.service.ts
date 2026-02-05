import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { SignupDTO, LoginDTO, UpdateUserDTO } from '../dtos/auth.dto';
import { JWT_SECRET } from '../config/index';
import { HttpError } from '../errors/http-error';
import { sendEmail } from '../config/email';
const CLIENT_URL = process.env.CLIENT_URL as string || 'http://localhost:3004';
const userRepository = new UserRepository();

export class AuthService {
  async register(data: SignupDTO) {
    // 1. Check for existing user
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new Error('User already exists');

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // 3. Destructure to remove fields that shouldn't be in the DB
    // If your SignupDTO includes 'confirmPassword', destructure it out here:
    const { ...userData } = data;
    
    // 4. Create the user in MongoDB
    const userDataToCreate = {
      ...userData,
      password: hashedPassword,
      profilePicture: userData.profilePicture || undefined
    };
    return await userRepository.create(userDataToCreate);
  } 

async login(data: LoginDTO) {
  const user = await userRepository.findByEmail(data.email);
  
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: '30d' }
  );

  return { 
    token, 
    user: { 
      id: user._id,
      email: user.email, 
      role: user.role,
      fullName: user.fullName,
      dob: user.dob,
      profilePicture: user.profilePicture 
    } 
  };
}

  async getUserById(userId: string) {
    if (!userId) throw new Error('User ID is required');
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error('User not found');
    return {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      // ADD THESE FIELDS:
      dob: user.dob,
      profilePicture: user.profilePicture
    };
  }

  async getUserByEmail(email: string) {
    if (!email) throw new Error('Email is required');
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('User not found');
    return {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      // ADD THESE FIELDS:
      dob: user.dob,
      profilePicture: user.profilePicture
    };
  }
  async updateUser(userId: string, data: UpdateUserDTO){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailExists = await userRepository.findByEmail(data.email!);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(data.password){
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, data);
        return updatedUser;
    }
  async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
       const resetLink = `${CLIENT_URL}/reset-password/${token}`;      
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;

    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userRepository.updateUser(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
    }

}

