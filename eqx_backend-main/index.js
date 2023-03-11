const mysql = require('mysql');
var fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
var crc32 = require("js-crc").crc32;
var nodemailer = require('nodemailer');
const gc = require('./config/')
const bucket = gc.bucket('eqxdata');
var request = require('request');
const puppeteer = require('puppeteer');
var scraper = require('facebook-nologin-scraper');
const rp = require('request-promise');
const cheerio = require("cheerio");
const axios = require('axios');
const { response } = require('express');


const con = mysql.createConnection({
    host: "db-mysql-blr1-00233-do-user-11796634-0.b.db.ondigitalocean.com",
    port: 25060,
    user: "doadmin",
    password: "AVNS_KmfzSADJdXAUrd714bV",
    database: "eqx_app"
});
con.connect((err) => {
    console.log(err);
    if (!err) console.log('DB is running');
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: false
    })
);

const multerMid = multer({
    storage: multer.memoryStorage()
});

app.disable('x-powered-by'); 0
// app.use(multerMid.array('files'));
app.use(multerMid.fields([
    { name: 'token_logo', maxCount: 1 },
    { name: 'whitepaper', maxCount: 1 },
    { name: 'incorporation', maxCount: 1 },
    { name: 'other_doc', maxCount: 1 },
    { name: 'selfy', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'doc', maxCount: 1 }
]));

setInterval(() => {
    // updateProposal();
}, 1000 * 60 * 60);

// ignore above
app.get('/', (req, res) => {
    // res.send(`Hello There`);
    res.status(404).send();
});

app.post('/upload', async (req, res, next) => {
    try {
        const myFile = req.file
        const imageUrl = await uploadimage(myFile)
        res
            .status(200)
            .json({
                message: "Upload was successful",
                data: imageUrl
            })
    } catch (error) {
        next(error)
    }
})

app.post('/uploads', async (req, res, next) => {
    try {
        const myFile = req.files
        const imageUrl = await uploadMultipleFiles(myFile);
        res
            .status(200)
            .json({
                message: "Upload was successful",
                data: imageUrl
            })
    } catch (error) {
        next(error)
    }
})

app.get('/get_details/:id', (req, res) => {
    const wallet_address = req.params.id;
    const query = `SELECT * FROM members WHERE wallet_address LIKE ? AND is_active = 1`;
    // let response = {};
    let response = {
        org: {},
        project: [],
        ico: [],
        fund_transfer: [],
        proposal: [],
        // proposal: {
        //     Initialized: [],
        //     Approved: [],
        //     Rejected: [],
        //     Expired: [],
        //     Failed: []
        // },
        members: []
    };
    con.query(query, [wallet_address], (err, result) => {
        if (err || result.length === 0) {
            res.status(404).send({
                status: 'error',
                message: 'not found'
            });
        } else {
            response.member = result[0];
            const org_id = result[0].org_id;
            const query = `SELECT * FROM org WHERE id = '${org_id}'`;

            con.query(query, (err, result) => {
                if (err || result.length === 0) {
                    res.send({
                        status: 'error',
                        message: 'Org not found'
                    });
                } else {
                    response.org = result[0];
                    const org_id = result[0].id;
                    const project_query = `SELECT * FROM project WHERE org_id = '${org_id}' LIMIT 1`;
                    let project_id = undefined;
                    con.query(project_query, (err, project_result) => {
                        console.log(err, project_result)
                        if (!err && project_result.length > 0) {
                            response['project'] = project_result;
                            project_id = project_result[0].id;
                            const ico_query = `SELECT * FROM ico WHERE project_id = '${project_id}'`;
                            con.query(ico_query, (err, ico_result) => {
                                if (!err && ico_result.length) {
                                    response['ico'] = ico_result;
                                }
                            });
                            const proposal_query = `SELECT proposal.*, category.name as category_name FROM proposal, category WHERE proposal.category_id = category.id AND proposal.project_id = '${project_id}'`;
                            con.query(proposal_query, (err, proposal_result) => {
                                if (!err && proposal_result.length) {
                                    // response['proposal'] = proposal_result;
                                    proposal_result.forEach(proposal => {
                                        response.proposal.push(proposal);
                                        // if (response['proposal'][proposal.status]) {
                                        //     response['proposal'][proposal.status].push(proposal);
                                        // } else {
                                        //     response['proposal'][proposal.status] = [];
                                        //     response['proposal'][proposal.status].push(proposal);
                                        // }
                                    });
                                }
                            });
                            const fund_transfer_query = `SELECT * from fund_transfer WHERE org_id = '${org_id}'`;
                            con.query(fund_transfer_query, (err, fund_transfer_result) => {
                                if (!err && fund_transfer_result.length) {
                                    response['fund_transfer'] = fund_transfer_result;
                                }
                            });
                        }

                        // const member_query = `SELECT member_name, wallet_address, email, is_deployer FROM members WHERE org_id = '${org_id}' AND is_active = 1`;
                        const member_query = `SELECT id, member_name, member_index, wallet_address, email, is_deployer, is_active FROM members WHERE org_id = '${org_id}'`;
                        con.query(member_query, (err, result) => {
                            if (err) {
                                res.send({
                                    status: 'error',
                                    message: 'Error fetching members'
                                });
                            } else {
                                response.members = result;
                                res.send({
                                    status: 'success',
                                    response: response
                                });
                            }
                        });
                    });
                }
            });
        }
    });
});

app.get('/send_activation_code/:email', async (req, res) => {
    const email = validateEmail(req.params.email);
    if (email) {
        var is_sent = await sendactivationCodeViaEmail(email);
        if (is_sent) {
            res.send({
                status: 'success',
                message: 'Activation code sent'
            });
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Error sending activation code!'
            });
        }
    } else {
        res.status(400).send({
            status: 'error',
            message: 'Error sending activation code.'
        });
    }
});

app.get('/check_email/:email', (req, res) => {
    var email = req.params.email;
    const query = `SELECT id from members WHERE email = ?`;
    con.query(query, [email], (err, result) => {
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                data: result
            });
        }
    });
});

app.post('/verify_otp', (req, res) => {
    var email = req.body.email;
    var otp = req.body.otp;
    if ((otp).toLowerCase() != crc32(email + 'eqx')) {
        res.status(400).send({
            success: false,
            status: 'Invalid Activation code for ' + email,
        });
    } else {
        res.send({
            success: true,
            status: 'success'
        });
    }
});

app.post('/check_org', (req, res) => {
    var multisig_address = req.body.multisig_address;
    var email = req.body.email;
    var wallet_address = req.body.wallet_address;
    var linkedin_link = req.body.linkedin_link;
    const query = `SELECT multisig_address, email, wallet_address, linkedin_link from org WHERE multisig_address = ? OR email = ? OR wallet_address = ? OR linkedin_link = ?`;
    con.query(query, [multisig_address, email, wallet_address, linkedin_link], (err, result) => {
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                data: result
            });
        }
    });
});

app.post('/check_member', (req, res) => {
    var email = req.body.email;
    var wallet_address = req.body.wallet_address;
    const query = `SELECT email, wallet_address from members WHERE email = ? OR wallet_address = ?`;
    con.query(query, [email, wallet_address], (err, result) => {
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                data: result
            });
        }
    });
});

