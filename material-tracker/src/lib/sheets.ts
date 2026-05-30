/**
 * Google Sheets Database Layer
 * 
 * This module handles all CRUD operations using Google Sheets as the database.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with 3 tabs: "MaterialRequests", "StatusHistory", "Vendors"
 * 2. Create a Google Cloud project and enable Google Sheets API
 * 3. Create a service account and download the JSON key
 * 4. Share the Google Sheet with the service account email
 * 5. Set environment variables in .env.local:
 *    - GOOGLE_SHEET_ID=your_sheet_id
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
 *    - GOOGLE_PRIVATE_KEY=your_private_key
 */

import { MaterialRequest, StatusHistory, Vendor, Status } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// Google Sheets API base URL
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// JWT token generation for Google API auth
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsignedToken = `${encode(header)}.${encode(payload)}`;

  // Sign with private key
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(PRIVATE_KEY, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  return data.access_token;
}

async function getSheetData(range: string): Promise<string[][]> {
  const token = await getAccessToken();
  const url = `${SHEETS_API}/${SHEET_ID}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.values || [];
}

async function appendSheetData(range: string, values: string[][]): Promise<void> {
  const token = await getAccessToken();
  const url = `${SHEETS_API}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
}

async function updateSheetData(range: string, values: string[][]): Promise<void> {
  const token = await getAccessToken();
  const url = `${SHEETS_API}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
}

// ============ MATERIAL REQUESTS ============

function rowToMaterialRequest(row: string[]): MaterialRequest {
  return {
    request_id: row[0] || '',
    request_date: row[1] || '',
    style_code: row[2] || '',
    material_name: row[3] || '',
    material_category: row[4] || '',
    quantity: Number(row[5]) || 0,
    unit: row[6] || '',
    image_url: row[7] || '',
    requested_by: row[8] || '',
    department: (row[9] as MaterialRequest['department']) || 'Designer',
    approved_by: row[10] || '',
    current_holder: row[11] || '',
    sent_to: row[12] || '',
    expected_return_date: row[13] || '',
    priority: (row[14] as MaterialRequest['priority']) || 'Medium',
    status: (row[15] as Status) || 'Requested',
    remarks: row[16] || '',
    created_at: row[17] || '',
    updated_at: row[18] || '',
  };
}

function materialRequestToRow(req: MaterialRequest): string[] {
  return [
    req.request_id,
    req.request_date,
    req.style_code,
    req.material_name,
    req.material_category,
    String(req.quantity),
    req.unit,
    req.image_url,
    req.requested_by,
    req.department,
    req.approved_by,
    req.current_holder,
    req.sent_to,
    req.expected_return_date,
    req.priority,
    req.status,
    req.remarks,
    req.created_at,
    req.updated_at,
  ];
}

export async function getAllRequests(): Promise<MaterialRequest[]> {
  const rows = await getSheetData('MaterialRequests!A2:S');
  return rows.map(rowToMaterialRequest);
}

export async function getRequestById(id: string): Promise<MaterialRequest | null> {
  const requests = await getAllRequests();
  return requests.find((r) => r.request_id === id) || null;
}

export async function createRequest(req: MaterialRequest): Promise<void> {
  await appendSheetData('MaterialRequests!A:S', [materialRequestToRow(req)]);
}

export async function updateRequest(req: MaterialRequest): Promise<void> {
  const rows = await getSheetData('MaterialRequests!A:A');
  const rowIndex = rows.findIndex((r) => r[0] === req.request_id);
  if (rowIndex === -1) return;
  const sheetRow = rowIndex + 1; // +1 because sheets are 1-indexed (header is row 1)
  await updateSheetData(
    `MaterialRequests!A${sheetRow}:S${sheetRow}`,
    [materialRequestToRow(req)]
  );
}

// ============ STATUS HISTORY ============

function rowToStatusHistory(row: string[]): StatusHistory {
  return {
    history_id: row[0] || '',
    request_id: row[1] || '',
    old_status: (row[2] as StatusHistory['old_status']) || '',
    new_status: (row[3] as Status) || 'Requested',
    updated_by: row[4] || '',
    update_time: row[5] || '',
    comments: row[6] || '',
  };
}

function statusHistoryToRow(h: StatusHistory): string[] {
  return [
    h.history_id,
    h.request_id,
    h.old_status,
    h.new_status,
    h.updated_by,
    h.update_time,
    h.comments,
  ];
}

export async function getHistoryByRequestId(requestId: string): Promise<StatusHistory[]> {
  const rows = await getSheetData('StatusHistory!A2:G');
  return rows.map(rowToStatusHistory).filter((h) => h.request_id === requestId);
}

export async function addStatusHistory(history: StatusHistory): Promise<void> {
  await appendSheetData('StatusHistory!A:G', [statusHistoryToRow(history)]);
}

// ============ VENDORS ============

function rowToVendor(row: string[]): Vendor {
  return {
    vendor_id: row[0] || '',
    vendor_name: row[1] || '',
    type: row[2] || '',
    contact_person: row[3] || '',
    mobile_number: row[4] || '',
    address: row[5] || '',
  };
}

export async function getAllVendors(): Promise<Vendor[]> {
  const rows = await getSheetData('Vendors!A2:F');
  return rows.map(rowToVendor);
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  const requests = await getAllRequests();
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

export async function searchRequests(query: string): Promise<MaterialRequest[]> {
  const requests = await getAllRequests();
  const q = query.toLowerCase();
  return requests.filter(
    (r) =>
      r.style_code.toLowerCase().includes(q) ||
      r.material_name.toLowerCase().includes(q) ||
      r.request_id.toLowerCase().includes(q) ||
      r.requested_by.toLowerCase().includes(q) ||
      r.current_holder.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.remarks.toLowerCase().includes(q)
  );
}
