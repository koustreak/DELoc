import { useState, useEffect } from "react";
import { useComponents } from "@/hooks/useBigDataComponents";
import { Component } from "@shared/schema";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  activePage: string;
  onSelectPage: (page: string) => void;
  onSelectComponent: (component: Component) => void;
}

export function Sidebar({ activePage, onSelectPage, onSelectComponent }: SidebarProps) {
  const { data: components = [], isLoading } = useComponents();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleComponentClick = (component: Component) => {
    onSelectComponent(component);
  };
  
  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-full shrink-0 shadow-xl">
      <div className="p-4 border-b border-[#2d3a50]">
        <h1 className="text-2xl font-semibold flex items-center">
          <Icon name="dashboard" className="mr-2 h-7 w-7 text-blue-400" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">DELoc</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Big Data Environment Manager</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="py-2">
          <div className="px-4 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
            System
          </div>
          <div 
            className={cn(
              "px-4 py-3 flex items-center cursor-pointer hover:bg-[#263147] transition-colors duration-200",
              activePage === "overview" && "border-l-3 border-blue-400 bg-blue-500/10 text-blue-400"
            )}
            onClick={() => onSelectPage("overview")}
          >
            <Icon name="dashboard" className="mr-3 h-5 w-5" />
            <span>Overview</span>
          </div>
        </div>
        
        <div className="py-2">
          <div className="px-4 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
            Components
          </div>
          
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <Skeleton className="h-6 w-full" />
              </div>
            ))
          ) : components ? (
            components.map((component) => (
              <div 
                key={component.id}
                className={cn(
                  "px-4 py-3 flex items-center cursor-pointer hover:bg-[#263147] transition-colors duration-200",
                  activePage === `component-${component.id}` && "border-l-3 border-blue-400 bg-blue-500/10 text-blue-400"
                )}
                onClick={() => handleComponentClick(component)}
              >
                <Icon name={component.icon} className="mr-3 h-5 w-5" />
                <span>{component.displayName}</span>
                <div className="ml-auto">
                  <span className={cn(
                    "inline-block w-2 h-2 rounded-full",
                    component.status === "running" && "bg-success",
                    component.status === "warning" && "bg-warning",
                    component.status === "stopped" && "bg-error"
                  )}></span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-text-secondary">No components found</div>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-auto p-4 border-t border-[#2d3a50]">
        <div className="flex items-center text-gray-400">
          <Icon name="user" className="mr-2 h-5 w-5" />
          <span className="text-sm">Admin User</span>
        </div>
      </div>
    </aside>
  );
}
