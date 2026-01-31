"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeftIcon, CheckCircleIcon, CloseIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

interface Bid {
  id: number;
  tender_id: number;
  user_id: number;
  proposed_amount: number;
  proposal_document?: string;
  cover_letter?: string;
  company_name: string;
  company_registration?: string;
  years_of_experience?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Tender {
  id: number;
  title: string;
  service_type: string;
  min_budget?: number;
  max_budget?: number;
}

export default function TenderBidsPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [tender, setTender] = useState<Tender | null>(null);
  const [updatingBidId, setUpdatingBidId] = useState<number | null>(null);

  useEffect(() => {
    fetchTenderAndBids();
  }, [tenderId]);

  const fetchTenderAndBids = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      // Fetch tender details
      const tenderResponse = await fetch(`http://localhost:8000/tenders/${tenderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (tenderResponse.ok) {
        const tenderData = await tenderResponse.json();
        setTender(tenderData);
      }

      // Fetch bids
      const bidsResponse = await fetch(`http://localhost:8000/bids/tender/${tenderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json();
        setBids(bidsData);
      } else if (bidsResponse.status === 401) {
        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
        // Refresh bids
        await fetchTenderAndBids();
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

  const getBidStats = () => {
    const total = bids.length;
    const pending = bids.filter(b => b.status === "pending").length;
    const approved = bids.filter(b => b.status === "approved").length;
    const rejected = bids.filter(b => b.status === "rejected").length;
    const avgBid = total > 0 ? bids.reduce((sum, b) => sum + b.proposed_amount, 0) / total : 0;
    const lowestBid = total > 0 ? Math.min(...bids.map(b => b.proposed_amount)) : 0;
    const highestBid = total > 0 ? Math.max(...bids.map(b => b.proposed_amount)) : 0;
    
    return { total, pending, approved, rejected, avgBid, lowestBid, highestBid };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading bids...</p>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Tender not found</p>
        <Link href="/jmb/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const stats = getBidStats();

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/jmb/tender/${tenderId}`}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Bids for: {tender.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tender.service_type} • {stats.total} bid{stats.total !== 1 ? 's' : ''} received
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            {stats.pending}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Average Bid
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            {stats.total > 0 ? formatCurrency(stats.avgBid) : "N/A"}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Bid Range
          </div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-white">
            {stats.total > 0 ? `${formatCurrency(stats.lowestBid)} - ${formatCurrency(stats.highestBid)}` : "N/A"}
          </h4>
        </div>
      </div>

      {/* Budget Reference */}
      {(tender.min_budget || tender.max_budget) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Your Budget:</strong> {formatCurrency(tender.min_budget || 0)} - {formatCurrency(tender.max_budget || 0)}
          </p>
        </div>
      )}

      {/* Bids List */}
      <div className="space-y-4">
        {bids.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No bids received yet
            </p>
          </div>
        ) : (
          bids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {bid.company_name}
                  </h3>
                  {bid.company_registration && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Registration: {bid.company_registration}
                    </p>
                  )}
                  {bid.years_of_experience && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {bid.years_of_experience} years of experience
                    </p>
                  )}
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

              {bid.cover_letter && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {bid.cover_letter}
                  </p>
                </div>
              )}

              {bid.proposal_document && (
                <div className="mb-4">
                  <a
                    href={bid.proposal_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-500 hover:text-brand-600 underline"
                  >
                    View Proposal Document →
                  </a>
                </div>
              )}

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
