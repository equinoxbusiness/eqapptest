import './Spinner.scss';

const Spinner = () => {

    return (
        <div className="Spinner" data-testid="Spinner">
            <div className="pos-center flex flex-col items-center">
                {/* <div className='loading-text font-bold mb-2'>Transaction is processing...</div> */}
                <div className="loader"></div>
            </div>
        </div>
    )
};

export default Spinner;
