/* ============================================================
   COURT CASE SIMULATOR — Application Logic
   ============================================================ */

/* ==================== STATE MANAGEMENT ==================== */
const state = {
  selectedCase: null,
  reviewedEvidence: [],
  selectedEvidence: null,
  interviewedWitnesses: [],
  credibilityScores: {},
  evidenceScores: {},
  verdict: null,
  confidenceLevel: 0,
  caseProgress: { evidence: 0, witness: 0, argument: 0 },
  activeTab: 'evidence',
};

/* ==================== CASE DATABASE ==================== */
const CASES = {
  theft: {
    id: 'CR-2026-0042',
    title: 'Theft Investigation',
    type: 'Criminal — Theft',
    dateFiled: '2026-03-14',
    parties: 'State v. Derek Morrison',
    status: 'active',
    sessionStatus: 'In Session',
    description: 'A retail store employee is accused of stealing $12,400 from the store safe over a three-month period. Surveillance footage and inventory records are key to the case.',
    category: 'criminal',
    evidence: [
      { id: 'EV-001', title: 'Security Footage', type: 'photo', icon: '\uD83D\uDCF7', description: 'Time-stamped CCTV footage showing the accused near the safe at 2:47 AM on March 3rd and March 17th, outside of scheduled work hours. The footage shows the individual accessing the safe using a key code.', source: 'Store Security System', importance: 'Critical', relevanceScore: 92, authenticityRating: 96, relatedWitnesses: ['W-002'] },
      { id: 'EV-002', title: 'Inventory Logs', type: 'document', icon: '\uD83D\uDCC4', description: 'Digital inventory discrepancy reports from December 2025 to March 2026. Logs show a consistent pattern of $900–$1,400 shortages every 10–14 days, totaling $12,400. All discrepancies occurred on night shifts.', source: 'Store Management System', importance: 'High', relevanceScore: 88, authenticityRating: 90, relatedWitnesses: ['W-001'] },
      { id: 'EV-003', title: 'Time Records', type: 'document', icon: '\uD83D\uDCCB', description: 'Employee time sheets and badge-swipes for the accused. Records show unauthorized after-hours access on 7 occasions matching the dates of the thefts. The employee badge was used at 2:30–3:00 AM on each date.', source: 'HR Department', importance: 'High', relevanceScore: 85, authenticityRating: 94, relatedWitnesses: ['W-001'] },
      { id: 'EV-004', title: 'Bank Statements', type: 'financial', icon: '\uD83C\uDFE6', description: 'Personal bank statements for Derek Morrison showing deposits totaling $5,200 in cash over the last three months, inconsistent with his known income. Deposits range from $800–$1,400 each.', source: 'Financial Records', importance: 'Medium', relevanceScore: 72, authenticityRating: 82, relatedWitnesses: [] },
      { id: 'EV-005', title: 'Email Correspondence', type: 'email', icon: '\u2709\uFE0F', description: 'Internal emails between the store manager and regional supervisor discussing the growing inventory discrepancies. The manager raised concerns two months before the investigation began but was told to monitor the situation.', source: 'Company Email System', importance: 'Medium', relevanceScore: 65, authenticityRating: 78, relatedWitnesses: ['W-001'] },
    ],
    witnesses: [
      { id: 'W-001', name: 'Margaret Chen', occupation: 'Store Manager', relationship: 'Supervisor of the accused', credibility: 88, statement: 'I noticed the discrepancies in November and began tracking them. Derek was the only night shift employee with safe access. When I confronted him, he became defensive and resigned the next day. The timing of the shortages aligns perfectly with his night shifts.', keyClaims: ['Accused had exclusive night access', 'Defensive reaction to confrontation', 'Resigned immediately after'], contradictions: [], supportingEvidence: ['EV-002', 'EV-003', 'EV-005'] },
      { id: 'W-002', name: 'James Ruiz', occupation: 'Security Guard', relationship: 'Night security personnel', credibility: 75, statement: 'I saw Mr. Morrison enter the building after hours on several occasions. He said he was catching up on paperwork. I didn\'t think much of it at the time, but he was always alone and would stay for 20–30 minutes.', keyClaims: ['Observed accused after hours', 'Accused gave explanation each time'], contradictions: ['Unable to confirm what accused did inside'], supportingEvidence: ['EV-001'] },
      { id: 'W-003', name: 'Derek Morrison', occupation: 'Sales Associate', relationship: 'The accused', credibility: 45, statement: 'I was just doing my job. I went in early to prepare for inventory audits. The cash deposits are from my side business selling collectibles online. I have records of those sales. I\'m being made a scapegoat for poor management.', keyClaims: ['After-hours access was for work', 'Cash deposits from legitimate side business', 'Claims innocence'], contradictions: ['Could not provide online sales records during initial investigation', 'Time records show access on dates he denied'], supportingEvidence: [] },
    ],
    arguments: {
      plaintiff: { side: 'prosecution', title: 'Prosecution Argument', content: 'The evidence clearly establishes a pattern: Derek Morrison accessed the store safe after hours on seven occasions, each matching a documented inventory shortage. His bank statements show unexplained cash deposits totaling nearly half the stolen amount. His immediate resignation upon being confronted is strong circumstantial evidence of guilt.' },
      defense: { side: 'defense', title: 'Defense Argument', content: 'The prosecution has not provided direct evidence of theft. No stolen cash was found in Mr. Morrison\'s possession or home. The cash deposits are from a legitimate online collectibles business. His resignation was due to the hostile work environment created by false accusations. The security footage does not show him actually taking money.' },
    },
    verdictOutcomes: {
      guilty: { type: 'Guilty', explanation: 'The preponderance of circumstantial evidence, including after-hours access logs matching theft dates, unexplained cash deposits, and the accused\'s immediate resignation, collectively supports a finding of guilt beyond a reasonable doubt.' },
      notGuilty: { type: 'Not Guilty', explanation: 'While suspicious, the evidence against Mr. Morrison is entirely circumstantial. No direct evidence of theft exists, and his explanation of a side business, while unverified during the initial investigation, provides reasonable doubt.' },
      settlement: { type: 'Settlement Recommended', explanation: 'Given the strength of circumstantial evidence balanced against the lack of direct proof, a settlement involving restitution of $6,200 (half the disputed amount) with no admission of guilt is recommended to avoid protracted litigation.' },
    },
  },

  cyber: {
    id: 'CY-2026-0089',
    title: 'Cyber Fraud',
    type: 'Criminal — Cybercrime',
    dateFiled: '2026-04-01',
    parties: 'State v. Marcus Webb',
    status: 'active',
    sessionStatus: 'Under Review',
    description: 'A sophisticated phishing and identity theft operation targeting elderly banking customers. The suspect allegedly stole over $47,000 from 11 victims using fake banking portals.',
    category: 'criminal',
    evidence: [
      { id: 'EV-101', title: 'IP Access Logs', type: 'document', icon: '\uD83D\uDCD1', description: 'Server logs from the fraudulent banking portal show 847 connections originating from an IP address traced to Marcus Webb\'s residence. The IP was used during 9 of the 11 fraudulent transactions.', source: 'ISP Records / Server Logs', importance: 'Critical', relevanceScore: 95, authenticityRating: 98, relatedWitnesses: ['W-102'] },
      { id: 'EV-102', title: 'Phishing Emails', type: 'email', icon: '\u2709\uFE0F', description: 'Copies of the phishing emails sent to victims, designed to look exactly like First National Bank communications. Domain analysis shows the fake domain was registered anonymously but paid for using a credit card linked to the suspect.', source: 'Victim Email Accounts', importance: 'High', relevanceScore: 88, authenticityRating: 91, relatedWitnesses: ['W-101', 'W-103'] },
      { id: 'EV-103', title: 'Transaction Records', type: 'financial', icon: '\uD83C\uDFE6', description: 'Records of 11 unauthorized transactions ranging from $2,100 to $8,500. All funds were routed through three intermediary accounts before being withdrawn at ATMs in the suspect\'s neighborhood.', source: 'Bank Fraud Division', importance: 'Critical', relevanceScore: 93, authenticityRating: 97, relatedWitnesses: ['W-103'] },
      { id: 'EV-104', title: 'Chat Messages', type: 'message', icon: '\uD83D\uDCAC', description: 'Encrypted chat logs recovered from a seized device showing conversations about "phishing kits" and "carding" techniques. The suspect discusses targeting "elderly marks" with another unidentified individual.', source: 'Digital Forensics', importance: 'High', relevanceScore: 84, authenticityRating: 72, relatedWitnesses: [] },
      { id: 'EV-105', title: 'Device Forensics', type: 'document', icon: '\uD83D\uDCBB', description: 'Forensic examination of the suspect\'s laptop revealed phishing kit templates, a list of 47 potential targets with personal information, and software used to spoof banking websites.', source: 'Cyber Forensics Lab', importance: 'Critical', relevanceScore: 96, authenticityRating: 95, relatedWitnesses: ['W-102'] },
    ],
    witnesses: [
      { id: 'W-101', name: 'Eleanor Hayes', occupation: 'Retired Teacher', relationship: 'Victim', credibility: 82, statement: 'I received an email that looked exactly like my bank\'s. It said my account was compromised and I needed to verify my information. I clicked the link and entered my login details. Two days later, $6,200 was missing from my savings account.', keyClaims: ['Received convincing phishing email', 'Entered credentials on fake site', 'Lost $6,200'], contradictions: [], supportingEvidence: ['EV-102'] },
      { id: 'W-102', name: 'Detective Sarah Okafor', occupation: 'Cyber Crime Detective', relationship: 'Lead investigator', credibility: 94, statement: 'We traced the IP address, followed the money through three accounts, and found the suspect\'s device contained the exact phishing templates used in this operation. The evidence chain is solid — he built the infrastructure, sent the emails, and laundered the money.', keyClaims: ['IP traced to suspect', 'Device contained phishing templates', 'Money trail leads to suspect'], contradictions: [], supportingEvidence: ['EV-101', 'EV-103', 'EV-105'] },
      { id: 'W-103', name: 'Marcus Webb', occupation: 'Freelance Developer', relationship: 'The accused', credibility: 30, statement: 'I didn\'t send those emails. Someone must have spoofed my Wi-Fi. The phishing templates on my laptop were for a security research project I was working on. I was studying cyber security and those were sample files from an online course.', keyClaims: ['Claims Wi-Fi was spoofed', 'Phishing templates were for research', 'Denies all involvement'], contradictions: ['No evidence of Wi-Fi spoofing found', 'No enrollment in any cyber security course could be verified', 'Chat logs show criminal intent'], supportingEvidence: [] },
    ],
    arguments: {
      plaintiff: { side: 'prosecution', title: 'Prosecution Argument', content: 'The defendant built a sophisticated phishing operation, targeted vulnerable elderly victims, and stole nearly $50,000. The digital forensics are conclusive: the IP, the device, the chat logs, and the financial trail all point unequivocally to Marcus Webb.' },
      defense: { side: 'defense', title: 'Defense Argument', content: 'My client is a young man interested in cyber security who kept sample files from his studies. The IP address evidence is circumstantial — unsecured Wi-Fi can be exploited. No witness directly observed Mr. Webb committing these crimes. The prosecution has built a narrative, not a proof.' },
    },
    verdictOutcomes: {
      guilty: { type: 'Guilty', explanation: 'The digital evidence against Mr. Webb is overwhelming. The IP logs, device forensics, financial trail, and incriminating chat messages collectively establish guilt beyond a reasonable doubt. The defense\'s explanations are unsupported by any evidence.' },
      notGuilty: { type: 'Not Guilty', explanation: 'While the circumstantial case is strong, questions about Wi-Fi security and the lack of direct eyewitness testimony create reasonable doubt. The prosecution has not definitively ruled out the possibility that another party used the defendant\'s network.' },
      settlement: { type: 'Settlement Recommended', explanation: 'Given the strength of the digital evidence but acknowledging the complexities of cyber crime prosecution, a plea agreement involving restitution to victims and a reduced charge is recommended.' },
    },
  },

  contract: {
    id: 'CV-2026-0017',
    title: 'Contract Dispute',
    type: 'Civil — Breach of Contract',
    dateFiled: '2026-02-20',
    parties: 'NovaTech Solutions v. Pinnacle Logistics',
    status: 'active',
    sessionStatus: 'Discovery Phase',
    description: 'NovaTech Solutions contracted Pinnacle Logistics for a supply chain integration project. NovaTech claims Pinnacle failed to deliver the agreed-upon system by the contractual deadline, causing $340,000 in lost revenue.',
    category: 'civil',
    evidence: [
      { id: 'EV-201', title: 'Signed Contract', type: 'document', icon: '\uD83D\uDCC4', description: 'The original service agreement between NovaTech Solutions and Pinnacle Logistics, dated June 15, 2025. The contract specifies a delivery date of January 15, 2026, with penalty clauses for late delivery of $5,000 per week.', source: 'NovaTech Records', importance: 'Critical', relevanceScore: 98, authenticityRating: 99, relatedWitnesses: ['W-201', 'W-202'] },
      { id: 'EV-202', title: 'Email Chain', type: 'email', icon: '\u2709\uFE0F', description: '137 emails exchanged between the parties from June 2025 to February 2026. Early emails show optimism; later emails show frustration about missed milestones. Pinnacle cited "unforeseen technical challenges" repeatedly.', source: 'Company Email Servers', importance: 'High', relevanceScore: 85, authenticityRating: 88, relatedWitnesses: ['W-201', 'W-202'] },
      { id: 'EV-203', title: 'Project Timeline', type: 'document', icon: '\uD83D\uDCCB', description: 'The original Gantt chart and project plan showing 7 milestones with deadlines. Only 3 of 7 milestones were met on time. The final deliverable was 8 weeks late. Pinnacle submitted the incomplete system on March 12, 2026.', source: 'Project Management System', importance: 'High', relevanceScore: 90, authenticityRating: 93, relatedWitnesses: ['W-203'] },
      { id: 'EV-204', title: 'Revenue Impact Report', type: 'financial', icon: '\uD83C\uDFE6', description: 'NovaTech\'s financial analysis showing estimated lost revenue of $340,000 due to the delayed system launch. The report projects an additional $120,000 in damages from customer churn attributed to the delay.', source: 'NovaTech Finance Department', importance: 'Medium', relevanceScore: 72, authenticityRating: 65, relatedWitnesses: ['W-201'] },
    ],
    witnesses: [
      { id: 'W-201', name: 'Raj Patel', occupation: 'CEO, NovaTech Solutions', relationship: 'Plaintiff representative', credibility: 80, statement: 'We paid $280,000 for a system that was delivered two months late and incomplete. We lost three major clients because our supply chain visibility was down during the transition. Pinnacle promised us the moon and delivered a rock.', keyClaims: ['System was delivered 8 weeks late', 'System was incomplete at delivery', 'Lost clients due to delay'], contradictions: ['Contract allowed for extension requests (none were formally filed)'], supportingEvidence: ['EV-201', 'EV-204'] },
      { id: 'W-202', name: 'Janet Kowalski', occupation: 'CEO, Pinnacle Logistics', relationship: 'Defendant representative', credibility: 65, statement: 'The scope of the project changed three times after the contract was signed. Each change required additional development time. We communicated every delay. NovaTech\'s own team caused bottlenecks by not providing data access in a timely manner.', keyClaims: ['Scope changed multiple times', 'Delays were communicated', 'NovaTech caused bottlenecks'], contradictions: ['Contract scope changes were never formalized in writing', 'Emails show NovaTech requesting status updates, not causing delays'], supportingEvidence: ['EV-202'] },
      { id: 'W-203', name: 'Dr. Michael Torres', occupation: 'IT Project Management Consultant', relationship: 'Independent expert witness', credibility: 90, statement: 'I reviewed all project documentation. The original timeline was aggressive but achievable. Three scope change requests were made, but none were formally approved. Pinnacle failed to manage their resources effectively, and their development velocity slowed to 30% of the planned rate after month four.', keyClaims: ['Original timeline was achievable', 'Scope changes not formally approved', 'Pinnacle\'s development velocity dropped significantly'], contradictions: [], supportingEvidence: ['EV-202', 'EV-203'] },
    ],
    arguments: {
      plaintiff: { side: 'plaintiff', title: 'NovaTech Solutions\' Argument', content: 'Pinnacle Logistics signed a binding contract with clear deadlines and failed to deliver. The evidence — the contract, the timeline, the emails — all tell the same story. Pinnacle was late, they didn\'t communicate effectively, and our business suffered real, quantifiable damages.' },
      defense: { side: 'defense', title: 'Pinnacle Logistics\' Argument', content: 'The plaintiff\'s constant scope changes and failure to provide timely data access made the original deadlines impossible to meet. We acted in good faith throughout, communicated all delays, and delivered a working system. NovaTech is now trying to blame us for their own operational failures.' },
    },
    verdictOutcomes: {
      guilty: { type: 'Plaintiff Wins', explanation: 'Pinnacle Logistics failed to meet contractual obligations. The signed contract is unambiguous, the missed deadlines are documented, and the scope changes were never formally approved. Pinnacle is liable for breach of contract.' },
      notGuilty: { type: 'Defendant Wins', explanation: 'While Pinnacle was late, NovaTech\'s informal scope changes and data access delays contributed significantly to the missed deadline. The contract\'s penalty clause is enforceable, but NovaTech\'s contributory fault limits Pinnacle\'s liability.' },
      settlement: { type: 'Settlement Recommended', explanation: 'Both parties bear responsibility for the failed project. A settlement involving Pinnacle refunding $140,000 (half the contract value) and NovaTech waiving the penalty clause would provide a fair resolution without further litigation costs.' },
    },
  },

  property: {
    id: 'CV-2026-0033',
    title: 'Property Conflict',
    type: 'Civil — Boundary Dispute',
    dateFiled: '2026-01-28',
    parties: 'Henderson v. Kowalski',
    status: 'active',
    sessionStatus: 'Mediation',
    description: 'A boundary dispute between adjacent residential property owners. The Hendersons claim the Kowalskis have encroached approximately 4 feet onto their property with a fence and landscaping, based on the recorded property deed.',
    category: 'civil',
    evidence: [
      { id: 'EV-301', title: 'Property Deed', type: 'document', icon: '\uD83D\uDCC4', description: 'The original recorded property deed from 1998, including the official property survey and legal description. The deed clearly shows the boundary line running 4 feet behind the current fence location.', source: 'County Recorder\'s Office', importance: 'Critical', relevanceScore: 97, authenticityRating: 100, relatedWitnesses: ['W-303'] },
      { id: 'EV-302', title: 'Fence Photos', type: 'photo', icon: '\uD83D\uDCF7', description: 'Date-stamped photographs showing the fence installation in May 2024. The photos show the fence being built 4 feet onto the Henderson property. A second set of photos from February 2026 confirms the encroachment persists.', source: 'Plaintiff Evidence', importance: 'High', relevanceScore: 88, authenticityRating: 85, relatedWitnesses: ['W-301'] },
      { id: 'EV-303', title: 'Survey Report', type: 'document', icon: '\uD83D\uDCD1', description: 'A licensed surveyor\'s report from January 2026. The survey confirms that the fence, a garden shed, and 18 inches of landscaping are on the Henderson property. The total encroached area is approximately 520 square feet.', source: 'Independent Surveyor', importance: 'Critical', relevanceScore: 96, authenticityRating: 98, relatedWitnesses: ['W-303'] },
    ],
    witnesses: [
      { id: 'W-301', name: 'Robert Henderson', occupation: 'Software Engineer', relationship: 'Plaintiff', credibility: 75, statement: 'We bought our home based on the property lines shown in the deed. Last year, the Kowalskis put up a new fence without discussing it with us. We assumed they knew where the property line was. When we had our own survey done, we discovered they had taken 4 feet of our yard.', keyClaims: ['Fence was built without discussion', 'Survey revealed encroachment', 'Seeks removal of encroachment'], contradictions: ['Did not raise concerns during fence construction', 'Neighbor disputes tree branch removal from previous year'], supportingEvidence: ['EV-301', 'EV-302', 'EV-303'] },
      { id: 'W-302', name: 'Anna Kowalski', occupation: 'Nurse', relationship: 'Defendant', credibility: 55, statement: 'When we moved in three years ago, the previous owners told us that was the property line. The old fence was in the same place. We just replaced it. We\'ve been maintaining that strip of land for years — mowing the grass, planting flowers. If there\'s an encroachment, it existed long before we bought the house.', keyClaims: ['Previous owners indicated that boundary', 'Old fence was in same location', 'Have maintained the land for years'], contradictions: ['Property deed contradicts claimed boundary', 'Previous owners unavailable to verify claim'], supportingEvidence: [] },
      { id: 'W-303', name: 'Linda Park', occupation: 'Licensed Surveyor', relationship: 'Independent expert', credibility: 95, statement: 'I conducted a full boundary survey using the recorded deed, county GIS data, and physical markers. The property line is unambiguous. The fence is 4 feet onto the Henderson property. There is no historical evidence of an earlier fence in this location — aerial photos from 2010 show no fence on this line.', keyClaims: ['Boundary line is unambiguous', 'Encroachment is 4 feet', 'No historical fence existed at that location'], contradictions: [], supportingEvidence: ['EV-301', 'EV-303'] },
    ],
    arguments: {
      plaintiff: { side: 'plaintiff', title: 'Henderson Argument', content: 'The deed, the survey, and the county records all agree: the Kowalski fence is on our property. We are not asking for anything unreasonable — we simply want our property back. The surveyor\'s testimony is clear and uncontradicted.' },
      defense: { side: 'defense', title: 'Kowalski Argument', content: 'We replaced an existing fence in what we reasonably believed was our property. The previous owners confirmed the boundary. If there is an encroachment, it was created by the previous owners, not us. We should at least be compensated for the improvements we\'ve made to the land.' },
    },
    verdictOutcomes: {
      guilty: { type: 'Plaintiff Wins', explanation: 'The evidence is clear and uncontested by any objective measure. The property deed, the independent survey, and the expert testimony all confirm the 4-foot encroachment. The Kowalskis must remove the fence and restore the property.' },
      notGuilty: { type: 'Defendant Wins', explanation: 'While the encroachment exists, the Kowalskis acted in good faith based on information from the previous owners and the existence of a prior fence. They should be allowed to maintain the current boundary with compensation to the Hendersons for the land.' },
      settlement: { type: 'Settlement Recommended', explanation: 'A settlement is strongly recommended. The Hendersons could grant an easement for the current fence line in exchange for fair market value compensation for the encroached land, avoiding costly litigation for both families.' },
    },
  },

  workplace: {
    id: 'HR-2026-0056',
    title: 'Workplace Misconduct',
    type: 'Civil — Harassment',
    dateFiled: '2026-03-01',
    parties: 'Taylor v. Meridian Corp',
    status: 'active',
    sessionStatus: 'Investigation',
    description: 'A senior employee at Meridian Corporation has filed a formal complaint alleging a pattern of harassment and hostile work environment created by a direct supervisor over an 8-month period.',
    category: 'civil',
    evidence: [
      { id: 'EV-401', title: 'HR Complaint Form', type: 'document', icon: '\uD83D\uDCC4', description: 'Formal HR complaint filed by Jordan Taylor on February 28, 2026, detailing 14 specific incidents of harassment, including demeaning comments, public belittling, exclusion from meetings, and two instances of inappropriate physical contact.', source: 'HR Department', importance: 'Critical', relevanceScore: 91, authenticityRating: 83, relatedWitnesses: ['W-401', 'W-402'] },
      { id: 'EV-402', title: 'Message Logs', type: 'message', icon: '\uD83D\uDCAC', description: 'Slack message transcripts between the complainant and supervisor from July 2025 to February 2026. Messages show a pattern of dismissive language, unreasonable demands (sent at 11 PM with 6 AM deadlines), and personal criticism unrelated to work performance.', source: 'Company Communication System', importance: 'High', relevanceScore: 89, authenticityRating: 96, relatedWitnesses: ['W-401', 'W-403'] },
      { id: 'EV-403', title: 'Email Records', type: 'email', icon: '\u2709\uFE0F', description: 'Email correspondence between Taylor and HR showing two informal complaints raised in October 2025 and December 2025. Both were "noted" but no formal investigation was initiated until the February 2026 complaint.', source: 'Company Email System', importance: 'High', relevanceScore: 86, authenticityRating: 94, relatedWitnesses: ['W-402'] },
      { id: 'EV-404', title: 'Performance Reviews', type: 'document', icon: '\uD83D\uDCCB', description: 'Taylor\'s performance reviews from 2023 and 2024 show "exceeds expectations" ratings. A review from January 2026, written by the accused supervisor, rates Taylor as "needs improvement" — the only negative review in 4 years.', source: 'HR Personnel Files', importance: 'Medium', relevanceScore: 74, authenticityRating: 91, relatedWitnesses: ['W-403'] },
    ],
    witnesses: [
      { id: 'W-401', name: 'Jordan Taylor', occupation: 'Senior Analyst', relationship: 'Complainant', credibility: 78, statement: 'For eight months, my supervisor made my work life unbearable. He would criticize me in front of the entire team, send me messages at all hours demanding immediate responses, and physically cornered me in the break room twice. HR did nothing when I raised concerns informally.', keyClaims: ['Pattern of public belittling', 'Unreasonable after-hours demands', 'Two instances of physical intimidation', 'HR failed to act on informal complaints'], contradictions: ['No other team members reported witnessing physical cornering'], supportingEvidence: ['EV-401', 'EV-402', 'EV-403'] },
      { id: 'W-402', name: 'Diane Fletcher', occupation: 'HR Manager', relationship: 'HR representative', credibility: 70, statement: 'We received two informal concerns from Ms. Taylor in late 2025. We spoke to the supervisor informally and advised him to be more mindful of his communication style. He seemed receptive. We didn\'t escalate because Ms. Taylor asked us not to at that time.', keyClaims: ['Informal complaints were received', 'Supervisor was informally counseled', 'Taylor asked for no formal action initially'], contradictions: ['Taylor claims she requested intervention, not just "notation"', 'No documentation of the informal counseling exists'], supportingEvidence: ['EV-403'] },
      { id: 'W-403', name: 'Carlos Mendez', occupation: 'Team Lead (Peer)', relationship: 'Coworker of both parties', credibility: 82, statement: 'I work on the same team. I saw the dynamic. The supervisor was definitely harder on Jordan than on anyone else. He would interrupt her in meetings, dismiss her ideas, and then a few minutes later praise the same idea when someone else said it. The Slack messages he sent after hours were excessive — he didn\'t do that to the rest of us.', keyClaims: ['Supervisor treated Taylor differently', 'Taylor\'s ideas were dismissed and later praised when others said them', 'After-hours messages were excessive and targeted'], contradictions: [], supportingEvidence: ['EV-402', 'EV-404'] },
    ],
    arguments: {
      plaintiff: { side: 'plaintiff', title: 'Taylor\'s Argument', content: 'Meridian Corporation fostered a hostile work environment and failed to act on clear warning signs. The message logs, the performance review retaliation, and the witness testimony all confirm a pattern of harassment that the company had a duty to address.' },
      defense: { side: 'defense', title: 'Meridian Corp\'s Argument', content: 'Meridian Corporation takes all complaints seriously. The informal concerns were addressed, and Ms. Taylor explicitly asked for no formal action at that time. The performance review was based on legitimate observations, and the after-hours messages, while perhaps excessive, are not harassment — they reflect a high-pressure work environment.' },
    },
    verdictOutcomes: {
      guilty: { type: 'Plaintiff Wins', explanation: 'The evidence demonstrates a clear pattern of harassment and a hostile work environment. Meridian Corporation was alerted to the issue twice informally and failed to conduct a proper investigation. The retaliatory performance review and documented message logs substantiate the claim.' },
      notGuilty: { type: 'Defendant Wins', explanation: 'While the supervisor\'s communication style was problematic, it does not meet the legal threshold for harassment. The company addressed the informal complaints, and the performance review, though coinciding with the complaints, has a documented basis in work quality issues.' },
      settlement: { type: 'Settlement Recommended', explanation: 'A settlement is recommended. Meridian Corporation should provide sensitivity training for all staff, revise their harassment reporting procedures, and provide compensation to Ms. Taylor. Both parties would benefit from avoiding the cost and publicity of a trial.' },
    },
  },

  custom: {
    id: 'CS-2026-0001',
    title: 'Custom Case Scenario',
    type: 'User Defined',
    dateFiled: new Date().toISOString().split('T')[0],
    parties: 'Plaintiff v. Defendant',
    status: 'active',
    sessionStatus: 'Pre-Trial',
    description: 'A custom case scenario built by you. Fill in the details below to create your own legal simulation.',
    category: 'civil',
    evidence: [
      { id: 'EV-501', title: 'Custom Evidence 1', type: 'document', icon: '\uD83D\uDCC4', description: 'Describe your first piece of evidence. What is it? Where was it found? Why is it important to the case?', source: 'Your source here', importance: 'Medium', relevanceScore: 50, authenticityRating: 50, relatedWitnesses: [] },
    ],
    witnesses: [
      { id: 'W-501', name: 'Custom Witness', occupation: 'Role', relationship: 'Relationship to case', credibility: 50, statement: 'Write the witness statement here. This should include their account of events, their relationship to the parties, and any relevant observations.', keyClaims: ['Claim 1', 'Claim 2'], contradictions: ['Contradiction if any'], supportingEvidence: ['EV-501'] },
    ],
    arguments: {
      plaintiff: { side: 'plaintiff', title: 'Plaintiff Argument', content: 'Describe the plaintiff\'s case. What are they claiming? What evidence supports their position? What relief are they seeking?' },
      defense: { side: 'defense', title: 'Defense Argument', content: 'Describe the defense\'s case. What is their response to the allegations? What evidence supports their position? What is their requested outcome?' },
    },
    verdictOutcomes: {
      guilty: { type: 'Plaintiff Wins', explanation: 'The plaintiff has proven their case by the applicable standard. The evidence and testimony support a finding in their favor.' },
      notGuilty: { type: 'Defendant Wins', explanation: 'The plaintiff has failed to meet their burden of proof. The evidence does not sufficiently support the claims made against the defendant.' },
      settlement: { type: 'Settlement Recommended', explanation: 'Both parties have viable arguments. A negotiated settlement is recommended to avoid the cost and uncertainty of litigation.' },
    },
  },
};

