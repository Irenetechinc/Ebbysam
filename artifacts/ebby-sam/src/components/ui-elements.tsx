import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input 
    ref={ref} 
    className={`w-full px-4 py-3 bg-card border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground ${className}`} 
    {...props} 
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className = '', ...props }, ref) => (
  <textarea 
    ref={ref} 
    className={`w-full px-4 py-3 bg-card border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground min-h-[100px] resize-y ${className}`} 
    {...props} 
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className = '', ...props }, ref) => (
  <select 
    ref={ref} 
    className={`w-full px-4 py-3 bg-card border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground ${className}`} 
    {...props} 
  />
));
Select.displayName = 'Select';

export const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-sm font-medium text-muted-foreground mb-2 ${className}`} {...props} />
);

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    const base = "inline-flex items-center justify-center px-6 py-3 font-medium tracking-wider uppercase text-xs md:text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_rgba(201,168,76,0.15)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.3)]",
      outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      ghost: "text-foreground hover:text-primary hover:bg-card"
    };
    return <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />;
  }
);
Button.displayName = 'Button';
