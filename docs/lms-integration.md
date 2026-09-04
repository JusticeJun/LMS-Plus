# PKNU Smart-LMS Integration Reference

## Purpose

This document describes the PKNU Smart-LMS structures and integration points relevant to LMS+.

LMS+ is implemented as a client-side enhancement layer on top of the existing LMS. The purpose of this reference is to isolate LMS-specific knowledge such as page routes, DOM structures, identifiers, navigation behavior, and reusable interaction patterns from the LMS+ UI implementation.

This is not intended to document the entire PKNU Smart-LMS or its server-side implementation. Feature-specific structures that are not currently required should be inspected when the corresponding LMS+ integration is implemented.

Raw inspection captures are development-only artifacts and must not be committed to the repository.

---

## Integration Principles

### Original LMS as the source of truth

The existing PKNU Smart-LMS remains responsible for authoritative course data and LMS operations.

LMS+ should:

- read existing LMS data and normalize it through an adapter layer;
- improve presentation and navigation without modifying the original LMS source;
- preserve existing LMS functionality when a page is represented through LMS+;
- fall back to the original LMS when an integration cannot be performed safely;
- avoid depending on user-specific text or dynamically generated identifiers when stable structural selectors are available.

The intended architecture is:

```text
PKNU Smart-LMS
       ↓
LMS Adapter
       ↓
Normalized LMS+ data
       ↓
LMS+ UI
```

Selectors, LMS routes, query parameters, and other LMS-specific details should remain outside React UI components whenever possible.

---

## Common LMS Structure

Authenticated LMS pages generally share a common application shell.

A typical page is structured around:

```text
#wrap
├─ #headerWrap
├─ #containerWrap
│  └─ #container
│     ├─ #lnb
│     └─ #contents
└─ footer
```

Course pages reuse this shell and expose course-specific navigation through the left navigation area.

Common course-page elements include:

```text
#lnb
└─ .leftmenu
   ├─ #site_header
   ├─ .course-subject
   └─ course navigation
```

The central course content is rendered under the `#contents` area.

LMS+ should prefer stable semantic IDs and structural containers over deeply nested selectors.

---

## Course Identity

Course pages expose several hidden values associated with the current course.

Verified identifiers include:

```text
#KJ_YEAR
#KJ_TERM
#KJ_KEY
#returnURI
```

`KJ_KEY` represents the LMS internal course key.

The same logical course identifier is also exposed from the LMS home course list through the `kj` attribute on course elements.

Example relationship:

```text
Home

em.sub_open[kj]
       │
       │ same logical course
       ↓
Course page

input#KJ_KEY
```

LMS+ should normalize this value as:

```text
courseId
```

The internal LMS name (`KJ_KEY`, `kj`, etc.) should not propagate into UI components.

Course names must not be used as persistent identifiers because names can change and may not be unique.

---

## Authenticated Home

Verified route:

```text
/ilos/main/main_form.acl
```

The authenticated home uses the following major structure:

```text
#wrap
├─ #headerWrap
│  ├─ #header
│  └─ #gnb
├─ #containerWrap
│  └─ #container
│     └─ #contentsIndex
│        ├─ .index-leftarea02
│        │  ├─ Calendar
│        │  ├─ Courses
│        │  ├─ Notices
│        │  ├─ Timetable
│        │  └─ External links
│        └─ .index-rightarea02
│           ├─ Quick Menu
│           ├─ Important
│           ├─ New Event
│           ├─ OCW
│           └─ Groups
└─ #footerWrap02
```

### Important integration points

Course entries are exposed through:

```text
em.sub_open[kj]
```

The home calendar uses:

```text
#shedule_calendar_form
```

Other verified entry points include:

```text
Messages
/ilos/message/received_list_pop_form.acl

Timetable
/ilos/st/main/pop_academic_timetable_form.acl

To-do
popTodo(...)

Notifications
popNotification(...)
```

LMS+ may substantially redesign the authenticated home while retaining the original DOM as a data source and fallback.

The primary LMS+ home content is expected to emphasize:

1. enrolled courses;
2. calendar and upcoming academic activity;
3. contextual To-do, message, and notification information.

Lower-priority legacy widgets may be visually deprioritized without removing access to the original functionality.

---

## Unauthenticated Home

Verified route:

```text
/ilos/main/main_form.acl
```

The same route is used before and after authentication, with different content depending on authentication state.

