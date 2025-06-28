"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { Sparkles } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
const API_URL = process.env.NEXT_PUBLIC_API_URL 

// Define the steps of the form
const steps = [
  { id: "category", title: "Category & Type" },
  { id: "location", title: "Location Details" },
  { id: "complaint", title: "Complaint Details" },
  { id: "visibility", title: "Visibility & Urgency" },
  { id: "review", title: "Review & Submit" },
]

// Categories from seed.ts
const categories = [
  { id: "infra", name: "Infrastructure", assignedDepartment: "Infrastructure" },
  { id: "edu", name: "Education", assignedDepartment: "Education" },
  { id: "revenue", name: "Revenue", assignedDepartment: "Revenue" },
  { id: "health", name: "Health", assignedDepartment: "Health" },
  { id: "water", name: "Water Supply & Sanitation", assignedDepartment: "Water Supply & Sanitation" },
  { id: "power", name: "Electricity & Power", assignedDepartment: "Electricity & Power" },
  { id: "transport", name: "Transportation", assignedDepartment: "Transportation" },
  { id: "municipal", name: "Municipal Services", assignedDepartment: "Municipal Services" },
  { id: "police", name: "Police Services", assignedDepartment: "Police Services" },
  { id: "env", name: "Environment", assignedDepartment: "Environment" },
  { id: "housing", name: "Housing & Urban Development", assignedDepartment: "Housing & Urban Development" },
  { id: "welfare", name: "Social Welfare", assignedDepartment: "Social Welfare" },
  { id: "grievance", name: "Public Grievances", assignedDepartment: "Public Grievances" },
]

const urgencyLevels = [
  { value: "LOW", label: "Low - Can wait" },
  { value: "MEDIUM", label: "Medium - Within a week" },
  { value: "HIGH", label: "High - Urgent" },
  { value: "CRITICAL", label: "Critical - Emergency" },
]

