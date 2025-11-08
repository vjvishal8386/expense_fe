import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FriendList from '../components/FriendList';
import { Friend } from '../data/mockData';
import { fetchFriends, inviteFriend } from '../api/mockAPI';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await fetchFriends(user.id);
      setFriends(data);
    } catch (err: any) {
      setError('Failed to load friends');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!friendEmail) {
      setError('Please enter an email address');
      return;
    }

    try {
      const response = await inviteFriend({
        email: friendEmail,
        name: friendName || undefined,
      });

      // Show success message
      setSuccessMessage(response.message);
      
      // Clear form
      setFriendEmail('');
      setFriendName('');
      
      // Reload friends list (in case friend was added immediately)
      await loadFriends();
      
      // Hide form after 3 seconds
      setTimeout(() => {
        setShowInviteFriend(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send invitation');
      console.error(err);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Friends</h1>
          <button
            onClick={() => {
              setShowInviteFriend(!showInviteFriend);
              setError('');
              setSuccessMessage('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showInviteFriend ? 'Cancel' : '📧 Invite Friend'}
          </button>
        </div>

        {showInviteFriend && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Invite a Friend</h2>
            <p className="text-sm text-gray-600 mb-4">
              Send an email invitation to your friend. If they already have an account, they'll be added immediately. 
              Otherwise, they'll receive a link to sign up!
            </p>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                ✅ {successMessage}
              </div>
            )}
            
            <form onSubmit={handleInviteFriend}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="friendEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="friendEmail"
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="friend@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="friendName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name (optional)
                  </label>
                  <input
                    id="friendName"
                    type="text"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Friend's name"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  📧 Send Invitation
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6">
          <FriendList friends={friends} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