/* ==================== DOM REFS ==================== */
const $ = (id) => document.getElementById(id);
const dom = {
  caseSelect: $('caseSelect'),
  overviewCard: $('overviewCard'),
  ovCaseId: $('ovCaseId'),
  ovCaseType: $('ovCaseType'),
  ovDateFiled: $('ovDateFiled'),
  ovStatus: $('ovStatus'),
  ovParties: $('ovParties'),
  evidenceGrid: $('evidenceGrid'),
  evidenceCount: $('evidenceCount'),
  trialCaseName: $('trialCaseName'),
  trialCaseId: $('trialCaseId'),
  sessionStatus: $('sessionStatus'),
  confidenceValue: $('confidenceValue'),
  placeholderPrompt: $('placeholderPrompt'),
  caseContent: $('caseContent'),
  evidenceDetail: $('evidenceDetail'),
  witnessList: $('witnessList'),
  argumentsList: $('argumentsList'),
  verdictMeter: $('verdictMeter'),
  meterFill: $('meterFill'),
  meterPct: $('meterPct'),
  btnGuilty: $('btnGuilty'),
  btnInnocent: $('btnInnocent'),
  btnSettlement: $('btnSettlement'),
  judicialSummary: $('judicialSummary'),
  summaryFindings: $('summaryFindings'),
  summaryEvidence: $('summaryEvidence'),
  summaryWitnesses: $('summaryWitnesses'),
  summaryVerdict: $('summaryVerdict'),
  btnExport: $('btnExport'),
  verdictOverlay: $('verdictOverlay'),
  modalIcon: $('modalIcon'),
  modalType: $('modalType'),
  modalConfidence: $('modalConfidence'),
  modalExplanation: $('modalExplanation'),
  modalClose: $('modalClose'),
  progEvidence: $('progEvidence'),
  progWitness: $('progWitness'),
  progArgument: $('progArgument'),
  progEvidenceFill: $('progEvidenceFill'),
  progWitnessFill: $('progWitnessFill'),
  progArgumentFill: $('progArgumentFill'),
};

