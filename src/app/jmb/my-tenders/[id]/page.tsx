"use client";
import React from "react";
import { useParams } from "next/navigation";
import TenderDetail from "@/components/tender/TenderDetail";

export default function TenderDetailsPage() {
  const params = useParams();
  const { id } = params;

  return (
    <TenderDetail 
      tenderId={id as string} 
      backUrl="/jmb/my-tenders" 
      backLabel="Back" 
      userType="jmb" 
    />
  );
}
