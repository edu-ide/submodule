import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../components/edu/Layout';

const EducationPage: React.FC = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default EducationPage;
