import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    Receipt,
    FileText,
    Bell,
    TrendingUp,
    LogOut,
    User
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/stock', icon: Package, label: 'View Stock' },
        { path: '/add-stock', icon: PlusCircle, label: 'Add Stock', adminOnly: true },
        { path: '/billing', icon: Receipt, label: 'Billing' },
        { path: '/sales', icon: FileText, label: 'Sales Reports' },
        { path: '/alerts', icon: Bell, label: 'Alerts' },
        { path: '/predictions', icon: TrendingUp, label: 'Predictions' },
    ];

    // Filter nav items based on user role
    const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin());

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>🏥 Medico</h2>
                </div>

                <nav className="sidebar-nav">
                    {visibleNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <User size={20} />
                        <div>
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
