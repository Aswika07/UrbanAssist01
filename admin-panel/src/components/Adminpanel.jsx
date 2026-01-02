import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Table, 
  Select, 
  message, 
  Button, 
  Space, 
  Input, 
  Card, 
  Row, 
  Col,
  Tooltip,
  Statistic,
  Badge
} from "antd";
import { fetchComplaints, updateComplaintStatus } from "../api/complaintApi";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader, 
  RefreshCw,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  XCircle,
  Edit3,
  Save,
  Activity,
  BarChart3
} from "lucide-react";

const { Option } = Select;

// ==================== CONSTANTS ====================
const COLORS = {
  primary: "#2563eb",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    900: "#18181b",
  }
};

const BACKEND_STATUS_MAP = {
  Open: "Open",
  InProgress: "Inprogress",
  Resolved: "Resolved",
  Closed: "Closed"
};

const STATUS_OPTIONS = ["Open", "InProgress", "Resolved", "Closed"];

const STATUS_CONFIG = {
  Open: {
    color: COLORS.danger,
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    icon: AlertCircle,
    label: "Open"
  },
  InProgress: {
    color: COLORS.warning,
    bgColor: "#fef3c7",
    borderColor: "#fde68a",
    icon: Clock,
    label: "In Progress"
  },
  Resolved: {
    color: COLORS.success,
    bgColor: "#d1fae5",
    borderColor: "#a7f3d0",
    icon: CheckCircle2,
    label: "Resolved"
  },
  Closed: {
    color: COLORS.neutral[500],
    bgColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[200],
    icon: XCircle,
    label: "Closed"
  }
};

const PRIORITY_CONFIG = {
  HIGH: { color: COLORS.danger, bgColor: "#fee2e2" },
  MEDIUM: { color: COLORS.warning, bgColor: "#fef3c7" },
  LOW: { color: COLORS.primary, bgColor: "#dbeafe" }
};

