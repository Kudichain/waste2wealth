export function TrustIndicators() {
  const stats = [
    { value: "10,000+", label: "KG Collected" },
    { value: "500+", label: "Jobs Created" },
    { value: "20+", label: "Verified Factories" },
    { value: "15", label: "Communities Served" }
  ];

  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-outfit font-extrabold text-4xl md:text-5xl mb-2">
                {stat.value}
              </div>
              <div className="font-inter text-sm md:text-base opacity-90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
