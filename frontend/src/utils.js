// Format currency in PKR
export const fmt = (n) => '₨' + Number(n || 0).toLocaleString('en-PK');

// Time ago
export const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800)return Math.floor(diff / 86400) + 'd ago';
  return new Date(date).toLocaleDateString();
};

// Status to CSS class
export const statusClass = (status) => {
  const map = {
    Development: 'b-dev', Completed: 'b-done', Planning: 'b-plan',
    Design: 'b-des', 'On Hold': 'b-hold', Testing: 'b-test',
    Revision: 'b-rev', Cancelled: 'b-can',
    todo: 'b-plan', inprogress: 'b-dev', review: 'b-test', done: 'b-done',
    High: 'b-high', Medium: 'b-medium', Low: 'b-low', Urgent: 'b-urgent',
    active: 'b-active', inactive: 'b-inactive', prospect: 'b-prospect',
    income: 'b-income', expense: 'b-expense',
    pending: 'b-pending', completed: 'b-completed', cancelled: 'b-can',
  };
  return map[status] || 'b-plan';
};

// Get initials
export const initials = (name) =>
  (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// Date format
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// Progress color
export const progressColor = (p) => {
  if (p >= 75) return '#4ade80';
  if (p >= 40) return '#3b82f6';
  return '#f59e0b';
};

export const PROJECT_STATUSES = ['Planning','Design','Development','Testing','Revision','Completed','On Hold','Cancelled'];
export const PRIORITIES        = ['Low','Medium','High','Urgent'];
export const TASK_STATUSES     = ['todo','inprogress','review','done'];
export const CLIENT_STATUSES   = ['active','inactive','prospect'];
export const TECH_STACK_OPTIONS = ['React','Next.js','Vue.js','Angular','Node.js','Express','Django','Laravel','WordPress','PHP','Python','MongoDB','PostgreSQL','MySQL','Firebase','Redis','Tailwind','Bootstrap','Flutter','React Native','TypeScript','GraphQL','Docker','AWS','Stripe','JWT'];
export const PAYMENT_METHODS  = ['Bank Transfer','Cash','Easypaisa','JazzCash','PayPal','Other'];
export const CATEGORIES        = ['Project Payment','Partial Payment','Hosting','Domain','Tools','Salary','Marketing','Office','Other'];
export const ROLES             = ['admin','developer','designer','qa'];
export const COLORS            = ['#2563eb','#7c3aed','#0891b2','#d97706','#059669','#dc2626','#db2777','#d97706','#6366f1','#f97316'];
export const ICONS             = ['🌐','💼','📱','🛒','🏢','🎨','⚙️','🔧','🍕','👗','📝','🚗','🏥','📚','🏦','🎓','🏪','✈️','🎮','🔐'];
