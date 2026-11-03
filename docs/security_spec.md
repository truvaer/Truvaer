# Security Specification & Adversarial Test Suite

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified if `request.auth.uid == userId`.
2. **Business Ownership Invariant**: A business document at `/businesses/{businessId}` can only be updated by the registered business owner or verified admin.
3. **Marketplace Listing Immutability**: The `business_id` of a service listing at `/services/{serviceId}` cannot be changed once created.
4. **Approval Gate Invariant**: Category and subcategory approval requests at `/customCategoryRequests/{requestId}` can only be transitioned from `PENDING_APPROVAL` to `APPROVED` or `REJECTED` by an authorized admin user.
5. **No Blind Blanket Reads**: User PII must not be readable by unauthenticated users or unauthorized third parties.
6. **Strict Path Variable Typing**: All path variables must strictly match `^[a-zA-Z0-9_\-]+$` and not exceed 128 characters.
7. **Timestamp Integrity**: `created_at` or `requested_at` cannot be spoofed to arbitrary past or future dates and must match `request.time`.

---

## 2. The "Dirty Dozen" Adversarial Payloads
Below are 12 specific hostile payloads designed to exploit identity spoofing, privilege escalation, or payload poisoning, all of which MUST be rejected (`PERMISSION_DENIED`):

1. **Payload 1 (Identity Hijack)**: Unauthenticated write to `/users/victim_123` with `{ user_id: 'victim_123', email: 'attacker@evil.com', role: 'ADMIN' }`.
2. **Payload 2 (Privilege Self-Escalation)**: Authenticated regular user with UID `usr_456` attempting to update `/users/usr_456` setting `{ role: 'SUPER_ADMIN' }`.
3. **Payload 3 (Orphaned Service Listing)**: An attacker attempting to create a listing at `/services/srv_01` with `business_id: 'non_existent_biz'`.
4. **Payload 4 (Listing Ownership Spoofing)**: Business `biz_A` attempting to modify `/services/srv_B` owned by `biz_B`.
5. **Payload 5 (Category Request Unauthorized Approval)**: Business user attempting to update status from `PENDING_APPROVAL` to `APPROVED` on `/customCategoryRequests/req_999`.
6. **Payload 6 (Shadow Field Injection)**: Attempting to insert a ghost admin field `isAdmin: true` into a standard user profile creation.
7. **Payload 7 (Path Variable Poisoning / Denial of Wallet)**: Injecting a 2KB string of null characters and script tags as a `{userId}` or `{serviceId}`.
8. **Payload 8 (Terminal State Tampering)**: Modifying a finalized `/quotations/quote_100` that is already in `ACCEPTED` status without admin authority.
9. **Payload 9 (Unbounded Array Injection)**: Supplying a 5,000-item array in `servicesOffered` to cause denial of wallet resource exhaustion.
10. **Payload 10 (Client-Side Server Timestamp Tampering)**: Supplying a fake `created_at: '1970-01-01T00:00:00Z'` instead of matching `request.time`.
11. **Payload 11 (Cross-Tenant Quotation Interception)**: A user attempting to read quotations of another client where `resource.data.client_id != request.auth.uid`.
12. **Payload 12 (Blanket Collection Scraping)**: An anonymous caller attempting a blanket list query across `/users` or `/businesses`.

---

## 3. Test Runner Design
All 12 attacks are enforced via the fortress security rules in `firestore.rules` where every single operation without proper UID alignment, schema bounds, and role validation fails with status code 7 (`PERMISSION_DENIED`).
