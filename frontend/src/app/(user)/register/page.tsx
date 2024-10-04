"use client";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { State, City, IState } from "country-state-city";
import ExpandableOTPInput from "@/components/otpModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function RegisterForm() {
  const [page, setPage] = useState(1); // set this to 2 to see page 2
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    emailVerified: isVerified,
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
    phone: "",
    gender: "",
    dob: "",
    occupation: "",
    state: "",
    city: "",
  });

  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedstate] = useState(null);

  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // const cityData = City.getCitiesOfState("IN", City.isoCode).map((city) => ({
  //   value: city.name,
  //   displayValue: city.name,
  // }));
  
  // TODO: show loading when  needed
  // TODO: show error message
   

  const [active, setActive] = useState<boolean>(false);

  const sendOtp = async (email: String) => {
    try {
      const response = await fetch(`${process.env.HOSTNAME}/verify/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setActive(true);
    } catch (error: any) {
      console.error("Request failed:", error.message);
    }
  };

  interface Errors {
    username?: string;
    email?: string;
    emailVerified?: string;
    password?: string;
    confirmPassword?: string;
    securityQuestion?: string;
    securityAnswer?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    occupation?: string;
    city?: string;
    state?: string;
  }

  const validatePageOne = (): Errors => {
    let errors: Errors = {};

    if (!formData.username) errors.username = "Username is required";
    if (!formData.emailVerified) errors.emailVerified = "Email is not verified";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Valid email is required";
    if (!formData.password) errors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!formData.securityQuestion)
      errors.securityQuestion = "Security question is required";
    if (!formData.securityAnswer)
      errors.securityAnswer = "Security answer is required";
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone))
      errors.phone = "Valid phone number is required";
    console.log(errors);
    return errors;
  };

  const handleNext = (e: any) => {
    e.preventDefault();
    const pageOneErrors = validatePageOne();

    if (Object.keys(pageOneErrors).length === 0) {
      setPage(2);
    } else {
      setErrors(pageOneErrors);
    }
  };

  const validatePageTwo = (): Errors => {
    let errors: Errors = {};

    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.occupation) errors.occupation = "Occupation is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    return errors;
  };

  const handleSubmit = async () => {
    const pageTwoErrors = validatePageTwo();
    if (Object.keys(pageTwoErrors).length === 0) {
      try {
        const response = await fetch(`${process.env.HOSTNAME}/user/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
          alert("User registered successfully");
        } else {
          alert("Error registering user");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      setErrors(pageTwoErrors);
    }
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (e.target.name === "state") {
      setSelectedstate(value);
    }
  };

  useEffect(() => {
    const indianstates = State.getStatesOfCountry("IN");
    setStates(indianstates);
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

  return (
    <div className="max-w-md w-full mt-24 mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white">
      {page === 1 ? (
        <form name="PageOneForm" className="my-8" onSubmit={handleNext}>
          <h1 className="flex justify-center items-center text-xl font-medium">
            Register
          </h1>
          <LabelInputContainer className="mb-4">
            <Input
              id="firstname"
              placeholder="Userame"
              type="text"
              name="username"
              onChange={handleChange}
            />
          </LabelInputContainer>

          <div className="flex justify-between">
            <LabelInputContainer className="mb-4 w-9/12">
              <Input
                id="email"
                placeholder="Email"
                type="email"
                name="email"
                onChange={handleChange}
              />
            </LabelInputContainer>
            {active && (
              <ExpandableOTPInput active={active} setActive={setActive} />
            )}

            <button
              className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              onClick={(e) => {
                e.preventDefault();
                if (!(formData.email && /\S+@\S+\.\S+/.test(formData.email))) {
                  setErrors({ email: "Valid email is required" });
                  return;
                }
                sendOtp(formData.email);
              }}
            >
              {/* <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />   */}
              {/* TODO: ==ye acha nhi lgg raha h== */}
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Verify
              </span>
            </button>
          </div>
          <LabelInputContainer className="mb-4">
            <Input
              id="password"
              placeholder="Password"
              type="password"
              name="password"
              onChange={handleChange}
              // add a eye btn to show/hide password
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Input
              id="confirmpassword"
              placeholder="Confirm password"
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              // add a eye btn to show/hide password
            />
          </LabelInputContainer>

          <select
            id="securityQuestion"
            name="securityQuestion"
            value={formData.securityQuestion}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="" disabled className="opacity-55">
              Select a security question
            </option>
            <option value="petName">What is your pet's name?</option>
            <option value="birthCity">In which city were you born?</option>
            <option value="firstSchool">
              What is the name of your first school?
            </option>
            <option value="favoriteFood">What is your favorite food?</option>
          </select>

          <LabelInputContainer className="mb-4">
            <Input
              id="securityAnswer"
              placeholder="Security Answer"
              type="text"
              name="securityAnswer"
              onChange={handleChange}
            />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-black w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
            // onClick={handleNext}
          >
            Next
            <FontAwesomeIcon icon={faArrowRight} />
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        </form>
      ) : (
        <form name="PageTwoForm" className="my-8" onSubmit={handleSubmit}>
          <h1 className="flex justify-center items-center text-xl font-medium">
            Register
          </h1>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="" disabled className="">
              Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <LabelInputContainer className="mb-4">
            <Input
              id="dob"
              placeholder="Date of Birth"
              type="text"
              name="dob"
              onChange={handleChange}
            />
          </LabelInputContainer>
          <select
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="" disabled className="opacity-55">
              I'm a
            </option>
            <option value="student">Student</option>
            <option value="working_professional">Working Professional</option>
          </select>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="" disabled className="opacity-55">
              Select State
            </option>

            {states.map((state: { name: string; isoCode: string }) => (
              <option key={state.name} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>

          <select
            id="city"
            name="city"
            value={formData.city}
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

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-black w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            Submit <FontAwesomeIcon icon={faPaperPlane} />
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        </form>
      )}
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
