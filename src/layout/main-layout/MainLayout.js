import React from 'react';
import {  Layout} from 'antd';
import MainHeader from './MainHeader';
import MainFooter from './MainFooter';
import EqnRoutes from '../../routes/EqnRoutes';
const { Content } = Layout;
const MainLayout = () => {
  return (
    <Layout className="layout">
      <MainHeader/>
      <Content>        
        <div className="site-layout-content">
          <EqnRoutes/>
        </div>
      </Content>   
      <MainFooter/>  
    </Layout>
  );
};
export default MainLayout;