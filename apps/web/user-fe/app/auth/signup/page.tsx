"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, User, MapPin, Settings, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL ; 
interface FormData {
  email: string;
  phoneNumber: string;
  name: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  aadhaarId: string;
  preferredLanguage: string;
  disability: string;
  location: {
    pin: string;
    district: string;
    city: string;
    locality: string;
    street: string;
    municipal: string;
  };
}

const languages = [
  "English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", 
  "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese"
];

const disabilities = [
  "None", "Visual Impairment", "Hearing Impairment", "Physical Disability", 
  "Intellectual Disability", "Multiple Disabilities", "Other"
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phoneNumber: "",
    name: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    aadhaarId: "",
    preferredLanguage: "English",
    disability: "None",
    location: {
      pin: "",
      district: "",
      city: "",
      locality: "",
      street: "",
      municipal: ""
    }
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

const handleInputChange = (field: string, value: string) => {
  if (field.startsWith('location.')) {
    const child = field.split('.')[1];
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [child]: value
      }
    }));
  } else {
    setFormData(prev => ({ ...prev, [field]: value }));
  }
  setErrors([]);
};

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.email) newErrors.push("Email is required");
        if (!formData.email.includes('@')) newErrors.push("Invalid email format");
        if (!formData.phoneNumber) newErrors.push("Phone number is required");
        if (formData.phoneNumber.length < 10) newErrors.push("Phone number must be at least 10 digits");
        if (!formData.name) newErrors.push("Name is required");
        break;
      case 2:
        if (!formData.password) newErrors.push("Password is required");
        if (formData.password.length < 6) newErrors.push("Password must be at least 6 characters");
        if (formData.password !== formData.confirmPassword) newErrors.push("Passwords do not match");
        if (!formData.dateOfBirth) newErrors.push("Date of birth is required");
        if (!formData.aadhaarId) newErrors.push("Aadhaar ID is required");
        if (formData.aadhaarId.length !== 12) newErrors.push("Aadhaar ID must be 12 digits");
        break;
      case 3:
        if (!formData.location.pin) newErrors.push("PIN code is required");
        if (!formData.location.district) newErrors.push("District is required");
        if (!formData.location.city) newErrors.push("City is required");
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          name: formData.name,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          aadhaarId: formData.aadhaarId,
          preferredLanguage: formData.preferredLanguage,
          disability: formData.disability,
          location: formData.location
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setErrors(Array.isArray(data.error) ? data.error.map((e: any) => e.message) : [data.error]);
      }
    } catch (error) {
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const stepIcons = [
    { icon: User, title: "Basic Info" },
    { icon: Shield, title: "Security" },
    { icon: MapPin, title: "Location" },
    { icon: Settings, title: "Preferences" }
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center pt-24 pb-8 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Account Created!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Welcome! Your account has been successfully created. You can now access all features.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join our platform to start submitting and tracking complaints
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {stepIcons.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index + 1 <= currentStep;
              const isCurrent = index + 1 === currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive 
                      ? 'bg-black dark:bg-white border-black dark:border-white' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <StepIcon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-white dark:text-black' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  </div>
                  <span className={`text-xs mt-2 ${
                    isCurrent 
                      ? 'text-black dark:text-white font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertDescription>
              <ul className="list-disc pl-4">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-600 dark:text-red-400">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl">
              Step {currentStep}: {stepIcons[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with your basic information"}
              {currentStep === 2 && "Set up your account security and identity"}
              {currentStep === 3 && "Tell us where you're located"}
              {currentStep === 4 && "Customize your experience"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Security & Identity */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaar">Aadhaar ID</Label>
                  <Input
                    id="aadhaar"
                    type="text"
                    value={formData.aadhaarId}
                    onChange={(e) => handleInputChange('aadhaarId', e.target.value)}
                    placeholder="Enter your 12-digit Aadhaar ID"
                    maxLength={12}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pin">PIN Code</Label>
                    <Input
                      id="pin"
                      type="text"
                      value={formData.location.pin}
                      onChange={(e) => handleInputChange('location.pin', e.target.value)}
                      placeholder="PIN Code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      type="text"
                      value={formData.location.district}
                      onChange={(e) => handleInputChange('location.district', e.target.value)}
                      placeholder="District"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="locality">Locality</Label>
                  <Input
                    id="locality"
                    type="text"
                    value={formData.location.locality}
                    onChange={(e) => handleInputChange('location.locality', e.target.value)}
                    placeholder="Locality (Optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea
                    id="street"
                    value={formData.location.street}
                    onChange={(e) => handleInputChange('location.street', e.target.value)}
                    placeholder="Street address (Optional)"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="municipal">Municipal Corporation</Label>
                  <Input
                    id="municipal"
                    type="text"
                    value={formData.location.municipal}
                    onChange={(e) => handleInputChange('location.municipal', e.target.value)}
                    placeholder="Municipal Corporation (Optional)"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={formData.preferredLanguage} onValueChange={(value) => handleInputChange('preferredLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="disability">Disability Status</Label>
                  <Select value={formData.disability} onValueChange={(value) => handleInputChange('disability', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disability status" />
                    </SelectTrigger>
                    <SelectContent>
                      {disabilities.map((disability) => (
                        <SelectItem key={disability} value={disability}>{disability}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By creating an account, you agree to our Terms of Service and Privacy Policy. 
                    Your information will be used to provide better complaint resolution services.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/auth/login" className="text-black dark:text-white font-medium hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}