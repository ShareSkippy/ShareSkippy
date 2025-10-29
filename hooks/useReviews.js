import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch reviews for a user
export const useUserReviews = (userId, showAll = false) => {
  return useQuery({
    queryKey: ['reviews', userId, showAll],
    queryFn: async () => {
      if (!userId)
        return { reviews: [], stats: { averageRating: 0, reviewCount: 0, ratingDistribution: {} } };

      const limit = showAll ? 50 : 5;

      // Fetch both reviews and stats in parallel
      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch(`/api/reviews?userId=${userId}&limit=${limit}`),
        fetch(`/api/reviews/stats?userId=${userId}`),
      ]);

      const [reviewsData, statsData] = await Promise.all([
        reviewsResponse.json(),
        statsResponse.json(),
      ]);

      if (!reviewsResponse.ok) {
        throw new Error(reviewsData.error || 'Failed to fetch reviews');
      }

      return {
        reviews: reviewsData.reviews || [],
        stats: statsResponse.ok
          ? statsData
          : { averageRating: 0, reviewCount: 0, ratingDistribution: {} },
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Submit a review
export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate reviews for the reviewed user
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.reviewed_id] });
    },
  });
};
