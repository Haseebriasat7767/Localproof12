import type { StatusTone } from "@/components/app/shared";

export type ClientStatus = "Complete" | "Waiting" | "Needs Attention" | "Overdue";

export const statusTone: Record<ClientStatus, StatusTone> = {
  Complete: "complete",
  Waiting: "waiting",
  "Needs Attention": "attention",
  Overdue: "overdue",
};

export type DocItem = {
  id: string;
  name: string;
  received: boolean;
  dueDate: string;
  assignee: string;
  reminder: string;
};

export type Client = {
  id: string;
  name: string;
  contact: string;
  company: string;
  email: string;
  phone: string;
  frequency: "Monthly" | "Quarterly" | "Weekly";
  owner: string;
  monthlyClose: string;
  progress: number;
  missing: number;
  lastContact: string;
  nextReminder: string;
  status: ClientStatus;
  openQuestions: number;
  lastResponse: string;
  documents: DocItem[];
};

const doc = (
  id: string,
  name: string,
  received: boolean,
  dueDate: string,
  assignee: string,
  reminder: string
): DocItem => ({ id, name, received, dueDate, assignee, reminder });

export const CLIENTS: Client[] = [
  {
    id: "abc-dental",
    name: "ABC Dental",
    contact: "Dana Whitfield",
    company: "ABC Dental Group PC",
    email: "dana@abcdental.com",
    phone: "(415) 555-0182",
    frequency: "Monthly",
    owner: "Rachel Kim",
    monthlyClose: "July 2025",
    progress: 72,
    missing: 3,
    lastContact: "2 days ago",
    nextReminder: "Tomorrow, 9:00 AM",
    status: "Needs Attention",
    openQuestions: 1,
    lastResponse: "2 days ago",
    documents: [
      doc("d1", "Bank Statement — Operating", true, "Jul 5", "Dana Whitfield", "—"),
      doc("d2", "Credit Card Statement", true, "Jul 5", "Dana Whitfield", "—"),
      doc("d3", "Payroll Report", true, "Jul 8", "Dana Whitfield", "—"),
      doc("d4", "Receipts — Equipment", false, "Jul 12", "Dana Whitfield", "2 reminders sent"),
      doc("d5", "Transaction Explanation", false, "Jul 12", "Dana Whitfield", "1 reminder sent"),
      doc("d6", "Vendor Invoices", false, "Jul 15", "Marcus Lee", "Scheduled tomorrow"),
    ],
  },
  {
    id: "smith-co",
    name: "Smith & Co LLC",
    contact: "Alan Smith",
    company: "Smith & Co LLC",
    email: "alan@smithco.com",
    phone: "(312) 555-0114",
    frequency: "Monthly",
    owner: "Marcus Lee",
    monthlyClose: "July 2025",
    progress: 100,
    missing: 0,
    lastContact: "Today",
    nextReminder: "—",
    status: "Complete",
    openQuestions: 0,
    lastResponse: "Today",
    documents: [
      doc("d1", "Bank Statement", true, "Jul 5", "Alan Smith", "—"),
      doc("d2", "Credit Card Statement", true, "Jul 5", "Alan Smith", "—"),
      doc("d3", "Receipts", true, "Jul 10", "Alan Smith", "—"),
      doc("d4", "Payroll Report", true, "Jul 10", "Alan Smith", "—"),
    ],
  },
  {
    id: "johnson-realty",
    name: "Johnson Realty",
    contact: "Priya Johnson",
    company: "Johnson Realty Partners",
    email: "priya@johnsonrealty.com",
    phone: "(646) 555-0139",
    frequency: "Monthly",
    owner: "Rachel Kim",
    monthlyClose: "July 2025",
    progress: 45,
    missing: 6,
    lastContact: "9 days ago",
    nextReminder: "Today, 4:00 PM",
    status: "Overdue",
    openQuestions: 3,
    lastResponse: "9 days ago",
    documents: [
      doc("d1", "Bank Statement", true, "Jul 5", "Priya Johnson", "—"),
      doc("d2", "Escrow Ledger", false, "Jul 6", "Priya Johnson", "4 reminders sent"),
      doc("d3", "Commission Statements", false, "Jul 8", "Priya Johnson", "3 reminders sent"),
      doc("d4", "Credit Card Statement", false, "Jul 8", "Priya Johnson", "3 reminders sent"),
      doc("d5", "Receipts", false, "Jul 12", "Priya Johnson", "2 reminders sent"),
      doc("d6", "Payroll Report", false, "Jul 12", "Devon Ross", "Escalated"),
      doc("d7", "Transaction Explanation", false, "Jul 14", "Priya Johnson", "1 reminder sent"),
    ],
  },
  {
    id: "miller-construction",
    name: "Miller Construction",
    contact: "Tom Miller",
    company: "Miller Construction Inc",
    email: "tom@millerbuild.com",
    phone: "(206) 555-0177",
    frequency: "Monthly",
    owner: "Devon Ross",
    monthlyClose: "July 2025",
    progress: 88,
    missing: 1,
    lastContact: "Yesterday",
    nextReminder: "Jul 26, 10:00 AM",
    status: "Waiting",
    openQuestions: 2,
    lastResponse: "Yesterday",
    documents: [
      doc("d1", "Bank Statement", true, "Jul 5", "Tom Miller", "—"),
      doc("d2", "Subcontractor Invoices", true, "Jul 8", "Tom Miller", "—"),
      doc("d3", "Equipment Receipts", true, "Jul 10", "Tom Miller", "—"),
      doc("d4", "Job Cost Report", false, "Jul 15", "Tom Miller", "1 reminder sent"),
    ],
  },
  {
    id: "greenwood-consulting",
    name: "Greenwood Consulting",
    contact: "Ellis Greenwood",
    company: "Greenwood Consulting LLC",
    email: "ellis@greenwoodco.com",
    phone: "(720) 555-0155",
    frequency: "Quarterly",
    owner: "Marcus Lee",
    monthlyClose: "Q2 2025",
    progress: 60,
    missing: 4,
    lastContact: "4 days ago",
    nextReminder: "Jul 25, 9:00 AM",
    status: "Waiting",
    openQuestions: 1,
    lastResponse: "4 days ago",
    documents: [
      doc("d1", "Bank Statement", true, "Jul 5", "Ellis Greenwood", "—"),
      doc("d2", "Credit Card Statement", true, "Jul 5", "Ellis Greenwood", "—"),
      doc("d3", "Contractor 1099s", false, "Jul 12", "Ellis Greenwood", "2 reminders sent"),
      doc("d4", "Travel Receipts", false, "Jul 12", "Ellis Greenwood", "1 reminder sent"),
      doc("d5", "Client Invoices", false, "Jul 14", "Ellis Greenwood", "Scheduled"),
      doc("d6", "Transaction Explanation", false, "Jul 14", "Ellis Greenwood", "—"),
    ],
  },
  {
    id: "parker-medical",
    name: "Parker Medical",
    contact: "Nina Parker",
    company: "Parker Medical Associates",
    email: "nina@parkermed.com",
    phone: "(602) 555-0163",
    frequency: "Monthly",
    owner: "Rachel Kim",
    monthlyClose: "July 2025",
    progress: 94,
    missing: 1,
    lastContact: "3 days ago",
    nextReminder: "Jul 24, 2:00 PM",
    status: "Waiting",
    openQuestions: 0,
    lastResponse: "3 days ago",
    documents: [
      doc("d1", "Bank Statement", true, "Jul 5", "Nina Parker", "—"),
      doc("d2", "Insurance Remittance", true, "Jul 8", "Nina Parker", "—"),
      doc("d3", "Payroll Report", true, "Jul 8", "Nina Parker", "—"),
      doc("d4", "Medical Supply Receipts", false, "Jul 14", "Nina Parker", "1 reminder sent"),
    ],
  },
  {
    id: "summit-properties",
    name: "Summit Properties",
    contact: "Rob Vasquez",
    company: "Summit Properties LP",
    email: "rob@summitprop.com",
    phone: "(303) 555-0128",
    frequency: "Monthly",
    owner: "Devon Ross",
    monthlyClose: "July 2025",
    progress: 38,
    missing: 5,
    lastContact: "11 days ago",
    nextReminder: "Today, 5:30 PM",
    status: "Overdue",
    openQuestions: 2,
    lastResponse: "11 days ago",
    documents: [
      doc("d1", "Bank Statement", true, "Jul 5", "Rob Vasquez", "—"),
      doc("d2", "Rent Roll", false, "Jul 6", "Rob Vasquez", "4 reminders sent"),
      doc("d3", "Maintenance Receipts", false, "Jul 8", "Rob Vasquez", "3 reminders sent"),
      doc("d4", "Mortgage Statement", false, "Jul 10", "Rob Vasquez", "2 reminders sent"),
      doc("d5", "Credit Card Statement", false, "Jul 10", "Rob Vasquez", "Escalated"),
      doc("d6", "Transaction Explanation", false, "Jul 14", "Rob Vasquez", "1 reminder sent"),
    ],
  },
  {
    id: "westside-dental",
    name: "Westside Dental",
    contact: "Amara Cole",
    company: "Westside Dental PLLC",
    email: "amara@westsidedental.com",
    phone: "(213) 555-0191",
    frequency: "Monthly",
    owner: "Marcus Lee",
    monthlyClose: "July 2025",
    progress: 100,
    missing: 0,
    lastContact: "Today",
    nextReminder: "—",
    status: "Complete",
    openQuestions: 0,
    lastResponse: "Today",
    documents: [
      doc("d1", "Bank Statement", true, "Jul 5", "Amara Cole", "—"),
      doc("d2", "Credit Card Statement", true, "Jul 5", "Amara Cole", "—"),
      doc("d3", "Payroll Report", true, "Jul 8", "Amara Cole", "—"),
      doc("d4", "Lab Invoices", true, "Jul 10", "Amara Cole", "—"),
    ],
  },
];

