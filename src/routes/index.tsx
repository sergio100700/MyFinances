import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import Portfolio from '../pages/portfolio';
import Budgets from '../pages/budgets';
import RealEstate from '../pages/real-estate';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/real-estate" element={<RealEstate />} />
        </Routes>
    );
};

export default AppRoutes;