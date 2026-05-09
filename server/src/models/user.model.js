import bcrypt from 'bcryptjs';

// In-memory store for demonstration purposes
// In a real app, this would be a database call
const users = [];

export class UserModel {
  static async findByEmail(email) {
    return users.find(u => u.email === email);
  }

  static async create({ email, password, name }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  }

  static async findById(id) {
    return users.find(u => u.id === id);
  }
}
