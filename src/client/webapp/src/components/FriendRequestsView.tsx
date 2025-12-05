import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import friendApi, { type FriendRequest as ApiFriendRequest } from "../services/friendApi";

// Local types for this component
interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  status: "offline" | "online";
}

interface FriendRequest {
  id: string;
  user: UserInfo;
  date: string;
  source: string;
  message?: string;
}

// API functions
async function fetchIncomingRequests(): Promise<FriendRequest[]> {
  try {
    const requests = await friendApi.getPendingRequests();
    
    // Transform API response to match UI format
    return requests.map(req => ({
      id: req.friendship_id,
      user: {
        id: req.id,
        name: req.full_name,
        avatar: req.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.full_name)}&background=random`,
        status: "offline" as const,
      },
      date: new Date().toISOString(), // API doesn't return date yet, use current
      source: "Có thể bạn biết",
      message: undefined,
    }));
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    return [];
  }
}

async function fetchOutgoingRequests(): Promise<FriendRequest[]> {
  // Note: Backend doesn't have endpoint for outgoing requests yet
  // This would require a new API endpoint or modifying the existing one
  return [];
}

async function acceptRequest(friendshipId: string): Promise<void> {
  await friendApi.acceptFriendRequest(friendshipId);
}

async function declineRequest(friendshipId: string): Promise<void> {
  await friendApi.rejectOrRemoveFriend(friendshipId);
}

async function withdrawRequest(friendshipId: string): Promise<void> {
  await friendApi.rejectOrRemoveFriend(friendshipId);
}

export default function FriendRequestsView() {
  const queryClient = useQueryClient();

  // Fetch incoming requests
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ["friend-requests", "incoming"],
    queryFn: fetchIncomingRequests,
  });

  // Fetch outgoing requests
  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["friend-requests", "outgoing"],
    queryFn: fetchOutgoingRequests,
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  // Decline request mutation
  const declineMutation = useMutation({
    mutationFn: declineRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  // Withdraw request mutation
  const withdrawMutation = useMutation({
    mutationFn: withdrawRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-14 border-b border-slate-200 flex items-center px-4">
        <div className="font-semibold text-sm flex items-center gap-2">
          <span>👤</span>
          <span>Lời mời kết bạn</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Incoming Requests */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Lời mời đã nhận ({incomingRequests.length})
          </h3>
          <div className="space-y-4">
            {incomingRequests.map((request) => (
              <div
                key={request.id}
                className="border border-slate-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                    {request.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">
                        {request.user.name}
                      </div>
                      <button className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full">
                        💬
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {request.date} - {request.source}
                    </div>
                    {request.message && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mb-3">
                        {request.message}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => declineMutation.mutate(request.id)}
                        disabled={declineMutation.isPending}
                        className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => acceptMutation.mutate(request.id)}
                        disabled={acceptMutation.isPending}
                        className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        Đồng ý
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {incomingRequests.length === 0 && (
              <div className="text-center text-slate-500 py-4 text-sm">
                Không có lời mời nào
              </div>
            )}
          </div>
        </div>

        {/* Outgoing Requests */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Lời mời đã gửi ({outgoingRequests.length})
          </h3>
          <div className="space-y-4">
            {outgoingRequests.map((request) => (
              <div
                key={request.id}
                className="border border-slate-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                    {request.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">
                        {request.user.name}
                      </div>
                      <button className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full">
                        💬
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                      {request.source}
                    </div>
                    <button
                      onClick={() => withdrawMutation.mutate(request.id)}
                      disabled={withdrawMutation.isPending}
                      className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    >
                      {withdrawMutation.isPending
                        ? "Đang xử lý..."
                        : "Thu hồi lời mời"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {outgoingRequests.length === 0 && (
              <div className="text-center text-slate-500 py-4 text-sm">
                Không có lời mời nào
              </div>
            )}
          </div>
        </div>

        {/* Friend Suggestions Link */}
        <div className="text-center">
          <button className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
            <span>Gợi ý kết bạn (12)</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

