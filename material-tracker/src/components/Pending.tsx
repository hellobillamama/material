"use client";

import { useEffect, useState } from "react";
import { getAllRequestsLocal } from "@/lib/local-storage";
import { MaterialRequest, Status } from "@/lib/types";
import { getStatusColor, formatDate, isDelayed, getPriorityColor } from "@/lib/utils";
import { HiFilter } from "react-icons/hi";

interface PendingProps {
  onOpenRequest: (id: string) => void;
}

export default function Pending({ onOpenRequest }: PendingProps) {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const all = getAllRequestsLocal();
    // Only show non-closed/non-returned items
    const pending = all.filter(
      (r) => !["Received Back", "Closed"].includes(r.status)
    );
    // Sort: delayed first, then by priority, then by date
    pending.sort((a, b) => {
      const aDelayed = isDelayed(a.expected_return_date, a.status) ? 0 : 1;
      const bDelayed = isDelayed(b.expected_return_date, b.status) ? 0 : 1;
      if (aDelayed !== bDelayed) return aDelayed - bDelayed;

      const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
      const aPrio = priorityOrder[a.priority] ?? 2;
      const bPrio = priorityOrder[b.priority] ?? 2;
      if (aPrio !== bPrio) return aPrio - bPrio;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setRequests(pending);
  }, []);

  const filteredRequests = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  const filterOptions: { label: string; value: string }[] = [
    { label: "All", value: "all" },
    { label: "Requested", value: "Requested" },
    { label: "Approved", value: "Approved" },
    { label: "Sent to Karigar", value: "Sent to Karigar" },
    { label: "Sent for Plating", value: "Sent for Plating" },
    { label: "In QC", value: "In QC" },
    { label: "Delayed", value: "Delayed" },
    { label: "Missing", value: "Missing" },
  ];

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredRequests.length} items
          </p>
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-3 rounded-xl transition-colors ${
            showFilter ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
          }`}
        >
          <HiFilter size={20} />
        </button>
      </div>

      {/* Filter Pills */}
      {showFilter && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Request List */}
      <div className="space-y-2">
        {filteredRequests.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <p className="text-lg">All clear!</p>
            <p className="text-sm mt-1">No pending requests</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <button
              key={req.request_id}
              onClick={() => onOpenRequest(req.request_id)}
              className={`card w-full text-left active:bg-gray-50 transition-colors ${
                isDelayed(req.expected_return_date, req.status)
                  ? "border-red-200 bg-red-50/50"
                  : req.status === "Missing"
                  ? "border-red-300 bg-red-50/70"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {req.material_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {req.style_code} &bull; {req.quantity} {req.unit}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`status-badge ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                  <span className={`status-badge ${getPriorityColor(req.priority)}`}>
                    {req.priority}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>
                  {req.current_holder
                    ? `📍 ${req.current_holder}`
                    : `By: ${req.requested_by}`}
                </span>
                <span>
                  {isDelayed(req.expected_return_date, req.status) ? (
                    <span className="text-red-500 font-medium">
                      ⚠️ Overdue {formatDate(req.expected_return_date)}
                    </span>
                  ) : req.expected_return_date ? (
                    `Due: ${formatDate(req.expected_return_date)}`
                  ) : (
                    ""
                  )}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
