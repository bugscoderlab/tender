"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CircleCheck, CircleX, MapPin, CalendarDays, CircleDollarSign, FileText } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface Tender {
  id: number;
  title: string;
  description: string;
  service_type: string;
  property_name: string;
  property_address: string;
  closing_date: string;
  status: string;
  approval_status?: string;
  min_budget?: number;
  max_budget?: number;
  created_at: string;
  jmb_user_id: number;
}

export default function AdminTenderDetail() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params?.id as string;
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenderId) {
      fetchTender();
    }
  }, [tenderId]);

  const fetchTender = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(`http://localhost:8000/tenders/${tenderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTender(data);
      } else if (response.status === 401) {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Error fetching tender:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!tender) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please login to continue");
        return;
      }

      const response = await fetch(`http://localhost:8000/tenders/${tender.id}/approval`, {
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
        router.push("/admin/dashboard");
      } else {
        const error = await response.json();
        alert(`Failed to update tender: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating tender:", error);
      alert("An error occurred. Please try again.");
    }
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tender details...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Tender not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {tender.title}
            </h1>
            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getApprovalStatusColor(
                tender.approval_status
              )}`}
            >
              {tender.approval_status
                ? tender.approval_status.charAt(0).toUpperCase() +
                  tender.approval_status.slice(1)
                : "Pending Review"}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {tender.property_name}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
              {tender.service_type}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Property Address
              </h3>
              <p className="text-base text-gray-800 dark:text-white">
                {tender.property_address}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Closing Date
              </h3>
              <p className="text-base text-gray-800 dark:text-white">
                {new Date(tender.closing_date).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <CircleDollarSign className="w-4 h-4" />
                Budget Range
              </h3>
              <p className="text-base text-gray-800 dark:text-white">
                {formatCurrency(tender.min_budget)} - {formatCurrency(tender.max_budget)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Created Date
              </h3>
              <p className="text-base text-gray-800 dark:text-white">
                {new Date(tender.created_at).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-white/[0.03]">
            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {tender.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {(!tender.approval_status || tender.approval_status === "pending") && (
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => handleApproval(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              <CircleCheck className="w-5 h-5 mr-2" />
              Approve Tender
            </Button>
            <Button
              onClick={() => handleApproval(false)}
              variant="outline"
              className="!text-rose-700 !border-rose-300 !bg-rose-50 hover:!bg-rose-100 dark:!text-rose-400 dark:!border-rose-800 dark:!bg-rose-950/30"
            >
              <CircleX className="w-5 h-5 mr-2" />
              Reject Tender
            </Button>
          </div>
        )}

        {tender.approval_status === "approved" && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-950/20 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              This tender has been approved and is now visible to contractors.
            </p>
          </div>
        )}

        {tender.approval_status === "rejected" && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg dark:bg-rose-950/20 dark:border-rose-800">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              This tender has been rejected and is not visible to contractors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
