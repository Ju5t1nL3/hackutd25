// src/pages/Search.tsx
"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { services } from "../../services"; // Import services

interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  status: "available" | "pending" | "sold";
  imageUrl?: string;
  listingDate: string;
}

function Search() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Property[]>([]); // State for search results
  const [searchParams, setSearchParams] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    propertyType: "any",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      // Prepare query for the service
      const query = {
        city: searchParams.location,
        minPrice: searchParams.minPrice
          ? parseFloat(searchParams.minPrice)
          : undefined,
        maxPrice: searchParams.maxPrice
          ? parseFloat(searchParams.maxPrice)
          : undefined,
        keywords: `${searchParams.bedrooms} bed ${searchParams.propertyType}`,
      };

      // Call the service layer (which calls the external Searching Agent)
      const results = (await services.properties.searchProperties(
        query,
      )) as unknown as Property[];

      setSearchResults(results);
    } catch (err) {
      setError(
        "Failed to execute property search. Check the Searching Agent backend.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 text-black">
      <Header title="Investment Property Search" />

      {/* Search Form (from snippet logic) */}
      <form
        onSubmit={handleSearch}
        className="bg-white shadow-lg rounded-lg p-6 space-y-4"
      >
        {/* ... (All form inputs from the snippet) ... */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isSearching ? "Searching..." : "Run Agent Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {/* Results Section */}
      <h2 className="text-2xl font-semibold text-gray-800">
        Search Results ({searchResults.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {searchResults.map((property) => (
          <div
            key={property.id}
            className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
          >
            {/* ... (Property Card/Detail logic from snippet) ... */}
            <div className="p-4">
              <p className="text-xl font-bold text-gray-900">
                ${property.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {property.address}, {property.city}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
