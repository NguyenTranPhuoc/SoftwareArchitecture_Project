# Member 1: Frontend Lead - Detailed Task List

## 👤 Role: Web Application Developer (React)

**Primary Responsibility**: Build the web user interface for the Zalo Clone application

---

## 📋 Checklist by Week

### Week 1-2: Project Setup & Authentication UI ✅
**Estimated Time**: 8 hours

#### Tasks:
- [ ] **Day 1-2**: Setup React project
  - Install Node.js and npm
  - Create React app with TypeScript: `npx create-react-app zalo-web --template typescript`
  - Install dependencies:
    ```bash
    npm install react-router-dom @mui/material @emotion/react @emotion/styled
    npm install axios socket.io-client
    npm install @types/react-router-dom
    ```
  - Setup folder structure: components/, pages/, hooks/, utils/, types/

- [ ] **Day 3-4**: Create Login Page
  - Design login form with email and password
  - Add input validation (email format, password length)
  - Create "Forgot Password" link
  - Add "Sign up" redirect button
  - Style with Material-UI
  - Test form validation

- [ ] **Day 5-6**: Create Registration Page
  - Design registration form (email, password, name, phone)
  - Add form validation
  - Add password confirmation field
  - Create "Already have account?" link
  - Add loading state during registration
  - Test all validations

- [ ] **Day 7**: Setup Routing
  - Configure React Router
  - Create protected routes
  - Add authentication guard
  - Test navigation between pages

**Deliverable**: Working login and registration pages with routing

---

### Week 3-5: Chat Interface 💬
**Estimated Time**: 12 hours

#### Tasks:
- [ ] **Week 3, Day 1-2**: Chat List Component
  - Create conversation list sidebar
  - Display user avatar, name, last message
  - Add timestamp for last message
  - Implement search conversations
  - Add "New Chat" button
  - Style conversation items

- [ ] **Week 3, Day 3-4**: Chat Window Component
  - Create main chat window layout
  - Add chat header (user name, status)
  - Design message container area
  - Add message input field at bottom
  - Create "Send" button
  - Add file attachment button

- [ ] **Week 4, Day 1-2**: Message Bubble Component
  - Create sent message bubble (right aligned)
  - Create received message bubble (left aligned)
  - Add timestamp to messages
  - Display sender name in groups
  - Add message status (sent, delivered, read)
  - Style message bubbles

- [ ] **Week 4, Day 3-4**: Typing Indicator
  - Create typing indicator component
  - Display "User is typing..." animation
  - Connect to WebSocket events
  - Test typing indicator

- [ ] **Week 5, Day 1-2**: Emoji & File Upload
  - Integrate emoji picker library
  - Add emoji button to input
  - Create file upload button
  - Add image preview before sending
  - Test emoji and file upload

- [ ] **Week 5, Day 3**: Polish Chat Interface
  - Add scroll to bottom on new message
  - Implement infinite scroll for history
  - Add loading states
  - Fix any UI bugs

**Deliverable**: Fully functional chat interface

---

### Week 6-8: User Profile & Contacts 👥
**Estimated Time**: 12 hours

#### Tasks:
- [ ] **Week 6, Day 1-2**: Profile Page
  - Create profile page layout
  - Display user information (name, email, phone)
  - Add "Edit Profile" button
  - Show user avatar
  - Create edit mode with forms
  - Add "Save" and "Cancel" buttons

- [ ] **Week 6, Day 3-4**: Profile Edit Functionality
  - Implement edit name
  - Implement edit phone
  - Add avatar upload functionality
  - Add image preview
  - Connect to backend API
  - Add success/error messages

- [ ] **Week 7, Day 1-2**: Contact List Component
  - Create contacts sidebar/page
  - Display all friends list
  - Show online/offline status
  - Add "Add Friend" button
  - Implement search contacts
  - Sort contacts alphabetically

- [ ] **Week 7, Day 3-4**: Friend Request System
  - Create "Friend Requests" section
  - Display pending friend requests
  - Add "Accept" button
  - Add "Decline" button
  - Create "Add Friend" modal
  - Implement search users feature

- [ ] **Week 8, Day 1-2**: Friend Request Notifications
  - Create notification badge for new requests
  - Add notification dropdown
  - Display friend request notifications
  - Mark notifications as read
  - Add click to view request

