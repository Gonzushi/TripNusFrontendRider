import type {
  MapboxContext,
  MapboxCoordinates,
  MapboxGeocodingResponse,
  MapboxRetrieve,
  MapboxRetrieveResponse,
  MapboxSuggestion,
  MapboxSuggestionResponse,
} from "./mapbox";

export type {
  MapboxContext,
  MapboxCoordinates,
  MapboxGeocodingResponse,
  MapboxRetrieve,
  MapboxRetrieveResponse,
  MapboxSuggestion,
  MapboxSuggestionResponse,
};

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationDetail {
  title: string;
  address: string;
  place_id?: string;
  coordinates?: LocationCoordinates;
}

export interface LocationSuggestion {
  title: string;
  address: string;
  type: "api" | "recent" | "popular";
  place_id?: string;
}

export interface GooglePlacesAutocompleteResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GooglePlaceDetails {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  place_id: string;
}
