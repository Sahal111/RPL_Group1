# BUSINESS LOGIC & SAAS AUDIT

## 1. Domain Map
*   **System Core:** Multi-tenant school management (Shared MySQL, App-level scoping).
*   **Academic:** Period-aware entity management (Year → Semester → Schedule/Grade).
*   **Administrative:** Teacher/Student life-cycle management.
*   **Ancillary:** PPDB, Finance, LMS (High risk of loosely coupled domain interaction).

## 2. Workflow Map
*   **Tenant Boundary:** Middleware/Route scoping.
*   **Period Control:** Global session-based Academic Year/Semester.
*   **State Management:** Status-flag based (e.g., `active`, `transferred`, `resigned`).

## 3-13. Logic Audit Findings

| Severity | Module | Problem | Current Behavior | Expected Behavior | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HIGH** | Multi-Tenancy | Controller raw DB calls | Manual `school_id` filtering | Repository-level enforcement | Use Tenant Repositories |
| **MEDIUM** | Financial | Records are mutable | Standard CRUD update | Immutable status | Lock records on transition |
| **LOW** | Schedule | Conflict handling | UI-level check only | Transactional validation | Add Service-layer validator |

## 14. Edge Case Audit (Highlights)
*   *Siswa pindah kelas tengah semester:* Currently creates orphaned records. Needs transition history.
*   *Guru resign:* Status flag changes but historical teaching load remains potentially active.
*   *Tahun Ajaran berubah:* System-wide period lock is weak; data from old years remains potentially editable.

## 15. Business Logic Bugs
1.  **State Inconsistency:** Student transfers don't archive academic history properly; records split between schools.
2.  **Policy Fragmentation:** Only 2 controllers use Policies; most authorization is ad-hoc, creating massive IDOR potential.
3.  **PPDB/LMS Orphans:** Models exist without full controller coverage, leading to partial implementation risks.

---

## CRITICAL BUSINESS PROBLEMS
*   **Tenant Isolation Inconsistency:** Reliance on manual `school_id` filtering in controllers rather than enforced Repository/Global Scope patterns.

## HIGH PRIORITY
*   **Immutability:** Financial and Grade records must be locked via database-level triggers or App Observers once finalized.

## MEDIUM PRIORITY
*   **Academic Locking:** Rigid period-based lookups required for all grade/attendance queries.

## LOW PRIORITY
*   **Validation:** Centralize scheduling conflict validation in a dedicated Service validator.

---

## RECOMMENDED BUSINESS RULES
1.  **Tenancy Rule:** All `Service` layer methods must strictly verify `school_id`. No global `auth()` calls.
2.  **Immutability Rule:** Financial records are read-only once status is `paid`.
3.  **Period Locking:** Queries for `Nilai` or `Jadwal` must filter by explicit `academic_period_id`.
