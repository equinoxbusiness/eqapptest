import { useEffect, useRef } from "react";
import "./style.css";
import Logo from "../../images/eqn-logo.png";
const NetWorkError = ({ open, setOpen }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (!modalRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`custom-modal logout  network-error ${
        open ? "active" : ""
      } font-roboto`}
    >
      <div className="custom-modal-content-wrapper">
        <div className="container">
          <div className="custom-modal-wrapper text-center" ref={modalRef}>
            <div className="mb-2 text-start">
              <img src={Logo} alt="" className="w-10 logo_icon" />
            </div>
            <h1 className="font-semibold mb-2 text-danger">Wrong network!!</h1>
            <p className="text-lg text-black md:mx-20  font-medium ">
              Connect to BSC mainnet to proceed and make sure your wallet has
              100 EQX tokens.
            </p>
            <p className="text-black text-sm font-normal my-4 font-12">
              {"( Open metamask >> check selected chain network )"}
            </p>
            <div className="inform-btn">
              <button
                className="py-2.5 px-12 ok_btn rounded-full bg-blue-500"
                onClick={() => setOpen(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorkError;
