// Initialize all variables with existing data
let currentLang = localStorage.getItem('autoSimpleLang') || 'de';
let currentTheme = localStorage.getItem('autoSimpleTheme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function applyTheme(theme = currentTheme) {
    currentTheme = theme;
    document.body.classList.toggle('light-mode', theme === 'light');
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('autoSimpleTheme', theme);

    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
        const icon = toggleButton.querySelector('i');
        const label = toggleButton.querySelector('span');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        if (label) {
            label.textContent = theme === 'light' ? 'Dark' : 'Light';
        }
        toggleButton.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
}

function toggleTheme() {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

applyTheme(currentTheme);
let currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;
let cars = JSON.parse(localStorage.getItem("cars")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let messages = JSON.parse(localStorage.getItem("messages")) || [];
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
let auditLog = JSON.parse(localStorage.getItem("auditLog")) || [];
let currentEditIndex = -1;
let selectedFiles = [];
let editSelectedFiles = [];
let currentCarDetailIndex = -1;
let currentDetailCarousel = null;
let currentConversation = null;
let currentFullscreenImageIndex = 0;
let compareCars = JSON.parse(sessionStorage.getItem("compareCars")) || [];
let map = null;
let markers = [];
let deferredPrompt = null;
let shareCarId = null;
let areFiltersVisible = false;
let currentContactCarIndex = -1;
let carsToShow = cars; // Deklarimi i variablit

// ========== GOOGLE CLIENT ID ==========
const GOOGLE_CLIENT_ID = '370204xxxxxsgnnr.apps.googleusercontent.com'; // Ndrysho me Client ID tënd të vërtetë

// ========== VARIABLA PËR MAP ==========
let mapInitialized = false;
let currentHomeFilters = {
    brand: '',
    model: '',
    yearFrom: null,
    yearTo: null,
    kmFrom: null,
    kmTo: null,
    priceFrom: null,
    priceTo: null,
    fuel: '',
    transmission: '',
    color: '',
    city: '',
    searchText: ''
};

// Kontrollo nëse makinat ekzistuese kanë status
if (cars.length > 0 && !cars[0].hasOwnProperty('status')) {
    // I shtojmë status për makinat ekzistuese
    cars = cars.map(car => ({
        ...car,
        status: "approved",
        approvedAt: car.createdAt || new Date().toISOString(),
        adminNotes: ""
    }));
    localStorage.setItem("cars", JSON.stringify(cars));
}


// EXTENSIVE LIST OF ALL CAR BRANDS AND MODELS
const carBrands = [
    "Abarth", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", 
    "Bugatti", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Citroën", 
    "Dacia", "Daewoo", "Daihatsu", "Dodge", "Donkervoort", "DS", 
    "Ferrari", "Fiat", "Fisker", "Ford", "Honda", "Hummer", "Hyundai", 
    "Infiniti", "Iveco", "Jaguar", "Jeep", "Kia", "KTM", "Lada", 
    "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lotus", "Maserati", 
    "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "MG", "Mini", 
    "Mitsubishi", "Morgan", "Nissan", "Opel", "Peugeot", "Porsche", 
    "Renault", "Rolls-Royce", "Rover", "Saab", "Seat", "Skoda", 
    "Smart", "SsangYong", "Subaru", "Suzuki", "Tesla", "Toyota", 
    "Volkswagen", "Volvo"
];

const carModels = {
    "Abarth": ["500", "595", "124 Spider", "Punto"],
    "Alfa Romeo": ["Giulia", "Stelvio", "Giulietta", "4C", "MiTo", "Spider"],
    "Aston Martin": ["DB11", "Vantage", "DBS", "Rapide", "Vanquish"],
    "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "R8"],
    "Bentley": ["Continental GT", "Flying Spur", "Bentayga", "Mulsanne"],
    "BMW": ["1er", "2er", "3er", "4er", "5er", "6er", "7er", "8er", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i8"],
    "Bugatti": ["Chiron", "Veyron", "Divo"],
    "Buick": ["Encore", "Envision", "Regal"],
    "Cadillac": ["Escalade", "XT4", "XT5", "XT6", "CT5", "CT6"],
    "Chevrolet": ["Camaro", "Corvette", "Cruze", "Malibu", "Silverado", "Suburban", "Tahoe", "Traverse", "Trax", "Volt"],
    "Chrysler": ["300", "Pacifica", "Voyager"],
    "Citroën": ["C1", "C3", "C4", "C5", "Berlingo", "C3 Aircross", "C5 Aircross"],
    "Dacia": ["Sandero", "Logan", "Duster", "Lodgy", "Jogger"],
    "Daewoo": ["Matiz", "Lanos", "Nubira", "Leganza"],
    "Daihatsu": ["Cuore", "Sirion", "Terios", "Copen"],
    "Dodge": ["Challenger", "Charger", "Durango", "Journey"],
    "Donkervoort": ["D8", "D8 GTO"],
    "DS": ["DS 3", "DS 4", "DS 7", "DS 9"],
    "Ferrari": ["488", "F8 Tributo", "Roma", "Portofino", "SF90 Stradale", "812 Superfast"],
    "Fiat": ["500", "500X", "500L", "Panda", "Tipo", "Punto", "Doblo", "Qubo"],
    "Fisker": ["Karma", "Ocean"],
    "Ford": ["Fiesta", "Focus", "Mondeo", "Mustang", "Kuga", "Puma", "Explorer", "Edge", "Ranger", "Transit"],
    "Honda": ["Civic", "Accord", "CR-V", "HR-V", "Jazz", "NSX"],
    "Hummer": ["H1", "H2", "H3"],
    "Hyundai": ["i10", "i20", "i30", "i40", "Tucson", "Santa Fe", "Kona", "IONIQ", "Nexo"],
    "Infiniti": ["Q30", "Q50", "Q60", "QX30", "QX50", "QX60"],
    "Iveco": ["Daily", "Eurocargo", "Stralis"],
    "Jaguar": ["XE", "XF", "XJ", "F-Pace", "E-Pace", "I-Pace", "F-Type"],
    "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Renegade", "Compass"],
    "Kia": ["Picanto", "Rio", "Ceed", "Optima", "Sportage", "Sorento", "Niro", "Stonic", "Seltos", "EV6"],
    "KTM": ["X-Bow"],
    "Lada": ["Niva", "Granta", "Vesta", "XRAY"],
    "Lamborghini": ["Aventador", "Huracán", "Urus", "Sian"],
    "Lancia": ["Ypsilon", "Delta"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"],
    "Lexus": ["IS", "ES", "GS", "LS", "NX", "RX", "UX", "LC", "RC"],
    "Lotus": ["Elise", "Exige", "Evora", "Emira"],
    "Maserati": ["Ghibli", "Quattroporte", "Levante", "GranTurismo", "MC20"],
    "Maybach": ["S-Klasse"],
    "Mazda": ["2", "3", "6", "CX-3", "CX-5", "CX-30", "CX-9", "MX-5"],
    "McLaren": ["540C", "570S", "600LT", "720S", "765LT", "Artura"],
    "Mercedes-Benz": ["A-Klasse", "B-Klasse", "C-Klasse", "E-Klasse", "S-Klasse", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Klasse", "V-Klasse", "AMG GT", "EQC"],
    "MG": ["3", "ZS", "HS", "MG5"],
    "Mini": ["Cooper", "Clubman", "Countryman", "Paceman", "Coupe", "Roadster"],
    "Mitsubishi": ["Space Star", "ASX", "Eclipse Cross", "Outlander", "L200", "i-MiEV"],
    "Morgan": ["Plus 4", "Plus 6", "3 Wheeler"],
    "Nissan": ["Micra", "Note", "Qashqai", "Juke", "X-Trail", "Navara", "Leaf", "370Z", "GT-R"],
    "Opel": ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Zafira", "Combo", "Vivaro"],
    "Peugeot": ["108", "208", "308", "508", "2008", "3008", "5008", "Partner", "Rifter", "Expert"],
    "Porsche": ["911", "718 Boxster", "718 Cayman", "Panamera", "Macan", "Cayenne", "Taycan"],
    "Renault": ["Twingo", "Clio", "Megane", "Talisman", "Captur", "Kadjar", "Koleos", "Zoe", "Master", "Trafic"],
    "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Wraith", "Dawn"],
    "Rover": ["75", "25", "45"],
    "Saab": ["9-3", "9-5"],
    "Seat": ["Mii", "Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
    "Skoda": ["Citigo", "Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq"],
    "Smart": ["Fortwo", "Forfour", "Roadster"],
    "SsangYong": ["Tivoli", "Korando", "Rexton", "Musso"],
    "Subaru": ["Impreza", "Legacy", "Outback", "Forester", "XV", "BRZ"],
    "Suzuki": ["Alto", "Swift", "Baleno", "Vitara", "S-Cross", "Ignis", "Jimny"],
    "Tesla": ["Model S", "Model 3", "Model X", "Model Y", "Roadster", "Cybertruck"],
    "Toyota": ["Aygo", "Yaris", "Corolla", "Camry", "RAV4", "C-HR", "Prius", "Land Cruiser", "Hilux", "Supra", "Mirai"],
    "Volkswagen": ["Up!", "Polo", "Golf", "Passat", "Arteon", "T-Roc", "T-Cross", "Tiguan", "Touran", "Sharan", "Caddy", "Transporter", "ID.3", "ID.4", "ID.Buzz"],
    "Volvo": ["V40", "V60", "V90", "XC40", "XC60", "XC90", "S60", "S90"]
};

// Check if we need to create initial data
if (cars.length === 0) {
    cars = [
        {
            id: generateId(),
            ownerId: "admin",
            ownerName: "admin",
            n: "Mercedes-Benz",
            m: "C-Klasse",
            vehicleType: "Limousine",
            year: 2020,
            km: 45000,
            engine: 2000,
            color: "Schwarz",
            interiorColor: "Schwarz",
            seats: 5,
            doors: 4,
            fuel: "Benzin",
            transmission: "Automatik",
            p: 45000,
            city: "Zürich",
            inspectionDate: "2024-06-15",
            phone: "+41 76 426 6501",
            email: "max@autosimple.de",
            description: "Sehr gut gepflegtes Fahrzeug mit Full Service History. Ledersitze, Navi, Sitzheizung, Rückfahrkamera.",
            createdAt: new Date().toISOString(),
            images: [
                "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1563720223484-21c6c2d3c7e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            status: "approved",
            approvedAt: new Date().toISOString(),
            adminNotes: ""
        },
        {
            id: generateId(),
            ownerId: "admin",
            ownerName: "admin",
            n: "BMW",
            m: "3er",
            vehicleType: "Coupe",
            year: 2019,
            km: 60000,
            engine: 2200,
            color: "Grau",
            interiorColor: "Schwarz",
            seats: 4,
            doors: 2,
            fuel: "Diesel",
            transmission: "Manuell",
            p: 35000,
            city: "Genève",
            inspectionDate: "2023-11-20",
            phone: "+41 79 123 45 67",
            email: "",
            description: "Sportliches Coupe mit M-Paket. Winterreifen inklusive. Unfallfrei.",
            createdAt: new Date().toISOString(),
            images: [
                "https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            status: "approved",
            approvedAt: new Date().toISOString(),
            adminNotes: ""
        },
        {
            id: generateId(),
            ownerId: "admin",
            ownerName: "admin",
            n: "Volkswagen",
            m: "Golf",
            vehicleType: "Pkw",
            year: 2018,
            km: 80000,
            engine: 1600,
            color: "Blau",
            interiorColor: "Grau",
            seats: 5,
            doors: 5,
            fuel: "Benzin",
            transmission: "Automatik",
            p: 22000,
            city: "Bern",
            inspectionDate: "2024-03-10",
            phone: "",
            email: "seller@example.com",
            description: "Familienfreundlicher Golf mit vielen Extras. Klimaanlage, Tempomat, Einparkhilfe.",
            createdAt: new Date().toISOString(),
            images: [
                "https://images.unsplash.com/photo-1563720223484-21c6c2d3c7e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            status: "approved",
            approvedAt: new Date().toISOString(),
            adminNotes: ""
        },
        {
            id: generateId(),
            ownerId: "admin",
            ownerName: "admin",
            n: "Audi",
            m: "A4",
            vehicleType: "Limousine",
            year: 2021,
            km: 30000,
            engine: 2000,
            color: "Weiß",
            interiorColor: "Schwarz",
            seats: 5,
            doors: 4,
            fuel: "Diesel",
            transmission: "Automatik",
            p: 52000,
            city: "Basel-Stadt",
            inspectionDate: "2024-08-10",
            phone: "+41 78 987 65 43",
            email: "audi@example.com",
            description: "Neuwertiger Audi A4 mit Vollausstattung. Matrix LED, Virtual Cockpit, Sitzbelüftung.",
            createdAt: new Date().toISOString(),
            images: [
                "https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            status: "approved",
            approvedAt: new Date().toISOString(),
            adminNotes: ""
        },
        {
            id: generateId(),
            ownerId: "admin",
            ownerName: "admin",
            n: "Toyota",
            m: "RAV4",
            vehicleType: "SUV",
            year: 2022,
            km: 15000,
            engine: 2500,
            color: "Silber",
            interiorColor: "Schwarz",
            seats: 5,
            doors: 5,
            fuel: "Hybrid",
            transmission: "Automatik",
            p: 48000,
            city: "Luzern",
            inspectionDate: "2025-01-20",
            phone: "+41 79 555 44 33",
            email: "toyota@example.com",
            description: "Toyota RAV4 Hybrid in top Zustand. Allradantrieb, Panoramadach, Sicherheitspaket.",
            createdAt: new Date().toISOString(),
            images: [
                "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            status: "approved",
            approvedAt: new Date().toISOString(),
            adminNotes: ""
        },
        {
            id: generateId(),
            ownerId: "admin",
            ownerName: "admin",
            n: "Tesla",
            m: "Model 3",
            vehicleType: "Limousine",
            year: 2023,
            km: 12000,
            engine: 0,
            color: "Rot",
            interiorColor: "Weiß",
            seats: 5,
            doors: 4,
            fuel: "Electric",
            transmission: "Automatik",
            p: 55000,
            city: "Zürich",
            inspectionDate: "2025-06-30",
            phone: "+41 77 777 77 77",
            email: "tesla@example.com",
            description: "Tesla Model 3 Long Range, Autopilot, Premium Sound, Vollausstattung.",
            createdAt: new Date().toISOString(),
            images: [
                "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            status: "approved",
            approvedAt: new Date().toISOString(),
            adminNotes: ""
        }
    ];
    localStorage.setItem("cars", JSON.stringify(cars));
}

if (users.length === 0) {
    const adminUser = {
        id: generateId(),
        username: "admin",
        email: "admin@autosimple.de",
        password: "admin123",
        isAdmin: true,
        createdAt: new Date().toISOString(),
        profile: {
            firstName: "Admin",
            lastName: "User",
            phone: "+41 76 426 6501",
            address: "Solothurn, Schweiz",
            avatar: null
        }
    };
    users.push(adminUser);
    localStorage.setItem("users", JSON.stringify(users));
}

if (messages.length === 0) {
    const sampleMessages = [
        {
            id: generateId(),
            senderId: "admin",
            receiverId: generateId(),
            carId: cars[0].id,
            subject: "Interesse an Mercedes-Benz C-Klasse",
            message: "Hallo, ich interessiere mich für Ihren Mercedes-Benz C-Klasse. Ist der Preis verhandelbar?",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: false
        },
        {
            id: generateId(),
            senderId: generateId(),
            receiverId: "admin",
            carId: cars[1].id,
            subject: "Frage zu BMW 3er",
            message: "Guten Tag, hat der BMW noch Garantie? Könnte ich das Auto nächste Woche besichtigen?",
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            read: true
        }
    ];
    messages = sampleMessages;
    localStorage.setItem("messages", JSON.stringify(messages));
}

const translations = {
    de: {
        tCars: "Fahrzeuge zum Verkauf",
        tInfo: "Kontakt & Info",
        tStats: "Statistik",
        tFavorites: "Meine Favoriten",
        tCompare: "Vergleichen",
        tMap: "Fahrzeuge auf der Karte",
        tAdmin: "Admin Dashboard",
        tNotifications: "Benachrichtigungen",
        tAdd: "Fahrzeug hinzufügen",
        tEdit: "Fahrzeug bearbeiten",
        tAuth: "Anmeldung / Registrierung",
        tSearch: "Suche nach Marke, Modell, Stadt, Farbe...",
        tClearFilters: "Filter löschen",
        tMoreFilters: "+ Weitere Filter anzeigen",
        tLessFilters: "- Filter ausblenden",
        tShowFilters: "Filter anzeigen",
        tHideFilters: "Filter ausblenden",
        tSort: "Sortieren",
        tLogin: "Login",
        tSignup: "Sign Up",
        tProfile: "Profil",
        tLogout: "Logout",
        tAddVehicle: "Fahrzeug hinzufügen",
        tContact: "Kontakt & Info",
        tStatistics: "Statistik",
        navHome: "Home",
        navInfo: "Info",
        navAdd: "Fahrzeug hinzufügen",
        navFavorites: "Favorites",
        navMap: "Map",
        navMessages: "Messages",
        navLogin: "Login / Sign Up",
        navProfile: "Profile",
        navAdmin: "Admin",
        navLogout: "Logout",
        sortDefault: "Sortieren",
        sortPriceAsc: "Preis: niedrig → hoch",
        sortPriceDesc: "Preis: hoch → niedrig",
        sortKmAsc: "KM: niedrig → hoch",
        sortKmDesc: "KM: hoch → niedrig",
        sortYearDesc: "Neuste zuerst",
        sortYearAsc: "Älteste zuerst",
        tLoginTab: "Login",
        tSignupTab: "Sign Up",
        tLoginBtn: "Einloggen",
        tSignupBtn: "Registrieren",
        tAddBtn: "Hinzufügen",
        tSaveBtn: "Änderungen speichern",
        filterBrandDefault: "Alle Marken",
        filterModelDefault: "Alle Modelle",
        filterYearFromDefault: "Baujahr von",
        filterYearToDefault: "bis",
        filterKMFromDefault: "km von",
        filterKMToDefault: "bis",
        filterPriceFromDefault: "Preis von",
        filterPriceToDefault: "bis",
        filterFuelDefault: "Kraftstoff",
        fuelPetrol: "Benzin",
        fuelDiesel: "Diesel",
        fuelElectric: "Electric",
        fuelHybrid: "Hybrid",
        filterTransmissionDefault: "Getriebe",
        transmissionAutomatic: "Automatik",
        transmissionManual: "Manuell",
        filterColorDefault: "Außenfarbe",
        colorBlack: "Schwarz",
        colorWhite: "Weiß",
        colorGray: "Grau",
        colorRed: "Rot",
        colorBlue: "Blau",
        colorSilver: "Silber",
        colorGreen: "Grün",
        colorBeige: "Beige",
        filterInteriorColorDefault: "Innenfarbe",
        interiorBlack: "Schwarz",
        interiorGray: "Grau",
        interiorBeige: "Beige",
        interiorBrown: "Braun",
        interiorRed: "Rot",
        interiorBlue: "Blau",
        interiorWhite: "Weiß",
        interiorCream: "Creme",
        filterEngineFromDefault: "Hubraum von (cm³)",
        engine0: "0",
        engine1000: "1.000",
        engine1500: "1.500",
        engine2000: "2.000",
        engine2500: "2.500",
        engine3000: "3.000",
        engine3500: "3.500",
        engine4000: "4.000",
        engine5000: "5.000",
        filterEngineToDefault: "bis (cm³)",
        engineTo1000: "1.000",
        engineTo1500: "1.500",
        engineTo2000: "2.000",
        engineTo2500: "2.500",
        engineTo3000: "3.000",
        engineTo3500: "3.500",
        engineTo4000: "4.000",
        engineTo5000: "5.000",
        engineTo10000: "10.000",
        filterSeatsFromDefault: "Sitzplätze von",
        seats1: "1",
        seats2: "2",
        seats3: "3",
        seats4: "4",
        seats5: "5",
        seats6: "6",
        seats7: "7",
        seats8: "8",
        seats9: "9",
        filterSeatsToDefault: "bis",
        seatsTo1: "1",
        seatsTo2: "2",
        seatsTo3: "3",
        seatsTo4: "4",
        seatsTo5: "5",
        seatsTo6: "6",
        seatsTo7: "7",
        seatsTo8: "8",
        seatsTo9: "9",
        seatsTo12: "12+",
        filterDoorsFromDefault: "Türen von",
        doors2: "2/3 Türen",
        doors4: "4/5 Türen",
        filterDoorsToDefault: "bis",
        doorsTo2: "2/3 Türen",
        doorsTo4: "4/5 Türen",
        filterVehicleTypeDefault: "Fahrzeugtyp",
        typeSedan: "Limousine",
        typeCoupe: "Coupe",
        typeSUV: "SUV",
        typeConvertible: "Cabrio",
        typeEstate: "Kombi",
        typeCar: "Pkw",
        typeOffroad: "Geländewagen",
        filterMFKDefault: "MFK Status",
        mfgNew: "Neu (≤ 1 Jahr)",
        mfgCurrent: "Aktuell (≤ 2 Jahre)",
        mfgSoon: "Bald fällig (> 2 Jahre)",
        mfgWithout: "Ohne MFK",
        filterCityDefault: "Standort (Kanton)",
        filterDistanceDefault: "Entfernung",
        distance10: "≤ 10 km",
        distance25: "≤ 25 km",
        distance50: "≤ 50 km",
        distance100: "≤ 100 km",
        distance200: "≤ 200 km",
        distance500: "≤ 500 km",
        distance1000: "≤ 1000 km",
        distanceAny: "Beliebig",
        addBrandDefault: "Marke wählen",
        addModelDefault: "Modell wählen",
        addVehicleTypeDefault: "Fahrzeugtyp wählen",
        addTypeSedan: "Limousine",
        addTypeCoupe: "Coupe",
        addTypeSUV: "SUV",
        addTypeConvertible: "Cabrio",
        addTypeEstate: "Kombi",
        addTypeCar: "Pkw",
        addTypeOffroad: "Geländewagen",
        addYearDefault: "Baujahr wählen",
        addEngineDefault: "Hubraum wählen",
        addEngine1000: "1.000",
        addEngine1200: "1.200",
        addEngine1400: "1.400",
        addEngine1600: "1.600",
        addEngine1800: "1.800",
        addEngine2000: "2.000",
        addEngine2200: "2.200",
        addEngine2500: "2.500",
        addEngine3000: "3.000",
        addEngine3500: "3.500",
        addEngine4000: "4.000",
        addEngine4500: "4.500",
        addEngine5000: "5.000",
        addColorDefault: "Außenfarbe wählen",
        addColorBlack: "Schwarz",
        addColorWhite: "Weiß",
        addColorGray: "Grau",
        addColorRed: "Rot",
        addColorBlue: "Blau",
        addColorSilver: "Silber",
        addColorGreen: "Grün",
        addColorBeige: "Beige",
        addInteriorColorDefault: "Innenfarbe wählen",
        addInteriorBlack: "Schwarz",
        addInteriorGray: "Grau",
        addInteriorBeige: "Beige",
        addInteriorBrown: "Braun",
        addInteriorRed: "Rot",
        addInteriorBlue: "Blau",
        addInteriorWhite: "Weiß",
        addInteriorCream: "Creme",
        addSeatsDefault: "Sitzplätze wählen",
        addSeats1: "1",
        addSeats2: "2",
        addSeats3: "3",
        addSeats4: "4",
        addSeats5: "5",
        addSeats6: "6",
        addSeats7: "7",
        addSeats8: "8",
        addSeats9: "9",
        addSeats12: "12+",
        addDoorsDefault: "Türen wählen",
        addDoors2: "2/3 Türen",
        addDoors4: "4/5 Türen",
        addFuelDefault: "Kraftstoff wählen",
        addFuelPetrol: "Benzin",
        addFuelDiesel: "Diesel",
        addFuelElectric: "Electric",
        addFuelHybrid: "Hybrid",
        addTransmissionDefault: "Getriebe wählen",
        addTransmissionAutomatic: "Automatik",
        addTransmissionManual: "Manuell",
        addCityDefault: "Kanton wählen",
        fileUploadText: "Bilder auswählen oder hier ablegen",
        fileUploadInfo: "Optional: maximal 5 Bilder, JPG/PNG bis 5MB"
    },
    sq: {
        tCars: "Automjetet në Shitje",
        tInfo: "Kontakt & Info",
        tStats: "Statistikat",
        tFavorites: "Të Preferuarat e Mia",
        tCompare: "Krahasoni",
        tMap: "Automjetet në Hartë",
        tAdmin: "Paneli i Administratorit",
        tNotifications: "Njoftimet",
        tAdd: "Shto Automjet",
        tEdit: "Modifiko Automjetin",
        tAuth: "Hyrje / Regjistrim",
        tSearch: "Kërkoni markë, model, qytet, ngjyrë...",
        tClearFilters: "Pastro Filtrot",
        tMoreFilters: "+ Shfaq Më Shumë Filtra",
        tLessFilters: "- Fshih Filtrot",
        tShowFilters: "Shfaq Filtra",
        tHideFilters: "Fshih Filtra",
        tSort: "Rendit",
        tLogin: "Hyr",
        tSignup: "Regjistrohu",
        tProfile: "Profili",
        tLogout: "Dil",
        tAddVehicle: "Shto Automjet",
        tContact: "Kontakt & Info",
        tStatistics: "Statistikat",
        navHome: "Kryefaqja",
        navInfo: "Info",
        navAdd: "Shto Automjet",
        navFavorites: "Të Preferuarat",
        navMap: "Harta",
        navMessages: "Mesazhet",
        navLogin: "Hyr / Regjistrohu",
        navProfile: "Profili",
        navAdmin: "Admin",
        navLogout: "Dil",
        sortDefault: "Rendit",
        sortPriceAsc: "Çmimi: ulët → lartë",
        sortPriceDesc: "Çmimi: lartë → ulët",
        sortKmAsc: "KM: ulët → lartë",
        sortKmDesc: "KM: lartë → ulët",
        sortYearDesc: "Më të rejat së pari",
        sortYearAsc: "Më të vjetrat së pari",
        tLoginTab: "Hyr",
        tSignupTab: "Regjistrohu",
        tLoginBtn: "Hyr",
        tSignupBtn: "Regjistrohu",
        tAddBtn: "Shto",
        tSaveBtn: "Ruaj Ndryshimet",
        filterBrandDefault: "Të gjitha markat",
        filterModelDefault: "Të gjitha modelet",
        filterYearFromDefault: "Viti i prodhimit nga",
        filterYearToDefault: "deri",
        filterKMFromDefault: "km nga",
        filterKMToDefault: "deri",
        filterPriceFromDefault: "Çmimi nga",
        filterPriceToDefault: "deri",
        filterFuelDefault: "Karburanti",
        fuelPetrol: "Benzin",
        fuelDiesel: "Naftë",
        fuelElectric: "Elektrik",
        fuelHybrid: "Hibrid",
        filterTransmissionDefault: "Transmetimi",
        transmissionAutomatic: "Automatik",
        transmissionManual: "Manual",
        filterColorDefault: "Ngjyra e jashtme",
        colorBlack: "E zezë",
        colorWhite: "E bardhë",
        colorGray: "Gri",
        colorRed: "E kuqe",
        colorBlue: "E kaltër",
        colorSilver: "Argjendi",
        colorGreen: "E gjelbër",
        colorBeige: "Bezh",
        filterInteriorColorDefault: "Ngjyra e brendshme",
        interiorBlack: "E zezë",
        interiorGray: "Gri",
        interiorBeige: "Bezh",
        interiorBrown: "Kafe",
        interiorRed: "E kuqe",
        interiorBlue: "E kaltër",
        interiorWhite: "E bardhë",
        interiorCream: "Krem",
        filterEngineFromDefault: "Motorri nga (cm³)",
        engine0: "0",
        engine1000: "1.000",
        engine1500: "1.500",
        engine2000: "2.000",
        engine2500: "2.500",
        engine3000: "3.000",
        engine3500: "3.500",
        engine4000: "4.000",
        engine5000: "5.000",
        filterEngineToDefault: "deri (cm³)",
        engineTo1000: "1.000",
        engineTo1500: "1.500",
        engineTo2000: "2.000",
        engineTo2500: "2.500",
        engineTo3000: "3.000",
        engineTo3500: "3.500",
        engineTo4000: "4.000",
        engineTo5000: "5.000",
        engineTo10000: "10.000",
        filterSeatsFromDefault: "Ulese nga",
        seats1: "1",
        seats2: "2",
        seats3: "3",
        seats4: "4",
        seats5: "5",
        seats6: "6",
        seats7: "7",
        seats8: "8",
        seats9: "9",
        filterSeatsToDefault: "deri",
        seatsTo1: "1",
        seatsTo2: "2",
        seatsTo3: "3",
        seatsTo4: "4",
        seatsTo5: "5",
        seatsTo6: "6",
        seatsTo7: "7",
        seatsTo8: "8",
        seatsTo9: "9",
        seatsTo12: "12+",
        filterDoorsFromDefault: "Dyert nga",
        doors2: "2/3 dyert",
        doors4: "4/5 dyert",
        filterDoorsToDefault: "deri",
        doorsTo2: "2/3 dyert",
        doorsTo4: "4/5 dyert",
        filterVehicleTypeDefault: "Lloji i automjetit",
        typeSedan: "Sedan",
        typeCoupe: "Kupe",
        typeSUV: "SUV",
        typeConvertible: "Kabriolet",
        typeEstate: "Kombi",
        typeCar: "Veturë",
        typeOffroad: "Offroad",
        filterMFKDefault: "Statusi i MFK",
        mfgNew: "I ri (≤ 1 vit)",
        mfgCurrent: "Aktual (≤ 2 vjet)",
        mfgSoon: "Së shpejti (> 2 vjet)",
        mfgWithout: "Pa MFK",
        filterCityDefault: "Vendndodhja (Kantoni)",
        filterDistanceDefault: "Distanca",
        distance10: "≤ 10 km",
        distance25: "≤ 25 km",
        distance50: "≤ 50 km",
        distance100: "≤ 100 km",
        distance200: "≤ 200 km",
        distance500: "≤ 500 km",
        distance1000: "≤ 1000 km",
        distanceAny: "Çfarëdo",
        addBrandDefault: "Zgjidhni markën",
        addModelDefault: "Zgjidhni modelin",
        addVehicleTypeDefault: "Zgjidhni llojin e automjetit",
        addTypeSedan: "Sedan",
        addTypeCoupe: "Kupe",
        addTypeSUV: "SUV",
        addTypeConvertible: "Kabriolet",
        addTypeEstate: "Kombi",
        addTypeCar: "Veturë",
        addTypeOffroad: "Offroad",
        addYearDefault: "Zgjidhni vitin e prodhimit",
        addEngineDefault: "Zgjidhni motorrin",
        addEngine1000: "1.000",
        addEngine1200: "1.200",
        addEngine1400: "1.400",
        addEngine1600: "1.600",
        addEngine1800: "1.800",
        addEngine2000: "2.000",
        addEngine2200: "2.200",
        addEngine2500: "2.500",
        addEngine3000: "3.000",
        addEngine3500: "3.500",
        addEngine4000: "4.000",
        addEngine4500: "4.500",
        addEngine5000: "5.000",
        addColorDefault: "Zgjidhni ngjyrën e jashtme",
        addColorBlack: "E zezë",
        addColorWhite: "E bardhë",
        addColorGray: "Gri",
        addColorRed: "E kuqe",
        addColorBlue: "E kaltër",
        addColorSilver: "Argjendi",
        addColorGreen: "E gjelbër",
        addColorBeige: "Bezh",
        addInteriorColorDefault: "Zgjidhni ngjyrën e brendshme",
        addInteriorBlack: "E zezë",
        addInteriorGray: "Gri",
        addInteriorBeige: "Bezh",
        addInteriorBrown: "Kafe",
        addInteriorRed: "E kuqe",
        addInteriorBlue: "E kaltër",
        addInteriorWhite: "E bardhë",
        addInteriorCream: "Krem",
        addSeatsDefault: "Zgjidhni numrin e ulëseve",
        addSeats1: "1",
        addSeats2: "2",
        addSeats3: "3",
        addSeats4: "4",
        addSeats5: "5",
        addSeats6: "6",
        addSeats7: "7",
        addSeats8: "8",
        addSeats9: "9",
        addSeats12: "12+",
        addDoorsDefault: "Zgjidhni numrin e dyerve",
        addDoors2: "2/3 dyert",
        addDoors4: "4/5 dyert",
        addFuelDefault: "Zgjidhni karburantin",
        addFuelPetrol: "Benzin",
        addFuelDiesel: "Naftë",
        addFuelElectric: "Elektrik",
        addFuelHybrid: "Hibrid",
        addTransmissionDefault: "Zgjidhni transmetimin",
        addTransmissionAutomatic: "Automatik",
        addTransmissionManual: "Manual",
        addCityDefault: "Zgjidhni kantonin",
        fileUploadText: "Zgjidhni imazhe ose lëshoni këtu",
        fileUploadInfo: "Opsionale: maksimumi 5 imazhe, JPG/PNG deri në 5MB"
    },
    en: {
        tCars: "Vehicles for Sale",
        tInfo: "Contact & Info",
        tStats: "Statistics",
        tFavorites: "My Favorites",
        tCompare: "Compare",
        tMap: "Vehicles on Map",
        tAdmin: "Admin Dashboard",
        tNotifications: "Notifications",
        tAdd: "Add Vehicle",
        tEdit: "Edit Vehicle",
        tAuth: "Login / Sign Up",
        tSearch: "Search by brand, model, city, color...",
        tClearFilters: "Clear Filters",
        tMoreFilters: "+ Show More Filters",
        tLessFilters: "- Hide Filters",
        tShowFilters: "Show Filters",
        tHideFilters: "Hide Filters",
        tSort: "Sort",
        tLogin: "Login",
        tSignup: "Sign Up",
        tProfile: "Profile",
        tLogout: "Logout",
        tAddVehicle: "Add Vehicle",
        tContact: "Contact & Info",
        tStatistics: "Statistics",
        navHome: "Home",
        navInfo: "Info",
        navAdd: "Add Vehicle",
        navFavorites: "Favorites",
        navMap: "Map",
        navMessages: "Messages",
        navLogin: "Login / Sign Up",
        navProfile: "Profile",
        navAdmin: "Admin",
        navLogout: "Logout",
        sortDefault: "Sort",
        sortPriceAsc: "Price: low → high",
        sortPriceDesc: "Price: high → low",
        sortKmAsc: "KM: low → high",
        sortKmDesc: "KM: high → low",
        sortYearDesc: "Newest first",
        sortYearAsc: "Oldest first",
        tLoginTab: "Login",
        tSignupTab: "Sign Up",
        tLoginBtn: "Login",
        tSignupBtn: "Sign Up",
        tAddBtn: "Add",
        tSaveBtn: "Save Changes",
        filterBrandDefault: "All Brands",
        filterModelDefault: "All Models",
        filterYearFromDefault: "Year from",
        filterYearToDefault: "to",
        filterKMFromDefault: "km from",
        filterKMToDefault: "to",
        filterPriceFromDefault: "Price from",
        filterPriceToDefault: "to",
        filterFuelDefault: "Fuel",
        fuelPetrol: "Petrol",
        fuelDiesel: "Diesel",
        fuelElectric: "Electric",
        fuelHybrid: "Hybrid",
        filterTransmissionDefault: "Transmission",
        transmissionAutomatic: "Automatic",
        transmissionManual: "Manual",
        filterColorDefault: "Exterior Color",
        colorBlack: "Black",
        colorWhite: "White",
        colorGray: "Gray",
        colorRed: "Red",
        colorBlue: "Blue",
        colorSilver: "Silver",
        colorGreen: "Green",
        colorBeige: "Beige",
        filterInteriorColorDefault: "Interior Color",
        interiorBlack: "Black",
        interiorGray: "Gray",
        interiorBeige: "Beige",
        interiorBrown: "Brown",
        interiorRed: "Red",
        interiorBlue: "Blue",
        interiorWhite: "White",
        interiorCream: "Cream",
        filterEngineFromDefault: "Engine from (cm³)",
        engine0: "0",
        engine1000: "1,000",
        engine1500: "1,500",
        engine2000: "2,000",
        engine2500: "2,500",
        engine3000: "3,000",
        engine3500: "3,500",
        engine4000: "4,000",
        engine5000: "5,000",
        filterEngineToDefault: "to (cm³)",
        engineTo1000: "1,000",
        engineTo1500: "1,500",
        engineTo2000: "2,000",
        engineTo2500: "2.500",
        engineTo3000: "3,000",
        engineTo3500: "3,500",
        engineTo4000: "4,000",
        engineTo5000: "5,000",
        engineTo10000: "10,000",
        filterSeatsFromDefault: "Seats from",
        seats1: "1",
        seats2: "2",
        seats3: "3",
        seats4: "4",
        seats5: "5",
        seats6: "6",
        seats7: "7",
        seats8: "8",
        seats9: "9",
        filterSeatsToDefault: "to",
        seatsTo1: "1",
        seatsTo2: "2",
        seatsTo3: "3",
        seatsTo4: "4",
        seatsTo5: "5",
        seatsTo6: "6",
        seatsTo7: "7",
        seatsTo8: "8",
        seatsTo9: "9",
        seatsTo12: "12+",
        filterDoorsFromDefault: "Doors from",
        doors2: "2/3 doors",
        doors4: "4/5 doors",
        filterDoorsToDefault: "to",
        doorsTo2: "2/3 doors",
        doorsTo4: "4/5 doors",
        filterVehicleTypeDefault: "Vehicle Type",
        typeSedan: "Sedan",
        typeCoupe: "Coupe",
        typeSUV: "SUV",
        typeConvertible: "Convertible",
        typeEstate: "Estate",
        typeCar: "Car",
        typeOffroad: "Off-road",
        filterMFKDefault: "MFK Status",
        mfgNew: "New (≤ 1 year)",
        mfgCurrent: "Current (≤ 2 years)",
        mfgSoon: "Soon due (> 2 years)",
        mfgWithout: "Without MFK",
        filterCityDefault: "Location (Canton)",
        filterDistanceDefault: "Distance",
        distance10: "≤ 10 km",
        distance25: "≤ 25 km",
        distance50: "≤ 50 km",
        distance100: "≤ 100 km",
        distance200: "≤ 200 km",
        distance500: "≤ 500 km",
        distance1000: "≤ 1000 km",
        distanceAny: "Any",
        addBrandDefault: "Select Brand",
        addModelDefault: "Select Model",
        addVehicleTypeDefault: "Select Vehicle Type",
        addTypeSedan: "Sedan",
        addTypeCoupe: "Coupe",
        addTypeSUV: "SUV",
        addTypeConvertible: "Convertible",
        addTypeEstate: "Estate",
        addTypeCar: "Car",
        addTypeOffroad: "Off-road",
        addYearDefault: "Select Year",
        addEngineDefault: "Select Engine",
        addEngine1000: "1,000",
        addEngine1200: "1,200",
        addEngine1400: "1,400",
        addEngine1600: "1,600",
        addEngine1800: "1,800",
        addEngine2000: "2,000",
        addEngine2200: "2,200",
        addEngine2500: "2,500",
        addEngine3000: "3,000",
        addEngine3500: "3,500",
        addEngine4000: "4,000",
        addEngine4500: "4,500",
        addEngine5000: "5,000",
        addColorDefault: "Select Exterior Color",
        addColorBlack: "Black",
        addColorWhite: "White",
        addColorGray: "Gray",
        addColorRed: "Red",
        addColorBlue: "Blue",
        addColorSilver: "Silver",
        addColorGreen: "Green",
        addColorBeige: "Beige",
        addInteriorColorDefault: "Select Interior Color",
        addInteriorBlack: "Black",
        addInteriorGray: "Gray",
        addInteriorBeige: "Beige",
        addInteriorBrown: "Brown",
        addInteriorRed: "Red",
        addInteriorBlue: "Blue",
        addInteriorWhite: "White",
        addInteriorCream: "Cream",
        addSeatsDefault: "Select Seats",
        addSeats1: "1",
        addSeats2: "2",
        addSeats3: "3",
        addSeats4: "4",
        addSeats5: "5",
        addSeats6: "6",
        addSeats7: "7",
        addSeats8: "8",
        addSeats9: "9",
        addSeats12: "12+",
        addDoorsDefault: "Select Doors",
        addDoors2: "2/3 doors",
        addDoors4: "4/5 doors",
        addFuelDefault: "Select Fuel",
        addFuelPetrol: "Petrol",
        addFuelDiesel: "Diesel",
        addFuelElectric: "Electric",
        addFuelHybrid: "Hybrid",
        addTransmissionDefault: "Select Transmission",
        addTransmissionAutomatic: "Automatic",
        addTransmissionManual: "Manual",
        addCityDefault: "Select Canton",
        fileUploadText: "Select images or drop here",
        fileUploadInfo: "Optional: maximum 5 images, JPG/PNG up to 5MB"
    },
    fr: {
        tCars: "Véhicules à Vendre",
        tInfo: "Contact & Info",
        tStats: "Statistiques",
        tFavorites: "Mes Favoris",
        tCompare: "Comparer",
        tMap: "Véhicules sur la Carte",
        tAdmin: "Tableau de Bord Admin",
        tNotifications: "Notifications",
        tAdd: "Ajouter un Véhicule",
        tEdit: "Modifier le Véhicule",
        tAuth: "Connexion / Inscription",
        tSearch: "Rechercher par marque, modèle, ville, couleur...",
        tClearFilters: "Effacer les Filtres",
        tMoreFilters: "+ Afficher Plus de Filtres",
        tLessFilters: "- Masquer les Filtres",
        tShowFilters: "Afficher les Filtres",
        tHideFilters: "Masquer les Filtres",
        tSort: "Trier",
        tLogin: "Connexion",
        tSignup: "Inscription",
        tProfile: "Profil",
        tLogout: "Déconnexion",
        tAddVehicle: "Ajouter un Véhicule",
        tContact: "Contact & Info",
        tStatistics: "Statistiques",
        navHome: "Accueil",
        navInfo: "Info",
        navAdd: "Ajouter Véhicule",
        navFavorites: "Favoris",
        navMap: "Carte",
        navMessages: "Messages",
        navLogin: "Connexion / Inscription",
        navProfile: "Profil",
        navAdmin: "Admin",
        navLogout: "Déconnexion",
        sortDefault: "Trier",
        sortPriceAsc: "Prix: bas → haut",
        sortPriceDesc: "Prix: haut → bas",
        sortKmAsc: "KM: bas → haut",
        sortKmDesc: "KM: haut → bas",
        sortYearDesc: "Plus récent d'abord",
        sortYearAsc: "Plus ancien d'abord",
        tLoginTab: "Connexion",
        tSignupTab: "Inscription",
        tLoginBtn: "Se connecter",
        tSignupBtn: "S'inscrire",
        tAddBtn: "Ajouter",
        tSaveBtn: "Enregistrer les modifications",
        filterBrandDefault: "Toutes les marques",
        filterModelDefault: "Tous les modèles",
        filterYearFromDefault: "Année de",
        filterYearToDefault: "à",
        filterKMFromDefault: "km de",
        filterKMToDefault: "à",
        filterPriceFromDefault: "Prix de",
        filterPriceToDefault: "à",
        filterFuelDefault: "Carburant",
        fuelPetrol: "Essence",
        fuelDiesel: "Diesel",
        fuelElectric: "Électrique",
        fuelHybrid: "Hybride",
        filterTransmissionDefault: "Transmission",
        transmissionAutomatic: "Automatique",
        transmissionManual: "Manuelle",
        filterColorDefault: "Couleur extérieure",
        colorBlack: "Noir",
        colorWhite: "Blanc",
        colorGray: "Gris",
        colorRed: "Rouge",
        colorBlue: "Bleu",
        colorSilver: "Argent",
        colorGreen: "Vert",
        colorBeige: "Beige",
        filterInteriorColorDefault: "Couleur intérieure",
        interiorBlack: "Noir",
        interiorGray: "Gri",
        interiorBeige: "Beige",
        interiorBrown: "Marron",
        interiorRed: "Rouge",
        interiorBlue: "Bleu",
        interiorWhite: "Blanc",
        interiorCream: "Crème",
        filterEngineFromDefault: "Moteur de (cm³)",
        engine0: "0",
        engine1000: "1.000",
        engine1500: "1.500",
        engine2000: "2.000",
        engine2500: "2.500",
        engine3000: "3.000",
        engine3500: "3.500",
        engine4000: "4.000",
        engine5000: "5.000",
        filterEngineToDefault: "à (cm³)",
        engineTo1000: "1.000",
        engineTo1500: "1.500",
        engineTo2000: "2.000",
        engineTo2500: "2.500",
        engineTo3000: "3.000",
        engineTo3500: "3.500",
        engineTo4000: "4.000",
        engineTo5000: "5.000",
        engineTo10000: "10.000",
        filterSeatsFromDefault: "Sièges de",
        seats1: "1",
        seats2: "2",
        seats3: "3",
        seats4: "4",
        seats5: "5",
        seats6: "6",
        seats7: "7",
        seats8: "8",
        seats9: "9",
        filterSeatsToDefault: "à",
        seatsTo1: "1",
        seatsTo2: "2",
        seatsTo3: "3",
        seatsTo4: "4",
        seatsTo5: "5",
        seatsTo6: "6",
        seatsTo7: "7",
        seatsTo8: "8",
        seatsTo9: "9",
        seatsTo12: "12+",
        filterDoorsFromDefault: "Portes de",
        doors2: "2/3 portes",
        doors4: "4/5 portes",
        filterDoorsToDefault: "à",
        doorsTo2: "2/3 portes",
        doorsTo4: "4/5 portes",
        filterVehicleTypeDefault: "Type de véhicule",
        typeSedan: "Berline",
        typeCoupe: "Coupé",
        typeSUV: "SUV",
        typeConvertible: "Cabriolet",
        typeEstate: "Break",
        typeCar: "Voiture",
        typeOffroad: "Tout-terrain",
        filterMFKDefault: "Statut MFK",
        mfgNew: "Nouveau (≤ 1 an)",
        mfgCurrent: "Actuel (≤ 2 ans)",
        mfgSoon: "Bientôt dû (> 2 ans)",
        mfgWithout: "Sans MFK",
        filterCityDefault: "Emplacement (Canton)",
        filterDistanceDefault: "Distance",
        distance10: "≤ 10 km",
        distance25: "≤ 25 km",
        distance50: "≤ 50 km",
        distance100: "≤ 100 km",
        distance200: "≤ 200 km",
        distance500: "≤ 500 km",
        distance1000: "≤ 1000 km",
        distanceAny: "Toute",
        addBrandDefault: "Sélectionner la marque",
        addModelDefault: "Sélectionner le modèle",
        addVehicleTypeDefault: "Sélectionner le type de véhicule",
        addTypeSedan: "Berline",
        addTypeCoupe: "Coupé",
        addTypeSUV: "SUV",
        addTypeConvertible: "Cabriolet",
        addTypeEstate: "Break",
        addTypeCar: "Voiture",
        addTypeOffroad: "Tout-terrain",
        addYearDefault: "Sélectionner l'année",
        addEngineDefault: "Sélectionner le moteur",
        addEngine1000: "1.000",
        addEngine1200: "1.200",
        addEngine1400: "1.400",
        addEngine1600: "1.600",
        addEngine1800: "1.800",
        addEngine2000: "2.000",
        addEngine2200: "2.200",
        addEngine2500: "2.500",
        addEngine3000: "3.000",
        addEngine3500: "3.500",
        addEngine4000: "4.000",
        addEngine4500: "4.500",
        addEngine5000: "5.000",
        addColorDefault: "Sélectionner la couleur extérieure",
        addColorBlack: "Noir",
        addColorWhite: "Blanc",
        addColorGray: "Gris",
        addColorRed: "Rouge",
        addColorBlue: "Bleu",
        addColorSilver: "Argent",
        addColorGreen: "Vert",
        addColorBeige: "Beige",
        addInteriorColorDefault: "Sélectionner la couleur intérieure",
        addInteriorBlack: "Noir",
        addInteriorGray: "Gri",
        addInteriorBeige: "Beige",
        addInteriorBrown: "Marron",
        addInteriorRed: "Rouge",
        addInteriorBlue: "Bleu",
        addInteriorWhite: "Blanc",
        addInteriorCream: "Crème",
        addSeatsDefault: "Sélectionner les sièges",
        addSeats1: "1",
        addSeats2: "2",
        addSeats3: "3",
        addSeats4: "4",
        addSeats5: "5",
        addSeats6: "6",
        addSeats7: "7",
        addSeats8: "8",
        addSeats9: "9",
        addSeats12: "12+",
        addDoorsDefault: "Sélectionner les portes",
        addDoors2: "2/3 portes",
        addDoors4: "4/5 portes",
        addFuelDefault: "Sélectionner le carburant",
        addFuelPetrol: "Essence",
        addFuelDiesel: "Diesel",
        addFuelElectric: "Électrique",
        addFuelHybrid: "Hybride",
        addTransmissionDefault: "Sélectionner la transmission",
        addTransmissionAutomatic: "Automatique",
        addTransmissionManual: "Manuelle",
        addCityDefault: "Sélectionner le canton",
        fileUploadText: "Sélectionner des images ou déposer ici",
        fileUploadInfo: "Facultatif : maximum 5 images, JPG/PNG jusqu'à 5MB"
    },
    it: {
        tCars: "Veicoli in Vendita",
        tInfo: "Contatto & Info",
        tStats: "Statistiche",
        tFavorites: "I Miei Preferiti",
        tCompare: "Confronta",
        tMap: "Veicoli sulla Mappa",
        tAdmin: "Pannello di Controllo Admin",
        tNotifications: "Notifiche",
        tAdd: "Aggiungi Veicolo",
        tEdit: "Modifica Veicolo",
        tAuth: "Accesso / Registrazione",
        tSearch: "Cerca per marca, modello, città, colore...",
        tClearFilters: "Cancella Filtri",
        tMoreFilters: "+ Mostra Altri Filtri",
        tLessFilters: "- Nascondi Filtri",
        tShowFilters: "Mostra Filtri",
        tHideFilters: "Nascondi Filtri",
        tSort: "Ordina",
        tLogin: "Accedi",
        tSignup: "Registrati",
        tProfile: "Profilo",
        tLogout: "Esci",
        tAddVehicle: "Aggiungi Veicolo",
        tContact: "Contatto & Info",
        tStatistics: "Statistiche",
        navHome: "Home",
        navInfo: "Info",
        navAdd: "Aggiungi Veicolo",
        navFavorites: "Preferiti",
        navMap: "Mappa",
        navMessages: "Messaggi",
        navLogin: "Accesso / Registrazione",
        navProfile: "Profilo",
        navAdmin: "Admin",
        navLogout: "Esci",
        sortDefault: "Ordina",
        sortPriceAsc: "Prezzo: basso → alto",
        sortPriceDesc: "Prezzo: alto → basso",
        sortKmAsc: "KM: basso → alto",
        sortKmDesc: "KM: alto → basso",
        sortYearDesc: "Più recenti prima",
        sortYearAsc: "Più vecchi prima",
        tLoginTab: "Accesso",
        tSignupTab: "Registrazione",
        tLoginBtn: "Accedi",
        tSignupBtn: "Registrati",
        tAddBtn: "Aggiungi",
        tSaveBtn: "Salva Modifiche",
        filterBrandDefault: "Tutte le marche",
        filterModelDefault: "Tutti i modelli",
        filterYearFromDefault: "Anno da",
        filterYearToDefault: "a",
        filterKMFromDefault: "km da",
        filterKMToDefault: "a",
        filterPriceFromDefault: "Prezzo da",
        filterPriceToDefault: "a",
        filterFuelDefault: "Carburante",
        fuelPetrol: "Benzina",
        fuelDiesel: "Diesel",
        fuelElectric: "Elettrico",
        fuelHybrid: "Ibrido",
        filterTransmissionDefault: "Trasmissione",
        transmissionAutomatic: "Automatica",
        transmissionManual: "Manuale",
        filterColorDefault: "Colore esterno",
        colorBlack: "Nero",
        colorWhite: "Bianco",
        colorGray: "Grigio",
        colorRed: "Rosso",
        colorBlue: "Blu",
        colorSilver: "Argento",
        colorGreen: "Verde",
        colorBeige: "Beige",
        filterInteriorColorDefault: "Colore interno",
        interiorBlack: "Nero",
        interiorGray: "Grigio",
        interiorBeige: "Beige",
        interiorBrown: "Marrone",
        interiorRed: "Rosso",
        interiorBlue: "Blu",
        interiorWhite: "Bianco",
        interiorCream: "Crema",
        filterEngineFromDefault: "Motore da (cm³)",
        engine0: "0",
        engine1000: "1.000",
        engine1500: "1.500",
        engine2000: "2.000",
        engine2500: "2.500",
        engine3000: "3.000",
        engine3500: "3.500",
        engine4000: "4.000",
        engine5000: "5.000",
        filterEngineToDefault: "a (cm³)",
        engineTo1000: "1.000",
        engineTo1500: "1.500",
        engineTo2000: "2.000",
        engineTo2500: "2.500",
        engineTo3000: "3.000",
        engineTo3500: "3.500",
        engineTo4000: "4.000",
        engineTo5000: "5.000",
        engineTo10000: "10.000",
        filterSeatsFromDefault: "Posti da",
        seats1: "1",
        seats2: "2",
        seats3: "3",
        seats4: "4",
        seats5: "5",
        seats6: "6",
        seats7: "7",
        seats8: "8",
        seats9: "9",
        filterSeatsToDefault: "a",
        seatsTo1: "1",
        seatsTo2: "2",
        seatsTo3: "3",
        seatsTo4: "4",
        seatsTo5: "5",
        seatsTo6: "6",
        seatsTo7: "7",
        seatsTo8: "8",
        seatsTo9: "9",
        seatsTo12: "12+",
        filterDoorsFromDefault: "Porte da",
        doors2: "2/3 porte",
        doors4: "4/5 porte",
        filterDoorsToDefault: "a",
        doorsTo2: "2/3 porte",
        doorsTo4: "4/5 porte",
        filterVehicleTypeDefault: "Tipo di veicolo",
        typeSedan: "Berlina",
        typeCoupe: "Coupé",
        typeSUV: "SUV",
        typeConvertible: "Cabriolet",
        typeEstate: "Station Wagon",
        typeCar: "Auto",
        typeOffroad: "Fuoristrada",
        filterMFKDefault: "Stato MFK",
        mfgNew: "Nuovo (≤ 1 anno)",
        mfgCurrent: "Attuale (≤ 2 anni)",
        mfgSoon: "Presto scadente (> 2 anni)",
        mfgWithout: "Senza MFK",
        filterCityDefault: "Posizione (Cantone)",
        filterDistanceDefault: "Distanza",
        distance10: "≤ 10 km",
        distance25: "≤ 25 km",
        distance50: "≤ 50 km",
        distance100: "≤ 100 km",
        distance200: "≤ 200 km",
        distance500: "≤ 500 km",
        distance1000: "≤ 1000 km",
        distanceAny: "Qualsiasi",
        addBrandDefault: "Seleziona marca",
        addModelDefault: "Seleziona modello",
        addVehicleTypeDefault: "Seleziona tipo di veicolo",
        addTypeSedan: "Berlina",
        addTypeCoupe: "Coupé",
        addTypeSUV: "SUV",
        addTypeConvertible: "Cabriolet",
        addTypeEstate: "Station Wagon",
        addTypeCar: "Auto",
        addTypeOffroad: "Fuoristrada",
        addYearDefault: "Seleziona anno",
        addEngineDefault: "Seleziona motore",
        addEngine1000: "1.000",
        addEngine1200: "1.200",
        addEngine1400: "1.400",
        addEngine1600: "1.600",
        addEngine1800: "1.800",
        addEngine2000: "2.000",
        addEngine2200: "2.200",
        addEngine2500: "2.500",
        addEngine3000: "3.000",
        addEngine3500: "3.500",
        addEngine4000: "4.000",
        addEngine4500: "4.500",
        addEngine5000: "5.000",
        addColorDefault: "Seleziona colore esterno",
        addColorBlack: "Nero",
        addColorWhite: "Bianco",
        addColorGray: "Grigio",
        addColorRed: "Rosso",
        addColorBlue: "Blu",
        addColorSilver: "Argento",
        addColorGreen: "Verde",
        addColorBeige: "Beige",
        addInteriorColorDefault: "Seleziona colore interno",
        addInteriorBlack: "Nero",
        addInteriorGray: "Grigio",
        addInteriorBeige: "Beige",
        addInteriorBrown: "Marrone",
        addInteriorRed: "Rosso",
        addInteriorBlue: "Blu",
        addInteriorWhite: "Bianco",
        addInteriorCream: "Crema",
        addSeatsDefault: "Seleziona posti",
        addSeats1: "1",
        addSeats2: "2",
        addSeats3: "3",
        addSeats4: "4",
        addSeats5: "5",
        addSeats6: "6",
        addSeats7: "7",
        addSeats8: "8",
        addSeats9: "9",
        addSeats12: "12+",
        addDoorsDefault: "Seleziona porte",
        addDoors2: "2/3 porte",
        addDoors4: "4/5 porte",
        addFuelDefault: "Seleziona carburante",
        addFuelPetrol: "Benzina",
        addFuelDiesel: "Diesel",
        addFuelElectric: "Elettrico",
        addFuelHybrid: "Ibrido",
        addTransmissionDefault: "Seleziona trasmissione",
        addTransmissionAutomatic: "Automatica",
        addTransmissionManual: "Manuale",
        addCityDefault: "Seleziona cantone",
        fileUploadText: "Seleziona immagini o trascina qui",
        fileUploadInfo: "Facoltativo: massimo 5 immagini, JPG/PNG fino a 5MB"
    }
};

// Basic functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast';
    
    if (isError) {
        toast.classList.add('error');
    }
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Shto këtë në fillim të JavaScript file
let currentPage = 'home'; // Variabël globale për të ndjekur faqen aktuale

function showPage(id) {
    // Ruaj faqen aktuale
    currentPage = id;
    
    // Fshi të gjitha seksionet
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    
    // Shfaq seksionin e zgjedhur
    const targetSection = document.getElementById(id);
    if (!targetSection) {
        console.warn(`Seksioni '${id}' nuk u gjet, duke shfaqur 'home'`);
        id = 'home';
        document.getElementById('home').classList.add('active');
    } else {
        targetSection.classList.add("active");
    }
    
    // Menaxho shfaqjen e filterit
    const sortingContainer = document.getElementById('sortingContainer');
    if (sortingContainer) {
        if (id === 'home') {
            sortingContainer.classList.add('show');
            // Kontrollo nëse filterCars ekziston para se ta thërrasësh
            if (typeof filterCars === 'function') {
                filterCars();
            }
        } else {
            sortingContainer.classList.remove('show');
        }
    }
    
    // Ruaj në URL hash për refresh
    window.location.hash = id;

    // Open Home at the real top of the document, not at the #home anchor.
    if (id === 'home') {
        requestAnimationFrame(() => window.scrollTo(0, 0));
    }
    
    // Menaxho logjikën specifike të faqes
    switch(id) {
        case 'stats':
            if (!currentUser || currentUser.username !== "admin") {
                showToast("Nur Admin kann Statistiken anzeigen!", true);
                showPage('home');
                return;
            }
            updateStats();
            break;
        case 'profile':
            if (!currentUser) {
                showToast("Bitte melden Sie sich an!", true);
                openAuthModal();
                return;
            }
            renderProfile();
            break;
        case 'favorites':
            renderFavorites();
            break;
        case 'map':
            initMap();
            break;
        case 'admin':
            if (!currentUser || currentUser.username !== "admin") {
                showToast("Nur Admin kann das Dashboard anzeigen!", true);
                showPage('home');
                return;
            }
            renderAdminDashboard();
            break;
        default:
            // Nuk bëj asgjë për faqet e tjera
            break;
    }
    
    // Update menu active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === id) {
            link.classList.add('active');
        }
    });
}

// Kur faqja ngarkohet, kontrollo hash dhe shfaq faqen e duhur
document.addEventListener('DOMContentLoaded', function() {
    // Kontrollo nëse ka hash në URL
    const hash = window.location.hash.substring(1); // Heq simbolin #
    
    // Lista e faqeve të vlefshme
    const validPages = ['home', 'stats', 'profile', 'favorites', 'map', 'admin'];
    
    if (hash && validPages.includes(hash)) {
        showPage(hash);
    } else {
        showPage('home'); // Default page
    }
});

// Gjithashtu shto këtë për të trajtuar butonin Home në navbar
document.addEventListener('DOMContentLoaded', function() {
    const homeLink = document.querySelector('[data-page="home"]');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            showPage('home');
        });
    }
});

function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userInfoContainer = document.getElementById('userInfoContainer');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const addCarLink = document.querySelector('a[onclick*="openAddModal"]');
    const adminUsersBtn = document.getElementById('adminUsersBtn');
    const profileBtn = document.getElementById('profileBtn');
    const favoritesLink = document.getElementById('favoritesLink');
    const mapLink = document.getElementById('mapLink');
    const messagesLink = document.getElementById('messagesLink');
    
    if (currentUser) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userInfoContainer) userInfoContainer.classList.remove('hidden');
        
        const user = users.find(u => u.id === currentUser.id);
        const firstName = user?.profile?.firstName || '';
        const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase();
        if (userAvatar) userAvatar.textContent = firstLetter;
        if (userName) userName.textContent = currentUser.username;
        
        if (addCarLink) {
            addCarLink.style.pointerEvents = 'auto';
            addCarLink.style.opacity = '1';
        }
        
        if (adminUsersBtn) {
            if (currentUser.username === "admin") {
                adminUsersBtn.style.display = 'inline-block';
            } else {
                adminUsersBtn.style.display = 'none';
            }
        }
        
        if (profileBtn) {
            profileBtn.style.display = 'inline-block';
        }
        
        if (favoritesLink) {
            favoritesLink.style.display = 'inline-block';
        }
        
        if (mapLink) {
            mapLink.style.display = 'inline-block';
        }
        
        if (messagesLink) {
            messagesLink.style.display = 'inline-block';
            updateMessagesBadge();
        }
        
        updateFavoritesBadge();
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userInfoContainer) userInfoContainer.classList.add('hidden');
        
        if (addCarLink) {
            addCarLink.style.pointerEvents = 'none';
            addCarLink.style.opacity = '0.5';
        }
        
        if (adminUsersBtn) {
            adminUsersBtn.style.display = 'none';
        }
        
        if (profileBtn) {
            profileBtn.style.display = 'none';
        }
        
        if (favoritesLink) {
            favoritesLink.style.display = 'inline-block';
        }
        
        if (mapLink) {
            mapLink.style.display = 'inline-block';
        }
        
        if (messagesLink) {
            messagesLink.style.display = 'none';
        }
    }
    
    if (typeof render === 'function') {
        render();
    }
}

