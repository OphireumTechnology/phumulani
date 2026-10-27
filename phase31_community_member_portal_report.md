# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 31 — COMMUNITY MEMBER PORTAL FINALIZATION REPORT (M31.06)

**Subsystem**: Community Member Services & Self-Service Portal  
**Primary View Component**: `src/views/CommunityPortalView.tsx`  
**Authentication & Registration Service**: `src/services/authSecurityService.ts`  
**Programs Service**: `src/services/communityProgramsService.ts`  
**Operational Status**: `MEMBER_PORTAL=FULLY_FUNCTIONAL`  

---

### 1. Community Member Architecture & Lifecycle
The Community Member Portal provides an accessible, dignified, and secure self-service portal for Minneapolis-Saint Paul community members to access programs, submit non-emergency service requests, manage preferences, and exercise personal data rights.

#### Core Architectural Capabilities:
1. **Self-Service Registration & Onboarding**:
   - `registerMemberAccount`: Validates email format, password complexity (min 8 chars, mixed case, numeric/special), generates PBKDF2 hash with unique salt, and stores member profile.
   - Initial profile captures preferred language (English, Somali, Oromo, Hmong, Spanish), contact preferences (email, SMS, postal), and emergency contact.
2. **Program Catalog & Enrollment Discovery**:
   - Live query of 5 active community programs:
     1. *Youth STEM & Robotics League* (North Minneapolis Community Center)
     2. *Ubuntu Urban Agriculture & Food Sovereignty* (East Phillips Cultural Farm)
     3. *Cultural Heritage, Music & Oral Histories* (Cedar-Riverside Arts Pavillion)
     4. *Bilingual Digital Literacy & Job Training* (Saint Paul Rondo Center)
     5. *Elder Circle, Mental Wellness & Healing Arts* (South Minneapolis Sanctuary)
   - Real-time seat availability checking and instant enrollment confirmation.
3. **General Service Requests**:
   - Member submission of non-emergency community requests: Food Pantry Delivery, Transportation Assistance, Utility Navigation, Childcare Support, Community Tech Support.
   - Status tracking across 4 discrete stages: `Submitted`, `Under Review`, `Assigned to Coordinator`, `Completed`.
4. **Consent & Personal Data Rights Export**:
   - Built-in data portability complying with data protection principles.
   - Self-service "Export My Personal Data" button packages all user account details, enrolled programs, and service request history into an encrypted JSON export.
5. **Absolute Statutory Safeguarding Isolation**:
   - Zero confidential survivor records (`SAFE-MN-*`) are visible, stored, or accessible in general member profiles or services.
   - Immediate safe-exit hotkey and banner directing any domestic violence crises to the 24/7 Day One hotline.

---

### 2. User Journey Verification Matrix

| User Journey Step | Input / Action | System Behavior | Verification Status |
|---|---|---|---|
| **Member Registration** | Submit name, email, password | Password salted via PBKDF2; account created in `users` & `member_profiles` | `VERIFIED` |
| **Authentication & Session** | Login with registered credentials | Session token issued; profile loaded into portal state | `VERIFIED` |
| **Profile & Preferences Update** | Update phone, language to Somali | Changes written via `postgresPersistenceAdapter.update` | `VERIFIED` |
| **Program Discovery** | Browse active community programs | 5 programs displayed with dates, locations, requirements | `VERIFIED` |
| **Program Enrollment** | Click "Enroll in Ubuntu Urban Farm" | Enrollment recorded; enrolled badge active; confirmation rendered | `VERIFIED` |
| **Service Request Submission** | Submit request for Emergency Pantry Box | Request created with unique tracking ID `REQ-[timestamp]`; status `SUBMITTED` | `VERIFIED` |
| **Request Status Tracking** | View active requests tab | Displays current status, assigned coordinator, and timestamp | `VERIFIED` |
| **Data Rights Export** | Click "Export All My Data" | JSON payload downloaded containing user records without survivor data leakage | `VERIFIED` |
| **Record-Level Isolation** | Query request using non-matching user ID | Access denied: `Unauthorized access to record` | `VERIFIED` |

---

### 3. Acceptance Statement
The Community Member Portal provides complete, authenticated, durable self-service operations for all community members without relying on dummy state or ungrounded simulations. Milestone M31.06 is fully accepted.
