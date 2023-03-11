import { useEffect, useRef } from "react";
import "./style.css";
import Logo from "../../images/eqn-logo.png";
const ConfirmModal = ({
  open,
  setOpen,
  title = "Are you sure you want to Approve!",
  handler,
  currentValues,
}) => {
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
      className={`custom-modal approval   ${open ? "active" : ""} font-roboto`}
    >
      <div className="custom-modal-content-wrapper">
        <div className="container">
          <div className="custom-modal-wrapper text-center" ref={modalRef}>
            <div className="mb-2 text-start">
              <img src={Logo} alt="" className="w-12 logo_icon" />
            </div>
            <h4 className="font-semibold text-dark mb-2 text-xl">{title}</h4>

            {/* <p className="text-lg text-black md:mx-20  font-medium">
              Please be patient till the transaction completes
            </p>
            <p className="text-black text-sm font-normal my-4 font-12">
              ( Do not close the tab or refresh the page )
            </p> */}
            <br />
            <div className="inform-btn gap-3 flex justify-center">
              <button
                className="py-2 grad-btn px-12 ok_btn rounded-full text-white"
                onClick={() => handler(currentValues)}
              >
                Yes
              </button>
              <button
                className="py-2 px-12 no_btn rounded-full bg-white border"
                onClick={() => setOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
