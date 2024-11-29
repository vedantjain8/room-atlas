"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Spinner, Card, Select, SelectItem } from "@nextui-org/react";
import ListingCard from "@/components/ListingCard";
import useSWRInfinite from "swr/infinite";
import { State, City, IState } from "country-state-city";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Skeleton,
  Slider,
} from "@nextui-org/react";
import { RefreshCw, Search } from "lucide-react";

const ListingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>();
  const [amenities, setAmenities] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [selectedBHK, setSelectedBHK] = useState<string[]>([]);
  const [selectedBathroom, setSelectedBathroom] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedTenant, setSelectedTenant] = useState<string[]>([]);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [rentRange, setRentRange] = useState<[number, number]>([0, 50000]);
  const [depositRange, setDepositRange] = useState<[number, number]>([
    0, 50000,
  ]);
  const [selectedAccommodation_type, setAccommodation_type] =
    useState<number>(0);

  const fetcher = (url: string) =>
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .catch((err) => {
        console.error(err);
        return { data: [] }; // Fallback for safe rendering
      });

  const buildQueryParams = (filters: Record<string, any>): string => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      } else if (value) {
        params.append(key, value);
      }
    });

    return params.toString();
  };

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && previousPageData.data?.length === 0) return null;

    const filters = {
      bhk: selectedBHK,
      bathrooms: selectedBathroom,
      type: selectedType,
      tenant: selectedTenant,
      furnishing: selectedFurnishing,
      amenities: selectedAmenities,
      preferences: selectedPreferences,
      search: searchQuery,
      city: selectedCity,
      state: selectedState,
      accommodation_type: selectedAccommodation_type,
    };

    const queryParams = buildQueryParams(filters);
    console.log(queryParams);

    return `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/?offset=${
      pageIndex * 15
    }&${queryParams}&rentMin=${rentRange[0]}&rentMax=${
      rentRange[1]
    }&depositMin=${depositRange[0]}&depositMax=${depositRange[1]}`;
  };

  const { data, error, setSize, isLoading } = useSWRInfinite(getKey, fetcher);

  const fetchAmenities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/const/listing/amenities`
      );
      const data = await response.json();
      setAmenities(data.message || []);
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/const/listing/preferences`
      );
      const data = await response.json();
      setPreferences(data.message || []);
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    }
  };
  const acco = ["Flats", "Hostels", "PGs"];

  useEffect(() => {
    if (!amenities.length) fetchAmenities();
    if (!preferences.length) fetchPreferences();
  }, []);

  const listingData = data?.flatMap((page) => page?.data || []) ?? [];
  const hasMoreData = data?.[data.length - 1]?.data?.length === 15;

  const loadMore = useCallback(() => {
    setSize((prevSize) => prevSize + 1);
  }, [setSize]);

  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  useEffect(() => {
    if (selectedState) {
      // Fetch cities of the selected state
      const citiesOfSelectedState = City.getCitiesOfState("IN", selectedState);
      // Extract city names from the fetched cities
      const cityNames = citiesOfSelectedState.map((city: any) => city.name);
      // Update cities state with the new list of city names
      setCities(cityNames);
    } else {
      // Clear cities if no state is selected
      setCities([]);
    }
  }, [selectedState]);

  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  useEffect(() => {
    if (selectedState) {
      // Fetch cities of the selected state
      const citiesOfSelectedState = City.getCitiesOfState("IN", selectedState);
      // Extract city names from the fetched cities
      const cityNames = citiesOfSelectedState.map((city: any) => city.name);
      // Update cities state with the new list of city names
      setCities(cityNames);
    } else {
      // Clear cities if no state is selected
      setCities([]);
    }
    
  }, [selectedState]);

  if (error)
    return <div className="text-red-500">Failed to load listings.</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <div className="md:w-1/4 lg:w-3/12 bg-white p-6">
        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Filters</h2>
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
                setRentRange([0, 50000]);
                setDepositRange([0, 50000]);
                setAccommodation_type(0);
              }}
            >
              <RefreshCw />
              Reset
            </Button>
          </div>
          <Select
            label="Accommodation type"
            value={selectedAccommodation_type?.toString()}
            onChange={(value) => {
              console.log;
              setAccommodation_type(Number(value.target.value));
            }}
          >
            {acco.map((a: string, index: number) => (
              <SelectItem key={index} value={index.toString()}>
                {a}
              </SelectItem>
            ))}
          </Select>

          {/* Slider Components */}
          <Slider
            label="Rent Range"
            step={50}
            minValue={0}
            maxValue={50000}
            defaultValue={rentRange}
            onChange={(value) => setRentRange(value as [number, number])}
            className="max-w-md"
          />

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
            <div className="flex items-center gap-y-2">
              <CheckboxGroup
                orientation="vertical"
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
          <select
            id="listing_state"
            name="listing_state"
            value={selectedState}
            onChange={(value) => {
              setSelectedState(value.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="opacity-55">Select State</option>

            {states.map((state: { name: string; isoCode: string }) => (
              <option key={state.name} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
          <select
            id="listing_city"
            name="listing_city"
            value={selectedCity}
            onChange={(value) => {
              setSelectedCity(value.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option className="opacity-55">Select City</option>

            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="mb-4">
            <h3 className="sm:text-sm md:text-sm lg:text-md font-bold mb-2">
              Bathrooms
            </h3>
            <div className="flex items-center gap-y-2">
              <CheckboxGroup
                orientation="horizontal"
                value={selectedBathroom}
                onValueChange={setSelectedBathroom}
                className="grid grid-cols-3"
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
                className="grid grid-cols-2 gap-2"
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

      {/* Listings */}
      <div className="lg:w-9/12 pl-4">
        <div className="sticky top-20 p-3 bg-white rounded-lg shadow-lg items-center h-14 z-30">
          <Input
            type="search"
            placeholder="Type to search..."
            startContent={<Search />}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                      isListing={true}
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
  );
};

export default ListingsPage;