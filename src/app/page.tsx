"use client";
import React from "react";
import Link from "next/link";
import {
  FileIcon,
  BellIcon,
  CheckCircleIcon,
  GridIcon,
  UserCircleIcon,
  LockIcon,
  BoxCubeIcon,
} from "@/icons";
import Button from "@/components/ui/button/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white font-outfit">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 text-white p-1 rounded-md">
                <BoxCubeIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">JMB Tender System</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-white flex items-center gap-1">
                <LockIcon className="w-4 h-4" /> Admin
              </Link>
              <Link href="/signin" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-white">
                Sign in
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-brand-600 text-white hover:bg-brand-700 dark:bg-white dark:text-gray-900">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Malaysia&apos;s Centralized Tender <br className="hidden md:block" />
          Submission Platform
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          Connecting Joint Management Bodies with qualified contractors for property management services. Post tenders, manage submissions, and find the right partners—all in one place.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup?type=jmb">
            <Button size="lg" className="w-full sm:w-auto bg-brand-600 text-white hover:bg-brand-700 dark:bg-white dark:text-gray-900">
              Register as JMB Member
            </Button>
          </Link>
          <Link href="/signup?type=contractor">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Register as Contractor
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-brand-50/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
                title: "Post Tenders",
                desc: "JMB members create and post tenders for services like property management, security, cleaning, and more."
              },
              {
                icon: <LockIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
                title: "Admin Review",
                desc: "All tenders go through an approval process to ensure quality and compliance before going live."
              },
              {
                icon: <BellIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
                title: "Get Notified",
                desc: "Contractors receive instant notifications when new tenders matching their services are posted."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-brand-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-brand-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For JMB Members */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">For JMB Members</h2>
            <ul className="space-y-4">
              {[
                "Create and manage tenders for various property services",
                "Upload tender documents and specifications",
                "Track tender status from submission to approval",
                "Reach qualified contractors across Malaysia"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="bg-brand-50 dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-gray-700 flex items-center justify-center">
                   <GridIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">JMB Member Dashboard</div>
                  <div className="text-xs text-gray-500">Manage all your tenders</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-brand-200 dark:border-gray-700 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Active Tenders</div>
                  <div className="text-3xl font-bold text-brand-600 dark:text-white">12</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-brand-200 dark:border-gray-700 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Pending Approval</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Contractors */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 w-full">
              <div className="bg-brand-50 dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm">
                 <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-gray-700 flex items-center justify-center">
                     <UserCircleIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Contractor Dashboard</div>
                    <div className="text-xs text-gray-500">Browse opportunities</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-brand-200 dark:border-gray-700 shadow-sm">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">Property Management Tender</div>
                    <div className="text-xs text-brand-500 mb-2">Vista Komanwel Condominium</div>
                    <div className="text-xs text-gray-500">Deadline: 15 Jan 2026</div>
                  </div>
                   <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-brand-200 dark:border-gray-700 shadow-sm">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">Security Services Tender</div>
                    <div className="text-xs text-brand-500 mb-2">Menara Harmoni</div>
                    <div className="text-xs text-gray-500">Deadline: 20 Jan 2026</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">For Contractors</h2>
              <ul className="space-y-4">
                {[
                  "Browse all approved tenders in one centralized platform",
                  "Filter tenders by service category and deadline",
                  "Download tender documents and specifications",
                  "Get notified when new relevant tenders are posted"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-4">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Ready to Get Started?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Join Malaysia&apos;s leading tender submission platform for property management services.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-brand-600 text-white hover:bg-brand-700 dark:bg-white dark:text-gray-900">
            Create Your Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500">
        © 2026 JMB Tender System. All rights reserved.
      </footer>
    </div>
  );
}
