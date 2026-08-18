'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Building,
  Home,
  Hotel,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Phone,
  User,
  Info,
  Compass,
  Crosshair,
} from 'lucide-react';

export interface DeliveryLocationData {
  locationType: 'VENDOR_PICKUP' | 'DOORSTEP' | 'HOTEL' | 'HOSTEL' | 'OTHER';
  locationSource: 'CURRENT_LOCATION' | 'GOOGLE_PLACE' | 'MAP_PIN' | 'MANUAL';
  address: string;
  houseOrRoom?: string;
  buildingName?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  formattedAddress?: string;
  contactName?: string;
  contactPhone?: string;
  deliveryInstructions?: string;
}

interface DeliveryLocationSelectorProps {
  destinationCity: string;
  initialType?: string;
  vendorDeliveryRadiusKm?: number;
  baseDeliveryFee?: number;
  onLocationConfirmed: (location: DeliveryLocationData) => void;
  savedLocations?: any[];
}

// Landmark database covering all key Uttarakhand tourist destinations
const UTTARAKHAND_LANDMARKS: Record<
  string,
  Array<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    type: 'HOTEL' | 'HOSTEL' | 'LANDMARK';
    category: string;
  }>
> = {
  rishikesh: [
    { name: 'Zostel Rishikesh (Tapovan)', address: 'NH58, Badrinath Rd, Tapovan, Rishikesh', lat: 30.1317, lng: 78.3242, type: 'HOSTEL', category: 'Hostel' },
    { name: 'Ganga Kinare by Lotus', address: '23, Veerbhadra Rd, Ganga Vatika, Rishikesh', lat: 30.1033, lng: 78.2934, type: 'HOTEL', category: 'Resort' },
    { name: 'Laxman Jhula Market Point', address: 'Laxman Jhula Rd, Tapovan, Rishikesh', lat: 30.1257, lng: 78.3276, type: 'LANDMARK', category: 'Market / Hub' },
    { name: 'Aloha on the Ganges Resort', address: 'National Highway 58, Tapovan, Rishikesh', lat: 30.1345, lng: 78.3289, type: 'HOTEL', category: 'Resort' },
    { name: 'Moustache Hostel Rishikesh', address: 'Near Lakshman Jhula, Tapovan, Rishikesh', lat: 30.1288, lng: 78.3265, type: 'HOSTEL', category: 'Hostel' },
    { name: 'Ram Jhula Parking & Ghat', address: 'Swarg Ashram Rd, Rishikesh', lat: 30.1194, lng: 78.3142, type: 'LANDMARK', category: 'Ghat / Parking' },
    { name: 'Triveni Ghat Evening Aarti', address: 'Mayakund, Rishikesh', lat: 30.1068, lng: 78.2965, type: 'LANDMARK', category: 'Holy Ghat' },
    { name: 'AIIMS Rishikesh Main Gate', address: 'Virbhadra Rd, Pashulok, Rishikesh', lat: 30.0763, lng: 78.2864, type: 'LANDMARK', category: 'Institution' },
    { name: 'Shivpuri Rafting Camp Hub', address: 'Badrinath Hwy, Shivpuri, Rishikesh', lat: 30.1412, lng: 78.3891, type: 'LANDMARK', category: 'Adventure Hub' },
  ],
  mussoorie: [
    { name: 'The Claridges Nabha Estate', address: 'Airfield, Barlow Ganj, Mussoorie', lat: 30.4501, lng: 78.0833, type: 'HOTEL', category: 'Luxury Heritage' },
    { name: 'JW Marriott Walnut Grove', address: 'Village Siya, Kempty Fall Rd, Mussoorie', lat: 30.4851, lng: 78.0312, type: 'HOTEL', category: 'Luxury Resort' },
    { name: 'Library Chowk (Mall Road Entry)', address: 'Mall Rd, The Mall, Mussoorie', lat: 30.4598, lng: 78.0645, type: 'LANDMARK', category: 'Central Hub' },
    { name: 'Zostel Plus Mussoorie', address: 'Kempty Fall Rd, Mussoorie', lat: 30.4789, lng: 78.0411, type: 'HOSTEL', category: 'Hostel' },
    { name: 'Picture Palace Bus Stand', address: 'The Mall, Kulri, Mussoorie', lat: 30.4542, lng: 78.0789, type: 'LANDMARK', category: 'Bus / Taxi Stand' },
    { name: 'Landour Bakehouse / Char Dukan', address: 'Sister Bazaar, Landour, Mussoorie', lat: 30.4632, lng: 78.0934, type: 'LANDMARK', category: 'Tourist Landmark' },
  ],
  dehradun: [
    { name: 'Clock Tower (Ghanta Ghar)', address: 'Paltan Bazaar, Dehradun', lat: 30.3256, lng: 78.0437, type: 'LANDMARK', category: 'City Center' },
    { name: 'Hyatt Regency Dehradun Resort', address: 'Dehradun Resort, Malsi, Dehradun', lat: 30.3842, lng: 78.0821, type: 'HOTEL', category: '5-Star Hotel' },
    { name: 'Rajpur Road Central Hub', address: 'Rajpur Rd, Hathibarkala Salwala, Dehradun', lat: 30.3391, lng: 78.0612, type: 'LANDMARK', category: 'Commercial Hub' },
    { name: 'ISBT Dehradun Inter-State Bus Terminus', address: 'Haridwar Bypass Rd, Dehradun', lat: 30.2854, lng: 78.0062, type: 'LANDMARK', category: 'Transport Hub' },
    { name: 'Dehradun Railway Station', address: 'Railway Station Rd, Lakkhi Bagh, Dehradun', lat: 30.3156, lng: 78.0345, type: 'LANDMARK', category: 'Railway Station' },
    { name: 'FRI (Forest Research Institute)', address: 'Chakrata Rd, Indian Military Academy, Dehradun', lat: 30.3421, lng: 77.9984, type: 'LANDMARK', category: 'Heritage / Park' },
  ],
  haridwar: [
    { name: 'Har Ki Pauri Brahma Kund', address: 'Upper Road, Haridwar', lat: 29.9576, lng: 78.1706, type: 'LANDMARK', category: 'Holy Ghat' },
    { name: 'Haridwar Junction Railway Station', address: 'Laksar Rd, Devpura, Haridwar', lat: 29.9452, lng: 78.1567, type: 'LANDMARK', category: 'Railway Station' },
    { name: 'Shivalik Nagar Central Market', address: 'BHEL Township, Shivalik Nagar, Haridwar', lat: 29.9312, lng: 78.0987, type: 'LANDMARK', category: 'Market / Residential' },
    { name: 'Radisson Blu Hotel Haridwar', address: 'Plot C1, Sector 12, SIDCUL, Haridwar', lat: 29.9145, lng: 78.0823, type: 'HOTEL', category: 'Hotel' },
  ],
  nainital: [
    { name: 'Naini Lake Boating Point (Mallital)', address: 'The Mall, Nainital', lat: 29.3919, lng: 79.4542, type: 'LANDMARK', category: 'Lake Front' },
    { name: 'The Manu Maharani Resort', address: 'Grassmere Estate, Mallital, Nainital', lat: 29.3982, lng: 79.4491, type: 'HOTEL', category: 'Luxury Resort' },
    { name: 'Zostel Nainital (Pangot Road)', address: 'Pangot Rd, Mallital, Nainital', lat: 29.4102, lng: 79.4421, type: 'HOSTEL', category: 'Hostel' },
    { name: 'Tallital Bus Stand & Rickshaw Stand', address: 'Tallital, Nainital', lat: 29.3821, lng: 79.4632, type: 'LANDMARK', category: 'Transport Hub' },
    { name: 'Snow View Point Ropeway', address: 'Mallital, Nainital', lat: 29.3995, lng: 79.4598, type: 'LANDMARK', category: 'Scenic Point' },
  ],
  haldwani: [
    { name: 'Kathgodam Railway Station', address: 'Railway Colony, Kathgodam, Haldwani', lat: 29.2734, lng: 79.5398, type: 'LANDMARK', category: 'Railway Terminal' },
    { name: 'Tikonia Chowk Central', address: 'Nainital Rd, Tikonia, Haldwani', lat: 29.2215, lng: 79.5287, type: 'LANDMARK', category: 'City Center' },
    { name: 'Walkway Mall Haldwani', address: 'Nainital Rd, Bhotia Parao, Haldwani', lat: 29.2312, lng: 79.5245, type: 'LANDMARK', category: 'Shopping Hub' },
  ],
};

