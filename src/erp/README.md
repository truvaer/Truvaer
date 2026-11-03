# Enterprise Resource Planning & Administration Domain (`src/erp/`)

## Responsibility
Administrative consoles, PMS Desk, RBAC Permissions, Moderation, and Taxonomy Governance.

## Key Files
- `AdminPMSDesk.tsx`: SLA timer monitoring and strict immediate next-level task reassignment.
- `AdminCPanel.tsx`: Core administrative system settings.
- `AdminRBACControlPanel.tsx`: Role escalation and department matrices.
- `ApprovedTaxonomyDesk.tsx`: Full CRUD for Categories and Subcategories.
- `AdminServicesApprovalDesk.tsx`: Review queue for bespoke services.
- `AdminVerificationDesk.tsx`: Corporate vetting and hard-lock enforcement.
- `CRMPortal.tsx`: Lead pipeline and sales funnel.

## Key Rules
1. **Creation Authority**: Admins and Managers have sole authority to create businesses, add taxonomy, and register business locations.
2. **Reassignment Progression**: Reassigning tasks in PMS Desk only allows candidates of the immediate next level (L1 → L2, L2 → L3).
3. **Strike Escalation**: Report processing follows 7 → 14 → 30 day bans.
4. For full details, refer to `docs/ADMIN_SECTION.md` and `docs/CHANGES_HISTORY.md`.
