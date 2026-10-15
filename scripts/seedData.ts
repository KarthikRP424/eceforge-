/**
 * ECEForge — Initial Academic Database Seed Script
 *
 * Populates:
 *   1. VTU 2022 Scheme & VTU 2025 Scheme
 *   2. Core Electronics & Communication Engineering (ECE) subjects
 *      for Semesters 3, 4, 5, 6, and 7.
 *
 * Usage:
 *   npx tsx scripts/seedData.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForSeed",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "eceforge.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "eceforge",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "eceforge.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface SeedScheme {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface SeedSubject {
  id: string;
  schemeId: string;
  semesterNumber: number;
  name: string;
  subjectCode: string;
  slug: string;
  description: string;
}

const SCHEMES: SeedScheme[] = [
  {
    id: 'scheme_vtu_2022',
    name: 'VTU 2022 Scheme',
    slug: 'vtu-2022',
    description: 'Outcome Based Education (OBE) and Choice Based Credit System (CBCS) curriculum applicable for students admitted from academic year 2022-23.',
  },
  {
    id: 'scheme_vtu_2025',
    name: 'VTU 2025 Scheme',
    slug: 'vtu-2025',
    description: 'Advanced engineering curriculum incorporating AI/ML integration, modern VLSI architectures, and next-generation wireless communications.',
  },
];

const SUBJECTS_2022: Omit<SeedSubject, 'schemeId'>[] = [
  // Semester 3
  {
    id: '2022_sem3_math',
    semesterNumber: 3,
    name: 'Mathematics for ECE',
    subjectCode: 'BMATE301',
    slug: 'mathematics-for-ece',
    description: 'Fourier series, transforms, and partial differential equations applied to signal analysis.',
  },
  {
    id: '2022_sem3_dsd',
    semesterNumber: 3,
    name: 'Digital System Design using Verilog',
    subjectCode: 'BEC302',
    slug: 'digital-system-design-verilog',
    description: 'Combinational and sequential circuits, Verilog HDL modeling, and state machine design.',
  },
  {
    id: '2022_sem3_aec',
    semesterNumber: 3,
    name: 'Analog Electronic Circuits',
    subjectCode: 'BEC303',
    slug: 'analog-electronic-circuits',
    description: 'BJT, MOSFET amplifier analysis, frequency response, feedback configurations, and oscillators.',
  },
  {
    id: '2022_sem3_na',
    semesterNumber: 3,
    name: 'Network Analysis',
    subjectCode: 'BEC304',
    slug: 'network-analysis',
    description: 'Network theorems, transient analysis, Laplace transform methods, and two-port network parameters.',
  },

  // Semester 4
  {
    id: '2022_sem4_em',
    semesterNumber: 4,
    name: 'Electromagnetic Field Theory',
    subjectCode: 'BEC401',
    slug: 'electromagnetic-field-theory',
    description: 'Electrostatics, magnetostatics, Maxwell equations, uniform plane waves, and transmission lines.',
  },
  {
    id: '2022_sem4_analog_comm',
    semesterNumber: 4,
    name: 'Principles of Communication Systems',
    subjectCode: 'BEC402',
    slug: 'principles-of-communication-systems',
    description: 'AM, FM, PM modulation, noise figure, pulse modulation, and sampling theorem.',
  },
  {
    id: '2022_sem4_signals',
    semesterNumber: 4,
    name: 'Signals and Systems',
    subjectCode: 'BEC403',
    slug: 'signals-and-systems',
    description: 'Continuous and discrete-time signals, LTI systems, convolution, Fourier and Z-transforms.',
  },
  {
    id: '2022_sem4_micros',
    semesterNumber: 4,
    name: 'Microcontrollers & Embedded Systems',
    subjectCode: 'BEC404',
    slug: 'microcontrollers-and-embedded-systems',
    description: 'ARM Cortex-M microcontroller architecture, assembly and C programming, GPIO, and peripherals.',
  },

  // Semester 5
  {
    id: '2022_sem5_dsp',
    semesterNumber: 5,
    name: 'Digital Signal Processing',
    subjectCode: '21EC51',
    slug: 'digital-signal-processing',
    description: 'Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT), IIR and FIR filter design.',
  },
  {
    id: '2022_sem5_dig_comm',
    semesterNumber: 5,
    name: 'Digital Communication',
    subjectCode: '21EC52',
    slug: 'digital-communication',
    description: 'Digital carrier modulation (ASK, FSK, PSK, QAM), matched filters, and error probability analysis.',
  },
  {
    id: '2022_sem5_control',
    semesterNumber: 5,
    name: 'Control Systems',
    subjectCode: '21EC53',
    slug: 'control-systems',
    description: 'Transfer functions, root locus, Bode plots, Nyquist stability, and state-space analysis.',
  },

  // Semester 6
  {
    id: '2022_sem6_vlsi',
    semesterNumber: 6,
    name: 'VLSI Design',
    subjectCode: '21EC61',
    slug: 'vlsi-design',
    description: 'CMOS inverter DC characteristics, combinational logic design, stick diagrams, and CMOS layout rules.',
  },
  {
    id: '2022_sem6_antennas',
    semesterNumber: 6,
    name: 'Microwave and Antennas',
    subjectCode: '21EC62',
    slug: 'microwave-and-antennas',
    description: 'Waveguides, microwave passive devices, antenna parameters, dipole antennas, and antenna arrays.',
  },

  // Semester 7
  {
    id: '2022_sem7_wireless',
    semesterNumber: 7,
    name: 'Wireless Communication',
    subjectCode: '21EC71',
    slug: 'wireless-communication',
    description: 'Cellular system design, radio wave propagation models, multipath fading, and 4G/5G standards.',
  },
  {
    id: '2022_sem7_itc',
    semesterNumber: 7,
    name: 'Information Theory and Coding',
    subjectCode: '21EC72',
    slug: 'information-theory-and-coding',
    description: 'Entropy, source coding (Huffman, Shannon-Fano), linear block codes, cyclic codes, and convolutional codes.',
  },
];

async function seed() {
  console.log('Seeding ECEForge Academic Schemes and Subjects...');

  // 1. Schemes
  for (const s of SCHEMES) {
    console.log(`Writing scheme: ${s.name}`);
    await setDoc(doc(db, 'schemes', s.id), {
      name: s.name,
      slug: s.slug,
      description: s.description,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // 2. VTU 2022 Subjects
  for (const sub of SUBJECTS_2022) {
    console.log(`Writing subject (VTU 2022): Sem ${sub.semesterNumber} - ${sub.name}`);
    await setDoc(doc(db, 'subjects', sub.id), {
      schemeId: 'scheme_vtu_2022',
      semesterNumber: sub.semesterNumber,
      name: sub.name,
      subjectCode: sub.subjectCode,
      slug: sub.slug,
      description: sub.description,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // 3. VTU 2025 Subjects (mirrored core with updated codes)
  for (const sub of SUBJECTS_2022) {
    const id2025 = sub.id.replace('2022_', '2025_');
    console.log(`Writing subject (VTU 2025): Sem ${sub.semesterNumber} - ${sub.name}`);
    await setDoc(doc(db, 'subjects', id2025), {
      schemeId: 'scheme_vtu_2025',
      semesterNumber: sub.semesterNumber,
      name: sub.name,
      subjectCode: sub.subjectCode.replace('21', '25').replace('BEC', '25EC'),
      slug: sub.slug,
      description: sub.description,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  console.log('✅ Academic structure seeded successfully!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
