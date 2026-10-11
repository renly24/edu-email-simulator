"use client";
import { type ReactNode, useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { JOURNEY_IDS, JOURNEYS } from "@/lib/journey";
import { ERROR_COLOR, SAFE_COLOR, SMTP_COLOR, SORT_BINS, SORT_ITEMS, TEST_QUESTIONS, slideIndexOf, type ChoiceQuiz, type JourneyId, type SortBin } from "@/lib/model";
import MailJourney from "./MailJourney";

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

// ---------- 共通部品 ----------

export function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderLeft: 4,
        borderColor: ok ? "success.main" : "error.main",
        bgcolor: ok ? "#f1f8e9" : "#ffebee",
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
      }}
    >
      {ok ? <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.25 }} /> : <CancelIcon color="error" fontSize="small" sx={{ mt: 0.25 }} />}
      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
        {children}
      </Typography>
    </Paper>
  );
}

function OptionButton({ label, state, onClick, disabled }: { label: ReactNode; state?: "ok" | "ng" | "picked"; onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      variant={state === "picked" ? "contained" : "outlined"}
      color={state === "ok" ? "success" : state === "ng" ? "error" : "primary"}
      onClick={onClick}
      disabled={disabled && !state}
      sx={{
        justifyContent: "flex-start",
        textAlign: "left",
        textTransform: "none",
        fontWeight: 700,
        borderWidth: 2,
        "&:hover": { borderWidth: 2 },
        bgcolor: state === "ok" ? "#e8f5e9" : state === "ng" ? "#ffebee" : undefined,
        pointerEvents: disabled ? "none" : undefined,
      }}
    >
      {label}
    </Button>
  );
}

// ---------- 選択問題（予想問題・確認問題） ----------

export function ChoiceQuizView({ quiz, value, onAnswer }: { quiz: ChoiceQuiz; value: number | undefined; onAnswer: (v: number) => void }) {
  const answered = value !== undefined;
  return (
    <Stack spacing={1}>
      <Typography fontWeight={700}>Q. {quiz.question}</Typography>
      <Stack spacing={0.75}>
        {quiz.options.map((o, i) => (
          <OptionButton key={o} label={o} disabled={answered} state={answered ? (i === quiz.answer ? "ok" : i === value ? "ng" : undefined) : undefined} onClick={() => onAnswer(i)} />
        ))}
      </Stack>
      {answered && <Feedback ok={value === quiz.answer}>{value === quiz.answer ? quiz.ok : quiz.ng}</Feedback>}
    </Stack>
  );
}

// ---------- 体験問題：宛先を選んで送る ----------

export function Simulator() {
  const [id, setId] = useState<JourneyId>("normal");
  const [done, setDone] = useState<Partial<Record<JourneyId, boolean>>>({});
  const onDone = useCallback(() => setDone((d) => (d[id] ? d : { ...d, [id]: true })), [id]);
  const journey = JOURNEYS[id];
  const all = JOURNEY_IDS.every((j) => done[j]);

  return (
    <Stack spacing={1.25}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 0.75 }}>
        {JOURNEY_IDS.map((j) => (
          <Button
            key={j}
            variant={id === j ? "contained" : "outlined"}
            onClick={() => setId(j)}
            sx={{ textTransform: "none", flexDirection: "column", alignItems: "flex-start", textAlign: "left", py: 0.5, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
          >
            <Box component="span" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
              {done[j] ? (JOURNEYS[j].ok ? "✅ " : "⚠️ ") : "▶ "}
              {JOURNEYS[j].label}
            </Box>
            <Box component="span" sx={{ ...mono, fontSize: "0.8rem", fontWeight: 700, wordBreak: "break-all" }}>
              {JOURNEYS[j].to}
            </Box>
          </Button>
        ))}
      </Box>
      <MailJourney key={id} journey={journey} onDone={onDone} compact />
      {done[id] && !all && <Feedback ok={journey.ok}>結果：{journey.result}。ほかの宛先も試してみよう。</Feedback>}
      {all && (
        <Feedback ok>
          完了！ ドメイン名をまちがえると DNS
          でサーバが見つからず、ユーザ名をまちがえると相手のサーバで「宛先不明」になります。どちらの場合も、エラーメールが差出人に返ってくるので、まちがいに気づけます。
        </Feedback>
      )}
    </Stack>
  );
}

// ---------- 体験問題：SMTP・POP・IMAP の仕分け ----------