/* ==================== EVIDENCE ENGINE ==================== */
const evidenceEngine = {
  calculateScore(evidence, witnesses) {
    const base = evidence.relevanceScore * 0.5 + evidence.authenticityRating * 0.3;
    const related = evidence.relatedWitnesses.length > 0
      ? witnesses
          .filter(w => evidence.relatedWitnesses.includes(w.id))
          .reduce((sum, w) => sum + w.credibility, 0) / evidence.relatedWitnesses.length * 0.2
      : 0;
    return Math.round(Math.min(100, base + related));
  },

  detectContradictions(evidenceList, witnesses) {
    const contradictions = [];
    for (const witness of witnesses) {
      if (witness.contradictions && witness.contradictions.length > 0) {
        contradictions.push({
          witness: witness.name,
          issues: witness.contradictions,
        });
      }
    }
    return contradictions;
  },

  getImportanceWeight(importance) {
    const weights = { Critical: 1.0, High: 0.75, Medium: 0.5, Low: 0.25 };
    return weights[importance] || 0.5;
  },
};

/* ==================== WITNESS ANALYSIS ENGINE ==================== */
const witnessEngine = {
  calculateCredibility(witness, evidenceList) {
    const hasSupporting = witness.supportingEvidence.length > 0;
    const evidenceSupport = hasSupporting
      ? witness.supportingEvidence.filter(eid => evidenceList.some(e => e.id === eid)).length / Math.max(1, witness.supportingEvidence.length)
      : 0;

    const contradictionPenalty = witness.contradictions.length > 0
      ? Math.min(30, witness.contradictions.length * 10)
      : 0;

    const baseCredibility = witness.credibility;
    const evidenceBonus = evidenceSupport * 15;
    const finalCred = Math.round(Math.max(0, Math.min(100, baseCredibility + evidenceBonus - contradictionPenalty)));

    let rating;
    if (finalCred >= 75) rating = 'High';
    else if (finalCred >= 45) rating = 'Medium';
    else rating = 'Low';

    return { score: finalCred, rating, hasSupporting };
  },
};

