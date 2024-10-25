"use client";
import React, { useState, useEffect } from "react";
import ListingCard from "@/components/ListingCard";
import { Button } from "@nextui-org/react";

interface ListingData {
  listing_title: string;
  location: string;
  images: string[];
  rent: number;
  deposit: number;
  areasqft: number;
  listing_type: number;
  prefered_tenants: number;
  furnishing: number;
  is_available: boolean;
  amenities: string[];
}

const ListingsPage: React.FC = () => {
  const [listingData, setListingData] = useState<ListingData[]>([]);

  const showListing = async () => {
    try {
      const response = await fetch(`${process.env.HOSTNAME}/listing/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch listings.");
      }
      const data = await response.json();
      // setListingData(data.data);
      setListingData((prevData) => [...prevData, ...data.data]);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  useEffect(() => {
    showListing();
  }, []);

  // TODO: grey out the card if listing is not available
  // TODO: add a loading spinner while fetching data
  // TODO: add skeleton loading for each card
  // TODO: add infinite pagination
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 mt-20">
      {/* Sidebar */}
      <aside className="md:w-1/4 lg:w-1/6 bg-white shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Filter Listings</h2>
        <ul>
          <li className="py-2 text-gray-700">Price Range</li>
          <li className="py-2 text-gray-700">Bedrooms</li>
          <li className="py-2 text-gray-700">Furnishing</li>
          <li className="py-2 text-gray-700">Location</li>
        </ul>
      </aside>

      {/* Main Content - Listings Grid */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Available Listings</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listingData.length > 0 ? (
            listingData.map((listing, index) => (
              <ListingCard
                key={index}
                title={listing.listing_title}
                location={listing.location}
                image={listing.images || ["/path/to/default-image.png"]}
                rent={listing.rent}
                deposit={listing.deposit}
                areasqft={listing.areasqft}
                listingType={listing.listing_type}
                preferedTenants={listing.prefered_tenants}
                furnishing={listing.furnishing}
                available={listing.is_available}
                amenities={listing.amenities}
              />
            ))
          ) : (
            <p>No listings found</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListingsPage;
