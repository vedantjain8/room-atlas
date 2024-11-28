"use client";
import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  Input,
  Button,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Card,
  Select,
  SelectItem,
} from "@nextui-org/react";

export default function UpdateListing({
  params,
}: {
  params: { listingID: string };
}) {
  const { token } = useAuth();
  const [amenities, setAmenities] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [formData, setFormData] = useState({
    accommodation_type: "0",
    listing_title: "",
    listing_description: "",
    listing_area: "",
    listing_state: "",
    listing_city: "",
    listing_address: "",
    listing_latitude: "",
    listing_longitude: "",
    listing_bedrooms: "",
    listing_bathroom: "",
    listing_furnishing: "",
    listing_type: "",
    listing_areasqft: "",
    listing_rent: "",
    listing_deposit: "",
    listing_floor_no: "",
    listing_total_floors: "",
    listing_preferences: [] as string[],
    listing_amenities: [] as string[],
    listing_amenitie_id: [] as number[],
    listing_preference_id: [] as number[],
    listing_prefered_tenants: "",
  });

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
    fetchAmenities();
    fetchPreferences();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/${params.listingID}`
      );
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.statusText}`);
      const data = await res.json();
      setFormData({
        accommodation_type: data.message.listing_type.toString(),
        listing_title: data.message.listing_title,
        listing_description: data.message.listing_desc,
        listing_area: data.message.area,
        listing_state: data.message.state,
        listing_city: data.message.city,
        listing_address: "", // Assuming address is not provided in the data
        listing_latitude: "", // Assuming latitude is not provided in the data
        listing_longitude: "", // Assuming longitude is not provided in the data
        listing_bedrooms: data.message.bedrooms.toString(),
        listing_bathroom: data.message.bathrooms.toString(),
        listing_furnishing: data.message.furnishing.toString(),
        listing_type: data.message.listing_type.toString(),
        listing_areasqft: data.message.areasqft,
        listing_rent: data.message.rent,
        listing_deposit: data.message.deposit,
        listing_floor_no: data.message.floor.toString(),
        listing_total_floors: data.message.total_floors.toString(),
        listing_preferences: [], // Assuming preferences are not provided in the data
        listing_amenities: data.message.amenities,
        listing_amenitie_id: data.message.amenity_id,
        listing_preference_id: data.message.preference_id,
        listing_prefered_tenants: data.message.prefered_tenants.toString(),
      });
    } catch (error) {
      console.error("Error fetching listing data:", error);
    }
  }

  async function UpdateListing() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/${params.listingID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(formData),
      }
    );
    const data = await response.json();
    console.log(data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center">
        <div className="flex justify-center items-center h-20 text-xl shadow-md">
          <h2>Update Listing</h2>
        </div>

        <div className="flex justify-center">
          <Card className="flex justify-center w-full md:w-1/2 mt-4 p-2">
            <div className="flex justify-center">
              <div className="w-full flex flex-col items-center m-4 p-4 gap-4">
                <Input
                  label="Title"
                  value={formData.listing_title}
                  onChange={(e) =>
                    setFormData({ ...formData, listing_title: e.target.value })
                  }
                />

                <Textarea
                  label="Description"
                  value={formData.listing_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      listing_description: e.target.value,
                    })
                  }
                />

                <Input
                  label="Area"
                  value={formData.listing_area}
                  onChange={(e) =>
                    setFormData({ ...formData, listing_area: e.target.value })
                  }
                />

                <div className="flex w-full gap-2">
                  <Input
                    label="State"
                    value={formData.listing_state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listing_state: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="City"
                    value={formData.listing_city}
                    onChange={(e) =>
                      setFormData({ ...formData, listing_city: e.target.value })
                    }
                  />
                </div>

                <div className="flex w-full gap-2">
                  <Input
                    label="Bedrooms"
                    value={formData.listing_bedrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listing_bedrooms: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Bathrooms"
                    value={formData.listing_bathroom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listing_bathroom: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Furnishing"
                    value={formData.listing_furnishing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listing_furnishing: e.target.value,
                      })
                    }
                  />
                </div>

                <Input
                  label="Type"
                  value={formData.listing_type}
                  onChange={(e) =>
                    setFormData({ ...formData, listing_type: e.target.value })
                  }
                />

                <Input
                  label="Area (sqft)"
                  value={formData.listing_areasqft}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      listing_areasqft: e.target.value,
                    })
                  }
                />

                <div className="flex w-full gap-2">
                  <Input
                    label="Rent"
                    value={formData.listing_rent}
                    onChange={(e) =>
                      setFormData({ ...formData, listing_rent: e.target.value })
                    }
                  />

                  <Input
                    label="Deposit"
                    value={formData.listing_deposit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listing_deposit: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex w-full gap-2">
                  <Input
                    label="Floor No"
                    value={formData.listing_floor_no}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listing_floor_no: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Total Floors"
                    value={formData.listing_total_floors}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listing_total_floors: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex w-full gap-2">
                  <div className="flex flex-col w-1/2 gap-2">
                    <CheckboxGroup
                      className="flex flex-col"
                      label="Amenities"
                      value={formData.listing_amenitie_id.map(String)}
                      onChange={(selectedValues) => {
                        setFormData((prev) => ({
                          ...prev,
                          listing_amenitie_id: selectedValues.map(Number),
                        }));
                      }}
                    >
                      {amenities.map(
                        (amenity: {
                          amenity_id: string;
                          amenity_name: string;
                        }) => (
                          <Checkbox
                            key={amenity.amenity_id}
                            value={amenity.amenity_id.toString()}
                          >
                            {amenity.amenity_name}
                          </Checkbox>
                        )
                      )}
                    </CheckboxGroup>
                  </div>

                  <div className="flex flex-col w-1/2 gap-2">
                    <CheckboxGroup
                      className="flex flex-col"
                      label="Preferences"
                      value={formData.listing_preference_id.map(String)}
                      onChange={(selectedValues) => {
                        setFormData((prev) => ({
                          ...prev,
                          listing_preference_id: selectedValues.map(Number),
                        }));
                      }}
                    >
                      {preferences.map(
                        (preference: {
                          preference_id: string;
                          preference: string;
                        }) => (
                          <Checkbox
                            key={preference.preference_id}
                            value={preference.preference.toString()}
                          >
                            {preference.preference}
                          </Checkbox>
                        )
                      )}
                    </CheckboxGroup>
                  </div>
                </div>
                <Input
                  label="Preferred Tenants"
                  value={formData.listing_prefered_tenants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      listing_prefered_tenants: e.target.value,
                    })
                  }
                />

                <Button className="p-[3px] relative" onClick={UpdateListing}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl" />
                  <div className="px-9 py-2 rounded-lg bg-white text-black relative group transition duration-200 hover:bg-transparent hover:text-white">
                    Update
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
