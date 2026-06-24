import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...options,
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

export const getStatusColor = (status) => {
  const map = {
    active: 'badge-active', inactive: 'badge-inactive', pending: 'badge-pending',
    paid: 'badge-paid', overdue: 'badge-overdue', present: 'badge-present',
    absent: 'badge-absent', late: 'badge-late', transferred: 'badge-inactive',
    alumni: 'badge-inactive',
  };
  return map[status?.toLowerCase()] || 'badge-inactive';
};

export const getGradientClass = (index) => {
  const gradients = ['gradient-primary', 'gradient-success', 'gradient-warning', 'gradient-danger', 'gradient-info', 'gradient-purple'];
  return gradients[index % gradients.length];
};

export const truncate = (str, n = 50) =>
  str && str.length > n ? str.slice(0, n - 1) + '…' : str;

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const ROLES = ['principal','admin','teacher','student','parent','accountant','librarian'];

export const getAcademicYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push(`${y}-${String(y + 1).slice(-2)}`);
  }
  return years;
};
