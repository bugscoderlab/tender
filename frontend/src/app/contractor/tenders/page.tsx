"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon, FileIcon, TimeIcon } from "@/icons";import { MapPin } from "lucide-react";import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

interface Tender {
  id: number;
  title: string;
  service_type: string;
  status: string;
  closing_date: string;
  closing_time: string;
  min_budget?: number;
  max_budget?: number;
  property_name?: string;
  scope_of_work: string;
  contract_period_months: number;
}

export default function ContractorTendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All Service Types");

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

      const response = await fetch(`${API_BASE_URL}/tenders/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Show only open AND approved tenders
        const openTenders = data.filter((t: any) => 
          t.status === "open" && t.approval_status === "approved"
        );
        setTenders(openTenders);
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.scope_of_work.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === "All Service Types" || tender.service_type === serviceFilter;
    return matchesSearch && matchesService;
  });

  const isClosingSoon = (closingDate: string, closingTime: string) => {
    const deadline = new Date(`${closingDate}T${closingTime}`);
    const now = new Date();
    const daysUntilClose = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilClose <= 3 && daysUntilClose > 0;
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

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Available Tenders
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse and apply for tenders
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search tenders by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            className="w-full px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:border-gray-800 dark:text-white/90"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option>All Service Types</option>
            <option>Security</option>
            <option>Cleaning</option>
            <option>Maintenance</option>
            <option>Landscaping</option>
            <option>Lift Maintenance</option>
            <option>Pest Control</option>
            <option>Waste Management</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading tenders...</div>
        ) : filteredTenders.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-center mb-3">
              <FileIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">No tenders found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          filteredTenders.map((tender) => (
            <div
              key={tender.id}
              className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {tender.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
                      {tender.service_type}
                    </span>
                    {tender.property_name && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {tender.property_name}
                      </span>
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <TimeIcon className="w-4 h-4" />
                      Closes: {formatDate(tender.closing_date)} at {tender.closing_time}
                    </span>
                    {isClosingSoon(tender.closing_date, tender.closing_time) && (
                      <span className="px-2.5 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 rounded-full dark:bg-rose-950/30 dark:text-rose-400">
                        Closing Soon!
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/contractor/tenders/${tender.id}`}>
                  <Button>View & Apply</Button>
                </Link>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {tender.scope_of_work}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                  {tender.contract_period_months} months
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
                  {formatBudget(tender.min_budget, tender.max_budget)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
