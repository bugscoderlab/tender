"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileIcon,
  BellIcon,
} from "@/icons/index";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

interface Tender {
  id: number;
  title: string;
  service_type: string;
  property_name: string;
  closing_date: string;
  status: string;
}

export default function ContractorDashboard() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/tenders/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for open tenders only for contractors
        const openTenders = data.filter((t: any) => t.status === 'open');
        setTenders(openTenders);
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse available tenders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Available Tenders
            </span>
            <span className="text-gray-400">
              <FileIcon className="w-5 h-5" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            {tenders.length}
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Unread Notifications
            </span>
            <span className="text-gray-400">
              <BellIcon className="w-5 h-5" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            0
          </h4>
        </div>
      </div>

      {/* Latest Tenders */}
      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Latest Tenders
          </h3>
          {/* <Link href="/contractor/tenders" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            View all
          </Link> */}
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-4 text-gray-500">Loading tenders...</div>
          ) : tenders.length === 0 ? (
             <div className="text-center py-4 text-gray-500">No open tenders available.</div>
          ) : (
            tenders.map((tender) => (
              <Link href={`/contractor/tenders/${tender.id}`} key={tender.id} className="block">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                        {tender.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {tender.property_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Deadline: {new Date(tender.closing_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="light" color="light">
                      {tender.service_type}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
