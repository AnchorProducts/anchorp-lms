// lib/adminSop.ts
// Single source for the admin SOP: used by /admin/settings and the admin walkthrough.

export type SopBlock = {
  heading?: string;
  text?: string;
  steps?: string[];
  bullets?: string[];
  rows?: { label: string; text: string }[];
  note?: string;
};

export type SopSection = {
  id: string;
  title: string;
  intro?: string;
  blocks: SopBlock[];
};

export type WalkthroughStep = {
  title: string;
  body: string;
  bullets?: string[];
  link?: { label: string; href: string };
};

export const SOP_LAST_UPDATED = "September 30, 2026";

export const SOP_SECTIONS: SopSection[] = [
  {
    id: "purpose",
    title: "Purpose and scope",
    intro:
      "This SOP tells Anchorp LMS admins how to run the platform day to day: users, courses, lesson content, lesson assignments and learner activity. It covers the admin screens under /admin. Hosting, database changes and code deploys belong to the developer.",
    blocks: [
      {
        text: "An admin is any account whose role is set to “admin”. Admin accounts are left out of every count, list and chart on the admin screens, so admin test activity never skews the numbers.",
      },
    ],
  },
  {
    id: "access",
    title: "Access and navigation",
    intro:
      "Log in at /login with your admin email. Admins go straight to /admin and everyone else goes to /dashboard. If a non-admin opens an /admin page, they are redirected to /dashboard.",
    blocks: [
      {
        heading: "Sidebar items",
        rows: [
          {
            label: "Overview",
            text: "Headline numbers (total users, internal vs external split, courses live, lesson completions) and recent learning activity.",
          },
          { label: "Users & Roles", text: "Search and filter learners, change roles, send invites." },
          {
            label: "Courses & Enrollments",
            text: "Create and manage courses, assign courses, open a course’s content editor.",
          },
          { label: "Activity & Progress", text: "Learner progress and completions over time." },
          { label: "Settings (under Account)", text: "This SOP, plus a button to restart the walkthrough. You can also reopen the walkthrough any time with the Admin guide button in the bottom right corner." },
        ],
      },
      {
        text: "On mobile, the sidebar opens from the menu button at the top of the page. Always end a session with “Log out” at the bottom of the sidebar, especially on shared devices.",
      },
    ],
  },
  {
    id: "users",
    title: "Managing users",
    intro:
      "All user work happens in Users & Roles. Every user has a type (internal employee or external customer) and may also have a role (Admin, Employee, Potential customer, or none).",
    blocks: [
      {
        heading: "Invite a new user",
        steps: [
          "Open Users & Roles and find Quick Actions.",
          "Pick the invite type: Invite Internal Employee for Anchorp staff, Invite External Customer for clients and prospects, or Invite Admin only for people who need full admin access (they are set up as internal).",
          "Enter their email and send. The page confirms with “Invite sent to … (internal/external/admin user).”",
          "The person gets an email with a link to a signup page that already has their type and role filled in. If it hasn’t arrived within 10 minutes, tell them to check spam.",
        ],
      },
      {
        heading: "Find a user",
        bullets: [
          "Use the All / Internal / External buttons to filter the list.",
          "Type in “Search name or email…” to match on either field.",
          "The list shows the newest users first. It includes users with no role set, but never shows admin accounts.",
        ],
      },
      {
        heading: "Change a user’s role",
        steps: [
          "Find the user in the list.",
          "Choose the new role from their role dropdown. It saves immediately and shows “Role updated.”",
          "If you see “Error updating role,” refresh the page and try once more, then escalate.",
        ],
        note: "Promoting someone to Admin removes them from this list, and the screen has no way to demote an admin. Double-check before you pick Admin.",
      },
      {
        heading: "Remove a user",
        text: "The admin screens have no delete or deactivate button. Send removal requests to the developer, who handles them in Supabase.",
      },
    ],
  },
  {
    id: "courses",
    title: "Managing courses and content",
    intro:
      "You set up courses in the Course Management panel of Courses & Enrollments. You then add modules, lessons, resources and quizzes in the course content editor. Structure: Course › Modules › Lessons › Resources. Each lesson can have at most one quiz.",
    blocks: [
      {
        heading: "Create or edit a course",
        steps: [
          "In Course Management, choose “New course” from “Select a course,” or pick an existing course to edit it.",
          "Title: the name learners see.",
          "Slug (URL): lowercase with hyphens, for example anchorp-101. Leave it blank to generate it from the title. Avoid changing it on a live course, because it changes the course’s web address.",
          "Description: a one or two sentence summary.",
          "Audience: Internal & external, Internal only, or External only.",
          "Save. When you create a course with an external or both audience, every external user with email notifications turned on is emailed automatically, so finish the title and description before you save a new course.",
          "Use “View as learner” to check the course page, then “Manage content” to open the content editor.",
        ],
      },
      {
        heading: "Build the course content",
        steps: [
          "In Course Outline, add a module with “Add module.” To rename it, edit the title and click Save next to it.",
          "Inside the module, enter a lesson title and click “Add lesson.” Repeat for each lesson, in the order learners should take them.",
          "Select a lesson. In Lesson Resources, choose the type (Video, PDF, PowerPoint / slides, File download, External link or Quiz), give it a clear title, then drag and drop a file or paste a URL, and click “Add resource.”",
          "To add a quiz, fill in the quiz title, Passing Score and Allowed Attempts, then click “Create quiz.”",
          "Add each question with options A to D (C and D are optional) and pick the correct answer.",
          "Open the lesson with “View as learner” and take the quiz once to confirm it works end to end.",
        ],
      },
      {
        heading: "Quiz settings",
        bullets: [
          "Passing Score is the number of correct answers needed, not a percentage. A quiz with 10 questions and a Passing Score of 7 needs 7 correct.",
          "Allowed Attempts is the maximum number of times a learner can submit the quiz. Learners see “Attempts used: X of Y.” Once they reach the limit, the Submit button is disabled and they are told to contact an administrator.",
          "Passing the quiz issues the learner’s certificate.",
        ],
      },
      {
        heading: "Delete content",
        text: "Every delete asks for confirmation and cannot be undone. Deleting an item also removes everything under it:",
        rows: [
          { label: "Course", text: "All enrollments in that course." },
          { label: "Module", text: "All its lessons and their resources." },
          { label: "Lesson", text: "All its resources and lesson assignments." },
          { label: "Quiz", text: "All its questions and options." },
          { label: "Question or resource", text: "Only that item." },
        ],
        note: "Before deleting a course that learners have started, check with the course owner. Consider changing its audience instead.",
      },
    ],
  },
  {
    id: "assigning",
    title: "Assigning courses and lessons",
    intro: "You can assign a whole course, or a single lesson, to a specific learner.",
    blocks: [
      {
        heading: "Assign a whole course",
        steps: [
          "Open Courses & Enrollments. In the Courses Overview table, find the course and click “Assign.”",
          "Pick the person from “Select a learner…” and click “Assign.”",
          "Read the message under the table (see Assignment messages below).",
        ],
        note: "The Total, Internal and External columns show how many people are enrolled in each course.",
      },
      {
        heading: "Assign a single lesson",
        text: "Use this when someone needs one specific lesson, for example a refresher or a lesson tied to a particular job.",
        steps: [
          "Open Courses & Enrollments, select the course, and click “Manage content.”",
          "In Course Outline, select the lesson.",
          "Scroll to the Lesson Assignments panel, below the quiz section.",
          "Pick the person from “Select a learner…” and click “Assign.” The page confirms with “Lesson assigned to …”",
          "The lesson now appears under “Assigned to you” at the top of the learner’s dashboard with a Start button. After they complete it, the button changes to Review.",
          "To take back a lesson assignment, click “Remove” next to the person’s name and confirm.",
        ],
        note: "Learners can still open any lesson by its link. Assigning a lesson puts it on their dashboard. It does not unlock or restrict access.",
      },
      {
        heading: "Assignment messages",
        text: "Course and lesson assignments follow the same audience rules:",
        rows: [
          { label: "“… assigned … successfully” / “Lesson assigned to …”", text: "Done." },
          { label: "“… is already enrolled / already assigned …”", text: "Nothing to do." },
          {
            label: "“This course is internal only …”",
            text: "Check you picked the right person, or change the course audience.",
          },
          {
            label: "“This course is targeted to external learners …”",
            text: "If staff should take it, change the audience to Internal & external first.",
          },
          { label: "“This account is an admin …”", text: "Admins don’t need assignments." },
        ],
      },
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring progress",
    blocks: [
      {
        rows: [
          {
            label: "Overview",
            text: "Total users, internal vs external split, courses live, all-time lesson completions, the last 25 completions, and the User Progress Overview table. Check for learners who are enrolled but have 0 lessons done.",
          },
          {
            label: "Activity & Progress",
            text: "Completions and enrollments over the last 7 days, active learners over the last 30 days, and a 7-day activity timeline. Check for a week with no activity, or a sudden drop.",
          },
          {
            label: "Suggested Actions",
            text: "Prompts on Courses & Enrollments to review outdated courses, popular external courses and low-completion courses. Check for courses where many learners start but few finish.",
          },
        ],
        note: "None of these screens export data. For a spreadsheet, ask the developer to pull it from Supabase.",
      },
    ],
  },
  {
    id: "routine",
    title: "Routine checklists",
    blocks: [
      {
        heading: "Daily (5 minutes)",
        bullets: [
          "Open Overview and scan Recent Learning Activity for anything unusual.",
          "Handle any invite or access requests in Users & Roles.",
          "Make any course or lesson assignments requested by managers or clients.",
        ],
      },
      {
        heading: "Weekly (15 minutes)",
        bullets: [
          "Review Activity & Progress: 7-day completions, enrollments and the timeline.",
          "In User Progress Overview, follow up with learners who are enrolled but have 0 lessons done.",
          "Follow up on assigned lessons that are still incomplete after a week.",
          "Check that new signups have the right type and role.",
        ],
      },
      {
        heading: "Monthly (30 to 60 minutes)",
        bullets: [
          "Work through the three Suggested Actions in Courses & Enrollments.",
          "Open each live course with “View as learner” and check that videos, files and links still load.",
          "Retake one quiz per course to confirm scoring, attempt limits and certificates work.",
          "Remove lesson assignments that are no longer needed.",
          "Review who has the Admin role and ask the developer to remove anyone who no longer needs it.",
        ],
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting and escalation",
    intro:
      "Try the fix first. If it doesn’t work, escalate to the developer with the user’s email, the page URL, the exact message shown and the time it happened.",
    blocks: [
      {
        rows: [
          {
            label: "Invite email never arrives",
            text: "Check the address, ask them to check spam, and wait 1 hour before resending (the email service rate-limits invites).",
          },
          {
            label: "Learner used all quiz attempts",
            text: "Raise Allowed Attempts on that quiz in the content editor and save. To reset one learner only, escalate.",
          },
          {
            label: "Lesson Assignments shows “Error loading assignments”",
            text: "The lesson assignments database update hasn’t been applied. Escalate.",
          },
          {
            label: "Learner can’t see an assigned lesson",
            text: "Ask them to refresh. Check the lesson’s Lesson Assignments panel for the right name and email.",
          },
          { label: "An admin needs to be demoted", text: "The screens can’t change an admin’s role. Escalate." },
          { label: "A user needs to be deleted or deactivated", text: "No delete option on the admin screens. Escalate." },
          {
            label: "“Error updating role” or an assignment error",
            text: "Usually an expired session or network error. Refresh, log in again, retry once, then escalate.",
          },
          {
            label: "A learner lands on /dashboard instead of an admin page",
            text: "Expected: their account isn’t an admin. Promote them only if they should be one.",
          },
          {
            label: "File upload fails in Lesson Resources",
            text: "Try a smaller file, or host it elsewhere and add it as an External link.",
          },
          {
            label: "Learner needs their AIA number added or corrected",
            text: "It’s only collected at signup and isn’t shown on the admin screens. Escalate with the correct number.",
          },
          {
            label: "A new external course didn’t email learners",
            text: "Learners may have email notifications off, or the notification service failed. Check with a test external account; escalate if nobody received it.",
          },
        ],
      },
    ],
  },
];

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    title: "Welcome to the Admin Console",
    body: "This quick walkthrough covers how to run Anchor Academy day to day. It takes about 2 minutes. You can reopen it any time from the Admin guide button in the bottom right corner.",
  },
  {
    title: "Find your way around",
    body: "The sidebar has everything you need:",
    bullets: [
      "Overview: headline numbers and recent learning activity.",
      "Users & Roles: invites, roles and user search.",
      "Courses & Enrollments: courses, assignments and content.",
      "Activity & Progress: completions and active learners over time.",
      "Settings (under Account, at the bottom): the full written SOP.",
    ],
    link: { label: "Go to Overview", href: "/admin" },
  },
  {
    title: "Invite users",
    body: "In Users & Roles, use Quick Actions to invite someone. They get an email link to a signup page with their type and role already set.",
    bullets: [
      "Invite Internal Employee: Anchorp staff.",
      "Invite External Customer: clients and prospects.",
      "Invite Admin: only people who need full admin access.",
    ],
    link: { label: "Open Users & Roles", href: "/admin/users" },
  },
  {
    title: "Manage roles carefully",
    body: "Change a role from the dropdown next to each user. It saves immediately.",
    bullets: [
      "Promoting someone to Admin removes them from the list, and admins can’t be demoted from the screens.",
      "There is no delete button. Send removal requests to the developer.",
    ],
  },
  {
    title: "Create a course",
    body: "In Courses & Enrollments, use Course Management and choose “New course.” Set the title, slug, description and audience, then save.",
    bullets: [
      "Saving a new external or both-audience course emails external learners automatically, so finish the details first.",
      "Use “View as learner” to check it, then “Manage content” to build it.",
    ],
    link: { label: "Open Courses & Enrollments", href: "/admin/courses" },
  },
  {
    title: "Build lessons and quizzes",
    body: "In the content editor, add modules, then lessons, then resources (videos, PDFs, slides, files, links).",
    bullets: [
      "Passing Score is the number of correct answers needed, not a percentage.",
      "Allowed Attempts limits how many times a learner can submit the quiz.",
      "Passing the quiz issues the learner’s certificate.",
    ],
  },
  {
    title: "Assign courses or single lessons",
    body: "Give learners exactly what they need:",
    bullets: [
      "Whole course: click Assign on the course row in Courses Overview.",
      "Single lesson: in Manage content, select the lesson and use the Lesson Assignments panel.",
      "Assigned lessons show under “Assigned to you” on the learner’s dashboard.",
      "Audience rules apply: internal-only courses can’t go to external learners.",
    ],
  },
  {
    title: "Keep an eye on progress",
    body: "Check Overview and Activity & Progress regularly.",
    bullets: [
      "Daily: scan recent activity and handle requests.",
      "Weekly: follow up with learners who haven’t started.",
      "Monthly: review Suggested Actions and test each course as a learner.",
    ],
    link: { label: "Open Activity & Progress", href: "/admin/activity" },
  },
  {
    title: "You’re all set",
    body: "The full SOP, including troubleshooting and escalation steps, is always in Settings, at the bottom of the sidebar. Reopen this walkthrough any time from the Admin guide button in the bottom right corner.",
    link: { label: "Open Settings", href: "/admin/settings" },
  },
];
