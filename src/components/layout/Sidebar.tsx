import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Book,
  ClipboardList,
  DollarSign,
  FileText,
  Settings,
  ChevronDown,
  LayoutDashboard,
  ChevronsLeft,
  ChevronsRight,
  BookUser,
  School,
  Briefcase,
  Subscription,
  Users2,
  BarChart,
  CreditCard,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DashboardType = 'schoolAdmin' | 'superAdmin';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dashboardType: DashboardType;
}

const menuItems = {
  schoolAdmin: [
      {
          title: 'Dashboard',
          icon: LayoutDashboard,
          path: '/school-admin/dashboard',
      },
      {
          title: 'Student Management',
          icon: Users,
          submenu: [
              { title: 'Add Student', path: '/school-admin/students/add' },
              { title: 'Student List', path: '/school-admin/students' },
              { title: 'Profiles', path: '/school-admin/students/profiles' },
          ],
      },
      {
          title: 'Teacher Management',
          icon: BookUser,
          submenu: [
              { title: 'Add Teacher', path: '/school-admin/teachers/add' },
              { title: 'Teacher List', path: '/school-admin/teachers' },
          ],
      },
      {
          title: 'Class Management',
          icon: School,
          submenu: [
              { title: 'Add Class', path: '/school-admin/classes/add' },
              { title: 'Class List', path: '/school-admin/classes' },
          ],
      },
      {
          title: 'Subject Management',
          icon: Book,
          submenu: [{ title: 'Subject List', path: '/school-admin/subjects' }],
      },
      {
          title: 'Fees Collection',
          icon: DollarSign,
          submenu: [
              { title: 'Collect Fees', path: '/school-admin/fees/collect' },
              { title: 'Payment History', path: '/school-admin/fees/history' },
          ],
      },
      {
          title: 'Examinations',
          icon: FileText,
          submenu: [
              { title: 'Exam List', path: '/school-admin/exams' },
              { title: 'Mark Entry', path: '/school-admin/exams/marks' },
          ],
      },
      {
          title: 'Routine Management',
          icon: ClipboardList,
          submenu: [{ title: 'Class Routines', path: '/school-admin/routines' }],
      },
      {
          title: 'Settings',
          icon: Settings,
          path: '/school-admin/settings',
      },
  ],
  superAdmin: [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/super-admin/dashboard',
    },
    {
        title: 'School Management',
        icon: Briefcase,
        submenu: [
            { title: 'Add School', path: '/super-admin/schools/add' },
            { title: 'Manage Metadata', path: '/super-admin/schools/manage' },
        ],
    },
    {
        title: 'Subscription Management',
        icon: Subscription,
        path: '/super-admin/subscriptions',
    },
    {
        title: 'Global User Management',
        icon: Users2,
        path: '/super-admin/users',
    },
    {
        title: 'Analytics & Monitoring',
        icon: BarChart,
        path: '/super-admin/analytics',
    },
    {
        title: 'Billing & Invoicing',
        icon: CreditCard,
        path: '/super-admin/billing',
    },
    {
        title: 'AI Agent Supervision',
        icon: Bot,
        path: '/super-admin/ai-supervision',
    }
  ]
};


const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen, dashboardType }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const currentMenu = menuItems[dashboardType];

  return (
    <motion.div
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-sidebar text-white h-full flex flex-col"
    >
      <div className="flex items-center justify-between p-4 h-16">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="text-2xl font-bold whitespace-nowrap"
            >
              Nexus Academy
            </motion.h1>
          )}
        </AnimatePresence>
        <button onClick={toggleSidebar} className="p-2">
          {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {currentMenu.map((item) => (
          <div key={item.title}>
            {item.submenu ? (
              <div
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#334155]"
                onClick={() => toggleSubmenu(item.title)}
              >
                <div className="flex items-center">
                  <item.icon className="h-6 w-6 mr-3" />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-base font-semibold text-gray-200"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {isSidebarOpen && (
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSubmenu === item.title ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
            ) : (
              <NavLink
                to={item.path!}
                className={({ isActive }) =>
                  cn(
                    'flex items-center p-2 hover:bg-[#334155]',
                    isActive ? 'bg-primary text-white' : 'text-gray-200',
                  )
                }
              >
                <item.icon className="h-6 w-6 mr-3" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-base font-semibold"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )}
            <AnimatePresence>
              {isSidebarOpen && openSubmenu === item.title && item.submenu && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-8 space-y-1 overflow-hidden"
                >
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.title}
                      to={subItem.path}
                      className={({ isActive }) =>
                        cn(
                          'block p-2 text-sm font-medium text-gray-400 hover:text-submenu-hover',
                          isActive ? 'text-accent-active' : '',
                        )
                      }
                    >
                      {subItem.title}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
