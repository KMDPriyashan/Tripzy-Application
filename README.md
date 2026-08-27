# Tripzy

Tripzy is a cross-platform mobile travel companion designed to help travelers discover destinations, organize trips, prepare for journeys, monitor travel conditions, and connect with other travelers and local tour guides. It combines planning, navigation, travel information, social discovery, and communication in one React Native application.

This document describes the project purpose, objectives, features, technologies, architecture, methodology, workflows, data strategy, setup, limitations, and future scope.

## 1. Project Overview

### Problem Statement

Travel preparation is often spread across map applications, weather services, notes, spreadsheets, social networks, and messaging tools. Travelers need a single place to organize a trip, understand destination conditions, prepare what to take, and communicate with travel partners.

Tripzy addresses this problem through one mobile platform for:

- Destination discovery and location search.
- Personal itinerary creation and management.
- Budget estimation and packing preparation.
- Weather forecasts and travel recommendations.
- Route planning and current-location support.
- Travel posts, events, reactions, comments, and saved content.
- Direct and group communication.
- Local tour guide discovery and booking requests.

### Vision

To become a practical digital travel companion that supports the complete travel journey, from inspiration and preparation to destination exploration and communication.

### Target Users

- Solo travelers planning independent trips.
- Families and groups organizing shared journeys.
- Travelers who need destination, weather, and route information.
- People searching for local tour guides.
- Travelers who want to share experiences and discover ideas from a community.

## 2. Project Objectives

1. Provide a simple mobile-first trip planning experience.
2. Keep itinerary, budget, and packing information together.
3. Help travelers make better decisions with location and weather data.
4. Support communication between travel partners and community members.
5. Connect travelers with tour guides through searchable profiles and booking requests.
6. Provide persistent sessions and local data caching.
7. Deliver a responsive, accessible, and visually engaging cross-platform interface.

## 3. Feature Details

### 3.1 Onboarding and Authentication

- Animated Tripzy entry and welcome screens.
- Registration with full name, email, and password.
- Supabase email confirmation.
- Email/password login.
- Input validation and readable authentication errors.
- Resend verification email support.
- Forgot-password email flow.
- Persistent authentication sessions using AsyncStorage.
- Password updates from Settings & Privacy.

### 3.2 Home and Navigation

- Authenticated home/profile landing screen.
- Shortcuts for Trip Planning, Travel Map, Travel Feed, Travel Guide, Community, and Weather.
- Animated interactions and screen transitions.
- Shared bottom navigation for Home, Map, Feed, Groups, and Profile.
- Expo Router file-based navigation.

### 3.3 Trip Planning and Itineraries

A plan can contain a destination, province, planning location, dates, notes, status, start time, image, social caption, budget summary, and selected packing items.

Itinerary functionality includes:

- Calendar with month navigation and date selection.
- Recent itineraries.
- Search and filtering.
- View, update, share, and delete operations.
- Highlighting an itinerary from a notification.
- Permanent local storage for itinerary images.
- Cleanup of unused local travel images.

Plans are currently stored locally under the `travelPlans` AsyncStorage key.

### 3.4 Budget Estimation

The budget tool estimates transportation, accommodation, food, and activity expenses. Users enter destination, duration, group size, budget style, and cost options. The total and category breakdown are returned to the trip plan. Budget styles include Budget, Mid-range, and Luxury.

### 3.5 Packing List

The packing assistant generates a checklist using trip type, duration, and group size. It includes travel documents, clothing, toiletries, and type-specific items for beach, mountain, hiking, business, and family travel.

Users can select items, add custom items, edit or remove items, adjust quantities for longer trips and larger groups, and return selected items to the itinerary form.

### 3.6 Maps, Locations, and Routes

- Origin and destination selection.
- Current location with permission handling.
- Search through the Supabase `locations` table.
- Relevance-ranked results and popular destinations.
- Google Places fallback search.
- Additional waypoints.
- Driving, walking, transit, and cycling modes.
- Platform map links for route opening.
- Basic route weather and traffic information.

### 3.7 Weather Information

The weather module uses Open-Meteo and provides current conditions, temperature, feels-like temperature, humidity, wind, precipitation, hourly forecasts, seven-day forecasts, current-location weather, pull-to-refresh, and weather-based travel advice.

Additional screens provide tomorrow-focused forecasts and weather notification history. The current main search and location validation are limited to Sri Lanka.

### 3.8 Travel Feed and Social Features

- Text and image travel posts.
- Captions, hashtags, and location check-ins.
- Like, Love, Haha, Wow, Sad, and Angry reactions.
- Comments, sharing, and saved posts.
- Travel stories based on user posts.
- Events with categories, descriptions, dates, locations, prices, capacity, and enrollment.
- User-created events.
- Traveler profiles with posts and saved content.

The feed currently relies substantially on local keys including `allPosts`, `feedPosts`, `userPosts`, `savedPosts`, and `registeredUsers`.

### 3.9 Community, Direct Chat, and Group Chat

