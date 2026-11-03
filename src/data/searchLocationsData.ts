export interface LocationItem {
  id: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  display: string;
  airportCode?: string;
  hubType?: string;
}

export const COMPREHENSIVE_LOCATIONS: LocationItem[] = [
  // Exact Indian locations featured in the reference interface:
  {
    id: 'loc_in_alangulam',
    city: 'Alangulam',
    state: 'Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    display: 'Alangulam, Tamil Nadu, India',
    airportCode: 'TCR',
    hubType: 'Regional Air Corridor',
  },
  {
    id: 'loc_in_angul',
    city: 'Angul',
    state: 'Odisha',
    country: 'India',
    countryCode: 'IN',
    display: 'Angul, Odisha, India',
    airportCode: 'BBI',
    hubType: 'Industrial Airstrip & Charter Field',
  },
  {
    id: 'loc_in_angul_dist',
    city: 'Angul District',
    state: 'Odisha',
    country: 'India',
    countryCode: 'IN',
    display: 'Angul District, Odisha, India',
    airportCode: 'BBI',
    hubType: 'Mining & Logistics Flight Corridor',
  },
  {
    id: 'loc_in_bagula',
    city: 'Bagula',
    state: 'West Bengal',
    country: 'India',
    countryCode: 'IN',
    display: 'Bagula, West Bengal, India',
    airportCode: 'CCU',
    hubType: 'Eastern Air Corridor',
  },
  {
    id: 'loc_in_dindigul',
    city: 'Dindigul',
    state: 'Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    display: 'Dindigul, Tamil Nadu, India',
    airportCode: 'IXM',
    hubType: 'Southern Agro & Charter Corridor',
  },
  {
    id: 'loc_in_gulabpura',
    city: 'Gulabpura',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    display: 'Gulabpura, Rajasthan, India',
    airportCode: 'UDR',
    hubType: 'North-Western Textile & Charter Zone',
  },
  {
    id: 'loc_in_gulaothi',
    city: 'Gulaothi',
    state: 'Uttar Pradesh',
    country: 'India',
    countryCode: 'IN',
    display: 'Gulaothi, Uttar Pradesh, India',
    airportCode: 'HDO',
    hubType: 'NCR Satellite Air Corridor',
  },
  {
    id: 'loc_in_guledagudda',
    city: 'Guledagudda',
    state: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    display: 'Guledagudda, Karnataka, India',
    airportCode: 'HBX',
    hubType: 'Deccan Regional Flight Strip',
  },
  {
    id: 'loc_in_harangul',
    city: 'Harangul',
    state: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    display: 'Harangul, Maharashtra, India',
    airportCode: 'LTU',
    hubType: 'Latur Industrial Air Corridor',
  },

  // Major Indian Aviation Hubs:
  {
    id: 'loc_in_mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    display: 'Mumbai, Maharashtra, India',
    airportCode: 'BOM / VABB',
    hubType: 'Chhatrapati Shivaji Maharaj International (FBO / VIP)',
  },
  {
    id: 'loc_in_delhi',
    city: 'Delhi',
    state: 'Delhi (NCR)',
    country: 'India',
    countryCode: 'IN',
    display: 'Delhi, Delhi NCR, India',
    airportCode: 'DEL / VIDP',
    hubType: 'Indira Gandhi International (General Aviation Terminal)',
  },
  {
    id: 'loc_in_bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    display: 'Bengaluru, Karnataka, India',
    airportCode: 'BLR / VOBL',
    hubType: 'Kempegowda International (Aero Space Park & HAL)',
  },
  {
    id: 'loc_in_rgoa',
    city: 'RGOA',
    state: 'Goa',
    country: 'India',
    countryCode: 'IN',
    display: 'RGOA (Manohar Int\'l Mopa), Goa, India',
    airportCode: 'GOX / VOGA',
    hubType: 'Mopa International FBO Terminal',
  },
  {
    id: 'loc_in_hyderabad',
    city: 'Hyderabad',
    state: 'TS',
    country: 'India',
    countryCode: 'IN',
    display: 'Hyderabad, TS, India',
    airportCode: 'HYD / VOHS',
    hubType: 'Rajiv Gandhi International (GMR Aerospace SEZ)',
  },
  {
    id: 'loc_pk_hyderabad',
    city: 'Hyderabad',
    state: 'Sindh province',
    country: 'Pakistan',
    countryCode: 'PK',
    display: 'Hyderabad, Sindh province, Pakistan',
    airportCode: 'HDD / OPKD',
    hubType: 'Sindh Aviation Corridor & Domestic Hub',
  },
  {
    id: 'loc_in_chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    display: 'Chennai, Tamil Nadu, India',
    airportCode: 'MAA / VOMM',
    hubType: 'Chennai International Cargo & Maintenance Hub',
  },
  {
    id: 'loc_in_kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    countryCode: 'IN',
    display: 'Kolkata, West Bengal, India',
    airportCode: 'CCU / VECC',
    hubType: 'Netaji Subhash Chandra Bose Int\'l Hub',
  },
  {
    id: 'loc_in_ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    countryCode: 'IN',
    display: 'Ahmedabad, Gujarat, India',
    airportCode: 'AMD / VAAH',
    hubType: 'Sardar Vallabhbhai Patel International',
  },
  {
    id: 'loc_in_cochin',
    city: 'Cochin',
    state: 'Kerala',
    country: 'India',
    countryCode: 'IN',
    display: 'Cochin, Kerala, India',
    airportCode: 'COK / VOCI',
    hubType: 'Cochin International (Solar Aviation Hub)',
  },
  {
    id: 'loc_in_pune',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    display: 'Pune, Maharashtra, India',
    airportCode: 'PNQ / VAPO',
    hubType: 'Pune Air Force & Civil Enclave',
  },

  // United Arab Emirates (UAE):
  {
    id: 'loc_ae_dubai',
    city: 'Dubai',
    state: 'Dubai Emirate',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    display: 'Dubai, Dubai Emirate, United Arab Emirates',
    airportCode: 'DXB / OMDB',
    hubType: 'Dubai International & DWC Al Maktoum VIP FBO',
  },
  {
    id: 'loc_ae_abudhabi',
    city: 'Abu Dhabi',
    state: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    display: 'Abu Dhabi, Abu Dhabi Emirate, United Arab Emirates',
    airportCode: 'AUH / OMAA',
    hubType: 'Zayed International & Al Bateen Executive Airport',
  },
  {
    id: 'loc_ae_sharjah',
    city: 'Sharjah',
    state: 'Sharjah',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    display: 'Sharjah, Sharjah Emirate, United Arab Emirates',
    airportCode: 'SHJ / OMSJ',
    hubType: 'Sharjah International Air Cargo Hub',
  },

  // United Kingdom (GB):
  {
    id: 'loc_gb_london',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    countryCode: 'GB',
    display: 'London, Greater London, United Kingdom',
    airportCode: 'LHR / EGLL',
    hubType: 'Heathrow / Gatwick / Farnborough Executive Hub',
  },
  {
    id: 'loc_gb_manchester',
    city: 'Manchester',
    state: 'Greater Manchester',
    country: 'United Kingdom',
    countryCode: 'GB',
    display: 'Manchester, Greater Manchester, United Kingdom',
    airportCode: 'MAN / EGCC',
    hubType: 'Manchester Northern Aviation Hub',
  },
  {
    id: 'loc_gb_birmingham',
    city: 'Birmingham',
    state: 'West Midlands',
    country: 'United Kingdom',
    countryCode: 'GB',
    display: 'Birmingham, West Midlands, United Kingdom',
    airportCode: 'BHX / EGBB',
    hubType: 'Birmingham International Aerospace Hub',
  },

  // Germany (DE):
  {
    id: 'loc_de_munich',
    city: 'Munich',
    state: 'Bavaria',
    country: 'Germany',
    countryCode: 'DE',
    display: 'Munich, Bavaria, Germany',
    airportCode: 'MUC / EDDM',
    hubType: 'Munich Franz Josef Strauss (Turbine & MRO Center)',
  },
  {
    id: 'loc_de_frankfurt',
    city: 'Frankfurt',
    state: 'Hesse',
    country: 'Germany',
    countryCode: 'DE',
    display: 'Frankfurt, Hesse, Germany',
    airportCode: 'FRA / EDDF',
    hubType: 'Frankfurt Rhein-Main Cargo & Overhaul Hub',
  },
  {
    id: 'loc_de_berlin',
    city: 'Berlin',
    state: 'Brandenburg',
    country: 'Germany',
    countryCode: 'DE',
    display: 'Berlin, Brandenburg, Germany',
    airportCode: 'BER / EDDB',
    hubType: 'Berlin Brandenburg Willy Brandt',
  },

  // United States (US):
  {
    id: 'loc_us_miami',
    city: 'Miami',
    state: 'Florida',
    country: 'United States',
    countryCode: 'US',
    display: 'Miami, Florida, United States',
    airportCode: 'MIA / KMIA',
    hubType: 'Miami International & Opa-Locka Executive (OPF)',
  },
  {
    id: 'loc_us_newyork',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    countryCode: 'US',
    display: 'New York, New York, United States',
    airportCode: 'JFK / KJFK',
    hubType: 'JFK / Teterboro Executive Airport (TEB)',
  },
  {
    id: 'loc_us_losangeles',
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
    countryCode: 'US',
    display: 'Los Angeles, California, United States',
    airportCode: 'LAX / KLAX',
    hubType: 'Van Nuys Executive (VNY) & LAX Aviation Corridor',
  },

  // Singapore (SG):
  {
    id: 'loc_sg_singapore',
    city: 'Singapore',
    state: 'Central Region',
    country: 'Singapore',
    countryCode: 'SG',
    display: 'Singapore, Central Region, Singapore',
    airportCode: 'SIN / WSSS',
    hubType: 'Singapore Changi & Seletar Aerospace Park',
  },

  // France (FR):
  {
    id: 'loc_fr_paris',
    city: 'Paris',
    state: 'Île-de-France',
    country: 'France',
    countryCode: 'FR',
    display: 'Paris, Île-de-France, France',
    airportCode: 'CDG / LFPG',
    hubType: 'Paris Charles de Gaulle & Le Bourget Executive (LBG)',
  },
  {
    id: 'loc_fr_toulouse',
    city: 'Toulouse',
    state: 'Occitanie',
    country: 'France',
    countryCode: 'FR',
    display: 'Toulouse, Occitanie, France',
    airportCode: 'TLS / LFBO',
    hubType: 'Toulouse-Blagnac (Airbus Aerospace Capital)',
  },
];

/**
 * Searches the location database for city / state / country matches.
 * Automatically displays matches when 3 or more characters are entered.
 * Returns formatted location objects with display: "City, State, Country".
 */
export function searchLocations(query: string, minChars: number = 3): LocationItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < minChars) return [];

  return COMPREHENSIVE_LOCATIONS.filter((loc) => {
    return (
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      loc.display.toLowerCase().includes(q) ||
      (loc.airportCode && loc.airportCode.toLowerCase().includes(q))
    );
  });
}