The unauthenticated page retains the same general shell:

```text
#wrap
├─ #headerWrap
├─ #containerWrap
│  └─ #container
│     └─ #contentsIndex
│        ├─ .index-leftarea02
│        └─ .index-rightarea02
└─ #footerWrap
```

Verified public elements include:

```text
#shedule_calendar_form
#ctl_notice_list
#site_link_index
#quick-menu-index
#ocw-list
#gnb
```

The login entry is exposed through:

```text
li.header_login.login-btn-color
```

and navigates to:

```text
/ilos/main/member/login_form.acl
```

The unauthenticated home also acts as a public LMS portal and should therefore not be replaced with only a login form.

LMS+ may provide a modernized unauthenticated shell while retaining access to public notices, schedules, course search, OCW, and other existing public functions.

An external service integration form was observed on the unauthenticated home. Its authentication or SSO internals were not investigated because they are outside the current integration scope.

---

## Course Main

Verified route:

```text
/ilos/st/course/submain_form.acl
```

The course main page contains:

```text
#lnb
├─ course information
└─ course navigator

#submain-contents
├─ .submain-leftarea
│  └─ weekly course content
└─ .submain-rightarea
   └─ secondary course widgets
```

Weekly content uses containers following the observed pattern:

```text
#week_list_wrap_<week>
```

The course main page is the primary course context in LMS+.

When no secondary detail is open, the weekly course view should remain centered.

When a Context Panel is opened, the main course content may shift and narrow to preserve both the course context and the selected detail.

Closing the Context Panel restores the main content to its default centered layout.

---

## Course Navigation

Verified course navigation routes include:

```text
Course main
/ilos/st/course/submain_form.acl

Assignments
/ilos/st/course/report_list_form.acl

Team projects
/ilos/st/course/project_list_form.acl

Exams
/ilos/st/course/test_list_form.acl

Discussions
/ilos/st/course/discuss_list_form.acl

Polls
/ilos/st/course/clicker_list_form.acl

Surveys
/ilos/st/course/survey2_list_form.acl

Grades
/ilos/st/course/eval3_result_view_form.acl

Grade appeals
/ilos/st/course/eclass_grade_appeal_list_form.acl

Open board
/ilos/st/course/material_list_form.acl
```

Not every navigator feature has been structurally inspected.

This does not prevent LMS+ from integrating those features later. Feature-specific DOM and behavior should be inspected when that feature is implemented if the existing common integration patterns are insufficient.

---

# Feature Structures

## Course Notices

Course notice list and detail pages were inspected.

The notice list exposes a conventional LMS board structure.

Primary list container:

```text
#notice_list
```

Typical list structure:

```text
#notice_list
└─ table.bbslist.new_bbslist
   └─ tbody
      └─ tr
```

Notice detail navigation uses:

```text
/ilos/st/course/notice_view_form.acl
```

Observed navigation parameter names include:

```text
ARTL_NUM
SCH_KEY
SCH_VALUE
display
start
```

Concrete values must never be stored in integration documentation.

### Notice detail

The primary detail structure includes:

```text
#contents
#content_text
table.bbsview
```

Observed metadata includes:

```text
Week
Title
Author
Published date
View count
```

Attachments are exposed through:

```text
#tbody_file
.attfile-list a.site-link
```

Attachment downloads use:

```text
/ilos/co/efile_download.acl
```

Observed parameter names include:

```text
FILE_SEQ
CONTENT_SEQ
ky
ud
pf_st_flag
```

Comments are also part of the existing notice behavior and must remain available when the notice detail is represented through LMS+.

LMS+ should support a Context Panel flow similar to:

```text
Notice list
    ↓
Notice detail
    ↓
Back
```

without replacing the main course context.

---

## Course Q&A

Course Q&A list and detail pages were inspected.

The detail page follows a structure that separates the original question and its answer.

Conceptually:

```text
Question
├─ Question metadata/content
├─ Question attachments
└─ Question comments

Answer
├─ Answer metadata/content
└─ Answer comments
```

Observed structural elements include:

```text
.qnatitleBox
.qnatxtBox
.qnacmmtBox
#answer_list
```

Question attachments use:

```text
#tbody_file
```

Comment attachments use the common comment upload endpoint:

```text
/ilos/co/cmmt_file_upload.acl
```

The answer creation flow navigates to:

```text
/ilos/st/course/qna2_answer_insert_form.acl
```

