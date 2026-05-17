import { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function formatDate(date) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function LiveClock() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Chip
      icon={<AccessTimeIcon />}
      label={formatDate(currentDate)}
      color="primary"
      variant="outlined"
      sx={{
        fontWeight: 700,
        borderRadius: 3,
      }}
    />
  );
}

