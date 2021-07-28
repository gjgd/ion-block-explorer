import React from 'react';
import moment from 'moment';
import MaterialTable from '@material-table/core';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import CssBaseline from '@material-ui/core/CssBaseline';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-177950673-2');
ReactGA.pageview(window.location.pathname + window.location.search);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  fab: {
    margin: 'auto',
    left: 0,
    bottom: theme.spacing(2),
    right: 0,
    position: 'absolute',
  },
}));

export default function App() {
  const [transactions, setTransactions] = React.useState([]);
  const classes = useStyles();

  React.useEffect(() => {
    (async () => {
      const response = await fetch('https://ion-block-explorer-api.gjgd.xyz/transactions').then(res => res.json());
      setTransactions(response);
    })();
  }, []);

  const columns = [
    {
      title: "Time", field: "blockTime", width: 150, render: (row) => {
        return <Typography>{moment(row.blockTime * 1000).fromNow()}</Typography>
      }
    },
    {
      title: "Bitcoin block", field: "blockHeight", width: 150, render: (row) => {
        return <Typography>
          <Link href={`https://www.blockchain.com/btc/block/${row.blockHash}`} target="_blank" rel="noreferrer">
            {row.blockHeight}
          </Link>
        </Typography>
      }
    },
    {
      title: "Tx Hash", field: "txHash", width: 150, render: (row) => {
        return <Typography noWrap>
          <Link href={`https://www.blockchain.com/btc/tx/${row.txHash}`} target="_blank" rel="noreferrer">
            {row.txHash}
          </Link>
        </Typography>
      }
    },
    {
      title: "Anchor hash", field: "outputHex", render: (row) => {
        const parsed = Buffer.from(row.outputHex, 'hex').toString()
        const anchorString = parsed.split('ion:')[1];
        return <Typography>
          {anchorString}
        </Typography>
      }
    }
  ];

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        <Paper variant="outlined" square style={{ width: '80%', height: `${window.innerHeight - 100}px`, margin: 'auto', marginTop: '20px', overflow: 'scroll' }}>
          <MaterialTable columns={columns} data={transactions} options={{
            pageSize: 10,
            search: false,
            tableLayout: 'fixed',
            paging: false,
          }} title="ION Block explorer" />
        </Paper>
        <Fab variant="extended" className={classes.fab} onClick={async () => {
          const earliestTransaction = transactions[transactions.length - 1];
          const newTransactions = await fetch(`https://ion-block-explorer-api.gjgd.xyz/transactions?before=${earliestTransaction.blockHeight}`).then(res => res.json());
          setTransactions([...transactions, ...newTransactions])
        }}>
          Load more
        </Fab>
      </div>
    </>
  );
}
