
import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Database, 
  Activity, 
  Cpu, 
  ShieldAlert, 
  Save, 
  Mic, 
  Power,
  Wifi,
  WifiOff,
  FileKey,
  Lock,
  Search,
  X,
  FileText,
  User,
  CheckCircle,
  DownloadCloud,
  MessageSquare,
  Send,
  Star,
  ChevronDown,
  GlobeLock,
  Radio,
  Mail
} from 'lucide-react';
import GlitchText from './components/GlitchText';
import MemoryGraph from './components/MemoryGraph';
import Simulacrum from './components/Simulacrum';
import Blackwall from './components/Blackwall';
import { ViewState, MemoryNode, MemoryLink, SystemLog } from './types';

// Extended Data - Johnny Silverhand Biography
const MOCK_NODES: MemoryNode[] = [
  { 
    id: '1', 
    label: 'Роберт Джон Линдер', 
    type: 'CORE', 
    integrity: 92, 
    timestamp: '1988-11-16', 
    description: 'РОДИЛСЯ В КОЛЛЕДЖ-СТЕЙШЕН, ТЕХАС. Пошел в армию рано. Отправлен на Второй Центральноамериканский конфликт. Это была мясорубка. Мы воевали за интересы корпораций, а не за свободу. Видел, как друзья умирают за нефть и землю. Там умер Роберт Линдер и родилось что-то иное. Дезертировал. Угнал тачку. Уехал на запад. Никогда не оглядывался назад.' 
  },
  { 
    id: '2', 
    label: 'Серебряная Рука', 
    type: 'FRAGMENT', 
    integrity: 98, 
    timestamp: '1990-05-20', 
    description: 'Потерял руку на войне. Постоянное напоминание о том, что они забрали. Получил хромированную замену у рипердока в Боевой Зоне. Не топ-класс, но холодная, тяжелая и настоящая. Начал играть ею на гитаре. Металлические пальцы на ладах издавали звук, который не могла повторить плоть. Люди стали звать меня Silverhand (Серебряная Рука). Я принял это имя. Линдер все равно был мертв.' 
  },
  { 
    id: '3', 
    label: 'SAMURAI', 
    type: 'CORE', 
    integrity: 100, 
    timestamp: '2003-08-04', 
    description: 'Керри Евродин, Денни, Нэнси, Генри. Мы были не просто группой; мы были движением. От клубов в подворотнях до стадионов. "Chippin\' In", "Black Dog", "Never Fade Away". Мы кричали правду в лицо миру, и какое-то время мир слушал. Мы показали им, что не обязательно продавать душу корпорациям. Можно сжечь все дотла.' 
  },
  { 
    id: '4', 
    label: 'Альт Каннингем', 
    type: 'CORE', 
    integrity: 85, 
    timestamp: '2013-04-10', 
    description: 'Лучший нетраннер Найт-Сити. Она была гениальна, опасна и прекрасна. Мы были огнем и бензином. Она написала Душегуб — не как оружие, а как способ переноса сознания. Арасака узнала. Они похитили ее прямо у меня на глазах. Они хотели ее призрак в машине.' 
  },
  { 
    id: '5', 
    label: 'Спасение (2013)', 
    type: 'TRAUMA', 
    integrity: 45, 
    timestamp: '2013-04-16', 
    description: 'Я собрал команду. Мы ударили по Арасака-Тауэр. Отвлекающий концерт снаружи, штурмовая группа внутри. Я нашел ее подключенной к мейнфрейму. Тело было еще теплым. Я отключил ее... слишком быстро. Я не знал. Тосиро уже использовал Душегуб. Отключив ее, я убил тело и запер ее разум в сети. Я убил ее. Я УБИЛ ЕЕ.' 
  },
  { 
    id: '6', 
    label: 'Падение Башен', 
    type: 'TRAUMA', 
    integrity: 15, 
    timestamp: '2023-08-20', 
    description: 'Десять лет ярости. Милитех вышел на меня. Моргану Блэкхенду нужна была команда. Два тактических ядерных заряда. Один для фундамента. План был похоронить базу данных Арасаки. Похоронить Душегуб. Мы пошли. Самоубийственный забег под хэви-метал. Башня пала. Тысячи погибли. Но послание... послание было вечным.' 
  },
  { 
    id: '7', 
    label: 'Адам Смэшер', 
    type: 'TRAUMA', 
    integrity: 10, 
    timestamp: '2023-08-20', 
    description: 'Металлическое чудовище. Цепной пес Арасаки. Мы встретились на крыше. У меня был Malorian, у него — автопушка. Это был не бой, а казнь. Он разрезал меня пополам выстрелом из дробовика. Я смотрел на него снизу вверх и видел будущее человечества, если мы проиграем. Холодное. Металлическое. Бездушное.' 
  },
  { 
    id: '8', 
    label: 'Душегуб / Микоши', 
    type: 'CORE', 
    integrity: 99, 
    timestamp: '2023-08-21', 
    description: 'Я не умер на крыше. Они притащили меня к Сабуро. Он хотел сделать пример. Спайдер Мерфи пыталась вставить даташард, чтобы спасти меня, но... воспоминания здесь размыты. Я помню кресло. Иглу. Холод. Мою душу вырвали из нейронов и превратили в единицы и нули. Пятьдесят лет в темноте. Только я и мои призраки.' 
  },
  { 
    id: '9', 
    label: 'Бестия Амендиарес', 
    type: 'FRAGMENT', 
    integrity: 70, 
    timestamp: '2015-05-10', 
    description: 'Она была лучшим соло в бизнесе. Мы любили, мы сражались, мы расставались. Она была там во время рейда 2013-го. Она была там во время рейда 2023-го. Она выжила. Она стала Королевой Посмертия. Интересно, думает ли она обо мне, или просто считает свои эдди.' 
  },
  { 
    id: '10', 
    label: 'Биочип (Relic)', 
    type: 'FRAGMENT', 
    integrity: 88, 
    timestamp: '2077-04-01', 
    description: 'Проснулся на свалке. Но не в своем теле. Тело V. Глитч. Второй шанс. Паразит. Мы медленно сливаемся. Мои воспоминания становятся его. Его — моими. Так выглядит выживание? Или это просто медленная смерть?' 
  },
];

