export interface Complaint {
  id: string;
  name: string;
  seq: number;
  category: string;
  subCategory: string;
  standardizedSubCategory: string; 
  district: string;
  city: string;
  pin: string;
  locality?: string;
  street?: string;
  photo?: string;
  upvotes: number;
  dateOfPost: string;
  status: string;
  urgency: string;
  description: string;
}