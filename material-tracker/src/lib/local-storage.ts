/**
 * Local Storage Database Layer
 * Works as a fully functional local database using browser localStorage.
 */

import { MaterialRequest, StatusHistory, Vendor, Status, ProcessType, PROCESS_SLA } from './types';

const STORAGE_KEYS = {
  REQUESTS: 'material_tracker_requests',
  HISTORY: 'material_tracker_history',
  VENDORS: 'material_tracker_vendors',
};

// ============ HELPERS ============

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ============ SEED DATA ============

export function seedDemoData(): void {
  if (typeof window === 'undefined') return;

  const existing = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  if (existing) return;

  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();
  const pastDate = new Date(Date.now() - 432000000).toISOString().split('T')[0];

  const demoRequests: MaterialRequest[] = [
    {
      request_id: 'MR-001',
      request_date: threeDaysAgo.split('T')[0],
      material_name: 'Gold Wire 22K',
      process_type: 'Plating',
      quantity: 50,
      unit: 'grams',
      image_url: '',
      requested_by: 'Rahul Sharma',
      department: 'Design',
      approved_by: 'Amit Patel',
      current_holder: 'Ramesh Karigar',
      sent_to: 'Ramesh Karigar',
      expected_return_date: pastDate,
      priority: 'High',
      status: 'In Process',
      remarks: 'Needed for wedding collection',
      created_at: threeDaysAgo,
      updated_at: yesterday,
    },
    {
      request_id: 'MR-002',
      request_date: twoDaysAgo.split('T')[0],
      material_name: 'Kundan Stones',
      process_type: 'Jaipur Ordered',
      quantity: 200,
      unit: 'pcs',
      image_url: '',
      requested_by: 'Priya Singh',
      department: 'Store',
      approved_by: '',
      current_holder: 'Store',
      sent_to: '',
      expected_return_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Ordered',
      remarks: 'For necklace set',
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo,
    },
    {
      request_id: 'MR-003',
      request_date: yesterday.split('T')[0],
      material_name: 'Silver Sheet',
      process_type: 'Dying',
      quantity: 100,
      unit: 'grams',
      image_url: '',
      requested_by: 'Deepak Kumar',
      department: 'Production',
      approved_by: 'Amit Patel',
      current_holder: 'Plating Unit',
      sent_to: 'Plating Unit',
      expected_return_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: 'High',
      status: 'In Process',
      remarks: 'Rhodium plating needed',
      created_at: yesterday,
      updated_at: now,
    },
    {
      request_id: 'MR-004',
      request_date: threeDaysAgo.split('T')[0],
      material_name: 'Diamond Solitaire 0.5ct',
      process_type: 'Purchase',
      quantity: 5,
      unit: 'pcs',
      image_url: '',
      requested_by: 'Rahul Sharma',
      department: 'Design',
      approved_by: 'Amit Patel',
      current_holder: '',
      sent_to: '',
      expected_return_date: pastDate,
      priority: 'Urgent',
      status: 'Ordered',
      remarks: 'Urgent purchase needed',
      created_at: threeDaysAgo,
      updated_at: yesterday,
    },
    {
      request_id: 'MR-005',
      request_date: now.split('T')[0],
      material_name: 'Pearl Strand AAA',
      process_type: 'Wrapping',
      quantity: 10,
      unit: 'pcs',
      image_url: '',
      requested_by: 'Priya Singh',
      department: 'QC',
      approved_by: '',
      current_holder: 'QC Department',
      sent_to: 'QC Department',
      expected_return_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'In Process',
      remarks: 'Quality check before dispatch',
      created_at: now,
      updated_at: now,
    },
    {
      request_id: 'MR-006',
      request_date: threeDaysAgo.split('T')[0],
      material_name: 'Polki Set',
      process_type: 'Plating',
      quantity: 1,
      unit: 'sets',
      image_url: '',
      requested_by: 'Deepak Kumar',
      department: 'Store',
      approved_by: 'Amit Patel',
      current_holder: 'Store',
      sent_to: '',
      expected_return_date: threeDaysAgo.split('T')[0],
      priority: 'Low',
      status: 'Closed',
      remarks: 'Completed and returned',
      created_at: threeDaysAgo,
      updated_at: yesterday,
    },
  ];

  const demoHistory: StatusHistory[] = [
    {
      history_id: 'H-001',
      request_id: 'MR-001',
      old_status: '',
      new_status: 'Ordered',
      updated_by: 'Rahul Sharma',
      update_time: threeDaysAgo,
      comments: 'New request created',
    },
    {
      history_id: 'H-002',
      request_id: 'MR-001',
      old_status: 'Ordered',
      new_status: 'In Process',
      updated_by: 'Amit Patel',
      update_time: twoDaysAgo,
      comments: 'Sent for plating',
    },
  ];

  const demoVendors: Vendor[] = [
    {
      vendor_id: 'V-001',
      vendor_name: 'Ramesh Karigar',
      type: 'Karigar',
      contact_person: 'Ramesh Soni',
      mobile_number: '9876543210',
      address: 'Zaveri Bazaar, Mumbai',
    },
    {
      vendor_id: 'V-002',
      vendor_name: 'Plating Unit',
      type: 'Plating',
      contact_person: 'Suresh Plater',
      mobile_number: '9876543211',
      address: 'Goregaon, Mumbai',
    },
  ];

  saveToStorage(STORAGE_KEYS.REQUESTS, demoRequests);
  saveToStorage(STORAGE_KEYS.HISTORY, demoHistory);
  saveToStorage(STORAGE_KEYS.VENDORS, demoVendors);
}

