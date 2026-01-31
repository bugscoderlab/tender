"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeftIcon, TrashBinIcon, PlusIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";

interface EvaluationCriteria {
  criteria: string;
  weight: number;
}

interface TenderData {
  id: number;
  user_id: number;
  status: string;
  title: string;
  service_type: string;
  property_name?: string;
  property_address?: string;
  scope_of_work: string;
  contract_period_months: number;
  min_budget?: number;
  max_budget?: number;
  closing_date: string;
  closing_time: string;
  site_visit_date?: string;
  site_visit_time?: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  required_licenses: string[];
  evaluation_criteria: EvaluationCriteria[];
  tender_fee?: number;
  tender_documents?: string[];
}

export default function TenderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tender, setTender] = useState<TenderData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    service_type: "",
    property_name: "",
    property_address: "",
    scope_of_work: "",
    contract_period_months: 12,
    min_budget: "",
    max_budget: "",
    closing_date: "",
    closing_time: "",
    site_visit_date: "",
    site_visit_time: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    tender_fee: "",
  });

  const [requiredLicenses, setRequiredLicenses] = useState<string[]>([]);
  const [criteriaList, setCriteriaList] = useState<EvaluationCriteria[]>([]);
  const [newLicense, setNewLicense] = useState("");
  const [newCriteria, setNewCriteria] = useState({ criteria: "", weight: 0 });
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchTenderDetails();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      const response = await fetch(`http://localhost:8000/tenders/${tenderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data: TenderData = await response.json();
        setTender(data);
        
        // Populate form data
        setFormData({
          title: data.title,
          service_type: data.service_type,
          property_name: data.property_name || "",
          property_address: data.property_address || "",
          scope_of_work: data.scope_of_work,
          contract_period_months: data.contract_period_months,
          min_budget: data.min_budget?.toString() || "",
          max_budget: data.max_budget?.toString() || "",
          closing_date: data.closing_date.split('T')[0],
          closing_time: data.closing_time,
          site_visit_date: data.site_visit_date?.split('T')[0] || "",
          site_visit_time: data.site_visit_time || "",
          contact_person: data.contact_person,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          tender_fee: data.tender_fee?.toString() || "",
        });
        
        setRequiredLicenses(data.required_licenses || []);
        setCriteriaList(data.evaluation_criteria || []);
      } else if (response.status === 401) {
        router.push("/auth/sign-in");
      } else {
        console.error("Failed to fetch tender");
      }
    } catch (error) {
      console.error("Error fetching tender:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLicense = () => {
    if (newLicense.trim()) {
      setRequiredLicenses([...requiredLicenses, newLicense.trim()]);
      setNewLicense("");
    }
  };

  const handleRemoveLicense = (index: number) => {
    setRequiredLicenses(requiredLicenses.filter((_, i) => i !== index));
  };

  const handleAddCriteria = () => {
    if (newCriteria.criteria.trim() && newCriteria.weight > 0) {
      setCriteriaList([...criteriaList, newCriteria]);
      setNewCriteria({ criteria: "", weight: 0 });
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setCriteriaList(criteriaList.filter((_, i) => i !== index));
  };

  const getTotalWeight = () => {
    return criteriaList.reduce((sum, item) => sum + item.weight, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.title || !formData.service_type || !formData.scope_of_work ||
        !formData.closing_date || !formData.closing_time || !formData.contact_person ||
        !formData.contact_email || !formData.contact_phone) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate evaluation criteria weight
    const totalWeight = getTotalWeight();
    if (totalWeight !== 100 && totalWeight !== 0) {
      alert("Evaluation criteria total weight must equal 100% (or remove all criteria).");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You need to be logged in to update a tender.");
        router.push("/auth/sign-in");
        return;
      }

      // Verify token is still valid
      const verifyResponse = await fetch("http://localhost:8000/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!verifyResponse.ok) {
        alert("Session expired. Please sign in again.");
        router.push("/auth/sign-in");
        return;
      }

      const payload = {
        title: formData.title,
        service_type: formData.service_type,
        property_name: formData.property_name || null,
        property_address: formData.property_address || null,
        scope_of_work: formData.scope_of_work,
        contract_period_months: Number(formData.contract_period_months),
        min_budget: formData.min_budget ? parseFloat(formData.min_budget) : null,
        max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null,
        closing_date: formData.closing_date,
        closing_time: formData.closing_time,
        site_visit_date: formData.site_visit_date || null,
        site_visit_time: formData.site_visit_time || null,
        contact_person: formData.contact_person,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        required_licenses: requiredLicenses,
        evaluation_criteria: criteriaList,
        tender_fee: formData.tender_fee ? parseFloat(formData.tender_fee) : null,
        tender_documents: [],
      };

      const response = await fetch(`http://localhost:8000/tenders/${tenderId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedTender = await response.json();
        setTender(updatedTender);
        alert("Tender updated successfully!");
        setIsEditMode(false);
      } else {
        const error = await response.json();
        alert(`Failed to update tender: ${error.detail || "Unknown error"}`);
      }
      
    } catch (error) {
      console.error("Error updating tender:", error);
      alert("Failed to update tender. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderEditMode = () => {
    return (
      <form onSubmit={handleSave} className="space-y-8">
        {/* Tender Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Tender Details
          </h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Tender Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Security Services Contract 2026"
              />
            </div>

            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Select a service type</option>
                <option value="Security">Security</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Lift Maintenance">Lift Maintenance</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Property Information Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Property Information
          </h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="property_name">Property Name</Label>
              <Input
                id="property_name"
                name="property_name"
                value={formData.property_name}
                onChange={handleInputChange}
                placeholder="e.g., Taman Melati Condominium"
              />
            </div>

            <div>
              <Label htmlFor="property_address">Property Address</Label>
              <TextArea
                name="property_address"
                value={formData.property_address}
                onChange={(value) => handleInputChange({ target: { name: "property_address", value } } as any)}
                placeholder="Full address of the property"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Scope & Requirements Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Scope & Requirements
          </h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="scope_of_work">Scope of Work *</Label>
              <TextArea
                name="scope_of_work"
                value={formData.scope_of_work}
                onChange={(value) => handleInputChange({ target: { name: "scope_of_work", value } } as any)}
                placeholder="Describe the work requirements, deliverables, and expectations..."
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="contract_period_months">Contract Period (Months) *</Label>
              <Input
                type="number"
                id="contract_period_months"
                name="contract_period_months"
                value={formData.contract_period_months}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div>
              <Label>Required Licenses/Certifications</Label>
              <div className="space-y-2">
                {requiredLicenses.map((license, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={license} disabled className="flex-1" />
                    <button
                      type="button"
                      onClick={() => handleRemoveLicense(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <TrashBinIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLicense}
                    onChange={(e) => setNewLicense(e.target.value)}
                    placeholder="Add a license requirement"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLicense())}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <Button type="button" onClick={handleAddLicense} startIcon={<PlusIcon />}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Evaluation Criteria (Total weight must equal 100%)</Label>
              <div className="space-y-2">
                {criteriaList.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item.criteria} disabled className="flex-1" />
                    <Input value={`${item.weight}%`} disabled className="w-24" />
                    <button
                      type="button"
                      onClick={() => handleRemoveCriteria(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <TrashBinIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newCriteria.criteria}
                    onChange={(e) => setNewCriteria({ ...newCriteria, criteria: e.target.value })}
                    placeholder="Criteria name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={newCriteria.weight || ""}
                    onChange={(e) => setNewCriteria({ ...newCriteria, weight: parseFloat(e.target.value) || 0 })}
                    placeholder="Weight %"
                    className="w-24"
                  />
                  <Button type="button" onClick={handleAddCriteria} startIcon={<PlusIcon />}>
                    Add
                  </Button>
                </div>
                <div className="text-sm font-medium">
                  Total Weight: {getTotalWeight()}%
                  {getTotalWeight() !== 100 && getTotalWeight() !== 0 && (
                    <span className="text-red-500 ml-2">(Must equal 100%)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Timeline Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Budget & Timeline
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_budget">Minimum Budget (RM)</Label>
                <Input
                  type="number"
                  id="min_budget"
                  name="min_budget"
                  value={formData.min_budget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="max_budget">Maximum Budget (RM)</Label>
                <Input
                  type="number"
                  id="max_budget"
                  name="max_budget"
                  value={formData.max_budget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="closing_date">Closing Date *</Label>
                <Input
                  type="date"
                  id="closing_date"
                  name="closing_date"
                  value={formData.closing_date}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="closing_time">Closing Time *</Label>
                <Input
                  type="time"
                  id="closing_time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site_visit_date">Site Visit Date (Optional)</Label>
                <Input
                  type="date"
                  id="site_visit_date"
                  name="site_visit_date"
                  value={formData.site_visit_date}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="site_visit_time">Site Visit Time (Optional)</Label>
                <Input
                  type="time"
                  id="site_visit_time"
                  name="site_visit_time"
                  value={formData.site_visit_time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tender_fee">Tender Fee (RM)</Label>
              <Input
                type="number"
                id="tender_fee"
                name="tender_fee"
                value={formData.tender_fee}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Contact Information
          </h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="Full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="+60123456789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditMode(false);
              fetchTenderDetails();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    );
  };

  const renderViewMode = () => {
    return (
      <div className="space-y-8">
        {/* Tender Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Tender Details
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tender Title</h4>
              <p className="mt-1 text-gray-800 dark:text-white">{formData.title}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Service Type</h4>
              <p className="mt-1 text-gray-800 dark:text-white">{formData.service_type}</p>
            </div>
          </div>
        </div>

        {/* Property Information Section */}
        {(formData.property_name || formData.property_address) && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Property Information
            </h2>
            <div className="space-y-4">
              {formData.property_name && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Property Name</h4>
                  <p className="mt-1 text-gray-800 dark:text-white">{formData.property_name}</p>
                </div>
              )}
              {formData.property_address && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Property Address</h4>
                  <p className="mt-1 text-gray-800 dark:text-white whitespace-pre-wrap">{formData.property_address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scope & Requirements Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Scope & Requirements
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Scope of Work</h4>
              <p className="mt-1 text-gray-800 dark:text-white whitespace-pre-wrap">{formData.scope_of_work}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Contract Period</h4>
              <p className="mt-1 text-gray-800 dark:text-white">{formData.contract_period_months} months</p>
            </div>
            {requiredLicenses.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Required Licenses/Certifications</h4>
                <ul className="mt-1 list-disc list-inside text-gray-800 dark:text-white">
                  {requiredLicenses.map((license, index) => (
                    <li key={index}>{license}</li>
                  ))}
                </ul>
              </div>
            )}
            {criteriaList.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">Evaluation Criteria</h4>
                <div className="space-y-2">
                  {criteriaList.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded">
                      <span className="text-gray-800 dark:text-white">{item.criteria}</span>
                      <span className="font-medium text-brand-500">{item.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Budget & Timeline Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Budget & Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.min_budget || formData.max_budget) && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Budget Range</h4>
                <p className="mt-1 text-gray-800 dark:text-white">
                  {formData.min_budget && formData.max_budget
                    ? `RM ${parseFloat(formData.min_budget).toLocaleString()} - RM ${parseFloat(formData.max_budget).toLocaleString()}`
                    : formData.min_budget
                    ? `From RM ${parseFloat(formData.min_budget).toLocaleString()}`
                    : formData.max_budget
                    ? `Up to RM ${parseFloat(formData.max_budget).toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>
            )}
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Closing Date & Time</h4>
              <p className="mt-1 text-gray-800 dark:text-white">
                {new Date(formData.closing_date).toLocaleDateString()} at {formData.closing_time}
              </p>
            </div>
            {formData.site_visit_date && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Site Visit Date & Time</h4>
                <p className="mt-1 text-gray-800 dark:text-white">
                  {new Date(formData.site_visit_date).toLocaleDateString()}
                  {formData.site_visit_time && ` at ${formData.site_visit_time}`}
                </p>
              </div>
            )}
            {formData.tender_fee && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tender Fee</h4>
                <p className="mt-1 text-gray-800 dark:text-white">RM {parseFloat(formData.tender_fee).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Contact Person</h4>
              <p className="mt-1 text-gray-800 dark:text-white">{formData.contact_person}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email</h4>
                <p className="mt-1 text-gray-800 dark:text-white">{formData.contact_email}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Phone</h4>
                <p className="mt-1 text-gray-800 dark:text-white">{formData.contact_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    const isDisabled = !isEditMode;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Tender Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Security Services Contract 2026"
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                disabled={isDisabled}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
              >
                <option value="">Select a service type</option>
                <option value="Security">Security</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Lift Maintenance">Lift Maintenance</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="property_name">Property Name</Label>
              <Input
                id="property_name"
                name="property_name"
                value={formData.property_name}
                onChange={handleInputChange}
                placeholder="e.g., Taman Melati Condominium"
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label htmlFor="property_address">Property Address</Label>
              <TextArea
                name="property_address"
                value={formData.property_address}
                onChange={(value) => handleInputChange({ target: { name: "property_address", value } } as any)}
                placeholder="Full address of the property"
                rows={3}
                disabled={isDisabled}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="scope_of_work">Scope of Work *</Label>
              <TextArea
                name="scope_of_work"
                value={formData.scope_of_work}
                onChange={(value) => handleInputChange({ target: { name: "scope_of_work", value } } as any)}
                placeholder="Describe the work requirements, deliverables, and expectations..."
                rows={8}
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label htmlFor="contract_period_months">Contract Period (Months) *</Label>
              <Input
                type="number"
                id="contract_period_months"
                name="contract_period_months"
                value={formData.contract_period_months}
                onChange={handleInputChange}
                min="1"
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label>Required Licenses/Certifications</Label>
              <div className="space-y-2">
                {requiredLicenses.map((license, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={license} disabled className="flex-1" />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLicense(index)}
                        className="p-2 text-red-500 hover:text-red-600"
                      >
                        <TrashBinIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditMode && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLicense}
                      onChange={(e) => setNewLicense(e.target.value)}
                      placeholder="Add a license requirement"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLicense())}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    <Button type="button" onClick={handleAddLicense} startIcon={<PlusIcon />}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Evaluation Criteria (Total weight must equal 100%)</Label>
              <div className="space-y-2">
                {criteriaList.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item.criteria} disabled className="flex-1" />
                    <Input value={`${item.weight}%`} disabled className="w-24" />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriteria(index)}
                        className="p-2 text-red-500 hover:text-red-600"
                      >
                        <TrashBinIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditMode && (
                  <div className="flex gap-2">
                    <Input
                      value={newCriteria.criteria}
                      onChange={(e) => setNewCriteria({ ...newCriteria, criteria: e.target.value })}
                      placeholder="Criteria name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={newCriteria.weight || ""}
                      onChange={(e) => setNewCriteria({ ...newCriteria, weight: parseFloat(e.target.value) || 0 })}
                      placeholder="Weight %"
                      className="w-24"
                    />
                    <Button type="button" onClick={handleAddCriteria} startIcon={<PlusIcon />}>
                      Add
                    </Button>
                  </div>
                )}
                <div className="text-sm font-medium">
                  Total Weight: {getTotalWeight()}%
                  {getTotalWeight() !== 100 && getTotalWeight() !== 0 && (
                    <span className="text-red-500 ml-2">(Must equal 100%)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_budget">Minimum Budget (RM)</Label>
                <Input
                  type="number"
                  id="min_budget"
                  name="min_budget"
                  value={formData.min_budget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={isDisabled}
                />
              </div>

              <div>
                <Label htmlFor="max_budget">Maximum Budget (RM)</Label>
                <Input
                  type="number"
                  id="max_budget"
                  name="max_budget"
                  value={formData.max_budget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={isDisabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="closing_date">Closing Date *</Label>
                <Input
                  type="date"
                  id="closing_date"
                  name="closing_date"
                  value={formData.closing_date}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                />
              </div>

              <div>
                <Label htmlFor="closing_time">Closing Time *</Label>
                <Input
                  type="time"
                  id="closing_time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site_visit_date">Site Visit Date (Optional)</Label>
                <Input
                  type="date"
                  id="site_visit_date"
                  name="site_visit_date"
                  value={formData.site_visit_date}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                />
              </div>

              <div>
                <Label htmlFor="site_visit_time">Site Visit Time (Optional)</Label>
                <Input
                  type="time"
                  id="site_visit_time"
                  name="site_visit_time"
                  value={formData.site_visit_time}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="Full name"
                disabled={isDisabled}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  disabled={isDisabled}
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="+60123456789"
                  disabled={isDisabled}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tender_fee">Tender Fee (RM)</Label>
              <Input
                type="number"
                id="tender_fee"
                name="tender_fee"
                value={formData.tender_fee}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={isDisabled}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Review Your Tender</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tender Title</h4>
                  <p className="mt-1">{formData.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Service Type</h4>
                  <p className="mt-1">{formData.service_type}</p>
                </div>

                {formData.property_name && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Property</h4>
                    <p className="mt-1">{formData.property_name}</p>
                    {formData.property_address && <p className="text-sm text-gray-600 dark:text-gray-400">{formData.property_address}</p>}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Budget Range</h4>
                  <p className="mt-1">
                    {formData.min_budget && formData.max_budget
                      ? `RM ${parseFloat(formData.min_budget).toLocaleString()} - RM ${parseFloat(formData.max_budget).toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Closing Date & Time</h4>
                  <p className="mt-1">
                    {formData.closing_date} at {formData.closing_time}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Contact Person</h4>
                  <p className="mt-1">{formData.contact_person}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.contact_email} | {formData.contact_phone}
                  </p>
                </div>

                {requiredLicenses.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Required Licenses</h4>
                    <ul className="mt-1 list-disc list-inside">
                      {requiredLicenses.map((license, index) => (
                        <li key={index}>{license}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {criteriaList.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Evaluation Criteria</h4>
                    <ul className="mt-1 space-y-1">
                      {criteriaList.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{item.criteria}</span>
                          <span className="font-medium">{item.weight}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading tender details...</p>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Tender not found</p>
        <Link href="/jmb/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/jmb/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isEditMode ? "Edit Tender" : "Tender Details"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: <span className="font-medium capitalize">{tender.status}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditMode && (
            <>
              <Link href={`/jmb/tender/${tenderId}/bids`}>
                <Button variant="outline">
                  View Bids
                </Button>
              </Link>
              <Button onClick={() => setIsEditMode(true)}>
                Edit Tender
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        {isEditMode ? renderEditMode() : renderViewMode()}
      </div>
    </div>
  );
}
