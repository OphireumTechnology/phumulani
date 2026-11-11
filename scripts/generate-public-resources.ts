import fs from 'fs';
import path from 'path';

const resourcesDir = path.resolve(process.cwd(), 'public/resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Generate simple valid standard PDF 1.4 binary documents
function createSimplePdf(title: string, subtitle: string, sections: { heading: string; body: string }[]): Buffer {
  const contentLines: string[] = [
    'BT',
    '/F1 20 Tf',
    '50 750 Td',
    `(${title.replace(/[()]/g, '')}) Tj`,
    '0 -24 Td',
    '/F1 12 Tf',
    `(${subtitle.replace(/[()]/g, '')}) Tj`,
    '0 -20 Td',
    '/F1 9 Tf',
    '(Phumulani: Minnesota African Women Against Violence - 501c3 Certified Community Resource) Tj',
    '0 -30 Td',
  ];

  for (const s of sections) {
    contentLines.push('/F1 13 Tf');
    contentLines.push(`(${s.heading.replace(/[()]/g, '')}) Tj`);
    contentLines.push('0 -16 Td');
    contentLines.push('/F1 10 Tf');
    const words = s.body.split(' ');
    let currentLine = '';
    for (const w of words) {
      if ((currentLine + ' ' + w).length > 75) {
        contentLines.push(`(${currentLine.trim().replace(/[()]/g, '')}) Tj`);
        contentLines.push('0 -14 Td');
        currentLine = w;
      } else {
        currentLine += (currentLine ? ' ' : '') + w;
      }
    }
    if (currentLine) {
      contentLines.push(`(${currentLine.trim().replace(/[()]/g, '')}) Tj`);
      contentLines.push('0 -14 Td');
    }
    contentLines.push('0 -14 Td');
  }

  contentLines.push('/F1 8 Tf');
  contentLines.push('(Confidential Community Resource - For Assistance: Day One Crisis Line 1-866-223-1111 - phumulani.org) Tj');
  contentLines.push('ET');

  const streamContent = contentLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000240 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${360 + streamLength}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

// 1. Order for Protection Navigator
const ofpPdf = createSimplePdf(
  'Order for Protection OFP Step-by-Step Navigator',
  'Minnesota District Courts Legal Navigation - Minn. Stat. 518B.01',
  [
    {
      heading: '1. What is an Order for Protection (OFP)?',
      body: 'Under Minnesota Statute 518B.01, an Order for Protection is a civil court order issued to protect family or household members from domestic abuse. Filing an OFP in Minnesota requires no court filing fee.'
    },
    {
      heading: '2. Emergency Ex Parte Relief',
      body: 'If there is an immediate and present danger of domestic abuse, you may request an emergency Ex Parte order. A judge can review and sign this order without prior notice to the respondent, granting temporary physical protection, exclusive occupancy of residence, and restraining contact.'
    },
    {
      heading: '3. Phumulani Court Accompaniment',
      body: 'Phumulani advocates accompany immigrant and refugee survivors to Hennepin, Ramsey, and suburban district court hearings. Bilingual support in Somali, Oromo, Amharic, and Spanish is available.'
    },
    {
      heading: '4. Critical Safety Notice',
      body: 'Keep certified copies of your OFP with you at all times, in your vehicle, and on file with your children\'s schools or childcare providers. If violated, call 911 immediately.'
    }
  ]
);
fs.writeFileSync(path.join(resourcesDir, 'order-for-protection-navigator.pdf'), ofpPdf);

// 2. Minnesota Safe Lease Termination Toolkit
const leasePdf = createSimplePdf(
  'Minnesota Safe Lease Termination and Deposit Rights',
  'Survivor Housing Protections Under Minn. Stat. 504B.206',
  [
    {
      heading: '1. Statutory Rights of Domestic Abuse Survivors',
      body: 'Minnesota Statute 504B.206 allows tenants who are victims of domestic abuse, criminal sexual conduct, or stalking to terminate their residential lease early without penalty.'
    },
    {
      heading: '2. Required Documentation',
      body: 'To invoke Section 504B.206, the tenant must provide written advance notice to the landlord along with qualifying documentation: a copy of an Order for Protection, a Harassment Restraining Order, or a qualified statement signed by a licensed domestic violence advocate.'
    },
    {
      heading: '3. Security Deposit and Liability Rules',
      body: 'The tenant is released from future rent obligations starting at the end of the month following proper notice. The landlord cannot withhold the security deposit solely due to lease termination.'
    },
    {
      heading: '4. Phumulani Housing Bridge Support',
      body: 'Phumulani provides emergency lease termination advocacy, landlord mediation, and rapid bridge funds to secure safe replacement apartments for immigrant families.'
    }
  ]
);
fs.writeFileSync(path.join(resourcesDir, 'minnesota-safe-lease-termination-toolkit.pdf'), leasePdf);

// 3. Tea Healing Circle Facilitation Manual
const circlePdf = createSimplePdf(
  'Sisterhood Tea Healing Circle Facilitation Manual',
  'Culturally Specific Trauma Recovery Framework - Founded by Comfort Dondo',
  [
    {
      heading: '1. Philosophy of Sacred Rest and Phumulani',
      body: 'In Zulu, Phumulani means to rest or peace. The Tea Healing Circle was created by Comfort Dondo to provide African immigrant women with a welcoming, sacred space where cultural spiced tea, familiar foods, and confidentiality allow trauma to be safely unpacked.'
    },
    {
      heading: '2. Four Pillars of Facilitation',
      body: 'Pillar 1: Absolute Confidentiality - what is shared in the circle never leaves the circle. Pillar 2: No Forced Disclosure - every participant owns her timeline. Pillar 3: Cultural Kinship - honoring traditional healing ways. Pillar 4: Intergenerational Solidarity.'
    },
    {
      heading: '3. Practical Session Structure',
      body: 'A standard 90-minute circle begins with tea service and grounding breathing (20 min), opening prompts on resilience (30 min), open sisterhood reflection (30 min), and collective affirmation with closing blessing (10 min).'
    },
    {
      heading: '4. Crisis Escalation Protocol',
      body: 'If a participant discloses immediate physical danger or suicidal ideation, the facilitator immediately connects her with a designated safeguarding advocate or the Day One Crisis Line.'
    }
  ]
);
fs.writeFileSync(path.join(resourcesDir, 'tea-healing-circle-facilitation-manual.pdf'), circlePdf);

// 4. Survivor Safety Planning Guide
const safetyPdf = createSimplePdf(
  'Survivor Safety Planning and Digital Confidentiality Guide',
  'Holistic Risk Assessment and Action Guide for Immigrant Survivors',
  [
    {
      heading: '1. What is a Personalized Safety Plan?',
      body: 'A safety plan is a practical, individualized set of actions designed to lower risk of harm before, during, or after leaving an abusive relationship.'
    },
    {
      heading: '2. Digital and Device Safety',
      body: 'Use private browsing, clear search history, and be aware that spyware or location sharing can be covertly installed on phones. Access resources from a safe device at a public library or friend\'s home whenever possible.'
    },
    {
      heading: '3. Emergency Document Checklist',
      body: 'Keep essential documents together in a safe, accessible location or scanned to secure cloud storage: passports, green cards/visas, birth certificates, immunization records, lease agreements, and medical records.'
    },
    {
      heading: '4. Immediate Crisis Assistance',
      body: 'Call 911 for life-threatening emergencies. Call or text Minnesota Day One Crisis Line at 1-866-223-1111 (24/7 confidential advocacy). Contact Phumulani at phumulani.org.'
    }
  ]
);
fs.writeFileSync(path.join(resourcesDir, 'survivor-safety-planning-guide.pdf'), safetyPdf);

console.log('Successfully generated 4 authentic public PDF resources in public/resources/');
