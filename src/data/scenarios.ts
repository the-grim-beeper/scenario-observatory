// ============================================================================
// Scenario Observatory — Complete Data File
// Extracted from Youth & AI Futures research document
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export interface Axis {
  id: string;
  label: string;
  low: string;
  high: string;
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  tagline: string;
  color: string;
  axes: {
    disruption: 'managed' | 'high';
    transition: 'strong' | 'weak';
    perception: 'agency' | 'doom';
  };
  description: string;
  youthReactions: {
    career: string;
    work: string;
    mentalHealth: string;
    politics: string;
  };
  populationProfile: string;
  earlyIndicators: string;
  radarScores: { label: string; value: number }[];
}

export interface PESTLECategory {
  id: string;
  label: string;
  letter: string;
  color: string;
  findings: { headline: string; detail: string; stat?: string }[];
}

export interface Population {
  id: string;
  name: string;
  description: string;
  risk: string;
  affinityScenarios: string[];
  color: string;
}

export interface PolicyImplication {
  id: string;
  number: number;
  title: string;
  detail: string;
}

export interface SurveyFinding {
  id: string;
  title: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Axes
// ---------------------------------------------------------------------------

export const axes: Axis[] = [
  {
    id: 'disruption',
    label: 'Axis A: Entry-Level Disruption',
    low: 'Managed',
    high: 'High',
    description:
      'The degree to which AI automates and displaces traditional entry-level roles. Managed means organizations redesign rather than delete junior positions; High means visible, large-scale elimination of classic on-ramps.',
  },
  {
    id: 'transition',
    label: 'Axis B: Transition Architecture',
    low: 'Weak',
    high: 'Strong',
    description:
      'The strength of institutional support systems — apprenticeships, retraining programmes, micro-credentials, career counselling — that help young people navigate the changing labour market.',
  },
  {
    id: 'perception',
    label: 'Axis C: Perception Climate',
    low: 'Doom',
    high: 'Agency',
    description:
      'The dominant narrative young people absorb about AI and their future. Agency means people feel empowered to adapt and shape outcomes; Doom means the prevailing story is replacement, helplessness, and betrayal.',
  },
];

// ---------------------------------------------------------------------------
// Radar Dimensions (shared across all scenarios)
// ---------------------------------------------------------------------------

export const radarDimensions = [
  'Economic Prosperity',
  'Social Cohesion',
  'Mental Wellbeing',
  'Political Stability',
  'Innovation Speed',
  'Equity',
] as const;

export type RadarDimension = (typeof radarDimensions)[number];

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export const scenarios: Scenario[] = [
  // 1. Co-Pilot Commons — Managed + Strong + Agency
  {
    id: 'co-pilot-commons',
    name: 'Co-Pilot Commons',
    tagline: 'Managed disruption + Strong transition + Agency narrative',
    color: '#14B8A6',
    axes: {
      disruption: 'managed',
      transition: 'strong',
      perception: 'agency',
    },
    description:
      'AI is ubiquitous, but most organizations redesigned entry-level work instead of deleting it. Junior roles are "AI-assisted apprenticeships" with explicit skill ladders and rotations. Public systems fund micro-credentials and paid placements. The Security-Adoption Loop runs in the right direction.',
    youthReactions: {
      career:
        'Less panic-major-switching; more "AI + domain" hybrids. The 51.2% who value creativity and 48% who value critical thinking find these skills genuinely rewarded.',
      work:
        'High mobility is selective ("I move to learn"), not frantic. The "competent distrust" population thrives.',
      mentalHealth:
        'Anxiety exists but is metabolized as challenge. Future-orientation capacity is maintained. Despair-planning paralysis is prevented by institutional scaffolding.',
      politics:
        'Youth pressure aims at improving access and fairness, not stopping AI. The 39.5% who want more regulation focus on equity provisions. Environmental-tech tension (27.9%) managed through sustainability commitments.',
    },
    populationProfile:
      'Resembles "Secure + Working" segment: optimistic about AI (41.1%), engaged with tools (25.2% daily use), clear future visions. Asian respondents\' pattern is the archetype.',
    earlyIndicators:
      'Entry-level postings stabilize with AI tool requirements. Employers publish skill passports. AI literacy rises in schools. Security-Adoption Loop shows positive compounding.',
    radarScores: [
      { label: 'Economic Prosperity', value: 8 },
      { label: 'Social Cohesion', value: 7 },
      { label: 'Mental Wellbeing', value: 7 },
      { label: 'Political Stability', value: 7 },
      { label: 'Innovation Speed', value: 8 },
      { label: 'Equity', value: 7 },
    ],
  },

  // 2. The Panic Paradox — Managed + Strong + Doom
  {
    id: 'the-panic-paradox',
    name: 'The Panic Paradox',
    tagline: 'Managed disruption + Strong transition + Doom narrative',
    color: '#8B5CF6',
    axes: {
      disruption: 'managed',
      transition: 'strong',
      perception: 'doom',
    },
    description:
      'Labour market is more resilient than expected, support exists — but young people don\'t believe it. Social feeds amplify "job-pocalypse" stories; every layoff framed as AI replacing humans. 61.3% get AI updates through social media while 17% claim never to use AI (algorithm invisibility) — information ecosystem generates doom regardless of ground truth.',
    youthReactions: {
      career:
        'Over-rotation into "perceived safe" work. Institutional discouragement (18.9% report schools "strongly discourage" AI). Credential inflation returns — stacking qualifications for psychological safety.',
      work:
        'Risk aversion rises. 49.2% are pessimistic despite decent fundamentals. Entrepreneurial attempts fall; demand for guaranteed pathways spikes.',
      mentalHealth:
        'Misinformation (37.1%) outranks job displacement (36.2%) as perceived threat. 55.7% who believe AI makes people "think less" experience cognitive atrophy anxiety.',
      politics:
        'Moral panic drives restrictive demands. AI as a voting issue jumps from 7.4% to 11.1% after exposure. Mis-targeted regulation attempts proliferate.',
    },
    populationProfile:
      'Resembles "Students" segment: information-dense but institutionally constrained. 52.9% pessimistic despite high engagement. Maps to women respondents.',
    earlyIndicators:
      'Surveyed fear rises while aggregate youth employment stays stable. Credential inflation returns. High consumption of doom content alongside stable job metrics.',
    radarScores: [
      { label: 'Economic Prosperity', value: 6 },
      { label: 'Social Cohesion', value: 5 },
      { label: 'Mental Wellbeing', value: 4 },
      { label: 'Political Stability', value: 5 },
      { label: 'Innovation Speed', value: 6 },
      { label: 'Equity', value: 6 },
    ],
  },

  // 3. DIY Advantage — Managed + Weak + Agency
  {
    id: 'diy-advantage',
    name: 'DIY Advantage',
    tagline: 'Managed disruption + Weak transition + Agency narrative',
    color: '#F59E0B',
    axes: {
      disruption: 'managed',
      transition: 'weak',
      perception: 'agency',
    },
    description:
      'Market is okay overall, but support is patchy. Those with strong networks and skills turn AI into leverage; others get stuck. The Security-Adoption Loop runs without institutional intervention, amplifying existing inequalities. The "moderately insecure" — the survey\'s most volatile group — split.',
    youthReactions: {
      career:
        'Self-directed learning explodes. 35.1% already use AI daily while only 32.1% report institutional encouragement. Peer and creator-educators fill the gap. "I am a small firm" identity spreads.',
      work:
        'Portfolio careers normalize for the capable. But gendered: men (41.4% AI-optimistic) more likely to pursue this path; women may be structurally disadvantaged.',
      mentalHealth:
        'Sharply polarized. High efficacy for some, shame and comparison stress for others. 18.9% expressing hopelessness concentrated among those who fall behind.',
      politics:
        'Less faith in institutions; more mutual aid. 79.3% see system as broken but most want reform. Pressure for bottom-up solutions.',
    },
    populationProfile:
      '"Secure + Working" segment thrives but "Moderately Insecure" bifurcates. GOP respondents\' higher AI adoption may deepen partisan divergence.',
    earlyIndicators:
      'Growth of peer-to-peer learning. Rising inequality within Gen Z outcomes. Gender gap in AI skill confidence (9.8pp) widens into income gap.',
    radarScores: [
      { label: 'Economic Prosperity', value: 6 },
      { label: 'Social Cohesion', value: 4 },
      { label: 'Mental Wellbeing', value: 5 },
      { label: 'Political Stability', value: 5 },
      { label: 'Innovation Speed', value: 8 },
      { label: 'Equity', value: 3 },
    ],
  },

  // 4. Drift Economy — Managed + Weak + Doom
  {
    id: 'drift-economy',
    name: 'Drift Economy',
    tagline: 'Managed disruption + Weak transition + Doom narrative',
    color: '#6366F1',
    axes: {
      disruption: 'managed',
      transition: 'weak',
      perception: 'doom',
    },
    description:
      'Jobs aren\'t collapsing, but they feel pointless and precarious. Algorithmic management spreads, wages lag, institutions offer little clarity. "You\'re on your own, and the game is rigged." High-despair respondents believe hiring depends on connections (24.2%) and prestige (22.9%).',
    youthReactions: {
      career:
        'Low commitment to long tracks. 29.7% of high-despair individuals can\'t form clear five-year pictures — long educational investments feel irrational. Short-cycle choices dominate.',
      work:
        'Quiet quitting as default. "Compulsory adoption" — using AI while resenting it — becomes the emotional texture of work. Job-hopping is frequent but not upward.',
      mentalHealth:
        'Survey predicts 15-25% increase in mental health service demand. Chronic stress, cynicism, "futurelessness" as a cultural mood. 18.9% expressing hopelessness represents the vanguard.',
      politics:
        'Disengagement rises. Not Working population — 14.1% wouldn\'t vote, 15.7% can\'t name top issue — is the political face. Conspiratorial explanations gain ground. "Moderately insecure" provide fertile ground for populist appeals.',
    },
    populationProfile:
      'Resembles "High Despair" segment: reduced future orientation, lower AI engagement, belief system is rigged. Also maps to "Not Working" population\'s multi-domain disconnection. Black respondents\' paradoxical optimism (30.6% expect future satisfaction) is a counter-current.',
    earlyIndicators:
      'High turnover with flat wage progression. Rising "anti-career" content. Declining trust in universities and employers. 53.4% distrust AI political information.',
    radarScores: [
      { label: 'Economic Prosperity', value: 4 },
      { label: 'Social Cohesion', value: 3 },
      { label: 'Mental Wellbeing', value: 3 },
      { label: 'Political Stability', value: 3 },
      { label: 'Innovation Speed', value: 4 },
      { label: 'Equity', value: 3 },
    ],
  },

  // 5. Apprenticeship Reboot — High + Strong + Agency
  {
    id: 'apprenticeship-reboot',
    name: 'Apprenticeship Reboot',
    tagline: 'High disruption + Strong transition + Agency narrative',
    color: '#10B981',
    axes: {
      disruption: 'high',
      transition: 'strong',
      perception: 'agency',
    },
    description:
      'Entry-level displacement is real and visible: many classic junior tasks are automated. But states and employers rebuild the on-ramp through paid apprenticeships, civic service year programs, and AI-era vocational pathways. 42% report knowing someone whose job was significantly changed by AI — disruption is undeniable but transition architecture provides an answer.',
    youthReactions: {
      career:
        'More pragmatic choices, not despairing. "Learn fast, rotate often." Creativity, critical thinking, and empathy valued as AI-resistant skills validated by apprenticeship designs.',
      work:
        'High participation in structured programs. 32.1% already report institutional encouragement for AI — in this scenario that rises sharply. Willingness to relocate for placements.',
      mentalHealth:
        'Still anxious, but less hopeless because there\'s a map and a net. Low Despair respondents are 20.5pp more likely to believe employers prioritize skills — visible meritocratic structures function as psychological buffers.',
      politics:
        'Youth politics focuses on expansion and fairness of new pathways. Environmental-tech tension (27.9%) finds constructive outlets through green apprenticeships and sustainable AI infrastructure.',
    },
    populationProfile:
      'Aspirational version of "Working" segment, with institutional support extending to "Moderately Insecure." Skills-first hiring belief becomes self-fulfilling through visible meritocratic pathways.',
    earlyIndicators:
      'Large-scale subsidized apprenticeship placements. Hiring shifts from degree screens to skill verification. Security-Adoption Loop shows positive compounding even among previously insecure populations.',
    radarScores: [
      { label: 'Economic Prosperity', value: 7 },
      { label: 'Social Cohesion', value: 7 },
      { label: 'Mental Wellbeing', value: 6 },
      { label: 'Political Stability', value: 7 },
      { label: 'Innovation Speed', value: 7 },
      { label: 'Equity', value: 8 },
    ],
  },

  // 6. Sheltered Stagnation — High + Strong + Doom
  {
    id: 'sheltered-stagnation',
    name: 'Sheltered Stagnation',
    tagline: 'High disruption + Strong transition + Doom narrative',
    color: '#F43F5E',
    axes: {
      disruption: 'high',
      transition: 'strong',
      perception: 'doom',
    },
    description:
      'Support exists, but credibility is low. Young people interpret programs as rationing and gatekeeping: "you must audition for survival." High-despair respondents already believe success depends on connections (24.2%) and prestige (22.9%). When transition architecture is seen through this lens, even good programs feel rigged.',
    youthReactions: {
      career:
        'Compliance behaviour dominates. Credential inflation signal — stacking qualifications for psychological safety. 52.9% student pessimism rate suggests this scenario\'s emotional texture is already present in educational settings.',
      work:
        'People chase programme slots rather than vocations. Only 36.2% believe employers hire for "most suitable skills" — while 19% say "lowest salary" and 15.7% say "personal connections."',
      mentalHealth:
        'Performance anxiety rises. Temporal disconnection finding — even those with future orientation feel it directed toward anxiety rather than aspiration.',
      politics:
        'Protest targets institutions for unfairness while relying on them. 79.3% who see system as broken but want reform — frustrated reformists — become vocal critics of transition programmes they simultaneously depend on.',
    },
    populationProfile:
      'Resembles "Students" combined with "Moderately Insecure": information-dense, aware of both the problem and the programmes, but distrustful of fairness of access. "Compulsory adoption without trust" extends from AI tools to institutional support.',
    earlyIndicators:
      'Explosive growth in applicants per training slot. Allegations of nepotism. Higher cheating and credential fraud. "AI took my future" becomes a stable political slogan.',
    radarScores: [
      { label: 'Economic Prosperity', value: 5 },
      { label: 'Social Cohesion', value: 4 },
      { label: 'Mental Wellbeing', value: 3 },
      { label: 'Political Stability', value: 4 },
      { label: 'Innovation Speed', value: 5 },
      { label: 'Equity', value: 4 },
    ],
  },

  // 7. Centaur Underground — High + Weak + Agency
  {
    id: 'centaur-underground',
    name: 'Centaur Underground',
    tagline: 'High disruption + Weak transition + Agency narrative',
    color: '#06B6D4',
    axes: {
      disruption: 'high',
      transition: 'weak',
      perception: 'agency',
    },
    description:
      'Disruption is severe, supports are thin. But a substantial segment learns to use AI as leverage and builds micro-enterprises, gig portfolios, and small teams. 35.1% already use AI daily — and the Asian respondent pattern of high engagement + high confidence + high risk awareness — is the prototype for this scenario\'s survivors.',
    youthReactions: {
      career:
        'Formal degrees lose power. Only 14.5% view education as a top issue while students are most anxious about AI\'s impact — signals a loss of faith in credentials. Proof-of-work portfolios dominate.',
      work:
        'Side hustles become primary; employment becomes episodic. GOP respondents — higher AI use, lower regulation preference, higher self-efficacy — may be overrepresented in success stories, deepening political-economic sorting.',
      mentalHealth:
        'Mixed. Security-Adoption Loop means winners compound advantages while losers face burnout. 9.8pp gender gap in AI skill confidence makes this scenario harder for women.',
      politics:
        'Low expectations of government; high experimentation. Decentralized unions and guilds emerge. Market for "human-certified" services emerges for authenticity.',
    },
    populationProfile:
      '"Secure + Working + Male + GOP" intersection is most advantaged. Asian respondents\' "digital paradox" is the psychological ideal. But "Not Working" population (31.5% never use AI) is structurally excluded.',
    earlyIndicators:
      'Explosion in micro-contracting platforms. Rapid growth in AI tool subscriptions. Bifurcation between daily AI users and never-users widens into distinct economic classes.',
    radarScores: [
      { label: 'Economic Prosperity', value: 5 },
      { label: 'Social Cohesion', value: 3 },
      { label: 'Mental Wellbeing', value: 4 },
      { label: 'Political Stability', value: 4 },
      { label: 'Innovation Speed', value: 9 },
      { label: 'Equity', value: 2 },
    ],
  },

  // 8. The Great Refusal — High + Weak + Doom
  {
    id: 'the-great-refusal',
    name: 'The Great Refusal',
    tagline: 'High disruption + Weak transition + Doom narrative',
    color: '#EF4444',
    axes: {
      disruption: 'high',
      transition: 'weak',
      perception: 'doom',
    },
    description:
      'The worst combination. Entry-level paths collapse, safety nets don\'t catch people, and the dominant story is replacement and betrayal. 49.2% are already pessimistic, 55.7% believe AI makes people think less, 37.2% view system as fundamentally flawed. The Security-Adoption Loop runs in reverse at scale.',
    youthReactions: {
      career:
        'Mass exit from vulnerable pathways. Migration to trades and physical healthcare (29.3% value manual dexterity). Many opt out entirely — "Not Working" syndrome becomes a mass phenomenon.',
      work:
        '"Compulsory adoption without trust" transforms into active refusal. "Rage-applying," sabotage, and anti-AI workplace conflict become common. 18.9% expressing hopelessness becomes the emotional centre of a political movement.',
      mentalHealth:
        'Survey predicts 25-30% of this cohort will report clinically significant future-orientation deficits by 2030. Elevated hopelessness; spikes in crisis demand. Temporal disconnection — despair as collapse of futurity — reaches clinical scale.',
      politics:
        'Strong anti-AI movements. "Moderately insecure" (48.3% "fundamentally flawed") become mass base. Environmental-tech collision (27.9%) provides additional mobilization vector. Anti-automation parties or ballot initiatives grow.',
    },
    populationProfile:
      '"High Despair + Not Working + Insecure" intersection is the core. But "Moderately Insecure" provides the political energy. Women\'s higher scepticism and care-focused framing may give this movement a gendered character.',
    earlyIndicators:
      'Youth unemployment spikes in AI-exposed entry roles. Anti-automation political parties grow. Sharp decline in trust across all institutions. 14.1% of Not Working who wouldn\'t vote becomes much larger share.',
    radarScores: [
      { label: 'Economic Prosperity', value: 2 },
      { label: 'Social Cohesion', value: 2 },
      { label: 'Mental Wellbeing', value: 2 },
      { label: 'Political Stability', value: 2 },
      { label: 'Innovation Speed', value: 3 },
      { label: 'Equity', value: 1 },
    ],
  },
];

// ---------------------------------------------------------------------------
// PESTLE Analysis
// ---------------------------------------------------------------------------

export const pestleCategories: PESTLECategory[] = [
  {
    id: 'political',
    label: 'Political',
    letter: 'P',
    color: '#EF4444',
    findings: [
      {
        headline: 'Cost of living crowds out AI governance',
        detail:
          '48.2% cite cost of living as top voting issue vs 7.4% for AI (rises to 11.1% after priming). AI governance struggles to compete for political attention against immediate economic pressures.',
        stat: '48.2% vs 7.4%',
      },
      {
        headline: 'Partisan AI positioning',
        detail:
          'GOP shows 14.1pp higher daily AI use than Independents; Democrats stronger calls for regulation (25.7% vs 13% say government does "far too little"). AI adoption and governance attitudes are splitting along partisan lines.',
        stat: '14.1pp gap',
      },
      {
        headline: '"Moderately insecure" as most volatile group',
        detail:
          '48.3% view economic system as "fundamentally flawed." This is the largest persuadable bloc and the most likely to shift political allegiance based on AI-related economic outcomes.',
        stat: '48.3%',
      },
    ],
  },
  {
    id: 'economic',
    label: 'Economic',
    letter: 'E',
    color: '#F59E0B',
    findings: [
      {
        headline: 'Security-Adoption Loop',
        detail:
          'Financial security drives AI adoption, which drives skill development, which drives further security — and the reverse. This feedback loop is the single most important structural dynamic in the data.',
      },
      {
        headline: 'Entry-level contraction',
        detail:
          '21.5% already expect fewer entry-level opportunities; possible 20-35% contraction by 2034; 41.6% know someone affected by AI. The traditional on-ramp into professional careers is narrowing.',
        stat: '20-35% contraction by 2034',
      },
      {
        headline: 'Scarcity orientation',
        detail:
          'Only 36.5% are optimistic about AI\'s impact; defensive psychology dominates. Young people are making career choices from a posture of protection rather than aspiration.',
        stat: '36.5% optimistic',
      },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    letter: 'S',
    color: '#8B5CF6',
    findings: [
      {
        headline: 'Despair as tax on agency',
        detail:
          'High-despair have 8.8% "very able" vs 22.4% low-despair for AI skills; believe hiring depends on connections. Despair does not just reflect pessimism — it actively reduces the capacity to act.',
        stat: '8.8% vs 22.4%',
      },
      {
        headline: '18.9% express hopelessness',
        detail:
          '18.9% express hopelessness in open-ended responses (second after cost of living at 37%). This is not survey fatigue — it is a deeply felt emotional state that shapes all other responses.',
        stat: '18.9%',
      },
      {
        headline: 'Gendered futures',
        detail:
          'Men 41.4% vs 31.6% optimistic; women prioritize healthcare and express greater environmental concern. The AI transition is experienced differently by gender in ways that will shape both labour markets and politics.',
        stat: '41.4% vs 31.6%',
      },
    ],
  },
  {
    id: 'technological',
    label: 'Technological',
    letter: 'T',
    color: '#06B6D4',
    findings: [
      {
        headline: 'Algorithm invisibility',
        detail:
          '61.3% encounter AI through social media, 17% claim never to use AI. Most young people interact with AI systems daily without recognizing them as AI, creating a gap between perceived and actual exposure.',
        stat: '61.3% via social media',
      },
      {
        headline: 'Institutional discouragement backfires',
        detail:
          'Under-21s face more discouragement (18.8% "strongly discourages" vs 10.7% over-21) and are more pessimistic (54% vs 47%). Restricting AI in educational settings correlates with worse, not better, outcomes.',
        stat: '18.8% vs 10.7%',
      },
      {
        headline: 'Human skills as counter-narrative',
        detail:
          'Creativity (51.2%), critical thinking (48%), empathy (44.8%) identified as what matters most. Young people are converging on a shared understanding of which human capabilities remain valuable.',
        stat: '51.2% creativity',
      },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    letter: 'L',
    color: '#10B981',
    findings: [
      {
        headline: 'Regulation demand concentrated but growing',
        detail:
          '39.5% say government does too little; strongest from insecure (28.8% "far too little") and Democratic respondents. Demand for AI regulation is not uniform — it is driven by economic vulnerability and political identity.',
        stat: '39.5%',
      },
      {
        headline: 'Direct exposure increases regulation appetite',
        detail:
          'Direct exposure to AI job change increases regulation appetite. Those who have personally experienced or witnessed AI-driven job changes are significantly more likely to support stronger government intervention.',
      },
    ],
  },
  {
    id: 'environmental',
    label: 'Environmental',
    letter: 'E',
    color: '#22C55E',
    findings: [
      {
        headline: 'Environmental-tech collision',
        detail:
          '27.9% cite environmental impact as top AI threat; highest among Democrats (33.9%) and women (32.1%). AI\'s energy footprint is becoming a mobilization issue, especially for climate-concerned youth.',
        stat: '27.9%',
      },
      {
        headline: 'Youth climate activists targeting AI infrastructure',
        detail:
          'Suggests youth climate activists targeting data centres and energy consumption. The environmental movement and tech scepticism are converging into a single critique with political implications.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Five Populations to Track
// ---------------------------------------------------------------------------

export const populations: Population[] = [
  {
    id: 'secure-adopters',
    name: 'Secure Adopters',
    description:
      '41.1% AI-optimistic, 25.2% daily use, clear future visions. Financially stable, actively engaged with AI tools, and building skills that compound over time.',
    risk: 'Complacency — may not advocate for systems that support less secure peers, widening gaps.',
    affinityScenarios: ['co-pilot-commons', 'diy-advantage', 'centaur-underground'],
    color: '#14B8A6',
  },
  {
    id: 'moderately-insecure',
    name: 'Moderately Insecure',
    description:
      '48.3% say system "fundamentally flawed"; highest cost-of-living concern; knife\'s-edge. This is the largest segment and the one most sensitive to policy and narrative shifts.',
    risk: 'Bifurcation — could split into adapters or refusers depending on which scenario materializes.',
    affinityScenarios: [
      'co-pilot-commons',
      'the-panic-paradox',
      'diy-advantage',
      'drift-economy',
      'apprenticeship-reboot',
      'sheltered-stagnation',
      'centaur-underground',
      'the-great-refusal',
    ],
    color: '#F59E0B',
  },
  {
    id: 'institutional-sceptics',
    name: 'Institutional Sceptics',
    description:
      'Students: 52.9% pessimistic; high info exposure; institutional AI discouragement. Deeply embedded in educational institutions that are themselves uncertain about AI.',
    risk: 'Panic Paradox dynamics; credential inflation. May over-invest in qualifications for psychological safety rather than skill development.',
    affinityScenarios: ['the-panic-paradox', 'sheltered-stagnation'],
    color: '#8B5CF6',
  },
  {
    id: 'disconnected',
    name: 'Disconnected',
    description:
      'Not Working: 31.5% never use AI, 14.1% won\'t vote, multi-domain withdrawal. Disengaged from technology, politics, and traditional career pathways simultaneously.',
    risk: 'Permanent opt-out; "digital peasantry." Risk of becoming structurally excluded from AI-era economy with no pathway back.',
    affinityScenarios: ['drift-economy', 'the-great-refusal'],
    color: '#6366F1',
  },
  {
    id: 'resilient-outsiders',
    name: 'Resilient Outsiders',
    description:
      'Black respondents: 30.6% expect future satisfaction despite disadvantage; cultural resilience. Maintain hope and forward orientation even in objectively difficult circumstances.',
    risk: 'Resilience masking unmet needs. Optimism may prevent accurate assessment of structural barriers and reduce urgency for support.',
    affinityScenarios: [
      'drift-economy',
      'the-panic-paradox',
      'sheltered-stagnation',
      'the-great-refusal',
    ],
    color: '#10B981',
  },
];

// ---------------------------------------------------------------------------
// Policy Implications
// ---------------------------------------------------------------------------

export const policyImplications: PolicyImplication[] = [
  {
    id: 'break-loop',
    number: 1,
    title: 'Break the Security-Adoption Loop early',
    detail:
      'Universal AI literacy programmes free and decoupled from employment. The feedback loop between financial security and AI adoption must be interrupted at its weakest link — access to learning — before it compounds into permanent stratification.',
  },
  {
    id: 'rebuild-future-orientation',
    number: 2,
    title: 'Rebuild future-orientation capacity',
    detail:
      'Career counselling, mentoring, structured planning support. Despair is not just pessimism but a collapse of the ability to imagine and plan for the future. Restoring this capacity requires active intervention, not just information.',
  },
  {
    id: 'target-moderately-insecure',
    number: 3,
    title: 'Target the moderately insecure',
    detail:
      'Visible pathways, co-investment models, skills-first hiring norms. This is the largest and most persuadable segment. Where they land determines which scenario dominates — they are the swing population of the AI transition.',
  },
  {
    id: 'fix-information-ecosystem',
    number: 4,
    title: 'Fix the information ecosystem',
    detail:
      'AI literacy must include algorithmic understanding, not just generative tools. When 61.3% encounter AI through social media and 17% deny using it at all, the information environment itself becomes a policy problem that shapes all other outcomes.',
  },
  {
    id: 'reconnect-disconnected',
    number: 5,
    title: 'Reconnect the disconnected',
    detail:
      'Service years, community learning centres, mentoring programmes. The "Not Working" population represents multi-domain withdrawal that standard employment programmes cannot reach. Reconnection requires meeting people where they are.',
  },
];

// ---------------------------------------------------------------------------
// Cross-Cutting Survey Findings
// ---------------------------------------------------------------------------

export const surveyFindings: SurveyFinding[] = [
  {
    id: 'financial-security-master-variable',
    title: 'Financial security as master variable',
    detail:
      'Financial security is the single strongest predictor of AI attitudes, adoption, skill development, and future orientation. It operates as a gateway variable that enables or constrains every other dimension of the AI transition.',
  },
  {
    id: 'despair-temporal-disconnection',
    title: 'Despair as temporal disconnection',
    detail:
      'Despair is not merely pessimism — it is a collapse of the capacity to orient toward the future. High-despair respondents cannot form five-year plans, do not believe in meritocratic hiring, and withdraw from skill-building. This is a distinct psychological syndrome, not just a negative attitude.',
  },
  {
    id: 'epistemic-fear-outranks-job-loss',
    title: 'Epistemic fear outranks job loss',
    detail:
      'Misinformation (37.1%) outranks job displacement (36.2%) as the perceived top AI threat. Young people are more afraid of not being able to trust what they know than of losing their jobs. This inverts the standard policy framing.',
  },
  {
    id: 'compulsory-adoption-without-trust',
    title: 'Compulsory adoption without trust',
    detail:
      '56.6% use AI weekly while 49.2% are pessimistic about its impact. Young people are using AI not because they believe in it but because they feel they have no choice. This creates a psychologically corrosive dynamic of compliance without consent.',
  },
  {
    id: 'not-working-distinct-syndrome',
    title: '"Not Working" population as distinct syndrome',
    detail:
      'The "Not Working" segment (31.5% never use AI, 14.1% would not vote, 15.7% cannot name a top issue) represents multi-domain withdrawal — from technology, politics, and civic life simultaneously. This is not unemployment; it is a distinct social syndrome requiring integrated responses.',
  },
];

// ---------------------------------------------------------------------------
// Utility: look up a scenario by ID
// ---------------------------------------------------------------------------

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Utility: get scenarios matching a specific axis value
// ---------------------------------------------------------------------------

export function getScenariosByAxis(
  axis: keyof Scenario['axes'],
  value: string,
): Scenario[] {
  return scenarios.filter((s) => s.axes[axis] === value);
}

// ---------------------------------------------------------------------------
// Utility: get the total radar score for a scenario (sum of all dimensions)
// ---------------------------------------------------------------------------

export function getRadarTotal(scenario: Scenario): number {
  return scenario.radarScores.reduce((sum, s) => sum + s.value, 0);
}

// ---------------------------------------------------------------------------
// Utility: get all scenario IDs a population has affinity with
// ---------------------------------------------------------------------------

export function getPopulationAffinities(populationId: string): Scenario[] {
  const pop = populations.find((p) => p.id === populationId);
  if (!pop) return [];
  return scenarios.filter((s) => pop.affinityScenarios.includes(s.id));
}
