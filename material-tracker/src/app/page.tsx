"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/components/Dashboard";
import NewRequest from "@/components/NewRequest";
import Pending from "@/components/Pending";
import Closed from "@/components/Closed";
import Search from "@/components/Search";
import RequestDetail from "@/components/RequestDetail";
import { seedDemoData, syncFromGoogleSheets } from "@/lib/local-storage";
import { isGoogleSheetsConfigured } from "@/lib/sheets";

type Tab = "home" | "new" | "pending" | "search" | "closed";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingFilter, setPendingFilter] = useState<string>("all");

  useEffect(() => {
    // If Google Sheets is configured, sync from it
    if (isGoogleSheetsConfigured()) {
      syncFromGoogleSheets().then((synced) => {
        if (!synced) {
          // Fallback to demo data if sync fails
          seedDemoData();
        }
        refresh();
      });
    } else {
      // No Google Sheets — use local demo data
      seedDemoData();
    }
  }, []);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openDetail = (id: string) => setSelectedRequestId(id);
  const closeDetail = () => {
    setSelectedRequestId(null);
    refresh();
  };

  // Called when a dashboard stat card is clicked
  const handleFilterByStatus = (status: string) => {
    setPendingFilter(status);
    setActiveTab("pending");
  };

  // Reset filter when manually switching to pending tab
  const handleTabChange = (tab: Tab) => {
    if (tab === "pending") {
      setPendingFilter("all");
    }
    setActiveTab(tab);
  };

  if (selectedRequestId) {
    return (
      <RequestDetail
        requestId={selectedRequestId}
        onBack={closeDetail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-safe">
        {activeTab === "home" && (
          <Dashboard
            key={refreshKey}
            onOpenRequest={openDetail}
            onFilterByStatus={handleFilterByStatus}
          />
        )}
        {activeTab === "new" && (
          <NewRequest onSuccess={() => { setActiveTab("home"); refresh(); }} />
        )}
        {activeTab === "pending" && (
          <Pending
            key={`${refreshKey}-${pendingFilter}`}
            onOpenRequest={openDetail}
            initialFilter={pendingFilter}
          />
        )}
        {activeTab === "closed" && (
          <Closed key={refreshKey} onOpenRequest={openDetail} />
        )}
        {activeTab === "search" && (
          <Search onOpenRequest={openDetail} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
