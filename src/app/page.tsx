import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SlideDeck from "@/components/SlideDeck";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: { xs: 1.5, sm: 2 } }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={1.5}>
          <Typography variant="h5" component="h1" fontWeight={700} sx={{ fontSize: { xs: "1.3rem", sm: "1.6rem" } }}>
            ✉️ 電子メールのしくみ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            送信ボタンを押してから相手に届くまで、メールはどこを通る？ サーバのリレーを1ステップずつ見ながら、問題を解いて確かめよう
          </Typography>
        </Box>
        <SlideDeck />
      </Container>
    </Box>
  );
}
