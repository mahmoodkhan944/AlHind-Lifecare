import { useLocation } from 'react-router-dom';
import { db } from '@/api/dataClient';
import { useQuery } from '@tanstack/react-query';
import { HeartPulse, ArrowLeft, Info } from 'lucide-react';

export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await db.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-muted mesh-bg-soft">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    {/* 404 Error Code */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-1">
                            <HeartPulse className="w-7 h-7" />
                        </div>
                        <h1 className="text-7xl font-heading font-extrabold text-secondary">404</h1>
                        <div className="h-1 w-16 rounded-full bg-primary mx-auto"></div>
                    </div>

                    {/* Main Message */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-heading font-bold text-secondary">
                            This page could not be found.
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The page <span className="font-medium text-foreground">"{pageName}"</span> doesn't exist — but your care journey doesn't have to stop here.
                        </p>
                    </div>

                    {/* Admin Note */}
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-accent-jade/10 rounded-xl border border-accent-jade/20 text-left">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-jade/15 flex items-center justify-center mt-0.5">
                                    <Info className="w-3 h-3 text-accent-jade" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-secondary">Admin note</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        This could mean the page hasn't been implemented yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-heading font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}