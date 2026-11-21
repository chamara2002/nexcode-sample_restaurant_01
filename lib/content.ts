// ─────────────────────────────────────────────────────────────
//  ALL EDITABLE RESTAURANT CONTENT LIVES IN THIS FILE.
//  Change the name, WhatsApp number, menu, prices and hours here.
//  Every text has an English (en) and Sinhala (si) version.
//  NOTE: Sinhala copy is a first draft — ask the client to proofread.
// ─────────────────────────────────────────────────────────────

export type L = { en: string; si: string };

export const site = {
  name: { en: "Pahana", si: "පහන" } as L,
  descriptor: { en: "Sri Lankan kitchen", si: "ශ්‍රී ලාංකීය මුළුතැන්ගෙය" } as L,

  // International format, digits only, no "+" or spaces. 94 = Sri Lanka.
  whatsappNumber: "94770000000",
  phoneDisplay: "+94 77 000 0000",

  address: {
    en: "No. 12, Temple Road, Kandy",
    si: "අංක 12, පන්සල් පාර, මහනුවර",
  } as L,
  mapsQuery: "Temple Road Kandy Sri Lanka",

  hours: [
    { days: { en: "Tuesday to Sunday", si: "අඟහරුවාදා සිට ඉරිදා දක්වා" }, time: "11:30 – 22:00" },
    { days: { en: "Monday", si: "සඳුදා" }, time: { en: "Closed", si: "වසා ඇත" } },
  ],

  // Booking time slots shown in the form
  bookingSlots: ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"],
  maxGuests: 20,

  social: [
    { label: "Facebook", href: "https://facebook.com/" },
    { label: "Instagram", href: "https://instagram.com/" },
  ],
};

// The scroll story. One chapter per screen, in order.
// `word` is the large Sinhala word drawn behind each chapter.
export const chapters: { id: string; word: string; title: L; body: L }[] = [
  {
    id: "lamp",
    word: "පහන",
    title: { en: "Pahana", si: "පහන" },
    body: {
      en: "A Sri Lankan kitchen lit by a single flame.",
      si: "එක් පහන් දැල්ලකින් ආලෝකමත් වූ ශ්‍රී ලාංකීය මුළුතැන්ගෙයක්.",
    },
  },
  {
    id: "flame",
    word: "දැල්ල",
    title: { en: "Someone lights the lamp", si: "කවුරුහරි පහන දල්වයි" },
    body: {
      en: "Every evening here starts the way village dinners always did. Follow the flame.",
      si: "මෙහි සෑම සන්ධ්‍යාවක්ම ඇරඹෙන්නේ ගමේ රාත්‍රී භෝජනය ඇරඹුණු ආකාරයටමයි. දැල්ල පසුපස යන්න.",
    },
  },
  {
    id: "spices",
    word: "කුළුබඩු",
    title: { en: "Through the spice air", si: "කුළුබඩු සුවඳ මැදින්" },
    body: {
      en: "Cinnamon from Matale, pepper from the hills and curry leaves picked that morning.",
      si: "මාතලේ කුරුඳු, කඳුකරයේ ගම්මිරිස් සහ එදා උදේ කැඩූ කරපිංචා.",
    },
  },
  {
    id: "hearth",
    word: "ලිප",
    title: { en: "Three stones and firewood", si: "ලිප් ගල් තුනක් සහ දර" },
    body: {
      en: "We still cook on a wood fire, in clay pots, the slow way.",
      si: "අපි තවමත් දර ලිපේ, මැටි හට්ටිවල, සෙමින් උයන්නෙමු.",
    },
  },
  {
    id: "pot",
    word: "හට්ටිය",
    title: { en: "Inside the pot", si: "හට්ටිය ඇතුළත" },
    body: {
      en: "Roasted curry powder, thick coconut milk and time.",
      si: "බැදපු තුනපහ, මිටි පොල් කිරි සහ කාලය.",
    },
  },
  {
    id: "leaf",
    word: "බත්",
    title: { en: "Served on banana leaf", si: "කෙසෙල් කොළයේ බෙදා" },
    body: {
      en: "Rice with five curries, shared the way it is at home.",
      si: "ව්‍යංජන පහක් සමඟ බත්, ගෙදර බෙදාගන්නා විදියටම.",
    },
  },
  {
    id: "table",
    word: "මේසය",
    title: { en: "Your table is ready", si: "ඔබේ මේසය සූදානම්" },
    body: {
      en: "The lamp is already lit. Book on WhatsApp and we'll keep it burning for you.",
      si: "පහන දැනටමත් දල්වා ඇත. WhatsApp හරහා වෙන් කරන්න.",
    },
  },
];

