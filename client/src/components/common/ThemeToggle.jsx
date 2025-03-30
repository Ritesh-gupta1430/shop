// import { useTheme } from '@/context/ThemeContext';
// import { Sun, Moon, Monitor } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ThemeToggle = ({ className = '' }) => {
//   const { isDarkMode, theme, setTheme } = useTheme();

//   // Variants for the animation
//   const iconVariants = {
//     hidden: { opacity: 0, scale: 0.8, rotate: -20 },
//     visible: { 
//       opacity: 1, 
//       scale: 1, 
//       rotate: 0,
//       transition: { 
//         duration: 0.3, 
//         ease: "easeOut" 
//       }
//     },
//     exit: { 
//       opacity: 0, 
//       scale: 0.8, 
//       rotate: 20,
//       transition: { 
//         duration: 0.3, 
//         ease: "easeIn" 
//       }
//     }
//   };

//   const handleThemeChange = (newTheme) => {
//     setTheme(newTheme);
//   };

//   return (
//     <div className={`flex items-center gap-2 ${className}`}>
//       <motion.button
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//         onClick={() => handleThemeChange('light')}
//         className={`p-1.5 rounded-full ${theme === 'light' 
//           ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' 
//           : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
//         aria-label="Light mode"
//       >
//         <Sun size={18} />
//       </motion.button>
      
//       <motion.button
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//         onClick={() => handleThemeChange('system')}
//         className={`p-1.5 rounded-full ${theme === 'system' 
//           ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' 
//           : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
//         aria-label="System preference"
//       >
//         <Monitor size={18} />
//       </motion.button>
      
//       <motion.button
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//         onClick={() => handleThemeChange('dark')}
//         className={`p-1.5 rounded-full ${theme === 'dark' 
//           ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' 
//           : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
//         aria-label="Dark mode"
//       >
//         <Moon size={18} />
//       </motion.button>
//     </div>
//   );
// };

// export default ThemeToggle;

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react'; // Assuming you're using Lucide for icons
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { isDarkMode, theme, setTheme } = useTheme();

  // Handle theme change
  const handleThemeChange = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <motion.button
      onClick={handleThemeChange}
      className="p-1.5 rounded-full"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}
    </motion.button>
  );
};

export default ThemeToggle;