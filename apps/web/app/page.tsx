const data = [
  { heading: "USERS", description: "1250+" },
  { heading: "EXPERIENCE", description: "2008" },
  { heading: "COUNTRY", description: "195+" },
  { heading: "FEATURES", description: "30+" },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative h-screen bg-[url('/bg.webp')]">
        <div className="relative max-w-400 mx-auto px-52 py-20 grid  gap-24">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-8xl font-extrabold leading-tight text-teal-50">
              BUILD PORTFOLIO
              <br />
              <span className="flex items-center gap-24">
                <div className="h-full border border-teal-200 rounded-full">
                  <img
                    src="/space.jpg"
                    alt="space"
                    className="w-32 h-full p-1 rounded-full object-cover"
                  />
                </div>
                AND THEN HOLD
              </span>
            </h1>

            <div className="flex gap-12 ml-6">
              <h1 className="text-8xl font-semibold text-transparent [-webkit-text-stroke:1px_#94A3B8]">
                BUY OR SELL
              </h1>

              <button className="flex items-center gap-2 px-5 py-1 my-4 rounded-full border-2 border-orange-400/40 bg-orange-400/10 hover:bg-orange-400/20 transition">
                <span className="text-orange-300 bg-orange-100 w-12 rounded-3xl">➜</span>
                <span className="text-3xl font-medium text-orange-200">
                  START
                </span>
              </button>
            </div>
          </div>

          <div className="flex gap-10 px-16 bg-[#2C6E73] backdrop-blur-xl py-12 border border-white rounded-3xl p-6 shadow-2xl">
            {data.map((d) => (
              <div key={d.heading} className="w-full flex flex-col gap-4 text-teal-50">
                <div className="h-0.5 w-full bg-teal-50" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 bg-teal-50 rounded" />
                    <div className="">{d.heading}</div>
                  </div>
                  <div className="text-4xl font-semibold">{d.description}</div>
                  <div className="text-lg">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      <section className="h-screen bg-yellow-50 flex">
        <div className="w-1/2 h-full"></div>
        <div className="w-1/2 h-full bg-yellow-100"></div>
      </section>
    </div>
  );
}