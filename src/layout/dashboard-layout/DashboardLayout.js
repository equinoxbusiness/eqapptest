import React from 'react';
import { Layout, Menu } from 'antd';
import { useState } from 'react';
import DashboardRoutes from '../../routes/DashboardRoutes';
import { useNavigate } from "react-router-dom";
import Dashboard from "../../assets/images/dashboard.png";
import Project from "../../assets/images/project.png";
import Members from "../../assets/images/members.png";
import Assets from "../../assets/images/assets.png";
import Governance from "../../assets/images/governance.png";
import Documents from "../../assets/images/documents.png";
import Support from "../../assets/images/support.png";
const { Content, Sider } = Layout;
const menuitems = [
    { label: "Dashboard", key: "home", icon: <img src={Dashboard} alt="" className="w-[20px]" /> },
    { label: "Project", key: "project", icon: <img src={Project} alt="" className="w-[20px]" /> },
    { label: "Members", key: "members", icon: <img src={Members} alt="" className="w-[20px]" /> },
    { label: "Assets", key: "assets", icon: <img src={Assets} alt="" className="w-[20px]" /> },
    { label: "Goverance", key: "goverance", icon: <img src={Governance} alt="" className="w-[20px]" /> },
    // { label: "Play Subscription", key: "play-subscription" },
];

const menufooteritems = [
    { label: "Documentation", key: 'https://docs.eqnetwork.io/', icon: <img src={Documents} alt="" className="w-[20px]" /> },
    { label: "Support", key: 'https://t.me/eqxcommunity', icon: <img src={Support} alt="" className="w-[20px]" /> },
];
const handleClick = ({ key }) => {
    document.body.classList.toggle('sidebar-open');
};
function DashboardLayout(props) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    return (
        <>
            <div onClick={handleClick} className='overlay-div hidden'></div>

            <div className='flex'>
                <Sider collapsible onCollapse={(value) => { setCollapsed(value); console.log(collapsed) }}>

                    <div className='flex flex-col justify-between menu-height'>
                        <div>
                            <Menu theme="light" defaultSelectedKeys={['dashboard']} mode="inline" items={menuitems}
                                onClick={({ key }) => navigate(`/dashboard/${key}`)}
                            />
                        </div>
                        <div>
                            <hr className='border-gray-300' />
                            <Menu theme="light" defaultSelectedKeys={['dashboard']} mode="inline" items={menufooteritems} onClick={({key})=> window.open(key, '_blank')}/>
                        </div>
                    </div>

                </Sider>
                <Content className='overflow-auto'>
                    <div className='px-4 p-4 pb-12'>
                        <DashboardRoutes />
                    </div>
                </Content>
            </div>
        </>
    );
}

export default DashboardLayout;