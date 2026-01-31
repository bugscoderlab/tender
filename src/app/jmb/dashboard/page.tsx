"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileIcon,
  TimeIcon,
  CheckCircleIcon,
  CloseIcon,
  PlusIcon,
  DocsIcon,
} from "@/icons/index";
import Button from "@/components/ui/button/Button";
import StatCard from "@/components/shared/StatCard";

interface Tender {
  id: number;
  title: string;
  service_type: string;
  status: string;
  closing_date: string;
  min_budget?: number;
  max_budget?: number;
  property_name?: string;
}

export default function JMBDashboard() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/tenders/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter by current user
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          const userId = payload.sub;
          
          const myTenders = data.filter((t: any) => String(t.user_id) === String(userId));
          setTenders(myTenders);
          
          // Calculate stats
          const total = myTenders.length;
          const pending = myTenders.filter((t: Tender) => t.status === "pending").length;
          const approved = myTenders.filter((t: Tender) => t.status === "approved" || t.status === "published" || t.status === "open").length;
          const rejected = myTenders.filter((t: Tender) => t.status === "rejected" || t.status === "closed").length;
          
          setStats({ total, pending, approved, rejected });
        } catch (e) {
          console.error("Error parsing token", e);
          setTenders(data);
          
          // Calculate stats from all data as fallback
          const total = data.length;
          const pending = data.filter((t: Tender) => t.status === "pending").length;
          const approved = data.filter((t: Tender) => t.status === "approved" || t.status === "published" || t.status === "open").length;
          const rejected = data.filter((t: Tender) => t.status === "rejected" || t.status === "closed").length;
          
          setStats({ total, pending, approved, rejected });
        }
      }
    } catch (error) {
      console.error("Failed to fetch tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "Budget not specified";
    if (min && max) return `RM ${min.toLocaleString()} - RM ${max.toLocaleString()}`;
    if (min) return `From RM ${min.toLocaleString()}`;
    if (max) return `Up to RM ${max.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "approved":
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Manage your tenders and track performance
          </p>
        </div>
        <Link href="/jmb/create-tender">
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            New Tender
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tenders"
          value={stats.total}
          icon={<FileIcon className="w-6 h-6" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon={<TimeIcon className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
        <StatCard
          title="Active Tenders"
          value={stats.approved}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Closed Tenders"
          value={stats.rejected}
          icon={<CloseIcon className="w-6 h-6" />}
          color="red"
          loading={loading}
        />
      </div>

      {/* Recent Tenders */}
      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6 min-h-[300px]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Tenders
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your latest tender submissions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : tenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 dark:bg-gray-800">
              <FileIcon className="w-8 h-8" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No tenders yet
            </p>
            <Link href="/jmb/create-tender">
              <Button startIcon={<PlusIcon />}>
                Create your first tender
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tenders.slice(0, 5).map((tender) => (
              <Link
                key={tender.id}
                href={`/jmb/tender/${tender.id}`}
                className="block p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow dark:border-gray-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                    {tender.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tender.status)}`}>
                    {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <DocsIcon className="w-4 h-4" />
                    {tender.service_type}
                  </span>
                  {tender.property_name && (
                    <span>📍 {tender.property_name}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <TimeIcon className="w-4 h-4" />
                    Closes: {formatDate(tender.closing_date)}
                  </span>
                </div>
                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatBudget(tender.min_budget, tender.max_budget)}
                </div>
              </Link>
            ))}
            {tenders.length > 5 && (
              <Link href="/jmb/my-tenders" className="block text-center py-2 text-brand-500 hover:text-brand-600 font-medium text-sm">
                View all {tenders.length} tenders →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
