# Business Operations Domain (`src/business/`)

## Responsibility
Corporate onboarding, business authentication, compliance validation, and corporate wallets.

## Key Files
- `BusinessRegisterForm.tsx`: Multi-step corporate onboarding with location autocomplete (3+ characters).
- `BusinessLogin.tsx`: Dedicated corporate portal authentication with 2FA/MPIN.
- `BusinessVerificationModal.tsx`: Compliance status inspector (PENDING, VERIFIED, REJECTED, HARD_LOCKED).
- `BusinessCorporateWalletModal.tsx`: Corporate wallet balance and lead credit ledger.

## Key Rules
1. **Creation Restrictions**: Business users cannot self-create businesses, categories, or new locations in ServiceScout.
2. **Profile Isolation**: Business accounts can only edit listings/profiles created by their own account.
3. For full details, refer to `docs/BUSINESS_SECTION.md` and `docs/CHANGES_HISTORY.md`.
