# FishMate - Aquarium Fish Compatibility App

A cross-platform mobile app that helps aquarium hobbyists determine fish and plant compatibility and learn essential care requirements for each species.

## Features

### Home Screen
- Welcome dashboard with featured fish and plant sections
- Quick access to Search and My Tank
- **Section order**: Freshwater Fish, Saltwater Fish, Easy Plants, Beginner Friendly Fish
- **Section icons**: Each category has a distinctive icon (water droplets for freshwater, waves for saltwater, leaf for plants, sparkles for beginner fish)
- **Rotating tips carousel** with 6 aquarium care tips (auto-rotates every 5 seconds)
- Swipe or tap dots to navigate between tips

### Search Tab (Combined Fish & Plant Browser)
- Toggle between Fish and Plants modes
- Search fish by name (common or scientific)
- **Comprehensive Fish Filters**:
  - Water type (freshwater/saltwater)
  - Temperament (peaceful/semi-aggressive/aggressive)
  - Care level (beginner/intermediate/advanced)
  - Tank zone (top/middle/bottom/all levels)
  - Min tank size (small ≤20g, medium 21-55g, large 55g+)
  - Max fish size (small ≤3in, medium 3-6in, large 6in+)
- **Comprehensive Plant Filters**:
  - Difficulty (easy/moderate/difficult)
  - Lighting (low/medium/high)
  - Placement (foreground/midground/background/floating)
  - Growth rate (slow/moderate/fast)
  - CO2 requirement (no CO2/CO2 required)
- Tap sparkle icon on any fish to check compatibility with other fish
- **Scrollable fish selection** - tap fish directly without typing to check compatibility
- Prices displayed in GBP (£)
- **Keyboard handling** - keyboard dismisses on scroll or when tapping outside

### Fish Profiles
Each fish has a dedicated profile page with:
- Common name and scientific name
- **AI-generated aquarium images** - Species shown in realistic tank settings
- Temperament indicator
- Care level indicator (beginner/intermediate/advanced)
- **Collapsible info card** with expandable sections for:
  - **Max Size** - Adult size with care tips
  - **Minimum Tank Size** - With explanation for tank sizing
  - **Tank Zone** - Dynamic icon showing which water level (top/middle/bottom) with detailed tips
- Water parameters (temperature, pH, hardness) - respects user's temperature unit preference
- Diet type and feeding notes
- Tank requirements (plants, hiding spaces, schooling needs)
- Compatibility lists (compatible, conditional, incompatible fish)
- Price range in GBP (£) - now displayed below tank requirements
- Find stores near me feature

### Plant Profiles
Each plant has a dedicated profile page with:
- Common name and scientific name
- **AI-generated aquarium images** - Plants shown in realistic tank settings
- **Collapsible info card** with expandable sections for:
  - **Difficulty** - Tap to see what each level means, requirements, and who it's suitable for
  - **Lighting** - Tap to see PAR values and lighting descriptions
  - **Growth Rate** - Tap to see what slow/moderate/fast growth means for maintenance
  - **Placement** - Dynamic icon showing placement zone (foreground/midground/background/floating) with tips
- CO2 requirements
- Water parameters (temperature, pH, hardness)
- Care notes
- **Detailed fish compatibility explanations**:
  - Tap any fish to expand and see WHY it's compatible or incompatible
  - Explains behaviors like digging, eating plants, or being plant-safe
  - Navigate to fish profile with one tap
- Price range in GBP (£) - displayed below requirements
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

### Compatibility Chart (NEW)
- **Visual matrix/grid display** comparing up to 5 fish at once
- Quick access from home page via "Compatibility Chart" button
- **Interactive fish selection**:
  - Add fish via search or tap
  - Remove fish with one tap
  - Visual fish thumbnails
- **Color-coded compatibility matrix**:
  - Green: Compatible pairs
  - Yellow: Use caution
  - Red: Not compatible
- **Tap any cell** to see detailed compatibility info
- **Overall compatibility score** with visual bar chart
- Shows total compatible, conditional, and incompatible pair counts

### My Tank
- Create multiple tank profiles
- Set tank name, size, and water type
- Add/remove fish from tanks
- Add/remove plants from tanks
- Real-time compatibility monitoring
- Overstocking warnings
- Quick access to fish and plant profiles
- Tank cost breakdown in GBP (£)
- **Tap any tank to view detailed tank page**:
  - Enlarged focused view of the tank
  - Fish and plants displayed in horizontal scrollable cards
  - **Water change reminder scheduling**:
    - Set frequency (daily/weekly/biweekly/monthly)
    - Choose day of week and time
    - Syncs to phone notifications
    - Log water changes with one tap
  - **Tank Journey (Activity Log)**:
    - Track all tank activities from creation
    - See when fish/plants were added or removed
    - View water change history
    - Reminder changes logged

### Settings
- User authentication (sign in/sign out)
- **Preferences**:
  - Volume unit toggle (Litres or Gallons)
  - Temperature unit toggle (Celsius or Fahrenheit)
- Tank sharing with other users
- Access shared tanks from other users
- **Feedback & Support**:
  - Rate the app in App Store
  - Report a bug via email
  - Send feedback via email
- **Admin Tools**:
  - AI Image Generator - Create aquarium images for all species
- **Legal**:
  - Privacy Policy
  - Terms of Service
- App version info

## Tech Stack

- Expo SDK 53 with React Native
- TypeScript for type safety
- NativeWind (TailwindCSS) for styling
- Zustand for state management with AsyncStorage persistence
- React Query for async operations
- expo-linear-gradient for visual effects
- lucide-react-native for icons
- OpenAI gpt-image-1 for AI image generation

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── search.tsx     # Combined fish & plant search
│   │   ├── my-tank.tsx    # Tank management
│   │   └── profile.tsx    # User profile & settings
│   ├── admin/             # Admin tools
│   │   └── generate-images.tsx  # AI image generation
│   ├── fish/[id].tsx      # Fish profile screen
│   ├── compatibility-chart.tsx  # Fish compatibility matrix
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/
│   ├── data/
│   │   ├── fish-database.ts    # Fish species data
│   │   ├── plant-database.ts   # Plant species data
│   │   └── species-images.ts   # AI-generated image URLs
│   ├── hooks/
│   │   └── useImageUrl.ts        # Hook for getting image URLs
│   ├── services/
│   │   └── image-generation.ts   # OpenAI image generation
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