if (cars.length > 0) {
    cars = cars.map(car => {
        if (!car.sellerType) {
            car.sellerType = 'private';
        }
        return car;
    });
    localStorage.setItem("cars", JSON.stringify(cars));
}

function updateMessagesBadge() {
    if (!currentUser) return;
    
    const messagesBadge = document.getElementById('messagesBadge');
    if (!messagesBadge) return;
    
    const unreadCount = messages.filter(msg => 
        msg.receiverId === currentUser.id && !msg.read
    ).length;
    
    if (unreadCount > 0) {
        messagesBadge.textContent = unreadCount;
        messagesBadge.style.display = 'flex';
    } else {
        messagesBadge.style.display = 'none';
    }
}

function toggleExtraFilters() {
    const extraFilters = document.getElementById('extraFilters');
    const toggleBtn = document.querySelector('.extra-filters-toggle');
    const hideBtn = document.getElementById('hideFiltersBtn');
    
    if (!extraFilters || !toggleBtn || !hideBtn) return;
    
    extraFilters.classList.toggle('active');
    
    if (extraFilters.classList.contains('active')) {
        toggleBtn.style.display = 'none';
        hideBtn.classList.add('show');
    } else {
        toggleBtn.style.display = 'inline-flex';
        hideBtn.classList.remove('show');
    }
    updateTranslations();
}

function openAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'flex';
    }
    switchAuthTab('login');
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
    
    const loginIdentifier = document.getElementById('loginIdentifier');
    const loginPassword = document.getElementById('loginPassword');
    const signupFirstName = document.getElementById('signupFirstName');
    const signupLastName = document.getElementById('signupLastName');
    const signupUsername = document.getElementById('signupUsername');
    const signupEmail = document.getElementById('signupEmail');
    const signupPhone = document.getElementById('signupPhone');
    const signupAddress = document.getElementById('signupAddress');
    const signupPassword = document.getElementById('signupPassword');
    const signupConfirmPassword = document.getElementById('signupConfirmPassword');
    
    if (loginIdentifier) loginIdentifier.value = '';
    if (loginPassword) loginPassword.value = '';
    if (signupFirstName) signupFirstName.value = '';
    if (signupLastName) signupLastName.value = '';
    if (signupUsername) signupUsername.value = '';
    if (signupEmail) signupEmail.value = '';
    if (signupPhone) signupPhone.value = '';
    if (signupAddress) signupAddress.value = '';
    if (signupPassword) signupPassword.value = '';
    if (signupConfirmPassword) signupConfirmPassword.value = '';
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('tLoginTab');
    const signupTab = document.getElementById('tSignupTab');
    
    if (!loginForm || !signupForm || !loginTab || !signupTab) return;
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

function loginUser() {
    const identifier = document.getElementById('loginIdentifier');
    const password = document.getElementById('loginPassword');
    
    if (!identifier || !password) {
        showToast("Bitte Benutzername/E-Mail und Passwort eingeben!", true);
        return;
    }
    
    const identifierValue = identifier.value.trim();
    const passwordValue = password.value.trim();
    
    if (!identifierValue || !passwordValue) {
        showToast("Bitte Benutzername/E-Mail und Passwort eingeben!", true);
        return;
    }
    
    const user = users.find(u => 
        (u.username === identifierValue || u.email === identifierValue) && 
        u.password === passwordValue
    );
    
    if (user) {
        currentUser = {
            id: user.id,
            username: user.username
        };
        
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        
        updateUserUI();
        closeAuthModal();
        showToast("Erfolgreich eingeloggt!");
    } else {
        showToast("Falscher Benutzername/E-Mail oder Passwort!", true);
    }
}

function signupUser() {
    const firstName = document.getElementById('signupFirstName');
    const lastName = document.getElementById('signupLastName');
    const username = document.getElementById('signupUsername');
    const email = document.getElementById('signupEmail');
    const phone = document.getElementById('signupPhone');
    const address = document.getElementById('signupAddress');
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('signupConfirmPassword');
    
    if (!firstName || !lastName || !username || !email || !phone || !address || !password || !confirmPassword) {
        showToast("Bitte füllen Sie alle Felder aus!", true);
        return;
    }
    
    const firstNameValue = firstName.value.trim();
    const lastNameValue = lastName.value.trim();
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phone.value.trim();
    const addressValue = address.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();
    
    if (!firstNameValue || !lastNameValue || !usernameValue || !emailValue || !phoneValue || !addressValue || !passwordValue || !confirmPasswordValue) {
        showToast("Bitte füllen Sie alle Felder aus!", true);
        return;
    }
    
    if (passwordValue.length < 6) {
        showToast("Passwort muss mindestens 6 Zeichen lang sein!", true);
        return;
    }
    
    if (passwordValue !== confirmPasswordValue) {
        showToast("Passwörter stimmen nicht überein!", true);
        return;
    }
    
    const userExists = users.some(u => u.username === usernameValue || u.email === emailValue);
    
    if (userExists) {
        showToast("Benutzername oder E-Mail bereits vergeben!", true);
        return;
    }
    
    const newUser = {
        id: generateId(),
        username: usernameValue,
        email: emailValue,
        password: passwordValue,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        profile: {
            firstName: firstNameValue,
            lastName: lastNameValue,
            phone: phoneValue,
            address: addressValue,
            avatar: null
        }
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    currentUser = {
        id: newUser.id,
        username: newUser.username
    };
    
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    
    updateUserUI();
    closeAuthModal();
    showToast("Konto erfolgreich erstellt!");
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem("currentUser");
    updateUserUI();
    showToast("Erfolgreich ausgeloggt!");
    showPage('home');
}

// Car functions
function render(filteredCars = cars) {
    const container = document.getElementById('carsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Për përdoruesit e rregullt, shfaq vetëm makinat e aprovuara
    // Admini shikon të gjitha makinat
    let carsToRender = filteredCars;
    if (currentUser && currentUser.username !== "admin") {
        carsToRender = filteredCars.filter(car => car.status === "approved");
    }
    
    if (carsToRender.length === 0) {
        container.innerHTML = '<div class="no-cars">Keine Fahrzeuge gefunden</div>';
        return;
    }
    
    carsToRender.forEach((car, index) => {
        const card = document.createElement('div');
        card.className = 'car-card';
        
        const carouselId = `carousel-${index}`;
        const isFavorite = favorites.some(f => f.carId === car.id && f.userId === (currentUser?.id || ''));
        
        let description = car.km ? car.km.toLocaleString() + ' km' : '';
        if (car.engine) description += (description ? ' | ' : '') + car.engine + ' cm³';
        if (car.transmission) description += (description ? ' | ' : '') + car.transmission;
        if (car.city) description += (description ? ' | ' : '') + car.city;
        
        const canEditDelete = currentUser && (car.ownerId === currentUser.id || currentUser.username === "admin");
        
        card.innerHTML = `
            <div class="favorite-icon ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(event, '${car.id}')">
                <i class="fas fa-heart"></i>
            </div>
            <div class="carousel-container" id="${carouselId}">
            </div>
            <div class="car-content">
                <h3>${car.n} ${car.m ? car.m + ' ' : ''}(${car.year || ''})</h3>
                <p>${description}</p>
                <p class="car-price">${car.p ? car.p.toLocaleString() + ' CHF' : ''}</p>
                <div class="car-owner">
                    <i class="fas fa-user"></i>
                    Hinzugefügt von: ${car.ownerName}
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                    <i class="fas fa-eye"></i> Details anzeigen
                </div>
                <div class="buttons-container">
                    ${canEditDelete ? `
                    <button class="edit-btn" onclick="event.stopPropagation(); openEditModal(${index})">Bearbeiten</button>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteCar(${index})">Löschen</button>
                    ` : ''}
                    ${currentUser && car.ownerId !== currentUser.id ? `
                    <button class="signup-btn" onclick="event.stopPropagation(); openContactModal(${index})">
                        <i class="fas fa-comment"></i> Kontaktieren
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        setTimeout(() => {
            initCarousel(carouselId, car.images);
        }, 0);
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.carousel-prev') && 
                !e.target.closest('.carousel-next') && 
                !e.target.closest('.carousel-dot') &&
                !e.target.closest('button') &&
                !e.target.closest('.favorite-icon') &&
                !e.target.closest('.contact-seller-btn')) {
                openCarDetailModal(index);
            }
        });
    });
}

