import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWeb3 } from "../../helpers/currentWalletHelper";
import { connect } from "react-redux";
import { getIcos, getOrg } from "../../services/dashboard";
import { shortAddress } from "../../helpers";
import axios from "axios";
import pdfImage from "../../assets/images/pdf.png";
import { GlobalOutlined, ExportOutlined, FacebookOutlined, TwitterOutlined, ShareAltOutlined, MailOutlined } from "@ant-design/icons";
import { message, Tooltip, Switch } from "antd";
import equinoxIcoAbi from "../../Config/abis/subscriptionMain.json";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
const Icos = (props) => {
  const { ico, auth, org } = props;
  const [orgDatas, setOrgDatas] = useState([]);
  const [selected, setSelected] = useState(false);
  const [selected2, setSelected2] = useState(false);

  // // console.log(ico, org);
  useEffect(() => {
    getIcos();
    if (auth && auth.org_id) getOrg(auth.org_id);
  }, [auth]);
  console.log("ICO", ico);
  useEffect(() => {
    setOrgDatas([]);
    if (ico) {
      ico.forEach(async (val) => {
        const {
          data: { response: projectDetails },
        } = await axios.get(
          `https://app.eqnetwork.io/api/get_project/${val.project_id}`
        );
        const {
          data: { response },
        } = await axios.get(
          `https://app.eqnetwork.io/api/get_org/${projectDetails.org_id}`
        );
        // console.log(project[0]);
        setOrgDatas((prev) => [...prev, response]);
      });
    }
  }, [ico]);

  const convertPrice = (price) => {
    const convertedprice = new Intl.NumberFormat("en-GB", {
      notation: "compact",
      compactDisplay: "short",
    }).format(price);
    return convertedprice;
  };

  const claimBNB = async (address) => {
    let web3 = await getWeb3();
    console.log(address);
    let eqxContract = new web3.eth.Contract(equinoxIcoAbi.abi, address);
    console.log(eqxContract);
    let accounts = await web3.eth.getAccounts();
    if (eqxContract) {
      await eqxContract.methods
        .withdrawETH()
        .send({ from: accounts[0] })
        .on("error", (error) => console.log(error))
        .then((result) => {
          message.success("Transaction successful");
        });
    }
  };
  const claimToken = async (address) => {
    let web3 = await getWeb3();
    console.log(address);
    let eqxContract = new web3.eth.Contract(equinoxIcoAbi.abi, address);
    console.log(eqxContract);
    let accounts = await web3.eth.getAccounts();
    if (eqxContract) {
      await eqxContract.methods
        .claim()
        .send({ from: accounts[0] })
        .on("error", (error) => console.log(error))
        .then((result) => {
          message.success("Transaction successful");
        });
    }
  };
  const endSale = async (address) => {
    let web3 = await getWeb3();
    console.log(address);
    let eqxContract = new web3.eth.Contract(equinoxIcoAbi.abi, address);
    console.log(eqxContract);
    let accounts = await web3.eth.getAccounts();
    if (eqxContract) {
      await eqxContract.methods
        .end()
        .send({ from: accounts[0] })
        .on("error", (error) => console.log(error))
        .then((result) => {
          message.success("Transaction successful");
        });
    }
  };

  // console.log(orgDatas);

  const text1class = "font-bold text-sm mb-0.5";
  // const text2class = "";
  const link = "inline-block text-black text-base";
  console.log(selected);
  return (
    <div className="min-h-screen bg-gray-300 py-10 " data-testid="BuyICOs">
      <div className="container-fluid">
        <div className="mx-auto mb-10 flex justify-center">
          <div className="flex items-center mr-4">
            <p className="mr-1 font-bold mb-0">
              ACTIVE PROJECT SUBSCRIPTION OFFERS
            </p>
            <Switch checked={selected} onChange={() => {
              setSelected((prev) => !prev);
            }} />
          </div>
          <div className="flex items-center">
            <p className="mr-1 font-bold mb-0">LISTED</p>
            <Switch checked={selected2} onChange={() => {
              setSelected2((prev) => !prev);
            }} />
          </div>
        </div>
        <div className="">
          <div
            className="tab-pane fade show active"
            id="all"
            role="tabpanel"
            aria-labelledby="all-tab"
          >
            <div className="px-6">
              <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-6">

                {ico &&
                  ico.length &&
                  ico
                    .filter((i) =>
                      selected
                        ? Number(i.finalized) === 1 &&
                        i.reached !== 2 &&
                        i.reached !== 1
                        : i
                    )
                    .map((i) => {
                      const multiSigData = orgDatas?.filter(
                        (val) => val?.project[0]?.token_name === i.token_name
                      );
                      console.log("MULTISIG", multiSigData);
                      return (
                        <div className="welcome-card rounded-lg p-6 mb-6 p-8 rounded-lg text-sm w-full overflow-auto" key={i.id}>
                          <div className="min-w-[450px]">
                            <div className=" flex justify-between items-center ">
                              <div className="grid grid-flow-col gap-x-2 justify-start items-center ">
                                <img src={i.token_logo} alt="" className="w-8" />
                                <p className="font-bold text-2xl mb-0">
                                  {i.project_name}
                                </p>
                              </div>
                              <div className="flex-1 flex-wrap flex justify-between items-center ml-6">
                                <div className="flex flex-wrap items-center">
                                  <a
                                    href={`https://bscscan.com/address/${multiSigData[0]?.org?.multisig_address}`}
                                    className="uppercase border-2 border-white flex items-center max-w-max "
                                  >
                                    <span className="inline-block p-1.5 border-r text-xs grad-btn ">
                                      Multisig
                                    </span>
                                    <span className="inline-block p-1">
                                      {" "}
                                      {shortAddress(
                                        multiSigData[0]?.org?.multisig_address
                                          ? multiSigData[0]?.org?.multisig_address
                                          : ""
                                      )}
                                    </span>
                                  </a>
                                  <a
                                    href={`https://bscscan.com/address/${multiSigData[0]?.project[0]?.gtoken_address}`}
                                    className="ml-4 uppercase border-2 border-white flex items-center max-w-max "
                                  >
                                    <span className="inline-block p-1.5 border-r text-xs grad-btn">
                                      GTOKEN
                                    </span>
                                    <span className="inline-block p-1">
                                      {" "}
                                      {shortAddress(
                                        multiSigData[0]?.project[0]
                                          ?.gtoken_address
                                          ? multiSigData[0]?.project[0]
                                            ?.gtoken_address
                                          : ""
                                      )}
                                    </span>
                                  </a>
                                  {/* <div className="ml-2">
                                  <p className={`${text1class}`}>
                                    {dayjs(i.start_date).format(
                                      "MMM D, YYYY h:mm A"
                                    )}
                                  </p>
                                  <p className={`${text1class}`}>
                                    {dayjs(i.end_date).format(
                                      "MMM D, YYYY h:mm A"
                                    )}
                                  </p>
                                </div> */}
                                </div>
                                <a href="/play-subscription" className={`${link}`}>
                                  <ShareAltOutlined style={{ color: 'black' }} />
                                </a>
                              </div>
                            </div>
                            <div className="mt-4  grid grid-cols-6 max-lg:grid-cols-3  gap-x-2 justify-start items-center">
                              <div>
                                <p className={`${text1class}`}>
                                  {convertPrice(i.fixed_supply)}
                                </p>
                                <p>Supply</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>
                                  {dayjs(i.start_date)
                                    .utc()
                                    .format("MMM D, YYYY h:mm A")}
                                </p>
                                <p>Start Date</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>
                                  {dayjs(i.end_date)
                                    .utc()
                                    .format("MMM D, YYYY h:mm A")}
                                </p>
                                <p>End Date</p>
                              </div>
                            </div>

                            <div className="mt-4  grid grid-cols-6  gap-x-2 justify-start items-center">
                              <div>
                                <p className={`${text1class}`}>
                                  {i.project_name}
                                </p>
                                <p>Project token</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>
                                  {multiSigData[0]?.project[0]?.token_ticker}
                                </p>
                                <p>Symbol</p>
                              </div>
                              {/* <div>
                              <p className={`${text1class}`}>
                                {convertPrice(i.fixed_supply)}
                              </p>
                              <p>Supply</p>
                            </div> */}
                              <div>
                                <p className={`${text1class}`}>BEP20</p>
                                <p>Standard</p>
                              </div>
                              {/* <a
                              href={`https://testnet.bscscan.com/address/${i.ico_address}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <p className={`${text1class}`}>
                                <RiShareBoxFill />
                              </p>
                              <p>Contract</p>
                            </a> */}
                            </div>
                            <div className="mt-2 grid grid-cols-6  gap-x-2 justify-start items-center">
                              <div>
                                <p className={`${text1class} text-green-500`}>
                                  {i.reached === 1 ? (
                                    <span className="text-red-400">Failed</span>
                                  ) : Number(i.finalized) === 1 &&
                                    i.reached === 2 ? (
                                    "Completed"
                                  ) : Number(i.finalized) === 1 ? (
                                    "In Progress"
                                  ) : (
                                    "Pending"
                                  )}
                                </p>
                                <p>Subscription status</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>
                                  {convertPrice(i.supply)}
                                </p>
                                <p>Subscription Supply </p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>
                                  {i.soft_cap} BNB
                                </p>
                                <p>Soft cap </p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>
                                  {i.offer_price}/BNB
                                </p>
                                <p>Offer price </p>
                              </div>
                              {/* <div>
                          <p className={`${text1class}`}>33%</p>
                          <p>Progress </p>
                        </div> */}
                              <a
                                href={`https://bscscan.com/address/${i.ico_address}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <p className={`${text1class}`}>
                                  <ExportOutlined />
                                </p>
                                <p>Contract</p>
                              </a>
                              <Link
                                to="/play-subscription"
                                className={`${Number(i.finalized) === 1 &&
                                    Number(i.reached) === 0
                                    ? "text-blue-500 pointer-events-auto"
                                    : "text-gray-500 "
                                  } `}
                              >
                                <p className={`${text1class}`}>
                                  <ExportOutlined />
                                </p>
                                <p>Participate</p>
                              </Link>
                            </div>
                            <div className="mt-2 grid grid-cols-6 gap-x-2 justify-start items-center">
                              <div>
                                <p className={`${text1class}`}>--</p>
                                <p>Trade</p>
                              </div>
                              <div>
                                <p className={`${text1class} text-yellow-500`}>
                                  --
                                </p>
                                <p>Current price</p>
                              </div>
                              <div>
                                <p className={`${text1class} text-green-500`}>
                                  --
                                </p>
                                <p>24 Hrs return </p>
                              </div>
                              <div>
                                <p className={`${text1class} text-green-500`}>
                                  --
                                </p>
                                <p>7 Days return </p>
                              </div>
                              <div>
                                <p className={`${text1class} text-green-500`}>
                                  --
                                </p>
                                <p>365 Days return</p>
                              </div>
                              <div>
                                {/* <Link
                                  to="/enterprice-dex"
                                // className={`${
                                //   Number(i.finalized) === 1
                                //     ? "text-white"
                                //     : "text-gray-500 pointer-events-none"
                                // } `}
                                > */}
                                  <p className={`${text1class}`}>
                                    <ExportOutlined />
                                  </p>
                                  <p>Participate</p>
                                {/* </Link> */}
                              </div>
                              {/* <div>
                          <p className={`${text1class} text-green-500`}>
                            <RiShareBoxFill />
                          </p>
                          <p>Participate</p>
                        </div> */}
                            </div>
                            <div className="mt-2 grid grid-cols-6 gap-x-2 justify-start items-center">
                              <div>
                                <p className={`${text1class}`}>--</p>
                                <p>Dividends</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>--</p>
                                <p>1 Month</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>--</p>
                                <p>3 Month</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>--</p>
                                <p>6 Month</p>
                              </div>
                              <div>
                                <p className={`${text1class}`}>--</p>
                                <p>12 Month</p>
                              </div>
                              <div>
                                <Link
                                  to="/dashboard/project"
                                  target="_blank"
                                // className={`${
                                //   Number(i.finalized) === 1
                                //     ? "text-white"
                                //     : "text-gray-500 pointer-events-none"
                                // } `}
                                >
                                  <p className={`${text1class}`}>
                                    <ExportOutlined />
                                  </p>
                                  <p>Stake</p>
                                </Link>
                              </div>
                              {/* <div>
                          <p className={`${text1class} text-green-500`}>
                            <RiShareBoxFill />
                          </p>
                          <p>Participate</p>
                        </div> */}
                            </div>

                            <div className="grid grid-flow-col justify-start  gap-x-6 items-center">
                              <a
                                href={multiSigData[0]?.project[0]?.whitepaper}
                                target="_blank"
                                className="uppercase border-2 border-white flex items-center max-w-max "
                              >
                                <span className="inline-block p-1.5 border-r text-xs grad-btn border-0 mt-3">
                                  WhitePaper
                                </span>
                                <span className="inline-block p-1 mt-3">
                                  {" "}
                                  <img src={pdfImage} alt="" />{" "}
                                </span>
                              </a>
                              {multiSigData[0]?.project[0]?.project_site && (
                                <a
                                  href={multiSigData[0]?.project[0]?.project_site}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`${link} text-black` }
                                >
                                  <GlobalOutlined />
                                </a>
                              )}
                              {/* {multiSigData[0]?.project[0]?.github && (
                          <a
                            href={multiSigData[0]?.project[0]?.github}
                            className={`${link}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FaGithub />
                          </a>
                        )} */}
                              {multiSigData[0]?.project[0]?.facebook && (
                                <a
                                  href={multiSigData[0]?.project[0]?.facebook}
                                  className={`${link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <FacebookOutlined />
                                </a>
                              )}
                              {multiSigData[0]?.project[0]?.project_email && (
                                <a
                                  href={`mailto:${multiSigData[0]?.project[0]?.project_email}`}
                                  className={`${link}`}
                                >
                                  <MailOutlined />
                                </a>
                              )}
                              {multiSigData[0]?.project[0]?.twitter && (
                                <a
                                  href={multiSigData[0]?.project[0]?.twitter}
                                  className={`${link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <TwitterOutlined />
                                </a>
                              )}
                              {i.ico_address && (
                                <>
                                  <Tooltip
                                    title=" Sign this transaction only if this ICO is failed "
                                    placement="top"
                                  >
                                    <button
                                      className={` ${i.reached === 2
                                          ? " pointer-events-none bg-gray-600 "
                                          : " bg-blue-500 "
                                        }  p-2 rounded-md px-4 grad-btn border-0  mt-3 twhite"`}
                                      onClick={() => claimBNB(i.ico_address)}
                                    >
                                      Claim BNB
                                    </button>
                                  </Tooltip>
                                  <Tooltip
                                    title=" Claim your tokens if the ICO is successfully completed "
                                    placement="top"
                                  >
                                    <button
                                      className={` ${i.reached === 1
                                          ? " pointer-events-none bg-gray-600 "
                                          : " bg-blue-500 "
                                        }  p-2 rounded-md px-4 grad-btn border-0  mt-3 twhite"`}
                                      onClick={() => claimToken(i.ico_address)}
                                    >
                                      Claim Token
                                    </button>
                                  </Tooltip>
                                  {/* <Tooltip
                                  title=" End sale once subscription is successfully completed. 50% of collected funds will be locked for 3 months."
                                  placement="top"
                                >
                                  <button
                                    className={` ${
                                      i.reached === 1
                                        ? " pointer-events-none bg-gray-600 "
                                        : " bg-blue-500 "
                                    }  p-2 rounded-md px-4"`}
                                    onClick={() => endSale(i.ico_address)}
                                  >
                                    End Sale
                                  </button>
                                </Tooltip> */}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    org: state.org,
    ico: state.ico,
    auth: state.auth,
    account: state.account,
  };
};

export default connect(mapStateToProps)(Icos);
