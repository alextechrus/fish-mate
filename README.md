# FishMate - Aquarium Fish Compatibility App

A cross-platform mobile app that helps aquarium hobbyists determine fish compatibility and learn essential care requirements for each fish species.

## Features

### Home Screen
- Welcome dashboard with featured fish sections
- Quick access to Compatibility Checker and My Tank
- Beginner-friendly, freshwater, and saltwater fish categories
- Daily tips for aquarium care

### Search Tab (Combined Fish & Plant Browser)
- Toggle between Fish and Plants modes
- Search fish by name (common or scientific)
- Filter by water type (freshwater/saltwater)
- Filter by temperament (peaceful/semi-aggressive/aggressive)
- Filter by care level (beginner/intermediate/advanced)
- Browse aquarium plants with difficulty and lighting filters
- Integrated Compatibility Checker for fish
- AI-generated unique images for each species

### Fish Profiles
Each fish has a dedicated profile page with:
- Common name and scientific name
- Temperament indicator
- Minimum tank size requirements
- Water parameters (temperature, pH, hardness)
- Diet type and feeding notes
- Tank zone preference (top/middle/bottom)
- Tank requirements (plants, hiding spaces, schooling needs)
- Compatibility lists (compatible, conditional, incompatible fish)
- Price range information

### Aquarium Plants Database
17+ aquatic plants including:
- Easy plants: Java Fern, Anubias, Amazon Sword, Java Moss, Hornwort, Water Wisteria
- Moderate plants: Cryptocoryne, Vallisneria, Dwarf Sagittaria, Ludwigia Repens
- Difficult plants: Dwarf Baby Tears, Rotala Rotundifolia, Monte Carlo
- Floating plants: Amazon Frogbit, Red Root Floater, Duckweed

Each plant includes:
- Difficulty level (easy/moderate/difficult)
- Lighting requirements (low/medium/high)
- CO2 requirements
- Water parameters
- Fish compatibility information
- Price ranges

### Compatibility Checker
- Multi-select fish picker
- Visual compatibility indicators (green/yellow/red)
- Pair-by-pair analysis with detailed explanations
- Tank size validation and warnings
- Suggested compatible fish based on current selection
- Overall tank harmony summary

### My Tank
- Create multiple tank profiles
- Set tank name, size, and water type
- Add/remove fish from tanks
- Real-time compatibility monitoring
- Overstocking warnings
- Quick access to fish profiles

### Profile & Settings
- User authentication (local)
- Tank sharing with other users
- Access shared tanks from other users
- AI Image Generation feature

### AI Image Generation
- Generate unique, realistic images for each fish and plant species
- Uses Nano Banana Pro API (Gemini) for image generation
- Images stored locally and used throughout the app
- Access via Profile > Settings > Generate AI Images

## Tech Stack

- Expo SDK 53 with React Native
- TypeScript for type safety
- NativeWind (TailwindCSS) for styling
- Zustand for state management with AsyncStorage persistence
- React Query for async operations
- expo-linear-gradient for visual effects
- lucide-react-native for icons
- expo-file-system for local image storage

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
│   ├── generate-images.tsx # AI image generation
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/
│   ├── data/
│   │   ├── fish-database.ts    # Fish species data
│   │   └── plant-database.ts   # Plant species data
│   ├── services/
│   │   └── image-generator.ts  # AI image generation service
│   ├── hooks/
│   │   ├── useGeneratedImages.ts # Hook for managing generated images
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

## AI Integration

The app uses Nano Banana Pro API (Gemini) for:
- Generating unique, realistic images for each fish and plant
- Images are stored locally for offline use

To generate images:
1. Go to Profile tab
2. Tap "Generate AI Images" in Settings
3. Choose to generate fish images, plant images, or both
4. Wait for generation to complete (each image takes ~30 seconds)

## Getting Started

1. The app runs automatically on port 8081
2. View the app in the Vibecode preview
3. Create your first tank in the "My Tank" tab
4. Browse fish and plants in the "Search" tab
5. Use the Compatibility Checker to plan your aquarium
6. Optionally generate AI images for enhanced visuals

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