Existing Q&A functionality, including comments and answers where available to the current user, should remain accessible through the LMS+ representation.

---

## Lecture Materials

Verified list route:

```text
/ilos/st/course/lecture_material_list_form.acl
```

Primary list container:

```text
#material_list
```

Observed table:

```text
#material_list
└─ table.bbslist.new_bbslist
```

Observed columns:

```text
Week
Important
Title
Attachment
Published date
```

Material details navigate to:

```text
/ilos/st/course/lecture_material_view_form.acl
```

Observed parameter names include:

```text
ARTL_NUM
SCH_KEY
SCH_VALUE
display
start
```

Per-row attachment download behavior also exists in the original list.

### Material detail

Primary detail structure:

```text
form#myform
└─ table.bbsview
```

Observed metadata includes:

```text
Week
Title
Author
Published date
View count
```

Attachments use the common structure:

```text
#tbody_file
.attfile-list a.site-link
```

Downloads use:

```text
/ilos/co/efile_download.acl
```

Comments use dynamic containers following the observed pattern:

```text
commentbox_<dynamic-id>
```

and comment attachment uploads use:

```text
/ilos/co/cmmt_file_upload.acl
```

Dynamic numeric IDs must not be treated as stable selectors.

Lecture material comments and related existing actions are part of the original LMS behavior and must not be removed merely because LMS+ emphasizes attachment access.

---

## Assignments

Verified list route:

```text
/ilos/st/course/report_list_form.acl
```

Primary list container:

```text
#report_list
```

Observed table:

```text
#report_list
└─ table.bbslist.new_bbslist
```

Observed columns:

```text
Week
Important
Title
Progress
Submission
Score
Maximum score
Deadline
```

Assignment details navigate to:

```text
/ilos/st/course/report_view_form.acl
```

The assignment identifier is passed using:

```text
RT_SEQ
```

Other observed navigation parameter names include:

```text
SCH_KEY
SCH_VALUE
display
start
```

### Assignment detail

The assignment information and student submission areas are structurally separated.

Conceptually:

```text
Assignment detail
├─ Assignment information
├─ Instructor attachments
├─ Comments
└─ Submission area
   ├─ Submission status
   └─ Submitted files
```

The primary assignment information uses:

```text
table.bbsview
```

Observed metadata includes:

```text
Week
Title
Submission method
Published date
Deadline
Maximum score
Late submission
Score visibility
```

The submission area uses:

```text
#submit_div
```

with a separate write-style table.

Submitted-file content uses:

```text
#tbody_file2
```

Instructor attachments use:

```text
#tbody_file
.attfile-list a.site-link
```

The exact DOM and controls for every possible assignment submission state have not been verified.

When submission functionality is integrated, LMS+ must verify the relevant runtime state and preserve the existing LMS submission behavior rather than constructing undocumented submission requests.

---

## Team Projects

Verified list route:

```text
/ilos/st/course/project_list_form.acl
```

The team project list follows a structure similar to assignments.

Observed columns include:

```text
Week
Important
Title
Progress
Submission
Score
Maximum score
Deadline
```

Team project details navigate to:

```text
/ilos/st/course/project_view_form.acl
```

The project identifier is:

```text
PROJECT_SEQ
```

### Team project detail

Team projects contain additional structures not present in normal assignments.

Observed metadata includes:

```text
Week
Project title
Published date
Deadline
Maximum score
Score visibility
Late submission
Submission method
Other-team visibility
Team assignment method
Team setup deadline
```

The detail page includes separate views for:

```text
My team
Other teams
```

The observed tab behavior uses:

```text
selectTeamTab(...)
```

Team-specific detail navigation uses:

```text
/ilos/st/course/project_team_detail_view_form.acl
```

Observed parameter names include:

```text
PROJECT_SEQ
TEAM_CD
SHARE_YN
MY_TEAM_CD
display
start
week
```

Separate dialogs exist for team submission and team selection.

Observed containers include:

```text
#teamSubmitPop
#teamSelPop
```

The detailed internal team-board page was not inspected during the baseline survey.

Its feature-specific structure should be inspected when LMS+ implements the team-board integration.

---

## Attendance

The basic attendance page structure was inspected.

Observed routes include:

```text
/ilos/st/course/attendance_list_form.acl
```

and a navigation reference to:

```text
/ilos/st/course/attend_list_form.acl
```

