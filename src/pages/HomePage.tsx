import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TestSetGrid } from '../components/test-sets/TestSetGrid';
import { getPublishedTestSets, clearLoaderCache } from '../data/testSetLoader';
import type { TestSetManifestEntry } from '../types/questionSet';
import { Button } from '../components/ui/Button';

/**
 * HomePage
 * 
 * Primary view delivering the QuizSet visual foundation:
 * - Brand-aligned header
 * - Distraction-free hero section with strict visual hierarchy
 * - Catalogue-driven "Available test sets" section
 * - Minimal, uncluttered footer
 */
export const HomePage: React.FC = () => {
  const [testSets, setTestSets] = useState<TestSetManifestEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSets = useCallback(() => {
    setIsLoading(true);
    setError(null);

    getPublishedTestSets()
      .then((result) => {
        if (result.success) {
          setTestSets(result.data);
          setError(null);
        } else {
          setError(result.error.message);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load catalogue');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    getPublishedTestSets()
      .then((result) => {
        if (!isMounted) return;
        if (result.success) {
          setTestSets(result.data);
          setError(null);
        } else {
          setError(result.error.message);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load catalogue');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    clearLoaderCache();
    fetchSets();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#2563EB] uppercase mb-2">
            YOUR PRACTICE SPACE
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#172554] tracking-tight mb-3">
            Choose your next test.
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl">
            Select a set and practice your way.
          </p>
        </section>

        {/* Test Sets Section */}
        <section aria-labelledby="available-sets-heading">
          <div className="mb-6">
            <h2
              id="available-sets-heading"
              className="text-xl sm:text-2xl font-semibold text-[#172554] tracking-tight"
            >
              Available test sets
            </h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="w-full bg-white border border-[#E2E8F0] rounded-[16px] p-8 text-center my-6">
              <div className="inline-block w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-[#64748B]">Loading test sets catalogue...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="w-full bg-white border border-[#FECACA] rounded-[16px] p-6 sm:p-8 my-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-[#172554] mb-1">
                Unable to load test sets
              </h3>
              <p className="text-sm text-[#64748B] max-w-md mx-auto mb-4">{error}</p>
              <Button variant="secondary" onClick={handleRetry} className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Content / Empty State */}
          {!isLoading && !error && <TestSetGrid testSets={testSets} />}
        </section>
      </main>

      <Footer />
    </div>
  );
};