app.post('/add_org', async (req, res) => {
    // console.log(req.body);
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var deployer_name = req.body.deployer_name;
    var wallet_address = req.body.wallet_address;
    var multisig_address = req.body.multisig_address;
    var phone = req.body.phone ? req.body.phone : 0;
    var email = req.body.email;
    // var otp = req.body.otp;
    var passport_no = req.body.passport_no;
    var pan = req.body.pan;
    var linkedin_link = req.body.linkedin_link;
    var selfy = await uploadimage(req.files.selfy, deployer_name);

    var member_name = req.body['member_name'];
    var member_wallet_address = req.body['member_wallet_address'];
    var member_email = req.body['member_email'];
    // var member_otp = req.body['member_otp'];
    var members = [];
    members.push({
        name: deployer_name,
        wallet_address: wallet_address,
        email: validateEmail(email),
        // otp: otp,
        is_deployer: 1,
        is_active: 1
    });
    console.log(req.body);
    if (member_name && member_wallet_address && member_email) {
        for (let i = 0; i < member_wallet_address.length; i++) {
            if (member_name[i] && member_wallet_address[i] && member_email[i]) {
                const member = {
                    name: member_name[i],
                    wallet_address: member_wallet_address[i],
                    email: validateEmail(member_email[i]),
                    // otp: member_otp[i],s
                    is_deployer: 0,
                    is_active: 1
                };
                members.push(member);
            };
        }
    }
    console.log(members);
    error_count = 0;
    members.map(member => {
        if (!member.email) {
            error_count++;
            res.send({
                status: 'error',
                message: 'Invalid Activation code for ' + member.name
            });
        }
    });

    if (error_count < 1) {
        // const query = `INSERT INTO org (multisig_address, deployer_name, wallet_address, phone, email, passport_no, linkedin_link, selfy) VALUES ('${multisig_address}', '${deployer_name}', '${wallet_address}', '${phone}', '${email}', '${passport_no}', '${linkedin_link}', '${selfy}')`;
        const query = `INSERT INTO org (multisig_address, deployer_name, wallet_address, phone, email, passport_no, pan, linkedin_link, selfy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        con.query(query, [multisig_address, deployer_name, wallet_address, phone, email, passport_no, pan, linkedin_link, selfy], (err, result) => {
            if (err) {
                console.log(query, err.sqlMessage);
                res.status(400).send({
                    status: 'failed',
                    members_count: 0,
                    error: err.sqlMessage
                });
            } else {
                const org_id = result.insertId;
                const member_query = members.map(member => {
                    // return `INSERT INTO members (id, org_id, member_name, wallet_address, email, password, is_active, join_date, join_ip, is_deployer) VALUES (NULL, '${org_id}', '${member.name}', '${member.wallet_address}', '${member.email}', '', '0', CURRENT_TIMESTAMP, '${ip}', '${member.is_deployer}')`;
                    return {
                        query: `INSERT INTO members (id, org_id, member_name, wallet_address, email, password, is_active, join_date, join_ip, is_deployer, otp) VALUES (NULL,  ${con.escape(org_id)}, ${con.escape(member.name)}, ${con.escape(member.wallet_address)}, ${con.escape(member.email)}, '', ${con.escape(member.is_active)}, CURRENT_TIMESTAMP, '${ip}', ${con.escape(member.is_deployer)}, null)`,
                        member: member
                    };
                });
                Promise.all(member_query.map(query => {
                    console.log(query);
                    return new Promise((resolve, reject) => {
                        con.query(query.query, (err, result) => {
                            if (err) reject(err);
                            else {
                                sendWelcomeEmail(query.member.email, query.member.name);
                                resolve(result);
                            }
                        });
                    });
                })).then(result => {
                    res.send({
                        status: 'success',
                        org_id: org_id,
                        members_count: members.length
                    });
                }).catch(err => {
                    res.send({
                        status: 'error',
                        error: err
                    });
                });
            }
        });
    }
});

app.get('/new_add_member_index/:org_id', (req, res) => {
    const org_id = req.params.org_id;
    const query = `UPDATE org SET add_member_index = add_member_index + 1 WHERE id = ?`;
    con.query(query, [org_id], (err, result) => {
        console.log(err, result);
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Org not found'
            });
        } else {
            const query = `SELECT add_member_index FROM org WHERE id = ?`;
            con.query(query, [org_id], (err, result) => {
                console.log(err, result);
                if (err || result.length === 0) {
                    res.send({
                        status: 'error',
                        message: 'Org not found'
                    });
                } else {
                    res.send({
                        status: 'Success',
                        message: result[0]
                    });
                }
            });
        }
    })
});
app.get('/new_remove_member_index/:org_id', (req, res) => {
    const org_id = req.params.org_id;
    const query = `UPDATE org SET remove_member_index = remove_member_index + 1 WHERE id = ?`;
    con.query(query, [org_id], (err, result) => {
        console.log(err, result);
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Org not found'
            });
        } else {
            const query = `SELECT remove_member_index FROM org WHERE id = ?`;
            con.query(query, [org_id], (err, result) => {
                console.log(err, result);
                if (err || result.length === 0) {
                    res.send({
                        status: 'error',
                        message: 'Org not found'
                    });
                } else {
                    res.send({
                        status: 'Success',
                        message: result[0]
                    });
                }
            });
        }
    })
});
app.get('/new_transfer_index/:org_id', (req, res) => {
    const org_id = req.params.org_id;
    const query = `UPDATE org SET transfer_index = transfer_index + 1 WHERE id = ?`;
    con.query(query, [org_id], (err, result) => {
        console.log(err, result);
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Org not found'
            });
        } else {
            const query = `SELECT transfer_index FROM org WHERE id = ?`;
            con.query(query, [org_id], (err, result) => {
                console.log(err, result);
                if (err || result.length === 0) {
                    res.send({
                        status: 'error',
                        message: 'Org not found'
                    });
                } else {
                    res.send({
                        status: 'Success',
                        message: result[0]
                    });
                }
            });
        }
    })
});
app.get('/new_proposal_index/:org_id', (req, res) => {
    const org_id = req.params.org_id;
    const query = `UPDATE org SET proposal_index = proposal_index + 1 WHERE id = ?`;
    con.query(query, [org_id], (err, result) => {
        console.log(err, result);
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Org not found'
            });
        } else {
            const query = `SELECT proposal_index FROM org WHERE id = ?`;
            con.query(query, [org_id], (err, result) => {
                console.log(err, result);
                if (err || result.length === 0) {
                    res.send({
                        status: 'error',
                        message: 'Org not found'
                    });
                } else {
                    res.send({
                        status: 'Success',
                        message: result[0]
                    });
                }
            });
        }
    })
});

app.get('/get_org/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM org WHERE id = '${id}'`;
    let response = {
        org: {},
        project: [],
        ico: [],
        fund_transfer: [],
        proposal: [],
        // proposal: {
        //     Initialized: [],
        //     Approved: [],
        //     Rejected: [],
        //     Expired: [],
        //     Failed: []
        // },
        members: []
    };
    con.query(query, (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Org not found'
            });
        } else {
            response.org = result[0];
            const org_id = result[0].id;
            const project_query = `SELECT * FROM project WHERE org_id = '${org_id}' LIMIT 1`;
            let project_id = undefined;
            con.query(project_query, (err, project_result) => {
                console.log(err, project_result)
                if (!err && project_result.length > 0) {
                    response['project'] = project_result;
                    project_id = project_result[0].id;
                    const ico_query = `SELECT * FROM ico WHERE project_id = '${project_id}'`;
                    con.query(ico_query, (err, ico_result) => {
                        if (!err && ico_result.length) {
                            response['ico'] = ico_result;
                        }
                    });

                    const fund_transfer_query = `SELECT * from fund_transfer WHERE org_id = '${org_id}'`;
                    con.query(fund_transfer_query, (err, fund_transfer_result) => {
                        if (!err && fund_transfer_result.length) {
                            response['fund_transfer'] = fund_transfer_result;
                        }
                    });
                }
                const proposal_query = `SELECT proposal.*, category.name as category_name FROM proposal, category WHERE proposal.category_id = category.id AND proposal.org_id = '${org_id}'`;
                con.query(proposal_query, (err, proposal_result) => {
                    console.log(proposal_result);
                    if (!err && proposal_result.length) {
                        // response['proposal'] = proposal_result;
                        proposal_result.forEach(proposal => {
                            response.proposal.push(proposal);
                            // if (response['proposal'][proposal.status]) {
                            //     response['proposal'][proposal.status].push(proposal);
                            // } else {
                            //     response['proposal'][proposal.status] = [];
                            //     response['proposal'][proposal.status].push(proposal);
                            // }
                        });
                    }
                });

                // const member_query = `SELECT member_name, wallet_address, email, is_deployer FROM members WHERE org_id = '${org_id}' AND is_active = 1`;
                const member_query = `SELECT id, member_name, wallet_address, email, is_deployer, is_active FROM members WHERE org_id = '${org_id}'`;
                con.query(member_query, (err, result) => {
                    if (err) {
                        res.send({
                            status: 'error',
                            message: 'Error fetching members'
                        });
                    } else {
                        response.members = result;
                        res.send({
                            status: 'success',
                            response: response
                        });
                    }
                });
            });
        }
    });
});

