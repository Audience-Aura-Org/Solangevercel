'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-sans font-medium uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary text-white hover:bg-dark hover:text-accent',
    secondary: 'bg-dark text-white hover:bg-primary',
    outline: 'border border-gray-400 text-gray-200 hover:border-white hover:text-white bg-transparent',
    ghost: 'text-gray-400 hover:text-white bg-transparent border-b border-transparent hover:border-white',
  };

  const sizes = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-10 py-4 text-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