- User and conversation browsing.
- User search.
- Direct one-to-one conversations.
- Travel group creation and member selection.
- Group profile images and member lists.
- Text and media messages.
- Native sharing.
- Local message caching with Supabase fallback.
- Supabase real-time message subscriptions.
- Conversation summaries and last-message updates.
- Swipeable conversation and group interactions.

### 3.10 Tour Guide Marketplace

- Browse and search guide profiles.
- Search by name, province, travel mode, and language.
- View experience, languages, specialties, notes, availability, and contact information.
- Create and edit guide profiles.
- Upload guide images.
- Rate a guide once per local user profile.
- Send booking requests through email or WhatsApp.
- Save booking requests to `tour_guide_bookings` in Supabase.
- Real-time guide profile updates through `tour_guides`.
- Optional blocked-user filtering through `blocked_users`.

### 3.11 Profiles and Settings

Profiles support avatar and cover images, biography, location, contact details, website, travel statistics, favorite and next destinations, native profile sharing, user posts, saved posts, and logout.

Settings include password changes, profile editing, profile visibility, location sharing, help and support, and notification preferences.

### 3.12 Notifications

The notification context provides animated in-app banners, success/plan/budget/packing types, swipe dismissal, automatic dismissal, tappable itinerary notifications, and persisted preferences for push alerts, app updates, and travel alerts.

The notification history screen currently contains demonstration records, while the shared banner system is connected to planning actions.

## 4. Technology Stack

### Client

- React Native 0.81.5.
- React 19.1.0.
- Expo SDK 54.
- Expo Router 6.
- JavaScript and JSX.
- TypeScript 5.9 for development support.
- ESLint with Expo configuration.

### Navigation and UI

- React Navigation bottom tabs and stacks.
- Expo Vector Icons and React Native Vector Icons.
- Expo Linear Gradient.
- Styled Components.
- Safe Area Context.
- Gesture Handler and Reanimated.
- React Native Animated API.

### Backend and External Services

- Supabase for authentication, database access, and real-time subscriptions.
- AsyncStorage for local persistence, caching, settings, and offline-style fallback behavior.
- Open-Meteo API for weather data.
- Google Places API for fallback location search.
- WhatsApp deep links for guide booking communication.
- Mail links for email booking requests.

### Device and Expo APIs

- `expo-location` for permissions, coordinates, and reverse geocoding.
- `expo-image-picker` for profile, guide, post, group, and itinerary images.
- `expo-camera` for camera capability support.
- `expo-file-system` for permanent image storage and cleanup.
- `expo-sharing` and React Native `Share` for sharing.
- `expo-speech`, `expo-web-browser`, `expo-linking`, and `expo-haptics`.
- `uuid` and `react-native-get-random-values` for identifiers.

## 5. Application Architecture

Tripzy follows a feature-oriented, screen-based React Native architecture.

```text
Tripzy Application
|
|-- Expo Router navigation
|   |-- Authentication and onboarding
|   |-- Tab navigation
|   |-- Feature screens under app-pages
|
|-- Shared UI
|   |-- BottomNav
|   |-- WeatherWidget
|   |-- NotificationProvider
|
|-- Services and integrations
|   |-- Supabase client and data helpers
|   |-- Weather APIs
|   |-- Location and map APIs
|   |-- Device image, file, share, and link APIs
|
|-- Persistence
    |-- Supabase Auth and database
    |-- AsyncStorage local application data
    |-- Local document storage for itinerary images
```

### Main Project Structure

- `app/index.jsx`: animated entry screen.
- `app/welcome.jsx`: onboarding flow.
- `app/loginpage.jsx`: login.
- `app/signup.jsx`: registration.
- `app/profile.jsx`: authenticated home/profile landing page.
- `app/Tabs/`: tab navigation screens.
- `app/app-pages/`: detailed feature screens.
- `app/auth/callback.jsx`: email verification callback.
- `components/`: shared UI components.
- `lib/`: Supabase client and data helpers.
- `services/`: service-layer files such as weather services.

### Data Strategy

- Supabase stores users, profiles, locations, guide profiles, bookings, and message records where configured.
- AsyncStorage stores plans, feed content, conversations, groups, ratings, notification settings, cached profiles, and selected images.
- Supabase real-time channels support chat and guide profile changes.
- Local fallback data and demo users are used on several screens when backend records are unavailable.

## 6. Main Data Entities

The application refers to these main entities and tables:

- `users`: application user records linked to Supabase Auth.
- `profiles`: additional user profile information.
- `locations`: searchable and popular destinations.
- `direct_messages`: one-to-one messages.
- Group message and membership records.
- `tour_guides`: tour guide profiles.
- `tour_guide_bookings`: guide booking requests.
- `blocked_users`: optional blocked-user relationships.
- `travelPlans`: local itinerary collection.
- Local feed, saved-post, conversation, group, rating, and notification collections.

The exact Supabase schema and Row Level Security policies are external to this repository.

## 7. Key User Workflows

### Create a Trip

