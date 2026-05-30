export type Status =
  | 'Requested'
  | 'Approved'
  | 'In Store'
  | 'Sent to Karigar'
  | 'Sent for Plating'
  | 'In QC'
  | 'Received Back'
  | 'Delayed'
  | 'Missing'
  | 'Closed';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Department = 'Designer' | 'Store' | 'Karigar' | 'Plating' | 'Vendor' | 'QC';

export interface MaterialRequest {
  request_id: string;
  request_date: string;
  style_code: string;
  material_name: string;
  material_category: string;
  quantity: number;
  unit: string;
  image_url: string;
  requested_by: string;
  department: Department;
  approved_by: string;
  current_holder: string;
  sent_to: string;
  expected_return_date: string;
  priority: Priority;
  status: Status;
  remarks: string;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  history_id: string;
  request_id: string;
  old_status: Status | '';
  new_status: Status;
  updated_by: string;
  update_time: string;
  comments: string;
}

export interface Vendor {
  vendor_id: string;
  vendor_name: string;
  type: string;
  contact_person: string;
  mobile_number: string;
  address: string;
}

export const ALL_STATUSES: Status[] = [
  'Requested',
  'Approved',
  'In Store',
  'Sent to Karigar',
  'Sent for Plating',
  'In QC',
  'Received Back',
  'Delayed',
  'Missing',
  'Closed',
];

export const ALL_PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const ALL_DEPARTMENTS: Department[] = ['Designer', 'Store', 'Karigar', 'Plating', 'Vendor', 'QC'];

export const UNITS = ['pcs', 'grams', 'meters', 'sets', 'pairs', 'kg', 'lots'];

export const MATERIAL_CATEGORIES = [
  'Gold',
  'Silver',
  'Diamond',
  'Gemstone',
  'Pearl',
  'Polki',
  'Kundan',
  'Meena',
  'Chain',
  'Finding',
  'Packaging',
  'Other',
];
