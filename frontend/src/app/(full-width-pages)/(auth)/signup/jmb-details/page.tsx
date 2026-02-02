"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import Link from "next/link";
import { ChevronLeftIcon, CheckCircleIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { API_BASE_URL } from "@/config";

function JMBDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      alert("Email not found. Please start from the sign up page.");
      router.push("/signup");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const jmbName = formData.get("jmbName");
    const cobNumber = formData.get("cobNumber");
    const strataName = formData.get("strataName");
    const totalUnits = formData.get("totalUnits");
    const strataAddress = formData.get("strataAddress");
    const chairpersonName = formData.get("chairpersonName");
    const chairpersonContact = formData.get("chairpersonContact");

    const remark = {
      jmbName,
      cobNumber,
      strataName,
      totalUnits,
      strataAddress,
      chairpersonName,
      chairpersonContact
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
        router.push("/jmb/dashboard");
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
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto mb-10">
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="3" y="21" width="18" height="2" rx="0" ry="0"></rect>
                 <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"></path>
                 <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10"></path>
               </svg>
            </div>
            <div>
              <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">
                JMB Member Registration
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Register as a Joint Management Body member
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
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">JMB Details</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* JMB Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">JMB Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-1">
                  <Label>JMB Legal Name (as per COB)</Label>
                  <Input type="text" name="jmbName" placeholder="e.g., Badan Pengurusan Bersama Vista Kon" />
                </div>
                <div className="sm:col-span-1">
                  <Label>COB Registration Number</Label>
                  <Input type="text" name="cobNumber" placeholder="e.g., COB/2024/12345" />
                </div>
              </div>
            </div>

            {/* Strata Scheme Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Strata Scheme Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-1">
                  <Label>Strata Scheme Name</Label>
                  <Input type="text" name="strataName" placeholder="e.g., Vista Komanwel Condominium" />
                </div>
                <div className="sm:col-span-1">
                  <Label>Total Units/Parcels</Label>
                  <Input type="number" name="totalUnits" placeholder="e.g., 250" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Strata Address</Label>
                  <Input type="text" name="strataAddress" placeholder="Full address of the strata scheme" />
                </div>
              </div>
            </div>

            {/* Chairperson Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Chairperson Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-1">
                  <Label>Chairperson Name</Label>
                  <Input type="text" name="chairpersonName" placeholder="Full name of chairperson" />
                </div>
                <div className="sm:col-span-1">
                  <Label>Contact Number</Label>
                  <Input type="text" name="chairpersonContact" placeholder="e.g., 012-3456789" />
                </div>
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

export default function JMBDetails() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JMBDetailsContent />
    </Suspense>
  );
}
