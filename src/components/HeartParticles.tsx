const hearts = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  left: `${15 + i * 18}%`,
  delay: `${i * 2.5}s`,
  size: 12 + (i % 3) * 4,
  duration: `${7 + i * 1.5}s`,
}));

const HeartParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {hearts.map(h => (
      <div
        key={h.id}
        className="absolute bottom-0 text-accent/40"
        style={{
          left: h.left,
          fontSize: h.size,
          animation: `float-heart ${h.duration} ease-in-out infinite`,
          animationDelay: h.delay,
        }}
      >
        ♥
      </div>
    ))}
  </div>
);

export default HeartParticles;
