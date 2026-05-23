# Security Specification - Urban Report System (Igarassu Conecta)

## 1. Data Invariants
- A user document's ID must match their Firebase Auth UID.
- Citizens cannot self-assign the `admin` role during sign-up or profile update.
- Users can view and create reports; they can update their own reports (excluding status), but cannot delete reports.
- Admins can view and delete all reports, and modify report status.

## 2. Invalidation Test Cases ("Dirty Dozen" Payloads)
1. **Self-Promoted Admin (SignUp)**: Citizen payload setting `"role": "admin"`.
2. **Identity Theft (UserProfile)**: Registering userId `B` using Auth UID `A`.
3. **Role Change (UserUpdate)**: Normal citizen trying to update their role to `"admin"`.
4. **Report Impersonation**: Submitting a report with `userId` of another citizen.
5. **Report Status Hijack**: Citizen updating report status from `"recebido"` to `"resolvido"`.
6. **Orphaned User Creation**: Modifying write with unauthorized properties.
7. **Junk Field Pollution**: Sending user document with extraneous keys.
8. **Malicious Report Category**: Submitting report with category `"hacker"`.
9. **Junk ID Poisoning**: Specifying extremely long ID or empty strings for reports.
10. **Report Status Mutation on Complete**: Attempting to revert terminal status of reports by citizen.
11. **Malicious GPS Manipulation**: Specifying non-number fields for latitude/longitude.
12. **Blanket Query Scraping**: Unauthenticated client trying to retrieve the users database list.

## 3. Rules Implementation
Rules will be drafted in `/firestore.rules` and deployed to protect the Firestore database.
