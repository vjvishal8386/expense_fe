import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpenseCard from '../components/ExpenseCard';
import PDFDownloadModal from '../components/PDFDownloadModal';
import { Friend, Expense } from '../data/mockData';
import { fetchFriends, fetchExpenses, addExpense, calculateBalance, downloadExpensePDF } from '../api/mockAPI';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState<'me' | 'friend'>('me');
  const [error, setError] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [friendId, user]);

  const loadData = async () => {
    if (!friendId || !user) return;

    try {
      setLoading(true);
      const friendsList = await fetchFriends(user.id);
      
      const foundFriend = friendsList.find(f => f.id === friendId);
      if (foundFriend) {
        setFriend(foundFriend);
        const expensesData = await fetchExpenses(user.id, friendId);
        setExpenses(expensesData);
      } else {
        setError('Friend not found');
      }
    } catch (err: any) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!friendId || !user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      // Convert 'me' or 'friend' to actual user ID
      const paidByUserId = paidBy === 'me' ? user.id : friendId;
      
      const newExpense = await addExpense(
        user.id,
        friendId,
        amountNum,
        description,
        paidByUserId,
        today
      );
      
      setExpenses([...expenses, newExpense]);
      setAmount('');
      setDescription('');
      setShowAddExpense(false);
      // Reload data to refresh the list
      await loadData();
    } catch (err: any) {
      setError('Failed to add expense');
      console.error(err);
    }
  };

  const handleDownloadPDFClick = () => {
    setShowPDFModal(true);
    setError('');
  };

  const handleConfirmDownload = async () => {
    if (!friendId) return;

    setDownloadingPDF(true);
    setError('');

    try {
      await downloadExpensePDF(friendId);
      // Success - PDF will download automatically
      setShowPDFModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to download PDF report');
      console.error('PDF download error:', err);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleCloseModal = () => {
    if (!downloadingPDF) {
      setShowPDFModal(false);
    }
  };

  const balance = user ? calculateBalance(expenses, user.id) : 0;
  const isSettled = Math.abs(balance) < 0.01;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !friend) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Friends
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Expenses with {friend?.name}
          </h1>
          
          {/* Balance Display */}
          <div className={`p-4 rounded-lg ${
            isSettled 
              ? 'bg-green-50 border border-green-200' 
              : balance > 0 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className="text-sm text-gray-600 mb-1">Current Balance:</p>
            {isSettled ? (
              <p className="text-lg font-bold text-green-700">✓ All Settled</p>
            ) : balance > 0 ? (
              <p className="text-lg font-bold text-red-700">
                {friend?.name} owes you ₹{Math.abs(balance).toFixed(2)}
              </p>
            ) : (
              <p className="text-lg font-bold text-blue-700">
                You owe {friend?.name} ₹{Math.abs(balance).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={handleDownloadPDFClick}
            disabled={expenses.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Download expense report as PDF"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>📄 Download PDF</span>
          </button>
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAddExpense ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>

        {showAddExpense && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleAddExpense}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Lunch, Movie, etc."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who paid?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paidBy"
                        value="me"
                        checked={paidBy === 'me'}
                        onChange={() => setPaidBy('me')}
                        className="mr-2"
                      />
                      <span className="text-sm">I paid</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paidBy"
                        value="friend"
                        checked={paidBy === 'friend'}
                        onChange={() => setPaidBy('friend')}
                        className="mr-2"
                      />
                      <span className="text-sm">{friend?.name} paid</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
              No expenses yet. Add an expense to get started!
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} friendName={friend?.name || ''} currentUserId={user?.id || ''} />
            ))
          )}
        </div>
      </div>

      {/* PDF Download Modal */}
      <PDFDownloadModal
        isOpen={showPDFModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDownload}
        friendName={friend?.name || 'Friend'}
        expenseCount={expenses.length}
        balance={balance}
        isSettled={isSettled}
        downloading={downloadingPDF}
      />
    </div>
  );
};

export default Chat;
