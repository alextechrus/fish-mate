# FishMate - Aquarium Fish Compatibility App

A cross-platform mobile app that helps aquarium hobbyists determine fish and plant compatibility and learn essential care requirements for each species.

## Features

### Home Screen
- Welcome dashboard with featured fish and plant sections
- Quick access to Search and My Tank
- Easy plants, beginner-friendly fish, freshwater, and saltwater categories
- **Rotating tips carousel** with 6 aquarium care tips (auto-rotates every 5 seconds)
- Swipe or tap dots to navigate between tips

### Search Tab (Combined Fish & Plant Browser)
- Toggle between Fish and Plants modes
- Search fish by name (common or scientific)
- Filter by water type (freshwater/saltwater)
- Filter by temperament (peaceful/semi-aggressive/aggressive)
- Filter by care level (beginner/intermediate/advanced)
- Browse aquarium plants with difficulty, lighting, and **placement filters** (foreground/midground/background/floating)
- Tap sparkle icon on any fish to check compatibility with other fish
- **Scrollable fish selection** - tap fish directly without typing to check compatibility
- Prices displayed in GBP (£)
- **Keyboard handling** - keyboard dismisses on scroll or when tapping outside

### Fish Profiles
Each fish has a dedicated profile page with:
- Common name and scientific name
- Temperament indicator
- Care level indicator (beginner/intermediate/advanced)
- Minimum tank size requirements
- Water parameters (temperature, pH, hardness)
- Diet type and feeding notes
- Tank zone preference (top/middle/bottom)
- Tank requirements (plants, hiding spaces, schooling needs)
- Compatibility lists (compatible, conditional, incompatible fish)
- Price range in GBP (£)
- Find stores near me feature

### Plant Profiles
Each plant has a dedicated profile page with:
- Common name and scientific name
- Difficulty level with **detailed explanations** (easy/moderate/difficult)
  - Shows what each difficulty level means
  - Lists requirements for each difficulty
  - Shows who each level is suitable for
- Lighting requirements with **PAR values**:
  - Low: 15-30 PAR
  - Medium: 30-50 PAR
  - High: 50-100+ PAR
- CO2 requirements
- Growth rate and placement
- Water parameters (temperature, pH, hardness)
- Care notes
- **Detailed fish compatibility explanations**:
  - Tap any fish to expand and see WHY it's compatible or incompatible
  - Explains behaviors like digging, eating plants, or being plant-safe
  - Navigate to fish profile with one tap
- Price range in GBP (£)
- Find stores near me feature

### Aquarium Plants Database
17+ aquatic plants including:
- Easy plants: Java Fern, Anubias, Amazon Sword, Java Moss, Hornwort, Water Wisteria
- Moderate plants: Cryptocoryne, Vallisneria, Dwarf Sagittaria, Ludwigia Repens
- Difficult plants: Dwarf Baby Tears, Rotala Rotundifolia, Monte Carlo
- Floating plants: Amazon Frogbit, Red Root Floater, Duckweed

### Compatibility Checker
- Multi-select fish picker via sparkle icon in search
- Visual compatibility indicators (green/yellow/red)
- Pair-by-pair analysis with detailed explanations
- Tank size validation and warnings
- Overall tank harmony summary

### My Tank
- Create multiple tank profiles
- Set tank name, size, and water type
- Add/remove fish from tanks
- Add/remove plants from tanks
- Real-time compatibility monitoring
- Overstocking warnings
- Quick access to fish and plant profiles
- Tank cost breakdown in GBP (£)

### Profile & Settings
- User authentication (local)
- Tank sharing with other users
- Access shared tanks from other users

## Tech Stack

- Expo SDK 53 with React Native
- TypeScript for type safety
- NativeWind (TailwindCSS) for styling
- Zustand for state management with AsyncStorage persistence
- React Query for async operations
- expo-linear-gradient for visual effects
- lucide-react-native for icons

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── search.tsx     # Combined fish & plant search
│   │   ├── my-tank.tsx    # Tank management
│   │   └── profile.tsx    # User profile & settings
│   ├── fish/[id].tsx      # Fish profile screen
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/
│   ├── data/
│   │   ├── fish-database.ts    # Fish species data
│   │   └── plant-database.ts   # Plant species data
│   ├── hooks/
│   │   └── useImageUrl.ts        # Hook for getting image URLs
│   ├── state/
│   │   ├── tank-store.ts    # Zustand tank store
│   │   └── auth-store.ts    # Zustand auth store
│   ├── types/
│   │   └── fish.ts           # TypeScript types
│   └── utils/
│       └── compatibility.ts  # Compatibility logic
```

## Data Model

### Fish Species
- 20+ fish species included (freshwater & saltwater)
- Each species includes:
  - Water parameters (temp, pH, hardness ranges)
  - Temperament classification
  - Tank requirements
  - Compatibility relationships
  - Price ranges

### Plant Species
- 17+ aquatic plants included
- Each plant includes:
  - Difficulty level
  - Lighting requirements
  - CO2 requirements
  - Water parameters
  - Fish compatibility

### Compatibility Logic
- Water type matching (freshwater vs saltwater)
- Water parameter overlap checking
- Temperament compatibility analysis
- Size-based compatibility rules
- Explicit compatibility lists from database

## Getting Started

1. The app runs automatically on port 8081
2. View the app in the Vibecode preview
3. Create your first tank in the "My Tank" tab
4. Browse fish and plants in the "Search" tab
5. Use the Compatibility Checker to plan your aquarium

## Fish Database

The app includes popular aquarium fish:

**Freshwater:**
- Neon Tetra, Cardinal Tetra
- Guppy, Platy, Molly, Swordtail
- Betta Fish, Dwarf Gourami
- Corydoras Catfish, Otocinclus
- Angelfish, Tiger Barb
- Oscar, Jack Dempsey

**Saltwater:**
- Clownfish, Royal Gramma
- Yellow Tang, Blue Tang
- Firefish Goby
