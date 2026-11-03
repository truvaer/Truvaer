# Marketing & Marketplace Domain (`src/marketing/`)

## Responsibility
Growth, Directory, ServiceScout, RFQ Quotations, and Aviation Social Story Streams.

## Key Files
- `MarketingPortal.tsx`: Main portal layout, 2-column shell, 3-column listing card renderer.
- `ServiceScoutSearchEngine.tsx`: Top multi-filter search engine bar.
- `ServiceScoutFilterSidebar.tsx`: Accordion category and location filters.
- `LinkedInMarketingFeed.tsx`: Interactive aviation social feeds.
- `DirectQuotationModal.tsx`: Instant RFQ quotation dialog.
- `DirectServiceOfferModal.tsx`: Service proposal dialog.
- `StoresPortal.tsx`: Parts, aircraft, and merchandise marketplace.

## Key Rules
1. **Creation Lockdown**: "+ Create", "+ Category", and "Business Location" are only shown to Admin and Manager accounts.
2. **Card Structure**:
   - Left Column: Logo, IDs, unified action stack (`Chat` directly above `Issue Quotation` and `Send Direct Offer`).
   - Middle Column: Services Offered, Location Block, Corporate Contact Relay. (No $ Estimated Budget).
   - Right Column: Facility media, thumbnails, amenities, rating, and RFQ action buttons.
3. For full details, refer to `docs/MARKETING_SECTION.md` and `docs/CHANGES_HISTORY.md`.
