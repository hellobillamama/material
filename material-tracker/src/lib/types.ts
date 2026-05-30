export type Status =
  | 'Ordered'
  | 'In Process'
  | 'Received'
  | 'Closed';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ProcessType =
  | 'Plating'
  | 'Dying'
  | 'Purchase'
  | 'Wrapping'
  | 'Jaipur Ordered'
  | 'US Ordered'
  | 'China Ordered'
  | 'Waiting for Approval';

export interface MaterialRequest {
  request_id: string;
  request_date: string;
  material_name: string;
  process_type: ProcessType;
  quantity: number;
  unit: string;
  image_url: string;
  requested_by: string;
  department: string;
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
  'Ordered',
  'In Process',
  'Received',
  'Closed',
];

export const ALL_PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const ALL_PROCESS_TYPES: ProcessType[] = [
  'Plating',
  'Dying',
  'Purchase',
  'Wrapping',
  'Jaipur Ordered',
  'US Ordered',
  'China Ordered',
  'Waiting for Approval',
];

// SLA days for each process type
export const PROCESS_SLA: Record<ProcessType, number> = {
  'Plating': 3,
  'Dying': 2,
  'Purchase': 1,
  'Wrapping': 3,
  'Jaipur Ordered': 3,
  'US Ordered': 7,
  'China Ordered': 7,
  'Waiting for Approval': 1,
};

export const UNITS = ['pcs', 'grams', 'meters', 'sets', 'pairs', 'kg', 'lots'];
