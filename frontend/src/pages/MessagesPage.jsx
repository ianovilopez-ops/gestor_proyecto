import { Box, Card, CardContent, Typography } from "@mui/material";

export function MessagesPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mensajes
      </Typography>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Módulo de mensajes pendiente.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
