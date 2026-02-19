const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const projectWhere = role === 'EMPLOYEE'
      ? { members: { some: { userId } } }
      : role === 'TEAM_LEAD'
      ? { OR: [{ ownerId: userId }, { members: { some: { userId } } }] }
      : {};

    const taskWhere = role === 'EMPLOYEE' ? { assigneeId: userId } : {};

    const [
      totalProjects, activeProjects, completedProjects,
      totalTasks, myTasks, completedTasks, overdueTasks,
      recentActivity, upcomingMilestones,
    ] = await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.project.count({ where: { ...projectWhere, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { ...projectWhere, status: 'COMPLETED' } }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, assigneeId: userId } }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: new Date() },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      }),
      prisma.milestone.findMany({
        where: {
          targetDate: { gte: new Date(), lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
          isCompleted: false,
        },
        include: {
          project: { select: { id: true, name: true, color: true } },
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { targetDate: 'asc' },
        take: 5,
      }),
    ]);

    // Task status breakdown
    const taskStatusBreakdown = await prisma.task.groupBy({
      by: ['status'],
      where: taskWhere,
      _count: { status: true },
    });

    // Projects by status
    const projectStatusBreakdown = await prisma.project.groupBy({
      by: ['status'],
      where: projectWhere,
      _count: { status: true },
    });

    res.json({
      stats: {
        totalProjects, activeProjects, completedProjects,
        totalTasks, myTasks, completedTasks, overdueTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      taskStatusBreakdown,
      projectStatusBreakdown,
      recentActivity,
      upcomingMilestones,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectHealthReport = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    const report = await Promise.all(
      projects.map(async (project) => {
        const [total, completed, overdue] = await Promise.all([
          prisma.task.count({ where: { projectId: project.id } }),
          prisma.task.count({ where: { projectId: project.id, status: 'COMPLETED' } }),
          prisma.task.count({
            where: {
              projectId: project.id,
              dueDate: { lt: new Date() },
              status: { notIn: ['COMPLETED', 'CANCELLED'] },
            },
          }),
        ]);
        return {
          ...project,
          totalTasks: total,
          completedTasks: completed,
          overdueTasks: overdue,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeWorkloadReport = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, role: true, department: true },
    });

    const report = await Promise.all(
      users.map(async (user) => {
        const [assigned, completed, hoursResult] = await Promise.all([
          prisma.task.count({ where: { assigneeId: user.id, status: { notIn: ['COMPLETED'] } } }),
          prisma.task.count({ where: { assigneeId: user.id, status: 'COMPLETED' } }),
          prisma.timesheet.aggregate({
            where: { userId: user.id },
            _sum: { hoursLogged: true },
          }),
        ]);
        return {
          ...user,
          activeTasks: assigned,
          completedTasks: completed,
          totalHoursLogged: hoursResult._sum.hoursLogged || 0,
        };
      })
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTimesheetSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const timesheets = await prisma.timesheet.findMany({
      where: { date: Object.keys(dateFilter).length ? dateFilter : undefined },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, department: true } },
        task: { select: { id: true, title: true, project: { select: { id: true, name: true } } } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getProjectHealthReport, getEmployeeWorkloadReport, getTimesheetSummary };