export const ACTIVITY = [
  {
    id: "a1",
    kind: "ai" as const,
    text: "AI Chaser sent a follow-up to Johnson Realty about 3 missing documents",
    time: "12 min ago",
  },
  {
    id: "a2",
    kind: "upload" as const,
    text: "Smith & Co LLC uploaded Payroll Report — auto-matched to July checklist",
    time: "48 min ago",
  },
  {
    id: "a3",
    kind: "answer" as const,
    text: "Miller Construction answered a transaction question ($4,120 — Home Depot)",
    time: "2 hours ago",
  },
  {
    id: "a4",
    kind: "escalate" as const,
    text: "Summit Properties escalated to Devon Ross after 4 unanswered reminders",
    time: "5 hours ago",
  },
  {
    id: "a5",
    kind: "complete" as const,
    text: "Westside Dental completed the July close checklist",
    time: "Yesterday",
  },
  {
    id: "a6",
    kind: "ai" as const,
    text: "AI drafted 6 personalized reminders for the Monday morning batch",
    time: "Yesterday",
  },
];

export type Message = {
  id: string;
  client: string;
  channel: "Email" | "SMS";
  aiGenerated: boolean;
  subject: string;
  preview: string;
  scheduled?: string;
  sentAt?: string;
  status: "Scheduled" | "Sent" | "Draft";
};