1. User signs in or creates an account.
2. User opens Trip Planning.
3. User enters destination, dates, notes, status, and an optional image.
4. User calculates a budget.
5. User generates and selects packing items.
6. User saves the completed itinerary.
7. The plan appears in My Itineraries and can be viewed, shared, or updated.

### Find a Destination

1. User opens Travel Map.
2. User searches for a location or uses current location.
3. Tripzy searches its location database.
4. Google Places is used when no database result is available.
5. User selects origin, destination, and optional waypoints.
6. User chooses a travel mode and opens the route in the platform map application.

### Connect with a Tour Guide

1. User opens Travel Guide.
2. User searches or browses profiles.
3. User views guide details.
4. User enters date, group size, contact information, and special requests.
5. Tripzy opens WhatsApp or email with a formatted request.
6. The request is recorded in Supabase when applicable.

### Participate in the Community

1. User opens Travel Feed or Community.
2. User creates a post, check-in, event, or conversation.
3. Other users react, comment, save, share, or message.
4. Users can create groups for collaborative travel communication.

## 8. Development Methodology

Tripzy is developed using an iterative Agile-style methodology.

### Iterative Development

The application is built feature by feature. Each major area is developed as an independently testable workflow, then connected through shared navigation, storage, and notification behavior.

### User-Centered Design

The interface focuses on common traveler goals: plan a trip, find a route, check weather, prepare luggage, find a guide, and communicate with others. Forms provide immediate validation and feedback.

### Component-Based Implementation

Screens use reusable React Native components, shared navigation, context providers, and service helpers. This separates authentication, notifications, API calls, storage, and presentation where practical.

### Progressive Enhancement

Features attempt to remain useful when backend data is unavailable by using local cache, fallback data, demo content, or alternate integrations. Synchronization should be strengthened before production deployment.

### Quality Practices

- Validation for authentication, planning, budget, packing, guide booking, and search.
- Loading, empty, error, and permission-denied states.
- AsyncStorage persistence checks.
- Supabase error handling and fallback behavior.
- Real-time subscription cleanup on unmount.
- ESLint checks through the project script.
- Manual testing on Android, iOS, and web where supported.

## 9. Installation and Running

### Prerequisites

- Node.js and npm.
- Android emulator, iOS simulator, physical device, or Expo Go.
- Supabase project configuration and required database tables.
- Google Maps/Places configuration for map search and native map behavior.

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

### Run on web

```bash
npm run web
```

### Run linting

```bash
npm run lint
```

### Reset the starter structure

```bash
npm run reset-project
```

This reset command is intended for the original Expo starter structure and should not be used casually after application features have been added.

## 10. Configuration and Security Notes

The project currently contains service URLs and API keys in application configuration/source files. Before publishing:

- Move configuration to environment-specific Expo configuration.
- Restrict Google API keys by platform and API scope.
- Confirm that Supabase Row Level Security policies are correctly configured.
- Never place Supabase service-role keys or private secrets in the mobile client.
- Review authentication redirect URLs and deep-link schemes.
- Validate policies for users, profiles, messages, bookings, and locations.
- Add production error monitoring and remove development logging.

## 11. Current Limitations

The repository is an active application prototype containing connected features, local features, and demonstration data.

- Several feed, profile, group, chat, itinerary, rating, and notification records are stored locally rather than fully synchronized through Supabase.
- Some screens contain sample users, itineraries, events, or notifications.
- Weather notification generation includes simulated alert behavior.
- Main weather search currently supports Sri Lankan cities and validates current coordinates against Sri Lanka bounds.
- Some route names and navigation targets should be reviewed for consistency before release.
- The database schema and Row Level Security policies are external to this repository.
- Production push notifications, background weather monitoring, and a complete server-side event system are not yet established.
- Automated unit, integration, and end-to-end test suites are not currently included.
- API credentials should use secure environment configuration before deployment.

## 12. Future Enhancements

1. Move feed, event, chat, rating, and itinerary data to well-defined Supabase tables.
2. Add full offline synchronization and conflict resolution.
3. Implement real push notifications.
4. Replace simulated alerts with scheduled server-backed weather alerts.
5. Add route distance, duration, and turn-by-turn information.
6. Expand weather and destination coverage beyond Sri Lanka.
7. Add privacy controls, reporting, blocking, and moderation workflows.
8. Add accessibility labels, larger-text support, and screen-reader testing.
9. Add automated tests for authentication, planning, budgets, packing, search, chat, and bookings.
10. Add CI checks for linting, type validation, builds, and dependency security.
11. Improve error boundaries, retry handling, and offline states.
12. Add analytics with explicit consent and privacy documentation.
13. Publish separate development, staging, and production configurations.

## 13. Project Outcome

Tripzy provides a broad foundation for a complete travel companion application. It combines trip preparation tools with live travel information, social discovery, community communication, and local tour guide connections. The current implementation demonstrates the core product experience and the integration points required for a production-ready travel platform.

The next stage is to consolidate the hybrid local/backend data model, secure configuration, complete testing, and replace demonstration behavior with production services.

## 14. License and Ownership

No license file is currently included in this repository. Add an appropriate license and ownership statement before public distribution.
