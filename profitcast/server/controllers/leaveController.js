const prisma = require('../config/prisma');

const getLeaves = async (req, res) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;

    if (req.user.role === 'EMPLOYEE') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true, department: true } },
          approver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.leave.count({ where }),
    ]);

    res.json({ leaves, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    const leave = await prisma.leave.create({
      data: {
        userId: req.user.id,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notify HR and Managers
    const hrManagers = await prisma.user.findMany({
      where: { role: { in: ['HR_MANAGER', 'MD'] }, isActive: true },
    });

    if (hrManagers.length > 0) {
      await prisma.notification.createMany({
        data: hrManagers.map((mgr) => ({
          type: 'LEAVE_APPLIED',
          title: 'Leave Request',
          message: `${req.user.firstName} ${req.user.lastName} applied for ${type} leave`,
          recipientId: mgr.id,
          senderId: req.user.id,
          metadata: { leaveId: leave.id },
        })),
      });
    }

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
    }

    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: {
        status,
        comments,
        approverId: req.user.id,
        approvedAt: new Date(),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notify the employee
    await prisma.notification.create({
      data: {
        type: status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        title: `Leave ${status}`,
        message: `Your leave request has been ${status.toLowerCase()}`,
        recipientId: leave.userId,
        senderId: req.user.id,
        metadata: { leaveId: leave.id },
      },
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leave = await prisma.leave.findUnique({ where: { id: req.params.id } });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ message: 'Cannot delete a non-pending leave request' });
    }
    await prisma.leave.delete({ where: { id: req.params.id } });
    res.json({ message: 'Leave request cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaves, applyLeave, updateLeaveStatus, deleteLeave };
