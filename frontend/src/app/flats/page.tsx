"use client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  Input,
  Slider,
} from "@nextui-org/react";
import { SearchIcon } from "@/components/SearchIcon";
import ListingCard from "@/components/ListingCard";
import { useState, useEffect } from "react";

export default function Flat() {
  const [listingData, setListingData] = useState<any[]>([]);

  const showListing = async () => {
    try {
      const response = await fetch(`${process.env.HOSTNAME}/listing/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch listings.");
      }
      const data = await response.json();
      setListingData(data.data); // Set the data to state
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  useEffect(() => {
    showListing();
  }, []); // Call the function when the component mounts

  return (
    <>
      <div className="flex">
        <div className="flex flex-row w-full mt-10">
          <div className="w-3/12 mr-5 ml-10 mt-16">
            <Card className="rounded-none fixed overflow-y-auto h-4/5">
              <CardHeader className="flex justify-between bg-sky-600 text-white rounded-none">
                <h1>Filter</h1>
                <h1 className="cursor-pointer">Reset</h1>
              </CardHeader>
              <Divider />
              <CardBody>
                <div>
                  <h2>BHK</h2>
                  <div className="grid grid-cols-2 pt-4 pb-4">
                    <Checkbox radius="none">1BHK</Checkbox>
                    <Checkbox radius="none">2BHK</Checkbox>
                    <Checkbox radius="none">3BHK</Checkbox>
                    <Checkbox radius="none">4BHK</Checkbox>
                  </div>
                </div>
                <div className="mb-5">
                  <Slider
                    label="Rent Range"
                    color="primary"
                    minValue={10000}
                    maxValue={50000}
                    step={2500}
                    defaultValue={[10000, 40000]}
                  />
                  <Slider
                    className="text-2xl"
                    label="Deposit Range"
                    minValue={10000}
                    maxValue={50000}
                    step={5000}
                    defaultValue={[10000, 40000]}
                  ></Slider>
                </div>
                {/* Other filters go here */}
              </CardBody>
              <Divider />
              <CardFooter className="flex justify-center">
                <div className="p-2 border-solid">
                  <Button
                    className="text-md bg-sky-600 text-white"
                    radius="none"
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="flex flex-col w-7/12 ml-16">
            <div className="flex justify-between items-end w-7/12 fixed top-16 z-20 h-16 pl-1 pr-1 ml-2 mr-2 pb-1 bg-white/30 rounded-lg shadow-md backdrop-blur-lg">
              <Input
                className="placeholder-zinc-600 w-7/12"
                placeholder="Search flats..."
                type="search"
                startContent={
                  <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                }
              ></Input>
              <Button className="bg-sky-600 text-white rounded-md">
                Filter
              </Button>
            </div>

            {/* Display fetched listings */}
            {/* show skeleton code */}
            <div className="classList flex flex-col justify-between p-3 pl-1 w-full mt-24">
              <button onClick={() => console.log(listingData)}>show</button>
              {listingData.length > 0 ? (
                listingData.map((listing: any, index: number) => (
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
                  />
                ))
              ) : (
                <p>No listings found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
