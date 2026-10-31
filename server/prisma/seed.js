import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Create a valid minimal sample PDF for testing paper downloads
function createSamplePdf() {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'papers');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const samplePdfPath = path.join(uploadsDir, 'sample-manuscript.pdf');
  if (!fs.existsSync(samplePdfPath)) {
    // Minimal valid PDF structure
    const samplePdfContent = `%PDF-1.4
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
<< /Length 145 >>
stream
BT
/F1 20 Tf
72 700 Td
(CREST - Wesleyan University Philippines CECT Research Repository) Tj
0 -36 Td
/F1 14 Tf
(Sample Capstone Manuscript: BSIT, BSCpE & BSECE) Tj
ET
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
0000000244 00000 n 
0000000441 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
514
%%EOF`;
    fs.writeFileSync(samplePdfPath, samplePdfContent);
    console.log('✔ Sample PDF manuscript created at:', samplePdfPath);
  }
}

async function main() {
  console.log('Seeding CECT Database...');
  createSamplePdf();

  // Clear existing
  await prisma.activity.deleteMany({});
  await prisma.draft.deleteMany({});
  await prisma.researchPaper.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  const samplePdfUrl = '/uploads/papers/sample-manuscript.pdf';
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Users
  console.log('Seeding users...');
  await prisma.user.createMany({
    data: [
      {
        name: 'CECT Admin',
        email: 'admin@wesleyan.edu.ph',
        password: defaultPassword,
        role: 'admin',
        accountStatus: 'active',
        bio: 'College of Engineering and Computer Technology Academic Administrator',
      },
      {
        name: 'Dr. Maria Reyes',
        email: 'maria.reyes@wesleyan.edu.ph',
        password: defaultPassword,
        role: 'faculty',
        program: 'BSIT',
        accountStatus: 'active',
        bio: 'Department Chair of Information Technology. Research in Resilient Distributed Systems.',
      },
      {
        name: 'Engr. Aris Mendoza',
        email: 'aris.mendoza@wesleyan.edu.ph',
        password: defaultPassword,
        role: 'faculty',
        program: 'BSCpE',
        accountStatus: 'active',
        bio: 'Computer Engineering Faculty Lead. Research in Robotics, Embedded Systems, and IoT.',
      },
      {
        name: 'Engr. Sofia Delgado',
        email: 'sofia.delgado@wesleyan.edu.ph',
        password: defaultPassword,
        role: 'faculty',
        program: 'BSECE',
        accountStatus: 'active',
        bio: 'Electronics Engineering Faculty Lead. Research in Telecommunications and Power Systems.',
      },
      {
        name: 'Alice Bautista',
        email: 'alice.bautista@wesleyan.edu.ph',
        password: defaultPassword,
        role: 'student',
        program: 'BSIT',
        studentId: 'BSIT-2022-014',
        year: '4th Year',
        section: 'BSIT-4A',
        accountStatus: 'active',
        bio: 'Senior BSIT Student focusing on decentralized architecture and smart campus solutions.',
      },
      {
        name: 'Joshua Ramos',
        email: 'joshua.ramos@wesleyan.edu.ph',
        password: defaultPassword,
        role: 'student',
        program: 'BSCpE',
        studentId: 'BSCPE-2022-008',
        year: '4th Year',
        section: 'BSCpE-4A',
        accountStatus: 'active',
        bio: 'Senior Computer Engineering Student focusing on Robotics, Edge AI, and UAV Systems.',
      },
      {
        name: 'Miguel Torres',
        email: 'miguel.torres@wesleyan.edu.ph',
        password: defaultPassword,
        role: 'student',
        program: 'BSECE',
        studentId: 'BSECE-2022-011',
        year: '4th Year',
        section: 'BSECE-4A',
        accountStatus: 'active',
        bio: 'Senior Electronics Engineering Student focusing on Telecommunications and Power Systems.',
      },
    ],
  });

  // 2. Categories
  console.log('Seeding CECT categories...');
  await prisma.category.createMany({
    data: [
      // BSIT tracks
      { name: 'Software Engineering', slug: 'software-engineering', program: 'BSIT', color: '#004ac6', description: 'Software architecture, cloud platforms, and application engineering.' },
      { name: 'Network Administration', slug: 'network-administration', program: 'BSIT', color: '#4059aa', description: 'Campus networks, enterprise infrastructure, and systems administration.' },
      { name: 'Data Analytics', slug: 'data-analytics', program: 'BSIT', color: '#943700', description: 'Data science, big data architectures, and business intelligence.' },
      { name: 'Cybersecurity', slug: 'cybersecurity', program: 'BSIT', color: '#ba1a1a', description: 'Network security, digital forensics, and threat vulnerability analysis.' },
      
      // BSCpE tracks
      { name: 'Embedded Systems & IoT', slug: 'embedded-systems-iot', program: 'BSCpE', color: '#0284c7', description: 'Microcontrollers, sensor networks, wireless telemetry, and smart edge hardware.' },
      { name: 'Robotics & Automation', slug: 'robotics-automation', program: 'BSCpE', color: '#059669', description: 'Autonomous machines, computer vision, actuators, and industrial automation.' },
      { name: 'Hardware Architecture & FPGA', slug: 'hardware-architecture-fpga', program: 'BSCpE', color: '#7c3aed', description: 'Digital logic design, FPGA acceleration, VLSI, and processor architecture.' },
      { name: 'Mechatronics & Control Systems', slug: 'mechatronics-control-systems', program: 'BSCpE', color: '#d97706', description: 'Electro-mechanical systems, PID control, power management, and smart grids.' },

      // BSECE tracks
      { name: 'Telecommunications Engineering', slug: 'telecommunications-engineering', program: 'BSECE', color: '#0e7490', description: 'RF systems, antenna design, wireless communications, and network planning.' },
      { name: 'Power & Energy Systems', slug: 'power-energy-systems', program: 'BSECE', color: '#b45309', description: 'Power distribution, renewable integration, protection, and energy auditing.' },
      { name: 'Microelectronics & VLSI', slug: 'microelectronics-vlsi', program: 'BSECE', color: '#6d28d9', description: 'Semiconductor devices, analog/digital IC design, and chip verification.' },
      { name: 'Instrumentation & Control', slug: 'instrumentation-control', program: 'BSECE', color: '#0f766e', description: 'Sensors, measurement systems, feedback control, and industrial automation.' },
    ],
  });

  // 3. Faculty
  console.log('Seeding faculty...');
  await prisma.faculty.createMany({
    data: [
      { name: 'Dr. Maria Reyes', email: 'maria.reyes@wesleyan.edu.ph', department: 'Information Technology', specialization: 'Distributed Systems, Cloud Architecture', bio: 'Chair of the BSIT track. 14 years advising research in scalable networks and software engineering.', initials: 'MR' },
      { name: 'Prof. Eduardo Cruz', email: 'eduardo.cruz@wesleyan.edu.ph', department: 'Information Technology', specialization: 'Machine Learning, Data Mining', bio: 'Leads data analytics research. Publishes extensively on educational data mining and public ML systems.', initials: 'EC' },
      { name: 'Dr. Liza Fernandez', email: 'liza.fernandez@wesleyan.edu.ph', department: 'Information Technology', specialization: 'Network Security, Digital Forensics', bio: 'Security researcher and incident response lead. Advised award-winning cybersecurity capstones.', initials: 'LF' },
      { name: 'Engr. Aris Mendoza', email: 'aris.mendoza@wesleyan.edu.ph', department: 'Computer Engineering', specialization: 'Robotics, UAV Systems, Edge AI', bio: 'Chair of the BSCpE track. Directs the CECT Robotics Laboratory and autonomous systems initiatives.', initials: 'AM' },
      { name: 'Engr. Katrina De Leon', email: 'katrina.deleon@wesleyan.edu.ph', department: 'Computer Engineering', specialization: 'FPGA Acceleration, Microelectronics', bio: 'Specialist in hardware description languages, digital logic verification, and embedded computing.', initials: 'KD' },
      { name: 'Engr. Ramon Villanueva', email: 'ramon.villanueva@wesleyan.edu.ph', department: 'Computer Engineering', specialization: 'IoT Telemetry, Smart Grid Infrastructure', bio: 'Oversees computer engineering lab operations and advises IoT sensor mesh thesis teams.', initials: 'RV' },
      { name: 'Engr. Sofia Delgado', email: 'sofia.delgado@wesleyan.edu.ph', department: 'Electronics Engineering', specialization: 'Telecommunications, RF Systems', bio: 'Chair of the BSECE track. Directs the CECT communications laboratory and wireless research initiatives.', initials: 'SD' },
      { name: 'Engr. Paulo Aquino', email: 'paulo.aquino@wesleyan.edu.ph', department: 'Electronics Engineering', specialization: 'Power Systems, Renewable Integration', bio: 'Leads power systems instruction and advises energy audit and microgrid thesis teams.', initials: 'PA' },
      { name: 'Engr. Grace Navarro', email: 'grace.navarro@wesleyan.edu.ph', department: 'Electronics Engineering', specialization: 'Instrumentation, Signal Processing', bio: 'Specialist in measurement systems and DSP, advising instrumentation capstone projects.', initials: 'GN' },
    ],
  });

  // 4. Research Papers (BSIT, BSCpE & BSECE)
  console.log('Seeding research papers...');
  await prisma.researchPaper.createMany({
    data: [
      // BSIT Papers
      {
        title: 'Scalable Blockchain Architectures for IoT',
        thesisNumber: 'WU-CECT-IT-2024-001',
        program: 'BSIT',
        category: 'Software Engineering',
        abstract: 'A novel approach to handling high-throughput data streams in decentralized networks using sharding and layer-2 protocols. Evaluated against a simulated smart-campus sensor grid, the proposed architecture sustains throughput at 4.2x baseline while reducing confirmation latency by 38%.',
        authors: JSON.stringify(['Alice Bautista', 'John Doe']),
        keywords: JSON.stringify(['Blockchain', 'IoT', 'Sharding', 'Layer-2', 'Decentralized']),
        year: 2024,
        status: 'approved',
        views: 1240,
        citations: 15,
        advisor: 'Dr. Maria Reyes',
        submittedBy: 'alice.bautista@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/blockchain-iot-capstone',
      },
      {
        title: 'The Ethical Implications of LLMs in Academia',
        thesisNumber: 'WU-CECT-IT-2023-002',
        program: 'BSIT',
        category: 'Data Analytics',
        abstract: 'Analyzing the risks and benefits of automated academic synthesis and its impact on the future of student research. A survey of 1,240 students and 86 faculty members reveals significant gaps in institutional AI-use policy.',
        authors: JSON.stringify(['Jane Smith']),
        keywords: JSON.stringify(['LLM', 'Ethics', 'Academic Integrity', 'AI Policy']),
        year: 2023,
        status: 'approved',
        views: 14200,
        citations: 342,
        advisor: 'Prof. Eduardo Cruz',
        submittedBy: 'jane.smith@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/llm-ethics-academia',
      },
      {
        title: 'Zero-Trust Network Models for Campus Wi-Fi',
        thesisNumber: 'WU-CECT-IT-2024-003',
        program: 'BSIT',
        category: 'Network Administration',
        abstract: 'Implementing and evaluating a zero-trust architecture across a multi-campus university network environment. Continuous device attestation reduced rogue-device incidents by 71% over a one-semester pilot.',
        authors: JSON.stringify(['Mark Santos', 'Peter Lim']),
        keywords: JSON.stringify(['Zero-Trust', 'Wi-Fi', '802.1X', 'Network Security']),
        year: 2024,
        status: 'pending',
        views: 85,
        citations: 0,
        advisor: 'Dr. Maria Reyes',
        submittedBy: 'mark.santos@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/zero-trust-campus-wifi',
      },
      {
        title: 'Computer Vision for Pothole Detection on Provincial Roads',
        thesisNumber: 'WU-CECT-IT-2024-004',
        program: 'BSIT',
        category: 'Data Analytics',
        abstract: 'A YOLOv8-based detection system trained on 12,000 annotated road images achieving 94.2% mean average precision, deployed on low-cost edge hardware for the Nueva Ecija road network.',
        authors: JSON.stringify(['Rosa Dimagiba', 'Carlo Aquino']),
        keywords: JSON.stringify(['Computer Vision', 'YOLOv8', 'Edge Computing', 'Deep Learning']),
        year: 2024,
        status: 'approved',
        views: 890,
        citations: 22,
        advisor: 'Prof. Eduardo Cruz',
        submittedBy: 'rosa.dimagiba@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/pothole-detection-yolov8',
      },

      // BSCpE Papers
      {
        title: 'Edge AI-Powered Autonomous Agricultural Drone for Crop Health Monitoring',
        thesisNumber: 'WU-CECT-CPE-2024-001',
        program: 'BSCpE',
        category: 'Robotics & Automation',
        abstract: 'Design and deployment of a quadrotor unmanned aerial vehicle equipped with a multi-spectral sensor and Jetson Nano edge processor. Uses lightweight convolutional neural networks to classify nitrogen deficiency in rice crops with 91.8% accuracy in real-time flight.',
        authors: JSON.stringify(['Joshua Ramos', 'Kristine Valenzuela']),
        keywords: JSON.stringify(['Robotics', 'UAV', 'Edge AI', 'Precision Agriculture', 'Jetson Nano']),
        year: 2024,
        status: 'approved',
        views: 2840,
        citations: 45,
        advisor: 'Engr. Aris Mendoza',
        submittedBy: 'joshua.ramos@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/edge-ai-agricultural-drone',
      },
      {
        title: 'Low-Latency FPGA-Based Hardware Acceleration for Cryptographic Hashing',
        thesisNumber: 'WU-CECT-CPE-2024-002',
        program: 'BSCpE',
        category: 'Hardware Architecture & FPGA',
        abstract: 'A pipelined SHA-256 and Blake3 hardware accelerator synthesized on Xilinx Artix-7 FPGA. Achieves a 6.8x throughput increase over software implementations while reducing dynamic power consumption to under 1.4 Watts.',
        authors: JSON.stringify(['Brian Mercado', 'Danica Castro']),
        keywords: JSON.stringify(['FPGA', 'Hardware Acceleration', 'SHA-256', 'Cryptography', 'Artix-7']),
        year: 2024,
        status: 'approved',
        views: 1650,
        citations: 38,
        advisor: 'Engr. Katrina De Leon',
        submittedBy: 'brian.mercado@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/fpga-crypto-accelerator',
      },
      {
        title: 'LoRaWAN Multi-Hop Mesh Network for Rural Flood Disaster Early Warning',
        thesisNumber: 'WU-CECT-CPE-2023-003',
        program: 'BSCpE',
        category: 'Embedded Systems & IoT',
        abstract: 'A resilient, solar-powered environmental sensor node network deployed along the Pampanga River basin. Utilizes ultra-low power LoRa transceivers to transmit river level and precipitation metrics up to 14 kilometers without cellular coverage.',
        authors: JSON.stringify(['Paolo Gutierrez', 'Angelo Dizon']),
        keywords: JSON.stringify(['LoRaWAN', 'IoT', 'Disaster Mitigation', 'Mesh Network', 'Embedded Sensors']),
        year: 2023,
        status: 'approved',
        views: 3100,
        citations: 62,
        advisor: 'Engr. Ramon Villanueva',
        submittedBy: 'paolo.gutierrez@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/lorawan-flood-monitoring',
      },
      {
        title: 'Smart Microgrid Energy Management System with ESP32 and MQTT',
        thesisNumber: 'WU-CECT-CPE-2024-004',
        program: 'BSCpE',
        category: 'Mechatronics & Control Systems',
        abstract: 'An automated load-shedding and battery balancing control board designed for institutional solar arrays. Incorporates solid-state relays and current transducers with sub-100ms response time during grid fluctuations.',
        authors: JSON.stringify(['Camille Navarro']),
        keywords: JSON.stringify(['Microgrid', 'ESP32', 'Mechatronics', 'Power Management', 'MQTT']),
        year: 2024,
        status: 'pending',
        views: 95,
        citations: 0,
        advisor: 'Engr. Ramon Villanueva',
        submittedBy: 'camille.navarro@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/smart-microgrid-esp32',
      },

      // BSECE Papers
      {
        title: 'Software-Defined Radio Testbed for Rural 5G Coverage Mapping in Nueva Ecija',
        thesisNumber: 'WU-CECT-ECE-2024-001',
        program: 'BSECE',
        category: 'Telecommunications Engineering',
        abstract: 'A low-cost software-defined radio platform built on USRP hardware for mapping signal propagation across rural municipalities. Field measurements across 14 barangays inform a data-driven small-cell placement plan that lifts predicted coverage from 61% to 89%.',
        authors: JSON.stringify(['Miguel Torres', 'Andrea Lim']),
        keywords: JSON.stringify(['SDR', '5G', 'Telecommunications', 'Propagation Mapping', 'USRP']),
        year: 2024,
        status: 'approved',
        views: 1980,
        citations: 27,
        advisor: 'Engr. Sofia Delgado',
        submittedBy: 'miguel.torres@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/sdr-rural-5g-mapping',
      },
      {
        title: 'Hybrid Solar-Wind Microgrid Controller with Predictive Load Balancing for Campus Buildings',
        thesisNumber: 'WU-CECT-ECE-2024-002',
        program: 'BSECE',
        category: 'Power & Energy Systems',
        abstract: 'A predictive controller that blends solar and wind generation forecasts with building load profiles to schedule battery dispatch. A semester-long pilot on two campus buildings cut grid imports by 23% without comfort violations.',
        authors: JSON.stringify(['Rafael Cruz', 'Jenny Uy']),
        keywords: JSON.stringify(['Microgrid', 'Renewable Energy', 'Load Balancing', 'Power Systems']),
        year: 2024,
        status: 'approved',
        views: 1210,
        citations: 19,
        advisor: 'Engr. Paulo Aquino',
        submittedBy: 'rafael.cruz@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/hybrid-microgrid-controller',
      },
      {
        title: 'Low-Noise ECG Front-End with On-Board Arrhythmia Screening for Barangay Health Stations',
        thesisNumber: 'WU-CECT-ECE-2024-003',
        program: 'BSECE',
        category: 'Instrumentation & Control',
        abstract: 'A battery-powered 12-lead ECG acquisition board with driven-right-leg noise suppression and an on-device classifier that flags probable arrhythmia episodes for referral. Bench tests show 0.8uV input-referred noise and 93.5% screening agreement with cardiologist reads.',
        authors: JSON.stringify(['Liza Marquez']),
        keywords: JSON.stringify(['ECG', 'Instrumentation', 'Biomedical', 'Signal Processing']),
        year: 2024,
        status: 'pending',
        views: 64,
        citations: 0,
        advisor: 'Engr. Grace Navarro',
        submittedBy: 'liza.marquez@wesleyan.edu.ph',
        pdfUrl: samplePdfUrl,
        sourceUrl: 'https://github.com/wup-cect/ecg-frontend-screening',
      },
    ],
  });

  // 5. Activities
  console.log('Seeding activities...');
  await prisma.activity.createMany({
    data: [
      { type: 'submission', detail: 'Edge AI-Powered Autonomous Agricultural Drone was submitted by Joshua Ramos (BSCpE).', user: 'Joshua Ramos', timestamp: new Date('2024-09-02T10:15:00Z') },
      { type: 'approval', detail: 'Scalable Blockchain Architectures for IoT was approved by Dr. Maria Reyes.', user: 'Dr. Maria Reyes', timestamp: new Date('2024-09-05T14:30:00Z') },
      { type: 'submission', detail: 'Smart Microgrid Energy Management System was submitted by Camille Navarro (BSCpE).', user: 'Camille Navarro', timestamp: new Date('2024-09-10T08:20:00Z') },
      { type: 'registration', detail: 'New student account registered: Joshua Ramos (BSCpE-4A).', user: 'Joshua Ramos', timestamp: new Date('2024-08-20T09:00:00Z') },
      { type: 'submission', detail: 'Software-Defined Radio Testbed for Rural 5G Coverage Mapping was submitted by Miguel Torres (BSECE).', user: 'Miguel Torres', timestamp: new Date('2024-09-12T11:00:00Z') },
      { type: 'registration', detail: 'New student account registered: Miguel Torres (BSECE-4A).', user: 'Miguel Torres', timestamp: new Date('2024-08-22T09:00:00Z') },
    ],
  });

  console.log('✔ CECT Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
