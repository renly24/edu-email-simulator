"use client";
import { type ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ReplayIcon from "@mui/icons-material/Replay";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { DNS_COLOR, ERROR_COLOR, HANAKO, RECV, SAFE_COLOR, SMTP_COLOR, TARO } from "@/lib/model";

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

// ---------- 第1章：郵便とメール ----------

const POSTAL: { post: string; mail: string }[] = [
  { post: "📮 ポスト", mail: "📤 自分のメールサーバ" },
  { post: "🏤 郵便局", mail: "🖥️ メールサーバ" },
  { post: "📫 相手の郵便受け", mail: "📬 メールボックス" },
  { post: "🏠 住所", mail: "ドメイン名（@ の右側）" },
  { post: "✍️ 宛名", mail: "ユーザ名（@ の左側）" },
];

function Person({ icon, name, address }: { icon: string; name: string; address: string }) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 0 }}>
      <Typography sx={{ fontSize: "2.4rem", lineHeight: 1.1 }}>{icon}</Typography>
      <Typography fontWeight={700}>{name}</Typography>
      <Typography variant="caption" sx={{ ...mono, color: "text.secondary", wordBreak: "break-all" }}>
        {address}
      </Typography>
    </Box>
  );
}

export function IntroStage() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Person icon="🧑‍💻" name={TARO.name} address={TARO.address} />
        <Stack alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "1.6rem" }}>✉️ → 🖥️ → 🖥️ → ✉️</Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            メールサーバをリレーして届く
          </Typography>
        </Stack>
        <Person icon="👩‍🎓" name={HANAKO.name} address={HANAKO.address} />
      </Stack>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& td, & th": { border: "1px solid #cfd8dc", p: 0.75, fontSize: "0.9rem" } }}>
        <thead>
          <tr>
            <Box component="th" sx={{ bgcolor: "#eceff1" }}>
              手紙（郵便）
            </Box>
            <Box component="th" sx={{ bgcolor: "#e3f2fd", color: SMTP_COLOR }}>
              電子メール
            </Box>
          </tr>
        </thead>
        <tbody>
          {POSTAL.map((r) => (
            <tr key={r.post}>
              <td>{r.post}</td>
              <Box component="td" sx={{ fontWeight: 700 }}>
                {r.mail}
              </Box>
            </tr>
          ))}
        </tbody>
      </Box>
    </Stack>
  );
}

// ---------- 予想問題の場面 ----------

function Device({ icon, name, note, dim, children }: { icon: string; name: string; note?: string; dim?: boolean; children?: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 1, textAlign: "center", opacity: dim ? 0.6 : 1, borderWidth: 2 }}>
      <Typography sx={{ fontSize: "2rem", lineHeight: 1.2 }}>{icon}</Typography>
      <Typography fontWeight={700} sx={{ fontSize: "0.9rem" }}>
        {name}
      </Typography>
      {note && (
        <Typography variant="caption" color="text.secondary" display="block">
          {note}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

export function SceneStage({ id }: { id: "offline" | "pop" }) {
  if (id === "offline") {
    return (
      <Stack spacing={1.5} alignItems="stretch">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: 1 }}>
          <Device icon="💻" name="たろうのPC" note="「送信」を押す" />
          <Typography sx={{ fontSize: "1.4rem" }}>→</Typography>
          <Device icon="🖥️" name="メールサーバ" note="？" />
          <Typography sx={{ fontSize: "1.4rem" }}>→</Typography>
          <Device icon="📱" name="はなこのスマホ" note="💤 電源オフ" dim />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          メールはどこへ行く？
        </Typography>
      </Stack>
    );
  }
  return (
    <Stack spacing={1.5}>
      <Device icon="📥" name="はなこのメールボックス（サーバ）" note="❓ 受信したあと、サーバのメールは？" />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <Device icon="💻" name="家のパソコン" note="① POP で受信した">
          <Typography sx={{ mt: 0.5 }}>✉️ ✉️ ✉️</Typography>
        </Device>
        <Device icon="📱" name="スマホ" note="② あとで受信すると…？">
          <Typography sx={{ mt: 0.5, fontSize: "1.4rem" }}>❓</Typography>
        </Device>
      </Box>
    </Stack>
  );
}

// ---------- メールアドレスの部分 ----------

