"use client";
import React, { useState, useEffect } from 'react';
import { Search, Clock, Flame, Sparkles } from 'lucide-react';
import ComplaintCard from './ComplaintCard';
import { Complaint } from '@/lib/types';
const API_URL = process.env.NEXT_PUBLIC_API_URL; 

type TabKey = 'forYou' | 'trending' | 'recent';

const AllComplaintsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('forYou');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Separate states for each tab
  const [complaintsForYou, setComplaintsForYou] = useState<Complaint[]>([]);
  const [complaintsTrending, setComplaintsTrending] = useState<Complaint[]>([]);
  const [complaintsRecent, setComplaintsRecent] = useState<Complaint[]>([]);
  
  // Separate loading states for each tab
  const [loadingForYou, setLoadingForYou] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  
  const [aiInsights, setAiInsights] = useState<string>('');
  const [tabErrors, setTabErrors] = useState<Record<TabKey, string | null>>({
    forYou: null,
    trending: null,
    recent: null,
  });

  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async (tab: TabKey) => {
      try {
        // Set loading state for this tab
        if (tab === 'forYou') setLoadingForYou(true);
        if (tab === 'trending') setLoadingTrending(true);
        if (tab === 'recent') setLoadingRecent(true);
        
        setTabErrors(prev => ({...prev, [tab]: null}));
        
        // Build query parameters based on tab
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '50');
        
        if (tab === 'forYou') {
          params.append('forYou', 'true');
        } else if (tab === 'trending') {
          params.append('sortBy', 'upvotes');
        } else if (tab === 'recent') {
          params.append('sortBy', 'recent');
        }
        
        const response = await fetch(`${API_URL}/api/complaints/?${params.toString()}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Only show error for "For You" tab
          if (tab === 'forYou') {
            setTabErrors(prev => ({
              ...prev,
              forYou: 'No personalized complaints found. Please try again later.'
              
            }));
          }
          return;
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
        
        // Update the correct state based on tab
        if (tab === 'forYou') setComplaintsForYou(fetchedComplaints);
        if (tab === 'trending') setComplaintsTrending(fetchedComplaints);
        if (tab === 'recent') setComplaintsRecent(fetchedComplaints);
        
        // Generate AI insights only for the active tab
        if (tab === activeTab) {
          generateAiInsights(tab, fetchedComplaints);
        }
        
      } catch (err) {
        if (tab === 'forYou') {
          setTabErrors(prev => ({
            ...prev,
            forYou: 'Failed to load complaints. Please try again later.'
          }));
        }
      } finally {
        // Clear loading state for this tab
        if (tab === 'forYou') setLoadingForYou(false);
        if (tab === 'trending') setLoadingTrending(false);
        if (tab === 'recent') setLoadingRecent(false);
      }
    };
    
    // Fetch data for the active tab
    fetchComplaints(activeTab);
    
    // Also fetch data for other tabs if they haven't been loaded yet
    if (complaintsTrending.length === 0 && activeTab !== 'trending') {
      fetchComplaints('trending');
    }
    if (complaintsRecent.length === 0 && activeTab !== 'recent') {
      fetchComplaints('recent');
    }
  }, [activeTab, searchQuery]);

  // Add this useEffect to handle real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const websocket = new WebSocket(`${protocol}//${host}`);
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'upvote_update') {
        // Update complaints in all tabs that might contain this complaint
        setComplaintsForYou(prev => updateComplaintInList(prev, message));
        setComplaintsTrending(prev => updateComplaintInList(prev, message));
        setComplaintsRecent(prev => updateComplaintInList(prev, message));
      }
    };

    return () => websocket.close();
  }, []);

  // Helper function to update a complaint in a list
  const updateComplaintInList = (complaints: Complaint[], message: any) => {
    return complaints.map(c => 
      c.id === message.data.complaintId 
        ? {...c, upvotes: message.data.upvoteCount} 
        : c
    );
  };

  const generateAiInsights = (tab: string, data: Complaint[]) => {
    if (data.length === 0) {
      setAiInsights('Swaraj AI is analyzing complaint patterns to provide actionable insights for your community.');
      return;
    }
    
    // Get unique hashtags from standardizedSubCategory
    const hashtags = Array.from(
      new Set(
        data.slice(0, 10)
          .map(complaint => complaint.standardizedSubCategory)
          .filter(Boolean)
          .map(cat => `${cat.replace(/\s+/g, '')}`)
      )
    ).join(' ');

    setAiInsights(hashtags);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is implemented in the useEffect
  };

  // Get complaints for the current tab
  const getCurrentComplaints = () => {
    switch (activeTab) {
      case 'forYou': return complaintsForYou;
      case 'trending': return complaintsTrending;
      case 'recent': return complaintsRecent;
      default: return [];
    }
  };

  // Get loading state for current tab
  const isLoading = () => {
    switch (activeTab) {
      case 'forYou': return loadingForYou;
      case 'trending': return loadingTrending;
      case 'recent': return loadingRecent;
      default: return false;
    }
  };

  const currentComplaints = getCurrentComplaints();
  const loading = isLoading();

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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Swaraj Glimpse</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  Powered by Swaraj AI
                </span>
              </div>
              <br/>
              <div className="flex flex-wrap gap-2">
                {aiInsights.split(' ').map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Complaints list and no-complaints message */}
        <>
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          {tabErrors[activeTab] && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
              {tabErrors[activeTab]}
              
            </div>
          )}

          {!loading && !tabErrors[activeTab] && currentComplaints.length === 0 && (
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

          {!loading && currentComplaints.length > 0 && (
            <div className="space-y-5">
              {currentComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </>
      </div>
    </div>
  );
}
export default AllComplaintsPage;