const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Users
  const md = await prisma.user.create({
    data: {
      email: 'md@profitcast.com',
      password: hashedPassword,
      firstName: 'Rajiv',
      lastName: 'Sharma',
      role: 'MD',
      department: 'Executive',
      phone: '+91-9876543210',
      birthday: new Date('1975-03-15'),
      joinDate: new Date('2015-01-01'),
    },
  });

  const hr = await prisma.user.create({
    data: {
      email: 'hr@profitcast.com',
      password: hashedPassword,
      firstName: 'Priya',
      lastName: 'Mehta',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      phone: '+91-9876543211',
      birthday: new Date('1985-07-22'),
      joinDate: new Date('2018-03-15'),
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@profitcast.com',
      password: hashedPassword,
      firstName: 'Vikram',
      lastName: 'Patel',
      role: 'HR_MANAGER',
      department: 'Engineering',
      phone: '+91-9876543212',
      birthday: new Date('1982-11-08'),
      joinDate: new Date('2019-06-01'),
    },
  });

  const teamLead = await prisma.user.create({
    data: {
      email: 'teamlead@profitcast.com',
      password: hashedPassword,
      firstName: 'Anita',
      lastName: 'Singh',
      role: 'TEAM_LEAD',
      department: 'Engineering',
      phone: '+91-9876543213',
      birthday: new Date('1990-04-18'),
      joinDate: new Date('2020-09-01'),
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'employee@profitcast.com',
      password: hashedPassword,
      firstName: 'Arjun',
      lastName: 'Kumar',
      role: 'EMPLOYEE',
      department: 'Engineering',
      phone: '+91-9876543214',
      birthday: new Date('1995-12-25'),
      joinDate: new Date('2022-01-10'),
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'employee2@profitcast.com',
      password: hashedPassword,
      firstName: 'Sneha',
      lastName: 'Reddy',
      role: 'EMPLOYEE',
      department: 'Design',
      phone: '+91-9876543215',
      birthday: new Date('1997-05-30'),
      joinDate: new Date('2022-06-15'),
    },
  });

  console.log('✅ Users created');

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'ERP System Development',
      description: 'End-to-end enterprise resource planning system for internal use',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      budget: 500000,
      color: '#3B82F6',
      tags: ['ERP', 'Backend', 'Frontend'],
      ownerId: manager.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Complete UI/UX overhaul of the customer-facing mobile application',
      status: 'PLANNING',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-31'),
      budget: 150000,
      color: '#10B981',
      tags: ['Mobile', 'Design', 'UX'],
      ownerId: hr.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Data Analytics Dashboard',
      description: 'Business intelligence dashboard for executive reporting',
      status: 'COMPLETED',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-12-31'),
      budget: 80000,
      color: '#F59E0B',
      tags: ['Analytics', 'BI', 'Dashboard'],
      ownerId: md.id,
    },
  });

  console.log('✅ Projects created');

  // Add Project Members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: teamLead.id, role: 'LEAD' },
      { projectId: project1.id, userId: employee1.id, role: 'CONTRIBUTOR' },
      { projectId: project1.id, userId: employee2.id, role: 'CONTRIBUTOR' },
      { projectId: project2.id, userId: employee2.id, role: 'LEAD' },
      { projectId: project2.id, userId: employee1.id, role: 'CONTRIBUTOR' },
      { projectId: project3.id, userId: teamLead.id, role: 'LEAD' },
      { projectId: project3.id, userId: employee1.id, role: 'CONTRIBUTOR' },
    ],
  });

  console.log('✅ Project members added');

  // Create Milestones
  const milestone1 = await prisma.milestone.create({
    data: {
      name: 'Backend API Complete',
      description: 'All REST APIs developed and tested',
      targetDate: new Date('2024-06-30'),
      projectId: project1.id,
      ownerId: teamLead.id,
    },
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      name: 'Frontend Integration',
      description: 'React frontend connected to all backend APIs',
      targetDate: new Date('2024-09-30'),
      projectId: project1.id,
      ownerId: teamLead.id,
    },
  });

  const milestone3 = await prisma.milestone.create({
    data: {
      name: 'Design Mockups Approved',
      description: 'All screen mockups reviewed and approved by stakeholders',
      targetDate: new Date('2024-04-15'),
      projectId: project2.id,
      ownerId: employee2.id,
    },
  });

  console.log('✅ Milestones created');

  // Create Tasks
  const tasks = await prisma.task.createMany({
    data: [
      {
        title: 'Setup project architecture',
        description: 'Define folder structure, CI/CD pipeline, and coding standards',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2024-02-15'),
        completedAt: new Date('2024-02-14'),
        estimatedHours: 16,
        projectId: project1.id,
        milestoneId: milestone1.id,
        assigneeId: teamLead.id,
        creatorId: manager.id,
        tags: ['Architecture', 'Setup'],
      },
      {
        title: 'Design database schema',
        description: 'Create ERD and define all tables, relations, and indexes',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2024-02-28'),
        completedAt: new Date('2024-02-26'),
        estimatedHours: 24,
        projectId: project1.id,
        milestoneId: milestone1.id,
        assigneeId: employee1.id,
        creatorId: teamLead.id,
        tags: ['Database', 'Design'],
      },
      {
        title: 'Implement user authentication API',
        description: 'JWT-based authentication with role-based access control',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2024-03-30'),
        estimatedHours: 20,
        projectId: project1.id,
        milestoneId: milestone1.id,
        assigneeId: employee1.id,
        creatorId: teamLead.id,
        tags: ['Auth', 'Security'],
      },
      {
        title: 'Build project management module',
        description: 'CRUD operations for projects with member management',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date('2024-04-15'),
        estimatedHours: 32,
        projectId: project1.id,
        milestoneId: milestone1.id,
        assigneeId: employee1.id,
        creatorId: teamLead.id,
        tags: ['Projects', 'API'],
      },
      {
        title: 'Create dashboard UI components',
        description: 'Build reusable React components for main dashboard',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2024-07-01'),
        estimatedHours: 40,
        projectId: project1.id,
        milestoneId: milestone2.id,
        assigneeId: employee2.id,
        creatorId: teamLead.id,
        tags: ['Frontend', 'UI'],
      },
      {
        title: 'Conduct user interviews',
        description: 'Interview 10 users to gather requirements for new mobile design',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2024-03-15'),
        completedAt: new Date('2024-03-12'),
        estimatedHours: 8,
        projectId: project2.id,
        milestoneId: milestone3.id,
        assigneeId: employee2.id,
        creatorId: hr.id,
        tags: ['Research', 'UX'],
      },
      {
        title: 'Create wireframes',
        description: 'Low-fidelity wireframes for all key screens',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        dueDate: new Date('2024-04-01'),
        estimatedHours: 20,
        projectId: project2.id,
        milestoneId: milestone3.id,
        assigneeId: employee2.id,
        creatorId: hr.id,
        tags: ['Design', 'Wireframes'],
      },
      {
        title: 'Write unit tests for auth module',
        description: 'Achieve 80% code coverage for authentication module',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2024-05-01'),
        estimatedHours: 12,
        projectId: project1.id,
        assigneeId: employee1.id,
        creatorId: teamLead.id,
        tags: ['Testing'],
      },
    ],
  });

  console.log('✅ Tasks created');

  // Create Timesheets
  const allTasks = await prisma.task.findMany({ take: 4 });
  if (allTasks.length > 0) {
    await prisma.timesheet.createMany({
      data: [
        {
          userId: employee1.id,
          taskId: allTasks[0].id,
          date: new Date('2024-02-10'),
          hoursLogged: 8,
          description: 'Worked on project setup and folder structure',
          isBillable: true,
        },
        {
          userId: employee1.id,
          taskId: allTasks[1].id,
          date: new Date('2024-02-20'),
          hoursLogged: 6,
          description: 'Database schema design - entities and relations',
          isBillable: true,
        },
        {
          userId: employee2.id,
          taskId: allTasks[4] ? allTasks[4].id : allTasks[0].id,
          date: new Date('2024-02-15'),
          hoursLogged: 5,
          description: 'User interview sessions and documentation',
          isBillable: false,
        },
        {
          userId: teamLead.id,
          taskId: allTasks[2].id,
          date: new Date('2024-03-05'),
          hoursLogged: 7,
          description: 'Code review and architecture guidance',
          isBillable: true,
        },
      ],
    });
  }

  console.log('✅ Timesheets created');

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Implement user authentication API"',
        recipientId: employee1.id,
        senderId: teamLead.id,
        isRead: false,
      },
      {
        type: 'PROJECT_CREATED',
        title: 'Added to Project',
        message: 'You have been added to the "ERP System Development" project',
        recipientId: employee2.id,
        senderId: manager.id,
        isRead: true,
      },
      {
        type: 'MILESTONE_DUE',
        title: 'Milestone Due Soon',
        message: '"Backend API Complete" milestone is due in 3 days',
        recipientId: teamLead.id,
        senderId: null,
        isRead: false,
      },
      {
        type: 'TASK_OVERDUE',
        title: 'Task Overdue',
        message: '"Write unit tests for auth module" is overdue',
        recipientId: manager.id,
        senderId: null,
        isRead: false,
      },
    ],
  });

  console.log('✅ Notifications created');

  // Create Leave Requests
  await prisma.leave.createMany({
    data: [
      {
        userId: employee1.id,
        type: 'SICK',
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-03-11'),
        reason: 'Fever and flu symptoms',
        status: 'APPROVED',
        approverId: hr.id,
        approvedAt: new Date('2024-03-09'),
      },
      {
        userId: employee2.id,
        type: 'ANNUAL',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-19'),
        reason: 'Family vacation',
        status: 'PENDING',
      },
      {
        userId: teamLead.id,
        type: 'EMERGENCY',
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-03-20'),
        reason: 'Family emergency',
        status: 'APPROVED',
        approverId: hr.id,
        approvedAt: new Date('2024-03-19'),
      },
    ],
  });

  console.log('✅ Leave requests created');

  // Create Comments
  const firstTask = await prisma.task.findFirst();
  if (firstTask) {
    await prisma.comment.createMany({
      data: [
        {
          content: 'Initial architecture setup complete. Using MVC pattern with Prisma ORM.',
          userId: teamLead.id,
          taskId: firstTask.id,
        },
        {
          content: 'Great work! Please document the folder structure in the README.',
          userId: manager.id,
          taskId: firstTask.id,
        },
      ],
    });
  }

  console.log('✅ Comments created');

  // Create Settings
  await prisma.settings.createMany({
    data: [
      {
        key: 'company_name',
        value: { value: 'Profitcast Technologies' },
        description: 'Company display name',
      },
      {
        key: 'work_hours',
        value: { start: '09:00', end: '18:45', lunch_start: '13:30', lunch_end: '14:30' },
        description: 'Standard working hours',
      },
      {
        key: 'working_days',
        value: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        description: 'Working days of the week',
      },
      {
        key: 'notifications',
        value: { email: true, inApp: true, taskAssigned: true, milestoneAlert: true, overdueAlert: true },
        description: 'Global notification settings',
      },
    ],
  });

  console.log('✅ Settings created');

  // Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: manager.id,
        action: 'CREATED',
        entity: 'Project',
        entityId: project1.id,
        details: { name: project1.name },
        projectId: project1.id,
      },
      {
        userId: teamLead.id,
        action: 'UPDATED',
        entity: 'Task',
        entityId: firstTask?.id || 'unknown',
        details: { field: 'status', from: 'TODO', to: 'COMPLETED' },
        projectId: project1.id,
      },
    ],
  });

  console.log('✅ Activity logs created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('MD:       md@profitcast.com      | Password123!');
  console.log('HR:       hr@profitcast.com      | Password123!');
  console.log('Manager:  manager@profitcast.com | Password123!');
  console.log('TeamLead: teamlead@profitcast.com | Password123!');
  console.log('Employee: employee@profitcast.com | Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
