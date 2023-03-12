import React, { useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom"; 
import { connect } from 'react-redux';
import { message, Tooltip, Switch } from "antd";

function Home(props) {
    const { auth } = props;
    let navigate = useNavigate(); 
    const routeChange = () =>{ 
        let path = `/treasury`; 
        navigate(path);
    }
    useEffect(() => {
        if (auth?.id) {
          return navigate("/dashboard");
        }
    }, [auth?.id])
    return (
        <div className='main-sec'>
            <div className='container mx-auto px-4 py-20 text-center'>
                <div className=' mb-6 max-lg:text-center'>
                    <h1 className='text-4xl font-bold mb-4 '>
                        Deploy EQ Vault
                    </h1>
                    <p className='text-base text-gray-800'>
                         Collective asset management platform on BNB Chain.
                    </p>
                </div>
                <div className="grid grid-cols-2 px-16 max-lg:px-0 max-lg:grid-cols-1 gap-6 max-lg:text-center">
                    <div className='p-6 welcome-card rounded-lg '>
                        <div className='mb-3 text-pink-500'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus" width="40" height="40" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M12 5l0 14"></path>
                                <path d="M5 12l14 0"></path>
                            </svg>
                        </div>
                        <h3 className='text-3xl font-bold mb-3'>
                            Create EQ Vault
                        </h3>
                        <p className='text-base mb-6'>
                            A new EQ Vault that is controlled by one or multiple owners.
                        </p>
                        <button className='rounded-md font-bold px-6 py-3 bg-slate-800 text-white' onClick={routeChange}>Create new EQ Vault</button>
                    </div>
                    <div className='p-6 welcome-card rounded-lg '>
                        <div className='mb-3 text-pink-500'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-curve-right" width="40" height="40" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M10 7l4 -4l4 4"></path>
                                <path d="M14 3v4.394a6.737 6.737 0 0 1 -3 5.606a6.737 6.737 0 0 0 -3 5.606v2.394"></path>
                            </svg>
                        </div>
                        <h3 className='text-3xl font-bold mb-3'>
                            Add existing EQ Vault
                        </h3>
                        <p className='text-base mb-6'>
                            Already have an EQ Vault? Add your Safe using your Safe address.
                        </p>
                        <><Tooltip title=" This feature is coming soon"
                        trigger={['hover', 'click']}
                                    placement="top"
                                    ><Link to='/dashboard/home'><button disabled={true} className=' border border-gray-200 text-slate-300 rounded-md font-medium px-6 py-3 '>Add Existing Vault</button></Link></Tooltip></>
                    </div>
                </div>
            </div>

        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
    };
};

export default connect(mapStateToProps)(Home);