import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { SignupDTO, LoginDTO } from '../dtos/auth.dto';
import { JWT_SECRET } from '../config/index';

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
    // 1. Find user by email
    const user = await userRepository.findByEmail(data.email);
    
    // 2. Verify existence and password match
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    // 3. Generate JWT (using the secret from your .env config)
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 4. Return safe user data to the client
    return { 
      token, 
      user: { 
        id: user._id,
        email: user.email, 
        role: user.role,
        fullName: user.fullName 
      } 
    };
  }
}