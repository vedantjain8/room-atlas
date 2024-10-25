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

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  Image,
  Chip,
} from "@nextui-org/react";

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
  amenities: string[];
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
  amenities,
}) => {
  return (
    <Card
      className="hover:shadow-lg transition-shadow rounded-lg w-full max-w-s"
      isHoverable
    >
      <CardHeader className="flex items-center justify-between p-4">
        <h4 className="font-semibold">{title}</h4>
        {available ? (
          <Badge color="success" variant="flat">
            Available
          </Badge>
        ) : (
          <Badge color="danger" variant="flat">
            Rented
          </Badge>
        )}
      </CardHeader>
      <CardBody>
        <div className="w-full h-60 overflow-hidden rounded-t-lg">
          <Image
            src={
              `${process.env.HOSTNAME}/${image[0]}` ||
              "/path/to/default-image.png"
            }
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">{location}</p>
          <p className="text-lg font-semibold text-blue-500">₹{rent} / month</p>
          <p className="text-sm text-gray-700">Deposit: ₹{deposit}</p>
          <p className="text-sm text-gray-700">Area: {areasqft} sqft</p>
          <p className="text-sm text-gray-700">
            Type:{" "}
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
          </p>
          <p className="text-sm text-gray-700">
            Tenants:{" "}
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
          </p>
          <p className="text-sm text-gray-700">
            Furnishing:{" "}
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
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {amenities.map((amenity, index) => (
            <Chip key={index} className="bg-gray-200">
              {amenity}
            </Chip>
          ))}
        </div>
      </CardBody>
      <CardFooter className="p-4">
        <Button color="primary" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
