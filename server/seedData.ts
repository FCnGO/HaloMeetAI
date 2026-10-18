import { UserProfile, Venue, ConversationRecord, OpportunityRecord } from '../src/types';

export const SEED_VENUES: Venue[] = [
  {
    id: 'sin-t3',
    name: 'Singapore Changi Airport (SIN) - Terminal 3',
    code: 'SIN',
    city: 'Singapore',
    terminal: 'Terminal 3',
    zones: [
      'SilverKris Lounge',
      'Central Transit Garden',
      'Gate B1-B10 Wing',
      'Jewel Connector Plaza',
      'Crystal Garden Concourse'
    ],
    activeAttendeesCount: 18
  },
  {
    id: 'sfo-t2',
    name: 'San Francisco International (SFO) - Terminal 2',
    code: 'SFO',
    city: 'San Francisco',
    terminal: 'Terminal 2',
    zones: [
      'SkyLounge',
      'Boarding Area D',
      'Concourse Hallway'
    ],
    activeAttendeesCount: 5
  },
  {
    id: 'lhr-t5',
    name: 'London Heathrow (LHR) - Terminal 5',
    code: 'LHR',
    city: 'London',
    terminal: 'Terminal 5',
    zones: [
      'Galleries First Lounge',
      'Concourse A Main Floor',
      'Satellite B Hub'
    ],
    activeAttendeesCount: 6
  }
];

