import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin user',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    isAdmin: true,
    phone_number: '+91-740-5544632'
  },
  {
    name: 'John Customer',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    phone_number: '+91-740-5544632'
  },
  {
    name: 'Biyani User',
    email: 'biyani@example.com',
    password: bcrypt.hashSync('password123', 10),
    phone_number: '+91-740-5544632'
  },
];

export default users;
