import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import Budgets from '../pages/budgets';
import RealEstate from '../pages/real-estate';
import Inversiones from '../pages/inversiones';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/real-estate" element={<RealEstate />} />
            <Route path="/inversiones" element={<Inversiones />} />
        </Routes>
    );
};

export default AppRoutes;