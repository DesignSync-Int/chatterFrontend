import React from "react";

import { useAuthStore } from "../../store/auth.store";

const ProfileTestComponent: React.FC = () => {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <div>No user data available</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-bold mb-3">Current Profile Data (Debug)</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Name:</strong> {authUser.name}
        </div>
        <div>
          <strong>Full Name:</strong> {authUser.fullName || "Not set"}
        </div>
        <div>
          <strong>Email:</strong> {authUser.email || "Not set"}
        </div>
        <div>
          <strong>Gender:</strong> {authUser.gender || "Not set"}
        </div>
        <div>
          <strong>Date of Birth:</strong> {authUser.dateOfBirth || "Not set"}
        </div>
        <div>
          <strong>Email Verified:</strong>{" "}
          {authUser.isEmailVerified ? "Yes" : "No"}
        </div>
        <div>
          <strong>Profile Picture:</strong>{" "}
          {authUser.profile ? "Set" : "Not set"}
        </div>
      </div>
    </div>
  );
};

export default ProfileTestComponent;