export const MESSAGES: Message[] = [
  {
    id: "m1",
    client: "Johnson Realty",
    channel: "Email",
    aiGenerated: true,
    subject: "Quick nudge: 3 items left for your July close",
    preview:
      "Hi Priya — we're almost done with July. We're still missing the escrow ledger, commission statements and your credit card statement...",
    scheduled: "Today, 4:00 PM",
    status: "Scheduled",
  },
  {
    id: "m2",
    client: "Summit Properties",
    channel: "SMS",
    aiGenerated: true,
    subject: "SMS reminder",
    preview:
      "Hi Rob, ChaseAI here for Northstar Bookkeeping — your July rent roll is 11 days past due. Upload here: chase.ai/p/summit",
    scheduled: "Today, 5:30 PM",
    status: "Scheduled",
  },
  {
    id: "m3",
    client: "ABC Dental",
    channel: "Email",
    aiGenerated: true,
    subject: "Two receipts away from a closed July",
    preview:
      "Hi Dana — thanks for sending the payroll report. Two things left: equipment receipts and a quick note on the $2,480 charge...",
    sentAt: "2 days ago",
    status: "Sent",
  },
  {
    id: "m4",
    client: "Greenwood Consulting",
    channel: "Email",
    aiGenerated: false,
    subject: "Q2 contractor 1099s",
    preview:
      "Ellis, following up on the 1099 backup for Q2. Once we have those we can finalize the quarter.",
    sentAt: "4 days ago",
    status: "Sent",
  },
  {
    id: "m5",
    client: "Miller Construction",
    channel: "SMS",
    aiGenerated: true,
    subject: "SMS reminder",
    preview: "Hi Tom — one item left for July: the job cost report. Reply here or upload anytime.",
    sentAt: "Yesterday",
    status: "Sent",
  },
  {
    id: "m6",
    client: "Parker Medical",
    channel: "Email",
    aiGenerated: true,
    subject: "Last item for July: supply receipts",
    preview:
      "Hi Nina — July is 94% complete. The only thing left is the medical supply receipts batch.",
    scheduled: "Jul 24, 2:00 PM",
    status: "Scheduled",
  },
  {
    id: "m7",
    client: "Westside Dental",
    channel: "Email",
    aiGenerated: false,
    subject: "July close is complete 🎉",
    preview: "Amara — everything is in and July is closed. Financials will land in your inbox Friday.",
    sentAt: "Yesterday",
    status: "Sent",
  },
];

