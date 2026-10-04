import type { Email, EmailCategory } from './email-model'

function dateInDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function receivedAt(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
}

export function createSeedEmails(): Email[] {
  return [
    {
      id: 'grant-deadline', sender: 'Northstar Foundation', senderEmail: 'grants@northstar.org',
      subject: 'Your community grant application is almost due',
      summary: 'Your application is saved, but the final budget and two supporting documents are still missing.',
      category: 'attention', relevanceScore: 98, urgencyScore: 96, actionRequired: true,
      keyInformation: ['Due in 3 days', '$24,000 available', 'Two documents missing'],
      extractedInformation: [
        { label: 'Submission deadline', value: dateInDays(3), kind: 'deadline' },
        { label: 'Grant amount', value: '$24,000', kind: 'amount' },
        { label: 'Eligibility', value: 'Registered community nonprofits', kind: 'eligibility' },
        { label: 'Still needed', value: 'Final budget and board letter', kind: 'other' },
      ],
      originalContent: 'Hi Alex,\n\nA quick reminder that your Northstar Community Impact Grant application is due soon. We have saved your draft, but we are still missing your finalized project budget and a signed board support letter.\n\nApplications must be submitted by 5:00 PM local time on the deadline date. Eligible applicants are registered nonprofit organizations serving local communities. Awards range from $5,000 to $24,000.\n\nYou can return to your application at any time before the deadline. We are looking forward to learning more about your work.\n\nWarmly,\nNorthstar Foundation Grants Team',
      recommendedAction: 'Upload the finalized project budget and signed board letter before the deadline.',
      receivedAt: receivedAt(1), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'health-enrollment', sender: 'Meridian Health', senderEmail: 'benefits@meridianhealth.com',
      subject: 'Choose your 2027 health plan by October 12',
      summary: 'Your open-enrollment window closes soon. Your current plan will renew automatically if you take no action.',
      category: 'attention', relevanceScore: 94, urgencyScore: 88, actionRequired: true,
      keyInformation: ['Closes October 12', 'Three plans to compare', 'Current plan renews automatically'],
      extractedInformation: [
        { label: 'Enrollment closes', value: dateInDays(9), kind: 'deadline' },
        { label: 'Plans available', value: 'Essential, Plus, and HSA', kind: 'other' },
        { label: 'Action', value: 'Review dependents and prescriptions', kind: 'other' },
      ],
      originalContent: 'Hello Alex,\n\nOpen enrollment for your 2027 Meridian Health coverage is now open. Please review your plan options and confirm your dependents and prescription coverage by the enrollment deadline.\n\nYour current plan will renew automatically if you do not make a selection. The Essential, Plus, and HSA plans have updated premiums and provider networks for 2027.\n\nPlease sign in to your benefits portal to compare plans and submit your choice.\n\nMeridian Benefits',
      recommendedAction: 'Compare the three plans and confirm your dependents and prescriptions.',
      receivedAt: receivedAt(3), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'utility-bill', sender: 'City Energy', senderEmail: 'billing@cityenergy.example',
      subject: 'Your energy bill of $184.60 is ready',
      summary: 'Your latest statement is due this week. AutoPay is currently switched off for this account.',
      category: 'attention', relevanceScore: 90, urgencyScore: 83, actionRequired: true,
      keyInformation: ['$184.60 due', 'Due in 2 days', 'AutoPay is off'],
      extractedInformation: [
        { label: 'Amount due', value: '$184.60', kind: 'amount' },
        { label: 'Payment due', value: dateInDays(2), kind: 'deadline' },
        { label: 'AutoPay', value: 'Off', kind: 'other' },
      ],
      originalContent: 'Hi Alex,\n\nYour City Energy statement is ready. The amount due is $184.60, payable by the date shown on your statement. AutoPay is currently off, so please make a payment through your online account or the City Energy app.\n\nThank you,\nCity Energy Billing',
      recommendedAction: 'Pay the $184.60 balance or turn on AutoPay before the due date.',
      receivedAt: receivedAt(7), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'school-event', sender: 'Riverside Community School', senderEmail: 'events@riverside.school',
      subject: 'Family science night is next Thursday',
      summary: 'A hands-on evening for students and families, with a short RSVP requested for planning.',
      category: 'attention', relevanceScore: 86, urgencyScore: 72, actionRequired: true,
      keyInformation: ['October 8 at 6:00 PM', 'RSVP requested', 'Bring a reusable water bottle'],
      extractedInformation: [
        { label: 'Event date', value: dateInDays(5), kind: 'event' },
        { label: 'Time', value: '6:00 PM', kind: 'other' },
        { label: 'Location', value: 'Riverside School, main hall', kind: 'other' },
      ],
      originalContent: 'Hello families,\n\nPlease join us for Family Science Night next Thursday at 6:00 PM in the Riverside School main hall. Students can explore hands-on stations with their families.\n\nPlease RSVP by Tuesday so we can prepare enough materials. Bring a reusable water bottle if you can.\n\nSee you there,\nRiverside Community School',
      recommendedAction: 'RSVP for the event and add it to your calendar.',
      receivedAt: receivedAt(11), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'lease-renewal', sender: 'Harbor Property Group', senderEmail: 'leasing@harborproperty.example',
      subject: 'Your lease renewal options are ready',
      summary: 'Your renewal choices are available to review in the resident portal before the end of the month.',
      category: 'worth-knowing', relevanceScore: 78, urgencyScore: 54, actionRequired: false,
      keyInformation: ['Renewal options available', 'Current term ends in December'],
      extractedInformation: [
        { label: 'Current lease ends', value: dateInDays(70), kind: 'deadline' },
        { label: 'Options', value: '12 or 18 month terms', kind: 'other' },
      ],
      originalContent: 'Hi Alex,\n\nYour lease renewal options are now available in the resident portal. Your current lease ends in December. You can review 12-month and 18-month terms at your convenience.\n\nThere is no need to decide today. We will send a follow-up closer to your renewal date.\n\nHarbor Property Group',
      recommendedAction: 'Review the terms when you have a moment.',
      receivedAt: receivedAt(15), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'workshop-invitation', sender: 'Studio Commons', senderEmail: 'hello@studiocommons.example',
      subject: 'You’re invited: a free weekend pottery workshop',
      summary: 'A small-group beginner workshop has a few seats left at the neighborhood studio.',
      category: 'worth-knowing', relevanceScore: 72, urgencyScore: 42, actionRequired: false,
      keyInformation: ['Saturday, October 17', 'Free for members', 'Four places left'],
      extractedInformation: [
        { label: 'Workshop date', value: dateInDays(14), kind: 'event' },
        { label: 'Cost', value: 'Free for members', kind: 'amount' },
        { label: 'Places remaining', value: '4', kind: 'other' },
      ],
      originalContent: 'Hello Alex,\n\nWe have four places left in our beginner pottery workshop on Saturday, October 17. It is free for Studio Commons members and includes all materials.\n\nReserve a place on our events page if you would like to join us.\n\nStudio Commons',
      recommendedAction: 'Save a seat if the workshop sounds interesting.',
      receivedAt: receivedAt(22), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'monthly-briefing', sender: 'Fieldnotes', senderEmail: 'dispatch@fieldnotes.example',
      subject: 'The September neighborhood briefing',
      summary: 'A short round-up of local library hours, new cycle lanes, and this month’s community workshops.',
      category: 'worth-knowing', relevanceScore: 68, urgencyScore: 24, actionRequired: false,
      keyInformation: ['Library hours updated', 'Two new cycle lanes', 'Community workshops'],
      extractedInformation: [{ label: 'Highlights', value: 'Library, transport, and events', kind: 'other' }],
      originalContent: 'This month in the neighborhood: the central library has extended its evening hours, two protected cycle lanes opened along Ash Street, and the fall community workshop schedule is now available.\n\nRead the full briefing whenever you have a few minutes.\n\nFieldnotes',
      recommendedAction: 'Skim the neighborhood update when you have a few minutes.',
      receivedAt: receivedAt(28), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'package-delivered', sender: 'Parcel Post', senderEmail: 'updates@parcelpost.example',
      subject: 'Your parcel was delivered',
      summary: 'Your order was left in the secure lobby parcel room.',
      category: 'no-action', relevanceScore: 38, urgencyScore: 15, actionRequired: false,
      keyInformation: ['Delivered at 11:42 AM', 'Secure lobby parcel room'],
      extractedInformation: [
        { label: 'Delivery status', value: 'Delivered', kind: 'other' },
        { label: 'Location', value: 'Lobby parcel room', kind: 'other' },
      ],
      originalContent: 'Your Parcel Post delivery has arrived and was placed in the secure lobby parcel room at 11:42 AM. No signature was needed.\n\nThank you for using Parcel Post.',
      recommendedAction: 'No action needed.',
      receivedAt: receivedAt(3), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'coffee-receipt', sender: 'Juniper Coffee', senderEmail: 'receipts@juniper.example',
      subject: 'Thanks for stopping by Juniper',
      summary: 'Your receipt for today’s coffee order is ready.',
      category: 'no-action', relevanceScore: 28, urgencyScore: 8, actionRequired: false,
      keyInformation: ['$8.40 purchase', 'Receipt attached'],
      extractedInformation: [
        { label: 'Total', value: '$8.40', kind: 'amount' },
        { label: 'Payment', value: 'Visa ending in 2048', kind: 'other' },
      ],
      originalContent: 'Thanks for visiting Juniper Coffee. Your total was $8.40. Your receipt is attached for your records.\n\nSee you again soon!',
      recommendedAction: 'Keep the receipt for your records.',
      receivedAt: receivedAt(6), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'weekly-product-note', sender: 'Product Notes', senderEmail: 'newsletter@productnotes.example',
      subject: 'Three small ideas for your Friday',
      summary: 'A weekly newsletter with links to recent product and design writing.',
      category: 'no-action', relevanceScore: 21, urgencyScore: 5, actionRequired: false,
      keyInformation: ['Weekly newsletter', 'Three reading links'],
      extractedInformation: [{ label: 'Edition', value: 'Friday weekly', kind: 'other' }],
      originalContent: 'Here are three thoughtful reads for your Friday: a guide to calmer notifications, a look at community-first product design, and a short interview with an independent maker.\n\nEnjoy this week’s edition.',
      recommendedAction: 'Read it later if anything catches your eye.',
      receivedAt: receivedAt(19), reminderState: 'none', reminderDate: null,
    },
    {
      id: 'account-security', sender: 'Cloud Harbor', senderEmail: 'security@cloudharbor.example',
      subject: 'A new sign-in to your account',
      summary: 'A sign-in from a device you use regularly was completed successfully.',
      category: 'no-action', relevanceScore: 35, urgencyScore: 18, actionRequired: false,
      keyInformation: ['Recognized device', 'Sign-in successful'],
      extractedInformation: [
        { label: 'Device', value: 'MacBook Pro · Chrome', kind: 'other' },
        { label: 'Status', value: 'Recognized sign-in', kind: 'other' },
      ],
      originalContent: 'A sign-in to your Cloud Harbor account was completed from a MacBook Pro using Chrome. This device is on your trusted devices list.\n\nIf this was not you, visit your account security settings.',
      recommendedAction: 'No action needed unless you do not recognize this sign-in.',
      receivedAt: receivedAt(30), reminderState: 'none', reminderDate: null,
    },
  ]
}

