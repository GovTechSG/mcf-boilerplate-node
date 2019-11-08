// data used by MCF PRODUCT, following the specific order required by UIs

import {flow, remove} from 'lodash';
import {
  COMPANY_REGISTRATION_TYPES as MSF_COMPANY_REGISTRATION_TYPES,
  COUNTRIES as MSF_COUNTRIES,
  DISTRICTS as MSF_DISTRICTS,
  EMPLOYMENT_TYPES as MSF_EMPLOYMENT_TYPES,
  JOB_CATEGORIES as MSF_JOB_CATEGORIES,
  JOB_STATUSES as MSF_JOB_STATUSES,
  POSITION_LEVELS as MSF_POSITION_LEVELS,
  SALARY_TYPES as MSF_SALARY_TYPES,
} from './msf';
import {mapMcfToIcmsDistrict} from './mappings/districts';


const isEmploymentType = (employmentType?: IEmploymentType): employmentType is IEmploymentType =>
  employmentType !== undefined && !!employmentType.id && !!employmentType.employmentType;

const isPositionLevel = (positionLevel?: IPositionLevel): positionLevel is IPositionLevel =>
  positionLevel !== undefined && !!positionLevel.id && !!positionLevel.position;

/*************************************
 * Employment types
 *************************************/
const MCF_EMPLOYMENT_TYPES_ORDER = [
  'Permanent',
  'Full Time',
  'Part Time',
  'Contract',
  'Flexi-work',
  'Temporary',
  'Freelance',
  'Internship',
];

export interface IEmploymentType {
  id: number;
  employmentType: string;
}

const mapMsfToMcfEmploymentTypes = () => {
  const transformedMsfEmploymentTypes = MSF_EMPLOYMENT_TYPES.map(
    (employmentType): IEmploymentType => {
      // transform Flexi Work (MSF) to Flexi-work (MCF)
      if (employmentType.ilpDescription === 'Flexi Work') {
        return {id: parseInt(employmentType.ilpId, 10), employmentType: 'Flexi-work'};
      }
      // transform Contract Basis (MSF) to Contract (MCF)
      if (employmentType.ilpDescription === 'Contract Basis') {
        return {id: parseInt(employmentType.ilpId, 10), employmentType: 'Contract'};
      }
      return {id: parseInt(employmentType.ilpId, 10), employmentType: employmentType.ilpDescription};
    },
  );
  // transform expected ordered mcf employment to msf format by mapping by name
  return (
    MCF_EMPLOYMENT_TYPES_ORDER.map((name) =>
      transformedMsfEmploymentTypes.find(({employmentType}) => employmentType === name),
    ).filter(isEmploymentType) || []
  );
};
export const EMPLOYMENT_TYPES: IEmploymentType[] = mapMsfToMcfEmploymentTypes();

/*************************************
 * Position levels
 *************************************/
const MCF_POSITION_LEVELS_ORDER = [
  'Senior Management',
  'Middle Management',
  'Manager',
  'Professional',
  'Senior Executive',
  'Executive',
  'Junior Executive',
  'Non-executive',
  'Fresh/entry level',
];
export interface IPositionLevel {
  id: number;
  position: string;
}
const mapMsfToMcfPositionLevels = () => {
  const transformedMsfPositionLevels = MSF_POSITION_LEVELS.map(
    (positionLevel): IPositionLevel => {
      // transform Fresh / Entry level (MSF) to Fresh/entry level (MCF)
      if (positionLevel.description === 'Fresh / Entry level') {
        return {id: positionLevel.jobLevelCode, position: 'Fresh/entry level'};
      }
      return {id: positionLevel.jobLevelCode, position: positionLevel.description};
    },
  );
  return (
    MCF_POSITION_LEVELS_ORDER.map((name) =>
      transformedMsfPositionLevels.find(({position}) => position === name),
    ).filter(isPositionLevel) || []
  );
};

export const POSITION_LEVELS: IPositionLevel[] = mapMsfToMcfPositionLevels();

/*************************************
 * Job categories
 *************************************/
export interface IJobCategory {
  id: number;
  category: string;
}
const mapIcmsToMcfJobCategories = () => {
  const transformedMsfJobCategories = MSF_JOB_CATEGORIES.map(
    (jobCategory): IJobCategory => {
      return {id: jobCategory.jobCategoryId, category: jobCategory.jobCategoryName};
    },
  );

  return transformedMsfJobCategories
    .filter(({category}) => category !== 'Others')
    .sort((a, b) => a.category.localeCompare(b.category))
    .concat(transformedMsfJobCategories.find(({category}) => category === 'Others') || []);
};
export const JOB_CATEGORIES: IJobCategory[] = mapIcmsToMcfJobCategories();

/*************************************
 * Schemes
 *************************************/
export enum SCHEME_ID {
  P_MAX = 1,
  PCP = 2,
  CAREER_TRIAL = 3,
  CAREER_SUPPORT = 4,
}

export interface IScheme {
  id: number;
  scheme: string;
  startDate: string;
  expiryDate: string;
  link: string;
}
// no auto conversion from MSF for the moment
export const SCHEMES: IScheme[] = [
  {
    id: 1,
    scheme: 'P-Max',
    startDate: '1977-05-25',
    expiryDate: '2055-05-04',
    link: 'http://www.wsg.gov.sg/programmes-and-initiatives/p-max-employer.html',
  },
  {
    id: 2,
    scheme: 'Professional Conversion Programme',
    startDate: '1977-05-25',
    expiryDate: '2055-05-04',
    link: 'http://www.wsg.gov.sg/programmes-and-initiatives/professional-conversion-programmes-employers.html',
  },
  {
    id: 3,
    scheme: 'Career Trial',
    startDate: '1977-05-25',
    expiryDate: '2055-05-04',
    link: 'http://www.wsg.gov.sg/programmes-and-initiatives/career-trial-employers.html',
  },
  {
    id: 4,
    scheme: 'Career Support Programme',
    startDate: '1977-05-25',
    expiryDate: '2055-05-04',
    link: 'http://www.wsg.gov.sg/programmes-and-initiatives/wsg-career-support-programme-employers.html',
  },
];

/*************************************
 * Job Statuses
 *************************************/
export enum JOB_STATUS {
  CLOSED = 1,
  DRAFT = 2,
  OPEN = 3,
  REOPEN = 4,
}
export interface IJobStatus {
  id: JOB_STATUS;
  status: string;
}
export const JOB_STATUSES: IJobStatus[] = MSF_JOB_STATUSES;

/*************************************
 * Districts
 *************************************/
export interface IDistrict {
  id: number;
  location: string;
  region: string;
  sectors: string[];
}
const mapMsfToMcfDistricts = () => {
  return MSF_DISTRICTS.map((district) => {
    const icmsDistrict = mapMcfToIcmsDistrict(district.district);
    const districtIdsWithoutSectors = [998, 999];
    return {
      id: district.district,
      location: district.location,
      region: icmsDistrict ? icmsDistrict.region : district.location,
      sectors: districtIdsWithoutSectors.includes(district.district)
        ? []
        : district.sector.split(',').map((sector) => sector.trim()),
    };
  });
};
export const DISTRICTS: IDistrict[] = mapMsfToMcfDistricts();

/*************************************
 * Countries
 *************************************/
export interface ICountry {
  code: string;
  description: string;
  codeNumber: number;
}
const countryCodeNumberCorrections = [
  {code: 'AI', codeNumber: 1},
  {code: 'IO', codeNumber: 246},
  {code: 'CX', codeNumber: 61},
  {code: 'CC', codeNumber: 61},
  {code: 'TP', codeNumber: 670},
  {code: 'GK', codeNumber: 44},
  {code: 'HK', codeNumber: 852},
  {code: 'MM', codeNumber: 44},
  {code: 'JM', codeNumber: 1},
  {code: 'KV', codeNumber: 383},
  {code: 'MO', codeNumber: 853},
  {code: 'ME', codeNumber: 262},
  {code: 'BU', codeNumber: 95},
  {code: 'PB', codeNumber: 970},
  {code: 'PN', codeNumber: 64},
  {code: 'RF', codeNumber: 7},
  {code: 'TI', codeNumber: 992},
  {code: 'US', codeNumber: 1},
  {code: 'VA', codeNumber: 39},
  {code: 'WK', codeNumber: 1},
  {code: 'ZR', codeNumber: 243},
];
const mapMsfToMcfCountries = () => {
  return MSF_COUNTRIES.map((country) => {
    const countryCodeNumberCorrection = countryCodeNumberCorrections.find(
      (codeCorrection) => codeCorrection.code === country.countryCode,
    );
    const codeNumber =
      (countryCodeNumberCorrection && countryCodeNumberCorrection.codeNumber) || country.countryCodeNumber;
    return {code: country.countryCode, description: country.description, codeNumber};
  });
};
export const COUNTRIES: ICountry[] = mapMsfToMcfCountries();

/*************************************
 * Salary Types
 *************************************/
export enum SALARY_TYPE {
  MONTHLY = 4,
  ANNUAL = 5,
}
export interface ISalaryType {
  id: SALARY_TYPE;
  salaryType: string;
}
const mapMsfToMcfSalaryTypes = () => {
  return MSF_SALARY_TYPES.map((salaryType) => ({id: salaryType.salaryTypeId, salaryType: salaryType.description}));
};
export const SALARY_TYPES: ISalaryType[] = mapMsfToMcfSalaryTypes();

/*************************************
 * Company Registration Types
 *************************************/
export interface ICompanyRegistrationType {
  id: number;
  registrationType: string;
}
const mapMsfToMcfCompanyRegistrationTypes = () => {
  return MSF_COMPANY_REGISTRATION_TYPES.map((registrationType) => ({
    id: registrationType.registrationTypeCode,
    registrationType: registrationType.description,
  }));
};
export const COMPANY_REGISTRATION_TYPES: ICompanyRegistrationType[] = mapMsfToMcfCompanyRegistrationTypes();

/*************************************
 * Company Address Purpose
 *************************************/
export enum COMPANY_ADDRESS_PURPOSE {
  REGISTERED,
  OPERATING,
  CORRESPONDENCE,
}
export interface ICompanyAddressPurpose {
  id: COMPANY_ADDRESS_PURPOSE;
  purpose: string;
}
export const COMPANY_ADDRESS_PURPOSES: ICompanyAddressPurpose[] = [
  {id: COMPANY_ADDRESS_PURPOSE.REGISTERED, purpose: 'registered'},
  {id: COMPANY_ADDRESS_PURPOSE.OPERATING, purpose: 'operating'},
  {id: COMPANY_ADDRESS_PURPOSE.CORRESPONDENCE, purpose: 'correspondence'},
];

/*************************************
 * Job Application Statuses
 *************************************/

export enum JOB_APPLICATION_STATUS {
  NOT_SENT = 0,
  UNDER_REVIEW,
  SUCCESSFUL,
  UNSUCCESSFUL,
  RECEIVED,
  WITHDRAWN,
}

export const JOB_APPLICATION_STATUSES = {
  [JOB_APPLICATION_STATUS.NOT_SENT]: 'Not Sent',
  [JOB_APPLICATION_STATUS.UNDER_REVIEW]: 'Under Review',
  [JOB_APPLICATION_STATUS.SUCCESSFUL]: 'Successful',
  [JOB_APPLICATION_STATUS.UNSUCCESSFUL]: 'Unsuccessful',
  [JOB_APPLICATION_STATUS.RECEIVED]: 'Received',
  [JOB_APPLICATION_STATUS.WITHDRAWN]: 'Withdrawn',
};

/*************************************
 * SSECE EQA List (Education)
 * Extracted from https://www.singstat.gov.sg/-/media/files/standards_and_classifications/educational_classification/ssec2015-report.pdf
 *************************************/

export interface ISsecEqa {
  code: string;
  description: string;
}
export const SSEC_EQA_LIST: ISsecEqa[] = [
  {code: '01', description: 'Never attended school'},
  {code: '02', description: 'Pre-primary / Kindergarten education'},
  {code: '03', description: 'Primary education without PSLE / PSPE certification or their equivalent'},
  {code: '04', description: 'Certificate in BEST 1-3'},
  {
    code: '11',
    description:
      'Primary School Leaving Certificate (PSLE) / Primary School Proficiency Certificate (PSPE) or other certificates of equivalent standard',
  },
  {code: '12', description: 'Certificate in BEST 4'},
  {
    code: '13',
    description:
      'At least 3 WSQ Statements of Attainment in Workplace Literacy or Numeracy (WPLN) at Level 1 or 2 (eg under ESS, ES)',
  },
  {code: '21', description: `Secondary education without a GCE 'O' / 'N' Level pass or their equivalent`},
  {code: '22', description: 'Certificate in WISE 1-3'},
  {code: '23', description: 'Basic vocational certificates (including ITE Basic Vocational Training)'},
  {
    code: '24',
    description:
      'At least 3 WSQ Statements of Attainment in Workplace Literacy or Numeracy (WPLN) at Level 3 or 4 (eg under ESS, ES)',
  },
  {code: '31', description: `At least 1 GCE 'N' Level pass`},
  {code: '32', description: `At least 1 GCE 'O' Level pass`},
  {
    code: '33',
    description:
      'National ITE Certificate (Intermediate) or equivalent (eg National Technical Certificate Grade 3, Certificate of Vocational Training, BCA Builder Certificate)',
  },
  {
    code: '34',
    description:
      'ITE Skills Certificate (ISC) or equivalent (eg Certificate of Competency, Certificate in Service Skills)',
  },
  {
    code: '35',
    description:
      'At least 3 WSQ Statements of Attainment in Workplace Literacy or Numeracy (WPLN) at Level 5 and above (eg under ESS, ES)',
  },
  {code: '39', description: 'Other certificates or qualifications of equivalent standard (secondary) n.e.c.'},
  {code: '41', description: `At least 1 GCE 'A'/'H2' Level pass or equivalent (General)`},
  {
    code: '42',
    description:
      'National ITE Certificate (Nitec) or equivalent (eg Post Nitec Certificate, Specialist Nitec, Certificate in Office Skills, National Technical Certificate Grade 2, National Certificate in Nursing, Advanced  Builder Certificate) ',
  },
  {
    code: '43',
    description:
      'Higher Nitec, including Certificate in Business Skills, Industrial Technician Certificate and other polytechnic certificates',
  },
  {code: '44', description: 'Master Nitec or equivalent (eg National Technical Certificate Grade 1)'},
  {code: '45', description: 'WSQ Certificate or equivalent'},
  {code: '46', description: 'WSQ Higher Certificate or equivalent'},
  {code: '47', description: 'WSQ Advanced Certificate or equivalent'},
  {
    code: '48',
    description:
      'Other post-secondary (non-tertiary; General) qualifications, including International Baccalaureate / High School Diploma',
  },
  {
    code: '49',
    description: 'Other post-secondary (non-tertiary; Vocational) certificates (eg SIM certificates) qualifications',
  },
  {code: '51', description: 'Polytechnic diploma'},
  {
    code: '52',
    description:
      'Polytechnic advanced diploma (including polytechnic advanced/post/ specialist/management/graduate diploma)',
  },
  {code: '61', description: 'ITE diploma'},
  {
    code: '62',
    description: 'Diploma qualifications (eg NIE diploma, SIM diploma, LaSalle-SIA diploma, NAFA diploma)',
  },
  {code: '63', description: 'Qualifications awarded by professional bodies'},
  {code: '64', description: 'WSQ diploma'},
  {code: '65', description: 'WSQ specialist diploma'},
  {code: '69', description: 'Other advanced diploma, post-diploma qualifications or equivalent n.e.c.'},
  {code: '70', description: `Bachelor's degree or equivalent`},
  {code: '81', description: 'Postgraduate diploma (including NIE postgraduate diploma)'},
  {code: '82', description: 'WSQ graduate certificate'},
  {code: '83', description: 'WSQ graduate diploma'},
  {code: '91', description: `Master's or equivalent`},
  {code: '92', description: 'Doctorate or equivalent'},
  {
    code: 'N1',
    description:
      'At least 1 WSQ Statement of Attainment or ITE modular certificate at Post-Secondary Level (Non-Tertiary) or equivalent',
  },
  {
    code: 'N2',
    description: 'At least 1 WSQ Statement of Attainment or other modular certificate at Diploma Level or equivalent',
  },
  {
    code: 'N3',
    description: 'At least 1 WSQ Statement of Attainment or other modular certificate at Degree Level or equivalent',
  },
  {
    code: 'N4',
    description:
      'At least 1 WSQ Statement of Attainment or other modular certificate at Postgraduate Level or equivalent',
  },
  {code: 'N9', description: 'Other Statement of Attainment, modular certificate or equivalent n.e.c.'},
  {code: 'XX', description: 'Not reported'},
];

// Additional stop words are words that are common across all job description/titles
export const CUSTOM_WORD_LIST = [
  'pte',
  'ltd',
  'pte.',
  'ltd.',
  'private',
  'limited',
  'llc',
  'llp',
  'inc',
  'inc.',
  'co',
  'co.',
];

// Stop words are retrieved from https://www.ranks.nl/stopwords
export const STOP_WORDS = [
  ...CUSTOM_WORD_LIST,
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  "aren't",
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  "can't",
  'cannot',
  'could',
  "couldn't",
  'did',
  "didn't",
  'do',
  'does',
  "doesn't",
  'doing',
  "don't",
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  "hadn't",
  'has',
  "hasn't",
  'have',
  "haven't",
  'having',
  'he',
  "he'd",
  "he'll",
  "he's",
  'her',
  'here',
  "here's",
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  "how's",
  'i',
  "i'd",
  "i'll",
  "i'm",
  "i've",
  'if',
  'in',
  'into',
  'is',
  "isn't",
  'it',
  "it's",
  'its',
  'itself',
  "let's",
  'me',
  'more',
  'most',
  "mustn't",
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  "shan't",
  'she',
  "she'd",
  "she'll",
  "she's",
  'should',
  "shouldn't",
  'so',
  'some',
  'such',
  'than',
  'that',
  "that's",
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  "there's",
  'these',
  'they',
  "they'd",
  "they'll",
  "they're",
  "they've",
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  "wasn't",
  'we',
  "we'd",
  "we'll",
  "we're",
  "we've",
  'were',
  "weren't",
  'what',
  "what's",
  'when',
  "when's",
  'where',
  "where's",
  'which',
  'while',
  'who',
  "who's",
  'whom',
  'why',
  "why's",
  'with',
  "won't",
  'would',
  "wouldn't",
  'you',
  "you'd",
  "you'll",
  "you're",
  "you've",
  'your',
  'yours',
  'yourself',
  'yourselves',
];

export const removeStopWords = (str = '') => {
  const strArr = str.split(' ');
  const sanitisedArr = remove(strArr, (word) => {
    return !STOP_WORDS.includes(word);
  });
  return sanitisedArr.join(' ');
};

export const removeWordsInBracket = (str = '') => {
  const re = /\(.*?\)/gi;
  return str.replace(re, '');
};

export const removePunctuations = (str = '') => {
  // '-' is ignored in this case
  const re = /[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=]/g;
  return str.replace(re, '');
};

export const removeExcessWhitespaces = (str = '') => {
  const re = /\s+/g;
  return str.replace(re, ' ');
};

export const removeRepeatedHyphens = (str = '') => {
  const re = /\-+/g;
  return str.replace(re, '-');
};

export const joinWords = (str = '') => {
  const re = /\s/g;
  return str.trim().replace(re, '-');
};

export const cleanWord = (str = '') => {
  const currentStr = `${str.toLowerCase()}`;
  return flow(
    removeWordsInBracket,
    removeStopWords,
    removePunctuations,
    removeExcessWhitespaces,
    joinWords,
    removeRepeatedHyphens,
    encodeURIComponent,
  )(currentStr);
};

export const pathToJobId = (path) => {
  // Sanitize path to remove last character if last character is `/`
  const parsedPath = path.substr(-1) === '/' ? path.slice(0, -1) : path;
  const regexExp = /job\/(?:.*-)?(.*)/i;
  const groups = regexExp.exec(parsedPath);
  // length - 1 is to find the uuid, since it will always be the last one is in the group
  // split('/') will handle the case where the url end with `/apply` in the case of job application
  const jobId = groups && groups[groups.length - 1] ? groups[groups.length - 1].split('/') : null;
  // same apply here as well
  return jobId && (jobId[jobId.length - 1] === 'apply' ? jobId[jobId.length - 2] : jobId[jobId.length - 1]);
};

export const isJobApplicationPath = (path) => {
  const regexExp = /\/apply\/?$/;
  const groups = regexExp.exec(path);
  return groups ? true : false;
};

