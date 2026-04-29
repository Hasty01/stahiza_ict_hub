import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan',
  size?: 'sm' | 'md' | 'lg'
}) => {
  const variants = {
    primary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    secondary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md",
    ghost: "bg-transparent hover:bg-white/5 text-white",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
    cyan: "bg-cyan-primary text-black font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={cn("rounded-lg transition-all flex items-center justify-center gap-2", variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className }: React.PropsWithChildren<{ className?: string, key?: React.Key }>) => (
  <div className={cn("glass rounded-xl p-4 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-primary/5", className)}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default', className }: React.PropsWithChildren<{ variant?: 'default' | 'cyan' | 'warning' | 'success' | 'danger', className?: string, key?: React.Key }>) => {
  const variants = {
    default: "bg-white/10 text-white/70",
    cyan: "bg-cyan-primary/20 text-cyan-primary border border-cyan-primary/30",
    warning: "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
    success: "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30",
    danger: "bg-red-500/20 text-red-500 border border-red-500/30"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};
