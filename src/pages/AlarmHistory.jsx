import { useEffect, useState } from "react";
import api from "../api";

import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

export default function AlarmHistory() {
  const [alarms, setAlarms] = useState([]);

  const loadData = async () => {
    const res = await api.get("/api/alarm/history");

    setAlarms(res.data.data);
  };

  useEffect(() => {
    const init = async () => {
      await loadData();
    };

    init();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Alarm History
      </Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>

              <TableCell>Device</TableCell>

              <TableCell>Type</TableCell>

              <TableCell>Message</TableCell>

              <TableCell>Status</TableCell>

              <TableCell>ACK By</TableCell>

              <TableCell>ACK At</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {alarms.map((a) => (
              <TableRow key={a.alarm_id}>
                <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>

                <TableCell>{a.device_id}</TableCell>

                <TableCell>{a.alarm_type}</TableCell>

                <TableCell>{a.alarm_message}</TableCell>

                <TableCell>{a.alarm_status}</TableCell>

                <TableCell>{a.ack_by || "-"}</TableCell>

                <TableCell>
                  {a.ack_at ? new Date(a.ack_at).toLocaleString() : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
