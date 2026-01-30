"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, TrashBinIcon, PlusIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";

interface EvaluationCriteria {
  criteria: string;
  weight: number;
}

export default function CreateTenderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [criteriaList, setCriteriaList] = useState<EvaluationCriteria[]>([
    { criteria: "Price competitiveness", weight: 30 },
    { criteria: "Experience & track record", weight: 25 },
    { criteria: "Staff qualifications", weight: 20 },
    { criteria: "Proposed methodology", weight: 15 },
    { criteria: "Equipment & resources", weight: 10 },
  ]);

  // Calculated total weight
  const totalWeight = criteriaList.reduce((sum, item) => sum + item.weight, 0);

  // Form State (using a single object for simplicity, though separate states work too)
  const [formData, setFormData] = useState({
    title: "",
    service_type: "",
    property_name: "Kirby Mcclain", // Default/Mock value
    property_address: "Qui eius architecto", // Default/Mock value
    scope_of_work: "",
    contract_period_months: 12,
    min_budget: "",
    max_budget: "",
    closing_date: "",
    closing_time: "",
    site_visit_date: "",
    site_visit_time: "",
    contact_person: "Iris Holmes", // Default/Mock value
    contact_email: "tusu@mailinator.com", // Default/Mock value
    contact_phone: "0124315251", // Default/Mock value
    tender_fee: "",
  });

  const [requiredLicenses, setRequiredLicenses] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, scope_of_work: value }));
  };

  const handleCriteriaChange = (index: number, field: keyof EvaluationCriteria, value: string | number) => {
    const newList = [...criteriaList];
    newList[index] = { ...newList[index], [field]: value };
    setCriteriaList(newList);
  };

  const addCriteria = () => {
    setCriteriaList([...criteriaList, { criteria: "", weight: 0 }]);
  };

  const removeCriteria = (index: number) => {
    const newList = [...criteriaList];
    newList.splice(index, 1);
    setCriteriaList(newList);
  };

  const handleLicenseChange = (license: string) => {
    if (requiredLicenses.includes(license)) {
      setRequiredLicenses(requiredLicenses.filter((l) => l !== license));
    } else {
      setRequiredLicenses([...requiredLicenses, license]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You are not logged in.");
        router.push("/signin");
        return;
      }

      // Prepare payload matching backend schema
      const payload = {
        ...formData,
        contract_period_months: Number(formData.contract_period_months),
        min_budget: formData.min_budget ? Number(formData.min_budget) : null,
        max_budget: formData.max_budget ? Number(formData.max_budget) : null,
        tender_fee: formData.tender_fee ? Number(formData.tender_fee) : null,
        required_licenses: requiredLicenses,
        evaluation_criteria: criteriaList,
        tender_documents: [], // Placeholder for file upload
        // site_visit fields are optional, empty strings should be null
        site_visit_date: formData.site_visit_date || null,
        site_visit_time: formData.site_visit_time || null,
      };

      const response = await fetch("http://localhost:8000/tenders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Tender created successfully!");
        router.push("/jmb/dashboard");
      } else {
        const errorData = await response.json();
        alert(`Failed to create tender: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating tender:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-6">
        <Link
          href="/jmb/dashboard"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back to Tenders
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Basic Information</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Enter the tender title and service type</p>
          
          <div className="space-y-4">
            <div>
              <Label>Tender Title *</Label>
              <Input
                type="text"
                name="title"
                placeholder="e.g., Security Services Contract 2026"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Service Type *</Label>
              <div className="relative">
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-sm text-gray-800 bg-transparent border border-gray-200 rounded-lg focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:border-gray-800 dark:text-white/90"
                >
                  <option value="" disabled>Select service type</option>
                  <option value="Security">Security</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Pest Control">Pest Control</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Property Details</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Information about the property (auto-filled from your profile)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Property Name</Label>
              <Input
                type="text"
                name="property_name"
                value={formData.property_name}
                onChange={handleInputChange}
                disabled // Read-only as per screenshot implication
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <Label>Property Address</Label>
              <Input
                type="text"
                name="property_address"
                value={formData.property_address}
                onChange={handleInputChange}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Scope & Duration */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Scope & Duration</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Describe the work required and contract duration</p>
          
          <div className="space-y-4">
            <div>
              <Label>Scope of Work *</Label>
              <TextArea
                name="scope_of_work"
                placeholder="Describe the services required, scope of work, and any specific requirements..."
                value={formData.scope_of_work}
                onChange={(value) => handleTextAreaChange(value)}
                required
                rows={6}
              />
            </div>
            <div>
              <Label>Contract Period (Months) *</Label>
              <Input
                type="number"
                name="contract_period_months"
                placeholder="e.g., 12"
                value={formData.contract_period_months}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Budget Range */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Budget Range</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Optional budget range for this tender</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Minimum Budget (RM)</Label>
              <Input
                type="number"
                name="min_budget"
                placeholder="e.g., 50000"
                value={formData.min_budget}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Maximum Budget (RM)</Label>
              <Input
                type="number"
                name="max_budget"
                placeholder="e.g., 100000"
                value={formData.max_budget}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Timeline</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Set the closing date and optional site visit</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Closing Date *</Label>
              <Input
                type="date"
                name="closing_date"
                value={formData.closing_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Closing Time *</Label>
              <Input
                type="time"
                name="closing_time"
                value={formData.closing_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Site Visit Date (Optional)</Label>
              <Input
                type="date"
                name="site_visit_date"
                value={formData.site_visit_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Site Visit Time (Optional)</Label>
              <Input
                type="time"
                name="site_visit_time"
                value={formData.site_visit_time}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Contact Information</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Contact person for tender inquiries (auto-filled from your profile)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Contact Person *</Label>
              <Input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Contact Email *</Label>
              <Input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Contact Phone *</Label>
              <Input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Required Licenses */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Required Licenses</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Select the licenses contractors must have</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["PPKBM License", "KKM Pest Control License", "CIDB Registration", "BOMBA Certificate", "ISO 9001 Certification", "MOF Registration", "Others"].map((license) => (
              <div key={license} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={license}
                  checked={requiredLicenses.includes(license)}
                  onChange={() => handleLicenseChange(license)}
                  className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                />
                <label htmlFor={license} className="text-sm text-gray-700 dark:text-gray-300">
                  {license}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Evaluation Criteria</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Define how bids will be evaluated (weights must sum to 100%)</p>
          
          <div className="space-y-4">
            {criteriaList.map((item, index) => (
              <div key={index} className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Criteria Name"
                    value={item.criteria}
                    onChange={(e) => handleCriteriaChange(index, "criteria", e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    placeholder="Weight %"
                    value={item.weight}
                    onChange={(e) => handleCriteriaChange(index, "weight", Number(e.target.value))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCriteria(index)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <TrashBinIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={addCriteria}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-500 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors dark:bg-brand-500/10 dark:hover:bg-brand-500/20"
              >
                <PlusIcon className="w-4 h-4" />
                Add Criteria
              </button>
              <div className="text-sm font-medium">
                Total: <span className={totalWeight === 100 ? "text-green-500" : "text-red-500"}>{totalWeight}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tender Fee */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Tender Fee</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Optional fee for tender documents</p>
          
          <div>
            <Label>Tender Fee (RM)</Label>
            <Input
              type="number"
              name="tender_fee"
              placeholder="e.g., 500"
              value={formData.tender_fee}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Tender Documents */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Tender Documents</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Upload supporting documents for this tender</p>
          
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
             {/* Using a placeholder for DropZone as exact import/usage needs verification, but UI wise this mimics it */}
             <div className="mb-4 p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                <PlusIcon className="w-6 h-6 text-brand-500" /> 
             </div>
             <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">
               Click to upload or drag and drop
             </p>
             <p className="text-xs text-gray-500 dark:text-gray-400">
               PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
             </p>
          </div>
        </div>

        <div className="flex justify-end pt-6">
            <Button className="w-full sm:w-auto" disabled={loading}>
                {loading ? "Submitting..." : "Submit for Approval"}
            </Button>
        </div>

      </form>
    </div>
  );
}