export type TxQuestion = {
  id: string;
  client: string;
  amount: number;
  date: string;
  merchant: string;
  question: string;
  answer?: string;
  status: "Answered" | "Pending";
  confidence: number;
  recommendation: string;
};

export const TX_QUESTIONS: TxQuestion[] = [
  {
    id: "t1",
    client: "ABC Dental",
    amount: 2480.0,
    date: "Jul 09, 2025",
    merchant: "Unknown",
    question:
      "We saw a $2,480.00 charge on Jul 9 with no vendor detail. Was this an equipment purchase or a lab expense?",
    status: "Pending",
    confidence: 62,
    recommendation:
      "Likely a dental equipment purchase based on amount and prior vendor patterns. Suggest asking the client to confirm vendor and whether it should be capitalized.",
  },
  {
    id: "t2",
    client: "Miller Construction",
    amount: 4120.35,
    date: "Jul 11, 2025",
    merchant: "Home Depot",
    question: "Was the $4,120.35 Home Depot purchase for the Riverside job or shop inventory?",
    answer: "Riverside job — materials for the framing phase. Bill it to job #1182.",
    status: "Answered",
    confidence: 81,
    recommendation: "Job-cost to an active project; client confirmed job #1182.",
  },
  {
    id: "t3",
    client: "Johnson Realty",
    amount: 950.0,
    date: "Jul 07, 2025",
    merchant: "Unknown",
    question: "Is the recurring $950.00 transfer on the 7th a staging vendor or an owner draw?",
    status: "Pending",
    confidence: 48,
    recommendation:
      "Recurring same-day, round-dollar transfer to an unlabeled account — most consistent with an owner draw. Confirm before booking to distributions.",
  },
  {
    id: "t4",
    client: "Summit Properties",
    amount: 1275.9,
    date: "Jul 03, 2025",
    merchant: "Ace Hardware",
    question: "Was the $1,275.90 Ace Hardware spend a repair or a capital improvement at Unit 4B?",
    status: "Pending",
    confidence: 71,
    recommendation:
      "Amount and vendor mix suggest routine repairs & maintenance, but the Unit 4B memo may indicate a capitalizable improvement.",
  },
  {
    id: "t5",
    client: "Greenwood Consulting",
    amount: 640.0,
    date: "Jul 06, 2025",
    merchant: "Delta Air Lines",
    question: "Was the $640.00 Delta ticket client travel (billable) or internal?",
    answer: "Billable — client trip for Northwind engagement.",
    status: "Answered",
    confidence: 88,
    recommendation: "Code to billable client travel; client confirmed Northwind engagement.",
  },
  {
    id: "t6",
    client: "Parker Medical",
    amount: 310.42,
    date: "Jul 12, 2025",
    merchant: "Unknown",
    question: "What was the $310.42 charge on Jul 12? No merchant was returned by the bank feed.",
    status: "Pending",
    confidence: 35,
    recommendation:
      "Insufficient signal to classify. Recommend asking the client directly for a receipt image.",
  },
];

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Bookkeeper" | "Staff";
  clients: number;
  tasks: number;
  status: "Active" | "Invited" | "Away";
};

