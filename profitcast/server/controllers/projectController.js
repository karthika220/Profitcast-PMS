const prisma = require('../config/prisma');

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Non-MD/HR can only see their projects
    if (req.user.role === 'TEAM_LEAD' || req.user.role === 'EMPLOYEE') {
      where.OR = [
        { ownerId: req.user.id },
        { members: { some: { userId: req.user.id } } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          members: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            },
          },
          _count: { select: { tasks: true, milestones: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Calculate completion percentage
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const [totalTasks, completedTasks] = await Promise.all([
          prisma.task.count({ where: { projectId: project.id } }),
          prisma.task.count({ where: { projectId: project.id, status: 'COMPLETED' } }),
        ]);
        return {
          ...project,
          progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
      })
    );

    res.json({ projects: projectsWithProgress, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true, email: true } },
          },
        },
        milestones: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { tasks: true } },
          },
          orderBy: { targetDate: 'asc' },
        },
        _count: { select: { tasks: true, documents: true } },
      },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const [totalTasks, completedTasks] = await Promise.all([
      prisma.task.count({ where: { projectId: project.id } }),
      prisma.task.count({ where: { projectId: project.id, status: 'COMPLETED' } }),
    ]);

    res.json({
      ...project,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget, color, tags, memberIds } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ? parseFloat(budget) : null,
        color: color || '#3B82F6',
        tags: tags || [],
        ownerId: req.user.id,
        members: memberIds ? {
          create: memberIds.map((m) => ({
            userId: m.userId || m,
            role: m.role || 'CONTRIBUTOR',
          })),
        } : undefined,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATED',
        entity: 'Project',
        entityId: project.id,
        details: { name: project.name },
        projectId: project.id,
      },
    });

    // Send notifications to members
    if (memberIds && memberIds.length > 0) {
      const memberUserIds = memberIds.map((m) => m.userId || m);
      await prisma.notification.createMany({
        data: memberUserIds.map((userId) => ({
          type: 'PROJECT_CREATED',
          title: 'Added to Project',
          message: `You have been added to the project "${name}"`,
          recipientId: userId,
          senderId: req.user.id,
          metadata: { projectId: project.id },
        })),
      });
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, budget, color, tags } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name, description, status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
        color, tags,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATED',
        entity: 'Project',
        entityId: project.id,
        details: { name: project.name, status },
        projectId: project.id,
      },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/projects/:id/members
const addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId, role: role || 'CONTRIBUTOR' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    await prisma.notification.create({
      data: {
        type: 'PROJECT_CREATED',
        title: 'Added to Project',
        message: `You have been added to the project "${project.name}"`,
        recipientId: userId,
        senderId: req.user.id,
        metadata: { projectId: req.params.id },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, addMember, removeMember };
