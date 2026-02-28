'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Scale, Ruler } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    getMemberProgress,
    addMemberProgress,
    deleteMemberProgress,
    ProgressRecord,
    ProgressCreate,
} from '@/services/memberService';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ProgressTrackerProps {
    memberId: number;
}

const EMPTY_FORM: ProgressCreate = {
    measurement_date: new Date().toISOString().split('T')[0],
    weight: undefined,
    height: undefined,
    bmi: undefined,
    body_fat_percentage: undefined,
    chest: undefined,
    waist: undefined,
    hips: undefined,
    arms: undefined,
    thighs: undefined,
    notes: '',
};

export function ProgressTracker({ memberId }: ProgressTrackerProps) {
    const [records, setRecords] = useState<ProgressRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<ProgressCreate>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [activeChart, setActiveChart] = useState<'weight' | 'bmi' | 'body_fat'>('weight');

    const fetchProgress = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getMemberProgress(memberId);
            setRecords(res.data);
        } catch {
            toast.error('Failed to load progress data');
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Auto-calculate BMI if weight and height are provided
            const payload = { ...form };
            if (payload.weight && payload.height && !payload.bmi) {
                const heightM = payload.height / 100;
                payload.bmi = parseFloat((payload.weight / (heightM * heightM)).toFixed(1));
            }
            await addMemberProgress(memberId, payload);
            toast.success('Measurement recorded!');
            setShowForm(false);
            setForm(EMPTY_FORM);
            fetchProgress();
        } catch {
            toast.error('Failed to save measurement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (recordId: number) => {
        if (!confirm('Delete this measurement record?')) return;
        try {
            await deleteMemberProgress(recordId);
            toast.success('Record deleted');
            fetchProgress();
        } catch {
            toast.error('Failed to delete record');
        }
    };

    const chartData = [...records]
        .reverse()
        .map((r) => ({
            date: format(parseISO(r.measurement_date), 'dd MMM'),
            weight: r.weight ? Number(r.weight) : null,
            bmi: r.bmi ? Number(r.bmi) : null,
            body_fat: r.body_fat_percentage ? Number(r.body_fat_percentage) : null,
        }));

    const getTrend = (key: 'weight' | 'bmi' | 'body_fat_percentage') => {
        if (records.length < 2) return null;
        const latest = Number(records[0][key]);
        const prev = Number(records[1][key]);
        if (!latest || !prev) return null;
        const diff = latest - prev;
        return { diff: Math.abs(diff).toFixed(1), direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same' };
    };

    const weightTrend = getTrend('weight');
    const bmiTrend = getTrend('bmi');

    const TrendBadge = ({ trend, lowerIsBetter = true }: { trend: ReturnType<typeof getTrend>; lowerIsBetter?: boolean }) => {
        if (!trend) return null;
        const isGood = lowerIsBetter ? trend.direction === 'down' : trend.direction === 'up';
        const color = trend.direction === 'same' ? 'text-text-secondary' : isGood ? 'text-green-500' : 'text-red-500';
        const Icon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;
        return (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
                <Icon size={12} /> {trend.diff}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Progress Tracker</h3>
                    <p className="text-sm text-text-secondary">{records.length} measurement{records.length !== 1 ? 's' : ''} recorded</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                >
                    <Plus size={16} />
                    Add Measurement
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-text-primary">New Measurement</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Date *</label>
                            <input
                                type="date"
                                required
                                value={form.measurement_date}
                                onChange={(e) => setForm({ ...form, measurement_date: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
                            />
                        </div>
                        {[
                            { key: 'weight', label: 'Weight (kg)' },
                            { key: 'height', label: 'Height (cm)' },
                            { key: 'bmi', label: 'BMI (auto)' },
                            { key: 'body_fat_percentage', label: 'Body Fat %' },
                            { key: 'chest', label: 'Chest (cm)' },
                            { key: 'waist', label: 'Waist (cm)' },
                            { key: 'hips', label: 'Hips (cm)' },
                            { key: 'arms', label: 'Arms (cm)' },
                            { key: 'thighs', label: 'Thighs (cm)' },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="block text-xs text-text-secondary mb-1">{label}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="—"
                                    value={(form as any)[key] ?? ''}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs text-text-secondary mb-1">Notes</label>
                        <textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Optional notes..."
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-border text-text-secondary text-sm hover:bg-background transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all">
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            )}

            {records.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                    <Scale size={40} className="mx-auto text-text-secondary mb-3 opacity-50" />
                    <p className="text-text-secondary font-medium">No measurements yet</p>
                    <p className="text-text-secondary text-sm mt-1">Add the first measurement to start tracking progress</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    {records[0] && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Weight', value: records[0].weight, unit: 'kg', trend: weightTrend, lowerIsBetter: true },
                                { label: 'BMI', value: records[0].bmi, unit: '', trend: bmiTrend, lowerIsBetter: true },
                                { label: 'Body Fat', value: records[0].body_fat_percentage, unit: '%', trend: getTrend('body_fat_percentage'), lowerIsBetter: true },
                                { label: 'Waist', value: records[0].waist, unit: 'cm', trend: null, lowerIsBetter: true },
                            ].map(({ label, value, unit, trend, lowerIsBetter }) => (
                                <div key={label} className="bg-card border border-border rounded-2xl p-4">
                                    <p className="text-xs text-text-secondary mb-1">{label}</p>
                                    <p className="text-xl font-bold text-text-primary">
                                        {value ? `${Number(value).toFixed(1)}${unit}` : '—'}
                                    </p>
                                    <TrendBadge trend={trend} lowerIsBetter={lowerIsBetter} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chart */}
                    {chartData.length > 1 && (
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-text-primary">Progress Chart</h4>
                                <div className="flex gap-2">
                                    {(['weight', 'bmi', 'body_fat'] as const).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveChart(key)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeChart === key ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:text-primary'}`}
                                        >
                                            {key === 'body_fat' ? 'Body Fat' : key.charAt(0).toUpperCase() + key.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}
                                        labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={activeChart}
                                        stroke="var(--primary)"
                                        strokeWidth={2}
                                        dot={{ fill: 'var(--primary)', r: 4 }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* History Table */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="font-bold text-text-primary">Measurement History</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-background text-text-secondary text-xs">
                                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                                        <th className="px-4 py-3 text-right font-semibold">Weight</th>
                                        <th className="px-4 py-3 text-right font-semibold">BMI</th>
                                        <th className="px-4 py-3 text-right font-semibold">Body Fat</th>
                                        <th className="px-4 py-3 text-right font-semibold">Waist</th>
                                        <th className="px-4 py-3 text-right font-semibold">Notes</th>
                                        <th className="px-4 py-3 text-right font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {records.map((r) => (
                                        <tr key={r.id} className="hover:bg-background/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-text-primary">
                                                {format(parseISO(r.measurement_date), 'dd MMM yyyy')}
                                            </td>
                                            <td className="px-4 py-3 text-right text-text-secondary">{r.weight ? `${Number(r.weight).toFixed(1)} kg` : '—'}</td>
                                            <td className="px-4 py-3 text-right text-text-secondary">{r.bmi ? Number(r.bmi).toFixed(1) : '—'}</td>
                                            <td className="px-4 py-3 text-right text-text-secondary">{r.body_fat_percentage ? `${Number(r.body_fat_percentage).toFixed(1)}%` : '—'}</td>
                                            <td className="px-4 py-3 text-right text-text-secondary">{r.waist ? `${Number(r.waist).toFixed(1)} cm` : '—'}</td>
                                            <td className="px-4 py-3 text-right text-text-secondary max-w-[120px] truncate">{r.notes || '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="p-1.5 text-text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
