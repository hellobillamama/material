/**
 * Local Storage Database Layer (Demo/Fallback)
 * 
 * This works as a fully functional local database using browser localStorage.
 * Perfect for demo and testing without Google Sheets setup.
 * Switch to Google Sheets in production by setting environment variables.
 */

import { MaterialRequest, StatusHistory, Vendor, Status } from './types';

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
  if (existing) return; // Already seeded

  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();
  const pastDate = new Date(Date.now() - 432000000).toISOString().split('T')[0];

  const demoRequests: MaterialRequest[] = [
    {
      request_id: 'MR-001',
      request_date: threeDaysAgo.split('T')[0],
      style_code: 'JW-2024-A1',
      material_name: 'Gold Wire 22K',
      material_category: 'Gold',
      quantity: 50,
      unit: 'grams',
      image_url: '',
      requested_by: 'Rahul Sharma',
      department: 'Designer',
      approved_by: 'Amit Patel',
      current_holder: 'Ramesh Karigar',
      sent_to: 'Ramesh Karigar',
      expected_return_date: pastDate,
      priority: 'High',
      status: 'Sent to Karigar',
      remarks: 'Needed for wedding collection',
      created_at: threeDaysAgo,
      updated_at: yesterday,
    },
    {
      request_id: 'MR-002',
      request_date: twoDaysAgo.split('T')[0],
      style_code: 'JW-2024-B3',
      material_name: 'Kundan Stones',
      material_category: 'Kundan',
      quantity: 200,
      unit: 'pcs',
      image_url: '',
      requested_by: 'Priya Singh',
      department: 'Designer',
      approved_by: '',
      current_holder: 'Store',
      sent_to: '',
      expected_return_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Requested',
      remarks: 'For necklace set',
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo,
    },
    {
      request_id: 'MR-003',
      request_date: yesterday.split('T')[0],
      style_code: 'JW-2024-C7',
      material_name: 'Silver Sheet',
      material_category: 'Silver',
      quantity: 100,
      unit: 'grams',
      image_url: '',
      requested_by: 'Deepak Kumar',
      department: 'Store',
      approved_by: 'Amit Patel',
      current_holder: 'Plating Unit',
      sent_to: 'Plating Unit',
      expected_return_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: 'High',
      status: 'Sent for Plating',
      remarks: 'Rhodium plating needed',
      created_at: yesterday,
      updated_at: now,
    },
    {
      request_id: 'MR-004',
      request_date: threeDaysAgo.split('T')[0],
      style_code: 'JW-2024-D2',
      material_name: 'Diamond Solitaire 0.5ct',
      material_category: 'Diamond',
      quantity: 5,
      unit: 'pcs',
      image_url: '',
      requested_by: 'Rahul Sharma',
      department: 'Designer',
      approved_by: 'Amit Patel',
      current_holder: '',
      sent_to: '',
      expected_return_date: pastDate,
      priority: 'Urgent',
      status: 'Missing',
      remarks: 'Cannot locate after Karigar returned',
      created_at: threeDaysAgo,
      updated_at: yesterday,
    },
    {
      request_id: 'MR-005',
      request_date: now.split('T')[0],
      style_code: 'JW-2024-E5',
      material_name: 'Pearl Strand AAA',
      material_category: 'Pearl',
      quantity: 10,
      unit: 'pcs',
      image_url: '',
      requested_by: 'Priya Singh',
      department: 'Designer',
      approved_by: '',
      current_holder: 'QC Department',
      sent_to: 'QC Department',
      expected_return_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'In QC',
      remarks: 'Quality check before dispatch',
      created_at: now,
      updated_at: now,
    },
  ];

  const demoHistory: StatusHistory[] = [
    {
      history_id: 'H-001',
      request_id: 'MR-001',
      old_status: '',
      new_status: 'Requested',
      updated_by: 'Rahul Sharma',
      update_time: threeDaysAgo,
      comments: 'New request created',
    },
    {
      history_id: 'H-002',
      request_id: 'MR-001',
      old_status: 'Requested',
      new_status: 'Approved',
      updated_by: 'Amit Patel',
      update_time: twoDaysAgo,
      comments: 'Approved for production',
    },
    {
      history_id: 'H-003',
      request_id: 'MR-001',
      old_status: 'Approved',
      new_status: 'Sent to Karigar',
      updated_by: 'Store Manager',
      update_time: yesterday,
      comments: 'Sent to Ramesh Karigar',
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

  const pending = requests.filter(
    (r) => !['Received Back', 'Closed'].includes(r.status)
  );
  const delayed = requests.filter(
    (r) =>
      r.expected_return_date &&
      new Date(r.expected_return_date) < now &&
      !['Received Back', 'Closed'].includes(r.status)
  );
  const missing = requests.filter((r) => r.status === 'Missing');
  const withKarigar = requests.filter((r) => r.status === 'Sent to Karigar');
  const forPlating = requests.filter((r) => r.status === 'Sent for Plating');
  const recent = [...requests]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  return {
    totalPending: pending.length,
    delayed: delayed.length,
    missing: missing.length,
    withKarigar: withKarigar.length,
    forPlating: forPlating.length,
    recentUpdates: recent,
  };
}

// ============ SEARCH ============

export function searchRequestsLocal(query: string): MaterialRequest[] {
  const requests = getAllRequestsLocal();
  const q = query.toLowerCase();
  return requests.filter(
    (r) =>
      r.style_code.toLowerCase().includes(q) ||
      r.material_name.toLowerCase().includes(q) ||
      r.request_id.toLowerCase().includes(q) ||
      r.requested_by.toLowerCase().includes(q) ||
      r.current_holder.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.remarks.toLowerCase().includes(q) ||
      r.material_category.toLowerCase().includes(q)
  );
}
