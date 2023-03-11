import React from 'react';
import { Layout } from 'antd';
const { Footer } = Layout;
function MainFooter(props) {
    return (
        <Footer className='footer fixed w-full text-gray-900 text-sm'>
            COPYRIGHT © 2023 EQ NETWORK
        </Footer>
    );
}

export default MainFooter;