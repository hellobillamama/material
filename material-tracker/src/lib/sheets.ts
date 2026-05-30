/**
 * Google Sheets Database Layer
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

import { MaterialRequest, StatusHistory, Vendor, Status, ProcessType } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

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

  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(PRIVATE_KEY, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

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
    material_name: row[2] || '',
    process_type: (row[3] as ProcessType) || 'Plating',
    quantity: Number(row[4]) || 0,
    unit: row[5] || '',
    image_url: row[6] || '',
    requested_by: row[7] || '',
    department: row[8] || '',
    approved_by: row[9] || '',
    current_holder: row[10] || '',
    sent_to: row[11] || '',
    expected_return_date: row[12] || '',
    priority: (row[13] as MaterialRequest['priority']) || 'Medium',
    status: (row[14] as Status) || 'Ordered',
    remarks: row[15] || '',
    created_at: row[16] || '',
    updated_at: row[17] || '',
  };
}

function materialRequestToRow(req: MaterialRequest): string[] {
  return [
    req.request_id,
    req.request_date,
    req.material_name,
    req.process_type,
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
  const rows = await getSheetData('MaterialRequests!A2:R');
  return rows.map(rowToMaterialRequest);
}

export async function getRequestById(id: string): Promise<MaterialRequest | null> {
  const requests = await getAllRequests();
  return requests.find((r) => r.request_id === id) || null;
}

export async function createRequest(req: MaterialRequest): Promise<void> {
  await appendSheetData('MaterialRequests!A:R', [materialRequestToRow(req)]);
}

export async function updateRequest(req: MaterialRequest): Promise<void> {
  const rows = await getSheetData('MaterialRequests!A:A');
  const rowIndex = rows.findIndex((r) => r[0] === req.request_id);
  if (rowIndex === -1) return;
  const sheetRow = rowIndex + 1;
  await updateSheetData(
    `MaterialRequests!A${sheetRow}:R${sheetRow}`,
    [materialRequestToRow(req)]
  );
}

// ============ STATUS HISTORY ============

function rowToStatusHistory(row: string[]): StatusHistory {
  return {
    history_id: row[0] || '',
    request_id: row[1] || '',
    old_status: (row[2] as StatusHistory['old_status']) || '',
    new_status: (row[3] as Status) || 'Ordered',
    updated_by: row[4] || '',
    update_time: row[5] || '',
    comments: row[6] || '',
  };
}

function statusHistoryToRow(h: StatusHistory): string[] {
  return [h.history_id, h.request_id, h.old_status, h.new_status, h.updated_by, h.update_time, h.comments];
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
