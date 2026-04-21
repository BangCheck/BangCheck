## {title}

{description}

---

### Tracking Info

| Field | Value |
|-------|-------|
| Spec Reference | {spec_screen} / {spec_feature} (or "N/A" if none) |
| WBS ID | {wbs_id} (or "N/A") |
| Parent | #{parent_number} (or "standalone") |
| Role | {FE / BE / Both} |
| Linked Issues | {linked_issues} |

### Implementation

{implementation_description}

### Implementation Checklist

- [ ] {checklist_item_1}
- [ ] {checklist_item_2}

### Edge Cases

- [ ] {edge_case_1}

### Test Scenarios

- [ ] {test_scenario_1}
- [ ] {test_scenario_2}

### Done Criteria

- [ ] Feature works as expected
- [ ] No regression on existing features
- [ ] Code convention compliance
{if role == BE or Both}
- [ ] API contract fulfilled (see API Contract section below)
{/if}
