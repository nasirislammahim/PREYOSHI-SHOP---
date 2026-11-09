# Security Specification for AI Conversations & Messages

## 1. Data Invariants
- `ai_conversations`:
  - Every conversation must belong to an authenticated customer (`customerUid == request.auth.uid`) or admin (`nasirislammahimbd@gmail.com`).
  - `conversationId` and `customerUid` are immutable after creation.
  - A user cannot read, query, update, or delete another user's conversations.
  - Title cannot exceed 200 characters.

- `ai_messages`:
  - Every message must belong to an authenticated customer (`customerUid == request.auth.uid`).
  - Messages must reference a valid `conversationId`.
  - Roles must be one of `user`, `assistant`, `system`.
  - Content must be capped to prevent Denial-of-Wallet attacks.
  - A user cannot read, query, update, or delete another user's messages.

## 2. Dirty Dozen Attack Payloads
1. Cross-Tenant Read: User A queries `ai_conversations` where `customerUid == 'user-B'` -> DENIED.
2. Cross-Tenant Message Poisoning: User A creates `ai_messages` with `customerUid: 'user-B'` -> DENIED.
3. ID Spoofing: Unauthenticated visitor attempts to write to `/ai_conversations/{id}` -> DENIED.
4. Payload Bombing: Inserting 2MB text in `message` -> DENIED (length check).
5. Role Escalation: User sends role `super_admin` in `role` field -> DENIED (enum validation).
6. Immutable Field Modification: User updates `conversationId` or `customerUid` -> DENIED.
7. Unlisted Query Scraping: Blanket query on `/ai_messages` without `customerUid` filter -> DENIED.
8. Status Corruption: Setting status to an unsupported state `hacked` -> DENIED.
9. Ghost Fields Injection: Adding secret fields `_isBackdoor: true` to conversation doc -> DENIED.
10. ID Poisoning: Path parameter with non-alphanumeric junk characters -> DENIED (`isValidId`).
11. Unauthorized Archival: User A attempting to archive User B's conversation -> DENIED.
12. Message Deletion by Third Party: User B deleting User A's message -> DENIED.
