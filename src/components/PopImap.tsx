"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ReplayIcon from "@mui/icons-material/Replay";
import { RECV, type RecvProto } from "@/lib/model";
import { Feedback } from "./Quizzes";

// ---------- POP と IMAP：サーバと端末のメールのようす ----------

interface Mail {
  id: number;
  subject: string;
  read: boolean;
}

type DeviceId = "pc" | "phone";

const DEVICE = {
  pc: { icon: "💻", name: "パソコン" },
  phone: { icon: "📱", name: "スマホ" },
} as const;

const FIRST_MAILS: Mail[] = [
  { id: 1, subject: "部活の連絡", read: false },
  { id: 2, subject: "宿題について", read: false },
  { id: 3, subject: "週末の予定", read: false },
];
/** サーバのメールボックスの容量（通） */
const CAPACITY = 5;
const NEW_SUBJECTS = ["文化祭の準備", "写真を送ります", "明日の時間割", "委員会のお知らせ"];

interface State {
  server: Mail[];
  /** 端末にあるメール（null はまだ一度も受信していない） */
  devices: Record<DeviceId, Mail[] | null>;
  log: string;
  next: number;
}

const initial = (): State => ({
  server: FIRST_MAILS,
  devices: { pc: null, phone: null },
  log: "サーバのメールボックスに 3 通届いています。「パソコンで受信」を押そう。",
  next: 4,
});

