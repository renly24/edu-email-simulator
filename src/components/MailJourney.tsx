"use client";
import { type CSSProperties, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ReplayIcon from "@mui/icons-material/Replay";
import { NODES, TAG_COLOR, TOKEN, type Journey, type JourneyStep, type NodeId } from "@/lib/journey";
import { ERROR_COLOR } from "@/lib/model";

// ---------- メールが届くまでの図 ----------

const W = 910;
const H = 330;
const HW = 62;
const HH = 40;
/** 線を引く秒数 */
const DRAW = 0.7;
const CIRCLED = ["①", "②", "③", "④"];
/** 教科書の図4の番号の色 */
const NO_COLOR = "#7e57c2";

function timing(delay: number, dur = 0.25, extra?: Record<string, string>): CSSProperties {
  return {
    "--delay": `${delay}s`,
    "--dur": `${dur}s`,
    ...extra,
  } as CSSProperties;
}

/** 2つの機器を結ぶ線の両端（箱の縁から少し離す）。向きで左右にずらして、行きと帰りが重ならないようにする */
function edge(from: NodeId, to: NodeId) {
  const a = NODES[from];
  const b = NODES[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const t = Math.min(HW / Math.abs(ux || 1e-9), HH / Math.abs(uy || 1e-9)) + 6;
  // 進む向きの右側へずらす
  const nx = -uy * 9;
  const ny = ux * 9;
  return {
    x1: a.x + ux * t + nx,
    y1: a.y + uy * t + ny,
    x2: b.x - ux * t + nx,
    y2: b.y - uy * t + ny,
    nx: nx / 9,
    ny: ny / 9,
    ux,
    uy,
  };
}

function colorOf(step: JourneyStep) {
  return step.kind === "error" ? ERROR_COLOR : TAG_COLOR[step.tag];
}

function Arrow({ step, current, animate }: { step: JourneyStep; current: boolean; animate: boolean }) {
  const { x1, y1, x2, y2, nx, ny, ux, uy } = edge(step.from, step.to);
  const color = colorOf(step);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cls = (name: string) => (animate ? name : undefined);
  // 矢じり
  const head = `${x2},${y2} ${x2 - ux * 11 - uy * 6},${y2 - uy * 11 + ux * 6} ${x2 - ux * 11 + uy * 6},${y2 - uy * 11 - ux * 6}`;
  // 言葉は線の右側に出す
  const lx = mx + nx * 20;
  const ly = my + ny * 20 + 4;
  return (
    <g opacity={current ? 1 : 0.35}>
      <path className={cls("draw")} style={timing(0, DRAW)} pathLength={1} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={color} strokeWidth={current ? 3.5 : 2.5} fill="none" />
      <polygon className={cls("pop")} style={timing(DRAW)} points={head} fill={color} />
      {current && (
        <>
          <text
            className={cls("pop")}
            style={timing(DRAW / 2)}
            x={lx}
            y={ly}
            textAnchor={Math.abs(nx) > 0.5 ? (nx > 0 ? "start" : "end") : "middle"}
            fontSize={13}
            fontWeight={700}
            fill={color}
            stroke="#fff"
            strokeWidth={4}
            paintOrder="stroke"
          >
            {step.no ? `${CIRCLED[step.no - 1]} ` : ""}
            {step.say}
          </text>
          {/* 手紙や問い合わせが、線に沿って真ん中まで進む */}
          <g
            className={cls("move")}
            style={timing(0, DRAW / 1.5, {
              "--fx": `${x1 - mx}px`,
              "--fy": `${y1 - my}px`,
            })}
          >
            <circle cx={mx} cy={my} r={14} fill="#fff" stroke={color} strokeWidth={2} />
            <text x={mx} y={my + 6} textAnchor="middle" fontSize={16}>
              {TOKEN[step.kind]}
            </text>
          </g>
        </>
      )}
    </g>
  );
}

function Node({ id, active, sleeping }: { id: NodeId; active: string | null; sleeping?: boolean }) {
  const n = NODES[id];
  return (
    <g opacity={sleeping ? 0.55 : 1}>
      <rect x={n.x - HW} y={n.y - HH} width={HW * 2} height={HH * 2} rx={10} fill={active ? "#fffde7" : "#fff"} stroke={active ?? "#90a4ae"} strokeWidth={active ? 3 : 2} />
      <text x={n.x} y={n.y - 8} textAnchor="middle" fontSize={24}>
        {sleeping ? "💤" : n.icon}
      </text>
      <text x={n.x} y={n.y + 15} textAnchor="middle" fontSize={13} fontWeight={700} fill="#263238">
        {n.name}
      </text>
      <text x={n.x} y={n.y + 31} textAnchor="middle" fontSize={9.5} fill="#607d8b">
        {sleeping ? "電源オフ" : n.sub}
      </text>
    </g>
  );
}

export default function MailJourney({ journey, onDone, compact }: { journey: Journey; onDone?: () => void; compact?: boolean }) {
  const [step, setStep] = useState(0);
  /** 進めたときだけ、新しい矢印をアニメーションさせる */
  const [animate, setAnimate] = useState(true);
  const total = journey.steps.length;
  const current = step > 0 ? journey.steps[step - 1] : null;
  const done = step === total;

  useEffect(() => {
    if (done) onDone?.();
  }, [done, onDone]);

  const go = (next: number, anim: boolean) => {
    setStep(Math.max(0, Math.min(total, next)));
    setAnimate(anim);
  };

  const shown = journey.steps.slice(0, step);
  const stored = shown.some((s) => s.kind === "store");
  const storing = current?.kind === "store";
  const phoneAwake = shown.some((s) => s.from === "phone");
  const activeColor = (id: NodeId) => (current && (current.from === id || current.to === id) ? (storing ? NO_COLOR : colorOf(current)) : null);
  const recv = NODES.recv;

  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      {/* スマホでは横にスクロールして見る */}
      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="svg"
          className="seq-anim"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${journey.to} あてのメールが届くまでの図`}
          sx={{
            width: "100%",
            minWidth: 600,
            height: "auto",
            display: "block",
            bgcolor: "#fff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          {/* 組織の区切り */}
          <rect x={8} y={140} width={370} height={182} rx={12} fill="#e3f2fd" opacity={0.5} />
          <text x={18} y={158} fontSize={12} fontWeight={700} fill="#1565c0">
            example.ne.jp（たろうのプロバイダ）
          </text>
          <rect x={560} y={140} width={200} height={182} rx={12} fill="#fff3e0" opacity={0.6} />
          <text x={570} y={158} fontSize={12} fontWeight={700} fill="#e65100">
            example.ed.jp
          </text>

          {/* はなこのメールボックス */}
          <g>
            <rect x={recv.x - 58} y={recv.y + 50} width={116} height={30} rx={6} fill={stored ? "#fff8e1" : "#fafafa"} stroke={stored ? "#f9a825" : "#bdbdbd"} strokeWidth={storing ? 4 : 2} />
            {storing && (
              <text className={animate ? "pop" : undefined} style={{ "--delay": "0s" } as CSSProperties} x={recv.x + 66} y={recv.y + 70} fontSize={13} fontWeight={700} fill={NO_COLOR}>
                ③ 保存
              </text>
            )}
            <text x={recv.x} y={recv.y + 70} textAnchor="middle" fontSize={12} fontWeight={700} fill="#5d4037">
              {stored ? "📬" : "📪"} hanako の箱{stored ? "（1通）" : ""}
            </text>
            <line x1={recv.x} y1={recv.y + HH} x2={recv.x} y2={recv.y + 50} stroke="#bdbdbd" strokeWidth={2} />
          </g>

          {(Object.keys(NODES) as NodeId[]).map((id) => (
            <Node key={id} id={id} active={activeColor(id)} sleeping={id === "phone" && !phoneAwake} />
          ))}
          {shown.map((s, i) => (s.kind === "store" ? null : <Arrow key={`${journey.id}-${i}`} step={s} current={i === step - 1} animate={animate && i === step - 1} />))}
        </Box>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          minHeight: compact ? 64 : 80,
          borderColor: current ? colorOf(current) : "#cfd8dc",
          bgcolor: current?.kind === "error" ? "#ffebee" : "#fafafa",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={0.25}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            {step === 0 ? "はじめ" : `ステップ ${step} / ${total}`}
          </Typography>
          {current?.no && <Chip size="small" label={`図4の ${CIRCLED[current.no - 1]}`} sx={{ height: 20, fontWeight: 700, color: "#fff", bgcolor: NO_COLOR }} />}
          {current && current.kind !== "store" && (
            <Chip
              size="small"
              label={current.tag}
              sx={{
                height: 20,
                fontWeight: 700,
                color: "#fff",
                bgcolor: TAG_COLOR[current.tag],
              }}
            />
          )}
        </Stack>
        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.7 }} aria-live="polite">
          {current ? current.text : journey.intro}
        </Typography>
      </Paper>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        <Button size="small" variant="outlined" startIcon={<NavigateBeforeIcon />} disabled={step === 0} onClick={() => go(step - 1, false)}>
          1つ戻る
        </Button>
        <Button size="small" variant="contained" endIcon={<NavigateNextIcon />} disabled={done} onClick={() => go(step + 1, true)}>
          1つ進める
        </Button>
        {done ? (
          <Button size="small" startIcon={<ReplayIcon />} onClick={() => go(0, true)}>
            最初から
          </Button>
        ) : (
          <Button size="small" onClick={() => go(total, false)}>
            すべて表示
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
