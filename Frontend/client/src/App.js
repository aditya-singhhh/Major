import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Patient from './Patient';
import Doctor from './Doctor';
import Homepage from './HomePage';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/patient/:id" element={<Patient />} />
      <Route path="/doctor/:Id" element={<Doctor />} />
    </Routes>
  </Router>
);
export default AppRoutes;
