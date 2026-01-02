import React from "react";
import { Layout } from "antd";
import AdminHeader from "./components/AdminHeader";
import AdminPanel from "./components/Adminpanel";


const { Content, Footer } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminHeader />
      
      <Content>
        <AdminPanel />
      </Content>
      
     
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: #f8fafc;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
        }

        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, transform 0.3s ease;
        }
        
        /* Remove default ant design margins */
        .ant-layout {
          background: #f8fafc;
        }
      `}</style>
    </Layout>
  );
}

export default App;

