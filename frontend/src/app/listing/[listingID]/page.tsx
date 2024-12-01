"use client";

import { ImagesSlider } from "@/components/ui/images-slider";
import { Avatar, Button, Divider, Image, Input } from "@nextui-org/react";
import {
  Eye,
  Heart,
  Link,
  MapPin,
  MapPinned,
  Pen,
  PencilLine,
  Send,
  Share,
} from "lucide-react";
import {
  getCookie,
  getCookies,
  setCookie,
  deleteCookie,
  hasCookie,
} from "cookies-next";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/contexts/AuthContext";
import { redirect } from "next/navigation";
// import imageflat from 'room-atlas/frontend/src/app/images/flat_image.png';

function ListingDetails({ params }: { params: { listingID: string } }) {
  const { token, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [listingData, setListingData] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [ownerDetails, setOwnerDetails] = useState<any>(null);
  const [postReviewData, setPostReviewData] = useState<string>();
  const listingID = params.listingID;

  const shareData = {
    title: "Room Atlas",
    text: "Get the best homes ever",
    url: "http://localhost:3000",
  };

  const shareHandler = async () => {
    try {
      await navigator.share(shareData);
      console.log("Shared successfully");
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const tenantTypes: { [key: number]: string } = {
    1: "Student",
    2: "Working Professional",
    3: "Family",
  };

  async function fetchData(id: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/${id}`
      );
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.statusText}`);
      const data = await res.json();
      setListingData(data.message);
      await fetchStats();
      await fetchOwnerDetails(data.message.uploaded_by.toString());
    } catch (error) {
      console.error("Error fetching listing data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchOwnerDetails(ownerID: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/user/${ownerID}`
      );
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.statusText}`);
      const data = await res.json();
      setOwnerDetails(data.message);
    } catch (error) {
      console.error("Error fetching owner data:", error);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/${listingID}/stats`
      );
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.statusText}`);
      const data = await res.json();
      setStatsData(data.message);
      await fetchReview();
    } catch (error) {
      console.log("Error fetching listing data: ", error);
    }
  }

  async function fetchReview() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/review/${listingID}`
      );
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.statusText}`);
      const data = await res.json();
      setReviewData(data.message);
    } catch (error) {
      console.log("Error fetching listing data: ", error);
    }
  }

  async function onSubmit() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/review/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            review: postReviewData,
            listing_id: listingID,
            user_id: user.user_id,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Review created successfully:", data);
      alert("Review created successfully!");
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // const images_arr = [imageflat]
  useEffect(() => {
    if (listingID) fetchData(listingID);
  }, [listingID]);
  useEffect(() => {
    fetchStats();
    fetchReview();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!listingData && !isLoading) {
    return <div>No data found.</div>;
  }

  const imageList = listingData.images.map((imagePath: string) => {
    return `${process.env.NEXT_PUBLIC_HOSTNAME}${imagePath}`; // Prepend the host if needed
  });

  return (
    <div className="flex flex-col p-6 gap-6">
      {/* Title Section */}
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold">
            {listingData.listing_title || "Building Name"}
          </h1>
          <span className="text-gray-600">
            {listingData.area || "Location not specified"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="text-sky-700" />
          <div className="text-sky-700 font-semibold rounded-2xl">
            <p>{listingData.city},</p>
          </div>
          <div className="text-sky-700 font-semibold rounded-2xl">
            <p>{listingData.state}</p>
          </div>
        </div>
      </div>

      {/* Image and Details */}
      <div className="flex flex-col gap-4 md:gap-6 md:flex-row">
        <div className="flex w-full md:w-2/3">
          {/* Image Section */}
          <ImagesSlider images={imageList} className="h-40 sm:h-60 md:h-full">
            <motion.div
              initial={{
                opacity: 0,
                y: -80,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="z-50 flex flex-col justify-center items-center"
            ></motion.div>
          </ImagesSlider>
        </div>
        <div className="md:hidden flex justify-between items-center border-t border-gray-200 pt-4 w-full">
          <div className="flex justify-between gap-6">
            <div className="flex gap-2 items-center">
              <Eye className="text-gray-600" />
              <span>{statsData.views || 0}</span>
            </div>
          </div>
          <div className="flex gap-4 pr-4">
            <div className="flex gap-2 items-center">
              <Button
                onClick={async () => {
                  const exists = hasCookie(`listing_${listingID}_like`);
                  console.log(exists);
                  if (exists) return;
                  await fetch(
                    `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/${listingID}/like`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `${token}`,
                      },
                    }
                  );
                  setCookie(`listing_${listingID}_like`, "true");

                  setStatsData((prev: any) => {
                    return {
                      ...prev,
                      likes: prev.likes + 1,
                    };
                  });
                }}
              >
                {hasCookie(`listing_${listingID}_like`) ? (
                  <Heart className="text-red-500" />
                ) : (
                  <Heart className="text-white" />
                )}
                <span className="text-sm md:text-base">
                  {statsData.likes || 0}
                </span>
              </Button>
            </div>
            <Link onClick={shareHandler}>
              <div className="flex gap-2 items-center">
                <Share className="text-blue-500" />
              </div>
            </Link>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col gap-2 md:gap-4 w-full md:w-1/3 mt-4 md:mt-0">
          <div className="flex justify-evenly border border-gray-300 rounded-lg p-2 md:p-4 bg-gray-50">
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-semibold">
                &#8377;{parseInt(listingData.rent)}/month
              </span>
              <p className="text-xs md:text-sm text-gray-500">Rent</p>
            </div>
            <Divider orientation="vertical" className="mx-2 md:mx-4" />
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-semibold">
                &#8377;{parseInt(listingData.deposit) || "N/A"}
              </span>
              <p className="text-xs md:text-sm text-gray-500">Deposit</p>
            </div>
            <Divider orientation="vertical" className="mx-2 md:mx-4" />
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-xl font-semibold">
                {parseInt(listingData.areasqft) || "N/A"} sq.ft
              </span>
              <p className="text-xs md:text-sm text-gray-500">Area</p>
            </div>
          </div>
          <div className="flex items-center justify-evenly gap-3 bg-gray-100 border-1 border-slate-300 rounded-lg p-4">
            <h2>{listingData.bedrooms}BHK</h2>
            <Divider orientation="vertical" />
            <h2>For {tenantTypes[listingData.prefered_tenants]}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-4 justify-center items-center border border-gray-300 rounded-lg p-2 md:p-4 bg-gray-50">
            {listingData.amenities.map((amenity: string, index: string) => (
              <div
                className="flex border-1 border-slate-400 justify-center p-2 md:p-4 rounded-md"
                key={index}
              >
                <h2 className="text-sm md:text-lg">{amenity}</h2>
              </div>
            ))}
          </div>

          <Button
            className="bg-gradient-to-br from-sky-500 to-blue-700 text-white text-xs md:text-base"
            onClick={() => {
              window.location.href = `/chat?receiverId=${listingData.uploaded_by}`;
            }}
          >
            <Send strokeWidth={1.5} />
            Message
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="hidden md:flex flex-col md:flex-row justify-between items-center border-gray-200 pt-2 md:pt-4 w-full md:w-2/3">
        <div className="flex justify-between gap-4 md:gap-6">
          <div className="flex gap-2 items-center">
            <Eye className="text-gray-600" />
            <span className="text-sm md:text-base">{statsData.views || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 pr-0 md:pr-4">
          <div className="flex gap-2 items-center">
            <Button
              onClick={async () => {
                const exists = hasCookie(`listing_${listingID}_like`);
                console.log(exists);
                if (exists) return;
                await fetch(
                  `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/${listingID}/like`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `${token}`,
                    },
                  }
                );
                setCookie(`listing_${listingID}_like`, "true");

                setStatsData((prev: any) => {
                  return {
                    ...prev,
                    likes: prev.likes + 1,
                  };
                });
              }}
            >
              {hasCookie(`listing_${listingID}_like`) ? (
                <Heart className="text-red-500" />
              ) : (
                <Heart className="text-white" />
              )}
              <span className="text-sm md:text-base">
                {statsData.likes || 0}
              </span>
            </Button>
          </div>
          <Link onClick={shareHandler}>
            <div className="flex gap-2 items-center">
              <Share className="text-blue-500" />
              <span className="text-sm md:text-base">Share</span>
            </div>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Avatar
            src={`${process.env.NEXT_PUBLIC_HOSTNAME}${ownerDetails.avatar}`}
          />
          <h2>{ownerDetails.username}</h2>
        </div>
        <div className="flex flex-col gap-2 border-1 border-sky-600 rounded p-3">
          <h2 className="text-sky-800">Description</h2>
          <h2>{listingData.listing_desc}</h2>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-col w-full gap-4">
          <h2 className="text-xl font-semibold">Review</h2>
          <div className="flex items-center gap-5">
            <Input
              label="Write a review"
              id="review"
              onChange={(e) => {
                setPostReviewData(e.target.value);
              }}
            />
            <Button
              className="bg-gradient-to-br from-sky-600 to-blue-600 text-white rounded-xl"
              onClick={onSubmit}
            >
              Send
            </Button>
          </div>
        </div>

        {reviewData.map((review: any, index: number) => (
          <div
            className="flex flex-row p-4 border-1 border-sky-600 rounded-lg w-full mt-6 gap-4"
            key={index}
          >
            <div className="flex gap-4 items-start">
              <Avatar
                src={`${process.env.NEXT_PUBLIC_HOSTNAME}${review.user.avatar}`}
              />
            </div>
            <div className="flex flex-col gap-4 items-start justify-center">
              <h2 className="pt-1 font-semibold">{review.user.username}</h2>
              <p className="pl-2">{review.review}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListingDetails;

// without using router, instead use params provided by nextjs... and also make the unimplemented code that should be there but currently isnt
