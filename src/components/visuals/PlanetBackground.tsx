const PlanetBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Big Planets */}
      <div className="planet w-64 h-64 top-10 left-10"></div>
      <div className="planet w-48 h-48 bottom-16 right-20"></div>

      {/* Medium Planets */}
      <div className="planet w-32 h-32 top-1/3 right-1/4"></div>
      <div className="planet w-40 h-40 bottom-1/4 left-1/5"></div>

      {/* Small Orbiting Dots */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }}
        />
      ))}

      {/* Ripples */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32">
        <div className="ripple"></div>
        <div className="ripple" style={{ animationDelay: "1s" }}></div>
      </div>
    </div>
  );
};

export default PlanetBackground;