The relationship between these two route forms has not been verified and should not be assumed.

Observed attendance containers include:

```text
#content_text
#attend_div
#attend_start
#attendBtn
#attend_end
#custom_button
#attend_list
```

### Smart attendance

PKNU Smart-LMS also supports a runtime smart-attendance flow.

The student-facing behavior is:

```text
Instructor starts attendance
        ↓
Attendance verification UI becomes available
        ↓
Student enters a three-digit attendance code
        ↓
Student submits attendance
        ↓
Completion or failure state is displayed
```

The active runtime DOM for the three-digit verification state was not available during inspection and therefore remains structurally unverified.

LMS+ must preserve the original attendance mechanism.

It must not construct speculative attendance requests or bypass the original validation flow.

If the active state is naturally encountered during future implementation, its DOM can be inspected before entering or submitting an attendance code.

---

## Online Lectures

Online lectures use a more specialized runtime structure than normal course boards.

Verified list route:

```text
/ilos/st/course/online_list_form.acl
```

Observed list structures include:

```text
.ibox
#chart

#week-<n>
.wb
.wb-on
.wb-choice
.wb-inner-wrap

#lecture_form
#lecture-<n>
.lecture-box
.ibox2
```

Progress elements use dynamically generated identifiers.

A repeated `#per_text` identifier was observed and should not be assumed to be unique.

Observed hidden fields include:

```text
#lecture_weeks
#WEEK_NO
#_KJKEY
#kj_lect_type
#item_id
#force
```

Lecture launch behavior uses:

```text
viewGo(...)
```

and a form targeting:

```text
/ilos/st/course/online_view_form.acl
```

### Online lecture viewer

The viewer uses a specialized shell rather than the normal course page layout.

Observed structures include:

```text
li#naviViewer
.navi-title
.navi-tables-container

#helpBtn
#checkLearning
#memo
#menu

#navi_
#close_
#replace_
#reload_
#next_
#prev_
#force_close_
```

Replacement-related UI includes:

```text
#replace_list_wrap
#replace_list_form
#select_bg
```

The viewer loads actual course content through:

```text
iframe#contentViewer
```

which targets:

```text
/ilos/st/course/online_view.acl
```

Observed parameter names include:

```text
item_id
link_seq
lecture_weeks
path
kind
cid
browserType
week
replace
```

A second iframe was observed:

```text
#accessone_iframe
```

targeting:

```text
/ilos/st/course/online_view_check.acl
```

Its exact role in attendance or progress tracking has not been verified.

Conceptually, the observed viewer architecture is:

```text
online_list_form.acl
        ↓
online_view_form.acl
        ├─ #contentViewer
        │     ↓
        │  online_view.acl
        │
        └─ #accessone_iframe
              ↓
           online_view_check.acl
```

### LMS+ integration rule

LMS+ should not extract a raw video URL and independently play the media.

Doing so could bypass LMS-managed progress or attendance behavior.

If online lecture playback is integrated into the LMS+ Context Panel, the implementation should reuse the existing LMS viewer/session mechanism and verify that attendance and progress behavior remain equivalent to the original LMS.

The exact progress, completion, unload, and attendance mechanisms remain unverified.

---

## Exams

Verified list route:

```text
/ilos/st/course/test_list_form.acl
```

The exam list uses:

```text
form#myform
└─ table.bbslist.new_bbslist
```

Observed columns:

```text
Week
Important
Title
Progress
Submission
Score
Maximum score
Exam period
```

Exam entries navigate to:

```text
/ilos/st/course/test_view_form.acl
```

using the exam identifier:

```text
exam_setup_seq
```

Observed navigation parameters also include:

```text
start
display
```

A separate exam-related form targets:

```text
/ilos/st/course/test_info_pop_form.acl
```

and exposes fields such as:

```text
EXAM_SETUP_SEQ
EXAM_CL
```

### LMS+ integration boundary

The exam list may be visually redesigned by LMS+.

However, selecting an exam is an explicit boundary between LMS+ navigation and the original exam workflow.

Expected behavior:

```text
LMS+ exam list
       ↓
Student selects exam
       ↓
Close secondary Context Panel if necessary
       ↓
Original exam detail displayed in the main content area
       ↓
Original LMS exam workflow
```

Exam detail and actual exam-taking must not be reconstructed inside the LMS+ Context Panel.

LMS+ should avoid DOM modification or behavioral interception within the actual exam-taking flow.

