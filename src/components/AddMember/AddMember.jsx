import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import "./AddMember.scss";

const AddMember = (props) => {
  const {
    index,
    memberErrors,
    memberTouched,
    memberValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    disabled,
    removeMember,
    setValidWallet,
    setValidEmail,
  } = props;
  const verifyEmail = async (e) => {
    const { value } = e.target;
    setFieldTouched(`members.${index}.email`);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/check_org`,
        {
          email: value,
        }
      );
      console.log(data.data);
      if (data.data.length) {
        console.log("already exist");
        setFieldError(
          `members.${index}.email`,
          "All ready exist in another org"
        );
        toast.error("Allready exist in another EQ Vault");
        return;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/check_member`,
        {
          email: value,
        }
      );
      console.log(data.data);
      if (data.data.length) {
        console.log("already exist");
        setFieldError(
          `members.${index}.email`,
          "All ready exist in another org"
        );
        toast.error("Allready exist in another EQ Vault");
        return;
      }
    } catch (error) {
      console.log(error);
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/check_email/${value}`)
      .then((res) => {
        if (res?.data?.data.length) {
          setValidEmail(false);
        } else {
          setValidEmail(true);
          if (!memberErrors.email) {
            //const formData: any = new FormData();
            //formData.append('otp', Math.floor(1000 + Math.random() * 9000));
            axios
              .get(
                `${process.env.REACT_APP_API_URL}/send_activation_code/${value}`
              )
              .then((res) => {
                console.log(res);
              });
          }
        }
      })
      .catch((e) => {
        setValidEmail(true);
      });
  };
  const verifyWallet = async (e) => {
    const { value } = e.target;
    setFieldTouched(`members.${index}.wallet`);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/check_org`,
        {
          wallet_address: value,
        }
      );
      console.log(data.data);
      if (data.data.length) {
        console.log("already exist");
        setFieldError(
          `members.${index}.wallet`,
          "All ready exist in another org"
        );
        toast.error("Allready exist in another EQ Vault");
        return;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/check_member`,
        {
          wallet_address: value,
        }
      );
      console.log(data.data);
      if (data.data.length) {
        console.log("already exist");
        setFieldError(
          `members.${index}.wallet`,
          "All ready exist in another org"
        );
        toast.error("Allready exist in another EQ Vault");
        return;
      }
    } catch (error) {
      console.log(error);
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/get_details/${value}`)
      .then((res) => {
        setValidWallet(false);
      })
      .catch((e) => {
        setValidWallet(true);
      });
  };
  const verifyOtp = (e) => {
    const { value } = e.target;
    setFieldTouched(`members.${index}.otp`);
    const formData = new FormData();
    formData.append("email", memberValues.email);
    formData.append("otp", value);
    axios
      .post(`${process.env.REACT_APP_API_URL}/verify_otp`, formData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        //setFieldError(`members.${index}.otp`, 'Not an valid otp');
        setFieldValue(`members.${index}.otp`, "");
      });
  };

  return (
    <div className="AddMember row" data-testid="AddMember">
      <div className="col-md-5">
        {/* <WithFormField
          label={`Wallet ${index + 1}`}
          name={`members.${index}.wallet`}
          error={memberErrors.wallet && memberTouched.wallet}
          disabled={disabled}
          onBlur={verifyWallet}
        /> */}
      </div>
      <div className="col-md-2">
        {/* <WithFormField
          label="Member name"
          name={`members.${index}.name`}
          error={memberErrors.name && memberTouched.name}
          disabled={disabled}
        /> */}
      </div>
      <div className="col-md-3">
        {/* <WithFormField
          label="Email ID"
          name={`members.${index}.email`}
          error={memberErrors.email && memberTouched.email}
          onBlur={verifyEmail}
          disabled={disabled}
        /> */}
      </div>
      <div className="col-md-2 d-flex">
        {/* <WithFormField
          label="OTP"
          name={`members.${index}.otp`}
          error={memberErrors.otp && memberTouched.otp}
          onBlur={verifyOtp}
          info={true}
          tooltip="you should receive otp to your entered email"
          disabled={disabled}
        /> */}
        {index > 2 && (
          <i
            className="fa fa-remove ps-2 m-auto cursor-pointer"
            aria-hidden="true"
            role="button"
            onClick={() => removeMember(index)}
          ></i>
        )}
      </div>
    </div>
  );
};

export default AddMember;
