"use client";
import React, { useCallback } from "react";
import { Spinner, Skeleton, Card } from "@nextui-org/react";
import ListingCard from "@/components/ListingCard";
import useSWRInfinite from "swr/infinite";

interface ListingData {
  listing_id: number;
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

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ListingsPage: React.FC = () => {
  const getKey = (pageIndex: number, previousPageData: any) => {
    // If there is no more data, return null to stop fetching
    if (previousPageData && !previousPageData.data.length) return null;
    return `${process.env.NEXT_PUBLIC_HOSTNAME}/listing?offset=${pageIndex * 15}`;
  };

  const { data, error, setSize, isLoading } = useSWRInfinite(getKey, fetcher);
  
  // Combine all fetched listings
  const listingData = data?.flatMap((page) => page.data) ?? [];
  const hasMoreData = data?.[data.length - 1]?.data.length === 15;

  if (error) return <div>Failed to load</div>;

  const loadMore = useCallback(() => {
    setSize((prevSize) => prevSize + 1);
  }, [setSize]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
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
          {/* Skeleton Loading */}
          {isLoading && listingData.length === 0
            ? Array.from({ length: 15 }).map((_, index) => (
                <Card key={index} className="w-full space-y-5 p-4" radius="lg">
                  <Skeleton className="rounded-lg">
                    <div className="h-48 rounded-lg bg-default-300"></div>
                  </Skeleton>
                  <div className="space-y-3">
                    <Skeleton className="w-3/5 rounded-lg">
                      <div className="h-4 w-3/5 rounded-lg bg-default-200"></div>
                    </Skeleton>
                    <Skeleton className="w-4/5 rounded-lg">
                      <div className="h-4 w-4/5 rounded-lg bg-default-200"></div>
                    </Skeleton>
                    <Skeleton className="w-2/5 rounded-lg">
                      <div className="h-4 w-2/5 rounded-lg bg-default-300"></div>
                    </Skeleton>
                  </div>
                </Card>
              ))
            : listingData.map((listing) => (
                <ListingCard
                  key={listing.listing_id}
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
              ))}
        </div>

        {/* Show More Button */}
        {hasMoreData && !isLoading && (
          <button
            onClick={loadMore}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md w-full"
          >
            Show More
          </button>
        )}

        {/* Loading Indicator for Pagination */}
        {isLoading && listingData.length > 0 && (
          <div className="flex justify-center mt-4">
            <Spinner size="lg" />
          </div>
        )}
      </main>
    </div>
  );
};

export default ListingsPage;