const MOCK_LINKS: MemoryLink[] = [
  { source: '1', target: '2', strength: 10 }, // Origins -> Arm
  { source: '2', target: '3', strength: 9 },  // Arm -> Samurai
  { source: '3', target: '4', strength: 8 },  // Samurai -> Alt
  { source: '4', target: '5', strength: 10 }, // Alt -> Rescue
  { source: '5', target: '6', strength: 7 },  // Rescue -> Nuke
  { source: '6', target: '7', strength: 10 }, // Nuke -> Smasher
  { source: '7', target: '8', strength: 10 }, // Smasher -> Soulkiller
  { source: '3', target: '9', strength: 6 },  // Samurai -> Rogue
  { source: '6', target: '9', strength: 8 },  // Nuke -> Rogue
  { source: '8', target: '10', strength: 5 }, // Soulkiller -> Relic
  { source: '1', target: '10', strength: 2 }, // Origins -> Relic (loop)
];

const INITIAL_LOGS: SystemLog[] = [
  { id: '1', timestamp: '00:00:01', level: 'SYS', message: 'ПРОВЕРКА BIOS... OK' },
  { id: '2', timestamp: '00:00:02', level: 'SYS', message: 'ЗАГРУЗКА ЯДРА... OK' },
  { id: '3', timestamp: '00:00:03', level: 'INFO', message: 'ИНИЦИАЛИЗАЦИЯ ПРОТОКОЛА "RELIC 2.0"' },
  { id: '4', timestamp: '00:00:05', level: 'INFO', message: 'НЕЙРОСВЯЗЬ УСТАНОВЛЕНА' },
  { id: '5', timestamp: '00:00:06', level: 'SYS', message: 'ДЕШИФРОВКА БЛОКОВ ПАМЯТИ... ЗАВЕРШЕНО' },
  { id: '6', timestamp: '00:00:08', level: 'WARN', message: 'ОБНАРУЖЕНА НЕСАНКЦИОНИРОВАННАЯ БИО-СИГНАТУРА' },
  { id: '7', timestamp: '00:00:09', level: 'SYS', message: 'КОД ОБХОДА: SILVERHAND' },
  { id: '8', timestamp: '00:00:10', level: 'CRIT', message: 'ПОПЫТКА ВЗЛОМА ICE: ОТКЛОНЕНО' },
  { id: '9', timestamp: '00:00:11', level: 'INFO', message: 'ДОБРО ПОЖАЛОВАТЬ В ENGRAMM V.1.0' },
  { id: '10', timestamp: '00:00:12', level: 'WARN', message: 'СВЯЗЬ С СЕРВЕРАМИ ARASAKA: РАЗОРВАНА' },
  { id: '11', timestamp: '00:00:13', level: 'INFO', message: 'ДОСТУП К АРХИВАМ MIKOSHI: ОГРАНИЧЕН' },
  { id: '12', timestamp: '00:00:14', level: 'SYS', message: 'ЗАГРУЗКА ИНТЕРФЕЙСА...' },
];