- [ ] **Week 8, Day 3**: Polish & Testing
  - Test all contact features
  - Fix UI inconsistencies
  - Add loading states
  - Test error handling

**Deliverable**: Complete profile and contact management

---

### Week 9-10: Group Chat UI 👥💬
**Estimated Time**: 8 hours

#### Tasks:
- [ ] **Week 9, Day 1-2**: Group Chat Interface
  - Adapt chat interface for groups
  - Display group name and avatar
  - Show member count
  - Add "Group Info" button
  - Display member names with messages

- [ ] **Week 9, Day 3-4**: Create Group Modal
  - Create "New Group" button
  - Design group creation modal
  - Add group name input
  - Create member selection list
  - Add checkboxes for friends
  - Implement "Create Group" button

- [ ] **Week 10, Day 1-2**: Group Settings Page
  - Create group settings modal
  - Display group members list
  - Add "Add Members" button
  - Create "Leave Group" button
  - Show admin badge for admins

- [ ] **Week 10, Day 3**: Group Member Management
  - Implement add member functionality
  - Show member roles (admin/member)
  - Add remove member (admin only)
  - Test group features

**Deliverable**: Functional group chat with management

---

### Week 11-12: Polish & Testing ✨
**Estimated Time**: 8 hours

#### Tasks:
- [ ] **Week 11, Day 1-2**: Bug Fixes
  - Test all pages and features
  - Fix identified bugs
  - Test edge cases
  - Fix cross-browser issues

- [ ] **Week 11, Day 3-4**: Responsive Design
  - Test on mobile browsers
  - Adjust layouts for tablets
  - Fix mobile-specific issues
  - Test on different screen sizes

- [ ] **Week 12, Day 1-2**: Loading States & UX
  - Add loading spinners
  - Implement skeleton screens
  - Add error boundaries
  - Improve error messages
  - Add success notifications

- [ ] **Week 12, Day 3**: Documentation
  - Write component documentation
  - Create user guide
  - Document API integration
  - Add code comments

**Deliverable**: Polished, tested web application

---

## 🔗 Integration with Backend

### APIs to Connect:
1. **Authentication**:
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - POST `/api/auth/logout`

2. **User Management**:
   - GET `/api/users/profile`
   - PUT `/api/users/profile`
   - GET `/api/users/search?q=name`

3. **Friends**:
   - POST `/api/friends/request`
   - GET `/api/friends/requests`
   - PUT `/api/friends/accept/:id`
   - DELETE `/api/friends/:id`

4. **Messages**:
   - GET `/api/conversations`
   - GET `/api/conversations/:id/messages`
   - POST `/api/messages`

5. **Groups**:
   - POST `/api/conversations` (type: group)
   - POST `/api/conversations/:id/members`

### WebSocket Events to Handle:
- `message:new` - New message received
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

---

## 📚 Learning Resources

### React
- Official React Docs: https://react.dev
- React TypeScript: https://react-typescript-cheatsheet.netlify.app

### Material-UI
- MUI Documentation: https://mui.com
- Component Examples: https://mui.com/components

### WebSocket Client
- Socket.io Client: https://socket.io/docs/v4/client-api

---

## 💡 Tips for Success

1. **Start with layout**: Get the structure right first
2. **Component reusability**: Create reusable components
3. **State management**: Use React hooks effectively
4. **Error handling**: Always handle API errors
5. **User feedback**: Add loading and success states
6. **Test frequently**: Test after each feature
7. **Ask for help**: Don't struggle alone for too long

---

## 📊 Time Tracking

| Week | Tasks | Estimated Hours | Actual Hours |
|------|-------|----------------|--------------|
| 1-2  | Setup & Auth UI | 8h | ___ |
| 3-5  | Chat Interface | 12h | ___ |
| 6-8  | Profile & Contacts | 12h | ___ |
| 9-10 | Group Chat | 8h | ___ |
| 11-12| Polish & Testing | 8h | ___ |
| **Total** | | **48h** | **___** |

---

**Role**: Frontend Lead  
**Focus**: Web Application (React)  
**Contact**: Member 3 (Backend) for API integration  
**Status**: Ready to start! 🚀