const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const { role, department, isActive, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, department: true, phone: true, avatar: true,
          birthday: true, joinDate: true, isActive: true, createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, department: true, phone: true, avatar: true,
        birthday: true, joinDate: true, isActive: true, createdAt: true,
        _count: { select: { tasksAssigned: true, timesheets: true } },
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, department, phone, birthday, joinDate } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Password123!', salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'EMPLOYEE',
        department,
        phone,
        birthday: birthday ? new Date(birthday) : null,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, department: true, joinDate: true, isActive: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, department, phone, birthday, role, isActive } = req.body;

    // Only MD/HR can change roles
    const updateData = { firstName, lastName, department, phone };
    if (birthday) updateData.birthday = new Date(birthday);
    if (req.user.role === 'MD' || req.user.role === 'HR_MANAGER') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, department: true, phone: true, birthday: true, isActive: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, birthday } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName, lastName, phone,
        birthday: birthday ? new Date(birthday) : undefined,
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, department: true, phone: true, birthday: true, avatar: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, updateProfile };
