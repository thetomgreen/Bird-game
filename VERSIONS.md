# Bird Game — Version History

## v1.1 (2026-03-29)
- Reduced rounds per game from 6 to 3 (hypothesis: more players will complete a full game)

## v1.0 (2026-03-29)
- Initial tracked version
- Welcome screen with difficulty selection (Easy / Medium / Hard / Expert / Auto)
- Difficulty fixed during a game; mid-game "Restart easier / harder" buttons
- Auto mode adjusts difficulty after 2 consecutive correct or incorrect answers
- 6 rounds per game (reduced to 3 in v1.1)
- Easy mode uses fame ≥ 4 pool (~18 well-known birds)
- Fake bird AI images with hatching animation (egg crack → chick)
- End screen shows start→end difficulty in Auto mode with "You're ready for X!" message
- Score count-up animation with perfect-score glow
- Amber "Imagine this bird" button to reveal fake bird photo
- Analytics tracking via Supabase (session, difficulty, birds shown, correct, response time, mobile, version)
- Dashboard at /dashboard.html