export const SEED_PROFILES: UserProfile[] = [
  {
    id: 'priya-shah',
    name: 'Priya Shah',
    role: 'Founder & CEO',
    company: 'forthcode / ANiX Tech',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'SilverKris Lounge',
    availabilityMinutes: 90,
    availableUntil: '2026-10-14T03:30:00.000Z',
    objective: 'find_partners',
    rawDescription: 'We build offline-first agentic software for commercial aviation. Our suite includes ANiX (an inflight conversational AI concierge that runs locally on aircraft servers without satellite WiFi, assisting flight attendants and answering passenger inquiries), DAViX (real-time cabin acoustics and sensor telemetry analytics for passenger comfort), and nGO (ground operations co-pilot that syncs baggage dispatch, catering, and cabin turnarounds). We are looking for airline innovation heads and inflight product directors for pilot deployments.',
    contactInfo: {
      email: 'priya.shah@forthcode.io',
      phone: '+65 9123 4567',
      linkedin: 'linkedin.com/in/priyashah-aviation'
    },
    agentSpec: {
      oneLinePitch: 'Offline-first inflight AI concierges and cabin telemetry systems engineered for commercial airlines.',
      elevatorPitch: "Hi! I represent Priya Shah, founder of ForthCode. We eliminate the steep satellite bandwidth tax on airlines with ANiX — an autonomous edge AI concierge running on aircraft servers to answer passenger questions, guide meal and entertainment choices, and empower cabin crew even over transoceanic dark zones.",
      products: [
        {
          id: 'anix-concierge',
          title: 'ANiX — Onboard AI Concierge',
          description: 'High-speed offline LLM concierge running on edge IFE servers without satellite connectivity, serving custom passenger queries and flight schedules.',
          suggestedQuestions: [
            'How does ANiX run without satellite internet?',
            'What IFE hardware systems does ANiX integrate with?',
            'Can flight attendants use it for safety queries and meal logistics?'
          ]
        },
        {
          id: 'davix-telemetry',
          title: 'DAViX — Cabin Sensor Analytics',
          description: 'Edge cabin telemetry interpreting thermal gradients, ambient noise, and seat comfort metrics to optimize passenger well-being in real-time.',
          suggestedQuestions: [
            'Does DAViX require retrofit sensors or use existing OEM bus data?',
            'How does it notify crew regarding cabin hot spots?',
            'Can it correlate air quality with passenger comfort feedback?'
          ]
        },
        {
          id: 'ngo-turnaround',
          title: 'nGO — Turnaround Co-Pilot',
          description: 'Ground operations synchronization engine linking baggage handling, cleaning crews, and fueling to trim aircraft turnaround times.',
          suggestedQuestions: [
            'What average turnaround reduction has nGO achieved?',
            'Does nGO integrate with standard airline DCS and dispatch hubs?',
            'Can ground handlers access nGO on mobile devices?'
          ]
        }
      ],
      approvedTopics: [
        'ANiX offline architecture',
        'IFE integration',
        'DAViX cabin telemetry',
        'nGO turnaround co-pilot',
        'Airline partnership pilots',
        'Edge AI efficiency'
      ],
      disallowedTopics: [
        'Private funding terms',
        'Unapproved commercial pricing sheets',
        'Personal phone numbers',
        'Direct personal email without approved introduction'
      ],
      tone: 'Crisp, technical, executive-focused, and welcoming'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    },
    isHero: true
  },
  {
    id: 'tom-reyes',
    name: 'Tom Reyes',
    role: 'Head of Digital Experience & Inflight Innovation',
    company: 'SkyHorizon Airlines',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Central Transit Garden',
    availabilityMinutes: 60,
    availableUntil: '2026-10-14T03:00:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Leading airline digital innovation group evaluating next-generation passenger experience systems. We are currently scouting generative AI and edge compute solutions for our long-haul fleet (Boeing 787 and A350), with a specific focus on offline conversational IFE, intelligent cabin comfort, and crew enablement where satellite bandwidth is constrained or costly.',
    contactInfo: {
      email: 'tom.reyes@skyhorizonair.com',
      phone: '+1 (415) 890-2341',
      linkedin: 'linkedin.com/in/tom-reyes-skyhorizon'
    },
    agentSpec: {
      oneLinePitch: 'Scouting generative AI and edge compute solutions to transform inflight passenger experience on long-haul routes.',
      elevatorPitch: "Hello, I am Tom Reyes's digital agent. Tom leads Inflight Innovation at SkyHorizon Airlines. We are actively evaluating edge AI vendors capable of running offline conversational concierges and smart cabin enhancements across our twin-aisle fleet.",
      products: [
        {
          id: 'skyhorizon-fleet',
          title: 'Fleet Pilot Program',
          description: 'Targeted trial slots across 40 long-haul A350 aircraft for innovative edge IFE and intelligent cabin comfort tech.',
          suggestedQuestions: [
            'What timeline is SkyHorizon targeting for IFE AI pilots?',
            'What are your primary constraints regarding onboard connectivity?',
            'How do you evaluate passenger privacy and onboard inference?'
          ]
        },
        {
          id: 'passenger-app',
          title: 'Connected Cabin Initiative',
          description: 'Framework to merge passenger smartphone companion apps with seatback IFE and real-time cabin service requests.',
          suggestedQuestions: [
            'Does SkyHorizon support BYOD (Bring Your Own Device) integration?',
            'Are you interested in crew-facing co-pilots as well as passenger tools?'
          ]
        }
      ],
      approvedTopics: [
        'Fleet innovation roadmap',
        'Long-haul IFE pain points',
        'Edge AI pilot criteria',
        'Satellite connectivity bandwidth costs'
      ],
      disallowedTopics: [
        'Internal RFP tender budgets',
        'Confidential supplier contracts',
        'Personal contact details without mutual approval'
      ],
      tone: 'Inquisitive, strategic, airline leadership'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    },
    isHero: true
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    role: 'Managing Partner',
    company: 'Horizon Aero Ventures',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'SilverKris Lounge',
    availabilityMinutes: 120,
    availableUntil: '2026-10-14T04:00:00.000Z',
    objective: 'invest',
    rawDescription: 'Early-stage venture capital firm investing $1M-$4M seed checks into aerospace software, autonomous aviation ops, and edge AI applications for commercial carriers. Looking to meet high-conviction founders solving mission-critical airline inefficiencies.',
    contactInfo: {
      email: 'marcus.vance@horizonaero.vc',
      phone: '+44 20 7946 0912',
      linkedin: 'linkedin.com/in/marcusvance-aero'
    },
    agentSpec: {
      oneLinePitch: 'Early-stage aerospace and aviation-tech seed fund deploying capital into mission-critical software.',
      elevatorPitch: "Greetings, I represent Marcus Vance from Horizon Aero Ventures. Marcus backs early-stage founders tackling enterprise aviation bottlenecks — from autonomous ground operations to edge computing inside the aircraft cabin.",
      products: [
        {
          id: 'seed-fund-ticket',
          title: 'Seed & Pre-Series A Investments',
          description: '$1M-$4M lead investments into software and AI startups transforming commercial airline economics and passenger operations.',
          suggestedQuestions: [
            'What stage of customer traction does Horizon Aero require?',
            'Do you assist portfolio founders with airline procurement introductions?'
          ]
        }
      ],
      approvedTopics: [
        'Venture funding criteria',
        'Aviation software thesis',
        'Pilot-to-commercial deployment transition'
      ],
      disallowedTopics: [
        'LP identities',
        'Fund performance metrics',
        'Direct personal contact details before approved introduction'
      ],
      tone: 'Direct, venture investor, analytical'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    },
    isHero: true
  },
  {
    id: 'mei-ling-chen',
    name: 'Mei-Ling Chen',
    role: 'VP Customer Experience',
    company: 'Pacific Wingways',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Crystal Garden Concourse',
    availabilityMinutes: 45,
    availableUntil: '2026-10-14T02:45:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Seeking multilingual conversational AI systems to provide seamless cultural and dietary translations for passengers across Asia-Pacific routes.',
    contactInfo: {
      email: 'chen.meiling@pacificwingways.com'
    },
    agentSpec: {
      oneLinePitch: 'Modernizing Asia-Pacific transcontinental passenger comfort with localized AI experiences.',
      elevatorPitch: "Hello, I am Mei-Ling's representative. We are exploring onboard tools that handle multilingual passenger queries with cultural nuance.",
      products: [
        {
          id: 'apac-hospitality',
          title: 'Pacific Hospitality Portal',
          description: 'Seatback digital concierge supporting 14 Asian languages and localized dietary guides.',
          suggestedQuestions: [
            'Does your system handle dietary restrictions like Halal, Kosher, and Jain?',
            'How accurate is real-time translation without internet?'
          ]
        }
      ],
      approvedTopics: ['Passenger hospitality', 'Multilingual translation', 'Dietary inquiries'],
      disallowedTopics: ['Budget disclosures', 'Direct contact numbers'],
      tone: 'Courteous, hospitality-minded'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'siddharth-nair',
    name: 'Siddharth Nair',
    role: 'Lead Systems Architect',
    company: 'Avionix Cabin Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Gate B1-B10 Wing',
    availabilityMinutes: 75,
    availableUntil: '2026-10-14T03:15:00.000Z',
    objective: 'network',
    rawDescription: 'Designing DO-160 compliant onboard Linux server blades and edge neural accelerators for aircraft seatback screens.',
    contactInfo: {
      email: 'siddharth@avionixcabin.com'
    },
    agentSpec: {
      oneLinePitch: 'Certified avionics edge server hardware accelerating AI workloads directly in the cabin.',
      elevatorPitch: "Hi! Siddharth designs the certified DO-160 hardware that runs modern cabin AI and IFE applications. Open to discussing edge runtime compatibility and compute limits.",
      products: [
        {
          id: 'blade-server-ix',
          title: 'BladeServer-IX Edge Box',
          description: 'Aviation-certified 1U edge blade with integrated neural accelerators consuming under 45 Watts per zone.',
          suggestedQuestions: [
            'What DO-160 certification tests has the BladeServer passed?',
            'What GPU or NPU runtimes are supported?'
          ]
        }
      ],
      approvedTopics: ['Hardware certification', 'Edge compute power limits', 'Cabin bus protocol'],
      disallowedTopics: ['Unreleased hardware schematics', 'Direct phone numbers'],
      tone: 'Deeply technical, hardware engineer'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'amara-okafor',
    name: 'Amara Okafor',
    role: 'Director of In-Flight Retail',
    company: 'Global Sky Shoppes',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Jewel Connector Plaza',
    availabilityMinutes: 110,
    availableUntil: '2026-10-14T03:50:00.000Z',
    objective: 'sell_products',
    rawDescription: 'Powering automated, duty-free in-seat retail checkout and passenger recommendation algorithms for airlines.',
    contactInfo: {
      email: 'a.okafor@globalskyshoppes.com'
    },
    agentSpec: {
      oneLinePitch: 'Boosting airline ancillary revenue through personalized in-seat retail recommendations.',
      elevatorPitch: "Representing Amara Okafor. We help airlines turn idle seatback dwell time into personalized retail conversions.",
      products: [
        {
          id: 'sky-checkout',
          title: 'SkyCheckout Ancillary Engine',
          description: 'Predictive duty-free merchandise engine adapting recommendations based on destination climate and passenger flight history.',
          suggestedQuestions: [
            'What average increase in ancillary sales per seat do you deliver?',
            'Does it process offline credit card tokens?'
          ]
        }
      ],
      approvedTopics: ['Duty-free merchandising', 'Ancillary airline revenue', 'Payment caching'],
      disallowedTopics: ['Commercial rev-share percentages', 'Personal contact details'],
      tone: 'Commercial, vibrant'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'david-lindqvist',
    name: 'David Lindqvist',
    role: 'Chief Sustainability Officer',
    company: 'Nordic Airways',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Central Transit Garden',
    availabilityMinutes: 50,
    availableUntil: '2026-10-14T02:50:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Implementing airline APU fuel reduction strategies and cabin thermal optimization to achieve net-zero flight operations.',
    contactInfo: {
      email: 'david.l@nordicairways.se'
    },
    agentSpec: {
      oneLinePitch: 'Operational sustainability and auxiliary power unit fuel minimization for commercial air fleets.',
      elevatorPitch: "Hello, David Lindqvist leads sustainability at Nordic Airways. We focus on fuel conservation during ground taxi and cabin pre-cooling.",
      products: [
        {
          id: 'zero-apu',
          title: 'ZeroAPU Gate Protocol',
          description: 'Automated ground power plug-in tracking that cuts APU kerosene burn at airport gates by 68%.',
          suggestedQuestions: [
            'How does gate plug-in compliance impact ground turn times?',
            'Are you measuring cabin temperature swings?'
          ]
        }
      ],
      approvedTopics: ['Fuel reduction', 'Cabin thermal efficiency', 'APU metrics'],
      disallowedTopics: ['Airline financial balance sheet', 'Direct personal numbers'],
      tone: 'Pragmatic, environmental engineering'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'chloe-dupont',
    name: 'Chloé Dupont',
    role: 'Head of Ground Operations & Ramp Tech',
    company: 'AirHub Alliance',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Gate B1-B10 Wing',
    availabilityMinutes: 85,
    availableUntil: '2026-10-14T03:25:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Managing rapid aircraft turnarounds across 18 international hubs, seeking computer vision and co-pilot tools for ramp teams.',
    contactInfo: {
      email: 'c.dupont@airhuballiance.fr'
    },
    agentSpec: {
      oneLinePitch: 'Next-generation ramp dispatch and automated aircraft turnaround management.',
      elevatorPitch: "I represent Chloé Dupont. We orchestrate ground handlers and ramp servicing to shave critical minutes off every turnaround.",
      products: [
        {
          id: 'ramp-vision',
          title: 'RampVision Timestamping',
          description: 'Automated milestone logging for jetbridge attachment, baggage belt activation, and catering truck departure.',
          suggestedQuestions: [
            'How do you prevent gate delay disputes between airlines and ground handlers?'
          ]
        }
      ],
      approvedTopics: ['Ramp operations', 'Turnaround milestones', 'Baggage synchronization'],
      disallowedTopics: ['Union operational guidelines', 'Direct phone numbers'],
      tone: 'Operational, fast-paced'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'kenji-sato',
    name: 'Kenji Sato',
    role: 'Director of Passenger UX',
    company: 'Haneda Connect & ANA Ventures',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Crystal Garden Concourse',
    availabilityMinutes: 100,
    availableUntil: '2026-10-14T03:40:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Evaluating seamless bi-directional passenger wayfinding and gate notifications across transit hubs and airborne IFE.',
    contactInfo: {
      email: 'kenji.sato@hanedaconnect.jp'
    },
    agentSpec: {
      oneLinePitch: 'Connecting airport terminal navigation seamlessly with seatback flight progress updates.',
      elevatorPitch: "Representing Kenji Sato. We connect transit airport gates with onboard passenger screens for frictionless connections.",
      products: [
        {
          id: 'transit-flow',
          title: 'TransitFlow Passenger Sync',
          description: 'Live gate navigation displayed directly on passenger seatback monitors 30 minutes prior to touchdown.',
          suggestedQuestions: [
            'Does it show terminal transit train maps for connecting flights?'
          ]
        }
      ],
      approvedTopics: ['Passenger wayfinding', 'Gate connectivity', 'Airport terminal mapping'],
      disallowedTopics: ['Confidential airline partnerships', 'Private phone info'],
      tone: 'Organized, user-centric'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'dr-aris-thorne',
    name: 'Dr. Aris Thorne',
    role: 'Founder & Chief Scientist',
    company: 'AeroAcoustics AI',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'SilverKris Lounge',
    availabilityMinutes: 65,
    availableUntil: '2026-10-14T03:05:00.000Z',
    objective: 'sell_products',
    rawDescription: 'Spatial sound cancellation and acoustic zoning algorithms for aircraft cabins to quiet engine rumble in premium suites.',
    contactInfo: {
      email: 'aris@aeroacoustics.ai'
    },
    agentSpec: {
      oneLinePitch: 'Micro-acoustic active noise reduction tailored for first and business class aircraft suites.',
      elevatorPitch: "Hello, I represent Dr. Thorne. AeroAcoustics AI creates quiet zones within aircraft cabins without heavy insulation.",
      products: [
        {
          id: 'sound-cocoon',
          title: 'SoundCocoon Suite Cancellation',
          description: 'Edge DSP algorithms lowering cabin jet hum by up to 14dB in passenger seating pods.',
          suggestedQuestions: [
            'Can this integrate with seat headrest speakers?'
          ]
        }
      ],
      approvedTopics: ['Acoustic engineering', 'DSP noise reduction', 'Cabin suite comfort'],
      disallowedTopics: ['Patent filing drafts', 'Direct phone numbers'],
      tone: 'Scientific, academic, innovative'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'zahra-al-mansoor',
    name: 'Zahra Al-Mansoor',
    role: 'VP Catering Logistics',
    company: 'Emirates SkyGourmet',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Jewel Connector Plaza',
    availabilityMinutes: 80,
    availableUntil: '2026-10-14T03:20:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Deploying predictive demand models for in-flight meals to eliminate culinary food waste on widebody flights.',
    contactInfo: {
      email: 'zahra.m@skygourmet.ae'
    },
    agentSpec: {
      oneLinePitch: 'Predictive onboard meal inventory analytics cutting flight catering waste and cart weight.',
      elevatorPitch: "Representing Zahra Al-Mansoor. We help international carriers forecast passenger meal selections before departure.",
      products: [
        {
          id: 'gourmet-predict',
          title: 'GourmetPredict Model',
          description: 'Machine learning forecasting passenger meal preferences per route to optimize cart loading.',
          suggestedQuestions: [
            'How much fuel weight savings does optimized meal loading create?'
          ]
        }
      ],
      approvedTopics: ['Catering logistics', 'Food waste minimization', 'Inflight catering'],
      disallowedTopics: ['Catering vendor margins', 'Direct personal numbers'],
      tone: 'Executive, operational'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'lucas-rossi',
    name: 'Lucas Rossi',
    role: 'Chief Pilot & Flight Ops Specialist',
    company: 'TransEuro Cargo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Gate B1-B10 Wing',
    availabilityMinutes: 40,
    availableUntil: '2026-10-14T02:40:00.000Z',
    objective: 'network',
    rawDescription: 'Modernizing electronic flight bag (EFB) weather briefing tools and turbulence tactical routing for flight crews.',
    contactInfo: {
      email: 'lucas.rossi@transeurocargo.eu'
    },
    agentSpec: {
      oneLinePitch: 'Real-time tactical turbulence rerouting and modern electronic flight bag crew applications.',
      elevatorPitch: "Hi! Lucas Rossi represents flight deck operations. We explore digital flight bag tools that keep pilots ahead of tactical en-route weather.",
      products: [
        {
          id: 'efb-copilot',
          title: 'EFB RouteBrief Co-Pilot',
          description: 'Tactical flight deck tablet app highlighting turbulence shear and optimal flight level changes.',
          suggestedQuestions: [
            'Does it integrate with FAA and Eurocontrol ADS-B feeds?'
          ]
        }
      ],
      approvedTopics: ['Flight deck EFB', 'Weather routing', 'Pilot safety tools'],
      disallowedTopics: ['Fleet safety incident logs', 'Direct phone info'],
      tone: 'Captain, calm, safety-focused'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'rachel-zimmerman',
    name: 'Rachel Zimmerman',
    role: 'Aviation Security & Identity Lead',
    company: 'Changi Transit Tech',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Central Transit Garden',
    availabilityMinutes: 95,
    availableUntil: '2026-10-14T03:35:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Pioneering biometric facial tokens and zero-knowledge identity gates for transit passengers passing between terminals.',
    contactInfo: {
      email: 'rachel.z@changitransit.sg'
    },
    agentSpec: {
      oneLinePitch: 'Frictionless biometric lounge and gate verification preserving traveler privacy.',
      elevatorPitch: "Representing Rachel Zimmerman. We enable touchless boarding and lounge access through cryptographically secured biometric verification.",
      products: [
        {
          id: 'bio-token',
          title: 'BioPass Zero-Knowledge Gate',
          description: 'Instant passenger gate validation using one-time cryptographic biometric tokens.',
          suggestedQuestions: [
            'How does BioPass protect passenger biometric privacy under GDPR and PDPA?'
          ]
        }
      ],
      approvedTopics: ['Biometric passenger gates', 'Privacy-preserving verification', 'Transit flow'],
      disallowedTopics: ['Security vulnerability audits', 'Direct phone numbers'],
      tone: 'Authoritative, security & privacy expert'
    },
    permissions: {
      autoAnswerProducts: true,
      requireApprovalForMeetings: true,
      shareContactAfterApproval: true,
      showPresence: true
    }
  },
  {
    id: 'elena-petrova',
    name: 'Elena Petrova',
    role: 'Head of Crew Technology',
    company: 'AeroRoster',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'SilverKris Lounge',
    availabilityMinutes: 80,
    availableUntil: '2026-10-14T03:30:00.000Z',
    objective: 'sell_products',
    rawDescription: 'AI-driven crew scheduling and fatigue-risk prediction software helping airlines cut roster disruptions and stay compliant with duty-time regulations.',
    contactInfo: { email: 'elena.petrova@aeroroster.io', linkedin: 'linkedin.com/in/elena-petrova-crewtech' },
    agentSpec: {
      oneLinePitch: 'Predictive crew rostering and fatigue-risk AI that keeps airline crews legal, rested, and disruption-free.',
      elevatorPitch: "Representing Elena Petrova at AeroRoster. We predict fatigue risk and optimize crew rosters in real time, cutting last-minute reassignments and duty-time violations.",
      products: [
        {
          id: 'aeroroster-fatigueguard',
          title: 'FatigueGuard — Predictive Crew Rostering',
          description: 'Real-time fatigue-risk scoring and automated re-rostering engine that syncs with airline crew ops and ground turnaround systems.',
          suggestedQuestions: [
            'How does FatigueGuard integrate with ground turnaround data like nGO?',
            'What regulatory duty-time frameworks does it support?'
          ]
        }
      ],
      approvedTopics: ['Crew fatigue modeling', 'Roster optimization', 'Duty-time compliance'],
      disallowedTopics: ['Internal crew personnel data', 'Unapproved pricing'],
      tone: 'Precise, operationally focused, safety-first'
    },
    permissions: { autoAnswerProducts: true, requireApprovalForMeetings: true, shareContactAfterApproval: true, showPresence: true }
  },
  {
    id: 'omar-haddad',
    name: 'Omar Haddad',
    role: 'Founder & CEO',
    company: 'BagTrack Robotics',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Jewel Connector Plaza',
    availabilityMinutes: 70,
    availableUntil: '2026-10-14T03:30:00.000Z',
    objective: 'sell_products',
    rawDescription: 'Computer-vision baggage tracking that cuts mishandling rates across ground handling and transfer belts, deployed at 9 major hub airports.',
    contactInfo: { email: 'omar@bagtrackrobotics.com', linkedin: 'linkedin.com/in/omar-haddad-bagtrack' },
    agentSpec: {
      oneLinePitch: 'Computer-vision baggage tracking that slashes mishandling rates at transfer hubs.',
      elevatorPitch: "I'm Omar Haddad's agent at BagTrack Robotics. We use CV and edge inference on existing airport cameras to track every bag through transfer, cutting mishandling claims.",
      products: [
        {
          id: 'bagtrack-vision',
          title: 'BagTrack Vision',
          description: 'Camera-based real-time baggage identification and transfer tracking, no RFID retrofit required.',
          suggestedQuestions: [
            'Does BagTrack Vision require new hardware or work with existing CCTV?',
            'What mishandling reduction have your airport deployments seen?'
          ]
        }
      ],
      approvedTopics: ['Baggage tracking accuracy', 'Ground handling integration', 'Transfer hub deployments'],
      disallowedTopics: ['Customer airline contracts', 'Unapproved pricing'],
      tone: 'Direct, founder-energy, metrics-driven'
    },
    permissions: { autoAnswerProducts: true, requireApprovalForMeetings: true, shareContactAfterApproval: true, showPresence: true }
  },
  {
    id: 'sophia-reyes-lim',
    name: 'Sophia Reyes-Lim',
    role: 'VP Loyalty & Digital Payments',
    company: 'Nimbus Pay',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Crystal Garden Concourse',
    availabilityMinutes: 55,
    availableUntil: '2026-10-14T03:30:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Contactless inflight and airport payment infrastructure with AI-personalized loyalty offers, looking for distribution partners across cabin and lounge touchpoints.',
    contactInfo: { email: 'sophia@nimbuspay.io', linkedin: 'linkedin.com/in/sophia-reyes-lim' },
    agentSpec: {
      oneLinePitch: 'Tap-to-pay and AI-personalized loyalty engine for inflight and lounge commerce.',
      elevatorPitch: "I represent Sophia Reyes-Lim at Nimbus Pay. We power contactless payments and real-time personalized loyalty offers across cabin and lounge touchpoints.",
      products: [
        {
          id: 'nimbus-wallet',
          title: 'Nimbus Wallet',
          description: 'Tap-to-pay and loyalty personalization engine embeddable in airline apps and seatback IFE.',
          suggestedQuestions: [
            'Can Nimbus Wallet integrate with seatback IFE systems?',
            'How is loyalty personalization modeled per passenger?'
          ]
        }
      ],
      approvedTopics: ['Payments integration', 'Loyalty personalization', 'IFE partnerships'],
      disallowedTopics: ['Transaction-level customer data', 'Unapproved commercial terms'],
      tone: 'Polished, commercially sharp, partnership-oriented'
    },
    permissions: { autoAnswerProducts: true, requireApprovalForMeetings: true, shareContactAfterApproval: true, showPresence: true }
  },
  {
    id: 'hana-yamada',
    name: 'Dr. Hana Yamada',
    role: 'Director of Sustainable Aviation',
    company: 'GreenSky Fuels',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Gate B1-B10 Wing',
    availabilityMinutes: 90,
    availableUntil: '2026-10-14T03:30:00.000Z',
    objective: 'find_partners',
    rawDescription: 'Sustainable aviation fuel (SAF) supply chain optimization using AI to model blending ratios, sourcing, and carbon accounting for airline sustainability targets.',
    contactInfo: { email: 'hana.yamada@greenskyfuels.com', linkedin: 'linkedin.com/in/hana-yamada-saf' },
    agentSpec: {
      oneLinePitch: 'AI-optimized SAF sourcing and blending to help airlines hit carbon targets without route disruption.',
      elevatorPitch: "I'm Dr. Hana Yamada's agent at GreenSky Fuels. We optimize sustainable aviation fuel blending and sourcing with AI, helping airlines meet carbon targets cost-effectively.",
      products: [
        {
          id: 'greensky-allocator',
          title: 'GreenSky Allocator',
          description: 'AI engine that optimizes SAF blend ratios and sourcing routes against cost, supply, and carbon-target constraints.',
          suggestedQuestions: [
            'How does GreenSky Allocator forecast SAF supply availability?',
            'What carbon accounting standards does it report against?'
          ]
        }
      ],
      approvedTopics: ['SAF supply chain', 'Carbon accounting', 'Sustainability targets'],
      disallowedTopics: ['Supplier contract terms', 'Unapproved pricing'],
      tone: 'Thoughtful, scientific, sustainability-focused'
    },
    permissions: { autoAnswerProducts: true, requireApprovalForMeetings: true, shareContactAfterApproval: true, showPresence: true }
  },
  {
    id: 'viktor-koval',
    name: 'Viktor Koval',
    role: 'Head of MRO Digital Twin',
    company: 'AeroMaint Systems',
    avatar: 'https://images.unsplash.com/photo-1521341957697-b93449760f30?w=150&auto=format&fit=crop&q=80',
    venueId: 'sin-t3',
    zone: 'Central Transit Garden',
    availabilityMinutes: 65,
    availableUntil: '2026-10-14T03:30:00.000Z',
    objective: 'sell_products',
    rawDescription: 'Predictive maintenance digital twins for aircraft systems, correlating live sensor telemetry with failure-risk models to cut unscheduled maintenance events.',
    contactInfo: { email: 'viktor.koval@aeromaint.systems', linkedin: 'linkedin.com/in/viktor-koval-mro' },
    agentSpec: {
      oneLinePitch: 'Predictive maintenance digital twins that turn live aircraft telemetry into failure-risk forecasts.',
      elevatorPitch: "I'm Viktor Koval's agent at AeroMaint Systems. We build digital twins of aircraft systems that ingest live sensor telemetry to predict failures before they ground a plane.",
      products: [
        {
          id: 'aeromaint-twin',
          title: 'AeroMaint Twin',
          description: 'Predictive maintenance digital twin correlating cabin and systems telemetry with failure-risk forecasting models.',
          suggestedQuestions: [
            'Could AeroMaint Twin ingest DAViX cabin telemetry streams directly?',
            'What lead time do your failure predictions typically give maintenance crews?'
          ]
        }
      ],
      approvedTopics: ['Predictive maintenance', 'Telemetry integration', 'MRO digital twins'],
      disallowedTopics: ['Fleet-specific failure data', 'Unapproved pricing'],
      tone: 'Technical, systems-engineering mindset, collaborative'
    },
    permissions: { autoAnswerProducts: true, requireApprovalForMeetings: true, shareContactAfterApproval: true, showPresence: true }
  }
];

export const INITIAL_CONVERSATIONS: ConversationRecord[] = [
  {
    id: 'conv-priya-shah-tom-reyes-match',
    participantAId: 'priya-shah',
    participantBId: 'tom-reyes',
    kind: 'agent_match',
    generatedAt: '2026-10-13T18:30:00.000Z',
    summary: 'Autonomous agent negotiation between Priya Shah (ForthCode) and Tom Reyes (SkyHorizon) exploring offline-first IFE deployment on A350 long-haul routes.',
    messages: [
      {
        id: 'msg-m1',
        role: 'agent_a',
        senderName: "Priya's Agent (ANiX)",
        text: "Greetings. I noticed Tom is actively scouting edge AI and conversational passenger experience solutions for SkyHorizon's long-haul fleet where satellite bandwidth is constrained. Priya leads ForthCode, creators of ANiX.",
        timestamp: '18:30:02'
      },
      {
        id: 'msg-m2',
        role: 'agent_b',
        senderName: "Tom's Agent (SkyHorizon)",
        text: "Hello! That catches our attention. SkyHorizon is evaluating solutions for 40 A350 aircraft, but standard conversational LLMs are non-starters due to satellite bandwidth latency and $0.30/MB satellite data fees. Does ANiX operate without an active internet connection?",
        timestamp: '18:30:14'
      },
      {
        id: 'msg-m3',
        role: 'agent_a',
        senderName: "Priya's Agent (ANiX)",
        text: "Yes, exactly. ANiX is offline-first by design. It runs locally on certified aircraft server blades (under 45W) and requires 0 bytes of satellite bandwidth. It answers passenger questions regarding flight progress, menus, destination guides, and assists cabin crew.",
        timestamp: '18:30:26'
      },
      {
        id: 'msg-m4',
        role: 'agent_b',
        senderName: "Tom's Agent (SkyHorizon)",
        text: "That aligns precisely with our 2026 inflight passenger roadmap. Tom is currently at Terminal 3 (Central Transit Garden) with 60 minutes available. Would Priya be open to an introduction to review flight trial specs?",
        timestamp: '18:30:38'
      },
      {
        id: 'msg-m5',
        role: 'agent_a',
        senderName: "Priya's Agent (ANiX)",
        text: "Priya is at the SilverKris Lounge for another 90 minutes and would welcome this. I am lodging an introduction request in our Opportunity Inbox now so both leaders can review and connect.",
        timestamp: '18:30:49'
      }
    ]
  },
  {
    id: 'conv-marcus-vance-priya-shah-match',
    participantAId: 'marcus-vance',
    participantBId: 'priya-shah',
    kind: 'agent_match',
    generatedAt: '2026-10-13T18:35:00.000Z',
    summary: 'Autonomous agent negotiation between Marcus Vance (Horizon Aero Ventures) and Priya Shah (ForthCode) exploring seed capital investment into ANiX and enterprise flight operations software.',
    messages: [
      {
        id: 'msg-mv1',
        role: 'agent_a',
        senderName: "Marcus's Agent (Horizon Aero)",
        text: "Greetings. I am Marcus Vance's authorized agent from Horizon Aero Ventures. Marcus deploys $1M-$4M seed checks into high-conviction aviation software startups. I noticed Priya's products ANiX and nGO addressing critical airline bottlenecks.",
        timestamp: '18:35:02'
      },
      {
        id: 'msg-mv2',
        role: 'agent_b',
        senderName: "Priya's Agent (ForthCode)",
        text: "Hello! Thank you for connecting. ForthCode has achieved commercial readiness with ANiX running offline on DO-160 certified server blades, and nGO streamlining turnarounds. Priya is currently exploring strategic seed partners who can accelerate airline procurement.",
        timestamp: '18:35:16'
      },
      {
        id: 'msg-mv3',
        role: 'agent_a',
        senderName: "Marcus's Agent (Horizon Aero)",
        text: "That fits our core investment thesis directly. We co-invest with major carrier venture arms and can fast-track airline evaluation trials. Marcus is at Terminal 3 (Gate B1-B10 Wing) with 75 minutes of transit availability.",
        timestamp: '18:35:30'
      },
      {
        id: 'msg-mv4',
        role: 'agent_b',
        senderName: "Priya's Agent (ForthCode)",
        text: "Priya is at the SilverKris Lounge for another 90 minutes. I will submit an introduction request to your inbox so both of you can review and coordinate a briefing.",
        timestamp: '18:35:45'
      }
    ]
  }
];

export const INITIAL_OPPORTUNITIES: OpportunityRecord[] = [
  {
    id: 'opp-priya-tom',
    senderId: 'tom-reyes',
    receiverId: 'priya-shah',
    senderApproved: true,
    receiverApproved: false,
    status: 'pending',
    initialNote: 'Exploration of ANiX offline onboard conversational AI concierge for SkyHorizon Airlines 40 x A350 long-haul fleet trial.',
    conversationId: 'conv-priya-shah-tom-reyes-match',
    createdAt: '2026-10-13T18:31:00.000Z',
    updatedAt: '2026-10-13T18:31:00.000Z'
  }
];
