import { Expense } from '../data/mockData';

interface ExpenseCardProps {
  expense: Expense;
  friendName: string;
  currentUserId: string;
}

const ExpenseCard = ({ expense, friendName, currentUserId }: ExpenseCardProps) => {
  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isPaidByMe = expense.paidByUserId === currentUserId;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {expense.description}
            </span>
            {isPaidByMe ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                You paid
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {friendName} paid
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${
            isPaidByMe 
              ? 'text-red-600'  // Friend owes me
              : 'text-green-600' // I owe friend
          }`}>
            ₹{expense.amount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
