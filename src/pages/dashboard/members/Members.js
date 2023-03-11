import { Breadcrumb, Button, Tabs } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import TeamMembers from './members-tab-content/TeamMembers';
import AddMemberRequest from './members-tab-content/AddMemberRequest';
import AddMemberFailed from './members-tab-content/AddMemberFailed';
import RemoveMemberRequest from './members-tab-content/RemoveMemberRequest';
import RemoveMemberFailed from './members-tab-content/RemoveMemberFailed';

function Members(props) {
    const items = [
        {
            key: '1',
            label: `Team Members`,
            children: <TeamMembers />,
        },
        {
            key: '2',
            label: `Add Member Requests`,
            children: <AddMemberRequest />,
        },
        {
            key: '3',
            label: `Add Member Failed`,
            children: <AddMemberFailed />,
        },
        {
            key: '4',
            label: `Remove Member Requests`,
            children: <RemoveMemberRequest />,
        },
        {
            key: '5',
            label: `Remove Member Failed`,
            children: <RemoveMemberFailed />,
        },
    ];
    return (
        <div>
            <div className=''>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to='/dashboard/home'>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className='text-pink-500 font-bold'>Members</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className='mb-4'>
                <Tabs items={items} />
            </div>
            <div className='flex gap-3'>
                <div>
                   <Link to='/dashboard/members/add'> <Button type='primary' className='grad-btn border-0'>Add members</Button></Link>
                </div>
                <div>
                <Link to='/dashboard/members/remove'><Button type='primary' className='grad-btn border-0'>Remove members</Button></Link>
                </div>
            </div>
        </div>
    );
}

export default Members;