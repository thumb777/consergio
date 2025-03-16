import { useState, useEffect, useRouter } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "aos/dist/aos.css";
import AOS from "aos";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Country, State, City } from "country-state-city";
import { CustomSelect } from "@/components/custom-select";

function Location() {
  // const router = useRouter()
  const navigate = useNavigate();
  const location = useLocation();
  const { email, firstName, lastName } = location.state || {};
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Location state
  const [isUS, setIsUS] = useState(true);

  // Countries data
  const [countries, setCountries] = useState([]);

  // US fields
  const [usStates, setUSStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [usCities, setUSCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  // Non-US fields
  const [selectedCountry, setSelectedCountry] = useState("");
  const [nonUSStates, setNonUSStates] = useState([]);
  const [selectedNonUSState, setSelectedNonUSState] = useState("");
  const [nonUSCities, setNonUSCities] = useState([]);
  const [selectedNonUSCity, setSelectedNonUSCity] = useState("");

  // Helper function to convert country code to flag emoji
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return "";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  useEffect(() => {
    AOS.init(); // Initialize AOS
    AOS.refresh(); // Refresh AOS animations in case elements are already rendered
  }, []);

  // Load initial data
  useEffect(() => {
    try {
      // Check if we have user data from previous step

      if (!email) {
        navigate("/");
        return;
      }

      // Load countries
      const allCountries = Country.getAllCountries().map((country) => ({
        value: country.isoCode,
        label: country.name,
        icon: <span className="mr-2">{getFlagEmoji(country.isoCode)}</span>,
      }));

      // Sort countries alphabetically
      allCountries.sort((a, b) => a.label.localeCompare(b.label));

      // Move US to the top if present
      const usIndex = allCountries.findIndex((c) => c.value === "US");
      if (usIndex > -1) {
        const us = allCountries.splice(usIndex, 1)[0];
        allCountries.unshift(us);
      }
      setCountries(allCountries);

      // Load US states
      const usStatesData = State.getStatesOfCountry("US").map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));
      console.log("-----------", allCountries);
      setUSStates(usStatesData);

      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading location data:", error);
    }
  }, [navigate]);

  // Update cities when US state changes
  useEffect(() => {
    if (selectedState) {
      try {
        const cities = City.getCitiesOfState("US", selectedState).map(
          (city) => ({
            value: city.name,
            label: city.name,
          })
        );
        setUSCities(cities);
      } catch (error) {
        console.error("Error loading US cities:", error);
        setUSCities([]);
      }
    } else {
      setUSCities([]);
    }
    setSelectedCity("");
  }, [selectedState]);

  // Update states when non-US country changes
  useEffect(() => {
    if (selectedCountry && selectedCountry !== "US") {
      try {
        const states = State.getStatesOfCountry(selectedCountry).map(
          (state) => ({
            value: state.isoCode,
            label: state.name,
          })
        );
        setNonUSStates(states);
      } catch (error) {
        console.error("Error loading states:", error);
        setNonUSStates([]);
      }
    } else {
      setNonUSStates([]);
    }
    setSelectedNonUSState("");
    setNonUSCities([]);
    setSelectedNonUSCity("");
  }, [selectedCountry]);

  // Update cities when non-US state changes
  useEffect(() => {
    if (selectedCountry && selectedNonUSState) {
      try {
        const cities = City.getCitiesOfState(
          selectedCountry,
          selectedNonUSState
        ).map((city) => ({
          value: city.name,
          label: city.name,
        }));
        setNonUSCities(cities);
      } catch (error) {
        console.error("Error loading cities:", error);
        setNonUSCities([]);
      }
    } else {
      setNonUSCities([]);
    }
    setSelectedNonUSCity("");
  }, [selectedCountry, selectedNonUSState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Store location data
    let locationData;

    if (isUS) {
      const state = usStates.find((s) => s.value === selectedState);

      locationData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        country: "United States",
        state: state?.label || "",
        city: selectedCity,
      };
    } else {
      const country = countries.find((c) => c.value === selectedCountry);
      const state = nonUSStates.find((s) => s.value === selectedNonUSState);

      locationData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        country: country?.label || "",
        state: state?.label || "",
        city: selectedNonUSCity,
      };
    }

    try {
      // Send data to the backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/waitlist/register`,
        locationData
      );

      console.log("Response:", response.status); // Debugging: Log the full response from the server

      // Check if the response status is 200
      if (response.status === 200) {
        setIsSubmitted(true);

        toast.success(
          response.data.message || "Email registered successfully!",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );

        // Navigate to the success page
        setTimeout(() => {
          navigate("/success");
        }, 3000);
      } else {
        // Handle unexpected status codes
        toast.warning("Unexpected response from the server.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error:", error); // Debugging: Log the error

      // Handle duplicate email or other errors
      if (error.response && error.response.status === 400) {
        toast.warning(
          error.response.data.message || "Email is already registered",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      } else {
        toast.error("Registration failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }

    console.log("Location Data:", locationData); // Debugging: Log the location data sent to the backend
  };

  // Check if form is valid
  const isFormValid = isUS
    ? selectedState && selectedCity
    : selectedCountry &&
      (nonUSStates.length === 0 || selectedNonUSState) &&
      (nonUSCities.length === 0 || selectedNonUSCity);

  return (
    <div className="min-h-screen w-[100vw] flex flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8] sm:pt-28 pt-20">
      <ToastContainer />
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div
          data-aos="fade-down"
          data-aos-duration="1000"
          className="text-center text-2xl text-black font-serif leading-7 max-w-[500px] pb-12"
        >
          Where are you located? <br /> Help us provide you with the best
          experience
        </div>

        <form data-aos="fade-up"
          data-aos-duration="1000" onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-6">
            <Label className="text-center text-lg font-medium text-black font-serif leading-6">
              Are you located in the United States?
            </Label>
            <RadioGroup
              defaultValue="yes"
              onValueChange={(value) => setIsUS(value === "yes")}
              className="flex justify-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="us-yes" />
                <Label htmlFor="us-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="us-no" />
                <Label htmlFor="us-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {isUS ? (
            <div className="space-y-4">
              <CustomSelect
                label="State"
                options={usStates}
                value={selectedState}
                onChange={setSelectedState}
                placeholder="Select a state"
                required
              />

              {selectedState &&
                (usCities.length > 0 ? (
                  <CustomSelect
                    label="City"
                    options={usCities}
                    value={selectedCity}
                    onChange={setSelectedCity}
                    placeholder="Select a city"
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      required
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              <CustomSelect
                label="Country"
                options={countries}
                value={selectedCountry}
                onChange={setSelectedCountry}
                placeholder="Select a country"
                required
              />

              {selectedCountry && nonUSStates.length > 0 && (
                <CustomSelect
                  label="State/Province/Region"
                  options={nonUSStates}
                  value={selectedNonUSState}
                  onChange={setSelectedNonUSState}
                  placeholder="Select a state/province"
                  required
                />
              )}

              {selectedCountry &&
                (nonUSStates.length === 0 || selectedNonUSState) &&
                (nonUSCities.length > 0 ? (
                  <CustomSelect
                    label="City"
                    options={nonUSCities}
                    value={selectedNonUSCity}
                    onChange={setSelectedNonUSCity}
                    placeholder="Select a city"
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={selectedNonUSCity}
                      onChange={(e) => setSelectedNonUSCity(e.target.value)}
                      required
                    />
                  </div>
                ))}
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-full bg-black text-white hover:bg-black/90"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Location;
