import { Status, Priority } from './types';

export function generateRequestId(): string {
  const now = new Date();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `MR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${num}`;
}

export function generateHistoryId(): string {
  return `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function getStatusColor(status: Status): string {
  const colors: Record<Status, string> = {
    'Requested': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'In Store': 'bg-gray-100 text-gray-800',
    'Sent to Karigar': 'bg-orange-100 text-orange-800',
    'Sent for Plating': 'bg-purple-100 text-purple-800',
    'In QC': 'bg-indigo-100 text-indigo-800',
    'Received Back': 'bg-emerald-100 text-emerald-800',
    'Delayed': 'bg-red-100 text-red-800',
    'Missing': 'bg-red-200 text-red-900',
    'Closed': 'bg-gray-200 text-gray-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    'Low': 'bg-gray-100 text-gray-600',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Urgent': 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isDelayed(expectedDate: string, status: Status): boolean {
  if (!expectedDate || ['Received Back', 'Closed'].includes(status)) return false;
  return new Date(expectedDate) < new Date();
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}