export const menu: {
  section: L;
  items: { name: L; desc: L; price: number; veg?: boolean }[];
}[] = [
  {
    section: { en: "Rice and curry", si: "බත් සහ ව්‍යංජන" },
    items: [
      {
        name: { en: "Village chicken rice and curry", si: "ගම් කුකුළු මස් බත් සහ ව්‍යංජන" },
        desc: { en: "Red rice, clay-pot chicken, dhal, gotukola sambol, papadam", si: "රතු කැකුළු බත්, හට්ටියේ කුකුළු මස්, පරිප්පු, ගොටුකොළ සම්බෝල, පපඩම්" },
        price: 1650,
      },
      {
        name: { en: "Vegetable rice and curry", si: "එළවළු බත් සහ ව්‍යංජන" },
        desc: { en: "Five seasonal curries, pol sambol, fried chilli", si: "සෘතුමය ව්‍යංජන පහක්, පොල් සම්බෝල, බැදපු මිරිස්" },
        price: 1250,
        veg: true,
      },
      {
        name: { en: "Lamprais", si: "ලම්ප්‍රයිස්" },
        desc: { en: "Baked in banana leaf with frikkadels and blachan", si: "ෆ්‍රිකඩෙල් සහ බ්ලචන් සමඟ කෙසෙල් කොළයේ පුළුස්සා" },
        price: 2100,
      },
    ],
  },
  {
    section: { en: "From the hopper pan", si: "ආප්ප තාච්චියෙන්" },
    items: [
      {
        name: { en: "Egg hoppers (2)", si: "බිත්තර ආප්ප (2)" },
        desc: { en: "With lunu miris and seeni sambol", si: "ලුණු මිරිස් සහ සීනි සම්බෝල සමඟ" },
        price: 650,
        veg: true,
      },
      {
        name: { en: "String hoppers with kiri hodi", si: "ඉඳිආප්ප සහ කිරි හොදි" },
        desc: { en: "Fifteen string hoppers, coconut milk gravy, pol sambol", si: "ඉඳිආප්ප පහළොවක්, කිරි හොදි, පොල් සම්බෝල" },
        price: 750,
        veg: true,
      },
      {
        name: { en: "Chicken kottu", si: "කුකුළු මස් කොත්තු" },
        desc: { en: "Chopped godamba roti, curry gravy, leeks", si: "කපන ලද ගෝදම්බා රොටි, හොද්ද, ලීක්ස්" },
        price: 1400,
      },
    ],
  },
  {
    section: { en: "Sweets and drinks", si: "අතුරුපස සහ බීම" },
    items: [
      {
        name: { en: "Watalappan", si: "වටලප්පන්" },
        desc: { en: "Kithul jaggery and coconut custard, cardamom", si: "කිතුල් හකුරු සහ පොල් කිරි, එනසාල්" },
        price: 550,
        veg: true,
      },
      {
        name: { en: "Curd and kithul treacle", si: "මී කිරි සහ කිතුල් පැණි" },
        desc: { en: "Buffalo curd in a clay pot", si: "මැටි හට්ටියක මී කිරි" },
        price: 600,
        veg: true,
      },
      {
        name: { en: "Ginger plain tea", si: "ඉඟුරු පිළිකුල් තේ" },
        desc: { en: "Up-country tea with ginger and jaggery", si: "උඩරට තේ, ඉඟුරු සහ හකුරු සමඟ" },
        price: 250,
        veg: true,
      },
    ],
  },
];

// Small interface strings
export const ui = {
  nav: {
    menu: { en: "Menu", si: "ආහාර" },
    book: { en: "Book", si: "වෙන් කරන්න" },
    visit: { en: "Find us", si: "අප සොයන්න" },
  },
  bookTable: { en: "Book a table", si: "මේසයක් වෙන් කරන්න" },
  scrollHint: { en: "Scroll to follow the flame", si: "දැල්ල පසුපස යාමට පහළට යන්න" },
  menuTitle: { en: "Menu", si: "ආහාර ලැයිස්තුව" },
  menuNote: { en: "Prices in rupees. Vegetarian dishes are marked with a leaf.", si: "මිල රුපියල් වලින්. නිර්මාංශ ආහාර කොළ ලකුණින් දක්වා ඇත." },
  orderWhatsApp: { en: "Order takeaway on WhatsApp", si: "WhatsApp හරහා ඇණවුම් කරන්න" },
  booking: {
    title: { en: "Book a table", si: "මේසයක් වෙන් කරන්න" },
    intro: {
      en: "Fill this in and WhatsApp opens with your booking already typed. We confirm every table in the chat.",
      si: "මෙය පුරවන්න. ඔබේ වෙන් කිරීම ලියූ WhatsApp පණිවිඩයක් විවෘත වේ. අපි චැට් එකේදී තහවුරු කරන්නෙමු.",
    },
    name: { en: "Your name", si: "ඔබේ නම" },
    date: { en: "Date", si: "දිනය" },
    time: { en: "Time", si: "වේලාව" },
    guests: { en: "Guests", si: "අමුත්තන්" },
    occasion: { en: "Occasion (optional)", si: "අවස්ථාව (අවශ්‍ය නම්)" },
    occasions: [
      { en: "None", si: "නැත" },
      { en: "Birthday", si: "උපන්දිනය" },
      { en: "Anniversary", si: "සංවත්සරය" },
      { en: "Family gathering", si: "පවුලේ හමුවක්" },
      { en: "Business", si: "ව්‍යාපාරික" },
    ],
    note: { en: "Anything we should know? (optional)", si: "අප දැනගත යුතු දෙයක්? (අවශ්‍ය නම්)" },
    send: { en: "Send booking on WhatsApp", si: "WhatsApp හරහා යවන්න" },
    errName: { en: "Add your name so we know who the table is for.", si: "මේසය කා සඳහාදැයි දැනගැනීමට ඔබේ නම ඇතුළත් කරන්න." },
    errDate: { en: "Pick a date from today onwards.", si: "අද හෝ ඉදිරි දිනයක් තෝරන්න." },
    msgHeader: { en: "Table booking request", si: "මේස වෙන් කිරීමේ ඉල්ලීම" },
    sent: { en: "WhatsApp opened in a new tab. Press send there to finish your booking.", si: "WhatsApp නව ටැබයක විවෘත විය. වෙන් කිරීම අවසන් කිරීමට එහි send ඔබන්න." },
  },
  visit: {
    title: { en: "Find us", si: "අප සොයන්න" },
    address: { en: "Address", si: "ලිපිනය" },
    hours: { en: "Opening hours", si: "විවෘත වේලාවන්" },
    contact: { en: "Contact", si: "සම්බන්ධ වන්න" },
    directions: { en: "Open in Google Maps", si: "Google Maps හි විවෘත කරන්න" },
  },
  chat: { en: "Chat on WhatsApp", si: "WhatsApp චැට්" },
};
