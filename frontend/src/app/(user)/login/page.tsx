"use client";
import { useState } from "react";
import Cookies from "js-cookie";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    loginIdentifier: "",
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "identifier") {
      if (value.includes("@")) {
        setFormData((prev) => ({
          ...prev,
          loginIdentifier: "email",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          loginIdentifier: "username",
        }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.HOSTNAME}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
      if (response.status === 200) {
        // Set cookies
        Cookies.set("token", data.token, { expires: 3 }); // Expires in 3 days
        alert("Login successful");
        window.location.href = "/";
        // Redirect or perform other actions
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  return (
    <>
      <div className=" mt-24 max-w-md mx-auto p-6 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Username or Email"
              value={formData.identifier}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
}
