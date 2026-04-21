## {title}

{description}

---

### Tracking Info

| Field | Value |
|-------|-------|
| Spec Reference | {spec_screen} / {spec_feature} (or "N/A" if none) |
| WBS ID | {wbs_id} (or "N/A") |
| Parent | #{parent_number} (or "standalone") |
| Role | BE |
| FE Linked Issue | #{fe_issue_number} (when Both) |
| Linked Issues | {linked_issues} |

### API Contract

| Field | Value |
|-------|-------|
| Endpoint | `{method} {path}` |
| Request Body | `{request_schema}` |
| Response Body | `{response_schema}` |
| Auth | {required / not required} |
| Status Codes | 200: success, 400: validation error, 401: unauthorized, 500: server error |

> This API contract is a draft based on spec or PM direction.
> BE developer finalizes during implementation and records final spec in PR body.
> ⚠️ On change, MUST comment on FE linked issue (#{fe_issue_number}).

### Reference Spec

- Spec: [{spec_title}]({gdrive_url})
- Screen ID: {SCR-XXX}
- Swagger: auto-generated after implementation

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

- [ ] Endpoint works per API contract
- [ ] Request/Response schema matches
- [ ] Auth/permission check works
- [ ] No regression on existing APIs (mark ⚠️ BREAKING CHANGE in PR if any)
- [ ] Swagger auto-generation verified
- [ ] API confirmation comment posted on FE linked issue
