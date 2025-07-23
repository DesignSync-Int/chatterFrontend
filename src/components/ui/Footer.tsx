import React from 'react';
import packageJson from '../../../package.json';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} DesignSync. All rights reserved.
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="hidden md:block w-1 h-1 bg-gray-400 rounded-full"></div>
            <span>Version {packageJson.version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
