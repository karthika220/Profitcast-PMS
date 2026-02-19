const prisma = require('../config/prisma');

const getTimesheets = async (req, res) => {
  try {
    const { userId, taskId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (req.user.role === 'EMPLOYEE') where.userId = req.user.id;
    else if (userId) where.userId = userId;

    if (taskId) where.taskId = taskId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true, project: { select: { id: true, name: true } } } },
        },
      }),
      prisma.timesheet.count({ where }),
    ]);

    res.json({ timesheets, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logTime = async (req, res) => {
  try {
    const { taskId, date, hoursLogged, description, isBillable } = req.body;

    const timesheet = await prisma.timesheet.create({
      data: {
        userId: req.user.id,
        taskId,
        date: new Date(date),
        hoursLogged: parseFloat(hoursLogged),
        description,
        isBillable: isBillable !== undefined ? isBillable : true,
      },
      include: {
        task: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(timesheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTimesheet = async (req, res) => {
  try {
    const { hoursLogged, description, isBillable } = req.body;
    const timesheet = await prisma.timesheet.update({
      where: { id: req.params.id },
      data: { hoursLogged: parseFloat(hoursLogged), description, isBillable },
    });
    res.json(timesheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTimesheet = async (req, res) => {
  try {
    await prisma.timesheet.delete({ where: { id: req.params.id } });
    res.json({ message: 'Timesheet entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTimesheets, logTime, updateTimesheet, deleteTimesheet };