function filterCars() {
    
    const filterExtras = JSON.parse(sessionStorage.getItem('filterExtras')) || [];
    const searchBox = document.getElementById('searchBox');
    const filterBrand = document.getElementById('filterBrand');
    const filterModel = document.getElementById('filterModel');
    const filterYearFrom = document.getElementById('filterYearFrom');
    const filterYearTo = document.getElementById('filterYearTo');
    const filterKMFrom = document.getElementById('filterKMFrom');
    const filterKMTo = document.getElementById('filterKMTo');
    const filterPriceFrom = document.getElementById('filterPriceFrom');
    const filterPriceTo = document.getElementById('filterPriceTo');
    const filterFuel = document.getElementById('filterFuel');
    const filterTransmission = document.getElementById('filterTransmission');
    const filterColor = document.getElementById('filterColor');
    const filterCity = document.getElementById('filterCity');
    const sortFilter = document.getElementById('sortFilter');

        if (filterExtras.length > 0) {
                if (!car.extras || !filterExtras.every(extra => car.extras.includes(extra))) {
                    return false;
                }
            }
    
    if (!searchBox || !filterBrand || !filterModel) return;

    // Lexo input-in, por mos vendos asgjë nga currentUser
    const searchText = searchBox.value ? searchBox.value.toLowerCase().trim() : '';
    const brand = filterBrand.value || '';
    const model = filterModel.value || '';
    const yearFrom = filterYearFrom?.value ? parseInt(filterYearFrom.value) : null;
    const yearTo = filterYearTo?.value ? parseInt(filterYearTo.value) : null;
    const kmFrom = filterKMFrom?.value ? parseInt(filterKMFrom.value) : null;
    const kmTo = filterKMTo?.value ? parseInt(filterKMTo.value) : null;
    const priceFrom = filterPriceFrom?.value ? parseFloat(filterPriceFrom.value) : null;
    const priceTo = filterPriceTo?.value ? parseFloat(filterPriceTo.value) : null;
    const fuel = filterFuel?.value || '';
    const transmission = filterTransmission?.value || '';
    const color = filterColor?.value || '';
    const city = filterCity?.value || '';
    const sortOption = sortFilter?.value || '';

    // Filtrim i makinave
    let filtered = cars.filter(car => {
        // Vetëm makinat e aprovuara për përdorues jo-admin
        if (car.status !== "approved" && (!currentUser || currentUser.username !== "admin")) {
            return false;
        }

        const matchesSearch =
            !searchText ||
            car.n?.toLowerCase().includes(searchText) ||
            car.m?.toLowerCase().includes(searchText) ||
            car.city?.toLowerCase().includes(searchText) ||
            car.color?.toLowerCase().includes(searchText) ||
            car.description?.toLowerCase().includes(searchText);

        return (
            matchesSearch &&
            (!brand || car.n === brand) &&
            (!model || car.m === model) &&
            (!yearFrom || car.year >= yearFrom) &&
            (!yearTo || car.year <= yearTo) &&
            (!kmFrom || car.km >= kmFrom) &&
            (!kmTo || car.km <= kmTo) &&
            (!priceFrom || car.p >= priceFrom) &&
            (!priceTo || car.p <= priceTo) &&
            (!fuel || car.fuel === fuel) &&
            (!transmission || car.transmission === transmission) &&
            (!color || car.color === color) &&
            (!city || car.city === city)
        );
    });

    // Sortim
    if (sortOption === "priceAsc") filtered.sort((a, b) => a.p - b.p);
    else if (sortOption === "priceDesc") filtered.sort((a, b) => b.p - a.p);
    else if (sortOption === "kmAsc") filtered.sort((a, b) => a.km - b.km);
    else if (sortOption === "kmDesc") filtered.sort((a, b) => b.km - a.km);
    else if (sortOption === "yearAsc") filtered.sort((a, b) => a.year - b.year);
    else if (sortOption === "yearDesc") filtered.sort((a, b) => b.year - a.year);
 
    if (filterExtras.length > 0) {
             if (!car.extras || !filterExtras.every(extra => car.extras.includes(extra))) {
                 return false;
             }
         }
    
    render(filtered);
    // Përditëso filter-at aktualë për Map
currentHomeFilters = getHomeFilters();

// Nëse mapa është e hapur, përditëso atë
if (document.getElementById('map').offsetParent !== null) {
    updateMap();
}
    // Përditësimi i numrit të rezultateve
    updateResultsCount(filtered.length);
}

function updateResultsCount(count) {
    const resultsElement = document.getElementById('resultsCount');
    if (resultsElement) {
        const t = translations[currentLang];
        resultsElement.textContent = `${count} ${t.tCars || 'Fahrzeuge'} gefunden`;
    }
}

function clearFilters() {
    const searchBox = document.getElementById('searchBox');
    const filterBrand = document.getElementById('filterBrand');
    const filterModel = document.getElementById('filterModel');
    const filterYearFrom = document.getElementById('filterYearFrom');
    const filterYearTo = document.getElementById('filterYearTo');
    const filterKMFrom = document.getElementById('filterKMFrom');
    const filterKMTo = document.getElementById('filterKMTo');
    const filterPriceFrom = document.getElementById('filterPriceFrom');
    const filterPriceTo = document.getElementById('filterPriceTo');
    const filterFuel = document.getElementById('filterFuel');
    const filterTransmission = document.getElementById('filterTransmission');
    const filterColor = document.getElementById('filterColor');
    const filterCity = document.getElementById('filterCity');
    const sortFilter = document.getElementById('sortFilter');
    
    if (searchBox) searchBox.value = '';
    if (filterBrand) filterBrand.value = '';
    if (filterModel) filterModel.value = '';
    if (filterYearFrom) filterYearFrom.value = '';
    if (filterYearTo) filterYearTo.value = '';
    if (filterKMFrom) filterKMFrom.value = '';
    if (filterKMTo) filterKMTo.value = '';
    if (filterPriceFrom) filterPriceFrom.value = '';
    if (filterPriceTo) filterPriceTo.value = '';
    if (filterFuel) filterFuel.value = '';
    if (filterTransmission) filterTransmission.value = '';
    if (filterColor) filterColor.value = '';
    if (filterCity) filterCity.value = '';
    if (sortFilter) sortFilter.value = '';
    
    filterCars();
}

// Initialize carousel with swipe support
function initCarousel(carouselId, images) {
    const container = document.getElementById(carouselId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!images || images.length === 0) {
        const img = document.createElement('img');
        img.src = 'https://via.placeholder.com/400x200?text=No+Image';
        img.className = 'carousel-slide active';
        container.appendChild(img);
        return;
    }
    
    images.forEach((imgSrc, index) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        img.alt = `Image ${index + 1}`;
        container.appendChild(img);
    });
    
    if (images.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-prev';
        prevBtn.innerHTML = '❮';
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeSlide(carouselId, -1);
        });
        container.appendChild(prevBtn);
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-next';
        nextBtn.innerHTML = '❯';
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeSlide(carouselId, 1);
        });
        container.appendChild(nextBtn);
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-controls';
        
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(carouselId, index);
            });
            dotsContainer.appendChild(dot);
        });
        
        container.appendChild(dotsContainer);
        
        let startX = 0;
        let endX = 0;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        }, { passive: true });
        
        container.addEventListener('touchend', (e) => {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    changeSlide(carouselId, 1);
                } else {
                    changeSlide(carouselId, -1);
                }
            }
        });
    }
}

function changeSlide(carouselId, direction) {
    const container = document.getElementById(carouselId);
    if (!container) return;
    
    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.carousel-dot');
    
    let activeIndex = 0;
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            activeIndex = index;
        }
    });
    
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;
    
    showSlide(carouselId, newIndex);
}

function showSlide(carouselId, index) {
    const container = document.getElementById(carouselId);
    if (!container) return;
    
    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.carousel-dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
}

// Add car modal functions
function openAddModal() {
    if (!currentUser) {
        showToast("Bitte melden Sie sich an, um ein Fahrzeug hinzuzufügen!", true);
        openAuthModal();
        return;
    }
     addSelectedExtras = [];
    updateAddExtrasPreview();
    
    selectedFiles = [];
    const filePreview = document.getElementById('filePreview');
    if (filePreview) {
        filePreview.innerHTML = '';
    }
    
    const addModal = document.getElementById('addModal');
    if (addModal) {
        addModal.style.display = 'flex';
    }
      addSelectedExtras = [];
    updateAddExtrasPreview();
    
}

function closeAddModal() {
    const addModal = document.getElementById('addModal');
    if (addModal) {
        addModal.style.display = 'none';
    }
    resetAddForm();
}

function addCar() {
    if (!currentUser) {
        showToast("Bitte melden Sie sich an!", true);
        return;
    }
    
    const name = document.getElementById('name');
    const model = document.getElementById('model');
    const vehicleType = document.getElementById('vehicleType');
    const year = document.getElementById('year');
    const km = document.getElementById('km');
    const engine = document.getElementById('engine');
    const color = document.getElementById('color');
    const interiorColor = document.getElementById('interiorColor');
    const seats = document.getElementById('seats');
    const doors = document.getElementById('doors');
    const fuel = document.getElementById('fuel');
    const transmission = document.getElementById('transmission');
    const price = document.getElementById('price');
    const sellerType = document.getElementById('sellerType');
    const city = document.getElementById('city');
    const inspectionDate = document.getElementById('inspectionDate');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const description = document.getElementById('description');
    
    if (!name || !model || !vehicleType || !year || !km || !fuel || !transmission || !price || !city) {
        showToast("Bitte füllen Sie alle erforderlichen Felder aus!", true);
        return;
    }
    
    const nameValue = name.value;
    const modelValue = model.value;
    const vehicleTypeValue = vehicleType.value;
    const yearValue = year.value;
    const kmValue = parseInt(km.value);
    const engineValue = engine.value ? parseInt(engine.value) : null;
    const colorValue = color.value;
    const interiorColorValue = interiorColor.value;
    const seatsValue = seats.value ? parseInt(seats.value) : null;
    const doorsValue = doors.value ? parseInt(doors.value) : null;
    const fuelValue = fuel.value;
    const transmissionValue = transmission.value;
    const priceValue = parseFloat(price.value);
    const sellerTypeValue = sellerType?.value || 'private';
    const cityValue = city.value;
    const inspectionDateValue = inspectionDate.value;
    const phoneValue = phone.value.trim();
    const emailValue = email.value.trim();
    const descriptionValue = description.value.trim();
    
    if (!nameValue || !modelValue || !vehicleTypeValue || !yearValue || !kmValue || !fuelValue || !transmissionValue || !priceValue || !cityValue) {
        showToast("Bitte füllen Sie alle erforderlichen Felder aus!", true);
        return;
    }
    
    const newCar = {
        id: generateId(),
        ownerId: currentUser.id,
        ownerName: currentUser.username,
        n: nameValue,
        m: modelValue,
        vehicleType: vehicleTypeValue,
        year: parseInt(yearValue),
        km: kmValue,
        engine: engineValue,
        color: colorValue,
        interiorColor: interiorColorValue,
        seats: seatsValue,
        doors: doorsValue,
        fuel: fuelValue,
        transmission: transmissionValue,
        p: priceValue,
        city: cityValue,
        inspectionDate: inspectionDateValue,
        phone: phoneValue,
        email: emailValue,
        description: descriptionValue,
        createdAt: new Date().toISOString(),
        images: [],
        status: "pending",
        approvedAt: null,
        rejectedAt: null,
        adminNotes: "",
        sellerType: sellerTypeValue,
        extras: addSelectedExtras,
    };
    
    if (selectedFiles.length > 0) {
        const readers = [];
        let loadedCount = 0;
        
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            readers.push(reader);
            
            reader.onload = function(e) {
                newCar.images.push(e.target.result);
                loadedCount++;
                
                if (loadedCount === selectedFiles.length) {
                    cars.push(newCar);
                    localStorage.setItem("cars", JSON.stringify(cars));
                    render();
                    closeAddModal();
                    resetAddForm();
                    filterCars();
                    showToast("Fahrzeug erfolgreich hinzugefügt!");
                    updatePendingCarsCount();
                }
            };
            
            reader.readAsDataURL(file);
        });
    } else {
        newCar.images = ['https://via.placeholder.com/400x200?text=No+Image'];
        cars.push(newCar);
        localStorage.setItem("cars", JSON.stringify(cars));
        render();
        closeAddModal();
        resetAddForm();
        filterCars();
        showToast("Fahrzeug erfolgreich hinzugefügt!");
        updatePendingCarsCount();
    }
}

function resetAddForm() {
    const name = document.getElementById('name');
    const model = document.getElementById('model');
    const vehicleType = document.getElementById('vehicleType');
    const year = document.getElementById('year');
    const km = document.getElementById('km');
    const engine = document.getElementById('engine');
    const color = document.getElementById('color');
    const interiorColor = document.getElementById('interiorColor');
    const seats = document.getElementById('seats');
    const doors = document.getElementById('doors');
    const fuel = document.getElementById('fuel');
    const transmission = document.getElementById('transmission');
    const price = document.getElementById('price');
    const city = document.getElementById('city');
    const inspectionDate = document.getElementById('inspectionDate');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const description = document.getElementById('description');
    const imageFiles = document.getElementById('imageFiles');
    const filePreview = document.getElementById('filePreview');
    
    if (name) name.value = '';
    if (model) model.value = '';
    if (vehicleType) vehicleType.value = '';
    if (year) year.value = '';
    if (km) km.value = '';
    if (engine) engine.value = '';
    if (color) color.value = '';
    if (interiorColor) interiorColor.value = '';
    if (seats) seats.value = '';
    if (doors) doors.value = '';
    if (fuel) fuel.value = '';
    if (transmission) transmission.value = '';
    if (price) price.value = '';
    if (city) city.value = '';
    if (inspectionDate) inspectionDate.value = '';
    if (phone) phone.value = '';
    if (email) email.value = '';
    if (description) description.value = '';
    if (imageFiles) imageFiles.value = '';
    if (filePreview) filePreview.innerHTML = '';
    
    selectedFiles = [];
}

// Edit car functions
function openEditModal(index) {
    const car = cars[index];
    
    if (!currentUser) {
        showToast("Bitte melden Sie sich an!", true);
        openAuthModal();
        return;
    }
    
    if (car.ownerId !== currentUser.id && currentUser.username !== "admin") {
        showToast("Sie können nur Ihre eigenen Fahrzeuge bearbeiten!", true);
        return;
    }
    
    currentEditIndex = index;
    
    editSelectedFiles = [];
    const editFilePreview = document.getElementById('editFilePreview');
    if (editFilePreview) {
        editFilePreview.innerHTML = '';
    }
    
    const editIndex = document.getElementById('editIndex');
    const editName = document.getElementById('editName');
    const editModel = document.getElementById('editModel');
    const editVehicleType = document.getElementById('editVehicleType');
    const editYear = document.getElementById('editYear');
    const editKm = document.getElementById('editKm');
    const editEngine = document.getElementById('editEngine');
    const editColor = document.getElementById('editColor');
    const editInteriorColor = document.getElementById('editInteriorColor');
    const editSeats = document.getElementById('editSeats');
    const editDoors = document.getElementById('editDoors');
    const editFuel = document.getElementById('editFuel');
    const editTransmission = document.getElementById('editTransmission');
    const editPrice = document.getElementById('editPrice');
    const editCity = document.getElementById('editCity');
    const editInspectionDate = document.getElementById('editInspectionDate');
    const editPhone = document.getElementById('editPhone');
    const editEmail = document.getElementById('editEmail');
    const editDescription = document.getElementById('editDescription');
    const editSellerType = document.getElementById('editSellerType');
    
    if (editIndex) editIndex.value = index;
    if (editName) editName.value = car.n || '';
    if (editModel) editModel.value = car.m || '';
    if (editVehicleType) editVehicleType.value = car.vehicleType || '';
    if (editYear) editYear.value = car.year || '';
    if (editKm) editKm.value = car.km || '';
    if (editEngine) editEngine.value = car.engine || '';
    if (editColor) editColor.value = car.color || '';
    if (editInteriorColor) editInteriorColor.value = car.interiorColor || '';
    if (editSeats) editSeats.value = car.seats || '';
    if (editDoors) editDoors.value = car.doors || '';
    if (editFuel) editFuel.value = car.fuel || '';
    if (editTransmission) editTransmission.value = car.transmission || '';
    if (editPrice) editPrice.value = car.p || '';
    if (editCity) editCity.value = car.city || '';
    if (editInspectionDate) editInspectionDate.value = car.inspectionDate || '';
    if (editPhone) editPhone.value = car.phone || '';
    if (editEmail) editEmail.value = car.email || '';
    if (editDescription) editDescription.value = car.description || '';
    if (editSellerType) editSellerType.value = car.sellerType || 'private';

    const currentImagesContainer = document.getElementById('currentImagesContainer');
    if (currentImagesContainer) {
        currentImagesContainer.innerHTML = '';
        
        if (car.images && car.images.length > 0) {
            car.images.forEach((img, imgIndex) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'file-preview-item';
                previewItem.innerHTML = `
                    <img src="${img}" alt="Aktuelles Bild">
                `;
                currentImagesContainer.appendChild(previewItem);
            });
        }
    }
    
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.style.display = 'flex';
    }
        editSelectedExtras = car.extras || [];
    updateEditExtrasPreview();
    
}


function closeEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.style.display = 'none';
    }
    currentEditIndex = -1;
    editSelectedFiles = [];
}

function saveEdit() {
    const index = currentEditIndex;
    
    if (index === -1 || index >= cars.length) {
        showToast("Error: Invalid vehicle index!", true);
        return;
    }
    
    const car = cars[index];
    
    if (car.ownerId !== currentUser.id && currentUser.username !== "admin") {
        showToast("Sie können nur Ihre eigenen Fahrzeuge bearbeiten!", true);
        return;
    }
    
    const editName = document.getElementById('editName');
    const editModel = document.getElementById('editModel');
    const editVehicleType = document.getElementById('editVehicleType');
    const editYear = document.getElementById('editYear');
    const editKm = document.getElementById('editKm');
    const editEngine = document.getElementById('editEngine');
    const editColor = document.getElementById('editColor');
    const editInteriorColor = document.getElementById('editInteriorColor');
    const editSeats = document.getElementById('editSeats');
    const editDoors = document.getElementById('editDoors');
    const editFuel = document.getElementById('editFuel');
    const editTransmission = document.getElementById('editTransmission');
    const editPrice = document.getElementById('editPrice');
    const editCity = document.getElementById('editCity');
    const editInspectionDate = document.getElementById('editInspectionDate');
    const editPhone = document.getElementById('editPhone');
    const editEmail = document.getElementById('editEmail');
    const editDescription = document.getElementById('editDescription');
    
    if (!editName || !editModel || !editVehicleType || !editYear || !editKm || !editFuel || !editTransmission || !editPrice || !editCity) {
        showToast("Bitte füllen Sie alle erforderlichen Felder aus!", true);
        return;
    }
    
    const name = editName.value;
    const model = editModel.value;
    const vehicleType = editVehicleType.value;
    const year = editYear.value;
    const km = parseInt(editKm.value);
    const engine = editEngine.value ? parseInt(editEngine.value) : null;
    const color = editColor.value;
    const interiorColor = editInteriorColor.value;
    const seats = editSeats.value ? parseInt(editSeats.value) : null;
    const doors = editDoors.value ? parseInt(editDoors.value) : null;
    const fuel = editFuel.value;
    const transmission = editTransmission.value;
    const price = parseFloat(editPrice.value);
    const city = editCity.value;
    const inspectionDate = editInspectionDate.value;
    const phone = editPhone.value.trim();
    const email = editEmail.value.trim();
    const description = editDescription.value.trim();
    
    if (!name || !model || !vehicleType || !year || !km || !fuel || !transmission || !price || !city) {
        showToast("Bitte füllen Sie alle erforderlichen Felder aus!", true);
        return;
    }
    
    const updatedCar = {
        ...car,
        n: name,
        m: model,
        vehicleType: vehicleType,
        year: parseInt(year),
        km: km,
        engine: engine,
        color: color,
        interiorColor: interiorColor,
        seats: seats,
        doors: doors,
        fuel: fuel,
        transmission: transmission,
        p: price,
        city: city,
        inspectionDate: inspectionDate,
        phone: phone,
        email: email,
        description: description,
        updatedAt: new Date().toISOString(),
        extras: editSelectedExtras,
    };
    
    if (editSelectedFiles.length > 0) {
        const readers = [];
        let loadedCount = 0;
        
        editSelectedFiles.forEach((file, fileIndex) => {
            const reader = new FileReader();
            readers.push(reader);
            
            reader.onload = function(e) {
                updatedCar.images.push(e.target.result);
                loadedCount++;
                
                if (loadedCount === editSelectedFiles.length) {
                    cars[index] = updatedCar;
                    localStorage.setItem("cars", JSON.stringify(cars));
                    render();
                    closeEditModal();
                    filterCars();
                    showToast("Fahrzeug erfolgreich aktualisiert!");
                }
            };
            
            reader.readAsDataURL(file);
        });
    } else {
        cars[index] = updatedCar;
        localStorage.setItem("cars", JSON.stringify(cars));
        render();
        closeEditModal();
        filterCars();
        showToast("Fahrzeug erfolgreich aktualisiert!");
    }
}

function deleteCar(index) {
    const car = cars[index];
    
    if (car.ownerId !== currentUser.id && currentUser.username !== "admin") {
        showToast("Sie können nur Ihre eigenen Fahrzeuge löschen!", true);
        return;
    }
    
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    
    cars.splice(index, 1);
    localStorage.setItem("cars", JSON.stringify(cars));
    render();
    filterCars();
    showToast("Fahrzeug erfolgreich gelöscht!");
}

// Car detail modal with swipe support
function openCarDetailModal(index) {
    currentCarDetailIndex = index;
    const car = cars[index];
    
    const detailContent = document.getElementById('carDetailContent');
    if (!detailContent) return;
        // Inicializo kur ngarkohet faqja

        document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
        initExtrasGrids();
        updateExtrasLanguage();
        
        // Inicializo filter extras
        currentExtrasMode = 'filter';
        const filterExtras = JSON.parse(sessionStorage.getItem('filterExtras')) || [];
        selectedExtras = filterExtras;
        updateExtrasCount();
        
        // Inicializo add extras
        addSelectedExtras = [];
        updateAddExtrasPreview();
        
        // Inicializo edit extras
        editSelectedExtras = [];
        updateEditExtrasPreview();
    }, 100);
});
    detailContent.innerHTML = `
        <div class="car-detail-container">
            <div class="car-detail-images">
                <img id="mainDetailImage" src="${car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/800x400?text=No+Image'}" 
                     alt="${car.n} ${car.m}" class="main-image">
                <div class="thumbnail-container" id="detailThumbnails">
                    ${car.images && car.images.length > 0 ? car.images.map((img, idx) => `
                        <img src="${img}" class="thumbnail ${idx === 0 ? 'active' : ''}" 
                             onclick="changeDetailImage(${idx})" alt="Thumbnail ${idx + 1}">
                    `).join('') : ''}
                </div>

                ${car.description ? `
                <div class="description-box">
                    <h3>Beschreibung</h3>
                    <p>${car.description}</p>
                </div>
                ` : ''}

                <div class="contact-info">
                    <h3>Kontaktinformationen</h3>
                    <div class="contact-item">
                        <i class="fas fa-user"></i>
                        <span>${car.ownerName}</span>
                    </div>
                    ${car.phone ? `
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${car.phone}</span>
                    </div>
                    ` : ''}
                    ${car.email ? `
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${car.email}</span>
                    </div>
                    ` : ''}
                </div>

                ${car.extras && car.extras.length > 0 ? `
                <div class="extras-category" style="margin-top: 15px;">
                    <h3><i class="fas fa-check-circle"></i> Extras / Ausstattung</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${car.extras.map(extra => `<span class="selected-extras-tag">${extra}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="car-detail-info">
                <h2>${car.n} ${car.m} (${car.year || ''})</h2>
                <div class="car-price-large">${car.p ? car.p.toLocaleString() + ' CHF' : ''}</div>
                
                <div class="car-specs">
                    <div class="spec-item">
                        <div class="spec-label">Kilometer</div>
                        <div class="spec-value">${car.km ? car.km.toLocaleString() + ' km' : '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Hubraum</div>
                        <div class="spec-value">${car.engine ? car.engine + ' cm³' : '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Kraftstoff</div>
                        <div class="spec-value">${car.fuel || '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Getriebe</div>
                        <div class="spec-value">${car.transmission || '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Außenfarbe</div>
                        <div class="spec-value">${car.color || '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Innenfarbe</div>
                        <div class="spec-value">${car.interiorColor || '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Sitzplätze</div>
                        <div class="spec-value">${car.seats || '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Türen</div>
                        <div class="spec-value">${car.doors || '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Kanton</div>
                        <div class="spec-value">${car.city || '-'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">MFK</div>
                        <div class="spec-value">${car.inspectionDate ? new Date(car.inspectionDate).toLocaleDateString('de-CH') : '-'}</div>
                    </div>
                    
                    <div class="car-status ${car.status === 'approved' ? 'status-approved' : car.status === 'pending' ? 'status-pending' : 'status-rejected'}" style="${currentUser && currentUser.username === 'admin' ? '' : 'display: none;'}">
                        <i class="fas ${car.status === 'approved' ? 'fa-check-circle' : car.status === 'pending' ? 'fa-clock' : 'fa-times-circle'}"></i>
                        ${car.status === 'approved' ? 'Aprovuar' : car.status === 'pending' ? 'Në Pritje' : 'Refuzuar'}
                    </div>

                    <div class="car-owner">
                        <i class="fas fa-user"></i>
                        Hinzugefügt von: ${car.ownerName}
                        ${car.sellerType === 'handler' ? ' <span style="color: var(--warning);">(Händler)</span>' : ' <span style="color: var(--info);">(Privat)</span>'}
                    </div>

                    <div class="spec-item detail-mfk-old">
                        <div class="spec-label">MFK</div>
                        <div class="spec-value">${car.inspectionDate ? new Date(car.inspectionDate).toLocaleDateString('de-CH') : '-'}</div>
                    </div>
                </div>
                
                <div class="buttons-container" style="margin-top: 20px;">
                    ${currentUser && car.ownerId !== currentUser.id ? `
                    <button class="signup-btn" onclick="openContactModal(${index})" style="flex: 1;">
                        <i class="fas fa-comment"></i> Verkäufer kontaktieren
                    </button>
                    ` : ''}
                    
                    <div class="share-buttons" style="margin-top: 20px;">
                        <button class="share-btn share-facebook" onclick="shareOnFacebook('${car.id}')">
                            <i class="fab fa-facebook-f"></i> Facebook
                        </button>
                        <button class="share-btn share-whatsapp" onclick="shareOnWhatsApp('${car.id}')">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button class="share-btn share-copy" onclick="copyCarShareLink('${car.id}')">
                            <i class="fas fa-copy"></i> Link kopieren
                        </button>
                    </div>
                </div>
                
                ${(currentUser && (car.ownerId === currentUser.id || currentUser.username === "admin")) ? `
                <div class="buttons-container" style="margin-top: 20px;">
                    <button class="edit-btn" onclick="openEditModal(${index}); closeCarDetailModal()" style="flex: 1;">
                        Bearbeiten
                    </button>
                    <button class="delete-btn" onclick="deleteCar(${index}); closeCarDetailModal()" style="flex: 1;">
                        Löschen
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    const carDetailModal = document.getElementById('carDetailModal');
    if (carDetailModal) {
        carDetailModal.style.display = 'flex';
    }
    
    const mainImage = document.getElementById('mainDetailImage');
    if (mainImage) {
        mainImage.style.cursor = 'zoom-in';
        mainImage.title = 'Bild im Vollbild öffnen';

        mainImage.addEventListener('click', () => {
            const car = cars[currentCarDetailIndex];
            if (!car || !car.images || car.images.length === 0) return;
            const activeThumbIndex = Array.from(document.querySelectorAll('.thumbnail')).findIndex(thumb => thumb.classList.contains('active'));
            openFullscreenImage(car.images, activeThumbIndex >= 0 ? activeThumbIndex : 0);
        });

        let startX = 0;
        let endX = 0;
        
        mainImage.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        mainImage.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        }, { passive: true });
        
        mainImage.addEventListener('touchend', (e) => {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                const car = cars[currentCarDetailIndex];
                if (!car || !car.images || car.images.length <= 1) return;
                
                const thumbnails = document.querySelectorAll('.thumbnail');
                const currentIndex = Array.from(thumbnails).findIndex(thumb => 
                    thumb.classList.contains('active')
                );
                
                if (diff > 0) {
                    const nextIndex = (currentIndex + 1) % car.images.length;
                    changeDetailImage(nextIndex);
                } else {
                    const prevIndex = currentIndex === 0 ? car.images.length - 1 : currentIndex - 1;
                    changeDetailImage(prevIndex);
                }
            }
        });
    }
}

