"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, Eye, CircleX } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface Bid {
  id: number;
  tender_id: number;
  user_id: number;
  proposed_amount: number;
  company_name: string;
  company_registration?: string;
  years_of_experience?: number;
  timeline?: number;
  proposal_document?: string;
  cover_letter?: string;
  status: string;
  created_at: string;
  tender: {
    title: string;
    service_type: string;
    min_budget?: number;
    max_budget?: number;
  };
}

export default function AllBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [updatingBidId, setUpdatingBidId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllBids();
  }, []);

  const fetchAllBids = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      // Get user ID from token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const userId = payload.sub;

      // Fetch all tenders for this user
      const tendersResponse = await fetch("http://localhost:8000/tenders/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (tendersResponse.ok) {
        const allTenders = await tendersResponse.json();
        const myTenders = allTenders.filter((t: any) => String(t.user_id) === String(userId));

        // Fetch bids for each tender
        const allBidsPromises = myTenders.map((tender: any) =>
          fetch(`http://localhost:8000/bids/tender/${tender.id}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }).then(res => res.ok ? res.json() : [])
        );

        const bidsArrays = await Promise.all(allBidsPromises);
        const allBids = bidsArrays.flat();
        setBids(allBids);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBidStatus = async (bidId: number, status: string) => {
    try {
      setUpdatingBidId(bidId);
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      const response = await fetch(`http://localhost:8000/bids/${bidId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchAllBids();
        alert(`Bid ${status} successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to update bid: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating bid:", error);
      alert("Failed to update bid. Please try again.");
    } finally {
      setUpdatingBidId(null);
    }
  };

  const filteredBids = bids.filter((bid) => {
    if (statusFilter === "All Status") return true;
    return bid.status === statusFilter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
      case "approved":
        return "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400";
      case "rejected":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getBidStats = () => {
    const total = bids.length;
    const pending = bids.filter(b => b.status === "pending").length;
    const approved = bids.filter(b => b.status === "approved").length;
    const rejected = bids.filter(b => b.status === "rejected").length;
    return { total, pending, approved, rejected };
  };

  const stats = getBidStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          All Bids
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          View and manage all bids across your tenders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Bids
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            {stats.total}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Pending Review
          </div>
          <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Approved
          </div>
          <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.approved}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Rejected
          </div>
          <h4 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.rejected}
          </h4>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex justify-between items-center">
        <div className="w-48">
          <select
            className="w-full px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:border-gray-800 dark:text-white/90"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Bids List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading bids...</div>
        ) : filteredBids.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">No bids found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {statusFilter === "All Status" 
                ? "No bids have been submitted yet."
                : `No ${statusFilter.toLowerCase()} bids.`}
            </p>
          </div>
        ) : (
          filteredBids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6 gap-6"
            >
              {/* Header with Tender Title and Status */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex-1">
                  <Link 
                    href={`/jmb/tender/${bid.tender_id}/bids`}
                    className="text-lg font-semibold text-gray-800 dark:text-white hover:text-blue-600 transition-colors inline-block mb-2"
                  >
                    {bid.tender.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
                      {bid.tender.service_type}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </span>
              </div>

              {/* Company Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {bid.company_name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {bid.company_registration && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Registration: </span>
                      <span className="text-gray-800 dark:text-white font-medium">{bid.company_registration}</span>
                    </div>
                  )}
                  {bid.years_of_experience !== undefined && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Experience: </span>
                      <span className="text-gray-800 dark:text-white font-medium">{bid.years_of_experience} years</span>
                    </div>
                  )}
                  {bid.timeline && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Timeline: </span>
                      <span className="text-gray-800 dark:text-white font-medium">{bid.timeline} months</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Submitted: </span>
                    <span className="text-gray-800 dark:text-white font-medium">{formatDate(bid.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Bid Amount */}
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proposed Amount</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(bid.proposed_amount)}
                </div>
                {(bid.tender.min_budget || bid.tender.max_budget) && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Budget: {formatCurrency(bid.tender.min_budget || 0)} - {formatCurrency(bid.tender.max_budget || 0)}
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              {bid.cover_letter && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Letter:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {bid.cover_letter}
                  </p>
                </div>
              )}

              {/* Documents */}
              {bid.proposal_document && (
                <div className="mb-4">
                  <a
                    href={bid.proposal_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Proposal Document
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link href={`/jmb/tender/${bid.tender_id}/bids`}>
                  <Button 
                    variant="outline" 
                    className="text-sm !text-blue-700 !border-blue-300 hover:!bg-blue-50 dark:!text-blue-400 dark:!border-blue-800 dark:hover:!bg-blue-950/30"
                    startIcon={<Eye className="w-4 h-4" />}
                  >
                    View All Bids for This Tender
                  </Button>
                </Link>
                {bid.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleUpdateBidStatus(bid.id, "approved")}
                      disabled={updatingBidId === bid.id}
                      className="text-sm bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      startIcon={<CircleCheck className="w-4 h-4" />}
                    >
                      {updatingBidId === bid.id ? "Updating..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleUpdateBidStatus(bid.id, "rejected")}
                      disabled={updatingBidId === bid.id}
                      variant="outline"
                      className="text-sm !text-rose-700 !border-rose-300 hover:!bg-rose-50 dark:!text-rose-400 dark:!border-rose-800 dark:hover:!bg-rose-950/30"
                      startIcon={<CircleX className="w-4 h-4" />}
                    >
                      {updatingBidId === bid.id ? "Updating..." : "Reject"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
