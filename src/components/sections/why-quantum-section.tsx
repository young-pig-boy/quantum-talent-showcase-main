import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { EText, ZhOnly } from '@/lib/language-mode';

const reasons = [
  {
    number: '01',
    title: '突破计算边界',
    titleEn: 'Beyond Classical Limits',
    subtitle: 'Beyond Classical Limits',
    description:
      '量子计算正在重新定义可计算问题的边界，为药物发现、材料模拟、金融优化与人工智能带来指数级加速的可能。',
    descriptionEn:
      'Quantum computing is redefining the boundaries of what is computable, enabling exponential acceleration in drug discovery, materials simulation, financial optimization, and artificial intelligence.',
  },
  {
    number: '02',
    title: '保障信息安全',
    titleEn: 'Quantum-Safe Security',
    subtitle: 'Quantum-Safe Security',
    description:
      '量子通信与后量子密码技术为未来的信息基础设施提供新的安全范式，抵御经典与量子计算双重威胁。',
    descriptionEn:
      'Quantum communication and post-quantum cryptography establish new security paradigms for future information infrastructure, resilient against both classical and quantum computing threats.',
  },
  {
    number: '03',
    title: '感知微观世界',
    titleEn: 'Precision Beyond Perception',
    subtitle: 'Precision Beyond Perception',
    description:
      '量子测量技术利用叠加与纠缠的物理特性，实现磁场、重力、时间等物理量的超高精度感知。',
    descriptionEn:
      'Quantum sensing leverages superposition and entanglement to achieve ultra-precise measurement of magnetic fields, gravity, time, and other physical quantities.',
  },
];

export function WhyQuantumSection() {
  return (
    <section id="why" className="relative bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Asymmetric: left title, right body text */}
        <div className="mb-20 grid gap-8 md:grid-cols-12">
          <ScrollReveal className="md:col-span-5">
            <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
              Why Quantum
            </p>
            <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-foreground sm:text-4xl lg:text-5xl">
              <EText zh="为什么是量子科技" en="Why Quantum Technology" display />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="md:col-span-7 md:pt-2">
            <p className="text-base leading-[1.8] text-muted-foreground sm:text-lg">
              <EText
                zh="量子科技不仅是实验室里的前沿探索，更是下一代计算、通信与测量范式的奠基力量。从超导比特到离子阱，从光子到量子传感，每一条技术路线都在逼近物理极限，也在打开全新的产业空间。"
                en="Quantum technology is not just frontier laboratory research — it is the foundational force behind the next generation of computing, communication, and sensing paradigms. From superconducting qubits to ion traps, from photons to quantum sensing, every technical route is pushing against physical limits while opening entirely new industrial spaces."
              />
            </p>
          </ScrollReveal>
        </div>

        {/* Non-symmetric value points - different widths, staggered */}
        <div className="space-y-px">
          {reasons.map((reason, index) => (
            <ScrollReveal key={reason.number} delay={index * 0.1}>
              <div
                className="group grid gap-4 border-t border-white/[0.06] py-8 transition-colors hover:bg-white/[0.02] md:grid-cols-12 md:gap-8 md:py-10"
                style={{
                  paddingLeft: index % 2 === 0 ? '0' : undefined,
                }}
              >
                <div className="md:col-span-1">
                  <span className="font-mono text-sm font-medium text-muted-foreground">
                    {reason.number}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <ZhOnly className="mb-1 font-mono text-xs tracking-wider text-muted-foreground uppercase block">
                    {reason.subtitle}
                  </ZhOnly>
                  <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                    <EText zh={reason.title} en={reason.titleEn} />
                  </h3>
                </div>
                <div className="md:col-span-6 md:col-start-7">
                  <p className="leading-[1.7] text-muted-foreground">
                    <EText zh={reason.description} en={reason.descriptionEn} />
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
