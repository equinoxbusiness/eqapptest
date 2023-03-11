import axios from 'axios';
import store from "./../redux/store";
import { loadDetails, loadCategory, loadProject, loadOrg, addProjectFormData, loadIcos, loadVotedList, loadMemberVotedList, updateSpinner } from '../redux/actions';

const getMe = (wallet_address) => {
  axios.get(`${process.env.REACT_APP_API_URL}/get_details/${wallet_address}`)
    .then((res) => {
      localStorage.setItem("authenticated", '1');
      store.dispatch(loadDetails(res.data.response.member));
    })
    .catch(e => {
      localStorage.removeItem("authenticated");
    });
}

const getCategory = () => {
  axios.get(`${process.env.REACT_APP_API_URL}/get_category`)
    .then((res) => {
      console.log(res.data.response)
      store.dispatch(loadCategory(res.data.response));
    });
}

const getProjects = (id) => {
  store.dispatch(updateSpinner(true))
  axios.get(`${process.env.REACT_APP_API_URL}/get_project/${id}`)
    .then((res) => {
      store.dispatch(loadProject(res.data.response));
      store.dispatch(addProjectFormData(res.data.response));
      store.dispatch(updateSpinner(false))
    })
    .catch(e=>{
      store.dispatch(updateSpinner(false))
    });
}

const getOrg = (id) => {
  axios.get(`${process.env.REACT_APP_API_URL}/get_org/${id}`)
    .then((res) => {
      store.dispatch(loadOrg(res.data.response));
      //getMe(res.data?.response?.org?.wallet_address);
    });
}

const getIcos = () => {
  axios.get(`${process.env.REACT_APP_API_URL}/get_all_ico`)
    .then((res) => {
      store.dispatch(loadIcos(res.data.response));
    });
}

const getProposals = () => {
  axios.get(`${process.env.REACT_APP_API_URL}/get_proposal`)
    .then((res) => {
      store.dispatch(loadIcos(res.data.response));
    });
}

const getProposalVotedList = (id) => {
  axios.get(`${process.env.REACT_APP_API_URL}/get_proposal_voted_list/${id}`)
    .then((res) => {
      store.dispatch(loadVotedList(res.data.response));
    });
}

const getMemberVotedList = (id) => {
  axios.get(`${process.env.REACT_APP_API_URL}/get_member_voted_list/${id}`)
    .then((res) => {
      store.dispatch(loadMemberVotedList(res.data.data));
    });
}

export {
  getMe,
  getCategory,
  getProjects,
  getOrg,
  getIcos,
  getProposals,
  getProposalVotedList,
  getMemberVotedList
};
