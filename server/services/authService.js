const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return { token, user: { id: user.id, email: user.email, role: user.role } };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }
  return user;
};

module.exports = { login, getMe };
