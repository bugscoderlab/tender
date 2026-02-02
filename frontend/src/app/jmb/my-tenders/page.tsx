"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon, FileIcon } from "@/icons";
import { Plus, Pencil, Eye, CalendarDays, CircleDollarSign } from 'lucide-react';
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { API_BASE_URL } from "@/config";

interface Tender {
  id: number;
  title: string;
  service_type: string;
  status: string;
  closing_date: string;
  contract_period_months: number;
  min_budget: number | null;
  max_budget: number | null;
  scope_of_work: string;
  bid_count?: number;
}

export default function MyTendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All Service Types");
  const [bidCounts, setBidCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Handle unauthenticated state appropriately
        return;
      }
      
      // We want to fetch all tenders for the logged-in user
      // The backend filters by current_user automatically if we don't pass user_id? 
      // Actually, the backend `list_tenders` has `user_id` as optional.
      // If we want ONLY the user's tenders, we should probably pass the user's ID if we knew it, 
      // OR update the backend to default to current user if no user_id is passed?
      // Wait, the backend logic is:
      // if user_id: query = query.filter(Tender.user_id == user_id)
      // else: returns ALL tenders (admin view).
      
      // For "My Tenders", we want to filter by the current user.
      // We can get the user details from the /users/me endpoint if it existed, or decode the token.
      // Alternatively, let's assume for now we might see all, or we need to pass our ID.
      // But typically "My Tenders" implies ownership.
      
      // Let's first fetch all and see what happens, or we can improve the backend to support "me" filter.
      // Actually, the requirement was "list all tender based on either user id where user id is optional".
      
      // Let's try to get the user ID from the token or local storage if we saved it?
      // We saved `access_token` and `user_email`. We didn't save `user_id`.
      
      // Quick fix: Let's fetch all and filter client side if necessary, OR better:
      // Let's decode the token to get the user ID? The token has `sub` which is user_id.
      
      const response = await fetch(`${API_BASE_URL}/tenders/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Since the backend returns ALL tenders if user_id is not provided, 
        // and we don't have the user ID handy without decoding the token (which requires a library or helper),
        // we might see everyone's tenders. 
        // However, for JMB demo, maybe we just display what we get.
        // But for "My Tenders", we should really filter.
        
        // Let's parse the token to get the user ID to filter correctly, 
        // OR update backend to have a "me" mode.
        // Let's parse the token simply since it's JWT.
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            const userId = payload.sub;
            
            // Now filter by userId
            const myTenders = data.filter((t: any) => String(t.user_id) === String(userId));
            setTenders(myTenders);
            
            // Fetch bid counts for each tender
            fetchBidCounts(myTenders, token);
        } catch (e) {
            console.error("Error parsing token", e);
            setTenders(data); // Fallback to all
        }
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidCounts = async (tenderList: Tender[], token: string) => {
    const counts: Record<number, number> = {};
    
    for (const tender of tenderList) {
      try {
        const response = await fetch(`${API_BASE_URL}/bids/tender/${tender.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const bids = await response.json();
          counts[tender.id] = bids.length;
        } else {
          counts[tender.id] = 0;
        }
      } catch (error) {
        counts[tender.id] = 0;
      }
    }
    
    setBidCounts(counts);
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === "All Service Types" || tender.service_type === serviceFilter;
    return matchesSearch && matchesService;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            My Tenders
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Manage your tender submissions
          </p>
        </div>
        <Link href="/jmb/create-tender">
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Tender
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
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
            <option>Pest Control</option>
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get started by creating a new tender.</p>
            </div>
        ) : (
            filteredTenders.map((tender) => (
            <div
                key={tender.id}
                className="p-5 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                    <Link href={`/jmb/my-tenders/${tender.id}`} className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white hover:text-brand-500 dark:hover:text-brand-400">
                            {tender.title}
                        </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
                            {tender.service_type}
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            tender.status === 'open' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            tender.status === 'closed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                            tender.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                            'bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
                        }`}>
                            {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)} 
                        </span>
                        {bidCounts[tender.id] !== undefined && bidCounts[tender.id] > 0 && (
                            <span className="px-2.5 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-full dark:bg-purple-950/30 dark:text-purple-400 flex items-center gap-1">
                                <CircleDollarSign className="w-3.5 h-3.5" /> {bidCounts[tender.id]} {bidCounts[tender.id] === 1 ? 'bid' : 'bids'}
                            </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                             <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" /> {new Date(tender.closing_date).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {tender.scope_of_work}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                            {tender.contract_period_months} months
                        </div>
                        {(tender.min_budget || tender.max_budget) && (
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
                                RM {tender.min_budget || 0} - {tender.max_budget || 'N/A'}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="text-sm !text-blue-700 !border-blue-300 hover:!bg-blue-50 dark:!text-blue-400 dark:!border-blue-800 dark:hover:!bg-blue-950/30"
                            onClick={() => {
                                router.push(`/jmb/tender/${tender.id}`);
                            }}
                            startIcon={<Pencil className="w-4 h-4" />}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            className="text-sm !text-blue-700 !border-blue-300 hover:!bg-blue-50 dark:!text-blue-400 dark:!border-blue-800 dark:hover:!bg-blue-950/30"
                            onClick={() => {
                                router.push(`/jmb/tender/${tender.id}/bids`);
                            }}
                            startIcon={<Eye className="w-4 h-4" />}
                        >
                            View Bids
                        </Button>
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
}
