import Link from "next/link";

const marketTape = [
  { symbol: "BTCUSD", price: "$68,420.12", change: "+1.84%" },
  { symbol: "ETHUSD", price: "$3,482.09", change: "+2.13%" },
  { symbol: "SOLUSD", price: "$189.44", change: "+3.02%" },
];

const featureCards = [
  {
    eyebrow: "Live Market Feed",
    title: "Live prices, candles, and market movement in one place.",
    body: "WebSocket updates keep the dashboard responsive with changing bid and ask prices, chart data, and a trading view that always feels active.",
  },
  {
    eyebrow: "Execution Layer",
    title: "Orders flow through a dedicated execution engine.",
    body: "The app separates the frontend, backend, polling, and execution logic, which makes the overall system feel closer to a real trading platform.",
  },
  {
    eyebrow: "Risk Controls",
    title: "Margin, leverage, and position controls are built in.",
    body: "Users can configure trade inputs like margin, leverage, take-profit, and stop-loss as part of a trading flow that goes beyond a visual demo.",
  },
];

const systemStats = [
  { label: "Assets", value: "BTC / ETH / SOL" },
  { label: "Order Types", value: "Market + Limit" },
  { label: "Stack", value: "Next.js, Prisma, Redis" },
  { label: "Architecture", value: "Monorepo + Engine" },
];

const productPillars = [
  "Real-time charting and bid/ask updates",
  "Dedicated backend and execution services",
  "Authentication and position lifecycle flows",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--page-fg)]">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="landing-grid absolute inset-0 -z-20 opacity-50" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_left,_rgba(40,166,162,0.24),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(244,161,76,0.20),_transparent_30%)]" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-14 pt-6 sm:px-10 lg:px-12">
          <header className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-[var(--muted-fg)]">
                Exness Project
              </div>
              <div className="mt-2 text-lg font-semibold">CFD Trading Platform</div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/signin"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#071514] transition hover:bg-[#7de0d8]"
              >
                Open Account
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-16 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:py-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(99,213,204,0.95)]" />
                Real-time trading simulation with live market data
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-[5.8rem]">
                A crypto CFD trading app with live charts and order execution.
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-8 text-[var(--soft-fg)] sm:text-lg">
                Built with Next.js, Redis, Prisma, and a dedicated execution
                engine, this project simulates the core experience of a modern
                trading platform with streaming prices, chart interactions, and
                position management.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#071514] transition hover:bg-[#88e7df]"
                >
                  Start Trading
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/30 hover:bg-white/5"
                >
                  View Platform
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {productPillars.map((pillar) => (
                  <div
                    key={pillar}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-[var(--soft-fg)] backdrop-blur"
                  >
                    {pillar}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-10 hidden h-28 w-28 rounded-full bg-[rgba(99,213,204,0.22)] blur-3xl lg:block" />
              <div className="absolute -bottom-4 right-2 hidden h-32 w-32 rounded-full bg-[rgba(244,161,76,0.18)] blur-3xl lg:block" />

              <div className="rounded-[2rem] border border-white/10 bg-[rgba(8,12,18,0.82)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.35em] text-[var(--muted-fg)]">
                        BTCUSD Perpetual
                      </div>
                      <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                        68,420.12
                      </div>
                      <div className="mt-2 text-sm text-emerald-300">+1.84% today</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                      <div className="text-xs uppercase tracking-[0.28em] text-[var(--muted-fg)]">
                        PnL
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-emerald-300">
                        +$482.60
                      </div>
                      <div className="mt-1 text-sm text-white/55">Open long position</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,19,27,0.95),rgba(9,13,19,0.88))] p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[var(--muted-fg)]">
                      <span>1H Chart</span>
                      <span>Live Feed</span>
                    </div>

                    <div className="mt-4 h-56 overflow-hidden rounded-[1.1rem] border border-white/5 bg-[linear-gradient(180deg,rgba(15,24,31,0.82),rgba(7,11,15,0.98))] p-4">
                      <div className="relative h-full w-full">
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.05)_100%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.05)_100%)] bg-[length:100%_25%,20%_100%]" />
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="absolute inset-0 h-full w-full"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="trade-line" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#4bd3ca" />
                              <stop offset="55%" stopColor="#9ef5ef" />
                              <stop offset="100%" stopColor="#f4a14c" />
                            </linearGradient>
                            <linearGradient id="trade-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgba(75,211,202,0.30)" />
                              <stop offset="100%" stopColor="rgba(75,211,202,0)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0 78 C8 73, 14 65, 20 62 S33 68, 40 54 S50 28, 58 34 S70 66, 76 44 S89 24, 100 14 L100 100 L0 100 Z"
                            fill="url(#trade-fill)"
                          />
                          <path
                            d="M0 78 C8 73, 14 65, 20 62 S33 68, 40 54 S50 28, 58 34 S70 66, 76 44 S89 24, 100 14"
                            fill="none"
                            stroke="url(#trade-line)"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {marketTape.map((item) => (
                      <div
                        key={item.symbol}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                      >
                        <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-fg)]">
                          {item.symbol}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">
                          {item.price}
                        </div>
                        <div className="mt-1 text-sm text-emerald-300">{item.change}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:px-12">
          {systemStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-5"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-fg)]">
                {stat.label}
              </div>
              <div className="mt-3 text-lg font-medium text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="max-w-md">
              <div className="text-xs uppercase tracking-[0.38em] text-[var(--muted-fg)]">
                Platform Overview
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                A landing page that reflects what the product actually does.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--soft-fg)]">
                The goal here is simple: show the product clearly, highlight the
                technical depth behind it, and make the first impression feel
                consistent with the dashboard experience.
              </p>
            </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="group rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="text-xs uppercase tracking-[0.32em] text-[var(--muted-fg)]">
                  {card.eyebrow}
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-8 text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--soft-fg)]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 lg:px-12 lg:pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(10,16,24,0.95),rgba(15,29,36,0.82))] px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.34em] text-[var(--muted-fg)]">
                Ready To Explore
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Explore the platform and see how the system comes together.
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--soft-fg)]">
                Sign in, open the dashboard, and walk through the trading flow
                from live prices to order placement and position tracking.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#081017] transition hover:bg-[#dfe8ea]"
              >
                Launch Dashboard
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
