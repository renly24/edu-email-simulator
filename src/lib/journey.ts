import { DNS_COLOR, HANAKO, RECV_COLOR, SMTP_COLOR, type JourneyId } from "./model";

// ---------- メールが届くまでの図（1ステップずつ進める） ----------

export type NodeId = "pc" | "send" | "dns" | "recv" | "phone";

export const NODES: Record<NodeId, { x: number; y: number; icon: string; name: string; sub: string }> = {
  pc: { x: 72, y: 220, icon: "💻", name: "たろうのPC", sub: "メールソフト" },
  send: { x: 285, y: 220, icon: "📤", name: "送信サーバ", sub: "smtp.alpha.example.jp" },
  dns: { x: 460, y: 62, icon: "📖", name: "DNS サーバ", sub: "ドメイン名の電話帳" },
  recv: { x: 660, y: 220, icon: "📥", name: "受信サーバ", sub: "mail.beta.example.com" },
  phone: { x: 836, y: 62, icon: "📱", name: "はなこのスマホ", sub: "メールアプリ" },
};

export type ProtoTag = "SMTP" | "DNS" | "POP/IMAP";

export const TAG_COLOR: Record<ProtoTag, string> = {
  SMTP: SMTP_COLOR,
  DNS: DNS_COLOR,
  "POP/IMAP": RECV_COLOR,
};

export type StepKind = "mail" | "ask" | "answer" | "error";

export interface JourneyStep {
  from: NodeId;
  to: NodeId;
  kind: StepKind;
  tag: ProtoTag;
  /** 線の横に出す短い言葉 */
  say: string;
  text: string;
}

export interface Journey {
  id: JourneyId;
  /** 宛先のメールアドレス */
  to: string;
  /** 宛先の説明（シミュレーターのボタン） */
  label: string;
  intro: string;
  steps: JourneyStep[];
  /** 最後のステップのあと、メールボックスにメールがあるか */
  stored: boolean;
  /** 結果のまとめ */
  result: string;
  ok: boolean;
}

export const TOKEN: Record<StepKind, string> = { mail: "✉️", ask: "❓", answer: "💡", error: "⚠️" };

const sendToServer = (to: string): JourneyStep => ({
  from: "pc",
  to: "send",
  kind: "mail",
  tag: "SMTP",
  say: "送って",
  text: `たろうのメールソフトが、SMTP で自分の組織の送信サーバ（smtp.alpha.example.jp）にメールを渡します。宛先は ${to} です。`,
});

const askDns = (domain: string): JourneyStep => ({
  from: "send",
  to: "dns",
  kind: "ask",
  tag: "DNS",
  say: `${domain} は？`,
  text: `送信サーバは、宛先の @ より右側「${domain}」のメールを受け取るサーバはどこ？と DNS サーバに問い合わせます。`,
});

const answerDns: JourneyStep = {
  from: "dns",
  to: "send",
  kind: "answer",
  tag: "DNS",
  say: "mail.beta.example.com",
  text: "DNS サーバが「beta.example.com のメールサーバは mail.beta.example.com（192.0.2.25）だよ」と答えます。これを MX レコードといいます。",
};

const relay = (user: string): JourneyStep => ({
  from: "send",
  to: "recv",
  kind: "mail",
  tag: "SMTP",
  say: `${user} さんへ`,
  text: `送信サーバは、教わったはなこのメールサーバに SMTP でつなぎ、「${user} さんあてのメールです」と転送します。`,
});

export const JOURNEYS: Record<JourneyId, Journey> = {
  normal: {
    id: "normal",
    to: HANAKO.address,
    label: "正しいアドレス",
    intro: `たろうがメールソフトで、はなこ（${HANAKO.address}）あてのメールを書きました。はなこのスマホは、いま電源が切れています。「1つ進める」を押そう。`,
    steps: [
      sendToServer(HANAKO.address),
      askDns("beta.example.com"),
      answerDns,
      {
        ...relay("hanako"),
        text: "送信サーバは、教わったはなこのメールサーバに SMTP でつなぎ、メールを転送します。受け取ったサーバは、@ より左側「hanako」のメールボックスにメールを保管します。スマホの電源が切れていても、メールはここで待っています。",
      },
      {
        from: "phone",
        to: "recv",
        kind: "ask",
        tag: "POP/IMAP",
        say: "新着ある？",
        text: "あとで、はなこがスマホの電源を入れてメールアプリを開くと、POP か IMAP で「新しいメールはある？」と自分のメールサーバに問い合わせます。",
      },
      {
        from: "recv",
        to: "phone",
        kind: "mail",
        tag: "POP/IMAP",
        say: "1通あるよ",
        text: "メールがはなこのスマホに届きました！ 送るときは SMTP、相手のサーバを探すのは DNS、受け取るときは POP か IMAP と、区間ごとにプロトコルを使い分けてリレーしています。",
      },
    ],
    stored: true,
    result: "はなこのスマホまで届いた！",
    ok: true,
  },
  badUser: {
    id: "badUser",
    to: "hanaco@beta.example.com",
    label: "ユーザ名のまちがい",
    intro: "たろうは「hanako」を「hanaco」と打ち間違えて、hanaco@beta.example.com に送ってしまいました。「1つ進める」を押そう。",
    steps: [
      sendToServer("hanaco@beta.example.com"),
      askDns("beta.example.com"),
      { ...answerDns, text: "ドメイン名「beta.example.com」は正しいので、DNS サーバは「mail.beta.example.com だよ」と、はなこのメールサーバを答えます。" },
      relay("hanaco"),
      {
        from: "recv",
        to: "send",
        kind: "error",
        tag: "SMTP",
        say: "550 宛先不明",
        text: "はなこのメールサーバには「hanaco」というメールボックスがありません。サーバは「550 User unknown（宛先不明）」と答えて、受け取りを断ります。",
      },
      {
        from: "send",
        to: "pc",
        kind: "error",
        tag: "SMTP",
        say: "エラーメール",
        text: "送信サーバは「宛先不明で届けられませんでした」というエラーメール（MAILER-DAEMON から届く）をたろうに返します。たろうはアドレスのまちがいに気づけます。",
      },
    ],
    stored: false,
    result: "はなこのサーバまでは届いたが、宛先不明のエラーメールが返ってきた",
    ok: false,
  },
  badDomain: {
    id: "badDomain",
    to: "hanako@beta.exmaple.com",
    label: "ドメイン名のまちがい",
    intro: "たろうは「example」を「exmaple」と打ち間違えて、hanako@beta.exmaple.com に送ってしまいました。「1つ進める」を押そう。",
    steps: [
      sendToServer("hanako@beta.exmaple.com"),
      askDns("beta.exmaple.com"),
      {
        from: "dns",
        to: "send",
        kind: "error",
        tag: "DNS",
        say: "見つからない",
        text: "「beta.exmaple.com」というドメイン名は登録されていないので、DNS サーバは「そのドメインのメールサーバは見つからない」と答えます。",
      },
      {
        from: "send",
        to: "pc",
        kind: "error",
        tag: "SMTP",
        say: "エラーメール",
        text: "送り先のサーバがわからないので、送信サーバは「届けられませんでした（Host not found）」というエラーメールをたろうに返します。メールは、はなこのサーバまで行くこともできませんでした。",
      },
    ],
    stored: false,
    result: "相手のサーバが見つからず、送信サーバからエラーメールが返ってきた",
    ok: false,
  },
};

export const JOURNEY_IDS: JourneyId[] = ["normal", "badUser", "badDomain"];