export function SortQuiz() {
  const [box, setBox] = useState<Record<string, SortBin | undefined>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const put = (bin: SortBin) => {
    if (!picked) return;
    setBox({ ...box, [picked]: bin });
    setPicked(null);
    setChecked(false);
  };
  const placedCount = SORT_ITEMS.filter((i) => box[i.label]).length;
  const correct = SORT_ITEMS.filter((i) => box[i.label] === i.answer).length;

  const card = (label: string) => {
    const state = checked && box[label] ? (SORT_ITEMS.find((i) => i.label === label)!.answer === box[label] ? "ok" : "ng") : undefined;
    return (
      <Button
        key={label}
        size="small"
        variant={picked === label ? "contained" : "outlined"}
        color={state === "ok" ? "success" : state === "ng" ? "error" : "primary"}
        onClick={(e) => {
          e.stopPropagation();
          setPicked(picked === label ? null : label);
        }}
        sx={{ textTransform: "none", fontWeight: 700, textAlign: "left", borderWidth: 2, "&:hover": { borderWidth: 2 }, bgcolor: state === "ok" ? "#e8f5e9" : state === "ng" ? "#ffebee" : undefined }}
      >
        {state === "ok" ? "○ " : state === "ng" ? "× " : ""}
        {label}
      </Button>
    );
  };

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, minHeight: 72, alignContent: "flex-start" }}>
        {SORT_ITEMS.filter((i) => !box[i.label]).map((i) => card(i.label))}
        {placedCount === SORT_ITEMS.length && (
          <Typography variant="body2" color="text.secondary">
            全部仕分けました。「答え合わせ」を押そう。
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1 }}>
        {SORT_BINS.map((b) => (
          <Box
            key={b.id}
            role="button"
            tabIndex={0}
            aria-label={`${b.title} の箱に入れる`}
            onClick={() => put(b.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                put(b.id);
              }
            }}
            sx={{
              border: `2px dashed ${b.color}`,
              borderRadius: 2,
              p: 1,
              minHeight: 150,
              bgcolor: picked ? "#fffde7" : b.bg,
              cursor: picked ? "pointer" : "default",
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              alignItems: "stretch",
            }}
          >
            <Typography fontWeight={700} sx={{ color: b.color }}>
              {b.title}
            </Typography>
            {SORT_ITEMS.filter((i) => box[i.label] === b.id).map((i) => card(i.label))}
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" disabled={placedCount < SORT_ITEMS.length} onClick={() => setChecked(true)}>
          答え合わせ
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setBox({});
            setPicked(null);
            setChecked(false);
          }}
        >
          やり直す
        </Button>
      </Stack>
      {checked && (
        <Feedback ok={correct === SORT_ITEMS.length}>
          {correct === SORT_ITEMS.length
            ? "全問正解！ 送る・転送するのは SMTP。受け取るのは POP と IMAP で、端末に移してサーバから消すのが POP、サーバに置いたまま読むのが IMAP です。"
            : `${correct} / ${SORT_ITEMS.length} 正解。赤いカードを選んで、別の箱に入れ直してみよう。`}
        </Feedback>
      )}
    </Stack>
  );
}

// ---------- 体験問題：To・CC・BCC ----------

type Field = "to" | "cc" | "bcc";
const FIELDS: { id: Field; name: string; color: string }[] = [
  { id: "to", name: "To", color: SMTP_COLOR },
  { id: "cc", name: "CC", color: "#6a1b9a" },
  { id: "bcc", name: "BCC", color: "#ef6c00" },
];
const PEOPLE = [
  { name: "はなこ", icon: "👩‍🎓" },
  { name: "じろう", icon: "👦" },
  { name: "先生", icon: "👨‍🏫" },
];
const SENDER = "たろう";

