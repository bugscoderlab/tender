"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  GridIcon,
  FileIcon,
  BellIcon,
  ArrowRightIcon,
  ListIcon,
  DocsIcon,
} from "@/icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  iconColor: string;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    iconColor: "text-blue-600 dark:text-blue-400",
    name: "Dashboard",
    path: "/contractor/dashboard",
  },
  {
    icon: <ListIcon />,
    iconColor: "text-purple-800 dark:text-purple-400",
    name: "Browse Tenders",
    path: "/contractor/tenders",
  },
  {
    icon: <DocsIcon />,
    iconColor: "text-emerald-800 dark:text-emerald-400",
    name: "My Bids",
    path: "/contractor/my-bids",
  },
];

const ContractorSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email || "");
        setUserName(data.name && data.name !== "null" && data.name !== "NULL" ? data.name : "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const renderNavItem = (navItem: NavItem) => {
    const isActive = pathname === navItem.path;
    return (
      <li key={navItem.name}>
        <Link
          href={navItem.path || "#"}
          className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium duration-300 ease-in-out ${
            isActive
              ? "bg-brand-50 text-brand-500 dark:bg-brand-400/20 dark:text-brand-400"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <span className={navItem.iconColor}>
            {navItem.icon}
          </span>
          <span
            className={`transition-all duration-300 ease-in-out ${
              isExpanded || isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            {navItem.name}
          </span>
        </Link>
      </li>
    );
  };

  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sidebar Header */}
      <div className={`flex items-center gap-3 px-8 py-6 ${isExpanded || isHovered ? "justify-start" : "justify-center"}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-500 text-white shrink-0">
          <span className="text-xl font-bold">J</span>
        </div>
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isExpanded || isHovered ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
          <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
            JMB Tender 
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            System
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mt-5 px-4 lg:mt-9 lg:px-6">
          <ul className="mb-6 flex flex-col gap-1.5">{navItems.map(renderNavItem)}</ul>
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 pb-6 lg:px-6">
        <div className={`flex flex-col gap-2 ${isExpanded || isHovered ? "" : "items-center"}`}>
          {(isExpanded || isHovered) && (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 truncate">
              {userEmail}
            </div>
          )}
          <Link
            href="/signin"
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 ${
              isExpanded || isHovered ? "" : "justify-center"
            }`}
          >
            <ArrowRightIcon className="rotate-180" />
            <span
              className={`transition-all duration-300 ease-in-out ${
                isExpanded || isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Sign Out
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default ContractorSidebar;
