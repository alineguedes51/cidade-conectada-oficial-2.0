import bgImage from '../assets/images/logo-cidade-conectada.png.png';

export default function CityBackground() {
  return (
    <>
      {/* Ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green/10 rounded-full blur-[125px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-yellow/10 rounded-full blur-[125px]" />
      </div>

      {/* Backdrop Image with subtle Blur and opacity */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 opacity-[0.22] transition-opacity duration-500"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(1.5px) brightness(1.05)',
        }}
      />

      {/* Deep sleek white/green veneer */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-slate-50/40" />
    </>
  );
}