The intended rule is:

> LMS+ may improve how students find an exam. The original LMS remains responsible for viewing and taking the exam.

---

# Common Interaction Patterns

## List and Detail

Several LMS features use a common pattern:

```text
List
 ↓
Detail
 ↓
Return to list
```

Examples include:

- notices;
- lecture materials;
- Q&A;
- assignments;
- team projects.

LMS+ should normalize these interactions where appropriate through the Context Panel while preserving the main course context.

A typical LMS+ interaction becomes:

```text
Weekly course context
        │
        ├── select secondary feature
        ↓
Right Context Panel
        │
        ├── list
        ├── detail
        └── back
```

Closing the panel returns the course layout to its default state.

---

## Attachments

Multiple LMS features share a common attachment structure.

Frequently observed selectors include:

```text
#tbody_file
.attfile-list a.site-link
```

Downloads commonly use:

```text
/ilos/co/efile_download.acl
```

with parameter names such as:

```text
FILE_SEQ
CONTENT_SEQ
ky
ud
pf_st_flag
```

LMS+ should centralize attachment extraction in the adapter instead of implementing feature-specific download parsing in UI components.

Attachment presentation should remain contextual to the content that owns the file.

---

## Comments

Comments occur across several content types.

Observed structures include dynamically generated containers such as:

```text
commentbox_<dynamic-id>
```

Comment file uploads commonly use:

```text
/ilos/co/cmmt_file_upload.acl
```

Generated numeric identifiers must not be treated as stable selectors.

Where comments are part of the existing LMS feature, LMS+ should preserve access to comment reading and writing rather than removing them during UI redesign.

---

## Existing LMS Actions

A visual redesign must not imply removal of existing functionality.

When LMS+ replaces the presentation of an LMS feature, existing actions should remain accessible unless the feature is intentionally isolated for safety or compatibility reasons.

Examples include:

- comments;
- attachments;
- assignment submission;
- team project interactions;
- message replies;
- attendance actions.

If an action cannot yet be safely reproduced, LMS+ should provide a path to the original LMS rather than silently omitting the action.

---

# Context Panel

The Context Panel is the primary LMS+ interaction model for secondary course information.

Default state:

```text
┌─────────────────────────────┐
│                             │
│      Weekly course view     │
│          centered           │
│                             │
└─────────────────────────────┘
```

Panel-open state:

```text
┌──────────────────────┬───────────────┐
│                      │               │
│  Weekly course view  │ Context Panel │
│                      │               │
└──────────────────────┴───────────────┘
```

The main content shifts and narrows only while the panel is open.

Closing the panel restores the centered course layout.

Appropriate Context Panel content includes:

- notices;
- lecture materials;
- assignment information;
- team project information;
- Q&A;
- attendance;
- messages;
- notifications;
- To-do;
- calendar event details;
- online lecture information and, if safely supported, the original viewer mechanism.

Independent or safety-sensitive workflows may remain in the main/original LMS interface.

---

# Main Content and Original LMS Fallback

Not every LMS feature must be reconstructed inside LMS+.

LMS+ should preserve an explicit fallback path such as:

```text
View in original LMS ↗
```

A page-level option may also allow LMS+ enhancement to be disabled for a specific page if required.

Fallback is preferred when:

- required DOM structures are unavailable;
- an LMS update invalidates an adapter;
- an operation has not been safely integrated;
- the feature has important state or validation behavior that LMS+ has not verified;
- maintaining the original workflow is safer than reconstructing it.

The original LMS must remain usable even when an LMS+ integration fails.

---

# Dynamic Behavior

PKNU Smart-LMS contains both server-rendered HTML and dynamically generated UI.

Observed dynamic behavior includes:

- jQuery UI dialogs;
- popup-based navigation;
- inline JavaScript handlers;
- dynamically generated element IDs;
- runtime course content;
- viewer-specific iframes;
- state-dependent assignment and attendance controls.

A `MutationObserver` may be used where necessary to detect LMS-created content.

However, `MutationObserver` should not be used as a substitute for the adapter architecture.

The adapter remains responsible for interpreting LMS structures.

---

# Selector Stability Guidelines

Prefer selectors in the following order:

1. stable semantic IDs;
2. stable feature-specific classes;
3. stable structural relationships;
4. known route or form relationships;
5. dynamic IDs only as a last resort.

Avoid depending on:

- generated numeric suffixes;
- current course names;
- professor names;
- student names;
- attachment filenames;
- visible user-specific text;
- deeply nested absolute DOM paths;
- invalid repeated IDs when a surrounding structure is available.

For example:

```text
Preferred

#material_list
.attfile-list
#submit_div
#answer_list
```

rather than:

```text
Avoid

#commentbox_1234567
#file_list_XP66BPW74AGAG
```

Dynamic identifiers should be normalized conceptually:

```text
commentbox_<dynamic-id>
file_list_<dynamic-id>
```

---

# Adapter Guidelines

UI components should consume normalized LMS+ models rather than raw DOM elements.

For example:

```text
PKNU DOM

em.sub_open[kj]
        ↓
Adapter
        ↓
Course {
  courseId,
  name,
  campus,
  section
}
        ↓
React UI
```

Future adapter functions may include:

```text
getCourses()
getCurrentCourse()
getNotices()
getLectureMaterials()
getAssignments()
getTeamProjects()
getAttendance()
getOnlineLectures()
getTodoItems()
getNotifications()
getMessages()
```

These functions should be added when the corresponding feature is implemented rather than preemptively implementing the entire LMS interface.

When an expected structure cannot be found, the adapter should fail safely and allow the UI to offer the original LMS page.

---

# Safety and Privacy

Inspection output may contain user-specific LMS information.

Raw inspection output must never be committed.

Examples of data that must not appear in repository documentation include:

- student information;
- professor information when captured from personal course pages;
- concrete course identifiers;
- authentication values;
- session values;
- hidden credential-related values;
- concrete dynamic identifiers tied to a captured account;
- personal course attachment names where unnecessary.

The integration reference should contain only generalized structures, routes, parameter names, and verified behavior required for LMS+ development.

The inspection collector intentionally masks known identifier and URL values, but raw output must still be treated as local development data.

Recommended local-only directory:

```text
inspection/
```

This directory should be ignored by Git.

---

# Verified and Unverified Areas

## Verified baseline

The integration survey established a usable baseline for:

```text
Authenticated home
Unauthenticated home
Course main
Course navigation
Course notices
Course Q&A
Lecture materials
Assignments
Team projects
Attendance base structure
Online lecture list/viewer structure
Exam list
Common attachment behavior
Common comment behavior
Course identifier relationships
```

## Partially verified or runtime-dependent

The following behavior remains intentionally unverified:

### Smart attendance active state

The DOM shown while an instructor actively opens smart attendance, including the three-digit verification input and resulting submission state, was not available during inspection.

### Online lecture tracking

The exact relationship between the viewer, progress tracking, completion behavior, and `online_view_check.acl` has not been established.

### Assignment state variations

Not every possible assignment state, including every submission/edit/resubmission combination, was inspected.

### Team project sub-pages

The internal team-specific board reached through `project_team_detail_view_form.acl` was not inspected.

### Unsurveyed navigator features

Feature-specific DOM for discussions, polls, surveys, grades, grade appeals, and other lower-priority course pages was not inspected.

These gaps do not block the baseline integration architecture.

They should be investigated when the corresponding LMS+ feature is implemented.

---

# Inspection Strategy

LMS+ does not require a complete reverse-engineered representation of every Smart-LMS page before development can continue.

The inspection strategy is:

```text
Common structure
      ↓
Inspect once and reuse

Major MVP feature
      ↓
Inspect list/detail/runtime structure

Unimplemented secondary feature
      ↓
Inspect when integration begins

Safety-sensitive workflow
      ↓
Prefer original LMS until behavior is verified
```

This keeps LMS-specific knowledge bounded to actual product requirements and avoids maintaining unnecessary DOM assumptions.

---

# Maintenance

PKNU Smart-LMS is an external system controlled independently from LMS+.

Its DOM structure, CSS, routes, or runtime behavior may change without notice.

When an integration stops matching the expected structure:

1. do not attempt destructive DOM modification;
2. fall back to the original LMS where possible;
3. use the structure inspection utility to inspect the affected page;
4. update the adapter;
5. update this reference if the integration contract materially changes.

LMS+ should treat Smart-LMS DOM structures as an external integration contract rather than application-owned markup.

---

## Inspection Status

This reference represents the structures verified during the LMS+ integration survey conducted in September 2026.

It documents only the client-side structures required for LMS+ development and does not describe or imply access to PKNU Smart-LMS server internals.