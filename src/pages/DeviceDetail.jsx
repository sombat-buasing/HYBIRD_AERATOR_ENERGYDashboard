import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@mui/material";

import { API_URL } from "../config";

// import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PowerChart from "../components/PowerChart";

const KPI = ({ title, value, unit, color = "#ffffff" }) => (
  <Card
    sx={{
      width: 220,
      height: 145,
      bgcolor: color,
      transition: "0.2s",

      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: 6,
      },
    }}
  >
    <CardContent>
      <Typography
        align="center"
        variant="h6"
        sx={{
          fontWeight: "",
        }}
      >
        {title}
      </Typography>

      <Typography
        align="center"
        sx={{
          fontSize: "2.5rem",
          fontWeight: "",
          mt: 1,
        }}
      >
        {value}
      </Typography>

      <Typography
        align="center"
        sx={{
          mt: 1,
        }}
      >
        {unit}
      </Typography>
    </CardContent>
  </Card>
);

function DeviceDetail() {
  console.log("DEVICE DETAIL LOADED");
  const navigate = useNavigate();
  const { deviceId } = useParams();
  console.log("Device Detail ID:", deviceId);

  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const loadAlarms = async () => {
    if (!deviceId) return;

    try {
      const res = await axios.get(`${API_URL}/api/alarm/device/${deviceId}`);

      setAlarms(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    if (!deviceId) return;

    try {
      const res = await axios.get(`${API_URL}/api/history/${deviceId}`);

      setHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDevice = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/current`);
      console.log("loadDevice START");

      const row = res.data.data.find((d) => d.device_id === deviceId);

      console.log("Found Device:", row);

      setDevice(row);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log("USE EFFECT RUN");

    loadDevice();
    loadHistory();
    loadAlarms();

    const timer = setInterval(() => {
      loadDevice();
      loadHistory();
      loadAlarms();
    }, 5000);

    return () => clearInterval(timer);
  }, [deviceId]);

  if (!device) {
    return (
      <Container>
        <h1>Loading...</h1>
      </Container>
    );
  }

  const diffMinutes =
    Math.abs(new Date().getTime() - new Date(device.last_update).getTime()) /
    1000 /
    60;

  const online = diffMinutes < 5;
  const lastUpdate = new Date(device.last_update);

  const lastDate = lastUpdate.toLocaleDateString();

  const lastTime = lastUpdate.toLocaleTimeString();

  return (
    <Container maxWidth="xl">
      <Button variant="contained" onClick={() => navigate("/")} sx={{ mb: 3 }}>
        Back to Dashboard
      </Button>
      <Typography
        variant="h3"
        align="center"
        sx={{
          mb: 2,
          fontWeight: "",
        }}
      >
        Device Detail Dashboard
      </Typography>

      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 4,
          color: "#1976d2",
          fontWeight: "",
        }}
      >
        {deviceId}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Card sx={{ width: 220 }}>
          <CardContent>
            <Typography align="center">Voltage L1</Typography>

            <Typography variant="h3" align="center">
              {device.voltage_l1.toFixed(1)}
            </Typography>

            <Typography align="center">Volt</Typography>
          </CardContent>
        </Card>

        <Card sx={{ width: 220 }}>
          <CardContent>
            <Typography align="center">Voltage L2</Typography>

            <Typography variant="h3" align="center">
              {device.voltage_l2.toFixed(1)}
            </Typography>

            <Typography align="center">Volt</Typography>
          </CardContent>
        </Card>

        <Card sx={{ width: 220 }}>
          <CardContent>
            <Typography align="center">Voltage L3</Typography>

            <Typography variant="h3" align="center">
              {device.voltage_l3.toFixed(1)}
            </Typography>

            <Typography align="center">Volt</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <KPI
          title="Current L1"
          value={Number(device.current_l1).toFixed(3)}
          unit="Amp"
          color="#e3f2fd"
        />

        <KPI
          title="Current L2"
          value={Number(device.current_l2).toFixed(3)}
          unit="Amp"
          color="#e3f2fd"
        />

        <KPI
          title="Current L3"
          value={Number(device.current_l3).toFixed(3)}
          unit="Amp"
          color="#e3f2fd"
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <KPI
          title="Power Total"
          value={Number(device.power_total).toFixed(3)}
          unit="kW"
          color="#e8f5e9"
        />

        <KPI
          title="PF Total"
          value={Number(device.pf_total).toFixed(3)}
          unit=""
          color="#fff3e0"
        />

        <KPI
          title="Frequency"
          value={Number(device.frequency).toFixed(2)}
          unit="Hz"
          color="#f3e5f5"
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <Card
          sx={{
            width: 320,
            bgcolor: "#fff8e1",
          }}
        >
          <CardContent>
            <Typography variant="h6" align="center">
              Total Energy
            </Typography>

            <Typography
              align="center"
              sx={{
                fontSize: "2.5rem",
                fontWeight: "",
              }}
            >
              {Number(device.energy_kwh).toLocaleString()}
            </Typography>

            <Typography align="center">kWh</Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            width: 220,
            bgcolor: online ? "#c8e6c9" : "#ffcdd2",
          }}
        >
          <CardContent>
            <Typography variant="h6" align="center">
              Device Status
            </Typography>

            <Typography
              align="center"
              sx={{
                fontSize: "2rem",
                fontWeight: "",
                mt: 2,
              }}
            >
              {online ? "🟢 ONLINE" : "🔴 OFFLINE"}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            width: 320,
            bgcolor: "#eceff1",
          }}
        >
          <CardContent>
            <Typography variant="h6" align="center">
              Last Update
            </Typography>

            <Typography align="center" variant="h5">
              {lastDate}
            </Typography>

            <Typography align="center" variant="h4">
              {lastTime}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card
        sx={{
          mt: 4,
          p: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Power Trend 24 Hours
        </Typography>

        <PowerChart history={history} />
      </Card>

      <Card sx={{ mt: 4, p: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Alarm History
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>

              <TableCell>Location</TableCell>

              <TableCell>Type</TableCell>

              <TableCell>Message</TableCell>

              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {alarms.map((row) => (
              <TableRow key={row.alarm_id}>
                <TableCell>
                  {new Date(row.created_at).toLocaleString()}
                </TableCell>

                <TableCell>{row.location_name}</TableCell>

                <TableCell>
                  <Chip
                    label={row.alarm_type}
                    color={row.alarm_type === "HIGH_POWER" ? "error" : "warning"}
                    size="small"
                  />
                </TableCell>

                <TableCell>{row.alarm_message}</TableCell>
                
                <TableCell>
                  <Chip
                    label={row.alarm_status}
                    color={row.alarm_status === "ACTIVE" ? "error" : "success"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
}

export default DeviceDetail;
