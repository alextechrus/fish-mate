# FishMate - Aquarium Fish Compatibility App

A cross-platform mobile app that helps aquarium hobbyists determine fish compatibility and learn essential care requirements for each fish species.

## Features

### Home Screen
- Welcome dashboard with featured fish sections
- Quick access to Compatibility Checker and My Tank
- Beginner-friendly, freshwater, and saltwater fish categories
- Daily tips for aquarium care

### Fish Browser
- Search fish by name (common or scientific)
- Filter by water type (freshwater/saltwater)
- Filter by temperament (peaceful/semi-aggressive/aggressive)
- Filter by care level (beginner/intermediate/advanced)
- Detailed fish cards with key information

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

## Tech Stack

- Expo SDK 53 with React Native
- TypeScript for type safety
- NativeWind (TailwindCSS) for styling
- Zustand for state management
- React Query for async operations
- expo-linear-gradient for visual effects
- lucide-react-native for icons

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── browse.tsx     # Fish browser
│   │   ├── compatibility.tsx # Compatibility checker
│   │   └── my-tank.tsx    # Tank management
│   ├── fish/[id].tsx      # Fish profile screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/
│   ├── data/
│   │   └── fish-database.ts  # Fish species data
│   ├── services/
│   │   └── ai-service.ts     # AI integration service
│   ├── state/
│   │   └── tank-store.ts     # Zustand tank store
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

### Compatibility Logic
- Water type matching (freshwater vs saltwater)
- Water parameter overlap checking
- Temperament compatibility analysis
- Size-based compatibility rules
- Explicit compatibility lists from database

## AI Integration (Optional)

The app supports Nano Banana Pro API for:
- Dynamic compatibility reasoning
- Natural-language explanations
- Personalized tank suggestions

To enable AI features, add your API key to the ENV tab:
```
EXPO_PUBLIC_NANOBANANA_API_KEY=your_api_key_here
```

## Getting Started

1. The app runs automatically on port 8081
2. View the app in the Vibecode preview
3. Create your first tank in the "My Tank" tab
4. Browse fish and add them to your tank
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

## Future Enhancements

- More fish species and invertebrates
- Plant compatibility information
- Water change reminders
- Fish feeding schedules
- Community features
