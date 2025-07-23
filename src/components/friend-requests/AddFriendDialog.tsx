import { UserPlus, Loader2 } from "lucide-react";
import React, { useState } from "react";

import { useFriendRequestStore } from "../../store/friendRequest.store";
import type { User as UserType } from "../../types/auth";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface AddFriendDialogProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendDialog: React.FC<AddFriendDialogProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { sendFriendRequest } = useFriendRequestStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await sendFriendRequest(user._id, message.trim());
      setSuccess(`Friend request sent to ${user.name}!`);
      setMessage("");

      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send friend request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setError("");
    setSuccess("");
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add ${user.name} as Friend`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600">
            Send a friend request to{" "}
            <span className="font-semibold">{user.name}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Message (Optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message with your friend request..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            rows={3}
            maxLength={100}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            {message.length}/100 characters
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFriendDialog;
