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
