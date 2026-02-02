"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

interface TenderData {
  id: number;
  title: string;
  service_type: string;
  min_budget?: number;
  max_budget?: number;
}

export default function ApplyBidPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tender, setTender] = useState<TenderData | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    company_registration: "",
    years_of_experience: "",
    proposed_amount: "",
    timeline: "",
    cover_letter: "",
    proposal_document: "",
    agree_to_terms: false
  });

  useEffect(() => {
    fetchTenderDetails();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
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
        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.error("Error fetching tender:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.company_name || !formData.proposed_amount) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.agree_to_terms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      const bidData = {
        tender_id: parseInt(tenderId),
        company_name: formData.company_name,
        company_registration: formData.company_registration || undefined,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
        proposed_amount: parseFloat(formData.proposed_amount),
        cover_letter: `Timeline: ${formData.timeline}\n\n${formData.cover_letter}`,
        proposal_document: formData.proposal_document || undefined
      };

      const response = await fetch("http://localhost:8000/bids/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bidData)
      });

      if (response.ok) {
        alert("Bid submitted successfully!");
        router.push("/contractor/my-bids");
      } else {
        const error = await response.json();
        alert(`Failed to submit bid: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert("Failed to submit bid. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
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
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/contractor/tenders/${tenderId}`}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Submit Your Bid
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tender.title}
          </p>
        </div>
      </div>

      {/* Tender Budget Reference */}
      {(tender.min_budget || tender.max_budget) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Budget Range</h3>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
            RM {(tender.min_budget || 0).toLocaleString()} - RM {(tender.max_budget || 0).toLocaleString()}
          </p>
        </div>
      )}

      {/* Bid Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6">
        {/* Company Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Company Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SSM Registration Number
              </label>
              <Input
                name="company_registration"
                value={formData.company_registration}
                onChange={handleInputChange}
                placeholder="e.g., 202301234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Years of Experience
              </label>
              <Input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleInputChange}
                placeholder="e.g., 5"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Bid Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Bid Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proposed Amount (RM) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="proposed_amount"
                value={formData.proposed_amount}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
                min="0"
                step={0.01}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proposed Timeline
              </label>
              <Input
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                placeholder="e.g., 3 months, Start within 2 weeks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter / Proposal Notes
              </label>
              <textarea
                name="cover_letter"
                value={formData.cover_letter}
                onChange={handleInputChange}
                placeholder="Describe your approach, qualifications, and why you're the best fit for this project..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proposal Document URL (Optional)
              </label>
              <Input
                name="proposal_document"
                value={formData.proposal_document}
                onChange={handleInputChange}
                placeholder="https://example.com/proposal.pdf"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload your detailed proposal to Google Drive or Dropbox and paste the shareable link here
              </p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree_to_terms"
              name="agree_to_terms"
              checked={formData.agree_to_terms}
              onChange={handleInputChange}
              className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
              required
            />
            <label htmlFor="agree_to_terms" className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the terms and conditions and confirm that all information provided is accurate. 
              I understand that submitting false information may result in disqualification.
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Link href={`/contractor/tenders/${tenderId}`} className="flex-1">
            <Button variant="outline" className="w-full" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Bid"}
          </Button>
        </div>
      </form>
    </div>
  );
}
