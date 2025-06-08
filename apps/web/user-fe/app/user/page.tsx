"use client";
import React, { useState, useEffect } from "react";
import { User, List, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL 

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/protected`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Failed to fetch user data");
        return;
      }

      // data.user should have: { id, name, email, … } (but no location)
      const { id: userId } = data.user;

      // 2) Immediately fetch `GET /api/user/${userId}` to pull in `location`
      const detailed = await fetch(`${API_URL}/api/user/${userId}`, {
        credentials: "include",
      });
      const detailedJson = await detailed.json();
      if (!detailed.ok) {
        setError("Failed to fetch detailed profile");
        return;
      }

      // According to your backend, GET /api/user/:id returns
      //   { user: safeUser, location: user.location }
      // We can merge them into a single object for convenience:
      const {
        user: safeUser,
        location: loc,
      } = detailedJson;

      setUserData({ ...safeUser, location: loc });
    } catch (err) {
      setError("Network error");
    }
  };

  const fetchComplaints = async () => {
    if (!userData?.id) return;
    
    try {
      const res = await fetch(
        `${API_URL}/api/user/${userData.id}/complaints`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError("Failed to fetch complaints");
        return;
      }

      // data.complaints is an array where each complaint has:
      // id, seq, submissionDate, status, urgency,
      // category, subCategory, description, upvoteCount, location, attachmentUrl
      setComplaints(data.complaints);
    } catch (err) {
      setError("Network error");
    }
  };

  const deleteAccount = async () => {
    if (!userData?.id || !window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/user/${userData.id}/status`, { credentials: 'include',
        method: "PATCH",
      });
      
      if (res.ok) {
        setSuccess("Account deleted successfully");
        setTimeout(() => {
          router.push("/");
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }, 2000);
      } else {
        setError("Failed to delete account");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "complaints" && userData?.id) {
      fetchComplaints();
    }
  }, [activeTab, userData]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <User size={20} /> Profile Information
            </h2>
            
            {userData ? (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600 dark:text-gray-300">Name</label>
                  <p className="font-medium text-gray-900 dark:text-white">{userData.name}</p>
                </div>
                
                <div>
                  <label className="text-gray-600 dark:text-gray-300">Email</label>
                  <p className="font-medium text-gray-900 dark:text-white">{userData.email}</p>
                </div>
               <div>
                  <label className="text-gray-600 dark:text-gray-300">Location</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {/*
                      Now that we called GET /api/user/:id, userData.location should exist:
                      e.g. userData.location = { id, address, city, state … }
                    */}
                    {userData.location
                      ? userData.location.address
                        ? userData.location.address
                        : `${userData.location.city}, ${userData.location.state}`
                      : "No location set"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
            )}
          </div>
        );
      
      case "complaints":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <List size={20} /> My Complaints
            </h2>
            {complaints.length > 0 ? (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Complaint # {complaint.seq}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          complaint.status === "RESOLVED"
                            ? "bg-green-100 text-green-800"
                            : complaint.status === "IN_PROGRESS"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <p>
                        <strong>Category:</strong> {complaint.category} /{" "}
                        {complaint.subCategory}
                      </p>
                      <p>
                        <strong>Submitted On:</strong>{" "}
                        {new Date(complaint.submissionDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Urgency:</strong> {complaint.urgency}
                      </p>
                      <p className="mt-2">
                        <strong>Description:</strong> {complaint.description}
                      </p>
                      <p className="mt-2">
                        <strong>Upvotes:</strong> {complaint.upvoteCount}
                      </p>
                      <p className="mt-2">
                        <strong>Location:</strong>{" "}
                        {complaint.location
                          ? complaint.location.address ||
                            `${complaint.location.city}, ${complaint.location.state}`
                          : "N/A"}
                      </p>
                      {complaint.attachmentUrl && (
                        <p className="mt-2">
                          <strong>Attachment:</strong>{" "}
                          <a
                            href={complaint.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                {complaints.length === 0
                  ? "No complaints found"
                  : "Loading complaints..."}
              </p>
            )}
          </div>
        );
      
      case "account":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Trash2 size={20} /> Account Settings
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-medium text-red-800 dark:text-red-200">Delete Account</h3>
                <p className="text-red-700 dark:text-red-300 mt-2">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                <button 
                  onClick={deleteAccount}
                  disabled={isDeleting}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {isDeleting ? "Deleting..." : "Delete My Account"}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-19">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and grievance history
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {[
            { id: "profile", label: "Profile", icon: <User size={18} /> },
            { id: "complaints", label: "My Complaints", icon: <List size={18} /> },
            { id: "account", label: "Account", icon: <Trash2 size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;