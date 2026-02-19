const prisma = require('../config/prisma');

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assigneeId, milestoneId, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { parentTaskId: null }; // Only top-level tasks by default
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (milestoneId) where.milestoneId = milestoneId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Employees see only their tasks
    if (req.user.role === 'EMPLOYEE') {
      where.assigneeId = req.user.id;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
          milestone: { select: { id: true, name: true } },
          project: { select: { id: true, name: true, color: true } },
          _count: { select: { subtasks: true, comments: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({ tasks, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        milestone: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            replies: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
              },
            },
          },
          where: { parentId: null },
          orderBy: { createdAt: 'asc' },
        },
        timesheets: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, estimatedHours, tags,
      projectId, milestoneId, assigneeId, parentTaskId } = req.body;

    const task = await prisma.task.create({
      data: {
        title, description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        tags: tags || [],
        projectId,
        milestoneId: milestoneId || null,
        assigneeId: assigneeId || null,
        parentTaskId: parentTaskId || null,
        creatorId: req.user.id,
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATED',
        entity: 'Task',
        entityId: task.id,
        details: { title: task.title },
        projectId: task.projectId,
      },
    });

    // Notify assignee
    if (assigneeId && assigneeId !== req.user.id) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned to "${title}"`,
          recipientId: assigneeId,
          senderId: req.user.id,
          metadata: { taskId: task.id, projectId },
        },
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, estimatedHours,
      tags, milestoneId, assigneeId } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    const updateData = {
      title, description, priority,
      tags: tags || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      milestoneId: milestoneId || undefined,
      assigneeId: assigneeId || undefined,
    };

    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') updateData.completedAt = new Date();
      else if (existingTask.status === 'COMPLETED') updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    // Log status change
    if (status && status !== existingTask.status) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'STATUS_CHANGED',
          entity: 'Task',
          entityId: task.id,
          details: { from: existingTask.status, to: status },
          projectId: task.projectId,
        },
      });

      // Notify team lead if status is IN_REVIEW
      if (status === 'IN_REVIEW') {
        const teamLeads = await prisma.user.findMany({ where: { role: 'TEAM_LEAD' } });
        if (teamLeads.length > 0) {
          await prisma.notification.createMany({
            data: teamLeads.map((lead) => ({
              type: 'TASK_UPDATED',
              title: 'Task Ready for Review',
              message: `Task "${task.title}" is now in review`,
              recipientId: lead.id,
              senderId: req.user.id,
              metadata: { taskId: task.id },
            })),
          });
        }
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks/overdue
const getOverdueTasks = async (req, res) => {
  try {
    const where = {
      dueDate: { lt: new Date() },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
    };
    if (req.user.role === 'EMPLOYEE') where.assigneeId = req.user.id;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getOverdueTasks };
