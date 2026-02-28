import { useState } from 'react';
import { socialApi } from '../api/social';
import { toast } from 'sonner';

export const useSocialAction = (pickId: string, initialCount: number, initialStatus: boolean, initialSaved: boolean = false) => {
  // Support Signal State (Votes)
  const [count, setCount] = useState(initialCount);
  const [isSignaled, setIsSignaled] = useState(initialStatus);
  
  // Vault Signal State (Favorites)
  const [isSaved, setIsSaved] = useState(initialSaved);
  
  const [loading, setLoading] = useState(false);

  /**
   * TOGGLE VOTE: Handles the upvote/support signal
   */
  const toggleAction = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic Update
    const prevCount = count;
    const prevStatus = isSignaled;
    setCount(prev => isSignaled ? prev - 1 : prev + 1);
    setIsSignaled(!isSignaled);

    try {
      const res = await socialApi.toggleUpvote(pickId);
      
      // Sync with standardized backend keys: upvoteCount and userStatus 
      //
      setCount(res.upvoteCount ?? res.count);
      setIsSignaled(res.userStatus === 'upvoted' || res.status);
    } catch (error) {
      setCount(prevCount);
      setIsSignaled(prevStatus);
      toast.error("Support signal failed to transmit.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * TOGGLE SAVE: Handles the vault/favorite signal
   * Terminology: "delete" protocol used in socialApi for removals
   */
  const toggleSave = async () => {
    if (loading) return;
    setLoading(true);

    const prevSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const res = await socialApi.toggleSave(pickId);
      // Backend returns isFavorited or isSaved
      setIsSaved(res.isFavorited ?? res.isSaved);
      
      if (!prevSaved) toast.success("SIGNAL SAVED TO VAULT");
    } catch (error) {
      setIsSaved(prevSaved);
      toast.error("Vault sync failed.");
    } finally {
      setLoading(false);
    }
  };

  return { count, isSignaled, isSaved, toggleAction, toggleSave, loading };
};