function closeCarDetailModal() {
    const carDetailModal = document.getElementById('carDetailModal');
    if (carDetailModal) {
        carDetailModal.style.display = 'none';
    }
    currentCarDetailIndex = -1;
}

function changeDetailImage(index) {
    const car = cars[currentCarDetailIndex];
    if (!car || !car.images || car.images.length === 0) return;
    
    if (index < 0) index = car.images.length - 1;
    if (index >= car.images.length) index = 0;
    
    const mainImage = document.getElementById('mainDetailImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage && car.images[index]) {
        mainImage.src = car.images[index];
    }
    
    thumbnails.forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === index);
    });
}

function openFullscreenImage(images, startIndex = 0) {
    if (!Array.isArray(images) || images.length === 0) return;

    currentFullscreenImageIndex = Math.max(0, Math.min(startIndex, images.length - 1));

    let overlay = document.getElementById('fullscreenImageOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'fullscreenImageOverlay';
        overlay.className = 'fullscreen-image-overlay';
        overlay.innerHTML = `
            <div class="fullscreen-image-modal">
                <button class="close-btn fullscreen-close-btn" id="closeFullscreenImage" aria-label="Schließen">×</button>
                <button class="fullscreen-nav-btn fullscreen-prev" id="fullscreenPrevBtn" aria-label="Vorheriges Bild">‹</button>
                <img id="fullscreenImageElement" src="" alt="Fullscreen image" />
                <button class="fullscreen-nav-btn fullscreen-next" id="fullscreenNextBtn" aria-label="Nächstes Bild">›</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('closeFullscreenImage').addEventListener('click', closeFullscreenImage);
        document.getElementById('fullscreenPrevBtn').addEventListener('click', () => {
            const car = cars[currentCarDetailIndex];
            if (!car || !car.images || car.images.length === 0) return;
            currentFullscreenImageIndex = currentFullscreenImageIndex === 0 ? car.images.length - 1 : currentFullscreenImageIndex - 1;
            updateFullscreenImage();
        });
        document.getElementById('fullscreenNextBtn').addEventListener('click', () => {
            const car = cars[currentCarDetailIndex];
            if (!car || !car.images || car.images.length === 0) return;
            currentFullscreenImageIndex = (currentFullscreenImageIndex + 1) % car.images.length;
            updateFullscreenImage();
        });

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeFullscreenImage();
            }
        });
    }

    updateFullscreenImage(images);
    overlay.style.display = 'flex';
}

function updateFullscreenImage(images = cars[currentCarDetailIndex]?.images || []) {
    const img = document.getElementById('fullscreenImageElement');
    if (!img) return;

    if (images.length === 0) return;

    if (currentFullscreenImageIndex < 0) currentFullscreenImageIndex = 0;
    if (currentFullscreenImageIndex >= images.length) currentFullscreenImageIndex = 0;

    img.src = images[currentFullscreenImageIndex];
}

function closeFullscreenImage() {
    const overlay = document.getElementById('fullscreenImageOverlay');
    if (overlay) overlay.style.display = 'none';
}

// Contact Modal Functions
function openContactModal(index) {
    if (!currentUser) {
        showToast("Bitte melden Sie sich an, um den Verkäufer zu kontaktieren!", true);
        openAuthModal();
        return;
    }
    
    const car = cars[index];
    currentContactCarIndex = index;
    
    if (car.ownerId === currentUser.id) {
        showToast("Sie können sich nicht selbst kontaktieren!", true);
        return;
    }
    
    const contactCarInfo = document.getElementById('contactCarInfo');
    if (contactCarInfo) {
        contactCarInfo.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin-bottom: 10px;">${car.n} ${car.m} (${car.year})</h3>
                <p>Preis: ${car.p.toLocaleString()} CHF</p>
                <p>Verkäufer: ${car.ownerName}</p>
            </div>
        `;
    }
    
    const user = users.find(u => u.id === currentUser.id);
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactPhone = document.getElementById('contactPhone');
    
    if (user) {
        if (contactName) contactName.value = user.username;
        if (contactEmail) contactEmail.value = user.email || '';
        if (contactPhone) contactPhone.value = user.profile?.phone || '';
    }
    
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'flex';
    }
}

function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'none';
    }
    currentContactCarIndex = -1;
    
    const contactMessage = document.getElementById('contactMessage');
    const contactEmail = document.getElementById('contactEmail');
    const contactPhone = document.getElementById('contactPhone');
    
    if (contactMessage) contactMessage.value = '';
    if (contactEmail) contactEmail.value = '';
    if (contactPhone) contactPhone.value = '';
}

function sendMessageToSeller() {
    if (currentContactCarIndex === -1) return;
    
    const car = cars[currentContactCarIndex];
    const contactMessage = document.getElementById('contactMessage');
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactPhone = document.getElementById('contactPhone');
    
    if (!contactMessage || !contactName) return;
    
    const message = contactMessage.value.trim();
    const name = contactName.value.trim();
    const email = contactEmail?.value.trim() || '';
    const phone = contactPhone?.value.trim() || '';
    
    if (!message) {
        showToast("Bitte geben Sie eine Nachricht ein!", true);
        return;
    }
    
    if (!name) {
        showToast("Bitte geben Sie Ihren Namen ein!", true);
        return;
    }
    
    const newMessage = {
        id: generateId(),
        senderId: currentUser.id,
        senderName: name,
        senderEmail: email,
        senderPhone: phone,
        receiverId: car.ownerId,
        carId: car.id,
        subject: `Interesse an ${car.n} ${car.m}`,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));
    
    showToast("Nachricht erfolgreich gesendet!");
    closeContactModal();
    updateMessagesBadge();
}

// Favorites functions
function toggleFavorite(event, carId) {
    event.stopPropagation();
    
    if (!currentUser) {
        showToast("Bitte melden Sie sich an, um Favoriten hinzuzufügen!", true);
        openAuthModal();
        return;
    }
    
    const favoriteIndex = favorites.findIndex(f => f.carId === carId && f.userId === currentUser.id);
    
    if (favoriteIndex === -1) {
        favorites.push({
            id: generateId(),
            carId: carId,
            userId: currentUser.id,
            createdAt: new Date().toISOString()
        });
        showToast("Zu Favoriten hinzugefügt!");
    } else {
        favorites.splice(favoriteIndex, 1);
        showToast("Aus Favoriten entfernt!");
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
    
    const favoriteIcon = event.target.closest('.favorite-icon');
    if (favoriteIcon) {
        favoriteIcon.classList.toggle('active');
    }
    
    updateFavoritesBadge();
}

function updateFavoritesBadge() {
    const favoritesBadge = document.getElementById('favoritesBadge');
    if (!favoritesBadge) return;
    
    if (currentUser) {
        const userFavorites = favorites.filter(f => f.userId === currentUser.id);
        if (userFavorites.length > 0) {
            favoritesBadge.textContent = userFavorites.length;
            favoritesBadge.style.display = 'flex';
        } else {
            favoritesBadge.style.display = 'none';
        }
    } else {
        favoritesBadge.style.display = 'none';
    }
}

function renderFavorites() {
    const favoritesContent = document.getElementById('favoritesContent');
    if (!favoritesContent) return;
    
    if (!currentUser) {
        favoritesContent.innerHTML = `
            <div class="no-cars">
                <p>Bitte melden Sie sich an, um Ihre Favoriten zu sehen.</p>
                <button onclick="openAuthModal()" style="margin-top: 15px;">
                    <i class="fas fa-sign-in-alt"></i> Jetzt anmelden
                </button>
            </div>
        `;
        return;
    }
    
    const userFavorites = favorites.filter(f => f.userId === currentUser.id);
    const favoriteCars = cars.filter(car => userFavorites.some(f => f.carId === car.id));
    
    if (favoriteCars.length === 0) {
        favoritesContent.innerHTML = '<div class="no-cars">Sie haben noch keine Favoriten hinzugefügt</div>';
        return;
    }
    
    favoritesContent.innerHTML = `
        <div class="cars-grid">
            ${favoriteCars.map((car, index) => {
                const carIndex = cars.findIndex(c => c.id === car.id);
                return `
                    <div class="car-card" onclick="openCarDetailModal(${carIndex})">
                        <div class="favorite-icon active" onclick="toggleFavorite(event, '${car.id}')">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="carousel-container" id="fav-carousel-${index}">
                        </div>
                        <div class="car-content">
                            <h3>${car.n} ${car.m} (${car.year})</h3>
                            <p>${car.km.toLocaleString()} km | ${car.p.toLocaleString()} CHF</p>
                            <p>${car.city} | ${car.fuel}</p>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    favoriteCars.forEach((car, index) => {
        const carouselId = `fav-carousel-${index}`;
        setTimeout(() => {
            initCarousel(carouselId, car.images);
        }, 0);
    });
}

// Përmirëso funksionin initMap - ZËVENDËSOJE ATË EKZISTUES
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    if (!map) {
        map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([46.8182, 8.2275], 8);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        mapInitialized = true;
    }
    
    // Forco përmasat e sakta pas një kohe të shkurtër
    setTimeout(function() {
        if (map) {
            map.invalidateSize();
        }
    }, 200);
    
    // Merr filter-at nga Home kur hapet mapa
    currentHomeFilters = getHomeFilters();
    
    // Përditëso selektin e markës në Map
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    if (mapBrandFilter && currentHomeFilters.brand) {
        mapBrandFilter.value = currentHomeFilters.brand;
    }
    
    updateMap();
}
// ========== PËRMIRËSIMET PËR MAP ==========

// Variabël globale për të mbajtur filter-at aktualë
    currentHomeFilters = {
    brand: '',
    model: '',
    yearFrom: null,
    yearTo: null,
    kmFrom: null,
    kmTo: null,
    priceFrom: null,
    priceTo: null,
    fuel: '',
    transmission: '',
    color: '',
    city: '',
    searchText: ''
};

// Funksioni për të marrë filter-at nga Home
function getHomeFilters() {
    const searchBox = document.getElementById('searchBox');
    const filterBrand = document.getElementById('filterBrand');
    const filterModel = document.getElementById('filterModel');
    const filterYearFrom = document.getElementById('filterYearFrom');
    const filterYearTo = document.getElementById('filterYearTo');
    const filterKMFrom = document.getElementById('filterKMFrom');
    const filterKMTo = document.getElementById('filterKMTo');
    const filterPriceFrom = document.getElementById('filterPriceFrom');
    const filterPriceTo = document.getElementById('filterPriceTo');
    const filterFuel = document.getElementById('filterFuel');
    const filterTransmission = document.getElementById('filterTransmission');
    const filterColor = document.getElementById('filterColor');
    const filterCity = document.getElementById('filterCity');

    return {
        searchText: searchBox ? searchBox.value.toLowerCase().trim() : '',
        brand: filterBrand ? filterBrand.value : '',
        model: filterModel ? filterModel.value : '',
        yearFrom: filterYearFrom?.value ? parseInt(filterYearFrom.value) : null,
        yearTo: filterYearTo?.value ? parseInt(filterYearTo.value) : null,
        kmFrom: filterKMFrom?.value ? parseInt(filterKMFrom.value) : null,
        kmTo: filterKMTo?.value ? parseInt(filterKMTo.value) : null,
        priceFrom: filterPriceFrom?.value ? parseFloat(filterPriceFrom.value) : null,
        priceTo: filterPriceTo?.value ? parseFloat(filterPriceTo.value) : null,
        fuel: filterFuel ? filterFuel.value : '',
        transmission: filterTransmission ? filterTransmission.value : '',
        color: filterColor ? filterColor.value : '',
        city: filterCity ? filterCity.value : ''
    };
}

// Funksioni për të aplikuar filter-at e Home në Map
function useHomeFilters() {
    currentHomeFilters = getHomeFilters();
    
    // Përditëso selektin e markës në Map
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    if (mapBrandFilter && currentHomeFilters.brand) {
        mapBrandFilter.value = currentHomeFilters.brand;
    }
    
    updateMap();
    showToast('Home-Filter auf Map angewendet');
}

