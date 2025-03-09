import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Linkedin, MessageSquare, StickyNote, UserCircle, HardDrive } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isNotesPage = location.pathname === '/notes';

  useEffect(() => {
    // Get user email
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email);
      }
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <header className="bg-[#121212] py-4 sm:py-6 px-4 shadow-lg sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-teal-400">
            {isNotesPage ? 'NoteFlow' : 'TaskFlow'}
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            to="/notes"
            className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
          >
            <StickyNote className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Notes</span>
          </Link>
          <a 
            href="https://drive.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
          >
            <HardDrive className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Drive</span>
          </a>
          <a 
            href="https://www.linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
          >
            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
          <a 
            href="https://chatgpt.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">ChatGPT</span>
          </a>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors focus:outline-none"
            >
              <UserCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-lg py-1 border border-gray-700">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-gray-400 truncate" title={userEmail || ''}>
                    {userEmail}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;