// ============ MATERIAL REQUESTS ============

export function getAllRequestsLocal(): MaterialRequest[] {
  return getFromStorage<MaterialRequest>(STORAGE_KEYS.REQUESTS);
}

export function getRequestByIdLocal(id: string): MaterialRequest | null {
  const requests = getAllRequestsLocal();
  return requests.find((r) => r.request_id === id) || null;
}

export function createRequestLocal(req: MaterialRequest): void {
  const requests = getAllRequestsLocal();
  requests.push(req);
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
}

export function updateRequestLocal(req: MaterialRequest): void {
  const requests = getAllRequestsLocal();
  const index = requests.findIndex((r) => r.request_id === req.request_id);
  if (index !== -1) {
    requests[index] = req;
    saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  }
}

// ============ STATUS HISTORY ============

export function getHistoryByRequestIdLocal(requestId: string): StatusHistory[] {
  const history = getFromStorage<StatusHistory>(STORAGE_KEYS.HISTORY);
  return history.filter((h) => h.request_id === requestId);
}

export function addStatusHistoryLocal(entry: StatusHistory): void {
  const history = getFromStorage<StatusHistory>(STORAGE_KEYS.HISTORY);
  history.push(entry);
  saveToStorage(STORAGE_KEYS.HISTORY, history);
}

// ============ VENDORS ============

export function getAllVendorsLocal(): Vendor[] {
  return getFromStorage<Vendor>(STORAGE_KEYS.VENDORS);
}

// ============ DASHBOARD ============

export function getDashboardStatsLocal() {
  const requests = getAllRequestsLocal();
  const now = new Date();

  // Pending = everything NOT closed
  const pending = requests.filter((r) => r.status !== 'Closed');

  // Delayed = expected return date passed and not closed/received
  const delayed = requests.filter(
    (r) =>
      r.expected_return_date &&
      new Date(r.expected_return_date) < now &&
      !['Received', 'Closed'].includes(r.status)
  );

  const ordered = requests.filter((r) => r.status === 'Ordered');
  const inProcess = requests.filter((r) => r.status === 'In Process');

  // Recent updates: only pending items (not closed), sorted by priority then date
  const priorityOrder: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
  const recentPending = [...pending]
    .sort((a, b) => {
      const aPrio = priorityOrder[a.priority] ?? 2;
      const bPrio = priorityOrder[b.priority] ?? 2;
      if (aPrio !== bPrio) return aPrio - bPrio;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 10);

  return {
    totalPending: pending.length,
    delayed: delayed.length,
    ordered: ordered.length,
    inProcess: inProcess.length,
    recentUpdates: recentPending,
  };
}

// ============ SEARCH ============

export function searchRequestsLocal(query: string): MaterialRequest[] {
  const requests = getAllRequestsLocal();
  const q = query.toLowerCase();
  return requests.filter(
    (r) =>
      r.material_name.toLowerCase().includes(q) ||
      r.request_id.toLowerCase().includes(q) ||
      r.requested_by.toLowerCase().includes(q) ||
      r.current_holder.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.remarks.toLowerCase().includes(q) ||
      r.process_type.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
  );
}

// ============ CLOSED ITEMS ============

export function getClosedRequestsLocal(): MaterialRequest[] {
  const requests = getAllRequestsLocal();
  return requests
    .filter((r) => r.status === 'Closed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}
