import api from '../utils/axios';

export interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
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

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  isApproved?: boolean;
}

// Admin: Get all reviews (including unapproved)
export const getAllReviews = async (): Promise<Review[]> => {
  const response = await api.get('/reviews/admin/all');
  return response.data.data;
};

// Admin: Approve a review
export const approveReview = async (id: string): Promise<Review> => {
  const response = await api.put(`/reviews/${id}/approve`);
  return response.data.data;
};

// Admin: Update a review (edit comment, rating, or approval status)
export const updateReview = async (id: string, data: UpdateReviewData): Promise<Review> => {
  const response = await api.put(`/reviews/admin/${id}`, data);
  return response.data.data;
};

// Admin: Delete any review
export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/admin/${id}`);
};
