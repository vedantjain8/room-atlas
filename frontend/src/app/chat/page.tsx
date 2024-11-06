"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useSWR from "swr";
import { useAuth } from "@/app/contexts/AuthContext";

const socket = io(`${process.env.NEXT_PUBLIC_HOSTNAME}`);

interface Message {
  message_id: number;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.message); // Extract the "message" array

export default function ChatPage() {
  const { user } = useAuth(); // Current logged-in user
  const [receiverId, setReceiverId] = useState<string>("2"); // Default receiver
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);

  // SWR to fetch chat history
  const { data: history, error } = useSWR(
    user && receiverId
      ? `${process.env.NEXT_PUBLIC_HOSTNAME}/chat/chat-history/${user.user_id}/${receiverId}`
      : null,
    fetcher
  );

  // Handle fetched chat history with SWR
  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

    function initConnection() {
      console.log("Connecting to server...");
      // Handle connection and disconnection
      socket.on("connect", () => {
        socket.emit("identify", user?.user_id); // Send user ID to server on connect
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      // Listen for incoming chat messages
      socket.on("chatMessage", (data: Message) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      // Cleanup on unmount
      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("chatMessage");
      };
    }

  // Send a message to the server
  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      message_id: Date.now(), // Temporary ID for rendering
      sender_id: user?.user_id,
      receiver_id: receiverId,
      message,
      created_at: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    socket.emit("chatMessage", {
      sender: user?.user_id,
      receiver: receiverId,
      message,
    });

    setMessage(""); // Clear input field after sending
  };

  //   Render loading or error state if necessary
//   if (!history && !error) return <p>Loading chat history...</p>;
//   if (error) return <p>Failed to load chat history.</p>;

  return (
    <div>
      <h2>Chat with User {receiverId}</h2>
      <div>
        <label htmlFor="receiverId">Switch User: </label>
        <input
          type="text"
          id="receiverId"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.message_id}>
            <strong>
              {msg.sender_id === user?.user_id
                ? "You"
                : `User ${msg.sender_id}`}
              :
            </strong>{" "}
            {msg.message}
            <br />
            <small>{new Date(msg.created_at).toLocaleString()}</small>
            <hr />
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
