"use client";
import { useEffect,useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL 

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Check if user is already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/status`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.loggedIn) {
          window.location.href = "/";
          alert("You Are Logged In");
        } else {
          setIsCheckingAuth(false);
        }
      } catch (err) {
        console.error("Error checking login status", err);
        setIsCheckingAuth(false);
      }
    };
    checkLogin();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!formData.email) newErrors.push("Email is required");
    if (!formData.email.includes('@')) newErrors.push("Invalid email format");
    if (!formData.password) newErrors.push("Password is required");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/";
      } else {
        setErrors([data.error || 'Login failed. Please check your credentials.']);
      }
    } catch (error) {
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Display */}
          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index} className="text-red-600 dark:text-red-400">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a 
                href="/auth/signup" 
                className="text-black dark:text-white font-medium hover:underline"
              >
                Sign up here
              </a>
            </p>
            <p className="mt-2">
              <a 
                href="/forgot-password" 
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                Forgot password?
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}