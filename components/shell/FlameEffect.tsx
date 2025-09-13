'use client'

export function FlameEffect() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 20,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
    >
      {/* Subtle wavy gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '120%',
          height: '100%',
          background: `
            linear-gradient(90deg, 
              transparent 0%, 
              rgba(251, 146, 60, 0.03) 20%, 
              rgba(249, 115, 22, 0.05) 40%, 
              rgba(251, 146, 60, 0.04) 60%, 
              rgba(249, 115, 22, 0.03) 80%, 
              transparent 100%
            )
          `,
          animation: 'flame-drift 8s ease-in-out infinite',
          transform: 'translateX(-10%)'
        }}
      />
      
      {/* Secondary wave */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '110%',
          height: '100%',
          background: `
            linear-gradient(90deg, 
              transparent 0%, 
              rgba(234, 88, 12, 0.02) 30%, 
              rgba(251, 146, 60, 0.04) 50%, 
              rgba(234, 88, 12, 0.03) 70%, 
              transparent 100%
            )
          `,
          animation: 'flame-drift-reverse 12s ease-in-out infinite',
          transform: 'translateX(-5%)'
        }}
      />
      
      <style jsx>{`
        @keyframes flame-drift {
          0% {
            transform: translateX(-10%) scaleY(0.9);
            opacity: 0.4;
          }
          33% {
            transform: translateX(-5%) scaleY(1.1);
            opacity: 0.6;
          }
          66% {
            transform: translateX(-8%) scaleY(0.95);
            opacity: 0.5;
          }
          100% {
            transform: translateX(-10%) scaleY(0.9);
            opacity: 0.4;
          }
        }
        
        @keyframes flame-drift-reverse {
          0% {
            transform: translateX(-5%) scaleY(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(-2%) scaleY(1.05);
            opacity: 0.5;
          }
          100% {
            transform: translateX(-5%) scaleY(1);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}
