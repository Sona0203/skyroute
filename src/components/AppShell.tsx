import { Box, Container } from "@mui/material";
import React from "react";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header title="SkyRoute" />

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Container>

    </Box>
  );
}
