# Member 2: Mobile App Developer - Detailed Task List

## 👤 Role: Mobile Application Developer (React Native)

**Primary Responsibility**: Build iOS and Android mobile apps for Zalo Clone

---

## 📋 Quick Start Guide

### Prerequisites:
- Install Node.js (v18+)
- Install React Native CLI: `npm install -g react-native-cli`
- **For Android**: Install Android Studio
- **For iOS** (Mac only): Install Xcode
- Install CocoaPods (iOS): `sudo gem install cocoapods`

---

## Week 1-2: Setup & Environment (8 hours)

### Tasks:
- [ ] **Day 1**: Install Development Tools
  - Install Android Studio
  - Setup Android SDK
  - Create Android Virtual Device (AVD)
  - Install Xcode (if on Mac)
  - Test emulators/simulators

- [ ] **Day 2**: Create React Native Project
  ```bash
  npx react-native init ZaloMobile --template react-native-template-typescript
  cd ZaloMobile
  npm install
  ```

- [ ] **Day 3**: Install Dependencies
  ```bash
  npm install @react-navigation/native @react-navigation/bottom-tabs
  npm install @react-navigation/stack react-native-screens
  npm install react-native-safe-area-context
  npm install axios socket.io-client
  npm install react-native-vector-icons
  npm install @react-native-async-storage/async-storage
  ```

- [ ] **Day 4**: Test on Emulators
  ```bash
  npx react-native run-android
  npx react-native run-ios  # Mac only
  ```
  - Fix any build errors
  - Ensure app launches successfully

- [ ] **Day 5-6**: Setup Navigation
  - Configure React Navigation
  - Create authentication flow (login/register)
  - Create main app flow (tabs)
  - Test navigation

- [ ] **Day 7**: Code Sharing Setup
  - Share types with web app
  - Create shared API utilities
  - Setup shared constants

**Deliverable**: Working React Native project with navigation

---

## Week 3-5: Authentication & Main Screens (12 hours)

### Week 3: Authentication
- [ ] **Day 1-2**: Login Screen
  - Create login screen UI
  - Add email input
  - Add password input
  - Add "Login" button
  - Add "Sign up" link
  - Style with React Native components

- [ ] **Day 3-4**: Registration Screen
  - Create registration screen UI
  - Add form fields (name, email, password, phone)
  - Add input validation
  - Add "Register" button
  - Connect to backend API

### Week 4: Main App Structure
- [ ] **Day 1-2**: Bottom Tab Navigation
  - Create bottom tab navigator
  - Add "Chats" tab
  - Add "Contacts" tab
  - Add "Profile" tab
  - Add tab icons
  - Style tab bar

- [ ] **Day 3-4**: Chat List Screen
  - Create chat list layout
  - Display conversation items
  - Add user avatar
  - Show last message
  - Add timestamp
  - Implement pull-to-refresh

### Week 5: Screens Polish
- [ ] **Day 1-2**: Contacts Screen
  - Create contacts list layout
  - Display friend list
  - Add online status indicator
  - Add "Add Friend" button
  - Implement search

- [ ] **Day 3-4**: Profile Screen
  - Create profile screen layout
  - Display user information
  - Add avatar
  - Add "Edit Profile" button
  - Add "Logout" button

**Deliverable**: All main screens functional

---

## Week 6-8: Chat Functionality (12 hours)

### Week 6: Chat Screen
- [ ] **Day 1-2**: Chat Screen UI
  - Create chat screen layout
  - Add message list (FlatList)
  - Add message input at bottom
  - Add "Send" button
  - Style message bubbles

- [ ] **Day 3-4**: Message Rendering
  - Create message bubble components
  - Differentiate sent/received messages
  - Add timestamps
  - Add message status indicators
  - Implement auto-scroll

### Week 7: Media Integration
- [ ] **Day 1-2**: Image Picker
  ```bash
  npm install react-native-image-picker
  ```
  - Add image picker button
  - Implement photo selection
  - Show image preview
  - Send image to backend

- [ ] **Day 3-4**: Camera Integration
  ```bash
  npm install react-native-camera
  ```
  - Add camera button
  - Implement take photo
  - Show camera preview
  - Send captured photo

### Week 8: Real-time Features
- [ ] **Day 1-2**: WebSocket Integration
  - Connect to Socket.io server
  - Handle connection events
  - Receive real-time messages
  - Send real-time messages

- [ ] **Day 3-4**: Typing Indicator
  - Emit typing events
  - Display "typing..." indicator
  - Add typing animation
  - Test real-time typing

**Deliverable**: Functional chat with media support

---

