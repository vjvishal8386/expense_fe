// Type definitions for API responses

export interface Friend {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  // Expenses are between two users
  userAId: string;
  userBId: string;
  amount: number;
  description: string;
  paidByUserId: string; // ID of the user who paid
  date: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  email_verified: boolean;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
  email_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface OTPVerifyRequest {
  user_id: string;
  otp: string;
}

export interface OTPResendRequest {
  user_id: string;
  email: string;
}

// Friend Invitation Types
export interface FriendInviteRequest {
  email: string;
  name?: string;
}

export interface FriendInviteResponse {
  message: string;
  invitation_sent: boolean;
  friend_exists: boolean;
  friend?: Friend;
}
