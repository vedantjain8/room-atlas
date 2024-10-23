// {
//   "property_id": 7,
//   "property_title": "Cozy Apartment",
//   "property_desc": "A cozy 2-bedroom apartment with a great city view.",
//   "images": [
//       "image1.jpg",
//       "image2.jpg"
//   ],
//   "uploaded_by": 1,
//   "is_available": true,
//   "rented_on": null,
//   "location": "Downtown",
//   "city": "New York",
//   "state": "NY",
//   "property_type": 1,
//   "prefered_tenants": 1,
//   "bedrooms": 2,
//   "bathrooms": 1,
//   "rent": "2500.00",
//   "deposit": "5000.00",
//   "furnishing": 2,
//   "floor": 4,
//   "total_floors": 10,
//   "areasqft": "1200.00",
//   "amenities": [
//       "Parking",
//       "Lift",
//       "24x7 Security",
//       "Power Backup",
//       "Water Supply"
//   ]
// }

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Checkbox,
    Divider,
    Image,
    Input,
    Slider,
  } from "@nextui-org/react";
  import React from "react";
  
  interface ListingCardProps {
    title: string;
    location: string;
    image: string[];
    rent: number;
    deposit: number;
    areasqft: number;
    listingType: number;
    preferedTenants: number;
    furnishing: number;
    available: boolean;
  }
  
  const ListingCard: React.FC<ListingCardProps> = ({
    title,
    location,
    image,
    rent,
    deposit,
    areasqft,
    listingType,
    preferedTenants,
    furnishing,
    available,
  }) => {
    return (
      <div className="my-3">
        <Card className="w-full transition cursor-pointer rounded-md">
          <CardHeader className="flex justify-between gap-3">
            <h1 className="font-medium">{title}</h1>
            <h2 className="flex flex-end font-medium">{location}</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex w-full">
              <div className="transition hover:ring-offset-3 hover:ring-2 ring-sky-800 rounded-2xl p-1">
                
                  <Image
                    width={200}
                    // height="100%"
                    alt="flatimage"
                    src={`${process.env.HOSTNAME}/${image[0]}`}
                  />
                  
              </div>
              <div className="flex flex-col w-9/12 pl-5">
                <div className="flex justify-evenly">
                  <div className="flex flex-col items-center">
                    <p className="font-medium">{rent}</p>
                    <h2 className="text-sm">Rent</h2>
                  </div>
                  <Divider orientation="vertical" />
                  <div className="flex flex-col items-center">
                    <p className="font-medium">{deposit}</p>
                    <h2 className="text-sm">Deposit</h2>
                  </div>
  
                  <Divider orientation="vertical" />
                  <div className="flex flex-col items-center">
                    <p className="font-medium">{areasqft} sqft</p>
                    <h2 className="text-sm">Buildup</h2>
                  </div>
                </div>
                <Divider className="my-1" />
                <div className="flex">
                  <div className="flex flex-col w-6/12">
                    <div className="grid grid-cols-2 border-solid border-2 border-sky-800">
                      <div className="border-solid border-1 border-sky-700 pl-4 pr-4 h-16 m-1 flex justify-center items-center">
                        <h1 className="text-md">
                          {(() => {
                            switch (listingType) {
                              case 1:
                                return "Apartment";
                              case 2:
                                return "Villa";
                              case 3:
                                return "Bungalow";
                              default:
                                return "Unknown";
                            }
                          })()}
                        </h1>
                      </div>
  
                      <div className="border-solid border-1 border-sky-700 pl-4 pr-4 h-16 m-1 flex justify-center items-center ">
                        <h1 className="text-md">
                          {(() => {
                            switch (preferedTenants) {
                              case 1:
                                return "Family";
                              case 2:
                                return "Student";
                              case 3:
                                return "Company";
                              default:
                                return "Unknown";
                            }
                          })()}
                        </h1>
                      </div>
  
                      <div className="border-solid border-1 border-slate-800 pl-3 pr-3 h-16 m-1 flex justify-center items-center">
                        <h1 className="text-md">
                          {(() => {
                            switch (furnishing) {
                              case 1:
                                return "Full-Furnishing";
                              case 2:
                                return "Half-furnishing";
                              case 3:
                                return "No Furnishing";
                              default:
                                return "Unknown";
                            }
                          })()}
                        </h1>
                      </div>
  
                      <div className="border-solid border-1 border-slate-800 pl-2 pr-2 m-1 flex justify-center items-center">
                        <h1 className="text-md">
                          {(() => {
                            return available ? "Available" : "Not Available";
                          })()}
                        </h1>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h2 className="font-medium">Amenities</h2>
                      <div className="flex justify-between mt-1">
                        <div className="bg-stone-200 p-1 mr-1 hover:bg-sky-600 hover:text-white">
                          <h2>Washing Machine</h2>
                        </div>
                        <div className="bg-stone-200 p-1 mr-1 hover:bg-sky-600 hover:text-white">
                          <h2>Fridge</h2>
                        </div>
                        <div className="bg-stone-200 p-1 mr-1 hover:bg-sky-600 hover:text-white">
                          <h2>Geyser</h2>
                        </div>
                        <div className="bg-stone-200 p-1 hover:bg-sky-600 hover:text-white">
                          <h2>AC</h2>
                        </div>
                      </div>
                      <div className="flex w-16 bg-stone-200 p-1 mt-1 hover:bg-sky-600 hover:text-white">
                        <h2>more...</h2>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/12 flex justify-center">
                    <Divider orientation="vertical" />
                  </div>
                  <div className="flex flex-col w-5/12 mt-3">
                    <div className="flex justify-start ml-1">
                      <h1 className="font-medium">Preferences</h1>
                    </div>
                    <div className="grid grid-cols-2 mt-2">
                      <div className="bg-stone-200 p-1 m-1 hover:bg-sky-600 hover:text-white">
                        <h2>No Smoking</h2>
                      </div>
                      <div className="bg-stone-200 p-1 m-1 hover:bg-sky-600 hover:text-white">
                        <h2>No drinking</h2>
                      </div>
                      <div className="bg-stone-200 p-1 m-1 hover:bg-sky-600 hover:text-white col-span-2">
                        <h2>No Non-Vegetarian</h2>
                      </div>
                      <div className="bg-stone-200 p-1 m-1 hover:bg-sky-600 hover:text-white">
                        <h2>Studious</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };
  
  export default ListingCard;
  