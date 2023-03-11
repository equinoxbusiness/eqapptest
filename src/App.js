import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import MainLayout from './layout/main-layout/MainLayout';
import { getMe } from './services/dashboard';
const App = (props) => {
  useEffect(() => {
    const account = sessionStorage.getItem("selected_account");
    if (account) {
      getMe(account);
    }
  }, [props.account?.account]);
  return (
    <MainLayout />
  );
};
const mapStateToProps = (state) => {
  return {
    account: state.account,
  };
};
export default connect(mapStateToProps)(App);