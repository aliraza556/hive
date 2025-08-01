'use client';

import React, { createContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import type { WorkspaceWithAccess, WorkspaceWithRole, WorkspaceRole } from '@/types/workspace';

// Context shape as specified in the requirements
interface WorkspaceContextType {
  // Current workspace data
  workspace: WorkspaceWithAccess | null;
  slug: string;
  id: string;
  role: WorkspaceRole | null;
  
  // Available workspaces
  workspaces: WorkspaceWithRole[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Actions
  switchWorkspace: (workspace: WorkspaceWithRole) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshCurrentWorkspace: () => Promise<void>;
  
  // Helper methods
  hasAccess: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
  initialSlug?: string; // Allow setting initial workspace from URL or props
}

export function WorkspaceProvider({ children, initialSlug }: WorkspaceProviderProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // State management
  const [workspace, setWorkspace] = useState<WorkspaceWithAccess | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLoadedSlug, setCurrentLoadedSlug] = useState<string>(''); // Track currently loaded workspace slug

  // Fetch user's workspaces
  const fetchWorkspaces = useCallback(async (): Promise<WorkspaceWithRole[]> => {
    if (status !== 'authenticated') return [];
    
    try {
      const response = await fetch('/api/workspaces');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workspaces');
      }
      
      return data.workspaces || [];
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
      throw err;
    }
  }, [status]);

  // Refresh workspaces list
  const refreshWorkspaces = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedWorkspaces = await fetchWorkspaces();
      setWorkspaces(fetchedWorkspaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, [fetchWorkspaces, status]);

  // Refresh current workspace - simplified to just re-trigger the effect
  const refreshCurrentWorkspace = useCallback(async () => {
    setCurrentLoadedSlug(''); // Clear the loaded slug to force refetch
  }, []);

  // Switch to a different workspace - SIMPLIFIED to only handle navigation
  const switchWorkspace = useCallback((targetWorkspace: WorkspaceWithRole) => {
    // Update URL to reflect the new workspace
    const currentPath = pathname.replace(/^\/w\/[^\/]+/, '') || '';
    const newPath = `/w/${targetWorkspace.slug}${currentPath}`;
    
    router.push(newPath);
  }, [router, pathname]);

  // Initialize context when authentication status changes
  useEffect(() => {
    if (status === 'authenticated') {
      refreshWorkspaces();
    } else if (status === 'unauthenticated') {
      // Reset state when user logs out
      setWorkspace(null);
      setWorkspaces([]);
      setError(null);
      setCurrentLoadedSlug(''); // Reset loaded slug tracking
    }
  }, [status, refreshWorkspaces]);

  // Load current workspace when URL slug changes - FIXED to prevent loops
  useEffect(() => {
    // Extract slug directly from pathname
    const matches = pathname.match(/^\/w\/([^\/]+)/);
    const currentSlug = matches?.[1] || initialSlug || '';
    
    // Only fetch if we have a slug and are authenticated
    if (currentSlug && status === 'authenticated') {
      // Only fetch if we haven't already loaded this workspace
      if (currentSlug !== currentLoadedSlug) {
        const fetchCurrentWorkspace = async () => {
          setLoading(true);
          setError(null);
          
          try {
            const response = await fetch(`/api/workspaces/${currentSlug}`);
            const data = await response.json();
            
            if (!response.ok) {
              if (response.status === 404 || response.status === 403) {
                setWorkspace(null);
                setCurrentLoadedSlug(''); // Clear loaded slug on error
                setError('Workspace not found or access denied');
                return;
              }
              throw new Error(data.error || 'Failed to fetch workspace');
            }
            
            setWorkspace(data.workspace);
            setCurrentLoadedSlug(currentSlug); // Track the loaded slug
          } catch (err) {
            console.error(`Failed to fetch workspace ${currentSlug}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to load workspace');
            setWorkspace(null);
            setCurrentLoadedSlug(''); // Clear loaded slug on error
          } finally {
            setLoading(false);
          }
        };
        
        fetchCurrentWorkspace();
      }
    } else if (!currentSlug && status === 'authenticated') {
      // Clear workspace if no slug
      setWorkspace(null);
      setCurrentLoadedSlug('');
    }
  }, [pathname, status, initialSlug, currentLoadedSlug]); // Include currentLoadedSlug in dependencies

  // Handle redirect to default workspace - SEPARATE effect to prevent loops
  useEffect(() => {
    // Extract slug directly from pathname
    const matches = pathname.match(/^\/w\/([^\/]+)/);
    const currentSlug = matches?.[1] || initialSlug || '';
    
    // Only redirect if:
    // 1. We're authenticated
    // 2. We're not already on a workspace page
    // 3. We have workspaces available
    // 4. We're not currently loading
    if (
      status === 'authenticated' && 
      !currentSlug && 
      workspaces.length > 0 && 
      !loading &&
      !pathname.startsWith('/w/')
    ) {
      const defaultWorkspace = workspaces[0];
      router.push(`/w/${defaultWorkspace.slug}`);
    }
  }, [status, workspaces, loading, pathname, router, initialSlug]); // Include all dependencies

  // Computed values
  const slug = workspace?.slug || '';
  const id = workspace?.id || '';
  const role = workspace?.userRole || null;
  const hasAccess = !!workspace;
  
  // Note: Permission checks have been moved to useWorkspaceAccess hook

  const contextValue: WorkspaceContextType = {
    // Current workspace data
    workspace,
    slug,
    id,
    role,
    
    // Available workspaces
    workspaces,
    
    // Loading and error states
    loading,
    error,
    
    // Actions
    switchWorkspace,
    refreshWorkspaces,
    refreshCurrentWorkspace,
    
    // Helper methods
    hasAccess,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// Note: useWorkspace hook has been moved to src/hooks/useWorkspace.ts

// Export the context for advanced usage
export { WorkspaceContext }; 