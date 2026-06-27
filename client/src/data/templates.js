// Built-in templates — no `id` field; fresh IDs are generated at creation time

export const TEMPLATES = [
  {
    slug:        'customer-feedback',
    title:       'Customer feedback survey',
    description: 'Understand how customers feel about your product or service.',
    emoji:       '⭐',
    category:    'Feedback',
    fields: [
      {
        type: 'rating', iconStyle: 'stars', max: 5,
        label: 'How would you rate your overall experience?',
        required: true, placeholder: '', options: [],
      },
      {
        type: 'multiple_choice',
        label: 'What did you like most about our service?',
        required: false, placeholder: '', options: ['Product quality', 'Customer support', 'Ease of use', 'Value for money'],
      },
      {
        type: 'nps', min: 0, max: 10,
        label: 'How likely are you to recommend us to a friend or colleague?',
        required: true, placeholder: '', options: [],
      },
      {
        type: 'long_text',
        label: 'Any other feedback you\'d like to share?',
        required: false, placeholder: 'Tell us what went well or what we could improve…', options: [],
      },
    ],
  },

  {
    slug:        'event-rsvp',
    title:       'Event RSVP',
    description: 'Collect RSVPs and dietary preferences for your next event.',
    emoji:       '🎉',
    category:    'Events',
    fields: [
      {
        type: 'short_text',
        label: 'Full name',
        required: true, placeholder: 'Sarah Johnson', options: [],
      },
      {
        type: 'email',
        label: 'Email address',
        required: true, placeholder: 'sarah@example.com', options: [],
      },
      {
        type: 'dropdown',
        label: 'Will you be attending?',
        required: true, placeholder: '', options: ['Yes, I\'ll be there', 'No, I can\'t make it', 'Maybe — I\'ll confirm later'],
      },
      {
        type: 'multiple_choice',
        label: 'Dietary requirements',
        required: false, placeholder: '', options: ['No restrictions', 'Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher'],
      },
    ],
  },

  {
    slug:        'job-application',
    title:       'Job application',
    description: 'A simple application form to screen candidates quickly.',
    emoji:       '💼',
    category:    'Recruitment',
    fields: [
      {
        type: 'short_text',
        label: 'Full name',
        required: true, placeholder: 'Your full name', options: [],
      },
      {
        type: 'email',
        label: 'Email address',
        required: true, placeholder: 'your@email.com', options: [],
      },
      {
        type: 'number',
        label: 'Years of relevant experience',
        required: true, placeholder: 'e.g. 3', options: [],
      },
      {
        type: 'dropdown',
        label: 'How did you hear about this role?',
        required: false, placeholder: '', options: ['LinkedIn', 'Company website', 'Job board', 'Referral', 'Other'],
      },
      {
        type: 'long_text',
        label: 'Why are you a great fit for this role?',
        required: true, placeholder: 'Tell us about your relevant experience and what excites you about this position…', options: [],
      },
    ],
  },

  {
    slug:        'contact-form',
    title:       'Contact form',
    description: 'A clean, minimal contact form for your website or product.',
    emoji:       '✉️',
    category:    'General',
    fields: [
      {
        type: 'short_text',
        label: 'Your name',
        required: true, placeholder: 'First and last name', options: [],
      },
      {
        type: 'email',
        label: 'Email address',
        required: true, placeholder: 'you@example.com', options: [],
      },
      {
        type: 'short_text',
        label: 'Subject',
        required: true, placeholder: 'What\'s this about?', options: [],
      },
      {
        type: 'long_text',
        label: 'Message',
        required: true, placeholder: 'Type your message here…', options: [],
      },
    ],
  },

  {
    slug:        'product-nps',
    title:       'Product feedback & NPS',
    description: 'Measure satisfaction and Net Promoter Score for your product.',
    emoji:       '📊',
    category:    'Feedback',
    fields: [
      {
        type: 'nps', min: 0, max: 10,
        label: 'How likely are you to recommend our product to a friend or colleague?',
        required: true, placeholder: '', options: [],
      },
      {
        type: 'linear_scale', min: 1, max: 5,
        labelLeft: 'Very difficult', labelRight: 'Very easy',
        label: 'How easy is it to use our product?',
        required: true, placeholder: '', options: [],
      },
      {
        type: 'multiple_choice',
        label: 'Which feature do you value most?',
        required: false, placeholder: '', options: ['Performance', 'Design', 'Reliability', 'Integrations', 'Support'],
      },
      {
        type: 'long_text',
        label: 'What\'s the one thing we could do to improve your experience?',
        required: false, placeholder: 'Be as specific as you like…', options: [],
      },
    ],
  },

  {
    slug:        'workshop-registration',
    title:       'Workshop registration',
    description: 'Register attendees for a workshop, class, or training session.',
    emoji:       '📝',
    category:    'Events',
    fields: [
      {
        type: 'short_text',
        label: 'Full name',
        required: true, placeholder: 'Your full name', options: [],
      },
      {
        type: 'email',
        label: 'Email address',
        required: true, placeholder: 'you@example.com', options: [],
      },
      {
        type: 'dropdown',
        label: 'Which session would you like to attend?',
        required: true, placeholder: '', options: ['Session 1 – 9:00 AM', 'Session 2 – 1:00 PM', 'Session 3 – 5:00 PM'],
      },
      {
        type: 'checkbox',
        label: 'Which topics are you most interested in?',
        required: false, placeholder: '', options: ['Basics & fundamentals', 'Advanced techniques', 'Hands-on practice', 'Q&A and open discussion'],
      },
      {
        type: 'short_text',
        label: 'Any special requirements or questions for the facilitator?',
        required: false, placeholder: 'Accessibility needs, questions, etc.', options: [],
      },
    ],
  },
]

export const CATEGORIES = ['All', ...new Set(TEMPLATES.map(t => t.category))]
