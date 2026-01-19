# Signup redirect fix (post-registration)

## Problem
After a successful signup, the UI used an inline `setTimeout(() => router.push("/login"), 1000)` inside the submit handler. In practice this can fail if the component rerenders/unmounts (or submit runs twice in dev), which “drops” the timeout before it fires.

## Fix
- Moved the redirect scheduling into a `useEffect` that watches `isSuccess`.
- Added cleanup (`clearTimeout`) so we never leak timers.
- Used `router.replace("/login")` so the user can’t hit back and resubmit the signup form accidentally.
- Improved the success check to rely on the normalized server-action return shape: `result?.success`.
- Added `console.error` + surfaced error message in the UI for easier debugging.

## Files changed
- `app/(auth)/_components/signup_form.tsx`
  - Import `useEffect`
  - Add redirect effect on `isSuccess`
  - Remove inline `setTimeout` from `onSubmit`
  - Tighten success check + improve catch logging/message