app.post('/add_index', (req, res) => {
    const org_id = req.body.org_id;
    const type = req.body.type;
    const data = req.body.data;
    const status = req.body.status;
    let index_number = 0;
    const query = `SELECT MAX(index_number) FROM indexes WHERE org_id = ? AND type = ?`;
    con.query(query, [org_id, type], (err, result) => {
        if (err || result.length === 0) {
            index_number = 0;
        } else {
            console.log(result);
            index_number = result[0]['MAX(index_number)'] + 1;
        }
        const query = `INSERT INTO indexes (index_number, org_id, type, data, status) VALUES (?, ?, ?, ?, ?)`;
        con.query(query, [index_number, org_id, type, data, status], (err, result) => {
            if (err) {
                res.status(400).send({
                    status: 'error',
                    error: err.sqlMessage
                });
            } else {
                res.send({
                    status: 'success',
                    index_number: index_number
                });
            }
        });
    });
})

app.post('/get_index', (req, res) => {
    const org_id = req.body.org_id;
    const type = req.body.type;
    const index_number = req.body.index_number;
    const query = `SELECT * FROM indexes WHERE org_id = ? AND type = ? AND index_number = ?`;
    con.query(query, [org_id, type, index_number], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Index not found'
            });
        } else {
            res.send({
                status: 'success',
                message: result
            });
        }
    });
});

app.post('/update_index_status', () => {
    const org_id = req.body.org_id;
    const type = req.body.type;
    const index_number = req.body.index_number;
    const status = req.body.status;
    const query = `UPDATE indexes SET status = ? WHERE org_id = ? AND type = ? AND index_number = ?`;
    con.query(query, [status, org_id, type, index_number], (err, result) => {
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            res.send({
                status: 'success',
                index_number: index_number
            });
        }
    });

})

app.post('/get_index_list', (req, res) => {
    const org_id = req.body.org_id;
    const type = req.body.type;
    const query = `SELECT * FROM indexes WHERE org_id = ? AND type = ?`;
    con.query(query, [org_id, type], (err, result) => {
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
})

app.post('/add_member', async (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var org_id = req.body.org_id;
    var member_name = req.body.member_name;
    var member_wallet_address = req.body.member_wallet_address;
    var member_email = validateEmail(req.body.member_email);
    var index = await getLastIndex('members', 'member_index')
    // var otp = req.body.otp;
    if (member_email) {
        const query = `INSERT INTO members (id, org_id, member_name, wallet_address, email, password, is_active, join_date, join_ip, is_deployer, otp) VALUES (NULL, ?, ?, ?, ?, '', '0', CURRENT_TIMESTAMP, ?, '0',?)`;
        con.query(query, [org_id, member_name, member_wallet_address, member_email, ip, null], (err, result) => {
            if (err) {
                res.status(400).send({
                    status: 'error',
                    error: err.sqlMessage
                });
            } else {
                const member_id = result.insertId;
                sendWelcomeEmail(member_email, member_name);
                res.send({
                    status: 'success',
                    member_id: member_id
                });
            }
        });
    } else {
        res.send({
            status: 'error',
            error: 'Activation code is not valid'
        });
    }
});

app.post('/add_remove_member', async (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var org_id = req.body.org_id;
    var member_name = req.body.member_name;
    var member_wallet_address = req.body.member_wallet_address;
    var member_email = validateEmail(req.body.member_email);
    // var index = await getLastIndex('remove_members', 'member_index')
    var otp = 0;
    const query = `INSERT INTO remove_members (id, org_id, member_name, wallet_address, email, password, is_active, join_date, join_ip, is_deployer, otp) VALUES (NULL, ?, ?, ?, ?, '', '0', CURRENT_TIMESTAMP, ?, '0',?)`;
    con.query(query, [org_id, member_name, member_wallet_address, member_email, ip, otp], (err, result) => {
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            const member_id = result.insertId;
            sendWelcomeEmail(member_email, member_name);
            res.send({
                status: 'success',
                member_id: member_id
            });
        }
    });
});

app.get('/approve_remove_member/:wallet_address/:status', (req, res) => {
    const wallet_address = req.params.wallet_address;
    const status = req.params.status;
    const query = `UPDATE remove_members SET is_active = ? WHERE wallet_address = ?`;
    con.query(query, [status, wallet_address], (err, result) => {
        console.log(query, err, result)
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                data: result
            });
        }
    });
});

app.get('/approve_member/:wallet_address/:status', (req, res) => {
    const wallet_address = req.params.wallet_address;
    const status = req.params.status;
    const query = `UPDATE members SET is_active = ? WHERE wallet_address = ?`;
    con.query(query, [status, wallet_address], (err, result) => {
        console.log(query, err, result)
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                data: result
            });
        }
    });
});

app.get('/get_remove_member_list/:org_id/:status', (req, res) => {
    const org_id = req.params.org_id;
    const status = req.params.status;
    const query = `SELECT * FROM remove_members WHERE org_id = ? AND is_active = ?`;
    con.query(query, [org_id, status], (err, result) => {
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
})

app.post('/remove_member', (req, res) => {
    var wallet_address = req.body.wallet_address;
    const query1 = `SELECT * members WHERE wallet_address = ?`;
    con.query(query1, [wallet_address], (err, result) => {
        if (!err && result) {
            const org_id = result[0].org_id;
            const query = `DELETE from members WHERE wallet_address = ?`;
            con.query(query, [wallet_address], (err, result) => {
                if (err) {
                    res.send({
                        status: 'error',
                        error: err
                    });
                } else {
                    const query = `UPDATE org SET remove_member_index = remove_member_index + 1 WHERE id = ?`;
                    con.query(query, [org_id], (err, result) => { });
                    res.send({
                        status: 'success'
                    });
                }
            });
        }
    });
});

app.post('/add_project', async (req, res) => {
    console.log(req.files);
    var org_id = req.body.org_id;
    var project_name = req.body.project_name;
    var cat_id = req.body.cat_id;
    var project_site = req.body.project_site;
    var project_email = req.body.project_email;
    var project_description = req.body.project_description;
    var gtoken_address = req.body.gtoken_address;
    var telegram = req.body.telegram;
    var twitter = req.body.twitter;
    var facebook = req.body.facebook;
    var github = req.body.github;
    // var deployer_wallet_address_id = req.body.deployer_wallet_address_id;
    var token_name = req.body.token_name;
    var token_ticker = req.body.token_ticker;
    var fixed_supply = req.body.fixed_supply;
    try {
        var token_logo = req.files.token_logo ? await uploadimage(req.files.token_logo, project_name) : null;
        var whitepaper = req.files.whitepaper ? await uploadimage(req.files.whitepaper, project_name) : null;
        var incorporation = req.files.incorporation ? await uploadimage(req.files.incorporation, project_name) : null;
        var other_doc = req.files.other_doc ? await uploadimage(req.files.other_doc, project_name) : null;
    } catch (err) {
        console.log(err);
    }
    // if (token_logo === null || whitepaper === null) {
    if (false) {
        res.status(400).send({
            status: 'error',
            error: 'Please upload all required files'
        });
    } else {
        // const query = `INSERT INTO project (org_id, project_name, cat_id, project_site, project_email, project_description, gtoken_address, telegram, twitter, facebook, github, deployer_wallet_address_id, token_name, token_ticker, fixed_supply, token_logo, whitepaper, incorporation, other_doc) VALUES ('${org_id}', '${project_name}', '${cat_id}', '${project_site}', '${project_email}', '${project_description}', '${gtoken_address}', '${telegram}', '${twitter}', '${facebook}', '${github}', '${deployer_wallet_address_id}', '${token_name}', '${token_ticker}', '${fixed_supply}', '${token_logo}', '${whitepaper}', '${incorporation}', '${other_doc}')`;
        const query = `INSERT INTO project (org_id, project_name, cat_id, project_site, project_email, project_description, gtoken_address, telegram, twitter, facebook, github, token_name, token_ticker, fixed_supply, token_logo, whitepaper, incorporation, other_doc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        con.query(query, [org_id, project_name, cat_id, project_site, project_email, project_description, gtoken_address, telegram, twitter, facebook, github, token_name, token_ticker, fixed_supply, token_logo, whitepaper, incorporation, other_doc], (err, result) => {
            if (err) {
                res.status(400).send({
                    status: 'error',
                    error: err.sqlMessage
                });
            } else {
                const project_id = result.insertId;
                res.send({
                    status: 'success',
                    project_id: project_id
                });
            }
        });
    }
});

app.get('/get_project/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM project WHERE id = ?`;
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Project not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result[0]
            });
        }
    });
});

