# OTT Messaging System (Zalo Clone) - Requirement Analysis

This document outlines the functional and non-functional requirements for an Over-The-Top (OTT) messaging application, similar to Zalo, developed for a university-level project.

---

## 1. Functional Requirements

These are the specific features the system must implement, categorized by modules.

### 👤 Module 1: User Management & Authentication

* **F.1.1: Account Registration:** New users can create an account using a phone number (or email) and a password.
* **F.1.2: Email Account Verification:** After registering with an email, the system will send a verification link to that email address. The user must click the link to activate the account before they can log in.
* **F.1.3: User Login:** Registered and verified users can log into the system.
* **F.1.4: User Logout:** Logged-in users can log out of their accounts.
* **F.1.5: Profile Management:** Users can view and update their basic profile information (e.g., display name, avatar).
* **F.1.6: User Search:** Users can search for other users within the system by their name or phone number/email.

### 👥 Module 2: Contact (Friend List) Management

* **F.2.1: Send Friend Request:** Users can send a friend request to other users.
* **F.2.2: Accept/Decline Friend Request:** Users can view and accept or decline incoming friend requests.
* **F.2.3: View Friend List:** Users can view their list of accepted friends (contacts).
* **F.2.4: Unfriend a User:** Users can remove a friend from their contact list.

### 💬 Module 3: Chat & Messaging

* **F.3.1: One-to-One Chat:** Users can initiate a private conversation with another user.
* **F.3.2: Group Chat Creation:** Users can create a new group chat and invite other members to join.
* **F.3.3: Add Members to Group:** Group administrators can add new users to an existing group chat.
* **F.3.4: Send/Receive Text Messages:** Users can send and receive text-based messages in both one-to-one and group chats.
* **F.3.5: Send/Receive Multimedia:**
    * Send/receive **images**.
    * Send/receive short **videos**.
    * Send/receive **documents** (e.g., .pdf, .docx).
    * Send/receive **emotions/emojis**.
* **F.3.6: View Chat History:** Users can load and view past messages within a conversation.
* **F.3.7: Display Conversation List:** The system displays a list of the user's recent conversations.
* **F.3.8: Display Real-time Status Indicators:** The system shows real-time indicators, such as a "Typing..." notification when the other user is typing a message in a one-to-one chat.

### 📊 Module 4: Statistics

* **F.4.1: User-level Statistics:**
    * Users can view simple statistics about their own activity (e.g., total messages sent, number of friends/groups).
* **F.4.2: Admin-level Statistics:**
    * An administrator can view an overview of system-wide statistics (e.g., total number of users, total messages sent per day, number of active groups).

---

## 2. Non-functional Requirements

These requirements define the quality attributes and characteristics of the system, describing *how* the system should perform.

* **N.F.1: Performance:**
    * **Responsiveness:** Messages should be sent and received in near real-time (latency under 2 seconds under stable network conditions).
    * **UI Loading:** The user interface (UI) must load quickly and respond smoothly to user interactions without lagging.

* **N.F.2: Usability:**
    * **User-Friendly Interface:** The application's interface should be intuitive, clean, and easy to use for a general audience, similar to popular chat applications.
    * **Consistency:** The UI design and workflow should be consistent across different platforms (web, mobile).

* **N.F.3: Reliability:**
    * **Stability:** The system should operate stably and avoid crashes during the use of core functionalities.
    * **Data Integrity:** The system must ensure that messages are not lost or delivered to the wrong recipient.

* **N.F.4: Security:**
    * **Password Encryption:** User passwords must be hashed and stored securely in the database.
    * **Authentication:** All requests to access user resources (e.g., viewing messages) must be authenticated.

* **N.F.5: Maintainability:**
    * **Clean Code:** The source code should be clean, well-structured into modules, and commented where necessary to facilitate debugging and future development.
    * **Coding Conventions:** The project must adhere to consistent coding conventions.

* **N.F.6: Scalability:**
    * **Modular Architecture:** The system should be designed with a modular or microservices architecture to allow for easy development and independent deployment of modules weekly, as required.
    * **Cloud Compatibility:** The system architecture must be suitable for deployment on cloud platforms (e.g., AWS, Google Cloud, Azure).