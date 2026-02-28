import { Search, Bell, Settings, Menu, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

export const Header = ({ title, subtitle, onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update search term when URL changes (e.g., cleared by members page)
  useEffect(() => {
    const search = searchParams.get('search') || '';
    if (search !== searchTerm) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Handle debounced search navigation
  useEffect(() => {
    // Only trigger if debouncedSearchTerm is different from URL param
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearchTerm === currentSearch) return;

    if (debouncedSearchTerm) {
      router.push(`/members?search=${encodeURIComponent(debouncedSearchTerm)}`);
    } else if (currentSearch) {
      // Clear search if empty and was previously searching
      router.push('/members');
    }
  }, [debouncedSearchTerm, router, searchParams]);

  return (
    <header className="flex items-center justify-between pb-8 pt-6">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Mobile ... */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-card text-text-primary border border-border shadow-sm hover:bg-background"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-4">
           {/* <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 rounded-xl bg-card border border-border text-text-secondary hover:text-primary transition-all hover:shadow-soft"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div> */}
         <div>
           <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight transition-colors">{title}</h1>
          <p className="hidden md:block text-text-secondary font-medium mt-1">{subtitle}</p>
         </div>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm font-medium text-text-primary placeholder-text-secondary focus:outline-none w-48"
          />
        </div>

        <Link href="/settings" className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-card text-text-primary shadow-sm border border-border hover:bg-background transition-colors">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
};