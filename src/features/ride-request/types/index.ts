export type SearchBoxInputMode = 'highlighted' | 'editing' | false;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationDetail = {
  title: string;
  address: string;
  place_id?: string;
  coordinates?: Coordinates;
};

export type SearchLocationsResult = {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
};
