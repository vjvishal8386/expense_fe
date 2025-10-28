import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FriendList from '../components/FriendList';
import { Friend } from '../data/mockData';
import { fetchFriends, addFriend } from '../api/mockAPI';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [error, setError] = useState('');

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

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!friendEmail || !friendName) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const newFriend = await addFriend(friendEmail, friendName);
      setFriends([...friends, newFriend]);
      setFriendEmail('');
      setFriendName('');
      setShowAddFriend(false);
      await loadFriends();
    } catch (err: any) {
      setError('Failed to add friend');
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
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAddFriend ? 'Cancel' : '+ Add Friend'}
          </button>
        </div>

        {showAddFriend && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Add New Friend</h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleAddFriend}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="friendName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="friendName"
                    type="text"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter friend's name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="friendEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="friendEmail"
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter friend's email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Friend
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
