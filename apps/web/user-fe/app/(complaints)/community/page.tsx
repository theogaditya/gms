"use client";
import React, { useState, useEffect } from 'react';
import { Search, ArrowUp, Clock, Flame, Mail, Sparkles } from 'lucide-react';
import ComplaintCard from './ComplaintCard';
import { Complaint } from '@/lib/types';
const API_URL = process.env.NEXT_PUBLIC_API_URL; 

const AllComplaintsPage = () => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');

  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        
        // Build query parameters based on active tab
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '50');
        
        if (activeTab === 'forYou') {
          params.append('forYou', 'true');
        } else if (activeTab === 'trending') {
          params.append('sortBy', 'upvotes');
        } else if (activeTab === 'recent') {
          params.append('sortBy', 'recent');
        }
        
        const response = await fetch(`${API_URL}/api/complaints/?${params.toString()}`, {
          credentials: 'include', // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch complaints');
        }
        
        const data = await response.json();
        let fetchedComplaints = data.complaints || [];
        
        // Apply search filter on the client side
        if (searchQuery) {
          fetchedComplaints = fetchedComplaints.filter((complaint: Complaint) =>
            complaint.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
            complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            complaint.district.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setComplaints(fetchedComplaints);
        setLoading(false);
        
        // Generate AI insights based on active tab
        generateAiInsights(activeTab, fetchedComplaints);
      } catch (err) {
        setError('Failed to load complaints. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, [activeTab, searchQuery]);
  // Add this useEffect to handle real-time updates
useEffect(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const websocket = new WebSocket(`${protocol}//${host}`);
  
  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'upvote_update') {
      setComplaints(prev => prev.map(c => 
        c.id === message.data.complaintId 
          ? {...c, upvotes: message.data.upvoteCount} 
          : c
      ));
    }
  };

  return () => websocket.close();
}, []);

  const generateAiInsights = (tab: string, data: Complaint[]) => {
    if (data.length === 0) {
      setAiInsights('Swaraj AI is analyzing complaint patterns to provide actionable insights for your community.');
      return;
    }
    
    switch(tab) {
      case 'forYou':
        // Find most common issue in user's area
        const issueCounts: Record<string, number> = {};
        data.forEach(complaint => {
          issueCounts[complaint.subCategory] = (issueCounts[complaint.subCategory] || 0) + 1;
        });
        
        const mostCommonIssue = Object.entries(issueCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || data[0].subCategory;
          
        setAiInsights(`Based on your location, ${mostCommonIssue} is the most reported issue in your area. Authorities are prioritizing resolution.`);
        break;
        
      case 'trending':
        // Find most upvoted complaint
        const trendingComplaint = [...data].sort((a, b) => b.upvotes - a.upvotes)[0];
        setAiInsights(`"${trendingComplaint.subCategory}" in ${trendingComplaint.district} is trending with ${trendingComplaint.upvotes} upvotes. Officials have been notified.`);
        break;
        
      case 'recent':
        const newestComplaint = [...data].sort((a, b) => 
          new Date(b.dateOfPost).getTime() - new Date(a.dateOfPost).getTime()
        )[0];
        
        setAiInsights(`New complaint filed: "${newestComplaint.subCategory}" in ${newestComplaint.district}. Average resolution time for similar issues is 3-5 days.`);
        break;
        
      case 'newsletter':
        setAiInsights('Subscribe to our newsletter for weekly insights on complaint resolution rates and government response times in your district.');
        break;
        
      default:
        setAiInsights('Swaraj AI is analyzing complaint patterns to provide actionable insights for your community.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is implemented in the useEffect
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-19">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search complaints..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </form>

          {/* Tabs */}
          <div className="flex overflow-x-auto pb-1 space-x-6 hide-scrollbar">
            <button
              onClick={() => setActiveTab('forYou')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'forYou'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              For You
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Flame className="h-4 w-4 mr-2" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'recent'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </button>
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'newsletter'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Newsletter
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
 <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Swaraj AI Section */}
      <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-4 rounded-xl border border-green-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Swaraj AI Insights</h3>
            <p className="text-gray-700 dark:text-gray-300">{aiInsights}</p>
          </div>
        </div>
      </div>

      {/* Only show complaints list and no-complaints message if NOT in newsletter tab */}
      {activeTab !== 'newsletter' && (
        <>
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!loading && !error && complaints.length === 0 && (
            <div className="text-center py-10">
              <div className="bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No complaints found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'No complaints match your search. Try different keywords.'
                  : 'There are no complaints to display.'}
              </p>
            </div>
          )}

          {!loading && !error && complaints.length > 0 && (
            <div className="space-y-5">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
}
export default AllComplaintsPage;