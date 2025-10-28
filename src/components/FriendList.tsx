import { Friend } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

interface FriendListProps {
  friends: Friend[];
}

const FriendList = ({ friends }: FriendListProps) => {
  const navigate = useNavigate();

  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No friends yet. Add a friend to get started!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div
          key={friend.id}
          onClick={() => navigate(`/chat/${friend.id}`)}
          className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow border border-gray-200 hover:border-blue-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{friend.name}</h3>
              <p className="text-sm text-gray-500">{friend.email}</p>
            </div>
            <div className="text-blue-600">
              →
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendList;