/* ==================== VERDICT ENGINE ==================== */
const verdictEngine = {
  calculate(caseData) {
    const evidenceScores = caseData.evidence.map(e =>
      evidenceEngine.calculateScore(e, caseData.witnesses)
    );
    const avgEvidenceScore = evidenceScores.length > 0
      ? evidenceScores.reduce((a, b) => a + b, 0) / evidenceScores.length
      : 0;

    const witnessData = caseData.witnesses.map(w =>
      witnessEngine.calculateCredibility(w, caseData.evidence)
    );
    const avgWitnessCred = witnessData.length > 0
      ? witnessData.reduce((a, b) => a + b.score, 0) / witnessData.length
      : 0;

    const contradictionCount = evidenceEngine.detectContradictions(caseData.evidence, caseData.witnesses).length;

    const evidenceWeight = avgEvidenceScore * 0.55;
    const witnessWeight = avgWitnessCred * 0.35;
    const contradictionPenalty = Math.min(15, contradictionCount * 5);
    const finalConfidence = Math.round(Math.max(0, Math.min(100, evidenceWeight + witnessWeight - contradictionPenalty)));

    return {
      confidence: finalConfidence,
      avgEvidenceScore: Math.round(avgEvidenceScore),
      avgWitnessCred: Math.round(avgWitnessCred),
      evidenceWeight: Math.round(evidenceWeight),
      witnessWeight: Math.round(witnessWeight),
      contradictionCount,
      evidenceScores,
      witnessData,
    };
  },

  determineVerdict(confidence, caseData) {
    const outcomes = caseData.verdictOutcomes;
    if (confidence >= 65) return { type: outcomes.guilty.type, explanation: outcomes.guilty.explanation, icon: '\u2696\uFE0F' };
    if (confidence >= 40) return { type: outcomes.settlement.type, explanation: outcomes.settlement.explanation, icon: '\u2696\uFE0F' };
    return { type: outcomes.notGuilty.type, explanation: outcomes.notGuilty.explanation, icon: '\u2696\uFE0F' };
  },
};

