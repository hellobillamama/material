"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/components/Dashboard";
import NewRequest from "@/components/NewRequest";
import Pending from "@/components/Pending";
import Search from "@/components/Search";
import RequestDetail from "@/components/RequestDetail";
import { seedDemoData } from "@/lib/local-storage";

type Tab = "home" | "new" | "pending" | "search";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    seedDemoData();
  }, []);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openDetail = (id: string) => setSelectedRequestId(id);
  const closeDetail = () => {
    setSelectedRequestId(null);
    refresh();
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
          <Dashboard key={refreshKey} onOpenRequest={openDetail} />
        )}
        {activeTab === "new" && (
          <NewRequest onSuccess={() => { setActiveTab("home"); refresh(); }} />
        )}
        {activeTab === "pending" && (
          <Pending key={refreshKey} onOpenRequest={openDetail} />
        )}
        {activeTab === "search" && (
          <Search onOpenRequest={openDetail} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
