# MVP Scope

The current MVP is limited to the following:

- A home view centered on enrolled courses and a calendar.
- Messages, to-dos, and notifications shown in a right-side Context Panel.
- Course pages retain the existing left-side navigation and weekly structure.
- Detailed information and actions are shown in the right-side Context Panel.
- To prevent clutter when many lecture-material attachments are available, attachment lists are collapsed by default where appropriate and can be expanded or collapsed as needed.
- Download individual files.
- Configure a download location for each course from the course UI.
- Light and dark modes.
- Continued access to existing LMS features.
- LMS+ does not intervene on actual exam-taking pages.
- LMS integration code is kept separate from the UI to accommodate changes to the PKNU LMS structure.

## UX Principle

The main view preserves the user's overall context and navigation state. Details and supporting actions for the selected item open in the right-side Context Panel, following the same interaction pattern for course details, messages, to-dos, and notifications. Closing the Context Panel returns the user to the previous view and position.
