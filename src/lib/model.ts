// ---------- モデル（スライドの内容） ----------

export const SMTP_COLOR = "#1565c0";
export const DNS_COLOR = "#6a1b9a";
export const RECV_COLOR = "#e65100";
export const ERROR_COLOR = "#c62828";
export const SAFE_COLOR = "#2e7d32";

/** 登場人物とメールアドレス */
export const TARO = { name: "たろう", address: "taro@example.ne.jp" };
export const HANAKO = { name: "はなこ", address: "hanako@example.ed.jp" };

export const CHAPTERS = [
  { id: 1, name: "メールのしくみ", color: "#455a64" },
  { id: 2, name: "送る（SMTP）", color: SMTP_COLOR },
  { id: 3, name: "受け取る（POP・IMAP）", color: RECV_COLOR },
  { id: 4, name: "メールの中身", color: DNS_COLOR },
  { id: 5, name: "安全に使う", color: SAFE_COLOR },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

/** 受信のプロトコル */
export type RecvProto = "pop" | "imap";

export const RECV = {
  pop: { name: "POP", color: "#ef6c00", bg: "#fff3e0", catch: "端末にダウンロードする" },
  imap: { name: "IMAP", color: "#00838f", bg: "#e0f7fa", catch: "サーバに置いたまま読む" },
} as const;

// ---------- 問題 ----------

export interface ChoiceQuiz {
  kind: "choice";
  question: string;
  options: string[];
  answer: number;
  ok: string;
  ng: string;
  /** true の予想問題は、答えるまで次のスライドへ進めない */
  gate?: boolean;
}

export type Quiz = ChoiceQuiz | { kind: "simulator" } | { kind: "popimap" } | { kind: "sort" } | { kind: "bcc" } | { kind: "phishing" } | { kind: "test" };

export type QuizLabel = "予想問題" | "体験問題" | "確認問題";

export function quizLabel(quiz: Quiz | undefined): QuizLabel | null {
  if (!quiz) return null;
  if (quiz.kind === "choice") return quiz.gate ? "予想問題" : "確認問題";
  if (quiz.kind === "test") return "確認問題";
  return "体験問題";
}

export const QUIZ_COLOR: Record<QuizLabel, string> = {
  予想問題: "#1565c0",
  体験問題: "#ef6c00",
  確認問題: "#2e7d32",
};

// ---------- スライド ----------

/** メールが届くまでの図で使う場面 */
export type JourneyId = "normal" | "badUser" | "badDomain";

export type Stage =
  | { kind: "intro" }
  /** 予想問題の場面の絵 */
  | { kind: "scene"; id: "offline" | "pop" }
  | { kind: "address" }
  /** URL とドメイン名（教科書の図3・表1） */
  | { kind: "domain" }
  /** 電子メールのしくみ（教科書の図4） */
  | { kind: "figure" }
  /** メールが届くまでの図（1つずつ進める） */
  | { kind: "journey"; id: JourneyId }
  /** 宛先を選んで送ってみる */
  | { kind: "simulator" }
  | { kind: "smtp" }
  | { kind: "dns" }
  | { kind: "popimap"; protos: RecvProto[] }
  | { kind: "sort" }
  | { kind: "source" }
  | { kind: "bcc" }
  | { kind: "attachment" }
  | { kind: "encrypt" }
  | { kind: "phishing" }
  | { kind: "table" }
  | { kind: "test" };

export interface Slide {
  id?: string;
  chapter: ChapterId;
  title: string;
  description: string;
  stage: Stage;
  /** 説明の下に出す要点 */
  points?: string[];
  quiz?: Quiz;
}

export const SLIDES: Slide[] = [
  // ---- 第1章 ----
  {
    chapter: 1,
    title: "メールは「郵便」のしくみに似ている",
    description:
      "たろうがはなこに電子メールを送ります。メールは、たろうのパソコンからはなこのスマホへ直接届くのではありません。手紙がポスト → 郵便局 → 相手の郵便受けと運ばれるように、メールも「メールサーバ」というコンピュータを順にリレーして届きます。",
    stage: { kind: "intro" },
    points: ["メールはメールサーバをリレーして届く", "受け取った側のサーバの「メールボックス」（郵便受け）に保管される"],
  },
  {
    id: "address",
    chapter: 1,
    title: "メールアドレスは「名前＠住所」",
    description:
      "メールアドレスは「@（アットマーク）」で2つに分かれます。@ の右側の「ドメイン名」は、どの組織のメールサーバに届けるかを表す住所。@ の左側の「ユーザ名」は、そのサーバの中のだれのメールボックスかを表す宛名です。アドレスの部分をクリックして確かめよう。",
    stage: { kind: "address" },
    points: ["@ の右側（ドメイン名）＝届け先のメールサーバ", "@ の左側（ユーザ名）＝サーバの中のメールボックス"],
  },
  {
    id: "domain",
    chapter: 1,
    title: "ドメイン名のしくみ",
    description:
      "ドメイン名は、Web ページの URL にも使われています。「example.ed.jp」は、右から「jp（日本）」「ed（小・中学校、高等学校）」「example（組織名）」と読み、右へいくほど大きな区切りになります。日本の組織に割り当てられる JP ドメイン名には、組織の種類ごとに決まった名前があります。",
    stage: { kind: "domain" },
    points: ["ドメイン名は右から：トップレベルドメイン → 組織種別 → 組織名", "co.jp は会社、ed.jp は学校、go.jp は政府機関"],
  },
  {
    chapter: 1,
    title: "相手の電源が切れていたら？",
    description: "はなこのスマホは電源が切れています。このとき、たろうがはなこにメールを送ると、どうなるでしょうか。",
    stage: { kind: "scene", id: "offline" },
    quiz: {
      kind: "choice",
      gate: true,
      question: "はなこのスマホの電源が切れているとき、たろうがメールを送ると？",
      options: ["送信できず、たろうのパソコンでエラーになる", "はなこのメールサーバに保管され、電源を入れたあとで受け取れる", "メールは消えてしまい、はなこには届かない"],
      answer: 1,
      ok: "正解！ メールは、はなこのメールサーバのメールボックスに保管されます。はなこは都合のよいときにサーバへ取りにいきます。次のスライドで、届くまでの流れを1つずつ見てみよう。",
      ng: "メールは相手の端末に直接届くのではなく、相手のメールサーバのメールボックスに保管されます。だから相手の電源が切れていても送れます。次のスライドで流れを確かめよう。",
    },
  },
  {
    id: "journey",
    chapter: 1,
    title: "メールが届くまでの流れ",
    description:
      "「1つ進める」を押して、たろうのメールがはなこに届くまでを1ステップずつ見てみよう。送るときは SMTP、相手のサーバを探すときは DNS、受け取るときは POP か IMAP という「プロトコル（通信の約束ごと）」が使われます。",
    stage: { kind: "journey", id: "normal" },
  },

  // ---- 第2章 ----
  {
    id: "smtp",
    chapter: 2,
    title: "SMTP：サーバどうしの会話",
    description:
      "メールを送るときのプロトコルが SMTP（Simple Mail Transfer Protocol）です。アプリケーション層のプロトコルで、メールソフト → 自分のメールサーバ、メールサーバ → 相手のメールサーバの2か所で使われます。サーバどうしは、短い命令と「250 OK」のような番号付きの返事を交互に送り合ってメールを渡します。",
    stage: { kind: "smtp" },
    points: ["MAIL FROM で差出人、RCPT TO で宛先を伝える", "DATA のあとに、メールの中身（ヘッダと本文）を送る"],
  },
  {
    id: "dns",
    chapter: 2,
    title: "DNS で相手のメールサーバを探す",
    description:
      "送る側のメールサーバは、宛先アドレスの @ より右側（ドメイン名）を DNS サーバに問い合わせて、そのドメインのメールを受け取るサーバ（MX レコード）を調べます。宛先を選んで、DNS に問い合わせてみよう。",
    stage: { kind: "dns" },
    points: ["DNS は「ドメイン名 → メールサーバ」の電話帳", "ドメイン名を打ち間違えると、メールサーバが見つからない"],
  },
  {
    chapter: 2,
    title: "宛先を打ち間違えたら？",
    description: "たろうは、はなこのアドレスの「hanako」を「hanaco」と1文字打ち間違えて送ってしまいました。example.ed.jp というドメインは正しく存在します。",
    stage: { kind: "dns" },
    quiz: {
      kind: "choice",
      gate: true,
      question: "hanaco@example.ed.jp に送ったメールはどうなる？",
      options: ["DNS がまちがいに気づいて、はなこに届けてくれる", "はなこのメールサーバまでは届くが、「宛先不明」のエラーメールがたろうに返ってくる", "だれにも届かず、エラーも返ってこない"],
      answer: 1,
      ok: "正解！ ドメイン名は正しいので、はなこのメールサーバまでは届きます。でもサーバの中に hanaco というメールボックスはないので、「宛先不明」のエラーメールが返ってきます。次のスライドで試してみよう。",
      ng: "ドメイン名は正しいので、はなこのメールサーバまでは届きます。でも hanaco というメールボックスはないので、「宛先不明」のエラーメールがたろうに返ってきます。次のスライドで試してみよう。",
    },
  },
  {
    id: "simulator",
    chapter: 2,
    title: "宛先を選んで送ってみよう",
    description:
      "3つの宛先から1つ選んで、メールを送ってみよう。正しいアドレス、ユーザ名のまちがい、ドメイン名のまちがいで、どこまで届き、どこでエラーになるかを比べます。3つとも最後まで進めると完了です。",
    stage: { kind: "simulator" },
    quiz: { kind: "simulator" },
  },

  // ---- 第3章 ----
  {
    chapter: 3,
    title: "POP で受信すると、スマホでも読める？",
    description:
      "はなこは、家のパソコンとスマホの両方でメールを読みたいと思っています。まずパソコンのメールソフトで、POP（Post Office Protocol）という方式でメールを受信しました。POP は、サーバのメールを端末にダウンロードする方式です。",
    stage: { kind: "scene", id: "pop" },
    quiz: {
      kind: "choice",
      gate: true,
      question: "パソコンで POP で受信したあと、スマホで同じメールを受信できる？",
      options: ["できる。サーバにずっと残っている", "できない。ダウンロードしたときにサーバから消えている", "パソコンが自動でスマホに転送してくれる"],
      answer: 1,
      ok: "正解！ POP は（ふつうの設定では）ダウンロードしたメールをサーバから消します。だから後からスマホで受信しても、同じメールは届きません。",
      ng: "POP は（ふつうの設定では）ダウンロードしたメールをサーバから消します。だから後からスマホで受信しても、同じメールは届きません。次のスライドで確かめよう。",
    },
  },
  {
    id: "pop",
    chapter: 3,
    title: "POP：端末にダウンロードする",
    description:
      "「パソコンで受信」「スマホで受信」を押して、サーバのメールボックスと端末のようすを見比べよう。POP ではメールが端末に移るので、サーバの容量はあまり使いませんが、ほかの端末からは読めなくなります。",
    stage: { kind: "popimap", protos: ["pop"] },
    points: ["受信したメールはサーバから消える（ふつうの設定）", "1台の端末で読むのに向いている"],
  },
  {
    id: "imap",
    chapter: 3,
    title: "IMAP：サーバに置いたまま読む",
    description:
      "IMAP（Internet Message Access Protocol）では、メールはサーバのメールボックスに置いたまま、端末はその中身を見にいきます。パソコンで読んだメールは、スマホでも「既読」になります。ただし、メールがたまってサーバの容量（ここでは 5 通）を超えると、新しいメールを保存できなくなります。「新しいメールが届く」を何回か押して確かめよう。",
    stage: { kind: "popimap", protos: ["imap"] },
    points: ["メールはサーバに残り、どの端末からも同じ状態で読める", "サーバの容量を超えると、メールの保存や閲覧ができなくなる"],
  },
  {
    chapter: 3,
    title: "POP と IMAP を同時に比べる",
    description: "左が POP、右が IMAP です。どちらも「パソコンで受信 → メールを読む → スマホで受信」と同じ順番で操作して、結果のちがいを比べよう。両方でスマホまで受信すると完了です。",
    stage: { kind: "popimap", protos: ["pop", "imap"] },
    quiz: { kind: "popimap" },
  },
  {
    chapter: 3,
    title: "教科書の問題にチャレンジ",
    description: "図は、教科書の「電子メールのしくみ」です。①〜④のどこで、どのプロトコルが使われているかを思い出しながら答えよう。",
    stage: { kind: "figure" },
    quiz: {
      kind: "choice",
      question: "電子メールで使用されるプロトコル「POP」の説明として、適切なものはどれか。",
      options: [
        "メールサーバから電子メールを受信するために使用するプロトコルで、メールをサーバ上で管理する機能を持つ。",
        "メールサーバ間でメールメッセージを交換するときに使用する。",
        "メールサーバのメールボックスから電子メールを取り出すときに使用する。",
        "利用者が電子メールを送るときに使用する。",
      ],
      answer: 2,
      ok: "正解！ POP は、メールサーバのメールボックスからメールを取り出す（ダウンロードする）プロトコルです。1つ目はメールをサーバ上で管理する IMAP、2つ目と4つ目は SMTP の説明です。",
      ng: "POP は、メールサーバのメールボックスからメールを取り出す（ダウンロードする）プロトコルです。メールをサーバ上で管理するのは IMAP、サーバ間の交換や送信に使うのは SMTP です。",
    },
  },
  {
    id: "sort",
    chapter: 3,
    title: "SMTP・POP・IMAP を仕分けよう",
    description: "カードを1枚選んでから、入れる箱をクリックしよう。全部入れたら「答え合わせ」を押します。",
    stage: { kind: "sort" },
    quiz: { kind: "sort" },
  },

  // ---- 第4章 ----
  {
    id: "source",
    chapter: 4,
    title: "メールの中身：ヘッダと本文",
    description:
      "メールソフトで見ている画面の裏には、メールの「ソース（中身そのもの）」があります。メールは、宛先や件名などが書かれた「ヘッダ」と、「本文」に分かれ、その間は空の行で区切られています。ソースの行をクリックして、何が書かれているか確かめよう。",
    stage: { kind: "source" },
    points: ["ヘッダ：差出人・宛先・件名・日時・経由したサーバなど", "Received は、メールが通ったサーバの記録（下から順に読む）"],
  },
  {
    id: "bcc",
    chapter: 4,
    title: "To・CC・BCC のちがい",
    description:
      "たろうは、はなこ・じろう・先生の3人に同じメールを送ります。それぞれを To（宛先）・CC（写し）・BCC（見えない写し）のどれにするか選んで、3人の画面にどう表示されるか見比べよう。BCC の人を作って確かめると完了です。",
    stage: { kind: "bcc" },
    quiz: { kind: "bcc" },
  },
  {
    chapter: 4,
    title: "大勢にお知らせを送るときは？",
    description: "部活の顧問の先生が、おたがいにアドレスを知らない 30 人の保護者に、同じお知らせメールを送ります。",
    stage: { kind: "bcc" },
    quiz: {
      kind: "choice",
      question: "保護者のアドレスはどこに入れるのがよい？",
      options: ["To にまとめて入れる", "CC にまとめて入れる", "BCC にまとめて入れる"],
      answer: 2,
      ok: "正解！ To や CC に入れると、30 人全員のアドレスがおたがいに見えてしまいます（個人情報の漏えい）。おたがいに知らない人へ一斉に送るときは BCC を使います。",
      ng: "To や CC に入れると、受け取った全員にほかの人のアドレスが見えてしまいます。おたがいに知らない人へ一斉に送るときは BCC を使います。",
    },
  },
  {
    id: "attachment",
    chapter: 4,
    title: "添付ファイルは文字に変えて送る",
    description:
      "メールは、もともと文字（テキスト）だけを送るしくみです。写真などの添付ファイルは、MIME（マイム）という決まりにしたがって、Base64 という方法で英数字の文字列に変換してから本文といっしょに送ります。「文字に変換」を押してみよう。",
    stage: { kind: "attachment" },
    points: ["添付ファイルは Base64 で文字に変換して送る", "変換すると大きさは約 1.33 倍になる"],
  },

  // ---- 第5章 ----
  {
    id: "encrypt",
    chapter: 5,
    title: "通信を暗号化する",
    description:
      "メールは途中でいくつものネットワークを通ります。暗号化しないで送ると、途中で通信を盗み見た人に、本文やパスワードがそのまま読まれてしまいます。「暗号化なし」「暗号化あり」を切りかえて、盗み見る人の画面を比べよう。",
    stage: { kind: "encrypt" },
    points: ["SSL/TLS で、端末とサーバ・サーバどうしの通信を暗号化する", "メールソフトの設定で、暗号化（SSL/TLS）を使う"],
  },
  {
    id: "phishing",
    chapter: 5,
    title: "あやしいメールを見分けよう",
    description:
      "メールの差出人の名前やアドレスは、送る人が自由に書けてしまいます。そのため、銀行や会社になりすました「フィッシングメール」や迷惑メールが届くことがあります。3通のメールを読んで、「安全」か「あやしい」かを判定しよう。",
    stage: { kind: "phishing" },
    quiz: { kind: "phishing" },
  },
  {
    id: "table",
    chapter: 5,
    title: "まとめ：メールのプロトコル",
    description:
      "メールは、送るときは SMTP、受け取るときは POP か IMAP と、区間によってプロトコルを使い分けています。相手のメールサーバを探すのは DNS の役目です。暗号化して使うときは、ポート番号も変わります。",
    stage: { kind: "table" },
  },
  {
    chapter: 5,
    title: "まとめテスト",
    description: "10問のまとめテストです。全部答えたら「採点する」を押そう。結果の画面に名前を入れて、スクリーンショットで提出します。",
    stage: { kind: "test" },
    quiz: { kind: "test" },
  },
];

export function slideIndexOf(id: string) {
  const i = SLIDES.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`slide ${id} not found`);
  return i;
}

