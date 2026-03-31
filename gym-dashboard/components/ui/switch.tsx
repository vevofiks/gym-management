import { cn } from '@/lib/utils';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const Switch = ({ checked, onChange, label, disabled }: SwitchProps) => {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            {label && (
                <span className="text-sm font-medium text-text-primary">{label}</span>
            )}
            <div
                className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    checked ? "bg-primary" : "bg-border",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && onChange(!checked)}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        checked ? "translate-x-6" : "translate-x-1"
                    )}
                />
            </div>
        </label>
    );
};