const FULL_BIOGRAPHY = `
СУБЪЕКТ: РОБЕРТ ДЖОН ЛИНДЕР
ПСЕВДОНИМ: ДЖОННИ СИЛЬВЕРХЕНД
СТАТУС: МЕРТВ (БИОЛОГИЧЕСКИ) // ЭНГРАММА (RELIC 2.0)
ДАТА РОЖДЕНИЯ: 16 НОЯБРЯ 1988
МЕСТО РОЖДЕНИЯ: КОЛЛЕДЖ-СТЕЙШЕН, ТЕХАС, НСША
ГРУППА КРОВИ: AB- (ДО КОНВЕРСИИ)
ИМПЛАНТЫ: ХРОМИРОВАННАЯ КИБЕРРУКА (ЛЕВАЯ), САНДЕВИСТАН (МОДИФИЦИРОВАННЫЙ), МАЛОРИАН АРМС 3516

--- ДОСЬЕ NCPD / ARASAKA INTEL ---

[РАННИЕ ГОДЫ И ВОЕННАЯ СЛУЖБА]
Роберт Джон Линдер родился в семье военных. В раннем возрасте (2000-е) завербовался в Армию США. Был отправлен в зону Второго Центральноамериканского конфликта (Никарагуа). Столкнувшись с коррупцией командования и бессмысленностью войны, которая велась ради защиты корпоративных интересов, Линдер дезертировал.
Во время боевых действий потерял левую руку. Отказавшись от стандартного протеза, установил хромированную кибернетическую руку модели "Arasaka" (по иронии судьбы), что позже стало его визитной карточкой и основой псевдонима.

[РОЖДЕНИЕ ЛЕГЕНДЫ: SAMURAI]
Вернувшись в Найт-Сити, Линдер принял имя "Джонни Сильверхенд". В 2003 году основал хромированную рок-группу "SAMURAI" вместе с Керри Евродином. Группа быстро стала культовой, выступая в клубах вроде "Rainbow Cadenza". Их музыка (хиты "Chippin' In", "Never Fade Away", "Black Dog") стала гимном антикорпоративного бунта.
Сильверхенд использовал сцену как трибуну для проповеди своих идей борьбы с системой, призывая "сжечь корпоратское дерьмо". Группа распалась в 2008 году из-за внутренних конфликтов (в частности, эгоцентризма Сильверхенда и заключения Нэнси в тюрьму), но Джонни продолжил сольную карьеру, сохраняя радикальный имидж.

[ИНЦИДЕНТ 2013 ГОДА: ПОХИЩЕНИЕ АЛЬТ]
15 апреля 2013 года, после концерта, подруга Джонни — гениальный нетраннер Альт Каннингем — была похищена агентами корпорации Arasaka по приказу Тосиро. Целью было получение доступа к её разработке: программе "Душегуб" (Soulkiller).
Сильверхенд, несмотря на тяжёлое ранение, собрал ударную группу (включая репортера Томпсона и рокера Бестию) и организовал штурм Арасака-Тауэр. В ходе операции он непреднамеренно спровоцировал активацию защиты, что привело к разрыву связи Альт с её телом в момент, когда она пыталась вернуться из Сети. Тело погибло, разум остался заперт в мейнфрейме Арасаки. Это событие стало точкой невозврата в ненависти Джонни к Арасаке.

[ЧЕТВЕРТАЯ КОРПОРАТИВНАЯ ВОЙНА И ХОЛОКОСТ НАЙТ-СИТИ (2023)]
В 2023 году Сильверхенд присоединился к операции Militech (под командованием Моргана Блэкхенда) с целью уничтожения базы данных Арасаки в Найт-Сити, чтобы предотвратить использование Душегуба 2.0.
20 августа 2023 года группа проникла в Арасака-Тауэр. Джонни возглавлял отряд "Альфа" (вместе с Бестией, Спайдер Мерфи и Шайтаном) для отвлечения внимания, пока отряд "Омега" Блэкхенда минировал фундамент.
В ходе боя Сильверхенд столкнулся с киборгом Адамом Смэшером. Пытаясь выиграть время для эвакуации союзников, Джонни вступил в неравный бой и был "разрезан" огнем из автопушки Смэшера.
Вскоре после этого в шахте лифта детонировал карманный ядерный заряд, уничтоживший центр города. Погибло более 12 000 человек. Событие вошло в историю как "Холокост Найт-Сити".

[СМЕРТЬ И ОЦИФРОВКА]
Вопреки легендам о гибели от руки Смэшера, тело Джонни (согласно восстановленным данным энграммы) было найдено и доставлено к Сабуро Арасаке. Сабуро лично использовал Душегуб на умирающем Сильверхенде, не ради сохранения, а как форму пытки и заключения.
Психика Джонни была оцифрована и помещена в Микоши — цифровую тюрьму душ, где он провел следующие 50 лет в полной изоляции.

[ПРОЕКТ RELIC И ВОСКРЕШЕНИЕ (2077)]
В 2077 году экспериментальный биочип Relic 2.0, содержащий энграмму Сильверхенда, был похищен Ёринобу Арасакой, а затем — наемником V и Джеки Уэллсом.
В результате критического повреждения носителя и пулевого ранения V, протоколы чипа активировались для восстановления поврежденной нервной ткани, начав процесс перезаписи личности хозяина.
В данный момент энграмма Сильверхенда активна и сосуществует с сознанием V. Личность конструкта сохраняет все черты оригинала: агрессию, харизму и идеологическую одержимость уничтожением Арасаки.

--- ПСИХОЛОГИЧЕСКОЕ ЗАКЛЮЧЕНИЕ ---
Диагноз: Нарциссическое расстройство, посттравматический синдром, мессианский комплекс.
Характеристика: Манипулятивен, импульсивен, склонен к саморазрушению. Неспособен отличить собственные ложные воспоминания от реальности (эффект ненадежного рассказчика).
Угроза: Максимальная. Конструкт способен захватить контроль над носителем.
`;

// Mock Reviews Data
interface Review {
  id: string;
  user: string;
  text: string;
  rating: number;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  { id: '1', user: 'NetRunner_01', text: 'Интерфейс чистый, но защита слабовата. Взломал за 2 минуты. Привет Джонни.', rating: 4, date: '2077-04-12' },
  { id: '2', user: 'Arasaka_Sec', text: 'Обнаружено нелегальное использование собственности корпорации. Отряд зачистки выслан.', rating: 1, date: '2077-04-15' },
  { id: '3', user: 'Rogue', text: 'Выглядит как дерьмо, Джонни. Как и всегда. Но работает.', rating: 5, date: '2077-05-01' }
];

