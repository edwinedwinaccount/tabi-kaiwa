// Kana refresher: two lessons plus a speed game. The app builds the tables; this lists the reading-practice words.
module.exports={
 lessons:[
  {id:"K1",k:"ひらがな",en:"Hiragana refresher",can:"Read every hiragana again, including the marks and small letters",
   point:"Hiragana writes native Japanese words and all the grammar. Two marks change a sound: ゛ turns か into が, and ゜ turns は into ぱ. A small ゃ, ゅ or ょ blends with the kana before it (きゃ), and a small っ is a short pause before the next sound.",
   practice:[["すし","sushi"],["さけ","sake"],["おちゃ","tea"],["みず","water"],["えき","station"],["みぎ","right"],["ひだり","left"],["きっぷ","ticket"],["りょかん","ryokan"],["おんせん","hot spring"],["ゆき","snow"],["やま","mountain"],["きょうと","Kyoto"],["とうきょう","Tokyo"],["おおさか","Osaka"],["ありがとう","thank you"],["すみません","excuse me"],["だいじょうぶ","OK / fine"]]},
  {id:"K2",k:"カタカナ",en:"Katakana refresher",can:"Sound out menus and signs written in katakana",
   point:"Katakana writes borrowed words, so sounding one out often gives you the English. The line ー stretches the vowel before it (ビール is bii-ru). Small ァィゥェォ make sounds Japanese didn't have, such as ファ (fa) and ウィ (wi).",
   practice:[["ビール","beer"],["コーヒー","coffee"],["ラーメン","ramen"],["カレー","curry"],["メニュー","menu"],["トイレ","toilet"],["ホテル","hotel"],["タクシー","taxi"],["バス","bus"],["レストラン","restaurant"],["コンビニ","convenience store"],["スキー","ski"],["レンタカー","rental car"],["チェックイン","check-in"],["カード","card"],["サイズ","size"],["ワイン","wine"],["ハイボール","highball"],["サラダ","salad"],["チーズ","cheese"],["ジュース","juice"],["テーブル","table"],["ニセコ","Niseko"],["オーストラリア","Australia"]]}
 ],
 // confusable pairs worth extra drilling
 confusable:[["シ","ツ"],["ソ","ン"],["ク","ケ"],["ウ","ワ"],["ぬ","め"],["ね","れ","わ"],["は","ほ"],["さ","き"],["る","ろ"],["コ","ユ"]]
};
