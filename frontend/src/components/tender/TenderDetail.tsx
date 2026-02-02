"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeftIcon as BackIcon,
    CalenderIcon as DateIcon,
    TimeIcon as ClockIcon,
    DollarLineIcon as MoneyIcon,
    UserIcon as PersonIcon,
    MailIcon as EmailIcon,
    FileIcon as DocumentIcon,
    CheckCircleIcon as CheckIcon,
    BoxIcon as LocationIcon, 
    InfoIcon as InfoIcon,
    TaskIcon
} from "@/icons";

import Button from "@/components/ui/button/Button";

interface EvaluationCriterion {
  criteria: string;
  weight: number;
}

interface Tender {
  id: number;
  title: string;
  service_type: string;
  status: string;
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
  evaluation_criteria: EvaluationCriterion[];
  tender_fee?: number;
  tender_documents?: string[];
}

interface TenderDetailProps {
  tenderId: string;
  backUrl: string;
  backLabel: string;
  userType: 'jmb' | 'contractor';
}

export default function TenderDetail({ tenderId, backUrl, backLabel, userType }: TenderDetailProps) {
  const router = useRouter();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tenderId) {
      fetchTenderDetails(tenderId);
    }
  }, [tenderId]);

  const fetchTenderDetails = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(`http://localhost:8000/tenders/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTender(data);
      } else {
        setError("Failed to load tender details");
      }
    } catch (err) {
      console.error("Error fetching tender details:", err);
      setError("An error occurred while fetching tender details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-500">{error || "Tender not found"}</h2>
        <Link href={backUrl}>
          <Button className="mt-4">{backLabel}</Button>
        </Link>
      </div>
    );
  }

  // Helper for status text
  const getStatusText = (status: string) => {
    if (status !== 'open') return status;
    return userType === 'contractor' ? 'Open for Submission' : 'Pending Approval';
  };

  // Helper for status classes
  const getStatusClasses = (status: string) => {
     if (status === 'open') {
         return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
     }
     if (status === 'closed') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';
     if (status === 'pending') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
     return 'bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={backUrl}
          className="inline-flex items-center text-sm text-gray-500 hover:text-brand-500 mb-4 transition-colors"
        >
          <BackIcon className="w-4 h-4 mr-1" />
          {backLabel}
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {tender.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {tender.property_name}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-800 dark:text-gray-300">
              {tender.service_type}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClasses(tender.status)}`}>
              {getStatusText(tender.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scope of Work */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TaskIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Scope of Work</h2>
            </div>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {tender.scope_of_work}
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Evaluation Criteria</h2>
            </div>
            <div className="space-y-3">
              {tender.evaluation_criteria && tender.evaluation_criteria.length > 0 ? (
                tender.evaluation_criteria.map((criteria, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{criteria.criteria}</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{criteria.weight}%</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No evaluation criteria specified.</p>
              )}
            </div>
          </div>

          {/* Tender Documents */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tender Documents</h2>
            </div>
            {tender.tender_documents && tender.tender_documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tender.tender_documents.map((doc, index) => (
                  <div key={index} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <DocumentIcon className="w-8 h-8 text-red-500 mr-3" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Document {index + 1}</p>
                      <p className="text-xs text-gray-500">Click to download</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No documents attached.</p>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* Action Card - Contractor Only */}
          {userType === 'contractor' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Interested?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Review the details and submit your proposal before the deadline.
                </p>
                <Button className="w-full justify-center">
                Apply Now
                </Button>
            </div>
          )}

          {/* Key Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Key Details</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <DateIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Closing Date</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(tender.closing_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tender.closing_time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Contract Period</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {tender.contract_period_months} months
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MoneyIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Budget Range</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {tender.min_budget && tender.max_budget 
                      ? `RM ${tender.min_budget} - RM ${tender.max_budget}`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MoneyIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Tender Fee</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {tender.tender_fee ? `RM ${tender.tender_fee}` : 'Free'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <LocationIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Site Visit</p>
                  {tender.site_visit_date ? (
                    <>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(tender.site_visit_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tender.site_visit_time}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">Not required</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <PersonIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 dark:text-white font-bold">
                    {tender.contact_person}
                  </p>
                  <p className="text-sm text-gray-500">
                    Contact Person
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <EmailIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Email</p>
                  <a href={`mailto:${tender.contact_email}`} className="text-gray-900 dark:text-white font-medium hover:text-brand-500 truncate block">
                    {tender.contact_email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Phone</p>
                  <a href={`tel:${tender.contact_phone}`} className="text-gray-900 dark:text-white font-medium hover:text-brand-500">
                    {tender.contact_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
