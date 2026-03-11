import logoImage from 'figma:asset/4339ba2ffba05c544907d80fefdd2d7f69f5e68e.png';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  // Size mapping cho các biến thể
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-10',
    xl: 'h-12'
  };

  const heightClass = sizeClasses[size];

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImage} 
        alt="CoinSight - Nền tảng học tập và giao dịch mô phỏng crypto"
        className={`${heightClass} w-auto object-contain`}
        loading="eager"
      />
    </div>
  );
}
