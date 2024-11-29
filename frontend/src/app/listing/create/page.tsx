"use client";
import { useEffect, useState } from "react";
import { State, City, IState } from "country-state-city";
import {
  Select,
  SelectItem,
  Input,
  Card,
  Textarea,
  Button,
} from "@nextui-org/react";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@/app/contexts/AuthContext";

const PostListing = () => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    accommodation_type: "0",
    listing_title: "",
    listing_description: "",
    listing_area: "",
    listing_state: "",
    listing_city: "",
    listing_address: "",
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
    listing_prefered_tenants: "",
  });

  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>();
  const [amenities, setAmenities] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [imageJson, setImageJson] = useState<string>("");
  const [flat, setFlat] = useState(true);
  const [pg, setPg] = useState(false);
  const [hostel, setHostel] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    accommodationType: "",
    listing_title: "",
    listing_description: "",
    listing_state: "",
    listing_city: "",
    listing_address: "",
    listing_bedrooms: "",
    listing_bathroom: "",
    listing_furnishing: "",
    listing_type: "",
    listing_areasqft: "",
    listing_rent: "",
    listing_deposit: "",
    listing_floor_no: "",
    listing_total_floors: "",
    listing_amenities: "",
    listing_prefered_tenants: "",
  });

  const handleFileUpload = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const home = [
    { key: 0, value: "Flats" },
    { key: 1, value: "PGs" },
    { key: 2, value: "Hostels" },
  ];

  const bathrooms = [
    { key: 1, value: "1" },

    { key: 2, value: "2" },

    { key: 3, value: "3" },

    { key: 4, value: "4+" },
  ];

  const furnishings = [
    { key: 1, value: "Semi-furnished" },
    { key: 2, value: "No furnishing" },
    { key: 3, value: "Full-furnished" },
  ];

  const bedrooms = [
    { key: 1, value: "1BHK" },

    { key: 2, value: "2BHK" },

    { key: 3, value: "3BHK" },

    { key: 4, value: "4BHK" },
  ];

  const types = [
    { key: 0, value: "Apartment" },
    { key: 1, value: "Villa" },
    { key: 2, value: "Bungalow" },
  ];

  const prefered_tenants = [
    { key: 1, value: "Student" },
    { key: 2, value: "Working Professional" },
  ];

  const createListing = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("uploaded_images", file);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/upload/image`,
        {
          method: "POST",
          // send auth token
          headers: {
            Authorization: `${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error uploading files: ${response.status}`);
      }

      const data = await response.json();
      const imageJson = JSON.stringify(data.response);
      await submitForm(imageJson); // Convert links array to JSON string
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  async function submitForm(imageJson: string) {
    try {
      const uploaded_on = new Date().toISOString();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/listing/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            accommodation_type: formData.accommodation_type,
            listing_title: formData.listing_title,
            listing_desc: formData.listing_description,
            image_json: imageJson, // use the uploaded image JSON here
            uploaded_on,
            area: formData.listing_area,
            city: formData.listing_city,
            state: formData.listing_state,
            preference_list: formData.listing_preferences,
            amenities_list: formData.listing_amenities,
            listing_type: formData.listing_type,
            prefered_tenants: formData.listing_prefered_tenants,
            is_available: true,
            bedrooms: formData.listing_bedrooms,
            bathrooms: formData.listing_bathroom,
            rent: formData.listing_rent,
            deposit: formData.listing_deposit,
            furnishing: formData.listing_furnishing,
            floor_no: formData.listing_floor_no,
            total_floors: formData.listing_total_floors,
            areasqft: formData.listing_areasqft,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Listing created successfully:", data);
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;

    if (e.target.name === "listing_state") {
      setSelectedState(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const validateInputs = (formData: { [key: string]: any }) => {
    let errors: { [key: string]: string } = {};

    if (!formData.accommodationType) {
      errors.accommodationType = "Accommodation type is required";
    }

    if (!formData.listing_title || formData.listing_title.trim() === "") {
      errors.listing_title = "Title is required";
    }

    if (
      !formData.listing_description ||
      formData.listing_description.trim() === ""
    ) {
      errors.listing_description = "Description is required";
    }

    if (!formData.listing_state || formData.listing_state.trim() === "") {
      errors.listing_state = "State is required";
    }

    if (!formData.listing_city || formData.listing_city.trim() === "") {
      errors.listing_city = "City is required";
    }

    if (!formData.listing_address || formData.listing_address.trim() === "") {
      errors.listing_address = "Address is required";
    }

    if (
      !formData.listing_bedrooms ||
      isNaN(Number(formData.listing_bedrooms)) ||
      Number(formData.listing_bedrooms) <= 0
    ) {
      errors.listing_bedrooms = "Bedrooms must be a positive number";
    }

    if (
      !formData.listing_bathrooms ||
      isNaN(Number(formData.listing_bathrooms)) ||
      Number(formData.listing_bathrooms) <= 0
    ) {
      errors.listing_bathrooms = "Bathrooms must be a positive number";
    }

    if (
      !formData.listing_furnishing ||
      formData.listing_furnishing.trim() === ""
    ) {
      errors.listing_furnishing = "Furnishing status is required";
    }

    if (!formData.listing_listing_type || formData.listing_type.trim() === "") {
      errors.listing_type = "Listing type is required";
    }

    if (
      !formData.listing_areasqft ||
      isNaN(Number(formData.listing_areasqft)) ||
      Number(formData.listing_areasqft) <= 0
    ) {
      errors.listing_areasqft = "Area (sqft) must be a positive number";
    }

    if (
      !formData.listing_rent ||
      isNaN(Number(formData.listing_rent)) ||
      Number(formData.listing_rent) <= 0
    ) {
      errors.listing_rent = "Rent must be a positive number";
    }

    if (
      !formData.listing_deposit ||
      isNaN(Number(formData.listing_deposit)) ||
      Number(formData.listing_deposit) < 0
    ) {
      errors.listing_deposit = "Deposit must be a non-negative number";
    }

    if (
      formData.listing_floor_no &&
      formData.listing_total_floors &&
      Number(formData.listing_floor_no) > Number(formData.listing_total_floors)
    ) {
      errors.listing_floor_no = "Floor number cannot be more than total floors";
    }

    if (
      !formData.listing_total_floors ||
      isNaN(Number(formData.listing_total_floors)) ||
      Number(formData.listing_total_floors) <= 0
    ) {
      errors.listing_total_floors = "Total floors must be a positive number";
    }

    if (
      !formData.listing_amenities ||
      formData.listing_amenities.length === 0
    ) {
      errors.listing_amenities = "At least one amenity must be selected";
    }

    if (
      !formData.listing_prefered_tenants ||
      formData.listing_prefered_tenants.trim() === ""
    ) {
      errors.listing_prefered_tenants = "Preferred tenants are required";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if there are no errors
  };

  // const validateFloorNo = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   let newErrors = { ...errors };

  //   if (
  //     name === "listing_floor_no" &&
  //     parseInt(value) > parseInt(formData.total_floors)
  //   ) {
  //     newErrors[name] = "Floor no is higher than the total floors!";
  //   } else {
  //     delete newErrors[name];
  //   }
  //   setErrors(newErrors);
  //   handleChange(e);
  // };

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

  return (
    <>
      <div className="flex flex-col justify-center">
        <div className="flex justify-center items-center h-20 bg-sky-500 text-white text-xl shadow-md">
          <h2>Create a new Post</h2>
        </div>

        <div className="flex justify-center">
          <Card className="flex justify-center w-full md:w-1/2 mt-4 p-2">
            <div className="flex justify-center">
              <div className="w-full flex flex-col items-center m-4 p-4 gap-4">
                <Select
                  label="Accommodation type"
                  defaultSelectedKeys="0"
                  id="accommodation_type"
                  name="accommodation_type"
                  errorMessage={errors["accommodation_type"]}
                  onChange={handleChange}
                >
                  {home.map((h) => (
                    <SelectItem key={h.key} value={h.value}>
                      {h.value}
                    </SelectItem>
                  ))}
                </Select>
                <div className="w-full max-w-4xl mx-auto min-h-80 border border-dashed hover:bg-sky-100 dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <FileUpload onChange={handleFileUpload} />
                </div>

                <Input
                  label="Title"
                  id="listing_title"
                  value={formData.listing_title}
                  name="listing_title"
                  onChange={handleChange}
                  isInvalid={!!errors.listing_title}
                  errorMessage={errors.listing_title}
                />

                <Textarea
                  label="Description"
                  id="listing_description"
                  name="listing_description"
                  onChange={handleChange}
                />

                <Input
                  label="Area"
                  id="listing_area"
                  name="listing_area"
                  onChange={handleChange}
                />

                <Input
                  label="Address Line 1"
                  id="listing_address"
                  name="listing_address"
                  onChange={handleChange}
                />

                {/* Bedrooms and Furnishing */}

                <div className="flex w-full gap-2">
                  <Select
                    label="Bedrooms"
                    id="listing_bedrooms"
                    name="listing_bedrooms"
                    onChange={handleChange}
                  >
                    {bedrooms.map((bedroom) => (
                      <SelectItem key={bedroom.key} value={bedroom.value}>
                        {bedroom.value}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Bathrooms"
                    id="listing_bathroom"
                    name="listing_bathroom"
                    onChange={handleChange}
                  >
                    {bathrooms.map((bathroom) => (
                      <SelectItem key={bathroom.key} value={bathroom.value}>
                        {bathroom.value}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Furnishing"
                    id="listing_furnishing"
                    name="listing_furnishing"
                    onChange={handleChange}
                  >
                    {furnishings.map((furnishing) => (
                      <SelectItem key={furnishing.key} value={furnishing.value}>
                        {furnishing.value}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex w-full gap-2">
                  <Input
                    label="Rent"
                    id="listing_rent"
                    name="listing_rent"
                    onChange={handleChange}
                  />

                  <Input
                    label="Deposit"
                    id="listing_deposit"
                    name="listing_deposit"
                    onChange={handleChange}
                  />
                </div>

                <Select
                  label="Amenities"
                  id="listing_amenities"
                  name="listing_amenities"
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      listing_amenities: e.target.value.split(","),
                    }));
                  }}
                  selectionMode="multiple"
                >
                  {amenities.map(
                    (amenity: { amenity_id: string; amenity_name: string }) => (
                      <SelectItem
                        key={amenity.amenity_id}
                        value={amenity.amenity_name}
                      >
                        {amenity.amenity_name}
                      </SelectItem>
                    )
                  )}
                </Select>

                <Select
                  label="Preferences"
                  id="listing_preferences"
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      listing_preferences: e.target.value.split(","),
                    }));
                  }}
                  name="listing_preferences"
                  selectionMode="multiple"
                >
                  {preferences.map(
                    (preferences: {
                      preference_id: string;
                      preference: string;
                    }) => (
                      <SelectItem
                        key={preferences.preference_id}
                        value={preferences.preference}
                      >
                        {preferences.preference}
                      </SelectItem>
                    )
                  )}
                </Select>

                <div className="flex w-full gap-2">
                  <Select
                    disabled={formData.accommodation_type === "0"}
                    label="Type"
                    id="listing_type"
                    name="listing_type"
                    onChange={handleChange}
                  >
                    {types.map((type) => (
                      <SelectItem key={type.key} value={type.value}>
                        {type.value}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Preferred Tenant"
                    id="listing_prefered_tenants"
                    name="listing_prefered_tenants"
                    onChange={handleChange}
                  >
                    {prefered_tenants.map((tenant) => (
                      <SelectItem key={tenant.key} value={tenant.value}>
                        {tenant.value}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex w-full gap-2">
                  <Input
                    label="Floor No."
                    id="listing_floor_no"
                    type="number"
                    name="listing_floor_no"
                    {...(formData.accommodation_type === "2" ||
                    formData.accommodation_type === "3"
                      ? { isDisabled: true }
                      : {})}
                    onChange={handleChange}
                    errorMessage={errors["listing_floor_no"]}
                  />

                  <Input
                    label="Total Floors"
                    type="number"
                    id="listing_total_floors"
                    name="listing_total_floors"
                    {...(formData.accommodation_type === "2" ||
                    formData.accommodation_type === "3"
                      ? { isDisabled: true }
                      : {})}
                    onChange={handleChange}
                    errorMessage={errors["listing_total_floors"]}
                  />
                </div>

                <div className="flex w-full gap-2">
                  <Input
                    label="Area (sqft)"
                    id="listing_areasqft"
                    name="listing_areasqft"
                    onChange={handleChange}
                  />

                  {/* <Input
 
label="Bathrooms"
 
id="listing_bathrooms"
 
name="bathrooms"
 
onChange={handleChange}
 
/> */}
                </div>
                <div className="flex w-full gap-2">
                  <div className="flex w-full gap-2">
                    {/* <Select
                      id="listing_state"
                      name="listing_state"
                      label="Select state"
                      value={formData.listing_state}
                      onChange={handleChange}
                    >
                      {states.map(
                        (state: { name: string; isoCode: string }) => (
                          <SelectItem key={state.name} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        )
                      )}
                    </Select> */}
                    <select
                      id="listing_state"
                      name="listing_state"
                      value={formData.listing_state}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled className="opacity-55">
                        Select State
                      </option>

                      {states.map(
                        (state: { name: string; isoCode: string }) => (
                          <option key={state.name} value={state.isoCode}>
                            {state.name}
                          </option>
                        )
                      )}
                    </select>
                    {/* <Select
                      id="listing_city"
                      name="listing_city"
                      label="Select city"
                      value={formData.listing_city}
                      onChange={handleChange}
                    >
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </Select> */}
                    <select
                      id="listing_city"
                      name="listing_city"
                      value={formData.listing_city}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    >
                      <option value="" disabled className="opacity-55">
                        Select City
                      </option>

                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button className="p-[3px] relative" onClick={createListing}>
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl" />
                  <div className="px-9 py-2 rounded-lg bg-white text-black relative group transition duration-200 hover:bg-transparent hover:text-white">
                    Submit
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PostListing;
