export type LocationCoordinates ={
  latitude: number;
  longitude: number;
}

export type LocationDetail = {
  title: string;
  address: string;
  place_id?: string;
  coordinates?: LocationCoordinates;
}

export type LocationSuggestion = {
  title: string;
  address: string;
  type: "api" | "recent" | "popular";
  place_id?: string;
}

export type GooglePlacesAutocompleteResult = {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export type GooglePlaceDetails = {
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
