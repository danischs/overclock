# Overclock - To Do List

## High Priority
- [ ] Tasks CRUD + UI — Add backend routes and frontend task board (todo/doing/done) using the existing `tasks` table
- [ ] Session history / Stats page — Add GET endpoint for `work_sessions` and build a Stats page to display past Pomodoro sessions
- [ ] Auth + route protection — Add JWT or session-based auth, persist login across refresh, protect the `/home` route

## Medium Priority
- [ ] Fix Button `disabled` bug — Forward `id` and `disabled` props in the Button component so the timer Start button is properly disabled at 0
- [ ] Dead nav links — Wire up Stats, Settings, About, Contact links in the Header to actual pages/routes
- [ ] Error handling on signup — Add try/catch around signup query to handle duplicate username gracefully
- [ ] Login/signup error feedback — Show error messages to users on failed signup or login

## Low Priority
- [ ] Collect `email` field on signup (column exists in schema but is never used)
- [ ] Wire `task_id` foreign key in `work_sessions` so sessions can be linked to specific tasks
- [ ] Fix corrupted unicode in `frontend/package.json` description field

## Completed
- [x] Persist Pomodoro sessions to `work_sessions` table
- [x] Return `userId` from login endpoint
- [x] Track `userId` in frontend and pass to PomodoroTimer
- [x] Fix timer counting into negatives (stop at 0)
