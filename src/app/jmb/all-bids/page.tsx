"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { CheckCircleIcon, CloseIcon } from "@/icons";

interface Bid {
  id: number;
  tender_id: number;
  user_id: number;
  proposed_amount: number;
  company_name: string;
  status: string;
  created_at: string;
  tender: {
    title: string;
    service_type: string;
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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
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
      day: "numeric"
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
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          All Bids
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
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
          <h4 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pending}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Approved
          </div>
          <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.approved}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Rejected
          </div>
          <h4 className="text-2xl font-bold text-red-600 dark:text-red-400">
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
      <div className="space-y-4">
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
              className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link 
                    href={`/jmb/tender/${bid.tender_id}/bids`}
                    className="text-lg font-semibold text-gray-800 dark:text-white hover:text-brand-500"
                  >
                    {bid.tender.title}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {bid.tender.service_type}
                  </p>
                  <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mt-2">
                    {bid.company_name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-500">
                    {formatCurrency(bid.proposed_amount)}
                  </div>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(bid.status)}`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted on {formatDate(bid.created_at)}
                </p>
                
                {bid.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateBidStatus(bid.id, "rejected")}
                      disabled={updatingBidId === bid.id}
                      startIcon={<CloseIcon />}
                    >
                      {updatingBidId === bid.id ? "Updating..." : "Reject"}
                    </Button>
                    <Button
                      onClick={() => handleUpdateBidStatus(bid.id, "approved")}
                      disabled={updatingBidId === bid.id}
                      startIcon={<CheckCircleIcon />}
                    >
                      {updatingBidId === bid.id ? "Updating..." : "Approve"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
