"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Share2, Heart, Clock, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '@/app/hooks/useWebSocket';
const API_URL = process.env.NEXT_PUBLIC_API_URL; 
const WS_URL = process.env.NEXT_PUBLIC_WS_URL 

const ComplaintDetailPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [wsConnectionStatus, setWsConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // WebSocket connection for real-time upvote updates
  const { isConnected, isConnecting, sendMessage } = useWebSocket({
    url: `${WS_URL}/ws`,
    enabled: !!id, // Only connect if we have a complaint ID
    onMessage: (message) => {
      if (message.type === 'upvote_update' && message.data?.complaintId === id) {
        console.log('[WS] Received upvote update:', message.data);
        setUpvoteCount(message.data.upvoteCount);
        // Note: We don't update hasUpvoted from WS as it might be for another user
      } else if (message.type === 'connection_established') {
        console.log('[WS] Connection established:', message.clientId);
      }
    },
    onOpen: () => {
      console.log('[WS] Connected to upvote updates');
    },
    onError: (error) => {
      console.warn('[WS] Connection error (this is normal if server is not running):', error);
    },
    onClose: (event) => {
      console.log('[WS] Connection closed:', event.code, event.reason);
    },
    maxReconnectAttempts: 3,
    reconnectInterval: 3000
  });

  // Update connection status for UI feedback
  useEffect(() => {
    if (isConnecting) {
      setWsConnectionStatus('connecting');
    } else if (isConnected) {
      setWsConnectionStatus('connected');
    } else {
      setWsConnectionStatus('disconnected');
    }
  }, [isConnected, isConnecting]);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) {
        setError('No complaint ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/complaints/${id}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Complaint not found');
          } else if (response.status === 500) {
            throw new Error('Server error occurred');
          } else {
            throw new Error(`Failed to fetch complaint (${response.status})`);
          }
        }
        
        const data = await response.json();
        
        if (!data.complaint) {
          throw new Error('Invalid response format');
        }
        
        setComplaint(data.complaint);
        setUpvoted(data.complaint.hasUpvoted || false);
        setUpvoteCount(data.complaint.upvotes || 0);
        
      } catch (err) {
        console.error('Error fetching complaint:', err);
        setError(err instanceof Error ? err.message : 'Failed to load complaint details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaint();
  }, [id]);

  const handleUpvote = async () => {
    if (!id || !complaint) return;
    
    try {
      const response = await fetch(`${API_URL}/api/complaints/${id}/upvote`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to toggle upvote (${response.status})`);
      }

      const data = await response.json();
      
      // Update local state immediately for better UX
      setUpvoted(data.hasUpvoted);
      setUpvoteCount(data.upvoteCount);
      
      // Send a message via WebSocket if connected (for other clients)
      if (isConnected) {
        sendMessage({
          type: 'upvote_action',
          data: {
            complaintId: id,
            action: data.hasUpvoted ? 'upvote' : 'remove_upvote'
          }
        });
      }
      
    } catch (error) {
      console.error('Error toggling upvote:', error);
      alert(error instanceof Error ? error.message : 'Failed to toggle upvote. Please try again.');
    }
  };

  const handleShare = () => {
    if (!complaint) return;
    
    const shareData = {
      title: complaint.subCategory,
      text: `Check out this complaint about ${complaint.subCategory} in ${complaint.location.district}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(error => {
        console.log('Native sharing failed:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url).then(() => {
          alert('Link copied to clipboard!');
        }).catch(() => {
          alert('Sharing failed. Please copy the URL manually.');
        });
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Unable to copy link. Please copy the URL manually.');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Complaint Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested complaint does not exist or has been removed.</p>
          <button 
            onClick={() => router.push('/community')} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(complaint.dateOfPost).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Connection Status Indicator (only show if there are issues) */}
        {wsConnectionStatus !== 'connected' && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center text-sm text-yellow-800 dark:text-yellow-200">
              {wsConnectionStatus === 'connecting' ? (
                <>
                  <Wifi className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Connecting to live updates...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 mr-2" />
                  <span>Live updates unavailable - using manual refresh</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {complaint.subCategory}
              </h1>
              <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                <span className="font-medium">{complaint.name}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
            >
              <Share2 className="h-5 w-5 mr-1" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {[
                complaint.location.locality,
                complaint.location.street,
                complaint.location.district,
                complaint.location.city,
                complaint.location.pin
              ].filter(Boolean).join(', ')}
            </span>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {complaint.description}
          </p>
          
          {complaint.photo && (
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-6">
              <img 
                src={complaint.photo} 
                alt={complaint.subCategory} 
                className="w-full h-auto"
                onError={(e) => {
                  console.error('Image failed to load:', complaint.photo);
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex items-center">
            <button 
              onClick={handleUpvote}
              className={`flex items-center mr-6 transition-colors ${
                upvoted 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
              disabled={loading}
            >
              <Heart className={`h-5 w-5 mr-1 ${upvoted ? 'fill-current' : ''}`} />
              <span>{upvoteCount} Upvotes</span>
            </button>
            
            <span className={`px-3 py-1 rounded-full text-sm ${
              complaint.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              Status: {complaint.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;