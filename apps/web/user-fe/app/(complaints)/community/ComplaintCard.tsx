"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Share2, MapPin } from 'lucide-react';
import { useWebSocket } from '@/app/hooks/useWebSocket';
const API_URL = process.env.NEXT_PUBLIC_API_URL 
const WS_URL = process.env.NEXT_PUBLIC_WS_URL 

// Define the Complaint type locally if not available globally
interface Complaint {
  id: string;
  seq: number;
  name: string;
  category: string;
  subCategory: string;
  district: string;
  city: string;
  pin: string;
  photo?: string;
  upvotes: number;
  dateOfPost: string;
  status: string;
  urgency: string;
  description: string;
}

interface ComplaintCardProps {
  complaint: Complaint;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  const router = useRouter();
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(complaint.upvotes);
  const [isUpvoting, setIsUpvoting] = useState(false);

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket({
    url: `${WS_URL}/ws`,
    enabled: true,
    onMessage: (message) => {
      if (message.type === 'upvote_update' && message.data?.complaintId === complaint.id) {
        console.log('[WS] Received upvote update for complaint:', complaint.id);
        setUpvoteCount(message.data.upvoteCount);
        // Note: We don't update hasUpvoted from WS as it might be for another user
      }
    },
    onError: (error) => {
      // Silently handle WebSocket errors - they're not critical for card functionality
      console.debug('[WS] Connection error (this is normal if server is not running)');
    },
    maxReconnectAttempts: 2, // Fewer attempts for cards
    reconnectInterval: 5000
  });

  useEffect(() => {
    // Fetch initial upvote status
    const fetchUpvoteStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/complaints/${complaint.id}/upvotes`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUpvoted(data.hasUpvoted);
          setUpvoteCount(data.upvoteCount);
        } else if (response.status === 401) {
          // User not authenticated - that's fine, just show public data
          setUpvoted(false);
        }
      } catch (error) {
        console.debug('Error fetching upvote status (user may not be logged in):', error);
        // Fallback to showing the original upvote count
        setUpvoted(false);
      }
    };

    fetchUpvoteStatus();
  }, [complaint.id]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isUpvoting) return; // Prevent double-clicking
    
    try {
      setIsUpvoting(true);
      
      const response = await fetch(`${API_URL}/api/complaints/${complaint.id}/upvote`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('Please log in to upvote complaints');
        } else if (response.status === 403) {
          throw new Error(errorData.error || 'You cannot upvote this complaint');
        } else {
          throw new Error(errorData.error || `Failed to toggle upvote (${response.status})`);
        }
      }

      const data = await response.json();
      
      // Update local state immediately for better UX
      setUpvoted(data.hasUpvoted);
      setUpvoteCount(data.upvoteCount);
      
      // Send WebSocket message if connected
      if (isConnected) {
        sendMessage({
          type: 'upvote_action',
          data: {
            complaintId: complaint.id,
            action: data.hasUpvoted ? 'upvote' : 'remove_upvote'
          }
        });
      }
      
    } catch (error) {
      console.error('Error toggling upvote:', error);
      
      // Show user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle upvote';
      
      // You could replace this with a toast notification system
      alert(errorMessage);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: complaint.subCategory,
      text: `Check out this complaint about ${complaint.subCategory} in ${complaint.district}`,
      url: `${window.location.origin}/community/${complaint.id}`
    };
    
    if (navigator.share) {
      navigator.share(shareData)
        .catch(error => {
          console.log('Native sharing failed:', error);
          // Fallback to clipboard
          navigator.clipboard.writeText(shareData.url).then(() => {
            alert('Link copied to clipboard!');
          }).catch(() => {
            alert('Sharing failed. Please copy the URL manually.');
          });
        });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Unable to copy link. Please copy the URL manually.');
      });
    }
  };

  const handleCardClick = () => {
    router.push(`/community/${complaint.id}`);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{complaint.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(complaint.dateOfPost).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            complaint.urgency === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
            complaint.urgency === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
            complaint.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            {complaint.urgency}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="font-medium">{complaint.district}</span>
            <span className="mx-2">•</span>
            <span>PIN: {complaint.pin}</span>
          </div>

          <h4 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {complaint.subCategory}
          </h4>
          
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {complaint.description}
          </p>
        </div>

        {complaint.photo && (
          <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img 
              src={complaint.photo} 
              alt={complaint.subCategory} 
              className="w-full h-48 object-cover"
              onError={(e) => {
                console.error('Image failed to load:', complaint.photo);
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button 
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`flex items-center transition-colors ${
              isUpvoting 
                ? 'text-gray-400 cursor-not-allowed' 
                : upvoted 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 mr-1 ${upvoted ? 'fill-current' : ''} ${isUpvoting ? 'animate-pulse' : ''}`} />
            <span className="text-sm">{upvoteCount}</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
          >
            <Share2 className="h-5 w-5 mr-1" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;