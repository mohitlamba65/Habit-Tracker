// import React from 'react';

// const Dashboard = () => {
//   return (
//     <div className="p-8 bg-gray-100 h-screen">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Dashboard</h2>
//       <p className="text-gray-600">Here you can view and manage your habits.</p>
//     </div>
//   );
// };

// export default Dashboard;

import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <div className="p-8 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen py-28">
      <motion.h2
        className="text-4xl font-bold text-center text-blue-800 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Your Dashboard
      </motion.h2>
      <motion.p
        className="text-center text-gray-700 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Here you can view and manage your habits and track your progress.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Additional feature cards can be added here */}
      </div>
    </div>
  );
};

export default Dashboard;
