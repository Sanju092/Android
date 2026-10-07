/**
 * MetroTrack Hyderabad - Complete Official Metro Network Data
 * Accurate GPS coordinates, line colors, sequence orders, and interchange nodes.
 */

export const METRO_LINES = {
  RED: {
    id: 'RED',
    name: 'Red Line (Corridor I)',
    shortName: 'Red Line',
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    terminals: 'Miyapur ⇄ LB Nagar',
    totalDistanceKm: 29.21,
    stationsCount: 27
  },
  BLUE: {
    id: 'BLUE',
    name: 'Blue Line (Corridor III)',
    shortName: 'Blue Line',
    color: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    terminals: 'Raidurg ⇄ Nagole',
    totalDistanceKm: 27.0,
    stationsCount: 23
  },
  GREEN: {
    id: 'GREEN',
    name: 'Green Line (Corridor II)',
    shortName: 'Green Line',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    terminals: 'JBS Parade Ground ⇄ MGBS',
    totalDistanceKm: 11.0,
    stationsCount: 9
  }
};

export const METRO_STATIONS = [
  // ================= RED LINE (27 Stations) =================
  {
    id: 'R01',
    name: 'Miyapur',
    line: 'RED',
    order: 1,
    lat: 17.4968,
    lng: 78.3614,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Parking', 'Elevator', 'Restrooms', 'ATM'],
    landmark: 'Miyapur Bus Depot / Cross Roads'
  },
  {
    id: 'R02',
    name: 'JNTU College',
    line: 'RED',
    order: 2,
    lat: 17.4986,
    lng: 78.3891,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'JNTUH Campus'
  },
  {
    id: 'R03',
    name: 'KPHB Colony',
    line: 'RED',
    order: 3,
    lat: 17.4933,
    lng: 78.4014,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Parking', 'Elevator', 'Restrooms'],
    landmark: 'Kukatpally Housing Board'
  },
  {
    id: 'R04',
    name: 'Kukatpally',
    line: 'RED',
    order: 4,
    lat: 17.4851,
    lng: 78.4116,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Kukatpally Y Junction'
  },
  {
    id: 'R05',
    name: 'Dr. B.R. Ambedkar Balanagar',
    line: 'RED',
    order: 5,
    lat: 17.4727,
    lng: 78.4299,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Balanagar Industrial Area'
  },
  {
    id: 'R06',
    name: 'Moosapet',
    line: 'RED',
    order: 6,
    lat: 17.4697,
    lng: 78.4385,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Moosapet Circle'
  },
  {
    id: 'R07',
    name: 'Bharat Nagar',
    line: 'RED',
    order: 7,
    lat: 17.4640,
    lng: 78.4444,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'MMTS Railway Connection'],
    landmark: 'Bharat Nagar Flyover'
  },
  {
    id: 'R08',
    name: 'Erragadda',
    line: 'RED',
    order: 8,
    lat: 17.4578,
    lng: 78.4485,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Erragadda Rythu Bazar'
  },
  {
    id: 'R09',
    name: 'ESI Hospital',
    line: 'RED',
    order: 9,
    lat: 17.4501,
    lng: 78.4506,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'ESI Hospital Sanathnagar'
  },
  {
    id: 'R10',
    name: 'S.R. Nagar',
    line: 'RED',
    order: 10,
    lat: 17.4442,
    lng: 78.4480,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Sanjeeva Reddy Nagar'
  },
  {
    id: 'R11',
    name: 'Ameerpet',
    line: 'RED',
    order: 11,
    lat: 17.4357,
    lng: 78.4446,
    isInterchange: true,
    interchangeWith: ['BLUE'],
    interchangeDetails: 'Major 2-Level Interchange between Red & Blue lines',
    facilities: ['Parking', 'Elevator', 'Restrooms', 'Food Court', 'ATM'],
    landmark: 'Ameerpet Junction / Saradhi Studios'
  },
  {
    id: 'R12',
    name: 'Punjagutta',
    line: 'RED',
    order: 12,
    lat: 17.4269,
    lng: 78.4526,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'Mall Connect'],
    landmark: 'Hyderabad Central / Punjagutta Circle'
  },
  {
    id: 'R13',
    name: 'Irrum Manzil',
    line: 'RED',
    order: 13,
    lat: 17.4208,
    lng: 78.4572,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'Mall Connect'],
    landmark: 'Next Galleria Mall'
  },
  {
    id: 'R14',
    name: 'Khairatabad',
    line: 'RED',
    order: 14,
    lat: 17.4124,
    lng: 78.4604,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'MMTS Railway Connection'],
    landmark: 'Khairatabad RTA / Hussain Sagar'
  },
  {
    id: 'R15',
    name: 'Lakdi-ka-pul',
    line: 'RED',
    order: 15,
    lat: 17.4052,
    lng: 78.4649,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'MMTS Railway Connection'],
    landmark: 'Lakdi-ka-pul / Red Hills'
  },
  {
    id: 'R16',
    name: 'Assembly',
    line: 'RED',
    order: 16,
    lat: 17.3995,
    lng: 78.4716,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Telangana Legislative Assembly / Public Gardens'
  },
  {
    id: 'R17',
    name: 'Nampally',
    line: 'RED',
    order: 17,
    lat: 17.3925,
    lng: 78.4721,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'Railway Station Connection'],
    landmark: 'Hyderabad Deccan Railway Station'
  },
  {
    id: 'R18',
    name: 'Gandhi Bhavan',
    line: 'RED',
    order: 18,
    lat: 17.3871,
    lng: 78.4746,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Gandhi Bhavan / Exhibition Grounds'
  },
  {
    id: 'R19',
    name: 'Osmania Medical College',
    line: 'RED',
    order: 19,
    lat: 17.3831,
    lng: 78.4795,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Koti / OMC Campus'
  },
  {
    id: 'R20',
    name: 'MG Bus Station',
    line: 'RED',
    order: 20,
    lat: 17.3786,
    lng: 78.4842,
    isInterchange: true,
    interchangeWith: ['GREEN'],
    interchangeDetails: 'Major Interchange between Red & Green lines',
    facilities: ['Parking', 'Elevator', 'Restrooms', 'Central Bus Terminal Connection'],
    landmark: 'Mahatma Gandhi Bus Station (Imlibun)'
  },
  {
    id: 'R21',
    name: 'Malakpet',
    line: 'RED',
    order: 21,
    lat: 17.3746,
    lng: 78.4977,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'MMTS Railway Connection'],
    landmark: 'Malakpet Gunj'
  },
  {
    id: 'R22',
    name: 'New Market',
    line: 'RED',
    order: 22,
    lat: 17.3705,
    lng: 78.5085,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Kothapet / Super Market'
  },
  {
    id: 'R23',
    name: 'Musarambagh',
    line: 'RED',
    order: 23,
    lat: 17.3686,
    lng: 78.5144,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Next Galleria Musarambagh'
  },
  {
    id: 'R24',
    name: 'Dilsukhnagar',
    line: 'RED',
    order: 24,
    lat: 17.3688,
    lng: 78.5256,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'Bus Stop Connect'],
    landmark: 'Dilsukhnagar Bus Depot & Market'
  },
  {
    id: 'R25',
    name: 'Chaitanyapuri',
    line: 'RED',
    order: 25,
    lat: 17.3653,
    lng: 78.5369,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Chaitanyapuri Junction'
  },
  {
    id: 'R26',
    name: 'Victoria Memorial',
    line: 'RED',
    order: 26,
    lat: 17.3611,
    lng: 78.5471,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Victoria Memorial Home'
  },
  {
    id: 'R27',
    name: 'LB Nagar',
    line: 'RED',
    order: 27,
    lat: 17.3503,
    lng: 78.5524,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Parking', 'Elevator', 'Restrooms', 'Highway Bus Junction'],
    landmark: 'LB Nagar Ring Road / Vijayawada Highway'
  },

  // ================= BLUE LINE (23 Stations) =================
  {
    id: 'B01',
    name: 'Raidurg',
    line: 'BLUE',
    order: 1,
    lat: 17.4428,
    lng: 78.3772,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Parking', 'Elevator', 'Restrooms', 'Mall Connect'],
    landmark: 'Raheja Mindspace / Knowledge City'
  },
  {
    id: 'B02',
    name: 'Hitec City',
    line: 'BLUE',
    order: 2,
    lat: 17.4475,
    lng: 78.3845,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'Cyber Towers Skywalk'],
    landmark: 'Cyber Towers / L&T Infocity'
  },
  {
    id: 'B03',
    name: 'Durgam Cheruvu',
    line: 'BLUE',
    order: 3,
    lat: 17.4429,
    lng: 78.3934,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Cable Bridge / Madhapur IT Hub'
  },
  {
    id: 'B04',
    name: 'Madhapur',
    line: 'BLUE',
    order: 4,
    lat: 17.4388,
    lng: 78.4011,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Madhapur Police Station / Ayyappa Society'
  },
  {
    id: 'B05',
    name: 'Peddamma Gudi',
    line: 'BLUE',
    order: 5,
    lat: 17.4340,
    lng: 78.4116,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Peddamma Temple Jubilee Hills'
  },
  {
    id: 'B06',
    name: 'Jubilee Hills Check Post',
    line: 'BLUE',
    order: 6,
    lat: 17.4308,
    lng: 78.4190,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Check Post Circle / KBR Park'
  },
  {
    id: 'B07',
    name: 'Road No 5 Jubilee Hills',
    line: 'BLUE',
    order: 7,
    lat: 17.4319,
    lng: 78.4285,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Venkatagiri / Journalist Colony'
  },
  {
    id: 'B08',
    name: 'Yousufguda',
    line: 'BLUE',
    order: 8,
    lat: 17.4357,
    lng: 78.4345,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Yousufguda Police Grounds'
  },
  {
    id: 'B09',
    name: 'Madhura Nagar',
    line: 'BLUE',
    order: 9,
    lat: 17.4372,
    lng: 78.4395,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Madhura Nagar Colony'
  },
  {
    id: 'B10',
    name: 'Ameerpet (Blue)',
    nameDisplay: 'Ameerpet',
    line: 'BLUE',
    order: 10,
    lat: 17.4357,
    lng: 78.4446,
    isInterchange: true,
    interchangeWith: ['RED'],
    interchangeDetails: 'Major 2-Level Interchange between Red & Blue lines',
    facilities: ['Parking', 'Elevator', 'Restrooms', 'Food Court', 'ATM'],
    landmark: 'Ameerpet Junction / Saradhi Studios'
  },
  {
    id: 'B11',
    name: 'Begumpet',
    line: 'BLUE',
    order: 11,
    lat: 17.4380,
    lng: 78.4582,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'MMTS Railway Connection'],
    landmark: 'Begumpet Railway Station / Shoppers Stop'
  },
  {
    id: 'B12',
    name: 'Prakash Nagar',
    line: 'BLUE',
    order: 12,
    lat: 17.4419,
    lng: 78.4688,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Old Airport Road / Prakash Nagar'
  },
  {
    id: 'B13',
    name: 'Rasoolpura',
    line: 'BLUE',
    order: 13,
    lat: 17.4431,
    lng: 78.4764,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Rasoolpura Flyover / Ministers Road'
  },
  {
    id: 'B14',
    name: 'Paradise',
    line: 'BLUE',
    order: 14,
    lat: 17.4439,
    lng: 78.4870,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Paradise Hotel / Secunderabad Club'
  },
  {
    id: 'B15',
    name: 'Parade Ground',
    line: 'BLUE',
    order: 15,
    lat: 17.4435,
    lng: 78.4988,
    isInterchange: true,
    interchangeWith: ['GREEN'],
    interchangeDetails: 'Pedestrian Skywalk interchange with Green Line (JBS Parade Ground)',
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Parade Grounds / YMCA Secunderabad'
  },
  {
    id: 'B16',
    name: 'Secunderabad East',
    line: 'BLUE',
    order: 16,
    lat: 17.4389,
    lng: 78.5042,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'Major Railway Station Connection'],
    landmark: 'Secunderabad Junction Railway Station'
  },
  {
    id: 'B17',
    name: 'Mettuguda',
    line: 'BLUE',
    order: 17,
    lat: 17.4350,
    lng: 78.5165,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Railway Hospital / Mettuguda Circle'
  },
  {
    id: 'B18',
    name: 'Tarnaka',
    line: 'BLUE',
    order: 18,
    lat: 17.4283,
    lng: 78.5284,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Osmania University North Gate / CCMB'
  },
  {
    id: 'B19',
    name: 'Habsiguda',
    line: 'BLUE',
    order: 19,
    lat: 17.4172,
    lng: 78.5397,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'IICT / Habsiguda X Roads'
  },
  {
    id: 'B20',
    name: 'NGRI',
    line: 'BLUE',
    order: 20,
    lat: 17.4087,
    lng: 78.5473,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'National Geophysical Research Institute'
  },
  {
    id: 'B21',
    name: 'Stadium',
    line: 'BLUE',
    order: 21,
    lat: 17.3996,
    lng: 78.5539,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Parking', 'Elevator', 'Restrooms'],
    landmark: 'Uppal Cricket Stadium (RGIC Stadium)'
  },
  {
    id: 'B22',
    name: 'Nagole',
    line: 'BLUE',
    order: 22,
    lat: 17.3932,
    lng: 78.5593,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Parking', 'Elevator', 'Restrooms'],
    landmark: 'Nagole RTO / Inner Ring Road'
  },

  // ================= GREEN LINE (9 Stations) =================
  {
    id: 'G01',
    name: 'JBS Parade Ground',
    line: 'GREEN',
    order: 1,
    lat: 17.4468,
    lng: 78.4985,
    isInterchange: true,
    interchangeWith: ['BLUE'],
    interchangeDetails: 'Walkway connected to Blue Line Parade Ground station',
    facilities: ['Parking', 'Elevator', 'Restrooms', 'Inter-State Bus Station Connection'],
    landmark: 'Jubilee Bus Station (JBS)'
  },
  {
    id: 'G02',
    name: 'Secunderabad West',
    line: 'GREEN',
    order: 2,
    lat: 17.4379,
    lng: 78.4998,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms', 'Railway Station Connection'],
    landmark: 'Secunderabad Station West Entrance'
  },
  {
    id: 'G03',
    name: 'Gandhi Hospital',
    line: 'GREEN',
    order: 3,
    lat: 17.4265,
    lng: 78.5034,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Gandhi Hospital Musheerabad'
  },
  {
    id: 'G04',
    name: 'Musheerabad',
    line: 'GREEN',
    order: 4,
    lat: 17.4182,
    lng: 78.5038,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Musheerabad Jail Memorial / Market'
  },
  {
    id: 'G05',
    name: 'RTC X Roads',
    line: 'GREEN',
    order: 5,
    lat: 17.4101,
    lng: 78.5015,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'RTC Cross Roads / Cinema Theatres'
  },
  {
    id: 'G06',
    name: 'Chikkadpally',
    line: 'GREEN',
    order: 6,
    lat: 17.4019,
    lng: 78.4978,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Chikkadpally Central Library'
  },
  {
    id: 'G07',
    name: 'Narayanguda',
    line: 'GREEN',
    order: 7,
    lat: 17.3941,
    lng: 78.4939,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Narayanguda Flyover / YMCA'
  },
  {
    id: 'G08',
    name: 'Sultan Bazaar',
    line: 'GREEN',
    order: 8,
    lat: 17.3855,
    lng: 78.4893,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Restrooms'],
    landmark: 'Sultan Bazaar / Koti Commercial Center'
  },
  {
    id: 'G09',
    name: 'MG Bus Station (Green)',
    nameDisplay: 'MG Bus Station',
    line: 'GREEN',
    order: 9,
    lat: 17.3786,
    lng: 78.4842,
    isInterchange: true,
    interchangeWith: ['RED'],
    interchangeDetails: 'Major Interchange with Red Line',
    facilities: ['Parking', 'Elevator', 'Restrooms', 'Central Bus Terminal Connection'],
    landmark: 'Mahatma Gandhi Bus Station (Imlibun)'
  }
];

/**
 * Normalizes station identification across lines (for interchanges like Ameerpet, MGBS, Parade Ground)
 */
export function getCanonicalStationName(station) {
  if (!station) return '';
  return station.nameDisplay || station.name.replace(/ \(Blue\)|\(Green\)|\(Red\)/g, '');
}

/**
 * Standard Hyderabad Metro Fare Structure (Slab based)
 * 0 - 2 km: ₹10
 * 2 - 4 km: ₹15
 * 4 - 6 km: ₹25
 * 6 - 9 km: ₹30
 * 9 - 12 km: ₹35
 * 12 - 15 km: ₹40
 * 15 - 18 km: ₹45
 * 18 - 21 km: ₹50
 * 21 - 26 km: ₹55
 * > 26 km: ₹60
 */
export function calculateMetroFare(distanceKm) {
  if (distanceKm <= 2) return 10;
  if (distanceKm <= 4) return 15;
  if (distanceKm <= 6) return 25;
  if (distanceKm <= 9) return 30;
  if (distanceKm <= 12) return 35;
  if (distanceKm <= 15) return 40;
  if (distanceKm <= 18) return 45;
  if (distanceKm <= 21) return 50;
  if (distanceKm <= 26) return 55;
  return 60;
}
