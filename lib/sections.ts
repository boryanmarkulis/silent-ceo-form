export type QuestionType = 'text' | 'email' | 'url' | 'singleChoice' | 'multiChoice' | 'multiChoiceWithOther'

export interface Option {
  value: string
  label: string
}

export interface Question {
  id: string
  type: QuestionType
  text: string
  hint?: string
  placeholder?: string
  options?: Option[]
  optional?: boolean
  validation?: 'required' | 'email' | 'url'
}

export interface Section {
  id: string
  breakHeading: string
  breakSubhead: string
  questions: Question[]
}

export const section1Questions: Question[] = [
  {
    id: 'company',
    type: 'text',
    text: "What's your company name?",
    placeholder: 'Company name',
    validation: 'required',
  },
  {
    id: 'website',
    type: 'url',
    text: 'And your website?',
    placeholder: 'https://',
    hint: "Skip if you don't have one",
    optional: true,
  },
  {
    id: 'role',
    type: 'singleChoice',
    text: "What's your role?",
    options: [
      { value: 'founder', label: 'Founder' },
      { value: 'ceo', label: 'CEO' },
      { value: 'co-founder', label: 'Co-founder' },
      { value: 'coo', label: 'COO' },
      { value: 'other', label: 'Other' },
    ],
    validation: 'required',
  },
  {
    id: 'headcount',
    type: 'singleChoice',
    text: 'How many people work at your company?',
    options: [
      { value: '1-9', label: '1–9' },
      { value: '10-25', label: '10–25' },
      { value: '26-50', label: '26–50' },
      { value: '51-100', label: '51–100' },
      { value: '100+', label: '100+' },
    ],
    validation: 'required',
  },
  {
    id: 'revenue',
    type: 'singleChoice',
    text: 'Rough annual revenue?',
    hint: 'Ballpark is fine',
    options: [
      { value: '<500k', label: 'Under €500k' },
      { value: '500k-2m', label: '€500k – €2M' },
      { value: '2m-10m', label: '€2M – €10M' },
      { value: '10m+', label: '€10M+' },
    ],
    validation: 'required',
  },
]

export const section2: Section = {
  id: 'section2',
  breakHeading: 'Now, your stack.',
  breakSubhead: 'The tools your business runs on.',
  questions: [
    {
      id: 'tools_accounting',
      type: 'multiChoiceWithOther',
      text: 'What do you use for accounting and finance?',
      options: [
        { value: 'exact', label: 'Exact' },
        { value: 'moneybird', label: 'Moneybird' },
        { value: 'snelstart', label: 'SnelStart' },
        { value: 'twinfield', label: 'Twinfield' },
        { value: 'yuki', label: 'Yuki' },
        { value: 'visma', label: 'Visma' },
        { value: 'afas', label: 'AFAS' },
        { value: 'none', label: 'Nothing formal' },
      ],
      validation: 'required',
    },
    {
      id: 'tools_crm',
      type: 'multiChoiceWithOther',
      text: 'What do you use for CRM or sales tracking?',
      options: [
        { value: 'hubspot', label: 'HubSpot' },
        { value: 'pipedrive', label: 'Pipedrive' },
        { value: 'salesforce', label: 'Salesforce' },
        { value: 'teamleader', label: 'Teamleader' },
        { value: 'zoho', label: 'Zoho CRM' },
        { value: 'none', label: 'Nothing formal' },
      ],
      validation: 'required',
    },
    {
      id: 'tools_pm',
      type: 'multiChoiceWithOther',
      text: 'What do you use for project management?',
      options: [
        { value: 'asana', label: 'Asana' },
        { value: 'notion', label: 'Notion' },
        { value: 'clickup', label: 'ClickUp' },
        { value: 'monday', label: 'Monday.com' },
        { value: 'linear', label: 'Linear' },
        { value: 'trello', label: 'Trello' },
        { value: 'none', label: 'Nothing formal' },
      ],
      validation: 'required',
    },
    {
      id: 'tools_comms',
      type: 'multiChoiceWithOther',
      text: 'Where does your team communicate?',
      options: [
        { value: 'slack', label: 'Slack' },
        { value: 'teams', label: 'Microsoft Teams' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'discord', label: 'Discord' },
        { value: 'email', label: 'Email only' },
      ],
      validation: 'required',
    },
    {
      id: 'tools_hr',
      type: 'multiChoiceWithOther',
      text: 'What do you use for HR or people management?',
      options: [
        { value: 'personio', label: 'Personio' },
        { value: 'afas', label: 'AFAS' },
        { value: 'nmbrs', label: 'Nmbrs' },
        { value: 'hoorayhr', label: 'HoorayHR' },
        { value: 'loket', label: 'Loket.nl' },
        { value: 'spreadsheet', label: 'Spreadsheet' },
        { value: 'none', label: 'Nothing formal' },
      ],
      validation: 'required',
    },
    {
      id: 'numbers_where',
      type: 'text',
      text: 'Where do you actually look when you want to understand how your business is doing?',
      hint: 'A tool, a spreadsheet, a report - wherever you actually go',
      placeholder: 'e.g. "I pull an Excel from my accountant once a month"',
      validation: 'required',
    },
  ],
}

export const section3: Section = {
  id: 'section3',
  breakHeading: 'Now, the hard part.',
  breakSubhead: "What you can't see from where you sit.",
  questions: [
    {
      id: 'blind_spots',
      type: 'multiChoiceWithOther',
      text: 'What part of your business do you feel blind to?',
      hint: 'Pick as many as apply',
      options: [
        { value: 'financials', label: 'Financials and cash flow' },
        { value: 'pipeline', label: 'Sales pipeline' },
        { value: 'team_perf', label: 'How my team is actually doing' },
        { value: 'customers', label: 'Customer health and churn risk' },
        { value: 'ops', label: 'Operations and delivery' },
      ],
      validation: 'required',
    },
    {
      id: 'ai_coo_first',
      type: 'text',
      text: "If something watched your business 24/7 and pinged you when it needed your attention - what's the first thing you'd want it watching?",
      placeholder: 'Be specific if you can',
      validation: 'required',
    },
    {
      id: 'pricing',
      type: 'singleChoice',
      text: "If this tool saved you 5 hours a month and caught two problems you'd have missed - what would it be worth?",
      hint: 'Per month',
      options: [
        { value: '50', label: '€50' },
        { value: '200', label: '€200' },
        { value: '500', label: '€500' },
        { value: '1000', label: '€1,000' },
        { value: '2000+', label: '€2,000+' },
        { value: '0', label: "I wouldn't pay for this" },
      ],
      validation: 'required',
    },
  ],
}

export const section4: Section = {
  id: 'section4',
  breakHeading: 'Last thing.',
  breakSubhead: 'Completely optional.',
  questions: [
    {
      id: 'name',
      type: 'text',
      text: "What's your name?",
      placeholder: 'Your name',
      optional: true,
      hint: 'Optional',
    },
    {
      id: 'email',
      type: 'email',
      text: 'Want updates as we build?',
      placeholder: 'your@email.com',
      hint: 'Rare emails only. Optional.',
      optional: true,
      validation: 'email',
    },
  ],
}

export const allQuestions: Question[] = [
  ...section1Questions,
  ...section2.questions,
  ...section3.questions,
  ...section4.questions,
]
