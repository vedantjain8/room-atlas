"use client";
import { useAuth } from "@/app/contexts/AuthContext";
import { ProfileUpload } from "@/components/ui/profile-upload";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { token } = useAuth();
  const [userData, setUserData] = useState<userData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  interface userData {
    user_id: string;
    username: string;
    email: string;
    bio: string;
    avatar: string;
    created_at: string;
    active: string;
    user_role: string;
    gender: string;
    occupation: string;
    city: string;
    state: string;
    email_verified: string;
    preferences: string;
  }

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_HOSTNAME}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.message);
        setLoading(false);
      });
  }, [token]);

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file to upload.");
    if (!token) return alert("Unauthorized. Please log in.");

    setUploading(true);

    const formData = new FormData();
    formData.append("uploaded_file", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/upload/profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert("Profile picture uploaded successfully.");
        // Update the avatar URL in the profile
        setUserData((prev) =>
          prev ? { ...prev, avatar: data.response } : null,
        );
      } else {
        alert(
          JSON.stringify(data.response) || "Failed to upload profile picture.",
        );
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the profile picture.");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (!userData) return <p className="text-center mt-10">No profile data</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/3 p-6 flex flex-col items-center">
            <Image
              width="0"
              height="0"
              sizes="100vw"
              src={userData.avatar}
              alt={`${userData.username}'s avatar`}
              className="w-32 h-32 rounded-full border-4 border-white shadow-md"
            />
            <h2 className="mt-4 text-2xl font-semibold">{userData.username}</h2>
            <p className="text-sm">{userData.occupation}</p>
            <div className="mt-4 w-full border">
              <ProfileUpload onChange={handleFileChange} />
              {selectedFile && (
                <p className="text-sm mt-2 text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg ${
                  uploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
              >
                {uploading ? "Uploading..." : "Upload Profile Picture"}
              </button>
            </div>
          </div>
          <div className="w-full md:w-2/3 p-6">
            <h3 className="text-xl font-semibold text-gray-700">
              User Details
            </h3>
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-medium">Email: </span>
                  {userData.email}
                </p>
                <p>
                  <span className="font-medium">City: </span>
                  {userData.city}
                </p>
                <p>
                  <span className="font-medium">State: </span>
                  {userData.state}
                </p>
                <p>
                  <span className="font-medium">Gender: </span>
                  {userData.gender}
                </p>
                <p>
                  <span className="font-medium">Active: </span>
                  {userData.active ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-medium">Role: </span>
                  {userData.user_role}
                </p>
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-6 text-gray-700">
              Preferences
            </h3>
            <p className="mt-2 text-gray-600">
              {userData.preferences || "No preferences set"}
            </p>
            <h3 className="text-xl font-semibold mt-6 text-gray-700">Bio</h3>
            <p className="mt-2 text-gray-600">
              {userData.bio || "No bio provided"}
            </p>
            <p className="text-sm text-gray-500 mt-6">
              Joined on {new Date(userData.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