app.get('/get_projects_by_org/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM project WHERE org_id = ?`;
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.post('/add_category', (req, res) => {
    var name = req.body.name;
    var query = `INSERT INTO category (id, name) VALUES (NULL, ?)`;
    con.query(query, [name], (err, result) => {
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                category_id: result.insertId
            });
        }
    });
});

app.get('/get_category', (req, res) => {
    const query = `SELECT * FROM category`;
    con.query(query, (err, result) => {
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.get('/get_project_category', (req, res) => {
    const query = `SELECT * FROM project_category`;
    con.query(query, (err, result) => {
        if (err) {
            res.send({
                status: 'error',
                error: err
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.post('/add_ico', (req, res) => {
    var project_id = req.body.project_id;
    var supply = req.body.supply;
    var assets = req.body.assets;
    var ico_address = req.body.ico_address;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var offer_price = req.body.offer_price;
    var soft_cap = req.body.soft_cap;
    var hard_cap = req.body.hard_cap;
    const query = `INSERT INTO ico ( project_id, assets, ico_address, supply, start_date, end_date, offer_price, soft_cap, hard_cap) VALUES ( ?,?,?,?, ${con.escape(start_date)}, ${con.escape(end_date)},?,?,?)`;
    con.query(query, [project_id, assets, ico_address, supply, offer_price, soft_cap, hard_cap], (err, result) => {
        console.log(query, err);
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            const id = result.insertId;
            res.send({
                status: 'success',
                ico_id: id
            });
        }
    });
});

app.get('/get_ico/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM ico WHERE id = ?`;
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'ico not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.get('/finalize_ico/:ico_address/:status', (req, res) => {
    const ico_address = req.params.ico_address;
    const status = req.params.status;
    const update_query = `UPDATE ico SET finalized = ? WHERE ico_address = ?`;
    con.query(update_query, [status, ico_address], (err, result) => {
        if (err || result.affectedRows === 0) {
            res.send({
                status: 'error',
                message: 'ico not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.get('/get_all_ico', (req, res) => {
    const id = req.params.id;
    // const query = `SELECT ico.*, project.project_name, project.token_name, project.fixed_supply, project.token_logo FROM ico, project WHERE ico.project_id = project.id AND ico.finalized = 1`;
    const query = `SELECT ico.*, project.project_name, project.token_name, project.fixed_supply, project.token_logo FROM ico, project WHERE ico.project_id = project.id`;
    con.query(query, (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'No ico found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.get('/get_ico_by_project_id/:id', (req, res) => {
    const id = req.params.id;
    // const query = `SELECT * FROM ico WHERE project_id = ? AND finalized = 1`;
    const query = `SELECT * FROM ico WHERE project_id = ? `;
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'ico not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.post('/add_proposal', async (req, res) => {
    var org_id = req.body.org_id;
    var project_id = req.body.project_id;
    var category_id = req.body.category_id;
    var end_time_in_days = req.body.end_time_in_days;
    var description = req.body.description;
    var doc = await uploadimage(req.files.doc, project_id);
    // var doc = 'https://via.placeholder.com/200x200?text=Profile%20Pic';

    const query = `INSERT INTO proposal (id, org_id, project_id, category_id, end_time_in_days, end_date, description, doc) VALUES (NULL, ?,?,?,?, (NOW() + INTERVAL ${end_time_in_days} day), ?, ?)`;
    con.query(query, [org_id, project_id, category_id, end_time_in_days, description, doc], (err, result) => {
        console.log(query, err);
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            const id = result.insertId;
            res.send({
                status: 'success',
                proposal_id: id
            });
        }
    });
});

app.get('/get_proposal/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT proposal.*, category.name as category_name FROM proposal, category WHERE proposal.category_id = category.id AND proposal.id = ?`;
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'proposal not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.post('/member_vote', async (req, res) => {
    var member_id = req.body.member_id;
    var voter_id = req.body.voter_id;
    var vote = Number(req.body.vote);
    const vote_query = `SELECT * from member_vote WHERE member_id = ? AND voter_id = ?`;
    console.log(vote_query);
    con.query(vote_query, [member_id, voter_id], (vote_err, vote_result) => {
        if (vote_err) {
            res.status(400).send({
                status: 'error',
                error: vote_err.sqlMessage
            });
        } else if (vote_result.length === 0) {
            const query = `INSERT INTO member_vote (id, member_id, voter_id, vote) VALUES (NULL, ?,?,?)`;
            con.query(query, [member_id, voter_id, vote], (err, result) => {
                console.log(query, err);
                if (err) {
                    res.status(400).send({
                        status: 'error',
                        error: err.sqlMessage
                    });
                } else {
                    // approveMember(member_id);
                    res.send({
                        status: 'success voted',
                        response: result
                    });
                }
            });
        } else {
            // approveMember(member_id);
            res.send({
                status: 'Already Voted'
            });
        }
    });
});

app.post('/add_vote', async (req, res) => {
    var member_id = req.body.member_id;
    var org_id = req.body.org_id;
    var proposal_id = req.body.proposal_id;
    var proposal_type = Number(req.body.proposal_type);
    var vote = Number(req.body.vote);
    const query = `INSERT INTO votes ( member_id, org_id, proposal_id, proposal_type, vote, date) VALUES ( ?, ?, ?, ?, ?, current_timestamp())`;
    con.query(query, [member_id, org_id, proposal_id, proposal_type, vote], (err, result) => {
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            res.send({
                status: 'success voted',
                response: result
            });
        }

    });
});

app.post('/update_reached', async (req, res) => {
    var id = req.body.id;
    var status = req.body.status;
    const query = `UPDATE ico SET reached = ? WHERE id = ?`;
    con.query(query, [status, id], (err, result) => {
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            res.send({
                status: 'success updated',
                response: result
            });
        }

    });
});

app.get('/get_vote_list_by_org/:org_id/:id', (req, res) => {
    const id = req.params.id;
    const org_id = req.params.org_id;
    const query = `SELECT * FROM votes WHERE org_id = ? AND member_id = ?`;
    con.query(query, [org_id, id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'proposal not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.get('/get_vote_list_by_type/:proposal_type/:id', (req, res) => {
    const id = req.params.id;
    const proposal_type = req.params.proposal_type;
    const query = `SELECT * FROM votes WHERE proposal_type = ? AND member_id = ?`;
    con.query(query, [proposal_type, id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'proposal not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.post('/vote', async (req, res) => {
    var member_id = req.body.member_id;
    var proposal_id = req.body.proposal_id;
    var vote = Number(req.body.vote);
    const vote_query = `SELECT vote.*, proposal.status, proposal.end_date FROM vote, proposal WHERE proposal.id = ? AND vote.proposal_id = proposal.id AND vote.member_id = ? AND proposal_id = ?`;
    console.log(vote_query);
    con.query(vote_query, [proposal_id, member_id, proposal_id], (vote_err, vote_result) => {
        if (vote_err) {
            res.status(400).send({
                status: 'error',
                error: vote_err.sqlMessage
            });
        } else if (vote_result.length === 0) {
            const proposel_query = `SELECT * FROM proposal WHERE id = ? AND status like 'Initialized' AND end_date > NOW()`;
            console.log(proposel_query);
            con.query(proposel_query, [proposal_id], (proposel_err, proposel_result) => {
                if (proposel_err) {
                    res.status(400).send({
                        status: 'error',
                        error: proposel_err.sqlMessage
                    });
                } else if (proposel_result.length > 0) {
                    const query = `INSERT INTO vote ( member_id, proposal_id, vote, date) VALUES ( ?, ?, ?, current_timestamp())`;
                    con.query(query, [member_id, proposal_id, vote], (err, result) => {
                        console.log(query, err);
                        if (err) {
                            res.status(400).send({
                                status: 'error',
                                error: err.sqlMessage
                            });
                        } else {
                            const id = result.insertId;
                            // updateProposal(proposal_id);
                            res.send({
                                status: 'success',
                                vote_id: id
                            });
                        }
                    });
                } else {
                    res.send({
                        status: 'error',
                        message: 'Pending proposal not found?'
                    });
                }
            });
        } else {
            res.send({
                status: 'error',
                message: 'Already voted',
                data: vote_result
            });
        }
    });
});

app.get('/get_fund_transfer_details/:id', async (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM fund_transfer WHERE id = ? `;
    con.query(query, [id], (err, result) => {
        console.log(query, err);
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.post('/init_fund_transfer', async (req, res) => {
    const org_id = req.body.org_id;
    const from_wallet = req.body.from_wallet;
    const to_wallet = req.body.to_wallet;
    const amount = req.body.amount;
    const description = req.body.description;
    var index = await getLastIndex('fund_transfer', 'fund_transfer_index');
    const query = `INSERT INTO fund_transfer ( org_id, from_wallet, to_wallet, amount, fund_transfer_index, description) VALUES (?,?,?,?,?,?)`;
    con.query(query, [org_id, from_wallet, to_wallet, amount, index + 1, description], (err, result) => {
        console.log(query, err);
        if (err) {
            res.status(400).send({
                status: 'error',
                error: err.sqlMessage
            });
        } else {
            res.send({
                status: 'success',
                response: result,
                id: result.insertId
            });
        }
    });
});

app.post('/fund_transfer_vote', async (req, res) => {
    var member_id = req.body.member_id;
    var fund_transfer_id = req.body.fund_transfer_id;
    var vote = Number(req.body.vote);
    const vote_query = `SELECT fund_transfer_vote.*, fund_transfer.amount, fund_transfer.status, fund_transfer.proposed_date, fund_transfer.finished_date FROM fund_transfer_vote, fund_transfer WHERE fund_transfer.id = ? AND fund_transfer_vote.fund_transfer_id = fund_transfer.id AND fund_transfer_vote.member_id = ? AND fund_transfer_id = ?`;
    console.log(vote_query);
    con.query(vote_query, [fund_transfer_id, member_id, fund_transfer_id], (vote_err, vote_result) => {
        if (vote_err) {
            res.status(400).send({
                status: 'error',
                error: vote_err.sqlMessage
            });
        } else if (vote_result.length === 0) {
            const proposel_query = `SELECT * FROM fund_transfer WHERE id = ? AND status = 0`;
            console.log(proposel_query);
            con.query(proposel_query, [fund_transfer_id], (proposel_err, proposel_result) => {
                if (proposel_err) {
                    res.status(400).send({
                        status: 'error',
                        error: proposel_err.sqlMessage
                    });
                } else if (proposel_result.length > 0) {
                    const query = `INSERT INTO fund_transfer_vote ( member_id, fund_transfer_id, vote, finished_date) VALUES ( ?, ?, ?, current_timestamp())`;
                    con.query(query, [member_id, fund_transfer_id, vote], (err, result) => {
                        console.log(query, err);
                        if (err) {
                            res.status(400).send({
                                status: 'error',
                                error: err.sqlMessage
                            });
                        } else {
                            const id = result.insertId;
                            update_fund_transfer(fund_transfer_id);
                            res.send({
                                status: 'success',
                                fund_transfer_id: id
                            });
                        }
                    });
                } else {
                    res.send({
                        status: 'error',
                        message: 'Pending fund transfer not found?'
                    });
                }
            });
        } else {
            res.send({
                status: 'error',
                message: 'Already voted',
                data: vote_result
            });
        }
    });
});

app.get('/get_vote/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT v.date, v.vote, v.voter_id, m.member_name as voter_name, m.email as voter_email, m.wallet_address as voter_wallet_address FROM member_vote as v, members as m WHERE v.voter_id = m.id AND v.member_id = ?`;
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.send({
                status: 'error',
                message: 'Vote not found'
            });
        } else {
            res.send({
                status: 'success',
                response: result
            });
        }
    });
});

app.get('/get_member_vote_list/:id', (req, res) => {
    const id = req.params.id;
    // const query = `SELECT * FROM members WHERE wallet_address LIKE ? AND is_active = 1`;
    const query = `SELECT * FROM members WHERE id = ? AND is_active = 1`;
    // let response = {};
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.status(404).send({
                status: 'error',
                message: 'member not found'
            });
        } else {
            const org_id = result[0].org_id;
            const resp = {
                success: true,
                message: 'member votes',
                voted: 0,
                to_vote: 0,
                data: []
            };
            // const query = `SELECT * FROM org WHERE id = '${org_id}'`;
            const query1 = `SELECT members.id as member_id, members.member_name, members.email, members.is_active FROM members WHERE members.org_id = ${org_id} AND members.id != ${id}`;
            con.query(query1, (err, members_list) => {
                console.log(err, members_list);
                if (err || members_list.length === 0) {
                    res.status(404).send({
                        status: 'error',
                        message: 'member not found'
                    });
                } else {
                    members_list.map(member => {
                        const query2 = `SELECT member_vote.vote, member_vote.vote, member_vote.date, member_vote.voter_id FROM member_vote WHERE member_vote.voter_id = ? AND member_vote.member_id = ? `;
                        con.query(query2, [id, member.member_id], (err, vote_result) => {
                            if (err || vote_result.length === 0) {
                                member.is_voted = 0;
                                member.vote = null;
                            } else {
                                member.is_voted = 1;
                                resp.voted++;
                                member.vote = vote_result[0].vote;
                            }
                            if (member.is_active != 1) {
                                resp.to_vote++;
                            }
                            resp.data.push(member);
                            if (resp.data.length === members_list.length) {
                                res.send(resp);
                            }
                        });
                    });
                }
            });
        }
    });
});

app.post('/finalize_fund_transfer', (req, res) => {
    const id = req.body.id;
    const status = req.body.status;
    const query = `UPDATE fund_transfer SET finished_date = current_timestamp(), status = ? WHERE id = ?`;
    con.query(query, [status, id], (err, result) => {
        if (err) {
            res.status(500).send({
                status: 'error',
                message: error
            });
        } else {
            res.status(200).send({
                status: 'success',
                message: result
            })
        }
    })
});

app.post('/finalize_proposal', (req, res) => {
    const id = req.body.id;
    const status = req.body.status;
    const query = `UPDATE proposal SET status = ? WHERE id = ?`;
    con.query(query, [status, id], (err, result) => {
        if (err) {
            res.status(500).send({
                status: 'error',
                message: error
            });
        } else {
            res.status(200).send({
                status: 'success',
                message: result
            })
        }
    })
});

app.get('/get_proposal_vote_list/:id', (req, res) => {
    const id = req.params.id;
    // const query = `SELECT * FROM members WHERE wallet_address LIKE ? AND is_active = 1`;
    const query = `SELECT * FROM members WHERE id = ? AND is_active = 1`;
    // let response = {};
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.status(404).send({
                status: 'error',
                message: 'member not found'
            });
        } else {
            const org_id = result[0].org_id;
            const resp = {
                success: true,
                message: 'proposal votes',
                voted: 0,
                to_vote: 0,
                data: []
            };
            const query1 = `SELECT * FROM proposal WHERE org_id = ${org_id}`;
            con.query(query1, (err, proposal_list) => {
                if (proposal_list.length === 0) {
                    res.send({
                        status: 'error',
                        message: 'No proposal found'
                    });
                } else {
                    proposal_list.map(proposal => {
                        // status like 'Initialized' AND end_date > NOW()
                        const query2 = `SELECT vote.vote, vote.date FROM vote WHERE vote.member_id = ? AND vote.proposal_id = ?`;
                        con.query(query2, [id, proposal.id], (err, vote_result) => {
                            if (err || vote_result.length === 0) {
                                proposal.is_voted = 0;
                                proposal.vote = null;
                            } else {
                                proposal.is_voted = 1;
                                proposal.vote = vote_result[0].vote;
                                resp.voted++;
                            }
                            if (proposal.status === 'Initialized' && proposal.end_date > new Date()) {
                                resp.to_vote++;
                            }
                            resp.data.push(proposal);
                            if (resp.data.length === proposal_list.length) {
                                res.send(resp);
                            }
                        });
                    });
                }
            });
        }
    });
});

app.get('/get_fund_transfer_vote_list/:id', (req, res) => {
    const id = req.params.id;
    // const query = `SELECT * FROM members WHERE wallet_address LIKE ? AND is_active = 1`;
    const query = `SELECT * FROM members WHERE wallet_address = ? AND is_active = 1`;
    // let response = {};
    con.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            res.status(404).send({
                status: 'error',
                message: 'member not found'
            });
        } else {
            const org_id = result[0].org_id;
            const resp = {
                success: true,
                message: 'fund transfer votes',
                voted: 0,
                to_vote: 0,
                data: []
            };
            const query1 = `SELECT * FROM fund_transfer WHERE org_id = ${org_id}`;
            con.query(query1, (err, fund_transfer_list) => {
                if (fund_transfer_list.length === 0) {
                    res.send({
                        status: 'error',
                        message: 'No fund transfer found'
                    });
                } else {
                    fund_transfer_list.map(fund_transfer => {
                        // status like 'Initialized' AND end_date > NOW()
                        const query2 = `SELECT fund_transfer_vote.vote, fund_transfer_vote.proposed_date, fund_transfer_vote.finished_date FROM fund_transfer_vote WHERE fund_transfer_vote.member_id = ? AND fund_transfer_vote.fund_transfer_id = ?`;
                        con.query(query2, [id, fund_transfer.id], (err, vote_result) => {
                            if (err || vote_result.length === 0) {
                                fund_transfer.is_voted = 0;
                                fund_transfer.vote = null;
                            } else {
                                fund_transfer.is_voted = 1;
                                fund_transfer.vote = vote_result[0].vote;
                                resp.voted++;
                            }
                            if (fund_transfer.status == 0) {
                                resp.to_vote++;
                            }
                            resp.data.push(fund_transfer);
                            if (resp.data.length === fund_transfer_list.length) {
                                res.send(resp);
                            }
                        });
                    });
                }
            });
        }
    });
});

app.get('/pan_verify/:pan', async (req, res) => {
    const pan = req.params.pan;
    const { xApiKey, xApiSecret } = await getsandboxApikey();
    try {
        const jwt = await getSandboxKey(xApiKey, xApiSecret);
        const panResponse = await getPanDetails(pan, jwt.access_token, xApiKey);
        if (panResponse.code === 200) {
            res.status(200).send({
                status: 'success',
                response: panResponse
            });
        } else {
            res.status(400).send({
                status: 'error',
                error: panResponse,
                details: {
                    xApiKey: xApiKey,
                    xApiSecret: xApiSecret,
                    Authorization: jwt['access_token']
                }
            });
        }
    } catch (err) {
        res.status(400).send({
            status: 'error',
            error: err,
            details: {
                // xApiKey: xApiKey,
                // xApiSecret: xApiSecret,
                // Authorization: jwt['access_token']
            }
        });
    }
});

app.get('/verify_pan/:pan', async (req, res) => {
    const pan = req.params.pan;
    try {
        const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1MTY1ODU4NCwianRpIjoiZDViYjBlODktOGMxMS00MDcxLTg4ODUtNWYyMThiYzczYTUxIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2LmVxeGZvcmJ1c2luZXNzQGFhZGhhYXJhcGkuaW8iLCJuYmYiOjE2NTE2NTg1ODQsImV4cCI6MTk2NzAxODU4NCwidXNlcl9jbGFpbXMiOnsic2NvcGVzIjpbInJlYWQiXX19.bG0K5jsVIx_qRM3Qzc48JbwevS2gxL-uEWLcYg17c6I';
        const panResponse = await getPanInfo(pan, jwt).catch(err => {
            res.status(400).send({
                status: 'error',
                error: err,
                details: {}
            });
        });
        if (panResponse) {
            res.status(200).send({
                status: 'success',
                response: panResponse
            });
        }
    } catch (err) {
        res.status(400).send({
            status: 'error',
            error: err,
            // details: {
            //   xApiKey: xApiKey,
            //   xApiSecret: xApiSecret,
            //   Authorization: jwt['access_token']
            // }
        });
    }
});

// getPassportInfo
app.post('/verify_passport', async (req, res) => {
    try {
        const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1MTY1ODU4NCwianRpIjoiZDViYjBlODktOGMxMS00MDcxLTg4ODUtNWYyMThiYzczYTUxIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2LmVxeGZvcmJ1c2luZXNzQGFhZGhhYXJhcGkuaW8iLCJuYmYiOjE2NTE2NTg1ODQsImV4cCI6MTk2NzAxODU4NCwidXNlcl9jbGFpbXMiOnsic2NvcGVzIjpbInJlYWQiXX19.bG0K5jsVIx_qRM3Qzc48JbwevS2gxL-uEWLcYg17c6I';
        const panResponse = await getPassportInfo(req.files.passport, jwt);
        if (panResponse) {
            res.status(200).send({
                status: 'success',
                response: panResponse
            });
        } else {
            res.status(400).send({
                status: 'error',
                error: panResponse,
                details: {}
            });
        }
    } catch (err) {
        res.status(400).send({
            status: 'error',
            error: err,
            // details: {
            //   xApiKey: xApiKey,
            //   xApiSecret: xApiSecret,
            //   Authorization: jwt['access_token']
            // }
        });
    }
});

app.post('/verify/twitter', async (req, res) => {
    const link = req.body.link;
    console.log(link);

    request(link,
        {
            headers: {
                'user-agent': 'curl/7.47.0',
                'accept-language': 'en-US,en',
                'accept': '*/*'
            }
        }, (error, response, body) => {
            try {
                if (!error && response.statusCode === 200 && link.indexOf('twitter.com') > -1) {
                    var result = scraper(body);
                    res.send({ success: true, data: body });
                } else {
                    res.status(404).send({ success: false, data: response.statusCode });
                    process.exit();
                }
            } catch (error) {
                res.status(404).send({ success: false, data: [] });
            }
        });


        // .catch(error => {
        //     res.status(404).send({ success: false, err: error });
        //     process.exit();
        //     // console.error(error);
        // });

    // rp(link)
    //     .then((html) => {
    //         res.send(html);
    //         const $ = cheerio.load(html);
    //         console.log($('title', html));
    //         //success!
    //         var profile_name = (($('title', html)[0].children[0].data).split('|')[0]).split('(')[0].trim();
    //         if (link.indexOf('twitter.com') > -1) {
    //             res.send({ success: true, data: profile_name });
    //         } else {
    //             res.status(404).send({ success: false, data: profile_name });
    //         }
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //         res.status(404).send({ success: false, data: err.statusCode });
    //         //handle error
    //         // console.log(err);
    //     });
});

app.post('/verify/facebook', async (req, res) => {
    var link = req.body.link;
    // check link is a facebook profile
    request(link,
        {
            headers: {
                'user-agent': 'curl/7.47.0',
                'accept-language': 'en-US,en',
                'accept': '*/*'
            }
        }, (error, response, body) => {
            try {
                if (!error && response.statusCode === 200 && link.indexOf('facebook.com') > -1) {
                    var result = scraper(body);
                    res.send({ success: true, data: result.error });
                } else {
                    res.status(404).send({ success: false, data: response.statusCode });
                }
            } catch (error) {
                res.status(404).send({ success: false, data: [] });
            }
        });
});

// app.post('/verify/linkedin', async (req, res) => {
//   var link = req.body.link;
//   var result = await LinkedinProfile(link);
//   if (result.length) {
//     var result = scraper(body);
//     res.send({ success: true, data: result });
//   } else {
//     res.status(404).send({ success: false, data: [] });
//   }
// });

app.get('/clear_db', async (req, res) => {
    console.log('Query');
    //sql query for TRUNCATE tables ico, members, org, project, proposal, vote
    // 'TRUNCATE ico',
    // 'TRUNCATE members',
    // 'TRUNCATE remove_members',
    // 'TRUNCATE member_vote',
    // 'TRUNCATE org',
    // 'TRUNCATE project',
    // 'TRUNCATE proposal',
    // 'TRUNCATE vote',
    // 'TRUNCATE fund_transfer',
    // 'TRUNCATE fund_transfer_vote',
    // 'TRUNCATE indexes',
    const queries = [
    ];

    const promises = queries.map(query => new Promise((resolve, reject) => {
        con.query(query, (err, result) => {
            console.log(err, result);
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    }
    ));
    Promise.all(promises).then(result => {
        res.send({
            status: 'success',
            response: result
        });
    }).catch(err => {
        res.status(400).send({
            status: 'error',
            error: err
        });
    });
});


const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server: Listening on port ${port}`);
});

function uploadimage(file, project_name = Math.random().toString(36).split(".")[1]) {
    console.log(file);
    return new Promise((resolve, reject) => {
        if (file) {
            const { originalname, buffer } = file[0];
            const blob = bucket.file(project_name + "/" + originalname.replace(/ /g, "_"))
            const blobStream = blob.createWriteStream({
                resumable: false
            })
            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                blob.makePublic().then(() => {
                    console.log(publicUrl)
                })
                resolve(publicUrl)
            })
            blobStream.on('error', () => {
                resolve('https://storage.cloud.google.com/eqxdata/logo.png')
            })
            blobStream.end(buffer)
        } else {
            resolve('https://storage.cloud.google.com/eqxdata/logo.png')
        }
    })
}

function uploadMultipleFiles(files) {
    return new Promise((resolve, reject) => {
        const promises = files.map(file => {
            return uploadimage(file)
        })
        Promise.all(promises).then(urls => {
            resolve(urls)
        })
    })
}

function getsandboxApikey() {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM settings WHERE id = 1`;
        con.query(query, (err, result) => {
            if (err || result.length === 0) {
                reject(err)
            } else {
                resolve(result[0])
            }
        });
    })
}

function getSandboxKey(xApiKey, xApiSecret) {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'POST',
            'url': 'https://api.sandbox.co.in/authenticate',
            'headers': {
                'x-api-key': xApiKey,
                'x-api-secret': xApiSecret,
                'x-api-version': '1.0'
            }
        };
        request(options, function (error, response) {
            if (error) reject(error);
            else resolve(JSON.parse(response.body));
        });
    });
}

