import React from 'react';
import Home from '../pages/home/Home';
import {Route, Routes} from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard';
import Treasury from '../pages/treasury/Treasury';
import PlaySubscription from '../pages/play-subscription/PlaySubscription';
import Icos from '../pages/icos/Icos';
// import Org from '../pages/Org/Org';

function EqnRoutes(props) {
    return (
        <>
            <Routes>
                <Route path="/"  element={<Home />}/>
                <Route path="/treasury"  element={<Treasury />}/>
                <Route path="/dashboard/*"  element={<Dashboard />}/>
                <Route path="/play-subscription"  element={<PlaySubscription />}/>
                <Route path="/icos"  element={<Icos />}/>
            </Routes>
        </>
    );
}

export default EqnRoutes;