export function BccQuiz() {
  const [field, setField] = useState<Record<string, Field>>({ はなこ: "to", じろう: "cc", 先生: "cc" });
  const [viewer, setViewer] = useState<string>("はなこ");
  /** BCC の人がいる状態で、BCC ではない人の画面を見たか */
  const [found, setFound] = useState(false);

  const list = (f: Field) => PEOPLE.filter((p) => field[p.name] === f).map((p) => p.name);
  const hasBcc = list("bcc").length > 0;
  const isSender = viewer === SENDER;
  const viewerField = field[viewer];

  const check = (nextField: Record<string, Field>, nextViewer: string) => {
    if (PEOPLE.some((p) => nextField[p.name] === "bcc") && nextViewer !== SENDER && nextField[nextViewer] !== "bcc") setFound(true);
  };

  const line = (label: string, names: string[], color: string) => (
    <Typography variant="body2" sx={{ display: "flex", gap: 1 }}>
      <Box component="span" sx={{ fontWeight: 700, color, minWidth: 40 }}>
        {label}
      </Box>
      <span>{names.length ? names.join("、") : "―"}</span>
    </Typography>
  );

  return (
    <Stack spacing={1.25}>
      <Stack spacing={0.5}>
        {PEOPLE.map((p) => (
          <Stack key={p.name} direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ width: 84, fontWeight: 700 }}>
              {p.icon} {p.name}
            </Typography>
            {FIELDS.map((f) => (
              <Button
                key={f.id}
                size="small"
                variant={field[p.name] === f.id ? "contained" : "outlined"}
                onClick={() => {
                  const next = { ...field, [p.name]: f.id };
                  setField(next);
                  check(next, viewer);
                }}
                sx={{
                  minWidth: 56,
                  fontWeight: 700,
                  bgcolor: field[p.name] === f.id ? f.color : undefined,
                  borderColor: f.color,
                  color: field[p.name] === f.id ? "#fff" : f.color,
                  "&:hover": { bgcolor: field[p.name] === f.id ? f.color : undefined, borderColor: f.color },
                }}
              >
                {f.name}
              </Button>
            ))}
          </Stack>
        ))}
      </Stack>
      <Box>
        <Typography variant="caption" color="text.secondary">
          だれの画面を見る？
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {[...PEOPLE.map((p) => p.name), SENDER].map((n) => (
            <Button
              key={n}
              size="small"
              variant={viewer === n ? "contained" : "outlined"}
              onClick={() => {
                setViewer(n);
                check(field, n);
              }}
            >
              {n === SENDER ? "たろう（送った人）" : n}
            </Button>
          ))}
        </Stack>
      </Box>
      <Paper variant="outlined" sx={{ p: 1.25, borderWidth: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {isSender ? "📤 たろうの「送信済み」フォルダ" : `📱 ${viewer}に届いたメール`}
        </Typography>
        <Typography fontWeight={700}>明日の部活</Typography>
        {line("差出人", [SENDER], "#455a64")}
        {line("To", list("to"), SMTP_COLOR)}
        {line("CC", list("cc"), "#6a1b9a")}
        {isSender && line("BCC", list("bcc"), "#ef6c00")}
        {!isSender && viewerField === "bcc" && (
          <Typography variant="caption" sx={{ color: "#ef6c00", fontWeight: 700 }}>
            自分の名前は To にも CC にもない…（BCC で受け取ったので）
          </Typography>
        )}
      </Paper>
      {found ? (
        <Feedback ok>
          完了！ BCC に入れた人は、ほかの受信者の画面のどこにも表示されません（BCC の人どうしも見えません）。BCC の人がだれかを知っているのは、送ったたろうだけです。To と CC は全員に見えます。
        </Feedback>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {hasBcc ? "BCC ではない人の画面を見て、BCC の人が表示されるか確かめよう。" : "だれか1人を BCC にしてみよう。"}
        </Typography>
      )}
    </Stack>
  );
}

// ---------- 体験問題：あやしいメール ----------

const PHISHING: { name: string; address: string; subject: string; body: string; safe: boolean; reasons: string[] }[] = [
  {
    name: "〇〇銀行 カスタマーセンター",
    address: "info@maru-bank-security.example.net",
    subject: "【重要】口座のご利用を一時停止しました",
    body: "24 時間以内に下のリンクから本人確認をしないと、口座が使えなくなります。\nhttp://maru-bank.login-check.example.net/",
    safe: false,
    reasons: ["「24 時間以内」と急がせて、不安にさせている", "アドレスやリンク先が銀行の本当のドメインとちがう", "リンク先でパスワードなどを入力させようとしている"],
  },
  {
    name: "はなこ",
    address: "hanako@beta.example.com",
    subject: "明日の部活",
    body: "明日は体育館に 9 時集合です。タオルを忘れずに！",
    safe: true,
    reasons: ["知っている人の、いつものアドレスから届いている", "リンクや添付ファイルがなく、個人情報も求めていない"],
  },
  {
    name: "プレゼント事務局",
    address: "present@lucky-campaign.example.org",
    subject: "おめでとうございます！最新スマホが当選しました",
    body: "賞品の送料 500 円をお支払いいただくため、クレジットカード番号を返信してください。",
    safe: false,
    reasons: ["応募していないのに「当選」と言っている", "メールでクレジットカード番号を求めている"],
  },
];

