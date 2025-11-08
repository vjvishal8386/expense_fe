import axiosClient from './axiosClient';
import { Friend, Expense, FriendInviteRequest, FriendInviteResponse } from '../data/mockData';

// Friends API
// Note: currentUserId is kept for API consistency but not used - backend infers user from JWT token
export const fetchFriends = async (_currentUserId: string): Promise<Friend[]> => {
  const response = await axiosClient.get('/friends');
  return response.data;
};

export const addFriend = async (email: string, name: string): Promise<Friend> => {
  const response = await axiosClient.post('/friends', { email, name });
  return response.data;
};

// Invite friend by email - handles both existing and new users
export const inviteFriend = async (data: FriendInviteRequest): Promise<FriendInviteResponse> => {
  const response = await axiosClient.post<FriendInviteResponse>('/friends/invite', data);
  return response.data;
};

// Expenses API
// Note: currentUserId is kept for API consistency but not used - backend infers user from JWT token
export const fetchExpenses = async (
  _currentUserId: string,
  friendId: string
): Promise<Expense[]> => {
  const response = await axiosClient.get(`/expenses/${friendId}`);
  return response.data;
};

export const addExpense = async (
  _currentUserId: string,
  friendId: string,
  amount: number,
  description: string,
  paidByUserId: string,
  date: string
): Promise<Expense> => {
  const response = await axiosClient.post('/expenses', {
    friend_id: friendId,
    amount,
    description,
    paid_by_user_id: paidByUserId,
    expense_date: date,
  });
  return response.data;
};

// Calculate balance from current user's perspective (client-side calculation)
export const calculateBalance = (expenses: Expense[], currentUserId: string): number => {
  return expenses.reduce((balance, expense) => {
    if (expense.paidByUserId === currentUserId) {
      return balance + expense.amount; // Friend owes me
    } else {
      return balance - expense.amount; // I owe friend
    }
  }, 0);
};
