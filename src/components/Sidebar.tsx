import { useState } from 'react';
import './Sidebar.css';

type AppSection = 'bap' | 'bpp' | 'admin' | 'bpp-admin';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ activeSection, onSectionChange, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const sections = [
    { id: 'bap' as AppSection, label: 'BAP', description: 'Consumer App', icon: '🛒' },
    { id: 'bpp' as AppSection, label: 'BPP', description: 'Seller App', icon: '🏬' },
    { id: 'admin' as AppSection, label: 'Admin', description: 'ONDC Admin', icon: '⚙️' },
    { id: 'bpp-admin' as AppSection, label: 'BPP Admin', description: 'BPP Configuration', icon: '🔧' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={handleToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>
      
      {!isCollapsed && (
        <nav className="sidebar-nav">
          <div className="sidebar-header">
            <h3>Navigation</h3>
          </div>
          <ul className="sidebar-menu">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className={`sidebar-item ${activeSection === section.id ? 'sidebar-item-active' : ''}`}
                  onClick={() => onSectionChange(section.id)}
                  title={section.description}
                >
                  <span className="sidebar-icon">{section.icon}</span>
                  <div className="sidebar-label-group">
                    <span className="sidebar-label">{section.label}</span>
                    {section.description && (
                      <span className="sidebar-description">{section.description}</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}

