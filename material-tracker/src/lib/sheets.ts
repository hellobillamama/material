/**
 * Google Sheets Database Layer (Client-Side)
 * 
 * Uses Google Apps Script Web App as a proxy for read/write.
 * This is the SIMPLEST way to connect — no service account, no OAuth.
 * 
 * ============ SETUP (5 minutes) ============
 * 
 * STEP 1: Create Google Sheet
 *   - Go to https://sheets.google.com → Create new spreadsheet
 *   - Name it: "Material Tracker Database"
 *   - Create 3 tabs (sheets) at the bottom:
 *     Tab 1: "MaterialRequests"
 *     Tab 2: "StatusHistory"  
 *     Tab 3: "Vendors"
 *   - In "MaterialRequests" tab, add Row 1 headers:
 *     A1: request_id | B1: request_date | C1: material_name | D1: process_type |
 *     E1: quantity | F1: unit | G1: image_url | H1: requested_by | I1: department |
 *     J1: approved_by | K1: current_holder | L1: sent_to | M1: expected_return_date |
 *     N1: priority | O1: status | P1: remarks | Q1: created_at | R1: updated_at
 *   - In "StatusHistory" tab, add Row 1 headers:
 *     A1: history_id | B1: request_id | C1: old_status | D1: new_status |
 *     E1: updated_by | F1: update_time | G1: comments
 * 
 * STEP 2: Add Google Apps Script
 *   - In your Google Sheet, go to Extensions → Apps Script
 *   - Delete the default code and paste the code from APPS_SCRIPT_CODE below
 *   - Click "Deploy" → "New Deployment"
 *   - Type: "Web app"
 *   - Execute as: "Me"
 *   - Who has access: "Anyone"
 *   - Click "Deploy" and copy the Web App URL
 * 
 * STEP 3: Set Environment Variable
 *   - Create file: .env.local
 *   - Add: NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
 * 
 * That's it! The app will now read/write to your Google Sheet.
 * ============================================
 */

import { MaterialRequest, StatusHistory, Status, ProcessType } from './types';

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export function isGoogleSheetsConfigured(): boolean {
  return !!SCRIPT_URL;
}

// ============ API CALLS ============

async function callScript(action: string, data?: Record<string, unknown>): Promise<unknown> {
  const params = new URLSearchParams({ action, ...data as Record<string, string> });
  
  if (action === 'read' || action === 'getAll' || action === 'search' || action === 'getHistory') {
    const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
      method: 'GET',
    });
    return response.json();
  } else {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    return response.json();
  }
}

// ============ MATERIAL REQUESTS ============

export async function getAllRequestsFromSheet(): Promise<MaterialRequest[]> {
  try {
    const result = await callScript('getAll', { sheet: 'MaterialRequests' }) as { data: MaterialRequest[] };
    return result.data || [];
  } catch (e) {
    console.error('Failed to fetch from Google Sheets:', e);
    return [];
  }
}

export async function createRequestInSheet(req: MaterialRequest): Promise<void> {
  await callScript('create', {
    sheet: 'MaterialRequests',
    data: JSON.stringify(req),
  });
}

export async function updateRequestInSheet(req: MaterialRequest): Promise<void> {
  await callScript('update', {
    sheet: 'MaterialRequests',
    id: req.request_id,
    data: JSON.stringify(req),
  });
}

// ============ STATUS HISTORY ============

export async function getHistoryFromSheet(requestId: string): Promise<StatusHistory[]> {
  try {
    const result = await callScript('getHistory', {
      sheet: 'StatusHistory',
      requestId,
    }) as { data: StatusHistory[] };
    return result.data || [];
  } catch (e) {
    console.error('Failed to fetch history:', e);
    return [];
  }
}

export async function addHistoryToSheet(entry: StatusHistory): Promise<void> {
  await callScript('create', {
    sheet: 'StatusHistory',
    data: JSON.stringify(entry),
  });
}
