"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileIcon,
  CheckCircleIcon,
  Clock,
  CircleCheck,
  CircleX,
  Eye,
  MapPin,
  CalendarDays,
  CircleDollarSign,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import StatCard from "@/components/shared/StatCard";
import { API_BASE_URL } from "@/config";

interface Tender {
  id: number;
  title: string;
  service_type: string;
  property_name: string;
  closing_date: string;
  status: string;
  approval_status?: string;
  min_budget?: number;
  max_budget?: number;
  created_at: string;
  jmb_user_id: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tenders/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTenders(data);
      } else if (response.status === 401) {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (tenderId: number, approved: boolean) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please login to continue");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}/approval`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          approval_status: approved ? "approved" : "rejected"
        })
      });

      if (response.ok) {
        alert(`Tender ${approved ? "approved" : "rejected"} successfully`);
        fetchTenders();
      } else {
        const error = await response.json();
        alert(`Failed to update tender: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating tender:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getStats = () => {
    const total = tenders.length;
    const pending = tenders.filter(t => !t.approval_status || t.approval_status === "pending").length;
    const approved = tenders.filter(t => t.approval_status === "approved").length;
    const rejected = tenders.filter(t => t.approval_status === "rejected").length;
    return { total, pending, approved, rejected };
  };

  const getFilteredTenders = () => {
    if (filter === "all") return tenders;
    if (filter === "pending") {
      return tenders.filter(t => !t.approval_status || t.approval_status === "pending");
    }
    return tenders.filter(t => t.approval_status === filter);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return `RM ${amount.toLocaleString()}`;
  };

  const getApprovalStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
      case "rejected":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    }
  };

  const stats = getStats();
  const filteredTenders = getFilteredTenders();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Review and approve tenders submitted by JMB members
        </p>
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
          title="Pending Review"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<CircleX className="w-6 h-6" />}
          color="red"
          loading={loading}
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === "pending"
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === "approved"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === "rejected"
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Rejected ({stats.rejected})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All ({stats.total})
          </button>
        </div>

        {/* Tenders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading tenders...</div>
          ) : filteredTenders.length === 0 ? (
            <div className="text-center py-8">
              <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No tenders found</p>
            </div>
          ) : (
            filteredTenders.map((tender) => (
              <div
                key={tender.id}
                className="p-5 bg-gray-50 border border-gray-100 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {tender.title}
                      </h4>
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getApprovalStatusColor(
                          tender.approval_status
                        )}`}
                      >
                        {tender.approval_status
                          ? tender.approval_status.charAt(0).toUpperCase() +
                            tender.approval_status.slice(1)
                          : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tender.property_name}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
                        {tender.service_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        Deadline: {new Date(tender.closing_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CircleDollarSign className="w-4 h-4" />
                        Budget: {formatCurrency(tender.min_budget)} - {formatCurrency(tender.max_budget)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link href={`/admin/tenders/${tender.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="!text-blue-700 !border-blue-300 !bg-blue-50 hover:!bg-blue-100 dark:!text-blue-400 dark:!border-blue-800 dark:!bg-blue-950/30"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  {(!tender.approval_status || tender.approval_status === "pending") && (
                    <>
                      <Button
                        onClick={() => handleApproval(tender.id, true)}
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      >
                        <CircleCheck className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproval(tender.id, false)}
                        variant="outline"
                        size="sm"
                        className="!text-rose-700 !border-rose-300 !bg-rose-50 hover:!bg-rose-100 dark:!text-rose-400 dark:!border-rose-800 dark:!bg-rose-950/30"
                      >
                        <CircleX className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
