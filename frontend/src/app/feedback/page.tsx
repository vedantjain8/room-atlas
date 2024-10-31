"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function FeedbackForm() {
  const { token } = useAuth(); // Use `useAuth` directly in the component
  const [feedbackData, setFeedbackData] = useState({
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/feedback`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedbackData),
        }
      );

      if (data.status === 200) {
        alert("Feedback sent successfully");
        setFeedbackData({
          email: "",
          message: "",
        });
      } else {
        const error = await data.json();
        alert(error.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  return (
    <div className="mt-24 max-w-md mx-auto p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Your Email"
            value={feedbackData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <textarea
            id="message"
            name="message"
            placeholder="Your Message"
            value={feedbackData.message}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
        >
          Send Feedback
        </button>
      </form>
    </div>
  );
}