## Week 9-10: Mobile-Specific Features (8 hours)

### Week 9: Push Notifications
- [ ] **Day 1**: Setup Firebase
  - Create Firebase project
  - Add Android app to Firebase
  - Add iOS app to Firebase
  - Download google-services.json / GoogleService-Info.plist

- [ ] **Day 2**: Install Firebase
  ```bash
  npm install @react-native-firebase/app
  npm install @react-native-firebase/messaging
  ```
  - Configure Firebase in Android
  - Configure Firebase in iOS
  - Test Firebase connection

- [ ] **Day 3**: Implement Push Notifications
  - Request notification permissions
  - Get FCM token
  - Send token to backend
  - Handle notification received
  - Handle notification opened

- [ ] **Day 4**: Test Notifications
  - Test foreground notifications
  - Test background notifications
  - Test notification tap
  - Add notification badge

### Week 10: Polish & Features
- [ ] **Day 1-2**: Offline Storage
  ```bash
  npm install @react-native-async-storage/async-storage
  ```
  - Store user session locally
  - Cache chat messages
  - Implement offline mode
  - Sync when online

- [ ] **Day 3**: App Icon & Splash
  - Design app icon
  - Add Android app icon
  - Add iOS app icon
  - Create splash screen
  - Test on devices

- [ ] **Day 4**: Biometric Auth (Optional)
  ```bash
  npm install react-native-biometrics
  ```
  - Implement fingerprint login
  - Implement face ID (iOS)
  - Add settings toggle

**Deliverable**: Feature-complete mobile app

---

## Week 11-12: Testing & Deployment (8 hours)

### Week 11: Testing
- [ ] **Day 1-2**: Device Testing
  - Test on Android phone
  - Test on iPhone (if available)
  - Test different screen sizes
  - Fix device-specific issues

- [ ] **Day 3-4**: Bug Fixes
  - Fix crashes
  - Fix UI issues
  - Test all features
  - Optimize performance

### Week 12: Deployment
- [ ] **Day 1-2**: Android Build
  - Generate signing key
  - Configure build.gradle
  - Create release build
  ```bash
  cd android
  ./gradlew assembleRelease
  ```
  - Test release APK

- [ ] **Day 3**: iOS Build (if on Mac)
  - Configure signing in Xcode
  - Create archive
  - Export IPA file
  - Test on TestFlight

- [ ] **Day 4**: Documentation
  - Write mobile app setup guide
  - Document build process
  - Create user guide
  - Add troubleshooting tips

**Deliverable**: Deployable mobile apps (APK/IPA)

---

## 🔗 API Integration

### Same APIs as Web App:
- Authentication: `/api/auth/login`, `/api/auth/register`
- Profile: `/api/users/profile`
- Friends: `/api/friends/*`
- Messages: `/api/messages`, `/api/conversations`
- WebSocket: Same events as web

### Mobile-Specific:
- POST `/api/users/fcm-token` - Register FCM token
- PUT `/api/users/device` - Update device info

---

## 📱 Platform Differences

### Android:
- Build with Gradle
- Test on Android emulator
- Deploy APK file
- Google Play Store guidelines

### iOS (Mac required):
- Build with Xcode
- Test on iOS Simulator
- Deploy IPA file
- Apple App Store guidelines

---

## 💡 Mobile Development Tips

1. **Test on real devices**: Emulators don't show everything
2. **Handle permissions**: Always request permissions properly
3. **Optimize images**: Compress images before sending
4. **Handle keyboard**: Use KeyboardAvoidingView
5. **Save battery**: Close WebSocket when app in background
6. **Offline first**: Store data locally first
7. **Performance**: Use FlatList for long lists, avoid heavy re-renders

---

## 📚 Learning Resources

- React Native Docs: https://reactnative.dev
- React Navigation: https://reactnavigation.org
- Firebase for React Native: https://rnfirebase.io
- React Native Tutorial: https://www.youtube.com/results?search_query=react+native+tutorial

---

## 📊 Time Tracking

| Week | Tasks | Estimated Hours | Actual Hours |
|------|-------|----------------|--------------|
| 1-2  | Setup & Environment | 8h | ___ |
| 3-5  | Auth & Main Screens | 12h | ___ |
| 6-8  | Chat Functionality | 12h | ___ |
| 9-10 | Mobile Features | 8h | ___ |
| 11-12| Testing & Deployment | 8h | ___ |
| **Total** | | **48h** | **___** |

---

**Role**: Mobile Developer  
**Focus**: React Native (iOS & Android)  
**Contact**: Member 3 & 4 for backend integration  
**Status**: Ready to build! 📱🚀