function getPanDetails(pan, jwt, xApiKey) {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://api.sandbox.co.in/pans/${pan}/verify?consent=y&reason=For KYC of User`,
            'headers': {
                Accept: 'application/json',
                Authorization: jwt,
                'x-api-key': xApiKey,
                'x-api-version': '1.0'
            }
        };
        request(options, function (error, response) {
            if (error) reject(error);
            else resolve(JSON.parse(response.body));
        });
    });
}

function getPanInfo(pan, jwt) {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'POST',
            'url': `https://kyc-api.aadhaarkyc.io/api/v1/pan/pan`,
            'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + jwt,
            }, body: JSON.stringify({
                "id_number": pan
            })
        };
        request(options, (error, response) => {
            if (error) reject(error);
            else resolve(JSON.parse(response.body));
        });
    });
}

function getPassportInfo(file, jwt) {
    return new Promise((resolve, reject) => {
        const { originalname, buffer } = file[0];
        console.log(originalname);
        var options = {
            'method': 'POST',
            'url': `https://kyc-api.aadhaarkyc.io/api/v1/ocr/international-passport`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + jwt,
            }, formData: {
                'file': {
                    'value': buffer,
                    'options': {
                        'filename': originalname,
                        'contentType': null
                    }
                }
            }
        };
        request(options, (error, response) => {
            console.log(error, response.body);
            if (error) reject(error);
            else resolve(JSON.parse(response.body));
        });
    });
}

