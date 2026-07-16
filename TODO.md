# TODO - Fix gender validation

- [x] Inspect Zod schema for gender in `src/dtos/userDto.js`.
- [x] Update `gender` validation so invalid values return `auth.errors.INVALID_GENDER`.
- [x] Keep `gender` defaulting to `other` when missing.
- [x] Run tests: `npm test`.

Result expected:
- `gender: "abc"` => 400 with field `gender` and translated message for `auth.errors.INVALID_GENDER`.
- Missing `gender` => defaults to `other` and passes validation.

