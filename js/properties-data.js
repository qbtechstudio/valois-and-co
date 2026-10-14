// Valois & Co. Luxury Real Estate Data Store
const LUXURY_PROPERTIES = [
  {
    id: "prop-1",
    title: "The Bel Air Promontory Estate",
    tagline: "Unrivaled 360° panoramic views spanning the Pacific Ocean to Downtown LA",
    type: "Modern Villa",
    category: "villa",
    status: "For Sale",
    price: 38500000,
    priceFormatted: "$38,500,000",
    rentalPrice: null,
    location: "Bel Air, Los Angeles, CA",
    city: "Beverly Hills",
    country: "United States",
    address: "10771 Bellagio Road, Bel Air, CA 90077",
    bedrooms: 7,
    bathrooms: 11,
    sqft: 18500,
    lotSize: "2.4 Acres",
    yearBuilt: 2024,
    garage: 8,
    isFeatured: true,
    isExclusive: true,
    badge: "Exclusive Trophy",
    agentId: "agent-1",
    coordinates: [34.0837, -118.4452],
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "Perched atop Bel Air's most covetable private promontory, this architectural triumph blends museum-grade concrete, warm travertine, and continuous walls of motorized glass. Designed by world-renowned studio SAOTA, the residence unfolds across three dramatic tiers centered around an 85-foot zero-edge infinity pool hovering above the Los Angeles basin. Features an underground 12-car gallery showroom, 2,500-bottle glass wine cellar, Dolby Atmos screening sanctuary, and a full subterranean wellness spa with hammam.",
    amenities: [
      "Infinity Edge Pool", "12-Car Showroom", "Private Helipad Access", 
      "Dolby Atmos Cinema", "Subterranean Spa & Hammam", "2,500 Bottle Wine Cellar",
      "Crestron Smart Automation", "Staff Quarters", "Tennis Court", "Elevator"
    ],
    floorPlans: [
      { name: "Main Living Level", area: "8,200 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" },
      { name: "Upper Master Sanctuary", area: "5,400 sq.ft", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80" },
      { name: "Subterranean Wellness & Lounge", area: "4,900 sq.ft", image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 82,
      dining: "Spago & Nobu Malibu (15 min)",
      transit: "Private Van Nuys Jet Center (18 min)",
      beach: "Santa Monica Gold Coast (12 min)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  },
  {
    id: "prop-2",
    title: "The Billionaires' Row Sky Penthouse",
    tagline: "Triplex crown jewel perched 1,100 feet above Central Park",
    type: "Penthouse",
    category: "penthouse",
    status: "For Sale",
    price: 54000000,
    priceFormatted: "$54,000,000",
    rentalPrice: null,
    location: "Midtown Manhattan, New York, NY",
    city: "Manhattan",
    country: "United States",
    address: "217 West 57th Street, Manhattan, NY 10019",
    bedrooms: 6,
    bathrooms: 8,
    sqft: 12200,
    lotSize: "Triplex Terrace",
    yearBuilt: 2023,
    garage: 3,
    isFeatured: true,
    isExclusive: true,
    badge: "Architectural Icon",
    agentId: "agent-2",
    coordinates: [40.7663, -73.9808],
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "Soaring above Manhattan, this custom triplex penthouse captures unobstructed 360-degree vistas of Central Park, the Hudson River, and the Atlantic horizon. Features a grand cantilevered double-height salon with 24-foot ceilings, custom Calacatta marble fireplace, a private interior bronze spiral staircase, private elevator access, and a wraparound terrace offering twilight skyline perspectives unlike any residence in the Western Hemisphere.",
    amenities: [
      "Unobstructed Central Park Views", "Private Wraparound Terrace", "Private Keyed Elevator",
      "24/7 White-Glove Concierge", "Olympic Indoor Lap Pool", "Private Wine Tasting Salon",
      "Private Dining Club", "Valet Parking", "Chauffeur Lounge", "Custom Millwork"
    ],
    floorPlans: [
      { name: "Floor 128: Grand Entertaining", area: "4,600 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" },
      { name: "Floor 129: Master Quarters", area: "4,100 sq.ft", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 99,
      dining: "Le Bernardin & Per Se (3 min)",
      transit: "Grand Central Terminal & Heliport (8 min)",
      beach: "The Hamptons Seaplane Pier (10 min)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  },
  {
    id: "prop-3",
    title: "Villa Solstice Waterfront Palace",
    tagline: "Direct Biscayne Bay frontage with private 120ft deep-water mega-yacht slip",
    type: "Waterfront",
    category: "waterfront",
    status: "For Sale",
    price: 27900000,
    priceFormatted: "$27,900,000",
    rentalPrice: null,
    location: "Star Island, Miami Beach, FL",
    city: "Miami",
    country: "United States",
    address: "44 Star Island Drive, Miami Beach, FL 33139",
    bedrooms: 8,
    bathrooms: 10,
    sqft: 14200,
    lotSize: "1.1 Acres Waterfront",
    yearBuilt: 2024,
    garage: 6,
    isFeatured: true,
    isExclusive: false,
    badge: "Superyacht Dock",
    agentId: "agent-3",
    coordinates: [25.7781, -80.1524],
    heroImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "An ultra-modern tropical oasis set on guard-gated Star Island. Flanked by majestic royal palms, the residence offers seamless indoor-outdoor living, reflection pools, and 200 feet of prime bay frontage. Enjoy a dual-level glass pool with swim-up cocktail lounge, full outdoor commercial kitchen, and direct ocean access without fixed bridges.",
    amenities: [
      "120ft Mega-Yacht Slip", "Dual-Level Glass Pool", "Guard-Gated Island", 
      "Cabana with Teppanyaki Grill", "Rooftop Stargazing Deck", "Sub-Zero Chef Kitchen",
      "Bio-Ethanol Fire Lounges", "Spa with Cold Plunge", "Automated Security Perimeter"
    ],
    floorPlans: [
      { name: "Ground Promenade & Lanai", area: "8,000 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" },
      { name: "Executive Suite Level", area: "6,200 sq.ft", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 75,
      dining: "Carbone & Casa Tua (6 min)",
      transit: "Miami Int'l Airport (15 min)",
      beach: "South Beach Oceanfront (4 min)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  },
  {
    id: "prop-4",
    title: "Château d'Azur Belle Époque Sanctuary",
    tagline: "Historic French Riviera cliffside sanctuary overlooking the Mediterranean sea",
    type: "Historic Manor",
    category: "manor",
    status: "For Sale",
    price: 42000000,
    priceFormatted: "€42,000,000",
    rentalPrice: null,
    location: "Saint-Jean-Cap-Ferrat, Côte d'Azur",
    city: "Côte d'Azur",
    country: "France",
    address: "Boulevard du Général de Gaulle, 06230 Saint-Jean-Cap-Ferrat",
    bedrooms: 9,
    bathrooms: 12,
    sqft: 16800,
    lotSize: "4.5 Hectares",
    yearBuilt: 1912,
    garage: 10,
    isFeatured: true,
    isExclusive: true,
    badge: "Riviera Legend",
    agentId: "agent-1",
    coordinates: [43.6892, 7.3324],
    heroImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "An irreplaceable aristocratic domain commanding the heights of the Cap-Ferrat peninsula. Surrounded by century-old olive groves, manicured botanical gardens, and classical stone fountains, this landmark estate combines royal heritage with state-of-the-art contemporary security and climate control. Private funicular descends to a secluded cove with yacht tender mooring.",
    amenities: [
      "Private Mediterranean Funicular", "Sea-Water Heated Pool", "Century-Old Olive Groves",
      "Guest Villa (4 Suites)", "Caretaker Lodge", "Helipad Landing Authorization",
      "Private Wine Grotto", "Ballroom with Gold Leaf Moldings", "Art Conservation Vault"
    ],
    floorPlans: [
      { name: "Palatial Reception Wing", area: "7,500 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" },
      { name: "Royal Suites Tier", area: "6,100 sq.ft", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 80,
      dining: "Le Grand-Hôtel du Cap-Ferrat (4 min)",
      transit: "Nice Côte d'Azur Airport (25 min)",
      beach: "Paloma Beach & Private Cove (Direct)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  },
  {
    id: "prop-5",
    title: "The Aspen Alpine Glass Chalet",
    tagline: "Direct ski-in / ski-out modern timber masterpiece on Red Mountain",
    type: "Mountain Estate",
    category: "mountain",
    status: "For Sale",
    price: 31000000,
    priceFormatted: "$31,000,000",
    rentalPrice: null,
    location: "Red Mountain, Aspen, CO",
    city: "Aspen",
    country: "United States",
    address: "720 Willoughby Way, Aspen, CO 81611",
    bedrooms: 6,
    bathrooms: 8,
    sqft: 11500,
    lotSize: "3.2 Alpine Acres",
    yearBuilt: 2023,
    garage: 4,
    isFeatured: false,
    isExclusive: false,
    badge: "Ski-in / Ski-out",
    agentId: "agent-2",
    coordinates: [39.1911, -106.8175],
    heroImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "Engineering marvel sculpted into the slopes of Red Mountain. Framed in heavy Douglas fir timbers, hot-rolled steel, and triple-glazed alpine curtain walls, this residence offers front-row views of Ajax Mountain. Heated driveway, custom oxygen-enriched bedroom suites for high-altitude comfort, and an indoor heated saline pool with glass retracting wall.",
    amenities: [
      "Direct Ski-in / Ski-out Access", "Heated Exterior Terraces & Drive", "Oxygen-Enriched Suites",
      "Commercial Ski Locker & Tuning Room", "Indoor/Outdoor Saline Pool", "Cedar Sauna & Cold Plunge",
      "Double Sided Stone Fireplace", "Smart Climate Control", "Billiards & Scotch Lounge"
    ],
    floorPlans: [
      { name: "Great Room & Hearth Level", area: "5,800 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" },
      { name: "Ski Lounge & Wellness Level", area: "5,700 sq.ft", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 68,
      dining: "Matsuhisa & The Little Nell (5 min)",
      transit: "Aspen Pitkin Airport (12 min)",
      beach: "Roaring Fork River Trail (Direct)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  },
  {
    id: "prop-6",
    title: "The Palm Jumeirah Signature Frond Villa",
    tagline: "Private beachfront oasis with private sea lagoon and skyline view of Dubai Marina",
    type: "Modern Villa",
    category: "villa",
    status: "For Sale",
    price: 34500000,
    priceFormatted: "$34,500,000",
    rentalPrice: "$180,000/mo",
    location: "Palm Jumeirah, Dubai, UAE",
    city: "Dubai",
    country: "United Arab Emirates",
    address: "Frond N, Palm Jumeirah, Dubai",
    bedrooms: 6,
    bathrooms: 8,
    sqft: 13800,
    lotSize: "15,000 sq.ft Plot",
    yearBuilt: 2024,
    garage: 5,
    isFeatured: true,
    isExclusive: true,
    badge: "Private Beachfront",
    agentId: "agent-3",
    coordinates: [25.1124, 55.1390],
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "An extraordinary contemporary beachfront sanctuary on the elite Fronds of Palm Jumeirah. Crafted with bookmatched Italian Statuario marble, Japanese zen courtyard, bespoke bronze facade accents, and automated glass walls that slide away to reveal a private beach and infinity pool looking across the serene Arabian Gulf.",
    amenities: [
      "Private White Sand Beach", "Marina Skyline Views", "Custom Italian Kitchen by Poliform",
      "Submerged Sunken Fire Pit", "Private Elevator", "Security Monitoring Center",
      "Rooftop Shisha & Cocktail Deck", "Staff Accommodations", "Air-Conditioned Garage"
    ],
    floorPlans: [
      { name: "Ground Beach Pavilion", area: "7,200 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" },
      { name: "Upper Presidential Suites", area: "6,600 sq.ft", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 85,
      dining: "Atlantis The Royal & Nobu (4 min)",
      transit: "Dubai Int'l Airport / Al Maktoum (25 min)",
      beach: "Private Gulf Waters (0 min)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  },
  {
    id: "prop-7",
    title: "Tribeca Cast-Iron Architectural Loft",
    tagline: "Museum-scale loft with 16-foot ceiling heights in historic preservation district",
    type: "Penthouse",
    category: "penthouse",
    status: "For Rent",
    price: 18500000,
    priceFormatted: "$18,500,000",
    rentalPrice: "$65,000/mo",
    location: "Tribeca, Manhattan, NY",
    city: "Manhattan",
    country: "United States",
    address: "68 Franklin Street, New York, NY 10013",
    bedrooms: 4,
    bathrooms: 5,
    sqft: 7600,
    lotSize: "Full Floor Loft",
    yearBuilt: 1898,
    garage: 2,
    isFeatured: false,
    isExclusive: false,
    badge: "Design Masterpiece",
    agentId: "agent-2",
    coordinates: [40.7183, -74.0048],
    heroImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "An authentic historic cast-iron loft comprehensively reimagined by minimalist icon John Pawson. Features museum-grade art illumination, wide-plank Dinesen Douglas fir flooring, fluted marble kitchen monolith, bespoke acoustic treatment, and private key-in elevator opening directly into a light-drenched gallery.",
    amenities: [
      "Original Cast-Iron Columns", "Direct Keyed Elevator", "Dinesen Fir Flooring",
      "Sculptural Marble Kitchen Island", "Art-Grade Illumination", "Sound Isolation System",
      "Custom Walk-in Dressing Suites", "Wine Storage Room"
    ],
    floorPlans: [
      { name: "Full Floor Residence", area: "7,600 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 99,
      dining: "Locanda Verde & The Odeon (2 min)",
      transit: "Hudson River Greenway & Heliport (5 min)",
      beach: "Battery Park Promenade (8 min)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  },
  {
    id: "prop-8",
    title: "Villa Mirasol Mediterranean Compound",
    tagline: "Secluded estate with championship equestrian facilities and citrus orchards",
    type: "Modern Villa",
    category: "villa",
    status: "For Sale",
    price: 24500000,
    priceFormatted: "$24,500,000",
    rentalPrice: null,
    location: "Montecito, Santa Barbara, CA",
    city: "Beverly Hills",
    country: "United States",
    address: "1485 East Mountain Drive, Montecito, CA 93108",
    bedrooms: 6,
    bathrooms: 9,
    sqft: 13200,
    lotSize: "5.8 Acres",
    yearBuilt: 2021,
    garage: 6,
    isFeatured: false,
    isExclusive: true,
    badge: "Private Sanctuary",
    agentId: "agent-1",
    coordinates: [34.4367, -119.6321],
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=80"
    ],
    description: "Nestled in Montecito's prestigious Golden Quadrangle, this serene Spanish Colonial revival estate offers panoramic views of the Santa Ynez mountains and coastline. Surrounded by mature olive trees, fragrant lavender fields, and organic citrus orchards, it includes a detached two-bedroom guest casita, yoga pavilion, and resort pool.",
    amenities: [
      "Citrus Orchards & Vine Rows", "Detached Guest Casita", "Yoga & Meditation Pavilion",
      "Custom Outdoor Pizza Oven & Kitchen", "Wine Cellar & Tasting Room", "Tesla Solar Roof & Powerwalls",
      "Security Gatehouse", "Heated Swimming Pool"
    ],
    floorPlans: [
      { name: "Main Hacienda", area: "9,800 sq.ft", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80" },
      { name: "Guest Pavilion", area: "3,400 sq.ft", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80" }
    ],
    walkscore: {
      score: 72,
      dining: "San Ysidro Ranch & Lucky's (5 min)",
      transit: "Santa Barbara Airport (18 min)",
      beach: "Butterfly Beach (6 min)"
    },
    virtualTourUrl: "https://my.matterport.com/show/?m=sample"
  }
];

// Locations metadata for filters and quick badges
const LUXURY_LOCATIONS = [
  { id: "all", name: "All Locations", count: 8 },
  { id: "Beverly Hills", name: "Beverly Hills & LA", count: 2, center: [34.0837, -118.4452] },
  { id: "Manhattan", name: "Manhattan & Tribeca", count: 2, center: [40.7580, -73.9855] },
  { id: "Miami", name: "Miami & Star Island", count: 1, center: [25.7781, -80.1524] },
  { id: "Côte d'Azur", name: "French Riviera", count: 1, center: [43.6892, 7.3324] },
  { id: "Aspen", name: "Aspen Red Mountain", count: 1, center: [39.1911, -106.8175] },
  { id: "Dubai", name: "Dubai Palm Jumeirah", count: 1, center: [25.1124, 55.1390] }
];
