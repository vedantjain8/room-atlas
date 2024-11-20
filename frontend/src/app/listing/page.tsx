"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Spinner, Card, Select, SelectItem } from "@nextui-org/react";
import ListingCard from "@/components/ListingCard";
import useSWRInfinite from "swr/infinite";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Skeleton,
  Slider,
} from "@nextui-org/react";
import { RefreshCw, Search } from "lucide-react";

// interface ListingData {
//   listing_id: number;
//   listing_title: string;
//   area: string;
//   images: string[];
//   rent: number;
//   deposit: number;
//   areasqft: number;
//   listing_type: number;
//   prefered_tenants: number;
//   furnishing: number;
//   is_available: boolean;
//   amenities: string[];
//   preferences: string[];
// }

const ListingsPage: React.FC = () => {
  const [amenities, setAmenities] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [selectedBHK, setSelectedBHK] = useState<string[]>([]);
  const [selectedBathroom, setSelectedBathroom] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string[]>([]);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [rentRange, setRentRange] = useState<[number, number]>([0, 50000]);
  const [depositRange, setDepositRange] = useState<[number, number]>([
    0, 50000,
  ]);

  // Fetcher function for SWR
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const buildQueryParams = (filters: Record<string, any>): string => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) && value.length > 1) {
        params.append(key, value.join(","));
      } else if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    return params.toString();
  };

  const getKey = (pageIndex: number, previousPageData: any) => {
    // If there is no more data, return null to stop fetching
    if (previousPageData && !previousPageData.data.length) return null;

    // Construct query parameters for paginated fetching
    const filters = {
      bhk: selectedBHK,
      bathrooms: selectedBathroom,
      type: selectedType,
      tenant: selectedTenant,
      furnishing: selectedFurnishing,
      amenities: selectedAmenities,
      preferences: selectedPreferences,
    };

    const queryParams = buildQueryParams(filters);
    return `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/?offset=${
      pageIndex * 15
    }&${queryParams}&rentMin=${rentRange[0]}&rentMax=${
      rentRange[1]
    }&depositMin=${depositRange[0]}&depositMax=${depositRange[1]}`;
  };

  const { data, error, setSize, isLoading } = useSWRInfinite(getKey, fetcher);

  const fetchAmenities = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/const/listing/amenities`,
      { method: "GET" }
    );
    const data = await response.json();
    setAmenities(data.message || []);
  };

  const fetchPreferences = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/const/listing/preferences`,
      { method: "GET" }
    );
    const data = await response.json();
    setPreferences(data.message || []);
  };

  useEffect(() => {
    if (amenities.length === 0 || !amenities) fetchAmenities();
    if (preferences.length === 0 || !preferences) fetchPreferences();
  }, []);

  // Combine all fetched listings
  const listingData = data?.flatMap((page) => page.data) ?? [];
  const hasMoreData = data?.[data.length - 1]?.data.length === 15;

  const loadMore = useCallback(() => {
    setSize((prevSize) => prevSize + 1);
  }, [setSize]);

  if (error) return <div>Failed to load</div>;

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full">
        {/* Sidebar */}
        <div className="md:w-1/4 lg:w-3/12 bg-white p-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Filter</h2>
              <Button
                className="text-sm font-medium bg-sky-500 text-blue-100 hover:bg-sky-400 rounded-none"
                onClick={() => {
                  setSelectedBHK([]);
                  setSelectedBathroom([]);
                  setSelectedType([]);
                  setSelectedTenant([]);
                  setSelectedFurnishing([]);
                  setSelectedAmenities([]);
                  setSelectedPreferences([]);
                  setRentRange([10000, 30000]);
                  setDepositRange([10000, 30000]);
                }}
              >
                <RefreshCw />
                Reset
              </Button>
            </div>

            <div className="mb-4">
              <Slider
                label="Rent Range"
                step={50}
                minValue={0}
                maxValue={50000}
                defaultValue={rentRange}
                onChange={(value) => setRentRange(value as [number, number])}
                className="max-w-md"
              />
            </div>

            <div>
              <Slider
                label="Deposit Range"
                step={50}
                minValue={0}
                maxValue={50000}
                defaultValue={depositRange}
                onChange={(value) => setDepositRange(value as [number, number])}
                className="max-w-md"
              />
            </div>

            <div className="mb-4">
              <h3 className="sm:text-sm md:text-sm lg:text-md font-bold mb-2">
                BHK
              </h3>
              <div className="grid grid-cols-2 items-center gap-y-2">
                <CheckboxGroup
                  orientation="horizontal"
                  value={selectedBHK}
                  onValueChange={setSelectedBHK}
                >
                  <Checkbox value="1">1bhk</Checkbox>
                  <Checkbox value="2">2bhk</Checkbox>
                  <Checkbox value="3">3bhk</Checkbox>
                  <Checkbox value="4">4bhk+</Checkbox>
                </CheckboxGroup>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="sm:text-sm md:text-sm lg:text-md font-bold mb-2">
                Bathrooms
              </h3>
              <div className="grid grid-cols-2 items-center gap-y-2">
                <CheckboxGroup
                  orientation="horizontal"
                  value={selectedBathroom}
                  onValueChange={setSelectedBathroom}
                >
                  <Checkbox value="1">1</Checkbox>
                  <Checkbox value="2">2</Checkbox>
                  <Checkbox value="3">3</Checkbox>
                  <Checkbox value="4">4</Checkbox>
                </CheckboxGroup>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2">Type</h3>
              <div className="grid grid-cols-2 gap-y-2">
                <CheckboxGroup
                  orientation="horizontal"
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <Checkbox value="1">Apartment</Checkbox>
                  <Checkbox value="2">Villa</Checkbox>
                  <Checkbox value="3">Bungalow</Checkbox>
                </CheckboxGroup>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="sm:text-sm md:text-sm lg:text-md font-bold mb-2">
                Tenant
              </h3>
              <div className="grid grid-cols-2 items-center gap-y-2">
                <CheckboxGroup
                  orientation="horizontal"
                  value={selectedTenant}
                  onValueChange={setSelectedTenant}
                >
                  <Checkbox value="1">Student</Checkbox>
                  <Checkbox value="2">Company</Checkbox>
                </CheckboxGroup>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="sm:text-sm md:text-sm lg:text-md font-bold mb-2">
                Furnishings
              </h3>
              <div className="grid grid-cols-2 items-center gap-y-2">
                <CheckboxGroup
                  orientation="horizontal"
                  value={selectedFurnishing}
                  onValueChange={setSelectedFurnishing}
                >
                  <Checkbox value="1">No furnishings</Checkbox>
                  <Checkbox value="2">Half-furnished</Checkbox>
                  <Checkbox value="3">Full-furnished</Checkbox>
                </CheckboxGroup>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="sm:text-sm md:text-sm lg:text-md font-bold mb-2">
                Amenities
              </h3>
              <div className="grid grid-cols-2 items-center gap-y-2">
                <CheckboxGroup
                  orientation="vertical"
                  value={selectedAmenities}
                  onValueChange={setSelectedAmenities}
                >
                  {amenities.map(
                    (amenity: { amenity_id: string; amenity_name: string }) => (
                      <Checkbox
                        key={amenity.amenity_id}
                        id={`amenity-${amenity.amenity_id}`}
                        value={amenity.amenity_id}
                      >
                        {amenity.amenity_name}
                      </Checkbox>
                    )
                  )}
                </CheckboxGroup>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="sm:text-sm md:text-sm lg:text-md font-bold mb-2">
                Preferences
              </h3>
              <div className="grid grid-cols-2 items-center gap-y-2">
                <CheckboxGroup
                  orientation="vertical"
                  value={selectedPreferences}
                  onValueChange={setSelectedPreferences}
                >
                  {preferences.map(
                    (preference: {
                      preference_id: string;
                      preference: string;
                    }) => (
                      <Checkbox
                        key={preference.preference_id}
                        id={`preference-${preference.preference_id}`}
                        value={preference.preference_id}
                      >
                        {preference.preference}
                      </Checkbox>
                    )
                  )}
                </CheckboxGroup>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-9/12 pl-4">
          <div className="sticky top-20 w-10/12 md:w-8/12 flex ml-8 p-3 bg-white md:fixed rounded-lg shadow-lg items-center h-14 z-30">
          {/* TODO: search pending */}
            <Input
              type="search"
              placeholder="type to search..."
              startContent={<Search />}
              className="lg:w-full"
            />
          </div>
          <div className="mt-14">
            {/* Main Content - Listings Grid */}
            <main className="flex-1 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Skeleton Loading */}
                {isLoading && listingData.length === 0
                  ? Array.from({ length: 15 }).map((_, index) => (
                      <Card
                        key={index}
                        className="w-full space-y-5 p-4"
                        radius="lg"
                      >
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
                        id={listing.listing_id}
                        title={listing.listing_title}
                        area={listing.area}
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
        </div>
      </div>
    </>
  );
};

export default ListingsPage;