export const TEAM: TeamMember[] = [
  { id: "u1", name: "Rachel Kim", email: "rachel@northstarbooks.com", role: "Admin", clients: 18, tasks: 7, status: "Active" },
  { id: "u2", name: "Marcus Lee", email: "marcus@northstarbooks.com", role: "Manager", clients: 14, tasks: 12, status: "Active" },
  { id: "u3", name: "Devon Ross", email: "devon@northstarbooks.com", role: "Bookkeeper", clients: 11, tasks: 9, status: "Away" },
  { id: "u4", name: "Sofia Alvarez", email: "sofia@northstarbooks.com", role: "Bookkeeper", clients: 4, tasks: 3, status: "Active" },
  { id: "u5", name: "Jonah Pratt", email: "jonah@northstarbooks.com", role: "Staff", clients: 0, tasks: 2, status: "Invited" },
];

export const COLLECTION_RATE = [
  { month: "Feb", rate: 74, target: 90 },
  { month: "Mar", rate: 78, target: 90 },
  { month: "Apr", rate: 83, target: 90 },
  { month: "May", rate: 87, target: 90 },
  { month: "Jun", rate: 91, target: 90 },
  { month: "Jul", rate: 93.3, target: 90 },
];

export const RESPONSE_TIME = [
  { month: "Feb", days: 5.8 },
  { month: "Mar", days: 5.1 },
  { month: "Apr", days: 4.2 },
  { month: "May", days: 3.4 },
  { month: "Jun", days: 2.9 },
  { month: "Jul", days: 2.4 },
];

export const OVERDUE_CLIENTS = [
  { month: "Feb", overdue: 19 },
  { month: "Mar", overdue: 16 },
  { month: "Apr", overdue: 14 },
  { month: "May", overdue: 12 },
  { month: "Jun", overdue: 10 },
  { month: "Jul", overdue: 8 },
];

export const AUTOMATION_PERFORMANCE = [
  { channel: "AI Email", sent: 184, responded: 141 },
  { channel: "SMS", sent: 96, responded: 71 },
  { channel: "Portal Nudge", sent: 32, responded: 27 },
  { channel: "Escalation", sent: 15, responded: 13 },
];