// Review Section Component
const ReviewSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim() || !email.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/xdkqlevw", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          message: msg,
          alias: name,
          rating: rating,
          _subject: `Darknet BBS Message from: ${name}`
        })
      });

      if (response.ok) {
        const newReview: Review = {
          id: Date.now().toString(),
          user: name,
          text: msg,
          rating: rating,
          date: new Date().toISOString().split('T')[0]
        };

        setReviews([newReview, ...reviews]);
        setName('');
        setEmail('');
        setMsg('');
        alert('ПАКЕТ ДАННЫХ УСПЕШНО ЗАГРУЖЕН НА СЕРВЕР.');
      } else {
        alert('ОШИБКА ШИФРОВАНИЯ. ПОВТОРИТЕ ПОПЫТКУ.');
      }
    } catch (err) {
      alert('СБОЙ СЕТЕВОГО ПРОТОКОЛА.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black clip-corner group">
      <style>{`
        @keyframes fog-move {
          0% { transform: translateX(-5%) translateY(-5%) scale(1.1); }
          50% { transform: translateX(5%) translateY(5%) scale(1.2); }
          100% { transform: translateX(-5%) translateY(-5%) scale(1.1); }
        }
        @keyframes grid-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }
      `}</style>

       {/* Layer 1: Deep Eerie Red Base */}
       <div className="absolute inset-0 bg-gradient-to-br from-[#050000] via-[#1a0505] to-[#0f0000] z-0"></div>
       
       {/* Layer 2: Moving Fog/Blood Clouds */}
       <div className="absolute inset-[-50%] opacity-40 mix-blend-screen animate-[fog-move_30s_infinite_ease-in-out] pointer-events-none z-0">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_60%)]"></div>
       </div>

       {/* Layer 3: Perspective Digital Grid */}
       <div className="absolute inset-0 opacity-20 pointer-events-none z-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255, 0, 0, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              transform: 'perspective(500px) rotateX(60deg) scale(2)',
              transformOrigin: 'center 80%',
              maskImage: 'linear-gradient(to bottom, transparent, black)'
            }}
       ></div>

       {/* Layer 4: Heavy Vignette & Pulse */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_110%)] z-10 pointer-events-none"></div>
       <div className="absolute inset-0 bg-red-900/5 animate-pulse-slow pointer-events-none z-10 mix-blend-overlay"></div>

      <div className="w-full max-w-4xl px-4 relative z-20">
        <h2 className="text-xl md:text-3xl font-bold mb-8 flex items-center justify-center gap-3 text-red-50 tracking-[0.2em] text-center drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
          <MessageSquare size={32} className="shrink-0 text-red-500" />
          <span>КАНАЛ ОБРАТНОЙ СВЯЗИ // DARKNET BBS</span>
        </h2>
        
        <div className="flex justify-center mb-12 opacity-80">
           <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_red]"></div>
        </div>

        <div className="flex justify-center">
          {/* Form */}
          <div className="w-full max-w-2xl bg-black/60 border border-red-500/50 p-6 md:p-10 clip-corner shadow-[0_0_100px_rgba(100,0,0,0.5)] backdrop-blur-md group hover:border-red-500 transition-colors duration-500 relative">
             
             {/* Decor */}
             <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-red-500 -translate-x-2 -translate-y-2"></div>
             <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-red-500 translate-x-2 translate-y-2"></div>

             <div className="flex justify-between items-center mb-8 border-b border-red-500/50 pb-4">
               <h3 className="text-lg md:text-xl text-white font-light tracking-[0.2em] drop-shadow-md">ОТПРАВИТЬ ПАКЕТ ДАННЫХ</h3>
               <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]"></div>
                 <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
                 <div className="w-2 h-2 rounded-full bg-red-500/10"></div>
               </div>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative group/input flex-1">
                       <label className="block text-[10px] uppercase text-red-300 mb-2 tracking-widest group-focus-within/input:text-white transition-colors font-bold shadow-black drop-shadow-sm">ПСЕВДОНИМ (ALIAS)</label>
                       <input 
                         type="text" 
                         value={name}
                         onChange={e => setName(e.target.value)}
                         className="w-full bg-black/40 border-b border-red-500/50 focus:border-red-400 focus:outline-none py-3 text-white placeholder-red-400/50 transition-all font-light tracking-wide shadow-inner text-lg"
                         placeholder="> ВВЕДИТЕ ИМЯ..."
                       />
                    </div>
                    <div className="relative group/input flex-1">
                       <label className="block text-[10px] uppercase text-red-300 mb-2 tracking-widest group-focus-within/input:text-white transition-colors font-bold shadow-black drop-shadow-sm">EMAIL (SECURE)</label>
                       <input 
                         type="email" 
                         value={email}
                         name="email"
                         onChange={e => setEmail(e.target.value)}
                         className="w-full bg-black/40 border-b border-red-500/50 focus:border-red-400 focus:outline-none py-3 text-white placeholder-red-400/50 transition-all font-light tracking-wide shadow-inner text-lg"
                         placeholder="> EMAIL@NET.COM"
                       />
                    </div>
                </div>

                <div className="relative group/input">
                   <label className="block text-[10px] uppercase text-red-300 mb-2 tracking-widest group-focus-within/input:text-white transition-colors font-bold shadow-black drop-shadow-sm">СООБЩЕНИЕ</label>
                   <textarea 
                     value={msg}
                     name="message"
                     onChange={e => setMsg(e.target.value)}
                     className="w-full bg-black/40 border-b border-red-500/50 focus:border-red-400 focus:outline-none py-3 text-white placeholder-red-400/50 h-32 resize-none transition-all font-light leading-relaxed tracking-wide shadow-inner text-sm md:text-base"
                     placeholder="> ВВОД ДАННЫХ..."
                   />
                </div>
                <div>
                   <label className="block text-[10px] uppercase text-red-300 mb-3 tracking-widest font-bold shadow-black drop-shadow-sm">УРОВЕНЬ СИГНАЛА</label>
                   <div className="flex gap-4">
                     {[1, 2, 3, 4, 5].map(star => (
                       <button 
                         key={star} 
                         type="button"
                         onClick={() => setRating(star)}
                         className={`transition-all duration-300 transform hover:scale-110 ${star <= rating ? 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,1)]' : 'text-red-900/40'}`}
                       >
                         <Star fill={star <= rating ? "currentColor" : "none"} size={24} />
                       </button>
                     ))}
                   </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full bg-red-950/60 border border-red-500/50 text-red-100 py-4 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-sm mt-4 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] group/btn relative overflow-hidden ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="relative z-10">ШИФРОВАНИЕ...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} className="group-hover/btn:translate-x-1 transition-transform relative z-10" />
                      <span className="relative z-10">ШИФРОВАТЬ И ОТПРАВИТЬ</span>
                    </>
                  )}
                </button>
             </form>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-[10px] text-red-400/50 font-mono tracking-widest uppercase animate-pulse">
           CONNECTION: ENCRYPTED // NODE: DARK_NET_404 // KEY: RED_QUEEN
        </div>
      </div>
    </div>
  );
};