// ---------- 仕分け ----------

export type SortBin = "smtp" | "pop" | "imap";

export const SORT_BINS: { id: SortBin; title: string; color: string; bg: string }[] = [
  { id: "smtp", title: "SMTP", color: SMTP_COLOR, bg: "#e3f2fd" },
  { id: "pop", title: "POP", color: RECV.pop.color, bg: RECV.pop.bg },
  { id: "imap", title: "IMAP", color: RECV.imap.color, bg: RECV.imap.bg },
];

export const SORT_ITEMS: { label: string; answer: SortBin }[] = [
  { label: "メールソフトからメールサーバへメールを送る", answer: "smtp" },
  { label: "メールサーバから相手のメールサーバへ転送する", answer: "smtp" },
  { label: "受信したメールを端末に移し、サーバから消す", answer: "pop" },
  { label: "サーバの容量をあまり使わない", answer: "pop" },
  { label: "メールをサーバに置いたまま読む", answer: "imap" },
  { label: "パソコンで読んだメールがスマホでも既読になる", answer: "imap" },
];

// ---------- まとめテスト ----------

export interface TestQuestion {
  question: string;
  options: string[];
  answer: number;
  /** まちがえたときに見直すスライド */
  review: string;
}

export const TEST_QUESTIONS: TestQuestion[] = [
  { question: "hanako@example.ed.jp の「example.ed.jp」の部分は？", options: ["ユーザ名", "ドメイン名", "パスワード"], answer: 1, review: "address" },
  { question: "メールを送信するときに使うプロトコルは？", options: ["SMTP", "POP", "IMAP"], answer: 0, review: "smtp" },
  { question: "メールサーバが、届け先のメールサーバを調べるときに問い合わせるのは？", options: ["DHCP サーバ", "Web サーバ", "DNS サーバ"], answer: 2, review: "dns" },
  { question: "相手のスマホの電源が切れているとき、送ったメールはどこで待つ？", options: ["送った人のパソコン", "相手のメールサーバのメールボックス", "DNS サーバ"], answer: 1, review: "journey" },
  { question: "ドメイン名が「go.jp」で終わるのは、どの種類の組織？", options: ["会社", "政府機関", "大学"], answer: 1, review: "domain" },
  { question: "受信したメールを端末にダウンロードし、サーバから消すのは？", options: ["POP", "IMAP", "SMTP"], answer: 0, review: "pop" },
  { question: "複数の端末で、同じメールを同じ状態（既読など）で読みたい。向いているのは？", options: ["POP", "IMAP", "SMTP"], answer: 1, review: "imap" },
  {
    question: "IMAP で、メールがたまってサーバの容量を超えるとどうなる？",
    options: ["古いメールが自動で端末に移る", "メールの保存や閲覧ができなくなる", "容量が自動で増える"],
    answer: 1,
    review: "imap",
  },
  { question: "ほかの受信者にアドレスを見せずに送りたい人を入れる欄は？", options: ["To", "CC", "BCC"], answer: 2, review: "bcc" },
  { question: "メールの通信を暗号化して、途中で読まれないようにするしくみは？", options: ["Base64", "SSL/TLS", "MX レコード"], answer: 1, review: "encrypt" },
];