function approveMember(member_id = null) {
    let query = `SELECT * FROM members WHERE is_active = 0`;
    if (member_id) {
        query = `SELECT * FROM members WHERE is_active = 0 AND id = ${member_id}`;
    }
    con.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            result.forEach(member_details => {
                const member_count_query = `SELECT COUNT(id) FROM members WHERE org_id = ${member_details.org_id} AND is_active = 1`;
                con.query(member_count_query, (err, member_result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const member_count = member_result[0]['COUNT(id)'];
                        const vote_approved_query = `SELECT COUNT(id) FROM member_vote WHERE member_id = ${member_details.id} AND vote = 1`;
                        con.query(vote_approved_query, (err, vote_result) => {
                            if (err) {
                                console.log(err);
                            } else {
                                const vote_count = vote_result[0]['COUNT(id)'];
                                const vote_percentage = (vote_count / member_count) * 100;
                                console.log(member_count, vote_count, vote_percentage);
                                if (vote_percentage > 50) {
                                    const update_query = `UPDATE members SET is_active = 1 WHERE id = ${member_details.id}`;
                                    con.query(update_query, (err, result) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log('Member Approved');
                                        }
                                    });
                                }
                            }
                        });
                        // const vote_reject_query = `SELECT COUNT(id) FROM member_vote WHERE member_id = ${member_details.id} AND vote = 0`;
                        // con.query(vote_reject_query, (err, vote_result) => {
                        //   if (err) {
                        //     console.log(err);
                        //   } else {
                        //     const vote_count = vote_result[0]['COUNT(id)'];
                        //     const vote_percentage = (vote_count / member_count) * 100;
                        //     if (vote_percentage > 50) {
                        //       const update_query = `DELETE FROM members WHERE id = ${member_details.id}`;
                        //       con.query(update_query, (err, result) => {
                        //         if (err) {
                        //           console.log(err);
                        //         } else {
                        //           console.log('Member rejected');
                        //         }
                        //       });
                        //     }
                        //   }
                        // });
                    }
                });
            });
        }
    });
}

