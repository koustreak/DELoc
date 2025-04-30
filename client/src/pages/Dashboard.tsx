import { useState } from "react";
import { Component } from "@shared/schema";
import { Sidebar } from "@/components/layout/Sidebar";
import { SystemOverview } from "@/components/dashboard/SystemOverview";
import { ComponentDetail } from "@/components/dashboard/ComponentDetail";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  
  const handleSelectPage = (page: string) => {
    setActivePage(page);
    
    // Clear selected component if going to overview
    if (page === "overview") {
      setSelectedComponentId(null);
    }
  };
  
  const handleSelectComponent = (component: Component) => {
    setSelectedComponentId(component.id);
    setActivePage(`component-${component.id}`);
  };
  
  const handleBackToOverview = () => {
    setActivePage("overview");
    setSelectedComponentId(null);
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar 
        activePage={activePage}
        onSelectPage={handleSelectPage}
        onSelectComponent={handleSelectComponent}
      />
      
      <main className="flex-1 overflow-auto">
        {activePage === "overview" ? (
          <SystemOverview onSelectComponent={handleSelectComponent} />
        ) : selectedComponentId ? (
          <ComponentDetail 
            componentId={selectedComponentId}
            onBack={handleBackToOverview}
          />
        ) : (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-semibold">Page not found</h2>
          </div>
        )}
      </main>
    </div>
  );
}
