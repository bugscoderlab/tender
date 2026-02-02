"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { ChevronLeftIcon, CheckCircleIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { API_BASE_URL } from "@/config";

function ContractorDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [services, setServices] = useState({
    propertyManagement: false,
    security: false,
    cleaning: false,
    landscaping: false,
    maintenance: false,
    others: false,
  });

  const handleServiceChange = (key: keyof typeof services) => (checked: boolean) => {
    setServices((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      alert("Email not found. Please start from the sign up page.");
      router.push("/signup");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const companyName = formData.get("companyName");
    const ssmNumber = formData.get("ssmNumber");
    const companyAddress = formData.get("companyAddress");
    const phoneNumber = formData.get("phoneNumber");

    const remark = {
      companyName,
      ssmNumber,
      companyAddress,
      phoneNumber,
      services
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/register/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          remark
        }),
      });

      if (response.ok) {
        // Store email in localStorage for dashboard display
        if (typeof window !== "undefined") {
          localStorage.setItem("user_email", email);
        }
        alert("Registration completed successfully!");
        router.push("/contractor/dashboard");
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signup"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back
        </Link>
      </div>
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
               {/* Using a generic icon or SVG here if specific one not found, trying to match screenshot icon style */}
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
               </svg>
            </div>
            <div>
              <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">
                Contractor Registration
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Register as a service contractor
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center w-full mt-6 mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Account</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4 dark:bg-gray-700"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                <span className="text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Company Details</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <Label>Company Name</Label>
              <Input type="text" name="companyName" placeholder="Your company name" />
            </div>
            <div>
              <Label>SSM Registration Number</Label>
              <Input type="text" name="ssmNumber" placeholder="e.g., 202401012345" />
            </div>
            <div>
              <Label>Company Address (Optional)</Label>
              <Input type="text" name="companyAddress" placeholder="Your company address" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input type="text" name="phoneNumber" placeholder="e.g., 012-3456789" />
            </div>

            <div>
              <Label>Services Offered</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Checkbox 
                  label="Property Management" 
                  checked={services.propertyManagement} 
                  onChange={handleServiceChange('propertyManagement')} 
                />
                <Checkbox 
                  label="Security" 
                  checked={services.security} 
                  onChange={handleServiceChange('security')} 
                />
                <Checkbox 
                  label="Cleaning" 
                  checked={services.cleaning} 
                  onChange={handleServiceChange('cleaning')} 
                />
                <Checkbox 
                  label="Landscaping" 
                  checked={services.landscaping} 
                  onChange={handleServiceChange('landscaping')} 
                />
                <Checkbox 
                  label="Maintenance" 
                  checked={services.maintenance} 
                  onChange={handleServiceChange('maintenance')} 
                />
                <Checkbox 
                  label="Others" 
                  checked={services.others} 
                  onChange={handleServiceChange('others')} 
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Link href="/signup">
                <Button variant="outline" startIcon={<ChevronLeftIcon />}>
                  Back
                </Button>
              </Link>
              <Button>
                Complete Registration
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContractorDetails() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContractorDetailsContent />
    </Suspense>
  );
}
