# Database Structure Review: API Interface Compliance

## Summary
The proposed database structure in `12.15 database structure.txt` generally aligns with the project's goals but has several mismatching field names and types when composed with the frontend TypeScript interfaces (`src/types/index.ts`).

## Key Discrepancies

### 1. ID Data Types
*   **Frontend**: Uses `number` for all IDs (`id: number`).
*   **Database**: Uses `UUID` (Universally Unique Identifier) string format.
*   **Action Required**: The Frontend TypeScript interfaces MUST be updated to `id: string` (or `number | string` temporarily) to be compatible with Supabase's default UUIDs.

### 2. Properties (`Property` vs `public.properties`)

| Frontend Field | Database Column | Status | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `id` | ⚠️ **Type Mismatch** | `number` vs `uuid` |
| `title` | `title` | ✅ Match | |
| `desc` | `description` | ⚠️ **Name Mismatch** | Rename FE or Map in Service |
| `price` | `price` | ✅ Match | |
| `area` | `area` | ❌ **Missing in DB** | Added to revised schema |
| `address` | `address` | ✅ Match | |
| `propertyType` | `category` | ⚠️ **Name Mismatch** | Enum values match mostly |
| `beds` | `beds` | ✅ Match | |
| `bathroom` | `bathrooms` | ⚠️ **Name Mismatch** | Singular vs Plural |
| `kitchen` | `kitchen` | ✅ Match | |
| `propertySize` | `size_sqm` | ⚠️ **Name Mismatch** | |
| `amenities` | `amenities` | ✅ Match | Array type |
| `availableFrom`| `available_from`| ⚠️ **Format** | ISO Date String vs Date type |
| `rules` | - | ❌ **Missing in DB** | Added to revised schema |
| `deposit` | - | ❌ **Missing in DB** | Added to revised schema |
| `rating` | - | ❌ **Missing in DB** | Added to revised schema |
| `lat` / `lon` | `latitude` / `longitude` | ⚠️ **Name Mismatch** | |

### 3. Profiles / Users

*   Frontend uses `User` with `role`.
*   Database `public.profiles` includes generic `full_name`, `avatar_url`.
*   **Note**: The Frontend `Role` type should be aligned with the Database constraint.
    *   FE: `'guest' | 'student' | 'landlord' | 'agent' | 'admin' | 'host'`
    *   DB Original: `'admin', 'landlord', 'agent', 'tenant'`
    *   **Action**: `student` usually maps to `tenant`. `host` likely maps to `landlord` or `agent`. Revised schema includes `student`.

## Recommendation
I have generated a `supabase_schema.sql` file that addresses these missing fields (adding `rules`, `deposit`, `rating`, `area`) to ensure the Database supports the current Frontend logic.

## Next Steps
1.  **Run Migration**: Execute the contents of `supabase_schema.sql` in your Supabase SQL Editor.
2.  **Update Frontend**: Refactor `src/types/index.ts` to use `string` for IDs and map the field names (snake_case from DB to camelCase in Frontend) in your `services/property.service.ts`.
