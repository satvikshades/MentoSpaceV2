// Plans for schools. Pricing is per student, per academic year, and shared on request.

export const PLANS = [
  {
    key: "essential",
    number: 1,
    sessions: 1,
    name: "Essential",
    inherits: null,
    features: [
      "1 individual mentoring session per month",
      "Dedicated student mentor",
      "Monthly student wellbeing check-in",
      "Student progress and participation tracking",
      "Access to the professional referral pathway",
    ],
    bestFor: "Schools introducing structured student mentorship for the first time.",
  },
  {
    key: "connect",
    number: 2,
    sessions: 2,
    name: "Connect",
    inherits: "Essential",
    featured: true,
    features: [
      "2 individual mentoring sessions per month",
      "Monthly group mentorship sessions",
      "Group discussions on friendships, peer pressure, exam stress, confidence and emotional wellbeing",
      "Quarterly student wellbeing reports",
    ],
    bestFor: "Schools looking for consistent student engagement and mentorship.",
  },
  {
    key: "complete",
    number: 3,
    sessions: 3,
    name: "Complete",
    inherits: "Connect",
    features: [
      "3 individual mentoring sessions per month",
      "Quarterly parent mental wellness workshops",
      "Quarterly teacher mental wellness workshops",
      "Dedicated school-level wellbeing reports",
      "Priority coordination for additional student support and professional referrals",
    ],
    bestFor: "Schools that want whole-school wellbeing support for students, parents and teachers.",
  },
];

export const planByKey = Object.fromEntries(PLANS.map((p) => [p.key, p]));

