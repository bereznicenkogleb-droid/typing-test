/* Банк текстов для теста. Пунктуация простая, без эмодзи и составных символов:
   движок сравнивает строку по UTF-16 code units. */

(function () {
  const TT = (window.TT = window.TT || {});

  TT.TEXTS = {
    en: [
      "The best way to learn to code is to build things you actually want to use. Start small, ship often, and read error messages carefully. Every bug you fix teaches you more than a dozen tutorials ever will.",
      "A good developer is not the one who writes code without mistakes, but the one who finds and fixes them quickly. Keep your functions small, name your variables clearly, and test the parts that matter most.",
      "Typing quickly is not about moving your fingers faster. It is about moving them less. Learn the home row, keep your wrists relaxed, and let accuracy come before speed. Speed follows on its own.",
      "Simple code is hard to write. Anyone can make a system complicated, but it takes care and practice to keep it clear. Remove what you do not need, and explain the rest in plain words.",
      "The web is built on a few simple ideas: documents, links, and requests. Everything else is layers on top. Understanding the basics will help you learn any framework much faster than any course.",
      "Good design is invisible. When an interface works well, people do not notice the buttons or the spacing. They simply do what they came to do, and leave with a smile. That is the whole trick.",
      "Practice does not make perfect. Perfect practice makes perfect. Slow down until your fingers stop guessing, then add speed in small steps. Ten focused minutes beat an hour of careless typing.",
      "Every project you finish is a lesson you keep. Every project you abandon is a lesson you skip. Choose small ideas, finish them completely, and publish them where other people can see your work."
    ],
    ru: [
      "Хороший код легко читать и легко менять. Пишите так, будто поддерживать его будет человек, который знает, где вы живете, и держит в руках топор.",
      "Лучший способ научиться программировать это делать проекты, которыми вы сами будете пользоваться. Начните с малого, выпускайте результат часто и внимательно читайте сообщения об ошибках.",
      "Скорость печати растет не от силы пальцев, а от уверенности. Следите за точностью, держите руки расслабленными и не смотрите на клавиатуру. Скорость придет сама.",
      "Простой код писать труднее всего. Сложную систему может построить каждый, а вот ясную и понятную только тот, кто умеет убирать лишнее и объяснять сложное простыми словами.",
      "Интерфейс должен быть незаметным. Когда все работает хорошо, люди не замечают кнопок и отступов, они просто делают то, зачем пришли. Это и есть лучшая похвала для дизайнера.",
      "Ошибка это не провал, а информация. Она показывает, где ваша модель мира расходится с реальностью, и именно там начинается настоящее обучение. Не бойтесь ошибаться.",
      "Каждый завершенный проект это урок, который остается с вами. Выбирайте небольшие идеи, доводите их до конца и показывайте людям. Так растет и навык, и портфолио.",
      "Не гонитесь за идеальным решением с первого раза. Сначала сделайте так, чтобы работало, потом сделайте так, чтобы было понятно, и только затем ускоряйте. Порядок важен."
    ]
  };

  TT.MODES = [15, 30, 60];
})();
