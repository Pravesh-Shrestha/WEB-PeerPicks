// src/services/social.service.ts

import { pickRepository } from "repositories/pick.repository";


export const handleVote = async (userId: string, pickId: string, voteType: 'up' | 'down') => {
  const pick = await pickRepository.findById(pickId);
  if (!pick) throw new Error("Pick not found");

  const hasUpvoted = pick.upvotes.some((id: any) => id.toString() === userId);
  const hasDownvoted = pick.downvotes.some((id: any) => id.toString() === userId);

  // 1. Logic for Upvote
  if (voteType === 'up') {
    if (hasUpvoted) {
      // Toggle off: Delete the upvote
      return await pickRepository.removeVote(pickId, userId);
    } else {
      // Add upvote (automatically handles deleting downvote via repo)
      return await pickRepository.addUpvote(pickId, userId);
    }
  } 

  // 2. Logic for Downvote
  if (voteType === 'down') {
    if (hasDownvoted) {
      // Toggle off: Delete the downvote
      return await pickRepository.removeVote(pickId, userId);
    } else {
      // Add downvote (automatically handles deleting upvote via repo)
      return await pickRepository.addDownvote(pickId, userId);
    }
  }
};