export const pathToJobAlertChecksum = (path) => {
  const regexExp = /jobalert\/remove\/(?:.*-)?(.*$)/i;
  const checksum = regexExp.exec(path);
  return checksum && checksum[1] ? checksum[1] : null;
};

export const getCategoryByLabel = (label) => Object.keys(CATEGORY).find((category) => CATEGORY[category].label === label);


function Key(id: string, label: string, value: string, url: string) {
  return {id, label, value: typeof value === 'undefined' ? id : value, url};
}

function  CategoryKey(id: string, label: string, value: string, url: string, metaDescription?: string, pageTitle?: string, description?: string) {
  return {
    ...Key(id, label, value, url),
    description,
    metaDescription,
    pageTitle,
  };
}

export const CATEGORY_DESCRIPTION = {
  ACCOUNTING_AUDITING_TAXATION: `<h1>View Accounting and Finance Jobs Available in Singapore </h1><p>In a nutshell, accounting refers to the recording, sorting, retrieving and summarising of financial transactions in a business. By acquiring and creating reports on a business’ cash flows, financial stability and performance – the company can then make decisions on how to best manage the business and its processes. </p><p>Singapore’s status as a leading global financial centre plays a key role in boosting the financial growth of the country. There is an increase in job opportunities available in the accounting and finance industry as global investors take interest in Singapore. The potential for long term growth and a stable career is strong in the accounting sector in Singapore.</p><p>Using the <a href="https://content.mycareersfuture.sg/">Careers Toolkit</a> is an excellent way to leverage available resources to aid in your job applications.</p><h2>What is Accounting?</h2><p>Accounting itself is a broad category in the finance sector. That makes it difficult to narrow down the specifics of the different job responsibilities held by accountants in differing sectors like management or financial accounting. More often than not, accounting is a job that requires a degree of attention to detail and financial acumen. As accountants are also privy to confidential financial data, their ability to keep information private is just as important as their technical skills. Some of the daily duties carried out by accountants include, but are not limited to:</p><ul><li>Recording and sorting financial transactions</li><li>Performing internal audits</li><li>Analysing cash flows in the business</li><li>Producing quarterly financial reports</li><li>Managing internal cash flows</li></ul><ol><li><h3>What Type of Accounting Jobs are there? </h3><p>Accounting jobs comprise much more than just analysing and reviewing financial records. Some of the industries that hire accountants or need accounting services are:</p><ol type="A"><li>Public or Government Accounting </li><li>Auditing Services </li><li>Management Accounting </li></ol><p>Accounting Job Titles include: </p><ol type="A"><li>Certified Public Accountant</li><li>Accounting Clerk</li><li>Financial Analyst </li><li>Budget Analyst</li><li>Compliance Auditor </li></ol></li><li><h3>Certifications for Accounting and Finance Jobs in Singapore </h3><p>An accounting degree can get your foot through the door for most entry level accounting jobs in Singapore. However, if you intend to advance your career in the finance sector, attaining several certifications can give you competitive advantage in bagging more senior accountant job roles. Popular accounting certifications in Singapore include:</p><ol type="A"><li>Certified Public Accountant (CPA)</li><li>Certified Management Accountant (CMA)</li><li>Certified Internal Auditor (CIA)</li><li>Certified Financial Analyst (CFA) </li></ol></li></ol><p>Those who are new to the industry can look to the Accounting and Corporate Regulatory Authority (ACRA) to get insight into Singapore’s auditing services. </p><h2>Apply for Accounting and Finance Jobs in Singapore</h2><p>Be it full time or part time, there are a myriad of accounting firms in Singapore constantly on the lookout for accountants, auditors and analysts. </p><p>Moreover, putting these <a href="https://content.mycareersfuture.sg/want-to-grow-your-career-here-are-some-tips-to-stay-ahead-in-the-workforce/">pointers into practice</a> can aid jobseekers to remain relevant and employable in an increasingly competitive job market. Stay ahead and gain awareness of the changing trends in the workforce by equipping yourself with <a href="https://content.mycareersfuture.sg/future-work-4-essential-tips-singaporeans-stay-ahead-pack/">these tips</a>! </p>`,
  ADMIN_SECRETARIAL: `<h1>View Admin Jobs Available in Singapore </h1><p>Essentially acting as the backbone of a business, admin assistants employ a wide range of skills to support executives in many tasks – both complex and general in nature. Administrative roles, or more commonly known as admin jobs, are available across sectors and vary greatly in terms of responsibilities and salaries. Although admin assistants are hired across almost all industries, there generally is a base set of skills pivotal in ensuring business processes run smoothly. </p><p>Whether you are looking for a full time, part time, or freelance admin job in Singapore, <a href="https://www.mycareersfuture.sg/">MyCareersFuture</a> has a diverse range of opportunities for individuals of all backgrounds and experience. </p><h2>Life of an Admin Assistant </h2> <p>A normal day of an admin assistant can get hectic. As admin assistants routinely receive requests to handle tasks that crop up unexpectedly, being flexible is key to succeeding in this job. </p><ol> <li> <h3>Job responsibilities of an Admin Assistant </h3> <p>Admin assistants handle day-to-day tasks and support with the smooth running of operations in the office. Their daily responsibilities include:</p><ul> <li>Paper filing, binding and copying </li><li>Writing of emails and letters </li><li>Organising travel arrangements for staff </li><li>Planning team bonding activities </li><li>Arranging meetings </li></ul> <p>With a wide suite of tasks, admin assistants require strong organisational capabilities.</p></li><li> <h3>Skills Required for a Full Time Admin Job </h3> <p>With tasks being assigned – sometimes on short notice – administrators are expected to showcase flexibility to juggle several tasks at one time. Likewise, time management is an essential skill to have in order to stay afloat the responsibilities that come saddled with the job. Admin assistants are often the first point of contact for customers so being oriented to the ups and downs of customer service is beneficial as well. Some other highly-valued skills include:</p><ol> <li>Strong communication skills</li><li>Filing management</li><li>Meticulousness </li><li>Resourcefulness </li></ol> </li></ol> <h2>Explore Different Types of Admin Jobs </h2> <p>As administration itself is a broad category, job titles seem to insinuate very similar responsibilities but depending on the nature of the business and rank of the administrator – the jobs are different in terms of day-to-day tasks. </p><ol> <li> <h3>Common Admin Jobs</h3> <p>Most commonly known admin jobs involve secretarial functions, office management and reception tasks – specific to the industry the administrator is employed in. Admin assistant jobs serve as a good stepping stone to a managerial position. Common admin jobs in Singapore include:</p><ol> <li>Office Admin Assistant or Manager </li><li>Program Admin </li><li>Special Events Admin</li><li>Financial Controller</li><li>Receptionist </li></ol> </li><li> <h3>Admin Jobs By the Sector </h3> <p>Due to the nature of administrative work, admin assistants are employed across industries. From healthcare to human resources, admin assistants are essentially indispensable for the variety of work that they do. The administrative tasks required of them differ in terms of priority and skills depending on the sector they go into. Admin assistants in government jobs manage a lot of confidential data in short amounts of time, resulting in the need for flexibility and being fundamentally private with confidential information. On the other hand, admin assistants in retail must be comfortable facing customers all day. Working for a retailer whose products you are enthusiastic about can also improve your work drive. </p></li></ol> <h2>Apply for an Admin Job in Singapore – Build Your Path </h2> <p>As you begin your hunt for a suitable admin job that fits your interests and capabilities, understanding <a href="https://content.mycareersfuture.sg/key-things-singapore-employers-look-hiring/">what employers look out for</a> can be helpful when you are preparing for interviews. Likewise, <a href="https://content.mycareersfuture.sg/write-winning-job-application-email-wont-make-employers-glance/">working on your application emails</a> can give you an edge over your competition in getting noticed by potential employers. </p>`,
  ADVERTISING_MEDIA: `<h1>Look for Social Media Advertising Jobs and More</h1><p>Do you flourish in a competitive industry? Are you keen to work in a team? Would you be willing to adapt and adopt new trends along the way in your career?How about considering a career in advertising?There is a bountiful number of agencies and organizations in Singapore that thrive on advertising. If you have the drive, the ideas and the boldness to make your mark in the advertising world, <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> is the jobs portal for you. Boasting a generous number of advertising vacancies in agencies and organizations, you apply and embark on an exciting career. Browse and submit your application today!</p><h2>3 Popular Types of Advertising</h2><p>Smart and effective advertising is crucial for any business to succeed. It helps one get key messages across to one’s target audience and raise brand awareness. Furthermore, effective advertising can influence consumer behaviour and contribute to a company’s profits and revenue. <p><p>Businesses use various types of advertising tactics today. These include:</p><h3>Social Media Advertising</h3>Social media has been dominating various aspects of life – from leisure to business and commerce. With billions of users on social networks like Facebook, Twitter, LinkedIn, and Instagram today, companies have been tapping on social media advertising to showcase their products and make their brand known. Some examples of social media advertising comprise:<ul><li>Facebook advertising</li><li>Instagram advertising</li><li>LinkedIn advertising </li></ul><h3>Google Advertising</h3><p>Google is one of the largest search engines today with over 63,000 searches per second on any given day. Google advertising is similar to social media advertising as it involves advanced knowledge and understanding of digital marketing. It relies on the Google Search Network, Google Display Network as well as the YouTube Network to drive sales, leads, and web traffic.</p><h3>Newspaper and Magazine Advertising</h3><p>Newspaper and magazine advertising may be the most traditional out of the 3, but many companies still rely on the print media to advertising promotions as well as products and services. </p><h2>Working in Advertising </h2><p>Working in advertising is anything but monotonous. In fact, with stiff competition, changing trends as well as new technologies surfacing, the world of advertising is extremely fast-paced and challenging. </p><p>A jobseeker could enter advertising by joining an agency or a department within an organization in Singapore depending on one’s field of interest and long-term goals. While joining advertising agencies in Singapore may bring one substantial chances to broaden one’s horizon, working on an in-house basis might make one an expert in his field in a short time. </p><h2>In-demand Skills</h2> <p>It is not enough for a jobseeker to merely state his interest in the job application. Having relevant skills will help you get noticed too. Some in-demand skills include:</p><ul><li>Graphics design</li><li>Content writing</li><li>Content marketing </li><li>Google analytics </li><li>Search Engine Optimization (SEO)</li><li>Pay-per-click (PPC) Advertising </li></ul><h2>Are You Ready for An Exciting Career? </h2><p>The advertising industry is an ever-changing one. With smart technologies and innovation on the rise, it is important for all companies to tap on smart advertising strategies to stay ahead.</p><p>Will you make the difference? </p>`,
  ARCHITECTURE_INTERIOR_DESIGN: `<h1>Look for Architecture Jobs in Singapore</h1><p>Ever wanted to be an architect? <p><p>Architects are responsible for a building's structure, design, construction process and development. They are the brains behind some of the most jaw-dropping and picturesque buildings. Many professional architects have a keen eye for design, a creative mind as well as a passion for innovation. An architect also has to be visionary and forward-thinking.<p>They are responsible for designing, developing, and supervising all types of macro and micro-projects. <p><p>Want to explore opportunities in Singapore's architecture industry? <p><p>The time to start on your career in architecture is now. <p><p>MyCareersFuture.sg is a jobs portal with a huge number of vacancies available across various industries in Singapore. If you think you have what it takes to join the architecture industry, browse our listing and apply now. <p><h2>What is Architecture? </h2><p>"Architecture is the thoughtful making of space." - Louis Kahn<p><p>Architecture might be loosely associated with the idea of building design. But the reality is that it encompasses various other responsibilities and duties beyond that of designing.<p><p>In actual fact, the meaning of architecture can be encapsulated in the process of designing, planning and constructing buildings, built environments or other structures. These structures are often perceived as cultural symbols and works of art. It incorporates a deep understanding of architectural and cultural art, science and technology.<p><h2>Types of Architects and What They Do</h2><p>Besides the obvious of designing buildings, architects can opt to be a master of one key specialisation by working in-house or a jack of all trades by getting a job in architecture firms in Singapore. There are various types of architects, 3 of the most common types are:<p><h3>1. Residential Architect </h3><p>Want to design homes?<p><p>Residential architects deal with clients who want to develop their own unique house designs. They would have to take charge of spatial and functional requirements before designing plans, elevations and layouts before any construction takes place.<p> <h3>2. Green Design Architect </h3><p>If you have a desire to fight against global warming, green design architecture might be an interesting field to explore. Green design architects would have to work on innovative and effective methods to reduce the carbon footprint of their creations for a more sustainable environment.<p><h3>3. Interior Designer</h3><p>The responsibilities of an interior design involve designing and styling the interior of an apartment or a working space. One should have deep knowledge and understanding of materials, colours, fabrics and furniture design. <p><p>The knowledge, design skills and artistic sense makes one capable of venturing out onto other paths such as graphic design, game design and even product design. <p><h2>Common Job Titles in Architecture</h2><p>Architecture is a broad industry with a myriad of specialisations. Some common job titles include but are not limited to:<p><ul><li>Urban designer</li><li>City planner </li><li>Interior designer</li><li>Architectural designer</li><li>Graphic designer </li><li>Landscape Architect </li></ul><h2>Watch Your Hard Work Come to Fruition </h2><p>Watching your designs come to life is probably the most satisfying part of working in architecture. <p><p>If you think you have what it takes to develop modern paragons, join the architecture industry today by applying on MyCareersFuture.sg!<p>`,
  BANKING_AND_FINANCE: `<h1>Explore the latest Banking Jobs in Singapore</h1><p>Singapore’s status as a leading global financial centre is reflective of the key role that the banking and finance industry plays in the financial market. Strategically located in Southeast Asia, Singapore is geographically prime for global investors. Undeniably so, technological disruption is transforming the way businesses work and the financial services sector in Singapore is hardly exempt from it. That said, financial technology (Fintech) growth as a sector has seen the volume of banking and finance jobs in Singapore grow over two years. With millions of Singaporeans now online, the banking and finance industry in the country is expected to transform for the digital future of young and tech-savvy users. In just over two years, the fintech adoption rate among Singaporeans increased in 2019 – a rate much higher than before. The influx of global investors and overseas fintech companies creates a wealth of opportunities in Singapore’s financial sector. Underpinned by the fintech wave sweeping across the ASEAN region, the banking and financial services industry will open more jobs in Singapore these few years.</p><p>Backed by a sound economic environment, conducive tax policies and a large-scale transformation in banking jobs fuelled by fintech adoption, jobseekers can look to <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> for career matching services and insights for a fulfilling and long-term career prospects in Singapore’s banking industry. </p><h2>Types of Banking Jobs in Singapore </h2> <p>As a core function in the financial services industry, banking jobs in Singapore count for a lot more than just bank tellers, accountants and financial advisers. No matter your experience, the ultimate quality of pursuing a job in the banking industry is in its multitude of job positions. </p><ol> <li> <h3>Banking and Finance Job Positions </h3> <ol type="a"> <li>Auditor</li><li>Financial Analyst</li><li>Relationship Manager </li><li>Financial Controller</li><li>Consumer Credit Analyst</li><li>Investment Accounting Analyst</li><li>Mortgage Consultant </li></ol> </li><li> <h3>Specialist strands in a Banking Career </h3> <p>Apart from the job positions offered, banking jobs in Singapore also vary across the specialist strands in the banking and finance industry. Some of the more popular services include:</p><ol type="a"> <li>Investment Banking</li><li>Private Banking</li><li>Commercial or Retail Banking</li><li>Insurance</li><li>Private Equity and Venture Capital </li></ol> </li></ol> <p>The banking and financial services sector is a multi-faceted one that caters to a host of skills, qualifications and interests. Make sure that you research the different specialist strands in the banking industry to improve your chances of securing the job that is closely aligned with your set of skills. Individuals considering banking jobs can also apply for contract or part time jobs in Singapore to have a feel of what working in the industry is like.</p><h2>Credentials for Securing Banking Jobs in Singapore </h2> <p>Executive, management, specialised positions in the banking industry may require further credentials in the form of licensure or advanced certifications. Those looking to pursue investment or private banking in Singapore minimally require a Chartered Financial Analyst (CFA) certification. On the other hand, private banking professionals who are in a client-facing role with high net worth individuals in Singapore may be encouraged to advance their qualifications to include the Client Advisor Competency Standards (CACS) Assessment. Jobseekers in Singapore can consider The Institute of Banking & Finance in Singapore for advancing their qualifications to secure banking jobs. </p><p>If you are looking into banking jobs in Singapore for your career, <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> is one place you can go to for job-matching services and opportunities posted by potential employers. </p>`,
  BUILDING_AND_CONSTRUCTION: `<h1>Explore Building Maintenance and Construction Jobs in Singapore </h1><p>Building and maintenance jobs make up a portion of the construction sector in Singapore. As one of Singapore's pillars of economic growth, the building and construction sector sees a demand of skilled workers in building, construction and maintenance. <p><p>There are numerous job opportunities in the building sector in Singapore. From large-scale projects like the building of public transportation lines to private residential properties and hotels, jobseekers intending to forge a career in building and construction can consider the various opportunities available in public and private sector’s building projects. Those in building jobs contribute significantly to Singapore’s Built Environment landscape - the buildings and infrastructure that provide the setting for the community.<p> <p>With the integration of technology into the building and construction sector, there is new demand for skilled workers to be able to manage and optimise the use of building technology. To prepare for the future of work, both in building and other sectors, jobseekers are encouraged to adapt and grow with the changes to be successful. <p><h1>What Do Building Maintenance Jobs Entail?</h1><p>Working in the building industry translates to overseeing, coordinating and constructing of infrastructure. While architects design and create blueprints for the building project, builders oversee and coordinate the construction. As they coordinate different teams in the project, builders often work on-site. Building jobs also frequently function on a project-to-project basis as builders are contracted to oversee and coordinate different construction sites. <p><h3>1. Types of Building Work </h3><p>Building is hardly limited to just the construction of infrastructure and facilities. Building jobs or tasks can be categorised by the following:<p><ul><li>Building Completion Tasks</li><li>Wood work</li><li>Curtain walling</li><li>Glass glazing </li><li>Building Construction</li><li>Renovation</li><li>Upgrading work</li><li>Repair work</li><li>Installation Work </li><li>Electrical works</li><li>Building equipment such as elevators and escalators</li><li>Security alarm systems </li><li>Plumbing work such as air-conditioning and heating</li></ul><p>Along with these different segments in building, the job titles for those working in building also vary. These building jobs may all fall under the construction industry but they have different responsibilities. <p><p>Common Job Titles or Positions in the Building Sector:</p><ul><li>Plumber</li><li>Welder</li><li>Mason</li><li>Construction Electrician</li><li>Carpenter</li></ul><h3>2. Valuable Skills For Building Jobs </h3><p>Building jobs are different from office jobs. Jobs in building require a combination of both office and on-site skills related to building itself.<p><p>Building-specific skills: <p><ul><li>Physical stamina</li><li>Mechanical knowledge</li><li>Math literacy </li><li>Adept with technology </li></ul><p>Soft skills:<p><ul><li>Strong communication ability</li><li>Reasoning skills </li><li>Ability to work well with others</li><li>Good organisational ability</li></ul><p>Technology:<p><ul><li>BIM modelling</li><li>AutoCAD </li><li>Proficient with Microsoft Office</li><li>TurboCAD</li></ul><h2>Getting a Job in Building Construction and Maintenance</h2><p>As there are many roles in the building sector, jobseekers can do some research into the field and type of building jobs they are interested in. Builders can get experience in the industry through entry-level roles in the trade. Building jobs often require the ability to work well with power tools and have mechanical knowledge. <p><p>In a competitive job market, learning how to tailor your resume to a job application makes all the difference in improving your chances at landing the job you want. Understanding the different ways you can market yourself also helps you stand out in a sea of job applications. Apply for building jobs on MyCareersFuture.sg today. <p>`,
  CONSULTING: `<h1>Explore Consulting Jobs in Singapore </h1><p>Enjoy problem-solving? Consider yourself an excellent leader? If you enjoy impacting the way companies function, consulting could be a career to consider. Consulting as a service is a broad category and point of interest which explains why there is an opportunity for consultants in almost any industry fathomable. </p><p>With many multinational corporations and start-ups being established in Singapore, there are many opportunities available for those interested in embarking on consulting careers. jobseekers can look to <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> to view the range of consulting jobs available in Singapore. </p><h2>Consulting Industry in Singapore</h2> <p>Having a strategic geographic footprint means that the consulting industry in Singapore gets to enjoy the increase in demand for consulting services from neighbouring countries. Additionally, with the rise of newer sectors like Artificial Intelligence (AI) and Data Analytics, consulting jobs are about to get a stretch in the services they can provide for businesses attempting to refine their processes and scale up. </p><ol> <li> <h3>What Do Consultants Do? </h3> <p>In a nutshell, consultants are engaged on a project basis to share their industry knowledge and expertise to aid in improving the business function or service they are targeting. In helping businesses solve issues and improve their performance, consultants are valued for their specialist skills. Aside from providing professional advice and insight into business solutions, consultants are also required to assist their clients in carrying out the solutions before the project ends. </p><ol type="A"> <li>Daily Responsibilities <ul> <li>Performing research and data analysis to understand the business problem and organisation’s needs </li><li>Interview client company’s employees and management team </li><li>Preparing training or business proposals and solutions</li><li>Presenting findings and recommendations from analysis </li><li>Assist the client company in carrying out the necessary recommendations</li><li>Consistently communicate with client company throughout the project </li><li>Manage end-to-end delivery and facilitation of assessment and development centres</li></ul> </li><li>Valuable Skills for Consultants <ul> <li>Excellent communication and presentation skills</li><li>Strong research and analytical abilities </li><li>Ability to build trust in working relationships</li><li>Flexibility to work in high-pressure and fast-paced environments</li></ul> </li></ol> </li><li> <h3>What Are The Different Types of Consulting Jobs?</h3> <p>Consulting as a sector, though highly lucrative, is also immensely competitive. As consultants are essentially business experts, the need to be highly competent in performing one’s due diligence on business problems is necessary to successfully see through a client’s project. </p><p>Some of the more common and popular consulting jobs are in:</p><ol type="A"> <li>Management or Strategy Consulting</li><li>Financial Advisory Consulting</li><li>Human Resources or Leadership Consulting </li><li>Risk & Compliance Consulting </li></ol> </li></ol> <p>Those who are starting out can look for analyst positions as they are best positioned as entry level consulting jobs where individuals can learn basics on the job. </p><h2>Applying for Consulting Jobs in Singapore </h2> <p>Consulting jobs are attainable even if you do not have a degree in business management or administration. Though a degree in any of these majors can be useful, you can be considered as long as your degree contains an adequate amount of analytical training.</p><h3>Useful Majors</h3> <ul> <li>Business Administration</li><li>Economics </li><li>Finance</li><li>Mathematics </li></ul> <p>With high competition and standard in the industry, jobseekers intent on joining the sector could begin by applying to consulting firms in Singapore for experience in entry level consulting jobs. <a href="https://content.mycareersfuture.sg/how-can-fresh-graduates-get-a-job-without-experience/">For fresh graduates who are starting out</a>, creating a concise resume by leveraging on relevant school achievements and providing references from former professors or colleagues can aid in your applications. jobseekers can also keep an eye on the <a href="https://content.mycareersfuture.sg/job-seekers-toolkit/virtual-career-fairs/">Virtual Career Fairs</a> held from time to time with a focus on either industries or specific companies. </p>`,
  CUSTOMER_SERVICE: `<h1>Browse Through Customer Service Jobs Available in Singapore</h1><p>As a broad category, jobseekers will be pleased to know that customer service jobs are virtually present in every industry. Customer service is often one of the pivotal components to the success of a business. If you love interacting with people and enjoy a challenge, a career in customer service might be a good fit for you. As customer service is an integral part of every business, jobseekers can apply for various customer or client-facing roles in an industry they either have interest or market knowledge in. <p><p>Apply for customer service jobs on the <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> portal today. <p><h2>What is Customer Service?</h2><p>In concise terms, customer service refers to the support offered to customers or clients throughout the purchase or usage of your company’s products and services. Customer service comes in before, during and after a purchase is made. The result of good customer service is more than just customer satisfaction, it is also a way to retain customers and grow business. <p><h3>1. Customer Service Job Description</h3><p>Customer service jobs are essentially roles that require you to have personal contact and manage the customer’s or client’s needs throughout the entire process, whether it is in the form of a business deal or a purchase made at a store. <p><p>Many companies have a customer service operator, executive or officer in their team to handle customer enquiries, complaints or requests.<p><p>Customer service jobs involve these responsibilities:<p><ul><li>Handling customer enquiries and requests</li><li>Providing information</li><li>Selling or recommending products</li><li>Identifying and assessing customer needs</li><li>Suggesting solutions</li></ul><h3>2. Customer Service Skills </h3><p>Customer service officers often have very good soft skills as they are required to interact with customers throughout the day. To understand what makes the desired set of skills, we need to know what good customer service is. Good customer service comprises four elements: <p><ul><li>Product Awareness: It can be difficult to explain, sell or promote a product without fully understanding it. Having knowledge about the products and services your company provides gives you an advantage in ensuring you can give good customer service.</li><li>Being Efficient: Many customers are turned away by long wait times or poor experience. As a customer service executive, being prompt and timely on customer enquiries are important in ensuring customer satisfaction. </li><li>Carrying Positive Attitude: Customers are much more likely to approach someone who is friendly and patient. A good attitude when interacting with customers creates a better experience for them, making good customer service a selling point for the business. </li><li>Problem Resolution Skills: Most customers engage with a customer service officer as they require assistance with a product or service provided by the company. Customer service officers should be able to help customers resolve their queries. </li></ul><p>Important Customer Service Skills:<p><ul><li>Good communication</li><li>Product knowledge</li><li>Ability to handle pressure</li><li>Listening skills</li><li>Positive attitude</li><li>Patience</li><li>Problem-solving skills</li></ul><h3>3. Types of Customer Service Jobs </h3><p>Depending on the product and service, customer service jobs may differ in terms of exact responsibilities. Some of the more common customer service jobs include:<p><ul><li>Customer Service Officer, Executive or Assistant</li><li>Concierge</li><li>Client Success Analyst</li><li>Customer Service Representative</li><li>Receptionist</li><li>Technical Support Representative </li></ul><h2>Apply for Customer Service Jobs Today!</h2><p>Jobseekers keen to join a client-facing role can try for entry level customer service jobs before working their way up to managerial or supervisory roles. Jobseekers who enjoy client-facing roles can consider customer service jobs if they also have strong communication and listening skills. It is important that jobseekers <a href="https://content.mycareersfuture.sg/dress-to-impress/">dress appropriately</a> for interviews to improve their chances at landing a job. Jobseekers should also research the companies they are interviewing for so as to ensure that it is a good fit. <p>`,
  DESIGN: `<h1>Explore Design Jobs in Singapore</h1><p>Design refers to the creation of a particular material, product or system. In the field of engineering, for instance, a mechanical design engineer draws out the plan for a mechanical device or equipment, or a manufacturing system. This renders a more practical understanding of design for the smooth operation of the product that offers a service. In other industries, aesthetic concerns take equal priority, if not more. This can be found in graphic and urban design, two of the most popular and in-demand fields in Singapore.<p>Everything we interact with on a daily basis has been created by a designer - whether it is your water bottle, the LCD screen on your office wall, your clothes and even the roads you travelled on. There are, but not limited to, four common types of design we see around us each day - industrial design, landscape and urban design, graphic design and interior design. There is a range of design jobs in these fields in Singapore suitable for individuals who have the necessary expertise to understand and address user needs within their respective contexts.<p>Browse design jobs on our <a href="https://www.mycareersfuture.sg">MyCareersFuture.sg portal</a> today!<h2>Industrial Design</h2><p>Industrial design refers to the art of designing mass-produced products we use daily. Stemming from the field of product design that sees the development of a single product from scratch, industrial design sometimes require one to take a product and make it more useful and accessible to the wider public. This can refer to laptops, smartphones and even automobiles. With innovation at its peak, industrial design employers are looking out for individuals who have a flair for product design with the aim of creating trendsetting products and services in Singapore. <p><h2>Landscape and Urban Design</h2><p>Landscape design is a key element in developing the aesthetics of a place. Landscape designers combine nature and culture to create experiences that are pleasing to the eye. Urban design, on the other hand, refers to the planning of city and neighbourhood structures, by determining where buildings, roads and other infrastructure should be built. In our garden city, landscape designers and urban planners work side by side in Singapore to <a href="https://content.mycareersfuture.sg/built-environment-occupation-insights/">plan across our limited supply of land</a>, in ways that help address the needs of a growing population and rising demand for tourism.<p><h2>Interior Design</h2><p>Aesthetically-pleasing interiors of a commercial building or a residential unit are important for the experience of the people working or living in the area. Interior design involves every aspect of spatial aesthetics, including the colour of the walls, carpeting, furnishings and lighting. If you are looking for interior design jobs in Singapore, you can choose to work with small or big agencies and create master plans for commercial clients or families renovating their homes.<p><h2>Graphic Design</h2><p>Graphic design refers to the creation of visually appealing imagery through the use of colours, shapes, images and typography. The aesthetic aim of graphic design is to exude emotions while being informative and visually appealing. Graphic designers in Singapore can take the corporate route by joining the marketing departments of small and big organisations across a variety of industries. They can also choose to be part of a challenging and fast-paced work environment at integrated and digital creative agencies. Apart from full-time graphic design jobs, you can also work part-time or freelance to gain experience and build your portfolio while you study.<p> <p>Whichever field of design you choose, you must be able to convince your employers that you are the right fit for the job. Use your experiences and knowledge to <a href="https://content.mycareersfuture.sg/8-ways-make-marketable/">market yourself to your desired employer</a> by keeping track of industry changes in Singapore and how you can bring innovations to the respective design field.<p>`,
  EDUCATION_AND_TRAINING: `<h1>Embark on Careers in Education Now</h1><p>With education as the backbone of socioeconomic progress in Singapore, there is a growing emphasis on knowledge, lifelong learning and application over the years. For this, educators are tasked with imparting knowledge through innovative teaching methods and comprehensive but relevant curriculums. <p><p>If you think you have what it takes to contribute to the Singapore education system, <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> has numerous opportunities for individuals that aspire for careers in education. Browse our listing to find out more. <p><h2>Job Titles and Responsibilities in Education</h2><p>A career in education in Singapore involves a lot more than just the role of a teacher. In fact, the sector itself is broad with a myriad of opportunities for individuals who have a passion for people, purpose and learning. <p><p>Some common job titles in education include but are not limited to: <p><h3>1. Teacher </h3><p>Teachers are the face of education. As a teacher, one could venture into early childhood education or primary and secondary school to teach subjects one is passionate about. This could range from Mathematics, English language, Chinese language, Physics, Biology as well as Physical Education (PE). <p><p>The typical responsibilities of a teacher include:<p><ul><li>Grading and marking assignments</li><li>Setting examination papers</li><li>Conducting lessons and classroom activities </li><li>Leading and supervising co-curricular activities (CCAs) </li></ul><p>Assistant teacher jobs are also available for individuals who have yet to graduate. These roles would give candidates a taste of how working as a teacher is like.<p> <p>Teachers might also be tasked to organize learning journeys outside of the classroom. <p><h3>2. Lecturer </h3><p>Lecturers in tertiary education institutions in Singapore tend to have similar responsibilities as a teacher. One will teach vocational or academic subjects to undergraduate and postgraduate students in lectures, seminars and tutorials. <p><h3>3. Principal</h3> <p>Principals at schools work closely with government agencies as well as teachers to facilitate collaborative and effective approaches to learning, teaching and evaluation. The principal provides leadership for setting overall goals. <p><h3>4. School Board Members</h3><p>The school board represents the governing body of a school district. They are usually involved in the decision-making process of a school. Duties include:<p><ul><li>Managing budget for the school district</li><li>Establishing a community vision </li><li>Decision-making on school expansion or closure </li><li>Managing school staff </li></ul><h3>5. Curriculum Developer </h3><p>Unlike the aforementioned roles, curriculum developers are often attached to the government body. They are responsible for managing the national curriculum. <p><h2>Education is Vital for National Growth </h2><p>For one to build a successful career in education, one has to have 3 key attributes:<p><ul><li>A love to teach</li><li>A passion for people</li><li>A willingness to help </li></ul><p>Singapore’s education system recognises all students for their efforts, merits and accomplishments. Only by empowering the young people of Singapore and encouraging people of all ages can all individuals play a part in building a smart nation. <p>`,
  ENGINEERING: `<h1>Discover Exciting Careers in Engineering in Singapore</h1><p>Just last year, Singapore Technologies (ST) Engineering won a contract to trial a smart lamp-post project in Singapore – part of a broader Smart Nation plan by the government. As the engineering ecosystem shifts to lean heavily on digital and smart technologies, the manufacturing sector inclusive of several types of engineering and construction in Singapore is projected to be in the billions. As a country with limited resources, it is remarkable that Singapore retains standing globally as the manufacturing sector contributes approximately 20% to the Global Domestic Product (GDP).</p><p>Moving with the ebbs and flows of the market, job prospects in different types of engineering fields are projected to grow as the demand for advanced manufacturing and cross-disciplinary projects involving engineering capabilities increases exponentially. jobseekers intending to forge a career in engineering can look to <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> for career matching services to find the right fit within engineering itself.</p><h2>What do Engineers do?</h2> <p>The oft-held opinion that engineering holds little career progression is untrue especially when global economies are advocating technology-intensive solutions in the manufacturing industry. Engineers are responsible for seamless transport systems, public infrastructure and even roller coasters. Products of engineering are apparent in everyday life as they develop commercial solutions to better living standards.</p><p>The everyday contributions of engineers are pivotal in transforming the way people live. Choosing a career in engineering is one way to bolster and contribute to Singapore’s goal of becoming a Smart Nation amid the greater vision of driving the economy forward with smart manufacturing.</p><ol> <li> <h3>Types of Engineering Jobs in Singapore</h3> <p>Engineers are hired across a myriad of industries and within engineering companies in Singapore themselves, there are several roles that are a blend between engineering-specific and management skills.</p><p>Types of engineering:</p><ol type="a"> <li>Electrical</li><li>Chemical</li><li>Civil</li><li>Computer</li><li>Environment</li><li>Aerospace</li><li>Geotechnical</li><li>Mechanical</li><li>Materials</li></ol> </li><li> <h3>Entry Level Engineering Jobs in Singapore</h3> <p>Spending time to figure out the right engineering field that best fits your career goals can aid in developing a fulfilling career. Getting an engineering internship is one great way for you to explore the specialisations within the field itself so that you understand where your passions lie. With many specialisations and interdisciplinary engineering jobs coming up on the market, finding one that excites and motivates you is far from gone. Jobseekers new to the industry can look to several engineering companies in Singapore for entry level engineering jobs available.</p></li></ol> <h2>Engineering in Singapore</h2> <p>Engineering jobs are available both in the public and private sector in Singapore.</p><p>Likewise, going to career fairs can give you an insight into the engineering industry. <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> Singapore holds virtual career fairs pertaining to different industries at different points in the year, for extended periods of time to aid jobseekers in their hunt. Currently, the Engine Room is one such virtual fair that prospective engineering graduates can look to for career advice, training opportunities and engineering companies hiring in Singapore.</p><p>As challenges in engineering include renewable energy, drug creation for public health and smart manufacturing, forging an engineering career in Singapore gives you enough room to find your niche. </p>`,
  ENTERTAINMENT: `<h1>Start Your Career in Entertainment </h1><p>Passionate about the performing arts? Love working with people? Considered venturing into entertainment in Singapore? <p><p><a href="https://mycareersfuture.sg/">MyCareersFuture.sg</a> is a jobs bank with countless entertainment jobs and vacancies in Singapore. If you think you have the charisma and talent to charm an audience, the entertainment industry will definitely provide many opportunities for you to hone your skills. Browse our portal today and apply now! <p><h2>A Brief Overview of the Entertainment Industry</h2><p>The entertainment industry moves way beyond what people would see on the big screen. Discovering and applying for jobs at an entertainment company can be challenging because the market is incredibly diverse and fragmented. Here are 4 of the main sub-categories in the entertainment sector.<p><h3>1. Film</h3><p>Film, or what most would regard as the ‘big screen’, is often stereotyped by all its glitz and glamour. But the reality of working in film is many hours of conceptualisation, storyboarding, scriptwriting, video production, post-production and editing. As such, there are many ways for an individual to contribute to a film company. Some primary roles in film include:<p><ul><h3>On-screen</h3><li>- Videographer</li><li>- Cameraman </li><li>- Scriptwriter </li><li>- Producer</li><li>- Actor</li><li>- Media </li><li>- Communications</li><li>- Public relations</li><li>- Makeup artist and fashion stylist</li></ul><h3>2. Theatre</h3><p>A lot of work and manpower goes into creating a theatre performance. The theatre industry demands different people with different skills to make it successful. Some roles include:<p><ul><li>Pre-production:</li><li>- Playwright</li><li>- Costume design</li><li>- Sound design </li><li>- Set design</li><li>- Composer </li></ul><ul><li>Backstage roles:</li><li>- Sound and Lighting </li><li>- Construction </li><li>- Operations </li><li>- Public Relations </li><li>- Events </li><li>- Publicist </li></ul><ul><li>Production:</li><li>- Actor</li><li>- Musician</li><li>- Dancer</li><li>- Paint crew</li></ul><h3>3. Radio</h3><p>Working in radio extends beyond that of a radio deejay. In fact, with radio becoming one of the most inclusive means of mass communication, individuals who aspire to venture into radio have to have exceptional communication skills. Aside from playing tunes, one might be asked to share news and conduct interviews with musicians. Key roles in radio broadcasting include but are not limited to:<p><ul><li>On-air:</li><li>- Personalities </li><li>- Announcer</li></ul><ul><li>Backstage:</li><li>- Music director</li><li>- Chief engineer</li><li>- Program director</li></ul><h3>4. Television </h3><p>Working in television, or the ‘small screen’, still holds huge appeal as a rewarding and glamorous career in spite of hard work, tough competition and long hours. Nevertheless, there are various opportunities on-and-off screen for individuals who are passionate about the Singapore entertainment sector: <p><ul><li>On-screen:</li><li>- Actor</li><li>- Host </li><li>- Reporter</li></ul><ul><li>Off-screen:</li><li>- Director</li><li>- Producer </li><li>- Scriptwriter </li><li>- Makeup artist</li><li>- Cameraman</li><li>- Videographer</li><li>- Video editor</li><li>- Publicist </li></ul><h2>The Future of Entertainment in Singapore</h2><p>Jobseekers could also apply for some of the aforementioned roles on a freelance or part-time basis. One might also be asked to attend auditions and also share one’s portfolio of work. <p><p>Being able to reap the fruits of one’s labour by witnessing ideas and hard work come to fruition is probably one of the biggest attractions of working in the entertainment industry. While you may have to devote many hours to a project, there are countless opportunities for you to work in a team and also hone your time management and communication skills. <p>`,
  ENVIRONMENT_HEALTH: `<h1>Built and Natural – View Environmental Jobs in Singapore</h1><p>As Singapore ramps up plans to develop the green economy, the creation of environmental jobs and opportunities show no signs of slowing down. As the pressures of climate change compound year on year, jobs related to environmental engineering, conservation and sustainability among others are gaining traction. According to the International Renewable Energy Agency (IRENA), an estimated 11 million people were employed in the renewable energy sector nearing the tail-end of 2018 – signalling formidable growth in an environmental science career.</p><p>Ranging from green building efforts to organic food engineering, jobs in this sector are multidisciplinary in skill requirements and qualifications. As the environment industry in Singapore continues to grow with strong construction demand and shifts towards becoming a technologically advanced sector, the sheer number of job opportunities available for fresh graduates and even mid-level or senior executives are aplenty. Whether you are looking to save an endangered species or champion sustainable energy, the eco sector is booming with green jobs right now. For job opportunities in environmental science, look no further than <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a>. </p><h2>Types of Environmental Jobs in Singapore</h2> <p>To work in the environment industry in Singapore, a degree in environmental science or engineering would be useful - though not mandatory. These job roles include working directly in the environment field and those that are closely related to the environment sector.</p><p>Environmental career options are not limited to just the outdoors and the natural environment. Planning towns, managing environmental issues like public health and pollution control are among the career options in the environment industry in Singapore.</p><ol> <li> <h3>Natural Environment (NE)</h3> <ol type="a"> <li>Environmental Scientist, Lawyer, Engineer</li><li>Zoologist</li><li>Wildlife Biologist</li></ol> </li><li> <h3>Built Environment (BE)</h3> <ol type="a"> <li>Landscape Architect</li><li>Urban Planner</li><li>Quantity Surveyor</li></ol> </li></ol> <p>As corporations commit to sustainable practices, a good number of jobs involving a combination of natural and built environment are gaining momentum. These include:</p><ul> <li>Toxicologist</li><li>Hydrologist</li><li>Wind Turbine Technician</li><li>Ecologist</li></ul> <h2>Advancing your Environmental Science Career</h2> <p>Volunteering for environmental organisations can help you get your foot in the door as you gain experience that might be difficult to attain otherwise. For those with environmental science or related qualifications, developing your non-industry-specific skills like research, analysis and statistical abilities can bring you further as a flexible and adaptable professional. As you gather years of experience under your belt, moving upwards into a management position in the environmental industry is a natural course of action – as it is in almost every industry imaginable. This is where your non-industry-specific skills will come in handy.</p><p>If you are training for a specific career path, furthering your qualifications to include post-graduate and specialist courses is a good idea. Attaining a postgraduate or professional specialist qualification betters your chances at entering much more specific environmental jobs. Stronger research and statistical skills allows you to improve your employability in the environment industry in Singapore. With multinational corporations, non-profit organisations and consultancy firms amping up on green efforts, environmental jobs are aplenty.</p><p>For more insights and tips on progressing your career in the environmental science industry, use our <a href="https://content.mycareersfuture.sg/">Careers Toolkit</a> to improve your employability in the sector. Likewise, for those looking into environmental jobs in Singapore, <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> is one place you can go to for opportunities posted by potential employers. </p>`,
  EVENTS_PROMOTIONS: `<h1>Browse Events Management Jobs in Singapore</h1><p>Do you enjoy organizing events? </p><p>Have you ever considered a career in an events company in Singapore? </p><p>Events management is a challenging but satisfying industry with numerous opportunities for candidates of all academic and employee backgrounds. One can look forward to gaining a lot of exposure to logistics management, public relations, client-facing as well as event coordination. </p><p>Due to the fast-paced nature of commerce and tourism in Singapore, the lion city is an ideal place in the region to host regional events and functions. </p><p>If you are thinking of venturing into events management, <a href="https://mycareersfuture.sg/">MyCareersFuture.sg</a> has the latest vacancies and jobs available on our platform. Browse our listing of vacancies at events companies now!</p><h2>What Goes on at an Events Company</h2> <p>As far as the term “events” is concerned, the list is exhaustive. When one joins a events company, he might be tasked to manage various events like:</p><ul> <li>Product launches</li><li>Regional meetings</li><li>Roadshows </li><li>Trade shows</li><li>Marketing events </li><li>Seminars</li><li>Conferences</li><li>Open houses</li><li>Weddings </li></ul> <p>However, behind every successful event is a competent army of staff. The work involved in planning, organising and conducting a major event can be sufficiently massive in nature and would require the recruitment of a large group of peoples. </p><p>Furthermore, members in an events company might be involved on a part-time, full-time, contract, casual, ad-hoc basis. In this sense, there is some flexibility when one joins an events company.</p><p>Depending on the date and timing of the event, members of the company might be required to work on weekends and past office hours. </p><h2>Key Positions in an Events Management Company in Singapore</h2> <p>Events management is the perfect sector for strong multitaskers who love working in a team. </p><p>Individuals in events management do more than just organize large-scale and small-scale events. Instead, they are involved in logistics, event planning, public relations, communications, and much more. </p><p>Instead of searching for specific “events roles”, jobseekers could search for clearly defined positions that are suited to one’s particular skill set. For instance, if one is passionate about the media, he can be in charge of public relations and media relationship management. </p><p>Here are some roles one could apply for:</p><ul> <li>Public relations <ul> <li>PR & communications manager</li><li>Marketing & corporate communications manager</li><li>Brand and influencer marketer</li></ul> </li><li>Logistics <ul> <li>Logistics coordinator </li><li>Operations manager </li></ul> </li><li>Event planning <ul> <li>Event coordinator </li><li>Activities and events planner</li><li>Program manager </li></ul> </li></ul> <p>Depending on the size of the events management company as well as the scale of the event, one might be involved in multiple roles. In this sense, one has to be able to multi-task and juggle various responsibilities. </p><h2>Teamwork and Collaboration</h2> <p>“Coming together is a beginning; keeping together is progress; working together is success.” – Henry Ford</p><p>Working in an events company in Singapore and anywhere else in the world is not a one-man job. </p><p>To thrive in events, one must be willing and able to work in a team and communicate openly. Having a clear head whilst juggling various responsibilities could also help an individual develop important life and professional skills. </p>`,
  F_N_B: `<h1>Look for an F&B Job in Singapore </h1><p>The competitive and rigorous Food & Beverage (F&B) industry presents a myriad of opportunities for all jobseekers to gain critical life skills. </p><p>On the surface, F&B might seem like an extremely challenging industry for individuals who have a passion for food and drink. However, the truth is that F&B is an extremely diverse industry with many opportunities for culinary experts, marketers, operations specialists as well as app developers.<p><p>F&B expands beyond that of culinary arts and restaurant management. Instead, it demands talents of various backgrounds and expertise. </p><p>Whether you are passionate about service, food, or even innovation. There are various vacancies available in the F&B industry. Browse the listings at <a href="https://mycareersfuture.sg">MyCareersFuture.sg</a> to find out more now! </p><h2>Types of Employment in F&B</h2><p>One of the greatest attractions of working in F&B is that there are several types of employment. These include but are not limited to:</p><ul><li>Full-time</li><li>Permanent</li><li>Freelance</li><li>Contract</li><li>Part-time</li></ul><p>There is some flexibility for all who want jobs in F&B. For instance, if one is still schooling, one could opt for part-time jobs in F&B to get a head start before graduation. <p><h2>Specialisations in F&B Jobs </h2><p>The F&B industry in Singapore has been on the rise and there is now a need for organizations to expand beyond just serving scrumptious delights. Instead, companies are looking for more ways to stand out from their competitors. In this sense, there are more opportunities for jobseekers outside of just service and culinary arts. 3 in-demand specialisations in F&B include:<p><h3>1. Service </h3><p>While food may whet a customer’s appetite, the first-class service is what would keep them coming back to a restaurant. <p><p>The service crew is an integral body in any business. They are responsible for managing customer expectations, dealing with customer queries, and also ensuring that the customers are fully satisfied. The service crew may also be asked to produce some simple drinks and dishes. </p><p>Some roles in service include:</p><ul><li>Server/Waiter</li><li>Host </li><li>Barista </li><li>Cashier </li></ul><h3>2. Marketing</h3><p>While service may play a critical role in enhancing brand loyalty, an organization would depend heavily on effective marketing to gain customers’ attention amidst tight competition. All F&B marketers need to identify a restaurant’s unique selling points to stand out from its competitors. Common job titles in marketing include:</p><ul><li>Web/app developer</li><li>Writer</li><li>Digital marketer</li><li>Graphics designer </li></ul><h3>3. Operations & Logistics </h3><p>Before a restaurant can open for business, it would need to get key ingredients first. A restaurant also has to have an operations and logistics team to oversee all business transactions, operations and administrative duties to ensure that business runs smoothly across all outlets. Some roles in operations and logistics include:</p><ul><li>Purchasing manager</li><li>Procurement specialist</li><li>Logistics supervisor </li><li>Head of operations</li></ul><p>Click <a href="https://content.mycareersfuture.sg/food-services-occupation-insights/">here</a> for more occupation insights about working in F&B. <p><h2>Explore Opportunities in F&B </h2><p>Behind every tasty dish is a team of professionals that manage and oversee various aspects and responsibilities of a restaurant. If you think you have what it takes to thrive in F&B then apply today! <p>`,
  GENERAL_MANAGEMENT: `<h1>Apply for General Manager Jobs in Singapore</h1><p>General management refers to the diverse range of responsibilities required to keep an organisation running. With an increasing number of businesses in the market, general management will become a crucial aspect of every company and the demand for such jobs will indeed see a rise. As a general manager, you will be able to set forth on an exciting profession and the opportunities for jobs in this field are endless in Singapore.</p><h2>Role of a General Manager</h2> <p>General managers are tasked to oversee the administration of the business, make decisions and manage manpower, operations and quality of work, in line with the company&rsquo;s goals and objectives. Since a general manager takes charge of almost every aspect of the company, he/she is expected to possess business management, administrative, clerical, human resources, customer service and sales knowledge. These are skill sets that can be applied in any industry, thus making jobs in this line of work attractive as they open doors to a variety of experiences and opportunities.</p><p>-General managers must think ahead of time and implement changes and update company policies in view of impending challenges. They must also think out of the box, have strong business acumen and be able to turn their visions into reality.</p><p>-Strategic-thinking: It is important for general managers to take into consideration all internal and external factors when making decisions for the company.</p><p>This requires them to have an analytical mind and be able to weigh the pros and cons behind every intended decision.</p><p>-Conflict and crisis management: general managers will be required to actively manage conflicts and negotiate the best and fair outcome for all parties.</p><p>This also requires them to have strong interpersonal skills to foster <a href="https://content.mycareersfuture.sg/how-build-positive-company-culture/">team building and unity among colleagues</a>. At the same time, certain external forces may not be in their control and thus may cause crisis and chaos. The general manager must have the ability to think on his/her feet and act in times of crisis.</p><p>A career in general management will develop you into a strong team player, and with a vast amount of experience, you will be an asset to any company, locally and abroad. You can search for general manager jobs in Singapore, including specialised roles of business management and business administration on the <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> portal.</p>`,
  GENERAL_WORK: `<h1>General Worker Jobs in Singapore</h1><p>In every industry, general workers are critical to the smooth functioning of the systems and processes that underpin the operations of a business. These roles ensure that others can fully focus on their roles that are at the core of the business. While such jobs will require a certain degree of technical experience with respect to the field, typically, general workers are trained on the job. Such jobs also provide employment for individuals who are still working on acquiring qualifications in more specialised vocations and are in need of a source of income to support themselves at the present moment. Moreover, general worker jobs can also introduce employees to the basics of the industry and through the job, they can learn more about the demands of the field and <a href="https://content.mycareersfuture.sg/future-work-5-things-singapore-needs-prepare/">alternate career paths they can explore</a>. There are different types of general worker jobs in Singapore across diverse industries. They may be given alternative titles depending on the organisational structure.<p><h2>What is a General Worker?</h2><p>As the name suggests, a general worker carries out general duties and responsibilities within the organisation. What constitutes as general work will depend on the nature of the business and the industry. The range of general worker jobs in Singapore can be explored through different fields of work. Some of them are explored below:<p><h3>Construction</h3><p>A general worker in a construction company in Singapore or in fact anywhere else in the world will typically be involved simple tasks that he/she can learn on the job. They include cleaning the work site as well as loading and delivering materials to the site. Other responsibilities also include the operation of different kinds of tools and machinery, such as blowtorch, forklifts and water sprays. While these types of jobs require a trained workforce, they are referred to as general work with specialised skillsets. General workers in construction must also have the physical strength to endure the tough environments they work in.<p><h3>Logistics & Supply Chain</h3><p>Within the logistics and supply chain sector, general work refer to administrative and logistical duties. They include housekeeping, driving, dispatching, delivery and management of goods inventory, among many other responsibilities. Some of the job titles you may come across when you search for general worker jobs in Singapore include Warehouse Assistant, Warehouse Supervisor and Production Operator.<p><h3>Manufacturing</h3><p>Those searching for general worker jobs in the manufacturing and production fields will come across job roles that require the fulfilment of basic operational functions. They include the loading/unloading, collection and delivery of goods, storage maintenance as well as the operation of different tools and machines such as the forklifts and other heavy equipment. Other responsibilities can include the cleaning of work stations and equipment.<p><h3>Office-based vocations</h3><p>Within an office-based environment, general worker jobs can include basic administrative duties such as cleaning, filing, photocopying, pantry management and other ad-hoc services that are required for the smooth operation of the office.<p><p>Those looking for general worker jobs in Singapore will be able to search for relevant roles on the MyCareersFuture.sg portal. <p>`,
  HEALTHCARE_PHARMACEUTICAL: `<h1>Explore Private Sector and Government Healthcare Jobs in Singapore </h1><p>With an increasingly ageing population, the demand for healthcare jobs is rising in Singapore. From nurses to physiotherapists, the options for a fulfilling job in healthcare are endless. Buoyed by an increasing need for professionals who are able to perform clinical, technical and support functions in the medical line, the competition within the healthcare industry itself is resulting in strong growth opportunities for career advancement. </p><p>Renowned for quality medical practices, Singapore becomes an obvious choice for private medical companies to set up research and development (R&D) departments here. Likewise, as several community hospitals and polyclinics are set to open, there is a projected increase in healthcare jobs that span across experience and qualification levels in Singapore. </p><p>Jobseekers can look to <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> for a range of healthcare jobs in Singapore – both in the government administration and the private medical sector. </p><h2>Healthcare Industry in Singapore</h2> <p>The healthcare industry in Singapore constitutes of both government and private sector jobs.</p><ol> <li> <h3>What Type of Healthcare Jobs are there? </h3> <p>Most healthcare jobs require some degree of specialised knowledge in the field, but there are options for individuals coming from varying education backgrounds. </p><p><em>Clinical Healthcare Jobs</em> are best suited for those who have a background in medical schooling. Clinical healthcare jobs include but are not limited to:</p><ol> <li>Doctors and Surgeons </li><li>Lead Registered Nurses</li><li>Paramedics</li><li>Therapists and Counsellors</li><li>Veterinarians </li></ol> <p><em>Administrative Healthcare Jobs</em> are equally important for the support function they provide to doctors and nurses. These administrative functions include but are not limited to:</p><ol> <li>Account Executives</li><li>Clerks</li><li>Administrative Medical Assistants</li><li>Coordinators</li><li>Operations Executives and Managers </li></ol> </li><li> <h3>What Healthcare Jobs Are in Demand</h3> <p>Driven by a rapidly ageing population and subsequent increase in chronic ailments, the industry is constantly on the lookout for professionals eager to pursue a rewarding and meaningful career in healthcare. As the key driver in healthcare shifts to senior-focused palliative care, jobs in this line are evolving to require a combination of skills. With medical schemes like the Medishield Life and Eldershield in Singapore evolving to match the needs of Singaporeans – especially the elderly – support staff, medical policy experts and experienced caretakers are pivotal in cushioning the change in Singapore’s healthcare scene. Due to this, some of the healthcare jobs that are particularly in demand are:</p><ol> <li>Home Health Aides</li><li>Nurses</li><li>Occupational Therapists</li></ol> </li></ol> <h2>Applying for Healthcare Jobs in Singapore </h2> <p>Landing a job in healthcare is not as challenging as one may think. Whether you are starting your career or making a switch, an industry veteran shares her tips on <a href="https://content.mycareersfuture.sg/how-to-land-a-job-in-healthcare-3-tips-from-an-industry-veteran/">making a successful switch to the healthcare industry</a>.</p><p><a href="https://content.mycareersfuture.sg/job-seekers-toolkit/industries/healthcare/">Understanding the motivations and steps other healthcare professionals</a> have taken can also aid in helping you strategise your own career path in the healthcare industry. </p>`,
  HOSPITALITY: `<h1>Check Out Hospitality Jobs in Singapore</h1><p>Do you enjoy working with people? Want a career in a fast-paced and rigorous but rewarding industry? The hospitality sector might be the perfect industry for you.</p><p>The hospitality management industry is anything but boring. In fact, this industry requires strong interpersonal communication skills, leadership, initiative as well as a willingness to go the extra mile for customers. </p><p>In Singapore, <a href="https://content.mycareersfuture.sg/insiders-guide-switching-career-hospitality/">the hospitality sector is definitely booming</a>. There is a myriad of opportunities on our jobs portal at <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a>. </p><h2>Subfields in Hospitality Management</h2> <p>Just like all modern service industries, the hospitality business is consistently reinventing itself. Today, the term “hospitality” incorporates various subfields with different types of specialisations. 2 main fields that have been rapidly swelling include hotel management and food & beverage (F&B). Find out more about each subfield and what roles one can apply for by reading on. </p><h3>Hotel Careers in Singapore</h3> <p>With numerous tourists coming to view some of its magnificent developments, the number of hospitality jobs at hotels has spiked in Singapore. Unlike desk-bound jobs at offices, hospitality most careers at a hotel (aside from corporate roles) will definitely require one to face hotel guests as well as manage operations and logistics while upholding a sense of professionalism.</p><p>Here are some examples of hotel jobs categorised by various divisions in the hotel industry:</p><ul> <li>Food Operations: <ul> <li>Banquet staff</li><li>Restaurant Manager</li><li>Team Captain</li><li>Chef </li><li>Host</li></ul> </li><li>Hotel management: <ul> <li>Hotel general manager</li><li>Group sales executive</li><li>Spa manager</li></ul> </li><li>Event planning: <ul> <li>Event planner</li><li>Event manager</li><li>Wedding coordinator</li></ul> </li><li>Hotel front desk: <ul> <li>Front desk service staff</li><li>Bellhop</li><li>Concierge</li></ul> </li></ul> <p>If one wants to focus more on travel planning and travel management, the tourism industry might be more fitting. <a href=""https://www.mycareersfuture.sg/job/travel>Click here to view the latest tourism careers in Singapore</a>. </p><p>While it is not mandatory for all applicants to have a degree in hospitality and tourism management to embark on a career in hospitality, most recruiters would prefer applicants with some experience. Then again, a willingness to learn, strong interpersonal communication skills as well as a drive to serve customers would be valued. </p><h3>F&B Jobs in Singapore </h3> <p>In Singapore, the local F&B industry is challenging and competitive. The food paradise has a massive number of restaurants, cafes and eateries demanding for skilled and competent applicants to join their business. It is essential for eateries to acquire a team of hardworking and competent team members in order to give their customers the best experience possible. </p><p>If one has a passion for food and a keen interest in serving customers, the F&B industry will provide an eye-opening experience.</p><p>Some F&B jobs one could consider include:</p><ul> <li>Chef</li><li>Service staff (server)</li><li>Restaurant manager</li><li>Dishwasher</li><li>Bookkeeper/accountant </li><li>Operations </li><li>Marketing </li></ul> <p>Not surprisingly, the F&B industry is a fast-paced one. Stamina as well as resilience are essential on a daily basis. </p><h2>First-Class Service with a Smile</h2> <p>The end of growth in the hospitality industry in Singapore does not seem to be in sight. With more demand for excellent service from both locals and tourists, there will be numerous vacancies for any applicant who aspires for a career in the hospitality industry. </p>`,
  HUMAN_RESOURCES: `<h1>A Jobs Bank of Human Resources Jobs in Singapore and More</h1><p>Are you passionate about working with people?<p><p>Are you a problem-solver and a multi-tasker?<p><p>You might thrive in a career in human resources! In Singapore, where work-life balance is vital and working conditions are key in facilitating productivity and efficiency in every working environment, organizations depend on their human resources departments (or HR departments) to oversee various aspects of employment. The main functions of a human resource department include but are not limited to:<p><ul><li>Compliance with labour law</li><li>Administration of employee benefits</li><li>Recruitment </li><li>Employment standards </li><li>Organizational development</li><li>Training and learning</li><li>Payroll </li><li>Maintaining a safe work environment </li></ul><p>If you are thinking of embarking on a career in human resources, MyCareersFuture.sg has a wide range of vacancies for you to choose from. Browse and apply today! <p><h2>Human Resources Meaning </h2><p>A human resources department in any organization is synonymous with the idea of an administrative department which handles most employee-related concerns. But what exactly is the meaning of human resources?<p><p>As opposed to the traditional ‘hire and fire’ role, the human resource department is much more involved in a company’s overall vision and mission. <p><p>By definition, human resources refers to the personnel of an organization that manages administration, training, and hiring of staff. The department of human resources is also responsible for motivating the staff, enforcing organizational behaviour and managing the human capital within an organization.<p><p>The ultimate aim of the human resource department in any organization in Singapore and beyond is to boost productivity and efficiency through developing and administering programmes. Click <a href="https://content.mycareersfuture.sg/manpower-woes-5-ways-asingapore-smes-better-manage-human-resources/">here</a> for some insightful tips about how a human resource department can better manage company resources. <p><p>To summarise, a human resource department acts as a main administrative body in a company which oversees important day-to-day activities across a broad spectrum of specialisations. <p><h2>Common Career Titles for Human Resources Professionals </h2><p>While the nature of human resources is rather diverse, professionals in human resources tend to specialise in a particular expertise. However, depending on the size of the company, one could be involved in various disciplines in human resource management. <p><p>Here are 7 examples of career titles:<p><ul><li>Human resource manager</li><li>Recruiter</li><li>Training development specialist </li><li>Personnel Analyst</li><li>Financial controller</li><li>Human resource generalist </li><li>Personnel analyst </li></ul><h2>Relevant Skills to Thrive in Human Resources </h2><p>While there may not be a one-size-fits-all <a href="https://content.mycareersfuture.sg/3-ways-align-resume-job-application/">resume template</a> for all who want to apply for a job in human resources, most recruiters would lookout for the following:<p><ul><li>Meticulousness and attention to detail</li><li>Level-headedness and superb organizational skills in managing administrative paperwork</li><li>Compassion and empathy for others </li><li>The ability to multi-task</li><li>Excellent interpersonal communication skills </li><li>A strong commitment to the overall aims and goals of an organization</li></ul><p>While educational and academic qualifications might be an advantage for all jobseekers who are looking for opportunities in human resources, some organizations might be able to provide relevant training. <p><h2>Start Your Human Resources Career Today</h2><p>An efficiently run and united human resources department can provide any organization with structure and the ability to reach business goals through smart planning of a company’s resources. If you think you have what it takes to take a company to further heights, apply now!<p>`,
  INFORMATION_TECHNOLOGY: `<h1>Browse Information Technology Jobs in Singapore</h1><p>We live in a digital era.</p><p>In a world where smart systems run business and commerce, information technology (IT) presents countless opportunities for entry-level and senior level jobseekers in Singapore. Our website contains some of the latest part-time, full-time and permanent IT jobs in Singapore. Find roles in IT on <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> to get started on your career today. </p><h2>An Expanding Industry</h2> <p>A career in information technology does not only entail IT support jobs in Singapore.</p><p>In fact, the industry is rapidly expanding!</p><p><a href="https://content.mycareersfuture.sg/takes-join-fintech-industry/">Fintech (financial technology) industries</a> have been expanding their ventures to stay afloat amidst economic growth. There is a greater demand for IT talents amongst various specialisations including IT security, financial management, asset management, software engineering, banking and procurement. Plenty of jobs and opportunities await tech wizards in Singapore. </p><p>Here are some popular roles at information technology companies in Singapore: </p><ul> <li>IT support consultant </li><li>Security consultant </li><li>Product development executive </li><li>Technology Risk Advisor </li><li>IT Project Engineer </li><li>Cybersecurity Analyst</li><li>IT Infrastructure Analyst </li><li>Software Engineer</li><li>Mobile Apps Developer </li></ul> <h2>3 Top IT and Tech Skills in Demand</h2> <p>Singapore has no lack of IT and tech companies. Competition is getting increasingly stiff! </p><p>It’s not enough to be familiar with Adobe Suite, Java architecture and UX/UI development. These days, information technology companies in Singapore favour applicants who are willing to learn and work in a team. </p><p>To be successful in IT, one has to be creative and adaptable to growing trends. </p><p>But what IT and tech skills are in demand at the moment? We have highlighted 3 of them below.</p><ol> <li> <h3>Mobile Development</h3> <p>More and more tech and information technology companies in Singapore have been focusing on mobile-first applications simply because mobile is the most convenient and widely used device in the world. In fact, there are more mobile phones in the globe than people today!</p><p>For a company to stay relevant, they would need mobile apps. </p><p>If you are able to build apps for others, you will definitely be a competitive applicant. </p><p>Some organizations that have been on the hunt for mobile development talents include: </p><ul> <li>B2B IT solutions providers </li><li>E-commerce websites </li><li>Mobile design and development agencies </li></ul> </li><li> <h3>Cybersecurity </h3> <p>With recent cases of security breaches and hacking, more and more companies have been upping their protection against cybersecurity threats.</p><p>Applicants who apply for roles in cybersecurity might be tasked to manage cyber governance, vulnerability as well as network and operating systems security.</p><p>One would not need a degree in cybersecurity necessarily, but all applicants are expected to have the relevant technical and analytical skills to be successful in their applications. </p><p>Cybersecurity is a broad specialisation that opens plenty of doors for applicants. One could start with these industries: </p><ul> <li>Government </li><li>Tech companies</li><li>Telecommunications companies </li></ul> </li><li> <h3>Artificial Intelligence (AI)</h3> <p>Artificial intelligence (AI) and automation have rapidly revolutionised the landscape of work by relieving organization as manual labour. While the demand for AI specialists has been great, there is a significant shortage of AI talents. </p><p>AI is versatile and useful in countless ways. Specialists of AI would find a multitude of career opportunities in the following sectors: </p><ul> <li>Research & Development </li><li>Tech services company </li><li>Human resource </li></ul> </li></ol> <h2>The Future is Digital</h2> <p>Digitization in Singapore has no end in sight. Will you make your mark on the IT industry in Singapore?</p><p>Click <a href="https://content.mycareersfuture.sg/category/job-seekers-toolkit/land-the-job/">here</a> for some helpful tips that could help you ace your job application and interviews. </p>`,
  INSURANCE: `<h1>View the Latest Insurance Jobs in Singapore </h1><p>Are you looking for vacancies at Singapore insurance companies? Look no further for jobs and the latest opportunities at <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg’s</a> jobs portal. Boasting a myriad of opportunities across various industries in Singapore, our platform helps you get started on your career in insurance. </p><h2>The Insurance Industry in Singapore</h2> <p>The insurance industry in Singapore is broad and diverse. There are various types of sub-groups and specialisations within the insurance industry including:</p><ul> <li>General insurance </li><li>Life insurance</li><li>Health insurance</li><li>Corporate insurance </li><li>Marine insurance</li><li>Aviation Insurance </li></ul> <p>Growth in various divisions of the insurance sector of Singapore prove that the industry is definitely expanding. Thus, there will be a greater demand for manpower amongst insurance companies in Singapore to cope with increasing competition. </p><h2>What Jobs Are There in The Insurance Sector of Singapore?</h2> <p>Whether you are a fresh graduate, a seasoned veteran or even an individual who has decided on a career switch, the insurance sector promises numerous fresh opportunities for all. Find out more about the types of jobs you can expect to find when you use on our jobs portal. </p><h3>Part-Time Insurance Jobs in Singapore</h3> <p>One highlight of the insurance industry is flexibility. It is actually possible to explore the insurance sector on a part-time basis. Part-time insurance jobs are excellent eye-openers for students who are thinking of exploring the industry before graduating.</p><p>Some part-time insurance jobs include: </p><ul> <li>Financial advisor</li><li>Sales consultant </li><li>Administrative assistant </li><li>Finance assistant</li></ul> <p>These roles act as stepping stones for any applicant who desires to learn more about the insurance industry and what day-to-day life would be like. </p><h3>Insurance Jobs for Fresh Graduates in Singapore</h3> <p>Contrary to popular belief that one would need a background in finance or business to enter the insurance sector in Singapore, the industry actually welcomes all types of academic backgrounds. </p><p>Some insurance companies conduct fresh graduate training programmes which equip all applicants with the necessary knowledge and certification to be a legal consultant in Singapore. </p><p>Here are some jobs for entry-level applicants include: </p><ul> <li>Underwriter </li><li>Financial Consultant </li><li>Business Analyst </li><li>Junior Executive </li><li>Broker </li><li>Junior accountant </li></ul> <p>Even if one does not have prior experience in insurance or financial knowledge, insurance companies would favour a willingness to learn as well as diligence. One would also have to be extroverted and open to meeting new people.</p><h3>Senior-Level Jobs in The Insurance Sector</h3> <p>The insurance sector encompasses numerous opportunities for growth. </p><p>If you have more than 5 years’ experience in insurance, these roles would be suitable:</p><ul> <li>Senior financial consultant </li><li>Financial accountant </li><li>Senior broker </li><li>Senior Underwriter </li><li>Project Manager </li></ul> <p>Individuals with more senior designations might be tasked to mentor juniors and other entry-level applicants in training programmes. </p><h2>Start Applying Now!</h2> <p>A career in insurance will be dynamic, fast-paced, challenging at times, but also rewarding and insightful. To be successful in your job applications, one will have to be open-minded and goal-oriented. By being hardworking and committed to your company’s long-term goals, you will truly be an asset to the company.</p><p>Click <a href="https://content.mycareersfuture.sg/category/job-seekers-toolkit/land-the-job/">here</a> for some articles about how you can grow your career in insurance. </p>`,
  LEGAL: `<h1>Work in the Legal Industry in Singapore</h1><p>Are you an aspiring lawyer? Are you keen to explore the workings of the law industry?</p><p>Being part of the legal industry in Singapore is a challenging yet fulfilling job. While it pushes you beyond your comfort zone, a key aspect of this job is being able to help people fight their corner.</p><p>In Singapore, there are different tracks you can choose when you enter the law industry. You can be:</p><ul><li>A barrister who engages in litigation-related work in the court</li><li>A solicitor who will be involved in legal counsel work and provide advisory and conveyancing services</li><li>A legal secretary who will support lawyers through secretarial duties</li></ul><p>Before joining the law industry in Singapore and practising as a lawyer, the candidate must acquire relevant qualifications that are recognised by the courts in Singapore. Thereafter, he/she will be required to be called to the Bar, an important qualification for all law practitioners in the legal industry. Depending on your specialisation, some lawyers will also be expected to attend courses and seminars during their time as a lawyer in order to keep their practising certificate.</p><p>Read on to learn more about the legal industry and how you can begin your law career in Singapore. You can also browse the available full-time and part-time legal jobs in Singapore on the <a href="https://www.mycareersfuture.sg">MyCareersFuture.sg</a> portal.</p><h2>Types of Legal Jobs in Singapore</h2><p>There are different fields of law, such as Intellectual Property, Commercial Law as well as Civil Law. There will thus be different career paths and specialisations to embark on within the legal industry in Singapore, and this depends on where your interests and capabilities lie.</p><h3>Work in a Law Firm</h3><p>Those who want to join a law firm will find themselves working alongside a team of trainees, legal associates and partners. Typically, aspiring lawyers pursuing a law qualification can take up an internship at a firm in Singapore or in the country they are studying in. This will give them exposure to the workings of the legal industry. Upon graduation, they will work as a legal trainee while studying for their Bar exams. After being admitted to the Bar, they will then work as a legal associate in the firm.</p><p>Legal associates in Singapore are typically involved in legal entry work, which includes documentation and research, before working their way up the hierarchy to become a senior associate, partner, managing partner and so on. You can also work as a legal counsel on a part-time or full-time basis after acquiring enough practice experience that gives you the professional expertise to advise the firm&rsquo;s clients.</p><p>Those looking for legal associate jobs in Singapore can reach out to the law firms that they have completed their trainee and internship contracts with, or link up with new firms.</p><h3>Be a Part of An In-house Legal Counsel</h3><p>Lawyers who enjoy advisory work can join the legal departments of large corporations or organisations. Typically, these entities require a level of legal counsel to advise them on conveyancing and contract work within the laws of Singapore. There are also jobs available in the government sector where you can provide legal counsel work to ministries in Singapore, or be part of the Legal Service as a judge or prosecutor.</p><h3>Join as a Legal Secretary</h3><p>You can also join the legal industry in Singapore as a legal secretary. The role of a legal secretary requires you to fulfill personal assistant and secretarial duties for lawyers and the department. This includes taking minutes for meetings, managing travel arrangements for lawyers to meet clients, taking charge of calendaring and other administrative duties.</p><p><br/>If you are up for a challenging yet rewarding career in the legal industry in Singapore, apply for your desired role via our jobs portal. Whether you are a legal counsel, associate or secretary in Singapore, you will be part of a strong legal community in the country doing their part for justice. Be sure to <a href="https://content.mycareersfuture.sg/4-questions-jobseekers-ask-researching-potential-employers/">research your potential employers</a> to understand more about their legal scope of work and how you can contribute to the team!</p>`,
  LOGISTICS_SUPPLY_CHAIN: `<h1>Logistics and Supply Chain Jobs in Singapore</h1><p>Singapore is the leading logistics hub in Asia owing to its central location in Southeast Asia. With a strong presence of local and global enterprises in the region, we build connections with manufacturers and customers around the world to establish a robust supply chain network.</p><p>The logistics and supply chain industry in Singapore has been evolving, with the help of government-run initiatives, such as the Logistics Industry Manpower Plan. These aim to expand the industry through innovation and increase the value of each worker in this sector. </p><p>The opportunities are endless for those who want to start a career in the logistics industry. There is a range of logistics jobs available in Singapore, which include duties within the realm of freight delivery, inventory control and merchandise assembly, among many others. Explore the <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> portal and find your dream job in the logistics industry!</p><h2>Opportunities in Logistics - How You Can Begin Your Career in Singapore.</h2> <p>The logistics industry in Singapore comprises three essential components that help to support the country’s supply chain network. Those interested to be part of this booming industry will have a myriad of jobs to choose from and be able to develop their career in any of the following sub-sectors: </p><ol> <li><strong>Contract logistics:</strong> a comprehensive process from production to distribution, which includes warehousing, designing facilities and planning supply chains</li><li><strong>Freight forwarding:</strong> the manner in which goods are transported from one country to another, including the processes pertaining to storage and shipping of merchandise</li><li><strong>Land transportation:</strong> the delivery of goods around Singapore</li></ol> <h2>Popular Logistics Jobs in Singapore</h2> <p>The logistics and supply chain jobs available across the above sub-sectors in Singapore cover operational and management positions, which are available full-time and part-time. Some of the roles include but are not limited to:</p><ul> <li>Warehouse manager</li><li>Logistics coordinator</li><li>Shipping and packing clerk</li><li>Driver</li><li>Customer service officer</li><li>Procurement officer</li><li>Security personnel</li></ul> <p>Those who wish to join the logistics and supply chain industry will need to possess the required educational or technical certification in Singapore depending on the nature of the jobs they take up within the private and public sector. Logistics companies often provide training and continuous skills upgrading to ensure that the manpower consistently performs amid the changing landscape of the industry. This often involves partnership with SkillsFuture and Workforce Singapore. At the same time, it is imperative that candidates keep a lookout for advancements in the industry so that they can better equip themselves with the qualifications and be ready for their dream jobs in the field. </p><h2>The Future of The Logistics Industry in Singapore</h2> <p>The industry has seen major global shifts, led by emerging business and manufacturing trends, as well as advancements in new technology. Warehouses and freight movement are now underpinned and improved with the help of data analytics, automation and smart solutions. This allows for higher productivity and inventory accuracy at unprecedented levels, that too at lower operational costs.</p><p>These advancements open up a new array of career options within the logistics industry in Singapore, allowing professionals the flexibility to apply their skillsets in this field when they choose to switch industries. Apply today and make your mark in the logistics industry!</p><p>Are you writing a resume for a logistics job in Singapore? In order for employers to be convinced that you are the right fit for the job, you must match your skills and experience with the expectations of the role. This requires meticulous crafting of your resume that is relevant to the jobs you are applying for. Find out what you need to do to <a href="https://content.mycareersfuture.sg/3-ways-align-resume-job-application/">align your resume with your dream job</a> in the industry. </p>`,
  MANUFACTURING: `<h1>Explore Jobs In The Manufacturing Industry in Singapore</h1><p>The manufacturing industry stands as one of Singapore’s biggest economic contributors. With technological advancements, the manufacturing industry, like all other industries, is evolving. The key sectors in Singapore’s manufacturing industry include electronic engineering, chemicals, biomedical sciences, transportation engineering as well as logistical management. <p><p>With key manufacturing industry leaders in Singapore, the number of job opportunities are aplenty. To complement and support the move into Industry 4.0, Singapore continually sees initiatives that help to cement Singapore's position as a world-class industrial and manufacturing hub.<p><p>As the manufacturing industry continues to evolve and shift with technological disruptions and demand for high-quality products, the demand for manufacturers across sectors are still present. Apply for manufacturing jobs on the MyCareersFuture.sg portal. <p><h2>What Do Manufacturers Do? </h2><p>Manufacturing engineers or manufacturers are typically responsible for manufacturing processes, streamlining them for efficiency, and overseeing the end-to-end development and testing of new products and services. Depending on the industry, the job responsibilities in manufacturing can vary in terms of skill, dexterity and technical knowledge. <p><p>General Job Duties in Manufacturing:<p><ul><li>Evaluating manufacturing processes through research programs</li><li>Assure and conduct quality control checks for products and services </li><li>Calculate production, labour and material costs to streamline manufacturing decision-making </li><li>Keeping equipment operationally-ready by conducting and coordinating maintenance and repair services </li><li>Hiring and managing manufacturers </li><li>Being technically adept at using technical equipment and machinery </li></ul><h3>1. Types of Manufacturing Jobs </h3><p>Within the manufacturing industry, the types of opportunities available range from skill-specific jobs to managerial positions. Likewise, there are manufacturing jobs across industries like chemical engineering, biomedical, and electronic engineering. Take a look at some of the positions in manufacturing: <p><ul><li>Electronic Assembler</li><li>Precision Assembler</li><li>Warehouse Production Worker</li><li>Engineer</li><li>Structural Metal Fabricator</li><li>Processing Equipment Operator</li><li>Electromechanical Technician </li><li>Chemical Plant Operator </li><li>Distribution Manager </li><li>Materials Management Supervisor </li></ul><h3>2. Skills Required For Manufacturing Jobs </h3><p>The manufacturing sector continues to shift and evolve, just like other industries, in accordance with technology, demand for higher quality products and streamlined services. Hence, the need for manufacturers, engineers, and production managers to always keep up with the relevant skill sets and knowledge is essential to advancing and doing well in this field.<p> <p>Skills Desired By Employers in Manufacturing:<p><ul><li>An aptitude for technology</li><li>Strong communication skills</li><li>Problem-solving skills </li><li>Analytical rigour </li><li>Good knowledge of quality management systems </li><li>Knowledge in product design </li><li>Lean manufacturing or Six Sigma </li></ul><h2>Apply For Manufacturing Jobs In Singapore</h2><p>Landing a job can be challenging given the competition and demand for highly-skilled employees in this field. First time jobseekers should capitalise on the opportunity for learning and self-improvement to enhance their employability in the market. <p><p>When job hunting, it is also crucial that jobseekers work on writing effective job application emails to improve their chances of getting an interview. <p>`,
  MARKETING_PUBLIC_RELATIONS: `<h1>Latest Marketing Jobs in Singapore </h1><p>The marketing sector in Singapore is thriving. One of the strongest in Asia and presents countless opportunities for applicants of various specialisations. Due to the fast-paced and competitive nature of the marketing in Singapore, the industry will always need fresh blood and new ideas. </p><p>Marketing can be done in an agency or in-house. Here are some roles in marketing: </p><ul> <li>Content writer</li><li>Graphics designer </li><li>Account Manager (only for agencies) </li><li>Tech support staff </li><li>Sales consultants </li><li>Communications executive </li></ul> <p>If you are looking for an opportunity in a challenging, dynamic and enriching sector, the marketing sector will definitely intrigue you. We have the latest marketing opportunities in Singapore on <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg’s</a> jobs portal, browse and apply today!</p><h2>How Many Types of Marketing are There?</h2> <p>The world of marketing is diverse and dynamic mainly because there are a broad range of marketing strategies and models. </p><p>While there is no specific number that can account for the various types of marketing, we have zoomed in on 3 of the most popular types of marketing in Singapore.</p><ol> <li> <h3>Digital Marketing </h3> <p>In a world where there are more mobile phones than people, digital marketing is definitely flourishing in most parts of the world – especially in Singapore. To date, there are more than 60 digital marketing agencies in Singapore. It is a competitive environment that equips you with relevant knowledge and skills. </p><p>Some digital marketing companies would prefer for their candidates to have experience in search engine optimisation (SEO), paid advertising, content writing, and blogging. </p><p>You would not need a degree in digital marketing to enter the industry. Instead, candidates must have a willingness to learn, an ability to think on their feet as well as creativity. Digital marketing agencies in Singapore would favour minds that are innovative and competitive. They value drive and determination. </p><p>Can digital marketers work from home?</p><p>Yes, definitely! It’s actually possible for digital marketers to work from home as long as one has a computer and internet connection. Bear in mind that this also depends on your company’s policy.</p></li><li> <h3>Direct Marketing </h3> <p>Direct marketing might be more suitable if one prefers not to be deskbound. It involves direct communication with customers and potentials through roadshows, cold calls as well as outreach via mobile and email. </p><p>Direct marketing is the preferred advertising strategy for small-medium enterprises (SMEs) and startups in Singapore as it eliminates the media as the ‘middleman’ between the company and its customers.</p><p>To be successful in direct marketing, one has to be persistent and also great with people. Direct marketers are often promoted based on the number of deals they get – in this sense, it can get a bit competitive. </p><p>Depending on the nature of your organization, you might also get commission from the deals you managed to clinch. </p></li><li> <h3>Social Media Marketing</h3> <p>If there is one thing most millennials are very savvy with, it is social media.</p><p>Today, there are more than 1 billion users on Facebook, 1 billion active accounts on Instagram, 261 million Twitter users, and 575 million LinkedIn profiles. Social networks act as platforms for content-sharing, networking as well as marketing.</p><p>With the rise of social media comes the inception of more and more social media marketing agencies in Singapore. Unlike digital marketing, social media marketing focuses more on building a connection with your customers and brand image. It demands quick turnarounds, creativity and sometimes even boldness. </p><p>To be successful in social media marketing, one must be bold and able to take risks in order to stand out from his competitors. </p></li></ol> <h2>The World is Your Oyster</h2> <p>Marketing is a dynamic and ever-changing industry. The industry in Singapore is beckoning, will you take the leap of faith? </p><p>Click <a href="https://content.mycareersfuture.sg/">here</a> for some articles on how you can grow your career.</p>`,
  MEDICAL_THERAPY_SERVICES: `<h1>Medical Career Opportunities in Singapore</h1><p>Have a passion for people, an interest in medicine and medical sciences, and a willingness to serve? The medical industry might be for you.</p><p>There is a <em>myriad</em> of skills and experiences that are in demand in the medical field. This rigorous but rewarding industry demands for service staff, researchers, scientists, engineers, administrative staff and therapists. </p><p><a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg lists</a> a huge number of open positions in the medical field. Browse to embark on your career in medicine in Singapore. </p><h2>The Medical Industry in Singapore </h2> <p>Is the medical industry growing?</p><p>In Singapore, it is <em>definitely</em> swelling. The demand for medical expertise has been escalating in various countries in Asia including Singapore. Spearheaded by rapidly ageing populations with complex healthcare needs and interests, the demand for medical talents has never been greater. In fact, health and medical tourism, where people from abroad travel to another territory in the search for medical treatment, has been on the rise as well. </p><p>The medical industry in Singapore expands beyond hospitals and clinics. Instead, it encompasses innovation hubs and research centres geared towards accelerating medical innovation in Singapore to curb various issues arising from the local ageing population. A medical career path also encompasses countless opportunities for growth. </p><p>When it comes to the topic of innovation, Singapore finds itself at the forefront. To work towards a healthier tomorrow, the medical sphere in Singapore have been demanding for more talents and innovation. </p><h2>2 Myths about the Medical Industry</h2> <p>The medical industry is diverse, challenging but also rewarding. However, there are various assumptions about the industry that deter people from even applying for a role in the first place. This section will debunk 2 common myths most applicants have about the medical industry in Singapore. </p><ol> <li> <h3>One would need a university degree to qualify</h3> <p>Unlike doctors, engineers and researchers who require relevant degrees and education, there are other roles in medical science and medicine that do not need an applicant to have a university education. These include: </p><ul> <li>Research assistant </li><li>Administrative staff</li><li>Clinical assistant </li></ul> <p>While a degree in a relevant field might be preferred, most medical organizations favour a willingness to learn as well as excellent interpersonal communication skills.</p></li><li> <h3>There is no career progression in the medical industry </h3> <p>Career progression, or lack thereof, is one of the biggest deterrents for applicants. On the other hand, some roles in the medical field encompasses a range of growth opportunities. The medical career path in Singapore is anything but stagnant. For instance, nurses can start off as a staff nurse and venture into education, research or even management at a directorial level. </p><p>Jobseekers who want to discover more about the medical field would be able to enhance their medical knowledge and skills by learning on the job. </p></li><li> <h3>Aside from being a doctor or a nurse, there are no other medical careers</h3> <p>The statement above is a far cry from reality as there are many roles besides doctors and nurses. In fact, the industry demands:</p><ul> <li>Researchers</li><li>Engineers </li><li>Scientists </li><li>Research fellows </li><li>Medical technologist </li></ul> </li></ol> <p>These roles are needed to assist research & development in the Singapore medical industry. </p><p>If one has a keen interest in medical science and a passion for research, the medical industry will definitely be an enriching and insightful one. </p><h2>Discover Medical Opportunities in Singapore Today</h2> <p>Will you play your part in creating a healthier tomorrow that starts today? </p><p>Apply today to get started on your medical career by browsing our jobs portal in Singapore! </p><p>Otherwise, view some <a href="https://content.mycareersfuture.sg/job-seekers-toolkit/industries/healthcare/">industry insights</a> about the medical industry in Singapore.</p>`,
  PERSONAL_CARE_BEAUTY: `<h1>Find Vacancies in Personal Care </h1><p>Do you subscribe to the notion that good health incorporates physical and mental well-being? Are you passionate about helping people feel confident and healthy inside and out?</p><p>The beauty and personal care industry in Singapore is an excellent place for individuals who have a passion and dedication for people. </p><p>Browse <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg’s</a> job listings for the latest vacancies and openings in personal care to get started on your career today! </p><h2>Roles in Personal Care</h2> <p>The term “personal care” might seem pretty niche, but the industry is loaded with numerous divisions and specialisations. From fitness, spa, as well as therapy, many exciting and rewarding opportunities await in the beauty and personal care industry of Singapore. </p><p>Here are some roles one could consider: </p><ul> <li>Spa therapist </li><li>Personal trainer </li><li>Manicurist </li><li>Massage therapists </li><li>Fitness instructor </li><li>Beauty advisor therapist </li><li>Consultant </li><li>Receptionist </li><li>Retail executive </li></ul> <p>Career progression in the beauty and personal care industry or Singapore would depend on one’s experience as well as his contributions to the company. Most roles in personal care would involve working with customers and clients. In this sense, applicants have to be comfortable with client-facing as well as building connections with customers.</p><p>To build a successful career in personal care, one must be willing to go the extra mile for his clients. That means – putting in a 110% effort to help your customers feel confident and rejuvenated, inside and out. Happy customers would entail more referrals which could help one build his portfolio. </p><h2>Qualifications to Enter the Personal Care Industry </h2> <p>There are various courses in personal care available at tertiary and higher-level institutions in Singapore. Then again, while having academic qualifications might be favoured, they are not a major requirement for most companies in personal care. </p><p>While the industry might not demand for candidates to have a diploma in personal care and therapy, it’s important for all hopeful applicants to possess key personality traits and personal philosophies that are aligned with the recruiter’s missions and visions. </p><p>Recruiters would prefer applicants who are bubbly, cheerful, polite, and well-mannered. After all, one would need to serve customers on the job. </p><h3>Certifications </h3> <p>Depending on the requirements of the company, one might have to get certification from short courses. This would ensure that applicants get relevant knowledge and skills to contribute to the organization. </p><p>For instance, fitness instructors and personal trainers would need to get trainer certification before joining any fitness company in Singapore. Likewise, Yoga instructors would have to undergo training at a Yoga Studio to become a full-fledged Yoga teacher. </p><h2>Working in the Personal Care Industry of Singapore</h2> <p>What’s exciting and rewarding about the person care industry is that one would not have to face a computer screen for the entire day. Instead, he will be attending to clients and serving customers. </p><p>Also, employees will most likely be working retail hours rather than office hours. Depending on the nature of one’s work, your schedule might also be on an ad-hoc basis. In this sense, one could enjoy greater flexibility in his schedule. </p><h2>A Rapidly Expanding Industry</h2> <p>Due to the demand for personal care experts, the industry is rapidly growing and getting more and more competitive. For one to be successful in this industry, he would need to go the extra mile to ensure his customers get the best experience. </p>`,
  PROFESSIONAL_SERVICES: `<h1>Professional Services Industry in Singapore</h1><p>In Singapore, the professional services industry is booming and its continued development is necessary. Professional services firms must thus consistently upgrade so that they can keep up with the changing industry landscape. At the same time, individuals who are looking to join this industry must be willing to embrace change in a rapidly evolving sector.</p><h2>Professional Services Occupations</h2> <p>Professional services refer to a set of occupations that require specialised training, either in the arts or science, that support businesses in the form of advice or through the fulfilment of tertiary-level roles. While there is no definitive list of job roles that fall under this category, owing to the changing demands of the economy and the birth of niche areas of skill set, the following are some commonly held examples:</p><ul> <li>Accountant</li><li>Lawyers</li><li>Engineer</li><li>Physician</li><li>Veterinary physician</li><li>Consultants</li><li>Veterinarian</li><li>Architect</li><li>Marketers</li></ul> <p>The cosmopolitan workforce and trustworthy regulations make Singapore a preferred choice for professional services firms to develop themselves and serve the needs of businesses and the citizen population. Through thought leadership, exceptional skills training and innovative practices, the sector accommodates companies that thrive in the fields of consulting, law, marketing, accounting and healthcare fields.</p><h2>Why Professional Services</h2> <p>Singapore aims to develop the professional services industry, with hopes of becoming a global leader in providing high-value specialist services that are driven by innovation. In order to stay ahead of the game, the country equips the workforce with specialised skill sets in data science, analytics and artificial intelligence – these are the key areas which will take a strong foothold in economies of the future.</p><p>The growing need for professional services firms is necessary to keep the economy afloat while being able to partner companies around the world to foster a collaborative atmosphere of technical expertise sharing. </p><p>As a host to multinational corporations from wide-ranging industries, Singapore has become the go-to for not only global businesses and investments, but also a springboard for the growth of new professional services. The move towards an age underpinned by digital technologies and smart solutions also gives rise to a new set of professional services that will become a common name in the years to come. Some of these have already begun capturing the attention of jobseekers the market, such as cybersecurity specialists and artificial intelligence engineers. </p><p>Should you choose to work at professional service firms in Singapore, you must understand that your company does not sell a product, but rather knowledge and expertise that are in demand in the market. You will be able to exercise your skills and perform the job that you have been trained for. </p><p>View vacancies available and apply through our <a href="https://www.mycareersfuture.sg/">jobs portal</a>!</p><p>Check out our <a href="https://content.mycareersfuture.sg/category/job-seekers-toolkit/grow-your-career/">Careers Toolkit</a> for tips and insights on how to grow your career in the professional services industry in Singapore.</p><p>Share your experience of the MyCareersFuture.sg <a href="https://www.mycareersfuture.sg/survey">here</a>.</p>`,
  PUBLIC_CIVIL_SERVICES: `<h1>Rewarding Careers in the Public Sector </h1><p>Singapore’s public service employs more than 140,000 officers across more than 10 ministries and more than 60 statutory boards. The diverse sector provides a myriad of jobs and opportunities across various specialisations for individuals who have the drive to serve the public and enhance the quality of governance and leadership excellence. </p><p>Think you have what it takes to make a difference in the public service? <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> has the latest opportunities available on our careers portal. Browse and apply today!</p><h2>An Overview of Singapore’s Public Sector</h2> <p>Singapore’s public sector is a diverse industry with various schemes of service ranging from legal, education, administrative service, civil defence, police and education. </p><h3>Ministries in Singapore</h3> <p>To date, there are 16 ministries in Singapore, these include:</p><ol> <li>Ministry of Communication and Information (MCI)</li><li>Ministry of Defence (MINDEF)</li><li>Ministry of Culture, Community and Youth (MCCY)</li><li>Ministry of Education (MOE)</li><li>Ministry of Finance (MOF)</li><li>Ministry of Foreign Affairs (MFA)</li><li>Ministry of Home Affairs (MHA)</li><li>Ministry of Law (MINLAW)</li><li>Ministry of Manpower (MOM)</li><li>Ministry of Health (MOH)</li><li>Ministry of Manpower (MOM)</li><li>Ministry of National Development (MND)</li><li>Ministry of the Environment and Water Resources (MEWR)</li><li>Ministry of Social and Family Development (MSF)</li><li>Ministry of Transport (MOT)</li><li>Ministry of Trade and Industry (MTI)</li></ol> <p>There are numerous jobs and careers in the ministries for candidates who have a passion for serving the nation across various specialisations. Each ministry has its own specific function. Thus, one has to consider his interests as well as his qualifications before looking for a job in the public sector. </p><p>For instance, if one has an interest in public education, he could look to the Ministry of Education for jobs. Likewise, a candidate with a degree in political science or international relations might select the Ministry of Foreign Affairs for jobs. </p><h3>The Statutory Boards of the Singapore Government</h3> <p>The statutory boards of the Singapore government, or government agencies, report to one specific ministry with relevant functions. Government agencies are given autonomy to perform an operational function. Employees in government agencies are usually referred to as “public servants”. </p><p>Government agencies play an important role in Singapore’s national development by promoting economic development, infrastructure and essential services, education, tourism and public housing and urban redevelopment. </p><h2>Qualifications and Requirements </h2> <p>Most ministries and government agencies would favour candidates with diplomas and degrees in relevant fields. Experience in a related field (from both the public and private sectors) would be an added advantage as most recruiters would want to incorporate new ideas and skill to enhance the quality of public service delivery. </p><p>Furthermore, involvement in voluntary programmes and co-curricular activities in schools would be highly favoured as the public sector prefers for their candidates to be all-rounded. </p><h2>A Dedication to Serve</h2> <p>For progress and stability in Singapore rests on socio-economic harmony, it is critical for the public service to adapt accordingly to the growing demands and interests of the peoples.</p><p>While there are many ministries and a huge number of government agencies in Singapore, the public service sector is extremely competitive. For one to be successful in his application, he has to display a passion for the country as well as valuable knowledge and skills to enhance the quality of public administration.</p>`,
  PURCHASING_MERCHANDISING: `<h1>Career in Procurement: Purchasing Jobs in Singapore</h1><p>Purchasing refers to the functions that are associated with the process of acquiring goods and services required by an organisation. While procurement and purchasing are often used interchangeably, it is important to note that both are different in their intent and scope of work. Procurement is an umbrella term that covers all the processes and tasks involved before, during and after the purchase of commodities. In short, it takes responsibility for identifying a procurement need in the organisation and fulfilling it. On the other hand, purchasing focuses on the expenditures to fulfil the need. It is, as such, a subset of procurement, which supports the procurement process through the straightforward purchase of the commodities. As procurement is a broad category, this field opens doors to various opportunities based on different skill sets and interests. Those looking for a career in procurement can explore purchasing jobs in Singapore on our <a href="MyCareersFuture.sg">MyCareersFuture.sg</a> portal. Grab that vacancy and get a headstart in this field!</p><h2>Purchasing Job Roles</h2><p>Within the field of purchasing, there are a variety of jobs that require a different set of skill sets and level of expertise within the same department. When searching for the ideal role, take a look at the job description listed in the vacancy and match relevant skills to your own. Here are the main purchasing roles you may come across when searching for jobs in Singapore:</p><h3>Purchasing Manager</h3><p>The Purchasing Manager typically takes charge of the purchasing department, which includes the recruitment, training and overseeing of staff. He/she also ensures that all purchases made comply with the purchasing policy of the company. Apart from keeping track of budget and expenditures, the Purchasing Manager also liaises with other departments within the company, such as the accounts team and inventory personnel.</p><h3>Purchasing Clerk/Assistant</h3><p>Reporting to the Purchasing Manager, Purchasing Clerks/Assistants support the daily functions of the purchasing department. They collate all purchase orders and fulfil the requests to complete the procurement process. Liaising with suppliers, reviewing and tracking deliveries of orders and submitting invoices are also part of the daily responsibilities for those who take up this role. The Purchasing Clerk/Assistant also assists in carrying out other procurement activities such as raising RFPs, otherwise known as Request for Proposals, among a range of potential suppliers. He/she may also be required to fulfil administrative duties as and when required by the Purchasing Manager such as arranging meetings, taking minutes and filing, or this may be tasked to a Purchasing Admin Assistant where applicable.</p><h3>Purchasing Agent/Officer</h3><p>You may also come across vacancies for Purchasing Agent or Officer when searching for purchasing jobs in Singapore. Agents/officers typically take charge of the purchase of the materials for business needs and ensure that money is rightfully spent. These tasks may overlap with those of a Purchasing Manager, and in some organisations, the Purchasing Agent takes a managerial role while retaining its job title.</p><p>The title of jobs thus depends on the company structure. Therefore, when searching for purchasing jobs in Singapore, it is imperative to note the requirements of the job posted in the vacancy to better understand the level of expertise needed for the role. With that, <a href="https://content.mycareersfuture.sg/3-ways-tailor-resume/">tailor your resume</a> to the expectations of the role to convince your potential employer that you are the right fit for the job!</p>`,
  REAL_ESTATE_PROPERTY_MANAGEMENT: `<h1>Real Estate Jobs in Singapore</h1><p>The real estate industry is a crucial aspect of Singapore’s economy. It embodies a diverse eco-system all around the country, ranking it among the world’s best as an attractive and vibrant investment destination. Jobseekers looking for real estate jobs in Singapore will be able to choose from different career paths. From a part-time real estate agent to a property valuer, the opportunities are endless.</p><h2>Real Estate Career Paths</h2> <p>There are many career paths and prospects in the real estate industry in Singapore. This spans across corporate, commercial and residential real estate.</p><ul> <li>Management: <ul> <li>A portfolio manager oversees the management and supervision of investments, while a real estate management consultant provides professional services pertaining to clients’ property in Singapore. Property or estate managers work to preserve the property value of an investment in ways that generate income for its owners through, for instance, finding tenants or negotiating leases. </li><li>Being a real estate agent has also become popular among jobseekers. Agents are tasked to assist in the sale and purchase of corporate, commercial and residential property in Singapore. Many in Singapore choose to work as a part time real estate agent for an extra source of income.</li></ul> </li><li>Urban Planning <ul> <li>Those interested in the development of real estate in Singapore will find a job in the field of urban planning suitable. Developers are responsible for establishing homes, offices, hotels, shopping centres and other buildings across the urban landscape.</li></ul> </li><li>Valuation: <ul> <li>For those who want to take a step into this industry, a sales-oriented job can help kickstart a career in real estate. Joining a sales and telemarketing team at a real estate agency in Singapore allows one to learn the ropes of bringing in the dollars for the organisation.</li></ul> </li></ul> <p>Jobseekers looking for vacancies in the real estate industry will need to complete the required qualifications. This is essential, especially with respect to any area of work that involves the buying, selling, valuation and development of real estate in Singapore. Real estate agents will be required to apply for an estate agent license registered under the Council for Estate Agencies (CEA).</p><h2>Types of Real Estate Jobs Available</h2> <p>There are many ways you can begin a career in real estate in Singapore, be it a part-time or full-time position. The industry is expanding and thus jobseekers will be able to find their ideal job. The following are some key areas in which you can search for real estate jobs and prospects in Singapore:</p><ul> <li>Acquisition</li><li>Real estate agents</li><li>Investment and asset management </li><li>Commercial leasing</li><li>Fund management</li><li>Property valuation</li><li>Real estate development</li><li>Market research</li><li>Administration</li></ul> <p>Search for real estate jobs in Singapore through our <a href="https://www.mycareersfuture.sg/">jobs portal</a>!</p><p>Browse our <a href="https://content.mycareersfuture.sg/">Careers Toolkit</a> to prepare for a career in real estate in Singapore. </p><p>Complete a survey <a href="https://www.mycareersfuture.sg/survey">here</a> and let us know your experience of securing a job through the MyCareersFuture.sg portal.</p>`,
  REPAIR_MAINTENANCE: `<h1>Look For Repair and Maintenance Jobs in Singapore Here</h1><p>The repair industry is a goldmine when it comes to searching for job opportunities. Repair jobs often involve the servicing and maintaining of equipment and parts sold. Similar to most industries, repair jobs come in many different forms. From electronics to household appliances, repair technicians are often in demand for the services they provide.</p><p>Whenever goods and services are sold, there must also exist a sector that services, provides and maintains the condition of these parts. The aftermarket services and repair industry continues to grow alongside the creation and sales of new products in the market.</p><p>Jobseekers who consider themselves mechanically inclined can consider pursuing the repair and maintenance services industry for a stable career. Apply for repair and maintenance jobs on the <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> portal today.</p><h2>What Does A Repair Job Entail?</h2> <p>A typical repair job involves fixing and servicing of malfunctioning parts of a product. Though repair jobs may vary in responsibilities, the general duties of a technician constitutes the following:</p><ol> <li>Repairing parts of or an entire good, usually electronics, automobiles or buildings</li><li>Troubleshooting the causes behind the malfunction</li><li>Setting up machinery or equipment</li><li>Estimating costs of repairs</li><li>Performing routine preventive maintenance to ensure machines operate smoothly</li></ol> <h3>What Are The Different Types of Repair Jobs?</h3> <p>There are a range of repair jobs across different types of industries: electronics, automobile market as well as aerospace and aviation. Take a look at some of the different types of repair jobs.</p><ol> <li>Automotive Services Technician or Manager</li><li>Aircraft Technician</li><li>Maintenance Technician</li><li>Plant Maintenance Technician</li><li>Car Mechanic</li><li>Mobile Phone Repair Technician</li><li>Facilities Repair Technician</li></ol> <h3>What Skills Are In Demand For A Repair Job?</h3> <p>All repair jobs require some technical ability. Depending on the industry you work in, the technical skill sets may vary. However, soft skills such as good communication and client-facing skills are necessary across repair jobs.</p><p><em>Skills Required To Work in Repair:</em></p><ol> <li>Analytical Skills: repair technicians should be able to troubleshoot issues and find solutions to complex problems that they might encounter.</li><li>Technical Knowledge: repair technicians in the automobile market should have good knowledge of how different car parts function while those in the computer and electronics market must be able to use diagnostic tools to assess and monitor computer systems.</li><li>Communication Ability: Repair technicians must also be able to listen and communicate clearly with different clients to successfully diagnose and fix the problems that they are facing.</li></ol> <h2>How Can I Get Hired For A Repair Job?</h2> <p>To work in the repair and services industry, getting relevant work experience is important. While on-the-job, repair technicians will be able to receive training that will be beneficial for their development and progress in the industry.</p><p>First time jobseekers should invest some time into <a href="https://content.mycareersfuture.sg/5-tips-need-before-entering-workforce/">building an effective resume as well as gaining new skills</a> to improve marketability in the workforce. Likewise, it also helps to be <a href="https://content.mycareersfuture.sg/3-tips-start-work/">familiar with the workplace before starting work.</a></p>`,
  RISK_MANAGEMENT: ` <h1>Explore Risk Management Jobs in Singapore</h1> <p>Risk management is a field of expertise where risks are identified, assessed and quantified against the performance of a particular business. It is a significant line of work especially for large corporations continuously on the lookout for changes in the industry and within the global landscape that would impact their business. Medium and small-sized enterprises also regard risk management as essential, especially in an era of rapid technological transformation and the pressing need to stay afloat in a volatile climate. </p><p>The need for a futurist mindset in today's world is thus imperative to any business' success. With the rising number of businesses in the local market alongside the impact of globalisation and blurring of national boundaries in a digital world, the rise of risk management has never been so profound. This has increased the demand for risk management jobs in Singapore, making it an attractive career choice in the market.</p><p>What makes this field attractive as a career option is its cross-disciplinary nature: risk management is crucial for any industry. Previously, traditional risk management - also called insurance risk management - took centre stage to cover accidental losses by focussing on pure risks. This field now focuses on all aspects of risks in relation to business that are present as a result of a potential loss or gain. As such, risk management is present in any type of industry, including banking, automobile, aviation, defence, law, government, insurance and media. Those looking for risk management jobs in Singapore will thus find themselves in a vast pool of opportunities to explore for their career. Take a peek at the <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> portal to find your next job in his field! </p><h2>Embarking on a Risk Management Career</h2> <p>The crux of any job in the field of risk management is to develop risk models that cover market, credit and operational risks with the help of research and analytics. This requires the need to learn the business ground up, allowing risk management practitioners to gain a solid understanding of how the business is run. This gives them the authoritative knowledge of the industry, a significant aspect of their career. Some responsibilities for common risk management jobs in Singapore include:</p><ul> <li>Perform risk assessment by conducting research on industry trends, analyse and identify threats that can create potential risks to the organisation</li><li>Develop, implement and enforce organisational processes that are designed to minimise risks</li><li>Continuously advising senior management on risks involved when implementing new projects and business ideas</li><li>Producing business continuity plans to limit future risks</li></ul> <p>Those who want to embark on a career in risk management can explore academic qualifications in different subjects, which include but are not limited to:</p><ul> <li>Business Management</li><li>Accounting and Finance</li><li>Economics</li><li>Mathematical Science</li><li>Engineering</li><li>Law</li></ul> <h2>Beyond Qualifications</h2> <p>Regardless, risk management requires one to have strong foresight in predicting risks based on facts and data. As such, some of the skills that candidates should possess when looking for risk management jobs in Singapore include:</p><ul> <li>Analytical and critical-thinking abilities</li><li>Business acumen</li><li>Planning and organisational skills</li><li>Effective verbal and written communication skills</li></ul> <p>While risk management may be in demand, it is a competitive field nonetheless. If you want to start a career in risk management and have been applying for related jobs in Singapore, here are <a href="https://content.mycareersfuture.sg/future-work-4-essential-tips-singaporeans-stay-ahead-pack/">some tips to help you stay ahead</a> in your career. </p>`,
  SALES_RETAIL: `<h1>View the Latest Sales Jobs and Vacancies </h1><p>Are you a people person? Do you enjoy serving clients? Do you thrive in a competitive, fast-paced and rigorous working environment?</p><p>You might have the makings of an excellent salesperson! </p><p>The scope of the sales industry is constantly changing. Due to the varied and nuanced nature of the industry, one has to be determined, resilient and well-informed of what’s in the wind today. To thrive in sales, its important to be aware of changes in consumer behaviour, shifting regulation, new competition as well as new core technologies of production.</p><p><a href="https://mycareersfuture.sg/">MyCareersFuture.sg</a> lists a long list of opportunities and vacancies available in sales. If you think you have what it takes to excel in sales, apply for jobs now to get started! </p><h2>Fast-Growing Industries for Sales </h2> <p>While sales might seem like a niche field, the demand for salespersons is growing in some industries. In fact, there is a corresponding sales career in nearly every industry that exists. These include but are not limited to:</p><ul> <li>Technology and software <ul> <li>Cybersecurity</li><li>B2B solutions </li><li>IT solutions </li></ul> </li><li>Marketing <ul> <li>Digital marketing </li><li>Advertising </li></ul> </li><li>Financial services <ul> <li>Insurance</li><li>Banking </li></ul> </li></ul> <p>With more sales jobs available in the aforementioned industries, one can expect it to be extremely competitive. As such, it is highly imperative for all applicants to do enough research about the industry they are applying to in order to find a role in a sector which best suits one’s preferences and interests. </p><p>Although past experiences in relevant fields might be helpful for some applications, some companies may be willing to provide comprehensive training to help their candidates get started.</p><p>On the other hand, some companies may be willing to provide comprehensive training to help their candidates get started. </p><h2>Position Titles in Sales </h2> <p>As far as career progression is concerned, the sales sector definitely has it. One could join the industry as a fresh graduate with an entry-level role and build his career from there. The career progression in sales would depend on the number of deals one manages to clinch as well as the amount of revenue he brings in. What could help a salesperson get ahead is exhibiting how their solutions could make a difference. </p><p>Some common sales job titles include:</p><ul> <li>Sales assistant </li><li>Sales coordinator </li><li>Sales manager</li><li>Financial consultant </li><li>Sales specialist</li><li>Digital Strategist </li></ul> <p>There are many jobs in Singapore for those who are interested in starting a career in sales or changing from one sales industry to another. Experience might get one’s foot in the door, but he has to consistently stay up to date about the latest happenings and stay ahead of his rivals in order to progress in his career.</p><h2>The Best Parts about Working in Sales </h2> <p>Aside from commission being one of the biggest perks of working in sales, there is a myriad of other advantages to sales jobs in Singapore. </p><h3>A Sales Job is Mobile </h3> <p>Instead of being desk-bound, most sales jobs would require individuals to travel from location to location to meet clients and sign deals. </p><h3>One can Broaden his Professional Network</h3> <p>A career in sales will entail many opportunities to encounter people from different walks of life. Interacting with them would help you learn a thing or two about their industries. </p><h3>Satisfaction Guaranteed</h3> <p>There’s nothing quite like the feeling of closing a deal, it increases one’s self-confidence and gives him a sense of fulfilment. </p><h2>Endless Possibilities</h2> <p>A career in sales will be anything but stagnant and boring. The skills one can develop, the people one meet and lessons one can learn will aid any salesperson in his financial, professional and personal growth. </p>`,
  SCIENCES_LABORATORY_R_N_D: ` <h1>View The Latest Science Jobs in Singapore</h1><p>With research and innovation as the cornerstones of Singapore&rsquo;s plan to grow into a knowledge-based economy, the government continues to advocate strong support for growth in the science industry. The Research, Innovation and Enterprise (RIE) 2020 plan dedicated to building an innovation-driven society will bolster continued growth through job creation, economic growth and technological development to address global challenges.</p><p>A career in the sciences is rewarding, with opportunities to deliver impactful solutions on global challenges that we encounter daily. You get a chance to work on some of the most pressing matters concerning society today &ndash; climate change, drug creation, and technological applications.</p><p>With top pharmaceutical companies setting up offices in Singapore, the science industry grows with demand for those skilled in laboratory research and strong manufacturing capabilities. As the science sector in Singapore covers a broad range of career pathways, spending some time researching the differing disciplines will help you find a job you like best.</p><p>The surge in Singapore-incorporated companies with a focus in biomedical research and development signal strong hiring opportunities in the science and technology sector. For those seeking a career in the sciences, look no further than <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> for the latest job opportunities available.</p><h2>Types of Science Jobs</h2><p>The science and technology sector encompasses much more than just research and lab work. A career in the sciences is demanding and rigorous but equally rewarding. Science jobs in Singapore can range anywhere from a biomedical engineer to a clinical research associate.</p><h3>1. Life Sciences</h3><p>Otherwise known as biological sciences, the study of life sciences is concerned with the understanding of living organisms - with specialised areas ranging from biology, zoology, microbiology and botany. All of the careers under life sciences require qualifications in relevant science subjects like biology, pharmacology or biochemistry at minimum to ensure that entrants have basic scientific understanding and knowledge. Those keen on pursuing a career in the life sciences can consider the following jobs:</p><ul><li>Clinical Research Associate</li><li>Pharmacist</li><li>Biochemist</li><li>Food Safety Specialist&nbsp;</li></ul><h3>2. Physical Sciences</h3><p>A job in the physical sciences constitute the systematic study of non-living matter, and mainly consists of astronomy, physics, chemistry and geology as the broader fields. Some of the job titles in the physical sciences include:</p><ul><li>Physicist</li><li>Electrician</li><li>Research Associate</li><li>Laboratory Technician&gt;</li><li>Geoscientist</li></ul><h2>Advancing a Career in Science and Technology in Singapore</h2><p>Enrolling for higher qualifications gives you the opportunity to further your interest in a specialised field or to switch fields if you have been in the workforce for some time. With focus on the specialised field, you will be able to move into management positions within the science industry as well. In a competitive job market, specialising in a field you are motivated by can help you advance in your career at a much faster pace. Understanding the <a href="https://content.mycareersfuture.sg/5-tips-moving-into-management/">challenges within management</a> can also help you ease the transition if you are focusing on growing your career. <br/>First time jobseekers need not fret. By referring to this <a href="https://content.mycareersfuture.sg/6-tips-first-time-jobseekers/">infographic</a>, you can quickly streamline your navigation process to secure that dream job, whether it is in the science sector or otherwise.</p>`,
  SECURITY_AND_INVESTIGATION: `<h1>View Rewarding Security Jobs in Singapore</h1><p>There is much more than meets the eye when one decides to embark on a career in security. The security industry is an often-overlooked sector in today's culture. Unbeknownst to most, staff in security companies in Singapore play a vital role in many businesses, from government intuitions to shopping malls.</p><p>Security goes beyond keeping an environment safe for citizens. Instead, it involves safeguarding citizens&rsquo; interests, enforcing safety measures and serving the public using new technologies and methods.</p><p>Whether one prefers working in the day or night, there are ample opportunities in Singapore for all individuals in security. Browse our listing of jobs in Singapore on <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> now!</p><h2>Working in Security</h2><p>The security industry is complex and dynamic with countless vacancies across a broad spectrum of specialisations. There is no standard of perfect curriculum, instead, it is an interdisciplinary field.</p><p>The term security could be interpreted and split into several sub-fields. These include but are not limited to:</p><ul><li><strong>Cyber security:</strong> this sub-field would have individuals working on protecting online data from hackers and phishing. One could join a cyber security agency or even work an information technology (IT) department at a multi-national corporation. To start on a career in cyber security, one might have to acquire certification and other qualifications to be successful in one's application to jobs in Singapore.</li><li><strong>Guarding</strong>: unlike cyber security, this field is not desk-bound. One could be involved in physical guarding which incorporates protecting people and properties on a daily basis or at events. One might also be involved in remote monitoring which refers to 24/7 live monitoring and daily checks.</li></ul><p>The roles and job titles in the security industry in Singapore sometimes involve overlapping responsibilities. One could be tasked to manage various forms of security outside of one's job title. For instance, one in a protection and security industry in Singapore might have to provide executive production to VIPs at various events.</p><p>Some common roles in security include:</p><ul><li>Security guard</li><li>IT security engineering</li><li>Executive protection agent</li><li>Sales executive (for security services agency)</li></ul><h2>Skills Required to Survive the Security Industry</h2><p>Notwithstanding certifications and qualifications for specialised disciplines in security (eg. cyber security), being successful in this field in both the long-and-short term would require one to possess various qualities. These include:</p><ul><li><strong>Strong communication skills:</strong> one has to be confident in his abilities to direct the public and communicate orders by following a given protocol. It's important to remain level-headed especially when working with a large crowd</li><li><strong>Thinking on one's feet:</strong> emergencies occur when we least expect them. In this aspect, one has to be able to respond efficiently and calmly to any given situation. Especially in the field of cyber security, one has to respond swiftly to customer queries about hacking.</li></ul><h2>Keeping the City Safe for Citizens</h2>With the demand for more protection services, the security industry is rapidly expanding. Will you play your part in keeping Singapore safe?`,
  SOCIAL_SERVICES: `<h1>Browse Social Services Jobs in Singapore</h1><p>Social services are all about empowering others to improve their quality of life. However, the careers and experiences of individuals in social services vary greatly as the field has various speciality areas. If you think you have what it takes to make a difference in society, why not embark on a career in social welfare services?</p><p><a href="https://mycareersfuture.sg">MyCareersFuture.sg</a>&rsquo;s jobs portal lists the latest openings and vacancies in social services in Singapore. Apply today to get started on a rewarding career in social services.</p><h2>Agencies for Social Workers</h2><p>Social workers seek to change lives in nearly every facet of community life. They act as a source of strength for those who need a little moral and emotional support.</p><p>Individuals who serve the community as social workers in Singapore will be attached to either a public or private agency. Most social workers specialise in serving a distinct community group or working in a specific environment. Some examples of institutions that demand social workers include:</p><h3>1. Rehabilitation Facilities</h3><p>Social workers who specialise in substance abuse will assist those struggling with addiction, mental health problems or substance abuse in hospitals and rehabilitation facilities. One would have to help individuals explore ways to overcome their addictions.</p><h3>2. Community Centres</h3><p>Community social workers will be in charge of planning, coordinating and organizing efforts to address issues faced by the local population. They might be involved in community outreach and aid organizations.</p><h3>3. Non-profit organizations</h3><p>Non-profit organizations are often motivated by social causes like animal welfare, poverty and gender equality and sometimes take their projects beyond one&rsquo;s transnational boundaries. One could explore opportunities beyond Singapore by joining a non-profit organization. Some projects include fundraising and disaster relief.</p><h3>4. Hospice</h3><p>When a family receives heart-wrenching news about a loved one&rsquo;s terminal illness, hospice social workers will be tasked to ease the agony of losing a loved one. They will help other members of the family in decision-making and provide support during trying times.</p><h3>5. Hospitals</h3><p>Healthcare social workers are attached to patients at hospitals to tasked to help navigate the physical, emotional and financial hardship associated with various medical conditions. Healthcare social workers help hospitalised individuals find their purpose and direction in life again.</p><h3>6. Military</h3><p>The stress of military duty can sometimes disrupt a soldier&rsquo;s life. Military social workers can help retired soldiers adjust to civilian life and provide emotional support for soldiers who undergo post-traumatic stress disorder.</p><h3>7. School</h3><p>Each school is assigned a counsellor who has relevant skills to handle all types of situations that involve the youth. Examples of situations include domestic abuse at home, bullying, body image disorder, addiction and behavioural issues.</p><h2>Make a Difference Today</h2><p>Most institutions would be willing to provide on-the-job training to help all applicants obtain useful skills that can help them in their line of work.</p>`,
  TELECOMMUNICATIONS: ` <h1>Telecommunications Industry in Singapore</h1><p>Telecommunications is an essential service required to support the Singapore economy, delivering critical components of information and communication technology. They include internet services, telephone, wireless communications, satellite television and other services that require the transmission of signs, signals, messages, sounds and images via wire, radio, optical and other electromagnetic systems.</p><p>In this increasingly digitalised world, the telecommunications industry is seeing a massive boom in Singapore, with service providers and the like bringing new technological advancements into the market. Now a vibrant and international telecommunications hub, the industry is constantly developing new innovations that aim to address current problems, including those that are implemented to manage future challenges.</p><p>Fresh graduates who enter the industry will find themselves on an attractive career path. Browse our <a href="https://www.mycareersfuture.sg">MyCareersFuture.sg</a> portal for telecommunications jobs in Singapore and be part of an evolving industry.</p><h2>Sectors of the Telecommunications Industry</h2><p>The telecommunications industry comprises the wired, wireless and satellite communication establishments.</p><h3>Wired Communications</h3><p>Wired communications refer to the transmission of data over wired-based communications technology. They include landline telephone networks, cable television and internet access, as well as fibre-optic transmissions. In Singapore, the telecommunications industry is looking towards establishing an ultra-high-speed broadband network that would make the country ready for an Infocomm-enabled future. This infrastructure is a critical component that will support Singapore&rsquo;s focus on the knowledge-based sectors, which include the digital media and creative industries. This advancement will also attract more business opportunities, opening up new jobs for interested candidates in this field.</p><h3>Wireless Communications</h3><p>Wireless communications technology transmit data through infrared and radio waves. It is the most popular telecommunications technology, especially among internet users who want to enjoy seamless connectivity anytime and anywhere. The telecommunications industry in Singapore has been working on providing free wireless broadband access in public spaces with Wireless@SG programme. It is also developing high data rate cellular infrastructure to heighten the transmission of multimedia and interactive media over high-speed wireless data. With such infrastructure, Singaporeans can enjoy a host of applications which include mobile payment and location-based services. With the potential growth of new technologies supported by wireless connectivity, the industry will be able to support various telecommunication functions across different markets in Singapore. This means that more opportunities will be available for candidates to develop their careers in the telecommunications field across different industries, such as medical, hospitality and aerospace.</p><h3>Satellite Communications</h3><p>Satellite communications, as its name suggests, is the transmission of data through satellites. Especially crucial for public agencies involved in national defence, Singapore stays up to date with advancements in satellite communications to keep par with the rest of the world. With the growing need for defence systems to upgrade and find new measures for security, satellite communications will constantly see new evolvement, creating new opportunities for career prospects in this field.</p><h2>Telecommunications Jobs in Singapore</h2><p>Those interested to be part of a growing telecommunications industry in Singapore will be able to explore a variety of career options. Here are some popular telecommunications jobs in Singapore:</p><ul><li>Network Engineer</li><li>Electronics Product Design Engineer</li><li>Software Engineer</li><li>Analysts</li><li>Software Developer</li><li>Optical &amp; IP Engineer</li></ul><p>If you are looking to start a career in the telecommunications industry in Singapore, here are some <a href="https://content.mycareersfuture.sg/infocomm/">insights</a> that will be useful. </p>`,
  TRAVEL_TOURISM: `<h1>Travel Industry in Singapore</h1><p>The global travel industry has continued to boost global GDP and at the same time opening up new jobs in the sector. This makes the industry especially essential for developing nations building up their economies, and for developed nations that tap on the lucrativeness of the industry for progress. The travel industry in Singapore is a significant contributor to the country’s economy and experts have forecasted a constant rise in the country’s capital investment in the travel industry in the years to come. This means that the sector will continue to create more travel jobs for youth and mid-level professionals in Singapore who want to begin a career in tourism.</p><h2>Careers in Singapore’s Travel Industry</h2> <p>There are a myriad of jobs available for fresh graduates and mid-level professionals who want to begin a career in the travel industry in Singapore. This can range from a travel guide employed by a hotel to a marketing executive with the communications department at a travel agency. </p><h3>On-ground hospitality</h3> <p>For those who enjoy interacting with tourists on a day-to-day basis, client-facing or hospitality-oriented jobs in Singapore will be ideal. These include front-end jobs in hotels, resorts, travel attractions, travel agencies the airport and airline crew. As hospitality in the travel sector is a key aspect of such jobs, you will be trained in customer service to cater to the needs of the tourists you will be serving. The demand for on-ground hospitality is high in Singapore, with an increasing number of attractions and hotels being built around the country and the need for people to fill the customer service roles. Those with a flair for creativity can also begin as a freelance travel writer and photographer, or work with a publication that produces travel-related stories from around the world. </p><h3>Corporate functions</h3> <p>If you prefer to work in an office, the corporate side of the travel industry will be more appealing. These include any travel-based entity with operations that focus on the travel industry. Travel agencies, for instance, hire candidates who are interested in providing travel consultancy to tourists in Singapore as well as locals who want to explore other countries. You can also choose to work for airline companies, retail and tourism businesses and other corporate entities in the travel industry that are often organisationally structured to include various types of roles within the communications, human resources and finance fields. </p><h2>Types of Travel Jobs in Singapore </h2> <p>The following are some common jobs with high demand in the travel industry in Singapore in the respective area of work:</p><ul> <li>Hospitality <ul> <li>Travel agents</li><li>Travel consultant</li><li>Travel guide</li><li>Customer-service officer</li><li>Air steward/stewardess</li></ul> </li><li>Corporate <ul> <li>Marketing executive</li><li>Sales manager</li><li>Accountant</li><li>Finance officer</li><li>Administration Officer</li></ul> </li></ul> <p>Take a look at the travel jobs available in Singapore and apply through the <a href="https://www.mycareersfuture.sg/">MyCareersFuture.sg</a> portal today!</p><p>If you are building up your resume to apply for jobs in the travel sector in Singapore, explore some of our <a href="https://content.mycareersfuture.sg/job-seekers-toolkit/industries/travel-and-tourism/">insights into the travel industry</a>.</p><p>Complete this <a href="https://www.mycareersfuture.sg/survey">survey</a> for us so that we can learn how we can serve you better!</p>`,
};