export function PhishingQuiz() {
  const [judge, setJudge] = useState<(boolean | undefined)[]>([]);
  const all = PHISHING.every((_, i) => judge[i] !== undefined);
  const correct = PHISHING.filter((m, i) => judge[i] === m.safe).length;
  return (
    <Stack spacing={1}>
      {PHISHING.map((m, i) => {
        const j = judge[i];
        const answered = j !== undefined;
        return (
          <Paper key={m.subject} variant="outlined" sx={{ p: 1, borderWidth: 2, borderColor: answered ? (m.safe ? SAFE_COLOR : ERROR_COLOR) : "#cfd8dc" }}>
            <Typography variant="body2">
              <b>{m.name}</b>{" "}
              <Box component="span" sx={{ ...mono, fontSize: "0.75rem", color: "text.secondary", wordBreak: "break-all" }}>
                &lt;{m.address}&gt;
              </Box>
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              件名：{m.subject}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", wordBreak: "break-all", color: "#37474f", my: 0.5 }}>
              {m.body}
            </Typography>
            {answered ? (
              <Feedback ok={j === m.safe}>
                <b>{m.safe ? "安全なメール" : "あやしいメール"}</b>
                {j === m.safe ? "（正解）" : "（不正解）"}：{m.reasons.join("。")}。
              </Feedback>
            ) : (
              <Stack direction="row" spacing={0.75}>
                <Button size="small" variant="outlined" color="success" onClick={() => setJudge(Object.assign([...judge], { [i]: true }))}>
                  👍 安全
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => setJudge(Object.assign([...judge], { [i]: false }))}>
                  ⚠️ あやしい
                </Button>
              </Stack>
            )}
          </Paper>
        );
      })}
      {all && (
        <Feedback ok={correct === PHISHING.length}>
          {correct} / {PHISHING.length} 正解。差出人の名前やアドレスは、だれでも自由に書けてしまいます。受け取る側のサーバは、SPF・DKIM
          というしくみで「本当にそのドメインのサーバから送られたか」を確かめ、なりすましメールを見分けています。あやしいメールのリンクは開かず、添付ファイルも開かないようにしよう。
        </Feedback>
      )}
      {judge.length > 0 && (
        <Box>
          <Button size="small" onClick={() => setJudge([])}>
            やり直す
          </Button>
        </Box>
      )}
    </Stack>
  );
}

// ---------- まとめテスト ----------

export interface TestState {
  answers: (number | undefined)[];
  graded: boolean;
  /** 結果画面をスクリーンショットで提出するときの名前 */
  name: string;
}

export function FinalTest({ state, onChange, onSeek }: { state: TestState; onChange: (s: TestState) => void; onSeek: (index: number) => void }) {
  const { answers, graded, name } = state;
  const allAnswered = TEST_QUESTIONS.every((_, i) => answers[i] !== undefined);
  const score = TEST_QUESTIONS.filter((q, i) => answers[i] === q.answer).length;

  if (graded) {
    return (
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ textAlign: "center", bgcolor: "#f5f7fa", borderRadius: 3, px: 3, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              あなたの得点
            </Typography>
            <Typography sx={{ fontSize: "2.6rem", fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
              {score} / {TEST_QUESTIONS.length}
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              id="test-name"
              size="small"
              placeholder="名前を入力（提出用）"
              slotProps={{ htmlInput: { "aria-label": "名前（提出用）" } }}
              value={name}
              onChange={(e) => onChange({ ...state, name: e.target.value })}
            />
            <Typography fontWeight={700}>{score === TEST_QUESTIONS.length ? "全問正解です！" : score >= 6 ? "よくできました。× の問題を見直そう。" : "説明のスライドに戻って確認しよう。"}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.75}>
          {TEST_QUESTIONS.map((q, i) => {
            const ok = answers[i] === q.answer;
            const review = slideIndexOf(q.review);
            return (
              <Paper key={q.question} variant="outlined" sx={{ p: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {ok ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {i + 1}. {q.question}
                  </Typography>
                  {!ok && (
                    <Typography variant="caption" color="text.secondary">
                      正解：{q.options[q.answer]}
                    </Typography>
                  )}
                </Box>
                {!ok && (
                  <Button size="small" onClick={() => onSeek(review)}>
                    スライド {review + 1} で確認
                  </Button>
                )}
              </Paper>
            );
          })}
        </Stack>
        <Box>
          <Button variant="outlined" onClick={() => onChange({ answers: [], graded: false, name })}>
            もう一度解く
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      {TEST_QUESTIONS.map((q, i) => (
        <Box key={q.question}>
          <Typography variant="body2" fontWeight={700} mb={0.5}>
            {i + 1}. {q.question}
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {q.options.map((o, j) => (
              <Button
                key={o}
                size="small"
                variant={answers[i] === j ? "contained" : "outlined"}
                onClick={() => {
                  const next = [...answers];
                  next[i] = j;
                  onChange({ ...state, answers: next, graded: false });
                }}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                {o}
              </Button>
            ))}
          </Stack>
        </Box>
      ))}
      <Box>
        <Button variant="contained" disabled={!allAnswered} onClick={() => onChange({ ...state, graded: true })}>
          採点する
        </Button>
      </Box>
    </Stack>
  );
}