/* ==================== UI RENDER FUNCTIONS ==================== */
function renderOverview(caseData) {
  if (!caseData) return;
  dom.ovCaseId.textContent = caseData.id;
  dom.ovCaseType.textContent = caseData.type;
  dom.ovDateFiled.textContent = caseData.dateFiled;
  dom.ovParties.textContent = caseData.parties;

  const statusEl = dom.ovStatus;
  statusEl.textContent = caseData.status === 'active' ? 'Active' : 'Closed';
  statusEl.className = 'status-badge ' + (caseData.status === 'active' ? 'active' : 'closed');

  dom.trialCaseName.textContent = caseData.title;
  dom.trialCaseId.textContent = caseData.id;
  dom.sessionStatus.textContent = caseData.sessionStatus || 'Standing By';
}

function renderEvidenceGrid(caseData) {
  const grid = dom.evidenceGrid;
  const countEl = dom.evidenceCount;
  if (!caseData || !caseData.evidence.length) {
    grid.innerHTML = '<div class="placeholder-prompt" style="padding: 20px; grid-column: 1 / -1;"><p>No evidence available.</p></div>';
    countEl.textContent = '0/0';
    return;
  }

  const total = caseData.evidence.length;
  const reviewed = state.reviewedEvidence.filter(eid => caseData.evidence.some(e => e.id === eid)).length;
  countEl.textContent = `${reviewed}/${total}`;

  grid.innerHTML = caseData.evidence.map(ev => {
    const isReviewed = state.reviewedEvidence.includes(ev.id);
    const isSelected = state.selectedEvidence === ev.id;
    return `
      <div class="evidence-card ${isSelected ? 'selected' : ''} ${isReviewed ? 'reviewed' : ''}"
           role="listitem"
           tabindex="0"
           data-ev-id="${ev.id}"
           aria-label="Evidence ${ev.id}: ${ev.title}, relevance ${ev.relevanceScore}%">
        <div class="ev-icon" aria-hidden="true">${ev.icon}</div>
        <div class="ev-title">${ev.title}</div>
        <div class="ev-meta">${ev.id} &middot; ${ev.type}</div>
        <div class="ev-relevance">Relevance: ${ev.relevanceScore}%</div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.evidence-card').forEach(card => {
    card.addEventListener('click', () => selectEvidence(card.dataset.evId, caseData));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectEvidence(card.dataset.evId, caseData);
      }
    });
  });
}

function selectEvidence(evId, caseData) {
  state.selectedEvidence = evId;
  if (!state.reviewedEvidence.includes(evId)) {
    state.reviewedEvidence.push(evId);
  }

  const ev = caseData.evidence.find(e => e.id === evId);
  if (!ev) return;

  const relatedWitnesses = ev.relatedWitnesses
    .map(wid => caseData.witnesses.find(w => w.id === wid))
    .filter(Boolean)
    .map(w => w.name);

  const engineScore = evidenceEngine.calculateScore(ev, caseData.witnesses);

  dom.evidenceDetail.innerHTML = `
    <div class="ev-header">
      <div>
        <div class="ev-title-lg">${ev.title}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${ev.id} &middot; ${ev.type} &middot; Source: ${ev.source}</div>
      </div>
      <span class="ev-badge">${ev.importance}</span>
    </div>
    <div class="ev-description">${ev.description}</div>
    ${relatedWitnesses.length > 0 ? `<div style="font-size:12px;color:var(--text-accent);margin-bottom:16px;">Related Witnesses: ${relatedWitnesses.join(', ')}</div>` : ''}
    <div class="ev-stats">
      <div class="ev-stat stat-highlight gold">
        <div class="stat-value">${engineScore}%</div>
        <div class="stat-label">Impact Score</div>
      </div>
      <div class="ev-stat stat-highlight blue">
        <div class="stat-value">${ev.relevanceScore}%</div>
        <div class="stat-label">Relevance</div>
      </div>
      <div class="ev-stat stat-highlight green">
        <div class="stat-value">${ev.authenticityRating}%</div>
        <div class="stat-label">Authenticity</div>
      </div>
    </div>`;

  renderEvidenceGrid(caseData);
  updateProgress(caseData);
  updateConfidence(caseData);
}

function renderWitnesses(caseData) {
  const list = dom.witnessList;
  if (!caseData || !caseData.witnesses.length) {
    list.innerHTML = '<div class="placeholder-prompt" style="padding: 30px 20px;"><p>No witnesses available for this case.</p></div>';
    return;
  }

  list.innerHTML = caseData.witnesses.map(w => {
    const cred = witnessEngine.calculateCredibility(w, caseData.evidence);
    const credClass = cred.rating === 'High' ? 'cred-high' : cred.rating === 'Medium' ? 'cred-medium' : 'cred-low';
    const avatarColors = ['blue', 'purple', 'gold', 'green'];
    const avatarColor = avatarColors[caseData.witnesses.indexOf(w) % avatarColors.length];

    return `
      <div class="witness-card" tabindex="0" data-w-id="${w.id}" role="article" aria-label="Witness: ${w.name}">
        <div class="witness-header">
          <div class="witness-avatar ${avatarColor}" aria-hidden="true">${w.name.charAt(0)}</div>
          <div class="witness-info">
            <div class="witness-name">${w.name}</div>
            <div class="witness-role">${w.occupation} &middot; ${w.relationship}</div>
          </div>
          <div class="witness-cred ${credClass}">${cred.rating} (${cred.score}%)</div>
        </div>
        <div class="witness-statement ${credClass}">${w.statement}</div>
        ${w.keyClaims.length > 0 ? `
          <div style="margin-top:8px;font-size:12px;color:var(--text-accent);">
            <strong>Key Claims:</strong> ${w.keyClaims.join(' &middot; ')}
          </div>` : ''}
        ${w.contradictions.length > 0 ? `
          <div style="margin-top:4px;font-size:12px;color:var(--red);">
            <strong>Contradictions:</strong> ${w.contradictions.join(' &middot; ')}
          </div>` : ''}
      </div>`;
  }).join('');

  list.querySelectorAll('.witness-card').forEach(card => {
    card.addEventListener('click', () => {
      const wid = card.dataset.wId;
      if (!state.interviewedWitnesses.includes(wid)) {
        state.interviewedWitnesses.push(wid);
      }
      card.classList.toggle('selected');
      updateProgress(caseData);
      updateConfidence(caseData);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function renderArguments(caseData) {
  const list = dom.argumentsList;
  if (!caseData || !caseData.arguments) {
    list.innerHTML = '<div class="placeholder-prompt" style="padding: 30px 20px;"><p>No arguments available for this case.</p></div>';
    return;
  }

  state.caseProgress.argument = 2;

  list.innerHTML = Object.values(caseData.arguments).map(arg => `
    <div class="argument-card">
      <div class="argument-side ${arg.side}">${arg.title}</div>
      <div class="argument-text">${arg.content}</div>
    </div>`).join('');

  updateProgress(caseData);
}

function updateConfidence(caseData) {
  if (!caseData) return;

  const reviewedCount = state.reviewedEvidence.filter(eid => caseData.evidence.some(e => e.id === eid)).length;
  const interviewedCount = state.interviewedWitnesses.filter(wid => caseData.witnesses.some(w => w.id === wid)).length;
  const argsReviewed = state.caseProgress.argument;

  const minEvidence = Math.min(1, caseData.evidence.length);
  const minWitness = Math.min(1, caseData.witnesses.length);

  if (reviewedCount < minEvidence || interviewedCount < minWitness || argsReviewed < 1) {
    dom.confidenceValue.textContent = '0%';
    dom.confidenceValue.className = 'confidence-value low';
    dom.meterPct.textContent = '0%';
    dom.meterFill.style.strokeDashoffset = '326.73';
    dom.btnGuilty.disabled = true;
    dom.btnInnocent.disabled = true;
    dom.btnSettlement.disabled = true;
    dom.judicialSummary.classList.remove('visible');
    return;
  }

  const analysis = verdictEngine.calculate(caseData);
  state.confidenceLevel = analysis.confidence;

  dom.confidenceValue.textContent = analysis.confidence + '%';
  dom.confidenceValue.className = 'confidence-value ' + (
    analysis.confidence >= 65 ? 'high' : analysis.confidence >= 40 ? 'medium' : 'low'
  );

  const circumference = 326.73;
  const offset = circumference - (analysis.confidence / 100) * circumference;
  dom.meterFill.style.strokeDashoffset = offset;
  dom.meterPct.textContent = analysis.confidence + '%';

  const meterColor = analysis.confidence >= 65 ? '#22c55e' : analysis.confidence >= 40 ? '#d4a017' : '#ef4444';
  dom.meterFill.setAttribute('stroke', meterColor);

  dom.btnGuilty.disabled = false;
  dom.btnInnocent.disabled = false;
  dom.btnSettlement.disabled = false;
}

function updateProgress(caseData) {
  if (!caseData) return;

  const evTotal = caseData.evidence.length;
  const evReviewed = state.reviewedEvidence.filter(eid => caseData.evidence.some(e => e.id === eid)).length;
  const witTotal = caseData.witnesses.length;
  const witInterviewed = state.interviewedWitnesses.filter(wid => caseData.witnesses.some(w => w.id === wid)).length;
  const argProgress = state.caseProgress.argument;

  dom.progEvidence.textContent = `${evReviewed} / ${evTotal}`;
  dom.progEvidenceFill.style.width = `${evTotal > 0 ? (evReviewed / evTotal) * 100 : 0}%`;

  dom.progWitness.textContent = `${witInterviewed} / ${witTotal}`;
  dom.progWitnessFill.style.width = `${witTotal > 0 ? (witInterviewed / witTotal) * 100 : 0}%`;

  dom.progArgument.textContent = `${argProgress} / 2`;
  dom.progArgumentFill.style.width = `${(argProgress / 2) * 100}%`;
}

/* ==================== VERDICT HANDLERS ==================== */
function renderVerdict(verdictType, caseData) {
  const analysis = verdictEngine.calculate(caseData);
  const verdictResult = caseData.verdictOutcomes[verdictType];

  if (!verdictResult) return;

  const colorClass = verdictType === 'guilty' ? 'guilty' : verdictType === 'notGuilty' ? 'innocent' : 'settlement';
  const icon = verdictType === 'guilty' ? '\u26A1' : verdictType === 'notGuilty' ? '\u2728' : '\u2696\uFE0F';

  dom.modalIcon.textContent = icon;
  dom.modalType.textContent = verdictResult.type;
  dom.modalType.className = 'verdict-type ' + colorClass;
  dom.modalConfidence.textContent = `Confidence: ${analysis.confidence}%`;
  dom.modalExplanation.textContent = verdictResult.explanation;
  dom.verdictOverlay.classList.add('visible');

  state.verdict = verdictResult.type;

  dom.summaryFindings.textContent = `After reviewing all available evidence, witness testimony, and arguments presented in ${caseData.title}, the court finds the following:`;
  dom.summaryEvidence.innerHTML = caseData.evidence
    .filter(e => state.reviewedEvidence.includes(e.id))
    .slice(0, 4)
    .map(e => `<li>${e.title} (${e.id}) — ${e.importance} importance, relevance score ${e.relevanceScore}%</li>`)
    .join('') || '<li>No evidence was reviewed.</li>';

  dom.summaryWitnesses.innerHTML = caseData.witnesses
    .filter(w => state.interviewedWitnesses.includes(w.id))
    .slice(0, 3)
    .map(w => {
      const cred = witnessEngine.calculateCredibility(w, caseData.evidence);
      return `<li>${w.name} — ${w.occupation}, credibility: ${cred.rating} (${cred.score}%)</li>`;
    }).join('') || '<li>No witnesses were interviewed.</li>';

  dom.summaryVerdict.innerHTML = `<strong>${verdictResult.type}</strong> — ${verdictResult.explanation}`;

  dom.judicialSummary.classList.add('visible');
}

/* ==================== EXPORT ==================== */
function exportReport(caseData) {
  if (!caseData || !state.verdict) return;

  const report = {
    exportedAt: new Date().toISOString(),
    caseSummary: {
      id: caseData.id,
      title: caseData.title,
      type: caseData.type,
      dateFiled: caseData.dateFiled,
      parties: caseData.parties,
      status: caseData.status,
    },
    evidenceReviewed: state.reviewedEvidence
      .filter(eid => caseData.evidence.some(e => e.id === eid))
      .map(eid => {
        const ev = caseData.evidence.find(e => e.id === eid);
        return {
          id: ev.id,
          title: ev.title,
          type: ev.type,
          relevanceScore: ev.relevanceScore,
          authenticityRating: ev.authenticityRating,
          impactScore: evidenceEngine.calculateScore(ev, caseData.witnesses),
        };
      }),
    witnessAnalysis: state.interviewedWitnesses
      .filter(wid => caseData.witnesses.some(w => w.id === wid))
      .map(wid => {
        const w = caseData.witnesses.find(wi => wi.id === wid);
        const cred = witnessEngine.calculateCredibility(w, caseData.evidence);
        return {
          name: w.name,
          occupation: w.occupation,
          credibilityScore: cred.score,
          credibilityRating: cred.rating,
          keyClaims: w.keyClaims,
          contradictions: w.contradictions,
        };
      }),
    verdict: {
      type: state.verdict,
      confidenceLevel: state.confidenceLevel + '%',
      timestamp: new Date().toISOString(),
    },
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `case-report-${caseData.id}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ==================== TAB SWITCHING ==================== */
function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabId ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  });
}

