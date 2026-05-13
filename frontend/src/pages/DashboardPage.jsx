import { Box, Card, CardContent, Typography } from "@mui/material";

export function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Panel principal
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6">Bienvenido a NexusFlow</Typography>
          <Typography color="text.secondary">
            Gestiona tableros, tareas, equipo y colaboración en tiempo real.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
