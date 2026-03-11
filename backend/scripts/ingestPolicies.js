import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pc.Index(process.env.PINECONE_INDEX_NAME);

// Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001"
});

// ─────────────────────────────────────────────────────────────────
//  KNOWLEDGE BASE — Wanderlust Tours
//  Each document = one focused topic chunk for precise RAG retrieval
// ─────────────────────────────────────────────────────────────────
const documents = [

  // ── CANCELLATION ──────────────────────────────────────────────
  {
    id: "cancel-policy-full",
    text: "Users can cancel bookings up to 48 hours before departure for a full refund. Cancellations made 30 to 59 days before departure receive a 50% refund. Cancellations within 30 days of departure are non-refundable, but the booking can be rescheduled within 12 months at no extra charge.",
    metadata: { category: "cancellation", title: "Cancellation Policy" }
  },
  {
    id: "cancel-emergency",
    text: "In case of a medical emergency, customers can cancel at any time and receive a full travel credit valid for 18 months. Documentation such as a doctor's certificate or hospital record is required to process the emergency cancellation.",
    metadata: { category: "cancellation", title: "Emergency Cancellation" }
  },
  {
    id: "cancel-force-majeure",
    text: "If a tour is cancelled due to force majeure events such as natural disasters, government travel bans, pandemics, or war, customers are entitled to a full refund or a free rebooking to an equivalent tour within 24 months.",
    metadata: { category: "cancellation", title: "Force Majeure Cancellation" }
  },

  // ── REFUND ────────────────────────────────────────────────────
  {
    id: "refund-policy",
    text: "Refunds are processed within 7 to 10 business days after the cancellation is confirmed. Refunds are returned to the original payment method. Credit card refunds may take an additional 3 to 5 business days to appear depending on the card issuer.",
    metadata: { category: "refund", title: "Refund Policy" }
  },
  {
    id: "refund-partial",
    text: "Partial refunds apply when cancellation is made 30 to 59 days before departure. In this case, 50% of the total booking amount is refunded. The remaining 50% is retained as a cancellation fee and cannot be converted to credit.",
    metadata: { category: "refund", title: "Partial Refund Policy" }
  },
  {
    id: "refund-non-refundable",
    text: "Certain add-ons are non-refundable regardless of the cancellation date. These include visa processing fees, travel insurance premiums, show tickets, and optional excursions purchased separately. These charges will not be returned under any cancellation scenario.",
    metadata: { category: "refund", title: "Non-Refundable Items" }
  },

  // ── BOOKING ───────────────────────────────────────────────────
  {
    id: "booking-how-to",
    text: "Tours can be booked online through our website, via the Wanderlust Tours mobile app, or by calling our booking hotline at +1-800-WANDER. All bookings require a valid passport, traveler details, and a 30% deposit to confirm the reservation.",
    metadata: { category: "booking", title: "How to Book" }
  },
  {
    id: "booking-deposit",
    text: "A 30% deposit is required at the time of booking to secure your spot. The remaining 70% balance is due 45 days before the departure date. If full payment is not received by the due date, the booking may be automatically cancelled and the deposit forfeited.",
    metadata: { category: "booking", title: "Deposit & Payment Schedule" }
  },
  {
    id: "booking-confirmation",
    text: "After booking is confirmed, you will receive a confirmation email within 24 hours containing your booking reference number, full itinerary, hotel details, and a pre-departure checklist. If you do not receive a confirmation email, check your spam folder or contact support.",
    metadata: { category: "booking", title: "Booking Confirmation" }
  },
  {
    id: "booking-modification",
    text: "Booking modifications such as changing travel dates, upgrading accommodation, or adding travelers can be made up to 30 days before departure. Modifications are subject to availability and may incur a change fee of $50 per traveler. Name corrections are free within 48 hours of booking.",
    metadata: { category: "booking", title: "Booking Modifications" }
  },
  {
    id: "booking-group",
    text: "Group bookings for 8 or more travelers receive an automatic 10% discount on the total package price. Groups of 15 or more are eligible for a dedicated group coordinator and a customized itinerary. Group bookings must be confirmed at least 60 days in advance.",
    metadata: { category: "booking", title: "Group Bookings" }
  },

  // ── PRICING & DISCOUNTS ───────────────────────────────────────
  {
    id: "pricing-early-bird",
    text: "Early bird discount of 15% is available for bookings made 90 or more days before the departure date. The discount is automatically applied at checkout and cannot be combined with other promotional offers.",
    metadata: { category: "pricing", title: "Early Bird Discount" }
  },
  {
    id: "pricing-last-minute",
    text: "Last-minute deals offering up to 20% off are available for tours departing within 14 days. These deals are limited to available seats only and cannot be combined with group discounts or early bird rates.",
    metadata: { category: "pricing", title: "Last Minute Deals" }
  },
  {
    id: "pricing-price-match",
    text: "We offer a price-match guarantee. If you find the same tour package at a lower price from a verified competitor within 48 hours of booking, we will match that price. Submit proof of the competing offer to support@wanderlusttours.com.",
    metadata: { category: "pricing", title: "Price Match Guarantee" }
  },
  {
    id: "pricing-installment",
    text: "Installment payment plans are available for tour packages priced above $2,000. Customers can split the total into 3 monthly payments with zero interest. The first installment of 30% is due at booking, followed by two equal payments in subsequent months.",
    metadata: { category: "pricing", title: "Installment Payment Plan" }
  },
  {
    id: "pricing-payment-methods",
    text: "We accept Visa, Mastercard, American Express, PayPal, and direct bank transfers. All transactions are secured with 256-bit SSL encryption. We do not store full card details on our servers. Bank transfer payments must be made at least 5 business days before the balance due date.",
    metadata: { category: "pricing", title: "Accepted Payment Methods" }
  },

  // ── DESTINATIONS ──────────────────────────────────────────────
  {
    id: "destinations-overview",
    text: "Wanderlust Tours offers travel packages to over 50 destinations across six continents including Europe, Asia, the Americas, the Middle East, Africa, and Oceania. Popular destinations include Bali, Paris, Santorini, Maldives, Dubai, Tokyo, New York, Cape Town, Machu Picchu, and the Amalfi Coast.",
    metadata: { category: "destinations", title: "Destinations Overview" }
  },
  {
    id: "destinations-bali",
    text: "Our Bali tours include visits to Ubud rice terraces, Tanah Lot temple, Seminyak Beach, and the Sacred Monkey Forest. Packages range from 5-night to 10-night stays. Cultural cooking classes, spa experiences, and volcano treks are available as optional add-ons.",
    metadata: { category: "destinations", title: "Bali Tours" }
  },
  {
    id: "destinations-europe",
    text: "European tour packages cover iconic cities including Paris, Rome, Barcelona, Amsterdam, Prague, and Santorini. Multi-city packages connect 3 to 5 destinations with included inter-city rail or flights. Packages typically range from 8 to 14 nights.",
    metadata: { category: "destinations", title: "Europe Tours" }
  },
  {
    id: "destinations-dubai",
    text: "Dubai tours include desert safari experiences, Burj Khalifa visits, Dubai Mall, Palm Jumeirah, and dhow cruises. Luxury packages include 5-star hotel stays and private transfers. Packages range from 4-night city breaks to 7-night full experience tours.",
    metadata: { category: "destinations", title: "Dubai Tours" }
  },
  {
    id: "destinations-maldives",
    text: "Maldives packages include overwater bungalow stays, snorkeling and diving, sunset cruises, and dolphin watching tours. Most resorts operate on an all-inclusive or half-board basis. Packages range from 5 to 10 nights and include speedboat or seaplane transfers from Malé.",
    metadata: { category: "destinations", title: "Maldives Tours" }
  },
  {
    id: "destinations-japan",
    text: "Japan tour packages cover Tokyo, Kyoto, Osaka, Hiroshima, and Nara. Highlights include Mount Fuji, Fushimi Inari Shrine, Arashiyama bamboo grove, and Dotonbori street food. Cultural experiences such as tea ceremonies and kimono rentals are available. Packages range from 8 to 14 nights.",
    metadata: { category: "destinations", title: "Japan Tours" }
  },
  {
    id: "destinations-custom",
    text: "Custom private tours are available for groups of 4 or more travelers. Customers can choose specific destinations, accommodation categories, activities, and travel pace. Custom itineraries are built by our travel experts within 3 business days of inquiry submission.",
    metadata: { category: "destinations", title: "Custom Private Tours" }
  },

  // ── PACKAGES & INCLUSIONS ─────────────────────────────────────
  {
    id: "packages-types",
    text: "Wanderlust Tours offers four package types: Day Tours for single-day experiences, Weekend Getaways for 2 to 3 nights, Week-long Journeys for 5 to 7 nights, and Extended Expeditions for 10 to 21 nights. All packages are available in Standard, Premium, and Luxury tiers.",
    metadata: { category: "packages", title: "Package Types" }
  },
  {
    id: "packages-inclusions",
    text: "All tour packages include hotel accommodation, daily breakfast, airport transfers on arrival and departure, a professional English-speaking tour guide, entrance fees to all listed attractions, and basic travel insurance. Premium and Luxury packages additionally include some lunches, dinners, and exclusive experiences.",
    metadata: { category: "packages", title: "What's Included" }
  },
  {
    id: "packages-exclusions",
    text: "Items not included in tour packages are international flights unless specified, lunch and dinner unless listed in the itinerary, personal shopping expenses, optional excursions and activities, visa fees, gratuities for guides and drivers, and travel insurance upgrades.",
    metadata: { category: "packages", title: "What's Not Included" }
  },
  {
    id: "packages-solo",
    text: "Solo traveler packages are available for all destinations. Solo travelers are paired with small groups of up to 12 people. A single supplement fee applies for private room accommodation. Solo-only departures are scheduled quarterly for popular destinations like Bali, Japan, and Europe.",
    metadata: { category: "packages", title: "Solo Traveler Packages" }
  },

  // ── ACCOMMODATION ─────────────────────────────────────────────
  {
    id: "accommodation-tiers",
    text: "Standard packages include 3-star hotel accommodation. Premium packages include 4-star hotels. Luxury packages include 5-star hotels and resorts. Room types are twin share by default. Single supplement is available at an additional 25% of the package price. Double or couple rooms are available upon request.",
    metadata: { category: "accommodation", title: "Accommodation Tiers" }
  },
  {
    id: "accommodation-requests",
    text: "Special accommodation requests including dietary requirements, accessibility needs, bed type preferences, connecting rooms for families, or allergy-free rooms can be noted at the time of booking. These requests are passed to the hotel but cannot be guaranteed and are subject to availability.",
    metadata: { category: "accommodation", title: "Special Accommodation Requests" }
  },
  {
    id: "accommodation-checkin",
    text: "Standard hotel check-in time is 2:00 PM and check-out is 12:00 PM. Early check-in and late check-out can be requested directly with the hotel and may incur additional charges. Our tour coordinators will provide hotel contact details in your pre-departure pack.",
    metadata: { category: "accommodation", title: "Check-in & Check-out" }
  },

  // ── TRANSPORT ─────────────────────────────────────────────────
  {
    id: "transport-included",
    text: "All packages include airport pickup and drop-off transfers in private air-conditioned vehicles. Internal transport between destinations uses private coaches, domestic flights where applicable, or boat and ferry transfers for island destinations. All vehicles are insured and driven by licensed local drivers.",
    metadata: { category: "transport", title: "Included Transport" }
  },
  {
    id: "transport-flights",
    text: "International flights are not included in standard tour packages unless explicitly stated. Our booking team can arrange international flights at an additional cost. We partner with major airlines to offer competitive fares. Flight-inclusive packages are available for select routes and departure cities.",
    metadata: { category: "transport", title: "International Flights" }
  },

  // ── VISA & TRAVEL REQUIREMENTS ────────────────────────────────
  {
    id: "visa-assistance",
    text: "Wanderlust Tours provides visa application assistance for all destinations we serve. Our visa support team will guide you through the required documents, application forms, and submission process. Visa processing typically takes 2 to 6 weeks depending on the destination country and the applicant's nationality.",
    metadata: { category: "visa", title: "Visa Assistance" }
  },
  {
    id: "visa-passport",
    text: "All travelers must hold a passport that is valid for at least 6 months beyond the intended return date. Some destinations require a minimum of 2 blank passport pages. It is the traveler's responsibility to ensure their passport meets these requirements before departure.",
    metadata: { category: "visa", title: "Passport Requirements" }
  },
  {
    id: "visa-health",
    text: "Health and vaccination requirements vary by destination. Upon booking confirmation, customers receive a destination-specific health advisory that lists any mandatory or recommended vaccinations, malaria prophylaxis, or health certificates required by the destination country.",
    metadata: { category: "visa", title: "Health & Vaccination Requirements" }
  },

  // ── TRAVEL INSURANCE ──────────────────────────────────────────
  {
    id: "insurance-basic",
    text: "Basic travel insurance is included in all tour packages at no extra cost. It covers emergency medical treatment up to $50,000, trip interruption due to medical emergency, and loss of checked baggage up to $1,000. Pre-existing conditions are not covered under the basic plan.",
    metadata: { category: "insurance", title: "Basic Travel Insurance" }
  },
  {
    id: "insurance-comprehensive",
    text: "A comprehensive travel insurance upgrade is available at $12 per person per day. It covers trip cancellation for any reason, medical evacuation up to $500,000, lost or stolen personal items up to $3,000, flight delays, and pre-existing medical conditions with prior declaration.",
    metadata: { category: "insurance", title: "Comprehensive Insurance Upgrade" }
  },

  // ── SUPPORT ───────────────────────────────────────────────────
  {
    id: "support-channels",
    text: "Customer support is available 24 hours a day, 7 days a week via live chat on our website, WhatsApp at +1-800-WANDER, and email at support@wanderlusttours.com. Phone support is available Monday to Friday from 9 AM to 6 PM EST. Email inquiries are responded to within 24 hours on business days.",
    metadata: { category: "support", title: "Support Channels" }
  },
  {
    id: "support-coordinator",
    text: "Upon receiving full payment, each booking is assigned a dedicated tour coordinator who serves as the primary point of contact for all pre-departure questions, logistics, and special arrangements. The coordinator's contact details are included in the final booking confirmation email.",
    metadata: { category: "support", title: "Dedicated Tour Coordinator" }
  },
  {
    id: "support-in-destination",
    text: "An emergency in-destination helpline number is provided in the welcome pack upon arrival. A local tour representative is available at all times to assist with any issues during the tour including accommodation problems, medical referrals, or itinerary changes.",
    metadata: { category: "support", title: "In-Destination Support" }
  },
  {
    id: "support-complaints",
    text: "Formal complaints can be submitted within 28 days of the tour end date via email to complaints@wanderlusttours.com. All complaints are acknowledged within 48 hours and fully investigated within 14 business days. Compensation or credit may be offered where a service failure is confirmed.",
    metadata: { category: "support", title: "Complaints & Feedback" }
  }

];

// ─────────────────────────────────────────────────────────────────
//  EMBEDDING + UPSERT
// ─────────────────────────────────────────────────────────────────
async function getEmbedding(text) {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768
  });
  return result.embedding.values;
}

async function ingest() {
  console.log(`Starting ingestion of ${documents.length} documents...\n`);

  const vectors = [];

  for (const doc of documents) {
    try {
      const values = await getEmbedding(doc.text);
      console.log(`✓ Embedded [${doc.id}] — ${values.length} dims`);

      vectors.push({
        id: doc.id,
        values,
        metadata: {
          text: doc.text,
          ...doc.metadata
        }
      });

    } catch (err) {
      console.error(`✗ Embedding failed for [${doc.id}]`, err.message);
    }
  }

  if (vectors.length === 0) {
    console.error("\nNo vectors generated. Aborting upsert.");
    return;
  }

  // Upsert in batches of 10 to avoid payload limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.upsert({ records: batch });
    console.log(`\nUpserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} vectors)`);
  }

  console.log(`\n✅ Ingestion complete — ${vectors.length}/${documents.length} documents indexed.`);
}

ingest();