/* ==================== CASE LOADING ==================== */
function loadCase(caseId) {
  if (!caseId) {
    dom.placeholderPrompt.style.display = 'flex';
    dom.caseContent.style.display = 'none';
    dom.evidenceGrid.innerHTML = '<div class="placeholder-prompt" style="padding: 20px; grid-column: 1 / -1;"><p>Select a case to view evidence</p></div>';
    dom.evidenceCount.textContent = '0/0';
    state.selectedCase = null;
    return;
  }

  const caseData = CASES[caseId];
  if (!caseData) return;

  state.selectedCase = caseData;
  state.reviewedEvidence = [];
  state.selectedEvidence = null;
  state.interviewedWitnesses = [];
  state.verdict = null;
  state.confidenceLevel = 0;
  state.caseProgress = { evidence: 0, witness: 0, argument: 0 };

  dom.placeholderPrompt.style.display = 'none';
  dom.caseContent.style.display = 'flex';
  dom.caseContent.style.flexDirection = 'column';
  dom.caseContent.style.flex = '1';
  dom.judicialSummary.classList.remove('visible');

  renderOverview(caseData);
  renderEvidenceGrid(caseData);
  renderWitnesses(caseData);
  renderArguments(caseData);
  updateProgress(caseData);
  updateConfidence(caseData);

  if (caseId === 'custom') {
    setupCustomCaseEditor();
  } else {
    dom.evidenceDetail.innerHTML = `<div class="placeholder-prompt" style="padding: 30px 20px;">
      <h3>Select Evidence</h3>
      <p>Click on an evidence item from the left panel to examine it in detail.</p>
    </div>`;
  }

  dom.confidenceValue.textContent = '0%';
  dom.confidenceValue.className = 'confidence-value low';
  dom.meterPct.textContent = '0%';
  dom.meterFill.style.strokeDashoffset = '326.73';

  switchTab('evidence');
}

