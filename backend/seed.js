require('dotenv').config();
const mongoose = require('mongoose');
const User        = require('./models/User');
const Client      = require('./models/Client');
const Project     = require('./models/Project');
const Task        = require('./models/Task');
const Transaction = require('./models/Transaction');
const Activity    = require('./models/Activity');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Client.deleteMany(), Project.deleteMany(), Task.deleteMany(), Transaction.deleteMany(), Activity.deleteMany()]);
  console.log('Cleared existing data');

  // ─── Users / Team ───────────────────────────────────────────────────────────
  // FIX: insertMany() pre-save hook bypass karta hai jis se bcrypt nahi chalta.
  //      User.create() use karo taake password properly hash ho.
  const usersData = [
    { name: 'Ahmad Khan',  email: 'ahmad@devops.pk',  password: 'password123', role: 'admin',     color: '#2563eb', skills: ['React','Node.js','MongoDB'], hourlyRate: 3500, isOnline: true },
    { name: 'Zara Hassan', email: 'zara@devops.pk',   password: 'password123', role: 'designer',  color: '#7c3aed', skills: ['Figma','Tailwind','UI/UX'],   hourlyRate: 2500 },
    { name: 'M. Rehan',    email: 'rehan@devops.pk',  password: 'password123', role: 'developer', color: '#0891b2', skills: ['Express','Python','MySQL'],   hourlyRate: 3000 },
    { name: 'Sana Malik',  email: 'sana@devops.pk',   password: 'password123', role: 'qa',        color: '#059669', skills: ['Testing','Cypress','Postman'], hourlyRate: 2000, isOnline: true },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await User.create(userData); // pre('save') hook chalega → bcrypt hash hoga
    users.push(user);
  }
  console.log('Users created (passwords hashed ✅)');

  const admin = users[0];

  // ─── Clients ────────────────────────────────────────────────────────────────
  const clients = await Client.insertMany([
    { name: 'Ahmad Shah',          email: 'ahmad@royalpizza.pk',  phone: '0300-1234567', company: 'Royal Pizza', city: 'Karachi',   color: '#ef4444', status: 'active',   totalPaid: 50000,  totalDue: 35000, projectCount: 1, createdBy: admin._id },
    { name: 'Sara Khan',           email: 'sara@fashionhub.com',  phone: '0321-9876543', company: 'FashionHub',  city: 'Lahore',    color: '#8b5cf6', status: 'active',   totalPaid: 150000, totalDue: 0,     projectCount: 1, createdBy: admin._id },
    { name: 'Ali Raza',            email: 'ali@techblogpro.pk',   phone: '0333-5556666', company: 'TechBlog',    city: 'Islamabad', color: '#06b6d4', status: 'active',   totalPaid: 30000,  totalDue: 15000, projectCount: 1, createdBy: admin._id },
    { name: 'Hassan Motors',       email: 'info@hassanrentals.com',phone:'0345-1112222', company: 'Hassan Motors',city:'Karachi',   color: '#f59e0b', status: 'active',   totalPaid: 0,      totalDue: 200000,projectCount: 1, createdBy: admin._id },
    { name: 'Dr. Farid Clinic',    email: 'drfarid@clinic.pk',    phone: '0311-7778888', company: 'Farid Clinic',city: 'Peshawar',  color: '#10b981', status: 'active',   totalPaid: 80000,  totalDue: 40000, projectCount: 1, createdBy: admin._id },
    { name: 'Bright Future School',email: 'admin@edulearn.pk',    phone: '0301-4445555', company: 'Bright Future',city:'Multan',    color: '#dc2626', status: 'inactive', totalPaid: 30000,  totalDue: 65000, projectCount: 1, createdBy: admin._id },
  ]);
  console.log('Clients created');

  // ─── Projects ───────────────────────────────────────────────────────────────
  const projects = await Project.insertMany([
    {
      name: 'Royal Pizza Website', clientName: 'Ahmad Shah', client: clients[0]._id,
      websiteUrl: 'https://royalpizza.pk', adminUrl: 'https://royalpizza.pk/admin',
      hostingProvider: 'Hostinger', githubRepo: 'github.com/devops-pk/royal-pizza',
      figmaUrl: 'figma.com/file/royalpizza', techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
      status: 'Development', priority: 'High', progress: 65, icon: '🍕', color: '#ef4444',
      startDate: new Date('2025-12-01'), deadline: new Date('2026-01-28'),
      budget: 85000, totalEarned: 50000, pendingPayment: 35000, expenses: 12000,
      notes: 'Payment issue — follow up with client. Client wants extra features.',
      teamMembers: [users[0]._id, users[1]._id], tags: ['food', 'ecommerce'], createdBy: admin._id,
    },
    {
      name: 'FashionHub E-Commerce', clientName: 'Sara Khan', client: clients[1]._id,
      websiteUrl: 'https://fashionhub.com', adminUrl: 'https://fashionhub.com/admin',
      hostingProvider: 'AWS', githubRepo: 'github.com/devops-pk/fashionhub',
      techStack: ['Next.js', 'Tailwind', 'Stripe', 'PostgreSQL'],
      status: 'Completed', priority: 'Medium', progress: 100, icon: '👗', color: '#8b5cf6',
      startDate: new Date('2025-10-15'), deadline: new Date('2025-11-30'), completedDate: new Date('2025-11-27'),
      budget: 150000, totalEarned: 150000, pendingPayment: 0, expenses: 20000,
      notes: 'Delivered 3 days early. Great client feedback. Use as case study.',
      teamMembers: [users[0]._id, users[2]._id], tags: ['fashion', 'ecommerce', 'stripe'], createdBy: admin._id,
    },
    {
      name: 'TechBlog Pro', clientName: 'Ali Raza', client: clients[2]._id,
      websiteUrl: 'https://techblogpro.pk', adminUrl: 'https://techblogpro.pk/wp-admin',
      hostingProvider: 'SiteGround', githubRepo: 'github.com/devops-pk/techblog',
      techStack: ['WordPress', 'PHP', 'MySQL', 'SEO'],
      status: 'Testing', priority: 'Medium', progress: 82, icon: '📝', color: '#06b6d4',
      startDate: new Date('2026-01-05'), deadline: new Date('2026-02-10'),
      budget: 45000, totalEarned: 30000, pendingPayment: 15000, expenses: 5000,
      notes: 'SEO optimization pending. Client needs full keyword research report.',
      teamMembers: [users[1]._id], tags: ['blog', 'wordpress', 'seo'], createdBy: admin._id,
    },
    {
      name: 'CarRental Mobile App', clientName: 'Hassan Motors', client: clients[3]._id,
      websiteUrl: 'https://hassanrentals.com', adminUrl: 'https://hassanrentals.com/admin',
      hostingProvider: 'DigitalOcean', githubRepo: 'github.com/devops-pk/car-rental',
      figmaUrl: 'figma.com/file/car-rental', techStack: ['React Native', 'Firebase', 'Node.js', 'Stripe'],
      status: 'Planning', priority: 'High', progress: 15, icon: '🚗', color: '#f59e0b',
      startDate: new Date('2026-02-01'), deadline: new Date('2026-04-15'),
      budget: 200000, totalEarned: 0, pendingPayment: 200000, expenses: 0,
      notes: 'Initial wireframes approved. Design phase starting Feb 10.',
      teamMembers: [users[0]._id, users[1]._id, users[2]._id], tags: ['mobile', 'rental'], createdBy: admin._id,
    },
    {
      name: 'HealthCare Plus Portal', clientName: 'Dr. Farid Clinic', client: clients[4]._id,
      websiteUrl: 'https://healthcareplus.pk', adminUrl: 'https://healthcareplus.pk/panel',
      hostingProvider: 'Hostinger', githubRepo: 'github.com/devops-pk/healthcare',
      techStack: ['React', 'Express', 'PostgreSQL', 'JWT'],
      status: 'Revision', priority: 'Urgent', progress: 90, icon: '🏥', color: '#10b981',
      startDate: new Date('2025-11-20'), deadline: new Date('2026-01-20'),
      budget: 120000, totalEarned: 80000, pendingPayment: 40000, expenses: 15000,
      notes: 'Client requested homepage UI redesign. Currently on 2nd revision cycle.',
      teamMembers: [users[2]._id, users[0]._id], tags: ['healthcare', 'portal'], createdBy: admin._id,
    },
    {
      name: 'EduLearn LMS Platform', clientName: 'Bright Future School', client: clients[5]._id,
      websiteUrl: 'https://edulearn.pk', adminUrl: 'https://edulearn.pk/admin',
      hostingProvider: 'Vultr', githubRepo: 'github.com/devops-pk/edulearn',
      techStack: ['Vue.js', 'Django', 'Redis', 'Celery'],
      status: 'On Hold', priority: 'Low', progress: 40, icon: '📚', color: '#dc2626',
      startDate: new Date('2025-09-01'), deadline: new Date('2026-03-01'),
      budget: 95000, totalEarned: 30000, pendingPayment: 65000, expenses: 8000,
      notes: 'Client budget issues. Project paused until February 2026.',
      teamMembers: [users[1]._id], tags: ['education', 'lms'], createdBy: admin._id,
    },
  ]);
  console.log('Projects created');

  // ─── Tasks ──────────────────────────────────────────────────────────────────
  await Task.insertMany([
    { title: 'Fix payment gateway bug on checkout', description: 'Stripe webhook not firing correctly', project: projects[0]._id, projectName: 'Royal Pizza Website',    assignedTo: users[0]._id, assigneeName: 'Ahmad Khan', status: 'inprogress', priority: 'High',   dueDate: new Date('2026-01-15'), createdBy: admin._id },
    { title: 'Design new landing page mockup',       description: 'Hero + features + pricing sections', project: projects[3]._id, projectName: 'CarRental Mobile App',   assignedTo: users[1]._id, assigneeName: 'Zara Hassan',status: 'todo',       priority: 'High',   dueDate: new Date('2026-02-05'), createdBy: admin._id },
    { title: 'API end-to-end integration tests',     description: 'Cover all patient endpoints',        project: projects[4]._id, projectName: 'HealthCare Plus Portal', assignedTo: users[3]._id, assigneeName: 'Sana Malik', status: 'inprogress', priority: 'Medium', dueDate: new Date('2026-01-18'), createdBy: admin._id },
    { title: 'Database query optimization',          description: 'Slow queries on posts table',        project: projects[2]._id, projectName: 'TechBlog Pro',           assignedTo: users[2]._id, assigneeName: 'M. Rehan',   status: 'todo',       priority: 'Low',    dueDate: new Date('2026-02-01'), createdBy: admin._id },
    { title: 'Client approval call & live demo',     description: 'Demo new checkout flow',             project: projects[1]._id, projectName: 'FashionHub E-Commerce',  assignedTo: users[0]._id, assigneeName: 'Ahmad Khan', status: 'done',       priority: 'Medium', dueDate: new Date('2025-11-25'), completedAt: new Date('2025-11-25'), createdBy: admin._id },
    { title: 'Deploy FashionHub to production',      description: 'Vercel + domain config',             project: projects[1]._id, projectName: 'FashionHub E-Commerce',  assignedTo: users[0]._id, assigneeName: 'Ahmad Khan', status: 'done',       priority: 'High',   dueDate: new Date('2025-11-27'), completedAt: new Date('2025-11-27'), createdBy: admin._id },
    { title: 'Mobile responsive CSS fixes',          description: 'iPhone SE & small screens broken',   project: projects[5]._id, projectName: 'EduLearn LMS Platform',  assignedTo: users[1]._id, assigneeName: 'Zara Hassan',status: 'todo',       priority: 'Medium', dueDate: new Date('2026-02-10'), createdBy: admin._id },
    { title: 'Security penetration testing audit',   description: 'Full OWASP checklist',               project: projects[1]._id, projectName: 'FashionHub E-Commerce',  assignedTo: users[3]._id, assigneeName: 'Sana Malik', status: 'inprogress', priority: 'Low',    dueDate: new Date('2026-01-25'), createdBy: admin._id },
    { title: 'Setup CI/CD pipeline',                 description: 'GitHub Actions + Docker',            project: projects[0]._id, projectName: 'Royal Pizza Website',    assignedTo: users[2]._id, assigneeName: 'M. Rehan',   status: 'todo',       priority: 'Medium', dueDate: new Date('2026-01-30'), createdBy: admin._id },
    { title: 'Write SEO meta tags & sitemap',        description: 'All pages need meta optimization',   project: projects[2]._id, projectName: 'TechBlog Pro',           assignedTo: users[1]._id, assigneeName: 'Zara Hassan',status: 'review',     priority: 'Medium', dueDate: new Date('2026-01-28'), createdBy: admin._id },
  ]);
  console.log('Tasks created');

  // ─── Transactions ───────────────────────────────────────────────────────────
  const txns = [];
  // Incomes
  txns.push({ title: 'FashionHub — Full Payment',       type: 'income',  amount: 150000, project: projects[1]._id, projectName: 'FashionHub E-Commerce',  client: clients[1]._id, clientName: 'Sara Khan',          category: 'Project Payment', status: 'completed', date: new Date('2025-11-27'), paymentMethod: 'Bank Transfer', createdBy: admin._id });
  txns.push({ title: 'Royal Pizza — Advance',            type: 'income',  amount: 50000,  project: projects[0]._id, projectName: 'Royal Pizza Website',    client: clients[0]._id, clientName: 'Ahmad Shah',         category: 'Partial Payment', status: 'completed', date: new Date('2025-12-05'), paymentMethod: 'Easypaisa',    createdBy: admin._id });
  txns.push({ title: 'TechBlog — Initial Payment',       type: 'income',  amount: 30000,  project: projects[2]._id, projectName: 'TechBlog Pro',           client: clients[2]._id, clientName: 'Ali Raza',           category: 'Partial Payment', status: 'completed', date: new Date('2026-01-06'), paymentMethod: 'Bank Transfer', createdBy: admin._id });
  txns.push({ title: 'HealthCare — Advance',             type: 'income',  amount: 80000,  project: projects[4]._id, projectName: 'HealthCare Plus Portal', client: clients[4]._id, clientName: 'Dr. Farid Clinic',  category: 'Partial Payment', status: 'completed', date: new Date('2025-11-22'), paymentMethod: 'Bank Transfer', createdBy: admin._id });
  txns.push({ title: 'EduLearn — Initial',               type: 'income',  amount: 30000,  project: projects[5]._id, projectName: 'EduLearn LMS Platform',  client: clients[5]._id, clientName: 'Bright Future School',category:'Partial Payment', status: 'completed', date: new Date('2025-09-10'), paymentMethod: 'JazzCash',     createdBy: admin._id });
  // Pending incomes
  txns.push({ title: 'Royal Pizza — Remaining',          type: 'income',  amount: 35000,  project: projects[0]._id, projectName: 'Royal Pizza Website',    client: clients[0]._id, clientName: 'Ahmad Shah',         category: 'Project Payment', status: 'pending',   dueDate: new Date('2026-01-28'), createdBy: admin._id });
  txns.push({ title: 'TechBlog — Final Payment',         type: 'income',  amount: 15000,  project: projects[2]._id, projectName: 'TechBlog Pro',           client: clients[2]._id, clientName: 'Ali Raza',           category: 'Project Payment', status: 'pending',   dueDate: new Date('2026-02-10'), createdBy: admin._id });
  txns.push({ title: 'HealthCare — Remaining',           type: 'income',  amount: 40000,  project: projects[4]._id, projectName: 'HealthCare Plus Portal', client: clients[4]._id, clientName: 'Dr. Farid Clinic',  category: 'Project Payment', status: 'pending',   dueDate: new Date('2026-01-20'), createdBy: admin._id });
  txns.push({ title: 'EduLearn — Pending',               type: 'income',  amount: 65000,  project: projects[5]._id, projectName: 'EduLearn LMS Platform',  client: clients[5]._id, clientName: 'Bright Future School',category:'Project Payment', status: 'pending',   createdBy: admin._id });
  txns.push({ title: 'CarRental — Full Project',         type: 'income',  amount: 200000, project: projects[3]._id, projectName: 'CarRental Mobile App',   client: clients[3]._id, clientName: 'Hassan Motors',      category: 'Project Payment', status: 'pending',   dueDate: new Date('2026-04-15'), createdBy: admin._id });
  // Expenses
  txns.push({ title: 'Hostinger Renewal — 1yr',          type: 'expense', amount: 8500,   category: 'Hosting',  status: 'completed', date: new Date('2025-12-01'), paymentMethod: 'Bank Transfer', createdBy: admin._id });
  txns.push({ title: 'Adobe CC Subscription',            type: 'expense', amount: 4200,   category: 'Tools',    status: 'completed', date: new Date('2026-01-01'), paymentMethod: 'Bank Transfer', createdBy: admin._id });
  txns.push({ title: 'GitHub Pro Plan',                  type: 'expense', amount: 1100,   category: 'Tools',    status: 'completed', date: new Date('2026-01-01'), paymentMethod: 'Bank Transfer', createdBy: admin._id });
  txns.push({ title: 'royalpizza.pk domain renewal',     type: 'expense', amount: 2800,   category: 'Domain',   status: 'completed', date: new Date('2025-12-01'), paymentMethod: 'Cash',          createdBy: admin._id });
  txns.push({ title: 'DigitalOcean Droplet',             type: 'expense', amount: 5600,   category: 'Hosting',  status: 'completed', date: new Date('2026-01-01'), paymentMethod: 'Bank Transfer', createdBy: admin._id });
  txns.push({ title: 'Freelancer salary — Zara',         type: 'expense', amount: 25000,  category: 'Salary',   status: 'completed', date: new Date('2026-01-01'), paymentMethod: 'Easypaisa',     createdBy: admin._id });
  await Transaction.insertMany(txns);
  console.log('Transactions created');

  // ─── Activities ─────────────────────────────────────────────────────────────
  await Activity.insertMany([
    { type: 'payment',         title: 'Payment received from Sara Khan — ₨75,000',    color: '#4ade80', relatedTo: 'FashionHub E-Commerce',  userName: 'Ahmad Khan', createdAt: new Date(Date.now() - 2*3600000) },
    { type: 'project_updated', title: 'Royal Pizza Website — Frontend module done',   color: '#3b82f6', relatedTo: 'Royal Pizza Website',    userName: 'Ahmad Khan', createdAt: new Date(Date.now() - 5*3600000) },
    { type: 'client_added',    title: 'New project inquiry: E-commerce Clothing Store',color:'#a78bfa', relatedTo: '',                       userName: 'Ahmad Khan', createdAt: new Date(Date.now() - 24*3600000) },
    { type: 'status_change',   title: 'HealthCare Plus entered Revision phase',        color: '#f59e0b', relatedTo: 'HealthCare Plus Portal', userName: 'Ahmad Khan', createdAt: new Date(Date.now() - 26*3600000) },
    { type: 'bug_fixed',       title: 'Bug resolved in TechBlog — API timeout fix',   color: '#ef4444', relatedTo: 'TechBlog Pro',           userName: 'M. Rehan',   createdAt: new Date(Date.now() - 48*3600000) },
    { type: 'deployment',      title: 'FashionHub deployed to production ✅',          color: '#4ade80', relatedTo: 'FashionHub E-Commerce',  userName: 'Ahmad Khan', createdAt: new Date(Date.now() - 72*3600000) },
    { type: 'task_done',       title: 'Task completed: Client approval call demo',    color: '#4ade80', relatedTo: 'FashionHub E-Commerce',  userName: 'Ahmad Khan', createdAt: new Date(Date.now() - 80*3600000) },
    { type: 'team',            title: 'Sana Malik joined as QA Engineer',             color: '#2dd4bf', relatedTo: '',                       userName: 'Ahmad Khan', createdAt: new Date(Date.now() - 5*86400000) },
  ]);
  console.log('Activities created');

  console.log('\n✅  Database seeded successfully!');
  console.log('─────────────────────────────────────');
  console.log('Admin Login:  ahmad@devops.pk  /  password123');
  console.log('─────────────────────────────────────\n');
  mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });