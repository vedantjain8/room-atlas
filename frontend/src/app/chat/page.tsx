"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useSWR from "swr";
import { useAuth } from "@/app/contexts/AuthContext";
import CalendarPage from "@/components/calendar";
import { Input } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";

const socket = io(`${process.env.NEXT_PUBLIC_HOSTNAME}`, {
  autoConnect: false, // Prevent auto-connection before user authentication
});

interface Message {
  message_id: number;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  username: string;
}

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.message);

export default function ChatPage() {
  const { user } = useAuth(); // Current logged-in user
  const [receiverId, setReceiverId] = useState<string>("");
  const [receiverName, setReceiverName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function capitalizeFirstLetter(text: string) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Fetch receiverId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const receiverParam = params.get("receiverId");
    if (receiverParam) setReceiverId(receiverParam);
  }, []);

  // Fetch chat history
  const { data: history } = useSWR(
    user && receiverId
      ? `${process.env.NEXT_PUBLIC_HOSTNAME}/chat/chat-history/${user.user_id}/${receiverId}`
      : null,
    fetcher,
  );

  const { data: fetchPeopleChatList } = useSWR(
    user
      ? `${process.env.NEXT_PUBLIC_HOSTNAME}/chat/people/${user.user_id}`
      : null,
    fetcher,
  );

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  // Initialize socket connection and listeners
  useEffect(() => {
    if (!user) return;

    // Connect and authenticate
    socket.connect();
    socket.emit("identify", user.user_id);

    // Manage connection events
    const handleConnect = () => {
      console.log("Connected to server");
      setIsConnected(true);
    };
    const handleDisconnect = () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    };

    // Handle incoming chat messages
    const handleChatMessage = (data: Message) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    // Register socket events
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chatMessage", handleChatMessage);

    // Cleanup listeners on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chatMessage", handleChatMessage);
      socket.disconnect();
    };
  }, [user]);

  // Send a new message
  const sendMessage = () => {
    if (!message.trim() || !receiverId) return;

    const newMessage = {
      message_id: Date.now(),
      sender_id: user?.user_id,
      receiver_id: receiverId,
      message: message,
      created_at: new Date().toISOString(),
      username: user?.username,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Emit the chat message to the server
    socket.emit("chatMessage", {
      sender: user?.user_id,
      receiver: receiverId,
      message: message,
    });

    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden md:flex"
        } flex-col w-3/6 md:w-2/6 bg-white border-r border-gray-200 h-full`}
      >
        <div className="flex items-center justify-between bg-sky-800 text-white px-6 py-4 shadow-md">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button
            className="block md:hidden text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            ✖
          </button>
        </div>
        <div className="p-4">
          <input
            type="search"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="p-4 space-y-4">
          {fetchPeopleChatList &&
            fetchPeopleChatList.map((user: any) => (
              <button
                key={user.user_id}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  receiverId === `${user.user_id}`
                    ? "bg-sky-100 text-sky-700"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setReceiverId(`${user.user_id}`);
                  setReceiverName(user.username);
                }}
              >
                <div className="flex items-center space-x-3">
                  <Image
                    width="0"
                    height="0"
                    sizes="100vw"
                    src={`${process.env.NEXT_PUBLIC_HOSTNAME}${user.avatar}`}
                    alt={`User ${user.user_id}`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {capitalizeFirstLetter(user.username)}
                    </h3>
                    <p className="text-sm text-gray-500">Property Name</p>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      {receiverId && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex fixed top-8 mt-8 h-24 w-full md:w-5/6 items-center gap-4 justify-start bg-sky-600 text-white px-6 py-4 shadow-md">
            <button
              className="block md:hidden text-white"
              onClick={() => setIsMenuOpen(true)}
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold">
              {capitalizeFirstLetter(receiverName)}
            </h1>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 bg-gray-50 mt-16 pb-44 break-words overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.message_id}
                className={`mb-4 max-w-xs ${
                  msg.sender_id === user?.user_id
                    ? "ml-auto bg-sky-100 border-1 rounded-tr-none"
                    : "mr-auto bg-gray-200 border-1 rounded-tl-none"
                } p-3 rounded-xl shadow-sm`}
              >
                <p className="text-sm font-semibold">
                  {msg.sender_id === user?.user_id ? "You" : `${receiverName}`}
                </p>
                <p className="mt-1 text-gray-700">
                  {msg.message.startsWith("http") ? (
                    <Link href={msg.message}>{msg.message}</Link>
                  ) : (
                    msg.message
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex sticky bottom-0 w-full items-center gap-2 bg-white py-3 border-t pr-8 border-gray-200">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={() => sendMessage()}
              className="ml-3 px-6 rounded-xl bg-sky-600 text-white pt-2 pb-2 hover:bg-sky-700"
            >
              Send
            </button>
            {user && (
              <CalendarPage
                senderid={Number(user.user_id)}
                receiverid={Number(receiverId)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
