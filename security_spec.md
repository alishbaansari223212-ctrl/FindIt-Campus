# Security Specification: FindIt Campus Firestore Rules

## 1. Data Invariants
- **Authentication & Identity**: Any written document (Report, User Profile, Claim) must have an ownerId / id / claimantId matching `request.auth.uid`. No user can forge another student's author identity.
- **Privacy & Safety**: Student profiles and personal PII are restricted to their authenticated owner. Public lost and found reports contain non-sensitive campus item details.
- **Integrity**: Deletion or editing of reports is restricted exclusively to the original creator of that report.
- **Connection Health**: `/test/connection` is accessible for initial ping verification.
- **Query Enforcer**: Blanket queries without filtering are guarded by status evaluation on `reports` and claimant UID on `claims`.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Report Creation**: A guest submitting a report without signing in (`request.auth == null`). Result: PERMISSION_DENIED.
2. **Owner Spoofing on Report**: Student A submitting a report with `ownerId: "student_b_uid"`. Result: PERMISSION_DENIED.
3. **Malicious Report Overwrite**: Student B sending an update modifying Student A's report. Result: PERMISSION_DENIED.
4. **Malicious Report Deletion**: Student B attempting to delete Student A's report. Result: PERMISSION_DENIED.
5. **Private User Profile Snooping**: Student A requesting `users/{student_b_uid}`. Result: PERMISSION_DENIED.
6. **User Impersonation on Profile**: Student A attempting to write a profile at `users/{student_b_uid}`. Result: PERMISSION_DENIED.
7. **Cross-User Claim Injection**: Student A filing a claim with `claimantId: "student_b_uid"`. Result: PERMISSION_DENIED.
8. **Claim Hijacking**: Student B attempting to alter or inspect Student A's private claim details. Result: PERMISSION_DENIED.
9. **Blanket Collection Scraping of Claims**: A query across all claims without filtering by current user's UID. Result: PERMISSION_DENIED.
10. **Arbitrary Root Collection Injection**: Writing to `/system_secrets/test`. Result: PERMISSION_DENIED.
11. **Malicious Empty Payload**: Submitting a report missing mandatory identity fields. Result: PERMISSION_DENIED.
12. **Status Privilege Escalation by Third-Party**: Non-owner altering report status to 'resolved'. Result: PERMISSION_DENIED.
