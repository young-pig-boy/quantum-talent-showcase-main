import type { Track } from '@/lib/types';

export const tracks: Track[] = [
  {
    id: 'superconducting',
    name: '超导量子',
    englishName: 'Superconducting Quantum',
    description:
      '基于超导电路的量子计算路线，是目前产业界最成熟、扩展性最强的技术方向之一。涉及量子比特设计、低温测控、微波工程与纠错算法。',
    enDescription:
      'A quantum computing approach based on superconducting circuits — one of the most mature and scalable directions in the industry. Covers qubit design, cryogenic control, microwave engineering, and error correction algorithms.',
    keywords: ['量子比特', '低温测控', '微波工程', '量子纠错'],
    image: '/hero-bg.jpg',
    order: 1,
    status: 'active',
    overview:
      '超导量子计算是基于超导电路实现量子比特的技术路线。通过在毫开尔文量级的极低温环境中操控超导约瑟夫森结，实现量子态的制备、操控与读取。这是目前产业界投入最大、量子比特数量扩展最快的路线，代表企业包括 IBM、Google、本源量子等。',
    techRoutes: [
      {
        id: 'qubit-design',
        name: '量子比特设计',
        description: 'Transmon、Fluxonium 等比特架构的设计与参数优化',
      },
      {
        id: 'cryo-control',
        name: '低温测控系统',
        description: '稀释制冷机、低温微波链路、室温控制电子学的集成',
      },
      {
        id: 'microwave-eng',
        name: '微波工程',
        description: '射频电路设计、信号完整性、噪声控制',
      },
      {
        id: 'error-correction',
        name: '量子纠错',
        description: '表面码、纠错协议、逻辑比特实现',
      },
    ],
    applications: ['量子优化', '量子模拟', '量子机器学习', '材料模拟'],
    talentTypes: [
      { name: '量子比特工程师', description: '比特版图设计与表征实验' },
      { name: '低温微波工程师', description: '射频链路与低温电子学' },
      { name: '量子算法研究员', description: 'NISQ 算法与误差缓解' },
      { name: '量子软件工程师', description: '编译器与开发工具链' },
    ],
    heroGradient: 'linear-gradient(135deg, #0a0a0b 0%, #0d0d12 50%, #111118 100%)',
  },
  {
    id: 'ion-trap',
    name: '离子阱',
    englishName: 'Trapped-Ion Quantum',
    description:
      '利用囚禁离子作为量子比特，具有长相干时间与高保真门操作的优势。涵盖离子操控、激光系统、真空技术与量子算法实现。',
    enDescription:
      'Uses trapped ions as qubits, offering long coherence times and high-fidelity gate operations. Covers ion manipulation, laser systems, vacuum technology, and quantum algorithm implementation.',
    keywords: ['离子操控', '激光系统', '真空技术', '量子门'],
    image: '/hero-bg.jpg',
    order: 2,
    status: 'active',
    overview:
      '离子阱量子计算通过电磁场将带电原子（如镱离子、钙离子）囚禁在真空中，利用激光操控其内部电子能级实现量子比特。离子阱具有长相干时间、高保真度量子门和全连通性等优势，是量子模拟和中小规模量子计算的重要平台。',
    techRoutes: [
      {
        id: 'ion-control',
        name: '离子操控',
        description: '激光冷却、量子态初始化与读取',
      },
      {
        id: 'laser-system',
        name: '激光系统',
        description: '窄线宽激光器、声光/电光调制、稳频技术',
      },
      {
        id: 'vacuum-tech',
        name: '真空技术',
        description: '超高真空系统、离子阱芯片封装',
      },
      {
        id: 'quantum-gate',
        name: '量子门',
        description: 'Molmer-Sorensen门、单比特门、量子纠错',
      },
    ],
    applications: ['量子模拟', '量子计算原型机', '量子精密测量'],
    talentTypes: [
      { name: '离子阱量子物理学家', description: '实验平台搭建与量子门研究' },
      { name: '激光系统工程师', description: '窄线宽激光与光路集成' },
      { name: '真空技术工程师', description: '超高真空系统与芯片封装' },
    ],
    heroGradient: 'linear-gradient(225deg, #0a0a0b 0%, #0d0d0f 50%, #12110e 100%)',
  },
  {
    id: 'photonics',
    name: '光量子',
    englishName: 'Photonic Quantum',
    description:
      '以单光子和纠缠光子作为信息载体，具备室温运行与天然兼容光通信网络的潜力。涉及光子源、线性光学、集成光路与量子协议。',
    enDescription:
      'Employs single photons and entangled photon pairs as information carriers, with the potential for room-temperature operation and native compatibility with optical communication networks. Covers photon sources, linear optics, integrated photonic circuits, and quantum protocols.',
    keywords: ['单光子源', '线性光学', '集成光路', '量子协议'],
    image: '/hero-bg.jpg',
    order: 3,
    status: 'active',
    overview:
      '光量子计算利用光子作为量子信息的载体，通过线性光学元件（分束器、移相器）和光子探测器实现量子逻辑操作。光量子系统具有室温运行、低退相干和天然兼容光通信网络的优势，在量子通信和可扩展量子计算方面具有独特潜力。',
    techRoutes: [
      {
        id: 'photon-source',
        name: '单光子源',
        description: '量子点、参量下转换、确定性光子源',
      },
      {
        id: 'linear-optics',
        name: '线性光学',
        description: '分束器、移相器、光子干涉',
      },
      {
        id: 'integrated-photonics',
        name: '集成光路',
        description: '硅光芯片、铌酸锂光路、片上量子操控',
      },
      {
        id: 'quantum-protocol',
        name: '量子协议',
        description: 'BB84、纠缠分发、光量子网络',
      },
    ],
    applications: ['光量子计算', '量子通信网络', '光量子模拟'],
    talentTypes: [
      { name: '光量子科学家', description: '光量子计算与通信前沿研究' },
      { name: '集成光路工程师', description: '硅光芯片设计与流片' },
      { name: '量子软件工程师', description: '编译器与开发工具链' },
    ],
    heroGradient: 'linear-gradient(315deg, #0a0a0b 0%, #0c0d0f 50%, #0e1012 100%)',
  },
  {
    id: 'communication-sensing',
    name: '量子通信与测量',
    englishName: 'Quantum Communication & Sensing',
    description:
      '面向信息安全与精密测量的量子技术落地场景，包括量子密钥分发、量子随机数、量子雷达与高精度量子传感器研发。',
    enDescription:
      'Quantum technology applications for information security and precision measurement, including quantum key distribution, quantum random number generation, quantum radar, and high-precision quantum sensor development.',
    keywords: ['量子密钥分发', '量子随机数', '量子传感', '精密测量'],
    image: '/hero-bg.jpg',
    order: 4,
    status: 'active',
    overview:
      '量子通信利用量子力学原理（如不可克隆定理、量子纠缠）实现无条件安全的密钥分发，量子测量则利用量子态对物理量的极端敏感性实现超越经典极限的精密测量。这两个方向是量子技术最接近产业化落地的领域。',
    techRoutes: [
      {
        id: 'qkd',
        name: '量子密钥分发',
        description: 'BB84、E91协议、连续变量QKD',
      },
      {
        id: 'qrng',
        name: '量子随机数',
        description: '光子涨落、真空噪声、真随机数生成',
      },
      {
        id: 'quantum-sensing',
        name: '量子传感',
        description: 'NV色心、原子干涉、量子磁力计',
      },
      {
        id: 'precision-measurement',
        name: '精密测量',
        description: '量子重力仪、量子时钟、量子雷达',
      },
    ],
    applications: ['量子安全通信', '量子精密测量', '量子导航定位'],
    talentTypes: [
      { name: '量子密码研究员', description: 'QKD协议与量子密码方案' },
      { name: '量子传感工程师', description: 'NV色心与量子传感器研发' },
      { name: '量子通信工程师', description: 'QKD系统与网络部署' },
    ],
    heroGradient: 'linear-gradient(45deg, #0a0a0b 0%, #0d0c0f 50%, #110f12 100%)',
  },
];