function MailList({ mails, onRead, empty }: { mails: Mail[]; onRead?: (id: number) => void; empty: string }) {
  if (mails.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", py: 0.5 }}>
        {empty}
      </Typography>
    );
  }
  return (
    <Stack spacing={0.4}>
      {mails.map((m) => (
        <Box
          key={m.id}
          component={onRead ? "button" : "div"}
          type={onRead ? "button" : undefined}
          onClick={onRead ? () => onRead(m.id) : undefined}
          title={onRead ? "クリックして読む" : undefined}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            width: "100%",
            textAlign: "left",
            border: "1px solid #cfd8dc",
            borderRadius: 1,
            bgcolor: m.read ? "#f5f5f5" : "#fff",
            px: 0.75,
            py: 0.25,
            fontSize: "0.8rem",
            fontWeight: m.read ? 400 : 700,
            color: m.read ? "text.secondary" : "text.primary",
            cursor: onRead ? "pointer" : "default",
            fontFamily: "inherit",
            animation: "mailIn 0.35s ease-out",
            "@keyframes mailIn": { from: { opacity: 0, transform: "translateY(-6px)" }, to: { opacity: 1, transform: "none" } },
            "&:hover": onRead ? { borderColor: "primary.main" } : undefined,
          }}
        >
          <span>{m.read ? "📭" : "✉️"}</span>
          <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {m.subject}
          </Box>
          <Box component="span" sx={{ fontSize: "0.7rem" }}>
            {m.read ? "既読" : "未読"}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export function PopImapPanel({ proto, onDone }: { proto: RecvProto; onDone?: () => void }) {
  const [s, setS] = useState<State>(initial);
  const p = RECV[proto];

  const receive = (d: DeviceId) => {
    const other = d === "pc" ? "phone" : "pc";
    const name = DEVICE[d].name;
    if (proto === "pop") {
      const got = s.server.length;
      const log =
        got > 0
          ? `${name}に ${got} 通をダウンロードしました。サーバのメールボックスからは消えました。`
          : s.devices[other]
            ? `サーバに新しいメールはありません。${DEVICE[other].name}で受信したメールはサーバから消えているので、${name}には届きません。`
            : "サーバに新しいメールはありません。";
      setS({ ...s, server: [], devices: { ...s.devices, [d]: [...(s.devices[d] ?? []), ...s.server] }, log });
    } else {
      const readCount = s.server.filter((m) => m.read).length;
      const log =
        `${name}でサーバのメール ${s.server.length} 通を表示しました。メールはサーバに残ったままです。` +
        (s.devices[other] && readCount > 0 ? `${DEVICE[other].name}で読んだメールは、${name}でも既読になっています。` : "");
      setS({ ...s, devices: { ...s.devices, [d]: s.server.map((m) => ({ ...m })) }, log });
    }
    if (d === "phone" && s.devices.pc) onDone?.();
  };

  const read = (d: DeviceId, id: number) => {
    const mail = s.devices[d]!.find((m) => m.id === id)!;
    const mark = (list: Mail[] | null) => list && list.map((m) => (m.id === id ? { ...m, read: true } : m));
    if (proto === "pop") {
      setS({ ...s, devices: { ...s.devices, [d]: mark(s.devices[d]) }, log: `${DEVICE[d].name}で「${mail.subject}」を読みました。既読になるのは、この端末の中だけです。` });
    } else {
      setS({ ...s, server: mark(s.server)!, devices: { ...s.devices, [d]: mark(s.devices[d]) }, log: `${DEVICE[d].name}で「${mail.subject}」を読みました。サーバのメールにも既読が記録されます。` });
    }
  };

  const arrive = () => {
    const subject = NEW_SUBJECTS[(s.next - 4) % NEW_SUBJECTS.length];
    if (s.server.length >= CAPACITY) {
      setS({
        ...s,
        log:
          proto === "imap"
            ? `⚠️ サーバの容量（${CAPACITY} 通）がいっぱいで、新しいメール「${subject}」を保存できませんでした。IMAP ではメールがサーバにたまるので、いらないメールを削除する必要があります。`
            : `⚠️ サーバの容量（${CAPACITY} 通）がいっぱいで、新しいメール「${subject}」を保存できませんでした。端末で受信すると、サーバのメールボックスが空きます。`,
      });
      return;
    }
    setS({ ...s, server: [...s.server, { id: s.next, subject, read: false }], next: s.next + 1, log: `新しいメール「${subject}」がサーバのメールボックスに届きました。` });
  };

  const removeRead = () => {
    const keep = (list: Mail[] | null) => list && list.filter((m) => !m.read);
    const removed = s.server.length - keep(s.server)!.length;
    setS({
      ...s,
      server: keep(s.server)!,
      devices: { pc: keep(s.devices.pc), phone: keep(s.devices.phone) },
      log: removed > 0 ? `既読のメール ${removed} 通をサーバから削除しました。どの端末からも消え、サーバの容量が空きました。` : "既読のメールがありません。先にメールをクリックして読もう。",
    });
  };

  const full = s.server.length >= CAPACITY;

  return (
    <Stack spacing={1} sx={{ border: 2, borderColor: p.color, borderRadius: 3, p: 1.25, bgcolor: p.bg, minWidth: 0 }}>
      <Typography fontWeight={700} sx={{ color: p.color }}>
        {p.name}：{p.catch}
      </Typography>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="body2" fontWeight={700}>
            📥 サーバのメールボックス
          </Typography>
          <Typography variant="caption" fontWeight={full ? 700 : 400} color={full ? "error" : "text.secondary"}>
            {s.server.length} / {CAPACITY} 通{full ? "（満杯）" : ""}
          </Typography>
        </Stack>
        <Box sx={{ height: 6, bgcolor: "#eceff1", borderRadius: 3, mb: 0.75, overflow: "hidden" }}>
          <Box sx={{ height: "100%", width: `${(s.server.length / CAPACITY) * 100}%`, bgcolor: full ? "error.main" : p.color, transition: "width 0.3s" }} />
        </Box>
        <MailList mails={s.server} empty="（空っぽ）" />
      </Paper>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        {(["pc", "phone"] as DeviceId[]).map((d) => {
          const mails = s.devices[d];
          return (
            <Paper key={d} variant="outlined" sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700}>
                {DEVICE[d].icon} {DEVICE[d].name}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {mails ? (
                  <MailList mails={mails} onRead={(id) => read(d, id)} empty="メールはありません" />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    まだ受信していません
                  </Typography>
                )}
              </Box>
              <Button size="small" variant="contained" onClick={() => receive(d)} sx={{ bgcolor: p.color, "&:hover": { bgcolor: p.color, filter: "brightness(0.9)" } }}>
                {DEVICE[d].name}で受信
              </Button>
            </Paper>
          );
        })}
      </Box>
      <Paper variant="outlined" sx={{ p: 1, minHeight: 64, borderColor: p.color }} aria-live="polite">
        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.6 }}>
          {s.log}
        </Typography>
      </Paper>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        <Button size="small" variant="outlined" onClick={arrive}>
          ✉️ 新しいメールが届く
        </Button>
        {proto === "imap" && (
          <Button size="small" variant="outlined" onClick={removeRead}>
            🗑️ 既読メールを削除
          </Button>
        )}
        <Button size="small" startIcon={<ReplayIcon />} onClick={() => setS(initial())}>
          リセット
        </Button>
      </Stack>
    </Stack>
  );
}

export default function PopImapStage({ protos }: { protos: RecvProto[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const compare = protos.length > 1;
  const all = protos.every((p) => done[p]);
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: `repeat(${protos.length}, minmax(0, 1fr))` }, gap: 1.5 }}>
        {protos.map((p) => (
          <PopImapPanel key={p} proto={p} onDone={() => setDone((d) => ({ ...d, [p]: true }))} />
        ))}
      </Box>
      {compare && all && (
        <Feedback ok>
          完了！ POP はメールを端末に移すので、あとから受信したスマホには届きません。IMAP
          はメールをサーバに置いたままにするので、どの端末からも同じメールを、同じ既読の状態で読めます。いまは複数の端末で使うことが多いので、IMAP がよく使われています。
        </Feedback>
      )}
    </Stack>
  );
}
