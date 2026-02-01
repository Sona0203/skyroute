import { Alert } from "@mui/material";

export default function ErrorState({ message }: { message: string }) {
  return <Alert severity="error">{message}</Alert>;
}