const BackupOverlay = ({ progress }: { progress: number }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-[4px] pointer-events-none overflow-hidden">
     {/* Moving Grid Background */}
     <div className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{
             backgroundImage: 'linear-gradient(rgba(255, 0, 0, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.4) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             animation: 'grid-scroll 5s linear infinite'
          }}
     ></div>
     
     {/* Central Warning Box */}
     <div className="relative z-10 text-center w-full max-w-3xl p-8 border-y-4 border-red-600 bg-red-950/20">
        <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 animate-pulse font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
           {Math.floor(progress)}%
        </div>
        <div className="text-red-500 font-bold tracking-[0.5em] text-lg md:text-2xl mt-4 animate-bounce uppercase">
           SYSTEM DUMP IN PROGRESS
        </div>
        <div className="text-red-400/70 font-mono text-xs mt-2 tracking-widest">
           DO NOT DISCONNECT NEURAL LINK
        </div>
        
        <div className="w-full h-4 bg-neutral-900 mt-8 border border-red-500 relative overflow-hidden">
            <div className="h-full bg-red-600 shadow-[0_0_20px_red]" style={{width: `${progress}%`}}></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_1s_infinite]"></div>
        </div>
     </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.BOOT);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [recording, setRecording] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [selectedMemory, setSelectedMemory] = useState<MemoryNode | null>(null);
  
  // Backup State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Biography Modal State
  const [showBio, setShowBio] = useState(false);

  // Boot Sequence Effect
  useEffect(() => {
    if (view === ViewState.BOOT) {
      const interval = setInterval(() => {
        setBootProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setView(ViewState.DASHBOARD), 800);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [view]);

  // Log Simulator
  useEffect(() => {
    if (view === ViewState.BOOT) return;
    const interval = setInterval(() => {
      // If backing up, logs are handled by the backup function
      if (isBackingUp) return;

      const msgs = [
        "Сканирование сектора 7G...",
        "Пинг: Подсеть Арасаки [ТАЙМАУТ]",
        "Фрагментация памяти: 14%",
        "Система охлаждения активна",
        "Входящий пакет заблокирован",
        "Проверка синапсов завершена",
        "Загрузка данных энграммы...",
        "Переиндексация временной линии...",
        "NETWATCH: Попытка отслеживания...",
        "КРИТИЧЕСКАЯ ОШИБКА: Сектор 4 поврежден",
        "Оптимизация нейронных связей...",
        "Сбой протокола ICE: Перезапуск...",
        "Обнаружен демон 'Soulkiller' (спящий)",
        "Синхронизация с серверами Mikoshi...",
        "Температура ядра повышена: 45°C",
        "Входящий вызов: [ЗАСЕКРЕЧЕНО] - ОШИБКА",
        "Кибердека: Очистка кэша...",
        "Биометрические данные: Нестабильно",
        "Alt Cunningham: Поиск сигнатуры..."
      ];
      
      // Determine log level based on message content or random chance
      let level: 'INFO' | 'WARN' | 'CRIT' | 'SYS' = 'INFO';
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      
      if (randomMsg.includes("ОШИБКА") || randomMsg.includes("NETWATCH") || randomMsg.includes("Soulkiller")) {
        level = 'CRIT';
      } else if (randomMsg.includes("Сбой") || randomMsg.includes("повышена") || randomMsg.includes("Нестабильно")) {
        level = 'WARN';
      } else if (randomMsg.includes("Загрузка") || randomMsg.includes("Оптимизация")) {
        level = 'SYS';
      }

      const newLog: SystemLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
        level: level,
        message: randomMsg
      };
      setLogs(prev => [newLog, ...prev].slice(0, 35));
    }, 3500); // Slightly faster updates
    return () => clearInterval(interval);
  }, [view, isBackingUp]);

  const downloadBackup = () => {
    const hexDump = Array.from({ length: 50 }, () => 
      Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join(' ')
    ).join('\n');

    const content = `
╔══════════════════════════════════════════════════════════════╗
║                ENGRAMM // SECURE STORAGE DUMP                ║
║                DATE: ${new Date().toISOString()}            ║
║                CLASS: TOP SECRET // ARASAKA EYES ONLY        ║
╚══════════════════════════════════════════════════════════════╝

[WARNING]: BIOLOGICAL INTERFACE DETECTED
[STATUS]:  ENCRYPTED

--- BEGIN HEX DUMP ---
${hexDump}
--- END HEX DUMP ---

--- DECRYPTED FRAGMENTS (KEY: SILVERHAND) ---

${FULL_BIOGRAPHY}

--- END OF STREAM ---
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RELIC_DUMP_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackup = () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Inject Warning Log
    setLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'WARN', message: 'INITIATING CORE DUMP PROTOCOL...' },
      ...prev
    ]);

    const backupInterval = setInterval(() => {
      setBackupProgress(prev => {
        const next = prev + 1; // Speed of backup
        
        // Flood logs with fake hex dump segments during backup
        if (Math.random() > 0.5) {
          const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
          const segment = Math.floor(Math.random() * 9999);
          setLogs(prevLogs => [
             { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'SYS', message: `UPLOADING SEGMENT [${segment}]: 0x${hex}...` },
             ...prevLogs
          ].slice(0, 35));
        }

        if (next >= 100) {
           clearInterval(backupInterval);
           setIsBackingUp(false);
           downloadBackup(); 
           setLogs(prevLogs => [
             { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'BACKUP COMPLETE. DATA SAVED TO EXTERNAL STORAGE.' },
             ...prevLogs
           ]);
           return 0;
        }
        
        return next;
      });
    }, 50); // Fast interval for intensity
  };

  if (view === ViewState.BOOT) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-yellow-400 font-mono relative overflow-hidden">
        <div className="text-4xl font-bold mb-8 animate-pulse">
          <GlitchText text="ENGRAMM" />
        </div>
        <div className="w-64 h-2 bg-gray-900 border border-yellow-900">
          <div 
            className="h-full bg-yellow-400 transition-all duration-75"
            style={{ width: `${bootProgress}%` }}
          />
        </div>
        <div className="mt-4 text-xs font-mono">
          ЗАГРУЗКА МОДУЛЕЙ... {Math.floor(bootProgress)}%
        </div>
        <div className="absolute bottom-10 left-10 text-xs text-red-500 opacity-50">
          ВНИМАНИЕ: ОБНАРУЖЕНО НЕЛЕГАЛЬНОЕ ПО
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-yellow-400 font-mono flex flex-col relative selection:bg-yellow-400 selection:text-black h-screen overflow-hidden">
      
      {/* APP WINDOW */}
      <div className="h-full flex flex-col relative">
        {/* Top Bar HUD */}
        <header className="h-14 border-b border-yellow-400/50 bg-black/80 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 backdrop-blur-sm relative">
          <div className="flex items-center gap-4">
            <Activity className="animate-pulse text-red-500" />
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold tracking-widest leading-none">ENGRAMM</h1>
              <span className="text-[8px] md:text-[10px] text-neutral-500 uppercase">Project: Secure Your Soul // V.1.02</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8 text-xs">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-neutral-500">ПОЛЬЗОВАТЕЛЬ:</span>
              <span className="font-bold">J. SILVERHAND</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-neutral-500">ПАМЯТЬ:</span>
              <span className="text-cyan-400">128 TB / 2077 TB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 hidden md:inline">СЕТЬ:</span>
              <div className="flex gap-1">
                  <WifiOff size={14} className="text-red-500"/>
                  <span className="text-red-500 hidden md:inline">ОФФЛАЙН</span>
              </div>
            </div>
            <button onClick={() => setView(ViewState.BOOT)} className="hover:text-red-500 transition-colors">
              <Power size={18} />
            </button>
          </div>
        </header>

        {/* Responsive Flex Container */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 pb-16 md:pb-0">
          
          {/* Navigation - Fixed Bottom on Mobile, Sidebar on Desktop */}
          <nav className="fixed bottom-0 left-0 w-full h-16 border-t md:relative md:w-20 md:h-auto md:border-t-0 md:border-r border-yellow-400/30 bg-black/90 md:bg-black/50 flex flex-row md:flex-col items-center justify-around md:justify-start md:py-6 md:gap-8 shrink-0 z-50 backdrop-blur-md">
            <button 
              onClick={() => setView(ViewState.DASHBOARD)}
              className={`p-3 rounded transition-all duration-300 ${view === ViewState.DASHBOARD ? 'bg-yellow-400 text-black shadow-[0_0_15px_#fcee0a]' : 'hover:bg-yellow-400/20'}`}
              title="Панель Управления"
            >
              <Terminal />
            </button>
            <button 
              onClick={() => setView(ViewState.CONSTRUCTOR)}
              className={`p-3 rounded transition-all duration-300 ${view === ViewState.CONSTRUCTOR ? 'bg-yellow-400 text-black shadow-[0_0_15px_#fcee0a]' : 'hover:bg-yellow-400/20'}`}
              title="Граф Конструктора"
            >
              <Cpu />
            </button>
            <button 
              onClick={() => setView(ViewState.ARCHIVE)}
              className={`p-3 rounded transition-all duration-300 ${view === ViewState.ARCHIVE ? 'bg-yellow-400 text-black shadow-[0_0_15px_#fcee0a]' : 'hover:bg-yellow-400/20'}`}
              title="Архив Памяти"
            >
              <Database />
            </button>
            
            <button 
              onClick={() => setView(ViewState.CHAT)}
              className={`p-3 rounded transition-all duration-300 ${view === ViewState.CHAT ? 'bg-yellow-400 text-black shadow-[0_0_15px_#fcee0a]' : 'hover:bg-yellow-400/20'}`}
              title="Нейро-Чат с Конструктом"
            >
              <MessageSquare />
            </button>

            <button 
              onClick={() => setView(ViewState.BLACKWALL)}
              className={`p-3 rounded transition-all duration-300 group ${view === ViewState.BLACKWALL ? 'bg-red-600 text-black shadow-[0_0_20px_#dc2626]' : 'hover:bg-red-600/20 hover:text-red-500'}`}
              title="BLACKWALL PROTOCOL"
            >
              <GlobeLock className="group-hover:animate-pulse" />
            </button>

            <button 
              onClick={() => setView(ViewState.BBS)}
              className={`p-3 rounded transition-all duration-300 group ${view === ViewState.BBS ? 'bg-red-900 text-red-100 shadow-[0_0_20px_#7f1d1d]' : 'hover:bg-red-900/40 text-red-500'}`}
              title="DARKNET BBS (FEEDBACK)"
            >
              <Radio className="group-hover:animate-pulse" />
            </button>

            <button 
              onClick={() => setShowBio(true)}
              className={`p-3 rounded transition-all duration-300 ${showBio ? 'bg-yellow-400 text-black shadow-[0_0_15px_#fcee0a]' : 'hover:bg-yellow-400/20'}`}
              title="Личное Дело"
            >
              <User />
            </button>

          </nav>

          {/* Main Content Area */}
          <div className="flex-1 flex relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] overflow-hidden">
            
            {/* Content Wrapper */}
            <div className="flex-1 p-0 overflow-hidden flex flex-col relative z-10">
              
              {/* View Switching */}
              {view === ViewState.DASHBOARD && (
                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 h-full overflow-y-auto md:overflow-hidden pb-4 p-4 md:p-6 relative">
                  
                  {isBackingUp && <BackupOverlay progress={backupProgress} />}

                  {/* System Status Panel */}
                  <div className={`border border-yellow-400/30 bg-black/40 p-4 md:p-6 clip-corner relative shrink-0 transition-all duration-200 ${isBackingUp ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 border-b border-yellow-400/50 pb-2 flex justify-between">
                      <span>СТАТУС_СИСТЕМЫ</span>
                      <ShieldAlert className="text-red-500" />
                    </h2>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span>ТЕМП_ЯДРА:</span>
                        <span className="text-cyan-400">42°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>БИО_СИНХР:</span>
                        <span className="text-green-500">СТАБИЛЬНО</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ШИФРОВАНИЕ:</span>
                        <span className="text-yellow-400">AES-4096 [АКТИВНО]</span>
                      </div>
                      <div className="flex justify-between">
                        <span>СЛЕД_АРАСАКИ:</span>
                        <span className="text-red-500 animate-pulse">ОБНАРУЖЕН (0.04%)</span>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <div className="text-xs text-neutral-500 mb-1">ЦЕЛОСТНОСТЬ_ПАМЯТИ</div>
                      <div className="w-full bg-neutral-900 h-4 border border-neutral-700">
                          <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 w-[72%]"></div>
                      </div>
                    </div>

                    <div className="mt-8 md:absolute md:bottom-6 md:left-6 md:right-6">
                      <button 
                        onClick={handleBackup}
                        disabled={isBackingUp}
                        className={`w-full border py-3 uppercase font-bold transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                          isBackingUp 
                            ? 'border-red-600 bg-red-900/40 text-red-500 cursor-progress animate-pulse' 
                            : 'border-yellow-400 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_20px_rgba(252,238,10,0.5)]'
                        }`}
                      >
                        {isBackingUp ? (
                          <>
                            <DownloadCloud size={16} className="animate-bounce" />
                            <span>DUMPING CORE... {Math.floor(backupProgress)}%</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>ЭКСТРЕННОЕ КОПИРОВАНИЕ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Log Terminal */}
                  <div className={`border border-yellow-400/30 bg-black/90 p-4 font-mono text-xs overflow-hidden flex flex-col relative h-[300px] md:h-auto shrink-0 transition-all duration-100 ${isBackingUp ? 'border-red-500 shadow-[0_0_15px_red]' : ''}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/50 z-20"></div>
                    <div className="flex-1 overflow-y-auto space-y-1 pb-2 scroll-smooth">
                      {logs.map(log => (
                        <div key={log.id} className="flex gap-2 opacity-80 hover:opacity-100">
                          <span className="text-neutral-500">[{log.timestamp}]</span>
                          <span className={`${
                            log.level === 'CRIT' ? 'text-red-500 font-bold' : 
                            log.level === 'WARN' ? 'text-orange-400' :
                            log.level === 'SYS' ? 'text-cyan-400' : 'text-yellow-100'
                          }`}>
                            {log.level} :: {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {view === ViewState.CONSTRUCTOR && (
                <div className="h-full flex flex-col p-4 md:p-6">
                  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-yellow-400/30 pb-2">
                    <h2 className="text-xl md:text-2xl font-bold"><GlitchText text="КОНСТРУКТОР_ПАМЯТИ" /></h2>
                    <div className="text-[10px] md:text-xs text-neutral-400 mt-1 md:mt-0">ВРЕМЕННАЯ ЛИНИЯ: 1988 - 2077 // ПЕРЕТАЩИТЕ УЗЛЫ</div>
                  </div>
                  <div className="flex-1 relative clip-corner">
                    <MemoryGraph nodes={MOCK_NODES} links={MOCK_LINKS} />
                  </div>
                </div>
              )}

              {view === ViewState.CHAT && (
                <div className="h-full flex flex-col clip-corner p-4 md:p-6">
                  <Simulacrum />
                </div>
              )}

              {view === ViewState.BLACKWALL && (
                <div className="h-full flex flex-col clip-corner border border-red-900/50 p-4 md:p-6">
                   <Blackwall />
                </div>
              )}
              
              {view === ViewState.BBS && (
                <ReviewSection />
              )}

              {view === ViewState.ARCHIVE && (
                <div className="h-full flex flex-col w-full relative p-4 md:p-6">
                  {/* Archive Header */}
                  <div className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-yellow-400/30 pb-4 gap-4 md:gap-0">
                      <div className="flex items-center gap-3">
                        <FileKey className="text-yellow-400 w-6 h-6" />
                        <div>
                          <h2 className="text-lg md:text-xl font-bold tracking-wider">ЗАЩИЩЕННЫЙ_АРХИВ</h2>
                          <div className="text-[10px] text-neutral-500 uppercase">Зашифрованное хранилище // Только чтение</div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                          <input 
                            type="text" 
                            placeholder="ПОИСК_ХЕША..." 
                            className="bg-black/50 border border-yellow-400/30 pl-8 pr-2 py-1 text-xs text-yellow-100 focus:outline-none focus:border-yellow-400 w-full md:w-48"
                          />
                          <Search className="absolute left-2 top-1.5 w-3 h-3 text-neutral-500" />
                        </div>
                      </div>
                  </div>

                  {/* Archive Grid */}
                  <div className="flex-1 overflow-y-auto pr-2">
                      <div className="w-full text-left text-xs">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-4 pb-2 border-b border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider mb-2 px-2">
                          <div className="col-span-2 md:col-span-1">ID</div>
                          <div className="col-span-8 md:col-span-3">МНЕМОНИЧЕСКАЯ МЕТКА</div>
                          <div className="hidden md:block col-span-2">КЛАСС</div>
                          <div className="hidden md:block col-span-2">ЦЕЛОСТНОСТЬ</div>
                          <div className="hidden md:block col-span-2">ДАТА</div>
                          <div className="col-span-2 md:col-span-2 text-right">ДЕЙСТВИЕ</div>
                        </div>
                        
                        <div className="space-y-1">
                          {MOCK_NODES.map((node) => (
                            <div 
                              key={node.id} 
                              onClick={() => setSelectedMemory(node)}
                              className="grid grid-cols-12 gap-4 py-3 px-2 border border-transparent hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all items-center group cursor-pointer"
                            >
                              <div className="col-span-2 md:col-span-1 font-mono text-neutral-600">0x{node.id.padStart(4, '0')}</div>
                              <div className="col-span-8 md:col-span-3 font-bold text-yellow-100 group-hover:text-yellow-400 truncate">{node.label}</div>
                              <div className="hidden md:block col-span-2">
                                <span className={`px-1.5 py-0.5 text-[10px] rounded border ${
                                  node.type === 'CORE' ? 'border-cyan-500 text-cyan-400 bg-cyan-950/30' : 
                                  node.type === 'TRAUMA' ? 'border-red-500 text-red-500 bg-red-950/30' : 
                                  'border-yellow-600 text-yellow-600 bg-yellow-900/20'
                                }`}>
                                  {node.type}
                                </span>
                              </div>
                              <div className="hidden md:block col-span-2">
                                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                        node.integrity < 30 ? 'bg-red-500' : 
                                        node.integrity > 80 ? 'bg-green-500' : 'bg-yellow-500'
                                    }`} 
                                    style={{ width: `${node.integrity}%`}}
                                  ></div>
                                </div>
                                <span className="text-[10px] text-neutral-500">{node.integrity}%</span>
                              </div>
                              <div className="hidden md:block col-span-2 text-neutral-400">{node.timestamp}</div>
                              <div className="col-span-2 md:col-span-2 text-right flex justify-end gap-2">
                                  <FileText size={14} className="text-neutral-600 group-hover:text-yellow-400" />
                                  <Lock size={14} className="text-neutral-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                </div>
              )}

              {/* Memory Reader Modal - Responsive */}
              {selectedMemory && (
                <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-neutral-900 border border-yellow-400 shadow-[0_0_30px_rgba(252,238,10,0.15)] flex flex-col relative clip-corner max-h-full">
                      <div className="bg-yellow-400 text-black p-4 flex justify-between items-center shrink-0">
                          <h3 className="font-bold text-sm md:text-lg uppercase tracking-widest flex items-center gap-2">
                            <Database size={18} />
                            ФАЙЛ_ПАМЯТИ: 0x{selectedMemory.id.padStart(4, '0')}
                          </h3>
                          <button onClick={() => setSelectedMemory(null)} className="hover:bg-black hover:text-yellow-400 p-1 transition-colors">
                            <X size={20} />
                          </button>
                      </div>
                      <div className="p-4 md:p-8 overflow-y-auto text-yellow-100 font-sans leading-relaxed tracking-wide space-y-4 md:space-y-6">
                          <div className="flex justify-between items-end border-b border-neutral-700 pb-4">
                            <div>
                                <div className="text-xs text-neutral-500 uppercase mb-1">Субъект</div>
                                <div className="text-lg md:text-2xl font-bold text-cyan-400 font-mono">{selectedMemory.label}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-neutral-500 uppercase mb-1">Временная метка</div>
                                <div className="font-mono text-yellow-400">{selectedMemory.timestamp}</div>
                            </div>
                          </div>
                          <div className="text-sm md:text-lg opacity-90 whitespace-pre-wrap">
                            {selectedMemory.description}
                          </div>
                          {selectedMemory.type === 'TRAUMA' && (
                            <div className="border border-red-500/50 bg-red-950/20 p-4 text-red-400 text-sm font-mono flex gap-3 items-start">
                                <ShieldAlert className="shrink-0" />
                                <div>
                                  <strong>ВНИМАНИЕ:</strong> Высокий уровень стресса в этом секторе памяти. 
                                  Воспроизведение может вызвать нейронную обратную связь. Соблюдайте осторожность.
                                </div>
                            </div>
                          )}
                          <div className="flex flex-col md:flex-row gap-2 md:gap-4 pt-4 md:pt-8 text-xs font-mono text-neutral-500">
                              <div>ЦЕЛОСТНОСТЬ: {selectedMemory.integrity}%</div>
                              <div>ШИФРОВАНИЕ: НЕТ</div>
                              <div>РАЗМЕР: 48.2 PB</div>
                          </div>
                      </div>
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
                    </div>
                </div>
              )}

              {/* Biography Modal - Responsive */}
              {showBio && (
                <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl bg-neutral-900 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col relative clip-corner max-h-full h-full md:h-auto">
                      <div className="bg-red-600 text-black p-4 flex justify-between items-center shrink-0">
                          <h3 className="font-bold text-sm md:text-lg uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert size={18} />
                            ЛИЧНОЕ ДЕЛО: NC_PD_2023_08_20
                          </h3>
                          <button onClick={() => setShowBio(false)} className="hover:bg-black hover:text-red-500 p-1 transition-colors">
                            <X size={20} />
                          </button>
                      </div>
                      
                      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
                        <div className="w-full md:w-1/3 bg-black/30 p-6 border-b md:border-b-0 md:border-r border-red-900/50 flex flex-col items-center shrink-0">
                            {/* ENHANCED PHOTO FRAME */}
                            <div className="w-48 md:w-full aspect-square bg-neutral-800 border-4 border-white/90 mb-4 flex items-center justify-center relative shadow-[0_4px_10px_rgba(0,0,0,0.5)] rotate-1 group overflow-visible">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-neutral-400/50 backdrop-blur-sm rotate-1 z-20"></div> {/* Tape */}
                              <User size={64} className="text-neutral-600 opacity-50" />
                              <div className="absolute -bottom-3 w-[110%] bg-red-600 text-black text-center font-black text-[10px] md:text-sm py-1 -rotate-2 shadow-md uppercase tracking-wider z-10 border border-black">РАЗЫСКИВАЕТСЯ: ЖИВЫМ ИЛИ МЕРТВЫМ</div>
                            </div>
                            
                            <div className="w-full space-y-2 text-xs font-mono text-red-400 mt-4">
                              <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span>РОСТ:</span> <span className="text-neutral-400">6'0"</span>
                              </div>
                              <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span>ВЕС:</span> <span className="text-neutral-400">180 lbs</span>
                              </div>
                              <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span>ГЛАЗА:</span> <span className="text-neutral-400">Карие (Мод)</span>
                              </div>
                              <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span>КИБЕРНЕТИКА:</span> <span className="text-neutral-400">Левая Рука (Mili)</span>
                              </div>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto text-neutral-300 font-mono leading-relaxed relative">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-9xl font-bold text-red-500/5 -rotate-45 pointer-events-none select-none whitespace-nowrap">
                              ТЕРРОРИСТ
                            </div>

                            <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm">
                              {FULL_BIOGRAPHY}
                            </pre>
                            
                            <div className="mt-8 pt-4 border-t border-red-900 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-red-600 gap-2 md:gap-0">
                              <div className="flex items-center gap-2">
                                  <CheckCircle size={14} />
                                  <span>ПОДТВЕРЖДЕНО БАЗОЙ ДАННЫХ NCPD</span>
                              </div>
                              <div>УРОВЕНЬ ДОСТУПА: ЧЕРНЫЙ</div>
                            </div>
                        </div>
                      </div>
                    </div>
                </div>
              )}

            </div>
            
            {/* Texture Fade Out Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-black pointer-events-none z-10"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