export default function ComplaintForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    categoryId: "",
    categoryName: "",
    assignedDepartment: "",
    subCategory: "",
    pin: "",
    district: "",
    city: "",
    locality: "",
    street: "",
    latitude: "",
    longitude: "",
    description: "",
    attachmentUrl: "",
    urgency: "",
    isPublic: true,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false);
  

  const router = useRouter()

  const updateFields = (fields: any) => {
    setFormData((prev) => ({ ...prev, ...fields }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      Object.keys(fields).forEach((key) => delete newErrors[key])
      return newErrors
    })
  }

  const validateStep = (stepIndex: number) => {
    const newErrors: { [key: string]: string } = {}

    if (stepIndex === 0) {
      if (!formData.categoryId) newErrors.categoryId = "Please select a category"
      if (!formData.subCategory) newErrors.subCategory = "Please enter a sub-category"
    } else if (stepIndex === 1) {
      if (!formData.pin || formData.pin.length !== 6) newErrors.pin = "Enter a valid 6-digit PIN code"
      if (!formData.district) newErrors.district = "Enter a district"
      if (!formData.city) newErrors.city = "Enter a city"
    } else if (stepIndex === 2) {
      if (!formData.description) newErrors.description = "Provide a description"
      if (formData.description.length > 500) newErrors.description = "Description cannot exceed 500 characters"
    } else if (stepIndex === 3) {
      if (!formData.urgency) newErrors.urgency = "Select an urgency level"
    } else if (stepIndex === 4) {
      // Final validation before submit
      if (!formData.categoryId) newErrors.categoryId = "Category is required"
      if (!formData.subCategory) newErrors.subCategory = "Sub-category is required"
      if (!formData.pin || formData.pin.length !== 6) newErrors.pin = "Valid 6-digit PIN code is required"
      if (!formData.district) newErrors.district = "District is required"
      if (!formData.city) newErrors.city = "City is required"
      if (!formData.description) newErrors.description = "Description is required"
      if (!formData.urgency) newErrors.urgency = "Urgency level is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsSubmitting(true)

    try {
      // Prepare the payload exactly as expected by the backend
      const payload = {
        categoryName: formData.categoryName,
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim(),
        urgency: formData.urgency,
        isPublic: formData.isPublic,
        attachmentUrl:   formData.attachmentUrl.trim() !== "" 
                         ? formData.attachmentUrl.trim() 
                         : null,
        location: {
          pin: formData.pin.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          locality: formData.locality.trim() || null,
          street: formData.street.trim() || null,
          latitude: formData.latitude.trim() !== "" 
                      ? parseFloat(formData.latitude) 
                      : null,
          longitude: formData.longitude.trim() !== "" 
                      ? parseFloat(formData.longitude) 
                      : null,
        }
      }

      console.log('Submitting payload:', JSON.stringify(payload, null, 2))

      const response = await fetch(`${API_URL}/api/complaints/newcomplaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()
      console.log('Response:', responseData)

      if (!response.ok) {
        // Handle validation errors from backend
        if (response.status === 400 && responseData.details) {
          const backendErrors: { [key: string]: string } = {}
          responseData.details.forEach((detail: any) => {
            backendErrors[detail.field] = detail.message
          })
          setErrors(backendErrors)
          
          // Go back to the step with errors
          const errorFields = Object.keys(backendErrors)
          if (errorFields.some(field => ['categoryId', 'categoryName', 'subCategory'].includes(field))) {
            setCurrentStep(0)
          } else if (errorFields.some(field => ['pin', 'district', 'city'].includes(field))) {
            setCurrentStep(1)
          } else if (errorFields.some(field => ['description'].includes(field))) {
            setCurrentStep(2)
          } else if (errorFields.some(field => ['urgency'].includes(field))) {
            setCurrentStep(3)
          }
          
          alert(`Validation Error: ${responseData.error || 'Please check the form for errors'}`)
          return
        }
        
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }
       setIsSuccess(true);

      // alert(`Complaint submitted successfully! ID: ${responseData.complaint.id}`)
      
    } catch (error) {
      console.error('Submission error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          alert('Network error: Unable to connect to server. Please check your connection and try again.')
        } else {
          alert(`Failed to submit complaint: ${error.message}`)
        }
      } else {
        alert('Failed to submit complaint. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
      setIsSubmitting(false);
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      updateFields({
        categoryId: category.id,
        categoryName: category.name,
        assignedDepartment: category.assignedDepartment,
        subCategory: ""
      })
    }
  }


const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    setErrors({ attachmentUrl: "File size must be under 5MB" });
    return;
  }

  // Create FormData for upload
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/api/complaints/upload`, {
      method: 'POST',
        credentials: 'include',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    updateFields({ attachmentUrl: data.url });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.attachmentUrl;
      return newErrors;
    });
  } catch (error) {
    console.error('Upload error:', error);
    setErrors({ attachmentUrl: 'Failed to upload file. Please try again.' });
  }
};

  return (
    <div className="w-full max-w-3xl mx-auto p-4 py-20">
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Submit New Complaint</CardTitle>
          <p className="text-sm text-muted-foreground">
            Help us serve you better by providing detailed information
          </p>
          <div className="flex overflow-x-auto space-x-4 mt-4 pb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-shrink-0 ${index <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-sm ${index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-2 border-primary text-primary"
                        : "border-2 border-muted-foreground text-muted-foreground"
                    }`}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                <span className="text-xs text-center max-w-[80px]">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 mb-4 bg-red-50 text-red-800 rounded-lg">
              <p className="font-medium text-sm">Please correct the following errors:</p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Category & Type</h2>
              <div className="grid gap-4">
                <div>
                  {/* New Category Selection */}
                  <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-4 rounded-xl border border-green-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Select a Category</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            Powered by Swaraj AI
                          </span>
                        </div>
                        <br />
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => handleCategoryChange(category.id)}
                              className={`px-3 py-1 rounded-md text-sm border 
                                ${
                                  formData.categoryId === category.id
                                    ? 'bg-green-500 text-white border-green-600'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-transparent hover:bg-green-200 dark:hover:bg-green-800'
                                }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {errors.categoryId && (
                    <p id="categoryId-error" className="text-sm text-red-600 mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {formData.categoryId && (
                  <div>
                    <Label htmlFor="subCategory" className="text-sm">
                      Title *
                    </Label>
                    <Input
                      id="subCategory"
                      placeholder="Enter sub-category"
                      value={formData.subCategory}
                      onChange={(e) => updateFields({ subCategory: e.target.value })}
                      aria-describedby={errors.subCategory ? "subCategory-error" : undefined}
                    />
                    {errors.subCategory && (
                      <p id="subCategory-error" className="text-sm text-red-600 mt-1">
                        {errors.subCategory}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-1">
                      <span>Swaraj AI</span>
                      <Sparkles className="w-4 h-4 text-gray-600" />
                      <span>will standardize your title for better categorization</span>
                    </div>
                  </div>
                )}

                {formData.categoryId && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Assigned Department:</strong> {formData.assignedDepartment}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your complaint will be forwarded to the relevant department.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Location Details</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="pin" className="text-sm">
                    PIN Code *
                  </Label>
                  <Input
                    id="pin"
                    placeholder="Enter 6-digit PIN code"
                    value={formData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      if (value.length <= 6) {
                        updateFields({ pin: value })
                      }
                    }}
                    className="h-10"
                    aria-describedby={errors.pin ? "pin-error" : undefined}
                  />
                  {errors.pin && (
                    <p id="pin-error" className="text-sm text-red-600 mt-1">
                      {errors.pin}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district" className="text-sm">
                      District *
                    </Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => updateFields({ district: e.target.value })}
                      className="h-10"
                      aria-describedby={errors.district ? "district-error" : undefined}
                    />
                    {errors.district && (
                      <p id="district-error" className="text-sm text-red-600 mt-1">
                        {errors.district}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFields({ city: e.target.value })}
                      className="h-10"
                      aria-describedby={errors.city ? "city-error" : undefined}
                    />
                    {errors.city && (
                      <p id="city-error" className="text-sm text-red-600 mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="locality" className="text-sm">
                    Locality
                  </Label>
                  <Input
                    id="locality"
                    placeholder="Area/Locality name"
                    value={formData.locality}
                    onChange={(e) => updateFields({ locality: e.target.value })}
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="street" className="text-sm">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    placeholder="Street name and number"
                    value={formData.street}
                    onChange={(e) => updateFields({ street: e.target.value })}
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="text-sm">
                      Latitude (Optional)
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 19.0760"
                      value={formData.latitude}
                      onChange={(e) => updateFields({ latitude: e.target.value })}
                      className="h-10"
                      aria-describedby={errors.latitude ? "latitude-error" : undefined}
                    />
                    {errors.latitude && (
                      <p id="latitude-error" className="text-sm text-red-600 mt-1">
                        {errors.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm">
                      Longitude (Optional)
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 72.8777"
                      value={formData.longitude}
                      onChange={(e) => updateFields({ longitude: e.target.value })}
                      className="h-10"
                      aria-describedby={errors.longitude ? "longitude-error" : undefined}
                    />
                    {errors.longitude && (
                      <p id="longitude-error" className="text-sm text-red-600 mt-1">
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Complaint Details</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="description" className="text-sm">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your complaint..."
                    className="min-h-32 h-40"
                    value={formData.description}
                    onChange={(e) => updateFields({ description: e.target.value })}
                    aria-describedby={errors.description ? "description-error" : undefined}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/500 characters
                  </p>
                  {errors.description && (
                    <p id="description-error" className="text-sm text-red-600 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

<div>
  <Label htmlFor="attachment" className="text-sm">
    Upload Image (Optional)
  </Label>
  <Input
    id="attachment"
    type="file"
    accept="image/*"
    onChange={handleFileUpload}
    className="h-10"
  />
  {formData.attachmentUrl && (
    <div className="mt-2">
      <img src={formData.attachmentUrl} alt="Preview" className="max-h-32 rounded" />
    </div>
  )}
  <p className="text-xs text-muted-foreground mt-1">
    Supported formats: JPEG, PNG, GIF (max 5MB)
  </p>
</div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Clear photos or documents can help resolve your complaint faster.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibald">Visibility & Urgency</h2>
              <div className="grid gap-6">
                <div>
                  <Label className="text-sm font-medium">Urgency Level *</Label>
                  <RadioGroup
                    value={formData.urgency}
                    onValueChange={(value) => updateFields({ urgency: value })}
                    className="mt-2 space-y-2"
                    aria-describedby={errors.urgency ? "urgency-error" : undefined}
                  >
                    {urgencyLevels.map((level) => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.value} id={level.value} />
                        <Label htmlFor={level.value} className="text-sm font-normal">
                          {level.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.urgency && (
                    <p id="urgency-error" className="text-sm text-red-600 mt-1">
                      {errors.urgency}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={true}
                      onChange={(e) => updateFields({ isPublic: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isPublic" className="text-sm">
                      complaint public
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Public complaints help identify common issues and may lead to faster resolution. All public complaints are visible to all users and can be tracked by the assigned department.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review Your Complaint</h2>
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">Category Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Category:</strong> {formData.categoryName}</p>
                    <p><strong>Sub-Category:</strong> {formData.subCategory}</p>
                    <p><strong>Assigned Department:</strong> {formData.assignedDepartment}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">Location Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>PIN Code:</strong> {formData.pin}</p>
                    <p><strong>District:</strong> {formData.district}</p>
                    <p><strong>City:</strong> {formData.city}</p>
                    {formData.locality && <p><strong>Locality:</strong> {formData.locality}</p>}
                    {formData.street && <p><strong>Street:</strong> {formData.street}</p>}
                    {formData.latitude && formData.longitude && (
                      <p><strong>GPS Coordinates:</strong> {formData.latitude}, {formData.longitude}</p>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">Complaint Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Description:</strong></p>
                    <p className="bg-gray-50 p-3 rounded">{formData.description}</p>
                    {formData.attachmentUrl && (
                      <p>
                        <strong>Attachment:</strong>{" "}
                        <a
                          href={formData.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">Settings</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Urgency Level:</strong> {
                      urgencyLevels.find(level => level.value === formData.urgency)?.label || "Not selected"
                    }</p>
                    <p><strong>Visibility:</strong> {formData.isPublic ? "Public" : "Private"}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-center">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-sm text-blue-800">Powered by Swaraj AI</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? () => router.push('/') : prevStep}
            className="w-full sm:w-auto h-10 text-sm"
            disabled={isSubmitting}
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            type="button"
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            className={`w-full sm:w-auto h-10 text-sm ${currentStep === steps.length - 1 ? "bg-green-600 hover:bg-green-700" : ""
              }`}
            disabled={isSubmitting}
          >
 {isSubmitting ? (
    <span className="flex items-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </span>
  ) : currentStep === steps.length - 1 ? (
    "Submit Complaint"
  ) : (
    "Next"
  )}
          </Button>
        </CardFooter>
      </Card>
      {isSubmitting && (
  <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center z-50">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          Processing your complaint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <Sparkles className="h-12 w-12 text-blue-500" />
          </div>
          <p className="text-center">
            Please wait while we register your complaint...
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
)}

{isSuccess && (
  <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center z-50">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <Sparkles className="h-6 w-6" />
          Complaint Submitted!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-100 rounded-full p-4">
            <Sparkles className="h-12 w-12 text-green-600" />
          </div>
          <p className="text-center text-lg">
            Thank you for registering your complaint!
          </p>
          <p className="text-center text-muted-foreground">
            Your voice helps improve our community.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          size="lg"
          onClick={() => router.push('/community')}
        >
          View Community Complaints
        </Button>
      </CardFooter>
    </Card>
  </div>
)}
    </div>
  )
}