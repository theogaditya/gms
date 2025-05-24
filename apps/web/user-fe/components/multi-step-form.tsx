"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"

// Define the steps of the form
const steps = [
  { id: "category", title: "Category & Type" },
  { id: "location", title: "Location Details" },
  { id: "complaint", title: "Complaint Details" },
  { id: "visibility", title: "Visibility & Urgency" },
  { id: "review", title: "Review & Submit" },
]

// Mock data
const categories = [
  { id: "cat1", name: "Infrastructure", subCategories: ["Roads", "Water Supply", "Electricity", "Drainage"] },
  { id: "cat2", name: "Public Health", subCategories: ["Sanitation", "Hospital Services", "Waste Management"] },
  { id: "cat3", name: "Transportation", subCategories: ["Public Transport", "Traffic Management", "Parking"] },
  { id: "cat4", name: "Education", subCategories: ["School Infrastructure", "Teacher Shortage", "Educational Resources"] },
  { id: "cat5", name: "Environment", subCategories: ["Air Pollution", "Noise Pollution", "Tree Cutting", "Water Pollution"] },
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
    complainantId: "",
    assignedDepartment: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

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
      if (formData.categoryId && !formData.subCategory) newErrors.subCategory = "Please select a sub-category"
    } else if (stepIndex === 1) {
      if (!formData.pin || formData.pin.length !== 6) newErrors.pin = "Enter a valid 6-digit PIN code"
      if (!formData.district) newErrors.district = "Enter a district"
      if (!formData.city) newErrors.city = "Enter a city"
      if (formData.latitude && isNaN(Number(formData.latitude))) newErrors.latitude = "Enter a valid latitude"
      if (formData.longitude && isNaN(Number(formData.longitude))) newErrors.longitude = "Enter a valid longitude"
    } else if (stepIndex === 2) {
      if (!formData.description) newErrors.description = "Provide a description"
      if (formData.description.length > 500) newErrors.description = "Description cannot exceed 500 characters"
      if (formData.attachmentUrl && !isValidUrl(formData.attachmentUrl)) newErrors.attachmentUrl = "Enter a valid URL"
    } else if (stepIndex === 3) {
      if (!formData.urgency) newErrors.urgency = "Select an urgency level"
    } else if (stepIndex === 4) {
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

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
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

  const handleSubmit = () => {
    if (validateStep(4)) {
      console.log("Complaint submitted:", formData)
      alert("Complaint submitted successfully! You will receive updates on the progress.")
      router.push('/')
    }
  }

  const handleCategoryChange = (categoryId: any) => {
    const category = categories.find((cat) => cat.id === categoryId)
    updateFields({
      categoryId,
      subCategory: "",
      assignedDepartment: category?.name || "",
    })
  }

  const getAvailableSubCategories = () => {
    const category = categories.find((cat) => cat.id === formData.categoryId)
    return category?.subCategories || []
  }

  return (
    <div className="w-full max-w-3xl sm:max-w-4xl mx-auto p-4 sm:p-6">
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">Submit New Complaint</CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">
            Help us serve you better by providing detailed information
          </p>
          <div className="flex overflow-x-auto space-x-4 sm:space-x-6 mt-4 sm:mt-6 pb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-shrink-0 ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 text-sm sm:text-base ${
                    index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-2 border-primary text-primary"
                        : "border-2 border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                <span className="text-xs sm:text-sm text-center max-w-[80px] sm:max-w-[100px]">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 mb-4 bg-red-50 text-red-800 rounded-lg">
              <p className="font-medium text-sm sm:text-base">Please correct the following errors:</p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">Category & Type</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="categoryId" className="text-sm sm:text-base">
                    Complaint Category *
                  </Label>
                  <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="categoryId" aria-describedby={errors.categoryId ? "categoryId-error" : undefined}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p id="categoryId-error" className="text-sm text-red-600 mt-1">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {formData.categoryId && (
                  <div>
                    <Label htmlFor="subCategory" className="text-sm sm:text-base">
                      Sub-Category *
                    </Label>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) => updateFields({ subCategory: value })}
                    >
                      <SelectTrigger id="subCategory" aria-describedby={errors.subCategory ? "subCategory-error" : undefined}>
                        <SelectValue placeholder="Select a sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSubCategories().map((subCat) => (
                          <SelectItem key={subCat} value={subCat}>
                            {subCat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subCategory && (
                      <p id="subCategory-error" className="text-sm text-red-600 mt-1">
                        {errors.subCategory}
                      </p>
                    )}
                  </div>
                )}

                {formData.categoryId && (
                  <div className="p-4 bg-muted rounded-lg">
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
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">Location Details</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="pin" className="text-sm sm:text-base">
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
                    className="h-10 sm:h-12"
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
                    <Label htmlFor="district" className="text-sm sm:text-base">
                      District *
                    </Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => updateFields({ district: e.target.value })}
                      className="h-10 sm:h-12"
                      aria-describedby={errors.district ? "district-error" : undefined}
                    />
                    {errors.district && (
                      <p id="district-error" className="text-sm text-red-600 mt-1">
                        {errors.district}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm sm:text-base">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFields({ city: e.target.value })}
                      className="h-10 sm:h-12"
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
                  <Label htmlFor="locality" className="text-sm sm:text-base">
                    Locality
                  </Label>
                  <Input
                    id="locality"
                    placeholder="Area/Locality name"
                    value={formData.locality}
                    onChange={(e) => updateFields({ locality: e.target.value })}
                    className="h-10 sm:h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="street" className="text-sm sm:text-base">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    placeholder="Street name and number"
                    value={formData.street}
                    onChange={(e) => updateFields({ street: e.target.value })}
                    className="h-10 sm:h-12"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="text-sm sm:text-base">
                      Latitude (Optional)
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 19.0760"
                      value={formData.latitude}
                      onChange={(e) => updateFields({ latitude: e.target.value })}
                      className="h-10 sm:h-12"
                      aria-describedby={errors.latitude ? "latitude-error" : undefined}
                    />
                    {errors.latitude && (
                      <p id="latitude-error" className="text-sm text-red-600 mt-1">
                        {errors.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm sm:text-base">
                      Longitude (Optional)
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 72.8777"
                      value={formData.longitude}
                      onChange={(e) => updateFields({ longitude: e.target.value })}
                      className="h-10 sm:h-12"
                      aria-describedby={errors.longitude ? "longitude-error" : undefined}
                    />
                    {errors.longitude && (
                      <p id="longitude-error" className="text-sm text-red-600 mt-1">
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> GPS coordinates help authorities locate the issue precisely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">Complaint Details</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="description" className="text-sm sm:text-base">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your complaint..."
                    className="min-h-32 h-40 sm:h-48"
                    value={formData.description}
                    onChange={(e: any) => updateFields({ description: e.target.value })}
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
                  <Label htmlFor="attachmentUrl" className="text-sm sm:text-base">
                    Document/Image URL (Optional)
                  </Label>
                  <Input
                    id="attachmentUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.attachmentUrl}
                    onChange={(e) => updateFields({ attachmentUrl: e.target.value })}
                    className="h-10 sm:h-12"
                    aria-describedby={errors.attachmentUrl ? "attachmentUrl-error" : undefined}
                  />
                  {errors.attachmentUrl && (
                    <p id="attachmentUrl-error" className="text-sm text-red-600 mt-1">
                      {errors.attachmentUrl}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload to a cloud service and paste the link here
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Clear photos or documents can help resolve your complaint faster.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">Visibility & Urgency</h2>
              <div className="grid gap-6">
                <div>
                  <Label className="text-sm sm:text-base font-medium">Urgency Level *</Label>
                  <RadioGroup
                    value={formData.urgency}
                    onValueChange={(value: any) => updateFields({ urgency: value })}
                    className="mt-2 space-y-2"
                    aria-describedby={errors.urgency ? "urgency-error" : undefined}
                  >
                    {urgencyLevels.map((level) => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.value} id={level.value} />
                        <Label htmlFor={level.value} className="text-sm sm:text-base font-normal">
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
                  <Label className="text-sm sm:text-base font-medium">Visibility Settings</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked: any) => updateFields({ isPublic: checked })}
                    />
                    <Label htmlFor="isPublic" className="text-sm sm:text-base">
                      Make complaint public
                    </Label>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Public complaints help identify common issues and may lead to faster resolution. Your personal information remains private.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Privacy:</strong> Only your name and complaint details are visible if public. Contact details remain confidential.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">Review Your Complaint</h2>
              <div className="grid gap-4 sm:gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm sm:text-base mb-3">Category Information</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <p><strong>Category:</strong> {categories.find((cat) => cat.id === formData.categoryId)?.name}</p>
                    <p><strong>Sub-Category:</strong> {formData.subCategory}</p>
                    <p><strong>Assigned Department:</strong> {formData.assignedDepartment}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm sm:text-base mb-3">Location Details</h3>
                  <div className="space-y-2 text-sm sm:text-base">
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
                  <h3 className="font-medium text-sm sm:text-base mb-3">Complaint Details</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <p><strong>Description:</strong></p>
                    <p className="bg-muted p-3 rounded">{formData.description}</p>
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
                |</div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-sm sm:text-base mb-3">Settings</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <p><strong>Urgency Level:</strong> {urgencyLevels.find((level) => level.value === formData.urgency)?.label}</p>
                    <p><strong>Visibility:</strong> {formData.isPublic ? "Public" : "Private"}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>What happens next?</strong><br />
                    1. Complaint registered with a unique ID<br />
                    2. Forwarded to the relevant department<br />
                    3. Updates via email and SMS<br />
                    4. Track progress using your complaint ID
                  </p>
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
            className="w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base"
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            type="button"
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            className={`w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base ${
              currentStep === steps.length - 1 ? "bg-green-600 hover:bg-green-700" : ""
            }`}
          >
            {currentStep === steps.length - 1 ? "Submit Complaint" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}