import { Box, Button, Typography } from "@mui/material";

export function NotFoundPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" color="primary">
          404
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Página no encontrada
        </Typography>

        <Button variant="contained" href="/dashboard">
          Volver al inicio
        </Button>
      </Box>
    </Box>
  );
}