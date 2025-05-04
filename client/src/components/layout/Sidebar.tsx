import { useState, useEffect } from "react";
import { useComponents } from "@/hooks/useBigDataComponents";
import { Component } from "@shared/schema";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

interface SidebarProps {
  activePage: string;
  onSelectPage: (page: string) => void;
  onSelectComponent: (component: Component) => void;
}

export function Sidebar({ activePage, onSelectPage, onSelectComponent }: SidebarProps) {
  const { data } = useComponents();
  const components = (data || []) as Component[];
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (data !== undefined) {
      setIsLoading(false);
    }
  }, [data]);
  
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Function to remove "Apache" prefix from component names
  const formatComponentName = (name: string) => {
    return name.replace(/^Apache\s+/i, '');
  };
  
  return (
    <aside className={cn(
      "bg-[#1e293b] text-white flex flex-col h-full shrink-0 shadow-xl transition-all duration-300",
      isCollapsed ? "w-16" : "w-52"
    )}>
      <div className="p-4 border-b border-[#2d3a50] flex justify-between items-center">
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-semibold flex items-center">
              <Icon name="dashboard" className="mr-2 h-7 w-7 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">DELoc</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">Data Engineering in Local</p>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <Icon name="dashboard" className="h-7 w-7 text-blue-400" />
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className={cn(
            "text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#263147] transition-colors",
            !isCollapsed && "absolute right-0 top-10 bg-[#1e293b] border-r border-t border-b border-[#2d3a50] rounded-l-none",
            isCollapsed && "bg-[#1e293b]"
          )}
        >
          <Icon name={isCollapsed ? "chevrons-right" : "chevrons-left"} className="h-5 w-5" />
        </button>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100vh-130px)]" hideScrollbar>
        <div className="py-2">
          {!isCollapsed && (
            <div className="px-4 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
              System
            </div>
          )}
          <div 
            className={cn(
              "py-3 flex items-center cursor-pointer hover:bg-[#263147] transition-colors duration-200",
              isCollapsed ? "justify-center px-2" : "px-4",
              activePage === "overview" && "border-l-3 border-blue-400 bg-blue-500/10 text-blue-400"
            )}
            onClick={() => onSelectPage("overview")}
          >
            <Icon name="dashboard" className={cn(isCollapsed ? "mx-auto" : "mr-3", "h-5 w-5")} />
            {!isCollapsed && <span>Overview</span>}
          </div>
        </div>
        
        <div className="py-2">
          {!isCollapsed && (
            <div className="px-4 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
              Components
            </div>
          )}
          
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className={cn("py-3", isCollapsed ? "px-2" : "px-4")}>
                <Skeleton className="h-6 w-full" />
              </div>
            ))
          ) : components ? (
            <div className="no-scrollbar">
              {components.map((component: Component) => (
                <div key={component.id}>
                  <div 
                    className={cn(
                      "py-3 flex items-center cursor-pointer hover:bg-[#263147] transition-colors duration-200",
                      isCollapsed ? "justify-center px-2" : "px-4",
                      activePage === `component-${component.id}` && "border-l-3 border-blue-400 bg-blue-500/10 text-blue-400"
                    )}
                    onClick={() => handleComponentClick(component)}
                    title={isCollapsed ? formatComponentName(component.displayName) : undefined}
                  >
                    <Icon name={component.icon} className={cn(isCollapsed ? "mx-auto" : "mr-3", "h-5 w-5 flex-shrink-0")} />
                    {!isCollapsed && <span className="truncate">{formatComponentName(component.displayName)}</span>}
                    {!isCollapsed && (
                      <div className="ml-auto pl-2 flex-shrink-0">
                        <span className={cn(
                          "inline-block w-2 h-2 rounded-full",
                          component.status === "running" && "bg-success",
                          component.status === "warning" && "bg-warning",
                          component.status === "stopped" && "bg-error"
                        )}></span>
                      </div>
                    )}
                    {isCollapsed && (
                      <span className={cn(
                        "absolute right-1 top-1 w-2 h-2 rounded-full",
                        component.status === "running" && "bg-success",
                        component.status === "warning" && "bg-warning",
                        component.status === "stopped" && "bg-error"
                      )}></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={cn("py-3 text-text-secondary", isCollapsed ? "px-2 text-center" : "px-4")}>
              {!isCollapsed && "No components found"}
              {isCollapsed && <Icon name="x" className="mx-auto h-5 w-5" />}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-auto p-4 border-t border-[#2d3a50]">
        <Link href="/notifications">
          <div 
            className={cn(
              "flex items-center cursor-pointer hover:text-blue-400 transition-colors duration-200",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Notifications" : undefined}
          >
            {!isCollapsed ? (
              <>
                <Icon name="bell" className="mr-2 h-5 w-5" />
                <span className="text-sm">Notifications</span>
                <NotificationBadge />
              </>
            ) : (
              <div className="relative">
                <Icon name="bell" className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4">
                  4
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}
