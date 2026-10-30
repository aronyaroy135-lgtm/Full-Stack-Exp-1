# Draft Management System

## Aim
To implement a draft management system that allows users to save, retrieve, edit, search, copy, and delete post drafts in the frontend, with browser storage simulating persistence.

## Requirements
- A modern web browser (Chrome, Edge, Firefox, etc.)
- A code editor such as Visual Studio Code (optional)
- No external libraries or backend server required

## How to Run
1. Extract the ZIP file.
2. Open `index.html` in a web browser.
3. Enter a post title, content, and category.
4. Click **Save draft**. The draft appears in the list.
5. Use **Edit** to modify a draft, **Delete** to remove it, **Copy text** to copy its text, and the search box to filter drafts.
6. Refresh the page to verify that drafts remain saved in the same browser.

## Theory
A draft management system lets users save unfinished posts and return to them later. This frontend application uses HTML for structure, CSS for styling, and JavaScript for application logic. Draft records are serialized to JSON and stored in `localStorage`, allowing them to persist across page refreshes in the same browser. This simulates backend persistence but does not send data to a real server.

## Algorithm / Procedure
1. Load saved draft data from browser `localStorage`.
2. Display the drafts in the draft list.
3. Accept a title, post content, and category from the user.
4. Validate that title and content are not empty.
5. If a draft is new, create a unique ID and save it; if editing, update the existing record.
6. Store the updated draft collection in `localStorage`.
7. Render the list again and provide status feedback.
8. Allow search, copy, edit, and delete operations.

## Files
- `index.html` — page structure and form controls
- `style.css` — responsive user interface styles
- `script.js` — save, load, edit, search, copy, delete, and storage logic

## Test Cases
| Test | Action | Expected result |
|---|---|---|
| 1 | Save a draft with title and content | Draft appears in the list |
| 2 | Submit an empty title or content | Validation prevents saving |
| 3 | Refresh the browser after saving | Draft remains visible |
| 4 | Edit a saved draft | Updated title/content is displayed |
| 5 | Search for a title or word in content | Matching drafts are displayed |
| 6 | Delete a draft and confirm | Draft is removed |
| 7 | Click Clear form | Form fields are reset |
| 8 | Click Copy text | Title and content are copied where clipboard access is allowed |

## Result
The Draft Management System was implemented successfully using HTML, CSS, and JavaScript. Users can save, retrieve, edit, search, copy, and delete post drafts. Browser `localStorage` provides persistence across refreshes on the same browser.

## Limitations
- Drafts are stored only in the current browser and device.
- There is no user login, cloud synchronization, or real backend API.
- Clearing browser site data may remove saved drafts.
