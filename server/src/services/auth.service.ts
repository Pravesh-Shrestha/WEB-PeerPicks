import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await userRepository.create({ ...data, password: hashedPassword });
  }

  async login(data: any) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '1d' }
    );
    return { token, user: { email: user.email, role: user.role } };
  }
}