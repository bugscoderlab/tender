"use client";
import React from "react";
import { useParams } from "next/navigation";
import TenderDetail from "@/components/tender/TenderDetail";

export default function ContractorTenderDetailsPage() {
  const params = useParams();
  const { id } = params;

  return (
    <TenderDetail 
      tenderId={id as string} 
      backUrl="/contractor/dashboard" 
      backLabel="Back to Dashboard" 
      userType="contractor" 
    />
  );
}