// Përmirëso funksionin updateMap - ZËVENDËSOJE ATË EKZISTUES
function updateMap() {
    if (!map) {
        initMap();
        return;
    }
    
    // Fshi marker-at e vjetër
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Merr filter-at
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    const mapDistanceFilter = document.getElementById('mapDistanceFilter');
    
    const brandFilter = mapBrandFilter?.value || currentHomeFilters.brand || '';
    const distanceFilter = mapDistanceFilter?.value ? parseInt(mapDistanceFilter.value) : 100;
    
    // Pozita e përdoruesit (për momentin Zyrihu)
    const userLocation = { lat: 47.3769, lng: 8.5417 };
    
    // Filtro makinat
    let filteredCars = cars.filter(car => {
        // Filtro sipas statusit
        if (car.status !== "approved" && (!currentUser || currentUser.username !== "admin")) {
            return false;
        }
        
        // Filtro sipas markës nga Home ose Map
        if (brandFilter && car.n !== brandFilter) return false;
        
        // Apliko filter-at nga Home
        if (currentHomeFilters.searchText) {
            const searchText = currentHomeFilters.searchText;
            const matchesSearch = 
                car.n?.toLowerCase().includes(searchText) ||
                car.m?.toLowerCase().includes(searchText) ||
                car.city?.toLowerCase().includes(searchText) ||
                car.color?.toLowerCase().includes(searchText) ||
                car.description?.toLowerCase().includes(searchText);
            
            if (!matchesSearch) return false;
        }
        
        if (currentHomeFilters.model && car.m !== currentHomeFilters.model) return false;
        if (currentHomeFilters.yearFrom && car.year < currentHomeFilters.yearFrom) return false;
        if (currentHomeFilters.yearTo && car.year > currentHomeFilters.yearTo) return false;
        if (currentHomeFilters.kmFrom && car.km < currentHomeFilters.kmFrom) return false;
        if (currentHomeFilters.kmTo && car.km > currentHomeFilters.kmTo) return false;
        if (currentHomeFilters.priceFrom && car.p < currentHomeFilters.priceFrom) return false;
        if (currentHomeFilters.priceTo && car.p > currentHomeFilters.priceTo) return false;
        if (currentHomeFilters.fuel && car.fuel !== currentHomeFilters.fuel) return false;
        if (currentHomeFilters.transmission && car.transmission !== currentHomeFilters.transmission) return false;
        if (currentHomeFilters.color && car.color !== currentHomeFilters.color) return false;
        if (currentHomeFilters.city && car.city !== currentHomeFilters.city) return false;
        
        // Filtro sipas distancës (nëse ka koordinata)
        const carCoords = getCantonCoordinates(car.city);
        if (carCoords) {
            const distance = calculateDistance(userLocation.lat, userLocation.lng, carCoords.lat, carCoords.lng);
            if (distance > distanceFilter) return false;
        }
        
        return true;
    });
    
    // Përditëso listën e makinave në Map
    const mapCarsList = document.getElementById('mapCarsList');
    if (mapCarsList) {
        if (filteredCars.length === 0) {
            mapCarsList.innerHTML = '<div style="padding: 15px; text-align: center; color: #94a3b8;">Keine Fahrzeuge gefunden</div>';
        } else {
            mapCarsList.innerHTML = filteredCars.map(car => {
                const carCoords = getCantonCoordinates(car.city);
                if (!carCoords) return '';
                
                // Shto marker në hartë
                const marker = L.marker([carCoords.lat, carCoords.lng])
                    .addTo(map)
                    .bindPopup(`
                        <b>${car.n} ${car.m}</b><br>
                        ${car.year} | ${car.km.toLocaleString()} km<br>
                        ${car.p.toLocaleString()} CHF<br>
                        <button onclick="openCarDetailModal(${cars.indexOf(car)})" style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 5px; cursor: pointer;">
                            Details
                        </button>
                    `);
                
                markers.push(marker);
                
                // Kthe HTML për listë
                return `
                    <div class="map-car-item" onclick="openCarDetailModal(${cars.indexOf(car)})">
                        <h4>${car.n} ${car.m} (${car.year})</h4>
                        <p><i class="fas fa-tachometer-alt"></i> ${car.km.toLocaleString()} km | <i class="fas fa-tag"></i> ${car.p.toLocaleString()} CHF</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${car.city} | <i class="fas fa-gas-pump"></i> ${car.fuel || '-'}</p>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Përshtat pamjen e hartës
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    } else {
        // Nëse nuk ka makina, shfaq të gjithë Zvicrën
        map.setView([46.8182, 8.2275], 8);
    }
    
    // Sigurohu që përmasat janë të sakta
    setTimeout(function() {
        map.invalidateSize();
    }, 100);
}
// Funksioni i përmirësuar updateMap
function updateMap() {
    if (!map) {
        initMap();
        return;
    }
    
    // Fshi marker-at e vjetër
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Merr filter-at
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    const mapDistanceFilter = document.getElementById('mapDistanceFilter');
    
    const brandFilter = mapBrandFilter?.value || currentHomeFilters.brand || '';
    const distanceFilter = mapDistanceFilter?.value ? parseInt(mapDistanceFilter.value) : 100;
    
    // Pozita e përdoruesit (për momentin Zyrihu)
    const userLocation = { lat: 47.3769, lng: 8.5417 };
    
    // Filtro makinat
    let filteredCars = cars.filter(car => {
        // Filtro sipas statusit
        if (car.status !== "approved" && (!currentUser || currentUser.username !== "admin")) {
            return false;
        }
        
        // Filtro sipas markës nga Home ose Map
        if (brandFilter && car.n !== brandFilter) return false;
        
        // Apliko filter-at nga Home
        if (currentHomeFilters.searchText) {
            const searchText = currentHomeFilters.searchText;
            const matchesSearch = 
                car.n?.toLowerCase().includes(searchText) ||
                car.m?.toLowerCase().includes(searchText) ||
                car.city?.toLowerCase().includes(searchText) ||
                car.color?.toLowerCase().includes(searchText) ||
                car.description?.toLowerCase().includes(searchText);
            
            if (!matchesSearch) return false;
        }
        
        if (currentHomeFilters.model && car.m !== currentHomeFilters.model) return false;
        if (currentHomeFilters.yearFrom && car.year < currentHomeFilters.yearFrom) return false;
        if (currentHomeFilters.yearTo && car.year > currentHomeFilters.yearTo) return false;
        if (currentHomeFilters.kmFrom && car.km < currentHomeFilters.kmFrom) return false;
        if (currentHomeFilters.kmTo && car.km > currentHomeFilters.kmTo) return false;
        if (currentHomeFilters.priceFrom && car.p < currentHomeFilters.priceFrom) return false;
        if (currentHomeFilters.priceTo && car.p > currentHomeFilters.priceTo) return false;
        if (currentHomeFilters.fuel && car.fuel !== currentHomeFilters.fuel) return false;
        if (currentHomeFilters.transmission && car.transmission !== currentHomeFilters.transmission) return false;
        if (currentHomeFilters.color && car.color !== currentHomeFilters.color) return false;
        if (currentHomeFilters.city && car.city !== currentHomeFilters.city) return false;
        
        // Filtro sipas distancës (nëse ka koordinata)
        const carCoords = getCantonCoordinates(car.city);
        if (carCoords) {
            const distance = calculateDistance(userLocation.lat, userLocation.lng, carCoords.lat, carCoords.lng);
            if (distance > distanceFilter) return false;
        }
        
        return true;
    });
    
    // Përditëso listën e makinave në Map
    const mapCarsList = document.getElementById('mapCarsList');
    if (mapCarsList) {
        mapCarsList.innerHTML = '';
        
        if (filteredCars.length === 0) {
            mapCarsList.innerHTML = '<div style="padding: 15px; text-align: center; color: #94a3b8;">Keine Fahrzeuge gefunden</div>';
        } else {
            filteredCars.forEach(car => {
                const carCoords = getCantonCoordinates(car.city);
                if (!carCoords) return;
                
                // Shto marker në hartë
                const marker = L.marker([carCoords.lat, carCoords.lng])
                    .addTo(map)
                    .bindPopup(`
                        <b>${car.n} ${car.m}</b><br>
                        ${car.year} | ${car.km.toLocaleString()} km<br>
                        ${car.p.toLocaleString()} CHF<br>
                        <button onclick="openCarDetailModal(${cars.indexOf(car)})" style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 5px; cursor: pointer;">
                            Details
                        </button>
                    `);
                
                markers.push(marker);
                
                // Shto item në listë
                const carItem = document.createElement('div');
                carItem.className = 'map-car-item';
                carItem.innerHTML = `
                    <h4>${car.n} ${car.m} (${car.year})</h4>
                    <p>${car.km.toLocaleString()} km | ${car.p.toLocaleString()} CHF</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${car.city}</p>
                    <p><i class="fas fa-gas-pump"></i> ${car.fuel || '-'} | <i class="fas fa-cog"></i> ${car.transmission || '-'}</p>
                `;
                carItem.addEventListener('click', () => {
                    openCarDetailModal(cars.indexOf(car));
                });
                mapCarsList.appendChild(carItem);
            });
        }
    }
    
    // Përshtat pamjen e hartës
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    } else {
        // Nëse nuk ka makina, shfaq të gjithë Zvicrën
        map.setView([46.8182, 8.2275], 8);
    }
}

// Përmirëso funksionin initMap
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    if (!map) {
        map = L.map('map').setView([46.8182, 8.2275], 8);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
    
    // Merr filter-at nga Home kur hapet mapa
    currentHomeFilters = getHomeFilters();
    
    // Përditëso selektin e markës në Map
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    if (mapBrandFilter && currentHomeFilters.brand) {
        mapBrandFilter.value = currentHomeFilters.brand;
    }
    
    updateMap();
    
    // Shto event listener për resize të dritares
    window.addEventListener('resize', function() {
        setTimeout(function() {
            map.invalidateSize();
        }, 100);
    });
}

// Përmirëso funksionin filterCars për të përditësuar Map-in kur ndryshojnë filter-at
const originalFilterCars = filterCars;
filterCars = function() {
    // Thirr funksionin origjinal
    originalFilterCars();
    
    // Përditëso filter-at aktualë
    currentHomeFilters = getHomeFilters();
    
    // Nëse mapa është e hapur, përditëso atë
    if (document.getElementById('map').offsetParent !== null) {
        updateMap();
    }
};

function updateMap() {
    if (!map) return;
    
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    const mapDistanceFilter = document.getElementById('mapDistanceFilter');
    
    const brandFilter = mapBrandFilter?.value || '';
    const distanceFilter = mapDistanceFilter?.value ? parseInt(mapDistanceFilter.value) : 1000;
    
    const userLocation = { lat: 47.3769, lng: 8.5417 };
    
    const filteredCars = cars.filter(car => {
        if (brandFilter && car.n !== brandFilter) return false;
        
        const carCoords = getCantonCoordinates(car.city);
        if (carCoords) {
            const distance = calculateDistance(userLocation.lat, userLocation.lng, carCoords.lat, carCoords.lng);
            if (distance > distanceFilter) return false;
        }
        
        return car.status === "approved" || (currentUser && currentUser.username === "admin");
    });
    
    const mapCarsList = document.getElementById('mapCarsList');
    if (mapCarsList) {
        mapCarsList.innerHTML = '';
        
        filteredCars.forEach((car, index) => {
            const carCoords = getCantonCoordinates(car.city);
            if (!carCoords) return;
            
            const marker = L.marker([carCoords.lat, carCoords.lng])
                .addTo(map)
                .bindPopup(`
                    <b>${car.n} ${car.m}</b><br>
                    ${car.year} | ${car.km.toLocaleString()} km<br>
                    ${car.p.toLocaleString()} CHF<br>
                    <button onclick="openCarDetailModal(${cars.indexOf(car)})">Details</button>
                `);
            
            markers.push(marker);
            
            const carItem = document.createElement('div');
            carItem.className = 'map-car-item';
            carItem.innerHTML = `
                <h4>${car.n} ${car.m}</h4>
                <p>${car.year} | ${car.km.toLocaleString()} km</p>
                <p>${car.p.toLocaleString()} CHF | ${car.city}</p>
            `;
            carItem.addEventListener('click', () => {
                openCarDetailModal(cars.indexOf(car));
            });
            mapCarsList.appendChild(carItem);
        });
    }
    
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function getCantonCoordinates(cantonName) {
    const cantonCoordinates = {
        "Zürich": { lat: 47.3769, lng: 8.5417 },
        "Bern": { lat: 46.9480, lng: 7.4474 },
        "Genève": { lat: 46.2044, lng: 6.1432 },
        "Basel-Stadt": { lat: 47.5596, lng: 7.5886 },
        "Luzern": { lat: 47.0502, lng: 8.3093 },
        "Solothurn": { lat: 47.2076, lng: 7.5371 },
        "St. Gallen": { lat: 47.4245, lng: 9.3767 },
        "Aargau": { lat: 47.3877, lng: 8.2554 },
        "Graubünden": { lat: 46.6566, lng: 9.5780 },
        "Wallis": { lat: 46.1905, lng: 7.5449 },
        "Tessin": { lat: 46.3317, lng: 8.8005 },
        "Waadt": { lat: 46.5362, lng: 6.5915 },
        "Freiburg": { lat: 46.8065, lng: 7.1611 },
        "Neuenburg": { lat: 47.0006, lng: 6.9230 },
        "Jura": { lat: 47.3444, lng: 7.1431 },
        "Schwyz": { lat: 47.0514, lng: 8.7533 },
        "Uri": { lat: 46.7739, lng: 8.6023 },
        "Obwalden": { lat: 46.8779, lng: 8.2513 },
        "Nidwalden": { lat: 46.9500, lng: 8.3667 },
        "Glarus": { lat: 47.0406, lng: 9.0673 },
        "Zug": { lat: 47.1662, lng: 8.5155 },
        "Appenzell": { lat: 47.3310, lng: 9.4099 },
        "Schaffhausen": { lat: 47.6961, lng: 8.6351 },
        "Thurgau": { lat: 47.6038, lng: 9.0557 }
    };
    
    return cantonCoordinates[cantonName] || { lat: 46.8182, lng: 8.2275 };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Messages Modal Functions
function openMessagesModal() {
    if (!currentUser) {
        showToast("Bitte melden Sie sich an!", true);
        openAuthModal();
        return;
    }
    loadConversations();
    const messagesModal = document.getElementById('messagesModal');
    if (messagesModal) {
        messagesModal.style.display = 'flex';
    }
}

function closeMessagesModal() {
    const messagesModal = document.getElementById('messagesModal');
    if (messagesModal) {
        messagesModal.style.display = 'none';
    }
    currentConversation = null;
}

function loadConversations() {
    const conversationsList = document.getElementById('conversationsList');
    const chatContainer = document.getElementById('chatContainer');
    
    if (!conversationsList || !chatContainer || !currentUser) return;
    
    const userMessages = messages.filter(msg => 
        msg.senderId === currentUser.id || msg.receiverId === currentUser.id
    );
    
    const conversations = {};
    
    userMessages.forEach(msg => {
        const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        const otherUserName = msg.senderId === currentUser.id ? 
            users.find(u => u.id === msg.receiverId)?.username || 'Unbekannt' :
            users.find(u => u.id === msg.senderId)?.username || 'Unbekannt';
        
        const car = cars.find(c => c.id === msg.carId);
        const carInfo = car ? `${car.n} ${car.m}` : 'Fahrzeug nicht gefunden';
        
        const conversationKey = otherUserId + "_" + msg.carId;

if (!conversations[conversationKey]) {
    conversations[conversationKey] = {
        userId: otherUserId,
        userName: otherUserName,
        carId: msg.carId,
        carInfo: carInfo,
        messages: [],
        lastMessageTime: msg.timestamp,
        unread: false
    };
}

        
        conversations[conversationKey].messages.push(msg);
        if (new Date(msg.timestamp) > new Date(conversations[conversationKey].lastMessageTime)) {
            conversations[conversationKey].lastMessageTime = msg.timestamp;
        }
        if (msg.receiverId === currentUser.id && !msg.read) {
            conversations[conversationKey].lastMessageTime = msg.timestamp;
        }

        if (msg.receiverId === currentUser.id && !msg.read) {
        conversations[conversationKey].unread = true;
    }
    });
    
    
    const sortedConversations = Object.values(conversations).sort((a, b) =>
    new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
);
    conversationsList.innerHTML = '';
    
    if (sortedConversations.length === 0) {
        conversationsList.innerHTML = '<div class="no-conversation"><p>Keine Konversationen</p></div>';
        chatContainer.innerHTML = `
            <div class="no-conversation">
                <p>Wählen Sie eine Konversation aus, um Nachrichten zu sehen</p>
            </div>
        `;
        return;
    }
    
    sortedConversations.forEach(conv => {
        const lastMessage = conv.messages[conv.messages.length - 1];
        const conversationItem = document.createElement('div');
        conversationItem.className = `conversation-item ${currentConversation?.userId === conv.userId ? 'active' : ''}`;
        conversationItem.innerHTML = `
            <div class="conversation-header">
                <div class="conversation-name">${conv.userName}</div>
                ${conv.unread ? '<div class="conversation-unread">!</div>' : ''}
            </div>
            <div class="conversation-preview">${lastMessage.message.substring(0, 50)}${lastMessage.message.length > 50 ? '...' : ''}</div>
            <div class="conversation-time">${new Date(lastMessage.timestamp).toLocaleDateString()}</div>
        `;
        
        conversationItem.addEventListener('click', () => {
            loadConversation(conv);
        });
        
        conversationsList.appendChild(conversationItem);
    });
    
    if (!currentConversation && sortedConversations.length > 0) {
        loadConversation(sortedConversations[0]);
    }
}

function loadConversation(conversation) {
    currentConversation = conversation;
    loadConversations();
    
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    const otherUser = users.find(u => u.id === conversation.userId);
    const car = cars.find(c => c.id === conversation.messages[0]?.carId);
    
    chatContainer.innerHTML = `
        <div class="chat-header">
            <h3>${conversation.userName}</h3>
            ${car ? `<p>${car.n} ${car.m} (${car.year}) - ${car.p.toLocaleString()} CHF</p>` : ''}
        </div>
        <div class="chat-messages" id="chatMessages">
            ${conversation.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(msg => `
                <div class="message ${msg.senderId === currentUser.id ? 'sent' : 'received'}">
                    <div>${msg.message}</div>
                    <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            `).join('')}
        </div>
        <div class="chat-input-container">
            <input type="text" class="chat-input" id="chatInput" placeholder="Nachricht schreiben...">
            <button class="send-btn" onclick="sendChatMessage()">Senden</button>
        </div>
    `;
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    conversation.messages.forEach(msg => {
        if (msg.receiverId === currentUser.id && !msg.read) {
            msg.read = true;
        }
    });
    
    localStorage.setItem("messages", JSON.stringify(messages));
    updateMessagesBadge();
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

function sendChatMessage() {
    if (!currentConversation || !currentUser) return;
    
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
    const carId = lastMessage?.carId || '';
    
    const newMessage = {
        id: generateId(),
        senderId: currentUser.id,
        senderName: currentUser.username,
        receiverId: currentConversation.userId,
        carId: carId,
        subject: lastMessage?.subject || 'Nachricht',
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));
    
    chatInput.value = '';
    loadConversation(currentConversation);
    showToast("Nachricht gesendet!");
}

// Share functions
function shareOnFacebook(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    const currentUrl = window.location.href.split('?')[0];
    const shareUrl = `${currentUrl}?car=${carId}`;
    const text = `Check out this ${car.n} ${car.m} for ${car.p.toLocaleString()} CHF on AutoSimple!`;
    
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`, '_blank');
    showToast("Teilen auf Facebook vorbereitet!");
}

function shareOnWhatsApp(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    const currentUrl = window.location.href.split('?')[0];
    const shareUrl = `${currentUrl}?car=${carId}`;
    const text = `Check out this ${car.n} ${car.m} for ${car.p.toLocaleString()} CHF on AutoSimple! ${shareUrl}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    showToast("Teilen auf WhatsApp vorbereitet!");
}

function copyCarShareLink(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    const currentUrl = window.location.href.split('?')[0];
    const shareUrl = `${currentUrl}?car=${carId}`;
    const text = `${car.n} ${car.m} (${car.year}) - ${car.p.toLocaleString()} CHF\n${shareUrl}`;
    
    navigator.clipboard.writeText(text)
        .then(() => {
            showToast("Link in die Zwischenablage kopiert!");
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showToast("Fehler beim Kopieren!", true);
        });
}
// ========== FUNKSIONET PËR FILTER-AT E MAP ==========

// Funksioni për të marrë filter-at nga Home
function getHomeFilters() {
    const searchBox = document.getElementById('searchBox');
    const filterBrand = document.getElementById('filterBrand');
    const filterModel = document.getElementById('filterModel');
    const filterYearFrom = document.getElementById('filterYearFrom');
    const filterYearTo = document.getElementById('filterYearTo');
    const filterKMFrom = document.getElementById('filterKMFrom');
    const filterKMTo = document.getElementById('filterKMTo');
    const filterPriceFrom = document.getElementById('filterPriceFrom');
    const filterPriceTo = document.getElementById('filterPriceTo');
    const filterFuel = document.getElementById('filterFuel');
    const filterTransmission = document.getElementById('filterTransmission');
    const filterColor = document.getElementById('filterColor');
    const filterCity = document.getElementById('filterCity');

    return {
        searchText: searchBox ? searchBox.value.toLowerCase().trim() : '',
        brand: filterBrand ? filterBrand.value : '',
        model: filterModel ? filterModel.value : '',
        yearFrom: filterYearFrom?.value ? parseInt(filterYearFrom.value) : null,
        yearTo: filterYearTo?.value ? parseInt(filterYearTo.value) : null,
        kmFrom: filterKMFrom?.value ? parseInt(filterKMFrom.value) : null,
        kmTo: filterKMTo?.value ? parseInt(filterKMTo.value) : null,
        priceFrom: filterPriceFrom?.value ? parseFloat(filterPriceFrom.value) : null,
        priceTo: filterPriceTo?.value ? parseFloat(filterPriceTo.value) : null,
        fuel: filterFuel ? filterFuel.value : '',
        transmission: filterTransmission ? filterTransmission.value : '',
        color: filterColor ? filterColor.value : '',
        city: filterCity ? filterCity.value : ''
    };
}

// Funksioni për të aplikuar filter-at e Home në Map
function useHomeFilters() {
    currentHomeFilters = getHomeFilters();
    
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    if (mapBrandFilter && currentHomeFilters.brand) {
        mapBrandFilter.value = currentHomeFilters.brand;
    }
    
    updateMap();
    showToast('Home-Filter auf Map angewendet');
}

// Funksioni për të përditësuar Map-in me filter-at aktualë
function updateMapFromHomeFilters() {
    const mapBrandFilter = document.getElementById('mapBrandFilter');
    const mapDistanceFilter = document.getElementById('mapDistanceFilter');
    
    if (mapBrandFilter) currentHomeFilters.brand = mapBrandFilter.value;
    
    updateMap();
}

// Admin functions
function renderAdminDashboard() {
    if (!currentUser || currentUser.username !== "admin") {
        showToast("Nur Admin kann das Dashboard anzeigen!", true);
        showPage('home');
        return;
    }
    
    const adminStats = document.getElementById('adminStats');
    if (!adminStats) return;
    
    const totalCars = cars.length;
    const totalUsers = users.length;
    const totalFavorites = favorites.length;
    const totalValue = cars.reduce((sum, car) => sum + (car.p || 0), 0);
    
    adminStats.innerHTML = `
        <div class="admin-stat-card">
            <h3>${totalCars}</h3>
            <p>Fahrzeuge</p>
        </div>
        <div class="admin-stat-card">
            <h3>${totalUsers}</h3>
            <p>Benutzer</p>
        </div>
        <div class="admin-stat-card">
            <h3>${totalFavorites}</h3>
            <p>Favoriten</p>
        </div>
        <div class="admin-stat-card">
            <h3>${totalValue.toLocaleString()} CHF</h3>
            <p>Gesamtwert</p>
        </div>
    `;
}

function viewRegisteredUsers() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const usersList = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>${user.isAdmin ? 'Admin' : '-'}</td>
            <td>
                <button class="delete-btn"
                    onclick="deleteUser('${user.id}')"
                    ${user.isAdmin ? 'disabled' : ''}>
                    Löschen
                </button>
                <button class="edit-btn"
                    onclick="editUser('${user.id}')">
                    Bearbeiten
                </button>
            </td>
        </tr>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content modal-wide">
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            <h2>Registrierte Benutzer</h2>
            <table>
                <thead>
                    <tr>
                        <th>Benutzername</th>
                        <th>E-Mail</th>
                        <th>Registrierungsdatum</th>
                        <th>Admin</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${usersList}
                </tbody>
            </table>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function deleteUser(userId) {
    if (!currentUser || currentUser.username !== "admin") {
        showToast("Nur Admin kann Benutzer löschen!", true);
        return;
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    if (users[userIndex].isAdmin) {
        showToast("Admin-Benutzer können nicht gelöscht werden!", true);
        return;
    }
    
    if (!confirm("Sind Sie sicher?")) return;
    
    users.splice(userIndex, 1);
    localStorage.setItem("users", JSON.stringify(users));
    showToast("Benutzer gelöscht");
    viewRegisteredUsers();
}

function editUser(userId) {
    showToast("Diese Funktion ist noch in Entwicklung", false);
}

function showAuditLog() {
    const auditLogContainer = document.getElementById('auditLogContainer');
    const auditLogBody = document.getElementById('auditLogBody');
    
    if (!auditLogContainer || !auditLogBody) return;
    
    auditLogBody.innerHTML = auditLog.map(log => `
        <tr>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.userId}</td>
            <td>${log.action}</td>
            <td>${log.details}</td>
        </tr>
    `).join('');
    
    auditLogContainer.style.display = 'block';
}

// Stats functions
function updateStats() {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    const totalCars = cars.length;
    const totalUsers = users.length;
    const avgPrice = cars.length > 0 ? Math.round(cars.reduce((sum, car) => sum + (car.p || 0), 0) / cars.length) : 0;
    const totalValue = cars.reduce((sum, car) => sum + (car.p || 0), 0);
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>${totalCars}</h3>
            <p>Gesamt Fahrzeuge</p>
        </div>
        <div class="stat-card">
            <h3>${totalUsers}</h3>
            <p>Gesamt Benutzer</p>
        </div>
        <div class="stat-card">
            <h3>${avgPrice.toLocaleString()} CHF</h3>
            <p>Durchschnittspreis</p>
        </div>
        <div class="stat-card">
            <h3>${totalValue.toLocaleString()} CHF</h3>
            <p>Gesamtwert</p>
        </div>
    `;
}

// Profile functions
function renderProfile() {
    const profileContainer = document.getElementById('profileContainer');
    if (!profileContainer) return;
    
    if (!currentUser) {
        showPage('home');
        openAuthModal();
        return;
    }
    
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user) {
        profileContainer.innerHTML = '<div class="no-cars">Benutzer nicht gefunden</div>';
        return;
    }
    
    const profile = user.profile || {
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        avatar: null
    };
    
    const userCars = cars.filter(car => car.ownerId === currentUser.id);
    
    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : currentUser.username;
    const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase();
    
    profileContainer.innerHTML = `
        <div class="profile-sidebar">
            <div class="profile-avatar" id="profileAvatar">
                ${profile.avatar ? `<img src="${profile.avatar}" alt="${fullName}">` : firstLetter}
            </div>
            <div class="profile-info">
                <h2>${fullName}</h2>
                <p>@${currentUser.username}</p>
                <p><i class="fas fa-envelope"></i> ${user.email}</p>
            </div>
        </div>
        
        <div class="profile-content">
            <div class="profile-section">
                <h3>Persönliche Informationen</h3>
                <div class="form-group">
                    <label for="profileFirstName">Vorname:</label>
                    <input type="text" id="profileFirstName" value="${firstName}" placeholder="Vorname">
                </div>
                <div class="form-group">
                    <label for="profileLastName">Nachname:</label>
                    <input type="text" id="profileLastName" value="${lastName}" placeholder="Nachname">
                </div>
                <div class="form-group">
                    <label for="profilePhone">Telefon:</label>
                    <input type="tel" id="profilePhone" value="${profile.phone || ''}" placeholder="+41 76 123 45 67">
                </div>
                <div class="form-group">
                    <label for="profileAddress">Adresse:</label>
                    <input type="text" id="profileAddress" value="${profile.address || ''}" placeholder="Adresse">
                </div>
                <button onclick="saveProfile()" class="profile-btn">
                    <i class="fas fa-save"></i> Profil speichern
                </button>
            </div>

            <div class="profile-section">
                <h3>Passwort ändern</h3>
                <div class="form-group">
                    <label for="currentPassword">Aktuelles Passwort:</label>
                    <input type="password" id="currentPassword" placeholder="Aktuelles Passwort">
                </div>
                <div class="form-group">
                    <label for="newPassword">Neues Passwort:</label>
                    <input type="password" id="newPassword" placeholder="Neues Passwort">
                </div>
                <div class="form-group">
                    <label for="confirmNewPassword">Neues Passwort bestätigen:</label>
                    <input type="password" id="confirmNewPassword" placeholder="Neues Passwort bestätigen">
                </div>
                <button onclick="changePassword()" class="profile-btn">
                    <i class="fas fa-key"></i> Passwort ändern
                </button>
            </div>
            
            <div class="profile-section">
                <h3>Meine Fahrzeuge (${userCars.length})</h3>
                ${userCars.length > 0 ? `
                <div class="my-cars-grid">
                    ${userCars.map((car, index) => `
                        <div class="my-car-card" onclick="openCarDetailModal(${cars.indexOf(car)})">
                            <div class="carousel-container" id="profile-carousel-${index}">
                            </div>
                            <div class="car-content">
                                <h3>${car.n} ${car.m} (${car.year})</h3>
                                <p>${car.km.toLocaleString()} km | ${car.p.toLocaleString()} CHF</p>
                                <p>${car.city} | ${car.fuel}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <p>Sie haben keine Fahrzeuge hinzugefügt</p>
                <button onclick="openAddModal()" class="signup-btn">
                    <i class="fas fa-plus"></i> Fahrzeug hinzufügen
                </button>
                `}
            </div>
            
            <div class="profile-section">
                <h3>Meine Nachrichten</h3>
                <p>Sie haben ${messages.filter(msg => msg.senderId === currentUser.id || msg.receiverId === currentUser.id).length} Nachrichten</p>
                <button onclick="openMessagesModal()" class="messages-btn">
                    <i class="fas fa-comments"></i> Nachrichten anzeigen
                </button>
            </div>
        </div>
    `;
    
    userCars.forEach((car, index) => {
        const carouselId = `profile-carousel-${index}`;
        setTimeout(() => {
            initCarousel(carouselId, car.images);
        }, 0);
    });
}

function saveProfile() {
    if (!currentUser) return;
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;
    
    const profileFirstName = document.getElementById('profileFirstName');
    const profileLastName = document.getElementById('profileLastName');
    const profilePhone = document.getElementById('profilePhone');
    const profileAddress = document.getElementById('profileAddress');
    
    if (!profileFirstName || !profileLastName || !profilePhone || !profileAddress) return;
    
    const firstName = profileFirstName.value.trim();
    const lastName = profileLastName.value.trim();
    const phone = profilePhone.value.trim();
    const address = profileAddress.value.trim();
    
    users[userIndex].profile = users[userIndex].profile || {};
    users[userIndex].profile.firstName = firstName;
    users[userIndex].profile.lastName = lastName;
    users[userIndex].profile.phone = phone;
    users[userIndex].profile.address = address;
    
    localStorage.setItem("users", JSON.stringify(users));
    
    if (firstName) {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.textContent = firstName.charAt(0).toUpperCase();
        }
    }
    
    showToast("Profil erfolgreich aktualisiert!");
    renderProfile();
}

function changePassword() {
    if (!currentUser) return;

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) return;

    const currentPasswordValue = currentPasswordInput.value.trim();
    const newPasswordValue = newPasswordInput.value.trim();
    const confirmNewPasswordValue = confirmNewPasswordInput.value.trim();

    if (!currentPasswordValue || !newPasswordValue || !confirmNewPasswordValue) {
        showToast("Bitte alle Passwortfelder ausfüllen!", true);
        return;
    }

    if (users[userIndex].password !== currentPasswordValue) {
        showToast("Aktuelles Passwort ist falsch!", true);
        return;
    }

    if (newPasswordValue.length < 6) {
        showToast("Neues Passwort muss mindestens 6 Zeichen lang sein!", true);
        return;
    }

    if (newPasswordValue !== confirmNewPasswordValue) {
        showToast("Neues Passwort stimmt nicht überein!", true);
        return;
    }

    users[userIndex].password = newPasswordValue;
    localStorage.setItem("users", JSON.stringify(users));

    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmNewPasswordInput.value = '';

    showToast("Passwort erfolgreich geändert!");
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
    populateFilters();
    filterCars();
    updateFavoritesBadge();
    updateMessagesBadge();
    updatePendingCarsCount();
    setLang(currentLang);
    
    const imageFiles = document.getElementById('imageFiles');
    const editImageFiles = document.getElementById('editImageFiles');
    const searchBox = document.getElementById('searchBox');
    const langSelect = document.getElementById('langSelect');
    
    if (imageFiles) imageFiles.addEventListener('change', handleFileSelect);
    if (editImageFiles) editImageFiles.addEventListener('change', handleEditFileSelect);
    if (searchBox) searchBox.addEventListener('input', filterCars);
    if (langSelect) langSelect.value = currentLang;
    
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('car');
    if (carId) {
        const carIndex = cars.findIndex(c => c.id === carId);
        if (carIndex !== -1) {
            openCarDetailModal(carIndex);
        }
    }
    
    updateAddModelOptions();
});

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    selectedFiles = files.slice(0, 5);
    if (files.length > 5) showToast('Maximal 5 Bilder erlaubt.', true);
    updateFilePreview(selectedFiles, 'filePreview');
}

function handleEditFileSelect(event) {
    const files = Array.from(event.target.files);
    editSelectedFiles = files.slice(0, 5);
    if (files.length > 5) showToast('Maximal 5 Bilder erlaubt.', true);
    updateFilePreview(editSelectedFiles, 'editFilePreview');
}

function updateFilePreview(files, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Vorschau">
                <button class="file-remove" onclick="removeFile(${index}, '${containerId}')">×</button>
            `;
            container.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

function removeFile(index, containerId) {
    if (containerId === 'filePreview') {
        selectedFiles.splice(index, 1);
        updateFilePreview(selectedFiles, 'filePreview');
    } else {
        editSelectedFiles.splice(index, 1);
        updateFilePreview(editSelectedFiles, 'editFilePreview');
    }
}

function populateFilters() {
    const brandSelect = document.getElementById('filterBrand');
    const addBrandSelect = document.getElementById('name');
    const editBrandSelect = document.getElementById('editName');
    const mapBrandSelect = document.getElementById('mapBrandFilter');
    
    if (brandSelect) {
        brandSelect.innerHTML = `<option value="" id="filterBrandDefault">Alle Marken</option>`;
        carBrands.forEach(brand => {
            brandSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
        });
    }
    
    if (addBrandSelect) {
        addBrandSelect.innerHTML = `<option value="" id="addBrandDefault">Marke wählen</option>`;
        carBrands.forEach(brand => {
            addBrandSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
        });
    }
    
    if (editBrandSelect) {
        editBrandSelect.innerHTML = `<option value="">Marke wählen</option>`;
        carBrands.forEach(brand => {
            editBrandSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
        });
    }
    
    if (mapBrandSelect) {
        mapBrandSelect.innerHTML = `<option value="">Alle Marken</option>`;
        carBrands.forEach(brand => {
            mapBrandSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
        });
    }
    
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('year');
    const editYearSelect = document.getElementById('editYear');
    const yearFromSelect = document.getElementById('filterYearFrom');
    const yearToSelect = document.getElementById('filterYearTo');
    
    if (yearSelect) {
        yearSelect.innerHTML = `<option value="" id="addYearDefault">Baujahr wählen</option>`;
        for (let y = currentYear; y >= 1950; y--) {
            yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
        }
    }
    
    if (editYearSelect) {
        editYearSelect.innerHTML = `<option value="">Baujahr wählen</option>`;
        for (let y = currentYear; y >= 1950; y--) {
            editYearSelect.innerHTML += `<option value="${y}">${y}</option>`;
        }
    }
    
    if (yearFromSelect) {
        yearFromSelect.innerHTML = `<option value="" id="filterYearFromDefault">Baujahr von</option>`;
        for (let y = currentYear; y >= 1950; y--) {
            yearFromSelect.innerHTML += `<option value="${y}">${y}</option>`;
        }
    }
    
    if (yearToSelect) {
        yearToSelect.innerHTML = `<option value="" id="filterYearToDefault">bis</option>`;
        for (let y = currentYear; y >= 1950; y--) {
            yearToSelect.innerHTML += `<option value="${y}">${y}</option>`;
        }
    }
    
    const citySelect = document.getElementById('city');
    const editCitySelect = document.getElementById('editCity');
    const filterCitySelect = document.getElementById('filterCity');
    
    const cities = ["Zürich", "Bern", "Genève", "Basel-Stadt", "Luzern", "Solothurn", "St. Gallen", "Aargau", "Graubünden", "Wallis", "Tessin", "Waadt", "Freiburg", "Neuenburg", "Jura", "Schwyz", "Uri", "Obwalden", "Nidwalden", "Glarus", "Zug", "Appenzell", "Schaffhausen", "Thurgau"];
    
    if (citySelect) {
        citySelect.innerHTML = `<option value="" id="addCityDefault">Kanton wählen</option>`;
        cities.forEach(city => {
            citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
    
    if (editCitySelect) {
        editCitySelect.innerHTML = `<option value="">Kanton wählen</option>`;
        cities.forEach(city => {
            editCitySelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
    
    if (filterCitySelect) {
        filterCitySelect.innerHTML = `<option value="" id="filterCityDefault">Standort (Kanton)</option>`;
        cities.forEach(city => {
            filterCitySelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
    
    const priceFromSelect = document.getElementById('filterPriceFrom');
    const priceToSelect = document.getElementById('filterPriceTo');
    
    if (priceFromSelect) {
        priceFromSelect.innerHTML = `<option value="" id="filterPriceFromDefault">Preis von</option>`;
        for (let price = 0; price <= 500000; price += 10000) {
            priceFromSelect.innerHTML += `<option value="${price}">${price.toLocaleString()} CHF</option>`;
        }
    }
    
    if (priceToSelect) {
        priceToSelect.innerHTML = `<option value="" id="filterPriceToDefault">bis</option>`;
        for (let price = 0; price <= 500000; price += 10000) {
            priceToSelect.innerHTML += `<option value="${price}">${price.toLocaleString()} CHF</option>`;
        }
    }
    
    const kmFromSelect = document.getElementById('filterKMFrom');
    const kmToSelect = document.getElementById('filterKMTo');
    
    if (kmFromSelect) {
        kmFromSelect.innerHTML = `<option value="" id="filterKMFromDefault">km von</option>`;
        for (let km = 0; km <= 500000; km += 10000) {
            kmFromSelect.innerHTML += `<option value="${km}">${km.toLocaleString()} km</option>`;
        }
    }
    
    if (kmToSelect) {
        kmToSelect.innerHTML = `<option value="" id="filterKMToDefault">bis</option>`;
        for (let km = 0; km <= 500000; km += 10000) {
            kmToSelect.innerHTML += `<option value="${km}">${km.toLocaleString()} km</option>`;
        }
    }
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('autoSimpleLang', lang);
    updateTranslations();
    updateExtrasLanguage();
}

const extrasUiTranslations = {
    de: { title: 'Zusatzausstattung / Extras', description: 'Wählen Sie alle Extras, die das Fahrzeug hat:', clear: 'Alle löschen', select: 'Alle hinzufügen', save: 'Speichern', close: 'Schließen', safety: 'A. Sicherheit & Technologie', comfort: 'B. Komfort', tech: 'C. Technologie & Parken', lights: 'D. Beleuchtung', other: 'E. Weitere Optionen' },
    en: { title: 'Optional equipment / Extras', description: 'Select all extras available in the vehicle:', clear: 'Clear all', select: 'Select all', save: 'Save', close: 'Close', safety: 'A. Safety & Technology', comfort: 'B. Comfort', tech: 'C. Technology & Parking', lights: 'D. Lighting', other: 'E. Other options' },
    fr: { title: 'Équipements optionnels / Extras', description: 'Sélectionnez tous les équipements du véhicule :', clear: 'Tout effacer', select: 'Tout sélectionner', save: 'Enregistrer', close: 'Fermer', safety: 'A. Sécurité et technologie', comfort: 'B. Confort', tech: 'C. Technologie et stationnement', lights: 'D. Éclairage', other: 'E. Autres options' },
    it: { title: 'Equipaggiamento opzionale / Extra', description: 'Seleziona tutti gli extra presenti nel veicolo:', clear: 'Cancella tutto', select: 'Seleziona tutto', save: 'Salva', close: 'Chiudi', safety: 'A. Sicurezza e tecnologia', comfort: 'B. Comfort', tech: 'C. Tecnologia e parcheggio', lights: 'D. Illuminazione', other: 'E. Altre opzioni' },
    sq: { title: 'Pajisjet shtesë / Extras', description: 'Zgjidhni të gjitha pajisjet shtesë që i ka automjeti:', clear: 'Fshiji të gjitha', select: 'Zgjidhi të gjitha', save: 'Ruaj', close: 'Mbyll', safety: 'A. Siguria dhe teknologjia', comfort: 'B. Komoditeti', tech: 'C. Teknologjia dhe parkimi', lights: 'D. Ndriçimi', other: 'E. Opsione të tjera' }
};

function updateExtrasLanguage() {
    const t = extrasUiTranslations[currentLang] || extrasUiTranslations.de;
    const text = {
        extrasModalTitle: t.title, extrasModalDescription: t.description,
        extrasClearAll: t.clear, extrasSelectAll: t.select,
        extrasSave: t.save, extrasClose: t.close
    };
    Object.entries(text).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    const categories = [
        ['extrasCategorySafety', 'fas fa-shield-alt', t.safety],
        ['extrasCategoryComfort', 'fas fa-couch', t.comfort],
        ['extrasCategoryTech', 'fas fa-camera', t.tech],
        ['extrasCategoryLights', 'fas fa-lightbulb', t.lights],
        ['extrasCategoryOther', 'fas fa-cogs', t.other]
    ];
    categories.forEach(([id, icon, label]) => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = `<i class="${icon}"></i> ${label}`;
    });

    if (typeof extraOptionTranslations === 'undefined') return;
    const optionTranslations = extraOptionTranslations[currentLang] || extraOptionTranslations.de;
    document.querySelectorAll('#extrasCategoriesContainer input[type="checkbox"]').forEach(checkbox => {
        const category = checkbox.dataset.category;
        const options = Array.from(document.querySelectorAll(`#extrasCategoriesContainer input[data-category="${category}"]`));
        const index = options.indexOf(checkbox);
        const label = checkbox.closest('.extra-checkbox')?.querySelector('.extra-label');
        if (!label || !optionTranslations?.[category]?.[index]) return;
        const icon = label.textContent.trim().split(/\s+/)[0];
        label.textContent = `${icon} ${optionTranslations[category][index]}`;
    });
}

function updateTranslations() {
    const t = translations[currentLang];
    if (!t) return;
    
    Object.keys(t).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = t[key];
        }
    });
    
    const searchBox = document.getElementById('searchBox');
    if (searchBox && t.tSearch) {
        searchBox.placeholder = t.tSearch;
    }
}

function updateModels() {
    const brand = document.getElementById('filterBrand');
    const modelSelect = document.getElementById('filterModel');
    
    if (!brand || !modelSelect) return;
    
    const brandValue = brand.value;
    modelSelect.innerHTML = `<option value="">${translations[currentLang]?.filterModelDefault || 'Alle Modelle'}</option>`;
    
    if (brandValue && carModels[brandValue]) {
        const models = carModels[brandValue];
        models.forEach(model => {
            modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
        });
    }
}

function updateAddModelOptions() {
    const brand = document.getElementById('name');
    const modelSelect = document.getElementById('model');
    
    if (!brand || !modelSelect) return;
    
    const brandValue = brand.value;
    modelSelect.innerHTML = `<option value="">${translations[currentLang]?.addModelDefault || 'Modell wählen'}</option>`;
    
    if (brandValue && carModels[brandValue]) {
        const models = carModels[brandValue];
        models.forEach(model => {
            modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
        });
    }
}

function updateEditModelOptions() {
    const brand = document.getElementById('editName');
    const editModelSelect = document.getElementById('editModel');
    
    if (!brand || !editModelSelect) return;
    
    const brandValue = brand.value;
    editModelSelect.innerHTML = '<option value="">Modell wählen</option>';
    
    if (brandValue && carModels[brandValue]) {
        const models = carModels[brandValue];
        models.forEach(model => {
            editModelSelect.innerHTML += `<option value="${model}">${model}</option>`;
        });
    }
}

function exportData() {
    const data = {
        cars: cars,
        users: users,
        favorites: favorites,
        messages: messages,
        notifications: notifications,
        auditLog: auditLog
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `autosimple-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast("Daten exportiert!");
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm("Sind Sie sicher? Alle aktuellen Daten werden überschrieben!")) {
                    if (data.cars) cars = data.cars;
                    if (data.users) users = data.users;
                    if (data.favorites) favorites = data.favorites;
                    if (data.messages) messages = data.messages;
                    if (data.notifications) notifications = data.notifications;
                    if (data.auditLog) auditLog = data.auditLog;
                    
                    localStorage.setItem("cars", JSON.stringify(cars));
                    localStorage.setItem("users", JSON.stringify(users));
                    localStorage.setItem("favorites", JSON.stringify(favorites));
                    localStorage.setItem("messages", JSON.stringify(messages));
                    localStorage.setItem("notifications", JSON.stringify(notifications));
                    localStorage.setItem("auditLog", JSON.stringify(auditLog));
                    
                    showToast("Daten erfolgreich importiert!");
                    filterCars();
                    updateUserUI();
                }
            } catch (error) {
                showToast("Fehler beim Importieren der Daten!", true);
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ========== FUNKSIONET PËR APROVIMIN E SHPALLJEVE ==========

function viewPendingCars() {
    if (!currentUser || currentUser.username !== "admin") {
        showToast("Vetëm admini mund të shikojë shpalljet në pritje!", true);
        return;
    }
    
    const auditLogContainer = document.getElementById('auditLogContainer');
    const pendingCarsContainer = document.getElementById('pendingCarsContainer');
    
    if (auditLogContainer) auditLogContainer.style.display = 'none';
    if (pendingCarsContainer) pendingCarsContainer.style.display = 'block';
    
    renderPendingCars();
}

function renderPendingCars() {
    const pendingCarsList = document.getElementById('pendingCarsList');
    if (!pendingCarsList) return;
    
    const pendingCars = cars.filter(car => car.status === "pending");
    
    updatePendingCarsCount();
    
    if (pendingCars.length === 0) {
        pendingCarsList.innerHTML = `
            <div class="no-pending-cars">
                <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px; color: var(--success);"></i>
                <h3>Nuk ka shpallje në pritje</h3>
                <p>Të gjitha shpalljet janë aprovuar</p>
            </div>
        `;
        return;
    }
    
    pendingCarsList.innerHTML = pendingCars.map((car) => {
        const carIndex = cars.findIndex(c => c.id === car.id);
        return `
            <div class="pending-car-card">
                <div>
                    <img src="${car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/150x100?text=No+Image'}" 
                         alt="${car.n} ${car.m}" class="pending-car-image">
                    <div class="pending-status pending">Në Pritje</div>
                </div>
                
                <div class="pending-car-info">
                    <h4>${car.n} ${car.m} (${car.year})</h4>
                    <div class="pending-car-details">
                        <p><strong>Vendi:</strong> ${car.city}</p>
                        <p><strong>Kilometrazhi:</strong> ${car.km ? car.km.toLocaleString() + ' km' : 'Nuk specifikuar'}</p>
                        <p><strong>Çmimi:</strong> ${car.p ? car.p.toLocaleString() + ' CHF' : 'Nuk specifikuar'}</p>
                        <p><strong>Karburanti:</strong> ${car.fuel || 'Nuk specifikuar'}</p>
                        <p><strong>Shtuar nga:</strong> ${car.ownerName}</p>
                        <p><strong>Data e shtimit:</strong> ${new Date(car.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div class="pending-car-actions">
                    <button class="signup-btn" onclick="viewCarDetailsForApproval(${carIndex})">
                        <i class="fas fa-eye"></i> Shiko Detajet
                    </button>
                    <button class="edit-btn" onclick="approveCar(${carIndex})">
                        <i class="fas fa-check"></i> Prano
                    </button>
                    <button class="delete-btn" onclick="rejectCarPrompt(${carIndex})">
                        <i class="fas fa-times"></i> Refuzo
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function viewCarDetailsForApproval(index) {
    const car = cars[index];
    if (!car) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content modal-wide">
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            <h2>Detajet e Shpalljes</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <img src="${car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}" 
                         style="width: 100%; border-radius: 8px;" alt="${car.n} ${car.m}">
                    
                    <div style="margin-top: 20px;">
                        <h3>Informacion Bazë</h3>
                        <p><strong>Marka:</strong> ${car.n}</p>
                        <p><strong>Modeli:</strong> ${car.m}</p>
                        <p><strong>Viti:</strong> ${car.year}</p>
                        <p><strong>Çmimi:</strong> ${car.p ? car.p.toLocaleString() + ' CHF' : 'Nuk specifikuar'}</p>
                        <p><strong>Kilometrazhi:</strong> ${car.km ? car.km.toLocaleString() + ' km' : 'Nuk specifikuar'}</p>
                        <p><strong>Qyteti:</strong> ${car.city}</p>
                    </div>
                </div>
                
                <div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3>Detaje Teknike</h3>
                        <p><strong>Karburanti:</strong> ${car.fuel || 'Nuk specifikuar'}</p>
                        <p><strong>Transmetimi:</strong> ${car.transmission || 'Nuk specifikuar'}</p>
                        <p><strong>Motorri:</strong> ${car.engine ? car.engine + ' cm³' : 'Nuk specifikuar'}</p>
                        <p><strong>Ngjyra:</strong> ${car.color || 'Nuk specifikuar'}</p>
                        <p><strong>Numri i ulëseve:</strong> ${car.seats || 'Nuk specifikuar'}</p>
                        <p><strong>Numri i dyerve:</strong> ${car.doors || 'Nuk specifikuar'}</p>
                    </div>
                    
                    ${car.description ? `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3>Përshkrimi</h3>
                        <p>${car.description}</p>
                    </div>
                    ` : ''}
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3>Informacione Kontakti</h3>
                        <p><strong>Shitësi:</strong> ${car.ownerName}</p>
                        ${car.phone ? `<p><strong>Telefoni:</strong> ${car.phone}</p>` : ''}
                        ${car.email ? `<p><strong>Email:</strong> ${car.email}</p>` : ''}
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <label for="adminNotesModal"><strong>Shënime (opsionale):</strong></label>
                        <textarea id="adminNotesModal" placeholder="Shkruani shënime për këtë shpallje..." rows="3" style="width: 100%; padding: 10px; border-radius: 6px; background: #1e293b; color: white; border: none; margin-top: 5px;">${car.adminNotes || ''}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="edit-btn" onclick="approveCar(${index}, document.getElementById('adminNotesModal').value); this.closest('.modal').remove()" style="flex: 1;">
                            <i class="fas fa-check"></i> Prano Shpalljen
                        </button>
                        <button class="delete-btn" onclick="rejectCarPrompt(${index}, document.getElementById('adminNotesModal').value); this.closest('.modal').remove()" style="flex: 1;">
                            <i class="fas fa-times"></i> Refuzo Shpalljen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function approveCar(index, notes = "") {
    if (!currentUser || currentUser.username !== "admin") {
        showToast("Vetëm admini mund të pranojë shpalljet!", true);
        return;
    }
    
    const car = cars[index];
    if (!car) return;
    
    cars[index] = {
        ...car,
        status: "approved",
        approvedAt: new Date().toISOString(),
        adminNotes: notes || car.adminNotes || ""
    };
    
    localStorage.setItem("cars", JSON.stringify(cars));
    
    showToast("Shpallja u pranua me sukses!");
    renderPendingCars();
    filterCars();
}

function rejectCarPrompt(index, notes = "") {
    const car = cars[index];
    if (!car) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            <h2>Refuzo Shpalljen</h2>
            
            <p>Jeni i sigurt që dëshironi të refuzoni shpalljen për <strong>${car.n} ${car.m}</strong>?</p>
            
            <div style="margin-top: 15px;">
                <label for="rejectReason"><strong>Arsyeja e refuzimit (opsionale):</strong></label>
                <textarea id="rejectReason" placeholder="Shkruani arsyen pse po e refuzoni këtë shpallje..." rows="4" style="width: 100%; padding: 10px; border-radius: 6px; background: #1e293b; color: white; border: none; margin-top: 5px;">${notes || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="rejectCar(${index}, document.getElementById('rejectReason').value); this.closest('.modal').remove()" class="delete-btn" style="flex: 1;">
                    <i class="fas fa-times"></i> Po, Refuzo
                </button>
                <button onclick="this.closest('.modal').remove()" class="signup-btn" style="flex: 1;">
                    <i class="fas fa-arrow-left"></i> Anulo
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function rejectCar(index, notes = "") {
    if (!currentUser || currentUser.username !== "admin") {
        showToast("Vetëm admini mund të refuzojë shpalljet!", true);
        return;
    }
    
    const car = cars[index];
    if (!car) return;
    
    cars[index] = {
        ...car,
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        adminNotes: notes || car.adminNotes || ""
    };
    
    localStorage.setItem("cars", JSON.stringify(cars));
    
    showToast("Shpallja u refuzua!");
    renderPendingCars();
    filterCars();
}

function updatePendingCarsCount() {
    const pendingCarsCount = document.getElementById('pendingCarsCount');
    if (!pendingCarsCount) return;
    
    const pendingCars = cars.filter(car => car.status === "pending");
    
    if (pendingCars.length > 0) {
        pendingCarsCount.textContent = pendingCars.length;
        pendingCarsCount.style.display = 'flex';
    } else {
        pendingCarsCount.style.display = 'none';
    }
}

// PWA functions
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

function closePWAInstallBanner() {
    const pwaInstallBanner = document.getElementById('pwaInstallBanner');
    if (pwaInstallBanner) {
        pwaInstallBanner.style.display = 'none';
    }
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const pwaInstallBanner = document.getElementById('pwaInstallBanner');
    if (pwaInstallBanner) {
        pwaInstallBanner.style.display = 'flex';
    }
});

// Debug function
function debugCarStatus() {
    console.log("=== DEBUG: STATUS I MAKINAVE ===");
    console.log("Total makina: " + cars.length);
    
    const statusCount = {
        approved: 0,
        pending: 0,
        rejected: 0,
        noStatus: 0
    };
    
    cars.forEach((car, index) => {
        if (!car.status) {
            statusCount.noStatus++;
            console.log(`Makina ${index}: ${car.n} ${car.m} - NUK KA STATUS`);
        } else {
            statusCount[car.status]++;
            console.log(`Makina ${index}: ${car.n} ${car.m} - Status: ${car.status}`);
        }
    });
    
    console.log("=== REZUMO ===");
    console.log(`Aprovuar: ${statusCount.approved}`);
    console.log(`Në pritje: ${statusCount.pending}`);
    console.log(`Refuzuar: ${statusCount.rejected}`);
    console.log(`Pa status: ${statusCount.noStatus}`);
    
    // Shfaq në ekran gjithashtu
    alert(`Aprovuar: ${statusCount.approved}\nNë pritje: ${statusCount.pending}\nRefuzuar: ${statusCount.rejected}\nPa status: ${statusCount.noStatus}`);
}
// ========== EXTRAS FUNKTIONEN - VERSIONI I PLOTË ==========
// Variablat globale
let currentExtrasMode = 'filter';
let selectedExtras = [];
let addSelectedExtras = [];
let editSelectedExtras = [];

// Lista e te gjitha ekstrave
const extrasList = {
    safety: [
        { id: 'extraABS', value: 'ABS', label: '🚗 ABS' },
        { id: 'extraESP', value: 'ESP', label: '🚗 ESP' },
        { id: 'extraASR', value: 'ASR', label: '🚗 ASR (Traction Control)' },
        { id: 'extraAirbagDriver', value: 'Airbag Fahrer', label: '🚗 Airbag shofer' },
        { id: 'extraAirbagPassenger', value: 'Airbag Beifahrer', label: '🚗 Airbag pasagjer' },
        { id: 'extraAirbagSide', value: 'Seitenairbags', label: '🚗 Airbag anësorë' },
        { id: 'extraAirbagCurtain', value: 'Kopfairbags', label: '🚗 Airbag koka' },
        { id: 'extraTPMS', value: 'Reifendruckkontrolle', label: '🚗 Kontroll presioni gomash' },
        { id: 'extraEmergencyBrake', value: 'Notbremsassistent', label: '🚗 Sistem frenash emergjence' },
        { id: 'extraLaneAssist', value: 'Spurhalteassistent', label: '🚗 Sistem paralajmërimi për humbjen e vijës' }
    ],
    comfort: [
        { id: 'extraSeatHeatFront', value: 'Sitzheizung vorne', label: '🪑 Sitzheizung - përpara' },
        { id: 'extraSeatHeatRear', value: 'Sitzheizung hinten', label: '🪑 Sitzheizung - prapa' },
        { id: 'extraSeatVentilation', value: 'Sitzbelüftung', label: '🪑 Sitzbelüftung' },
        { id: 'extraSeatMassage', value: 'Sitzmassage', label: '🪑 Sitzmassage' },
        { id: 'extraClimateAuto', value: 'Klimaautomatik', label: '❄️ Klimaautomatik' },
        { id: 'extraClimateZones', value: 'Mehrzonen-Klima', label: '❄️ 2/3/4-Zonen-Klima' },
        { id: 'extraWheelHeat', value: 'Lenkradheizung', label: '🌡️ Lenkradheizung' },
        { id: 'extraWindowHeat', value: 'Scheibenheizung', label: '🪟 Scheibenheizung' },
        { id: 'extraMemorySeats', value: 'Memory-Sitze', label: '💺 Memory-Sitze' },
        { id: 'extraPowerWindows', value: 'Elektrische Fensterheber', label: '🪟 Elektrische Fensterheber' }
    ],
    tech: [
        { id: 'extraRearCam', value: 'Rückfahrkamera', label: '📷 Rückfahrkamera' },
        { id: 'extra360Cam', value: '360-Grad-Kamera', label: '📷 360-Grad-Kamera' },
        { id: 'extraParkAssistRear', value: 'Einparkhilfe hinten', label: '📍 Einparkhilfe - prapa' },
        { id: 'extraParkAssistFront', value: 'Einparkhilfe vorne', label: '📍 Einparkhilfe - përpara' },
        { id: 'extraParkSensorsRear', value: 'Parkpiepser hinten', label: '📍 Parkpiepser - prapa' },
        { id: 'extraParkSensorsFront', value: 'Parkpiepser vorne', label: '📍 Parkpiepser - përpara' },
        { id: 'extraAutoPark', value: 'Automatisches Einparken', label: '📍 Totale Einparkhilfe' },
        { id: 'extraAdaptiveCruise', value: 'Abstandstempomat', label: '🔧 Abstandstempomat' },
        { id: 'extraLaneKeep', value: 'Spurhalteassistent', label: '🔧 Spurhalteassistent' },
        { id: 'extraBlindSpot', value: 'Toter Winkel-Assistent', label: '🔧 Toter Winkel-Assistent' }
    ],
    lights: [
        { id: 'extraLED', value: 'LED-Scheinwerfer', label: '💡 LED-Scheinwerfer' },
        { id: 'extraXenon', value: 'Xenon-Scheinwerfer', label: '💡 Xenon-Scheinwerfer' },
        { id: 'extraMatrixLED', value: 'Matrix-LED', label: '💡 Matrix-LED' },
        { id: 'extraCornerLight', value: 'Kurvenlicht', label: '💡 Kurvenlicht' },
        { id: 'extraHighBeamAssist', value: 'Fernlichtassistent', label: '💡 Fernlichtassistent' },
        { id: 'extraDaylight', value: 'Tagfahrlicht', label: '💡 Tagfahrlicht' }
    ],
    other: [
        { id: 'extraStartStop', value: 'Start-Stopp-Automatik', label: '🔋 Start-Stopp-Automatik' },
        { id: 'extraKeyless', value: 'Schlüsselloses Starten', label: '🔋 Schlüsselloses Starten' },
        { id: 'extra4x4', value: 'Allradantrieb', label: '🛞 Allradantrieb (4x4)' },
        { id: 'extraWinterTires', value: 'Winterreifen', label: '🛞 Winterreifen' },
        { id: 'extraAllSeasonTires', value: 'Ganzjahresreifen', label: '🛞 Ganzjahresreifen' },
        { id: 'extraSoundSystem', value: 'Premium Soundsystem', label: '🎵 Soundsystem Premium' },
        { id: 'extraCarPlay', value: 'Apple CarPlay', label: '📱 Apple CarPlay' },
        { id: 'extraAndroidAuto', value: 'Android Auto', label: '📱 Android Auto' },
        { id: 'extraNavigation', value: 'Navigationssystem', label: '📡 Navigationssystem' },
        { id: 'extraHUD', value: 'Head-up-Display', label: '📡 Head-up-Display' },
        { id: 'extraPanoramaRoof', value: 'Panoramadach', label: '🪟 Panoramadach' },
        { id: 'extraTowbar', value: 'Anhängerkupplung', label: '🚚 Anhängerkupplung' },
        { id: 'extraSunroof', value: 'Schiebedach', label: '🚗 Schiebedach' },
        { id: 'extraSportSeats', value: 'Sportsitze', label: '🚗 Sportsitze' }
    ]
};

const extraOptionTranslations = {
    de: {
        safety: ['ABS', 'ESP', 'ASR (Traktionskontrolle)', 'Fahrerairbag', 'Beifahrerairbag', 'Seitenairbags', 'Kopfairbags', 'Reifendruckkontrolle', 'Notbremsassistent', 'Spurhalteassistent'],
        comfort: ['Sitzheizung vorne', 'Sitzheizung hinten', 'Sitzbelüftung', 'Sitzmassage', 'Klimaautomatik', '2/3/4-Zonen-Klima', 'Lenkradheizung', 'Scheibenheizung', 'Memory-Sitze', 'Elektrische Fensterheber'],
        tech: ['Rückfahrkamera', '360-Grad-Kamera', 'Einparkhilfe hinten', 'Einparkhilfe vorne', 'Parksensoren hinten', 'Parksensoren vorne', 'Automatisches Einparken', 'Abstandstempomat', 'Spurhalteassistent', 'Totwinkelassistent'],
        lights: ['LED-Scheinwerfer', 'Xenon-Scheinwerfer', 'Matrix-LED', 'Kurvenlicht', 'Fernlichtassistent', 'Tagfahrlicht'],
        other: ['Start-Stopp-Automatik', 'Schlüsselloses Starten', 'Allradantrieb (4x4)', 'Winterreifen', 'Ganzjahresreifen', 'Premium-Soundsystem', 'Apple CarPlay', 'Android Auto', 'Navigationssystem', 'Head-up-Display', 'Panoramadach', 'Anhängerkupplung', 'Schiebedach', 'Sportsitze']
    },
    en: {
        safety: ['ABS', 'ESP', 'Traction control', 'Driver airbag', 'Passenger airbag', 'Side airbags', 'Curtain airbags', 'Tyre pressure monitoring', 'Emergency braking assist', 'Lane-keeping assist'],
        comfort: ['Front seat heating', 'Rear seat heating', 'Seat ventilation', 'Seat massage', 'Automatic climate control', '2/3/4-zone climate control', 'Heated steering wheel', 'Heated windows', 'Memory seats', 'Electric windows'],
        tech: ['Rear-view camera', '360-degree camera', 'Rear parking assist', 'Front parking assist', 'Rear parking sensors', 'Front parking sensors', 'Automatic parking', 'Adaptive cruise control', 'Lane-keeping assist', 'Blind-spot assist'],
        lights: ['LED headlights', 'Xenon headlights', 'Matrix LED', 'Cornering lights', 'High-beam assist', 'Daytime running lights'],
        other: ['Start-stop system', 'Keyless start', 'All-wheel drive (4x4)', 'Winter tyres', 'All-season tyres', 'Premium sound system', 'Apple CarPlay', 'Android Auto', 'Navigation system', 'Head-up display', 'Panoramic roof', 'Tow bar', 'Sunroof', 'Sports seats']
    },
    fr: {
        safety: ['ABS', 'ESP', 'Antipatinage', 'Airbag conducteur', 'Airbag passager', 'Airbags latéraux', 'Airbags rideaux', 'Contrôle de pression des pneus', 'Assistance au freinage d’urgence', 'Assistant de maintien de voie'],
        comfort: ['Sièges chauffants avant', 'Sièges chauffants arrière', 'Ventilation des sièges', 'Massage des sièges', 'Climatisation automatique', 'Climatisation 2/3/4 zones', 'Volant chauffant', 'Vitres chauffantes', 'Sièges à mémoire', 'Vitres électriques'],
        tech: ['Caméra de recul', 'Caméra 360 degrés', 'Aide au stationnement arrière', 'Aide au stationnement avant', 'Capteurs arrière', 'Capteurs avant', 'Stationnement automatique', 'Régulateur de distance', 'Assistant de maintien de voie', 'Assistant d’angle mort'],
        lights: ['Phares LED', 'Phares xénon', 'Matrix LED', 'Éclairage de virage', 'Assistant feux de route', 'Feux de jour'],
        other: ['Système start-stop', 'Démarrage sans clé', 'Transmission intégrale (4x4)', 'Pneus hiver', 'Pneus toutes saisons', 'Système audio premium', 'Apple CarPlay', 'Android Auto', 'Système de navigation', 'Affichage tête haute', 'Toit panoramique', 'Attelage', 'Toit ouvrant', 'Sièges sport']
    },
    it: {
        safety: ['ABS', 'ESP', 'Controllo della trazione', 'Airbag conducente', 'Airbag passeggero', 'Airbag laterali', 'Airbag a tendina', 'Controllo pressione pneumatici', 'Assistenza frenata d’emergenza', 'Assistente mantenimento corsia'],
        comfort: ['Sedili anteriori riscaldati', 'Sedili posteriori riscaldati', 'Ventilazione sedili', 'Massaggio sedili', 'Climatizzatore automatico', 'Climatizzatore 2/3/4 zone', 'Volante riscaldato', 'Vetri riscaldati', 'Sedili memory', 'Alzacristalli elettrici'],
        tech: ['Telecamera posteriore', 'Telecamera a 360 gradi', 'Assistenza parcheggio posteriore', 'Assistenza parcheggio anteriore', 'Sensori posteriori', 'Sensori anteriori', 'Parcheggio automatico', 'Cruise control adattivo', 'Assistente mantenimento corsia', 'Assistente angolo cieco'],
        lights: ['Fari LED', 'Fari allo xeno', 'Matrix LED', 'Luci di svolta', 'Assistente abbaglianti', 'Luci diurne'],
        other: ['Sistema start-stop', 'Avviamento senza chiave', 'Trazione integrale (4x4)', 'Pneumatici invernali', 'Pneumatici quattro stagioni', 'Impianto audio premium', 'Apple CarPlay', 'Android Auto', 'Sistema di navigazione', 'Head-up display', 'Tetto panoramico', 'Gancio traino', 'Tettuccio apribile', 'Sedili sportivi']
    },
    sq: {
        safety: ['ABS', 'ESP', 'Kontrolli i tërheqjes', 'Airbag i shoferit', 'Airbag i pasagjerit', 'Airbagë anësorë', 'Airbagë të kokës', 'Kontrolli i presionit të gomave', 'Asistencë frenimi emergjent', 'Asistent i mbajtjes së korsisë'],
        comfort: ['Ngrohje e ulëseve para', 'Ngrohje e ulëseve prapa', 'Ventilim i ulëseve', 'Masazh i ulëseve', 'Klimë automatike', 'Klimë me 2/3/4 zona', 'Ngrohje e timonit', 'Ngrohje e xhamave', 'Ulëse me memorie', 'Xhama elektrikë'],
        tech: ['Kamerë prapa', 'Kamerë 360 gradë', 'Asistencë parkimi prapa', 'Asistencë parkimi para', 'Sensorë parkimi prapa', 'Sensorë parkimi para', 'Parkim automatik', 'Tempomat adaptiv', 'Asistent i mbajtjes së korsisë', 'Asistent i këndit të vdekur'],
        lights: ['Fenerë LED', 'Fenerë Xenon', 'Matrix LED', 'Drita në kthesë', 'Asistent i dritave të gjata', 'Drita ditore'],
        other: ['Sistem start-stop', 'Ndezje pa çelës', 'Lëvizje me katër rrota (4x4)', 'Goma dimri', 'Goma për të gjitha stinët', 'Sistem audio premium', 'Apple CarPlay', 'Android Auto', 'Sistem navigimi', 'Ekran head-up', 'Çati panoramike', 'Grepi për rimorkio', 'Çati e hapshme', 'Ulëse sportive']
    }
};

// Inicializo grid-et e extras
function initExtrasGrids() {
    for (let category in extrasList) {
        const gridId = `extrasGrid${category.charAt(0).toUpperCase() + category.slice(1)}`;
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.innerHTML = extrasList[category].map(extra => `
                <div class="extra-option">
                    <label class="extra-checkbox">
                        <input type="checkbox" id="${extra.id}" value="${extra.value}" data-category="${category}">
                        <span class="checkmark"></span>
                        <span class="extra-label">${extra.label}</span>
                    </label>
                </div>
            `).join('');
        }
    }
}

// ========== FUNKSIONET PER FILTER ==========
function toggleExtrasModal() {
    const extrasModal = document.getElementById('extrasModal');
    if (!extrasModal) return;
    
    // Përcakto modalitetin
    if (document.getElementById('addModal')?.style.display === 'flex') {
        currentExtrasMode = 'add';
        selectedExtras = [...addSelectedExtras];
        document.getElementById('extrasForFilter').style.display = 'none';
        document.getElementById('extrasForAdd').style.display = 'block';
        document.getElementById('extrasForEdit').style.display = 'none';
    } 
    else if (document.getElementById('editModal')?.style.display === 'flex') {
        currentExtrasMode = 'edit';
        selectedExtras = [...editSelectedExtras];
        document.getElementById('extrasForFilter').style.display = 'none';
        document.getElementById('extrasForAdd').style.display = 'none';
        document.getElementById('extrasForEdit').style.display = 'block';
    } 
    else {
        currentExtrasMode = 'filter';
        selectedExtras = JSON.parse(sessionStorage.getItem('filterExtras')) || [];
        document.getElementById('extrasForFilter').style.display = 'block';
        document.getElementById('extrasForAdd').style.display = 'none';
        document.getElementById('extrasForEdit').style.display = 'none';
    }
    
    markSelectedCheckboxes();
    extrasModal.style.display = 'flex';
}

function closeExtrasModal() {
    document.getElementById('extrasModal').style.display = 'none';
}

function markSelectedCheckboxes() {
    const allCheckboxes = document.querySelectorAll('#extrasCategoriesContainer input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = false);
    
    selectedExtras.forEach(value => {
        const checkbox = document.querySelector(`#extrasCategoriesContainer input[value="${value}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function saveExtrasSelection() {
    const allCheckboxes = document.querySelectorAll('#extrasCategoriesContainer input[type="checkbox"]:checked');
    const newSelection = Array.from(allCheckboxes).map(cb => cb.value);
    
    if (currentExtrasMode === 'filter') {
        sessionStorage.setItem('filterExtras', JSON.stringify(newSelection));
        selectedExtras = newSelection;
        updateExtrasCount();
        if (typeof filterCars === 'function') filterCars();
    } 
    else if (currentExtrasMode === 'add') {
        addSelectedExtras = newSelection;
        selectedExtras = addSelectedExtras;
        updateAddExtrasPreview();
    } 
    else if (currentExtrasMode === 'edit') {
        editSelectedExtras = newSelection;
        selectedExtras = editSelectedExtras;
        updateEditExtrasPreview();
    }
    
    closeExtrasModal();
    showToast(`${newSelection.length} Extras ausgewählt`);
}

function clearAllExtrasFilter() {
    sessionStorage.removeItem('filterExtras');
    selectedExtras = [];
    updateExtrasCount();
    markSelectedCheckboxes();
    if (typeof filterCars === 'function') filterCars();
    showToast('Alle Extras-Filter gelöscht');
}

function selectAllExtras() {
    const allCheckboxes = document.querySelectorAll('#extrasCategoriesContainer input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => checkbox.checked = true);
    showToast('Alle Extras ausgewählt. Klicken Sie auf Speichern.');
}

// ========== FUNKSIONET PER ADD CAR ==========
function openExtrasForAdd() {
    currentExtrasMode = 'add';
    selectedExtras = [...addSelectedExtras];
    toggleExtrasModal();
}

function updateAddExtrasPreview() {
    const preview = document.getElementById('selectedExtrasPreview');
    const countBadge = document.getElementById('addExtrasCount');
    
    if (preview) {
        if (addSelectedExtras.length > 0) {
            preview.innerHTML = addSelectedExtras.map(extra => `
                <span class="extras-preview-tag">
                    <i class="fas fa-check-circle"></i>
                    ${extra}
                    <span class="remove-extra" onclick="removeAddExtra('${extra}')">×</span>
                </span>
            `).join('');
        } else {
            preview.innerHTML = '<span class="no-extras-message">Keine Extras ausgewählt</span>';
        }
    }
    
    if (countBadge) {
        countBadge.textContent = addSelectedExtras.length;
        countBadge.style.display = addSelectedExtras.length > 0 ? 'inline-block' : 'none';
    }
}

function removeAddExtra(extraValue) {
    addSelectedExtras = addSelectedExtras.filter(e => e !== extraValue);
    updateAddExtrasPreview();
}

// ========== FUNKSIONET PER EDIT CAR ==========
function openExtrasForEdit() {
    currentExtrasMode = 'edit';
    selectedExtras = [...editSelectedExtras];
    toggleExtrasModal();
}

function updateEditExtrasPreview() {
    const preview = document.getElementById('editSelectedExtrasPreview');
    const countBadge = document.getElementById('editExtrasCount');
    
    if (preview) {
        if (editSelectedExtras.length > 0) {
            preview.innerHTML = editSelectedExtras.map(extra => `
                <span class="extras-preview-tag">
                    <i class="fas fa-check-circle"></i>
                    ${extra}
                    <span class="remove-extra" onclick="removeEditExtra('${extra}')">×</span>
                </span>
            `).join('');
        } else {
            preview.innerHTML = '<span class="no-extras-message">Keine Extras ausgewählt</span>';
        }
    }
    
    if (countBadge) {
        countBadge.textContent = editSelectedExtras.length;
        countBadge.style.display = editSelectedExtras.length > 0 ? 'inline-block' : 'none';
    }
}

function removeEditExtra(extraValue) {
    editSelectedExtras = editSelectedExtras.filter(e => e !== extraValue);
    updateEditExtrasPreview();
}

// ========== FUNKSIONET PER FILTER COUNT ==========
function updateExtrasCount() {
    const extrasCount = document.getElementById('extrasCount');
    if (!extrasCount) return;
    
    const filterExtras = JSON.parse(sessionStorage.getItem('filterExtras')) || [];
    extrasCount.textContent = filterExtras.length;
    extrasCount.style.display = filterExtras.length > 0 ? 'inline-block' : 'none';
}


// Inicializo grid-et e extras
function initExtrasGrids() {
    for (let category in extrasList) {
        const grid = document.getElementById(`extrasGrid${category.charAt(0).toUpperCase() + category.slice(1)}`);
        if (grid) {
            grid.innerHTML = extrasList[category].map(extra => `
                <div class="extra-option">
                    <label class="extra-checkbox">
                        <input type="checkbox" id="${extra.id}" value="${extra.value}" data-category="${category}">
                        <span class="checkmark"></span>
                        <span class="extra-label">${extra.label}</span>
                    </label>
                </div>
            `).join('');
        }
    }
}

// Funksionet kryesore
function toggleExtrasModal() {
    const extrasModal = document.getElementById('extrasModal');
    if (!extrasModal) return;
    
    if (document.getElementById('addModal')?.style.display === 'flex') {
        currentExtrasMode = 'add';
        selectedExtras = [...addSelectedExtras];
    } 
    else if (document.getElementById('editModal')?.style.display === 'flex' && currentEditIndex !== -1) {
        currentExtrasMode = 'edit';
        selectedExtras = [...editSelectedExtras];
    } 
    else {
        currentExtrasMode = 'filter';
        selectedExtras = JSON.parse(sessionStorage.getItem('filterExtras')) || [];
    }
    
    markSelectedCheckboxes();
    extrasModal.style.display = 'flex';
}

function closeExtrasModal() {
    document.getElementById('extrasModal').style.display = 'none';
}

function markSelectedCheckboxes() {
    const allCheckboxes = document.querySelectorAll('#extrasCategoriesContainer input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = false);
    
    selectedExtras.forEach(value => {
        const checkbox = document.querySelector(`#extrasCategoriesContainer input[value="${value}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    updateExtrasCount();
}

function saveExtrasSelection() {
    const allCheckboxes = document.querySelectorAll('#extrasCategoriesContainer input[type="checkbox"]:checked');
    const newSelection = Array.from(allCheckboxes).map(cb => cb.value);
    
    if (currentExtrasMode === 'filter') {
        selectedExtras = newSelection;
        sessionStorage.setItem('filterExtras', JSON.stringify(newSelection));
        if (typeof filterCars === 'function') filterCars();
    } else if (currentExtrasMode === 'add') {
        addSelectedExtras = newSelection;
        selectedExtras = addSelectedExtras;
        updateAddExtrasPreview();
    } else if (currentExtrasMode === 'edit') {
        editSelectedExtras = newSelection;
        selectedExtras = editSelectedExtras;
        updateEditExtrasPreview();
    }
    
    updateExtrasCount();
    closeExtrasModal();
    showToast(`${selectedExtras.length} Extras ausgewählt`);
}

function updateExtrasCount() {
    const extrasCount = document.getElementById('extrasCount');
    if (!extrasCount) return;
    
    let count = 0;
    if (currentExtrasMode === 'filter') {
        count = (JSON.parse(sessionStorage.getItem('filterExtras')) || []).length;
    } else {
        count = selectedExtras.length;
    }
    
    extrasCount.textContent = count;
    extrasCount.style.display = count > 0 ? 'inline-block' : 'none';
}

function clearAllExtrasFilter() {
    sessionStorage.removeItem('filterExtras');
    selectedExtras = [];
    updateExtrasCount();
    markSelectedCheckboxes();
    if (typeof filterCars === 'function') filterCars();
    showToast('Alle Extras-Filter gelöscht');
}

// ========== FUNKSIONET E GOOGLE SIGN-IN ==========

// Funksioni për të dekoduar JWT token-in
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

// Funksioni që thirret kur përdoruesi kyçet me Google
function handleGoogleCredentialResponse(response) {
    console.log('Përgjigja nga Google:', response);
    
    if (!response || !response.credential) {
        showToast('Fehler bei der Google-Anmeldung!', true);
        return;
    }
    
    // Decodimi i kredencialeve për të marrë të dhënat e përdoruesit
    const data = parseJwt(response.credential);
    
    if (!data) {
        showToast('Fehler beim Verarbeiten der Google-Daten!', true);
        return;
    }
    
    console.log('Të dhënat e përdoruesit nga Google:', data);
    
    // Kontrollo nëse përdoruesi ekziston në sistem
    const existingUser = users.find(u => u.email === data.email);
    
    if (existingUser) {
        // Kyç përdoruesin ekzistues
        currentUser = {
            id: existingUser.id,
            username: existingUser.username
        };
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        updateUserUI();
        closeAuthModal();
        showToast("Erfolgreich mit Google eingeloggt!");
    } else {
        // Krijo përdorues të ri
        // Gjenero një username nga email-i (pjesa para @)
        let username = data.email.split('@')[0];
        
        // Sigurohu që username nuk ekziston
        let counter = 1;
        let baseUsername = username;
        while (users.some(u => u.username === username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        const newUser = {
            id: generateId(),
            username: username,
            email: data.email,
            password: 'google-auth-' + Math.random().toString(36).substring(2),
            isAdmin: false,
            createdAt: new Date().toISOString(),
            profile: {
                firstName: data.given_name || '',
                lastName: data.family_name || '',
                phone: '',
                address: '',
                avatar: data.picture || null
            }
        };
        
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        
        currentUser = {
            id: newUser.id,
            username: newUser.username
        };
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        
        updateUserUI();
        closeAuthModal();
        showToast("Konto erfolgreich mit Google erstellt!");
    }
}
// ========== END OF JAVASCRIPT FILE ==========