function updateProposal(proposal_id = null) {
    let query = `SELECT * FROM proposal WHERE status like 'Initialized' AND end_date > NOW()`;
    if (proposal_id) {
        query = `SELECT * FROM proposal WHERE status like 'Initialized' AND end_date > NOW() AND id = ?`;
    }
    con.query(query, [proposal_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            result.forEach(proposal => {
                const member_count_query = `SELECT COUNT(id) FROM members WHERE org_id = ${proposal.org_id} AND is_active = 1`;
                con.query(member_count_query, (err, member_result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const member_count = member_result[0]['COUNT(id)'];
                        const total_votes_query = `SELECT COUNT(id) FROM vote WHERE proposal_id = ${proposal.id}`;
                        con.query(total_votes_query, (err, total_votes_result) => {
                            if (!err) {
                                const total_vote_count = total_votes_result[0]['COUNT(id)'];
                                if (total_vote_count === member_count) {
                                    const vote_approved_query = `SELECT COUNT(id) FROM vote WHERE proposal_id = ${proposal.id} AND vote = 1`;
                                    con.query(vote_approved_query, (err, vote_result) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            const vote_count = vote_result[0]['COUNT(id)'];
                                            // const vote_percentage = (vote_count / member_count) * 100;
                                            if (vote_count === member_count) {
                                                const update_query = `UPDATE proposal SET status = 'Approved' WHERE id = ${proposal.id}`;
                                                con.query(update_query, (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log('Proposal Approved');
                                                    }
                                                });
                                            } else {
                                                const update_query = `UPDATE proposal SET status = 'Rejected' WHERE id = ${proposal.id}`;
                                                con.query(update_query, (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log('Proposal Rejected');
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }
    });
    setTimeout(() => {
        // update status expired proposal
        const expire_query = `UPDATE proposal SET status = 'Expired' WHERE status like 'Initialized' AND end_date < NOW()`;
        con.query(expire_query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Proposal Expired');
            }
        });
    }, 1000 * 60);
}

function update_fund_transfer(fund_transfer_id = null) {
    let query = `SELECT * FROM fund_transfer WHERE status like 0`;
    if (proposal_id) {
        query = `SELECT * FROM fund_transfer WHERE status like 0 AND id = ?`;
    }
    con.query(query, [fund_transfer_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            result.forEach(fund_transfer => {
                const member_count_query = `SELECT COUNT(id) FROM members WHERE org_id = ${fund_transfer.org_id} AND is_active = 1`;
                con.query(member_count_query, (err, member_result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const member_count = member_result[0]['COUNT(id)'];
                        const total_votes_query = `SELECT COUNT(id) FROM fund_transfer_vote WHERE fund_transfer_id = ${fund_transfer.id}`;
                        con.query(total_votes_query, (err, total_votes_result) => {
                            if (!err) {
                                const total_vote_count = total_votes_result[0]['COUNT(id)'];
                                if (total_vote_count === member_count) {
                                    const vote_approved_query = `SELECT COUNT(id) FROM vote WHERE fund_transfer_id = ${fund_transfer.id} AND vote = 1`;
                                    con.query(vote_approved_query, (err, vote_result) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            const vote_count = vote_result[0]['COUNT(id)'];
                                            // const vote_percentage = (vote_count / member_count) * 100;
                                            if (vote_count === member_count) {
                                                const update_query = `UPDATE fund_transfer SET status = 1 WHERE id = ${fund_transfer.id}`;
                                                con.query(update_query, (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log('fund transfer Approved');
                                                    }
                                                });
                                            } else {
                                                const update_query = `UPDATE fund_transfer SET status = null WHERE id = ${fund_transfer.id}`;
                                                con.query(update_query, (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log('fund transfer Rejected');
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }
    });
}

function updateProposalOld(proposal_id = null) {
    let query = `SELECT * FROM proposal WHERE status like 'Initialized' AND end_date > NOW()`;
    if (proposal_id) {
        query = `SELECT * FROM proposal WHERE status like 'Initialized' AND end_date > NOW() and id = ${proposal_id}`;
    }
    con.query(query, [proposal_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            result.forEach(proposal => {
                const member_count_query = `SELECT COUNT(id) FROM members WHERE org_id = ${proposal.org_id} AND is_active = 1`;
                con.query(member_count_query, (err, member_result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const member_count = member_result[0]['COUNT(id)'];
                        const total_votes_query = `SELECT COUNT(id) FROM vote WHERE proposal_id = ${proposal.id}`;
                        con.query(total_votes_query, (err, total_votes_result) => {
                            if (!err) {
                                const vote_count = total_votes_result[0]['COUNT(id)'];
                                if (vote_count === member_count) {
                                    const vote_approved_query = `SELECT COUNT(id) FROM vote WHERE proposal_id = ${proposal.id} AND vote = 1`;
                                    con.query(vote_approved_query, (err, vote_result) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            const vote_count = vote_result[0]['COUNT(id)'];
                                            const vote_percentage = (vote_count / member_count) * 100;
                                            if (vote_percentage > 50) {
                                                const update_query = `UPDATE proposal SET status = 'Approved' WHERE id = ${proposal.id}`;
                                                con.query(update_query, (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log('Proposal Approved');
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    const vote_reject_query = `SELECT COUNT(id) FROM vote WHERE proposal_id = ${proposal.id} AND vote = 0`;
                                    con.query(vote_reject_query, (err, vote_result) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            const vote_count = vote_result[0]['COUNT(id)'];
                                            const vote_percentage = (vote_count / member_count) * 100;
                                            if (vote_percentage > 50) {
                                                const update_query = `UPDATE proposal SET status = 'Rejected' WHERE id = ${proposal.id}`;
                                                con.query(update_query, (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log('Proposal Approved');
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }
    });
    setTimeout(() => {
        // update status expired proposal
        const expire_query = `UPDATE proposal SET status = 'Expired' WHERE status like 'Initialized' AND end_date < NOW()`;
        con.query(expire_query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Proposal Expired');
            }
        });
    }, 1000 * 60);
}

function sendactivationCodeViaEmail(member_email) {
    return new Promise((resolve, reject) => {
        const activation_code = crc32(member_email + 'eqx');
        // const mail_body = `<p>Hi,</p>` +
        //   `<p>Your activation code is <b>${activation_code}</b></p>` +
        //   `<p>Thank you,</p>` +
        //   `<p>EQX Team</p>`;
        fs.readFile('./eqx/mail.html', 'utf8', (err, data) => {
            if (err) {
                return console.log(err);
            }
            const mail_body = data.replace(/{{activation_code}}/g, activation_code);

            sendEmail(member_email, 'Activate your account', mail_body).then(() => {
                console.log('Activation Email Sent');
                resolve(true);
            }).catch(err => {
                console.log(err);
                reject(false);
            });
        });
    });
}

function sendWelcomeEmail(email, name) {
    return new Promise((resolve, reject) => {
        const mail_body = `<p>Hi,</p>` +
            `<p>Welcome to EQX, ${name}</p>` +
            `<p>Please visit <a href="https://app.equinox.business">app.equinox.business</a></p>` +
            `<p>Thank you,</p>` +
            `<p>EQX Team</p>`;
        sendEmail(email, 'Welcome to EQX', mail_body).then(() => {
            console.log('Welcome Email Sent');
            resolve('Welcome Email Sent');
        }).catch(err => {
            // console.log(err);
            resolve(err);
        });
    });
}

function sendEmail(to, subject, body) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: 'smtpout.secureserver.net',
            port: 465,
            secure: true,
            auth: {
                user: 'support@equinox.business',
                pass: 'Equinox@1'
            }
        });
        // const transporter = nodemailer.createTransport({
        //   host: 'smtp.zoho.in',
        //   port: 465,
        //   secure: true,
        //   auth: {
        //     user: 'help@equinox.business',
        //     pass: 'Equinox@1'
        //   }
        // });
        const mailOptions = {
            from: 'support@equinox.business',
            to: to,
            subject: subject,
            html: body
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(to);
                console.log(error);
                reject(false);
            } else {
                console.log(to);
                console.log(info);
                resolve(true);
            }
        });
    });
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()) ? email : undefined;
}

function parseQuery(str) {
    var r = encodeURIComponent(str);
    return r;
}

function waitUntil(t) {
    return new Promise((r) => {
        setTimeout(r, t)
    })
}

// async function LinkedinProfile(q) {
//   return new Promise(async (r, e) => {
//     try {
//       const browser = await puppeteer.launch({
//         headless: false, // for test disable the headlels mode,
//         args: ['--headless'], // headless but GPU enable
//       });
//       const page = await browser.newPage();
//       await page.setViewport({ width: 1000, height: 926 });


//       var openGOogle = async function () {
//         console.log("open google")
//         try {
//           await page.goto("https://google.com/search?q=" + parseQuery(q), { waitUntil: 'networkidle2' });

//           await waitUntil(1000)

//           var goglinks = await page.evaluate(function () {
//             var listGresult = document.querySelectorAll('.g');
//             var linkresult = []
//             for (var x = 0; x < listGresult.length; x++) {
//               var aElem = listGresult[x].getElementsByTagName('a');
//               for (var i = 0; i < aElem.length; i++) {
//                 var href = aElem[i].getAttribute('href');
//                 if (href != null && href.indexOf("linkedin.com") > 1 && href.indexOf("translate.google") < 0) {
//                   linkresult.push(href)
//                 }
//               }
//             }
//             return linkresult;
//           })
//           return goglinks;
//         } catch (e) {
//           console.log(e);
//         }
//       }

//       var result = []
//       var googlinks = await openGOogle();
//       for (var x = 0; x < googlinks.length; x++) {
//         var link = googlinks[x];
//         console.log('[ ' + x + ' ] ' + link)
//         result.push(link);
//       }

//       // console.log(result);
//       browser.close()
//       r(result);
//     } catch (err) {
//       e(err);
//     }
//   });
// }

function getLastIndex(table, name) {
    return new Promise(async (resolve, reject) => {
        query = `SELECT MAX(${name}) FROM ${table}`;
        con.query(query, [name], (err, result) => {
            console.log(err, result)
            if (err) {
                resolve(-1);
            } else {
                if (result[0][`MAX(${name})`] == null) {
                    resolve(-1);
                } else {
                    resolve(result[0][`MAX(${name})`]);
                }
            }
        });
    });
}