export const CATEGORY = {
  ACCOUNTING_AUDITING_TAXATION:  CategoryKey(
    'accounting_auditing_taxation',
    'Accounting / Auditing / Taxation',
    'Accounting / Auditing / Taxation',
    'accounting',
    'Accounting jobs in Singapore remain high in demand as the finance sector continues to play a key role in economic growth. Apply for accounting jobs today.',
    'Accounting Jobs in Singapore | Singapore CPA & Entry Level Accounting Jobs',
    CATEGORY_DESCRIPTION.ACCOUNTING_AUDITING_TAXATION,
  ),
  ADMIN_SECRETARIAL:  CategoryKey(
    'admin_secretarial',
    'Admin / Secretarial',
    'Admin / Secretarial',
    'admin',
    'Be the driving force behind vital operations in every business. Full time or part time, all admin jobs in Singapore are available here. Learn more today.',
    'Admin Jobs in Singapore | Singapore Full Time & Part Time Admin Jobs',
    CATEGORY_DESCRIPTION.ADMIN_SECRETARIAL,
  ),
  ADVERTISING_MEDIA:  CategoryKey(
    'advertising_media',
    'Advertising / Media',
    'Advertising / Media',
    'advertising',
    'Look at the hottest jobs in Advertising in Singapore. MyCareersFuture lists a huge variety of jobs in Advertising across Singapore. View Now!',
    'Advertising Jobs in Singapore | Get A Job in Advertising Today!',
    CATEGORY_DESCRIPTION.ADVERTISING_MEDIA,
  ),
  ARCHITECTURE_INTERIOR_DESIGN:  CategoryKey(
    'architecture_interior_design',
    'Architecture / Interior Design',
    'Architecture / Interior Design',
    'architecture',
    'Singapore is a garden city with an expanding concrete jungle. If you are passionate about architecture and aspire to venture into the industry, check out our listings now.',
    'Jobs in Architecture Singapore | Get A Job in Architecture Singapore',
    CATEGORY_DESCRIPTION.ARCHITECTURE_INTERIOR_DESIGN,
  ),
  BANKING_AND_FINANCE:  CategoryKey(
    'banking_finance',
    'Banking and Finance',
    'Banking and Finance',
    'banking-finance',
    'Banking is one of the most in demand industries in Singapore. Browse the latest Job Opportunities in Singapore with My Careers Future.',
    'Banking & Finance Jobs in Singapore | Part Time & Contract Banking Jobs',
    CATEGORY_DESCRIPTION.BANKING_AND_FINANCE,
  ),
  BUILDING_AND_CONSTRUCTION:  CategoryKey(
    'building_construction',
    'Building and Construction',
    'Building and Construction',
    'building-construction',
    'Be part of a dynamic and rewarding career in building, construction and maintenance. Apply for building, maintenance or technician jobs in Singapore today!',
    'Building & Construction Jobs Singapore | Get A Job in Construction',
    CATEGORY_DESCRIPTION.BUILDING_AND_CONSTRUCTION,
  ),
  CONSULTING:  CategoryKey(
    'consulting',
    'Consulting',
    'Consulting',
    'consulting',
    'Consulting is a challenging career in Singapore with a wide variety of opportunities across different industries. Apply for Consulting Jobs Now!',
    'Consulting Jobs in Singapore | Management & Entry Level Consulting Jobs',
    CATEGORY_DESCRIPTION.CONSULTING,
  ),
  CUSTOMER_SERVICE:  CategoryKey(
    'customer_service',
    'Customer Service',
    'Customer Service',
    'customer-service',
    'Enjoy interacting with people? Pursue a rewarding career in customer service roles available across industries. Apply for customer service jobs in Singapore!',
    'Customer Service Jobs Singapore | Get A Job in Customer Service Today!',
    CATEGORY_DESCRIPTION.CUSTOMER_SERVICE,
  ),
  DESIGN:  CategoryKey(
    'design',
    'Design',
    'Design',
    'design',
    'From graphic to interior design, you can explore a range of design jobs across a variety of industries in Singapore. Browse on MyCareersFuture.sg today.',
    'Design Jobs Singapore | Get A Graphic, Interior Design Job in Singapore Today!',
    CATEGORY_DESCRIPTION.DESIGN,
  ),
  EDUCATION_AND_TRAINING:  CategoryKey(
    'education_training',
    'Education and Training',
    'Education and Training',
    'education-training',
    'Singapore prides itself on having a meritocratic education system. If you aspire to play your part in further enhancing the quality of education, check out the latest jobs!',
    'Education Jobs Singapore | Get A Job As A Teacher in Singapore',
    CATEGORY_DESCRIPTION.EDUCATION_AND_TRAINING,
  ),
  ENGINEERING:  CategoryKey(
    'engineering',
    'Engineering',
    'Engineering',
    'engineering',
    "My Careers Future hosts one of Singapore's largest Engineering Job offerings.  From Chemical Engineering to Mechanical - Apply Now!",
    'Engineering Jobs in Singapore| Jobs For Engineers in Singapore',
    CATEGORY_DESCRIPTION.ENGINEERING,
  ),
  ENTERTAINMENT:  CategoryKey(
    'entertainment',
    'Entertainment',
    'Entertainment',
    'entertainment',
    'If you are interested in joining the entertainment industry, you will need a drive to succeed, perseverance and a love for people. Check out opportunities in Singapore now.',
    'Jobs in Entertainment in Singapore | Entertainment Jobs in Singapore',
    CATEGORY_DESCRIPTION.ENTERTAINMENT,
  ),
  ENVIRONMENT_HEALTH:  CategoryKey(
    'environment_health',
    'Environment / Health',
    'Environment / Health',
    'environment',
    'Green jobs are booming in the corporate world now. Explore environmental career opportunities in Singapore as green economies continue growing in popularity.',
    'Built (BE) & Natural (NE) Environmental Jobs in Singapore',
    CATEGORY_DESCRIPTION.ENVIRONMENT_HEALTH,
  ),
  EVENTS_PROMOTIONS:  CategoryKey(
    'events_promotions',
    'Events / Promotions',
    'Events / Promotions',
    'events',
    'Want to join an events company in Singapore? We have the latest vacancies available. Click here to find out more about opportunities and events jobs in Singapore!',
    'Events Management Jobs in Singapore | Part Time Events Jobs in Singapore',
    CATEGORY_DESCRIPTION.EVENTS_PROMOTIONS,
  ),
  F_N_B:  CategoryKey(
    'f_n_b',
    'F&B',
    'F&B',
    'food-and-beverage',
    'Food & Beverage is known to be an exciting, fulfilling line of work. To get a job in F & B in Singapore, visit MyCareersFuture today!',
    'F&B Jobs in Singapore | Get A Job in Food & Beverage in Singapore',
    CATEGORY_DESCRIPTION.F_N_B,
  ),
  GENERAL_MANAGEMENT:  CategoryKey(
    'general_management',
    'General Management',
    'General Management',
    'general-management',
    'A career in general management allows you to join and grow in any industry. Search for general management jobs in Singapore on MyCareersFuture.sg portal!',
    'Apply General Management Jobs in Singapore | General Manager Jobs SG',
    CATEGORY_DESCRIPTION.GENERAL_MANAGEMENT,
  ),
  GENERAL_WORK:  CategoryKey(
    'general_work',
    'General Work',
    'General Work',
    'general-work',
    'General worker jobs in Singapore can introduce you to the workings of the industry and the chance to explore a career in the field. Search for jobs here.',
    'General Working Jobs in Singapore | Find A General Working Job in SG',
    CATEGORY_DESCRIPTION.GENERAL_WORK,
  ),
  HEALTHCARE_PHARMACEUTICAL:  CategoryKey(
    'healthcare_pharmaceutical',
    'Healthcare / Pharmaceutical',
    'Healthcare / Pharmaceutical',
    'healthcare',
    'Embark on a meaningful and rewarding career by applying to the healthcare sector in Singapore. Explore the wide range of healthcare jobs available today!',
    'Healthcare Jobs in Singapore | Healthcare Administration & Management Jobs',
    CATEGORY_DESCRIPTION.HEALTHCARE_PHARMACEUTICAL,
  ),
  HOSPITALITY:  CategoryKey(
    'hospitality',
    'Hospitality',
    'Hospitality',
    'hospitality',
    'Hospitality is known to be one of the most fun careers in Singapore.  If you enjoy entertaining & being around people, apply for our Hospitality Jobs Now!',
    'Hotel Job Vacancies in Singapore | Food & Beverage (F&B) Jobs in Singapore',
    CATEGORY_DESCRIPTION.HOSPITALITY,
  ),
  HUMAN_RESOURCES:  CategoryKey(
    'human_resources',
    'Human Resources',
    'Human Resources',
    'human-resources',
    'Love working with people? Passionate about problem-solving? MyCareersFuture.sg has human resources jobs available. Click here to view our listings now.',
    'HR Jobs Singapore | Jobs in Human Resources Across Singapore',
    CATEGORY_DESCRIPTION.HUMAN_RESOURCES,
  ),
  INFORMATION_TECHNOLOGY:  CategoryKey(
    'information_technology',
    'Information Technology',
    'Information Technology',
    'information-technology',
    "IT Jobs in Singapore are in the highest demand ever.  Join Singapore's fastest growing industry today by applying for Jobs listed on My Careers Future.",
    'Information Technology Jobs in Singapore | Part-time & Director IT Jobs',
    CATEGORY_DESCRIPTION.INFORMATION_TECHNOLOGY,
  ),
  INSURANCE:  CategoryKey(
    'insurance',
    'Insurance',
    'Insurance',
    'insurance',
    "As one of Singapore's biggest industries, Insurance jobs are readily available.  To view Singaporean Insurance Jobs, visit My Careers Future.",
    'General Insurance Jobs in Singapore | Part Time Insurance Jobs Singapore',
    CATEGORY_DESCRIPTION.INSURANCE,
  ),
  LEGAL:  CategoryKey(
    'legal',
    'Legal',
    'Legal',
    'legal',
    'Join the legal industry in Singapore and do your part for justice. Browse legal associate, counsel and secretarial jobs available in Singapore here!',
    'Legal Counsel Jobs in Singapore | Get A Job As A Lawyer in Singapore',
    CATEGORY_DESCRIPTION.LEGAL,
  ),
  LOGISTICS_SUPPLY_CHAIN:  CategoryKey(
    'logistics_supply_chain',
    'Logistics / Supply Chain',
    'Logistics / Supply Chain',
    'logistics',
    'Are you looking to start a career in the logistics and supply chain industry in Singapore? Look for suitable operational and managerial jobs here!',
    'Logistics & Supply Chain Jobs in Singapore | Logistics Management Careers',
    CATEGORY_DESCRIPTION.LOGISTICS_SUPPLY_CHAIN,
  ),
  MANUFACTURING:  CategoryKey(
    'manufacturing',
    'Manufacturing',
    'Manufacturing',
    'manufacturing',
    'Manufacturing remains one of Singapore’s biggest contributors in economic growth. Join the industry and build a stable career. Apply for manufacturing jobs today!',
    'Manufacturing Jobs Singapore | Get A Job in Manufacturing in Singapore',
    CATEGORY_DESCRIPTION.MANUFACTURING,
  ),
  MARKETING_PUBLIC_RELATIONS:  CategoryKey(
    'marketing_public_relations',
    'Marketing / Public Relations',
    'Marketing / Public Relations',
    'marketing',
    'Want a career in marketing? We have the latest opportunities in Singapore! Plus, get more information about what marketers do and how you can land jobs in marketing. Learn now.',
    'Marketing Jobs in Singapore | Digital & Social Media Marketing Jobs',
    CATEGORY_DESCRIPTION.MARKETING_PUBLIC_RELATIONS,
  ),
  MEDICAL_THERAPY_SERVICES:  CategoryKey(
    'medical_therapy_services',
    'Medical / Therapy Services',
    'Medical / Therapy Services',
    'medical',
    'A career in the medical industry extends beyond that of a doctor. It is a rigorous but rewarding industry. Click here to view the latest medical career opportunities in Singapore.',
    'Medical Job in Singapore | Singapore Medical Career Path',
    CATEGORY_DESCRIPTION.MEDICAL_THERAPY_SERVICES,
  ),
  PERSONAL_CARE_BEAUTY:  CategoryKey(
    'personal_care_beauty',
    'Personal Care / Beauty',
    'Personal Care / Beauty',
    'personal-care',
    'Want to help people look good and feel good? The beauty and personal care industry in Singapore might be perfect for you. View job listings in personal care here.',
    'Beauty & Personal Care Jobs in Singapore | Spa Therapist & Personal Trainer',
    CATEGORY_DESCRIPTION.PERSONAL_CARE_BEAUTY,
  ),
  PROFESSIONAL_SERVICES:  CategoryKey(
    'professional_services',
    'Professional Services',
    'Professional Services',
    'professional-services',
    'Applying for Professional Services Roles in Singapore?  Visit My Careers Future for the widest variety of Job Listings.',
    'Professional Services Industry in Singapore | Professional Services Firms',
    CATEGORY_DESCRIPTION.PROFESSIONAL_SERVICES,
  ),
  PUBLIC_CIVIL_SERVICES:  CategoryKey(
    'public_civil_service',
    'Public / Civil Service',
    'Public / Civil Service',
    'public',
    'Have a passion to serve the public in Singapore? MyCareersFuture.sg has the latest public service jobs and vacancies on our jobs portal. Click here to start applying now.',
    'Singapore Public Service Jobs | Careers in The Public Sector',
    CATEGORY_DESCRIPTION.PUBLIC_CIVIL_SERVICES,
  ),
  PURCHASING_MERCHANDISING:  CategoryKey(
    'purchasing_merchandising',
    'Purchasing / Merchandising',
    'Purchasing / Merchandising',
    'purchasing',
    'The line of purchasing is an important part of any type of procurement process. Take a look at purchasing jobs in Singapore on MyCareersFuture.sg!',
    'Purchasing Jobs in Singapore | Career in Procurement in Singapore',
    CATEGORY_DESCRIPTION.PURCHASING_MERCHANDISING,
  ),
  REAL_ESTATE_PROPERTY_MANAGEMENT:  CategoryKey(
    'real_estate_property_management',
    'Real Estate / Property Management',
    'Real Estate / Property Management',
    'real-estate',
    'Whether you are a part time real estate agent or a property valuer, the industry is booming. Click here to browse real estate jobs available in Singapore.',
    'Real Estate Jobs in Singapore | Real Estate Career Prospects in Singapore',
    CATEGORY_DESCRIPTION.REAL_ESTATE_PROPERTY_MANAGEMENT,
  ),
  REPAIR_MAINTENANCE:  CategoryKey(
    'repair_maintenance',
    'Repair and Maintenance',
    'Repair and Maintenance',
    'repair-maintenance',
    'Embark on a stable career in the repair services and maintenance industry. Find out how to get your foot into the repair industry here. Apply for repair jobs now.',
    'Repair Jobs in Singapore | Repair and Maintenance Jobs in Singapore',
    CATEGORY_DESCRIPTION.REPAIR_MAINTENANCE,
  ),
  RISK_MANAGEMENT:  CategoryKey(
    'risk_management',
    'Risk Management',
    'Risk Management',
    'risk-management',
    'Risk management is a critical component for businesses in any sector. Click to explore risk management jobs in Singapore and kick start your career!',
    'Risk Management Jobs in Singapore | Risk Management Career in Singapore',
    CATEGORY_DESCRIPTION.RISK_MANAGEMENT,
  ),
  SALES_RETAIL:  CategoryKey(
    'sales_retail',
    'Sales / Retail',
    'Sales / Retail',
    'sales',
    'Fancy a career in sales? The industry is on the lookout for new talents! Browse the latest sales executive, part-time and retail sales jobs in Singapore by clicking here.',
    'Sales Jobs in Singapore | Sales Executive, Retail & Part Time Sales Jobs',
    CATEGORY_DESCRIPTION.SALES_RETAIL,
  ),
  SCIENCES_LABORATORY_R_N_D:  CategoryKey(
    'sciences_laboratory_r_n_d',
    'Sciences / Laboratory / R&D',
    'Sciences / Laboratory / R&D',
    'sciences',
    'Make a difference to society by pursuing a rewarding career in the science sector in Singapore. Browse through job opportunities available today!',
    'Science & Technology Jobs | Biomedical, Bioligical, Social & Behavioural Life Science Jobs',
    CATEGORY_DESCRIPTION.SCIENCES_LABORATORY_R_N_D,
  ),
  SECURITY_AND_INVESTIGATION:  CategoryKey(
    'security_investigation',
    'Security and Investigation',
    'Security and Investigation',
    'security',
    'Looking for security jobs in Singapore? The industry is diverse with numerous types of jobs available across a broad spectrum of specialisations. Find out more!',
    'Security Jobs in Singapore | View Security Job Openings in Singapore',
    CATEGORY_DESCRIPTION.SECURITY_AND_INVESTIGATION,
  ),
  SOCIAL_SERVICES:  CategoryKey(
    'social_services',
    'Social Services',
    'Social Services',
    'social-services',
    'Want to make a difference in society? Maybe you could consider a career in social services. Click to view listings and vacancies in Singapore’s social services sector today!',
    'Social Services Jobs in Singapore | Social Welfare Services Careers',
    CATEGORY_DESCRIPTION.SOCIAL_SERVICES,
  ),
  TELECOMMUNICATIONS:  CategoryKey(
    'telecommunications',
    'Telecommunications',
    'Telecommunications',
    'telecommunications',
    'Start a career in the telecommunications industry in Singapore and be a part of an evolving technological landscape that is revolutionising the future!',
    'Telecommunications Jobs in Singapore | Telecommunications Industry Jobs',
    CATEGORY_DESCRIPTION.TELECOMMUNICATIONS,
  ),
  TRAVEL_TOURISM:  CategoryKey(
    'travel_tourism',
    'Travel / Tourism',
    'Travel / Tourism',
    'travel',
    'Be part of the country’s booming tourism sector! Browse through the myriad of travel jobs available in Singapore and kickstart your career in the industry.',
    'Travel Jobs in Singapore | Travel Agency Jobs in Singapore',
    CATEGORY_DESCRIPTION.TRAVEL_TOURISM,
  ),
  OTHERS:  CategoryKey('others', 'Others', 'Others', 'others'),
};

    export const formatJobUrl = ({jobTitle, company, uuid, categoryLabel}: {jobTitle?: string, company?:string, uuid:string, categoryLabel?: string}) => {
    const processedJobTitle = cleanWord(jobTitle);
    const processedCompany = cleanWord(company);
    const urlSegment = `${processedJobTitle && processedJobTitle.concat('-')}${processedCompany &&
        processedCompany.concat('-')}${uuid}`;
    const category = getCategoryByLabel(categoryLabel);
    return category ? `/job/${CATEGORY[category].url}/${urlSegment}` : `/job/${urlSegment}`; }
