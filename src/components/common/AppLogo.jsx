export default function AppLogo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { img: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { img: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    lg: { img: 'w-14 h-14', text: 'text-xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', text: 'text-2xl', sub: 'text-sm' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="https://media.base44.com/images/public/69e449b5017790d72143e6e1/d2ca05de1_logosafenav.jpeg"
        alt="SafeNav360X Logo"
        className={`${s.img} rounded-xl object-cover shadow-sm flex-shrink-0`}
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${s.text} font-black text-foreground tracking-tight`}>SafeNav<span className="text-primary">360X</span></span>
          <span className={`${s.sub} text-muted-foreground font-medium`}>Smart Safety Navigation</span>
        </div>
      )}
    </div>
  );
}