export const PLANS = [
  {
    name: "Starter",
    price: 79,
    clients: "10 clients",
    blurb: "For solo bookkeepers getting their month-end under control.",
    features: [
      "Up to 10 active clients",
      "AI Client Chaser (email)",
      "Document checklists & portal",
      "Automated reminder sequences",
      "Basic analytics",
    ],
  },
  {
    name: "Professional",
    price: 249,
    clients: "50 clients",
    popular: true,
    blurb: "For growing firms closing dozens of books every month.",
    features: [
      "Up to 50 active clients",
      "AI Chaser: email + SMS",
      "Transaction question generator",
      "Automation builder & escalations",
      "Team roles & assignment",
      "Full analytics suite",
    ],
  },
  {
    name: "Agency",
    price: 499,
    clients: "150 clients",
    blurb: "For multi-bookkeeper firms and outsourced accounting teams.",
    features: [
      "Up to 150 active clients",
      "Everything in Professional",
      "White-labeled client portal",
      "QuickBooks & Xero sync",
      "Priority support",
      "Custom automation templates",
    ],
  },
  {
    name: "Enterprise",
    price: null as number | null,
    clients: "Unlimited clients",
    blurb: "For large firms with security review, SSO and custom workflows.",
    features: [
      "Unlimited clients & seats",
      "SSO / SAML & audit logs",
      "Dedicated success manager",
      "Custom integrations & API",
      "Security review & DPA",
    ],
  },
];

export const FAQS = [
  {
    q: "How does the AI client chaser actually work?",
    a: "ChaseAI reads each client's open checklist — which documents are missing, how overdue they are, and what you've already asked for — then drafts a short, human-sounding follow-up in your firm's voice. You approve it, schedule it, or let the automation send it for you. Every message is editable before it goes out.",
  },
  {
    q: "Do my clients need to create an account?",
    a: "No. Clients get a secure link to a branded portal where they see a simple checklist and drag files in. No passwords, no software to install — which is exactly why response rates go up.",
  },
  {
    q: "Which documents can ChaseAI collect?",
    a: "Bank and credit card statements, payroll reports, receipts, vendor invoices, loan and mortgage statements, 1099 backup, and any custom item you add to a workflow template.",
  },
  {
    q: "Does it integrate with QuickBooks or Xero?",
    a: "Yes. ChaseAI syncs your client list and flags uncategorized transactions from QuickBooks Online and Xero so the transaction question generator can ask about them automatically.",
  },
  {
    q: "Can I control the tone and frequency of reminders?",
    a: "Completely. You set the cadence (for example: email on day 2, SMS on day 5, escalate to the account owner on day 7), the maximum number of reminders, and the tone. AI personalization can be switched off entirely if you prefer templates.",
  },
  {
    q: "Is my client data secure?",
    a: "Data is encrypted in transit and at rest, portals use expiring signed links, and role-based access controls who on your team can see which clients. Enterprise plans add SSO, audit logs and a signed DPA.",
  },
  {
    q: "How long does setup take?",
    a: "Most firms are chasing within an afternoon. Import your client list, pick a workflow template per client type, and turn the automation on. There's no implementation project.",
  },
  {
    q: "What if a client still doesn't respond?",
    a: "After your configured number of reminders, ChaseAI escalates: it notifies the assigned accountant, marks the client Overdue on the dashboard, and can trigger a different channel. Nothing quietly falls through.",
  },
];

export const INTEGRATIONS = [
  { id: "quickbooks", name: "QuickBooks Online", category: "Accounting", description: "Sync your client list and pull uncategorized transactions for AI questions.", connected: true },
  { id: "xero", name: "Xero", category: "Accounting", description: "Two-way client sync and bank feed access for transaction review.", connected: false },
  { id: "gmail", name: "Gmail", category: "Email", description: "Send chaser emails from your own domain and thread client replies.", connected: true },
  { id: "outlook", name: "Outlook", category: "Email", description: "Microsoft 365 sending, threading and calendar-aware scheduling.", connected: false },
  { id: "stripe", name: "Stripe", category: "Billing", description: "Bill your firm's subscription and sync client payment records.", connected: true },
  { id: "twilio", name: "Twilio", category: "Messaging", description: "SMS delivery for reminder sequences and escalation nudges.", connected: false },
  { id: "slack", name: "Slack", category: "Notifications", description: "Post escalations and daily close summaries to your team channel.", connected: false },
];

export const DOC_TEMPLATES = [
  "Bank Statement",
  "Credit Card Statement",
  "Receipts",
  "Invoices",
  "Payroll",
  "Transaction Questions",
];
