/**
 * Registration flow definition
 */
export function getRegistrationFlow() {
  return {
    steps: [
      {
        key: 'language_learning',
        question: 'こんにちは！言語マッチングサービスへようこそ。\n\nまず、あなたが学びたい言語を教えてください。\n（例: 英語、日本語、スペイン語など）'
      },
      {
        key: 'language_teaching',
        question: 'ありがとうございます！\n\n次に、あなたが教えられる言語を教えてください。\n（例: 日本語、英語など）'
      },
      {
        key: 'level',
        question: 'あなたのレベルを教えてください：\n1. 中級以上\n2. ネイティブ\n\n番号で答えてください。'
      },
      {
        key: 'preferred_time',
        question: '希望する時間帯を教えてください。\n（例: 平日の夜、週末の午前、平日の朝など）'
      },
      {
        key: 'gender',
        question: '性別を教えてください（任意）：\n1. 男性\n2. 女性\n3. その他\n4. 答えたくない\n\n番号で答えるか、「スキップ」と入力してください。'
      },
      {
        key: 'age_range',
        question: '年齢帯を教えてください（任意）：\n1. 20代\n2. 30代\n3. 40代\n4. 50代以上\n\n番号で答えるか、「スキップ」と入力してください。'
      },
      {
        key: 'video_call_ok',
        question: 'ビデオ通話（顔出し）は可能ですか？\n1. はい\n2. いいえ\n\n番号で答えてください。'
      }
    ]
  };
}

