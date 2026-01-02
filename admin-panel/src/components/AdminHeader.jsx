
import { Layout, Typography, Badge, Space, Avatar, Dropdown, Menu } from "antd";
import { motion } from "framer-motion";
import { 
  Building2, 
  Bell, 
  Settings, 
  User,
  LogOut,
  UserCircle,
  Shield
} from "lucide-react";

const { Header } = Layout;

const colors = {
  primary: "#2563eb",
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    700: "#3f3f46",
    900: "#18181b",
  }
};

export default function AdminHeader() {
  const userMenu = (
    <Menu
      style={{
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        padding: "8px",
        minWidth: "200px"
      }}
      items={[
        {
          key: 'profile',
          icon: <UserCircle size={16} />,
          label: 'My Profile',
        },
        {
          key: 'settings',
          icon: <Settings size={16} />,
          label: 'Settings',
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogOut size={16} />,
          label: 'Logout',
          danger: true,
        },
      ]}
    />
  );

  return (
    <Header 
      style={{
        background: colors.neutral[900],
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "80px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: `3px solid ${colors.primary}`
      }}
    >
      {/* Brand Section */}
      <motion.div 
        style={{ display: "flex", alignItems: "center", gap: "16px" }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, #1e40af 100%)`,
          borderRadius: "16px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
        }}>
          <Building2 size={32} color="white" strokeWidth={2.5} />
        </div>
        
        <div>
          <Typography.Title 
            level={3} 
            style={{ 
              margin: 0, 
              color: "white",
              fontWeight: 900,
              letterSpacing: "-0.5px",
              fontSize: "26px"
            }}
          >
            UrbanAssist
          </Typography.Title>
          <Typography.Text 
            style={{ 
              color: colors.neutral[200], 
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}
          >
            Admin Portal
          </Typography.Text>
        </div>
      </motion.div>

      {/* Actions Section */}
      <Space size="large">
        {/* Notifications */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Badge 
            count={3} 
            offset={[-4, 4]}
            style={{ 
              background: "#dc2626",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)"
            }}
          >
            <div style={{
              background: colors.neutral[700],
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              <Bell size={20} color="white" strokeWidth={2.5} />
            </div>
          </Badge>
        </motion.div>

        {/* Settings */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div style={{
            background: colors.neutral[700],
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}>
            <Settings size={20} color="white" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* User Profile */}
        <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div style={{
              background: colors.neutral[700],
              borderRadius: "14px",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "2px solid transparent"
            }}>
              <Avatar 
                size={36}
                icon={<User size={20} />}
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #7c3aed 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              />
              <div style={{ textAlign: "left" }}>
                <Typography.Text 
                  style={{ 
                    color: "white", 
                    fontWeight: 700,
                    fontSize: "14px",
                    display: "block",
                    lineHeight: "1.2"
                  }}
                >
                  Admin User
                </Typography.Text>
                <Typography.Text 
                  style={{ 
                    color: colors.neutral[200], 
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Shield size={10} />
                  Administrator
                </Typography.Text>
              </div>
            </div>
          </motion.div>
        </Dropdown>
      </Space>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .ant-badge-count {
          border-radius: 10px;
          font-size: 11px;
          height: 20px;
          min-width: 20px;
          line-height: 20px;
        }
      `}</style>
    </Header>
  );
}