/* ==================== CUSTOM CASE EDITOR ==================== */
function setupCustomCaseEditor() {
  const caseData = CASES.custom;

  let editHTML = `
    <div style="background:var(--bg-glass);border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px;">
      <h3 style="font-size:14px;color:var(--gold);margin-bottom:12px;">Custom Case Builder</h3>
      <div style="display:grid;gap:12px;">
        <div>
          <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px;">Case Title</label>
          <input id="ccTitle" value="Custom Case Scenario" style="width:100%;padding:8px 12px;background:var(--bg-tertiary);color:var(--text-heading);border:1px solid var(--border-color);border-radius:6px;font-size:13px;">
        </div>
        <div>
          <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px;">Parties (e.g., Plaintiff v. Defendant)</label>
          <input id="ccParties" value="Plaintiff v. Defendant" style="width:100%;padding:8px 12px;background:var(--bg-tertiary);color:var(--text-heading);border:1px solid var(--border-color);border-radius:6px;font-size:13px;">
        </div>
        <div>
          <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px;">Case Description</label>
          <textarea id="ccDesc" rows="3" style="width:100%;padding:8px 12px;background:var(--bg-tertiary);color:var(--text-heading);border:1px solid var(--border-color);border-radius:6px;font-size:13px;resize:vertical;font-family:inherit;">A custom case scenario built by you.</textarea>
        </div>
        <div>
          <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px;">Category</label>
          <select id="ccCategory" style="width:100%;padding:8px 12px;background:var(--bg-tertiary);color:var(--text-heading);border:1px solid var(--border-color);border-radius:6px;font-size:13px;">
            <option value="civil">Civil</option>
            <option value="criminal">Criminal</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;margin-top:4px;">
          <button id="ccAddEvidence" style="flex:1;padding:8px;background:var(--gold-glow);color:var(--gold);border:1px solid var(--gold);border-radius:6px;cursor:pointer;font-size:12px;">+ Add Evidence Item</button>
          <button id="ccAddWitness" style="flex:1;padding:8px;background:var(--blue-dim);color:var(--blue);border:1px solid var(--blue);border-radius:6px;cursor:pointer;font-size:12px;">+ Add Witness</button>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="ccSave" style="flex:2;padding:10px;background:transparent;color:var(--green);border:1px solid var(--green);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">Apply Custom Case</button>
          <button id="ccReset" style="flex:1;padding:10px;background:transparent;color:var(--text-muted);border:1px solid var(--border-color);border-radius:6px;cursor:pointer;font-size:13px;">Reset</button>
        </div>
      </div>
    </div>`;

  dom.evidenceDetail.innerHTML = editHTML;

  $('ccAddEvidence').addEventListener('click', () => {
    caseData.evidence.push({
      id: 'EV-' + (501 + caseData.evidence.length),
      title: 'New Evidence',
      type: 'document',
      icon: '\uD83D\uDCC4',
      description: 'Describe this evidence item.',
      source: 'Source',
      importance: 'Medium',
      relevanceScore: 50,
      authenticityRating: 50,
      relatedWitnesses: [],
    });
    loadCase('custom');
  });

  $('ccAddWitness').addEventListener('click', () => {
    caseData.witnesses.push({
      id: 'W-' + (501 + caseData.witnesses.length),
      name: 'New Witness',
      occupation: 'Role',
      relationship: 'Relationship',
      credibility: 50,
      statement: 'Enter witness statement here.',
      keyClaims: ['Claim'],
      contradictions: [],
      supportingEvidence: [],
    });
    loadCase('custom');
  });

  $('ccSave').addEventListener('click', () => {
    caseData.title = $('ccTitle').value || 'Custom Case';
    caseData.parties = $('ccParties').value || 'Plaintiff v. Defendant';
    caseData.description = $('ccDesc').value || 'A custom case scenario.';
    caseData.category = $('ccCategory').value;
    caseData.type = caseData.category === 'criminal' ? 'Criminal — Custom' : 'Civil — Custom';
    loadCase('custom');
  });

  $('ccReset').addEventListener('click', () => {
    CASES.custom = {
      id: 'CS-2026-0001',
      title: 'Custom Case Scenario',
      type: 'User Defined',
      dateFiled: new Date().toISOString().split('T')[0],
      parties: 'Plaintiff v. Defendant',
      status: 'active',
      sessionStatus: 'Pre-Trial',
      description: 'A custom case scenario built by you.',
      category: 'civil',
      evidence: [{ id: 'EV-501', title: 'Custom Evidence 1', type: 'document', icon: '\uD83D\uDCC4', description: 'Describe your first piece of evidence.', source: 'Your source here', importance: 'Medium', relevanceScore: 50, authenticityRating: 50, relatedWitnesses: [] }],
      witnesses: [{ id: 'W-501', name: 'Custom Witness', occupation: 'Role', relationship: 'Relationship to case', credibility: 50, statement: 'Write the witness statement here.', keyClaims: ['Claim 1', 'Claim 2'], contradictions: ['Contradiction if any'], supportingEvidence: ['EV-501'] }],
      arguments: {
        plaintiff: { side: 'plaintiff', title: 'Plaintiff Argument', content: 'Describe the plaintiff\'s case.' },
        defense: { side: 'defense', title: 'Defense Argument', content: 'Describe the defense\'s case.' },
      },
      verdictOutcomes: {
        guilty: { type: 'Plaintiff Wins', explanation: 'The plaintiff has proven their case.' },
        notGuilty: { type: 'Defendant Wins', explanation: 'The plaintiff has failed to meet their burden of proof.' },
        settlement: { type: 'Settlement Recommended', explanation: 'A negotiated settlement is recommended.' },
      },
    };
    loadCase('custom');
  });
}

