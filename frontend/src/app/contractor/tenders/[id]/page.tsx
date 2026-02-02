"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import { API_BASE_URL } from "@/config";

interface EvaluationCriteria {
  criteria: string;
  weight: number;
}

interface TenderData {
  id: number;
  user_id: number;
  status: string;
  title: string;
  service_type: string;
  property_name?: string;
  property_address?: string;
  scope_of_work: string;
  contract_period_months: number;
  min_budget?: number;
  max_budget?: number;
  closing_date: string;
  closing_time: string;
  site_visit_date?: string;
  site_visit_time?: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  required_licenses: string[];
  evaluation_criteria: EvaluationCriteria[];
  tender_fee?: number;
}

export default function ContractorTenderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [tender, setTender] = useState<TenderData | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchTenderDetails();
    checkIfApplied();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data: TenderData = await response.json();
        setTender(data);
      } else if (response.status === 401) {
        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.error("Error fetching tender:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/bids/my-bids`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const myBids = await response.json();
        const applied = myBids.some((bid: any) => bid.tender_id === parseInt(tenderId));
        setHasApplied(applied);
      }
    } catch (error) {
      console.error("Error checking bids:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "Budget not specified";
    if (min && max) return `RM ${min.toLocaleString()} - RM ${max.toLocaleString()}`;
    if (min) return `From RM ${min.toLocaleString()}`;
    if (max) return `Up to RM ${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading tender details...</p>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Tender not found</p>
        <Link href="/contractor/tenders">
          <Button>Back to Tenders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/contractor/tenders"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Tender Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review tender requirements before applying
            </p>
          </div>
        </div>
        {hasApplied ? (
          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg font-medium">
            Already Applied
          </span>
        ) : (
          <Link href={`/contractor/tenders/${tenderId}/apply`}>
            <Button>Apply for This Tender</Button>
          </Link>
        )}
      </div>

      {/* Tender Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-8">
        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Tender Information
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tender Title</h4>
              <p className="mt-1 text-gray-800 dark:text-white text-lg font-semibold">{tender.title}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Service Type</h4>
                <p className="mt-1 text-gray-800 dark:text-white">{tender.service_type}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Contract Period</h4>
                <p className="mt-1 text-gray-800 dark:text-white">{tender.contract_period_months} months</p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Info */}
        {(tender.property_name || tender.property_address) && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Property Information
            </h2>
            <div className="space-y-4">
              {tender.property_name && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Property Name</h4>
                  <p className="mt-1 text-gray-800 dark:text-white">{tender.property_name}</p>
                </div>
              )}
              {tender.property_address && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Address</h4>
                  <p className="mt-1 text-gray-800 dark:text-white whitespace-pre-wrap">{tender.property_address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scope of Work */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Scope of Work
          </h2>
          <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{tender.scope_of_work}</p>
        </div>

        {/* Budget & Timeline */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Budget & Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Budget Range</h4>
              <p className="mt-1 text-gray-800 dark:text-white font-semibold">{formatBudget(tender.min_budget, tender.max_budget)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Closing Date</h4>
              <p className="mt-1 text-gray-800 dark:text-white font-semibold">
                {formatDate(tender.closing_date)} at {tender.closing_time}
              </p>
            </div>
            {tender.site_visit_date && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Site Visit</h4>
                <p className="mt-1 text-gray-800 dark:text-white">
                  {formatDate(tender.site_visit_date)}
                  {tender.site_visit_time && ` at ${tender.site_visit_time}`}
                </p>
              </div>
            )}
            {tender.tender_fee && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tender Fee</h4>
                <p className="mt-1 text-gray-800 dark:text-white">RM {tender.tender_fee.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Requirements */}
        {tender.required_licenses && tender.required_licenses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Required Licenses/Certifications
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-800 dark:text-white">
              {tender.required_licenses.map((license, index) => (
                <li key={index}>{license}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Evaluation Criteria */}
        {tender.evaluation_criteria && tender.evaluation_criteria.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Evaluation Criteria
            </h2>
            <div className="space-y-2">
              {tender.evaluation_criteria.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg">
                  <span className="text-gray-800 dark:text-white">{item.criteria}</span>
                  <span className="font-semibold text-brand-500">{item.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Contact Person</h4>
              <p className="mt-1 text-gray-800 dark:text-white">{tender.contact_person}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email</h4>
                <p className="mt-1 text-gray-800 dark:text-white">{tender.contact_email}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Phone</h4>
                <p className="mt-1 text-gray-800 dark:text-white">{tender.contact_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button (Bottom) */}
      {!hasApplied && (
        <div className="mt-6 text-center">
          <Link href={`/contractor/tenders/${tenderId}/apply`}>
            <Button className="px-8 py-3 text-lg">
              Apply for This Tender
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
