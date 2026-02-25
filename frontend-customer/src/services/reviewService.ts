import axiosInstance from '../utils/axios';

export interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  menuItem?: {
    _id: string;
    name: string;
  };
  order?: {
    _id: string;
    orderId: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  menuItemId?: string;
  orderId?: string;
  rating: number;
  comment: string;
}

export interface ReviewRating {
  averageRating: number;
  totalReviews: number;
}

// Get reviews for a menu item
export const getMenuItemReviews = async (menuItemId: string): Promise<Review[]> => {
  const response = await axiosInstance.get(`/reviews/item/${menuItemId}`);
  return response.data.data;
};

// Get average rating for a menu item
export const getMenuItemRating = async (menuItemId: string): Promise<ReviewRating> => {
  const response = await axiosInstance.get(`/reviews/item/${menuItemId}/rating`);
  return response.data.data;
};

// Get user's own reviews
export const getMyReviews = async (): Promise<Review[]> => {
  const response = await axiosInstance.get('/reviews/my');
  return response.data.data;
};

// Create a new review
export const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
  const response = await axiosInstance.post('/reviews', reviewData);
  return response.data.data;
};

// Update a review
export const updateReview = async (id: string, reviewData: Partial<CreateReviewData>): Promise<Review> => {
  const response = await axiosInstance.put(`/reviews/${id}`, reviewData);
  return response.data.data;
};

// Delete a review
export const deleteReview = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/reviews/${id}`);
};

// Admin: Get all reviews (including unapproved)
export const getAllReviews = async (): Promise<Review[]> => {
  const response = await axiosInstance.get('/reviews/admin/all');
  return response.data.data;
};

// Admin: Approve a review
export const approveReview = async (id: string): Promise<Review> => {
  const response = await axiosInstance.put(`/reviews/${id}/approve`);
  return response.data.data;
};

// Admin: Delete any review
export const deleteReviewAdmin = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/reviews/admin/${id}`);
};