/* ==================== EVENT BINDING ==================== */
dom.caseSelect.addEventListener('change', (e) => {
  loadCase(e.target.value);
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

dom.btnGuilty.addEventListener('click', () => {
  if (state.selectedCase) renderVerdict('guilty', state.selectedCase);
});

dom.btnInnocent.addEventListener('click', () => {
  if (state.selectedCase) renderVerdict('notGuilty', state.selectedCase);
});

dom.btnSettlement.addEventListener('click', () => {
  if (state.selectedCase) renderVerdict('settlement', state.selectedCase);
});

dom.btnExport.addEventListener('click', () => {
  if (state.selectedCase) exportReport(state.selectedCase);
});

dom.modalClose.addEventListener('click', () => {
  dom.verdictOverlay.classList.remove('visible');
});

dom.verdictOverlay.addEventListener('click', (e) => {
  if (e.target === dom.verdictOverlay) {
    dom.verdictOverlay.classList.remove('visible');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dom.verdictOverlay.classList.remove('visible');
  }
});

/* ==================== INIT ==================== */
loadCase(null);

console.log('%c Court Case Simulator %c Loaded successfully ',
  'background:#0b1120;color:#d4a017;font-size:16px;font-weight:bold;padding:8px 12px;',
  'background:#1e3a5f;color:#f8fafc;padding:8px 12px;');
console.log('Available cases:', Object.keys(CASES));
console.log('State:', state);
