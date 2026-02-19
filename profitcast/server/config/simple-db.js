// Simple in-memory database for development
const bcrypt = require('bcryptjs');

const users = [
  {
    id: '1',
    email: 'md@profitcast.com',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjO', // Password123!
    firstName: 'Rajiv',
    lastName: 'Sharma',
    role: 'MD',
    department: 'Executive',
    phone: '+91-9876543210',
    birthday: new Date('1975-03-15'),
    joinDate: new Date('2015-01-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'hr@profitcast.com',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjO', // Password123!
    firstName: 'Priya',
    lastName: 'Mehta',
    role: 'HR_MANAGER',
    department: 'Human Resources',
    phone: '+91-9876543211',
    birthday: new Date('1985-07-22'),
    joinDate: new Date('2018-03-15'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    email: 'teamlead@profitcast.com',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjO', // Password123!
    firstName: 'Anita',
    lastName: 'Singh',
    role: 'TEAM_LEAD',
    department: 'Engineering',
    phone: '+91-9876543213',
    birthday: new Date('1990-04-18'),
    joinDate: new Date('2020-09-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    email: 'employee@profitcast.com',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjO', // Password123!
    firstName: 'Arjun',
    lastName: 'Kumar',
    role: 'EMPLOYEE',
    department: 'Engineering',
    phone: '+91-9876543214',
    birthday: new Date('1995-12-25'),
    joinDate: new Date('2022-01-10'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Hash the passwords
async function hashPasswords() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  users.forEach(user => {
    user.password = hashedPassword;
  });
  return users;
}

module.exports = {
  users,
  hashPasswords
};