const STATS_CARDS = [
  { key: "total", label: "Total Complaints", color: "#2563eb", gradient: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", icon: BarChart3 },
  { key: "open", label: "Open", color: "#dc2626", gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", icon: AlertCircle },
  { key: "inProgress", label: "In Progress", color: "#d97706", gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", icon: Clock },
  { key: "resolved", label: "Resolved", color: "#059669", gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)", icon: CheckCircle2 }
];

// ==================== UTILITY FUNCTIONS ====================
const calculateStats = (data) => {
  const stats = { total: data.length, open: 0, inProgress: 0, resolved: 0, closed: 0 };
  
  data.forEach(({ status }) => {
    if (status === "Open") stats.open++;
    else if (status === "InProgress" || status === "Inprogress") stats.inProgress++;
    else if (status === "Resolved") stats.resolved++;
    else if (status === "Closed") stats.closed++;
  });
  
  return stats;
};

const transformComplaintData = (complaint) => ({
  complaintId: complaint.complaintId,
  status: complaint.status,
  areaCode: complaint.areaCode || "N/A",
  description: complaint.complaintCategory || complaint.description || "No description",
  phoneNumber: complaint.phoneNumber || "N/A",
  priority: complaint.priority || "MEDIUM",
  createdAt: complaint.createdAt,
});

const formatDate = (date) => {
  if (!date) return null;
  const dateObj = new Date(date);
  return {
    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

// ==================== SUB-COMPONENTS ====================

// Status Badge Component
const StatusBadge = React.memo(({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Open;
  const Icon = config.icon;
  
  return (
    <Badge 
      status="processing"
      text={
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: config.bgColor,
          border: `2px solid ${config.borderColor}`,
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "12px",
          color: config.color,
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <Icon size={14} />
          <span>{config.label}</span>
        </div>
      }
    />
  );
});

// Priority Badge Component
const PriorityBadge = React.memo(({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 14px",
      background: config.bgColor,
      borderRadius: "10px",
      fontWeight: 700,
      fontSize: "12px",
      color: config.color,
      letterSpacing: "0.5px"
    }}>
      {priority}
    </div>
  );
});

// Stat Card Component
const StatCard = React.memo(({ stat, value }) => {
  const Icon = stat.icon;
  
  return (
    <Col xs={24} sm={12} lg={6}>
      <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card 
          bordered={false}
          style={{
            background: stat.gradient,
            borderRadius: "16px",
            boxShadow: `0 8px 20px ${stat.color}33`,
            overflow: "hidden",
            position: "relative"
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{
              display: "inline-flex",
              padding: "10px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              marginBottom: "12px",
              backdropFilter: "blur(10px)"
            }}>
              <Icon size={20} color="white" strokeWidth={2.5} />
            </div>
            <Statistic
              title={
                <span style={{ 
                  color: "rgba(255,255,255,0.95)", 
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase"
                }}>
                  {stat.label}
                </span>
              }
              value={value}
              valueStyle={{ 
                color: "white", 
                fontWeight: 800, 
                fontSize: "32px",
                lineHeight: "1"
              }}
            />
          </div>
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: "100px",
            height: "100px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            zIndex: 1
          }} />
        </Card>
      </motion.div>
    </Col>
  );
});

// Page Header Component
const PageHeader = React.memo(() => (
  <div style={{ marginBottom: "32px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
      <Activity size={28} color={COLORS.primary} strokeWidth={2.5} />
      <h1 style={{
        margin: 0,
        fontSize: "32px",
        fontWeight: 800,
        color: COLORS.neutral[900],
        letterSpacing: "-0.5px"
      }}>
        Complaint Management
      </h1>
    </div>
    <p style={{
      margin: 0,
      fontSize: "15px",
      color: COLORS.neutral[600],
      fontWeight: 500,
      paddingLeft: "40px"
    }}>
      Monitor and manage citizen complaints efficiently
    </p>
  </div>
));

// Stats Dashboard Component
const StatsDashboard = React.memo(({ stats }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
    {STATS_CARDS.map(stat => (
      <StatCard key={stat.key} stat={stat} value={stats[stat.key]} />
    ))}
  </Row>
));

// Filter Bar Component
const FilterBar = React.memo(({ 
  searchText, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  onRefresh, 
  loading 
}) => (
  <Card 
    bordered={false}
    style={{ 
      marginBottom: "24px",
      borderRadius: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      border: `1px solid ${COLORS.neutral[200]}`
    }}
    bodyStyle={{ padding: "24px" }}
  >
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={12} md={10} lg={8}>
        <Input
          placeholder="Search complaints..."
          prefix={<Search size={18} color={COLORS.neutral[400]} />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          size="large"
          style={{ 
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500
          }}
        />
      </Col>
      
      <Col xs={24} sm={12} md={8} lg={6}>
        <Select
          value={statusFilter}
          onChange={onStatusChange}
          style={{ width: "100%" }}
          suffixIcon={<Filter size={16} color={COLORS.primary} />}
          size="large"
        >
          <Option value="all">
            <span style={{ fontWeight: 600 }}>All Status</span>
          </Option>
          {STATUS_OPTIONS.map(status => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            return (
              <Option key={status} value={status}>
                <Space>
                  <Icon size={14} color={config.color} />
                  <span style={{ fontWeight: 600 }}>{config.label}</span>
                </Space>
              </Option>
            );
          })}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <Button
          type="primary"
          icon={<RefreshCw size={18} />}
          onClick={onRefresh}
          loading={loading}
          block
          size="large"
          style={{
            borderRadius: "12px",
            background: COLORS.primary,
            borderColor: COLORS.primary,
            fontWeight: 700,
            letterSpacing: "0.5px",
            height: "48px",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
          }}
        >
          Refresh
        </Button>
      </Col>
    </Row>
  </Card>
));

// Date Cell Component
const DateCell = React.memo(({ date }) => {
  const formatted = formatDate(date);
  
  if (!formatted) {
    return <span style={{ color: COLORS.neutral[400] }}>N/A</span>;
  }
  
  return (
    <Tooltip title={new Date(date).toLocaleString()}>
      <div style={{ fontSize: "13px" }}>
        <div style={{ 
          fontWeight: 700, 
          color: COLORS.neutral[700],
          marginBottom: "2px"
        }}>
          {formatted.date}
        </div>
        <div style={{ 
          fontSize: "11px", 
          color: COLORS.neutral[500],
          fontWeight: 500
        }}>
          {formatted.time}
        </div>
      </div>
    </Tooltip>
  );
});

// Loading State Component
const LoadingState = React.memo(() => (
  <div style={{ 
    textAlign: "center", 
    padding: "100px 0",
    background: COLORS.neutral[50]
  }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ display: "inline-block" }}
    >
      <Loader size={56} color={COLORS.primary} strokeWidth={2.5} />
    </motion.div>
    <p style={{ 
      marginTop: "24px", 
      color: COLORS.neutral[600], 
      fontSize: "16px",
      fontWeight: 600,
      letterSpacing: "0.5px"
    }}>
      Loading complaints...
    </p>
  </div>
));

// ==================== CUSTOM HOOKS ====================
const useComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const getComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchComplaints();
      const data = Array.isArray(response) ? response : response.complaints || [];
      const transformedData = data.map(transformComplaintData);
      
      setComplaints(transformedData);
      setSelectedStatuses({});
    } catch (err) {
      console.error("Fetch error:", err);
      message.error({
        content: (
          <Space>
            <AlertTriangle size={16} />
            <span>Failed to fetch complaints</span>
          </Space>
        ),
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusSelect = useCallback((complaintId, newStatus) => {
    setSelectedStatuses(prev => ({ ...prev, [complaintId]: newStatus }));
  }, []);

  const handleUpdateStatus = useCallback(async (complaintId, currentStatus) => {
    const newStatus = selectedStatuses[complaintId];
    
    if (!newStatus || newStatus === currentStatus) {
      message.info("Please select a different status to update");
      return;
    }

    setUpdatingId(complaintId);
    try {
      const backendStatus = BACKEND_STATUS_MAP[newStatus];
      await updateComplaintStatus(complaintId, backendStatus);
      
      setComplaints(prev =>
        prev.map(c => c.complaintId === complaintId ? { ...c, status: newStatus } : c)
      );
      
      setSelectedStatuses(prev => {
        const { [complaintId]: _, ...rest } = prev;
        return rest;
      });
      
      message.success({
        content: (
          <Space>
            <CheckCircle size={16} />
            <span>Status updated to {STATUS_CONFIG[newStatus].label}</span>
          </Space>
        ),
        duration: 2,
      });
      
      await getComplaints();
    } catch (err) {
      console.error("Update error:", err);
      message.error({
        content: (
          <Space>
            <AlertTriangle size={16} />
            <span>Failed to update status</span>
          </Space>
        ),
        duration: 3,
      });
    } finally {
      setUpdatingId(null);
    }
  }, [selectedStatuses, getComplaints]);

  return {
    complaints,
    loading,
    updatingId,
    selectedStatuses,
    getComplaints,
    handleStatusSelect,
    handleUpdateStatus
  };
};

// ==================== TABLE COLUMNS ====================
const useTableColumns = (selectedStatuses, updatingId, handleStatusSelect, handleUpdateStatus) => {
  return useMemo(() => [
    {
      title: "COMPLAINT ID",
      dataIndex: "complaintId",
      key: "complaintId",
      sorter: (a, b) => a.complaintId.localeCompare(b.complaintId),
      width: 160,
      fixed: 'left',
      render: (text) => (
        <Tooltip title={text}>
          <div style={{
            fontWeight: 700,
            fontSize: "13px",
            color: COLORS.primary,
            fontFamily: "'Fira Code', monospace",
            letterSpacing: "0.5px"
          }}>
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: "CURRENT STATUS",
      dataIndex: "status",
      key: "currentStatus",
      width: 160,
      render: (status) => <StatusBadge status={status} />
    },
    {
      title: "UPDATE STATUS",
      key: "changeStatus",
      width: 200,
      render: (_, record) => {
        const selectedStatus = selectedStatuses[record.complaintId] || record.status;
        
        return (
          <Select
            value={selectedStatus}
            onChange={(value) => handleStatusSelect(record.complaintId, value)}
            style={{ width: "100%" }}
            suffixIcon={<Edit3 size={14} color={COLORS.primary} />}
            disabled={updatingId === record.complaintId}
            size="large"
          >
            {STATUS_OPTIONS.map((status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              return (
                <Option key={status} value={status}>
                  <Space>
                    <Icon size={14} color={config.color} />
                    <span style={{ fontWeight: 600 }}>{config.label}</span>
                  </Space>
                </Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: "ACTION",
      key: "action",
      width: 130,
      fixed: 'right',
      render: (_, record) => {
        const hasChanged = selectedStatuses[record.complaintId] && 
                          selectedStatuses[record.complaintId] !== record.status;
        const isUpdating = updatingId === record.complaintId;
        
        return (
          <Button
            type="primary"
            icon={isUpdating ? <Loader size={16} className="spin" /> : <Save size={16} />}
            onClick={() => handleUpdateStatus(record.complaintId, record.status)}
            loading={isUpdating}
            disabled={!hasChanged || isUpdating}
            size="medium"
            style={{
              background: hasChanged ? COLORS.success : COLORS.neutral[400],
              borderColor: hasChanged ? COLORS.success : COLORS.neutral[400],
              fontWeight: 600,
              letterSpacing: "0.5px",
              boxShadow: hasChanged ? "0 4px 12px rgba(5, 150, 105, 0.3)" : "none",
              transition: "all 0.3s ease"
            }}
          >
            Update
          </Button>
        );
      },
    },
    {
      title: "PRIORITY",
      dataIndex: "priority",
      key: "priority",
      width: 130,
      render: (priority) => <PriorityBadge priority={priority} />,
      sorter: (a, b) => {
        const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return order[b.priority] - order[a.priority];
      }
    },
    {
      title: "CONTACT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 140,
      render: (text) => (
        <div style={{ 
          fontFamily: "'Fira Code', monospace",
          fontSize: "13px",
          color: COLORS.neutral[600],
          fontWeight: 500
        }}>
          {text}
        </div>
      )
    },
    {
      title: "DESCRIPTION",
      dataIndex: "description",
      key: "description",
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <div style={{ 
            color: COLORS.neutral[600],
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: "DATE CREATED",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => <DateCell date={date} />,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
  ], [selectedStatuses, updatingId, handleStatusSelect, handleUpdateStatus]);
};

// ==================== MAIN COMPONENT ====================
const AdminPanel = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    complaints,
    loading,
    updatingId,
    selectedStatuses,
    getComplaints,
    handleStatusSelect,
    handleUpdateStatus
  } = useComplaintManagement();

  useEffect(() => {
    getComplaints();
  }, [getComplaints]);

  // Memoized stats
  const stats = useMemo(() => calculateStats(complaints), [complaints]);

  // Memoized filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = 
        complaint.complaintId.toLowerCase().includes(searchLower) ||
        complaint.description.toLowerCase().includes(searchLower) ||
        complaint.areaCode.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchText, statusFilter]);

  // Get table columns
  const columns = useTableColumns(selectedStatuses, updatingId, handleStatusSelect, handleUpdateStatus);

  return (
    <div style={{ 
      padding: "32px 40px",
      background: `linear-gradient(to bottom, ${COLORS.neutral[50]} 0%, #ffffff 100%)`,
      minHeight: "calc(100vh - 80px)"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageHeader />
        
        <StatsDashboard stats={stats} />
        
        <FilterBar 
          searchText={searchText}
          onSearchChange={setSearchText}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onRefresh={getComplaints}
          loading={loading}
        />

        <Card
          bordered={false}
          style={{
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            overflow: "hidden",
            border: `1px solid ${COLORS.neutral[200]}`
          }}
          bodyStyle={{ padding: 0 }}
        >
          {loading ? (
            <LoadingState />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredComplaints}
              rowKey="complaintId"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => (
                  <span style={{ fontWeight: 700, color: COLORS.neutral[700] }}>
                    Showing {total} complaints
                  </span>
                ),
                style: { padding: "20px 24px" }
              }}
              rowClassName={(record, index) => 
                index % 2 === 0 ? "table-row-even" : "table-row-odd"
              }
              scroll={{ x: 1400 }}
            />
          )}
        </Card>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .table-row-even {
          background: white;
          transition: all 0.25s ease;
        }
        
        .table-row-odd {
          background: ${COLORS.neutral[50]};
          transition: all 0.25s ease;
        }
        
        .table-row-even:hover,
        .table-row-odd:hover {
          background: #eff6ff !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08) !important;
          transform: translateY(-1px);
        }
        
        .ant-table-thead > tr > th {
          background: ${COLORS.neutral[900]} !important;
          color: white !important;
          font-weight: 800 !important;
          border: none !important;
          padding: 20px 16px !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 1px !important;
        }
        
        .ant-table-tbody > tr > td {
          padding: 18px 16px !important;
          border-bottom: 1px solid ${COLORS.neutral[100]} !important;
          font-size: 14px !important;
        }
        
        .ant-select-selector {
          border-radius: 12px !important;
          border: 2px solid ${COLORS.neutral[200]} !important;
          transition: all 0.3s ease !important;
          font-weight: 600 !important;
        }
        
        .ant-select-selector:hover {
          border-color: ${COLORS.primary} !important;
        }
        
        .ant-select-focused .ant-select-selector {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
        }
        
        .ant-pagination-item {
          border-radius: 10px !important;
          font-weight: 700 !important;
        }
        
        .ant-pagination-item-active {
          background: ${COLORS.primary} !important;
          border-color: ${COLORS.primary} !important;
        }
        
        .ant-pagination-item-active a {
          color: white !important;
        }
        
        .ant-input {
          border-radius: 12px !important;
          border: 2px solid ${COLORS.neutral[200]} !important;
          transition: all 0.3s ease !important;
          font-weight: 500 !important;
        }
        
        .ant-input:hover,
        .ant-input:focus {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
        }
        
        .ant-btn-primary {
          border-radius: 12px !important;
          font-weight: 700 !important;
          transition: all 0.3s ease !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        
        .ant-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4) !important;
        }
        
        .ant-btn-primary:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