const ADDRESS_PARTS = [
  { text: "hanako", name: "ユーザ名", color: RECV.pop.color, note: "サーバの中の、だれのメールボックスかを表す「宛名」。同じドメインの中では重ならないように決められます。" },
  { text: "@", name: "アットマーク", color: "#455a64", note: "ユーザ名とドメイン名の区切り。英語の at（〜にいる）の意味で、「example.ed.jp にいる hanako」と読めます。" },
  {
    text: "example.ed.jp",
    name: "ドメイン名",
    color: SMTP_COLOR,
    note: "どの組織のメールサーバに届けるかを表す「住所」。右から jp（日本）→ ed（小・中学校、高等学校）→ example（組織名）と読みます。くわしくは次のスライドで。",
  },
];

export function AddressStage() {
  const [picked, setPicked] = useState<number | null>(null);
  const part = picked === null ? null : ADDRESS_PARTS[picked];
  return (
    <Stack spacing={2} alignItems="center">
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end" }}>
        {ADDRESS_PARTS.map((p, i) => (
          <Box
            key={p.text}
            component="button"
            type="button"
            onClick={() => setPicked(i)}
            sx={{
              ...mono,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              fontWeight: 700,
              border: 0,
              borderBottom: `5px solid ${p.color}`,
              bgcolor: picked === i ? `${p.color}22` : "transparent",
              color: p.color,
              px: 0.5,
              cursor: "pointer",
              borderRadius: "6px 6px 0 0",
              "&:hover": { bgcolor: `${p.color}18` },
            }}
          >
            {p.text}
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
        {ADDRESS_PARTS.map((p, i) => (
          <Chip
            key={p.name}
            label={p.name}
            onClick={() => setPicked(i)}
            sx={{ fontWeight: 700, color: picked === i ? "#fff" : p.color, bgcolor: picked === i ? p.color : "transparent", border: `2px solid ${p.color}` }}
          />
        ))}
      </Stack>
      <Paper variant="outlined" sx={{ p: 1.5, minHeight: 96, width: "100%", borderColor: part?.color ?? "#cfd8dc", borderWidth: 2 }}>
        {part ? (
          <>
            <Typography fontWeight={700} sx={{ color: part.color }}>
              {part.name}：
              <Box component="span" sx={mono}>
                {part.text}
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              {part.note}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            アドレスの色のついた部分をクリックしよう。
          </Typography>
        )}
      </Paper>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, width: "100%" }}>
        {[
          { a: "hanako@example.ed.jp", n: "はなこ" },
          { a: "jiro@example.ed.jp", n: "じろう（はなこと同じ学校）" },
        ].map((x) => (
          <Paper key={x.a} variant="outlined" sx={{ p: 1, textAlign: "center" }}>
            <Typography variant="body2" sx={{ ...mono, fontWeight: 700, wordBreak: "break-all" }}>
              {x.a}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {x.n}
            </Typography>
          </Paper>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        ドメイン名が同じ2人のメールは、同じメールサーバの別々のメールボックスに届きます。
      </Typography>
    </Stack>
  );
}

// ---------- ドメイン名のしくみ（教科書の図3・表1） ----------

const URL_PARTS: { text: string; name?: string; color?: string }[] = [
  { text: "https", name: "スキーム名", color: "#f9a825" },
  { text: "://" },
  { text: "www", name: "ホスト名", color: "#283593" },
  { text: "." },
  { text: "example", name: "組織名", color: "#2e7d32" },
  { text: "." },
  { text: "ed", name: "組織種別", color: "#0097a7" },
  { text: "." },
  { text: "jp", name: "トップレベル\nドメイン", color: "#8e5bb5" },
  { text: "/" },
  { text: "index.html", name: "ファイル名", color: "#d81b60" },
];

const MAIL_PARTS: { text: string; name?: string; color?: string }[] = [
  { text: "hanako", name: "ユーザ名", color: RECV.pop.color },
  { text: "@" },
  { text: "example", name: "組織名", color: "#2e7d32" },
  { text: "." },
  { text: "ed", name: "組織種別", color: "#0097a7" },
  { text: "." },
  { text: "jp", name: "トップレベル\nドメイン", color: "#8e5bb5" },
];

const JP_DOMAINS: { type: string; who: string }[] = [
  { type: "co.jp", who: "会社など" },
  { type: "or.jp", who: "法人組織など" },
  { type: "ne.jp", who: "ネットワークサービス提供者" },
  { type: "ac.jp", who: "大学など" },
  { type: "ed.jp", who: "小・中学校、高等学校など" },
  { type: "go.jp", who: "政府機関" },
  { type: "gr.jp", who: "個人や法人の任意団体" },
  { type: "lg.jp", who: "地方公共団体など" },
];

function Parts({ parts, label }: { parts: typeof URL_PARTS; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
      <Typography fontWeight={700} sx={{ width: 64, pt: 0.5, flexShrink: 0, fontSize: "0.85rem" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", minWidth: 0 }}>
        {parts.map((p, i) => (
          <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography sx={{ ...mono, fontWeight: 700, fontSize: { xs: "0.85rem", sm: "1.05rem" }, borderBottom: p.color ? `3px solid ${p.color}` : "3px solid transparent", px: 0.2 }}>
              {p.text}
            </Typography>
            {p.name && (
              <Box sx={{ mt: 0.5, px: 0.75, borderRadius: 3, bgcolor: p.color, color: "#fff", fontSize: "0.6rem", fontWeight: 700, whiteSpace: "pre", textAlign: "center", lineHeight: 1.3 }}>
                {p.name}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function DomainStage() {
  const [picked, setPicked] = useState<string | null>(null);
  const hit = JP_DOMAINS.find((d) => d.type === picked);
  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={{ p: 1.25, display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Parts parts={URL_PARTS} label="URL" />
        <Parts parts={MAIL_PARTS} label="メール" />
        <Typography variant="caption" color="text.secondary">
          Web ページの URL も、メールアドレスも、同じドメイン名「example.ed.jp」を使っています。
        </Typography>
      </Paper>
      <Box>
        <Typography variant="body2" fontWeight={700} mb={0.5}>
          JP ドメイン名の種類（クリックして確かめよう）
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 0.5 }}>
          {JP_DOMAINS.map((d) => (
            <Button key={d.type} size="small" variant={picked === d.type ? "contained" : "outlined"} onClick={() => setPicked(d.type)} sx={{ ...mono, textTransform: "none", fontWeight: 700 }}>
              {d.type}
            </Button>
          ))}
        </Box>
        <Paper variant="outlined" sx={{ mt: 1, p: 1, minHeight: 48, borderColor: hit ? "#0097a7" : "#cfd8dc" }}>
          {hit ? (
            <Typography variant="body2" fontWeight={700}>
              <Box component="span" sx={{ ...mono, color: "#0097a7" }}>
                ○○.{hit.type}
              </Box>
              ：{hit.who}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              ドメイン名を見ると、どんな組織のものかがわかります。
            </Typography>
          )}
        </Paper>
        <Typography variant="caption" color="text.secondary">
          このほか、都道府県や市区町村の名前を使う「地域型」（例：tokyo.jp）もあります。ドメイン名の表記は、原則として大文字・小文字を区別しません。
        </Typography>
      </Box>
    </Stack>
  );
}

// ---------- 電子メールのしくみ（教科書の図4） ----------

const FIGURE_STEPS: { no: string; text: string; tag: string; color: string }[] = [
  { no: "1", text: "送信者は、メールソフトなどで自分のメールサーバにメールを送信する。", tag: "SMTP", color: SMTP_COLOR },
  { no: "2", text: "メールサーバは、DNS サーバの返答をもとに、届け先のメールサーバにメールを転送する。", tag: "SMTP・DNS", color: SMTP_COLOR },
  { no: "3", text: "届け先のメールサーバは、受け取ったメールをメールボックスに保存する。", tag: "保存", color: "#7e57c2" },
  { no: "4", text: "受信者は、メールサーバからメールを読む。", tag: "POP・IMAP", color: RECV.pop.color },
];

const FIGURE_FLOW: { icon?: string; label: string }[] = [
  { icon: "🧑‍💻", label: "送信者" },
  { label: "①→" },
  { icon: "🖥️", label: "メールサーバ" },
  { label: "②→" },
  { icon: "🖥️📬", label: "メールサーバ\n③ 保存" },
  { label: "④→" },
  { icon: "👩‍🎓", label: "受信者" },
];

export function FigureStage() {
  return (
    <Stack spacing={1.25}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 0.5, textAlign: "center" }}>
        {FIGURE_FLOW.map((f, i) =>
          f.icon ? (
            <Stack key={i} alignItems="center" sx={{ minWidth: 64 }}>
              <Typography sx={{ fontSize: "1.7rem", lineHeight: 1.2 }}>{f.icon}</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.3, whiteSpace: "pre-line" }}>
                {f.label}
              </Typography>
            </Stack>
          ) : (
            <Typography key={i} fontWeight={700} sx={{ color: "#7e57c2" }}>
              {f.label}
            </Typography>
          ),
        )}
      </Box>
      <Stack spacing={0.75} sx={{ bgcolor: "#f3eef9", borderRadius: 2, p: 1.25 }}>
        {FIGURE_STEPS.map((f) => (
          <Stack key={f.no} direction="row" spacing={1} alignItems="flex-start">
            <Box sx={{ width: 22, height: 22, flexShrink: 0, borderRadius: 0.5, bgcolor: "#7e57c2", color: "#fff", fontWeight: 700, fontSize: "0.8rem", display: "grid", placeItems: "center" }}>
              {f.no}
            </Box>
            <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.6 }}>
              {f.text}
            </Typography>
            <Chip size="small" label={f.tag} sx={{ height: 20, fontWeight: 700, color: "#fff", bgcolor: f.color }} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

// ---------- SMTP の会話 ----------

const SMTP_TALK: { from: "c" | "s"; cmd: string; ja: string }[] = [
  { from: "s", cmd: "220 mail.example.ed.jp", ja: "はい、example.ed.jp のメールサーバです" },
  { from: "c", cmd: "HELO smtp.example.ne.jp", ja: "こんにちは。example.ne.jp のメールサーバです" },
  { from: "s", cmd: "250 OK", ja: "どうぞ" },
  { from: "c", cmd: "MAIL FROM:<taro@example.ne.jp>", ja: "差出人は taro です" },
  { from: "s", cmd: "250 OK", ja: "わかりました" },
  { from: "c", cmd: "RCPT TO:<hanako@example.ed.jp>", ja: "宛先は hanako です" },
  { from: "s", cmd: "250 OK", ja: "hanako さんはいます" },
  { from: "c", cmd: "DATA", ja: "メールの中身を送ります" },
  { from: "s", cmd: "354 Start mail input", ja: "どうぞ。最後は「.」だけの行で" },
  { from: "c", cmd: "Subject: 明日の部活 ↵ ↵ 明日は体育館に集合です。 ↵ .", ja: "ヘッダ・空行・本文、最後に「.」" },
  { from: "s", cmd: "250 OK", ja: "受け取りました" },
  { from: "c", cmd: "QUIT", ja: "おしまいです" },
  { from: "s", cmd: "221 Bye", ja: "さようなら" },
];

export function SmtpStage() {
  const [count, setCount] = useState(1);
  const done = count === SMTP_TALK.length;
  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between">
        <Chip label="📤 たろう側のメールサーバ" sx={{ fontWeight: 700, bgcolor: "#e3f2fd", color: SMTP_COLOR }} />
        <Chip label="📥 はなこ側のメールサーバ" sx={{ fontWeight: 700, bgcolor: "#fff3e0", color: RECV.pop.color }} />
      </Stack>
      <Stack spacing={0.5}>
        {SMTP_TALK.slice(0, count).map((m, i) => {
          const client = m.from === "c";
          return (
            <Box key={i} sx={{ display: "flex", justifyContent: client ? "flex-start" : "flex-end" }}>
              <Box
                sx={{
                  maxWidth: "80%",
                  px: 1,
                  py: 0.25,
                  borderRadius: 2,
                  border: 2,
                  borderColor: client ? SMTP_COLOR : RECV.pop.color,
                  bgcolor: client ? "#e3f2fd" : "#fff3e0",
                  animation: i === count - 1 ? "fadeIn 0.3s ease-out" : undefined,
                  "@keyframes fadeIn": { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } },
                }}
              >
                <Typography sx={{ ...mono, fontSize: "0.8rem", fontWeight: 700, wordBreak: "break-all", lineHeight: 1.4 }}>{m.cmd}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.3 }}>
                  {m.ja}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={0.75}>
        <Button size="small" variant="contained" endIcon={<NavigateNextIcon />} disabled={done} onClick={() => setCount(count + 1)}>
          次のやりとり
        </Button>
        {done ? (
          <Button size="small" startIcon={<ReplayIcon />} onClick={() => setCount(1)}>
            最初から
          </Button>
        ) : (
          <Button size="small" onClick={() => setCount(SMTP_TALK.length)}>
            すべて表示
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

// ---------- DNS の問い合わせ ----------

const MX_TABLE = [
  { domain: "example.ne.jp", server: "smtp.example.ne.jp", ip: "198.51.100.10" },
  { domain: "example.ed.jp", server: "mail.example.ed.jp", ip: "192.0.2.25" },
  { domain: "example.go.jp", server: "mx.example.go.jp", ip: "203.0.113.7" },
];

const DNS_QUERIES = ["hanako@example.ed.jp", "hanaco@example.ed.jp", "hanako@exmaple.ed.jp", "info@example.go.jp"];

export function DnsStage() {
  const [query, setQuery] = useState<string | null>(null);
  const domain = query?.split("@")[1];
  const hit = MX_TABLE.find((r) => r.domain === domain);
  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" fontWeight={700}>
        宛先を選んで DNS に問い合わせる
      </Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {DNS_QUERIES.map((q) => (
          <Button key={q} size="small" variant={query === q ? "contained" : "outlined"} onClick={() => setQuery(q)} sx={{ ...mono, textTransform: "none", fontWeight: 700 }}>
            {q}
          </Button>
        ))}
      </Stack>
      {query && (
        <Paper key={query} variant="outlined" sx={{ p: 1, borderColor: DNS_COLOR, bgcolor: "#f3e5f5" }}>
          <Typography variant="body2" fontWeight={700}>
            📤 自分のメールサーバ：「
            <Box component="span" sx={{ ...mono, color: DNS_COLOR }}>
              {domain}
            </Box>{" "}
            のメールサーバはどこ？」
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5, color: hit ? DNS_COLOR : ERROR_COLOR }}>
            📖 DNS サーバ：
            {hit ? (
              <>
                「
                <Box component="span" sx={mono}>
                  {hit.server}
                </Box>
                （{hit.ip}）だよ」
              </>
            ) : (
              "「そんなドメイン名は見つからないよ」"
            )}
          </Typography>
        </Paper>
      )}
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& td, & th": { border: "1px solid #cfd8dc", p: 0.6, fontSize: "0.8rem" }, "& td": mono }}>
        <caption style={{ captionSide: "top", textAlign: "left", fontWeight: 700, paddingBottom: 4 }}>📖 DNS の電話帳（MX レコード）</caption>
        <thead>
          <Box component="tr" sx={{ bgcolor: "#f3e5f5" }}>
            <th>ドメイン名</th>
            <th>メールサーバ</th>
            <th>IP アドレス</th>
          </Box>
        </thead>
        <tbody>
          {MX_TABLE.map((r) => (
            <Box component="tr" key={r.domain} sx={{ bgcolor: hit === r ? "#fff59d" : undefined, transition: "background-color 0.3s" }}>
              <td>{r.domain}</td>
              <td>{r.server}</td>
              <td>{r.ip}</td>
            </Box>
          ))}
        </tbody>
      </Box>
      {query && hit && query.startsWith("hanaco") && (
        <Typography variant="caption" color="text.secondary">
          DNS が調べるのは @ より右側だけ。ユーザ名のまちがい（hanaco）には、DNS は気づけません。
        </Typography>
      )}
    </Stack>
  );
}

// ---------- メールのソース ----------

const SOURCE_LINES: { text: string; name?: string; note?: string; body?: boolean }[] = [
  {
    text: "Received: from smtp.example.ne.jp by mail.example.ed.jp; Sat, 10 Oct 2026 18:30:05 +0900",
    name: "Received（経由の記録）",
    note: "メールを受け取ったサーバが、上に1行ずつ書き足していきます。下から上へ読むと、メールがたどった道すじがわかります。これは「はなこのサーバが alpha のたろうのメールサーバから受け取った」記録です。",
  },
  {
    text: "Received: from [192.168.1.20] by smtp.example.ne.jp; Sat, 10 Oct 2026 18:30:04 +0900",
    name: "Received（経由の記録）",
    note: "いちばん下の Received は、最初の区間の記録です。たろうのパソコンから、たろう側のメールサーバ（smtp.example.ne.jp）が受け取りました。",
  },
  { text: "From: たろう <taro@example.ne.jp>", name: "From（差出人）", note: "差出人の名前とアドレス。メールソフトで自由に書けてしまうので、なりすましに使われることがあります。" },
  { text: "To: はなこ <hanako@example.ed.jp>", name: "To（宛先）", note: "宛先。複数の人に送るときは「,」で区切って並べます。" },
  { text: "Cc: じろう <jiro@example.ed.jp>", name: "Cc（写し）", note: "写しを送る相手。To と同じように、受け取った全員に見えます。BCC はここには書かれません。" },
  { text: "Subject: 明日の部活", name: "Subject（件名）", note: "件名。日本語は、送るときに英数字の記号に変換して書かれています（ここでは読みやすく表示）。" },
  { text: "Date: Sat, 10 Oct 2026 18:30:00 +0900", name: "Date（日時）", note: "メールを作った日時。+0900 は日本時間（世界標準時より9時間進んでいる）という意味です。" },
  {
    text: "Message-ID: <20261010183000.1234@example.ne.jp>",
    name: "Message-ID",
    note: "メール1通ごとに付けられる、世界で1つだけの番号。返信のときに、どのメールへの返事かを結びつけるのに使います。",
  },
  {
    text: "Content-Type: text/plain; charset=UTF-8",
    name: "Content-Type（中身の種類）",
    note: "本文の種類と文字コード。text/plain は文字だけのメール、添付ファイルがあると multipart/mixed になります。",
  },
  { text: "", name: "空行（区切り）", note: "ヘッダと本文の区切り。この空の行より上がヘッダ、下が本文です。" },
  { text: "はなこさん", body: true },
  { text: "明日の部活は体育館に 9 時集合です。", body: true },
  { text: "たろう", body: true },
];

export function SourceStage() {
  const [view, setView] = useState<"app" | "source">("source");
  const [picked, setPicked] = useState<number | null>(null);
  const line = picked === null ? null : SOURCE_LINES[picked];
  const blank = SOURCE_LINES.findIndex((l) => l.text === "");
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={0.75}>
        <Button size="small" variant={view === "app" ? "contained" : "outlined"} onClick={() => setView("app")}>
          メールソフトの画面
        </Button>
        <Button size="small" variant={view === "source" ? "contained" : "outlined"} onClick={() => setView("source")}>
          ソース（中身そのもの）
        </Button>
      </Stack>
      {view === "app" ? (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography fontWeight={700} sx={{ fontSize: "1.1rem" }}>
            明日の部活
          </Typography>
          <Typography variant="body2" color="text.secondary">
            差出人：たろう　宛先：はなこ　CC：じろう
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            2026年10月10日 18:30
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
            {SOURCE_LINES.filter((l) => l.body)
              .map((l) => l.text)
              .join("\n")}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ border: "1px solid #cfd8dc", borderRadius: 2, overflow: "hidden", bgcolor: "#263238" }}>
          {SOURCE_LINES.map((l, i) => {
            const header = i < blank;
            return (
              <Box
                key={i}
                component={l.name ? "button" : "div"}
                type={l.name ? "button" : undefined}
                onClick={l.name ? () => setPicked(i) : undefined}
                sx={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  border: 0,
                  borderLeft: `5px solid ${header ? SMTP_COLOR : i === blank ? "#ffeb3b" : SAFE_COLOR}`,
                  ...mono,
                  fontSize: "0.75rem",
                  lineHeight: 1.6,
                  px: 1,
                  minHeight: 20,
                  color: header ? "#bbdefb" : "#e8f5e9",
                  bgcolor: picked === i ? "#455a64" : i === blank ? "#37474f" : "transparent",
                  cursor: l.name ? "pointer" : "default",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  "&:hover": l.name ? { bgcolor: "#37474f" } : undefined,
                }}
              >
                {l.text || "（空行）"}
              </Box>
            );
          })}
        </Box>
      )}
      <Paper variant="outlined" sx={{ p: 1, minHeight: 72, borderColor: line ? SMTP_COLOR : "#cfd8dc" }}>
        {line ? (
          <>
            <Typography variant="body2" fontWeight={700} sx={{ color: SMTP_COLOR }}>
              {line.name}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              {line.note}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {view === "source" ? "青い線の行（ヘッダ）や空行をクリックすると説明が出ます。緑の線の行が本文です。" : "「ソース」に切りかえて、画面の裏の中身を見てみよう。"}
          </Typography>
        )}
      </Paper>
    </Stack>
  );
}

// ---------- 添付ファイル ----------

const BASE64_SAMPLE =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL";

export function AttachmentStage() {
  const [encoded, setEncoded] = useState(false);
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1.4fr" }, gap: 1.5, alignItems: "center" }}>
        <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", borderWidth: 2 }}>
          <Typography sx={{ fontSize: "3.5rem", lineHeight: 1.1 }}>🐱</Typography>
          <Typography variant="body2" sx={{ ...mono, fontWeight: 700 }}>
            neko.jpg
          </Typography>
          <Typography variant="caption" color="text.secondary">
            写真（画像のデータ）　300 KB
          </Typography>
        </Paper>
        <Stack alignItems="center" spacing={0.5}>
          <Button variant="contained" size="small" onClick={() => setEncoded(!encoded)} endIcon={encoded ? <ReplayIcon /> : <NavigateNextIcon />}>
            {encoded ? "もどす" : "文字に変換"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Base64
          </Typography>
        </Stack>
        <Paper variant="outlined" sx={{ p: 1, minHeight: 150, borderWidth: 2, borderColor: encoded ? SAFE_COLOR : "#cfd8dc", bgcolor: encoded ? "#f1f8e9" : "#fafafa" }}>
          {encoded ? (
            <>
              <Typography variant="caption" sx={{ ...mono, display: "block", color: "text.secondary" }}>
                Content-Type: image/jpeg; name=&quot;neko.jpg&quot;
                <br />
                Content-Transfer-Encoding: base64
              </Typography>
              <Typography
                sx={{ ...mono, fontSize: "0.7rem", wordBreak: "break-all", lineHeight: 1.4, mt: 0.5, animation: "fadeIn 0.5s", "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } } }}
              >
                {BASE64_SAMPLE}…
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: SAFE_COLOR, mt: 0.5 }}>
                英数字と「+」「/」だけの文字列　約 400 KB
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              画像のデータは、文字ではない 0 と 1 の並び。メールの本文にはそのまま入れられません。
            </Typography>
          )}
        </Paper>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1, alignItems: "center" }}>
        <Typography variant="caption" fontWeight={700}>
          元の大きさ
        </Typography>
        <Box sx={{ height: 14, width: "75%", bgcolor: "#90a4ae", borderRadius: 1 }} />
        <Typography variant="caption" fontWeight={700}>
          変換後
        </Typography>
        <Box sx={{ height: 14, width: encoded ? "100%" : "75%", bgcolor: encoded ? SAFE_COLOR : "#cfd8dc", borderRadius: 1, transition: "width 0.6s, background-color 0.6s" }} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        3 バイトのデータを 4 文字で表すので、約 4/3 ≒ 1.33 倍になります。メールサーバによっては、送れるメールの大きさに上限があります。
      </Typography>
    </Stack>
  );
}

// ---------- 暗号化 ----------

const PLAIN = ["USER hanako", "PASS neko1234", "Subject: 明日の部活", "明日は体育館に 9 時集合です。"];
const CIPHER = ["Xÿ#9qL@x!7Vz…", "ß2&Kp0~^tR%e…", "Ω8$wQ#n1Lc{]…", "k%9]Zt@4!pX^Ae…"];

export function EncryptStage() {
  const [tls, setTls] = useState(false);
  const color = tls ? SAFE_COLOR : ERROR_COLOR;
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={0.75}>
        <Button variant={!tls ? "contained" : "outlined"} color="error" onClick={() => setTls(false)}>
          🔓 暗号化なし
        </Button>
        <Button variant={tls ? "contained" : "outlined"} color="success" onClick={() => setTls(true)}>
          🔒 暗号化あり（SSL/TLS）
        </Button>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 1 }}>
        <Stack alignItems="center">
          <Typography sx={{ fontSize: "2rem" }}>📱</Typography>
          <Typography variant="caption" fontWeight={700}>
            はなこ
          </Typography>
        </Stack>
        <Box sx={{ position: "relative", height: 56 }}>
          <Box sx={{ position: "absolute", top: 22, left: 0, right: 0, height: 10, borderRadius: 5, bgcolor: color, opacity: 0.85, transition: "background-color 0.3s" }} />
          <Typography sx={{ position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)", fontSize: "1.4rem", bgcolor: "#fff", px: 0.5, borderRadius: 2 }}>{tls ? "🔒" : "✉️"}</Typography>
        </Box>
        <Stack alignItems="center">
          <Typography sx={{ fontSize: "2rem" }}>📥</Typography>
          <Typography variant="caption" fontWeight={700}>
            メールサーバ
          </Typography>
        </Stack>
      </Box>
      <Paper variant="outlined" sx={{ p: 1.25, borderWidth: 2, borderColor: color, bgcolor: tls ? "#f1f8e9" : "#ffebee" }}>
        <Typography fontWeight={700} mb={0.5}>
          🕵️ 途中で盗み見た人の画面
        </Typography>
        <Box sx={{ bgcolor: "#263238", color: tls ? "#a5d6a7" : "#ffcdd2", borderRadius: 1, p: 1, ...mono, fontSize: "0.8rem", lineHeight: 1.7 }}>
          {(tls ? CIPHER : PLAIN).map((l, i) => (
            <div key={`${tls}-${i}`}>{l}</div>
          ))}
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ color, mt: 0.75 }}>
          {tls ? "暗号化されているので、パスワードも本文も読めない！" : "パスワードも本文も、そのまま読まれてしまう…"}
        </Typography>
      </Paper>
      <Typography variant="caption" color="text.secondary">
        サーバの間の区間も、それぞれのサーバが対応していれば暗号化されます。送る人と受け取る人だけが読めるように本文そのものを暗号化する方法（S/MIME など）もあります。
      </Typography>
    </Stack>
  );
}

// ---------- まとめの表 ----------

const TABLE_ROWS: { label: string; smtp: string; pop: string; imap: string }[] = [
  { label: "役割", smtp: "メールを送る・転送する", pop: "メールを受け取る", imap: "メールを受け取る" },
  { label: "使う区間", smtp: "端末 → メールサーバ\nサーバ → サーバ", pop: "サーバ → 端末", imap: "サーバ ⇄ 端末" },
  { label: "受信後のメール", smtp: "―", pop: "端末に移る\n（サーバから消える）", imap: "サーバに残る" },
  { label: "複数の端末", smtp: "―", pop: "向いていない", imap: "向いている\n（既読もそろう）" },
  { label: "ポート番号", smtp: "25・587\n（暗号化 465）", pop: "110\n（暗号化 995）", imap: "143\n（暗号化 993）" },
];

export function ProtocolTable() {
  const head = [
    { name: "SMTP", color: SMTP_COLOR },
    { name: "POP", color: RECV.pop.color },
    { name: "IMAP", color: RECV.imap.color },
  ];
  return (
    <Stack spacing={1}>
      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", "& td, & th": { border: "1px solid #cfd8dc", p: 0.75, fontSize: "0.85rem", whiteSpace: "pre-line", textAlign: "center" } }}
      >
        <thead>
          <tr>
            <th />
            {head.map((h) => (
              <Box component="th" key={h.name} sx={{ bgcolor: h.color, color: "#fff" }}>
                {h.name}
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((r) => (
            <tr key={r.label}>
              <Box component="th" sx={{ bgcolor: "#eceff1" }}>
                {r.label}
              </Box>
              <td>{r.smtp}</td>
              <td>{r.pop}</td>
              <td>{r.imap}</td>
            </tr>
          ))}
        </tbody>
      </Box>
      <Paper variant="outlined" sx={{ p: 1, borderColor: DNS_COLOR, bgcolor: "#f3e5f5" }}>
        <Typography variant="body2" fontWeight={700}>
          📖 DNS：宛先の @ より右側（ドメイン名）から、届け先のメールサーバ（MX レコード）を調べる
        </Typography>
      </Paper>
    </Stack>
  );
}