export function createSyncedEmail(category: EmailCategory): Email {
  const shared = {
    id: `email-${crypto.randomUUID()}`,
    receivedAt: new Date().toISOString(),
    reminderState: 'none' as const,
    reminderDate: null as string | null,
  }

  if (category === 'attention') {
    return {
      ...shared,
      sender: 'Brightline Utilities',
      senderEmail: 'billing@brightline.example',
      subject: 'A payment of $126.40 is due tomorrow',
      summary: 'Your latest utility payment is coming due, and automatic payments are turned off.',
      category,
      relevanceScore: 92,
      urgencyScore: 94,
      actionRequired: true,
      keyInformation: ['$126.40 due', 'Payment due tomorrow', 'AutoPay is off'],
      extractedInformation: [
        { label: 'Amount due', value: '$126.40', kind: 'amount' },
        { label: 'Payment deadline', value: dateInDays(1), kind: 'deadline' },
        { label: 'AutoPay', value: 'Off', kind: 'other' },
      ],
      originalContent: 'Hello Alex,\n\nYour Brightline Utilities balance of $126.40 is due tomorrow. AutoPay is currently off for your account. Please make a payment through your account portal to avoid a late fee.\n\nBrightline Billing',
      recommendedAction: 'Pay the $126.40 balance before tomorrow’s deadline.',
    }
  }

  if (category === 'worth-knowing') {
    return {
      ...shared,
      sender: 'Goodwell Community',
      senderEmail: 'programs@goodwell.example',
      subject: 'New community garden volunteer dates',
      summary: 'Goodwell has opened sign-ups for two upcoming neighborhood garden mornings.',
      category,
      relevanceScore: 76,
      urgencyScore: 36,
      actionRequired: false,
      keyInformation: ['Two upcoming dates', 'No experience needed', 'Tools provided'],
      extractedInformation: [
        { label: 'First volunteer morning', value: dateInDays(14), kind: 'event' },
        { label: 'Second volunteer morning', value: dateInDays(21), kind: 'event' },
        { label: 'What to bring', value: 'Closed-toe shoes', kind: 'other' },
      ],
      originalContent: 'Hello neighbors,\n\nWe have opened sign-ups for two upcoming community garden mornings. No gardening experience is needed, and all tools are provided. Please bring closed-toe shoes and a water bottle.\n\nChoose whichever Saturday works best for you in the volunteer portal.\n\nGoodwell Community',
      recommendedAction: 'Pick a volunteer morning if you would like to join.',
    }
  }

  return {
    ...shared,
    sender: 'Parcel Post',
    senderEmail: 'updates@parcelpost.example',
    subject: 'Your parcel was delivered',
    summary: 'Your order was left in the secure lobby parcel room.',
    category,
    relevanceScore: 38,
    urgencyScore: 15,
    actionRequired: false,
    keyInformation: ['Delivered at 11:42 AM', 'Secure lobby parcel room'],
    extractedInformation: [
      { label: 'Delivery status', value: 'Delivered', kind: 'other' },
      { label: 'Location', value: 'Lobby parcel room', kind: 'other' },
    ],
    originalContent: 'Your Parcel Post delivery has arrived and was placed in the secure lobby parcel room at 11:42 AM. No signature was needed.\n\nThank you for using Parcel Post.',
    recommendedAction: 'No action needed.',
  }
}

export function createRandomSyncedEmail(random: () => number = Math.random): Email | null {
  if (random() < 0.3) return null
  const categories: EmailCategory[] = ['attention', 'worth-knowing', 'no-action']
  const category = categories[Math.floor(random() * categories.length)]
  return createSyncedEmail(category)
}
