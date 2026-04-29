<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Step 01 — ERD Auto-Update

---

## 1-1. Scan Entity Files

```bash
find backend/src/main/java -name "*.java" -path "*/entity/*" | grep -v enums | sort
find backend/src/main/resources/db/migration -name "V*.sql" | sort
```

---

## 1-2. Extract Schema

For each entity file:
- `@Table(name = "...")` → 테이블명
- `@Column(name = "...", nullable = ..., length = ...)` → 컬럼 정의
- `@Id`, `@GeneratedValue` → PK
- `@OneToMany`, `@ManyToOne`, `@JoinColumn` → 관계

For each migration SQL:
- `FOREIGN KEY` → 관계선 확인
- `ALTER TABLE` → 최신 스키마 반영

---

## 1-3. Generate Mermaid ER Diagram

```
## Mermaid ER Diagram

\`\`\`mermaid
erDiagram
  {table_1} {
    {type} {col} {PK/FK}
    ...
  }
  {table_2} {
    ...
  }
  {table_1} ||--o| {table_2} : "{relation}"
\`\`\`
```

---

## 1-4. Preview + Confirm

```
📄 03_erd.md 업데이트 미리보기:

  테이블: {n}개
  관계: {n}개
  신규 감지: {added_tables}
  변경 감지: {changed_columns}

[Y] 저장  [E] 수동 편집  [N] 취소
```

STOP and WAIT.

---

## 1-5. Write

```bash
# Update docs/03_erd.md
# - Mermaid diagram section
# - Table detail section
# - Flyway migration history section
# - _Last updated: {today}
```

→ Return to `../workflow.md` Step 2.
