"use client";

import { useEffect, useState } from "react";
import { getDashboardStatsLocal } from "@/lib/local-storage";
import { MaterialRequest } from "@/lib/types";
import { getStatusColor, formatDate, isDelayed, timeAgo } from "@/lib/utils";
import { HiClock, HiExclamation, HiQuestionMarkCircle, HiUserGroup, HiColorSwatch } from "react-icons/hi";

interface DashboardProps {
  onOpenRequest: (id: string) => void;
}

interface Stats {
  totalPending: number;
  delayed: number;
  missing: number;
  withKarigar: number;
  forPlating: number;
  recentUpdates: MaterialRequest[];
}

export default function Dashboard({ onOpenRequest }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalPending: 0,
    delayed: 0,
    missing: 0,
    withKarigar: 0,
    forPlating: 0,
    recentUpdates: [],
  });

  useEffect(() => {
    const data = getDashboardStatsLocal();
    setStats(data);
  }, []);

  const statCards = [
    {
      label: "Pending",
      value: stats.totalPending,
      icon: <HiClock size={20} />,
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      label: "Delayed",
      value: stats.delayed,
      icon: <HiExclamation size={20} />,
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
    },
    {
      label: "Missing",
      value: stats.missing,
      icon: <HiQuestionMarkCircle size={20} />,
      color: "bg-red-50 text-red-700",
      borderColor: "border-red-300",
    },
    {
      label: "With Karigar",
      value: stats.withKarigar,
      icon: <HiUserGroup size={20} />,
      color: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      label: "Plating",
      value: stats.forPlating,
      icon: <HiColorSwatch size={20} />,
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Material Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`card border ${card.borderColor} ${card.color} flex items-center gap-3`}
          >
            <div className="p-2 rounded-lg bg-white/60">{card.icon}</div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs opacity-80">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Updates */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recent Updates
        </h2>
        <div className="space-y-2">
          {stats.recentUpdates.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <p>No requests yet</p>
              <p className="text-sm mt-1">Create your first material request</p>
            </div>
          ) : (
            stats.recentUpdates.map((req) => (
              <button
                key={req.request_id}
                onClick={() => onOpenRequest(req.request_id)}
                className={`card w-full text-left active:bg-gray-50 transition-colors ${
                  isDelayed(req.expected_return_date, req.status)
                    ? "border-red-200 bg-red-50/30"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {req.material_name}
                      </span>
                      {isDelayed(req.expected_return_date, req.status) && (
                        <span className="text-red-500 text-xs font-medium">DELAYED</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.style_code} &bull; {req.request_id}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>
                    {req.current_holder ? `With: ${req.current_holder}` : `By: ${req.requested_by}`}
                  </span>
                  <span>{timeAgo(req.updated_at)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
