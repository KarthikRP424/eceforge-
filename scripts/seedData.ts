/**
 * ECEForge — Production Academic Database Seed Script
 *
 * Populates:
 *   1. VTU 2022 Scheme (CBCS curriculum with verified course codes)
 *   2. VTU 2025 Scheme (Emerging curriculum; codes marked as pending university notification)
 *   3. Safe and idempotent: can be rerun safely without creating duplicates or overwriting existing data.
 *
 * Usage:
 *   npx tsx scripts/seedData.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
  subjectCode?: string;
  slug: string;
  description: string;
  provisional?: boolean;
}

const SCHEMES: SeedScheme[] = [
  {
    id: 'scheme_vtu_2022',
    name: 'VTU 2022 Scheme',
    slug: 'vtu-2022',
    description: 'Choice Based Credit System (CBCS) curriculum applicable for ECE students admitted from academic year 2022-23 onwards.',
  },
  {
    id: 'scheme_vtu_2025',
    name: 'VTU 2025 Scheme',
    slug: 'vtu-2025',
    description: 'Updated engineering curriculum incorporating advanced embedded systems, edge AI, and next-generation wireless communications.',
  },
];

// Verified VTU 2022 Scheme ECE Subjects
const SUBJECTS_2022: SeedSubject[] = [
  // Semester 3
  {
    id: '2022_sem3_math',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 3,
    name: 'Mathematics for ECE',
    subjectCode: 'BMATE301',
    slug: 'mathematics-for-ece',
    description: 'Fourier series, transforms, and partial differential equations applied to signal analysis.',
  },
  {
    id: '2022_sem3_dsd',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 3,
    name: 'Digital System Design using Verilog',
    subjectCode: 'BEC302',
    slug: 'digital-system-design-verilog',
    description: 'Combinational and sequential circuits, Verilog HDL modeling, and state machine design.',
  },
  {
    id: '2022_sem3_aec',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 3,
    name: 'Analog Electronic Circuits',
    subjectCode: 'BEC303',
    slug: 'analog-electronic-circuits',
    description: 'BJT, MOSFET amplifier analysis, frequency response, feedback configurations, and oscillators.',
  },
  {
    id: '2022_sem3_na',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 3,
    name: 'Network Analysis',
    subjectCode: 'BEC304',
    slug: 'network-analysis',
    description: 'Network theorems, transient analysis, Laplace transform methods, and two-port network parameters.',
  },

  // Semester 4
  {
    id: '2022_sem4_em',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 4,
    name: 'Electromagnetic Field Theory',
    subjectCode: 'BEC401',
    slug: 'electromagnetic-field-theory',
    description: 'Electrostatics, magnetostatics, Maxwell equations, uniform plane waves, and transmission lines.',
  },
  {
    id: '2022_sem4_analog_comm',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 4,
    name: 'Principles of Communication Systems',
    subjectCode: 'BEC402',
    slug: 'principles-of-communication-systems',
    description: 'AM, FM, PM modulation, noise figure, pulse modulation, and sampling theorem.',
  },
  {
    id: '2022_sem4_signals',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 4,
    name: 'Signals and Systems',
    subjectCode: 'BEC403',
    slug: 'signals-and-systems',
    description: 'Continuous and discrete-time signals, LTI systems, convolution, Fourier and Z-transforms.',
  },
  {
    id: '2022_sem4_micros',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 4,
    name: 'Microcontrollers & Embedded Systems',
    subjectCode: 'BEC404',
    slug: 'microcontrollers-and-embedded-systems',
    description: 'ARM Cortex-M microcontroller architecture, assembly and C programming, GPIO, and peripherals.',
  },

  // Semester 5
  {
    id: '2022_sem5_dsp',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 5,
    name: 'Digital Signal Processing',
    subjectCode: '21EC51',
    slug: 'digital-signal-processing',
    description: 'Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT), IIR and FIR filter design.',
  },
  {
    id: '2022_sem5_dig_comm',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 5,
    name: 'Digital Communication',
    subjectCode: '21EC52',
    slug: 'digital-communication',
    description: 'Digital carrier modulation (ASK, FSK, PSK, QAM), matched filters, and error probability analysis.',
  },
  {
    id: '2022_sem5_control',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 5,
    name: 'Control Systems',
    subjectCode: '21EC53',
    slug: 'control-systems',
    description: 'Transfer functions, root locus, Bode plots, Nyquist stability, and state-space analysis.',
  },

  // Semester 6
  {
    id: '2022_sem6_vlsi',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 6,
    name: 'VLSI Design',
    subjectCode: '21EC61',
    slug: 'vlsi-design',
    description: 'CMOS inverter DC characteristics, combinational logic design, stick diagrams, and CMOS layout rules.',
  },
  {
    id: '2022_sem6_antennas',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 6,
    name: 'Microwave and Antennas',
    subjectCode: '21EC62',
    slug: 'microwave-and-antennas',
    description: 'Waveguides, microwave passive devices, antenna parameters, dipole antennas, and antenna arrays.',
  },

  // Semester 7
  {
    id: '2022_sem7_wireless',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 7,
    name: 'Wireless Communication',
    subjectCode: '21EC71',
    slug: 'wireless-communication',
    description: 'Cellular system design, radio wave propagation models, multipath fading, and 4G/5G standards.',
  },
  {
    id: '2022_sem7_itc',
    schemeId: 'scheme_vtu_2022',
    semesterNumber: 7,
    name: 'Information Theory and Coding',
    subjectCode: '21EC72',
    slug: 'information-theory-and-coding',
    description: 'Entropy, source coding (Huffman, Shannon-Fano), linear block codes, cyclic codes, and convolutional codes.',
  },
];

// VTU 2025 Scheme ECE Subjects
// NOTE: VTU 2025 Scheme course codes for higher semesters (Sem 3–7) have not been officially notified.
// Codes are intentionally left unassigned (undefined) and annotated as provisional to avoid fabricating official data.
const SUBJECTS_2025: SeedSubject[] = [
  // Semester 3
  {
    id: '2025_sem3_math',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 3,
    name: 'Advanced Engineering Mathematics for ECE',
    slug: 'advanced-math-ece-2025',
    provisional: true,
    description: 'Differential equations, complex variables, and linear algebra applied to circuit analysis. (VTU 2025 Scheme code pending official notification).',
  },
  {
    id: '2025_sem3_dsd',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 3,
    name: 'Digital Logic and Computer Architecture',
    slug: 'digital-logic-architecture-2025',
    provisional: true,
    description: 'Modern digital system design, HDL synthesis, and RISC-V/ARM architecture fundamentals.',
  },
  {
    id: '2025_sem3_aec',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 3,
    name: 'Solid State Devices and Circuits',
    slug: 'solid-state-devices-2025',
    provisional: true,
    description: 'Semiconductor physics, MOSFET modeling, amplifier stages, and integrated circuit biasing.',
  },
  {
    id: '2025_sem3_circuits',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 3,
    name: 'Circuit Theory and Simulation',
    slug: 'circuit-theory-simulation-2025',
    provisional: true,
    description: 'Network theorems, AC analysis, state variables, and SPICE-based electronic simulation.',
  },

  // Semester 4
  {
    id: '2025_sem4_em',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 4,
    name: 'Electromagnetic Fields and Waves',
    slug: 'electromagnetic-waves-2025',
    provisional: true,
    description: 'Maxwell equations, wave guides, boundary conditions, and high-frequency wave propagation.',
  },
  {
    id: '2025_sem4_signals',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 4,
    name: 'Continuous and Discrete Signal Processing',
    slug: 'signal-processing-foundations-2025',
    provisional: true,
    description: 'Time and frequency domain analysis, sampling, discrete representations, and linear system stability.',
  },
  {
    id: '2025_sem4_embedded',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 4,
    name: 'Embedded Systems and IoT Architectures',
    slug: 'embedded-iot-architectures-2025',
    provisional: true,
    description: 'Microcontroller programming, sensor interfacing, real-time operating systems (RTOS), and IoT protocols.',
  },

  // Semester 5
  {
    id: '2025_sem5_dsp',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 5,
    name: 'Digital Signal Processing Algorithms',
    slug: 'dsp-algorithms-2025',
    provisional: true,
    description: 'Filter design algorithms, spectral estimation, and DSP hardware implementations.',
  },
  {
    id: '2025_sem5_comm',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 5,
    name: 'Modern Communication Systems',
    slug: 'modern-communication-systems-2025',
    provisional: true,
    description: 'Information transmission, digital modulation, spread spectrum, and channel modeling.',
  },

  // Semester 6
  {
    id: '2025_sem6_vlsi',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 6,
    name: 'Advanced VLSI and SoC Design',
    slug: 'advanced-vlsi-soc-2025',
    provisional: true,
    description: 'Deep sub-micron CMOS, System-on-Chip (SoC) methodology, FPGA implementation, and ASIC design flows.',
  },

  // Semester 7
  {
    id: '2025_sem7_nextgen',
    schemeId: 'scheme_vtu_2025',
    semesterNumber: 7,
    name: '5G/6G Wireless Networks',
    slug: 'nextgen-wireless-networks-2025',
    provisional: true,
    description: 'MIMO technologies, millimeter-wave communications, software-defined radio, and next-generation cellular standards.',
  },
];

async function seed() {
  console.log('Seeding ECEForge Academic Catalog (Safe & Idempotent)...');

  // 1. Seed Schemes
  for (const s of SCHEMES) {
    const schemeRef = doc(db, 'schemes', s.id);
    const existing = await getDoc(schemeRef);
    if (!existing.exists()) {
      console.log(`[Creating Scheme]: ${s.name}`);
      await setDoc(schemeRef, {
        name: s.name,
        slug: s.slug,
        description: s.description,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.log(`[Scheme Exists]: ${s.name} (preserved)`);
    }
  }

  // 2. Seed VTU 2022 Subjects
  for (const sub of SUBJECTS_2022) {
    const subRef = doc(db, 'subjects', sub.id);
    const existing = await getDoc(subRef);
    if (!existing.exists()) {
      console.log(`[Creating Subject 2022]: Sem ${sub.semesterNumber} - ${sub.name} (${sub.subjectCode})`);
      await setDoc(subRef, {
        schemeId: sub.schemeId,
        semesterNumber: sub.semesterNumber,
        name: sub.name,
        subjectCode: sub.subjectCode,
        slug: sub.slug,
        description: sub.description,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.log(`[Subject Exists]: ${sub.name} (preserved)`);
    }
  }

  // 3. Seed VTU 2025 Subjects
  for (const sub of SUBJECTS_2025) {
    const subRef = doc(db, 'subjects', sub.id);
    const existing = await getDoc(subRef);
    if (!existing.exists()) {
      console.log(`[Creating Subject 2025]: Sem ${sub.semesterNumber} - ${sub.name} [Provisional Syllabus]`);
      await setDoc(subRef, {
        schemeId: sub.schemeId,
        semesterNumber: sub.semesterNumber,
        name: sub.name,
        subjectCode: sub.subjectCode || null,
        slug: sub.slug,
        description: sub.description,
        provisional: true,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.log(`[Subject Exists]: ${sub.name} (preserved)`);
    }
  }

  console.log('✅ Seeding completed safely without overwriting existing data.');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
