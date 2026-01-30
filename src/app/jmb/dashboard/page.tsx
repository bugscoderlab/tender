"use client";
import React from "react";
import Link from "next/link";
import {
  PlusIcon,
  ListIcon,
  FileIcon,
  TimeIcon,
  CheckCircleIcon,
  CloseIcon,
  DocsIcon
} from "@/icons/index";
import Button from "@/components/ui/button/Button";

export default function JMBDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your tenders
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Link href="/jmb/create-tender" className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
            <PlusIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Create New Tender
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Post a new tender for services
            </p>
          </div>
        </Link>

        <Link href="/jmb/my-tenders" className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <ListIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              View All Tenders
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse and manage your tenders
            </p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Tenders
            </span>
            <span className="text-gray-400">
              <FileIcon className="w-5 h-5" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            0
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending Approval
            </span>
            <span className="text-gray-400">
              <TimeIcon className="w-5 h-5" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            0
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Approved / Published
            </span>
            <span className="text-gray-400">
              <CheckCircleIcon className="w-5 h-5" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            0
          </h4>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Rejected
            </span>
            <span className="text-gray-400">
              <CloseIcon className="w-5 h-5" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            0
          </h4>
        </div>
      </div>

      {/* Recent Tenders */}
      <div className="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 p-6 min-h-[300px]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Tenders
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your latest tender submissions
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 dark:bg-gray-800">
             <FileIcon className="w-8 h-8" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            No tenders yet
          </p>
          <Button startIcon={<PlusIcon />}>
            Create your first tender
          </Button>
        </div>
      </div>
    </div>
  );
}
