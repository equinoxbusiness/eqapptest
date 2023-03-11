import { Modal, Table } from "antd";


export default function DetailModal({
  open,
  setOpen,
  handleOpen,
  handleClose,
  voters,
  votingLoading,
}) {
  const dataSource = voters;
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'member_name',
      key: 'member_name',
    },
    {
      title: 'Voted',
      dataIndex: 'voted',
      key: 'voted',
      render: (_) => {
        return (
          <p
              className={` p-0 mb-0 uppercase ${
                _ === "Yes"
                  ? "text-green-600"
                  : " text-red-400 "
              }`}
            >
              {_}
            </p>
        )
      }
    },
  ];
  return (
    <div>
      <Modal title="Voters" open={open} onCancel={handleClose}  footer={null}>
        <Table dataSource={dataSource} columns={columns} pagination={false}/>
      </Modal>
      {/* <Modal
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="left">Voted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {votingLoading ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <div className={"flex justify-center w-full"}>
                          <CircularProgress thickness={6} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    voters.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell align="left">
                          <p className="p-0 mb-0 uppercase">
                            {row.member_name}
                          </p>
                        </TableCell>
                        <TableCell align="left">
                          <p
                            className={` p-0 mb-0 uppercase ${
                              row.voted === "Yes"
                                ? "text-green-600"
                                : " text-red-400 "
                            }`}
                          >
                            {row.voted}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Fade>
      </Modal> */}
    </div>
  );
}
