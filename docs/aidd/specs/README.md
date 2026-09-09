# Feature specification workflow

Each v1 feature has its own directory:

```text
docs/aidd/specs/<feature>/
  prd.md
  technical-spec.md
  evidence.md
```

## PRD required sections

- Problem and user outcome
- In scope and out of scope
- User flows
- Acceptance criteria
- Open questions and decisions required
- Privacy and compatibility impact

## Technical specification required sections

- API and UI contract
- Angular feature boundary and state ownership
- Backend/repository/migration impact
- Validation and error behavior
- Test plan
- Rollback or compatibility plan

## Evidence required sections

- Commands and test results
- Browser journey performed
- Screens/observations when relevant
- PR, merge and migration references
- Known limitations

A feature with unanswered material product questions stays in PRD review; it must not silently make the decision in code.
