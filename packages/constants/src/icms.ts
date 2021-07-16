// data originating from api-job

export const EMPLOYMENT_TYPES = [
  {id: 440002, employmentType: 'Part Time'},
  {id: 440003, employmentType: 'Permanent'},
  {id: 440004, employmentType: 'Temporary'},
  {id: 440005, employmentType: 'Contract'},
  {id: 440006, employmentType: 'Freelance'},
  {id: 440007, employmentType: 'Full Time'},
  {id: 440008, employmentType: 'Flexi work'},
  {id: 440009, employmentType: 'Internship'},
];

export const POSITION_LEVELS = [
  {id: 357009, position: 'Senior Executive'},
  {id: 357008, position: 'Junior Executive'},
  {id: 357007, position: 'Non-executive'},
  {id: 357003, position: 'Manager'},
  {id: 357006, position: 'Executive'},
  {id: 357004, position: 'Fresh/entry level'},
  {id: 357005, position: 'Professional'},
  {id: 357002, position: 'Middle Management'},
  {id: 357001, position: 'Senior Management'},
];

export const JOB_CATEGORIES = [
  {id: 532010, category: 'Customer Service'},
  {id: 532022, category: 'Information Technology'},
  {id: 532042, category: 'Travel / Tourism'},
  {id: 532002, category: 'Admin / Secretarial'},
  {id: 532008, category: 'Building and Construction'},
  {id: 532012, category: 'Education and Training'},
  {id: 532038, category: 'Sales / Retail'},
  {id: 532030, category: 'Others'},
  {id: 532035, category: 'Real Estate / Property Management'},
  {id: 532013, category: 'Engineering'},
  {id: 532003, category: 'Advertising / Media'},
  {id: 532016, category: 'Events / Promotions'},
  {id: 532028, category: 'Marketing / Public Relations'},
  {id: 532011, category: 'Design'},
  {id: 532033, category: 'Public / Civil Service'},
  {id: 532001, category: 'Accounting / Auditing / Taxation'},
  {id: 532021, category: 'Human Resources'},
  {id: 532039, category: 'Sciences / Laboratory / R&D'},
  {id: 532031, category: 'Personal Care / Beauty'},
  {id: 532025, category: 'Logistics / Supply Chain'},
  {id: 532019, category: 'Healthcare / Pharmaceutical'},
  {id: 532017, category: 'F&B'},
  {id: 532029, category: 'Medical / Therapy Services'},
  {id: 532005, category: 'Consulting'},
  {id: 532006, category: 'Risk Management'},
  {id: 532032, category: 'Professional Services'},
  {id: 532023, category: 'Insurance'},
  {id: 532041, category: 'Telecommunications'},
  {id: 532009, category: 'Social Services'},
  {id: 532040, category: 'Security and Investigation'},
  {id: 532026, category: 'General Management'},
  {id: 532027, category: 'Manufacturing'},
  {id: 532007, category: 'Banking and Finance'},
  {id: 532020, category: 'Hospitality'},
  {id: 532018, category: 'General Work'},
  {id: 532036, category: 'Repair and Maintenance'},
  {id: 532004, category: 'Architecture / Interior Design'},
  {id: 532015, category: 'Environment / Health'},
  {id: 532034, category: 'Purchasing / Merchandising'},
  {id: 532024, category: 'Legal'},
  {id: 532014, category: 'Entertainment'},
  {id: 532043, category: 'Wholesale Trade'},
];

export const SCHEMES = [
  {id: 541001, scheme: 'CSP'},
  {id: 541002, scheme: 'PCP'},
  {id: 541003, scheme: 'P-Max'},
  {id: 541005, scheme: 'Career Trial'},
  {id: 541006, scheme: 'SGUnited Traineeships'},
  {id: 541007, scheme: 'SGUnited Mid-Career Pathways Programme'},
];

export const JOB_STATUSES = [
  {id: 9, status: 'Closed'},
  {id: 83, status: 'Draft'},
  {id: 102, status: 'Open'},
  {id: 103, status: 'Re-open'},
];

export enum JOB_STATUS {
  CLOSED = 9,
  DRAFT = 83,
  OPEN = 102,
  REOPEN = 103,
};

export const DISTRICTS = [
  {
    id: 1,
    region: 'Central',
  },
  {
    id: 2,
    region: 'Central',
  },
  {
    id: 3,
    region: 'South',
  },
  {
    id: 4,
    region: 'South',
  },
  {
    id: 5,
    region: 'South',
  },
  {
    id: 6,
    region: 'East',
  },
  {
    id: 7,
    region: 'East',
  },
  {
    id: 8,
    region: 'Central',
  },
  {
    id: 9,
    region: 'Central',
  },
  {
    id: 10,
    region: 'Central',
  },
  {
    id: 11,
    region: 'Central',
  },
  {
    id: 12,
    region: 'Central',
  },
  {
    id: 13,
    region: 'Central',
  },
  {
    id: 14,
    region: 'East',
  },
  {
    id: 15,
    region: 'East',
  },
  {
    id: 16,
    region: 'East',
  },
  {
    id: 17,
    region: 'East',
  },
  {
    id: 18,
    region: 'East',
  },
  {
    id: 19,
    region: 'North',
  },
  {
    id: 20,
    region: 'North',
  },
  {
    id: 21,
    region: 'West',
  },
  {
    id: 22,
    region: 'West',
  },
  {
    id: 23,
    region: 'West',
  },
  {
    id: 24,
    region: 'West',
  },
  {
    id: 25,
    region: 'North',
  },
  {
    id: 26,
    region: 'North',
  },
  {
    id: 27,
    region: 'North',
  },
  {
    id: 28,
    region: 'North',
  },
  {
    id: 9999,
    region: 'Islandwide',
  },
];
