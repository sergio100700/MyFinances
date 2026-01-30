import React from 'react';
import { Link } from 'react-router-dom';

const Nav: React.FC = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">📊 Dashboard</Link>
                </li>
                <li>
                    <Link to="/portfolio">📈 Cartera</Link>
                </li>
                <li>
                    <Link to="/budgets">💵 Presupuestos</Link>
                </li>
                <li>
                    <Link to="/real-estate">🏠 Inmuebles</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Nav;