export default function DeliveryLocationSelector({
  destinationCity = 'Rishikesh',
  initialType = 'VENDOR_PICKUP',
  vendorDeliveryRadiusKm = 15,
  baseDeliveryFee = 120,
  onLocationConfirmed,
  savedLocations = [],
}: DeliveryLocationSelectorProps) {
  const [deliveryMode, setDeliveryMode] = useState<'VENDOR_PICKUP' | 'DOORSTEP' | 'HOTEL'>(
    initialType === 'HOTEL_DELIVERY' || initialType === 'HOSTEL_DELIVERY'
      ? 'HOTEL'
      : initialType === 'DOORSTEP'
      ? 'DOORSTEP'
      : 'VENDOR_PICKUP'
  );

  // Engine state: checks if Google Maps is actively loaded or using RideSetu Fallback
  const [mapEngine, setMapEngine] = useState<'FALLBACK' | 'GOOGLE_MAPS'>('FALLBACK');
  const [mapStyle, setMapStyle] = useState<'ROADMAP' | 'SATELLITE' | 'TERRAIN'>('TERRAIN');

  // Coordinates & Center Setup
  const cityKey = destinationCity.toLowerCase().trim();
  const initialLandmarks = UTTARAKHAND_LANDMARKS[cityKey] || UTTARAKHAND_LANDMARKS['rishikesh'];
  const defaultCenter = initialLandmarks[0] || { lat: 30.0869, lng: 78.2676, address: 'Main Market, ' + destinationCity, name: destinationCity + ' Center' };

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
  });

  const [locationSource, setLocationSource] = useState<'CURRENT_LOCATION' | 'GOOGLE_PLACE' | 'MAP_PIN' | 'MANUAL'>('MANUAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSuccess, setGeoSuccess] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Address Form Details
  const [address, setAddress] = useState(defaultCenter.address);
  const [houseOrRoom, setHouseOrRoom] = useState('');
  const [buildingName, setBuildingName] = useState(defaultCenter.name);
  const [landmark, setLandmark] = useState('Near ' + destinationCity + ' Hub');
  const [pincode, setPincode] = useState('249192');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Confirmation & Interaction State
  const [isConfirmed, setIsConfirmed] = useState(false);
  const mapCanvasRef = useRef<HTMLDivElement>(null);

  // Google Maps Graceful SDK Initializer (Optional Production Feature)
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
      setMapEngine('FALLBACK');
      return;
    }

    // Catch any Google Maps authentication / billing failure event
    (window as any).gm_authFailure = () => {
      console.info('[RideSetu Location] Google Maps auth/billing restricted. Seamlessly activating RideSetu Fallback Location Engine.');
      setMapEngine('FALLBACK');
    };

    // Check if script is already present
    if ((window as any).google && (window as any).google.maps) {
      setMapEngine('GOOGLE_MAPS');
      return;
    }

    const scriptId = 'google-maps-sdk-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google && (window as any).google.maps) {
          setMapEngine('GOOGLE_MAPS');
        }
      };
      script.onerror = () => {
        console.info('[RideSetu Location] Google Maps script loading failed. Using RideSetu Fallback Location Engine.');
        setMapEngine('FALLBACK');
      };
      document.head.appendChild(script);
    }
  }, []);

  // Sync default center when destinationCity changes
  useEffect(() => {
    const landmarks = UTTARAKHAND_LANDMARKS[destinationCity.toLowerCase().trim()] || UTTARAKHAND_LANDMARKS['rishikesh'];
    if (landmarks && landmarks.length > 0) {
      const first = landmarks[0];
      setCoords({ lat: first.lat, lng: first.lng });
      setBuildingName(first.name);
      setAddress(first.address);
      setLandmark('Near ' + first.name);
    }
  }, [destinationCity]);

  // Debounced Instant Landmark Search (Zero-Billing Engine)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      const query = searchQuery.toLowerCase().trim();
      const currentCityLandmarks = UTTARAKHAND_LANDMARKS[cityKey] || [];
      const allLandmarks = Object.values(UTTARAKHAND_LANDMARKS).flat();

      // Prioritize current city landmarks first, then broader Uttarakhand
      const localMatches = currentCityLandmarks.filter(
        (l) => l.name.toLowerCase().includes(query) || l.address.toLowerCase().includes(query) || l.category.toLowerCase().includes(query)
      );

      const otherMatches = allLandmarks.filter(
        (l) =>
          !localMatches.some((lm) => lm.name === l.name) &&
          (l.name.toLowerCase().includes(query) || l.address.toLowerCase().includes(query))
      );

      const combined = [...localMatches, ...otherMatches].slice(0, 6);

      // If no exact match, provide dynamic custom address option
      if (combined.length === 0 || !combined.some((m) => m.name.toLowerCase() === query)) {
        combined.push({
          name: searchQuery,
          address: `${searchQuery}, ${destinationCity}, Uttarakhand`,
          lat: coords.lat + (Math.random() - 0.5) * 0.008,
          lng: coords.lng + (Math.random() - 0.5) * 0.008,
          type: deliveryMode === 'HOTEL' ? 'HOTEL' : 'LANDMARK',
          category: 'Custom Searched Location',
        });
      }

      setSuggestions(combined);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, cityKey, destinationCity, deliveryMode, coords]);

  // High-Accuracy Browser Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(5));
        const userLng = Number(pos.coords.longitude.toFixed(5));
        setCoords({ lat: userLat, lng: userLng });
        setLocationSource('CURRENT_LOCATION');
        setAddress(`GPS Location (${userLat}°N, ${userLng}°E), ${destinationCity}`);
        setBuildingName('My Current GPS Location');
        setLandmark('Detected via Device GPS');
        setGeoLoading(false);
        setGeoSuccess(true);
        setTimeout(() => setGeoSuccess(false), 4000);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError('Location permission denied. Please enable location access or select your hotel from the list below.');
        } else {
          setGeoError('Unable to detect GPS position. Please search for your hotel/address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  // Interactive Map Canvas Click / Pin Repositioning
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapCanvasRef.current) return;
    const rect = mapCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel offset from center to coordinate delta (~0.01 deg per 100px at zoom 14)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / (rect.width * 20);
    const deltaY = (centerY - y) / (rect.height * 20);

    const newLat = Number((coords.lat + deltaY).toFixed(5));
    const newLng = Number((coords.lng + deltaX).toFixed(5));

    setCoords({ lat: newLat, lng: newLng });
    setLocationSource('MAP_PIN');
    setLandmark(`Map Marker (${newLat}°N, ${newLng}°E)`);
    setIsConfirmed(false);
  };

  // Nudge Coordinates (Micro Adjustments)
  const handleNudge = (dLat: number, dLng: number) => {
    setCoords((prev) => ({
      lat: Number((prev.lat + dLat).toFixed(5)),
      lng: Number((prev.lng + dLng).toFixed(5)),
    }));
    setLocationSource('MAP_PIN');
    setIsConfirmed(false);
  };

  // Select Landmark / Suggestion
  const handleSelectSuggestion = (item: any) => {
    setCoords({ lat: item.lat, lng: item.lng });
    setBuildingName(item.name);
    setAddress(item.address);
    setLandmark(item.category || item.name);
    setLocationSource('GOOGLE_PLACE');
    setSearchQuery('');
    setSuggestions([]);
    setIsConfirmed(false);
  };

  // Select Customer Saved Location
  const handleSelectSavedLocation = (saved: any) => {
    setCoords({ lat: saved.latitude, lng: saved.longitude });
    setBuildingName(saved.buildingName || saved.label);
    setHouseOrRoom(saved.houseOrRoom || '');
    setLandmark(saved.landmark || '');
    setAddress(saved.address);
    setPincode(saved.pincode || '');
    setContactName(saved.contactName || '');
    setContactPhone(saved.contactPhone || '');
    setDeliveryInstructions(saved.deliveryInstructions || '');
    setLocationSource('MANUAL');
    setIsConfirmed(false);
  };

  // Confirm Delivery Snapshot
  const handleConfirm = () => {
    const finalLocationData: DeliveryLocationData = {
      locationType: deliveryMode === 'VENDOR_PICKUP' ? 'VENDOR_PICKUP' : deliveryMode === 'HOTEL' ? 'HOTEL' : 'DOORSTEP',
      locationSource,
      address: deliveryMode === 'VENDOR_PICKUP' ? `Verified Local Vendor Hub, ${destinationCity}` : address,
      houseOrRoom: deliveryMode === 'VENDOR_PICKUP' ? '' : houseOrRoom,
      buildingName: deliveryMode === 'VENDOR_PICKUP' ? 'Vendor Official Hub' : buildingName,
      landmark: deliveryMode === 'VENDOR_PICKUP' ? 'Main Market Junction' : landmark,
      city: destinationCity,
      state: 'Uttarakhand',
      country: 'India',
      pincode,
      latitude: coords.lat,
      longitude: coords.lng,
      contactName,
      contactPhone,
      deliveryInstructions,
      formattedAddress:
        deliveryMode === 'VENDOR_PICKUP'
          ? `Verified Local Vendor Hub, ${destinationCity}, Uttarakhand`
          : `${houseOrRoom ? houseOrRoom + ', ' : ''}${buildingName ? buildingName + ', ' : ''}${address}, ${destinationCity}, Uttarakhand`,
    };

    setIsConfirmed(true);
    onLocationConfirmed(finalLocationData);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Pickup & Delivery Method</h3>
              {/* Engine Status Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {mapEngine === 'GOOGLE_MAPS' ? 'Google Maps Mode' : 'RideSetu Location Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Select shop pickup or doorstep delivery in {destinationCity}
            </p>
          </div>
        </div>

        {isConfirmed ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Location Confirmed
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">Step 1: Set Location</span>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Delivery Method Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Vendor Pickup */}
          <button
            type="button"
            onClick={() => {
              setDeliveryMode('VENDOR_PICKUP');
              setIsConfirmed(false);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
              deliveryMode === 'VENDOR_PICKUP'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Building className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                FREE
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Vendor Pickup</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Pick up directly from verified shop hub in {destinationCity}
              </div>
            </div>
          </button>

          {/* Option 2: Hotel / Resort / Hostel Delivery */}
          <button
            type="button"
            onClick={() => {
              setDeliveryMode('HOTEL');
              setIsConfirmed(false);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
              deliveryMode === 'HOTEL'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="p-2 rounded-lg bg-teal-100 text-teal-800">
                <Hotel className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                ₹{baseDeliveryFee}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Hotel / Hostel Delivery</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Direct doorstep delivery to your hotel, resort, or hostel
              </div>
            </div>
          </button>

          {/* Option 3: Doorstep / Airbnb Delivery */}
          <button
            type="button"
            onClick={() => {
              setDeliveryMode('DOORSTEP');
              setIsConfirmed(false);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
              deliveryMode === 'DOORSTEP'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                <Home className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                ₹{baseDeliveryFee}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Doorstep Delivery</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Airbnb, home, homestay, or custom landmark delivery
              </div>
            </div>
          </button>
        </div>

        {/* VENDOR PICKUP MODE INFO */}
        {deliveryMode === 'VENDOR_PICKUP' && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-sm text-slate-700">
              <div className="font-bold text-slate-900">
                Verified Local Vendor Hub — {destinationCity}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                You will pick up the vehicle directly from the verified vendor workshop. Exact Google Maps navigation link, store landmark, and host contact details will be unlocked on your digital voucher upon confirmation.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-700">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Zero Delivery Fee
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Free Clean Helmets
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Fast 2-Min Handover
                </span>
              </div>
            </div>
          </div>
        )}

        {/* HOTEL & DOORSTEP DELIVERY CONTROLS */}
        {deliveryMode !== 'VENDOR_PICKUP' && (
          <div className="space-y-5">
            {/* Action Bar: Geolocation & Saved Locations */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geoLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-75"
                >
                  <Navigation className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
                  {geoLoading ? 'Detecting GPS Location...' : 'Use My Current Location'}
                </button>

                {geoSuccess && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> GPS Locked!
                  </span>
                )}
              </div>

              {/* Quick Saved Locations Badges */}
              {savedLocations && savedLocations.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-semibold text-slate-400 shrink-0">Saved:</span>
                  {savedLocations.map((loc: any) => (
                    <button
                      key={loc._id}
                      type="button"
                      onClick={() => handleSelectSavedLocation(loc)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 transition-colors shrink-0"
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Geolocation Alerts */}
            {geoError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Search Input with Instant Landmark Dropdown */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search hotel, hostel, resort, or landmark in ${destinationCity} (e.g. Zostel, Ganga Kinare, Mall Road)...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full p-3 text-left hover:bg-emerald-50/50 flex items-start gap-3 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {item.type === 'HOSTEL' ? (
                          <Building className="w-4 h-4" />
                        ) : item.type === 'HOTEL' ? (
                          <Hotel className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INTERACTIVE FALLBACK MAP CANVAS (Zero-Billing Interactive Map) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Interactive Delivery Map & Pin Placer
                </span>
                <span className="text-[11px] text-slate-400">Click canvas to reposition marker</span>
              </div>

              <div
                ref={mapCanvasRef}
                onClick={handleMapCanvasClick}
                className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-white h-56 sm:h-64 flex items-center justify-center group shadow-inner cursor-crosshair select-none"
              >
                {/* Simulated Map Visual Canvas */}
                <div
                  className="absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-500"
                  style={{
                    backgroundImage:
                      mapStyle === 'TERRAIN'
                        ? 'radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.2), transparent 60%), linear-gradient(135deg, #0f172a 0%, #022c22 50%, #0f172a 100%)'
                        : mapStyle === 'SATELLITE'
                        ? 'radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.25), transparent 70%), linear-gradient(to bottom, #020617, #0f172a)'
                        : 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95))',
                  }}
                />

                {/* Animated Map Grid Lines & Topo Contours */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
                    backgroundSize: '36px 36px',
                  }}
                />

                {/* Interactive Center Delivery Marker */}
                <div className="relative z-10 flex flex-col items-center pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-2xl flex items-center gap-1.5 mb-1.5 border border-emerald-300/40 animate-pulse">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="max-w-[200px] truncate">{buildingName || 'Selected Location'}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg ring-4 ring-emerald-400/40" />
                  </div>
                </div>

                {/* Map Floating HUD Controls */}
                {/* Top Left: Active Coordinates Display */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-slate-800 shadow-md">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    GPS: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                  </span>
                </div>

                {/* Top Right: Layer Style Toggles */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapStyle('TERRAIN');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                      mapStyle === 'TERRAIN' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Topo
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapStyle('SATELLITE');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                      mapStyle === 'SATELLITE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                </div>

                {/* Bottom Left: Micro Nudge Controls */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    title="Nudge North"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNudge(0.001, 0);
                    }}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-200"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Nudge South"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNudge(-0.001, 0);
                    }}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-200"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    title="Nudge West"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNudge(0, -0.001);
                    }}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-200"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    title="Nudge East"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNudge(0, 0.001);
                    }}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center text-slate-200"
                  >
                    →
                  </button>
                </div>

                {/* Bottom Right: Engine Transparency Label */}
                <div className="absolute bottom-3 right-3 z-10 text-[10px] font-medium text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg backdrop-blur border border-slate-800">
                  RideSetu GeoEngine • Uttarakhand Zone
                </div>
              </div>
            </div>

            {/* Manual Form Specifics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {deliveryMode === 'HOTEL' ? 'Hotel / Hostel / Resort Name *' : 'Building / Villa / Society Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={buildingName}
                  onChange={(e) => {
                    setBuildingName(e.target.value);
                    setIsConfirmed(false);
                  }}
                  placeholder={deliveryMode === 'HOTEL' ? 'e.g. Zostel Tapovan / Hotel Ganga Kinare' : 'e.g. Shanti Villa / Apartment 4B'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {deliveryMode === 'HOTEL' ? 'Room / Bed / Dorm Number' : 'House / Flat / Floor Number'}
                </label>
                <input
                  type="text"
                  value={houseOrRoom}
                  onChange={(e) => {
                    setHouseOrRoom(e.target.value);
                    setIsConfirmed(false);
                  }}
                  placeholder="e.g. Room #302 / Flat 2A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address & Area *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setIsConfirmed(false);
                  }}
                  placeholder="e.g. Badrinath Road, Tapovan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prominent Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => {
                    setLandmark(e.target.value);
                    setIsConfirmed(false);
                  }}
                  placeholder="e.g. Near Laxman Jhula Bridge"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Instructions for Rider
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => {
                    setDeliveryInstructions(e.target.value);
                    setIsConfirmed(false);
                  }}
                  placeholder="e.g. Call 10 mins before arrival / Leave at reception"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation & Snapshot Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {deliveryMode === 'VENDOR_PICKUP'
                ? 'Store pickup is verified and ready upon booking confirmation.'
                : `Delivery radius: up to ${vendorDeliveryRadiusKm}km from vendor hub.`}
            </span>
          </div>

          {!isConfirmed ? (
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              Confirm Delivery Location
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Snapshot Saved
              </span>
              <button
                type="button"
                onClick={() => setIsConfirmed(false)}
                className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
              >
                [ Change Location ]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
