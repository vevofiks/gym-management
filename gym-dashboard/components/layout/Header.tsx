import { Search, Bell, Settings, Menu } from 'lucide-react';

interface HeaderProps {
    title: string;
    subtitle: string;
    onMenuClick: () => void;
}

export const Header = ({ title, subtitle, onMenuClick }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between pb-8 pt-6">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Mobile */}
        <button 
            onClick={onMenuClick}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-card text-text-primary border border-border shadow-sm hover:bg-background"
        >
            <Menu size={20} />
        </button>
        
        <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight transition-colors">{title}</h1>
            <p className="hidden md:block text-text-secondary font-medium mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 rounded-full bg-card px-2 py-2 pr-6 shadow-sm border border-border transition-colors">
           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-text-secondary">
             <Search size={16} />
           </div>
           <input 
             type="text" 
             placeholder="Search members..." 
             className="bg-transparent text-sm font-medium text-text-primary placeholder-text-secondary focus:outline-none w-48"
           />
        </div>

        <button className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-card text-text-primary shadow-sm border border-border hover:bg-background transition-colors">
            <Settings size={20} />
        </button>

        <button className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-card text-text-primary shadow-sm border border-border hover:bg-background transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white border-2 border-white">
                3
            </span>
        </button>
      </div>
    </header>
  );
};